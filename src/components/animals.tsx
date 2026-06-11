// 16 cute animal avatars — Finch-inspired, Cosmic-compatible. Same friendly
// grammar as Zee: round shapes, dot eyes, pink cheeks, nothing scary.
// A kid photo (children.photo) always wins over the animal when set.
import type { CSSProperties } from 'react'

interface Spec {
  bg: string
  fur: string
  accent: string
  label: string
}

export const ANIMALS: Record<string, Spec> = {
  cat:     { bg: '#34428A', fur: '#F2B279', accent: '#E8965A', label: 'Cat' },
  bunny:   { bg: '#7A3A6A', fur: '#F0E6E0', accent: '#E0CFC6', label: 'Bunny' },
  bear:    { bg: '#1F6A5A', fur: '#B07E4F', accent: '#8F6239', label: 'Bear' },
  fox:     { bg: '#23597D', fur: '#E8814D', accent: '#FFF3E0', label: 'Fox' },
  panda:   { bg: '#8A5A24', fur: '#F5F1EA', accent: '#2A2730', label: 'Panda' },
  puppy:   { bg: '#4A3A8A', fur: '#C9975C', accent: '#8F6239', label: 'Puppy' },
  koala:   { bg: '#705a9c', fur: '#A8AABC', accent: '#8b8da3', label: 'Koala' },
  penguin: { bg: '#2d6b8f', fur: '#3A4254', accent: '#F5F1EA', label: 'Penguin' },
  owl:     { bg: '#365C8A', fur: '#9A744A', accent: '#E8D4B0', label: 'Owl' },
  frog:    { bg: '#2a5a44', fur: '#7FBF6A', accent: '#5E9E4C', label: 'Frog' },
  mouse:   { bg: '#6A3A4A', fur: '#B8B0C4', accent: '#9A8FAA', label: 'Mouse' },
  tiger:   { bg: '#2F4A7A', fur: '#EFA04A', accent: '#3A3242', label: 'Tiger' },
  monkey:  { bg: '#3A6A7A', fur: '#9A6A42', accent: '#E8C9A0', label: 'Monkey' },
  pig:     { bg: '#4A6A3A', fur: '#F2B8C0', accent: '#E294A2', label: 'Pig' },
  chick:   { bg: '#5A4A8A', fur: '#F7D976', accent: '#F2A93C', label: 'Chick' },
  raccoon: { bg: '#6A4A2A', fur: '#A8A0B0', accent: '#3A3242', label: 'Raccoon' },
}

export const ANIMAL_KEYS = Object.keys(ANIMALS)

// existing rows from the star-N era keep a stable face
const LEGACY: Record<string, string> = {
  'star-1': 'cat', 'star-2': 'bunny', 'star-3': 'bear',
  'star-4': 'fox', 'star-5': 'panda', 'star-6': 'penguin',
}

export function resolveAnimal(key: string): string {
  if (ANIMALS[key]) return key
  return LEGACY[key] ?? 'cat'
}

const EYE = '#352B2B'

function Face({ smileY = 31 }: { smileY?: number }) {
  return (
    <g>
      <circle cx="19.5" cy="26.5" r="1.7" fill={EYE} />
      <circle cx="28.5" cy="26.5" r="1.7" fill={EYE} />
      <circle cx="20" cy="26" r="0.55" fill="#fff" />
      <circle cx="29" cy="26" r="0.55" fill="#fff" />
      <path d={`M21.4 ${smileY}c1.6 1.5 3.6 1.5 5.2 0`} stroke={EYE} strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <ellipse cx="15" cy="30" rx="2.6" ry="1.8" fill="#FF9ECB" opacity="0.5" />
      <ellipse cx="33" cy="30" rx="2.6" ry="1.8" fill="#FF9ECB" opacity="0.5" />
    </g>
  )
}

function Head({ s, r = 13.5 }: { s: Spec; r?: number }) {
  return <circle cx="24" cy="27" r={r} fill={s.fur} />
}

function animalArt(name: string): React.ReactNode {
  const s = ANIMALS[name]
  switch (name) {
    case 'cat':
      return (
        <g>
          <path d="M12 20 L14.5 9.5 L21 15.5 Z" fill={s.fur} />
          <path d="M36 20 L33.5 9.5 L27 15.5 Z" fill={s.fur} />
          <path d="M13.6 17.5 L15 11.8 L18.7 15.2 Z" fill="#FF9ECB" opacity="0.7" />
          <path d="M34.4 17.5 L33 11.8 L29.3 15.2 Z" fill="#FF9ECB" opacity="0.7" />
          <Head s={s} />
          <path d="M22.6 29.4 L25.4 29.4 L24 31 Z" fill="#E2708A" />
          <path d="M9 27 H15 M9.5 31 H15" stroke={s.accent} strokeWidth="1.2" opacity="0" />
          <Face smileY={32} />
        </g>
      )
    case 'bunny':
      return (
        <g>
          <ellipse cx="18" cy="10" rx="4" ry="9.5" fill={s.fur} transform="rotate(-8 18 10)" />
          <ellipse cx="30" cy="10" rx="4" ry="9.5" fill={s.fur} transform="rotate(8 30 10)" />
          <ellipse cx="18" cy="10.5" rx="2" ry="6.5" fill="#FF9ECB" opacity="0.6" transform="rotate(-8 18 10.5)" />
          <ellipse cx="30" cy="10.5" rx="2" ry="6.5" fill="#FF9ECB" opacity="0.6" transform="rotate(8 30 10.5)" />
          <Head s={s} />
          <path d="M22.8 29.2 L25.2 29.2 L24 30.6 Z" fill="#E2708A" />
          <Face smileY={31.6} />
        </g>
      )
    case 'bear':
      return (
        <g>
          <circle cx="13.5" cy="15.5" r="5.5" fill={s.fur} />
          <circle cx="34.5" cy="15.5" r="5.5" fill={s.fur} />
          <circle cx="13.5" cy="15.5" r="2.6" fill={s.accent} />
          <circle cx="34.5" cy="15.5" r="2.6" fill={s.accent} />
          <Head s={s} />
          <ellipse cx="24" cy="31" rx="5.5" ry="4.2" fill="#D9B98E" />
          <ellipse cx="24" cy="29.4" rx="1.9" ry="1.4" fill={EYE} />
          <path d="M21.8 32.4 c1.4 1.2 3 1.2 4.4 0" stroke={EYE} strokeWidth="1.4" fill="none" strokeLinecap="round" />
          <circle cx="19" cy="25.5" r="1.7" fill={EYE} />
          <circle cx="29" cy="25.5" r="1.7" fill={EYE} />
          <circle cx="19.5" cy="25" r="0.55" fill="#fff" />
          <circle cx="29.5" cy="25" r="0.55" fill="#fff" />
        </g>
      )
    case 'fox':
      return (
        <g>
          <path d="M11.5 21 L13 8.5 L21.5 14.5 Z" fill={s.fur} />
          <path d="M36.5 21 L35 8.5 L26.5 14.5 Z" fill={s.fur} />
          <path d="M13.4 18 L14.3 11.5 L18.9 14.8 Z" fill={s.accent} />
          <path d="M34.6 18 L33.7 11.5 L29.1 14.8 Z" fill={s.accent} />
          <Head s={s} />
          <path d="M24 40.4 c-5 0-9.5-2.6-11.7-6.8 C15 27.5 19 24.5 24 31 c5-6.5 9-3.5 11.7 2.6 C33.5 37.8 29 40.4 24 40.4 Z" fill={s.accent} />
          <path d="M22.7 33.4 L25.3 33.4 L24 35 Z" fill={EYE} />
          <circle cx="18.5" cy="26" r="1.7" fill={EYE} />
          <circle cx="29.5" cy="26" r="1.7" fill={EYE} />
          <circle cx="19" cy="25.5" r="0.55" fill="#fff" />
          <circle cx="30" cy="25.5" r="0.55" fill="#fff" />
        </g>
      )
    case 'panda':
      return (
        <g>
          <circle cx="13.5" cy="15.5" r="5.2" fill={s.accent} />
          <circle cx="34.5" cy="15.5" r="5.2" fill={s.accent} />
          <Head s={s} />
          <ellipse cx="18.5" cy="26" rx="3.6" ry="4.4" fill={s.accent} transform="rotate(-12 18.5 26)" />
          <ellipse cx="29.5" cy="26" rx="3.6" ry="4.4" fill={s.accent} transform="rotate(12 29.5 26)" />
          <circle cx="19" cy="26" r="1.5" fill="#fff" />
          <circle cx="29" cy="26" r="1.5" fill="#fff" />
          <circle cx="19.2" cy="26" r="0.8" fill={EYE} />
          <circle cx="29.2" cy="26" r="0.8" fill={EYE} />
          <ellipse cx="24" cy="31" rx="1.8" ry="1.3" fill={EYE} />
          <path d="M21.8 33.6 c1.4 1.2 3 1.2 4.4 0" stroke={EYE} strokeWidth="1.4" fill="none" strokeLinecap="round" />
        </g>
      )
    case 'puppy':
      return (
        <g>
          <ellipse cx="12.5" cy="20" rx="4.2" ry="8" fill={s.accent} transform="rotate(14 12.5 20)" />
          <ellipse cx="35.5" cy="20" rx="4.2" ry="8" fill={s.accent} transform="rotate(-14 35.5 20)" />
          <Head s={s} />
          <ellipse cx="24" cy="31.5" rx="5.5" ry="4" fill="#E8D4B0" />
          <ellipse cx="24" cy="29.6" rx="2" ry="1.5" fill={EYE} />
          <path d="M24 31 v1.6 M24 32.6 c-1 1.1-2.2 1.1-3.2 0.3 M24 32.6 c1 1.1 2.2 1.1 3.2 0.3" stroke={EYE} strokeWidth="1.3" fill="none" strokeLinecap="round" />
          <circle cx="18.5" cy="25.5" r="1.7" fill={EYE} />
          <circle cx="29.5" cy="25.5" r="1.7" fill={EYE} />
          <circle cx="19" cy="25" r="0.55" fill="#fff" />
          <circle cx="30" cy="25" r="0.55" fill="#fff" />
        </g>
      )
    case 'koala':
      return (
        <g>
          <circle cx="11" cy="18" r="6.5" fill={s.fur} />
          <circle cx="37" cy="18" r="6.5" fill={s.fur} />
          <circle cx="11" cy="18" r="3.4" fill="#FF9ECB" opacity="0.55" />
          <circle cx="37" cy="18" r="3.4" fill="#FF9ECB" opacity="0.55" />
          <Head s={s} />
          <ellipse cx="24" cy="29.5" rx="2.6" ry="3.4" fill={s.accent} />
          <Face smileY={34} />
        </g>
      )
    case 'penguin':
      return (
        <g>
          <Head s={s} r={14} />
          <path d="M24 16.5 c6.5 0 10.5 5 10.5 11.5 a17 17 0 0 1 -21 0 C13.5 21.5 17.5 16.5 24 16.5 Z" fill={s.fur} opacity="0" />
          <ellipse cx="24" cy="30" rx="9.5" ry="8.5" fill={s.accent} />
          <circle cx="19" cy="25" r="1.7" fill={EYE} />
          <circle cx="29" cy="25" r="1.7" fill={EYE} />
          <circle cx="19.5" cy="24.5" r="0.55" fill="#fff" />
          <circle cx="29.5" cy="24.5" r="0.55" fill="#fff" />
          <path d="M21.6 28.6 L26.4 28.6 L24 31.4 Z" fill="#F2A93C" />
          <ellipse cx="15.5" cy="29.5" rx="2.4" ry="1.7" fill="#FF9ECB" opacity="0.5" />
          <ellipse cx="32.5" cy="29.5" rx="2.4" ry="1.7" fill="#FF9ECB" opacity="0.5" />
        </g>
      )
    case 'owl':
      return (
        <g>
          <path d="M12 17 L15 10 L19 15 Z" fill={s.fur} />
          <path d="M36 17 L33 10 L29 15 Z" fill={s.fur} />
          <Head s={s} />
          <circle cx="18.5" cy="26" r="4.6" fill={s.accent} />
          <circle cx="29.5" cy="26" r="4.6" fill={s.accent} />
          <circle cx="18.5" cy="26" r="2" fill={EYE} />
          <circle cx="29.5" cy="26" r="2" fill={EYE} />
          <circle cx="19.1" cy="25.4" r="0.7" fill="#fff" />
          <circle cx="30.1" cy="25.4" r="0.7" fill="#fff" />
          <path d="M22 31.5 L26 31.5 L24 34 Z" fill="#F2A93C" />
        </g>
      )
    case 'frog':
      return (
        <g>
          <circle cx="16" cy="15.5" r="5" fill={s.fur} />
          <circle cx="32" cy="15.5" r="5" fill={s.fur} />
          <circle cx="16" cy="15.5" r="2.7" fill="#fff" />
          <circle cx="32" cy="15.5" r="2.7" fill="#fff" />
          <circle cx="16.3" cy="15.7" r="1.4" fill={EYE} />
          <circle cx="32.3" cy="15.7" r="1.4" fill={EYE} />
          <Head s={s} />
          <path d="M19 29 c2.6 2.6 7.4 2.6 10 0" stroke={EYE} strokeWidth="1.6" fill="none" strokeLinecap="round" />
          <ellipse cx="15" cy="29" rx="2.6" ry="1.8" fill="#FF9ECB" opacity="0.55" />
          <ellipse cx="33" cy="29" rx="2.6" ry="1.8" fill="#FF9ECB" opacity="0.55" />
          <circle cx="21" cy="24" r="0.9" fill={s.accent} />
          <circle cx="27" cy="24" r="0.9" fill={s.accent} />
        </g>
      )
    case 'mouse':
      return (
        <g>
          <circle cx="12.5" cy="15" r="6.8" fill={s.fur} />
          <circle cx="35.5" cy="15" r="6.8" fill={s.fur} />
          <circle cx="12.5" cy="15" r="3.6" fill="#FF9ECB" opacity="0.6" />
          <circle cx="35.5" cy="15" r="3.6" fill="#FF9ECB" opacity="0.6" />
          <Head s={s} />
          <circle cx="24" cy="29.6" r="1.6" fill="#E2708A" />
          <path d="M28 31.5 c2.5 0.4 4.5 -0.4 6 -2 M28 32.5 c2.5 0.8 4.8 0.6 6.6 -0.4" stroke={s.accent} strokeWidth="0.9" fill="none" strokeLinecap="round" opacity="0.9" />
          <path d="M20 31.5 c-2.5 0.4-4.5-0.4-6-2 M20 32.5 c-2.5 0.8-4.8 0.6-6.6-0.4" stroke={s.accent} strokeWidth="0.9" fill="none" strokeLinecap="round" opacity="0.9" />
          <Face smileY={32} />
        </g>
      )
    case 'tiger':
      return (
        <g>
          <circle cx="13.5" cy="15.5" r="5" fill={s.fur} />
          <circle cx="34.5" cy="15.5" r="5" fill={s.fur} />
          <circle cx="13.5" cy="15.5" r="2.4" fill="#FFE9C9" />
          <circle cx="34.5" cy="15.5" r="2.4" fill="#FFE9C9" />
          <Head s={s} />
          <path d="M24 13.5 l-1.6 3.6 h3.2 Z M17 15.5 l-0.5 3.4 l2.8-1.4 Z M31 15.5 l0.5 3.4 l-2.8-1.4 Z" fill={s.accent} />
          <path d="M11.5 24.5 l3.6 1.4 M11.8 28.5 l3.5 0.4 M36.5 24.5 l-3.6 1.4 M36.2 28.5 l-3.5 0.4" stroke={s.accent} strokeWidth="1.7" strokeLinecap="round" />
          <ellipse cx="24" cy="31" rx="4.6" ry="3.4" fill="#FFE9C9" />
          <path d="M22.8 29.6 L25.2 29.6 L24 31 Z" fill={EYE} />
          <path d="M21.9 32.4 c1.3 1.1 2.9 1.1 4.2 0" stroke={EYE} strokeWidth="1.3" fill="none" strokeLinecap="round" />
          <circle cx="19" cy="25.5" r="1.7" fill={EYE} />
          <circle cx="29" cy="25.5" r="1.7" fill={EYE} />
          <circle cx="19.5" cy="25" r="0.55" fill="#fff" />
          <circle cx="29.5" cy="25" r="0.55" fill="#fff" />
        </g>
      )
    case 'monkey':
      return (
        <g>
          <circle cx="11" cy="24" r="5" fill={s.fur} />
          <circle cx="37" cy="24" r="5" fill={s.fur} />
          <circle cx="11" cy="24" r="2.6" fill={s.accent} />
          <circle cx="37" cy="24" r="2.6" fill={s.accent} />
          <Head s={s} />
          <path d="M24 19.5 c-6.2 0-9.8 4.6-9.8 9.4 a13.5 13.5 0 0 0 19.6 0 C33.8 24.1 30.2 19.5 24 19.5 Z" fill={s.accent} />
          <circle cx="19.5" cy="26.5" r="1.7" fill={EYE} />
          <circle cx="28.5" cy="26.5" r="1.7" fill={EYE} />
          <circle cx="20" cy="26" r="0.55" fill="#fff" />
          <circle cx="29" cy="26" r="0.55" fill="#fff" />
          <ellipse cx="24" cy="31" rx="1.6" ry="1.1" fill={EYE} />
          <path d="M21.6 33.2 c1.5 1.3 3.3 1.3 4.8 0" stroke={EYE} strokeWidth="1.4" fill="none" strokeLinecap="round" />
        </g>
      )
    case 'pig':
      return (
        <g>
          <path d="M13 19.5 L12 11 L19.5 14.5 Z" fill={s.fur} />
          <path d="M35 19.5 L36 11 L28.5 14.5 Z" fill={s.fur} />
          <path d="M14.2 17.6 L13.7 13 L17.9 15 Z" fill={s.accent} />
          <path d="M33.8 17.6 L34.3 13 L30.1 15 Z" fill={s.accent} />
          <Head s={s} />
          <ellipse cx="24" cy="30" rx="4.4" ry="3.3" fill={s.accent} />
          <circle cx="22.4" cy="30" r="0.9" fill="#9A5560" />
          <circle cx="25.6" cy="30" r="0.9" fill="#9A5560" />
          <circle cx="19" cy="25" r="1.7" fill={EYE} />
          <circle cx="29" cy="25" r="1.7" fill={EYE} />
          <circle cx="19.5" cy="24.5" r="0.55" fill="#fff" />
          <circle cx="29.5" cy="24.5" r="0.55" fill="#fff" />
          <path d="M20.5 34.3 c2.2 1.4 4.8 1.4 7 0" stroke="#9A5560" strokeWidth="1.4" fill="none" strokeLinecap="round" />
        </g>
      )
    case 'chick':
      return (
        <g>
          <path d="M24 13.8 c-1.2-2.8-3.4-3.8-5.6-3.2 1 1.6 1.2 3 0.8 4.6 M24 13.8 c0.4-3 2-4.6 4.4-4.8 -0.3 1.9 0 3.4 1 4.8" stroke={s.accent} strokeWidth="1.6" fill="none" strokeLinecap="round" />
          <Head s={s} r={14} />
          <path d="M21.4 29.2 L26.6 29.2 L24 32.4 Z" fill={s.accent} />
          <circle cx="19" cy="25.5" r="1.7" fill={EYE} />
          <circle cx="29" cy="25.5" r="1.7" fill={EYE} />
          <circle cx="19.5" cy="25" r="0.55" fill="#fff" />
          <circle cx="29.5" cy="25" r="0.55" fill="#fff" />
          <ellipse cx="14.5" cy="29.5" rx="2.6" ry="1.8" fill="#FF9ECB" opacity="0.6" />
          <ellipse cx="33.5" cy="29.5" rx="2.6" ry="1.8" fill="#FF9ECB" opacity="0.6" />
        </g>
      )
    case 'raccoon':
      return (
        <g>
          <path d="M12.5 20 L14 10.5 L20.5 15 Z" fill={s.fur} />
          <path d="M35.5 20 L34 10.5 L27.5 15 Z" fill={s.fur} />
          <path d="M14.3 17.6 L15.1 12.7 L19 15.5 Z" fill={s.accent} />
          <path d="M33.7 17.6 L32.9 12.7 L29 15.5 Z" fill={s.accent} />
          <Head s={s} />
          <ellipse cx="18" cy="25.5" rx="4.2" ry="3.1" fill={s.accent} transform="rotate(-14 18 25.5)" />
          <ellipse cx="30" cy="25.5" rx="4.2" ry="3.1" fill={s.accent} transform="rotate(14 30 25.5)" />
          <circle cx="18.5" cy="25.5" r="1.6" fill="#fff" />
          <circle cx="29.5" cy="25.5" r="1.6" fill="#fff" />
          <circle cx="18.8" cy="25.6" r="0.85" fill={EYE} />
          <circle cx="29.8" cy="25.6" r="0.85" fill={EYE} />
          <ellipse cx="24" cy="32" rx="4.4" ry="3.2" fill="#E8E2EA" />
          <ellipse cx="24" cy="30.6" rx="1.7" ry="1.2" fill={EYE} />
          <path d="M22 33.2 c1.3 1.1 2.7 1.1 4 0" stroke={EYE} strokeWidth="1.3" fill="none" strokeLinecap="round" />
        </g>
      )
    default:
      return null
  }
}

export function AnimalFace({
  name,
  size = 46,
  style = {},
}: {
  name: string
  size?: number
  style?: CSSProperties
}) {
  const key = resolveAnimal(name)
  const s = ANIMALS[key]
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      style={{ borderRadius: '50%', display: 'block', ...style }}
      aria-label={s.label}
      role="img"
    >
      <clipPath id={`av-${key}`}>
        <circle cx="24" cy="24" r="24" />
      </clipPath>
      <g clipPath={`url(#av-${key})`}>
        <rect width="48" height="48" fill={s.bg} />
        {animalArt(key)}
      </g>
    </svg>
  )
}
