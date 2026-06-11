// Star economy integration tests — the trust contract with the kid.
// Runs against the local Supabase stack (supabase start).
import { describe, it, expect, beforeAll } from 'vitest'
import {
  admin,
  createFamily,
  createHabits,
  daysAgo,
  lastWeekMonday,
  balance,
  rpc,
  rpcError,
  type Family,
} from './helpers'

describe('complete_habit', () => {
  let fam: Family
  let coreA: string, coreB: string, bonus: string

  beforeAll(async () => {
    fam = await createFamily()
    ;[coreA, coreB, bonus] = await createHabits(fam, [
      { name: 'Brush teeth' },
      { name: 'Get dressed' },
      { name: 'Read a story', is_core: false },
    ])
  })

  it('awards +1 for a core habit, instantly', async () => {
    const res = await rpc(fam, 'complete_habit', { p_habit_id: coreA, p_on: daysAgo(0) })
    expect(res.awarded).toBe(1)
    expect(res.star_day).toBe(false) // coreB still open
    expect(await balance(fam)).toBe(1)
  })

  it('rejects a duplicate check-off', async () => {
    const msg = await rpcError(fam, 'complete_habit', { p_habit_id: coreA, p_on: daysAgo(0) })
    expect(msg).toContain('already_done')
  })

  it('locks bonus habits until all cores are done', async () => {
    const msg = await rpcError(fam, 'complete_habit', { p_habit_id: bonus, p_on: daysAgo(0) })
    expect(msg).toContain('cores_incomplete')
  })

  it('completing the last core lights the star-day', async () => {
    const res = await rpc(fam, 'complete_habit', { p_habit_id: coreB, p_on: daysAgo(0) })
    expect(res.star_day).toBe(true)
    expect(res.streak).toBeGreaterThanOrEqual(1)
    expect(await balance(fam)).toBe(2)
  })

  it('bonus habit pays +2 once cores are done', async () => {
    const res = await rpc(fam, 'complete_habit', { p_habit_id: bonus, p_on: daysAgo(0) })
    expect(res.awarded).toBe(2)
    expect(res.all_done).toBe(true)
    expect(await balance(fam)).toBe(4)
  })

  it('writes every award to the append-only ledger', async () => {
    const { data } = await fam.client
      .from('star_events')
      .select('delta, reason')
      .eq('child_id', fam.childId)
      .order('created_at')
    const reasons = data!.map((e) => e.reason)
    expect(reasons).toContain('habit_checkoff')
    expect(reasons).toContain('bonus_habit')
    const total = data!.reduce((s, e) => s + e.delta, 0)
    expect(total).toBe(await balance(fam))
  })

  it('rejects a habit not scheduled today', async () => {
    // a habit only active on a different ISO day than the target date
    const target = daysAgo(0)
    const targetDow = new Date(target).getUTCDay() === 0 ? 7 : new Date(target).getUTCDay()
    const otherDay = (targetDow % 7) + 1
    const [offDay] = await createHabits(fam, [{ name: 'Off-day habit', active_days: [otherDay] }])
    const msg = await rpcError(fam, 'complete_habit', { p_habit_id: offDay, p_on: target })
    expect(msg).toContain('not_scheduled_today')
    await admin.from('habits').delete().eq('id', offDay)
  })

  it('rejects archived habits', async () => {
    const [h] = await createHabits(fam, [{ name: 'Old habit' }])
    await fam.client.from('habits').update({ archived_at: new Date().toISOString() }).eq('id', h)
    const msg = await rpcError(fam, 'complete_habit', { p_habit_id: h, p_on: daysAgo(0) })
    expect(msg).toContain('habit_inactive')
    await admin.from('habits').delete().eq('id', h)
  })
})

describe('streaks', () => {
  it('pays +3 exactly once when the streak reaches 3 star-days', async () => {
    const fam = await createFamily()
    const [core] = await createHabits(fam, [{ name: 'Solo core' }])

    await rpc(fam, 'complete_habit', { p_habit_id: core, p_on: daysAgo(2) })
    await rpc(fam, 'complete_habit', { p_habit_id: core, p_on: daysAgo(1) })
    const res = await rpc(fam, 'complete_habit', { p_habit_id: core, p_on: daysAgo(0) })

    expect(res.streak).toBe(3)
    expect(res.streak_bonus).toBe(3)
    // 3 check-offs (+1 each) + streak bonus (+3)
    expect(await balance(fam)).toBe(6)

    const { data } = await fam.client
      .from('star_events')
      .select('reason')
      .eq('child_id', fam.childId)
      .eq('reason', 'streak_3')
    expect(data!.length).toBe(1)
  })

  it('off days are skipped, never break the streak', async () => {
    const fam = await createFamily()
    // figure out "today"s ISO dow, schedule habit on every day EXCEPT yesterday
    const todayDow = new Date(daysAgo(0)).getUTCDay() === 0 ? 7 : new Date(daysAgo(0)).getUTCDay()
    const yesterdayDow = todayDow === 1 ? 7 : todayDow - 1
    const days = [1, 2, 3, 4, 5, 6, 7].filter((d) => d !== yesterdayDow)
    const [core] = await createHabits(fam, [{ name: 'Skips a day', active_days: days }])

    await rpc(fam, 'complete_habit', { p_habit_id: core, p_on: daysAgo(3) })
    await rpc(fam, 'complete_habit', { p_habit_id: core, p_on: daysAgo(2) })
    // daysAgo(1) is the off day — nothing to do
    const res = await rpc(fam, 'complete_habit', { p_habit_id: core, p_on: daysAgo(0) })
    expect(res.streak).toBe(3) // off day skipped, streak unbroken
  })

  it('a missed active day breaks the streak (but never deducts stars)', async () => {
    const fam = await createFamily()
    const [core] = await createHabits(fam, [{ name: 'Strict daily' }])
    await rpc(fam, 'complete_habit', { p_habit_id: core, p_on: daysAgo(3) })
    // daysAgo(2) missed!
    await rpc(fam, 'complete_habit', { p_habit_id: core, p_on: daysAgo(1) })
    const res = await rpc(fam, 'complete_habit', { p_habit_id: core, p_on: daysAgo(0) })
    expect(res.streak).toBe(2)
    expect(await balance(fam)).toBe(3) // nothing deducted
  })
})

describe('undo_completion', () => {
  it('reverses the award within the 5-minute window', async () => {
    const fam = await createFamily()
    const [core] = await createHabits(fam, [{ name: 'Mis-tap me' }])
    await rpc(fam, 'complete_habit', { p_habit_id: core, p_on: daysAgo(0) })
    expect(await balance(fam)).toBe(1)

    const res = await rpc(fam, 'undo_completion', { p_habit_id: core, p_on: daysAgo(0) })
    expect(res.reversed).toBe(1)
    expect(await balance(fam)).toBe(0)

    // the kid can re-check after an undo
    const redo = await rpc(fam, 'complete_habit', { p_habit_id: core, p_on: daysAgo(0) })
    expect(redo.awarded).toBe(1)
  })

  it('also takes back a freshly-minted streak_3 bonus', async () => {
    const fam = await createFamily()
    const [core] = await createHabits(fam, [{ name: 'Streak undo' }])
    await rpc(fam, 'complete_habit', { p_habit_id: core, p_on: daysAgo(2) })
    await rpc(fam, 'complete_habit', { p_habit_id: core, p_on: daysAgo(1) })
    await rpc(fam, 'complete_habit', { p_habit_id: core, p_on: daysAgo(0) })
    expect(await balance(fam)).toBe(6) // 3 + streak bonus 3

    const res = await rpc(fam, 'undo_completion', { p_habit_id: core, p_on: daysAgo(0) })
    expect(res.reversed).toBe(4) // +1 check-off and +3 bonus
    expect(await balance(fam)).toBe(2)
  })

  it('refuses after the window has passed', async () => {
    const fam = await createFamily()
    const [core] = await createHabits(fam, [{ name: 'Too late' }])
    await rpc(fam, 'complete_habit', { p_habit_id: core, p_on: daysAgo(0) })
    // age the completion by 6 minutes
    await admin
      .from('completions')
      .update({ created_at: new Date(Date.now() - 6 * 60_000).toISOString() })
      .eq('habit_id', core)
    const msg = await rpcError(fam, 'undo_completion', { p_habit_id: core, p_on: daysAgo(0) })
    expect(msg).toContain('undo_window_passed')
  })
})

describe('redeem_adventure', () => {
  let fam: Family
  let advId: string
  let fallbackId: string

  beforeAll(async () => {
    fam = await createFamily()
    const { data: adv } = await fam.client
      .from('adventures')
      .insert({ parent_id: fam.parentId, name: 'Bookshop trip', cost: 3, tier: 2 })
      .select()
      .single()
    advId = adv!.id
    const { data: fb } = await fam.client
      .from('adventures')
      .insert({ parent_id: fam.parentId, name: 'Pancake morning', cost: 0, tier: 0 })
      .select()
      .single()
    fallbackId = fb!.id
  })

  it('rejects redemption with insufficient stars', async () => {
    const msg = await rpcError(fam, 'redeem_adventure', {
      p_adventure_id: advId,
      p_child_id: fam.childId,
      p_planned_for: daysAgo(-2),
    })
    expect(msg).toContain('insufficient_stars')
  })

  it('the 0-star fallback always works — the adventure always happens', async () => {
    const res = await rpc(fam, 'redeem_adventure', {
      p_adventure_id: fallbackId,
      p_child_id: fam.childId,
      p_planned_for: daysAgo(-2),
    })
    expect(res.planned_id).toBeTruthy()
    expect(res.new_balance).toBe(0)
    // no ledger noise for a free pick
    const { data } = await fam.client
      .from('star_events')
      .select('id')
      .eq('child_id', fam.childId)
      .eq('reason', 'redemption')
    expect(data!.length).toBe(0)
  })

  it('deducts atomically when affordable', async () => {
    const [core] = await createHabits(fam, [{ name: 'Earner' }])
    await rpc(fam, 'complete_habit', { p_habit_id: core, p_on: daysAgo(2) })
    await rpc(fam, 'complete_habit', { p_habit_id: core, p_on: daysAgo(1) })
    await rpc(fam, 'complete_habit', { p_habit_id: core, p_on: daysAgo(0) }) // +3 streak too
    expect(await balance(fam)).toBe(6)

    const res = await rpc(fam, 'redeem_adventure', {
      p_adventure_id: advId,
      p_child_id: fam.childId,
      p_planned_for: daysAgo(-2),
    })
    expect(res.new_balance).toBe(3)
    expect(await balance(fam)).toBe(3)

    const { data: planned } = await fam.client
      .from('planned_adventures')
      .select('*')
      .eq('child_id', fam.childId)
      .eq('status', 'planned')
    expect(planned!.length).toBe(2)
  })

  it('parent can mark the adventure done (the memory is the payoff)', async () => {
    const { data: planned } = await fam.client
      .from('planned_adventures')
      .select('id')
      .eq('child_id', fam.childId)
      .limit(1)
      .single()
    await rpc(fam, 'set_planned_adventure_status', {
      p_planned_id: planned!.id,
      p_status: 'done',
    })
    const { data: after } = await fam.client
      .from('planned_adventures')
      .select('status')
      .eq('id', planned!.id)
      .single()
    expect(after!.status).toBe('done')
  })
})

describe('finalize_week (the ceremony backend)', () => {
  it('detects a perfect week, pays +10, lights a dream star — idempotently', async () => {
    const fam = await createFamily()
    const weekStart = lastWeekMonday()
    const [core] = await createHabits(fam, [{ name: 'Weekly core' }])

    // a dream with 2 stars to go
    const { data: dream } = await fam.client
      .from('dreams')
      .insert({
        child_id: fam.childId,
        name: 'Camp-out',
        pledge_text: '12 perfect weeks before your birthday and we camp under real stars.',
        stars_required: 2,
        stars_earned: 1,
      })
      .select()
      .single()

    // complete all 7 days of last week
    for (let i = 0; i < 7; i++) {
      const d = new Date(new Date(weekStart).getTime() + i * 86400_000)
      await rpc(fam, 'complete_habit', { p_habit_id: core, p_on: d.toISOString().slice(0, 10) })
    }

    const res = await rpc(fam, 'finalize_week', {
      p_child_id: fam.childId,
      p_week_start: weekStart,
    })
    expect(res.perfect).toBe(true)
    expect(res.star_days).toBe(7)
    expect(res.awarded).toBe(10)
    expect(res.dream_star_lit).toBe(true)
    expect(res.dream_completed).toBe(true) // 1 + 1 = 2 required

    const { data: dreamAfter } = await fam.client
      .from('dreams')
      .select('stars_earned, status')
      .eq('id', dream!.id)
      .single()
    expect(dreamAfter!.stars_earned).toBe(2)
    expect(dreamAfter!.status).toBe('achieved')

    // second call: no double award
    const again = await rpc(fam, 'finalize_week', {
      p_child_id: fam.childId,
      p_week_start: weekStart,
    })
    expect(again.already_finalized).toBe(true)
    expect(again.awarded).toBe(0)
  })

  it('an imperfect week pays nothing and lights nothing — quietly', async () => {
    const fam = await createFamily()
    const weekStart = lastWeekMonday()
    const [core] = await createHabits(fam, [{ name: 'Imperfect core' }])
    // only 3 of 7 days
    for (let i = 0; i < 3; i++) {
      const d = new Date(new Date(weekStart).getTime() + i * 86400_000)
      await rpc(fam, 'complete_habit', { p_habit_id: core, p_on: d.toISOString().slice(0, 10) })
    }
    const res = await rpc(fam, 'finalize_week', {
      p_child_id: fam.childId,
      p_week_start: weekStart,
    })
    expect(res.perfect).toBe(false)
    expect(res.star_days).toBe(3)
    expect(res.awarded).toBe(0)
  })

  it('perfect adapts to the schedule: weekdays-only family with 5/5 is perfect', async () => {
    const fam = await createFamily()
    const weekStart = lastWeekMonday()
    const [core] = await createHabits(fam, [
      { name: 'Weekday core', active_days: [1, 2, 3, 4, 5] },
    ])
    for (let i = 0; i < 5; i++) {
      const d = new Date(new Date(weekStart).getTime() + i * 86400_000)
      await rpc(fam, 'complete_habit', { p_habit_id: core, p_on: d.toISOString().slice(0, 10) })
    }
    const res = await rpc(fam, 'finalize_week', {
      p_child_id: fam.childId,
      p_week_start: weekStart,
    })
    expect(res.perfect).toBe(true)
    expect(res.star_days).toBe(5)
    expect(res.active_days).toBe(5)
  })

  it('refuses to finalize a week that has not ended', async () => {
    const fam = await createFamily()
    await createHabits(fam, [{ name: 'Core' }])
    // next week's Monday is always in the future
    const nextMonday = new Date(new Date(lastWeekMonday()).getTime() + 14 * 86400_000)
    const msg = await rpcError(fam, 'finalize_week', {
      p_child_id: fam.childId,
      p_week_start: nextMonday.toISOString().slice(0, 10),
    })
    expect(msg).toContain('week_not_over')
  })
})

describe('dreams — one active slot, enforced in schema', () => {
  it('rejects a second active dream per child', async () => {
    const fam = await createFamily()
    await fam.client.from('dreams').insert({
      child_id: fam.childId,
      name: 'Telescope',
      pledge_text: '10 perfect weeks and the telescope comes home.',
      stars_required: 10,
    })
    const { error } = await fam.client.from('dreams').insert({
      child_id: fam.childId,
      name: 'Second dream',
      pledge_text: 'should fail',
      stars_required: 5,
    })
    expect(error).not.toBeNull()
    expect(error!.message).toMatch(/one_active_dream_per_child|duplicate/)
  })
})

describe('graduate_habit (the Hall of Fame)', () => {
  it('graduates with a one-time bonus and leaves a footprint', async () => {
    const fam = await createFamily()
    const [core] = await createHabits(fam, [{ name: 'Piano practice' }])
    const res = await rpc(fam, 'graduate_habit', { p_habit_id: core })
    expect(res.bonus).toBe(10)
    expect(await balance(fam)).toBe(10)

    const { data: h } = await fam.client
      .from('habits')
      .select('status, graduated_at')
      .eq('id', core)
      .single()
    expect(h!.status).toBe('graduated')
    expect(h!.graduated_at).not.toBeNull()

    const msg = await rpcError(fam, 'graduate_habit', { p_habit_id: core })
    expect(msg).toContain('already_graduated')

    const { data: edits } = await fam.client.from('parent_edits').select('summary')
    expect(edits!.some((e) => e.summary.includes('graduated'))).toBe(true)
  })
})

describe('parent PIN (tamper-evident, not tamper-proof)', () => {
  it('sets, verifies, cools down exponentially, and logs failures', async () => {
    const fam = await createFamily()
    await rpc(fam, 'set_parent_pin', { p_pin: '4321' })

    const ok = await rpc(fam, 'verify_parent_pin', { p_pin: '4321' })
    expect(ok.ok).toBe(true)

    // three failures trigger the cooldown
    for (let i = 0; i < 3; i++) {
      const bad = await rpc(fam, 'verify_parent_pin', { p_pin: '0000' })
      expect(bad.ok).toBe(false)
    }
    const locked = await rpc(fam, 'verify_parent_pin', { p_pin: '4321' })
    expect(locked.ok).toBe(false)
    expect(locked.reason).toBe('cooldown')
    expect(locked.retry_in).toBeGreaterThan(0)

    // failures left footprints for the digest
    const { data: edits } = await fam.client.from('parent_edits').select('summary')
    const failures = edits!.filter((e) => e.summary.includes('Failed parent PIN'))
    expect(failures.length).toBeGreaterThanOrEqual(3)
  })

  it('rejects malformed PINs', async () => {
    const fam = await createFamily()
    const msg = await rpcError(fam, 'set_parent_pin', { p_pin: 'abcd' })
    expect(msg).toContain('pin_format')
  })
})

describe('child secret code (optional ownership ritual)', () => {
  it('defaults to off — any code passes when none is set', async () => {
    const fam = await createFamily()
    const ok = await rpc(fam, 'verify_child_code', { p_child_id: fam.childId, p_code: '1111' })
    expect(ok).toBe(true)
  })

  it('verifies when set, can be cleared', async () => {
    const fam = await createFamily()
    await rpc(fam, 'set_child_code', { p_child_id: fam.childId, p_code: '2580' })
    expect(await rpc(fam, 'verify_child_code', { p_child_id: fam.childId, p_code: '2580' })).toBe(true)
    expect(await rpc(fam, 'verify_child_code', { p_child_id: fam.childId, p_code: '1111' })).toBe(false)
    await rpc(fam, 'set_child_code', { p_child_id: fam.childId, p_code: null })
    expect(await rpc(fam, 'verify_child_code', { p_child_id: fam.childId, p_code: '9999' })).toBe(true)
  })
})

describe('adjust_stars (quiet correction, visible footprint)', () => {
  it('adjusts the balance and logs to parent_edits', async () => {
    const fam = await createFamily()
    await rpc(fam, 'adjust_stars', { p_child_id: fam.childId, p_delta: 5, p_note: 'forgot to log Tuesday' })
    expect(await balance(fam)).toBe(5)
    await rpc(fam, 'adjust_stars', { p_child_id: fam.childId, p_delta: -2, p_note: 'mis-tap correction' })
    expect(await balance(fam)).toBe(3)
    const { data: edits } = await fam.client.from('parent_edits').select('summary')
    expect(edits!.filter((e) => e.summary.includes('Stars adjusted')).length).toBe(2)
  })
})

describe('libraries are seeded and readable', () => {
  it('ships ~30 curated adventures and 20+ habits', async () => {
    const fam = await createFamily()
    const { data: acts } = await fam.client.from('library_activities').select('id, suggested_tier')
    expect(acts!.length).toBeGreaterThanOrEqual(28)
    // at-home, zero-cost entries are first-class: a fallback-tier entry exists
    expect(acts!.some((a) => a.suggested_tier === 0)).toBe(true)
    const { data: habits } = await fam.client.from('habit_library').select('id, category')
    expect(habits!.length).toBeGreaterThanOrEqual(20)
    const cats = new Set(habits!.map((h) => h.category))
    expect(cats).toEqual(new Set(['body', 'mind', 'space', 'heart']))
  })
})
