// Single-stroke friendly icon set + star/constellation primitives.
// Icon-first by design: a pre-reader must be able to run her whole routine
// without reading a word (DESIGN_BRIEF §2).
import type { CSSProperties } from 'react'

const P: Record<string, string | string[]> = {
  // ---- habits / daily life
  tooth: 'M12 3.4c-2.6 0-4.2 1-5.1 2.1C5.7 6.9 5.6 8.4 6 10c.4 1.7.6 3 .9 4.6.3 1.9.6 4 1.8 4 .9 0 1-1.4 1.4-2.6.3-.8.5-1.3.9-1.3s.6.5.9 1.3c.4 1.2.5 2.6 1.4 2.6 1.2 0 1.5-2.1 1.8-4 .3-1.6.5-2.9.9-4.6.4-1.6.3-3.1-.9-4.5C16.2 4.4 14.6 3.4 12 3.4z',
  shirt: 'M9 3.5 4.5 6.2 3 10l3 1.4L7 10v10.5h10V10l1 1.4 3-1.4-1.5-3.8L15 3.5l-3 2-3-2z',
  bowl: ['M3.2 11.5h17.6a8.8 8.8 0 0 1-17.6 0z', 'M8.5 8c-.8-.8.4-1.6 0-2.7 M12 8c-.8-.8.4-1.6 0-2.7 M15.5 8c-.8-.8.4-1.6 0-2.7'],
  book: 'M12 6.2C10 5 7.7 4.2 4.5 4.2v12.6c3.2 0 5.5.8 7.5 2 2-1.2 4.3-2 7.5-2V4.2c-3.2 0-5.5.8-7.5 2zM12 6.2v12.6',
  backpack: 'M7 8.5a5 5 0 0 1 10 0v10.2a1.3 1.3 0 0 1-1.3 1.3H8.3A1.3 1.3 0 0 1 7 18.7zM9.2 8.5a2.8 2.8 0 0 1 5.6 0M9 13.2h6',
  drop: 'M12 3.5c3 3.8 5.5 6.8 5.5 10a5.5 5.5 0 0 1-11 0c0-3.2 2.5-6.2 5.5-10z',
  water: 'M7 4h10l-1.2 15.3a1.5 1.5 0 0 1-1.5 1.2H9.7a1.5 1.5 0 0 1-1.5-1.2zM7.6 10.5h8.8',
  ball: 'M12 3.5a8.5 8.5 0 1 0 0 17 8.5 8.5 0 0 0 0-17zM12 3.5v17M4.2 9.2c2.3 1.6 13.3 1.6 15.6 0M4.2 14.8c2.3-1.6 13.3-1.6 15.6 0',
  bed: 'M3.5 18.5v-8M3.5 14h17v4.5M3.5 16.5h17M6 10.5a2 2 0 0 1 4 0M11 11.5h7a2.5 2.5 0 0 1 2.5 2.5',
  'bed-made': 'M4 17v-5.5A2.5 2.5 0 0 1 6.5 9h11A2.5 2.5 0 0 1 20 11.5V17M4 17h16M4 14.5h16M8 9V7.5A1.5 1.5 0 0 1 9.5 6h5A1.5 1.5 0 0 1 16 7.5V9',
  music: 'M9.5 17.5V5.8l9-1.8v11.3M9.5 17.5a2.4 2.4 0 1 1-4.8 0 2.4 2.4 0 0 1 4.8 0zM18.5 15.3a2.4 2.4 0 1 1-4.8 0 2.4 2.4 0 0 1 4.8 0z',
  pencil: 'M5 19l1-4L16.5 4.5a2.1 2.1 0 0 1 3 3L9 18zM14.5 6.5l3 3',
  bulb: 'M9.5 18h5M10 21h4M12 3.5a5.8 5.8 0 0 1 3.2 10.6c-.7.5-1.2 1-1.2 1.9h-4c0-.9-.5-1.4-1.2-1.9A5.8 5.8 0 0 1 12 3.5z',
  paint: 'M12 3.5a8.5 8.5 0 0 0 0 17c1.4 0 2-.9 2-1.8 0-.8-.5-1.2-.5-2 0-1 .8-1.7 1.9-1.7h2.1a3 3 0 0 0 3-3c0-4.8-3.8-8.5-8.5-8.5zM8 9.2h.01M12 7h.01M16 9.2h.01M7.5 13.5h.01',
  blocks: 'M4 13.5h7.5V21H4zM12.5 13.5H20V21h-7.5zM8.2 6h7.5v7.5H8.2z',
  fork: 'M7 3.5v6a2 2 0 0 0 2 2v9M9 3.5v5M11 3.5v6M16.5 3.5c-1.7.8-2.5 2.6-2.5 5v4h2.5v8',
  plant: 'M12 21v-8M12 13c0-3.5-2.4-6-6.5-6 0 3.8 2.6 6 6.5 6zM12 11c0-3 2.1-5.2 5.8-5.2 0 3.3-2.3 5.2-5.8 5.2zM7.5 21h9',
  heart: 'M12 19.5c-4.5-3.4-8-6.2-8-9.7A4.3 4.3 0 0 1 8.3 5.5c1.5 0 2.9.7 3.7 2a4.5 4.5 0 0 1 3.7-2A4.3 4.3 0 0 1 20 9.8c0 3.5-3.5 6.3-8 9.7z',
  'sparkle-heart': ['M12 19.5c-4.5-3.4-8-6.2-8-9.7A4.3 4.3 0 0 1 8.3 5.5c1.5 0 2.9.7 3.7 2a4.5 4.5 0 0 1 3.7-2A4.3 4.3 0 0 1 20 9.8c0 3.5-3.5 6.3-8 9.7z', 'M18.5 2.5l.5 1.5 1.5.5-1.5.5-.5 1.5-.5-1.5L16.5 4.5l1.5-.5z'],
  hands: 'M11.5 13.5l-3.2-3.3a1.6 1.6 0 0 1 2.3-2.3l2.9 2.9M13 14.9l4.4-4.5a1.6 1.6 0 0 1 2.3 2.3l-5.4 5.5c-1.8 1.8-4.4 2-6.3.4L4.5 15a1.5 1.5 0 0 1 2-2.2l2.2 1.8',
  paw: 'M12 11.5c2.6 0 5 2 5 4.6 0 1.8-1.2 2.9-2.7 2.9-1 0-1.6-.5-2.3-.5s-1.3.5-2.3.5c-1.5 0-2.7-1.1-2.7-2.9 0-2.6 2.4-4.6 5-4.6zM7 9.5a1.7 2 0 1 0 0-.01M11 6.5a1.7 2 0 1 0 0-.01M14.8 7a1.7 2 0 1 0 0-.01M18 10a1.7 2 0 1 0 0-.01',
  dice: 'M4.5 4.5h15v15h-15zM9 9h.01M15 9h.01M12 12h.01M9 15h.01M15 15h.01',
  // ---- adventures
  tent: 'M3 19 12 5l9 14M12 5v14M8.4 19 12 13.6 15.6 19',
  flashlight: 'M8 3.5h8v4l-2 3v10h-4v-10l-2-3zM8 5.8h8M12 12v3',
  fort: 'M4 20v-9l4-3 4 3 4-3 4 3v9zM4 20h16M10 20v-4a2 2 0 0 1 4 0v4',
  pancake: 'M4 13.5h16M5.5 13.5a6.5 4 0 0 1 13 0M5 16.5h14a6.5 3 0 0 1-14 0zM12 7.5v-2M12 5.5a1.2 1.2 0 1 1 .01 0',
  popcorn: 'M6.5 9 8 20.5h8L17.5 9M6 9h12M8 9c-1.7 0-2.8-1.2-2.8-2.5C5.2 5 6.4 4 7.8 4c.3-1.2 1.5-2 2.7-1.8.6-.8 1.9-.8 2.9-.1 1.2-.5 2.6 0 3 1.2 1.3.2 2.4 1.2 2.4 2.6S17.6 9 16.3 9M10 9l.7 11.5M14 9l-.7 11.5',
  cupcake: 'M5.5 12h13l-1.2 8h-10.6zM6 12a6 5 0 0 1 12 0M12 7v-1.8M8.5 20l-.5-8M12 20v-8M15.5 20l.5-8',
  disco: 'M12 3.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13zM12 3.5v13M5.7 8h12.6M5.7 12h12.6M8 18.5l-1.5 2.5M16 18.5l1.5 2.5M12 16.5v3',
  plane: 'M4 14.5 20 5l-5 14-3.2-4.6zM11.8 14.4 20 5M11.8 14.4l-1.3 4.2-1.9-3.6',
  flask: 'M9.5 3.5h5M10.5 3.5v6L5 18.5a2 2 0 0 0 1.8 3h10.4a2 2 0 0 0 1.8-3L13.5 9.5v-6M7.5 15h9',
  'book-night': ['M12 6.2C10 5 7.7 4.2 4.5 4.2v12.6c3.2 0 5.5.8 7.5 2 2-1.2 4.3-2 7.5-2V4.2c-3.2 0-5.5.8-7.5 2zM12 6.2v12.6', 'M16.5 8l.4 1.1 1.1.4-1.1.4-.4 1.1-.4-1.1-1.1-.4 1.1-.4z'],
  basket: 'M4 10h16l-1.6 9.5a1.5 1.5 0 0 1-1.5 1.2H7.1a1.5 1.5 0 0 1-1.5-1.2zM8 10l3-6.5M16 10l-3-6.5M9.5 13.5v4M14.5 13.5v4',
  chef: 'M8 13.5C5.8 13.5 4 11.9 4 9.7c0-2 1.5-3.5 3.4-3.7C8 4.2 9.8 3 12 3s4 1.2 4.6 3c1.9.2 3.4 1.7 3.4 3.7 0 2.2-1.8 3.8-4 3.8V18H8zM8 18h8v2.5H8zM10.5 13.5V16M13.5 13.5V16',
  stars: ['M7 5l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7zM16.5 9l.9 2.6 2.6.9-2.6.9-.9 2.6-.9-2.6-2.6-.9 2.6-.9z', 'M9.5 15.5l.6 1.7 1.7.6-1.7.6-.6 1.7-.6-1.7-1.7-.6 1.7-.6z'],
  swing: 'M4 4.5C6 3 8.8 3 12 3s6 0 8 1.5M7 4v9.5M17 4v9.5M7 13.5h10M9 13.5v4.5a3 2.5 0 0 0 6 0v-4.5',
  map: 'M9 4.5 4 6.5v13l5-2 6 2 5-2v-13l-5 2zM9 4.5v13M15 6.5v13',
  library: 'M4 20.5h16M5.5 20.5V8M9 20.5V8M12.5 20.5V8M16.5 20.5l-2.4-12 3.4-.7 2.4 12zM4 8h10',
  bike: 'M6.5 17.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM17.5 17.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM6.5 14l3-7h5M14 6.5h2.5M14.5 7l3 7M9.5 7l3.5 7h-6.5',
  bookshop: 'M4 9.5h16v11H4zM4 9.5 5.5 4h13L20 9.5M9.5 13h5M12 9.5V4',
  swim: 'M3.5 17c1.4 1.2 2.8 1.2 4.2 0s2.9-1.2 4.3 0 2.8 1.2 4.2 0 2.9-1.2 4.3 0M3.5 12.8c1.4 1.2 2.8 1.2 4.2 0s2.9-1.2 4.3 0 2.8 1.2 4.2 0 2.9-1.2 4.3 0M7 9l5-4 4 3M14.8 9.5a1.6 1.6 0 1 0 .01 0',
  leaf: 'M5.5 18.5C5.5 10 10.5 5 19 5c0 8.5-5 13.5-13.5 13.5zM5.5 18.5C8.5 13.5 12 10 16 7.5',
  sunrise: 'M4 17.5h16M7.5 17.5a4.5 4.5 0 0 1 9 0M12 9.5V6M6.2 11.4 4.6 9.8M17.8 11.4l1.6-1.6M3 20.5h18',
  market: 'M4.5 9.5 6 4.5h12l1.5 5M4.5 9.5h15v3h-15zM6 12.5v8h12v-8M10 16h4',
  noodles: 'M4.5 12.5h15a7.5 7.5 0 0 1-15 0zM7 12V5.5M11 12V4M15 12l4.5-8M7 9.5c2.7-1.5 7.3-1.5 10-.5',
  museum: 'M4 20.5h16M5 17.5h14M12 3.5 4.5 8h15zM7 8v9.5M12 8v9.5M17 8v9.5',
  train: 'M6 4.5h12a1.5 1.5 0 0 1 1.5 1.5v9a2.5 2.5 0 0 1-2.5 2.5H7A2.5 2.5 0 0 1 4.5 15V6A1.5 1.5 0 0 1 6 4.5zM4.5 11h15M8.5 14.5h.01M15.5 14.5h.01M8 17.5l-2 3M16 17.5l2 3M9.5 4.5v6.5',
  scroll: 'M7 4.5h11.5a1.5 1.5 0 0 1 1.5 1.5v1.5h-3M7 4.5A2.5 2.5 0 0 0 4.5 7v11A2.5 2.5 0 0 0 7 20.5h10.5a2.5 2.5 0 0 0 2.5-2.5v-1H9.5M7 4.5a2.5 2.5 0 0 1 2.5 2.5v10.5M12 9.5h4M12 12.5h4',
  campfire: 'M12 3.5c1.8 2 3 3.8 3 6a3 3 0 0 1-6 0c0-1 .4-1.8 1-2.5.1 1 .8 1.4 1.3 1.2-.7-1.8-.5-3.2.7-4.7zM4.5 20.5l15-5M19.5 20.5l-15-5',
  easel: 'M5.5 5.5h13v9h-13zM12 3.5v2M12 14.5v2M8 21l4-4.5 4 4.5M8.5 8.5l2 2.5 1.7-1.5 2.8 3',
  sun: ['M12 7.5a4.5 4.5 0 1 0 0 9 4.5 4.5 0 0 0 0-9z', 'M12 2.6v2.2 M12 19.2v2.2 M21.4 12h-2.2 M4.8 12H2.6 M18.7 5.3l-1.6 1.6 M6.9 17.1l-1.6 1.6 M18.7 18.7l-1.6-1.6 M6.9 6.9 5.3 5.3'],
  moon: 'M16.5 14.8A6.3 6.3 0 0 1 9.2 6.1a6.3 6.3 0 1 0 7.3 8.7z',
  flame: 'M12 3c2.2 2.4 3.6 4.6 3.6 7.2a3.6 3.6 0 0 1-7.2 0c0-1.2.5-2.2 1.2-3 .1 1.2 1 1.7 1.6 1.4C10.4 7.8 10.6 5.6 12 3z',
  // ---- ui
  check: 'M5 12.3l4.2 4.2L19 6.7',
  lock: 'M6.3 11h11.4v8.7H6.3zM8.3 11V8a3.7 3.7 0 0 1 7.4 0v3',
  x: 'M6 6l12 12M18 6 6 18',
  plus: 'M12 5v14M5 12h14',
  gear: 'M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6zM12 3.5l.9 2.4 2.5-.7 1.7 1.7-.7 2.5 2.4.9v2.4l-2.4.9.7 2.5-1.7 1.7-2.5-.7-.9 2.4h-2.4l-.9-2.4-2.5.7-1.7-1.7.7-2.5-2.4-.9v-2.4l2.4-.9-.7-2.5 1.7-1.7 2.5.7.9-2.4z',
  'chevron-l': 'M14.5 5.5 8 12l6.5 6.5',
  'chevron-r': 'M9.5 5.5 16 12l-6.5 6.5',
  trash: 'M5 7h14M9.5 7V5a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v2M7 7l.8 12a1.5 1.5 0 0 0 1.5 1.5h5.4a1.5 1.5 0 0 0 1.5-1.5L17 7M10 11v5.5M14 11v5.5',
  edit: 'M5 19l1-4L16.5 4.5a2.1 2.1 0 0 1 3 3L9 18zM14.5 6.5l3 3',
  archive: 'M4.5 4.5h15v4h-15zM6 8.5V19a1.5 1.5 0 0 0 1.5 1.5h9A1.5 1.5 0 0 0 18 19V8.5M10 12.5h4',
  trophy: 'M8 4.5h8v5a4 4 0 0 1-8 0zM8 6H5a3 3 0 0 0 3 4M16 6h3a3 3 0 0 1-3 4M12 13.5v3M9 19.5c0-1.7 1.3-3 3-3s3 1.3 3 3zM8 19.5h8',
  gift: 'M4.5 8.5h15v4h-15zM6 12.5V20a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-7.5M12 8.5V21M12 8.5C10 8.5 7.8 7.7 7.8 5.9c0-1 .8-1.9 1.9-1.9C11.5 4 12 6.5 12 8.5zM12 8.5c2 0 4.2-.8 4.2-2.6 0-1-.8-1.9-1.9-1.9C12.5 4 12 6.5 12 8.5z',
  undo: 'M8 5 4 9l4 4M4 9h10a6 6 0 0 1 0 12h-4',
  send: 'M4.5 12 20 4.5 16 19.5l-4.5-4L8 17.5l-.5-4z M11.5 15.5 20 4.5',
  sparkle: 'M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5zM18.5 15l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7z',
  eye: 'M12 5.5c4.5 0 8 3.5 9.5 6.5-1.5 3-5 6.5-9.5 6.5S4 15 2.5 12C4 9 7.5 5.5 12 5.5zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
  calendar: 'M4.5 6.5h15v14h-15zM4.5 10.5h15M8.5 4v4M15.5 4v4',
  home: 'M4.5 11 12 4l7.5 7M6.5 9.5V20h11V9.5',
  logout: 'M9 4.5H6A1.5 1.5 0 0 0 4.5 6v12A1.5 1.5 0 0 0 6 19.5h3M15 8.5l4 3.5-4 3.5M19 12H9.5',
  volume: 'M4.5 9.5v5h3l4.5 4v-13l-4.5 4zM15.5 9a4.5 4.5 0 0 1 0 6M18 6.5a8 8 0 0 1 0 11',
  'volume-x': 'M4.5 9.5v5h3l4.5 4v-13l-4.5 4zM16 9.5l5 5M21 9.5l-5 5',
}

export type IconName = keyof typeof P

export function SqzIcon({
  name,
  size = 24,
  stroke = 2.1,
  color = 'currentColor',
  fill = 'none',
  style = {},
}: {
  name: string
  size?: number
  stroke?: number
  color?: string
  fill?: string
  style?: CSSProperties
}) {
  const def = P[name] ?? P.check
  const paths = Array.isArray(def) ? def : [def]
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={fill}
      stroke={color}
      strokeWidth={stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={style}
      aria-hidden
    >
      {paths.map((d, i) => (
        <path key={i} d={d} />
      ))}
    </svg>
  )
}

export const HABIT_ICONS: string[] = [
  'tooth', 'shirt', 'bowl', 'book', 'backpack', 'drop', 'water', 'ball', 'bed',
  'bed-made', 'music', 'pencil', 'bulb', 'paint', 'blocks', 'fork', 'plant',
  'heart', 'sparkle-heart', 'hands', 'paw', 'dice',
]

export const ADVENTURE_ICONS: string[] = [
  'tent', 'flashlight', 'fort', 'pancake', 'popcorn', 'cupcake', 'disco',
  'plane', 'flask', 'book-night', 'basket', 'chef', 'stars', 'swing', 'map',
  'library', 'bike', 'bookshop', 'swim', 'leaf', 'sunrise', 'market',
  'noodles', 'museum', 'train', 'scroll', 'campfire', 'easel',
]

/** 4-point sparkle star path at (cx,cy) radius r */
export function sparkPath(cx: number, cy: number, r: number): string {
  const t = r * 0.3
  return `M${cx},${cy - r} L${cx + t},${cy - t} L${cx + r},${cy} L${cx + t},${cy + t} L${cx},${cy + r} L${cx - t},${cy + t} L${cx - r},${cy} L${cx - t},${cy - t} Z`
}

export function StarToken({
  size = 18,
  color = '#FFD66B',
  glow = false,
  style = {},
}: {
  size?: number
  color?: string
  glow?: boolean
  style?: CSSProperties
}) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={{ overflow: 'visible', ...style }} aria-hidden>
      {glow && <circle cx="12" cy="12" r="9" fill={color} opacity="0.28" style={{ filter: 'blur(3px)' }} />}
      <path d={sparkPath(12, 12, 10)} fill={color} />
    </svg>
  )
}

/** rounded 5-point "Zee" star body path */
export function zeeStarPath(cx: number, cy: number, r: number): string {
  const t = r * 0.42
  return `M${cx},${cy - r} Q${cx + t * 0.5},${cy - t} ${cx + t},${cy - t} Q${cx + t},${cy - t * 0.5} ${cx + r},${cy} Q${cx + t},${cy + t * 0.5} ${cx + t},${cy + t} Q${cx + t * 0.5},${cy + t} ${cx},${cy + r} Q${cx - t * 0.5},${cy + t} ${cx - t},${cy + t} Q${cx - t},${cy + t * 0.5} ${cx - r},${cy} Q${cx - t},${cy - t * 0.5} ${cx - t},${cy - t} Q${cx - t * 0.5},${cy - t} ${cx},${cy - r} Z`
}

// ---- Big Dream constellation (tent shape, 12 stars) ----
const CONSTEL_PTS = [
  { x: 130, y: 22, r: 9 },
  { x: 86, y: 86, r: 7 },
  { x: 174, y: 86, r: 7 },
  { x: 42, y: 150, r: 8 },
  { x: 130, y: 150, r: 7 },
  { x: 218, y: 150, r: 8 },
  { x: 108, y: 52, r: 6 },
  { x: 152, y: 52, r: 6 },
  { x: 64, y: 118, r: 6 },
  { x: 196, y: 118, r: 6 },
  { x: 130, y: 96, r: 5 },
  { x: 130, y: 122, r: 5 },
]
const CONSTEL_EDGES: Array<[number, number]> = [
  [0, 1], [1, 3], [0, 2], [2, 5], [3, 4], [4, 5], [0, 4],
  [6, 0], [7, 0], [8, 1], [9, 2], [10, 4], [11, 4],
]

/** Dream constellation: `lit` of `total` stars glowing. Constellation stars
 * read differently from spendable tokens (outline vs filled sparkle). */
export function Constellation({
  lit,
  total = 12,
  width = 250,
  height = 172,
  flashNew = false,
}: {
  lit: number
  total?: number
  width?: number
  height?: number
  flashNew?: boolean
}) {
  const pts = CONSTEL_PTS.slice(0, Math.max(total, 4))
  const litSet = new Set(Array.from({ length: Math.min(lit, pts.length) }, (_, i) => i))
  const newest = lit > 0 ? lit - 1 : -1
  return (
    <svg viewBox="0 0 260 188" width={width} height={height} style={{ overflow: 'visible' }} aria-hidden>
      {CONSTEL_EDGES.filter(([a, b]) => a < pts.length && b < pts.length).map(([a, b], i) => {
        const A = pts[a]
        const B = pts[b]
        const on = litSet.has(a) && litSet.has(b)
        return (
          <line
            key={i}
            x1={A.x} y1={A.y} x2={B.x} y2={B.y}
            stroke={on ? '#FFD66B' : '#7FA0FF'}
            strokeWidth={on ? 2 : 1.4}
            strokeLinecap="round"
            opacity={on ? 0.55 : 0.28}
            strokeDasharray={on ? '0' : '3 5'}
          />
        )
      })}
      {pts.map((pt, i) =>
        litSet.has(i) ? (
          <g key={i} className={flashNew && i === newest ? 'land-flash' : ''}>
            <circle cx={pt.x} cy={pt.y} r={pt.r + 5} fill="#FFD66B" opacity="0.25" style={{ filter: 'blur(3px)' }} />
            <path d={sparkPath(pt.x, pt.y, pt.r)} fill="#FFD66B" />
          </g>
        ) : (
          <path key={i} d={sparkPath(pt.x, pt.y, pt.r)} fill="none" stroke="#9FB0E8" strokeWidth="1.4" opacity="0.6" />
        ),
      )}
    </svg>
  )
}

// ---- illustrated kid avatars (6 presets) ----
export const AVATARS: Record<string, { bg: string; skin: string; hair: string }> = {
  'star-1': { bg: '#34428A', skin: '#E6AE82', hair: '#2A2240' },
  'star-2': { bg: '#7A3A6A', skin: '#F0C49A', hair: '#3A2030' },
  'star-3': { bg: '#1F6A5A', skin: '#C98A5E', hair: '#1A1208' },
  'star-4': { bg: '#8A5A24', skin: '#F2CFA6', hair: '#6E3A1A' },
  'star-5': { bg: '#4A3A8A', skin: '#A86B42', hair: '#0E0A06' },
  'star-6': { bg: '#23597D', skin: '#EFC096', hair: '#4A2A10' },
}

export function KidAvatar({
  avatar = 'star-1',
  size = 46,
  style = {},
}: {
  avatar?: string
  size?: number
  style?: CSSProperties
}) {
  const a = AVATARS[avatar] ?? AVATARS['star-1']
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" style={{ borderRadius: '50%', display: 'block', ...style }} aria-hidden>
      <rect width="48" height="48" fill={a.bg} />
      <circle cx="24" cy="44" r="15" fill={a.skin} />
      <circle cx="24" cy="22" r="11" fill={a.skin} />
      <path d="M13 21c0-8 5-12 11-12s11 4 11 12c0-2-3-3-4-4-2 2-12 2-14 0-1 1-4 2-4 4z" fill={a.hair} />
      <circle cx="20" cy="22" r="1.5" fill="#3a2a1a" />
      <circle cx="28" cy="22" r="1.5" fill="#3a2a1a" />
      <path d="M21 26c1.6 1.4 4.4 1.4 6 0" stroke="#a86b4a" strokeWidth="1.5" fill="none" strokeLinecap="round" />
    </svg>
  )
}
