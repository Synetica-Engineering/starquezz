import fs from "node:fs/promises";
import path from "node:path";
import { Workbook, SpreadsheetFile } from "@oai/artifact-tool";

const root = process.cwd();
const outputDir = path.join(root, "outputs", "habit-database-review");
const csvPath = path.join(root, "data", "kid_habit_research_database.csv");
const xlsxPath = path.join(outputDir, "kid_habit_research_database.xlsx");

const sources = {
  cdc68: "https://stacks.cdc.gov/view/cdc/155268",
  cdc911: "https://www.chconline.org/resourcelibrary/positive-parenting-tips-middle-childhood-9-11-years-old/",
  cdcParent: "https://www.cdc.gov/parents/children/index.html",
  cdcHealthy: "https://www.cdc.gov/healthy-weight-growth/tips-parents-caregivers/index.html",
  cdcActivity: "https://www.cdc.gov/physical-activity-education/guidelines/index.html",
  cdcSleep: "https://www.cdc.gov/sleep/about/index.html",
  cdcOral: "https://www.cdc.gov/oral-health/prevention/oral-health-tips-for-children.html",
  aapChores: "https://www.healthychildren.org/English/family-life/family-dynamics/communication-discipline/Pages/Chores-and-Responsibility.aspx",
  aapMedia: "https://www.healthychildren.org/English/family-life/Media/Pages/How-to-Make-a-Family-Media-Use-Plan.aspx",
  aap5210: "https://www.healthychildren.org/English/healthy-living/nutrition/Pages/Healthy-Active-Living-for-Families.aspx",
  unicef: "https://www.unicefusa.org/what-unicef-does/parenting/teach-children-health-habits",
  raisingChores: "https://raisingchildren.net.au/preschoolers/family-life/routines-rituals-rules/chores-for-children",
  pbsChores: "https://www.pbs.org/parents/thrive/chore-ideas-for-kids-ages-2-to-8",
  iesWriting: "https://ies.ed.gov/ncee/wwc/practiceguide/17",
  readingRocketsHandwriting: "https://www.readingrockets.org/topics/writing/articles/importance-teaching-handwriting",
  readingRocketsEarlyWriting: "https://www.readingrockets.org/topics/early-literacy-development/articles/learning-read-and-write-what-research-reveals",
  cornellNotes: "https://lsc.cornell.edu/how-to-study/taking-notes/cornell-note-taking-system/",
  musicExecutive: "https://pmc.ncbi.nlm.nih.gov/articles/PMC9393548/",
  musicLanguage: "https://pmc.ncbi.nlm.nih.gov/articles/PMC10216937/",
  musicMovement: "https://www.chhs.niu.edu/child-center/resources/articles/music-and-movement.shtml",
  reddit57: "https://www.reddit.com/r/Parenting/comments/1p7c06n/parents_of_5yr7yr_olds_what_chore_expectations_do/",
  reddit68: "https://www.reddit.com/r/Parenting/comments/5chejt/what_kinds_of_chores_do_you_expect_your_age_6ish/",
  reddit7: "https://www.reddit.com/r/Parenting/comments/1bxbm03/7_year_old_chores/",
  reddit9: "https://www.reddit.com/r/Parenting/comments/1q2znto/what_are_normal_chores_and_typical/",
  reddit10: "https://www.reddit.com/r/Parenting/comments/1dt0b62/what_types_of_chores_would_you_give_a_10_year_old/",
  redditMorning: "https://www.reddit.com/r/Parenting/comments/16ni7br/whats_your_morning_routine_with_your_kids/",
};

const columns = [
  "habit_id",
  "age_group",
  "min_age",
  "max_age",
  "habit_name",
  "category",
  "why_its_good_habit",
  "kid_facing_prompt",
  "parent_support",
  "suggested_frequency",
  "estimated_minutes",
  "difficulty",
  "evidence_level",
  "evidence_type",
  "source_urls",
  "review_notes",
];

const commonWhy = {
  brush: "Protects oral health and turns a high-value hygiene task into a predictable morning/evening routine.",
  sleep: "Consistent sleep routines support attention, mood, learning, physical health, and smoother family mornings.",
  movement: "Short movement habits support cardiovascular health, bone and muscle strength, sleep, mood, and self-regulation.",
  food: "Repeated exposure to balanced foods and water helps children practice healthy choices without making food a battle.",
  chores: "Small household jobs build responsibility, executive function, contribution, and confidence through real practice.",
  school: "Simple school routines reduce forgotten items, morning stress, and repeated parent-child reminders.",
  emotion: "Naming feelings and choosing a coping step builds self-regulation before problems escalate.",
  social: "Practicing kindness, gratitude, and helpful communication strengthens relationships and moral development.",
  media: "Screen boundaries protect sleep, attention, physical activity, and face-to-face connection.",
  independence: "Age-sized autonomy lets children practice planning, problem-solving, and ownership with adult backup.",
  schoolSkills: "Short, repeated school-skill practice builds fluency so children can focus more attention on ideas, learning, and classroom work.",
  music: "Short music practice can build rhythm, listening, fine-motor control, attention, and practice discipline.",
};

function src(...keys) {
  return keys.map((key) => sources[key]).join(" ");
}

const rows = [];
function estimateMinutes(habitName, prompt) {
  const text = `${habitName} ${prompt}`.toLowerCase();
  if (text.includes("two minutes")) return 2;
  if (text.includes("five-minute") || text.includes("5 minutes")) return 5;
  if (text.includes("10-minute") || text.includes("10 minutes")) return 10;
  if (text.includes("brush") || text.includes("floss")) return 5;
  if (text.includes("feeling") || text.includes("gratitude") || text.includes("thank") || text.includes("goal") || text.includes("planner")) return 5;
  if (text.includes("piano") || text.includes("guitar") || text.includes("rhythm") || text.includes("song") || text.includes("scale") || text.includes("chord")) return 10;
  if (text.includes("trace") || text.includes("letter") || text.includes("spelling") || text.includes("vocab") || text.includes("math fact") || text.includes("sentence") || text.includes("note")) return 10;
  if (text.includes("read") || text.includes("journal") || text.includes("draw")) return 10;
  if (text.includes("laundry") || text.includes("vacuum") || text.includes("sweep") || text.includes("bedroom reset")) return 10;
  if (text.includes("meal") || text.includes("snack") || text.includes("lunch")) return 10;
  return 5;
}

function add(group, minAge, maxAge, habitName, category, why, prompt, support, frequency, difficulty, evidence, type, sourceUrls, notes = "") {
  rows.push({
    habit_id: `HAB-${String(rows.length + 1).padStart(4, "0")}`,
    age_group: group,
    min_age: minAge,
    max_age: maxAge,
    habit_name: habitName,
    category,
    why_its_good_habit: why,
    kid_facing_prompt: prompt,
    parent_support: support,
    suggested_frequency: frequency,
    estimated_minutes: estimateMinutes(habitName, prompt),
    difficulty,
    evidence_level: evidence,
    evidence_type: type,
    source_urls: sourceUrls,
    review_notes: notes,
  });
}

const group56 = ["Ages 5-6", 5, 6];
[
  ["Brush teeth morning and night", "Hygiene", commonWhy.brush, "Brush for one song in the morning and one song at bedtime.", "Brush alongside the child or supervise technique; keep supplies visible.", "Daily, 2x", "Easy", "High", "Public health guidance", src("cdcOral", "unicef")],
  ["Put dirty clothes in the hamper", "Home responsibility", commonWhy.chores, "Clothes go in the hamper before pajamas or bath.", "Use a low hamper and praise completion as part of the routine.", "Daily", "Easy", "Moderate", "Chore guidance + community practice", src("aapChores", "pbsChores", "reddit57")],
  ["Clear plate to sink after meals", "Home responsibility", commonWhy.chores, "When you finish eating, carry your plate to the sink.", "Use unbreakable dishes and model the route.", "Daily", "Easy", "Moderate", "Chore guidance + community practice", src("pbsChores", "reddit57")],
  ["Make bed with simple tidy", "Self care", commonWhy.chores, "Pull up the blanket and put your pillow at the top.", "Accept child-level effort; avoid remaking in front of them.", "Daily", "Easy", "Moderate", "Chore guidance + community practice", src("aapChores", "reddit68")],
  ["Pick up toys before a new activity", "Organization", commonWhy.chores, "One game goes away before the next adventure starts.", "Keep bins labeled with pictures or simple words.", "Daily", "Easy", "Moderate", "Chore guidance + community practice", src("aapChores", "reddit7")],
  ["Drink water with meals", "Health", commonWhy.food, "Have water with breakfast, lunch, and dinner.", "Offer water by default and avoid using sweet drinks as routine rewards.", "Daily", "Easy", "High", "Public health guidance", src("cdcHealthy", "aap5210", "unicef")],
  ["Eat one fruit or vegetable at snack", "Nutrition", commonWhy.food, "Pick one colorful snack today.", "Offer two acceptable choices and keep pressure low.", "Daily", "Easy", "High", "Public health guidance", src("cdcHealthy", "aap5210")],
  ["Move body for 10 minutes", "Movement", commonWhy.movement, "Run, jump, dance, ride, or play for 10 minutes.", "Offer enjoyable options; track participation rather than performance.", "Daily", "Easy", "High", "Public health guidance", src("cdcActivity", "aap5210")],
  ["Clap a rhythm pattern", "Music practice", commonWhy.music, "Clap a simple rhythm and repeat it three times.", "Model a short pattern or use a familiar song beat.", "Daily", "Easy", "Moderate", "Music/rhythm research", src("musicLanguage", "musicMovement")],
  ["Sing one short song", "Music practice", commonWhy.music, "Sing one short song from start to finish.", "Let the child choose a familiar song and focus on participation.", "Daily", "Easy", "Moderate", "Music/language guidance", src("musicLanguage", "musicMovement")],
  ["Tap steady beat for one song", "Music practice", commonWhy.music, "Tap the beat while one song plays.", "Choose a short song with a clear beat.", "Daily", "Easy", "Moderate", "Music/rhythm guidance", src("musicLanguage", "musicMovement")],
  ["Bedtime wind-down with reading", "Sleep", commonWhy.sleep, "Pick a book or quiet story before lights out.", "Keep bedtime consistent and make books easy to reach.", "Daily", "Easy", "High", "Sleep guidance", src("cdcSleep")],
  ["Trace five letters", "School skills", commonWhy.schoolSkills, "Trace five letters slowly, starting each one in the right place.", "Use large lines or a short worksheet; praise careful formation over speed.", "School days", "Easy", "High", "Writing/handwriting guidance", src("iesWriting", "readingRocketsHandwriting")],
  ["Write your name once neatly", "School skills", commonWhy.schoolSkills, "Write your first name once with careful letter shapes.", "Model the first letter if needed and keep the task short.", "School days", "Easy", "High", "Writing/handwriting guidance", src("iesWriting", "readingRocketsHandwriting")],
  ["Copy one short word", "School skills", commonWhy.schoolSkills, "Look at one short word and copy it carefully.", "Pick a familiar word and focus on letter order and spacing.", "School days", "Easy", "Moderate", "Early literacy guidance", src("readingRocketsEarlyWriting", "iesWriting")],
  ["Pack one school item the night before", "School readiness", commonWhy.school, "Put tomorrow's folder or water bottle in your bag.", "Use a visual checklist and do the first few nights together.", "School nights", "Easy", "Moderate", "Development guidance + community practice", src("cdc68", "reddit68", "redditMorning")],
  ["Choose clothes for tomorrow", "Independence", commonWhy.independence, "Pick clothes that match tomorrow's weather.", "Offer two choices if open-ended choosing causes delays.", "School nights", "Easy", "Moderate", "Development guidance + community practice", src("cdc68", "redditMorning")],
  ["Feed pet with adult check", "Home responsibility", commonWhy.chores, "Give the pet food or water, then tell a grown-up.", "Use pre-measured portions and check safety every time.", "Daily", "Medium", "Moderate", "Chore guidance + community practice", src("raisingChores", "reddit57")],
  ["Five-minute room reset", "Organization", commonWhy.chores, "Set a timer and put away as much as you can.", "Work side-by-side; use a short timer to keep it finite.", "Daily", "Easy", "Moderate", "Chore guidance", src("aapChores", "pbsChores")],
  ["Help set napkins or utensils", "Family contribution", commonWhy.chores, "Put one napkin or fork at each seat.", "Start with non-breakable items and name the contribution.", "Daily", "Easy", "Moderate", "Chore guidance", src("pbsChores", "raisingChores")],
  ["Name one feeling", "Emotional regulation", commonWhy.emotion, "Point to or say the feeling you notice.", "Use a feelings chart during calm moments.", "Daily", "Easy", "Moderate", "Development guidance", src("cdc68")],
  ["Say one kind thing", "Social", commonWhy.social, "Give someone a real compliment or thank-you.", "Prompt specific praise instead of forced politeness.", "Daily", "Easy", "Moderate", "Development guidance", src("cdc68")],
  ["Wash hands before eating", "Hygiene", "Reduces spread of germs and anchors a simple self-care step to meals.", "Wash hands before food touches hands.", "Use a short song and make sinks/stools accessible.", "Daily", "Easy", "High", "Public health guidance", src("unicef", "cdcParent")],
  ["Put shoes and bag in one landing spot", "Organization", commonWhy.school, "Shoes and bag go to their home after school.", "Create one hook/bin location near the door.", "School days", "Easy", "Moderate", "Community practice", src("reddit7", "redditMorning")],
  ["Help sort laundry by color or person", "Home responsibility", commonWhy.chores, "Match clothes into piles.", "Keep sorting simple; do it together.", "Daily", "Easy", "Moderate", "Chore guidance + community practice", src("pbsChores", "reddit57")],
  ["Put books back after reading", "Organization", commonWhy.chores, "Book back on shelf after story time.", "Keep shelves reachable and categories simple.", "Daily", "Easy", "Moderate", "Chore guidance", src("aapChores", "pbsChores")],
  ["Practice a small brave try", "Resilience", commonWhy.independence, "Try one hard thing for two minutes before asking to stop.", "Praise effort and strategy, not perfection.", "Daily", "Medium", "Moderate", "Development guidance", src("cdc68")],
  ["Use bathroom and handwash before leaving home", "Self care", "Builds body awareness and reduces stressful last-minute exits.", "Potty, wash, then shoes.", "Attach it to the leaving-home checklist.", "Daily", "Easy", "Moderate", "Community practice", src("redditMorning")],
  ["Choose a calming bedtime object", "Sleep", commonWhy.sleep, "Pick the book, stuffy, or blanket for bedtime.", "Keep choices limited and predictable.", "Daily", "Easy", "Moderate", "Sleep guidance", src("cdcSleep")],
  ["Practice sharing or turn-taking", "Social", commonWhy.social, "Use 'my turn, your turn' during play.", "Coach short turns during calm play.", "Daily", "Medium", "Moderate", "Development guidance", src("cdc68")],
  ["Help water one plant", "Home responsibility", commonWhy.chores, "Check the plant and give it water if it needs it.", "Use a small cup and supervise overwatering.", "Daily", "Easy", "Moderate", "Chore guidance", src("raisingChores")],
].forEach((r) => add(...group56, ...r));

const group78 = ["Ages 7-8", 7, 8];
[
  ["Brush and floss with checklist", "Hygiene", commonWhy.brush, "Brush twice; floss or use a flosser once.", "Spot-check technique and celebrate independence.", "Daily", "Easy", "High", "Public health guidance", src("cdcOral", "unicef")],
  ["Pack backpack from a short checklist", "School readiness", commonWhy.school, "Folder, lunch box, water bottle, library book: check them off.", "Post a 4-6 item list by the bag station.", "School nights", "Easy", "Moderate", "Development guidance + community practice", src("cdc68", "reddit68", "reddit7")],
  ["Empty lunch box after school", "School readiness", commonWhy.school, "Lunch box gets emptied before play.", "Make it the first step after shoes/bag.", "School days", "Easy", "Moderate", "Community practice", src("reddit7")],
  ["Make bed daily", "Self care", commonWhy.chores, "Make your sleep space ready for tonight.", "Accept age-appropriate neatness; provide a quick demo.", "Daily", "Easy", "Moderate", "Chore guidance + community practice", src("aapChores", "reddit68")],
  ["Put clean laundry in drawers", "Home responsibility", commonWhy.chores, "Put each stack in the right drawer.", "Start with sorted piles; label drawers if needed.", "Daily", "Medium", "Moderate", "Chore guidance + community practice", src("raisingChores", "reddit57", "reddit68")],
  ["Set and clear table", "Family contribution", commonWhy.chores, "Help the table get ready, then clear your spot.", "Use safe items and give a clear start/end.", "Daily", "Easy", "Moderate", "Chore guidance", src("pbsChores", "raisingChores")],
  ["Sweep a small area", "Home responsibility", commonWhy.chores, "Sweep under your chair or one small floor zone.", "Give a child-sized broom or define the exact area.", "Daily", "Medium", "Moderate", "Chore guidance + community practice", src("raisingChores", "reddit68")],
  ["Feed pet or refill water bowl", "Home responsibility", commonWhy.chores, "Check the pet's water or food with a grown-up.", "Use pre-measured scoops and verify completion.", "Daily", "Medium", "Moderate", "Chore guidance + community practice", src("raisingChores", "reddit57")],
  ["Pick a 10-minute movement", "Movement", commonWhy.movement, "Pick one: bike, dance, walk, playground, or active game for 10 minutes.", "Offer varied, enjoyable options rather than only structured sport.", "Daily", "Easy", "High", "Public health guidance", src("cdcActivity", "aap5210")],
  ["Try a strength game", "Movement", "Jumping, climbing, running, and body-weight play help build strong bones and muscles.", "Do 10 jumps, a short climb, animal walks, or a quick running game.", "Keep it playful and age-appropriate.", "Daily", "Easy", "High", "Public health guidance", src("cdcActivity")],
  ["Practice piano keys for 5 minutes", "Music practice", commonWhy.music, "Play finger numbers, five notes, or a short pattern for 5 minutes.", "Keep the practice tiny and stop while it still feels manageable.", "Daily", "Medium", "Moderate", "Music training research", src("musicExecutive", "musicMovement")],
  ["Practice one guitar chord", "Music practice", commonWhy.music, "Place your fingers for one chord and strum it slowly five times.", "Use a beginner chord and praise clean setup over speed.", "Daily", "Medium", "Moderate", "Music training research", src("musicExecutive", "musicMovement")],
  ["Play one song section", "Music practice", commonWhy.music, "Play a tiny part of a song three times slowly.", "Pick one measure, line, or phrase rather than the whole song.", "Daily", "Medium", "Moderate", "Music training research", src("musicExecutive")],
  ["Water bottle check", "Health", commonWhy.food, "Fill your bottle before school or activities.", "Put bottle filling on the launch checklist.", "Daily", "Easy", "High", "Public health guidance", src("cdcHealthy", "aap5210")],
  ["Choose a fruit or vegetable side", "Nutrition", commonWhy.food, "Add one fruit or veggie to your plate or lunch.", "Offer limited choices and avoid pressuring bites.", "Daily", "Easy", "High", "Public health guidance", src("cdcHealthy", "aap5210")],
  ["Help choose one family meal idea", "Nutrition", "Participating in meal planning builds food literacy and ownership.", "Suggest one dinner, side, or snack for the week.", "Keep suggestions realistic; include the child in shopping/prep.", "Daily", "Medium", "Moderate", "Chore/nutrition guidance", src("raisingChores", "cdcHealthy")],
  ["Prepare a simple snack", "Independence", commonWhy.independence, "Make a safe snack and clean up after.", "Teach 2-3 approved snack options and kitchen safety.", "Daily", "Medium", "Moderate", "Development + community practice", src("cdc68", "reddit9")],
  ["Five-minute room reset", "Organization", commonWhy.chores, "Timer on; floor clear enough to walk and play.", "Use short timed resets instead of vague 'clean your room.'", "Daily", "Easy", "Moderate", "Chore guidance + community practice", src("aapChores", "reddit7")],
  ["Put library/book items back", "Organization", commonWhy.school, "Books return to the same spot when finished.", "Create one shelf/bin for school and library items.", "Daily", "Easy", "Moderate", "Community practice", src("reddit68")],
  ["Homework launch ritual", "School readiness", commonWhy.school, "Open folder, choose first task, ask one question if stuck.", "Stay nearby but let the child start the task.", "School days", "Medium", "Moderate", "Development guidance", src("cdc68")],
  ["Name today's feeling plus one next step", "Emotional regulation", commonWhy.emotion, "Say: 'I feel __, so I will __.'", "Offer a menu: breathe, water, break, ask for help, or take a pause.", "Daily", "Medium", "Moderate", "Development guidance", src("cdc68")],
  ["Gratitude or highlight share", "Social", commonWhy.social, "Share one good thing or one thank-you from today.", "Ask at dinner/bedtime; keep it quick.", "Daily", "Easy", "Moderate", "Development guidance", src("cdc68")],
  ["Saturday small chore block", "Home responsibility", commonWhy.chores, "Do one family job before the weekend adventure.", "Pick one clear job; rotate options.", "Daily", "Medium", "Moderate", "Chore guidance + community practice", src("aapChores", "reddit7")],
  ["Put away shoes and gear", "Organization", commonWhy.school, "Shoes, jacket, and bag go to their homes.", "Use hooks/bins and avoid hidden storage.", "Daily", "Easy", "Moderate", "Community practice", src("reddit7", "redditMorning")],
  ["Read for 10 minutes", "Learning", "Daily reading practice supports literacy, attention, and calm transitions.", "Read or listen to a book for 10 minutes.", "Let the child choose books and count read-alouds too.", "Daily", "Easy", "Moderate", "Development guidance", src("cdc68")],
  ["Copy one sentence neatly", "School skills", commonWhy.schoolSkills, "Copy one sentence with clear spacing and careful letters.", "Choose a sentence at the child's reading level and avoid erasing for perfection.", "School days", "Easy", "High", "Writing/handwriting guidance", src("iesWriting", "readingRocketsHandwriting")],
  ["Practice five spelling words", "School skills", commonWhy.schoolSkills, "Read, say, and write five spelling words.", "Use school words or high-frequency words and keep it brief.", "School days", "Medium", "High", "Writing guidance", src("iesWriting", "readingRocketsEarlyWriting")],
  ["Do five math facts", "School skills", "Short math-fact practice builds recall and confidence for classroom problem solving.", "Answer five math facts slowly and check your work.", "Use facts from school and stop before it feels like a long drill.", "School days", "Easy", "Moderate", "Development-informed school practice", src("cdc68")],
  ["Practice one hard skill kindly", "Resilience", commonWhy.independence, "Try, notice what changed, then decide the next step.", "Praise process, strategy, and persistence.", "Daily", "Medium", "Moderate", "Development guidance", src("cdc68")],
  ["Help unload safe dishwasher items", "Home responsibility", commonWhy.chores, "Put away forks, spoons, cups, or plastic items.", "Keep sharp/heavy items for adults.", "Daily", "Medium", "Moderate", "Chore guidance + community practice", src("raisingChores", "reddit9")],
].forEach((r) => add(...group78, ...r));

const group910 = ["Ages 9-10", 9, 10];
[
  ["Do a morning launch check", "Independence", commonWhy.independence, "Check bag, water bottle, shoes, and one thing you need today.", "Review the list weekly; step back unless safety/time requires help.", "School days", "Easy", "Moderate", "Development guidance + community practice", src("cdc911", "redditMorning")],
  ["Pack backpack and activity gear", "School readiness", commonWhy.school, "Pack tomorrow's school and activity items before bedtime.", "Keep a visible checklist for special days.", "School nights", "Medium", "Moderate", "Development guidance + community practice", src("cdc911", "reddit68")],
  ["Make simple lunch or lunch component", "Food independence", commonWhy.independence, "Make one lunch part: sandwich, fruit, snack, or bottle.", "Teach food safety and give approved options.", "School days", "Medium", "Moderate", "Community practice", src("reddit9", "reddit10")],
  ["Do personal laundry step", "Home responsibility", commonWhy.chores, "Sort, fold, put away, or start a supervised load.", "Teach one laundry step at a time.", "Daily", "Medium", "Moderate", "Chore guidance + community practice", src("raisingChores", "reddit9", "reddit10")],
  ["Clean desk or homework zone", "Organization", commonWhy.school, "Clear your study spot so tomorrow starts easier.", "Provide bins for papers, supplies, and trash.", "Daily", "Medium", "Moderate", "Development guidance", src("cdc911")],
  ["Use homework planner", "Executive function", commonWhy.school, "Write homework, due dates, or tomorrow's reminder.", "Check it briefly, then let the child own updates.", "School days", "Medium", "Moderate", "Development guidance", src("cdc911")],
  ["Copy class notes for 10 minutes", "School skills", commonWhy.schoolSkills, "Copy or rewrite important class notes for 10 minutes.", "Help choose one subject and emphasize readable notes, not perfect notes.", "School days", "Medium", "High", "Writing guidance", src("iesWriting", "cornellNotes")],
  ["Write one clear summary sentence", "School skills", commonWhy.schoolSkills, "After reading or class, write one sentence about the main idea.", "Ask 'what was this mostly about?' and keep it to one sentence.", "School days", "Medium", "High", "Writing guidance", src("iesWriting", "readingRocketsEarlyWriting")],
  ["Review five vocabulary words", "School skills", commonWhy.schoolSkills, "Read five vocabulary words and say what they mean.", "Use school words or a short card stack.", "School days", "Medium", "Moderate", "Development-informed school practice", src("cdc911", "iesWriting")],
  ["Do 10 minutes of math practice", "School skills", "Short math practice helps build fluency while keeping the task manageable.", "Do math facts, one worksheet section, or practice problems for 10 minutes.", "Keep the work bite-sized and matched to school topics.", "School days", "Medium", "Moderate", "Development-informed school practice", src("cdc911")],
  ["Break big task into three steps", "Executive function", commonWhy.independence, "Name the first three steps before starting.", "Model with chores/homework; keep steps concrete.", "Daily", "Medium", "Moderate", "Development guidance", src("cdc911")],
  ["Do a 10-minute active burst", "Movement", commonWhy.movement, "Get your heart moving for 10 minutes through play, biking, dance, or walking.", "Offer autonomy; track participation without shaming.", "Daily", "Easy", "High", "Public health guidance", src("cdcActivity", "aap5210")],
  ["Do a quick strength challenge", "Movement", "Muscle- and bone-strengthening activity several days weekly supports growth and fitness.", "Choose 10 jumps, wall pushups, bear crawls, stair steps, or a quick sport drill.", "Keep it playful and age-appropriate.", "Daily", "Easy", "High", "Public health guidance", src("cdcActivity")],
  ["Practice scales for 5 minutes", "Music practice", commonWhy.music, "Play one scale or five-note pattern slowly for 5 minutes.", "Choose a level-appropriate scale or pattern.", "Daily", "Medium", "Moderate", "Music training research", src("musicExecutive")],
  ["Practice chord changes", "Music practice", commonWhy.music, "Switch between two piano or guitar chords slowly 10 times.", "Pick easy chords and prioritize relaxed hands.", "Daily", "Medium", "Moderate", "Music training research", src("musicExecutive", "musicMovement")],
  ["Clap and count rhythm", "Music practice", commonWhy.music, "Count aloud and clap one rhythm pattern three times.", "Use a written rhythm, lesson book, or familiar song pattern.", "Daily", "Medium", "Moderate", "Music/rhythm research", src("musicLanguage", "musicExecutive")],
  ["Plan balanced snack", "Nutrition", commonWhy.food, "Choose a snack with color, protein, or water.", "Create a short approved snack list.", "Daily", "Easy", "High", "Public health guidance", src("cdcHealthy", "aap5210")],
  ["Help prep family meal", "Food independence", commonWhy.independence, "Wash produce, stir, measure, set table, or serve.", "Assign safe prep tasks and supervise heat/sharp tools.", "Daily", "Medium", "Moderate", "Chore/nutrition guidance", src("raisingChores", "cdcHealthy")],
  ["Clear and wipe eating spot", "Home responsibility", commonWhy.chores, "Clear dishes and wipe your place after eating.", "Keep safe cloth/spray available.", "Daily", "Easy", "Moderate", "Chore guidance + community practice", src("raisingChores", "reddit10")],
  ["Vacuum or sweep one room", "Home responsibility", commonWhy.chores, "Take care of one floor zone.", "Teach tool use and define 'done.'", "Daily", "Medium", "Moderate", "Chore guidance + community practice", src("raisingChores", "reddit10")],
  ["Take out light trash or recycling", "Home responsibility", commonWhy.chores, "Move one safe bag/bin to the right place.", "Avoid heavy bags and unsafe routes.", "Daily", "Medium", "Moderate", "Chore guidance", src("raisingChores")],
  ["Care for pet routine", "Home responsibility", commonWhy.chores, "Feed, water, brush, walk with adult, or clean a safe pet area.", "Set reminders and verify animal welfare.", "Daily", "Medium", "Moderate", "Chore guidance + community practice", src("raisingChores", "reddit10")],
  ["Daily feelings check", "Emotional regulation", commonWhy.emotion, "Rate your feeling 1-5 and pick one helpful action.", "Offer privacy; avoid turning it into interrogation.", "Daily", "Medium", "Moderate", "Development guidance", src("cdc911")],
  ["Read before bed", "Sleep/learning", commonWhy.sleep, "Use reading as the last quiet activity.", "Keep books near bed and let the child choose appealing titles.", "Daily", "Easy", "High", "Sleep guidance", src("cdcSleep")],
  ["Keep bedroom walkway clear", "Organization", commonWhy.chores, "Floor clear enough to walk safely.", "Define one visible standard instead of total-room perfection.", "Daily", "Easy", "Moderate", "Community practice", src("reddit68", "reddit10")],
  ["Weekly sheets or towel reset", "Self care", commonWhy.chores, "Bring used towel/sheets to laundry and help replace them.", "Teach sequence; help with fitted sheets if needed.", "Daily", "Medium", "Moderate", "Community practice", src("reddit10", "raisingChores")],
  ["Drink water before sweet drinks", "Health", commonWhy.food, "Water first when thirsty.", "Keep water available and treat sweet drinks as occasional.", "Daily", "Easy", "High", "Public health guidance", src("cdcHealthy", "aap5210")],
  ["Help younger sibling or family member", "Family contribution", commonWhy.social, "Do one helpful thing without taking over.", "Name the contribution and keep expectations reasonable.", "Daily", "Medium", "Moderate", "Development guidance", src("cdc911")],
].forEach((r) => add(...group910, ...r));

const group1112 = ["Ages 11-12", 11, 12];
[
  ["Do an evening launch check", "Independence", commonWhy.independence, "Check tomorrow's bag, clothes, and one reminder before bed.", "Review expectations weekly; step back unless safety/time requires help.", "Daily", "Easy", "Moderate", "Development guidance", src("cdc911")],
  ["Maintain planner for assignments and activities", "Executive function", commonWhy.school, "Write the task, deadline, and next action.", "Check less often over time; focus on systems, not nagging.", "School days", "Medium", "Moderate", "Development guidance", src("cdc911")],
  ["Add three note keywords", "School skills", commonWhy.schoolSkills, "Pick three keywords from today's notes or reading.", "Use a notebook margin or study card; keep it quick.", "School days", "Medium", "High", "Note-taking/writing guidance", src("cornellNotes", "iesWriting")],
  ["Write a two-sentence lesson summary", "School skills", commonWhy.schoolSkills, "Write two sentences about what you learned today.", "Prompt for main idea first, then one detail.", "School days", "Medium", "High", "Writing guidance", src("iesWriting", "cornellNotes")],
  ["Revise one sentence", "School skills", commonWhy.schoolSkills, "Pick one sentence and make it clearer, neater, or more complete.", "Focus on one edit: clarity, spelling, punctuation, or handwriting.", "School days", "Medium", "High", "Writing guidance", src("iesWriting")],
  ["Review five study cards", "School skills", commonWhy.schoolSkills, "Review five cards for vocabulary, facts, formulas, or dates.", "Keep the stack small so the habit stays fast.", "School days", "Easy", "Moderate", "Study skills guidance", src("cornellNotes", "cdc911")],
  ["Prepare school bag and gear independently", "School readiness", commonWhy.school, "Pack what tomorrow-you needs tonight.", "Use special-day prompts only: PE, library, practice, project.", "School nights", "Medium", "Moderate", "Development guidance + community practice", src("cdc911", "reddit10")],
  ["Make simple breakfast or lunch", "Food independence", commonWhy.independence, "Make one simple meal or meal part and clean up.", "Teach knife/heat safety; approve recipes and boundaries.", "Daily", "Medium", "Moderate", "Community practice", src("reddit9", "reddit10")],
  ["Plan one balanced snack or lunch", "Nutrition", commonWhy.food, "Include water plus a fruit/veg, protein, or whole-grain option.", "Stock accessible ingredients and avoid food moralizing.", "Daily", "Medium", "High", "Public health guidance", src("cdcHealthy", "aap5210")],
  ["Contribute to grocery or meal planning", "Nutrition", "Meal planning builds food literacy, autonomy, and realistic family contribution.", "Add one useful item or meal idea to the family list.", "Keep suggestions realistic and give a clear place to add ideas.", "Daily", "Medium", "Moderate", "Chore/nutrition guidance", src("raisingChores", "cdcHealthy")],
  ["Put one laundry stack away", "Home responsibility", commonWhy.chores, "Put one folded stack of clothes into the right drawer or shelf.", "Teach drawer locations and keep the stack small enough to finish quickly.", "Daily", "Medium", "Moderate", "Chore guidance + community practice", src("raisingChores", "reddit9", "reddit10")],
  ["Clean bathroom sink or mirror", "Home responsibility", commonWhy.chores, "Reset one bathroom surface safely.", "Use child-safe products and define what chemicals are off-limits.", "Daily", "Medium", "Moderate", "Chore guidance", src("raisingChores")],
  ["Vacuum or sweep bedroom/common area", "Home responsibility", commonWhy.chores, "Clean one assigned floor zone.", "Teach tool care and the visible standard.", "Daily", "Medium", "Moderate", "Chore guidance + community practice", src("raisingChores", "reddit10")],
  ["Unload/load dishwasher safely", "Home responsibility", commonWhy.chores, "Put dishes where they belong; leave sharp/heavy items if needed.", "Teach cabinet locations and safety rules.", "Daily", "Medium", "Moderate", "Chore guidance + community practice", src("raisingChores", "reddit9")],
  ["Take responsibility for pet task", "Home responsibility", commonWhy.chores, "Complete the pet task and mark it done.", "Verify completion because animal care is safety-critical.", "Daily", "Medium", "Moderate", "Chore guidance + community practice", src("raisingChores", "reddit10")],
  ["Take a 10-minute active break", "Movement", commonWhy.movement, "Choose a walk, bike, dance, sport drill, or active game for 10 minutes.", "Help the child find enjoyable, social, or skill-based options.", "Daily", "Easy", "High", "Public health guidance", src("cdcActivity", "aap5210")],
  ["Try one quick sport skill", "Movement", "Enjoyable, varied movement is more likely to stick as children gain independence.", "Practice one sport, walk, bike, or active skill for 10 minutes.", "Offer choice and remove barriers like equipment/transport.", "Daily", "Easy", "High", "Public health guidance", src("cdcActivity")],
  ["Practice instrument for 10 minutes", "Music practice", commonWhy.music, "Practice piano, guitar, voice, or another instrument for 10 minutes.", "Help pick one clear focus before the timer starts.", "Daily", "Medium", "Moderate", "Music training research", src("musicExecutive")],
  ["Slow-practice one hard measure", "Music practice", commonWhy.music, "Play one tricky measure or phrase slowly five times.", "Choose a tiny section so practice stays focused and finishable.", "Daily", "Medium", "Moderate", "Music training research", src("musicExecutive")],
  ["Record one practice take", "Music practice", commonWhy.music, "Play a short section once and listen back.", "Keep feedback specific: one thing that improved, one thing to try.", "Daily", "Medium", "Low", "Development-informed music practice", src("musicExecutive")],
  ["Daily mood check", "Emotional regulation", commonWhy.emotion, "Notice your mood, one body signal, and one helpful action.", "Offer privacy and normalize stress without minimizing it.", "Daily", "Medium", "Moderate", "Development guidance", src("cdc911")],
  ["Read, journal, or draw before bed", "Sleep/learning", commonWhy.sleep, "Choose a quiet activity before sleep.", "Keep books, journals, or drawing supplies easy to reach.", "Daily", "Easy", "High", "Sleep guidance", src("cdcSleep")],
  ["Own hygiene kit", "Hygiene", commonWhy.brush, "Check teeth, deodorant if relevant, hair, and clean clothes.", "Discuss body changes respectfully and privately.", "Daily", "Medium", "High", "Public health guidance", src("cdcOral", "cdcParent")],
  ["Do a 10-minute bedroom reset", "Organization", commonWhy.chores, "Spend 10 minutes on laundry, floor, trash, or school items.", "Define one small zone or use a timer.", "Daily", "Medium", "Moderate", "Chore guidance + community practice", src("aapChores", "reddit10")],
].forEach((r) => add(...group1112, ...r));

function csvEscape(value) {
  const text = value == null ? "" : String(value);
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

const csv = [
  columns.join(","),
  ...rows.map((row) => columns.map((column) => csvEscape(row[column])).join(",")),
].join("\n") + "\n";

await fs.mkdir(path.dirname(csvPath), { recursive: true });
await fs.mkdir(outputDir, { recursive: true });
await fs.writeFile(csvPath, csv, "utf8");

const workbook = await Workbook.fromCSV(csv, { sheetName: "Habit Database" });
const sheet = workbook.worksheets.getItem("Habit Database");
const lastRow = rows.length + 1;
sheet.showGridLines = false;
sheet.freezePanes.freezeRows(1);
sheet.getRange("A1:P1").format.fill = { color: "#143A5A" };
sheet.getRange("A1:P1").format.font = { color: "#FFFFFF", bold: true };
sheet.getRange("A1:P1").format.wrapText = true;
sheet.getRange("A:P").format.wrapText = true;
sheet.getRange("A:A").format.columnWidth = 12;
sheet.getRange("B:B").format.columnWidth = 12;
sheet.getRange("C:D").format.columnWidth = 8;
sheet.getRange("E:E").format.columnWidth = 28;
sheet.getRange("F:F").format.columnWidth = 18;
sheet.getRange("G:G").format.columnWidth = 48;
sheet.getRange("H:H").format.columnWidth = 38;
sheet.getRange("I:I").format.columnWidth = 44;
sheet.getRange("J:J").format.columnWidth = 16;
sheet.getRange("K:N").format.columnWidth = 16;
sheet.getRange("O:O").format.columnWidth = 56;
sheet.getRange("P:P").format.columnWidth = 28;
sheet.getRange(`A1:P${lastRow}`).format.borders = {
  insideHorizontal: { style: "thin", color: "#D9E2EA" },
  bottom: { style: "thin", color: "#91A6B8" },
};

const sample = await workbook.inspect({
  kind: "table",
  range: "Habit Database!A1:P8",
  include: "values",
  tableMaxRows: 8,
  tableMaxCols: 16,
  maxChars: 5000,
});
console.log(sample.ndjson);

const errors = await workbook.inspect({
  kind: "match",
  searchTerm: "#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A",
  options: { useRegex: true, maxResults: 50 },
  summary: "formula error scan",
});
console.log(errors.ndjson);

const preview = await workbook.render({ sheetName: "Habit Database", range: "A1:P18", scale: 1, format: "png" });
await fs.writeFile(path.join(outputDir, "habit_database_preview.png"), new Uint8Array(await preview.arrayBuffer()));

const xlsx = await SpreadsheetFile.exportXlsx(workbook);
await xlsx.save(xlsxPath);

console.log(JSON.stringify({ rows: rows.length, csvPath, xlsxPath }, null, 2));
