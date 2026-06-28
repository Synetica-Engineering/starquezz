import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { FamilyState } from '../../state/family'
import { ScoutChat } from './Scout'
import type { HabitLibraryEntry } from '../../lib/types'

const mocks = vi.hoisted(() => ({
  invoke: vi.fn(),
}))

vi.mock('../../lib/supabase', () => ({
  supabase: {
    functions: { invoke: mocks.invoke },
  },
}))

const habitEntry = (entry: Omit<HabitLibraryEntry, 'library_key' | 'sources_note' | 'suggested_frequency' | 'duration_min' | 'evidence_level' | 'source_urls' | 'is_active'>): HabitLibraryEntry => ({
  ...entry,
  library_key: entry.id,
  sources_note: '',
  suggested_frequency: 'Daily',
  duration_min: 10,
  evidence_level: '',
  source_urls: '',
  is_active: true,
})

const mockFamily: FamilyState = {
  loading: false,
  parent: null,
  children: [],
  habits: [],
  completions: [],
  starEvents: [],
  adventures: [],
  planned: [],
  dreams: [],
  weekFinalizations: [],
  parentEdits: [],
  habitLibrary: [
    habitEntry({
      id: 'habit-body-1',
      name: 'Brush teeth',
      icon: 'tooth',
      kid_label: 'Brush teeth',
      category: 'body',
      age_min: 4,
      age_max: 10,
      why_it_matters: 'Daily hygiene is easiest when it becomes automatic.',
      suggested_block: 'morning',
      mastery_signal: 'Does it without reminders.',
    }),
    habitEntry({
      id: 'habit-body-2',
      name: 'Get dressed',
      icon: 'shirt',
      kid_label: 'Get dressed',
      category: 'body',
      age_min: 4,
      age_max: 10,
      why_it_matters: 'Getting ready independently makes mornings calmer.',
      suggested_block: 'morning',
      mastery_signal: 'Starts without being asked.',
    }),
    habitEntry({
      id: 'habit-space-1',
      name: 'Pack bag',
      icon: 'backpack',
      kid_label: 'Pack bag',
      category: 'space',
      age_min: 6,
      age_max: 10,
      why_it_matters: 'A predictable school bag routine reduces forgotten items.',
      suggested_block: 'evening',
      mastery_signal: 'Checks the bag before bed.',
    }),
    habitEntry({
      id: 'habit-mind-1',
      name: 'Read 10 minutes',
      icon: 'book',
      kid_label: 'Read',
      category: 'mind',
      age_min: 5,
      age_max: 10,
      why_it_matters: 'Short daily reading builds fluency.',
      suggested_block: 'evening',
      mastery_signal: 'Chooses reading time independently.',
    }),
    habitEntry({
      id: 'habit-heart-1',
      name: 'Kindness check',
      icon: 'heart',
      kid_label: 'Kindness',
      category: 'heart',
      age_min: 5,
      age_max: 10,
      why_it_matters: 'Naming one kind act helps kids notice relationships.',
      suggested_block: 'evening',
      mastery_signal: 'Can name kind acts without prompting.',
    }),
  ],
  activityLibrary: [],
  sillyLibrary: [],
  refresh: vi.fn(),
  completeHabit: vi.fn(),
  undoCompletion: vi.fn(),
  redeemAdventure: vi.fn(),
  finalizeWeek: vi.fn(),
  setPlannedStatus: vi.fn(),
  graduateHabit: vi.fn(),
  adjustStars: vi.fn(),
  setParentPin: vi.fn(),
  verifyParentPin: vi.fn(),
  setChildCode: vi.fn(),
  verifyChildCode: vi.fn(),
}

vi.mock('../../state/family', () => ({
  useFamily: () => mockFamily,
}))

function renderScout() {
  return render(
    <ScoutChat
      childName="Musbro"
      age={7}
      interests="drawing, football"
      onAccepted={vi.fn()}
      onManual={vi.fn()}
      adventuresToo={false}
    />,
  )
}

function renderScoutWithAdventures() {
  return render(
    <ScoutChat
      childName="Musbro"
      age={7}
      interests="drawing, football"
      onAccepted={vi.fn()}
      onManual={vi.fn()}
      adventuresToo
    />,
  )
}

function reply(text: string) {
  const input = screen.getByLabelText('your reply')
  fireEvent.change(input, { target: { value: text } })
  fireEvent.click(screen.getByRole('button', { name: 'send' }))
}

describe('ScoutChat (dynamic conversation)', () => {
  beforeEach(() => {
    Element.prototype.scrollTo = vi.fn()
    mocks.invoke.mockReset()
    // simulate the LLM proxy being unavailable → warm scripted fallback path
    mocks.invoke.mockResolvedValue({ data: null, error: new Error('scout_unavailable') })
  })

  it('opens with a single warm, conversational question', () => {
    renderScout()
    const firstPrompt = screen.getByText(/what do you want musbro to become more confident doing/i)
    expect(firstPrompt.textContent?.match(/\?/g)).toHaveLength(1)
  })

  it('uses the approved one-question-at-a-time habit sequence', async () => {
    renderScout()
    reply('Writing notes.')
    expect(await screen.findByText(/what does musbro avoid or forget/i)).toBeInTheDocument()
    reply('Packing his bag.')
    expect(await screen.findByText(/what does musbro usually do without much help/i)).toBeInTheDocument()
    reply('He reads by himself.')
    expect(await screen.findByText(/when does musbro need the most help/i)).toBeInTheDocument()
    reply('School mornings.')
    expect(await screen.findByText(/what does musbro love right now/i)).toBeInTheDocument()
    expect(mocks.invoke).not.toHaveBeenCalled()
  })

  it('reaches a ready-to-build gate that asks permission before generating', async () => {
    renderScout()
    reply('Writing notes.')
    await screen.findByText(/what does musbro avoid or forget/i)
    reply('Packing his bag.')
    await screen.findByText(/what does musbro usually do without much help/i)
    reply('He reads by himself.')
    await screen.findByText(/when does musbro need the most help/i)
    reply('School mornings.')
    await screen.findByText(/what does musbro love right now/i)
    reply('Drawing and football.')
    // Starquezz asks permission, and the explicit build button appears
    expect(await screen.findByText(/want starquezz to build musbro.s habits now/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /build musbro.s habits/i })).toBeInTheDocument()
    // nothing was generated until the parent says yes
    expect(mocks.invoke).not.toHaveBeenCalledWith(
      'scout',
      expect.objectContaining({ body: expect.objectContaining({ kind: 'habits' }) }),
    )
  })

  it('builds a grouped recommendation only after the parent confirms', async () => {
    renderScout()
    reply('Writing notes.')
    await screen.findByText(/what does musbro avoid or forget/i)
    reply('Packing his bag.')
    await screen.findByText(/what does musbro usually do without much help/i)
    reply('He reads by himself.')
    await screen.findByText(/when does musbro need the most help/i)
    reply('School mornings.')
    await screen.findByText(/what does musbro love right now/i)
    reply('Drawing and football.')
    const buildBtn = await screen.findByRole('button', { name: /build musbro.s habits/i })

    fireEvent.click(buildBtn)

    // now a proposal is requested, and the offline fallback yields draft cards
    await waitFor(() =>
      expect(mocks.invoke).toHaveBeenCalledWith(
        'scout',
        expect.objectContaining({ body: expect.objectContaining({ kind: 'habits' }) }),
      ),
    )
    // offline can't tailor to the chat, so it shows the age-appropriate group
    expect(await screen.findByText(/great for musbro.s age/i)).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: 'accept' }).length).toBeGreaterThan(0)
  })

  it('lets the parent keep a subset and move on without deciding every card', async () => {
    renderScoutWithAdventures()
    reply('Writing notes.')
    await screen.findByText(/what does musbro avoid or forget/i)
    reply('Packing his bag.')
    await screen.findByText(/what does musbro usually do without much help/i)
    reply('He reads by himself.')
    await screen.findByText(/when does musbro need the most help/i)
    reply('School mornings.')
    await screen.findByText(/what does musbro love right now/i)
    reply('Drawing and football.')
    fireEvent.click(await screen.findByRole('button', { name: /build musbro.s habits/i }))

    await screen.findByText(/great for musbro.s age/i)
    // accept just the first card — the rest stay undecided (treated as skipped)
    fireEvent.click(screen.getAllByRole('button', { name: 'accept' })[0])
    const keep = await screen.findByRole('button', { name: /keep these 1/i })
    expect(keep).not.toBeDisabled()
    fireEvent.click(keep)

    // flows into the adventures conversation
    expect(await screen.findByText(/what does musbro love doing with you/i)).toBeInTheDocument()
  })
})
