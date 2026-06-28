import { useEffect, useState } from 'react'
import { DeviceStage } from './shell/DeviceStage'
import { useSession } from './state/session'
import { FamilyProvider, useFamily } from './state/family'
import { StatusBar, FxLayer } from './components/ui'
import { Splash } from './screens/kid/Splash'
import { Manifesto } from './screens/firstrun/Manifesto'
import { Onboarding } from './screens/firstrun/Onboarding'
import { AuthScreen } from './screens/firstrun/Auth'
import { Wizard } from './screens/firstrun/Wizard'
import { KidShell } from './screens/kid/KidShell'
import { ParentShell } from './screens/parent/ParentShell'

const INTRO_KEY = 'sqz_seen_intro'

type FirstrunStep = 'manifesto' | 'onboarding' | 'auth'

function FirstRun() {
  const [step, setStep] = useState<FirstrunStep>(() =>
    localStorage.getItem(INTRO_KEY) ? 'auth' : 'manifesto',
  )
  return (
    <DeviceStage parent>
      <StatusBar />
      {step === 'manifesto' && <Manifesto onProceed={() => setStep('onboarding')} />}
      {step === 'onboarding' && (
        <Onboarding
          onDone={() => {
            localStorage.setItem(INTRO_KEY, '1')
            setStep('auth')
          }}
        />
      )}
      {step === 'auth' && <AuthScreen />}
    </DeviceStage>
  )
}

export type AppMode = 'kid' | 'parent' | 'wizard'

function AuthedApp() {
  const fam = useFamily()
  // null until family data arrives; a family with no children starts in the
  // wizard and STAYS there until the handoff, even after the child row lands
  const [mode, setMode] = useState<AppMode | null>(null)
  const [handoffChildId, setHandoffChildId] = useState<string | null>(null)
  const [online, setOnline] = useState(navigator.onLine)

  useEffect(() => {
    if (!fam.loading && mode === null) {
      setMode(fam.children.length === 0 ? 'wizard' : 'kid')
    }
  }, [fam.loading, fam.children.length, mode])

  useEffect(() => {
    const up = () => setOnline(true)
    const down = () => setOnline(false)
    window.addEventListener('online', up)
    window.addEventListener('offline', down)
    return () => {
      window.removeEventListener('online', up)
      window.removeEventListener('offline', down)
    }
  }, [])

  if (fam.loading || mode === null) {
    return (
      <DeviceStage>
        <StatusBar />
        <Splash resume />
      </DeviceStage>
    )
  }

  // a family with no children goes through the wizard first (lesson #4:
  // the wizard ships in the MVP, not as a fast-follow)
  if (mode === 'wizard') {
    return (
      <DeviceStage parent>
        <StatusBar />
        {!online && <div className="offline-bar">offline — changes need a connection</div>}
        <Wizard
          onDone={(childId) => {
            setHandoffChildId(childId ?? null)
            setMode('kid')
          }}
          firstChild={fam.children.length === 0}
        />
      </DeviceStage>
    )
  }

  if (mode === 'parent') {
    return (
      <DeviceStage parent>
        <StatusBar />
        {!online && <div className="offline-bar">offline — changes need a connection</div>}
        <ParentShell
          onExit={() => {
            setHandoffChildId(null)
            setMode('kid')
          }}
          onAddChild={() => setMode('wizard')}
        />
      </DeviceStage>
    )
  }

  return (
    <DeviceStage>
      <StatusBar />
      {!online && <div className="offline-bar">offline — stars will fly again soon</div>}
      <KidShell
        onParent={() => {
          setHandoffChildId(null)
          setMode('parent')
        }}
        handoffChildId={handoffChildId}
      />
      <FxLayer />
    </DeviceStage>
  )
}

export function App() {
  const { session, loading } = useSession()

  if (loading) {
    return (
      <DeviceStage>
        <StatusBar />
        <Splash resume />
      </DeviceStage>
    )
  }

  if (!session) return <FirstRun />

  return (
    <FamilyProvider>
      <AuthedApp />
    </FamilyProvider>
  )
}
