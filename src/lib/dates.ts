import type { TimeBlock } from './types'

/** The kid's local calendar date, YYYY-MM-DD. */
export function todayLocal(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/** ISO day of week 1 (Mon) … 7 (Sun) for a local date string. */
export function isoDow(date: string): number {
  const [y, m, d] = date.split('-').map(Number)
  const dow = new Date(y, m - 1, d).getDay()
  return dow === 0 ? 7 : dow
}

export function addDays(date: string, n: number): string {
  const [y, m, d] = date.split('-').map(Number)
  const dt = new Date(y, m - 1, d + n)
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`
}

/** Monday of the week containing `date`. */
export function mondayOf(date: string): string {
  return addDays(date, 1 - isoDow(date))
}

/** Monday of the most recent week whose Sunday is over (ceremony target). */
export function lastFinishedWeekMonday(today = todayLocal()): string {
  const thisMonday = mondayOf(today)
  return isoDow(today) === 7 ? thisMonday : addDays(thisMonday, -7)
}

/** The 7 dates of the week starting at monday. */
export function weekDates(monday: string): string[] {
  return Array.from({ length: 7 }, (_, i) => addDays(monday, i))
}

export function currentBlock(now = new Date()): TimeBlock {
  const h = now.getHours()
  if (h >= 4 && h < 12) return 'morning'
  if (h >= 12 && h < 18) return 'afternoon'
  return 'evening'
}

export const BLOCKS: TimeBlock[] = ['morning', 'afternoon', 'evening']

export const BLOCK_LABEL: Record<TimeBlock, string> = {
  morning: 'Morning',
  afternoon: 'After school',
  evening: 'Evening',
}

export const BLOCK_ICON: Record<TimeBlock, string> = {
  morning: 'sun',
  afternoon: 'backpack',
  evening: 'moon',
}

export function formatDay(date: string): string {
  const [y, m, d] = date.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('en', { weekday: 'short', day: 'numeric', month: 'short' })
}
