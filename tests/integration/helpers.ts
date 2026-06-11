import { createClient, type SupabaseClient } from '@supabase/supabase-js'

export const URL = process.env.SUPABASE_URL ?? 'http://127.0.0.1:55321'
export const ANON_KEY =
  process.env.SUPABASE_ANON_KEY ??
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'
export const SERVICE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ??
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'

export const admin = createClient(URL, SERVICE_KEY, {
  auth: { persistSession: false },
})

let familyCounter = 0

export interface Family {
  client: SupabaseClient
  parentId: string
  email: string
  childId: string
}

/** Creates a confirmed parent + one child, returns an authed client. */
export async function createFamily(childName = 'Zen'): Promise<Family> {
  const email = `family-${Date.now()}-${familyCounter++}@test.local`
  const password = 'star-test-password-1'
  const { data: created, error: createErr } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })
  if (createErr) throw createErr
  const parentId = created.user.id

  const client = createClient(URL, ANON_KEY, { auth: { persistSession: false } })
  const { error: signInErr } = await client.auth.signInWithPassword({ email, password })
  if (signInErr) throw signInErr

  const { data: child, error: childErr } = await client
    .from('children')
    .insert({ parent_id: parentId, name: childName, birth_year: 2017 })
    .select()
    .single()
  if (childErr) throw childErr

  return { client, parentId, email, childId: child.id }
}

export interface HabitSpec {
  name: string
  is_core?: boolean
  time_block?: string
  active_days?: number[]
}

/** Creates habits and backdates created_at so past-week scenarios work. */
export async function createHabits(
  fam: Family,
  specs: HabitSpec[],
  backdateDays = 60,
): Promise<string[]> {
  const ids: string[] = []
  for (const s of specs) {
    const { data, error } = await fam.client
      .from('habits')
      .insert({
        child_id: fam.childId,
        name: s.name,
        is_core: s.is_core ?? true,
        time_block: s.time_block ?? 'morning',
        active_days: s.active_days ?? [1, 2, 3, 4, 5, 6, 7],
      })
      .select()
      .single()
    if (error) throw error
    ids.push(data.id)
  }
  if (backdateDays > 0) {
    const past = new Date(Date.now() - backdateDays * 86400_000).toISOString()
    const { error } = await admin.from('habits').update({ created_at: past }).in('id', ids)
    if (error) throw error
  }
  return ids
}

export function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10)
}

export function daysAgo(n: number): string {
  return isoDate(new Date(Date.now() - n * 86400_000))
}

/** Monday of the most recent fully-finished week (its Sunday is <= today, UTC). */
export function lastWeekMonday(): string {
  const now = new Date()
  const dow = now.getUTCDay() === 0 ? 7 : now.getUTCDay() // ISO 1..7
  const thisMonday = new Date(now.getTime() - (dow - 1) * 86400_000)
  if (dow === 7) return isoDate(thisMonday) // Sunday: current week qualifies
  return isoDate(new Date(thisMonday.getTime() - 7 * 86400_000))
}

export async function balance(fam: Family): Promise<number> {
  const { data, error } = await fam.client
    .from('children')
    .select('star_balance')
    .eq('id', fam.childId)
    .single()
  if (error) throw error
  return data.star_balance
}

export async function rpc<T = any>(fam: Family, fn: string, args: object): Promise<T> {
  const { data, error } = await fam.client.rpc(fn, args)
  if (error) throw new Error(error.message)
  return data as T
}

export async function rpcError(fam: Family, fn: string, args: object): Promise<string> {
  const { error } = await fam.client.rpc(fn, args)
  if (!error) throw new Error(`expected ${fn} to fail but it succeeded`)
  return error.message
}
