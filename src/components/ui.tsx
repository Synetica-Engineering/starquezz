import { useEffect, useRef, useState, type ReactNode } from 'react'
import { sparkPath, SqzIcon } from './icons'

export function StatusBar() {
  const [time, setTime] = useState(() =>
    new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
  )
  useEffect(() => {
    const t = setInterval(
      () => setTime(new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })),
      30_000,
    )
    return () => clearInterval(t)
  }, [])
  return (
    <div className="statusbar">
      <span>{time}</span>
      <span className="sb-r">
        <b></b>
      </span>
    </div>
  )
}

// ---- imperative star-flight engine (signature moment #1) ----
export const StarFx = {
  layer: null as HTMLElement | null,
  setLayer(el: HTMLElement | null) {
    this.layer = el
  },
  fly(fromEl: HTMLElement | null, toEl: HTMLElement | null, onArrive?: () => void) {
    if (!fromEl || !toEl || !this.layer) {
      onArrive?.()
      return
    }
    const lr = this.layer.getBoundingClientRect()
    const a = fromEl.getBoundingClientRect()
    const b = toEl.getBoundingClientRect()
    const x0 = a.left - lr.left + a.width / 2
    const y0 = a.top - lr.top + a.height / 2
    const x1 = b.left - lr.left + b.width / 2
    const y1 = b.top - lr.top + b.height / 2
    const star = document.createElement('div')
    star.className = 'fly-star'
    star.style.left = `${x0 - 13}px`
    star.style.top = `${y0 - 13}px`
    star.innerHTML = `<svg width="26" height="26" viewBox="0 0 24 24" style="overflow:visible"><circle cx="12" cy="12" r="9" fill="#FFD66B" opacity="0.4" style="filter:blur(3px)"/><path d="${sparkPath(12, 12, 10)}" fill="#FFE49C"/></svg>`
    this.layer.appendChild(star)
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    let done = false
    const finish = () => {
      if (done) return
      done = true
      star.remove()
      onArrive?.()
    }
    if (reduce) {
      finish()
      return
    }
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        star.style.transform = `translate(${x1 - x0}px, ${y1 - y0}px) scale(.45) rotate(220deg)`
        star.style.opacity = '0.85'
      }),
    )
    star.addEventListener('transitionend', finish, { once: true })
    setTimeout(finish, 950)
  },
}

export function FxLayer() {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    StarFx.setLayer(ref.current)
    return () => StarFx.setLayer(null)
  }, [])
  return <div className="fxlayer" ref={ref} />
}

// ---- celebration confetti (stars, not paper) ----
export function StarBurst({ count = 18 }: { count?: number }) {
  const stars = Array.from({ length: count }, (_, i) => ({
    left: Math.random() * 96 + 2,
    delay: Math.random() * 0.5,
    dur: 1.1 + Math.random() * 0.9,
    size: 10 + Math.random() * 14,
    color: ['#FFD66B', '#8DEBFF', '#FF87C4', '#5BE5C0'][i % 4],
  }))
  return (
    <>
      {stars.map((s, i) => (
        <div
          key={i}
          className="confetti-star"
          style={
            {
              left: `${s.left}%`,
              top: 0,
              animationDelay: `${s.delay}s`,
              '--dur': `${s.dur}s`,
            } as React.CSSProperties
          }
        >
          <svg width={s.size} height={s.size} viewBox="0 0 24 24">
            <path d={sparkPath(12, 12, 10)} fill={s.color} />
          </svg>
        </div>
      ))}
    </>
  )
}

// ---- kid-proportioned keypad ----
export function Keypad({
  value,
  onChange,
  length = 4,
  shake = false,
}: {
  value: string
  onChange: (v: string) => void
  length?: number
  shake?: boolean
}) {
  const press = (n: number) => {
    if (value.length < length) onChange(value + String(n))
  }
  return (
    <>
      <div className={'codedots' + (shake ? ' shake' : '')}>
        {Array.from({ length }, (_, k) => (
          <i key={k} className={value.length > k ? 'on' : ''} />
        ))}
      </div>
      <div className="keypad">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
          <button key={n} className="key" onClick={() => press(n)} aria-label={`digit ${n}`}>
            {n}
          </button>
        ))}
        <span></span>
        <button className="key" onClick={() => press(0)} aria-label="digit 0">
          0
        </button>
        <button className="key ghostkey" onClick={() => onChange(value.slice(0, -1))} aria-label="delete digit">
          ⌫
        </button>
      </div>
    </>
  )
}

// ---- week strip ----
export function WeekStrip({
  days,
  size = 24,
}: {
  /** 7 cells, Mon..Sun */
  days: Array<'on' | 'off' | 'off-day'>
  size?: number
}) {
  const labels = ['M', 'T', 'W', 'T', 'F', 'S', 'S']
  return (
    <div className="weekstrip">
      {labels.map((l, i) => (
        <div className="d" key={i}>
          <div
            className={'cell' + (days[i] === 'on' ? ' on' : days[i] === 'off-day' ? ' off-day' : '')}
            style={{ width: size, height: size }}
          ></div>
          <div className="dl">{l}</div>
        </div>
      ))}
    </div>
  )
}

// ---- toast ----
export function Toast({ message }: { message: string | null }) {
  if (!message) return null
  return <div className="toast">{message}</div>
}

export function useToast(): [string | null, (m: string) => void] {
  const [msg, setMsg] = useState<string | null>(null)
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)
  const show = (m: string) => {
    setMsg(m)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setMsg(null), 2400)
  }
  return [msg, show]
}

// ---- bottom sheet ----
export function Sheet({ onClose, children }: { onClose: () => void; children: ReactNode }) {
  return (
    <div className="sheet-veil" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-handle" />
        {children}
      </div>
    </div>
  )
}

// ---- icon-only button ----
export function IconBtn({
  name,
  onClick,
  label,
  size = 18,
}: {
  name: string
  onClick?: () => void
  label: string
  size?: number
}) {
  return (
    <button className="iconbtn" onClick={onClick} aria-label={label} title={label}>
      <SqzIcon name={name} size={size} />
    </button>
  )
}
