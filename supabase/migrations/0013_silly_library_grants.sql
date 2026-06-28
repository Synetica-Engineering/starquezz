-- Starquezz v2 · 0013_silly_library_grants.sql
-- 0008 creates this table after the original blanket grants, so expose it.

grant select on table library_silly_activities to authenticated;
grant all privileges on all tables in schema public to service_role;
