// Sign up / sign in — plain and fast, no delight budget (DESIGN_BRIEF §3b).
import { useState, type FormEvent } from 'react'
import { supabase } from '../../lib/supabase'
import { Zee } from '../../components/Zee'

type AuthMode = 'signup' | 'login' | 'reset'

export function AuthScreen() {
  const [mode, setMode] = useState<AuthMode>('signup')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

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

  return (
    <div className="view scroll" style={{ justifyContent: 'center', gap: 16, padding: '4px 28px 28px' }}>
      <div className="col center gap10" style={{ paddingBottom: 8 }}>
        <Zee size={64} mood="awake" />
        <div className="wordmark" style={{ fontSize: 30 }}>
          Starque<span className="zz">ZZ</span>
        </div>
        <div className="muted tac" style={{ fontSize: 14, lineHeight: 1.5, maxWidth: 260 }}>
          {mode === 'signup'
            ? 'Free for every family, forever. No subscriptions, no catches.'
            : mode === 'login'
              ? 'Welcome back.'
              : 'We’ll email you a reset link.'}
        </div>
      </div>

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

      <div className="col center gap8" style={{ fontSize: 13.5, color: 'var(--muted)' }}>
        {mode === 'signup' ? (
          <button className="chip skip" onClick={() => setMode('login')}>
            Already set up? <b style={{ color: 'var(--cyan)' }}>Sign in</b>
          </button>
        ) : (
          <button className="chip skip" onClick={() => setMode('signup')}>
            New here? <b style={{ color: 'var(--cyan)' }}>Create an account</b>
          </button>
        )}
        {mode === 'login' && (
          <button className="chip skip" onClick={() => setMode('reset')}>
            Forgot password?
          </button>
        )}
      </div>
    </div>
  )
}
