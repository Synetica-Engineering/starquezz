// Sign up / sign in — plain and fast, no delight budget (DESIGN_BRIEF §3b).
import { useState, type FormEvent } from 'react'
import { supabase } from '../../lib/supabase'
import { Zee } from '../../components/Zee'

type AuthMode = 'start' | 'signup' | 'login' | 'reset'

export function AuthScreen() {
  const [mode, setMode] = useState<AuthMode>('start')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  // the front door: no account needed — a real (anonymous) Supabase session
  // backs the family from the first tap; email can be attached later
  const tryNow = async () => {
    setError(null)
    setBusy(true)
    try {
      const { error } = await supabase.auth.signInAnonymously()
      if (error) throw error
    } catch {
      setError('Could not start — check your connection and try again.')
      setBusy(false)
    }
  }

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setNotice(null)
    setBusy(true)
    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
      } else if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email)
        if (error) throw error
        setNotice('If that address has an account, a reset link is on its way.')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong — try again.')
    } finally {
      setBusy(false)
    }
  }

  const switchMode = (nextMode: AuthMode) => {
    setMode(nextMode)
    setError(null)
    setNotice(null)
  }

  const heading =
    mode === 'start'
      ? 'Free for every family, forever. No subscriptions, no catches.'
      : mode === 'login'
        ? 'Welcome back.'
        : mode === 'reset'
          ? 'We’ll email you a reset link.'
          : 'Save your family with a password.'

  return (
    <div className="view scroll" style={{ justifyContent: 'center', gap: 16, padding: '4px 28px 28px' }}>
      <div className="col center gap10" style={{ paddingBottom: 8 }}>
        <Zee size={64} mood="awake" />
        <div className="wordmark" style={{ fontSize: 30 }}>
          Starque<span className="zz">zz</span>
        </div>
        <div className="muted tac" style={{ fontSize: 14, lineHeight: 1.5, maxWidth: 260 }}>
          {heading}
        </div>
      </div>

      {mode === 'start' && (
        <>
          <button className="btn full" disabled={busy} onClick={() => void tryNow()}>
            {busy ? '…' : 'Start now — no account needed ✦'}
          </button>
          {error && <div className="form-error">{error}</div>}
          <button className="btn full ghost" disabled={busy} onClick={() => switchMode('login')}>
            Sign in
          </button>
        </>
      )}

      {mode !== 'start' && (
        <form className="col gap12" onSubmit={submit}>
          <div>
            <label className="field-label" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              className="input"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </div>
          {mode !== 'reset' && (
            <div>
              <label className="field-label" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                className="input"
                type="password"
                required
                minLength={8}
                autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="at least 8 characters"
              />
            </div>
          )}
          {error && <div className="form-error">{error}</div>}
          {notice && <div className="nudge-card">{notice}</div>}
          <button className="btn full" disabled={busy} type="submit">
            {busy ? '…' : mode === 'signup' ? 'Create our family account' : mode === 'login' ? 'Sign in' : 'Send reset link'}
          </button>
        </form>
      )}

      <div className="col center gap8" style={{ fontSize: 13.5, color: 'var(--muted)' }}>
        {mode === 'start' ? null : mode === 'signup' ? (
          <button className="chip skip" onClick={() => switchMode('login')}>
            Already have a password? <b style={{ color: 'var(--cyan)' }}>Sign in</b>
          </button>
        ) : (
          <button className="chip skip" onClick={() => switchMode('start')}>
            Back
          </button>
        )}
        {mode === 'login' && (
          <button className="chip skip" onClick={() => switchMode('signup')}>
            Don’t have a password yet? <b style={{ color: 'var(--cyan)' }}>Sign up</b>
          </button>
        )}
        {mode === 'login' && (
          <button className="chip skip" onClick={() => switchMode('reset')}>
            Forgot password?
          </button>
        )}
        {mode === 'reset' && (
          <button className="chip skip" onClick={() => switchMode('signup')}>
            Need a password? <b style={{ color: 'var(--cyan)' }}>Sign up</b>
          </button>
        )}
      </div>
    </div>
  )
}
