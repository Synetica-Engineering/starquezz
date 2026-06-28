-- Starquezz v2 · 0012_silly_mode_setting.sql
-- Parent-controlled switch for optional daily silly prompts after core habits.

alter table parents
  add column if not exists silly_mode boolean not null default false;
