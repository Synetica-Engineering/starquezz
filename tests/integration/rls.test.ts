// Family isolation proofs (v1 lesson #2: RLS ownership checks everywhere).
// Ready-to-publish criterion: no parent can ever read another family's data.
import { describe, it, expect, beforeAll } from 'vitest'
import { createClient } from '@supabase/supabase-js'
import {
  URL,
  ANON_KEY,
  createFamily,
  createHabits,
  daysAgo,
  rpc,
  rpcError,
  type Family,
} from './helpers'

describe('row level security — families are fully isolated', () => {
  let famA: Family
  let famB: Family
  let habitA: string
  let adventureA: string

  beforeAll(async () => {
    famA = await createFamily('Zen')
    famB = await createFamily('Mallory Jr')
    ;[habitA] = await createHabits(famA, [{ name: 'A-family habit' }])
    await rpc(famA, 'complete_habit', { p_habit_id: habitA, p_on: daysAgo(0) })
    const { data: adv } = await famA.client
      .from('adventures')
      .insert({ parent_id: famA.parentId, name: 'A-family outing', cost: 1, tier: 1 })
      .select()
      .single()
    adventureA = adv!.id
    await famA.client.from('dreams').insert({
      child_id: famA.childId,
      name: 'A-family dream',
      pledge_text: 'private',
      stars_required: 5,
    })
  })

  it('B cannot read A through any family table', async () => {
    for (const table of [
      'children',
      'habits',
      'completions',
      'star_events',
      'adventures',
      'planned_adventures',
      'dreams',
      'week_finalizations',
      'parent_edits',
    ]) {
      const { data, error } = await famB.client.from(table).select('*')
      expect(error, `${table} select should not error`).toBeNull()
      const leaked = (data ?? []).filter(
        (row: any) =>
          row.child_id === famA.childId ||
          row.parent_id === famA.parentId ||
          row.id === famA.childId,
      )
      expect(leaked, `${table} leaked family A rows to family B`).toHaveLength(0)
    }
  })

  it('B cannot read A‘s parent row (or its PIN hash)', async () => {
    const { data } = await famB.client.from('parents').select('*')
    expect(data!.every((p) => p.id !== famA.parentId)).toBe(true)
  })

  it('B cannot create a habit for A‘s child', async () => {
    const { error } = await famB.client.from('habits').insert({
      child_id: famA.childId,
      name: 'planted habit',
    })
    expect(error).not.toBeNull()
  })

  it('B cannot update or archive A‘s habits', async () => {
    const { data } = await famB.client
      .from('habits')
      .update({ name: 'hacked' })
      .eq('id', habitA)
      .select()
    expect(data).toHaveLength(0)
    const { data: check } = await famA.client.from('habits').select('name').eq('id', habitA).single()
    expect(check!.name).toBe('A-family habit')
  })

  it('B cannot complete A‘s habit via RPC', async () => {
    const msg = await rpcError(famB, 'complete_habit', { p_habit_id: habitA, p_on: daysAgo(0) })
    expect(msg).toContain('not_found')
  })

  it('B cannot redeem from A‘s menu or spend A‘s stars', async () => {
    const msg = await rpcError(famB, 'redeem_adventure', {
      p_adventure_id: adventureA,
      p_child_id: famA.childId,
      p_planned_for: daysAgo(0),
    })
    expect(msg).toContain('not_found')
  })

  it('B cannot finalize A‘s week or adjust A‘s stars', async () => {
    const msg1 = await rpcError(famB, 'finalize_week', {
      p_child_id: famA.childId,
      p_week_start: daysAgo(14),
    })
    expect(msg1).toContain('not_found')
    const msg2 = await rpcError(famB, 'adjust_stars', {
      p_child_id: famA.childId,
      p_delta: -100,
      p_note: 'griefing',
    })
    expect(msg2).toContain('not_found')
  })

  it('clients cannot write the ledger or completions directly — RPCs only', async () => {
    const { error: ledgerErr } = await famA.client.from('star_events').insert({
      child_id: famA.childId,
      delta: 9999,
      reason: 'manual_adjust',
    })
    expect(ledgerErr).not.toBeNull()
    const { error: complErr } = await famA.client.from('completions').insert({
      habit_id: habitA,
      child_id: famA.childId,
      completed_on: daysAgo(1),
    })
    expect(complErr).not.toBeNull()
  })

  it('unauthenticated clients see nothing at all', async () => {
    const anon = createClient(URL, ANON_KEY, { auth: { persistSession: false } })
    for (const table of ['children', 'habits', 'star_events', 'habit_library', 'library_activities']) {
      const { data } = await anon.from(table).select('*')
      expect(data ?? [], `anon should see no ${table}`).toHaveLength(0)
    }
  })

  it('signup auto-creates the parents row (trigger)', async () => {
    const { data } = await famB.client.from('parents').select('id, email').single()
    expect(data!.id).toBe(famB.parentId)
    expect(data!.email).toBe(famB.email)
  })
})
