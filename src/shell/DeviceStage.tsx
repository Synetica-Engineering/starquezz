// Desktop: the app renders inside a phone frame, scaled to fit (like the
// cloudloyalty reference). On real phones (≤768px) the CSS strips the frame
// and the app flows naturally full-viewport.
import { useEffect, useRef, type ReactNode } from 'react'

export function DeviceStage({ children, parent = false }: { children: ReactNode; parent?: boolean }) {
  const innerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fit = () => {
      const el = innerRef.current
      if (!el) return
      if (window.innerWidth <= 768) {
        el.style.transform = ''
        return
      }
      const s = Math.min(1, (window.innerHeight - 40) / 860, (window.innerWidth - 24) / 410)
      el.style.transform = `scale(${s})`
    }
    fit()
    window.addEventListener('resize', fit)
    return () => window.removeEventListener('resize', fit)
  }, [])

  return (
    <div className="stage">
      <div className="stage-inner" ref={innerRef}>
        <div className="phone">
          <div className={'screen' + (parent ? ' parent' : '')}>{children}</div>
        </div>
      </div>
    </div>
  )
}
