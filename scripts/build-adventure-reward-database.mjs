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
  ['Blanket Fort Story Night', 'play', 'fort', 'Build a cozy blanket fort with your grown-up. Crawl inside, turn on the flashlight, and make up a story in your secret hideout.', 'Blankets, pillows, flashlight', 35, 'indoor', 'free', 'home', 1, ['play', 'aapDigital']],
  ['Kitchen Dance Party', 'play', 'disco', 'Pick five songs, turn the kitchen into a dance floor, and invent one silly family dance move together.', 'Speaker or phone for music', 20, 'indoor', 'free', 'home', 1, ['play', 'aapDigital']],
  ['Indoor Picnic Dinner', 'connection', 'basket', 'Spread a blanket on the floor and have dinner picnic-style. You get to choose the perfect picnic spot at home.', 'Blanket, simple food', 35, 'indoor', 'free', 'home', 1, ['cdc', 'aapDigital']],
  ['Pancake Helper Morning', 'autonomy', 'pancake', 'Help mix pancake batter and decorate your pancakes. Your grown-up handles the hot stove while you make breakfast feel special.', 'Ingredients, safe helper job', 40, 'indoor', 'cheap', 'home', 0, ['cdc']],
  ['Flashlight Treasure Hunt', 'play', 'flashlight', 'Grab a flashlight and follow clues to find hidden treasures around home. Can you solve the last clue?', 'Flashlight, five objects', 25, 'indoor', 'free', 'home', 1, ['play']],
  ['Nature Color Hunt', 'movement', 'leaf', 'Head outside and hunt for every color of the rainbow. Line up your finds and snap a family photo at the end.', 'Color list', 35, 'outdoor', 'free', 'park or neighborhood', 1, ['physical', 'play']],
  ['Playground Monster Chase', 'movement', 'swing', 'Go to the playground and play monster chase. Freeze, escape, and run like the giggles are chasing you.', 'Nothing', 45, 'outdoor', 'free', 'playground', 1, ['physical', 'cdc']],
  ['Library Pick Three', 'learning', 'library', 'Go to the library and choose three books to bring home or read together. You are the book boss today.', 'Library card', 45, 'indoor', 'free', 'library', 1, ['library', 'cdc']],
  ['Paper Plane Championship', 'learning', 'plane', 'Fold paper planes together, then test which one flies farthest, hits the target, or does the wildest trick.', 'Paper, tape target', 25, 'indoor', 'free', 'home', 1, ['play']],
  ['Family Board Game Pick', 'connection', 'dice', 'Pick the board game or card game. Your grown-up gives full attention for one whole round.', 'Board or card game', 30, 'indoor', 'free', 'home', 1, ['reinforcement', 'play']],
  ['Backyard Bubbles Lab', 'learning', 'flask', 'Mix bubbles, try different wand shapes, and crown the biggest bubble of the day. Pop, float, repeat.', 'Bubble mix or soap, wand', 30, 'outdoor', 'cheap', 'home or park', 1, ['play']],
  ['Chalk Art Gallery', 'learning', 'paint', 'Turn the sidewalk or driveway into an art gallery. Draw together, then give every masterpiece a fancy title.', 'Chalk', 30, 'outdoor', 'cheap', 'sidewalk or driveway', 1, ['play']],
  ['Stuffed Animal Tea Party', 'play', 'cupcake', 'Set up a pretend tea party for your stuffed animals. Give every guest a voice, a job, and a tiny bit of drama.', 'Cups, snack optional', 25, 'indoor', 'free', 'home', 1, ['play']],
  ['Sunset Pajama Walk', 'connection', 'sunrise', 'Put on pajamas or cozy clothes and take a sunset walk together. Name three good things from the day before heading home.', 'Coats if needed', 20, 'outdoor', 'free', 'neighborhood', 1, ['cdc', 'aapDigital']],
  ['Build a Box Rocket', 'learning', 'plane', 'Turn a cardboard box into a rocket, boat, or time machine. Climb aboard and take a pretend trip together.', 'Cardboard box, crayons', 35, 'indoor', 'free', 'home', 1, ['play']],
  ['Mini Obstacle Course', 'movement', 'ball', 'Build a safe obstacle course with cushions, tape lines, and chairs. Run it, crawl it, then beat your best time.', 'Cushions, tape', 25, 'indoor', 'free', 'home', 1, ['physical', 'play']],
  ['Garden Water Helper', 'autonomy', 'water', 'Water the plants at home or in the garden with Mom or Dad. Give each thirsty plant a little splash and choose one to check next time.', 'Watering can', 20, 'outdoor', 'free', 'home or community garden', 1, ['cdc']],
  ['Bookshop Browse With Price Cap', 'learning', 'bookshop', 'Browse the bookshop slowly and choose one book within the grown-up price cap. Hunt for a story you cannot wait to open.', 'Price cap', 45, 'indoor', 'cheap', 'bookshop', 2, ['library', 'autonomy']],
  ['Swimming Play Session', 'movement', 'swim', 'Jump into pool play with races, floating, silly jumps, and the first game picked by you.', 'Swim gear', 75, 'either', 'cheap', 'pool', 2, ['physical']],
  ['Tiny Train or Bus Ride', 'autonomy', 'train', 'Ride one short train or bus route just for fun. Help spot the stops, windows, signs, and tiny surprises along the way.', 'Fare, route plan', 45, 'either', 'cheap', 'transit route', 2, ['cdc']],
  ['Home Mystery Treasure Map', 'play', 'scroll', 'Follow a mystery map around home or a nearby park. Crack the clues and solve the adventure together.', 'Map, 5 clues, small prize note', 75, 'either', 'cheap', 'home or park', 3, ['play', 'reinforcement']],
  ['Museum Mini Mission', 'learning', 'museum', 'Visit a museum or gallery with a mission: pick three favorites, sketch one, and tell the story of one amazing thing.', 'Tickets if needed, sketchbook', 120, 'indoor', 'spendy', 'museum or gallery', 3, ['cdc', 'library']],
  ['Family Day Trip Explorer', 'autonomy', 'train', 'Head somewhere new for a half-day adventure. Help choose snacks, the route, and the very first stop.', 'Route, snacks, budget', 240, 'either', 'spendy', 'day-trip spot', 3, ['cdc', 'physical']],
  ['Backyard or Living-room Campout', 'play', 'campfire', 'Set up a campout in the backyard or living room. Bring sleeping bags, tell torch stories, and wake up to a tiny camp breakfast.', 'Tent or blankets, sleeping bags', 120, 'either', 'free', 'home', 3, ['play', 'aapDigital']],
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
    const adjustedPrompt = min >= 9 && name === 'Stuffed Animal Tea Party'
      ? 'Set up a pretend cafe at home. Give every guest a voice, a job, and a tiny bit of drama.'
      : prompt
    const adjustedTier = min >= 11 && tier === 1 && cost !== 'free' ? 2 : tier
    add(group, min, max, adjustedName, category, icon, adjustedPrompt, prep, duration, energy, cost, location, adjustedTier, sourceKeys)
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
