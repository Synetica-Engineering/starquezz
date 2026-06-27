// The kid's world: splash → avatar tap (that IS the login) → board.
// Loud, joyful, physical — ~90% of the delight budget lives here.
import { useEffect, useRef, useState } from 'react'
import { displayStreak, useFamily } from '../../state/family'
import { todayLocal } from '../../lib/dates'
import { KidAvatar, SqzIcon, StarToken } from '../../components/icons'
import { Keypad } from '../../components/ui'
import { Splash } from './Splash'
import { Board } from './Board'
import { StarJar } from './StarJar'
import { AdventureMenu } from './AdventureMenu'
import { Ceremony } from './Ceremony'
import type { Child } from '../../lib/types'

type KidScreen = 'splash' | 'select' | 'code' | 'board' | 'jar' | 'adventures'

const ACTIVE_KEY = 'sqz_active_child'
const SEEN_SPLASH = 'sqz_splash_seen' // session-scoped: cold start vs resume

export function KidShell({ onParent }: { onParent: () => void }) {
  const fam = useFamily()
  const [screen, setScreen] = useState<KidScreen>('splash')
  const [activeId, setActiveId] = useState<string | null>(() => localStorage.getItem(ACTIVE_KEY))
  const [waving, setWaving] = useState<string | null>(null)
  const [codeShake, setCodeShake] = useState(false)
  const [code, setCode] = useState('')
  const [pendingChild, setPendingChild] = useState<Child | null>(null)
  const [ceremony, setCeremony] = useState(false)
  const starRef = useRef<HTMLButtonElement>(null)

  const active = fam.children.find((c) => c.id === activeId) ?? null

  useEffect(() => {
    if (activeId) localStorage.setItem(ACTIVE_KEY, activeId)
  }, [activeId])

  const splashDone = () => {
    setScreen(active ? 'board' : 'select')
  }

  const pickChild = (child: Child) => {
    setWaving(child.id)
    setTimeout(() => {
      setWaving(null)
      if (child.secret_code_hash) {
        setPendingChild(child)
        setCode('')
        setScreen('code')
      } else {
        setActiveId(child.id)
        setScreen('board')
      }
    }, 450)
  }

  const tryCode = async (value: string) => {
    setCode(value)
    if (value.length === 4 && pendingChild) {
      const ok = await fam.verifyChildCode(pendingChild.id, value)
      if (ok) {
        setActiveId(pendingChild.id)
        setPendingChild(null)
        setScreen('board')
      } else {
        // gentle shake — never punitive
        setCodeShake(true)
        setTimeout(() => {
          setCodeShake(false)
          setCode('')
        }, 450)
      }
    }
  }

  if (screen === 'splash') {
    const resume = sessionStorage.getItem(SEEN_SPLASH) === '1'
    sessionStorage.setItem(SEEN_SPLASH, '1')
    return <Splash onDone={splashDone} resume={resume} />
  }

  if (screen === 'select') {
    return (
      <div className="view full" style={{ gap: 26 }}>
        <div className="disp" style={{ fontSize: 24, color: '#fff' }}>
          Who’s playing?
        </div>
        <div className="login-faces">
          {fam.children.map((c) => (
            <button key={c.id} className={'face-pick' + (waving === c.id ? ' waving' : '')} onClick={() => pickChild(c)}>
              <div className="ring">
                <KidAvatar avatar={c.avatar} photo={c.photo} size={108} />
              </div>
              <div className="pn">{c.name}</div>
            </button>
          ))}
        </div>
        <div className="muted" style={{ fontSize: 15 }}>
          tap your face to start ✦
        </div>
        <button className="chip skip" style={{ position: 'absolute', bottom: 18 }} onClick={onParent}>
          Grown-ups →
        </button>
      </div>
    )
  }

  if (screen === 'code' && pendingChild) {
    return (
      <div className="view full" style={{ gap: 18, justifyContent: 'flex-start', paddingTop: 30 }}>
        <div className="col center gap10">
          <div
            className="ring"
            style={{
              width: 92, height: 92, borderRadius: '50%', padding: 4,
              background: 'linear-gradient(150deg,rgba(141,235,255,.6),rgba(255,135,196,.5))',
            }}
          >
            <KidAvatar avatar={pendingChild.avatar} photo={pendingChild.photo} size={84} />
          </div>
          <div className="disp" style={{ fontSize: 20, color: '#fff', whiteSpace: 'nowrap' }}>
            {pendingChild.name}’s secret code
          </div>
        </div>
        <Keypad value={code} onChange={(v) => void tryCode(v)} shake={codeShake} />
        <div className="muted" style={{ fontSize: 13 }}>
          tap your secret stars ✦
        </div>
        <button className="chip skip" onClick={() => setScreen('select')}>
          ← not me
        </button>
      </div>
    )
  }

  if (!active) {
    setScreen('select')
    return null
  }

  const navIcon = (id: KidScreen, label: string, icon: React.ReactNode) => (
    <button className={'navitem' + (screen === id ? ' active' : '')} onClick={() => setScreen(id)} aria-label={label}>
      <span className="ni">{icon}</span>
      {label}
    </button>
  )

  return (
    <>
      <div style={{ padding: '0 20px' }}>
        <TopBar child={active} starRef={starRef} onAvatar={() => setScreen('select')} onStars={() => setScreen('jar')} />
      </div>
      <div key={screen} style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
        {screen === 'board' && <Board child={active} starRef={starRef} />}
        {screen === 'jar' && <StarJar child={active} onCeremony={() => setCeremony(true)} />}
        {screen === 'adventures' && <AdventureMenu child={active} />}
      </div>
      <div className="bottomnav">
        {navIcon('board', 'Today', <SqzIcon name="sun" size={22} />)}
        {navIcon('adventures', 'Redeem Adventures', <SqzIcon name="tent" size={22} />)}
      </div>
      {ceremony && <Ceremony child={active} onClose={() => setCeremony(false)} />}
    </>
  )
}

function TopBar({
  child,
  starRef,
  onAvatar,
  onStars,
}: {
  child: Child
  starRef: React.RefObject<HTMLButtonElement | null>
  onAvatar: () => void
  onStars: () => void
}) {
  const fam = useFamily()
  const [bump, setBump] = useState(false)
  const prev = useRef(child.star_balance)
  useEffect(() => {
    if (child.star_balance !== prev.current) {
      prev.current = child.star_balance
      setBump(true)
      const t = setTimeout(() => setBump(false), 520)
      return () => clearTimeout(t)
    }
  }, [child.star_balance])

  const hour = new Date().getHours()
  const hi = hour < 12 ? 'Good morning,' : hour < 18 ? 'Good afternoon,' : 'Good evening,'

  const streak = displayStreak(fam.habits, fam.completions, child.id, todayLocal())

  return (
    <div className="topbar">
      <button className="avatar-btn" onClick={onAvatar} aria-label="switch kid">
        <KidAvatar avatar={child.avatar} photo={child.photo} size={48} style={{ boxShadow: '0 0 0 2px rgba(141,235,255,.5)' }} />
      </button>
      <div className="greet grow">
        <span className="hi">{hi}</span>
        <span className="nm">{child.name}</span>
      </div>
      <button ref={starRef} className={'pill' + (bump ? ' bump' : '')} onClick={onStars} aria-label="open stars">
        <StarToken size={16} glow /> {child.star_balance}
      </button>
      <button className="pill flame" onClick={onStars} aria-label="open stars streak">
        <SqzIcon name="flame" size={15} color="#FFC196" fill="#FF9A5A" /> {streak}
      </button>
    </div>
  )
}
