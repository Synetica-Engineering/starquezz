// Setup wizard — must produce a working app in under 5 minutes, no seed
// scripts (v1 lesson #4). The Starquezz chat is the front door once available;
// this manual path is the always-working fallback and the editors' backbone.
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useFamily } from '../../state/family'
import { SqzIcon, StarToken } from '../../components/icons'
import { HabitIcon } from '../../components/HabitIcon'
import { Zee } from '../../components/Zee'
import { Keypad } from '../../components/ui'
import { AvatarPicker } from '../../components/AvatarPicker'
import { ScoutChat } from './Scout'
import { activeDaysForFrequency } from '../../lib/habits'
import type { HabitCategory, HabitLibraryEntry, LibraryActivity, TimeBlock } from '../../lib/types'
import setupRecommendedHabits from '../../../public/illustrations/setup-recommended-habits.jpg'
import setupScoutConversation from '../../../public/illustrations/setup-scout-conversation.jpg'

interface HabitChoice {
  id: string
  libraryId?: string | null
  name: string
  icon: string
  block: TimeBlock
  core: boolean
  category: HabitCategory
  suggestedFrequency?: string
  durationMin?: number
  source?: 'library' | 'interest'
  interestRank?: number
  why?: string
}

const CORE_CATEGORY_ORDER: HabitCategory[] = ['body', 'space', 'mind', 'heart']
const HABIT_CATEGORIES = new Set<HabitCategory>(['body', 'mind', 'space', 'heart'])
const TIME_BLOCKS = new Set<TimeBlock>(['morning', 'afternoon', 'evening'])
const AGE_7_8_STARTER_PATTERNS = [
  /pick a 10-minute movement/i,
  /brush and floss/i,
  /read book and put it back|put library\/book items back/i,
  /practice piano keys|practice instrument/i,
  /feed pet/i,
  /sweep a small area/i,
]

function frequencyRank(frequency?: string | null): number {
  const f = (frequency ?? '').toLowerCase()
  if (f.includes('if applicable')) return 2
  if (f.includes('daily') || f.includes('school days') || f.includes('school nights')) return 0
  if (f.includes('3x/week')) return 1
  if (f.includes('2x/week')) return 2
  if (f.includes('weekly')) return 3
  return 1
}

function isStarterFriendly(entry: HabitLibraryEntry): boolean {
  const f = (entry.suggested_frequency ?? '').toLowerCase()
  return f.includes('daily') && !f.includes('if applicable') && !f.includes('school')
}

function habitRank(entry: HabitLibraryEntry): number {
  return CORE_CATEGORY_ORDER.indexOf(entry.category) * 10 + frequencyRank(entry.suggested_frequency)
}

function starterNameRank(name: string, age: number): number {
  if (age < 7 || age > 8) return -1
  return AGE_7_8_STARTER_PATTERNS.findIndex((pattern) => pattern.test(name))
}

function starterRank(entry: HabitLibraryEntry, age: number): number {
  return starterNameRank(entry.name, age)
}

function hashString(input: string): number {
  let hash = 2166136261
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i)
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}

function seededScore(seed: string, value: string): number {
  return hashString(`${seed}|${value}`)
}

function interestCount(value: string): number {
  const count = value
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean).length
  return Math.max(0, Math.min(3, count))
}

function normalizeHabitName(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, ' ')
}

function slugifyHabit(name: string): string {
  return normalizeHabitName(name)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 36)
}

function clampDuration(value: unknown): number {
  const n = typeof value === 'number' ? value : Number(value)
  if (!Number.isFinite(n)) return 5
  return Math.max(2, Math.min(15, Math.round(n)))
}

function buildHabitChoices(
  library: HabitLibraryEntry[],
  age: number,
  suggestedCores: number,
  seed: string,
): HabitChoice[] {
  const eligible = library
    .filter((entry) => entry.is_active !== false && age >= entry.age_min && age <= entry.age_max)
    .slice()
    .sort((a, b) => {
      const aStarter = starterRank(a, age)
      const bStarter = starterRank(b, age)
      if (aStarter !== bStarter) {
        if (aStarter === -1) return 1
        if (bStarter === -1) return -1
        return aStarter - bStarter
      }
      const rank = habitRank(a) - habitRank(b)
      if (rank !== 0) return rank
      return (
        (a.duration_min ?? 10) - (b.duration_min ?? 10) ||
        seededScore(seed, a.id) - seededScore(seed, b.id) ||
        a.name.localeCompare(b.name)
      )
    })

  const coreNames = new Set<string>()
  const preferredStarters = eligible
    .map((entry) => ({ entry, rank: starterRank(entry, age) }))
    .filter(({ rank }) => rank >= 0)
    .sort((a, b) => a.rank - b.rank)
      .map(({ entry }) => entry)

  for (const entry of preferredStarters.slice().sort((a, b) => seededScore(seed, a.id) - seededScore(seed, b.id))) {
    if (coreNames.size >= suggestedCores) break
    coreNames.add(entry.name)
  }
  for (const category of CORE_CATEGORY_ORDER.slice().sort((a, b) => seededScore(seed, a) - seededScore(seed, b))) {
    if (coreNames.size >= suggestedCores) break
    const pick = eligible
      .filter((entry) => entry.category === category && isStarterFriendly(entry) && !coreNames.has(entry.name))
      .sort((a, b) => seededScore(seed, a.id) - seededScore(seed, b.id))[0]
    if (pick) coreNames.add(pick.name)
    if (coreNames.size >= suggestedCores) break
  }
  for (const entry of eligible.slice().sort((a, b) => seededScore(seed, a.id) - seededScore(seed, b.id))) {
    if (coreNames.size >= suggestedCores) break
    coreNames.add(entry.name)
  }

  return eligible.map((entry) => ({
    id: entry.id,
    libraryId: entry.id,
    name: entry.name,
    icon: entry.icon,
    block: entry.suggested_block,
    core: coreNames.has(entry.name),
    category: entry.category,
    suggestedFrequency: entry.suggested_frequency,
    durationMin: entry.duration_min,
    source: 'library',
  }))
}

interface InterestHabitDraft {
  name: string
  icon?: string
  category?: string
  time_block?: string
  duration_min?: unknown
  why?: string
}

function buildInterestHabitChoices(
  drafts: InterestHabitDraft[],
  baseChoices: HabitChoice[],
  limit: number,
): HabitChoice[] {
  const byName = new Map(baseChoices.map((choice) => [normalizeHabitName(choice.name), choice]))
  const used = new Set<string>()
  const choices: HabitChoice[] = []

  for (const draft of drafts) {
    if (choices.length >= limit) break
    const name = String(draft.name ?? '').trim().slice(0, 60)
    if (!name) continue
    const key = normalizeHabitName(name)
    if (used.has(key)) continue
    used.add(key)

    const matched = byName.get(key)
    if (matched) {
      choices.push({
        ...matched,
        source: 'interest',
        interestRank: choices.length,
        why: typeof draft.why === 'string' ? draft.why : matched.why,
        core: choices.length === 0,
      })
      continue
    }

    const category = HABIT_CATEGORIES.has(draft.category as HabitCategory)
      ? (draft.category as HabitCategory)
      : 'mind'
    const block = TIME_BLOCKS.has(draft.time_block as TimeBlock)
      ? (draft.time_block as TimeBlock)
      : 'afternoon'
    const icon = typeof draft.icon === 'string' && draft.icon.trim() ? draft.icon.trim().slice(0, 8) : category === 'space' ? '🧱' : '💡'

    choices.push({
      id: `interest-${slugifyHabit(name) || choices.length}`,
      libraryId: null,
      name,
      icon,
      block,
      core: choices.length === 0,
      category,
      suggestedFrequency: 'Daily',
      durationMin: clampDuration(draft.duration_min),
      source: 'interest',
      interestRank: choices.length,
      why: typeof draft.why === 'string' ? draft.why : undefined,
    })
  }

  return choices
}

async function withTimeout<T>(work: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    work,
    new Promise<T>((_, reject) => {
      window.setTimeout(() => reject(new Error('interest_habits_timeout')), ms)
    }),
  ])
}

const ADVENTURE_TIER_COST: Record<number, number> = { 0: 0, 1: 20, 2: 40, 3: 80 }

function buildAdventureChoices(library: LibraryActivity[], age: number): LibraryActivity[] {
  return library
    .filter((entry) => entry.is_active !== false && age >= entry.age_min && age <= entry.age_max)
    .slice()
    .sort((a, b) => {
      const tier = a.suggested_tier - b.suggested_tier
      if (tier !== 0) return tier
      return a.duration_min - b.duration_min || a.name.localeCompare(b.name)
    })
}

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
  const [libraryPickSeed, setLibraryPickSeed] = useState(() => String(Date.now()))
  const age = thisYear - birthYear

  const suggestedCores = age <= 5 ? 2 : age <= 8 ? 5 : 4
  const baseHabitChoices = useMemo(
    () => buildHabitChoices(fam.habitLibrary, age, suggestedCores, libraryPickSeed),
    [age, fam.habitLibrary, libraryPickSeed, suggestedCores],
  )
  const [interestHabitChoices, setInterestHabitChoices] = useState<HabitChoice[]>([])
  const interestHabitKey = useRef('')
  const [interestHabitLoading, setInterestHabitLoading] = useState(false)
  const [interestHabitError, setInterestHabitError] = useState<string | null>(null)
  const [interestHabitRun, setInterestHabitRun] = useState(0)
  const habitChoices = useMemo(() => {
    const interestNames = new Set(interestHabitChoices.map((h) => normalizeHabitName(h.name)))
    return [
      ...interestHabitChoices,
      ...baseHabitChoices.filter((h) => !interestNames.has(normalizeHabitName(h.name))),
    ]
  }, [baseHabitChoices, interestHabitChoices])
  const habitChoiceKey = useMemo(() => habitChoices.map((h) => h.id).join('|'), [habitChoices])
  const defaultHabitNames = useMemo(() => {
    const names = new Set<string>()
    if (interestHabitChoices[0]) names.add(interestHabitChoices[0].name)
    baseHabitChoices.filter((h) => h.core).forEach((h) => names.add(h.name))
    const starterNames = baseHabitChoices
      .map((h) => ({ h, rank: starterNameRank(h.name, age) }))
      .filter(({ rank }) => rank >= 0)
      .sort((a, b) => a.rank - b.rank)
      .map(({ h }) => h.name)
    starterNames.forEach((starter) => names.add(starter))
    return names
  }, [age, baseHabitChoices, interestHabitChoices])
  const [pickedHabits, setPickedHabits] = useState<Set<string>>(() => new Set())
  const [pickedHabitOrder, setPickedHabitOrder] = useState<string[]>([])
  const orderedHabitChoices = useMemo(() => {
    const order = new Map(pickedHabitOrder.map((name, index) => [name, index]))
    return habitChoices.slice().sort((a, b) => {
      const aPicked = pickedHabits.has(a.name)
      const bPicked = pickedHabits.has(b.name)
      if (aPicked !== bPicked) return aPicked ? -1 : 1
      if (aPicked && bPicked) return (order.get(a.name) ?? 999) - (order.get(b.name) ?? 999)
      const aInterest = a.source === 'interest'
      const bInterest = b.source === 'interest'
      if (aInterest !== bInterest) return aInterest ? -1 : 1
      if (aInterest && bInterest) return (a.interestRank ?? 99) - (b.interestRank ?? 99)
      return 0
    })
  }, [habitChoices, pickedHabitOrder, pickedHabits])
  const habitRowRefs = useRef(new Map<string, HTMLButtonElement>())
  const habitRowTops = useRef(new Map<string, number>())
  const adventureChoices = useMemo(
    () => buildAdventureChoices(fam.activityLibrary, age),
    [age, fam.activityLibrary],
  )
  const adventureChoiceKey = useMemo(() => adventureChoices.map((a) => a.id).join('|'), [adventureChoices])
  const needAdventures = firstChild && fam.adventures.length === 0
  const [pickedAdvs, setPickedAdvs] = useState<Set<string>>(() => new Set())
  const needPin = !fam.parent?.parent_pin_hash
  const [pin, setPin] = useState('')
  const [pinConfirm, setPinConfirm] = useState('')
  const [pinStage, setPinStage] = useState<'enter' | 'confirm'>('enter')
  const [pinShake, setPinShake] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [childId, setChildId] = useState<string | null>(null)

  const coreCount = habitChoices.filter((h) => h.core && pickedHabits.has(h.name)).length
  useEffect(() => {
    const defaults = Array.from(defaultHabitNames)
    setPickedHabits(new Set(defaults))
    setPickedHabitOrder(defaults)
  }, [habitChoiceKey, defaultHabitNames])

  useEffect(() => {
    const trimmedInterests = interests.trim()
    const desiredInterestCount = interestCount(trimmedInterests)
    const nextKey = `${age}|${trimmedInterests.toLowerCase()}`
    if (step !== 'habits') return
    if (!trimmedInterests || desiredInterestCount === 0) {
      setInterestHabitChoices([])
      interestHabitKey.current = ''
      setInterestHabitError(null)
      setInterestHabitLoading(false)
      return
    }
    if (interestHabitKey.current === nextKey) return

    let cancelled = false
    interestHabitKey.current = nextKey
    setInterestHabitError(null)
    setInterestHabitLoading(true)
    void (async () => {
      try {
        const { data, error } = await withTimeout(
          supabase.functions.invoke('scout', {
            body: {
              kind: 'interest_habits',
              profile: {
                name: name.trim(),
                age,
                interests: trimmedInterests,
              },
              count: desiredInterestCount,
            },
          }),
          20000,
        )
        const raw = Array.isArray(data?.habits) && !error ? data.habits : []
        if (!cancelled) {
          const choices = buildInterestHabitChoices(raw, baseHabitChoices, desiredInterestCount)
          setInterestHabitChoices(choices)
          setInterestHabitError(choices.length === 0 ? 'Starquezz could not add interest ideas right now.' : null)
        }
      } catch {
        if (!cancelled) {
          setInterestHabitChoices([])
          setInterestHabitError('Starquezz could not add interest ideas right now.')
        }
      } finally {
        if (!cancelled) setInterestHabitLoading(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [age, baseHabitChoices, interests, interestHabitRun, name, step])

  useLayoutEffect(() => {
    const next = new Map<string, number>()
    habitRowRefs.current.forEach((el, name) => {
      const top = el.getBoundingClientRect().top
      const previousTop = habitRowTops.current.get(name)
      const delta = previousTop == null ? 0 : previousTop - top
      if (Math.abs(delta) > 1) {
        el.animate(
          [
            { transform: `translateY(${delta}px)`, opacity: 0.86 },
            { transform: 'translateY(0)', opacity: 1 },
          ],
          { duration: 260, easing: 'cubic-bezier(.2,.8,.2,1)' },
        )
      }
      next.set(name, top)
    })
    habitRowTops.current = next
  }, [orderedHabitChoices])

  const toggleHabitChoice = (habit: HabitChoice) => {
    setPickedHabits((prev) => {
      const next = new Set(prev)
      if (next.has(habit.name)) next.delete(habit.name)
      else next.add(habit.name)
      return next
    })
    setPickedHabitOrder((prev) =>
      pickedHabits.has(habit.name)
        ? prev.filter((name) => name !== habit.name)
        : [habit.name, ...prev.filter((name) => name !== habit.name)],
    )
  }

  const openManualHabits = () => {
    if (interests.trim()) {
      interestHabitKey.current = ''
      setInterestHabitChoices([])
      setInterestHabitError(null)
      setInterestHabitLoading(true)
      setLibraryPickSeed(`${Date.now()}|${Math.random()}`)
      setInterestHabitRun((run) => run + 1)
    } else {
      setLibraryPickSeed(`${Date.now()}|${Math.random()}`)
    }
    setStep('habits')
  }

  useEffect(() => {
    const defaults = [
      ...adventureChoices.filter((a) => a.suggested_tier === 0),
      ...adventureChoices.filter((a) => a.suggested_tier === 1).slice(0, 5),
      ...adventureChoices.filter((a) => a.suggested_tier === 2).slice(0, 3),
      ...adventureChoices.filter((a) => a.suggested_tier === 3).slice(0, 2),
    ].map((a) => a.id)
    setPickedAdvs(new Set(defaults))
  }, [adventureChoiceKey, adventureChoices])

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
          active_days: activeDaysForFrequency(h.suggestedFrequency),
          library_id: h.libraryId ?? null,
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
      const rows = adventureChoices.filter((a) => pickedAdvs.has(a.id)).map((a) => ({
        parent_id: fam.parent!.id,
        name: a.name,
        illustration: a.illustration,
        cost: ADVENTURE_TIER_COST[a.suggested_tier] ?? 20,
        tier: a.suggested_tier,
        library_id: a.id,
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

  const addAnotherKid = async () => {
    setBusy(true)
    setError(null)
    try {
      await fam.refresh()
      setStep('child')
      setName('')
      setBirthYear(thisYear - 7)
      setInterests('')
      setAvatar('cat')
      setPhoto(null)
      setLibraryPickSeed(`${Date.now()}|${Math.random()}`)
      setInterestHabitChoices([])
      interestHabitKey.current = ''
      setInterestHabitLoading(false)
      setInterestHabitError(null)
      setPickedHabits(new Set())
      setPickedHabitOrder([])
      setPickedAdvs(new Set())
      setPin('')
      setPinConfirm('')
      setPinStage('enter')
      setPinShake(false)
      setChildId(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not start another setup.')
    } finally {
      setBusy(false)
    }
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
          Hand over the device now, or set up another kid while you’re already in parent mode.
        </p>
        <button className="btn full" disabled={busy} onClick={finish}>
          Hand over to {name || 'your kid'} ✦
        </button>
        <button className="btn ghost full" disabled={busy} onClick={() => void addAnotherKid()}>
          Add another kid
        </button>
        {error && <div className="form-error">{error}</div>}
        {busy && <div className="muted">getting ready…</div>}
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
        onManual={openManualHabits}
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
            <span className="pt grow">Build your kid’s routine</span>
          </div>
          <div className="col gap12">
            <button className="pcard setup-choice" onClick={openManualHabits}>
              <span className="setup-choice-art-wrap">
                <img
                  className="setup-choice-art"
                  src={setupRecommendedHabits}
                  alt=""
                  aria-hidden
                />
                <span className="setup-choice-badge research">Based on research</span>
              </span>
              <span className="setup-choice-copy col gap6">
                <span className="dname" style={{ fontSize: 17 }}>
                  I’ll choose from recommended habits
                </span>
                <span className="muted" style={{ fontSize: 13.5, lineHeight: 1.45 }}>
                  Start with age-fit suggestions and tune the list by hand.
                </span>
              </span>
            </button>
            <button className="pcard setup-choice" onClick={() => setStep('scout')}>
              <span className="setup-choice-art-wrap">
                <img
                  className="setup-choice-art"
                  src={setupScoutConversation}
                  alt=""
                  aria-hidden
                />
                <span className="setup-choice-badge ai">AI suggestion</span>
              </span>
              <span className="setup-choice-copy col gap6">
                <span className="dname" style={{ fontSize: 17 }}>
                  Build custom in conversation mode
                </span>
                <span className="muted" style={{ fontSize: 13.5, lineHeight: 1.45 }}>
                  Talk with Starquezz and shape a routine around your kid.
                </span>
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
              At {age}, start with about <b>{suggestedCores} core habits</b> — small enough to win
              every day. You can turn any habit on or off here.
            </span>
          </div>
          <div className="col gap10">
            {habitChoices.length === 0 && (
              <div className="pcard muted" style={{ fontSize: 13.5, lineHeight: 1.45 }}>
                Loading age-fit habits from the library…
              </div>
            )}
            {interestHabitLoading && (
              <div className="pcard ai-working" role="status" aria-live="polite">
                <span className="ai-working-mark" aria-hidden="true">
                  <span></span>
                  <span></span>
                  <span></span>
                </span>
                <span className="col gap2">
                  <span className="ai-working-title">Starquezz is thinking</span>
                  <span className="ai-working-copy">Building kid-fit ideas from {interests.trim()}…</span>
                </span>
              </div>
            )}
            {!interestHabitLoading && interestHabitError && interests.trim() && (
              <div className="pcard muted" style={{ fontSize: 13.5, lineHeight: 1.45 }}>
                {interestHabitError}{' '}
                <button
                  className="chip skip"
                  onClick={() => {
                    interestHabitKey.current = ''
                    setInterestHabitError(null)
                    setInterestHabitLoading(true)
                    setInterestHabitRun((run) => run + 1)
                  }}
                >
                  Try again
                </button>
              </div>
            )}
            {orderedHabitChoices.map((h) => {
              const on = pickedHabits.has(h.name)
              return (
                <button
                  key={h.name}
                  ref={(el) => {
                    if (el) habitRowRefs.current.set(h.name, el)
                    else habitRowRefs.current.delete(h.name)
                  }}
                  className="plist-row"
                  style={{ border: 'none', cursor: 'pointer', textAlign: 'left', opacity: on ? 1 : 0.55, willChange: 'transform' }}
                  onClick={() => toggleHabitChoice(h)}
                >
                  <span className="pr-icon">
                    <HabitIcon icon={h.icon} size={22} />
                  </span>
                  <span className="col grow">
                    <span className="pr-name">{h.name}</span>
                    <span className="pr-sub">
                      {h.suggestedFrequency ?? 'daily'} · {h.durationMin ?? 10} min ·{' '}
                      {h.source === 'interest' ? 'from interests · ' : ''}
                      {h.core ? 'core set · +1 ✦' : 'bonus · +1 ✦'}
                    </span>
                  </span>
                  <span className={'toggle' + (on ? ' on' : '')} aria-hidden />
                </button>
              )
            })}
          </div>
          {error && <div className="form-error">{error}</div>}
          <div style={{ marginTop: 'auto', paddingTop: 16 }}>
            <button className="btn full" disabled={busy || habitChoices.length === 0 || coreCount === 0} onClick={saveHabits}>
              {busy
                ? 'saving…'
                : habitChoices.length === 0
                  ? 'Loading habits…'
                  : coreCount === 0
                    ? 'Pick at least one core habit'
                    : 'Looks right →'}
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
            {adventureChoices.length === 0 && (
              <div className="pcard muted" style={{ fontSize: 13.5, lineHeight: 1.45 }}>
                Loading age-fit adventures from the library…
              </div>
            )}
            {adventureChoices.map((a) => {
              const on = pickedAdvs.has(a.id)
              const isFallback = a.suggested_tier === 0
              return (
                <button
                  key={a.id}
                  className="plist-row"
                  style={{ border: 'none', cursor: isFallback ? 'default' : 'pointer', textAlign: 'left', opacity: on ? 1 : 0.55 }}
                  onClick={() => {
                    if (isFallback) return // the fallback is non-negotiable
                    setPickedAdvs((prev) => {
                      const next = new Set(prev)
                      if (next.has(a.id)) next.delete(a.id)
                      else next.add(a.id)
                      return next
                    })
                  }}
                >
                  <span className="pr-icon">
                    <SqzIcon name={a.illustration} size={20} />
                  </span>
                  <span className="col grow">
                    <span className="pr-name">{a.name}</span>
                    <span className="pr-sub">
                      {isFallback
                        ? 'always free · the guaranteed outing'
                        : `${a.duration_min} min · ${a.energy} · ${a.cost} · tier ${a.suggested_tier}`}
                    </span>
                  </span>
                  <span className="pill" style={{ fontSize: 13, padding: '4px 10px' }}>
                    <StarToken size={12} /> {ADVENTURE_TIER_COST[a.suggested_tier] ?? 20}
                  </span>
                </button>
              )
            })}
          </div>
          {error && <div className="form-error">{error}</div>}
          <div style={{ marginTop: 'auto', paddingTop: 16 }}>
            <button className="btn full" disabled={busy || adventureChoices.length === 0 || pickedAdvs.size === 0} onClick={saveAdventures}>
              {busy
                ? 'saving…'
                : adventureChoices.length === 0
                  ? 'Loading adventures…'
                  : pickedAdvs.size === 0
                    ? 'Pick at least one adventure'
                    : 'Menu’s set →'}
            </button>
          </div>
        </>
      )}
    </div>
  )
}
