// The Star Jar — counting things is the fun. The balance feels physical,
// the Big Dream constellation fills star-by-star, the galaxy collects dreams
// come true, and the Hall of Fame shows who you've become.
import { useFamily, graduatedHabits, starDayComplete, displayStreak } from '../../state/family'
import { mondayOf, todayLocal, weekDates, isoDow, formatDay } from '../../lib/dates'
import { Constellation, SqzIcon, StarToken } from '../../components/icons'
import { HabitIcon } from '../../components/HabitIcon'
import { WeekStrip } from '../../components/ui'
import { scheduledOn, habitsForChild } from '../../state/family'
import type { Child } from '../../lib/types'

export function StarJar({ child, onCeremony }: { child: Child; onCeremony: () => void }) {
  const fam = useFamily()
  const today = todayLocal()
  const jarStars = Math.min(child.star_balance, 40)
  const streak = displayStreak(fam.habits, fam.completions, child.id, today)

  const week = weekDates(mondayOf(today)).map((d) => {
    const scheduled = scheduledOn(habitsForChild(fam.habits, child.id), d).some((h) => h.is_core)
    if (!scheduled) return 'off-day' as const
    return starDayComplete(fam.habits, fam.completions, child.id, d) ? ('on' as const) : ('off' as const)
  })

  const activeDreams = fam.dreams.filter((d) => d.child_id === child.id && d.status === 'active')
  const galaxy = fam.dreams.filter((d) => d.child_id === child.id && d.status === 'achieved')
  const hall = graduatedHabits(fam.habits, child.id)
  const isSunday = isoDow(today) === 7

  return (
    <div className="view scroll">
      <div className="tac" style={{ padding: '2px 0 4px' }}>
        <div className="eyebrow">Your stars</div>
      </div>
      <div className="jar">
        <div className="lid"></div>
        <div className="glass"></div>
        <div className="stars">
          {Array.from({ length: jarStars }).map((_, i) => (
            <StarToken key={i} size={16} glow={i % 4 === 0} />
          ))}
        </div>
      </div>
      <div className="jar-count">
        {child.star_balance} <span style={{ fontSize: 16, color: 'var(--muted)' }}>stars</span>
      </div>

      <div style={{ marginTop: 10 }}>
        <WeekStrip days={week} />
      </div>
      <div className="row center gap8" style={{ margin: '10px 0 14px', color: 'var(--muted)', fontSize: 13.5 }}>
        <SqzIcon name="flame" size={16} color="#FFC196" fill="#FF9A5A" />
        {streak > 0 ? (
          <span>
            <b style={{ color: '#FFE49C' }}>{streak}-day streak</b> — keep the flame alive!
          </span>
        ) : (
          <span>finish your cores to light the flame</span>
        )}
      </div>

      {activeDreams.length > 0 && (
        <>
          <div className="eyebrow" style={{ marginBottom: 6 }}>
            Big Dreams
          </div>
          {activeDreams.map((dream) => (
            <div key={dream.id} style={{ marginBottom: 14 }}>
              <div className="constel-wrap">
                <Constellation lit={dream.stars_earned} total={dream.stars_required} width={250} height={172} />
              </div>
              <div className="progress-line" style={{ marginBottom: 10 }}>
                <span className="num">{dream.stars_earned}</span>
                <div className="progress-track">
                  <div
                    className="progress-fill"
                    style={{ width: `${(dream.stars_earned / dream.stars_required) * 100}%` }}
                  ></div>
                </div>
                <span className="of">
                  of {dream.stars_required} perfect weeks → {dream.name}
                </span>
              </div>
              <div className="pledge">
                {dream.pledge_text}
                {dream.anchor_date && (
                  <>
                    {' '}
                    <span className="date">{formatDay(dream.anchor_date)}</span>
                  </>
                )}
              </div>
            </div>
          ))}
        </>
      )}

      {galaxy.length > 0 && (
        <div className="galaxy-foot" style={{ marginBottom: 14 }}>
          <span className="glabel">Your galaxy</span>
          <span className="row gap6 wrap">
            {galaxy.map((d) => (
              <span key={d.id} className="row gap4" title={d.name}>
                <StarToken size={14} color="#86F2C8" /> {d.name}
              </span>
            ))}
          </span>
        </div>
      )}

      {hall.length > 0 && (
        <div className="hall" style={{ marginBottom: 14 }}>
          <div className="eyebrow">Hall of Fame — things you just do now</div>
          <div className="shelf">
            {hall.map((h) => (
              <div className="trophy" key={h.id}>
                <span className="ticon">
                  <HabitIcon icon={h.icon} size={26} />
                </span>
                <span className="tname">{h.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ marginTop: 'auto', paddingTop: 6 }}>
        <button className="btn full aqua" onClick={onCeremony}>
          {isSunday ? 'It’s Sunday — start the ceremony ✦' : 'Star ceremony ✦'}
        </button>
      </div>
    </div>
  )
}
