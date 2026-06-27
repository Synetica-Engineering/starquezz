// Adventure Editor — CRUD + the Adventure Library browser. Adding a library
// entry COPIES it into the family menu (rename, re-tier, attach a venue note)
// — location types stay generic, never a venue database.
import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useFamily } from '../../state/family'
import { ADVENTURE_ICONS, SqzIcon, StarToken } from '../../components/icons'
import { Sheet, Toast, useToast } from '../../components/ui'
import type { Adventure, LibraryActivity } from '../../lib/types'

const TIER_NAMES: Record<number, string> = {
  0: 'Always free (the guaranteed outing)',
  1: 'Anytime picks · 20 ✦',
  2: 'Special picks · 40 ✦',
  3: 'Premium picks · 80 ✦',
}
const TIER_COST: Record<number, number> = { 0: 0, 1: 20, 2: 40, 3: 80 }

interface AdvForm {
  id?: string
  name: string
  illustration: string
  cost: number
  tier: number
  venue_note: string
  library_id?: string | null
}

export function AdventureEditor() {
  const fam = useFamily()
  const [form, setForm] = useState<AdvForm | null>(null)
  const [library, setLibrary] = useState(false)
  const [toast, showToast] = useToast()

  const menu = fam.adventures.filter((a) => !a.archived_at)

  const save = async () => {
    if (!form || !fam.parent) return
    const row = {
      name: form.name.trim(),
      illustration: form.illustration,
      cost: form.cost,
      tier: form.tier,
      venue_note: form.venue_note.trim(),
    }
    if (form.id) {
      const { error } = await supabase.from('adventures').update(row).eq('id', form.id)
      if (error) return showToast('Could not save')
    } else {
      const { error } = await supabase
        .from('adventures')
        .insert({ ...row, parent_id: fam.parent.id, library_id: form.library_id ?? null })
      if (error) return showToast('Could not save')
    }
    setForm(null)
    await fam.refresh()
  }

  const archive = async (a: Adventure) => {
    const { error } = await supabase.from('adventures').update({ archived_at: new Date().toISOString() }).eq('id', a.id)
    if (error) return showToast('Could not archive')
    setForm(null)
    await fam.refresh()
    showToast(`"${a.name}" off the menu`)
  }

  const toggleLibrary = async (entry: LibraryActivity, existing: Adventure | null) => {
    if (!fam.parent) return
    if (existing) {
      const { error } = await supabase
        .from('adventures')
        .update({ archived_at: new Date().toISOString() })
        .eq('id', existing.id)
      if (error) return showToast('Could not remove')
      await fam.refresh()
      showToast(`"${entry.name}" off the menu`)
      return
    }
    const { error } = await supabase.from('adventures').insert({
      parent_id: fam.parent.id,
      library_id: entry.id,
      name: entry.name,
      illustration: entry.illustration,
      tier: entry.suggested_tier,
      cost: TIER_COST[entry.suggested_tier] ?? 20,
    })
    if (error) return showToast('Could not add')
    await fam.refresh()
    showToast(`"${entry.name}" on the menu`)
  }

  return (
    <div className="view scroll">
      <div className="parent-head">
        <span className="pt grow">Adventures</span>
        <button className="chip edit" onClick={() => setLibrary(true)}>
          <SqzIcon name="map" size={13} style={{ marginRight: 4, verticalAlign: -2 }} />
          library
        </button>
        <button
          className="iconbtn"
          onClick={() => setForm({ name: '', illustration: 'tent', cost: 20, tier: 1, venue_note: '' })}
          aria-label="add adventure"
        >
          <SqzIcon name="plus" size={18} />
        </button>
      </div>

      <div className="col gap14">
        {[1, 2, 3, 0].map((tier) => {
          const list = menu.filter((a) => a.tier === tier)
          if (list.length === 0) return null
          return (
            <div className="col gap8" key={tier}>
              <div className="eyebrow">{TIER_NAMES[tier]}</div>
              {list.map((a) => (
                <div className="plist-row" key={a.id}>
                  <span className="pr-icon">
                    <SqzIcon name={a.illustration} size={20} />
                  </span>
                  <span className="col grow" style={{ minWidth: 0 }}>
                    <span className="pr-name">{a.name}</span>
                    <span className="pr-sub">
                      {a.cost === 0 ? 'free' : `${a.cost} ✦`}
                      {a.venue_note && ` · ${a.venue_note}`}
                    </span>
                  </span>
                  <button
                    className="iconbtn"
                    aria-label={`edit ${a.name}`}
                    onClick={() =>
                      setForm({
                        id: a.id, name: a.name, illustration: a.illustration,
                        cost: a.cost, tier: a.tier, venue_note: a.venue_note,
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
        {menu.length === 0 && (
          <div className="pcard tac muted" style={{ padding: 24, fontSize: 14 }}>
            The menu is empty — browse the library for kid-tested ideas.
          </div>
        )}
      </div>

      {form && (
        <Sheet onClose={() => setForm(null)}>
          <h3>{form.id ? 'Edit adventure' : 'New adventure'}</h3>
          <div className="col gap12">
            <div>
              <label className="field-label" htmlFor="aname">
                Name — the experience, never the object
              </label>
              <input
                id="aname"
                className="input"
                value={form.name}
                maxLength={48}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Bookshop trip — pick one book"
              />
            </div>
            <div>
              <span className="field-label">Illustration</span>
              <div className="icon-grid">
                {ADVENTURE_ICONS.map((ic) => (
                  <button
                    key={ic}
                    className={'icon-cell' + (form.illustration === ic ? ' on' : '')}
                    onClick={() => setForm({ ...form, illustration: ic })}
                    aria-label={`icon ${ic}`}
                  >
                    <SqzIcon name={ic} size={20} />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <span className="field-label">Tier</span>
              <div className="seg">
                {[1, 2, 3, 0].map((t) => (
                  <button
                    key={t}
                    className={form.tier === t ? 'on' : ''}
                    onClick={() => setForm({ ...form, tier: t, cost: TIER_COST[t] })}
                  >
                    {t === 0 ? 'free' : `T${t}`}
                  </button>
                ))}
              </div>
            </div>
            {form.tier !== 0 && (
              <div>
                <label className="field-label" htmlFor="acost">
                  Star price
                </label>
                <input
                  id="acost"
                  className="input"
                  type="number"
                  min={1}
                  max={200}
                  value={form.cost}
                  onChange={(e) => setForm({ ...form, cost: Math.max(0, Number(e.target.value)) })}
                />
              </div>
            )}
            <div>
              <label className="field-label" htmlFor="avenue">
                Your place for it <span style={{ textTransform: 'none', fontWeight: 600 }}>(optional)</span>
              </label>
              <input
                id="avenue"
                className="input"
                value={form.venue_note}
                maxLength={60}
                onChange={(e) => setForm({ ...form, venue_note: e.target.value })}
                placeholder="the playground by the lake"
              />
              <p className="muted" style={{ fontSize: 12, lineHeight: 1.5, margin: '8px 0 0' }}>
                Souvenir rule: an object is fine if it’s chosen together <i>during</i> the outing, within your
                bounds, and creates future play — the line item stays the experience, never the thing.
              </p>
            </div>
            <button className="btn full" disabled={!form.name.trim()} onClick={() => void save()}>
              {form.id ? 'Save changes' : 'Add to the menu'}
            </button>
            {form.id && (
              <button className="btn full danger" onClick={() => void archive(fam.adventures.find((a) => a.id === form.id)!)}>
                Archive — off the menu, history kept
              </button>
            )}
          </div>
        </Sheet>
      )}

      {library && <AdventureLibrarySheet onToggle={toggleLibrary} onClose={() => setLibrary(false)} />}
      <Toast message={toast} />
    </div>
  )
}

function AdventureLibrarySheet({
  onToggle,
  onClose,
}: {
  onToggle: (e: LibraryActivity, existing: Adventure | null) => Promise<void>
  onClose: () => void
}) {
  const fam = useFamily()
  const [energy, setEnergy] = useState<'all' | 'indoor' | 'outdoor'>('all')
  const [freeOnly, setFreeOnly] = useState(false)
  const [pendingId, setPendingId] = useState<string | null>(null)
  const activeByLibrary = new Map(
    fam.adventures.filter((a) => !a.archived_at && a.library_id).map((a) => [a.library_id!, a]),
  )
  const list = fam.activityLibrary.filter(
    (a) =>
      (energy === 'all' || a.energy === energy || a.energy === 'either') && (!freeOnly || a.cost === 'free'),
  )
  return (
    <Sheet onClose={onClose}>
      <h3>Adventure Library</h3>
      <p className="muted" style={{ fontSize: 13, margin: '-6px 0 10px', lineHeight: 1.5 }}>
        Kid-tested ideas you can run tonight after reading three sentences. Adding copies it into your menu —
        rename it, re-tier it, make it yours.
      </p>
      <div className="filter-row">
        {(['all', 'indoor', 'outdoor'] as const).map((e) => (
          <button key={e} className={'fchip' + (energy === e ? ' on' : '')} onClick={() => setEnergy(e)}>
            {e}
          </button>
        ))}
        <button className={'fchip' + (freeOnly ? ' on' : '')} onClick={() => setFreeOnly(!freeOnly)}>
          free only
        </button>
      </div>
      <div className="col gap10">
        {list.map((a) => {
          const existing = activeByLibrary.get(a.id) ?? null
          const selected = Boolean(existing)
          const pending = pendingId === a.id
          return (
            <div className={'lib-card' + (selected ? ' on' : '')} key={a.id}>
              <div className="lc-head">
                <span className="lc-ic">
                  <SqzIcon name={a.illustration} size={21} />
                </span>
                <span className="col grow">
                  <span className="lc-name">{a.name}</span>
                  <span className="lc-tags">
                    {a.duration_min} min · {a.energy} · {a.cost} · {a.location_type} · ages {a.age_min}–{a.age_max}
                  </span>
                </span>
                <button
                  className={'toggle' + (selected ? ' on' : '')}
                  disabled={pending}
                  aria-label={`${selected ? 'remove' : 'add'} ${a.name}`}
                  aria-pressed={selected}
                  onClick={() => {
                    setPendingId(a.id)
                    void onToggle(a, existing).finally(() => setPendingId(null))
                  }}
                />
              </div>
              <div className="lc-why">{a.explainer}</div>
              {a.prep && (
                <div className="lc-why" style={{ paddingTop: 0, color: 'var(--faint)' }}>
                  Prep: {a.prep} · suggested:{' '}
                  {a.suggested_tier === 0 ? 'free pick' : `tier ${a.suggested_tier}`}{' '}
                  <StarToken size={10} />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </Sheet>
  )
}
