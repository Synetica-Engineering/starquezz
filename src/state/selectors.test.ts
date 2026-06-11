// Display-mirror selectors. The authoritative economy lives in SQL (see
// tests/integration); these only guard the kid-facing display logic.
import { describe, it, expect } from 'vitest'
import { displayStreak, starDayComplete, habitsForChild } from './family'
import type { Completion, Habit } from '../lib/types'

let n = 0
function habit(over: Partial<Habit>): Habit {
  return {
    id: `h${n++}`,
    child_id: 'kid',
    library_id: null,
    name: 'Habit',
    icon: 'check',
    category: 'body',
    time_block: 'morning',
    is_core: true,
    active_days: [1, 2, 3, 4, 5, 6, 7],
    sort_order: 0,
    status: 'active',
    graduated_at: null,
    archived_at: null,
    created_at: '2026-01-01T00:00:00Z',
    ...over,
  }
}

function done(habitId: string, date: string): Completion {
  return {
    id: `c${n++}`,
    habit_id: habitId,
    child_id: 'kid',
    completed_on: date,
    created_at: `${date}T08:00:00Z`,
  }
}

describe('starDayComplete (display mirror)', () => {
  it('needs every scheduled core done; bonus habits never gate it', () => {
    const core = habit({ id: 'core' })
    const bonus = habit({ id: 'bonus', is_core: false })
    expect(starDayComplete([core, bonus], [done('core', '2026-06-10')], 'kid', '2026-06-10')).toBe(true)
    expect(starDayComplete([core, bonus], [], 'kid', '2026-06-10')).toBe(false)
  })

  it('a day with no cores scheduled is an off day, not a star-day', () => {
    const weekdayCore = habit({ id: 'wd', active_days: [1, 2, 3, 4, 5] })
    // 2026-06-13 is a Saturday
    expect(starDayComplete([weekdayCore], [], 'kid', '2026-06-13')).toBe(false)
  })

  it('archived and graduated habits do not gate the star-day', () => {
    const live = habit({ id: 'live' })
    const archived = habit({ id: 'old', archived_at: '2026-06-01T00:00:00Z' })
    const graduated = habit({ id: 'grad', status: 'graduated', graduated_at: '2026-06-01T00:00:00Z' })
    expect(
      starDayComplete([live, archived, graduated], [done('live', '2026-06-10')], 'kid', '2026-06-10'),
    ).toBe(true)
  })
})

describe('displayStreak (the flame)', () => {
  it('counts consecutive star-days; an in-progress today does not break it', () => {
    const core = habit({ id: 'c1' })
    const completions = [done('c1', '2026-06-10'), done('c1', '2026-06-11')]
    // as of the 12th, today incomplete → streak holds at 2
    expect(displayStreak([core], completions, 'kid', '2026-06-12')).toBe(2)
    // completing today extends it
    expect(displayStreak([core], [...completions, done('c1', '2026-06-12')], 'kid', '2026-06-12')).toBe(3)
  })

  it('off days are skipped, a missed active day breaks the run', () => {
    // active Mon-Fri only; June 6-7 2026 are Sat/Sun
    const core = habit({ id: 'c2', active_days: [1, 2, 3, 4, 5] })
    const completions = [done('c2', '2026-06-05'), done('c2', '2026-06-08')] // Fri + Mon
    expect(displayStreak([core], completions, 'kid', '2026-06-08')).toBe(2) // weekend skipped
    const broken = [done('c2', '2026-06-04'), done('c2', '2026-06-08')] // Thu, missed Fri
    expect(displayStreak([core], broken, 'kid', '2026-06-08')).toBe(1)
  })
})

describe('habitsForChild', () => {
  it('filters to the child, active, unarchived', () => {
    const mine = habit({ id: 'a' })
    const archived = habit({ id: 'b', archived_at: '2026-01-02T00:00:00Z' })
    const graduated = habit({ id: 'c', status: 'graduated' })
    const other = habit({ id: 'd', child_id: 'sibling' })
    expect(habitsForChild([mine, archived, graduated, other], 'kid').map((h) => h.id)).toEqual(['a'])
  })
})
