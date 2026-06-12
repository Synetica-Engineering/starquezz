// "Save your family" — converts a guest (anonymous) session into a permanent
// account by attaching email + password. Same user id, same rows: nothing
// migrates, nothing syncs — the credential just gets a name.
import { useState, type FormEvent } from 'react'
import { supabase } from '../lib/supabase'
import { Sheet } from './ui'
import { Zee } from './Zee'

export function ClaimAccountSheet({
  onClose,
  onSaved,
}: {
  onClose: () => void
  onSaved: () => void
}) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setBusy(true)
    try {
      const { error: authErr } = await supabase.auth.updateUser({ email, password })
      if (authErr) throw authErr
      // keep the parents row in step (the signup trigger only runs on INSERT)
      const { data: userData } = await supabase.auth.getUser()
      if (userData.user) {
        await supabase.from('parents').update({ email }).eq('id', userData.user.id)
      }
      onSaved()
    } catch (err) {
      const msg = err instanceof Error ? err.message : ''
      setError(
        /already|registered|exists/i.test(msg)
          ? 'That email already has a family — sign out and sign in with it instead.'
          : msg || 'Could not save — try again.',
      )
    } finally {
      setBusy(false)
    }
  }

  return (
    <Sheet onClose={onClose}>
      <div className="col center gap10 tac" style={{ paddingBottom: 6 }}>
        <Zee size={54} mood="awake" />
        <h3 style={{ margin: 0 }}>Save your family</h3>
        <p className="muted" style={{ margin: 0, fontSize: 13.5, lineHeight: 1.55, maxWidth: 270 }}>
          Right now this family lives only on this device. Add an email and you can sign in anywhere —
          stars, streaks and the board come along. Still free, forever.
        </p>
      </div>
      <form className="col gap12" onSubmit={submit} style={{ paddingTop: 10 }}>
        <div>
          <label className="field-label" htmlFor="claim-email">
            Email
          </label>
          <input
            id="claim-email"
            className="input"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
        </div>
        <div>
          <label className="field-label" htmlFor="claim-password">
            Password
          </label>
          <input
            id="claim-password"
            className="input"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="at least 8 characters"
          />
        </div>
        {error && <div className="form-error">{error}</div>}
        <button className="btn full" disabled={busy} type="submit">
          {busy ? '…' : 'Save our family ✦'}
        </button>
      </form>
    </Sheet>
  )
}
