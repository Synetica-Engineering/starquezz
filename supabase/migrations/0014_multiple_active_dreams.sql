-- Allow a child to have more than one active big dream.
drop index if exists one_active_dream_per_child;

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
    raise exception 'week_not_over';
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
