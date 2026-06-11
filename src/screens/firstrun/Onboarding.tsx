// Onboarding 1–3: the manifesto carried the why; these explain the how —
// one canonical problem per slide, demonstrated rather than re-pitched.
import { useState } from 'react'
import { SceneAutonomy, SceneDesign, SceneTogether } from './OnbScenes'

const SLIDES = [
  {
    Art: SceneAutonomy,
    h: 'Their board, not your reminders.',
    p: 'Your kid checks StarqueZZ instead of asking “what do I need to do?” — the routine becomes theirs, and every check-off pays a star on the spot.',
  },
  {
    Art: SceneDesign,
    h: 'A few habits, their size.',
    p: 'Not sure which habits matter at this age? We help you pick a small, doable, balanced handful — no giant chore chart — and evolve them as your kid grows.',
  },
  {
    Art: SceneTogether,
    h: 'Stars buy adventures — together.',
    p: 'Bookshop trips, playgrounds, treasure hunts. Never toys or money. Stars decide which adventure — the adventure itself always happens.',
  },
]

export function Onboarding({ onDone }: { onDone: () => void }) {
  const [i, setI] = useState(0)
  const last = i === SLIDES.length - 1
  const Art = SLIDES[i].Art
  return (
    <div className="onb">
      <div className="onb-art" key={i}>
        <Art />
      </div>
      <div className="onb-body">
        <h3>{SLIDES[i].h}</h3>
        <p>{SLIDES[i].p}</p>
      </div>
      <div className="onb-foot">
        <div className="onb-dots">
          {SLIDES.map((_, k) => (
            <i key={k} className={k === i ? 'on' : ''} />
          ))}
        </div>
        {last ? (
          <button className="btn" onClick={onDone}>
            Get started — free, always
          </button>
        ) : (
          <button className="btn ghost" onClick={() => setI(i + 1)}>
            Next
          </button>
        )}
      </div>
    </div>
  )
}
