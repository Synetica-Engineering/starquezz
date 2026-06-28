update library_activities as activity
set explainer = copy.explainer
from (values
  ('Blanket Fort Story Night', 'Build a cozy blanket fort with your grown-up. Crawl inside, turn on the flashlight, and make up a story in your secret hideout.'),
  ('Kitchen Dance Party', 'Pick five songs, turn the kitchen into a dance floor, and invent one silly family dance move together.'),
  ('Indoor Picnic Dinner', 'Spread a blanket on the floor and have dinner picnic-style. You get to choose the perfect picnic spot at home.'),
  ('Pancake Helper Morning', 'Help mix pancake batter and decorate your pancakes. Your grown-up handles the hot stove while you make breakfast feel special.'),
  ('Flashlight Treasure Hunt', 'Grab a flashlight and follow clues to find hidden treasures around home. Can you solve the last clue?'),
  ('Nature Color Hunt', 'Head outside and hunt for every color of the rainbow. Line up your finds and snap a family photo at the end.'),
  ('Playground Monster Chase', 'Go to the playground and play monster chase. Freeze, escape, and run like the giggles are chasing you.'),
  ('Library Pick Three', 'Go to the library and choose three books to bring home or read together. You are the book boss today.'),
  ('Paper Plane Championship', 'Fold paper planes together, then test which one flies farthest, hits the target, or does the wildest trick.'),
  ('Family Board Game Pick', 'Pick the board game or card game. Your grown-up gives full attention for one whole round.'),
  ('Backyard Bubbles Lab', 'Mix bubbles, try different wand shapes, and crown the biggest bubble of the day. Pop, float, repeat.'),
  ('Chalk Art Gallery', 'Turn the sidewalk or driveway into an art gallery. Draw together, then give every masterpiece a fancy title.'),
  ('Stuffed Animal Tea Party', 'Set up a pretend tea party for your stuffed animals. Give every guest a voice, a job, and a tiny bit of drama.'),
  ('Cafe at Home', 'Set up a pretend cafe at home. Give every guest a voice, a job, and a tiny bit of drama.'),
  ('Sunset Pajama Walk', 'Put on pajamas or cozy clothes and take a sunset walk together. Name three good things from the day before heading home.'),
  ('Build a Box Rocket', 'Turn a cardboard box into a rocket, boat, or time machine. Climb aboard and take a pretend trip together.'),
  ('Mini Obstacle Course', 'Build a safe obstacle course with cushions, tape lines, and chairs. Run it, crawl it, then beat your best time.'),
  ('Garden Water Helper', 'Water the plants at home or in the garden with Mom or Dad. Give each thirsty plant a little splash and choose one to check next time.'),
  ('Bookshop Browse With Price Cap', 'Browse the bookshop slowly and choose one book within the grown-up price cap. Hunt for a story you cannot wait to open.'),
  ('Swimming Play Session', 'Jump into pool play with races, floating, silly jumps, and the first game picked by you.'),
  ('Tiny Train or Bus Ride', 'Ride one short train or bus route just for fun. Help spot the stops, windows, signs, and tiny surprises along the way.'),
  ('Home Mystery Treasure Map', 'Follow a mystery map around home or a nearby park. Crack the clues and solve the adventure together.'),
  ('Museum Mini Mission', 'Visit a museum or gallery with a mission: pick three favorites, sketch one, and tell the story of one amazing thing.'),
  ('Family Day Trip Explorer', 'Head somewhere new for a half-day adventure. Help choose snacks, the route, and the very first stop.'),
  ('Backyard or Living-room Campout', 'Set up a campout in the backyard or living room. Bring sleeping bags, tell torch stories, and wake up to a tiny camp breakfast.')
) as copy(name, explainer)
where activity.name = copy.name
  and activity.activity_key like 'research-adv-%';
