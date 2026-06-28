-- Starquezz v2 · 0009_habit_emoji_icons.sql
-- Move habit visual markers from monochrome SVG keys to colorful emoji.

create temp table _habit_emoji_rules (
  priority int not null,
  pattern text not null,
  emoji text not null
) on commit drop;

insert into _habit_emoji_rules (priority, pattern, emoji) values
  (10, '%piano%', '🎹'),
  (11, '%guitar%', '🎸'),
  (12, '%instrument%', '🎵'),
  (13, '%song%', '🎵'),
  (14, '%rhythm%', '👏'),
  (15, '%chord%', '🎸'),
  (16, '%scale%', '🎹'),
  (20, '%math%', '🔢'),
  (21, '%count%', '🔢'),
  (22, '%number%', '🔢'),
  (23, '%vocab%', '🔤'),
  (24, '%spelling%', '🔤'),
  (25, '%letter%', '✏️'),
  (26, '%sentence%', '✏️'),
  (27, '%write%', '✏️'),
  (28, '%copy%', '✏️'),
  (29, '%note%', '📝'),
  (30, '%read%', '📚'),
  (31, '%book%', '📚'),
  (40, '%brush%', '🪥'),
  (41, '%floss%', '🪥'),
  (42, '%hygiene%', '🧼'),
  (43, '%wash hands%', '🧼'),
  (44, '%bathroom%', '🚽'),
  (45, '%sleep%', '🛏️'),
  (46, '%bed%', '🛏️'),
  (47, '%bedtime%', '🌙'),
  (50, '%movement%', '🏃'),
  (51, '%move body%', '🏃'),
  (52, '%active%', '🏃'),
  (53, '%sport%', '⚽'),
  (54, '%strength%', '💪'),
  (55, '%bike%', '🚲'),
  (56, '%walk%', '🚶'),
  (60, '%water bottle%', '🥤'),
  (61, '%drink water%', '🥤'),
  (62, '%water%', '💧'),
  (63, '%fruit%', '🍎'),
  (64, '%vegetable%', '🥕'),
  (65, '%snack%', '🍎'),
  (66, '%meal%', '🍽️'),
  (67, '%breakfast%', '🥣'),
  (68, '%lunch%', '🍱'),
  (70, '%backpack%', '🎒'),
  (71, '%school bag%', '🎒'),
  (72, '%bag%', '🎒'),
  (73, '%planner%', '📅'),
  (74, '%homework%', '📝'),
  (80, '%sweep%', '🧹'),
  (81, '%vacuum%', '🧹'),
  (82, '%laundry%', '🧺'),
  (83, '%clothes%', '👕'),
  (84, '%dishwasher%', '🍽️'),
  (85, '%plate%', '🍽️'),
  (86, '%table%', '🍽️'),
  (87, '%trash%', '🗑️'),
  (88, '%room reset%', '🧱'),
  (89, '%toys%', '🧱'),
  (90, '%plant%', '🌱'),
  (91, '%pet%', '🐾'),
  (92, '%shoes%', '👟'),
  (100, '%feeling%', '😊'),
  (101, '%mood%', '😊'),
  (102, '%gratitude%', '🙏'),
  (103, '%kind%', '💛'),
  (104, '%sharing%', '🤝'),
  (105, '%brave%', '💪'),
  (106, '%family%', '💛'),
  (110, '%draw%', '🎨'),
  (111, '%paint%', '🎨'),
  (112, '%journal%', '📓'),
  (120, '%check%', '✅'),
  (999, '%', '✅');

update habit_library h
set icon = (
  select emoji
  from _habit_emoji_rules
  where lower(h.name) like pattern
  order by priority
  limit 1
)
where h.library_key like 'research-hab-%';

update habits h
set icon = (
  select emoji
  from _habit_emoji_rules
  where lower(h.name) like pattern
  order by priority
  limit 1
)
where h.library_id is not null
   or h.icon in (
    'tooth', 'shirt', 'bowl', 'book', 'backpack', 'drop', 'water', 'ball',
    'bed', 'bed-made', 'music', 'pencil', 'bulb', 'paint', 'blocks', 'fork',
    'plant', 'heart', 'sparkle-heart', 'hands', 'paw', 'dice', 'check'
  );
