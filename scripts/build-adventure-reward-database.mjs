import fs from 'node:fs'

const sources = {
  cdc: 'https://www.cdc.gov/child-development/positive-parenting-tips/index.html',
  aapDigital: 'https://www.healthychildren.org/English/family-life/Media/Pages/helping-kids-thrive-in-a-digital-world-AAP-policy-explained.aspx',
  reinforcement: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC3361320/',
  play: 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC6407422/',
  physical: 'https://www.cdc.gov/physical-activity-education/guidelines/index.html',
  library: 'https://www.ala.org/tools/research/librariesmatter/',
}

const why = {
  connection: 'Shared time works as a reward without turning the app into shopping; it reinforces effort with attention, belonging, and a family memory.',
  play: 'Open-ended play supports creativity, language, problem solving, self-regulation, and parent-child connection.',
  movement: 'Active rewards add movement and outdoor time while keeping stars tied to healthy shared experiences.',
  learning: 'Curiosity rewards make reading, making, museums, libraries, and experiments feel joyful instead of assigned.',
  autonomy: 'Letting the child choose within parent-set bounds builds ownership while keeping cost, distance, and safety in adult hands.',
}

const rows = []
function add(group, minAge, maxAge, name, category, illustration, explainer, prep, duration, energy, cost, location, tier, sourceKeys, notes = '') {
  const id = `ADV-${String(rows.length + 1).padStart(4, '0')}`
  rows.push({
    reward_id: id,
    age_group: group,
    min_age: minAge,
    max_age: maxAge,
    adventure_name: name,
    category,
    illustration,
    why_its_good_reward: why[category],
    experience_prompt: explainer,
    parent_prep: prep,
    duration_min: duration,
    energy,
    cost,
    location_type: location,
    suggested_tier: tier,
    source_urls: sourceKeys.map((key) => sources[key]).join(' '),
    review_notes: notes,
  })
}

const all = [
  ['Blanket Fort Story Night', 'play', 'fort', 'Build a blanket fort together, crawl in, and read or invent stories by flashlight.', 'Blankets, pillows, flashlight', 35, 'indoor', 'free', 'home', 1, ['play', 'aapDigital']],
  ['Kitchen Dance Party', 'play', 'disco', 'The kid chooses five songs, everyone dances, then you invent one family signature move.', 'Speaker or phone for music', 20, 'indoor', 'free', 'home', 1, ['play', 'aapDigital']],
  ['Indoor Picnic Dinner', 'connection', 'basket', 'Spread a blanket on the floor and eat a simple dinner picnic-style, with the kid choosing the picnic spot.', 'Blanket, simple food', 35, 'indoor', 'free', 'home', 1, ['cdc', 'aapDigital']],
  ['Pancake Helper Morning', 'autonomy', 'pancake', 'The kid helps mix batter and decorate pancakes while the adult handles the stove.', 'Ingredients, safe helper job', 40, 'indoor', 'cheap', 'home', 0, ['cdc']],
  ['Flashlight Treasure Hunt', 'play', 'flashlight', 'Hide five small objects and give picture clues or simple riddles to find them.', 'Flashlight, five objects', 25, 'indoor', 'free', 'home', 1, ['play']],
  ['Nature Color Hunt', 'movement', 'leaf', 'Walk outside and find one thing for each color of the rainbow, then take a family photo of the finds.', 'Color list', 35, 'outdoor', 'free', 'park or neighborhood', 1, ['physical', 'play']],
  ['Playground Monster Chase', 'movement', 'swing', 'Visit a playground and play as the friendly monster who chases, freezes, and lets the child escape.', 'Nothing', 45, 'outdoor', 'free', 'playground', 1, ['physical', 'cdc']],
  ['Library Pick Three', 'learning', 'library', 'Go to the library and let the child choose any three books to bring home or read together.', 'Library card', 45, 'indoor', 'free', 'library', 1, ['library', 'cdc']],
  ['Paper Plane Championship', 'learning', 'plane', 'Fold paper planes together and run distance, target, and trick-shot contests.', 'Paper, tape target', 25, 'indoor', 'free', 'home', 1, ['play']],
  ['Family Board Game Pick', 'connection', 'dice', 'The child picks the game and the grown-up gives full attention for one complete round.', 'Board or card game', 30, 'indoor', 'free', 'home', 1, ['reinforcement', 'play']],
  ['Backyard Bubbles Lab', 'learning', 'flask', 'Mix bubble solution, test wand shapes, and crown the biggest bubble of the day.', 'Bubble mix or soap, wand', 30, 'outdoor', 'cheap', 'home or park', 1, ['play']],
  ['Chalk Art Gallery', 'learning', 'paint', 'Make sidewalk chalk art together and give each drawing a gallery title.', 'Chalk', 30, 'outdoor', 'cheap', 'sidewalk or driveway', 1, ['play']],
  ['Stuffed Animal Tea Party', 'play', 'cupcake', 'Set up a pretend tea party where the child assigns every guest a voice and role.', 'Cups, snack optional', 25, 'indoor', 'free', 'home', 1, ['play']],
  ['Sunset Pajama Walk', 'connection', 'sunrise', 'Take a short walk near sunset in pajamas or cozy clothes and name three things from the day.', 'Coats if needed', 20, 'outdoor', 'free', 'neighborhood', 1, ['cdc', 'aapDigital']],
  ['Build a Box Rocket', 'learning', 'plane', 'Turn a box into a rocket, boat, or time machine, then take a pretend trip.', 'Cardboard box, crayons', 35, 'indoor', 'free', 'home', 1, ['play']],
  ['Mini Obstacle Course', 'movement', 'ball', 'Build a safe obstacle course from cushions, tape lines, and chairs, then run it together.', 'Cushions, tape', 25, 'indoor', 'free', 'home', 1, ['physical', 'play']],
  ['Garden Water Helper', 'autonomy', 'water', 'The child waters plants with you and chooses one plant to check on next time.', 'Watering can', 20, 'outdoor', 'free', 'home or community garden', 1, ['cdc']],
  ['Bookshop Browse With Price Cap', 'learning', 'bookshop', 'Browse slowly and let the child choose one book within a parent-set price cap.', 'Price cap', 45, 'indoor', 'cheap', 'bookshop', 2, ['library', 'autonomy']],
  ['Swimming Play Session', 'movement', 'swim', 'A pool session focused on play: races, floating, jumps, and the child picking the first game.', 'Swim gear', 75, 'either', 'cheap', 'pool', 2, ['physical']],
  ['Tiny Train or Bus Ride', 'autonomy', 'train', 'Ride one short public-transit route just for the adventure, with the child helping spot stops.', 'Fare, route plan', 45, 'either', 'cheap', 'transit route', 2, ['cdc']],
  ['Home Mystery Treasure Map', 'play', 'scroll', 'Design a map, hide clues, and let the child solve a real mystery around home or a nearby park.', 'Map, 5 clues, small prize note', 75, 'either', 'cheap', 'home or park', 3, ['play', 'reinforcement']],
  ['Museum Mini Mission', 'learning', 'museum', 'Visit a museum or gallery with a kid-led mission: pick three favorites, sketch one, and tell the story of one object.', 'Tickets if needed, sketchbook', 120, 'indoor', 'spendy', 'museum or gallery', 3, ['cdc', 'library']],
  ['Family Day Trip Explorer', 'autonomy', 'train', 'Take a half-day trip somewhere new, with the child helping choose snacks, route, and the first stop.', 'Route, snacks, budget', 240, 'either', 'spendy', 'day-trip spot', 3, ['cdc', 'physical']],
  ['Backyard or Living-room Campout', 'play', 'campfire', 'Set up a real-feeling campout with sleeping bags, torch stories, and breakfast in the tent or fort.', 'Tent or blankets, sleeping bags', 120, 'either', 'free', 'home', 3, ['play', 'aapDigital']],
]

const ages = [
  ['Ages 5-6', 5, 6],
  ['Ages 7-8', 7, 8],
  ['Ages 9-10', 9, 10],
  ['Ages 11-12', 11, 12],
]

for (const [group, min, max] of ages) {
  for (const item of all) {
    const [name, category, icon, prompt, prep, duration, energy, cost, location, tier, sourceKeys] = item
    const adjustedName = min >= 9 && name === 'Stuffed Animal Tea Party' ? 'Cafe at Home' : name
    const adjustedTier = min >= 11 && tier === 1 && cost !== 'free' ? 2 : tier
    add(group, min, max, adjustedName, category, icon, prompt, prep, duration, energy, cost, location, adjustedTier, sourceKeys)
  }
}

function csvEscape(v) {
  const s = String(v ?? '')
  return /[",\n]/.test(s) ? `"${s.replaceAll('"', '""')}"` : s
}

const headers = [
  'reward_id', 'age_group', 'min_age', 'max_age', 'adventure_name', 'category', 'illustration',
  'why_its_good_reward', 'experience_prompt', 'parent_prep', 'duration_min', 'energy', 'cost',
  'location_type', 'suggested_tier', 'source_urls', 'review_notes',
]
fs.mkdirSync('data', { recursive: true })
fs.writeFileSync(
  'data/kid_adventure_reward_database.csv',
  [headers.join(','), ...rows.map((row) => headers.map((h) => csvEscape(row[h])).join(','))].join('\n') + '\n',
)

function sql(v) {
  return `'${String(v ?? '').replaceAll("'", "''")}'`
}

const values = rows.map((row) => {
  const key = row.reward_id.toLowerCase().replace('adv', 'research-adv')
  return `  (${[
    sql(key),
    sql(row.adventure_name),
    sql(row.illustration),
    sql(row.experience_prompt),
    sql(row.parent_prep),
    row.duration_min,
    sql(row.energy),
    row.min_age,
    row.max_age,
    sql(row.cost),
    sql(row.location_type),
    row.suggested_tier,
    sql(row.category),
    sql(row.why_its_good_reward),
    sql(row.source_urls),
    'true',
  ].join(', ')})`
})

const migration = `-- Starquezz v2 · 0007_researched_adventure_library.sql
-- Seed researched, experience-first adventure rewards for parent setup.

alter table library_activities add column if not exists activity_key text;
alter table library_activities add column if not exists category text not null default '';
alter table library_activities add column if not exists why_good_reward text not null default '';
alter table library_activities add column if not exists source_urls text not null default '';
alter table library_activities add column if not exists is_active boolean not null default true;
create unique index if not exists library_activities_activity_key_idx on library_activities (activity_key);

update library_activities set is_active = false where activity_key is null;

insert into library_activities
  (activity_key, name, illustration, explainer, prep, duration_min, energy, age_min, age_max, cost, location_type, suggested_tier, category, why_good_reward, source_urls, is_active)
values
${values.join(',\n')}
on conflict (activity_key) do update set
  name = excluded.name,
  illustration = excluded.illustration,
  explainer = excluded.explainer,
  prep = excluded.prep,
  duration_min = excluded.duration_min,
  energy = excluded.energy,
  age_min = excluded.age_min,
  age_max = excluded.age_max,
  cost = excluded.cost,
  location_type = excluded.location_type,
  suggested_tier = excluded.suggested_tier,
  category = excluded.category,
  why_good_reward = excluded.why_good_reward,
  source_urls = excluded.source_urls,
  is_active = excluded.is_active;
`
fs.writeFileSync('supabase/migrations/0007_researched_adventure_library.sql', migration)

console.log(`Wrote ${rows.length} adventure rewards`)
