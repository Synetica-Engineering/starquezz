-- Starquezz v2 · 0003_rpcs.sql
-- Every star mutation is a single atomic RPC with checks inside the
-- transaction (v1 lesson #1). The LLM never touches these. Deterministic,
-- unit-tested code — the trust contract with the kid.

-- ============================================================ helpers

-- Is this habit "live" for a given date (existed, not archived/graduated yet)?
create or replace function habit_live_on(h habits, d date)
returns boolean language sql immutable as $$
  select h.created_at::date <= d
     and (h.archived_at is null or h.archived_at::date > d)
     and (h.status = 'active' or h.graduated_at is null or h.graduated_at::date > d);
$$;

-- Does the child have at least one core habit scheduled on date d?
create or replace function has_scheduled_cores(p_child_id uuid, d date)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from habits h
    where h.child_id = p_child_id and h.is_core
      and extract(isodow from d)::int = any (h.active_days)
      and habit_live_on(h, d)
  );
$$;

-- Star-day: every scheduled core habit on date d has a completion.
-- A day with no cores scheduled is an off day, not a star-day.
create or replace function star_day_complete(p_child_id uuid, d date)
returns boolean language sql stable security definer set search_path = public as $$
  select has_scheduled_cores(p_child_id, d)
     and not exists (
       select 1 from habits h
       where h.child_id = p_child_id and h.is_core
         and extract(isodow from d)::int = any (h.active_days)
         and habit_live_on(h, d)
         and not exists (
           select 1 from completions c
           where c.habit_id = h.id and c.completed_on = d
         )
     );
$$;

-- Consecutive star-days ending at p_as_of. Off days are skipped, never
-- break. An in-progress p_as_of (scheduled but incomplete) is skipped once;
-- a *missed* earlier active day breaks the run. Tokens are never deducted
-- on a break — the counter just resets.
create or replace function compute_streak(p_child_id uuid, p_as_of date)
returns int language plpgsql stable security definer set search_path = public as $$
declare
  d date := p_as_of;
  streak int := 0;
  guard int := 0;
begin
  if has_scheduled_cores(p_child_id, d) and not star_day_complete(p_child_id, d) then
    d := d - 1; -- today is still in progress; don't break the flame yet
  end if;
  loop
    guard := guard + 1;
    exit when guard > 400;
    if not has_scheduled_cores(p_child_id, d) then
      d := d - 1;
      continue;
    end if;
    exit when not star_day_complete(p_child_id, d);
    streak := streak + 1;
    d := d - 1;
  end loop;
  return streak;
end;
$$;

-- Ownership guard: raises if the child doesn't belong to the caller.
create or replace function assert_child_owned(p_child_id uuid)
returns void language plpgsql stable security definer set search_path = public as $$
begin
  if not exists (
    select 1 from children c where c.id = p_child_id and c.parent_id = auth.uid()
  ) then
    raise exception 'not_found' using errcode = 'P0001';
  end if;
end;
$$;

-- Audit: parent-side edits leave footprints in the weekly digest.
create or replace function log_parent_edit(p_summary text)
returns void language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is not null then
    insert into parent_edits (parent_id, summary) values (auth.uid(), p_summary);
  end if;
end;
$$;

-- ============================================================ kid loop

-- Check off a habit. The whole core set pays +1 when it becomes complete;
-- each bonus habit pays +1 after cores are done. No cherry-picking.
create or replace function complete_habit(p_habit_id uuid, p_on date default current_date)
returns json language plpgsql security definer set search_path = public as $$
declare
  h habits%rowtype;
  v_award int;
  v_star_day boolean := false;
  v_streak int := 0;
  v_streak_bonus int := 0;
  v_all_done boolean := false;
begin
  select * into h from habits where id = p_habit_id;
  if not found then raise exception 'not_found'; end if;
  perform assert_child_owned(h.child_id);

  if h.archived_at is not null or h.status <> 'active' then
    raise exception 'habit_inactive';
  end if;
  if not (extract(isodow from p_on)::int = any (h.active_days)) then
    raise exception 'not_scheduled_today';
  end if;
  -- the kid's local date can be a day ahead of the server's UTC date
  if p_on > current_date + 1 then
    raise exception 'future_date';
  end if;

  if not h.is_core then
    -- bonus pays only once the foundation is done
    if not star_day_complete(h.child_id, p_on) then
      raise exception 'cores_incomplete';
    end if;
  end if;

  begin
    insert into completions (habit_id, child_id, completed_on) values (p_habit_id, h.child_id, p_on);
  exception when unique_violation then
    raise exception 'already_done';
  end;

  if h.is_core then
    v_star_day := star_day_complete(h.child_id, p_on);
    v_award := case when v_star_day then 1 else 0 end;
    if v_star_day then
      v_streak := compute_streak(h.child_id, p_on);
      -- early momentum hook: the run's 3rd consecutive star-day pays +3, once
      if v_streak = 3 and not exists (
        select 1 from star_events e
        where e.child_id = h.child_id and e.reason = 'streak_3' and e.note = 'streak3:' || p_on::text
      ) then
        v_streak_bonus := 3;
        insert into star_events (child_id, delta, reason, note)
        values (h.child_id, 3, 'streak_3', 'streak3:' || p_on::text);
      end if;
    end if;
  else
    v_star_day := true; -- cores were already done
    v_streak := compute_streak(h.child_id, p_on);
    v_award := 1;
  end if;

  if v_award > 0 then
    insert into star_events (child_id, delta, reason, ref_id, note)
    values (
      h.child_id,
      v_award,
      case when h.is_core then 'habit_checkoff' else 'bonus_habit' end::star_reason,
      p_habit_id,
      'completion:' || p_on::text
    );
  end if;

  update children set star_balance = star_balance + v_award + v_streak_bonus
  where id = h.child_id;

  select not exists (
    select 1 from habits hh
    where hh.child_id = h.child_id
      and extract(isodow from p_on)::int = any (hh.active_days)
      and habit_live_on(hh, p_on)
      and not exists (select 1 from completions c where c.habit_id = hh.id and c.completed_on = p_on)
  ) into v_all_done;

  return json_build_object(
    'awarded', v_award,
    'streak_bonus', v_streak_bonus,
    'star_day', v_star_day,
    'streak', case when v_star_day then greatest(v_streak, 0) else compute_streak(h.child_id, p_on) end,
    'all_done', v_all_done
  );
end;
$$;

-- Mis-tap forgiveness: reversible for 5 minutes.
create or replace function undo_completion(p_habit_id uuid, p_on date default current_date)
returns json language plpgsql security definer set search_path = public as $$
declare
  h habits%rowtype;
  c completions%rowtype;
  v_reversed int := 0;
begin
  select * into h from habits where id = p_habit_id;
  if not found then raise exception 'not_found'; end if;
  perform assert_child_owned(h.child_id);

  select * into c from completions where habit_id = p_habit_id and completed_on = p_on;
  if not found then raise exception 'not_completed'; end if;
  if c.created_at < now() - interval '5 minutes' then
    raise exception 'undo_window_passed';
  end if;

  select coalesce(sum(e.delta), 0) into v_reversed
  from star_events e
  where e.child_id = h.child_id
    and e.ref_id = p_habit_id
    and e.reason in ('habit_checkoff', 'bonus_habit')
    and e.delta > 0
    and (
      e.note = 'completion:' || p_on::text
      or (e.note is null and e.created_at >= c.created_at - interval '1 second')
    );

  delete from completions where id = c.id;

  if v_reversed > 0 then
    insert into star_events (child_id, delta, reason, ref_id, note)
    values (h.child_id, -v_reversed, 'undo', p_habit_id, 'uncompletion:' || p_on::text);
  end if;

  -- if this check-off had just minted the 3-day bonus, take it back too
  if exists (
    select 1 from star_events e
    where e.child_id = h.child_id and e.reason = 'streak_3'
      and e.note = 'streak3:' || p_on::text
  ) and not star_day_complete(h.child_id, p_on) and not exists (
    select 1 from star_events e2
    where e2.child_id = h.child_id and e2.reason = 'undo' and e2.note = 'unstreak3:' || p_on::text
  ) then
    insert into star_events (child_id, delta, reason, note)
    values (h.child_id, -3, 'undo', 'unstreak3:' || p_on::text);
    v_reversed := v_reversed + 3;
  end if;

  update children set star_balance = star_balance - v_reversed where id = h.child_id;
  return json_build_object('reversed', v_reversed);
end;
$$;

-- ============================================================ adventures

-- Atomic redemption: balance check inside the transaction, row-locked.
create or replace function redeem_adventure(p_adventure_id uuid, p_child_id uuid, p_planned_for date)
returns json language plpgsql security definer set search_path = public as $$
declare
  a adventures%rowtype;
  v_balance int;
  v_planned_id uuid;
begin
  perform assert_child_owned(p_child_id);
  select * into a from adventures where id = p_adventure_id and parent_id = auth.uid();
  if not found then raise exception 'not_found'; end if;
  if a.archived_at is not null then raise exception 'adventure_archived'; end if;

  select star_balance into v_balance from children where id = p_child_id for update;
  if v_balance < a.cost then
    raise exception 'insufficient_stars';
  end if;

  if a.cost > 0 then
    insert into star_events (child_id, delta, reason, ref_id)
    values (p_child_id, -a.cost, 'redemption', p_adventure_id);
    update children set star_balance = star_balance - a.cost where id = p_child_id;
  end if;

  insert into planned_adventures (adventure_id, child_id, planned_for)
  values (p_adventure_id, p_child_id, p_planned_for)
  returning id into v_planned_id;

  return json_build_object('planned_id', v_planned_id, 'new_balance', v_balance - a.cost);
end;
$$;

-- One tap from the digest: the adventure happened. The memory is the payoff.
create or replace function set_planned_adventure_status(p_planned_id uuid, p_status adventure_status)
returns void language plpgsql security definer set search_path = public as $$
declare
  pa planned_adventures%rowtype;
begin
  select * into pa from planned_adventures where id = p_planned_id;
  if not found then raise exception 'not_found'; end if;
  perform assert_child_owned(pa.child_id);
  update planned_adventures set status = p_status where id = p_planned_id;
  perform log_parent_edit('Adventure marked ' || p_status);
end;
$$;

-- ============================================================ ceremony

-- Sunday Star Ceremony backend. Idempotent per (child, week).
-- Perfect week = a star-day on every active day of that week — "perfect"
-- adapts to each family's schedule. Pays +10 and lights a dream star.
create or replace function finalize_week(p_child_id uuid, p_week_start date)
returns json language plpgsql security definer set search_path = public as $$
declare
  d date;
  v_star_days int := 0;
  v_active_days int := 0;
  v_perfect boolean;
  v_awarded int := 0;
  v_dream_lit boolean := false;
  v_dream_done boolean := false;
  v_existing week_finalizations%rowtype;
begin
  perform assert_child_owned(p_child_id);
  if extract(isodow from p_week_start)::int <> 1 then
    raise exception 'week_start_not_monday';
  end if;
  if current_date < p_week_start + 6 then
    raise exception 'week_not_over'; -- ceremony unlocks on Sunday
  end if;

  select * into v_existing from week_finalizations
  where child_id = p_child_id and week_start = p_week_start;
  if found then
    return json_build_object(
      'already_finalized', true,
      'perfect', v_existing.perfect,
      'star_days', v_existing.star_days,
      'awarded', 0, 'dream_star_lit', false, 'dream_completed', false,
      'streak', compute_streak(p_child_id, current_date)
    );
  end if;

  for i in 0..6 loop
    d := p_week_start + i;
    if has_scheduled_cores(p_child_id, d) then
      v_active_days := v_active_days + 1;
      if star_day_complete(p_child_id, d) then
        v_star_days := v_star_days + 1;
      end if;
    end if;
  end loop;

  v_perfect := v_active_days > 0 and v_star_days = v_active_days;

  insert into week_finalizations (child_id, week_start, perfect, star_days)
  values (p_child_id, p_week_start, v_perfect, v_star_days);

  if v_perfect then
    v_awarded := 10;
    insert into star_events (child_id, delta, reason, note)
    values (p_child_id, 10, 'perfect_week', 'week:' || p_week_start::text);
    update children set star_balance = star_balance + 10 where id = p_child_id;

    -- a perfect week lights one mark in every active dream constellation —
    -- spendable tokens can never buy these
    with updated as (
      update dreams set stars_earned = stars_earned + 1,
        status = case when stars_earned + 1 >= stars_required then 'achieved'::dream_status else status end
      where child_id = p_child_id and status = 'active'
      returning status
    )
    select count(*) > 0, coalesce(bool_or(status = 'achieved'::dream_status), false)
    into v_dream_lit, v_dream_done
    from updated;
  end if;

  return json_build_object(
    'already_finalized', false,
    'perfect', v_perfect,
    'star_days', v_star_days,
    'active_days', v_active_days,
    'awarded', v_awarded,
    'dream_star_lit', v_dream_lit,
    'dream_completed', v_dream_done,
    'streak', compute_streak(p_child_id, current_date)
  );
end;
$$;

-- ============================================================ graduation

-- Mastery: the habit levels up into the Hall of Fame. Never a demotion.
create or replace function graduate_habit(p_habit_id uuid, p_bonus int default 10)
returns json language plpgsql security definer set search_path = public as $$
declare
  h habits%rowtype;
begin
  select * into h from habits where id = p_habit_id;
  if not found then raise exception 'not_found'; end if;
  perform assert_child_owned(h.child_id);
  if h.status = 'graduated' then raise exception 'already_graduated'; end if;

  update habits set status = 'graduated', graduated_at = now() where id = p_habit_id;
  insert into star_events (child_id, delta, reason, ref_id)
  values (h.child_id, p_bonus, 'graduation_bonus', p_habit_id);
  update children set star_balance = star_balance + p_bonus where id = h.child_id;
  perform log_parent_edit('Habit "' || h.name || '" graduated to the Hall of Fame');

  return json_build_object('bonus', p_bonus);
end;
$$;

-- ============================================================ parent gate

-- bcrypt via pgcrypto; the hash never reaches the client. Tamper-evident,
-- not tamper-proof: failures are visible in the digest, cooldown is
-- exponential but never permanent (the parent is standing right there).
create or replace function set_parent_pin(p_pin text)
returns void language plpgsql security definer set search_path = public, extensions as $$
begin
  if auth.uid() is null then raise exception 'not_authenticated'; end if;
  if p_pin !~ '^[0-9]{4,8}$' then raise exception 'pin_format'; end if;
  update parents set parent_pin_hash = crypt(p_pin, gen_salt('bf')) where id = auth.uid();
  perform log_parent_edit('Parent PIN changed');
end;
$$;

create or replace function verify_parent_pin(p_pin text)
returns json language plpgsql security definer set search_path = public, extensions as $$
declare
  v_hash text;
  att pin_attempts%rowtype;
  v_wait int;
begin
  if auth.uid() is null then raise exception 'not_authenticated'; end if;
  select parent_pin_hash into v_hash from parents where id = auth.uid();
  if v_hash is null then return json_build_object('ok', false, 'reason', 'no_pin_set'); end if;

  select * into att from pin_attempts where parent_id = auth.uid();
  if found and att.failed_count >= 3 then
    v_wait := least(power(2, att.failed_count - 2)::int, 600);
    if att.last_failed_at + make_interval(secs => v_wait) > now() then
      return json_build_object('ok', false, 'reason', 'cooldown',
        'retry_in', ceil(extract(epoch from att.last_failed_at + make_interval(secs => v_wait) - now()))::int);
    end if;
  end if;

  if crypt(p_pin, v_hash) = v_hash then
    delete from pin_attempts where parent_id = auth.uid();
    return json_build_object('ok', true);
  end if;

  insert into pin_attempts (parent_id, failed_count, last_failed_at)
  values (auth.uid(), 1, now())
  on conflict (parent_id) do update
    set failed_count = pin_attempts.failed_count + 1, last_failed_at = now();
  perform log_parent_edit('Failed parent PIN attempt');
  return json_build_object('ok', false, 'reason', 'wrong_pin');
end;
$$;

-- Optional per-child secret code — an ownership ritual, not a lock.
create or replace function set_child_code(p_child_id uuid, p_code text)
returns void language plpgsql security definer set search_path = public, extensions as $$
begin
  perform assert_child_owned(p_child_id);
  if p_code is null then
    update children set secret_code_hash = null where id = p_child_id;
    perform log_parent_edit('Secret code removed for child');
  else
    if p_code !~ '^[0-9]{4}$' then raise exception 'code_format'; end if;
    update children set secret_code_hash = crypt(p_code, gen_salt('bf')) where id = p_child_id;
    perform log_parent_edit('Secret code set for child');
  end if;
end;
$$;

create or replace function verify_child_code(p_child_id uuid, p_code text)
returns boolean language plpgsql security definer set search_path = public, extensions as $$
declare
  v_hash text;
begin
  perform assert_child_owned(p_child_id);
  select secret_code_hash into v_hash from children where id = p_child_id;
  if v_hash is null then return true; end if;
  return crypt(p_code, v_hash) = v_hash;
end;
$$;

-- ============================================================ corrections

-- Quiet parent correction; always leaves a footprint.
create or replace function adjust_stars(p_child_id uuid, p_delta int, p_note text)
returns void language plpgsql security definer set search_path = public as $$
begin
  perform assert_child_owned(p_child_id);
  if p_delta = 0 then return; end if;
  insert into star_events (child_id, delta, reason, note)
  values (p_child_id, p_delta, 'manual_adjust', p_note);
  update children set star_balance = star_balance + p_delta where id = p_child_id;
  perform log_parent_edit('Stars adjusted by ' || p_delta || ' — ' || coalesce(p_note, ''));
end;
$$;

-- ============================================================ edit footprints

-- Habit/adventure/dream edits made directly under RLS leave digest footprints.
create or replace function audit_family_edit()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_name text;
begin
  if auth.uid() is null then
    return coalesce(new, old); -- service-role / seed paths don't log
  end if;
  v_name := coalesce(
    case when tg_op = 'DELETE' then old.name else new.name end, '');
  insert into parent_edits (parent_id, summary)
  values (auth.uid(), initcap(tg_op) || ' ' || tg_table_name || ' "' || v_name || '"');
  return coalesce(new, old);
end;
$$;

create trigger audit_habits after insert or update or delete on habits
  for each row execute function audit_family_edit();
create trigger audit_adventures after insert or update or delete on adventures
  for each row execute function audit_family_edit();
create trigger audit_dreams after insert or update or delete on dreams
  for each row execute function audit_family_edit();
