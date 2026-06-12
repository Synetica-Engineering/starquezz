// Onboarding illustration scenes — cohesive with the app: Zee + the
// habit/adventure visual grammar. One problem per scene.
import type { ReactNode } from 'react'
import { sparkPath, zeeStarPath } from '../../components/icons'

function ZeeFig({ cx, cy, r, mood = 'awake' }: { cx: number; cy: number; r: number; mood?: 'awake' | 'cheer' }) {
  return (
    <g>
      <circle cx={cx} cy={cy} r={r + 4} fill="#FFD66B" opacity="0.30" style={{ filter: 'blur(5px)' }} />
      <path d={zeeStarPath(cx, cy, r)} fill="#FFE49C" stroke="#FFC94D" strokeWidth="2" strokeLinejoin="round" />
      <ellipse cx={cx - r * 0.3} cy={cy + r * 0.2} rx={r * 0.15} ry={r * 0.1} fill="#FF9ECB" opacity="0.55" />
      <ellipse cx={cx + r * 0.3} cy={cy + r * 0.2} rx={r * 0.15} ry={r * 0.1} fill="#FF9ECB" opacity="0.55" />
      <circle cx={cx - r * 0.22} cy={cy - r * 0.02} r={r * 0.1} fill="#3A2E5E" />
      <circle cx={cx + r * 0.22} cy={cy - r * 0.02} r={r * 0.1} fill="#3A2E5E" />
      <circle cx={cx - r * 0.19} cy={cy - r * 0.06} r={r * 0.035} fill="#fff" />
      <circle cx={cx + r * 0.25} cy={cy - r * 0.06} r={r * 0.035} fill="#fff" />
      <path
        d={
          mood === 'cheer'
            ? `M${cx - r * 0.22},${cy + r * 0.22} q${r * 0.22},${r * 0.34} ${r * 0.44},0`
            : `M${cx - r * 0.2},${cy + r * 0.24} q${r * 0.2},${r * 0.22} ${r * 0.4},0`
        }
        stroke="#3A2E5E"
        strokeWidth={r * 0.1}
        fill="none"
        strokeLinecap="round"
      />
    </g>
  )
}

function Spark({ cx, cy, r, c = '#CFE3FF', o = 0.9 }: { cx: number; cy: number; r: number; c?: string; o?: number }) {
  return <path d={sparkPath(cx, cy, r)} fill={c} opacity={o} />
}

function Kid({ cx, cy, s = 1, bg = '#3A4790', skin = '#E6AE82', hair = '#2A2240' }: { cx: number; cy: number; s?: number; bg?: string; skin?: string; hair?: string }) {
  return (
    <g transform={`translate(${cx},${cy}) scale(${s}) translate(${-50},${-104})`}>
      <circle cx="50" cy="104" r="24" fill={bg} />
      <circle cx="50" cy="112" r="16" fill={skin} />
      <circle cx="50" cy="100" r="13" fill={skin} />
      <path d="M38,99 c0-9 6-13 12-13 s12,4 12,13 c0-2-3-3-4-4 -2,2 -12,2 -14,0 -1,1 -4,2 -6,4z" fill={hair} />
      <circle cx="46" cy="100" r="1.6" fill="#3a2a1a" />
      <circle cx="54" cy="100" r="1.6" fill="#3a2a1a" />
      <path d="M46,104 c1.6,1.4 4.4,1.4 6,0" stroke="#a86b4a" strokeWidth="1.4" fill="none" strokeLinecap="round" />
    </g>
  )
}

function Frame({ children }: { children: ReactNode }) {
  return (
    <svg viewBox="0 0 280 196" width="100%" height="100%" preserveAspectRatio="xMidYMid meet" style={{ display: 'block' }}>
      {children}
    </svg>
  )
}

function BoardRow({ y, on }: { y: number; on: boolean }) {
  return (
    <g>
      <rect x="92" y={y - 13} width="26" height="26" rx="8" fill="rgba(141,235,255,.16)" />
      <rect x="126" y={y - 3.5} width={on ? 44 : 52} height="7" rx="3.5" fill="rgba(255,255,255,.12)" />
      {on ? (
        <g>
          <circle cx="182" cy={y} r="9" fill="#FFD66B" />
          <path d={`M178,${y} l3,3 5,-5`} stroke="#241A03" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      ) : (
        <circle cx="182" cy={y} r="9" fill="none" stroke="rgba(170,195,225,.6)" strokeWidth="2" />
      )}
    </g>
  )
}

/** Problem 1 — kid autonomy: the kid checks their own board. */
export function SceneAutonomy() {
  return (
    <Frame>
      <Spark cx={54} cy={44} r={5} c="#FFE49C" />
      <Spark cx={240} cy={40} r={4} />
      <Spark cx={246} cy={150} r={4} c="#9FF0D0" />
      <rect x="74" y="38" width="132" height="112" rx="18" fill="#0F1E3C" stroke="rgba(180,196,255,.3)" strokeWidth="1.6" />
      <BoardRow y={66} on />
      <BoardRow y={96} on />
      <BoardRow y={126} on={false} />
      <Kid cx={44} cy={130} s={0.92} />
      <path d="M64,104 Q72,92 84,96" stroke="rgba(255,214,107,.55)" strokeWidth="1.8" fill="none" strokeDasharray="3 5" />
      <ZeeFig cx={234} cy={132} r={22} mood="cheer" />
    </Frame>
  )
}

/** Problem 2 — habit design: Zee tailors a small, balanced, doable set. */
export function SceneDesign() {
  return (
    <Frame>
      <Spark cx={54} cy={50} r={5} c="#FFE49C" />
      <Spark cx={240} cy={46} r={4} />
      <Spark cx={40} cy={132} r={3} />
      <rect x="60" y="44" width="132" height="108" rx="18" fill="#0F1E3C" stroke="rgba(180,196,255,.3)" strokeWidth="1.6" />
      <g transform="translate(-14,0)">
        <BoardRow y={70} on />
        <BoardRow y={98} on />
        <BoardRow y={126} on={false} />
      </g>
      {/* category balance dots: body · mind · space · heart */}
      <circle cx="80" cy="166" r="5" fill="#5BE5C0" />
      <circle cx="98" cy="166" r="5" fill="#8DEBFF" />
      <circle cx="116" cy="166" r="5" fill="#FFD66B" />
      <circle cx="134" cy="166" r="5" fill="#FF87C4" />
      {/* Zee tailoring with a pencil */}
      <ZeeFig cx={224} cy={128} r={24} />
      <g stroke="#FF87C4" strokeWidth="3" strokeLinecap="round">
        <line x1="208" y1="108" x2="199" y2="97" />
      </g>
      <circle cx="197" cy="95" r="2.6" fill="#FFE49C" />
    </Frame>
  )
}

/** Problem 3 — adventures together: stars redeem shared time, never stuff. */
export function SceneTogether() {
  return (
    <Frame>
      <Spark cx={140} cy={26} r={4} c="#FFE49C" />
      <Spark cx={44} cy={40} r={3} />
      <Spark cx={244} cy={56} r={4} />
      {/* kid checks off → star flies to the jar */}
      <Kid cx={50} cy={118} s={1} />
      <g>
        <circle cx="66" cy="132" r="8" fill="#5BE5C0" />
        <path d="M62,132 l3,3 5,-5" stroke="#072a22" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </g>
      <path d="M74,100 Q104,68 130,88" stroke="rgba(255,214,107,.5)" strokeWidth="1.6" fill="none" strokeDasharray="3 5" />
      <Spark cx={102} cy={74} r={6} c="#FFE49C" />
      {/* jar */}
      <rect x="118" y="90" width="46" height="52" rx="12" fill="rgba(141,235,255,.07)" stroke="rgba(141,235,255,.4)" strokeWidth="2" />
      <rect x="128" y="84" width="26" height="7" rx="3.5" fill="rgba(141,235,255,.35)" />
      <Spark cx={131} cy={126} r={5} c="#FFD66B" />
      <Spark cx={144} cy={118} r={5} c="#FFD66B" />
      <Spark cx={153} cy={128} r={4} c="#FFD66B" />
      <path d="M168,116 H192" stroke="rgba(180,196,255,.45)" strokeWidth="1.6" fill="none" strokeDasharray="3 5" />
      <path d="M188,111 l5,5 -5,5" stroke="rgba(180,196,255,.6)" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      {/* together under a heart — kid + parent, always together */}
      <path d="M232,80 c-3,-6 -12,-4 -12,3 0,5 7,9 12,13 5,-4 12,-8 12,-13 0,-7 -9,-9 -12,-3z" fill="#FF87C4" opacity="0.9" />
      <Kid cx={224} cy={128} s={0.8} bg="#34428A" />
      <Kid cx={248} cy={134} s={0.62} bg="#7A3A6A" skin="#F0C49A" hair="#3A2030" />
    </Frame>
  )
}
