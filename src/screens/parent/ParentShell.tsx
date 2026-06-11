// Parent world: calm, dense, fast. Gated behind the parent PIN —
// tamper-evident, not tamper-proof: the real defense is visibility.
import { useState } from 'react'
import { useFamily } from '../../state/family'
import { Keypad } from '../../components/ui'
import { SqzIcon } from '../../components/icons'
import { Digest } from './Digest'
import { HabitEditor } from './HabitEditor'
import { AdventureEditor } from './AdventureEditor'
import { DreamEditor } from './DreamEditor'
import { Settings } from './Settings'
import { ScoutRerun } from './ScoutRerun'

export type PScreen = 'digest' | 'habits' | 'adventures' | 'dream' | 'scout' | 'settings'

export function ParentShell({ onExit, onAddChild }: { onExit: () => void; onAddChild: () => void }) {
  const [unlocked, setUnlocked] = useState(false)
  const [screen, setScreen] = useState<PScreen>('digest')

  if (!unlocked) {
    return <PinGate onUnlock={() => setUnlocked(true)} onBack={onExit} />
  }

  const nav = (id: PScreen, label: string, icon: string) => (
    <button className={'navitem' + (screen === id ? ' active' : '')} onClick={() => setScreen(id)} aria-label={label}>
      <span className="ni">
        <SqzIcon name={icon} size={20} />
      </span>
      {label}
    </button>
  )

  return (
    <>
      <div key={screen} style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
        {screen === 'digest' && <Digest onExit={onExit} />}
        {screen === 'habits' && <HabitEditor />}
        {screen === 'adventures' && <AdventureEditor />}
        {screen === 'dream' && <DreamEditor />}
        {screen === 'scout' && <ScoutRerun />}
        {screen === 'settings' && <Settings onAddChild={onAddChild} />}
      </div>
      <div className="bottomnav">
        {nav('digest', 'Week', 'calendar')}
        {nav('habits', 'Habits', 'check')}
        {nav('adventures', 'Adventures', 'tent')}
        {nav('dream', 'Dream', 'sparkle')}
        {nav('settings', 'More', 'gear')}
      </div>
    </>
  )
}

function PinGate({ onUnlock, onBack }: { onUnlock: () => void; onBack: () => void }) {
  const fam = useFamily()
  const [pin, setPin] = useState('')
  const [shake, setShake] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const noPin = !fam.parent?.parent_pin_hash
  const [setupPin, setSetupPin] = useState('')
  const [setupStage, setSetupStage] = useState<'enter' | 'confirm'>('enter')
  const [setupFirst, setSetupFirst] = useState('')

  // a family that skipped PIN setup sets one here, on first entry
  if (noPin) {
    const stageVal = setupStage === 'enter' ? setupFirst : setupPin
    const onChange = (v: string) => {
      setMessage(null)
      if (setupStage === 'enter') {
        setSetupFirst(v)
        if (v.length === 4) setTimeout(() => setSetupStage('confirm'), 200)
      } else {
        setSetupPin(v)
        if (v.length === 4) {
          if (v === setupFirst) {
            void fam.setParentPin(v).then(onUnlock)
          } else {
            setShake(true)
            setTimeout(() => {
              setShake(false)
              setSetupFirst('')
              setSetupPin('')
              setSetupStage('enter')
              setMessage('They didn’t match — start over.')
            }, 450)
          }
        }
      }
    }
    return (
      <div className="view" style={{ alignItems: 'center', gap: 18, paddingTop: 36 }}>
        <div className="eyebrow">Grown-ups only</div>
        <div className="dname" style={{ fontSize: 20 }}>
          {setupStage === 'enter' ? 'Set your parent PIN' : 'Once more to confirm'}
        </div>
        <Keypad value={stageVal} onChange={onChange} shake={shake} />
        {message && <div className="muted">{message}</div>}
        <button className="chip skip" onClick={onBack}>
          ← back to the stars
        </button>
      </div>
    )
  }

  const tryPin = async (v: string) => {
    setPin(v)
    setMessage(null)
    if (v.length === 4) {
      const res = await fam.verifyParentPin(v)
      if (res.ok) {
        onUnlock()
      } else {
        setShake(true)
        setTimeout(() => {
          setShake(false)
          setPin('')
        }, 450)
        if (res.reason === 'cooldown') {
          setMessage(`Hold on ${res.retry_in}s — too many tries.`)
        } else {
          setMessage('Not it — try again.')
        }
      }
    }
  }

  return (
    <div className="view" style={{ alignItems: 'center', gap: 18, paddingTop: 36 }}>
      <div className="eyebrow">Grown-ups only</div>
      <div className="dname" style={{ fontSize: 20 }}>
        Parent PIN
      </div>
      <Keypad value={pin} onChange={(v) => void tryPin(v)} shake={shake} />
      {message && <div className="muted">{message}</div>}
      <button className="chip skip" onClick={onBack}>
        ← back to the stars
      </button>
    </div>
  )
}
