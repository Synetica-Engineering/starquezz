export type TimeBlock = 'morning' | 'afternoon' | 'evening'
export type HabitCategory = 'body' | 'mind' | 'space' | 'heart'
export type HabitStatus = 'active' | 'graduated'
export type AdventureStatus = 'planned' | 'done' | 'skipped'
export type DreamStatus = 'active' | 'achieved' | 'retired'

export interface Parent {
  id: string
  email: string
  parent_pin_hash: string | null
  ceremony_reminder: boolean
}

export interface Child {
  id: string
  parent_id: string
  name: string
  avatar: string
  photo: string | null
  secret_code_hash: string | null
  star_balance: number
  birth_year: number | null
  interests: string[]
  focus_notes: string
}

export interface Habit {
  id: string
  child_id: string
  library_id: string | null
  name: string
  icon: string
  category: HabitCategory
  time_block: TimeBlock
  is_core: boolean
  active_days: number[]
  sort_order: number
  status: HabitStatus
  graduated_at: string | null
  archived_at: string | null
  created_at: string
}

export interface Completion {
  id: string
  habit_id: string
  child_id: string
  completed_on: string
  created_at: string
}

export interface StarEvent {
  id: string
  child_id: string
  delta: number
  reason: string
  ref_id: string | null
  note: string | null
  created_at: string
}

export interface Adventure {
  id: string
  parent_id: string
  library_id: string | null
  name: string
  illustration: string
  cost: number
  tier: number
  venue_note: string
  archived_at: string | null
}

export interface PlannedAdventure {
  id: string
  adventure_id: string
  child_id: string
  planned_for: string
  status: AdventureStatus
  created_at: string
}

export interface Dream {
  id: string
  child_id: string
  name: string
  illustration: string
  pledge_text: string
  stars_required: number
  stars_earned: number
  anchor_date: string | null
  status: DreamStatus
}

export interface HabitLibraryEntry {
  id: string
  library_key?: string | null
  name: string
  icon: string
  kid_label: string
  category: HabitCategory
  age_min: number
  age_max: number
  why_it_matters: string
  sources_note?: string
  suggested_block: TimeBlock
  suggested_frequency?: string
  duration_min?: number
  evidence_level?: string
  source_urls?: string
  is_active?: boolean
  mastery_signal: string
}

export interface LibraryActivity {
  id: string
  activity_key?: string | null
  name: string
  illustration: string
  explainer: string
  prep: string
  duration_min: number
  energy: 'indoor' | 'outdoor' | 'either'
  age_min: number
  age_max: number
  cost: 'free' | 'cheap' | 'spendy'
  location_type: string
  suggested_tier: number
  category?: string
  why_good_reward?: string
  source_urls?: string
  is_active?: boolean
}

export interface ParentEdit {
  id: string
  summary: string
  created_at: string
}

export interface WeekFinalization {
  id: string
  child_id: string
  week_start: string
  perfect: boolean
  star_days: number
}

export interface CompleteResult {
  awarded: number
  streak_bonus: number
  star_day: boolean
  streak: number
  all_done: boolean
}

export interface FinalizeResult {
  already_finalized: boolean
  perfect: boolean
  star_days: number
  active_days?: number
  awarded: number
  dream_star_lit: boolean
  dream_completed: boolean
  streak: number
}
