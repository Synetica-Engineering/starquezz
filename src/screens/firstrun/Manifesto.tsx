// Variant 1 splash — the first open ever is a parent deciding whether this
// app has a soul. The copy spine maps to the three canonical problems
// (AGENT_BRIEF §1) — all three must appear, never just one story.
import { useState } from 'react'
import { Zee } from '../../components/Zee'

const LINES = [
  'The world’s full of pings and of pop-ups and pings.',
  'StarqueZZ gives your kid their own quest — no more “what do I need to do?”',
  'We help you choose habits that fit your kid — and grow as they do.',
  'And every reward is an adventure you have together.',
]

export function Manifesto({ onProceed }: { onProceed: () => void }) {
  const [step, setStep] = useState(0)
  const last = step >= LINES.length

  return (
    <div className="manifesto" onClick={!last ? () => setStep((s) => s + 1) : undefined}>
      <button
        className="mskip"
        onClick={(e) => {
          e.stopPropagation()
          onProceed()
        }}
      >
        skip
      </button>
      {!last ? (
        <div key={step} className="mline reveal">
          {LINES[step]}
        </div>
      ) : (
        <div className="mfinal-wrap">
          <Zee size={74} mood="cheer" />
          <div className="mfinal">
            A playful childhood.
            <br />
            With you in it.
          </div>
          <div className="wordmark" style={{ fontSize: 26 }}>
            Starque<span className="zz">ZZ</span>
          </div>
          <button className="btn" onClick={onProceed}>
            See how it works →
          </button>
        </div>
      )}
      {!last && (
        <div className="mhint">
          tap to continue · {step + 1} / {LINES.length}
        </div>
      )}
    </div>
  )
}
