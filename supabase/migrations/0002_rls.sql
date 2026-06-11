-- StarqueZZ v2 · 0002_rls.sql
-- Families are fully isolated. Write RLS first, test it (v1 lesson #2).
-- Kid surfaces run under the parent's auth session on the family device,
-- so all policies are parent-scoped via auth.uid().

alter table parents enable row level security;
alter table children enable row level security;
alter table habits enable row level security;
alter table completions enable row level security;
alter table star_events enable row level security;
alter table adventures enable row level security;
alter table planned_adventures enable row level security;
alter table dreams enable row level security;
alter table week_finalizations enable row level security;
alter table parent_edits enable row level security;
alter table pin_attempts enable row level security;
alter table scout_sessions enable row level security;
alter table habit_library enable row level security;
alter table library_activities enable row level security;

-- parents: a user sees only their own row. PIN hash is never needed
-- client-side; it is only touched inside security-definer RPCs.
create policy parents_select on parents for select using (id = auth.uid());
create policy parents_update on parents for update using (id = auth.uid());

-- children
create policy children_all on children for all
  using (parent_id = auth.uid())
  with check (parent_id = auth.uid());

-- habits: via owning child
create policy habits_all on habits for all
  using (exists (select 1 from children c where c.id = habits.child_id and c.parent_id = auth.uid()))
  with check (exists (select 1 from children c where c.id = habits.child_id and c.parent_id = auth.uid()));

-- completions: read-only from the client; all writes go through RPCs
create policy completions_select on completions for select
  using (exists (select 1 from children c where c.id = completions.child_id and c.parent_id = auth.uid()));

-- star_events: append-only ledger, read-only from the client
create policy star_events_select on star_events for select
  using (exists (select 1 from children c where c.id = star_events.child_id and c.parent_id = auth.uid()));

-- adventures
create policy adventures_all on adventures for all
  using (parent_id = auth.uid())
  with check (parent_id = auth.uid());

-- planned_adventures: created via redeem RPC; status updates via RPC
create policy planned_select on planned_adventures for select
  using (exists (select 1 from children c where c.id = planned_adventures.child_id and c.parent_id = auth.uid()));

-- dreams: parent-created/edited (single active slot enforced by index)
create policy dreams_all on dreams for all
  using (exists (select 1 from children c where c.id = dreams.child_id and c.parent_id = auth.uid()))
  with check (exists (select 1 from children c where c.id = dreams.child_id and c.parent_id = auth.uid()));

-- week_finalizations: read-only (written by finalize_week RPC)
create policy weekfin_select on week_finalizations for select
  using (exists (select 1 from children c where c.id = week_finalizations.child_id and c.parent_id = auth.uid()));

-- parent_edits: read-only audit trail (written by RPCs)
create policy parent_edits_select on parent_edits for select
  using (parent_id = auth.uid());

-- pin_attempts: no client access at all (RPC-only); RLS on with no policies.

-- scout_sessions: read own (rate-limit feedback)
create policy scout_select on scout_sessions for select using (parent_id = auth.uid());
create policy scout_insert on scout_sessions for insert with check (parent_id = auth.uid());

-- libraries: global, read-only to all authenticated users
create policy habit_library_read on habit_library for select to authenticated using (true);
create policy library_activities_read on library_activities for select to authenticated using (true);
