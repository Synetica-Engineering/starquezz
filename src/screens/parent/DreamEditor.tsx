// The Big Dream — one slot per kid, parent-created, rare. An empty slot is
// healthy, not a bug. Pledge framing, never a price: fueled by perfect
// weeks, untouchable by spendable stars.
import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useFamily } from '../../state/family'
import { Constellation, KidAvatar, SqzIcon } from '../../components/icons'
import { Sheet, Toast, useToast } from '../../components/ui'
import type { Dream } from '../../lib/types'

interface DreamForm {
  id?: string
  name: string
  pledge_text: string
  stars_required: number
  anchor_date: string
}

export function DreamEditor() {
  const fam = useFamily()
  const [childId, setChildId] = useState(fam.children[0]?.id ?? '')
  const [form, setForm] = useState<DreamForm | null>(null)
  const [retiring, setRetiring] = useState<Dream | null>(null)
  const [toast, showToast] = useToast()
  const child = fam.children.find((c) => c.id === childId) ?? fam.children[0]

  if (!child) return <div className="view center muted">Add a kid first ✦</div>

  const active = fam.dreams.find((d) => d.child_id === child.id && d.status === 'active')
  const galaxy = fam.dreams.filter((d) => d.child_id === child.id && d.status === 'achieved')

  const save = async () => {
    if (!form) return
    const row = {
      name: form.name.trim(),
      pledge_text: form.pledge_text.trim(),
      stars_required: form.stars_required,
      anchor_date: form.anchor_date || null,
    }
    if (form.id) {
      const { error } = await supabase.from('dreams').update(row).eq('id', form.id)
      if (error) return showToast('Could not save')
    } else {
      const { error } = await supabase.from('dreams').insert({ ...row, child_id: child.id })
      if (error) return showToast(error.message.includes('one_active_dream') ? 'One dream at a time' : 'Could not save')
    }
    setForm(null)
    await fam.refresh()
  }

  const retire = async (d: Dream) => {
    const { error } = await supabase.from('dreams').update({ status: 'retired' }).eq('id', d.id)
    if (error) return showToast('Could not retire')
    setRetiring(null)
    await fam.refresh()
  }

  return (
    <div className="view scroll">
      <div className="parent-head">
        <span className="pt grow">Big Dream</span>
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

      {active ? (
        <div className="col gap12">
          <div className="pcard col gap10">
            <div className="row between">
              <span className="dname2" style={{ fontFamily: 'var(--disp)', fontWeight: 700, fontSize: 18, color: '#fff' }}>
                {active.name}
              </span>
              <span className="pill" style={{ fontSize: 13 }}>
                {active.stars_earned} / {active.stars_required} ✦
              </span>
            </div>
            <div className="constel-wrap" style={{ margin: 0 }}>
              <Constellation lit={active.stars_earned} total={active.stars_required} width={230} height={150} />
            </div>
            <div className="pledge">{active.pledge_text}</div>
            <div className="row gap8">
              <button
                className="chip edit"
                onClick={() =>
                  setForm({
                    id: active.id, name: active.name, pledge_text: active.pledge_text,
                    stars_required: active.stars_required, anchor_date: active.anchor_date ?? '',
                  })
                }
              >
                edit pledge
              </button>
              <button className="chip skip" onClick={() => setRetiring(active)}>
                retire quietly
              </button>
            </div>
          </div>
          <div className="nudge-card">
            <SqzIcon name="bulb" size={17} />
            <span>
              Each <b>perfect week</b> lights one star — spendable stars can’t buy them, so the adventure
              economy stays untouched. A bad week simply doesn’t light a star. Nothing else.
            </span>
          </div>
        </div>
      ) : (
        <div className="col gap12">
          <div className="pcard col center gap10 tac" style={{ padding: 26 }}>
            <KidAvatar avatar={child.avatar} photo={child.photo} size={48} />
            <span className="dname2" style={{ fontFamily: 'var(--disp)', fontWeight: 700, fontSize: 17, color: '#fff' }}>
              No dream in the sky right now
            </span>
            <p className="muted" style={{ fontSize: 13.5, margin: 0, lineHeight: 1.55, maxWidth: 250 }}>
              An empty slot is healthy. When {child.name} aims at something big — a telescope, a console, a
              bike — anchor it to an event and a number of perfect weeks, as a pledge.
            </p>
            <button
              className="btn"
              onClick={() => setForm({ name: '', pledge_text: '', stars_required: 10, anchor_date: '' })}
            >
              Make a pledge ✦
            </button>
          </div>
          <div className="nudge-card">
            <SqzIcon name="bulb" size={17} />
            <span>
              One dream at a time, parent-initiated, with real gaps between dreams — if the slot refills
              constantly it becomes a wage system with extra steps.
            </span>
          </div>
        </div>
      )}

      {galaxy.length > 0 && (
        <div className="col gap8" style={{ marginTop: 14 }}>
          <div className="eyebrow">Dreams come true</div>
          {galaxy.map((d) => (
            <div className="plist-row graduated" key={d.id}>
              <span className="pr-icon" style={{ color: '#86F2C8' }}>
                <SqzIcon name="sparkle" size={18} />
              </span>
              <span className="col grow">
                <span className="pr-name">{d.name}</span>
                <span className="pr-sub">{d.stars_required} perfect weeks — done</span>
              </span>
            </div>
          ))}
        </div>
      )}

      {form && (
        <Sheet onClose={() => setForm(null)}>
          <h3>{form.id ? 'Edit the pledge' : `A dream for ${child.name}`}</h3>
          <div className="col gap12">
            <div>
              <label className="field-label" htmlFor="dname">
                The dream
              </label>
              <input
                id="dname"
                className="input"
                value={form.name}
                maxLength={40}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="A real telescope"
              />
            </div>
            <div>
              <label className="field-label" htmlFor="dpledge">
                The pledge — anchored to an event, never a price
              </label>
              <textarea
                id="dpledge"
                className="input"
                value={form.pledge_text}
                maxLength={200}
                onChange={(e) => setForm({ ...form, pledge_text: e.target.value })}
                placeholder="10 perfect weeks before your birthday and the telescope comes home."
              />
            </div>
            <div>
              <label className="field-label" htmlFor="dstars">
                Perfect weeks to complete it
              </label>
              <input
                id="dstars"
                className="input"
                type="number"
                min={2}
                max={20}
                value={form.stars_required}
                onChange={(e) =>
                  setForm({ ...form, stars_required: Math.min(20, Math.max(2, Number(e.target.value))) })
                }
              />
            </div>
            <div>
              <label className="field-label" htmlFor="danchor">
                Anchor date <span style={{ textTransform: 'none', fontWeight: 600 }}>(optional)</span>
              </label>
              <input
                id="danchor"
                className="input"
                type="date"
                value={form.anchor_date}
                onChange={(e) => setForm({ ...form, anchor_date: e.target.value })}
              />
            </div>
            <button className="btn full" disabled={!form.name.trim() || !form.pledge_text.trim()} onClick={() => void save()}>
              {form.id ? 'Save the pledge' : 'Hang it in the sky ✦'}
            </button>
          </div>
        </Sheet>
      )}

      {retiring && (
        <Sheet onClose={() => setRetiring(null)}>
          <div className="col gap12 tac" style={{ padding: '6px 2px' }}>
            <h3 style={{ margin: 0 }}>Retire “{retiring.name}”?</h3>
            <p className="muted" style={{ margin: 0, fontSize: 14, lineHeight: 1.5 }}>
              It leaves the sky quietly — no drama on the kid side. Earned stars stay earned.
            </p>
            <button className="btn full danger" onClick={() => void retire(retiring)}>
              Retire the dream
            </button>
            <button className="chip skip" onClick={() => setRetiring(null)}>
              keep it
            </button>
          </div>
        </Sheet>
      )}
      <Toast message={toast} />
    </div>
  )
}
