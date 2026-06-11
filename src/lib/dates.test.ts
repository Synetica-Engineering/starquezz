import { describe, it, expect } from 'vitest'
import {
  addDays,
  currentBlock,
  isoDow,
  lastFinishedWeekMonday,
  mondayOf,
  weekDates,
} from './dates'

describe('date math (local, DST-safe)', () => {
  it('isoDow: Monday=1 … Sunday=7', () => {
    expect(isoDow('2026-06-08')).toBe(1) // Monday
    expect(isoDow('2026-06-12')).toBe(5) // Friday
    expect(isoDow('2026-06-14')).toBe(7) // Sunday
  })

  it('addDays crosses month boundaries', () => {
    expect(addDays('2026-06-30', 1)).toBe('2026-07-01')
    expect(addDays('2026-06-01', -1)).toBe('2026-05-31')
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01')
  })

  it('mondayOf returns the Monday of the containing week', () => {
    expect(mondayOf('2026-06-12')).toBe('2026-06-08')
    expect(mondayOf('2026-06-08')).toBe('2026-06-08')
    expect(mondayOf('2026-06-14')).toBe('2026-06-08') // Sunday belongs to its week
  })

  it('lastFinishedWeekMonday: previous week on weekdays, current week on Sunday', () => {
    expect(lastFinishedWeekMonday('2026-06-12')).toBe('2026-06-01') // Friday → last week
    expect(lastFinishedWeekMonday('2026-06-14')).toBe('2026-06-08') // Sunday → this week
    expect(lastFinishedWeekMonday('2026-06-15')).toBe('2026-06-08') // Monday → last week
  })

  it('weekDates spans Monday..Sunday', () => {
    const days = weekDates('2026-06-08')
    expect(days).toHaveLength(7)
    expect(days[0]).toBe('2026-06-08')
    expect(days[6]).toBe('2026-06-14')
  })

  it('currentBlock maps hours to time blocks', () => {
    expect(currentBlock(new Date(2026, 5, 12, 7))).toBe('morning')
    expect(currentBlock(new Date(2026, 5, 12, 14))).toBe('afternoon')
    expect(currentBlock(new Date(2026, 5, 12, 20))).toBe('evening')
    expect(currentBlock(new Date(2026, 5, 12, 2))).toBe('evening') // small hours
  })
})
