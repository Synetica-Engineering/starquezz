// Zee — the star-sprite mascot. The "zz" in Starquezz is his snooze; he
// wakes when you tap. His lines are scripted and authored, NEVER generated,
// and the kid never chats with him (AGENT_BRIEF §5 hard rule).
import type { ReactNode } from 'react'
import { zeeStarPath } from './icons'

export type ZeeMood = 'idle' | 'awake' | 'cheer'

export function Zee({ size = 56, mood = 'awake', className = '' }: { size?: number; mood?: ZeeMood; className?: string }) {
  const cls = 'zee ' + (mood === 'cheer' ? 'cheer ' : '') + className
  return (
    <div className={cls} style={{ width: size, height: size }} aria-hidden>
      <svg width={size} height={size} viewBox="0 0 64 64" style={{ overflow: 'visible' }}>
        <circle cx="32" cy="32" r="27" fill="#FFD66B" opacity="0.3" style={{ filter: 'blur(6px)' }} />
        <path d={zeeStarPath(32, 32, 26)} fill="#FFE49C" stroke="#FFC94D" strokeWidth="2.5" strokeLinejoin="round" />
        <ellipse cx="38" cy="42" rx="5" ry="3.6" fill="#FF9ECB" opacity="0.55" />
        <ellipse cx="26" cy="42" rx="5" ry="3.6" fill="#FF9ECB" opacity="0.55" />
        {mood === 'idle' ? (
          <g>
            <path d="M23 33c1.6 1.6 4.4 1.6 6 0" stroke="#3A2E5E" strokeWidth="2.2" fill="none" strokeLinecap="round" />
            <path d="M35 33c1.6 1.6 4.4 1.6 6 0" stroke="#3A2E5E" strokeWidth="2.2" fill="none" strokeLinecap="round" />
            <path d="M28 41c2 1.6 5 1.6 7 0" stroke="#3A2E5E" strokeWidth="2" fill="none" strokeLinecap="round" />
          </g>
        ) : (
          <g>
            <circle cx="26" cy="33" r="2.7" fill="#3A2E5E" />
            <circle cx="38" cy="33" r="2.7" fill="#3A2E5E" />
            <circle cx="27" cy="31.8" r="0.9" fill="#fff" />
            <circle cx="39" cy="31.8" r="0.9" fill="#fff" />
            <path
              d={mood === 'cheer' ? 'M26 40c2.6 3.4 9.4 3.4 12 0' : 'M27 40c2.4 2.4 7.6 2.4 10 0'}
              stroke="#3A2E5E"
              strokeWidth="2.4"
              fill="none"
              strokeLinecap="round"
            />
          </g>
        )}
      </svg>
      {mood === 'idle' && <span className="zzz">z z</span>}
    </div>
  )
}

export function ZBubble({ children }: { children: ReactNode }) {
  return <div className="zbubble grow">{children}</div>
}
