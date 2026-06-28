// The Sunday Star Ceremony — a guided, couch-together sequence:
// recap → streak reveal (dream star beat) → adventure pick → sealed ticket.
// Backend: finalize_week (idempotent). It recaps the most recently finished
// week, so the ritual works on the couch any day.
import { useEffect, useMemo, useState } from 'react'
import { useFamily, habitsForChild } from '../../state/family'
import { addDays, formatDay, isoDow, lastFinishedWeekMonday, todayLocal, weekDates } from '../../lib/dates'
import { Constellation, SqzIcon } from '../../components/icons'
import { StarBurst } from '../../components/ui'
import { Zee } from '../../components/Zee'
import { playCeremony, playDailyWin } from '../../lib/sound'
import type { Adventure, Child, FinalizeResult } from '../../lib/types'

export function Ceremony({ child, onClose }: { child: Child; onClose: () => void }) {
  const fam = useFamily()
  const today = todayLocal()
  const weekStart = lastFinishedWeekMonday(today)
  const [step, setStep] = useState(0)
  const [result, setResult] = useState<FinalizeResult | null>(null)
  const [error, setError] = useState(false)
  const [litCells, setLitCells] = useState(0)
  const [pick, setPick] = useState<Adventure | null>(null)
  const [sealing, setSealing] = useState(false)
  const [sealed, setSealed] = useState<string | null>(null)

  // the ceremony's star-day cells, computed from that week's completions
  const weekCells = useMemo(() => {
    const days = weekDates(weekStart)
    const kidHabits = habitsForChild(fam.habits, child.id)
    return days.map((d) => {
      const dow = isoDow(d)
      const cores = kidHabits.filter((h) => h.is_core && h.active_days.includes(dow))
      if (cores.length === 0) return 'off-day' as const
      const all = cores.every((h) => fam.completions.some((c) => c.habit_id === h.id && c.completed_on === d))
      return all ? ('on' as const) : ('off' as const)
    })
  }, [fam.habits, fam.completions, child.id, weekStart])

  useEffect(() => {
    playCeremony()
    fam
      .finalizeWeek(child.id, weekStart)
      .then(setResult)
      .catch(() => setError(true))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // recap: light the cells one by one with escalating tempo
  useEffect(() => {
    if (step !== 0) return
    setLitCells(0)
    let i = 0
    const timer = setInterval(() => {
      i++
      setLitCells(i)
      if (i >= 7) clearInterval(timer)
    }, 280)
    return () => clearInterval(timer)
  }, [step])

  const seal = async () => {
    if (!pick || sealing) return
    setSealing(true)
    const dow = isoDow(today)
    const nextSaturday = addDays(today, (6 - dow + 7) % 7 || 7)
    try {
      await fam.redeemAdventure(pick.id, child.id, nextSaturday)
      setSealed(nextSaturday)
      playDailyWin()
      setStep(3)
    } catch {
      setError(true)
    } finally {
      setSealing(false)
    }
  }

  const Dots = () => (
    <div className="dots">
      {[0, 1, 2, 3].map((i) => (
        <i key={i} className={i <= step ? 'on' : ''} />
      ))}
    </div>
  )

  const menu = fam.adventures.filter((a) => !a.archived_at)
  const pickable = menu.filter((a) => a.tier === 0 || child.star_balance >= a.cost)
  const ceremonyDreams = fam.dreams.filter(
    (d) => d.child_id === child.id && (d.status === 'active' || d.status === 'achieved'),
  )
  const starDays = result?.star_days ?? weekCells.filter((c) => c === 'on').length
  const perfect = result?.perfect ?? false

  return (
    <div className="cer">
      <button className="iconbtn close-x" onClick={onClose} aria-label="close ceremony">
        <SqzIcon name="x" size={16} />
      </button>

      {step === 0 && (
        <>
          <div className="kicker">Star ceremony</div>
          <h2>Let’s look at your week</h2>
          <div className="weekstrip" style={{ gap: 10, width: 252 }}>
            {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
              <div className="d" key={i}>
                <div
                  className={
                    'cell' +
                    (i < litCells && weekCells[i] === 'on' ? ' on' : '') +
                    (weekCells[i] === 'off-day' ? ' off-day' : '')
                  }
                ></div>
                <div className="dl">{d}</div>
              </div>
            ))}
          </div>
          <p>
            {starDays > 0 ? (
              <>
                You lit <b style={{ color: '#FFE49C' }}>{starDays} star-day{starDays === 1 ? '' : 's'}</b>{' '}
                {perfect ? '— a perfect week!' : 'this week.'}
              </>
            ) : (
              <>A fresh page this week — the stars are waiting.</>
            )}
          </p>
          <button className="btn" onClick={() => setStep(1)}>
            Count my stars ✦
          </button>
          <Dots />
        </>
      )}

      {step === 1 && (
        <>
          {perfect ? (
            <>
              <StarBurst count={16} />
              <div className="kicker">Perfect week</div>
              <Zee size={78} mood="cheer" />
              {result?.awarded ? (
                <h2>
                  +{result.awarded} stars
                  <br />
                  rain into your jar ✦
                </h2>
              ) : (
                <h2>Every day shone ✦</h2>
              )}
              {ceremonyDreams.length > 0 && (result?.dream_star_lit || ceremonyDreams.some((d) => d.status === 'achieved')) && (
                <>
                  {ceremonyDreams.map((dream) => (
                    <div key={dream.id} style={{ marginBottom: 10 }}>
                      <div className="constel-wrap" style={{ width: 250, margin: 0 }}>
                        <Constellation
                          lit={dream.stars_earned}
                          total={dream.stars_required}
                          width={236}
                          height={160}
                          flashNew={result?.dream_star_lit ?? false}
                        />
                      </div>
                      <p>
                        {dream.status === 'achieved' || result?.dream_completed ? (
                          <>
                            <b style={{ color: '#86F2C8' }}>The constellation is complete.</b> {dream.name} is
                            coming true!
                          </>
                        ) : (
                          <>
                            A new mark joins your sky — {dream.stars_earned} of {dream.stars_required} toward{' '}
                            <b style={{ color: '#FFE49C' }}>{dream.name}</b>.
                          </>
                        )}
                      </p>
                    </div>
                  ))}
                </>
              )}
              {ceremonyDreams.length === 0 && result?.streak != null && result.streak > 0 && (
                <p>
                  Your flame burns <b style={{ color: '#FFC196' }}>{result.streak} days</b> strong.
                </p>
              )}
            </>
          ) : (
            <>
              <div className="kicker">The week in stars</div>
              <Zee size={78} mood="awake" />
              <h2>
                {starDays > 0 ? `${starDays} star-day${starDays === 1 ? '' : 's'} — nice!` : 'Next week, the stars!'}
              </h2>
              <p>Every week starts fresh. The adventure still happens — that’s the rule.</p>
            </>
          )}
          <button className="btn" onClick={() => setStep(2)}>
            Pick this week’s adventure →
          </button>
          <Dots />
        </>
      )}

      {step === 2 && (
        <>
          <div className="kicker">Your reward</div>
          <h2>Where to next?</h2>
          <div className="col gap10 scroll" style={{ width: 252, maxHeight: 300, overflowY: 'auto' }}>
            {pickable.map((a) => (
              <button
                key={a.id}
                className={'adv ' + (pick?.id === a.id ? 'unlocked' : a.tier === 0 ? 'fallback' : '')}
                style={{ border: 'none', cursor: 'pointer', textAlign: 'left', padding: 0, background: '#152150', width: '100%' }}
                onClick={() => setPick(a)}
              >
                <div className="meta" style={{ padding: '14px 16px' }}>
                  <span className="row gap10">
                    <SqzIcon name={a.illustration} size={22} />
                    <span className="col">
                      <span className="an" style={{ fontSize: 16 }}>
                        {a.name}
                      </span>
                      <span className="as">{a.tier === 0 ? 'free · always yours' : `${a.cost} ✦`}</span>
                    </span>
                  </span>
                  {pick?.id === a.id && <SqzIcon name="check" size={20} color="#86F2C8" stroke={3} />}
                </div>
              </button>
            ))}
          </div>
          {error && <p style={{ color: '#FF9CC6' }}>Hmm, that didn’t work — try another pick.</p>}
          <button className="btn" disabled={!pick || sealing} onClick={seal}>
            {sealing ? 'sealing…' : 'Seal it ✦'}
          </button>
          <Dots />
        </>
      )}

      {step === 3 && pick && (
        <>
          <div className="kicker">Sealed!</div>
          <div className="ticket">
            <div className="tart">
              <SqzIcon name={pick.illustration} size={48} stroke={1.7} />
            </div>
            <div className="tbody">
              <div className="ttitle">{pick.name}</div>
              <div className="tmeta">{sealed ? formatDay(sealed) : 'this week'} · together</div>
            </div>
            <div className="tstub">
              <SqzIcon name="tent" size={15} color="#8a93b0" /> TICKET — keep me!
            </div>
          </div>
          <p>Look forward to it all week — it’ll wait on your board.</p>
          <button className="btn" onClick={onClose}>
            Back to my stars
          </button>
          <Dots />
        </>
      )}
    </div>
  )
}
