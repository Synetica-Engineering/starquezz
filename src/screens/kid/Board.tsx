// The Routine Board — answers "what now?", not "what today?".
// Shows today's routine in one ordered list; check-offs are trusted, instant,
// and reversible for 5 minutes. The check-off must feel better than being told.
import { useEffect, useMemo, useState } from 'react'
import { useFamily, habitsForChild, isDone, scheduledOn } from '../../state/family'
import { formatDay, isoDow, todayLocal } from '../../lib/dates'
import { SqzIcon } from '../../components/icons'
import { HabitIcon } from '../../components/HabitIcon'
import { StarFx, StarBurst } from '../../components/ui'
import { Zee, ZBubble, type ZeeMood } from '../../components/Zee'
import { playBonus, playCheck, playDailyWin, playLocked } from '../../lib/sound'
import type { Child, Habit, SillyActivity } from '../../lib/types'

type CardState = '' | 'now' | 'done' | 'locked'
const BLOCK_ORDER: Record<Habit['time_block'], number> = { morning: 0, afternoon: 1, evening: 2 }
const SILLY_DONE_PREFIX = 'sqz_silly_done'

function hashString(input: string): number {
  let hash = 2166136261
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i)
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}

export function Board({
  child,
  starRef,
}: {
  child: Child
  starRef: React.RefObject<HTMLElement | null>
}) {
  const fam = useFamily()
  const today = todayLocal()
  const [pending, setPending] = useState<Set<string>>(new Set())
  const [zeeMood, setZeeMood] = useState<ZeeMood>('awake')
  const [celebration, setCelebration] = useState<null | { streakBonus: number; streak: number }>(null)
  const sillyDoneKey = `${SILLY_DONE_PREFIX}:${child.id}:${today}`
  const [sillyDone, setSillyDone] = useState(() => {
    const value = localStorage.getItem(sillyDoneKey)
    return value === '1' || value === 'starred'
  })
  const [sillyStarred, setSillyStarred] = useState(() => localStorage.getItem(sillyDoneKey) === 'starred')
  const [sillyPending, setSillyPending] = useState(false)

  useEffect(() => {
    const value = localStorage.getItem(sillyDoneKey)
    setSillyDone(value === '1' || value === 'starred')
    setSillyStarred(value === 'starred')
    setSillyPending(false)
  }, [sillyDoneKey])

  const all = useMemo(
    () =>
      [...scheduledOn(habitsForChild(fam.habits, child.id), today)].sort(
        (a, b) => BLOCK_ORDER[a.time_block] - BLOCK_ORDER[b.time_block] || a.sort_order - b.sort_order,
      ),
    [fam.habits, child.id, today],
  )
  const cores = all.filter((h) => h.is_core)
  const done = (h: Habit) => pending.has(h.id) || isDone(fam.completions, h.id, today)
  const coresDone = cores.length > 0 && cores.every(done)
  const allDone = all.length > 0 && all.every(done)
  const doneCount = all.filter(done).length
  const sillyPick = useMemo(() => {
    if (fam.sillyLibrary.length === 0) return null
    return fam.sillyLibrary[hashString(`${child.id}:${today}`) % fam.sillyLibrary.length]
  }, [child.id, fam.sillyLibrary, today])
  const showSilly = Boolean(fam.parent?.silly_mode && coresDone && sillyPick)

  const ticket = fam.planned.find((p) => p.child_id === child.id && p.status === 'planned')
  const ticketAdv = ticket ? fam.adventures.find((a) => a.id === ticket.adventure_id) : null

  const cardState = (h: Habit): CardState => {
    if (done(h)) return 'done'
    if (!h.is_core && !coresDone) return 'locked'
    return 'now'
  }
  // only the first open card gets the "now" spotlight
  let spotlightUsed = false
  const withSpotlight = (s: CardState): CardState => {
    if (s !== 'now') return s
    if (spotlightUsed) return ''
    spotlightUsed = true
    return 'now'
  }

  const check = (h: Habit, el: HTMLElement) => {
    if (done(h)) return
    if (!h.is_core && !coresDone) {
      playLocked()
      return
    }
    setPending((p) => new Set(p).add(h.id))
    setZeeMood('cheer')
    setTimeout(() => setZeeMood('awake'), 850)
    playCheck()
    StarFx.fly(el, starRef.current, () => {})
    void fam
      .completeHabit(h.id)
      .then((res) => {
        setPending((p) => {
          const n = new Set(p)
          n.delete(h.id)
          return n
        })
        if (res.star_day && h.is_core) {
          // daily win: board-wide burst, flame ignites (signature moment #2/#3)
          setTimeout(() => {
            setCelebration({ streakBonus: res.streak_bonus, streak: res.streak })
            if (res.streak_bonus > 0) playBonus()
            else playDailyWin()
          }, 700)
        }
      })
      .catch(() => {
        // RPC refused (already done elsewhere / offline) — quiet revert
        setPending((p) => {
          const n = new Set(p)
          n.delete(h.id)
          return n
        })
      })
  }

  const undo = (h: Habit) => {
    void fam.undoCompletion(h.id).catch(() => {})
  }

  const toggleSilly = (el: HTMLElement) => {
    if (!sillyPick || sillyPending) return
    const note = `silly:${today}:${sillyPick.silly_key}`
    const nextDone = !sillyDone
    setSillyPending(true)
    setSillyDone(nextDone)

    if (nextDone) {
      setSillyStarred(true)
      localStorage.setItem(sillyDoneKey, 'starred')
      playCheck()
      StarFx.fly(el, starRef.current, () => {})
      void fam.adjustStars(child.id, 1, note).catch(() => {
        localStorage.removeItem(sillyDoneKey)
        setSillyDone(false)
        setSillyStarred(false)
      }).finally(() => setSillyPending(false))
      return
    }

    localStorage.removeItem(sillyDoneKey)
    setSillyStarred(false)
    StarFx.fly(starRef.current, el, () => {})
    if (!sillyStarred) {
      setSillyPending(false)
      return
    }
    void fam.adjustStars(child.id, -1, `undo:${note}`).catch(() => {
      localStorage.setItem(sillyDoneKey, 'starred')
      setSillyDone(true)
      setSillyStarred(true)
    }).finally(() => setSillyPending(false))
  }

  /** undo affordance only within the 5-minute window */
  const canUndo = (h: Habit): boolean => {
    const c = fam.completions.find((x) => x.habit_id === h.id && x.completed_on === today)
    if (!c) return false
    return Date.now() - new Date(c.created_at).getTime() < 5 * 60_000
  }

  const zeeLine = () => {
    if (all.length === 0)
      return (
        <span>
          <b>All quiet today.</b> No jobs on the board — enjoy it!
        </span>
      )
    if (allDone)
      return (
        <span>
          <b>Whole day done!</b> You’re a star. ⭐
        </span>
      )
    if (coresDone)
      return (
        <span>
          <b>Cores done!</b> Your bonus stars are unlocked.
        </span>
      )
    if (doneCount === 0)
      return (
        <span>
          <b>Ready?</b> Tap the ring when you finish a job.
        </span>
      )
    return (
      <span>
        <b>
          {doneCount} job{doneCount === 1 ? '' : 's'} done!
        </b>{' '}
        Keep going — you’ve got this.
      </span>
    )
  }

  return (
    <div className="view scroll">
      <div className="row gap10" style={{ marginBottom: 14 }}>
        <Zee size={42} mood={zeeMood} />
        <ZBubble>{zeeLine()}</ZBubble>
      </div>

      <div className="habits">
        {all.length === 0 && (
          <div className="pcard tac muted" style={{ fontSize: 14, padding: 22 }}>
            Nothing on the board today ✦
          </div>
        )}
        {all.map((h) => {
          const state = withSpotlight(cardState(h))
          const undoable = state === 'done' && canUndo(h)
          const interactive = state === 'now' || state === ''
          return (
            <div className={'habit ' + state + (!h.is_core && state === 'locked' && coresDone ? ' unlockable' : '')} key={h.id}>
              {state === 'locked' && (
                <span className="lockpill">
                  <SqzIcon name="lock" size={11} stroke={2.5} /> finish cores
                </span>
              )}
              <span className="hicon">
                <HabitIcon icon={h.icon} size={25} />
              </span>
              <div className="hbody">
                <div className="hname">{h.name}</div>
                <div className="hsub">{h.is_core ? 'core habit' : 'bonus · +1 ✦'}</div>
              </div>
              <button
                className="hcheck"
                aria-label={state === 'done' ? (undoable ? `undo ${h.name}` : `${h.name} done`) : `mark ${h.name} done`}
                onClick={undoable ? () => undo(h) : interactive ? (e) => check(h, e.currentTarget) : undefined}
              >
                {state === 'done' && <SqzIcon name="check" size={19} stroke={3} />}
              </button>
              {undoable && (
                <button className="undo-chip" onClick={() => undo(h)}>
                  oops, undo
                </button>
              )}
            </div>
          )
        })}
      </div>

      {showSilly && sillyPick && (
        <SillyCard
          activity={sillyPick}
          done={sillyDone}
          pending={sillyPending}
          onToggle={toggleSilly}
        />
      )}

      {ticketAdv && ticket && (
        <div className="board-ticket">
          <span className="bt-icon">
            <SqzIcon name={ticketAdv.illustration} size={26} />
          </span>
          <div className="col grow">
            <span className="bt-name">{ticketAdv.name}</span>
            <span className="bt-when">your adventure · {formatDay(ticket.planned_for)}</span>
          </div>
          <SqzIcon name="sparkle" size={18} color="#FFE49C" />
        </div>
      )}

      {celebration && (
        <DailyWin
          streak={celebration.streak}
          streakBonus={celebration.streakBonus}
          onClose={() => setCelebration(null)}
        />
      )}
    </div>
  )
}

function SillyCard({
  activity,
  done,
  pending,
  onToggle,
}: {
  activity: SillyActivity
  done: boolean
  pending: boolean
  onToggle: (el: HTMLElement) => void
}) {
  const details = [
    activity.duration_min ? `${activity.duration_min} min` : '',
    activity.materials && activity.materials !== 'none' ? activity.materials : '',
    activity.grownup_optional ? 'grown-up optional' : '',
  ].filter(Boolean)

  return (
    <div className={'silly-card' + (done ? ' done' : '')}>
      <span className="silly-icon">
        <SqzIcon name="dice" size={24} />
      </span>
      <div className="col grow" style={{ minWidth: 0 }}>
        <span className="silly-kicker">Silly mode</span>
        <span className="silly-name">{activity.name}</span>
        <span className="silly-prompt">{activity.kid_prompt}</span>
        {details.length > 0 && <span className="silly-sub">{details.join(' · ')}</span>}
      </div>
      <button
        className="hcheck silly-check"
        disabled={pending}
        onClick={(e) => onToggle(e.currentTarget)}
        aria-label={done ? `undo ${activity.name}` : `mark ${activity.name} done`}
      >
        {done && <SqzIcon name="check" size={18} stroke={3} />}
      </button>
    </div>
  )
}

function DailyWin({ streak, streakBonus, onClose }: { streak: number; streakBonus: number; onClose: () => void }) {
  return (
    <div className="celebrate" onClick={onClose}>
      <StarBurst count={22} />
      <Zee size={86} mood="cheer" />
      <h2>
        Star-day!
        <br />
        All cores done ✦
      </h2>
      {streakBonus > 0 ? (
        <p>
          <b style={{ color: '#FFE49C' }}>{streak} days in a row</b> — that’s +{streakBonus} bonus stars
          raining into your jar!
        </p>
      ) : streak > 1 ? (
        <p>
          Your flame is <b style={{ color: '#FFC196' }}>{streak} days</b> strong. Bonus stars are unlocked!
        </p>
      ) : (
        <p>The flame is lit. Bonus stars are unlocked!</p>
      )}
      <button className="btn" onClick={onClose}>
        Keep going ✦
      </button>
    </div>
  )
}

export function isoDowToday(): number {
  return isoDow(todayLocal())
}
