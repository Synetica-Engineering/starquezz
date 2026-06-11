// The Weekly Digest — the ONLY recurring parent surface. The whole week in
// one glance, in and out in under two minutes. Every parent-side edit and
// failed PIN attempt leaves a footprint here (tamper-evidence by design).
import { useFamily, displayStreak, habitsForChild, scheduledOn, starDayComplete } from '../../state/family'
import { formatDay, mondayOf, todayLocal, weekDates } from '../../lib/dates'
import { SqzIcon, StarToken, KidAvatar } from '../../components/icons'
import type { Child } from '../../lib/types'

export function Digest({ onExit }: { onExit: () => void }) {
  const fam = useFamily()
  const today = todayLocal()
  const monday = mondayOf(today)

  const weekStars = (child: Child) => {
    return fam.starEvents
      .filter((e) => e.child_id === child.id && e.delta > 0 && e.created_at.slice(0, 10) >= monday)
      .reduce((s, e) => s + e.delta, 0)
  }

  const weekCells = (child: Child) =>
    weekDates(monday).map((d) => {
      const scheduled = scheduledOn(habitsForChild(fam.habits, child.id), d).some((h) => h.is_core)
      if (!scheduled) return 'off-day'
      return starDayComplete(fam.habits, fam.completions, child.id, d) ? 'on' : 'off'
    })

  const plannedOpen = fam.planned.filter((p) => p.status === 'planned')

  return (
    <div className="view scroll">
      <div className="parent-head">
        <span className="pt grow">This week</span>
        <button className="chip skip" onClick={onExit}>
          kid mode →
        </button>
      </div>

      <div className="col gap12">
        {fam.children.map((k) => {
          const cells = weekCells(k)
          const streak = displayStreak(fam.habits, fam.completions, k.id, today)
          return (
            <div className="dchild" key={k.id}>
              <div className="dc-h">
                <span className="row gap8">
                  <KidAvatar avatar={k.avatar} photo={k.photo} size={26} />
                  <span className="dname2">{k.name}</span>
                </span>
                <span className="dstat">
                  <StarToken size={14} /> {weekStars(k)} this week
                  <SqzIcon name="flame" size={14} color="#FFC196" fill="#FF9A5A" /> {streak}
                </span>
              </div>
              <div className="dgrid">
                {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
                  <div className="d" key={i}>
                    <div className={'cell' + (cells[i] === 'on' ? ' on' : cells[i] === 'off-day' ? ' off-day' : '')}></div>
                    <div className="dl">{d}</div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}

        {plannedOpen.length === 0 && (
          <div className="advstatus">
            <div className="col">
              <span className="muted" style={{ fontSize: 12 }}>
                Planned adventure
              </span>
              <span className="dname2" style={{ fontSize: 15 }}>
                None yet — the ceremony picks one
              </span>
            </div>
          </div>
        )}
        {plannedOpen.map((p) => {
          const adv = fam.adventures.find((a) => a.id === p.adventure_id)
          const kid = fam.children.find((c) => c.id === p.child_id)
          return (
            <div className="advstatus" key={p.id}>
              <div className="col">
                <span className="muted" style={{ fontSize: 12 }}>
                  Planned adventure · {kid?.name}
                </span>
                <span className="dname2" style={{ fontSize: 16 }}>
                  {adv?.name ?? 'Adventure'} · {formatDay(p.planned_for)}
                </span>
              </div>
              <button className="done" onClick={() => void fam.setPlannedStatus(p.id, 'done')}>
                mark done
              </button>
            </div>
          )
        })}

        {fam.parentEdits.length > 0 && (
          <div className="pcard">
            <div className="eyebrow" style={{ marginBottom: 8 }}>
              Recent changes
            </div>
            <ul className="footprints" style={{ margin: 0, paddingLeft: 18 }}>
              {fam.parentEdits.slice(0, 6).map((e) => (
                <li key={e.id}>
                  {e.summary} · {formatDay(e.created_at.slice(0, 10))}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="muted tac" style={{ fontSize: 12.5, marginTop: 16 }}>
        The whole week in one glance — in and out in two minutes.
      </div>
    </div>
  )
}
