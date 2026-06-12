// Guest mode (Option A): anonymous sessions are real accounts — same RLS,
// same RPCs — and claiming with an email keeps the same rows.
import { describe, it, expect } from 'vitest'
import { createClient } from '@supabase/supabase-js'
import { URL, ANON_KEY, daysAgo } from './helpers'

function anonClient() {
  return createClient(URL, ANON_KEY, { auth: { persistSession: false } })
}

describe('anonymous guest accounts', () => {
  it('guest can run the whole loop: child, habits, check-offs, stars', async () => {
    const client = anonClient()
    const { data: signIn, error: signInErr } = await client.auth.signInAnonymously()
    expect(signInErr).toBeNull()
    const userId = signIn.user!.id
    expect(signIn.user!.is_anonymous).toBe(true)

    // signup trigger created the parents row (empty email)
    const { data: parent } = await client.from('parents').select('*').single()
    expect(parent!.id).toBe(userId)
    expect(parent!.email).toBe('')

    // full kid-loop slice under RLS + RPCs
    const { data: child, error: childErr } = await client
      .from('children')
      .insert({ parent_id: userId, name: 'Guest Kid' })
      .select()
      .single()
    expect(childErr).toBeNull()
    const { data: habit } = await client
      .from('habits')
      .insert({ child_id: child!.id, name: 'Brush teeth' })
      .select()
      .single()
    const { data: res, error: rpcErr } = await client.rpc('complete_habit', {
      p_habit_id: habit!.id,
      p_on: daysAgo(0),
    })
    expect(rpcErr).toBeNull()
    expect(res.awarded).toBe(1)
  })

  it('claiming with email keeps the same user id and all family data', async () => {
    const client = anonClient()
    const { data: signIn } = await client.auth.signInAnonymously()
    const userId = signIn.user!.id

    const { data: child } = await client
      .from('children')
      .insert({ parent_id: userId, name: 'Claimed Kid', star_balance: 0 })
      .select()
      .single()
    const { data: habit } = await client
      .from('habits')
      .insert({ child_id: child!.id, name: 'Reading' })
      .select()
      .single()
    await client.rpc('complete_habit', { p_habit_id: habit!.id, p_on: daysAgo(0) })

    // claim: attach email + password to the SAME account
    const email = `claimed-${Date.now()}@starquezz.test`
    const password = 'claimed-password-1'
    const { data: updated, error: updateErr } = await client.auth.updateUser({ email, password })
    expect(updateErr).toBeNull()
    expect(updated.user!.id).toBe(userId)
    expect(updated.user!.is_anonymous).toBe(false)
    await client.from('parents').update({ email }).eq('id', userId)

    // sign in fresh with the credential — the family is right there
    const fresh = anonClient()
    const { error: loginErr } = await fresh.auth.signInWithPassword({ email, password })
    expect(loginErr).toBeNull()
    const { data: kids } = await fresh.from('children').select('name, star_balance')
    expect(kids).toHaveLength(1)
    expect(kids![0].name).toBe('Claimed Kid')
    expect(kids![0].star_balance).toBe(1) // the check-off survived the claim
  })

  it('guests are isolated from each other like any family', async () => {
    const a = anonClient()
    const b = anonClient()
    const { data: sa } = await a.auth.signInAnonymously()
    await b.auth.signInAnonymously()
    await a.from('children').insert({ parent_id: sa.user!.id, name: 'A-guest kid' })
    const { data: visible } = await b.from('children').select('*')
    expect(visible!.every((c) => c.parent_id !== sa.user!.id)).toBe(true)
  })
})
