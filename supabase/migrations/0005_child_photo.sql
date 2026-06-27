-- Starquezz v2 · 0005_child_photo.sql
-- Optional kid photo (parent-uploaded from the gallery). Stored as a small
-- downscaled data URL (~192px JPEG) inside the family's RLS-protected row —
-- no public storage bucket, photos never leave the family's data.
alter table children add column if not exists photo text;
