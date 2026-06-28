// Starquezz re-run — parent-initiated only: new school year, a birthday, a
// graduated habit opening a slot, or "the menu feels stale".
import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useFamily, habitsForChild } from '../../state/family'
import { KidAvatar, SqzIcon } from '../../components/icons'
import { Zee } from '../../components/Zee'
import { ScoutChat } from '../firstrun/Scout'
import type { Child } from '../../lib/types'

export function ScoutRerun() {
  const fam = useFamily()
  const [child, setChild] = useState<Child | null>(null)
  const [done, setDone] = useState(false)

  if (done) {
    return (
      <div className="view full" style={{ gap: 16, textAlign: 'center', padding: 28 }}>
        <Zee size={72} mood="cheer" />
        <div className="dname" style={{ fontSize: 22, justifyContent: 'center' }}>
          Fresh ideas accepted ✦
        </div>
        <p className="muted" style={{ margin: 0, fontSize: 14, lineHeight: 1.5 }}>
          Everything you accepted is live — tweak details any time in the editors.
        </p>
        <button className="btn" onClick={() => setDone(false)}>
          Back to Starquezz
        </button>
      </div>
    )
  }

  if (!child) {
    return (
      <div className="view scroll">
        <div className="parent-head">
          <Zee size={36} mood="awake" />
          <span className="pt grow">Starquezz</span>
        </div>
        <p className="muted" style={{ fontSize: 14, lineHeight: 1.55, margin: '0 0 14px' }}>
          Re-run the conversation when something shifts — a new school year, a birthday, a graduated habit
          opening a slot, or a menu that feels stale. Who is it about?
        </p>
        <div className="col gap10">
          {fam.children.map((c) => {
            const habitCount = habitsForChild(fam.habits, c.id).length
            return (
              <button
                key={c.id}
                className="plist-row"
                style={{ border: 'none', cursor: 'pointer', textAlign: 'left' }}
                onClick={() => setChild(c)}
              >
                <KidAvatar avatar={c.avatar} photo={c.photo} size={40} />
                <span className="col grow">
                  <span className="pr-name">{c.name}</span>
                  <span className="pr-sub">{habitCount} active habits</span>
                </span>
                <SqzIcon name="chevron-r" size={16} color="var(--faint)" />
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  const age = child.birth_year ? new Date().getFullYear() - child.birth_year : 7

  return (
    <ScoutChat
      childName={child.name}
      age={age}
      interests={child.interests.join(', ')}
      onManual={() => setChild(null)}
      onAccepted={async (habitRows, advRows) => {
        if (habitRows.length > 0) {
          const existing = habitsForChild(fam.habits, child.id).length
          await supabase
            .from('habits')
            .insert(habitRows.map((h, i) => ({ ...h, child_id: child.id, sort_order: existing + i })))
        }
        if (advRows.length > 0 && fam.parent) {
          await supabase.from('adventures').insert(advRows.map((a) => ({ ...a, parent_id: fam.parent!.id })))
        }
        await fam.refresh()
        setDone(true)
        setChild(null)
      }}
    />
  )
}
