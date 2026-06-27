// Sign in — plain and fast, no delight budget (DESIGN_BRIEF §3b).
import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { Zee } from '../../components/Zee'

export function AuthScreen() {
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const signInWithGoogle = async () => {
    setError(null)
    setBusy(true)
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
          queryParams: { prompt: 'select_account' },
        },
      })
      if (error) throw error
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not open Google sign-in — try again.')
      setBusy(false)
    }
  }

  return (
    <div className="view scroll" style={{ justifyContent: 'center', gap: 16, padding: '4px 28px 28px' }}>
      <div className="col center gap10" style={{ paddingBottom: 8 }}>
        <Zee size={64} mood="awake" />
        <div className="wordmark" style={{ fontSize: 30 }}>
          Starque<span className="zz">zz</span>
        </div>
        <div className="muted tac" style={{ fontSize: 14, lineHeight: 1.5, maxWidth: 260 }}>
          Free for every family, forever. Sign in with Google so your family can come with you.
        </div>
      </div>

      <button className="btn full" disabled={busy} onClick={() => void signInWithGoogle()}>
        {busy ? 'Opening Google…' : 'Continue with Google ✦'}
      </button>
      {error && <div className="form-error">{error}</div>}
      <div className="muted tac" style={{ fontSize: 12.5, lineHeight: 1.5 }}>
        Starquezz uses Supabase Auth. We only ask Google who you are; your family data stays in Starquezz.
      </div>
    </div>
  )
}
