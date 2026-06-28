import type { CSSProperties } from 'react'
import { SqzIcon } from './icons'

export const HABIT_EMOJIS = [
  '🪥', '🧼', '👕', '🍽️', '🥣', '🥤', '💧', '🍎', '🏃', '⚽', '🛏️',
  '📚', '🎒', '✏️', '🔢', '🎹', '🎸', '🎵', '🎨', '🧱', '🧹', '🧺',
  '🌱', '🐾', '💛', '😊', '🙏', '🧘', '✅',
]

const LEGACY_TO_EMOJI: Record<string, string> = {
  tooth: '🪥',
  shirt: '👕',
  bowl: '🥣',
  book: '📚',
  backpack: '🎒',
  drop: '💧',
  water: '🥤',
  ball: '⚽',
  bed: '🛏️',
  'bed-made': '🛏️',
  music: '🎵',
  pencil: '✏️',
  bulb: '💡',
  paint: '🎨',
  blocks: '🧱',
  fork: '🍽️',
  plant: '🌱',
  heart: '💛',
  'sparkle-heart': '💛',
  hands: '🙏',
  paw: '🐾',
  dice: '🎲',
  check: '✅',
}

export function emojiForHabitIcon(icon: string): string | null {
  if (/\p{Extended_Pictographic}/u.test(icon)) return icon
  return LEGACY_TO_EMOJI[icon] ?? null
}

export function HabitIcon({
  icon,
  size = 22,
  style,
}: {
  icon: string
  size?: number
  style?: CSSProperties
}) {
  const emoji = emojiForHabitIcon(icon)
  if (emoji) {
    return (
      <span
        className="habit-emoji"
        style={{ fontSize: size, lineHeight: 1, ...style }}
        aria-hidden
      >
        {emoji}
      </span>
    )
  }
  return <SqzIcon name={icon} size={size} style={style} />
}
