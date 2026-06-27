export const EVERY_DAY = [1, 2, 3, 4, 5, 6, 7]
export const SCHOOL_DAYS = [1, 2, 3, 4, 5]
export const SCHOOL_NIGHTS = [1, 2, 3, 4, 7]

export function activeDaysForFrequency(frequency?: string | null): number[] {
  const f = (frequency ?? '').toLowerCase()
  if (f.includes('school nights')) return SCHOOL_NIGHTS
  if (f.includes('school days')) return SCHOOL_DAYS
  if (f.includes('3x/week')) return [1, 3, 5]
  if (f.includes('2x/week')) return [2, 4]
  if (f.includes('weekly')) return [6]
  return EVERY_DAY
}
