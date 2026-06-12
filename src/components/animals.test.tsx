import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { AvatarPicker } from './AvatarPicker'
import { ANIMAL_KEYS, ANIMALS, AnimalFace } from './animals'

describe('animal avatars', () => {
  it('includes the musang face as a selectable animal', () => {
    expect(ANIMALS.musang?.label).toBe('Musang')
    expect(ANIMAL_KEYS).toContain('musang')

    render(<AnimalFace name="musang" />)

    expect(screen.getByRole('img', { name: 'Musang' })).toBeInTheDocument()
  })

  it('renders musang in the avatar picker', () => {
    render(<AvatarPicker avatar="cat" photo={null} onAvatar={() => undefined} onPhoto={() => undefined} />)

    expect(screen.getByRole('button', { name: 'avatar Musang' })).toBeInTheDocument()
  })
})
