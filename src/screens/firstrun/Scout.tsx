// The Scout — conversational setup (AGENT_BRIEF §5a).
// Parent-side only. The LLM proposes; deterministic code disposes: drafts are
// schema-shaped rows rendered as accept/edit/skip cards, and only accepted
// rows are written. Stars/streaks are never computed here.
// When the LLM proxy is unreachable (no key, offline, rate-limited) the Scout
// falls back to library-grounded rule-based proposals — the no-LLM path.
import { useEffect, useMemo, useRef, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useFamily } from '../../state/family'
import { SqzIcon, StarToken } from '../../components/icons'
import { Zee } from '../../components/Zee'
import type { HabitCategory, TimeBlock } from '../../lib/types'

export interface DraftHabit {
  name: string
  icon: string
  category: HabitCategory
  time_block: TimeBlock
  is_core: boolean
  why: string
  library_id?: string | null
}

export interface DraftAdventure {
  name: string
  illustration: string
  cost: number
  tier: number
  why: string
  library_id?: string | null
}

export type HabitRow = Omit<DraftHabit, 'why'>
export type AdvRow = Omit<DraftAdventure, 'why'>

interface ChatMsg {
  who: 'bot' | 'me'
  text: string
}

type Phase = 'intakeHabits' | 'habits' | 'intakeAdvs' | 'adventures' | 'done'

const TIER_COST: Record<number, number> = { 0: 0, 1: 20, 2: 40, 3: 80 }

export function ScoutChat({
  childName,
  age,
  interests,
  onAccepted,
  onManual,
  adventuresToo = true,
}: {
  childName: string
  age: number
  interests: string
  onAccepted: (habits: HabitRow[], advs: AdvRow[]) => void | Promise<void>
  onManual: () => void
  adventuresToo?: boolean
}) {
  const fam = useFamily()
  const name = childName || 'your kid'
  const [phase, setPhase] = useState<Phase>('intakeHabits')
  const [msgs, setMsgs] = useState<ChatMsg[]>([
    {
      who: 'bot',
      text: `Hi! I’m the Scout — Zee’s backstage half. Tell me about ${name}: what do mornings and evenings look like, and what do you wish went smoother? What does ${name} already do without being asked?`,
    },
  ])
  const [input, setInput] = useState('')
  const [thinking, setThinking] = useState(false)
  const [habitDrafts, setHabitDrafts] = useState<DraftHabit[]>([])
  const [advDrafts, setAdvDrafts] = useState<DraftAdventure[]>([])
  const [habitState, setHabitState] = useState<Record<number, 'accepted' | 'skipped'>>({})
  const [advState, setAdvState] = useState<Record<number, 'accepted' | 'skipped'>>({})
  const [editing, setEditing] = useState<{ kind: 'habit' | 'adv'; idx: number } | null>(null)
  const [busy, setBusy] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const notesRef = useRef<string[]>([])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [msgs, habitDrafts, advDrafts, thinking])

  const profile = useMemo(
    () => ({ age, interests, name: childName || undefined }),
    [age, interests, childName],
  )

  // ---- rule-based fallback, grounded in the curated libraries ----
  const fallbackHabits = (): DraftHabit[] => {
    const coreTarget = age <= 5 ? 2 : age <= 7 ? 3 : 4
    const fits = fam.habitLibrary.filter((h) => age >= h.age_min && age <= h.age_max)
    const byCat = (cat: HabitCategory) => fits.filter((h) => h.category === cat)
    const cores: DraftHabit[] = []
    // spread across categories: body first (mornings), then space — never all-Space
    const corePool = [...byCat('body').slice(0, 3), ...byCat('space').slice(0, 2)]
    for (const h of corePool.slice(0, coreTarget)) {
      cores.push({
        name: h.name, icon: h.icon, category: h.category, time_block: h.suggested_block,
        is_core: true, why: h.why_it_matters, library_id: h.id,
      })
    }
    const bonusPool = [...byCat('mind').slice(0, 2), ...byCat('heart').slice(0, 1)]
    const bonuses: DraftHabit[] = bonusPool.slice(0, 2).map((h) => ({
      name: h.name, icon: h.icon, category: h.category, time_block: h.suggested_block,
      is_core: false, why: h.why_it_matters, library_id: h.id,
    }))
    return [...cores, ...bonuses]
  }

  const fallbackAdventures = (): DraftAdventure[] => {
    const fits = fam.activityLibrary.filter((a) => age >= a.age_min && age <= a.age_max)
    const byTier = (t: number) => fits.filter((a) => a.suggested_tier === t)
    const pick = [
      ...byTier(1).slice(0, 3),
      ...byTier(2).slice(0, 2),
      ...byTier(3).slice(0, 1),
      ...byTier(0).slice(0, 1),
    ]
    return pick.map((a) => ({
      name: a.name, illustration: a.illustration, cost: TIER_COST[a.suggested_tier] ?? 20,
      tier: a.suggested_tier, why: a.explainer, library_id: a.id,
    }))
  }

  // ---- LLM proxy with graceful fallback ----
  const invokeScout = async (kind: 'habits' | 'adventures', conversation: ChatMsg[]) => {
    const { data, error } = await supabase.functions.invoke('scout', {
      body: { kind, profile, conversation: conversation.slice(-8) },
    })
    if (error || !data) throw new Error(error?.message ?? 'no data')
    return data
  }

  const proposeHabits = async (conversation: ChatMsg[]): Promise<DraftHabit[]> => {
    try {
      const data = await invokeScout('habits', conversation)
      if (Array.isArray(data.habits) && data.habits.length > 0) {
        return resolveHabitDrafts(data.habits as DraftHabit[])
      }
      throw new Error('empty proposal')
    } catch {
      return fallbackHabits()
    }
  }

  const proposeAdvs = async (conversation: ChatMsg[]): Promise<DraftAdventure[]> => {
    try {
      const data = await invokeScout('adventures', conversation)
      if (Array.isArray(data.adventures) && data.adventures.length > 0) {
        return resolveAdvDrafts(data.adventures as DraftAdventure[])
      }
      throw new Error('empty proposal')
    } catch {
      return fallbackAdventures()
    }
  }

  /** drafts must be schema-valid: clamp anything the model got creative with */
  const resolveHabitDrafts = (raw: DraftHabit[]): DraftHabit[] =>
    raw.slice(0, 7).map((h) => ({
      name: String(h.name).slice(0, 60),
      icon: typeof h.icon === 'string' && h.icon ? h.icon : 'check',
      category: (['body', 'mind', 'space', 'heart'] as const).includes(h.category) ? h.category : 'body',
      time_block: (['morning', 'afternoon', 'evening'] as const).includes(h.time_block) ? h.time_block : 'morning',
      is_core: Boolean(h.is_core),
      why: String(h.why ?? '').slice(0, 240),
      library_id: fam.habitLibrary.find((l) => l.name === h.name)?.id ?? null,
    }))

  const resolveAdvDrafts = (raw: DraftAdventure[]): DraftAdventure[] =>
    raw.slice(0, 8).map((a) => {
      const tier = [0, 1, 2, 3].includes(a.tier) ? a.tier : 1
      return {
        name: String(a.name).slice(0, 60),
        illustration: typeof a.illustration === 'string' && a.illustration ? a.illustration : 'tent',
        cost: TIER_COST[tier],
        tier,
        why: String(a.why ?? '').slice(0, 240),
        library_id: fam.activityLibrary.find((l) => l.name === a.name)?.id ?? null,
      }
    })

  const send = async () => {
    const text = input.trim()
    if (!text || thinking) return
    setInput('')
    notesRef.current.push(text)
    const newMsgs: ChatMsg[] = [...msgs, { who: 'me' as const, text }]
    setMsgs(newMsgs)
    setThinking(true)

    if (phase === 'intakeHabits') {
      const drafts = await proposeHabits(newMsgs)
      setHabitDrafts(drafts)
      setMsgs((m) => [
        ...m,
        {
          who: 'bot',
          text: `Here’s a starting set for ${name} — ${drafts.filter((d) => d.is_core).length} cores and ${drafts.filter((d) => !d.is_core).length} bonus. Each card says why it earns its place. Accept, edit, or skip:`,
        },
      ])
      setPhase('habits')
    } else if (phase === 'intakeAdvs') {
      const drafts = await proposeAdvs(newMsgs)
      setAdvDrafts(drafts)
      setMsgs((m) => [
        ...m,
        {
          who: 'bot',
          text: 'A menu to start with — including the free pick, so the weekly outing never depends on stars:',
        },
      ])
      setPhase('adventures')
    }
    setThinking(false)
  }

  const confirmHabits = () => {
    if (!adventuresToo) {
      void finish()
      return
    }
    setMsgs((m) => [
      ...m,
      { who: 'bot', text: `Now the fun part — the rewards. What’s nearby that ${name} loves? A park, a pool, a bookshop? And what’s your weekend time and budget honestly like?` },
    ])
    setPhase('intakeAdvs')
  }

  const finish = async () => {
    setBusy(true)
    const habits: HabitRow[] = habitDrafts
      .filter((_, i) => habitState[i] === 'accepted')
      .map(({ why: _why, ...row }) => row)
    const advs: AdvRow[] = advDrafts
      .filter((_, i) => advState[i] === 'accepted')
      .map(({ why: _why, ...row }) => row)
    await onAccepted(habits, advs)
    setBusy(false)
  }

  const habitAcceptedCount = Object.values(habitState).filter((s) => s === 'accepted').length
  const allHabitsDecided = habitDrafts.length > 0 && habitDrafts.every((_, i) => habitState[i])
  const allAdvsDecided = advDrafts.length > 0 && advDrafts.every((_, i) => advState[i])
  const advAcceptedCount = Object.values(advState).filter((s) => s === 'accepted').length

  const draftCard = (
    kind: 'habit' | 'adv',
    idx: number,
    icon: string,
    title: string,
    sub: string,
    why: string,
    state: 'accepted' | 'skipped' | undefined,
    setState: (s: 'accepted' | 'skipped') => void,
    rename: (v: string) => void,
  ) => (
    <div className="draftcard" key={kind + idx} style={{ animationDelay: `${idx * 0.09}s`, opacity: state === 'skipped' ? 0.45 : 1 }}>
      <div className="dc-top">
        <span className="dc-ic">
          <SqzIcon name={icon} size={20} />
        </span>
        {editing?.kind === kind && editing.idx === idx ? (
          <input
            className="input"
            style={{ padding: '8px 10px', fontSize: 14 }}
            autoFocus
            defaultValue={title}
            onBlur={(e) => {
              rename(e.target.value.trim() || title)
              setEditing(null)
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') (e.target as HTMLInputElement).blur()
            }}
          />
        ) : (
          <span className="col grow">
            <span className="dc-name">{title}</span>
            <span className="muted" style={{ fontSize: 12 }}>{sub}</span>
          </span>
        )}
      </div>
      {why && <div className="dc-why">{why}</div>}
      <div className="draftacts">
        <button className={'chip ' + (state === 'accepted' ? 'accepted' : 'accept')} onClick={() => setState('accepted')}>
          {state === 'accepted' ? '✓ added' : 'accept'}
        </button>
        <button className="chip edit" onClick={() => setEditing({ kind, idx })}>
          edit
        </button>
        <button className="chip skip" onClick={() => setState('skipped')}>
          skip
        </button>
      </div>
    </div>
  )

  return (
    <div className="view" style={{ minHeight: 0 }}>
      <div className="parent-head">
        <Zee size={38} mood="awake" />
        <span className="pt grow">Scout</span>
        <button className="chip skip" onClick={onManual}>
          skip — I’ll do it myself
        </button>
      </div>

      <div className="view scroll" style={{ padding: 0, gap: 10 }} ref={scrollRef}>
        <div className="chat">
          {msgs.map((m, i) => (
            <div key={i} className={'bubble ' + m.who}>
              {m.text}
            </div>
          ))}
          {thinking && (
            <div className="bubble bot typing" aria-label="Scout is thinking">
              <i></i>
              <i></i>
              <i></i>
            </div>
          )}
        </div>

        {phase === 'habits' && habitDrafts.length > 0 && (
          <div className="col gap10" style={{ paddingTop: 6 }}>
            {habitDrafts.map((d, i) =>
              draftCard(
                'habit', i, d.icon, d.name,
                `${d.time_block} · ${d.is_core ? 'core · +1 ✦' : 'bonus · +2 ✦'} · ${d.category}`,
                d.why,
                habitState[i],
                (s) => setHabitState((p) => ({ ...p, [i]: s })),
                (v) => setHabitDrafts((p) => p.map((x, k) => (k === i ? { ...x, name: v, library_id: null } : x))),
              ),
            )}
            <button className="btn full" disabled={!allHabitsDecided || habitAcceptedCount === 0} onClick={confirmHabits}>
              {habitAcceptedCount === 0
                ? 'Accept at least one habit'
                : !allHabitsDecided
                  ? 'Decide each card to continue'
                  : adventuresToo
                    ? `Keep these ${habitAcceptedCount} → now adventures`
                    : `Keep these ${habitAcceptedCount} ✦`}
            </button>
          </div>
        )}

        {phase === 'adventures' && advDrafts.length > 0 && (
          <div className="col gap10" style={{ paddingTop: 6 }}>
            {advDrafts.map((d, i) =>
              draftCard(
                'adv', i, d.illustration, d.name,
                d.tier === 0 ? 'always free · the guaranteed outing' : `tier ${d.tier} · ${d.cost} ✦`,
                d.why,
                advState[i],
                (s) => setAdvState((p) => ({ ...p, [i]: s })),
                (v) => setAdvDrafts((p) => p.map((x, k) => (k === i ? { ...x, name: v, library_id: null } : x))),
              ),
            )}
            <button className="btn full" disabled={!allAdvsDecided || advAcceptedCount === 0 || busy} onClick={finish}>
              {busy ? 'saving…' : advAcceptedCount === 0 ? 'Accept at least one adventure' : 'Build the board ✦'}
            </button>
          </div>
        )}
      </div>

      {(phase === 'intakeHabits' || phase === 'intakeAdvs') && (
        <form
          className="row gap8"
          style={{ paddingTop: 10 }}
          onSubmit={(e) => {
            e.preventDefault()
            void send()
          }}
        >
          <input
            className="input grow"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={phase === 'intakeHabits' ? `Mornings are chaos, he never tidies up…` : 'There’s a park nearby, he loves to swim…'}
            aria-label="your reply"
          />
          <button className="btn" style={{ padding: '0 18px' }} disabled={!input.trim() || thinking} aria-label="send">
            <SqzIcon name="send" size={20} />
          </button>
        </form>
      )}
      {phase === 'adventures' && advAcceptedCount > 0 && (
        <div className="muted tac" style={{ fontSize: 12, paddingTop: 8 }}>
          <StarToken size={11} /> picks which adventure — the adventure itself always happens
        </div>
      )}
    </div>
  )
}
