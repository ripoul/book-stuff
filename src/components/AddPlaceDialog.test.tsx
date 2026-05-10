import { fireEvent, screen, waitFor, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { renderWithProviders } from '../test-utils.tsx'
import { AddPlaceDialog } from './AddPlaceDialog.tsx'

const createPlaceMock = vi.hoisted(() => vi.fn())

vi.mock('../api/places.ts', () => ({
  listPlaces: vi.fn(),
  createPlace: createPlaceMock,
  updatePlace: vi.fn(),
  getPlace: vi.fn(),
}))

vi.mock('../context/useAuth.ts', () => ({
  useAuth: () => ({
    accessToken: 'test-access',
    refreshToken: 'test-refresh',
    isAuthenticated: true,
    login: vi.fn(),
    logout: vi.fn(),
    refreshSession: vi.fn().mockResolvedValue('test-access'),
  }),
}))

describe('AddPlaceDialog', () => {
  it('submits name and public flag', async () => {
    createPlaceMock.mockResolvedValue({
      id: '90000000-0000-4000-a000-000000000009',
      name: 'Room A',
      public: true,
      created_at: '2020-01-01T00:00:00Z',
      updated_at: '2020-01-01T00:00:00Z',
    })
    const onClose = vi.fn()
    const onCreated = vi.fn()
    renderWithProviders(
      <AddPlaceDialog open onClose={onClose} onCreated={onCreated} />,
    )
    const dialog = screen.getByRole('dialog', { name: /add place/i })
    fireEvent.change(within(dialog).getByRole('textbox', { name: /^name$/i }), {
      target: { value: 'Room A' },
    })
    fireEvent.click(within(dialog).getByRole('switch'))
    fireEvent.click(within(dialog).getByRole('button', { name: /^save$/i }))
    await waitFor(() => {
      expect(createPlaceMock).toHaveBeenCalledWith({
        name: 'Room A',
        public: true,
      })
    })
    expect(onCreated).toHaveBeenCalled()
    expect(onClose).toHaveBeenCalled()
  })
})
