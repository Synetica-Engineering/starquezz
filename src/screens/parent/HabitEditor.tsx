// Habit Editor — CRUD + the Habit Library browser + mastery/graduation.
// Tracking is the commodity; designing the set is the value. Balance nudges
// are gentle hints, never blockers.
import { useMemo, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useFamily, habitsForChild, graduatedHabits, scheduledOn, isDone } from '../../state/family'
import { SqzIcon } from '../../components/icons'
import { HABIT_EMOJIS, HabitIcon } from '../../components/HabitIcon'
import { Sheet, StarBurst, Toast, useToast } from '../../components/ui'
import { Zee } from '../../components/Zee'
import { addDays, todayLocal, BLOCKS, BLOCK_LABEL } from '../../lib/dates'
import { activeDaysForFrequency } from '../../lib/habits'
import type { Habit, HabitCategory, HabitLibraryEntry, TimeBlock } from '../../lib/types'

const CATEGORIES: HabitCategory[] = ['body', 'mind', 'space', 'heart']
const CAT_COLOR: Record<HabitCategory, string> = {
  body: '#5BE5C0',
  mind: '#8DEBFF',
  space: '#FFD66B',
  heart: '#FF87C4',
}
const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

interface HabitForm {
  id?: string
  name: string
  icon: string
  category: HabitCategory
  time_block: TimeBlock
  is_core: boolean
  active_days: number[]
  library_id?: string | null
}

export function HabitEditor() {
  const fam = useFamily()
  const [childId, setChildId] = useState(fam.children[0]?.id ?? '')
  const [form, setForm] = useState<HabitForm | null>(null)
  const [ideaOpen, setIdeaOpen] = useState(false)
  const [idea, setIdea] = useState('')
  const [tidying, setTidying] = useState(false)
  const [library, setLibrary] = useState(false)
  const [graduating, setGraduating] = useState<Habit | null>(null)
  const [celebrated, setCelebrated] = useState<Habit | null>(null)
  const [toast, showToast] = useToast()
  const child = fam.children.find((c) => c.id === childId) ?? fam.children[0]

  const active = habitsForChild(fam.habits, child?.id ?? '')
  const hall = graduatedHabits(fam.habits, child?.id ?? '')
  const cores = active.filter((h) => h.is_core)
  const age = child?.birth_year ? new Date().getFullYear() - child.birth_year : 7
  const suggestedCores = age <= 5 ? 2 : age <= 7 ? 3 : 4
  const profile = { age, interests: child?.interests?.join(', '), name: child?.name }

  const closeForm = () => {
    setForm(null)
    setIdeaOpen(false)
    setIdea('')
    setTidying(false)
  }

  const newHabit = () => {
    setIdea('')
    setForm(null)
    setIdeaOpen(true)
  }

  // ---- balance nudges (hints, never blockers) ----
  const nudges: string[] = []
  if (cores.length > suggestedCores)
    nudges.push(
      `${cores.length} core habits is a lot at ${age} — around ${suggestedCores} keeps every day winnable.`,
    )
  const cats = new Set(active.map((h) => h.category))
  if (active.length >= 3 && [...cats].every((c) => c === 'space'))
    nudges.push('All-Space is a chore list wearing a costume — mix in a Body or Mind habit.')
  else if (active.length >= 3 && !cats.has('body')) nudges.push('No Body habits — movement and sleep anchor the rest.')

  // ---- mastery suggestion: sustained completion ≥ 90% over the last 8 weeks ----
  const masteryReady = useMemo(() => {
    const today = todayLocal()
    const ready = new Set<string>()
    for (const h of active) {
      let scheduled = 0
      let done = 0
      for (let i = 1; i <= 56; i++) {
        const d = addDays(today, -i)
        if (new Date(h.created_at) > new Date(d)) break
        if (scheduledOn([h], d).length === 0) continue
        scheduled++
        if (isDone(fam.completions, h.id, d)) done++
      }
      if (scheduled >= 40 && done / scheduled >= 0.9) ready.add(h.id)
    }
    return ready
  }, [active, fam.completions])

  const save = async () => {
    if (!form || !child) return
    const row = {
      name: form.name.trim(),
      icon: form.icon,
      category: form.category,
      time_block: form.time_block,
      is_core: form.is_core,
      active_days: form.active_days,
    }
    if (form.id) {
      const { error } = await supabase.from('habits').update(row).eq('id', form.id)
      if (error) return showToast('Could not save')
    } else {
      const { error } = await supabase
        .from('habits')
        .insert({ ...row, child_id: child.id, library_id: form.library_id ?? null, sort_order: active.length })
      if (error) return showToast('Could not save')
    }
    closeForm()
    await fam.refresh()
  }

  const archive = async (h: Habit) => {
    // archive instead of delete — nothing destructive is one tap deep
    const { error } = await supabase.from('habits').update({ archived_at: new Date().toISOString() }).eq('id', h.id)
    if (error) return showToast('Could not archive')
    closeForm()
    await fam.refresh()
    showToast(`"${h.name}" archived`)
  }

  const fallbackDraft = (raw: string): HabitForm => {
    const text = raw.trim()
    const lower = text.toLowerCase()
    const icon = lower.match(/tooth|brush|floss/) ? '🪥'
      : lower.match(/book|read/) ? '📚'
      : lower.match(/piano|music|instrument/) ? '🎹'
      : lower.match(/sweep|clean|tidy|room|toy|laundry/) ? '🧹'
      : lower.match(/water|drink/) ? '🥤'
      : lower.match(/run|move|walk|exercise|sport/) ? '🏃'
      : lower.match(/pet|feed/) ? '🐾'
      : '✅'
    const category: HabitCategory = lower.match(/tooth|brush|floss|water|sleep|run|move|walk|exercise|sport/)
      ? 'body'
      : lower.match(/sweep|clean|tidy|room|toy|laundry|bed/)
        ? 'space'
        : lower.match(/kind|help|thank|pet|family/)
          ? 'heart'
          : 'mind'
    const time_block: TimeBlock = lower.match(/night|evening|bed|after dinner/) ? 'evening'
      : lower.match(/after school|afternoon|practice/) ? 'afternoon'
      : 'morning'
    return {
      name: text
        .split(/\s+/)
        .slice(0, 7)
        .map((w, i) => (i === 0 ? w.charAt(0).toUpperCase() + w.slice(1).toLowerCase() : w.toLowerCase()))
        .join(' ')
        .slice(0, 40) || 'New habit',
      icon,
      category,
      time_block,
      is_core: cores.length < suggestedCores,
      active_days: [1, 2, 3, 4, 5, 6, 7],
    }
  }

  const tidyIdea = async () => {
    const raw = idea.trim()
    if (!raw || tidying) return
    setTidying(true)
    try {
      const { data, error } = await supabase.functions.invoke('scout', {
        body: { kind: 'custom_habit', profile, idea: raw },
      })
      if (error || !data?.habit) throw new Error(error?.message ?? 'no draft')
      const draft = data.habit as Partial<HabitForm>
      const category = CATEGORIES.includes(draft.category as HabitCategory) ? draft.category as HabitCategory : 'body'
      const time_block = BLOCKS.includes(draft.time_block as TimeBlock) ? draft.time_block as TimeBlock : 'morning'
      setIdeaOpen(false)
      setForm({
        name: String(draft.name ?? '').slice(0, 40) || raw.slice(0, 40),
        icon: typeof draft.icon === 'string' && draft.icon ? draft.icon.slice(0, 8) : '✅',
        category,
        time_block,
        is_core: typeof draft.is_core === 'boolean' ? draft.is_core : cores.length < suggestedCores,
        active_days: [1, 2, 3, 4, 5, 6, 7],
      })
    } catch {
      setIdeaOpen(false)
      setForm(fallbackDraft(raw))
      showToast('Starquezz is offline — made a simple draft')
    } finally {
      setTidying(false)
    }
  }

  const graduate = async (h: Habit) => {
    setGraduating(null)
    await fam.graduateHabit(h.id)
    setCelebrated(h)
  }

  const addFromLibrary = async (entry: HabitLibraryEntry) => {
    if (!child) return
    const { error } = await supabase.from('habits').insert({
      child_id: child.id,
      library_id: entry.id,
      name: entry.name,
      icon: entry.icon,
      category: entry.category,
      time_block: entry.suggested_block,
      active_days: activeDaysForFrequency(entry.suggested_frequency),
      is_core: true,
      sort_order: active.length,
    })
    if (error) return showToast('Could not add')
    await fam.refresh()
    setLibrary(false)
    showToast(`"${entry.name}" added to ${child.name}`)
  }

  if (!child) return <div className="view center muted">Add a kid first ✦</div>

  return (
    <div className="view scroll">
      <div className="parent-head">
        <span className="pt grow">Habits</span>
        <button className="chip edit" onClick={() => setLibrary(true)}>
          <SqzIcon name="book" size={13} style={{ marginRight: 4, verticalAlign: -2 }} />
          library
        </button>
        <button className="iconbtn" onClick={newHabit} aria-label="add habit">
          <SqzIcon name="plus" size={18} />
        </button>
      </div>

      {fam.children.length > 1 && (
        <div className="seg" style={{ marginBottom: 12 }}>
          {fam.children.map((c) => (
            <button key={c.id} className={c.id === child.id ? 'on' : ''} onClick={() => setChildId(c.id)}>
              {c.name}
            </button>
          ))}
        </div>
      )}

      {nudges.map((n, i) => (
        <div className="nudge-card" key={i} style={{ marginBottom: 10 }}>
          <SqzIcon name="bulb" size={17} />
          <span>{n}</span>
        </div>
      ))}

      <div className="col gap14">
        {BLOCKS.map((block) => {
          const list = active.filter((h) => h.time_block === block)
          if (list.length === 0) return null
          return (
            <div className="col gap8" key={block}>
              <div className="eyebrow">{BLOCK_LABEL[block]}</div>
              {list.map((h) => (
                <div className="plist-row" key={h.id}>
                  <span className="pr-icon" style={{ color: CAT_COLOR[h.category] }}>
                    <HabitIcon icon={h.icon} size={22} />
                  </span>
                  <span className="col grow" style={{ minWidth: 0 }}>
                    <span className="pr-name">{h.name}</span>
                    <span className="pr-sub">
                      {h.is_core ? 'core habit' : 'bonus · +1 ✦'} · {h.category}
                      {h.active_days.length < 7 && ` · ${h.active_days.map((d) => DAY_LABELS[d - 1]).join('')}`}
                    </span>
                    {masteryReady.has(h.id) && (
                      <button className="chip accept" style={{ marginTop: 6, alignSelf: 'flex-start' }} onClick={() => setGraduating(h)}>
                        ✦ looks mastered — celebrate it?
                      </button>
                    )}
                  </span>
                  <button className="iconbtn" aria-label={`graduate ${h.name}`} title="mark as mastered" onClick={() => setGraduating(h)}>
                    <SqzIcon name="trophy" size={17} />
                  </button>
                  <button
                    className="iconbtn"
                    aria-label={`edit ${h.name}`}
                    onClick={() =>
                      setForm({
                        id: h.id, name: h.name, icon: h.icon, category: h.category,
                        time_block: h.time_block, is_core: h.is_core, active_days: h.active_days,
                      })
                    }
                  >
                    <SqzIcon name="edit" size={16} />
                  </button>
                </div>
              ))}
            </div>
          )
        })}
        {active.length === 0 && (
          <div className="pcard tac muted" style={{ padding: 24, fontSize: 14 }}>
            No habits yet — add one or browse the library.
          </div>
        )}

        {hall.length > 0 && (
          <div className="col gap8">
            <div className="eyebrow">Hall of Fame</div>
            {hall.map((h) => (
              <div className="plist-row graduated" key={h.id}>
                <span className="pr-icon" style={{ color: '#FFE49C' }}>
                  <SqzIcon name="trophy" size={18} />
                </span>
                <span className="col grow">
                  <span className="pr-name">{h.name}</span>
                  <span className="pr-sub">graduated — part of who {child.name} is now</span>
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {ideaOpen && (
        <Sheet onClose={closeForm}>
          <h3>New habit</h3>
          <div className="col gap12">
            <div>
              <label className="field-label" htmlFor="hidea">
                Rough idea
              </label>
              <textarea
                id="hidea"
                className="input"
                value={idea}
                maxLength={240}
                onChange={(e) => setIdea(e.target.value)}
                placeholder="Practice piano, drink water, sweep one small area..."
                style={{ minHeight: 112, resize: 'vertical' }}
              />
            </div>
            <button className="btn full" disabled={!idea.trim() || tidying} onClick={() => void tidyIdea()}>
              {tidying ? 'Starquezz is tidying...' : 'Create habit'}
            </button>
          </div>
        </Sheet>
      )}

      {/* add/edit sheet */}
      {form && (
        <Sheet onClose={closeForm}>
          <h3>{form.id ? 'Edit habit' : 'New habit'}</h3>
          <div className="col gap12">
            <div>
              <label className="field-label" htmlFor="hname">
                Kid-facing name
              </label>
              <input
                id="hname"
                className="input"
                value={form.name}
                maxLength={40}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Brush teeth"
              />
            </div>
            <div>
              <span className="field-label">Icon</span>
              <div className="icon-grid">
                {HABIT_EMOJIS.map((ic) => (
                  <button
                    key={ic}
                    className={'icon-cell' + (form.icon === ic ? ' on' : '')}
                    onClick={() => setForm({ ...form, icon: ic })}
                    aria-label={`icon ${ic}`}
                  >
                    <HabitIcon icon={ic} size={22} />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <span className="field-label">Time block</span>
              <div className="seg">
                {BLOCKS.map((b) => (
                  <button key={b} className={form.time_block === b ? 'on' : ''} onClick={() => setForm({ ...form, time_block: b })}>
                    {BLOCK_LABEL[b]}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <span className="field-label">Category</span>
              <div className="seg">
                {CATEGORIES.map((c) => (
                  <button key={c} className={form.category === c ? 'on' : ''} onClick={() => setForm({ ...form, category: c })}>
                    {c}
                  </button>
                ))}
              </div>
            </div>
            <div className="row between">
              <span className="col">
                <span className="pr-name">Core habit</span>
                <span className="pr-sub">{form.is_core ? 'counts toward the star-day' : 'bonus — unlocks after cores · +1 ✦'}</span>
              </span>
              <button
                className={'toggle' + (form.is_core ? ' on' : '')}
                onClick={() => setForm({ ...form, is_core: !form.is_core })}
                aria-label="toggle core"
              />
            </div>
            <div>
              <span className="field-label">Active days</span>
              <div className="row gap6">
                {DAY_LABELS.map((d, i) => {
                  const day = i + 1
                  const on = form.active_days.includes(day)
                  return (
                    <button
                      key={i}
                      className={'icon-cell' + (on ? ' on' : '')}
                      style={{ width: 38, aspectRatio: '1', fontWeight: 800, fontSize: 13 }}
                      onClick={() =>
                        setForm({
                          ...form,
                          active_days: on
                            ? form.active_days.filter((x) => x !== day)
                            : [...form.active_days, day].sort(),
                        })
                      }
                      aria-label={`day ${day}`}
                    >
                      {d}
                    </button>
                  )
                })}
              </div>
            </div>
            <button className="btn full" disabled={!form.name.trim() || form.active_days.length === 0} onClick={() => void save()}>
              {form.id ? 'Save changes' : `Add to ${child.name}’s board`}
            </button>
            {form.id && (
              <button className="btn full danger" onClick={() => void archive(fam.habits.find((h) => h.id === form.id)!)}>
                Archive — off the board, history kept
              </button>
            )}
          </div>
        </Sheet>
      )}

      {/* graduation confirm */}
      {graduating && (
        <Sheet onClose={() => setGraduating(null)}>
          <div className="col center gap12 tac" style={{ padding: '8px 4px' }}>
            <Zee size={64} mood="cheer" />
            <h3 style={{ margin: 0 }}>Graduate “{graduating.name}”?</h3>
            <p className="muted" style={{ margin: 0, fontSize: 14, lineHeight: 1.5 }}>
              It moves to {child.name}’s Hall of Fame as a thing they <b>just do now</b> — with a +10 ✦
              celebration. The slot opens for what’s next. This is leveling up, never losing a star source.
            </p>
            <button className="btn full" onClick={() => void graduate(graduating)}>
              Yes — to the Hall of Fame ✦
            </button>
            <button className="chip skip" onClick={() => setGraduating(null)}>
              not yet
            </button>
          </div>
        </Sheet>
      )}

      {/* graduation celebration (signature moment #4) */}
      {celebrated && (
        <div className="celebrate" onClick={() => setCelebrated(null)}>
          <StarBurst count={20} />
          <span style={{ color: '#FFE49C' }}>
            <SqzIcon name="trophy" size={64} stroke={1.6} />
          </span>
          <h2>
            “{celebrated.name}”
            <br />
            is who {child.name} is now
          </h2>
          <p>
            +10 ✦ rained into the jar. Show {child.name} the Hall of Fame on their Stars screen — and when
            you’re ready, Starquezz can suggest what fills the slot.
          </p>
          <button className="btn" onClick={() => setCelebrated(null)}>
            Wonderful ✦
          </button>
        </div>
      )}

      {/* habit library browser */}
      {library && (
        <HabitLibrarySheet
          age={age}
          onAdd={addFromLibrary}
          onCustom={() => {
            setLibrary(false)
            newHabit()
          }}
          onClose={() => setLibrary(false)}
        />
      )}
      <Toast message={toast} />
    </div>
  )
}

function HabitLibrarySheet({
  age,
  onAdd,
  onCustom,
  onClose,
}: {
  age: number
  onAdd: (e: HabitLibraryEntry) => Promise<void>
  onCustom: () => void
  onClose: () => void
}) {
  const fam = useFamily()
  const [cat, setCat] = useState<HabitCategory | 'all'>('all')
  const [ageFit, setAgeFit] = useState(true)
  const list = fam.habitLibrary.filter(
    (h) => (cat === 'all' || h.category === cat) && (!ageFit || (age >= h.age_min && age <= h.age_max)),
  )
  return (
    <Sheet onClose={onClose}>
      <h3>Habit Library</h3>
      <div className="filter-row">
        <button className={'fchip' + (ageFit ? ' on' : '')} onClick={() => setAgeFit(!ageFit)}>
          fits age {age}
        </button>
        {(['all', ...CATEGORIES] as const).map((c) => (
          <button key={c} className={'fchip' + (cat === c ? ' on' : '')} onClick={() => setCat(c)}>
            {c}
          </button>
        ))}
        <button className="fchip" onClick={onCustom}>
          custom
        </button>
      </div>
      <div className="col gap10">
        {list.map((h) => (
          <div className="lib-card" key={h.id}>
            <div className="lc-head">
              <span className="lc-ic" style={{ color: CAT_COLOR[h.category] }}>
                <HabitIcon icon={h.icon} size={23} />
              </span>
              <span className="col grow">
                <span className="lc-name">{h.name}</span>
                <span className="lc-tags">
                  {h.category} · ages {h.age_min}–{h.age_max} · {h.suggested_frequency ?? 'Daily'} · {h.duration_min ?? 10}m
                </span>
              </span>
              <button className="chip accept" onClick={() => void onAdd(h)}>
                add
              </button>
            </div>
            <div className="lc-why">{h.why_it_matters}</div>
            <div className="lc-why" style={{ paddingTop: 0, color: 'var(--faint)' }}>
              Mastered when: {h.mastery_signal.toLowerCase()}
            </div>
          </div>
        ))}
        {list.length === 0 && <div className="muted tac" style={{ padding: 16 }}>Nothing matches those filters.</div>}
      </div>
    </Sheet>
  )
}
