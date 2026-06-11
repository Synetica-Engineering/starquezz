// Variant 2 splash — the app's "hello", not a speech. < 2s, never blocks.
// Cold start gets the full beat; resume is instant.
import { useEffect } from 'react'
import { Zee } from '../../components/Zee'

export function Splash({ onDone, resume = false }: { onDone?: () => void; resume?: boolean }) {
  useEffect(() => {
    if (!onDone) return
    const t = setTimeout(onDone, resume ? 250 : 1900)
    return () => clearTimeout(t)
  }, [onDone, resume])

  return (
    <div className="view full" onClick={onDone} style={{ cursor: onDone ? 'pointer' : 'default' }}>
      <div className="splash-mark" style={resume ? { animation: 'none' } : undefined}>
        <Zee size={86} mood={resume ? 'awake' : 'cheer'} />
        <div className="wordmark">
          Starque<span className="zz">ZZ</span>
        </div>
        {!resume && (
          <div className="muted" style={{ fontSize: 15 }}>
            a playful childhood, together
          </div>
        )}
      </div>
    </div>
  )
}
