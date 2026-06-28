// The Adventure Menu — browsing is motivation. Affordable picks glow,
// locked ones show "X more ✦" (never hidden), and the free fallback is
// always present and warm. Picking happens at the Sunday ceremony.
import { useState } from 'react'
import { useFamily } from '../../state/family'
import { SqzIcon, StarToken } from '../../components/icons'
import type { Adventure, Child } from '../../lib/types'

const TIER_NAMES: Record<number, string> = {
  1: 'Anytime picks',
  2: 'Special picks',
  3: 'Premium picks',
}

const ADVENTURE_STEPS: Record<string, string[]> = {
  'Backyard or Living-room Campout': [
    'Pick a great camp spot: backyard, living room, or the coziest corner.',
    'Set up a tent, blanket fort, pillows, sleeping bags, and a tiny camp light.',
    'Tell torch stories, make a camp snack, and wake up to a mini camp breakfast.',
  ],
  'Backyard Bubbles Lab': [
    'Pour bubble mix into a safe bowl or tray.',
    'Try different wands, loops, or straws to see what makes giant bubbles.',
    'Name the champion bubble before it pops.',
  ],
  'Blanket Fort Story Night': [
    'Choose the fort spot and gather blankets, pillows, and clips.',
    'Build the walls, crawl inside, and turn on a flashlight.',
    'Invent a story together, one silly sentence at a time.',
  ],
  'Bookshop Browse With Price Cap': [
    'Check the price cap with your grown-up before you start hunting.',
    'Browse slowly and make a small maybe pile.',
    'Pick the book you cannot wait to open first.',
  ],
  'Build a Box Rocket': [
    'Find a big box and decide if it is a rocket, boat, or time machine.',
    'Decorate it with crayons, paper, buttons, or control panels.',
    'Climb aboard and tell your grown-up where the adventure goes.',
  ],
  'Cafe at Home': [
    'Choose a cafe name and set up cups, plates, and a tiny menu.',
    'Give each guest a job: chef, customer, waiter, or taste tester.',
    'Serve pretend orders with big fancy cafe voices.',
  ],
  'Chalk Art Gallery': [
    'Pick a sidewalk or driveway space with your grown-up.',
    'Draw three masterpieces: one tiny, one huge, and one surprise.',
    'Walk through the gallery and give each picture a fancy title.',
  ],
  'Family Board Game Pick': [
    'Choose the game or card deck for everyone to play.',
    'Set up the pieces and explain one rule you remember.',
    'Play one full round with victory cheers at the end.',
  ],
  'Family Day Trip Explorer': [
    'Help choose the snacks, water bottle, and first stop.',
    'Look at the route and spot signs, bridges, or landmarks.',
    'Pick one favorite moment before heading home.',
  ],
  'Flashlight Treasure Hunt': [
    'Ask your grown-up to hide five tiny treasures or clue cards.',
    'Turn on the flashlight and follow each clue slowly.',
    'Celebrate the final treasure with a detective pose.',
  ],
  'Garden Water Helper': [
    'Fill the watering can with help from Mom or Dad.',
    'Give each thirsty plant a gentle splash of water.',
    'Choose one plant to check on next time and give it a nickname.',
  ],
  'Home Mystery Treasure Map': [
    'Draw or receive a mystery map with a few clue spots.',
    'Follow the map around home or the park like an explorer.',
    'Solve the final clue and make a dramatic treasure discovery.',
  ],
  'Indoor Picnic Dinner': [
    'Pick the picnic spot: rug, blanket, or pretend park corner.',
    'Carry plates, cups, and simple food to the blanket.',
    'Eat picnic-style and name the best bite of the meal.',
  ],
  'Kitchen Dance Party': [
    'Pick five songs for the family dance list.',
    'Clear a safe dance spot and choose the first move.',
    'Invent one signature family dance and repeat it together.',
  ],
  'Library Pick Three': [
    'Bring the library card and choose which shelf to explore first.',
    'Pick three books: one funny, one cozy, and one surprise.',
    'Read a page together before deciding what comes home.',
  ],
  'Mini Obstacle Course': [
    'Build a safe course with cushions, tape lines, or chairs.',
    'Practice one slow round so everyone knows the path.',
    'Run, crawl, balance, and try to beat your best time.',
  ],
  'Museum Mini Mission': [
    'Pick a mission: find three favorites, one strange thing, and one beautiful thing.',
    'Sketch or describe the coolest thing you see.',
    'Tell your grown-up the story you imagine behind it.',
  ],
  'Nature Color Hunt': [
    'Bring a color list or name the rainbow colors out loud.',
    'Walk outside and find one nature treasure for each color.',
    'Line up the finds and take a victory photo.',
  ],
  'Pancake Helper Morning': [
    'Wash hands and help gather the pancake ingredients.',
    'Mix batter or add toppings while your grown-up handles the stove.',
    'Decorate your pancake face, tower, or pattern before eating.',
  ],
  'Paper Plane Championship': [
    'Fold two or three paper planes with different shapes.',
    'Make a start line and choose a target or landing zone.',
    'Fly them and crown the farthest, funniest, and wildest plane.',
  ],
  'Playground Monster Chase': [
    'Choose the safe chase zone with your grown-up.',
    'Pick who starts as the monster and what the freeze rule is.',
    'Run, freeze, escape, and swap roles for round two.',
  ],
  'Stuffed Animal Tea Party': [
    'Invite the stuffed animal guests and give each one a seat.',
    'Set cups, tiny snacks, or pretend treats on the table.',
    'Give every guest a funny voice and ask one party question.',
  ],
  'Sunset Pajama Walk': [
    'Put on pajamas or cozy clothes and check the weather.',
    'Walk slowly and spot the sky colors changing.',
    'Name three good things from the day before heading home.',
  ],
  'Swimming Play Session': [
    'Pack swim gear, towel, water, and anything your grown-up says you need.',
    'Start with a safe warm-up splash and choose the first pool game.',
    'Try races, floating, or silly jumps with your grown-up watching.',
  ],
  'Tiny Train or Bus Ride': [
    'Check the route and pick a window-spot mission.',
    'Help spot stops, signs, colors, and people getting on or off.',
    'Choose one tiny surprise you noticed on the ride.',
  ],
}

export function AdventureMenu({ child }: { child: Child }) {
  const fam = useFamily()
  const [tapped, setTapped] = useState<string | null>(null)
  const [selected, setSelected] = useState<Adventure | null>(null)

  const menu = fam.adventures.filter((a) => !a.archived_at)
  const tiers = [1, 2, 3].map((t) => ({ tier: t, items: menu.filter((a) => a.tier === t) }))
  const fallbacks = menu.filter((a) => a.tier === 0)

  const tap = (a: Adventure) => {
    setTapped(a.id)
    setTimeout(() => setTapped(null), 600)
    setSelected(a)
  }

  const card = (a: Adventure) => {
    const unlocked = child.star_balance >= a.cost
    const isFallback = a.tier === 0
    const cls = 'adv ' + (isFallback ? 'fallback' : unlocked ? 'unlocked' : 'locked')
    return (
      <button
        className={cls}
        key={a.id}
        onClick={() => tap(a)}
        style={{
          border: 'none', cursor: 'pointer', textAlign: 'left', padding: 0, width: '100%',
          transform: tapped === a.id ? 'scale(0.98)' : undefined,
        }}
      >
        <div className="art">
          <SqzIcon name={a.illustration} size={44} stroke={1.7} />
        </div>
        <div className="meta">
          <div className="col">
            <div className="an">{a.name}</div>
            <div className="as">
              {isFallback ? (
                '0 ✦ · any week, together'
              ) : unlocked ? (
                'unlocked ✓'
              ) : (
                <span style={{ color: '#FF9CC6' }}>{a.cost - child.star_balance} more ✦ to unlock</span>
              )}
            </div>
          </div>
          <span className="ap">
            {isFallback ? (
              '★ free'
            ) : (
              <>
                <StarToken size={13} /> {a.cost}
              </>
            )}
          </span>
        </div>
      </button>
    )
  }

  if (selected) {
    return <AdventureDetailSheet adventure={selected} child={child} onClose={() => setSelected(null)} />
  }

  return (
    <div className="view scroll">
      <div className="row between" style={{ padding: '2px 0 10px' }}>
        <span className="dname" style={{ fontSize: 21 }}>
          Adventures
        </span>
        <span className="pill">
          <StarToken size={15} glow /> {child.star_balance}
        </span>
      </div>

      <div className="col gap12">
        {tiers.map(
          ({ tier, items }) =>
            items.length > 0 && (
              <div className="col gap12" key={tier}>
                <div className="tier-label">{TIER_NAMES[tier]}</div>
                {items.map(card)}
              </div>
            ),
        )}
        {fallbacks.length > 0 && (
          <div className="col gap12">
            <div className="tier-label">Always yours</div>
            {fallbacks.map(card)}
          </div>
        )}
        {menu.length === 0 && (
          <div className="pcard tac muted" style={{ padding: 24, fontSize: 14 }}>
            The menu is being cooked up — ask a grown-up ✦
          </div>
        )}
      </div>
    </div>
  )
}

function AdventureDetailSheet({
  adventure,
  child,
  onClose,
}: {
  adventure: Adventure
  child: Child
  onClose: () => void
}) {
  const fam = useFamily()
  const library = adventure.library_id
    ? fam.activityLibrary.find((a) => a.id === adventure.library_id)
    : null
  const unlocked = child.star_balance >= adventure.cost
  const isFallback = adventure.tier === 0
  const detail = library?.explainer || `This is a family adventure called ${adventure.name}. A grown-up can make the plan, and you get to enjoy it together.`
  const prep = library?.prep || adventure.venue_note
  const steps = ADVENTURE_STEPS[adventure.name] || [
    'Choose the first fun thing to do with your grown-up.',
    prep ? `Get ready together: ${prep}.` : 'Gather the things that make the adventure feel special.',
    'Try it, laugh about the best part, and pick one thing to remember.',
  ]

  return (
    <div className="adventure-detail-page">
      <div className="adv-detail">
        <div className="adv-detail-art">
          <SqzIcon name={adventure.illustration} size={58} stroke={1.7} />
        </div>
        <div className="row between gap10">
          <h3 style={{ margin: 0 }}>{adventure.name}</h3>
          <span className="ap">
            {isFallback ? (
              '★ free'
            ) : (
              <>
                <StarToken size={13} /> {adventure.cost}
              </>
            )}
          </span>
        </div>
        <p>{detail}</p>
        <div className="adv-detail-steps">
          <b>Make it fun</b>
          <div className="adv-step-list">
            {steps.map((step, index) => (
              <div className="adv-step" key={step}>
                <span>{index + 1}</span>
                <p>{step}</p>
              </div>
            ))}
          </div>
        </div>
        {prep && (
          <div className="adv-detail-note">
            <b>What to get ready:</b> {prep}
          </div>
        )}
        {adventure.venue_note && library?.prep && (
          <div className="adv-detail-note">
            <b>Place:</b> {adventure.venue_note}
          </div>
        )}
        {!isFallback && !unlocked && (
          <div className="adv-detail-status">{adventure.cost - child.star_balance} more stars to unlock.</div>
        )}
        <button className="btn full" onClick={onClose}>
          Back to adventures
        </button>
      </div>
    </div>
  )
}
