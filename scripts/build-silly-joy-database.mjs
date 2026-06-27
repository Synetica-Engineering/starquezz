import fs from 'node:fs'

const sourceNotes = {
  nature: 'Inspired by nature-play and outdoor noticing guidance from NAEYC and AIFS; original prompt.',
  making: 'Inspired by creative confidence and child-led making research; original prompt.',
  connection: 'Inspired by micro-acts of joy and family connection research; original prompt.',
  book: 'Format inspired by The Little Book of Joy as a tiny daily joy prompt; wording is original.',
  play: 'Inspired by unstructured play and scavenger-hunt guidance; original prompt.',
}

const sourceUrls = {
  nature: 'https://www.naeyc.org/our-work/families/ideas-exploring-outdoors https://aifs.gov.au/resources/policy-and-practice-papers/nature-play-and-child-wellbeing',
  making: 'https://www.parents.com/creativity-boosts-confidence-in-kids-8761133 https://www.naeyc.org/our-work/families/ideas-exploring-outdoors',
  connection: 'https://www.theguardian.com/lifeandstyle/2024/jan/18/can-micro-acts-of-joy-make-you-happier-i-tried-them-for-seven-days https://www.magiccatpublishing.co.uk/products/the-little-book-of-joy',
  book: 'https://www.magiccatpublishing.co.uk/products/the-little-book-of-joy',
  play: 'https://aifs.gov.au/resources/policy-and-practice-papers/nature-play-and-child-wellbeing https://www.naeyc.org/our-work/families/ideas-exploring-outdoors',
}

const why = {
  nature: 'Tiny noticing rituals help kids slow down, observe closely, and find delight in the ordinary world around them.',
  making: 'Small creative prompts give kids a fast win and turn everyday materials into self-expression.',
  connection: 'Gentle shared silliness adds warmth to the day without making it another serious task.',
  play: 'Low-stakes pretend play and games build imagination, language, flexible thinking, and family fun.',
}

const groups = [
  {
    category: 'nature_noticing',
    source: 'nature',
    energy: 'outdoor',
    location: 'outside',
    items: [
      ['Spot a bird with a fancy walk', 'Find one bird and copy its walk for ten steps.', 'none', 5],
      ['Collect a pocket rock', 'Find one interesting rock, name it, then put it somewhere special.', 'none', 5],
      ['Cloud creature vote', 'Look up and decide what animal one cloud is trying to become.', 'none', 4],
      ['Leaf face hunt', 'Find a leaf that looks like it has a face or personality.', 'none', 5],
      ['Tiny shadow safari', 'Find three tiny shadows and point out what made them.', 'none', 5],
      ['Wind detective', 'Find one thing the wind is moving and guess where the wind came from.', 'none', 4],
      ['Sidewalk crack jungle', 'Find a tiny plant growing in a surprising crack or corner.', 'none', 5],
      ['Ant traffic report', 'Watch an ant or small bug and narrate its commute like the news.', 'none', 5],
      ['Something yellow mission', 'Find the happiest yellow thing outside.', 'none', 4],
      ['Pebble lineup', 'Line up three pebbles from smallest to biggest and appoint a pebble king.', 'none', 5],
      ['Listen for three layers', 'Stand still and name three sounds: near, far, and mysterious.', 'none', 4],
      ['Find a nature triangle', 'Find three natural things that make a triangle shape together.', 'none', 5],
      ['Bark texture handshake', 'Touch tree bark gently and describe it with a silly adjective.', 'none', 4],
      ['Rain smell report', 'After rain, step outside and describe the smell as if it were soup.', 'none', 3],
      ['Seed helicopter test', 'Find a seed, leaf, or petal and see how it falls through the air.', 'fallen seed or leaf', 5],
      ['Color thief hunt', 'Pick a color and find three places nature used it.', 'none', 6],
      ['The smallest beautiful thing', 'Find the smallest beautiful thing you can notice today.', 'none', 4],
      ['Bird name invention', 'See or hear a bird and invent a grand title for it.', 'none', 3],
      ['Find a bendy stick', 'Find a bendy stick and decide what magic tool it would be.', 'fallen stick', 5],
      ['One square foot safari', 'Pick one tiny patch of ground and count how many different things live there.', 'none', 8],
    ],
  },
  {
    category: 'tiny_collections',
    source: 'nature',
    energy: 'either',
    location: 'home or outside',
    items: [
      ['Three smooth things', 'Find three smooth things and rank them from polite to fancy.', 'none', 6],
      ['Rock museum label', 'Choose one rock and write or say its museum name.', 'rock, paper optional', 7],
      ['Tiny treasure tray', 'Gather three tiny treasures and arrange them like an exhibit.', 'tray or plate', 8],
      ['One-color collection', 'Collect or point to five things that are all the same color.', 'none', 7],
      ['Pocket museum tour', 'Put three safe small things in a row and give a guided tour.', 'small objects', 8],
      ['Button royal family', 'Pick three buttons or coins and make them into a royal family.', 'buttons or coins', 6],
      ['Leaf library', 'Find two different leaves and decide which is a comic book and which is a dictionary.', 'fallen leaves', 6],
      ['Texture tasting with hands', 'Find soft, rough, bumpy, and slippery textures using only touch.', 'none', 6],
      ['Sticker constellation', 'Place five stickers or dots and name the constellation.', 'stickers or paper dots', 8],
      ['Sock color census', 'Count the colors in the sock drawer and announce the winner.', 'sock drawer', 6],
      ['Tiny blue hunt', 'Find the tiniest blue thing in the room.', 'none', 5],
      ['Kitchen shape sweep', 'Find a circle, square, triangle, and oval in the kitchen.', 'none', 6],
      ['Shell or stone story', 'Pick one shell, stone, or small object and invent where it traveled from.', 'small object', 7],
      ['Crayon parade', 'Line up crayons in the order they would march in a parade.', 'crayons', 5],
      ['Five-finger collection', 'Touch one interesting thing for each finger and give each finger a title.', 'none', 5],
      ['Mini rainbow tray', 'Make the smallest rainbow you can from household objects.', 'small objects', 8],
      ['Found alphabet', 'Find an object shaped a little like a letter.', 'none', 6],
      ['Coin face election', 'Pick two coins or tokens and vote which one looks more serious.', 'coins or tokens', 4],
      ['Spoon reflection check', 'Look in a spoon and make your best upside-down royal face.', 'spoon', 3],
      ['Object weather report', 'Pick one object and report today as sunny, stormy, or suspicious for it.', 'any object', 4],
    ],
  },
  {
    category: 'outfit_character',
    source: 'play',
    energy: 'indoor',
    location: 'home',
    items: [
      ['Wear one wrong-color sock', 'Choose one sock that clearly did not get the memo.', 'socks', 3],
      ['Fancy breakfast hat', 'Wear a hat or towel crown for one ordinary snack or meal.', 'hat or towel', 5],
      ['Backwards shirt minute', 'Wear a shirt backwards for one minute and walk like a fashion model.', 'shirt', 3],
      ['Sunglasses news anchor', 'Put on sunglasses and announce one piece of household news.', 'sunglasses', 4],
      ['Cape for a chore', 'Wear a blanket cape while doing one tiny helpful thing.', 'blanket or towel', 6],
      ['Mismatched family pose', 'Everyone wears one mismatched item and takes a serious pose.', 'clothes', 5],
      ['Invisible crown ceremony', 'Place an invisible crown on someone and say what they rule today.', 'none', 3],
      ['Character walk hallway', 'Walk down the hallway as a detective, robot, penguin, or queen.', 'none', 4],
      ['Fun outfit together', 'Pick one fun accessory each and wear it for ten minutes.', 'accessories', 10],
      ['Apron superhero', 'Wear an apron or towel as a superhero uniform and name the power.', 'apron or towel', 5],
      ['Sock puppet greeting', 'Turn a sock into a greeter and let it say hello to everyone.', 'sock', 5],
      ['Serious tiny tie', 'Make a paper tie and wear it for a very important snack meeting.', 'paper, tape', 8],
      ['Pajama parade', 'Do a tiny pajama parade from one room to another.', 'pajamas', 4],
      ['One-minute moustache', 'Draw or tape on a paper moustache and introduce yourself formally.', 'paper, tape', 6],
      ['Backpack explorer mode', 'Wear a backpack and pretend the living room is a mountain base camp.', 'backpack', 8],
      ['Fancy shoes vote', 'Pick the fanciest or silliest shoes available and give them a score.', 'shoes', 5],
      ['Mirror face challenge', 'Make three faces in the mirror: tiny, giant, and suspicious.', 'mirror', 4],
      ['Royal robe towel', 'Wear a towel robe and make one royal decree of kindness.', 'towel', 5],
      ['Alien disguise', 'Choose one ordinary item an alien would think is a hat.', 'household item', 5],
      ['Weather outfit forecast', 'Dress one stuffed animal or pillow for imaginary weather.', 'stuffed animal or pillow', 8],
    ],
  },
  {
    category: 'paper_mail',
    source: 'book',
    energy: 'indoor',
    location: 'home',
    items: [
      ['Design stationery', 'Draw a tiny letterhead for your future messages.', 'paper, pencil', 10],
      ['Send a sock note', 'Write or draw a note and hide it in a clean sock for someone to find.', 'paper, pencil, sock', 7],
      ['Postcard to tomorrow', 'Write one sentence or draw one picture for tomorrow-you.', 'paper, pencil', 8],
      ['Tiny envelope secret', 'Fold a small envelope and put a cheerful doodle inside.', 'paper', 8],
      ['Family stamp design', 'Design a pretend postage stamp for your family.', 'paper, coloring tool', 10],
      ['One-line newspaper', 'Write the headline of today in one dramatic sentence.', 'paper, pencil', 5],
      ['Compliment ticket', 'Make a ticket that says one kind thing about someone.', 'paper, pencil', 6],
      ['Paper airplane mail', 'Write a one-word message and fly it across the room.', 'paper', 5],
      ['Mini menu for snack', 'Design a fancy menu for an ordinary snack.', 'paper, pencil', 8],
      ['Secret code hello', 'Invent a three-symbol code that means hello.', 'paper, pencil', 7],
      ['Bookmark for a random book', 'Make a quick bookmark and place it in a book that needs a friend.', 'paper, coloring tool', 10],
      ['Fort address label', 'Create an address for a pillow fort, even if the fort is imaginary.', 'paper, pencil', 6],
      ['Tiny map to the fridge', 'Draw a dramatic treasure map to a very normal place.', 'paper, pencil', 8],
      ['Mail a drawing across the table', 'Slide a drawing across the table like official mail.', 'paper, pencil', 5],
      ['Receipt for joy', 'Write a pretend receipt for one happy thing you received today.', 'paper, pencil', 6],
      ['Name badge for an object', 'Make a name badge for a plant, chair, or spoon.', 'paper, tape', 7],
      ['Thank-you dot card', 'Make a card with only dots, then explain why it says thank you.', 'paper, pencil', 8],
      ['Family logo sketch', 'Sketch a logo for your home team.', 'paper, pencil', 10],
      ['Lost and found poster', 'Make a poster for a missing imaginary dragon, cloud, or sock.', 'paper, pencil', 10],
      ['Certificate of silliness', 'Award someone a certificate for excellent silliness.', 'paper, pencil', 8],
    ],
  },
  {
    category: 'draw_design',
    source: 'making',
    energy: 'indoor',
    location: 'home',
    items: [
      ['Design a cereal mascot', 'Draw a mascot for the cereal or breakfast you wish existed.', 'paper, coloring tool', 10],
      ['Invent a tiny flag', 'Design a flag for your room, family, or favorite snack.', 'paper, coloring tool', 10],
      ['Draw a bug hotel', 'Draw the fanciest hotel a bug could stay in.', 'paper, pencil', 8],
      ['Make a sticker idea', 'Draw a sticker you wish someone would make.', 'paper, coloring tool', 7],
      ['Shoe blueprint', 'Design a shoe for jumping on clouds or sneaking past broccoli.', 'paper, pencil', 10],
      ['Silly stationery border', 'Fill the edge of a page with tiny stars, socks, leaves, or ghosts.', 'paper, pencil', 8],
      ['Draw your laugh', 'Draw what your laugh would look like if it were a creature.', 'paper, coloring tool', 8],
      ['Kitchen robot plan', 'Design a robot that does one tiny kitchen job badly.', 'paper, pencil', 10],
      ['Invent a board game cover', 'Draw the box cover for a game that does not exist yet.', 'paper, coloring tool', 10],
      ['Secret door drawing', 'Draw a door that could appear in a wall and where it leads.', 'paper, pencil', 8],
      ['One-line monster', 'Draw a monster without lifting your pencil.', 'paper, pencil', 5],
      ['Dream snack package', 'Design packaging for a snack with a ridiculous flavor.', 'paper, coloring tool', 10],
      ['Hat for a tree', 'Draw the perfect hat for a nearby tree.', 'paper, pencil', 7],
      ['Tiny comic panel', 'Draw one comic panel where a spoon is the hero.', 'paper, pencil', 10],
      ['Mood weather doodle', 'Draw today as weather: fog, sparkle rain, spaghetti wind, or sun.', 'paper, coloring tool', 8],
      ['Design a thank-you stamp', 'Draw a stamp that would make mail feel kind.', 'paper, coloring tool', 8],
      ['Imaginary pet portrait', 'Draw a pet that can fit inside a teacup or on the moon.', 'paper, coloring tool', 10],
      ['Three-shape invention', 'Use only a circle, triangle, and rectangle to invent something.', 'paper, pencil', 7],
      ['Draw a sound', 'Pick one sound and draw what shape it makes.', 'paper, coloring tool', 7],
      ['Make a mini sign', 'Make a tiny sign for a shelf, toy, plant, or snack.', 'paper, tape', 8],
    ],
  },
  {
    category: 'sound_music',
    source: 'play',
    energy: 'either',
    location: 'home',
    items: [
      ['Spoon drum solo', 'Play a ten-second drum solo on a safe surface.', 'spoon, table or pot', 3],
      ['Hum a secret anthem', 'Hum a theme song for walking to the bathroom or fridge.', 'none', 3],
      ['Sound scavenger hunt', 'Find three sounds in the room and name them.', 'none', 5],
      ['Whisper opera', 'Sing one ordinary sentence like a tiny whisper opera.', 'none', 4],
      ['Clap a weather report', 'Clap how today feels: sunny, stormy, jumpy, sleepy.', 'none', 4],
      ['Doorbell orchestra', 'Make three polite sounds using only safe household objects.', 'household objects', 6],
      ['Animal choir', 'Everyone picks an animal noise and sings one note together.', 'none', 4],
      ['Beat the timer dance', 'Dance until a 30-second timer ends, then freeze dramatically.', 'timer', 3],
      ['Kitchen shaker', 'Put dry rice or pasta in a sealed container and shake one rhythm.', 'sealed container, dry rice or pasta', 6],
      ['Guess the sound', 'Close eyes while someone makes one safe sound; guess what it was.', 'household object', 5],
      ['Tiny applause parade', 'Give a tiny round of applause for three ordinary objects.', 'none', 4],
      ['Sock microphone', 'Use a clean sock as a pretend microphone and announce the day.', 'sock', 4],
      ['Tap your name', 'Tap the syllables of your name, then someone else copies it.', 'none', 4],
      ['Soundtrack a walk', 'Make quiet sound effects for walking across the room.', 'none', 5],
      ['One-word song', 'Sing a song using only one word, such as banana or sparkle.', 'none', 4],
      ['Rhythm mirror', 'Tap a rhythm and let someone mirror it back.', 'none', 5],
      ['Chair squeak concert', 'Find one non-annoying household sound and make it feel musical.', 'safe household object', 5],
      ['Silence challenge', 'Stay silent for 20 seconds, then name the first sound you heard.', 'none', 3],
      ['Marching band hallway', 'March down a hallway with quiet imaginary instruments.', 'none', 5],
      ['Goodnight sound effect', 'Make a soft sound effect for putting one object to sleep.', 'small object', 4],
    ],
  },
  {
    category: 'micro_kindness',
    source: 'connection',
    energy: 'either',
    location: 'anywhere',
    items: [
      ['Secret smile delivery', 'Give someone a smile without saying why.', 'none', 2],
      ['Compliment an object', 'Tell a hardworking object why it is doing a good job.', 'none', 3],
      ['Thank the door', 'Thank a door, chair, shoe, or cup for its service.', 'none', 3],
      ['Kindness pebble', 'Choose a pebble or small token and let it remind you to do one kind thing.', 'small token', 5],
      ['High-five the air', 'High-five the air for someone who is not nearby but deserves it.', 'none', 2],
      ['Tiny helper quest', 'Do one helpful thing smaller than a minute.', 'none', 5],
      ['Nice note for a future finder', 'Leave a tiny cheerful note somewhere safe at home.', 'paper, pencil', 6],
      ['Gratitude object pick', 'Pick one object and say why you are glad it exists.', 'none', 4],
      ['Make someone laugh softly', 'Try one gentle joke, face, or silly walk to brighten someone.', 'none', 5],
      ['Plant compliment', 'Say something encouraging to a plant, tree, or patch of grass.', 'plant or tree', 3],
      ['Thank your feet', 'Thank your feet for carrying you around today.', 'none', 2],
      ['Kindness weather', 'Tell someone what weather they bring into the room.', 'none', 4],
      ['Invisible medal', 'Give someone an invisible medal for a tiny good thing.', 'none', 4],
      ['Cheer for a chore', 'Cheer quietly while someone does an ordinary task.', 'none', 4],
      ['Smile at the sky', 'Look up and smile at the sky like it told a joke.', 'none', 2],
      ['Appreciation echo', 'Repeat one kind thing someone said today.', 'none', 4],
      ['Tiny thank-you bow', 'Bow to one thing or person that helped today.', 'none', 3],
      ['Good job, me', 'Say one thing you did today that deserves a tiny clap.', 'none', 3],
      ['Send a heart blink', 'Blink a pretend heart message to someone across the room.', 'none', 2],
      ['Make a kindness plan', 'Pick one person and one tiny kind thing you could do later.', 'none', 5],
    ],
  },
  {
    category: 'mini_games',
    source: 'play',
    energy: 'either',
    location: 'home',
    items: [
      ['Play one card game hand', 'Play a single quick hand of any card game.', 'cards', 10],
      ['Floor-is-lava bridge', 'Cross the room using three safe stepping spots.', 'pillows optional', 8],
      ['Pillow balance test', 'Balance a pillow on your head for five steps.', 'pillow', 4],
      ['Dice decision', 'Roll a die and do that many silly jumps or claps.', 'die', 3],
      ['Toy hide-and-seek', 'Hide one toy and give warm-cold clues.', 'small toy', 8],
      ['One-minute puzzle race', 'See how many puzzle pieces or blocks you can connect in one minute.', 'puzzle or blocks', 3],
      ['Sock toss target', 'Toss rolled socks into a basket from three distances.', 'rolled socks, basket', 8],
      ['Memory tray', 'Look at five objects, cover them, then name what disappeared.', 'five small objects, cloth', 7],
      ['Statue switch', 'Freeze as a statue, then switch moods when someone claps.', 'none', 5],
      ['Tiny bowling', 'Bowl with a rolled sock and three cups or blocks.', 'rolled sock, cups or blocks', 8],
      ['Guess the tiny drawing', 'Draw one object with your eyes closed and let someone guess.', 'paper, pencil', 6],
      ['Balance a book', 'Walk five steps with a book on your head.', 'book', 4],
      ['Stair count quest', 'Count steps, tiles, or door handles in a dramatic explorer voice.', 'none', 5],
      ['Remote control robot', 'One person gives robot commands: forward, beep, spin, freeze.', 'none', 6],
      ['Blanket island', 'Stand on a blanket island and rescue three objects from the sea.', 'blanket, objects', 8],
      ['Coin flip story', 'Flip a coin: heads means dragon, tails means sandwich. Tell one sentence.', 'coin', 5],
      ['Silent charades snack', 'Act out a food without talking.', 'none', 5],
      ['Three-card fortune', 'Pull three cards and invent a silly fortune from them.', 'cards', 6],
      ['Mini maze tape line', 'Make a tiny tape or string path and walk two fingers through it.', 'tape or string', 8],
      ['Button hockey', 'Flick a button or coin gently toward a paper goal.', 'button or coin, paper', 7],
    ],
  },
  {
    category: 'food_table_whimsy',
    source: 'connection',
    energy: 'indoor',
    location: 'kitchen or table',
    items: [
      ['Snack face plate', 'Arrange a snack into a face before eating.', 'snack', 6],
      ['Tiny toast speech', 'Raise a cup and make a tiny toast to something ordinary.', 'cup', 3],
      ['Spoon mirror joke', 'Look in a spoon and give your reflection a nickname.', 'spoon', 3],
      ['Napkin crown', 'Fold a napkin into a crown, cape, or mountain.', 'napkin', 5],
      ['Menu voice', 'Announce dinner or snack in a fancy restaurant voice.', 'none', 3],
      ['Fruit fortune teller', 'Before eating fruit, predict what adventure it had before arriving.', 'fruit', 4],
      ['Cracker architecture', 'Build the tallest tiny tower from safe snack pieces.', 'snack pieces', 6],
      ['Water cheers', 'Clink water cups and cheers to something tiny.', 'cups of water', 3],
      ['Table weather report', 'Report the table weather: crumb storm, spoon clouds, sunny plate.', 'none', 4],
      ['Name the leftovers', 'Give a leftover or snack a dramatic title.', 'food item', 3],
      ['Fancy bite review', 'Take one bite and review it like a serious food judge.', 'food', 4],
      ['Placemat doodle plan', 'Draw or imagine a placemat for a restaurant run by cats, clouds, or robots.', 'paper optional', 7],
      ['Snack color count', 'Count how many colors are in a snack or meal.', 'snack or meal', 4],
      ['Tiny chef bow', 'Bow like a chef after helping with one small food job.', 'none', 3],
      ['Fork orchestra', 'Before eating, gently tap a tiny rhythm with safe utensils.', 'utensils', 3],
      ['Name the soup cloud', 'If there is steam or sauce, imagine what shape it wants to be.', 'food optional', 3],
      ['Cup tower challenge', 'Stack safe cups into the smallest tower possible.', 'cups', 5],
      ['Secret ingredient guess', 'Guess one ingredient or flavor before tasting.', 'food', 4],
      ['Table gratitude crumb', 'Say one tiny thing you are glad happened today.', 'none', 4],
      ['Dessert dragon promise', 'Invent the rule a dessert dragon would make at the table.', 'none', 4],
    ],
  },
  {
    category: 'home_worldbuilding',
    source: 'play',
    energy: 'indoor',
    location: 'home',
    items: [
      ['Name a corner kingdom', 'Pick one corner and name the kingdom that lives there.', 'none', 5],
      ['Chair passport', 'Give a chair a passport stamp for where it has traveled.', 'paper optional', 6],
      ['Pillow mountain map', 'Arrange pillows into mountains and name the highest peak.', 'pillows', 8],
      ['Toy town mayor', 'Elect one toy or object as mayor and announce one rule.', 'toy or object', 6],
      ['Doorway portal', 'Walk through a doorway and pretend it leads to a new planet.', 'none', 5],
      ['Blanket ocean', 'Spread a blanket ocean and sail one small object across it.', 'blanket, small object', 7],
      ['Bookshelf weather', 'Describe the weather happening on the bookshelf today.', 'bookshelf', 4],
      ['Under-table cave', 'Peek under a table and give the cave a name.', 'table', 4],
      ['Sofa island rescue', 'Rescue one pillow or toy from the sofa island.', 'sofa, pillow or toy', 6],
      ['Window museum', 'Look out a window and give three things exhibit labels.', 'window', 5],
      ['Laundry creature', 'Turn one clean towel or shirt into a creature for one minute.', 'clean towel or shirt', 5],
      ['Hallway runway', 'Walk the hallway as if presenting a new invention.', 'none', 5],
      ['Secret base password', 'Invent a password for entering a room, then whisper it once.', 'none', 4],
      ['Plant roommate interview', 'Ask a plant three interview questions and answer for it.', 'plant', 6],
      ['Staircase mountain guide', 'Narrate going up stairs like a mountain expedition.', 'stairs', 4],
      ['Object bedtime', 'Put one object to bed in a drawer or shelf and say goodnight.', 'small object', 4],
      ['Fridge gallery tour', 'Give a tour of magnets, drawings, or notes on the fridge.', 'fridge', 6],
      ['Sock drawer nation', 'Open a sock drawer and decide its national anthem, sport, or flag.', 'sock drawer', 6],
      ['Mirror portal message', 'Tell the mirror one message to deliver to your future self.', 'mirror', 4],
      ['Room rename ceremony', 'Rename a room for five minutes and announce it officially.', 'none', 5],
    ],
  },
]

const rows = []
for (const group of groups) {
  for (const [name, prompt, materials, duration] of group.items) {
    rows.push({
      silly_id: `SILLY-${String(rows.length + 1).padStart(4, '0')}`,
      activity_name: name,
      category: group.category,
      kid_prompt: prompt,
      materials,
      duration_min: duration,
      energy: group.energy,
      location_type: group.location,
      grownup_optional: duration > 6 ? 'true' : 'false',
      why_it_adds_joy: why[group.source === 'making' ? 'making' : group.source === 'connection' ? 'connection' : group.source === 'nature' ? 'nature' : 'play'],
      source_note: sourceNotes[group.source],
      source_urls: sourceUrls[group.source],
      review_notes: '',
    })
  }
}

function csvEscape(value) {
  const s = String(value ?? '')
  return /[",\n]/.test(s) ? `"${s.replaceAll('"', '""')}"` : s
}

function sql(value) {
  return `'${String(value ?? '').replaceAll("'", "''")}'`
}

const headers = [
  'silly_id', 'activity_name', 'category', 'kid_prompt', 'materials', 'duration_min',
  'energy', 'location_type', 'grownup_optional', 'why_it_adds_joy', 'source_note',
  'source_urls', 'review_notes',
]

fs.mkdirSync('data', { recursive: true })
fs.writeFileSync(
  'data/kid_silly_joy_activity_database.csv',
  [headers.join(','), ...rows.map((row) => headers.map((h) => csvEscape(row[h])).join(','))].join('\n') + '\n',
)

const values = rows.map((row) => `  (${[
  sql(row.silly_id.toLowerCase().replace('silly', 'joy')),
  sql(row.activity_name),
  sql(row.category),
  sql(row.kid_prompt),
  sql(row.materials),
  row.duration_min,
  sql(row.energy),
  sql(row.location_type),
  row.grownup_optional,
  sql(row.why_it_adds_joy),
  sql(row.source_note),
  sql(row.source_urls),
  'true',
].join(', ')})`)

const migration = `-- Starquezz v2 · 0008_silly_joy_library.sql
-- Tiny optional "Silly mode" prompts. Original wording; inspired by simple joy,
-- nature play, creativity, and micro-acts of joy research.

create table if not exists library_silly_activities (
  id uuid primary key default gen_random_uuid(),
  silly_key text unique not null,
  name text not null,
  category text not null,
  kid_prompt text not null,
  materials text not null default '',
  duration_min int not null check (duration_min > 0 and duration_min <= 20),
  energy text not null check (energy in ('indoor', 'outdoor', 'either')),
  location_type text not null default 'anywhere',
  grownup_optional boolean not null default true,
  why_it_adds_joy text not null default '',
  source_note text not null default '',
  source_urls text not null default '',
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table library_silly_activities enable row level security;
drop policy if exists library_silly_activities_read on library_silly_activities;
create policy library_silly_activities_read
  on library_silly_activities for select to authenticated using (true);

insert into library_silly_activities
  (silly_key, name, category, kid_prompt, materials, duration_min, energy, location_type, grownup_optional, why_it_adds_joy, source_note, source_urls, is_active)
values
${values.join(',\n')}
on conflict (silly_key) do update set
  name = excluded.name,
  category = excluded.category,
  kid_prompt = excluded.kid_prompt,
  materials = excluded.materials,
  duration_min = excluded.duration_min,
  energy = excluded.energy,
  location_type = excluded.location_type,
  grownup_optional = excluded.grownup_optional,
  why_it_adds_joy = excluded.why_it_adds_joy,
  source_note = excluded.source_note,
  source_urls = excluded.source_urls,
  is_active = excluded.is_active;
`

fs.writeFileSync('supabase/migrations/0008_silly_joy_library.sql', migration)
console.log(`Wrote ${rows.length} silly joy activities`)
