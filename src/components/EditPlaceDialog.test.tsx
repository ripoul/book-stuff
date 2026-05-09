import { fireEvent, screen, waitFor, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { renderWithProviders } from '../test-utils.tsx'
import { EditPlaceDialog } from './EditPlaceDialog.tsx'

const updatePlaceMock = vi.hoisted(() => vi.fn())

vi.mock('../api/places.ts', () => ({
  listPlaces: vi.fn(),
  createPlace: vi.fn(),
  updatePlace: updatePlaceMock,
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

const samplePlace = {
  id: 7,
  name: 'Lab',
  public: false,
  can_manage: true,
  created_at: '2020-01-01T00:00:00Z',
  updated_at: '2020-01-01T00:00:00Z',
}

describe('EditPlaceDialog', () => {
  it('submits PATCH with name and public', async () => {
    updatePlaceMock.mockResolvedValue({
      ...samplePlace,
      name: 'Lab X',
      public: true,
    })
    const onClose = vi.fn()
    const onSaved = vi.fn()
    renderWithProviders(
      <EditPlaceDialog
        place={samplePlace}
        onClose={onClose}
        onSaved={onSaved}
      />,
    )
    const dialog = screen.getByRole('dialog', { name: /edit place/i })
    fireEvent.change(within(dialog).getByRole('textbox', { name: /^name$/i }), {
      target: { value: 'Lab X' },
    })
    fireEvent.click(within(dialog).getByRole('switch'))
    fireEvent.click(within(dialog).getByRole('button', { name: /^save$/i }))
    await waitFor(() => {
      expect(updatePlaceMock).toHaveBeenCalledWith(7, {
        name: 'Lab X',
        public: true,
      })
    })
    expect(onSaved).toHaveBeenCalled()
    expect(onClose).toHaveBeenCalled()
  })
})
