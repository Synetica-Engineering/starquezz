-- Starquezz v2 · 0010_habit_emoji_refinements.sql
-- Refine ambiguous habit emoji choices after the first emoji migration.

update habit_library
set icon = '🐾'
where library_key like 'research-hab-%'
  and lower(name) like '%pet%';

update habits
set icon = '🐾'
where lower(name) like '%pet%';
