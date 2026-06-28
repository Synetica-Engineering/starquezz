// Family data store. Loads the whole family (it's small), exposes RPC-backed
// actions, refreshes after mutations. The star economy lives in Postgres —
// this layer never computes awards, it only displays them.
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { supabase } from '../lib/supabase'
import { addDays, isoDow, todayLocal } from '../lib/dates'
import type {
  Adventure,
  Child,
  CompleteResult,
  Completion,
  Dream,
  FinalizeResult,
  Habit,
  HabitLibraryEntry,
  LibraryActivity,
  Parent,
  ParentEdit,
  PlannedAdventure,
  SillyActivity,
  StarEvent,
  WeekFinalization,
} from '../lib/types'

export interface FamilyState {
  loading: boolean
  parent: Parent | null
  children: Child[]
  habits: Habit[]
  completions: Completion[]
  starEvents: StarEvent[]
  adventures: Adventure[]
  planned: PlannedAdventure[]
  dreams: Dream[]
  weekFinalizations: WeekFinalization[]
  parentEdits: ParentEdit[]
  habitLibrary: HabitLibraryEntry[]
  activityLibrary: LibraryActivity[]
  sillyLibrary: SillyActivity[]
  refresh: () => Promise<void>
  // kid loop
  completeHabit: (habitId: string) => Promise<CompleteResult>
  undoCompletion: (habitId: string) => Promise<void>
  redeemAdventure: (adventureId: string, childId: string, plannedFor: string) => Promise<void>
  finalizeWeek: (childId: string, weekStart: string) => Promise<FinalizeResult>
  // parent surface
  setPlannedStatus: (plannedId: string, status: 'done' | 'skipped' | 'planned') => Promise<void>
  graduateHabit: (habitId: string) => Promise<void>
  adjustStars: (childId: string, delta: number, note: string) => Promise<void>
  setParentPin: (pin: string) => Promise<void>
  verifyParentPin: (pin: string) => Promise<{ ok: boolean; reason?: string; retry_in?: number }>
  setChildCode: (childId: string, code: string | null) => Promise<void>
  verifyChildCode: (childId: string, code: string) => Promise<boolean>
}

const Ctx = createContext<FamilyState | null>(null)

async function fetchAll<T>(query: PromiseLike<{ data: T[] | null; error: { message: string } | null }>): Promise<T[]> {
  const { data, error } = await query
  if (error) throw new Error(error.message)
  return data ?? []
}

export function FamilyProvider({ children: kids }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true)
  const [parent, setParent] = useState<Parent | null>(null)
  const [childRows, setChildRows] = useState<Child[]>([])
  const [habits, setHabits] = useState<Habit[]>([])
  const [completions, setCompletions] = useState<Completion[]>([])
  const [starEvents, setStarEvents] = useState<StarEvent[]>([])
  const [adventures, setAdventures] = useState<Adventure[]>([])
  const [planned, setPlanned] = useState<PlannedAdventure[]>([])
  const [dreams, setDreams] = useState<Dream[]>([])
  const [weekFinalizations, setWeekFinalizations] = useState<WeekFinalization[]>([])
  const [parentEdits, setParentEdits] = useState<ParentEdit[]>([])
  const [habitLibrary, setHabitLibrary] = useState<HabitLibraryEntry[]>([])
  const [activityLibrary, setActivityLibrary] = useState<LibraryActivity[]>([])
  const [sillyLibrary, setSillyLibrary] = useState<SillyActivity[]>([])

  const refresh = useCallback(async () => {
    const since = addDays(todayLocal(), -120)
    const [
      parentRes,
      childrenData,
      habitsData,
      completionsData,
      starEventsData,
      adventuresData,
      plannedData,
      dreamsData,
      weeksData,
      editsData,
    ] = await Promise.all([
      supabase.from('parents').select('*').maybeSingle(),
      fetchAll<Child>(supabase.from('children').select('*').order('created_at')),
      fetchAll<Habit>(supabase.from('habits').select('*').order('sort_order').order('created_at')),
      fetchAll<Completion>(supabase.from('completions').select('*').gte('completed_on', since)),
      fetchAll<StarEvent>(
        supabase
          .from('star_events')
          .select('*')
          .gte('created_at', new Date(Date.now() - 30 * 86400_000).toISOString())
          .order('created_at', { ascending: false }),
      ),
      fetchAll<Adventure>(supabase.from('adventures').select('*').order('tier').order('cost')),
      fetchAll<PlannedAdventure>(
        supabase.from('planned_adventures').select('*').order('created_at', { ascending: false }).limit(30),
      ),
      fetchAll<Dream>(supabase.from('dreams').select('*').order('created_at', { ascending: false })),
      fetchAll<WeekFinalization>(supabase.from('week_finalizations').select('*')),
      fetchAll<ParentEdit>(
        supabase.from('parent_edits').select('*').order('created_at', { ascending: false }).limit(20),
      ),
    ])
    setParent((parentRes.data as Parent | null) ?? null)
    setChildRows(childrenData)
    setHabits(habitsData)
    setCompletions(completionsData)
    setStarEvents(starEventsData)
    setAdventures(adventuresData)
    setPlanned(plannedData)
    setDreams(dreamsData)
    setWeekFinalizations(weeksData)
    setParentEdits(editsData)
    setLoading(false)
  }, [])

  useEffect(() => {
    void refresh()
    // libraries are global + static: load once
    void fetchAll<HabitLibraryEntry>(
      supabase
        .from('habit_library')
        .select('*')
        .order('age_min')
        .order('category')
        .order('name'),
    ).then((rows) => setHabitLibrary(rows.filter((h) => h.is_active !== false)))
    void fetchAll<LibraryActivity>(
      supabase.from('library_activities').select('*').order('suggested_tier'),
    ).then((rows) => setActivityLibrary(rows.filter((a) => a.is_active !== false)))
    void fetchAll<SillyActivity>(
      supabase.from('library_silly_activities').select('*').order('silly_key'),
    ).then((rows) => setSillyLibrary(rows.filter((a) => a.is_active !== false)))
  }, [refresh])

  const rpc = useCallback(
    async <T,>(fn: string, args: object): Promise<T> => {
      const { data, error } = await supabase.rpc(fn, args)
      if (error) throw new Error(error.message)
      return data as T
    },
    [],
  )

  const value = useMemo<FamilyState>(
    () => ({
      loading,
      parent,
      children: childRows,
      habits,
      completions,
      starEvents,
      adventures,
      planned,
      dreams,
      weekFinalizations,
      parentEdits,
      habitLibrary,
      activityLibrary,
      sillyLibrary,
      refresh,
      completeHabit: async (habitId) => {
        const res = await rpc<CompleteResult>('complete_habit', {
          p_habit_id: habitId,
          p_on: todayLocal(),
        })
        await refresh()
        return res
      },
      undoCompletion: async (habitId) => {
        await rpc('undo_completion', { p_habit_id: habitId, p_on: todayLocal() })
        await refresh()
      },
      redeemAdventure: async (adventureId, childId, plannedFor) => {
        await rpc('redeem_adventure', {
          p_adventure_id: adventureId,
          p_child_id: childId,
          p_planned_for: plannedFor,
        })
        await refresh()
      },
      finalizeWeek: async (childId, weekStart) => {
        const res = await rpc<FinalizeResult>('finalize_week', {
          p_child_id: childId,
          p_week_start: weekStart,
        })
        await refresh()
        return res
      },
      setPlannedStatus: async (plannedId, status) => {
        await rpc('set_planned_adventure_status', { p_planned_id: plannedId, p_status: status })
        await refresh()
      },
      graduateHabit: async (habitId) => {
        await rpc('graduate_habit', { p_habit_id: habitId })
        await refresh()
      },
      adjustStars: async (childId, delta, note) => {
        await rpc('adjust_stars', { p_child_id: childId, p_delta: delta, p_note: note })
        await refresh()
      },
      setParentPin: async (pin) => {
        await rpc('set_parent_pin', { p_pin: pin })
        await refresh()
      },
      verifyParentPin: (pin) => rpc('verify_parent_pin', { p_pin: pin }),
      setChildCode: async (childId, code) => {
        await rpc('set_child_code', { p_child_id: childId, p_code: code })
        await refresh()
      },
      verifyChildCode: (childId, code) =>
        rpc<boolean>('verify_child_code', { p_child_id: childId, p_code: code }),
    }),
    [
      loading, parent, childRows, habits, completions, starEvents, adventures, planned, dreams,
      weekFinalizations, parentEdits, habitLibrary, activityLibrary, sillyLibrary, refresh, rpc,
    ],
  )

  return <Ctx.Provider value={value}>{kids}</Ctx.Provider>
}

export function useFamily(): FamilyState {
  const v = useContext(Ctx)
  if (!v) throw new Error('useFamily outside FamilyProvider')
  return v
}

// ---------- pure selectors (display only — awards come from the RPCs) ----------

export function habitsForChild(habits: Habit[], childId: string): Habit[] {
  return habits.filter((h) => h.child_id === childId && !h.archived_at && h.status === 'active')
}

export function graduatedHabits(habits: Habit[], childId: string): Habit[] {
  return habits.filter((h) => h.child_id === childId && h.status === 'graduated')
}

export function isDone(completions: Completion[], habitId: string, date: string): boolean {
  return completions.some((c) => c.habit_id === habitId && c.completed_on === date)
}

export function scheduledOn(habits: Habit[], date: string): Habit[] {
  const dow = isoDow(date)
  return habits.filter((h) => h.active_days.includes(dow))
}

/** Mirror of the SQL star-day rule, for display only. */
export function starDayComplete(habits: Habit[], completions: Completion[], childId: string, date: string): boolean {
  const cores = scheduledOn(habitsForChild(habits, childId), date).filter((h) => h.is_core)
  if (cores.length === 0) return false
  return cores.every((h) => isDone(completions, h.id, date))
}

/** Mirror of compute_streak, for the flame display. */
export function displayStreak(habits: Habit[], completions: Completion[], childId: string, asOf: string): number {
  let d = asOf
  let streak = 0
  const hasCores = (date: string) =>
    scheduledOn(habitsForChild(habits, childId), date).some((h) => h.is_core)
  if (hasCores(d) && !starDayComplete(habits, completions, childId, d)) d = addDays(d, -1)
  for (let i = 0; i < 120; i++) {
    if (!hasCores(d)) {
      d = addDays(d, -1)
      continue
    }
    if (!starDayComplete(habits, completions, childId, d)) break
    streak++
    d = addDays(d, -1)
  }
  return streak
}
