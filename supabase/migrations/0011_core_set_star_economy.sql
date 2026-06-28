-- Starquezz v2 · 0011_core_set_star_economy.sql
-- Tightens the kid economy: the scheduled core set pays one star when complete;
-- each bonus activity pays one star after the core set is done.

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
  if p_on > current_date + 1 then
    raise exception 'future_date';
  end if;

  if not h.is_core and not star_day_complete(h.child_id, p_on) then
    raise exception 'cores_incomplete';
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
    v_star_day := true;
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
