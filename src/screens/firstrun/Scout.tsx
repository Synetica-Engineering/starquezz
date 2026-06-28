// Starquezz conversational setup (AGENT_BRIEF §5a).
// Parent-side only. The LLM proposes; deterministic code disposes: drafts are
// schema-shaped rows rendered as accept/edit/skip cards, and only accepted
// rows are written. Stars/streaks are never computed here.
// When the LLM proxy is unreachable (no key, offline, rate-limited) Starquezz
// falls back to library-grounded rule-based proposals — the no-LLM path.
import { useEffect, useMemo, useRef, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useFamily } from '../../state/family'
import { SqzIcon, StarToken } from '../../components/icons'
import { HabitIcon } from '../../components/HabitIcon'
import { Zee } from '../../components/Zee'
import { activeDaysForFrequency } from '../../lib/habits'
import type { HabitCategory, TimeBlock } from '../../lib/types'

export interface DraftHabit {
  name: string
  icon: string
  category: HabitCategory
  time_block: TimeBlock
  is_core: boolean
  source: 'conversation' | 'age'
  why: string
  library_id?: string | null
  active_days?: number[]
}

export interface DraftAdventure {
  name: string
  illustration: string
  cost: number
  tier: number
  why: string
  library_id?: string | null
}

export type HabitRow = Omit<DraftHabit, 'why' | 'source'>
export type AdvRow = Omit<DraftAdventure, 'why'>

interface ChatMsg {
  who: 'bot' | 'me'
  text: string
}

// chatHabits → (build) → habits cards → chatAdvs → (build) → adventures cards
type Phase = 'chatHabits' | 'habits' | 'chatAdvs' | 'adventures'
type ScoutMode = 'online' | 'offline' | null

const TIER_COST: Record<number, number> = { 0: 0, 1: 20, 2: 40, 3: 80 }

// Let the conversation run as long as it stays productive, but never past
// this many parent answers — a hard backstop that keeps it under 10 questions
// even if the model wants to keep going.
const QUESTION_BUDGET = 9

const habitQuestions = (name: string) => [
  `What do you want ${name} to become more confident doing?`,
  `What does ${name} avoid or forget?`,
  `What does ${name} usually do without much help?`,
  `When does ${name} need the most help?`,
  `What does ${name} love right now?`,
]
const habitOpener = (name: string) => habitQuestions(name)[0]
const advOpener = (name: string) =>
  `Now the fun part — what does ${name} love doing with you? Parks, pools, bookshops, building forts… what lights them up?`

// Warm scripted fallback (used when the LLM proxy is unavailable): still
// acknowledges the first answer and digs once, then asks permission to build.
function scriptedTurn(topic: 'habits' | 'adventures', answerNo: number, name: string): { reply: string; ready: boolean } {
  if (topic === 'habits') {
    const nextQuestion = habitQuestions(name)[answerNo]
    if (nextQuestion) return { reply: nextQuestion, ready: false }
    return { reply: `Want Starquezz to build ${name}'s habits now?`, ready: true }
  }
  if (answerNo === 1)
    return { reply: `Oh, those are lovely. Any weekend limits I should design around — budget, time, travel? Or I can build the menu right now.`, ready: true }
  return { reply: `Got it. Want me to build the adventure menu now?`, ready: true }
}

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
  const [phase, setPhase] = useState<Phase>('chatHabits')
  const [msgs, setMsgs] = useState<ChatMsg[]>([{ who: 'bot', text: habitOpener(name) }])
  const [input, setInput] = useState('')
  const [thinking, setThinking] = useState(false)
  const [scoutMode, setScoutMode] = useState<ScoutMode>(null)
  const [habitAnswers, setHabitAnswers] = useState(0)
  const [advAnswers, setAdvAnswers] = useState(0)
  const [readyHabits, setReadyHabits] = useState(false)
  const [readyAdvs, setReadyAdvs] = useState(false)
  const [habitDrafts, setHabitDrafts] = useState<DraftHabit[]>([])
  const [advDrafts, setAdvDrafts] = useState<DraftAdventure[]>([])
  const [habitState, setHabitState] = useState<Record<number, 'accepted' | 'skipped'>>({})
  const [advState, setAdvState] = useState<Record<number, 'accepted' | 'skipped'>>({})
  const [editing, setEditing] = useState<{ kind: 'habit' | 'adv'; idx: number } | null>(null)
  const [busy, setBusy] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [msgs, habitDrafts, advDrafts, thinking, readyHabits, readyAdvs])

  const profile = useMemo(
    () => ({ age, interests, name: childName || undefined }),
    [age, interests, childName],
  )

  // ---- rule-based fallback, grounded in the curated libraries ----
  // Offline can't read the conversation, so it can't tailor — it returns a
  // balanced age-appropriate set, all tagged 'age'.
  const fallbackHabits = (): DraftHabit[] => {
    const coreTarget = age <= 5 ? 2 : age <= 7 ? 3 : 4
    const fits = fam.habitLibrary.filter((h) => age >= h.age_min && age <= h.age_max)
    const byCat = (cat: HabitCategory) => fits.filter((h) => h.category === cat)
    // spread across categories, body/space first for cores
    const ordered = [
      ...byCat('body'),
      ...byCat('space'),
      ...byCat('mind'),
      ...byCat('heart'),
    ]
    const seen = new Set<string>()
    const picked = ordered.filter((h) => (seen.has(h.id) ? false : (seen.add(h.id), true))).slice(0, 9)
    return picked.map((h, i) => ({
      name: h.name, icon: h.icon, category: h.category, time_block: h.suggested_block,
      active_days: activeDaysForFrequency(h.suggested_frequency),
      is_core: i < coreTarget, source: 'age' as const, why: h.why_it_matters, library_id: h.id,
    }))
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
  const invokeScout = async (body: object) => {
    const { data, error } = await supabase.functions.invoke('scout', { body: { profile, ...body } })
    if (error || !data) throw new Error(error?.message ?? 'no data')
    return data
  }

  /** one conversational turn — warm ack + dig, or a permission-ask when ready */
  const chatTurn = async (
    conversation: ChatMsg[],
    topic: 'habits' | 'adventures',
  ): Promise<{ reply: string; ready: boolean }> => {
    const data = await invokeScout({ kind: 'chat', topic, conversation: conversation.slice(-12) })
    if (typeof data.reply !== 'string' || !data.reply.trim()) throw new Error('empty reply')
    return { reply: String(data.reply).slice(0, 400), ready: Boolean(data.ready) }
  }

  const proposeHabits = async (conversation: ChatMsg[]): Promise<DraftHabit[]> => {
    try {
      const data = await invokeScout({ kind: 'habits', conversation: conversation.slice(-12) })
      if (Array.isArray(data.habits) && data.habits.length > 0) {
        setScoutMode('online')
        return resolveHabitDrafts(data.habits as DraftHabit[])
      }
      throw new Error('empty proposal')
    } catch {
      setScoutMode('offline')
      return fallbackHabits()
    }
  }

  const proposeAdvs = async (conversation: ChatMsg[]): Promise<DraftAdventure[]> => {
    try {
      const data = await invokeScout({ kind: 'adventures', conversation: conversation.slice(-12) })
      if (Array.isArray(data.adventures) && data.adventures.length > 0) {
        setScoutMode('online')
        return resolveAdvDrafts(data.adventures as DraftAdventure[])
      }
      throw new Error('empty proposal')
    } catch {
      setScoutMode('offline')
      return fallbackAdventures()
    }
  }

  /** drafts must be schema-valid: clamp anything the model got creative with */
  const resolveHabitDrafts = (raw: DraftHabit[]): DraftHabit[] =>
    raw.slice(0, 9).map((h) => ({
      ...(() => {
        const library = fam.habitLibrary.find((l) => l.name === h.name)
        return {
          library_id: library?.id ?? null,
          active_days: library ? activeDaysForFrequency(library.suggested_frequency) : undefined,
        }
      })(),
      name: String(h.name).slice(0, 60),
      icon: typeof h.icon === 'string' && h.icon ? h.icon : '✅',
      category: (['body', 'mind', 'space', 'heart'] as const).includes(h.category) ? h.category : 'body',
      time_block: (['morning', 'afternoon', 'evening'] as const).includes(h.time_block) ? h.time_block : 'morning',
      is_core: Boolean(h.is_core),
      source: h.source === 'conversation' ? 'conversation' : 'age',
      why: String(h.why ?? '').slice(0, 240),
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

  // one parent message → one dynamic Scout reply (ack + dig, or "ready?")
  const send = async () => {
    const text = input.trim()
    if (!text || thinking) return
    setInput('')
    const newMsgs: ChatMsg[] = [...msgs, { who: 'me' as const, text }]
    setMsgs(newMsgs)
    setThinking(true)

    const topic = phase === 'chatHabits' ? 'habits' : 'adventures'
    const answerNo = (topic === 'habits' ? habitAnswers : advAnswers) + 1
    const totalAnswers = habitAnswers + advAnswers + 1
    if (topic === 'habits') setHabitAnswers(answerNo)
    else setAdvAnswers(answerNo)

    let reply: string
    let ready: boolean
    try {
      if (topic === 'habits') {
        const s = scriptedTurn(topic, answerNo, name)
        reply = s.reply
        ready = s.ready
      } else {
        if (scoutMode === 'offline') throw new Error('already-offline') // skip the network round-trip
        const turn = await chatTurn(newMsgs, topic)
        setScoutMode('online')
        reply = turn.reply
        ready = turn.ready
      }
    } catch {
      if (topic !== 'habits') setScoutMode('offline')
      const s = scriptedTurn(topic, answerNo, name)
      reply = s.reply
      ready = s.ready
    }
    // honour the budget — never let it run long
    if (totalAnswers >= QUESTION_BUDGET) ready = true

    setMsgs((m) => [...m, { who: 'bot', text: reply }])
    if (topic === 'habits') setReadyHabits(ready)
    else setReadyAdvs(ready)
    setThinking(false)
  }

  // parent says yes → generate the habit draft cards
  const buildHabits = async () => {
    if (thinking || busy) return
    setThinking(true)
    const drafts = await proposeHabits(msgs)
    setHabitDrafts(drafts)
    const tailored = drafts.filter((d) => d.source === 'conversation').length
    const aged = drafts.length - tailored
    setMsgs((m) => [
      ...m,
      {
        who: 'bot',
        text:
          tailored > 0
            ? `Here’s my recommendation for ${name} — ${tailored} shaped by what you told me, plus ${aged} that simply fit ${name}’s age. Accept the ones you like, edit, or skip the rest:`
            : `Here’s a starting set for ${name} — each card says why it earns its place. Accept, edit, or skip:`,
      },
    ])
    setPhase('habits')
    setThinking(false)
  }

  // habits kept → into the adventures conversation (or finish)
  const confirmHabits = () => {
    if (!adventuresToo) {
      void finish()
      return
    }
    setMsgs((m) => [...m, { who: 'bot', text: advOpener(name) }])
    setPhase('chatAdvs')
  }

  const buildAdvs = async () => {
    if (thinking || busy) return
    setThinking(true)
    const drafts = await proposeAdvs(msgs)
    setAdvDrafts(drafts)
    setMsgs((m) => [
      ...m,
      { who: 'bot', text: 'A menu to start with — including the free pick, so the weekly outing never depends on stars:' },
    ])
    setPhase('adventures')
    setThinking(false)
  }

  const finish = async () => {
    setBusy(true)
    const habits: HabitRow[] = habitDrafts
      .filter((_, i) => habitState[i] === 'accepted')
      .map(({ why: _why, source: _source, ...row }) => row)
    const advs: AdvRow[] = advDrafts
      .filter((_, i) => advState[i] === 'accepted')
      .map(({ why: _why, ...row }) => row)
    await onAccepted(habits, advs)
    setBusy(false)
  }

  const habitAcceptedCount = Object.values(habitState).filter((s) => s === 'accepted').length
  const advAcceptedCount = Object.values(advState).filter((s) => s === 'accepted').length
  const inChat = phase === 'chatHabits' || phase === 'chatAdvs'
  const replyPlaceholder = phase === 'chatHabits' ? 'Tell Starquezz about them…' : 'Your reply…'

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
          {kind === 'habit' ? <HabitIcon icon={icon} size={22} /> : <SqzIcon name={icon} size={20} />}
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
        <span className="pt grow">Starquezz</span>
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
            <div className="bubble bot typing" aria-label="Starquezz is thinking">
              <i></i>
              <i></i>
              <i></i>
            </div>
          )}
        </div>

        {scoutMode === 'offline' && inChat && (
          <div className="nudge-card" role="status" style={{ fontSize: 12.5 }}>
            Starquezz is offline right now, so it’s using quick guided questions and library-based
            suggestions. Everything still works.
          </div>
        )}

        {/* the ready-to-build gate — appears once Starquezz has enough */}
        {phase === 'chatHabits' && readyHabits && !thinking && (
          <button className="btn full" onClick={() => void buildHabits()}>
            Build {name}’s habits ✦
          </button>
        )}
        {phase === 'chatAdvs' && readyAdvs && !thinking && (
          <button className="btn full" onClick={() => void buildAdvs()}>
            Build the adventure menu ✦
          </button>
        )}

        {phase === 'habits' && habitDrafts.length > 0 && (
          <div className="col gap14" style={{ paddingTop: 6 }}>
            {(['conversation', 'age'] as const).map((src) => {
              const items = habitDrafts
                .map((d, i) => ({ d, i }))
                .filter(({ d }) => d.source === src)
              if (items.length === 0) return null
              return (
                <div className="col gap10" key={src}>
                  <div className="eyebrow">
                    {src === 'conversation' ? `Tailored to ${name}` : `Great for ${name}’s age`}
                  </div>
                  {items.map(({ d, i }) =>
                    draftCard(
                      'habit', i, d.icon, d.name,
                      `${d.is_core ? 'core habit' : 'bonus · +1 ✦'} · ${d.category}`,
                      d.why,
                      habitState[i],
                      (s) => setHabitState((p) => ({ ...p, [i]: s })),
                      (v) => setHabitDrafts((p) => p.map((x, k) => (k === i ? { ...x, name: v, library_id: null } : x))),
                    ),
                  )}
                </div>
              )
            })}
            <button className="btn full" disabled={habitAcceptedCount === 0} onClick={confirmHabits}>
              {habitAcceptedCount === 0
                ? 'Accept the ones you want'
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
            <button className="btn full" disabled={advAcceptedCount === 0 || busy} onClick={finish}>
              {busy ? 'saving…' : advAcceptedCount === 0 ? 'Accept the ones you want' : 'Build the board ✦'}
            </button>
          </div>
        )}
      </div>

      {inChat && (
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
            placeholder={replyPlaceholder}
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
