// Setup wizard — must produce a working app in under 5 minutes, no seed
// scripts (v1 lesson #4). The Scout (chat) is the front door once available;
// this manual path is the always-working fallback and the editors' backbone.
import { useMemo, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useFamily } from '../../state/family'
import { SqzIcon, StarToken } from '../../components/icons'
import { Zee } from '../../components/Zee'
import { Keypad } from '../../components/ui'
import { AvatarPicker } from '../../components/AvatarPicker'
import { ScoutChat } from './Scout'
import type { TimeBlock } from '../../lib/types'

interface HabitSeed {
  name: string
  icon: string
  block: TimeBlock
  core: boolean
  category: 'body' | 'mind' | 'space' | 'heart'
  minAge?: number
}

const HABIT_SEEDS: HabitSeed[] = [
  { name: 'Brush teeth', icon: 'tooth', block: 'morning', core: true, category: 'body' },
  { name: 'Get dressed by myself', icon: 'shirt', block: 'morning', core: true, category: 'body' },
  { name: 'Eat breakfast', icon: 'bowl', block: 'morning', core: true, category: 'body' },
  { name: 'Pack the school bag', icon: 'backpack', block: 'evening', core: true, category: 'space', minAge: 7 },
  { name: 'Tidy the toys', icon: 'blocks', block: 'evening', core: false, category: 'space' },
  { name: 'Reading time', icon: 'book', block: 'evening', core: false, category: 'mind' },
  { name: 'Gratitude moment', icon: 'sparkle-heart', block: 'evening', core: false, category: 'heart' },
]

interface AdvSeed {
  name: string
  icon: string
  cost: number
  tier: number
}

const ADV_SEEDS: AdvSeed[] = [
  { name: 'Playground Expedition', icon: 'swing', cost: 20, tier: 1 },
  { name: 'Library Run', icon: 'library', cost: 20, tier: 1 },
  { name: 'Bike Ride Together', icon: 'bike', cost: 20, tier: 1 },
  { name: 'Bookshop Trip', icon: 'bookshop', cost: 40, tier: 2 },
  { name: 'Swimming Trip', icon: 'swim', cost: 40, tier: 2 },
  { name: 'Kid Picks Friday Dinner', icon: 'noodles', cost: 40, tier: 2 },
  { name: 'Treasure Hunt Dad Designs', icon: 'scroll', cost: 80, tier: 3 },
  { name: 'Day Trip Adventure', icon: 'train', cost: 80, tier: 3 },
  { name: 'Museum + Lunch Out', icon: 'museum', cost: 80, tier: 3 },
  { name: 'Pancake Morning', icon: 'pancake', cost: 0, tier: 0 },
]

type Step = 'child' | 'path' | 'scout' | 'habits' | 'adventures' | 'pin' | 'handoff'

export function Wizard({ onDone, firstChild }: { onDone: () => void; firstChild: boolean }) {
  const fam = useFamily()
  const thisYear = new Date().getFullYear()

  const [step, setStep] = useState<Step>('child')
  const [name, setName] = useState('')
  const [birthYear, setBirthYear] = useState(thisYear - 7)
  const [interests, setInterests] = useState('')
  const [avatar, setAvatar] = useState('cat')
  const [photo, setPhoto] = useState<string | null>(null)
  const age = thisYear - birthYear

  const habitChoices = useMemo(() => HABIT_SEEDS.filter((h) => age >= (h.minAge ?? 0)), [age])
  const [pickedHabits, setPickedHabits] = useState<Set<string>>(
    () => new Set(HABIT_SEEDS.filter((h) => h.core || h.name === 'Reading time').map((h) => h.name)),
  )
  const needAdventures = firstChild && fam.adventures.length === 0
  const [pickedAdvs, setPickedAdvs] = useState<Set<string>>(() => new Set(ADV_SEEDS.map((a) => a.name)))
  const needPin = !fam.parent?.parent_pin_hash
  const [pin, setPin] = useState('')
  const [pinConfirm, setPinConfirm] = useState('')
  const [pinStage, setPinStage] = useState<'enter' | 'confirm'>('enter')
  const [pinShake, setPinShake] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [childId, setChildId] = useState<string | null>(null)

  const coreCount = habitChoices.filter((h) => h.core && pickedHabits.has(h.name)).length
  const suggestedCores = age <= 5 ? 2 : age <= 7 ? 3 : 4

  const createChild = async (): Promise<string> => {
    if (childId) return childId
    const { data, error } = await supabase
      .from('children')
      .insert({
        parent_id: fam.parent!.id,
        name: name.trim(),
        avatar,
        photo,
        birth_year: birthYear,
        interests: interests
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
      })
      .select()
      .single()
    if (error) throw new Error(error.message)
    setChildId(data.id)
    return data.id
  }

  const saveHabits = async () => {
    setBusy(true)
    setError(null)
    try {
      const cid = await createChild()
      const rows = habitChoices
        .filter((h) => pickedHabits.has(h.name))
        .map((h, i) => ({
          child_id: cid,
          name: h.name,
          icon: h.icon,
          category: h.category,
          time_block: h.block,
          is_core: h.core,
          sort_order: i,
          library_id: fam.habitLibrary.find((l) => l.name === h.name)?.id ?? null,
        }))
      const { error } = await supabase.from('habits').insert(rows)
      if (error) throw new Error(error.message)
      setStep(needAdventures ? 'adventures' : needPin ? 'pin' : 'handoff')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save — try again.')
    } finally {
      setBusy(false)
    }
  }

  const saveAdventures = async () => {
    setBusy(true)
    setError(null)
    try {
      const rows = ADV_SEEDS.filter((a) => pickedAdvs.has(a.name)).map((a) => ({
        parent_id: fam.parent!.id,
        name: a.name,
        illustration: a.icon,
        cost: a.cost,
        tier: a.tier,
        library_id: fam.activityLibrary.find((l) => l.name === a.name)?.id ?? null,
      }))
      const { error } = await supabase.from('adventures').insert(rows)
      if (error) throw new Error(error.message)
      setStep(needPin ? 'pin' : 'handoff')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save — try again.')
    } finally {
      setBusy(false)
    }
  }

  const savePin = async (candidate: string) => {
    // tamper-evident guard: reject the kid's birth year as a PIN
    if (candidate === String(birthYear)) {
      setError('Not the kid’s birth year — they’ll guess that one.')
      setPin('')
      setPinConfirm('')
      setPinStage('enter')
      return
    }
    setBusy(true)
    setError(null)
    try {
      await fam.setParentPin(candidate)
      setStep('handoff')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not set the PIN — try again.')
    } finally {
      setBusy(false)
    }
  }

  const finish = async () => {
    await fam.refresh()
    onDone()
  }

  // pin keypad flow
  if (step === 'pin') {
    const stagePin = pinStage === 'enter' ? pin : pinConfirm
    const setStagePin = (v: string) => {
      setError(null)
      if (pinStage === 'enter') {
        setPin(v)
        if (v.length === 4) setTimeout(() => setPinStage('confirm'), 250)
      } else {
        setPinConfirm(v)
        if (v.length === 4) {
          if (v === pin) {
            void savePin(v)
          } else {
            setPinShake(true)
            setTimeout(() => {
              setPinShake(false)
              setPin('')
              setPinConfirm('')
              setPinStage('enter')
            }, 500)
          }
        }
      }
    }
    return (
      <div className="view scroll" style={{ alignItems: 'center', gap: 18, paddingTop: 22 }}>
        <div className="wiz-step">Grown-ups’ key</div>
        <div className="dname" style={{ fontSize: 21 }}>
          {pinStage === 'enter' ? 'Set your parent PIN' : 'Type it once more'}
        </div>
        <p className="muted tac" style={{ fontSize: 13.5, maxWidth: 250, margin: 0, lineHeight: 1.5 }}>
          A light lock on the grown-up door. Edits leave footprints in your weekly digest either way.
        </p>
        <Keypad value={stagePin} onChange={setStagePin} shake={pinShake} />
        {error && <div className="form-error">{error}</div>}
        {busy && <div className="muted">saving…</div>}
      </div>
    )
  }

  if (step === 'handoff') {
    return (
      <div className="view full" style={{ gap: 22, padding: 30, textAlign: 'center' }}>
        <Zee size={92} mood="cheer" />
        <div className="dname" style={{ fontSize: 26, justifyContent: 'center' }}>
          {name ? `${name}’s board is ready` : 'The board is ready'}
        </div>
        <p className="muted" style={{ fontSize: 15, lineHeight: 1.55, maxWidth: 270, margin: 0 }}>
          This is where you step back. Hand over the device — the routine is{' '}
          <b style={{ color: 'var(--gold)' }}>{name || 'theirs'}</b> now. You’ll get the whole week in one
          glance, every Sunday.
        </p>
        <button className="btn full" onClick={finish}>
          Give it to {name || 'your kid'} ✦
        </button>
      </div>
    )
  }

  if (step === 'scout') {
    return (
      <ScoutChat
        childName={name}
        age={age}
        interests={interests}
        onAccepted={async (habitRows, advRows) => {
          setBusy(true)
          try {
            const cid = await createChild()
            if (habitRows.length > 0) {
              const { error } = await supabase.from('habits').insert(
                habitRows.map((h, i) => ({ ...h, child_id: cid, sort_order: i })),
              )
              if (error) throw new Error(error.message)
            }
            if (advRows.length > 0 && needAdventures) {
              const { error } = await supabase
                .from('adventures')
                .insert(advRows.map((a) => ({ ...a, parent_id: fam.parent!.id })))
              if (error) throw new Error(error.message)
            }
            setStep(needPin ? 'pin' : 'handoff')
          } catch (e) {
            setError(e instanceof Error ? e.message : 'Could not save')
          } finally {
            setBusy(false)
          }
        }}
        onManual={() => setStep('habits')}
      />
    )
  }

  return (
    <div className="view scroll" style={{ gap: 14 }}>
      {step === 'child' && (
        <>
          <div className="parent-head">
            <Zee size={38} mood="awake" />
            <span className="pt grow">{firstChild ? 'Meet your kid' : 'Add another kid'}</span>
          </div>
          <div className="col gap12">
            <div>
              <label className="field-label" htmlFor="kidname">
                Name <span style={{ color: 'var(--pink)' }}>*</span>
              </label>
              <input
                id="kidname"
                className="input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="their name"
                maxLength={24}
              />
            </div>
            <div>
              <label className="field-label" htmlFor="birthyear">
                Born in
              </label>
              <select
                id="birthyear"
                className="input"
                value={birthYear}
                onChange={(e) => setBirthYear(Number(e.target.value))}
              >
                {Array.from({ length: 10 }, (_, i) => thisYear - 3 - i).map((y) => (
                  <option key={y} value={y}>
                    {y} — turns {thisYear - y} this year
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="field-label" htmlFor="interests">
                Into right now <span style={{ textTransform: 'none', fontWeight: 600 }}>(comma separated)</span>
              </label>
              <input
                id="interests"
                className="input"
                value={interests}
                onChange={(e) => setInterests(e.target.value)}
                placeholder="dinosaurs, piano, counting things"
              />
            </div>
            <div>
              <span className="field-label">Pick a face</span>
              <AvatarPicker avatar={avatar} photo={photo} onAvatar={setAvatar} onPhoto={setPhoto} />
            </div>
          </div>
          <div style={{ marginTop: 'auto', paddingTop: 16 }}>
            {!name.trim() && (
              <div className="muted tac" style={{ fontSize: 13, marginBottom: 10 }}>
                Add <b style={{ color: 'var(--pink)' }}>their name</b> to continue
              </div>
            )}
            <button className="btn full" disabled={!name.trim()} onClick={() => setStep('path')}>
              Next →
            </button>
          </div>
        </>
      )}

      {step === 'path' && (
        <>
          <div className="parent-head">
            <Zee size={38} mood="awake" />
            <span className="pt grow">Build {name}’s routine</span>
          </div>
          <div className="col gap12">
            <button className="pcard col gap6" style={{ border: 'none', cursor: 'pointer', textAlign: 'left' }} onClick={() => setStep('scout')}>
              <span className="dname" style={{ fontSize: 18 }}>
                <SqzIcon name="sparkle" size={19} color="#FFE49C" /> Talk it through with the Scout
              </span>
              <span className="muted" style={{ fontSize: 13.5, lineHeight: 1.5 }}>
                Describe {name} in a few sentences — get a habit set and adventure menu tailored to{' '}
                {age <= 6 ? 'a five-ish-year-old' : `an ${age}-year-old`}, grounded in what research says matters.
              </span>
            </button>
            <button className="pcard col gap6" style={{ border: 'none', cursor: 'pointer', textAlign: 'left' }} onClick={() => setStep('habits')}>
              <span className="dname" style={{ fontSize: 18 }}>
                <SqzIcon name="edit" size={18} color="#9FECFF" /> Skip — I’ll pick myself
              </span>
              <span className="muted" style={{ fontSize: 13.5, lineHeight: 1.5 }}>
                Start from a sensible starter set and tweak everything by hand. Two minutes.
              </span>
            </button>
          </div>
        </>
      )}

      {step === 'habits' && (
        <>
          <div className="parent-head">
            <span className="pt grow">{name}’s starting habits</span>
            <span className="wiz-step">2 of {needAdventures ? 4 : 3}</span>
          </div>
          <div className="nudge-card">
            <SqzIcon name="bulb" size={18} />
            <span>
              At {age}, around <b>{suggestedCores} core habits</b> is the sweet spot — small enough to win
              every day. Bonus habits unlock after the cores.
            </span>
          </div>
          <div className="col gap10">
            {habitChoices.map((h) => {
              const on = pickedHabits.has(h.name)
              return (
                <button
                  key={h.name}
                  className="plist-row"
                  style={{ border: 'none', cursor: 'pointer', textAlign: 'left', opacity: on ? 1 : 0.55 }}
                  onClick={() =>
                    setPickedHabits((prev) => {
                      const next = new Set(prev)
                      if (next.has(h.name)) next.delete(h.name)
                      else next.add(h.name)
                      return next
                    })
                  }
                >
                  <span className="pr-icon">
                    <SqzIcon name={h.icon} size={20} />
                  </span>
                  <span className="col grow">
                    <span className="pr-name">{h.name}</span>
                    <span className="pr-sub">
                      {h.block} · {h.core ? 'core · +1 ✦' : 'bonus · +2 ✦'}
                    </span>
                  </span>
                  <span className={'toggle' + (on ? ' on' : '')} aria-hidden />
                </button>
              )
            })}
          </div>
          {error && <div className="form-error">{error}</div>}
          <div style={{ marginTop: 'auto', paddingTop: 16 }}>
            <button className="btn full" disabled={busy || coreCount === 0} onClick={saveHabits}>
              {busy ? 'saving…' : coreCount === 0 ? 'Pick at least one core habit' : 'Looks right →'}
            </button>
          </div>
        </>
      )}

      {step === 'adventures' && (
        <>
          <div className="parent-head">
            <span className="pt grow">The adventure menu</span>
            <span className="wiz-step">3 of 4</span>
          </div>
          <div className="nudge-card">
            <SqzIcon name="tent" size={18} />
            <span>
              Stars pick <b>which</b> adventure — never <b>whether</b>. The free pick guarantees a weekly
              outing even after a rough week. You can edit everything later.
            </span>
          </div>
          <div className="col gap10">
            {ADV_SEEDS.map((a) => {
              const on = pickedAdvs.has(a.name)
              const isFallback = a.tier === 0
              return (
                <button
                  key={a.name}
                  className="plist-row"
                  style={{ border: 'none', cursor: isFallback ? 'default' : 'pointer', textAlign: 'left', opacity: on ? 1 : 0.55 }}
                  onClick={() => {
                    if (isFallback) return // the fallback is non-negotiable
                    setPickedAdvs((prev) => {
                      const next = new Set(prev)
                      if (next.has(a.name)) next.delete(a.name)
                      else next.add(a.name)
                      return next
                    })
                  }}
                >
                  <span className="pr-icon">
                    <SqzIcon name={a.icon} size={20} />
                  </span>
                  <span className="col grow">
                    <span className="pr-name">{a.name}</span>
                    <span className="pr-sub">
                      {isFallback ? 'always free · the guaranteed outing' : `tier ${a.tier}`}
                    </span>
                  </span>
                  <span className="pill" style={{ fontSize: 13, padding: '4px 10px' }}>
                    <StarToken size={12} /> {a.cost}
                  </span>
                </button>
              )
            })}
          </div>
          {error && <div className="form-error">{error}</div>}
          <div style={{ marginTop: 'auto', paddingTop: 16 }}>
            <button className="btn full" disabled={busy} onClick={saveAdventures}>
              {busy ? 'saving…' : 'Menu’s set →'}
            </button>
          </div>
        </>
      )}
    </div>
  )
}
