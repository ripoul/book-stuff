import { fireEvent, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { Route, Routes } from 'react-router-dom'
import { listPlaces } from '../api/places.ts'
import { renderWithProviders } from '../test-utils.tsx'
import { PlacesPage } from './PlacesPage.tsx'

vi.mock('../api/places.ts', () => ({
  listPlaces: vi.fn(),
  createPlace: vi.fn(),
  updatePlace: vi.fn(),
  getPlace: vi.fn(),
}))

const listPlacesMock = vi.mocked(listPlaces)

const PLACE_ALPHA_ID = '10000000-0000-4000-a000-000000000001'
const PLACE_BETA_ID = '20000000-0000-4000-a000-000000000002'

describe('PlacesPage', () => {
  beforeEach(() => {
    listPlacesMock.mockResolvedValue({
      count: 2,
      next: null,
      previous: null,
      results: [
        {
          id: PLACE_ALPHA_ID,
          name: 'Alpha',
          public: true,
          can_manage: true,
          created_at: '2020-01-01T00:00:00Z',
          updated_at: '2020-01-01T00:00:00Z',
        },
        {
          id: PLACE_BETA_ID,
          name: 'Beta',
          public: false,
          can_manage: false,
          created_at: '2020-01-02T00:00:00Z',
          updated_at: '2020-01-02T00:00:00Z',
        },
      ],
    })
  })

  it('loads and displays places', async () => {
    renderWithProviders(<PlacesPage />)
    await waitFor(() => expect(listPlacesMock).toHaveBeenCalled())
    expect(await screen.findByText('Alpha')).toBeInTheDocument()
    expect(screen.getByText('Beta')).toBeInTheDocument()
  })

  it('requests pagination params', async () => {
    renderWithProviders(<PlacesPage />)
    await waitFor(() => expect(listPlacesMock).toHaveBeenCalled())
    expect(listPlacesMock).toHaveBeenCalledWith(
      expect.objectContaining({
        limit: 10,
        offset: 0,
        ordering: '-created_at',
      }),
    )
  })

  it('disables add when not authenticated', () => {
    renderWithProviders(<PlacesPage />)
    const addButtons = screen.getAllByRole('button', { name: /add place/i })
    expect(addButtons[0]).toBeDisabled()
  })

  it('hides managed by me switch when not authenticated', () => {
    renderWithProviders(<PlacesPage />)
    expect(
      screen.queryByRole('switch', { name: /managed by me/i }),
    ).not.toBeInTheDocument()
  })

  it('sends managed_by_me when filter is on', async () => {
    localStorage.setItem('bookstuff_access', 'acc')
    localStorage.setItem('bookstuff_refresh', 'ref')
    renderWithProviders(<PlacesPage />)
    await waitFor(() => expect(listPlacesMock).toHaveBeenCalled())
    listPlacesMock.mockClear()
    fireEvent.click(screen.getByRole('switch', { name: /managed by me/i }))
    await waitFor(() =>
      expect(listPlacesMock).toHaveBeenCalledWith(
        expect.objectContaining({ managed_by_me: true }),
      ),
    )
  })

  it('opens edit dialog when can_manage', async () => {
    renderWithProviders(<PlacesPage />)
    await waitFor(() => expect(listPlacesMock).toHaveBeenCalled())
    fireEvent.click(screen.getByRole('button', { name: /edit alpha/i }))
    expect(
      await screen.findByRole('dialog', { name: /edit place/i }),
    ).toBeInTheDocument()
  })

  it('does not show edit for rows without can_manage', async () => {
    renderWithProviders(<PlacesPage />)
    await waitFor(() => expect(screen.getByText('Beta')).toBeInTheDocument())
    expect(
      screen.queryByRole('button', { name: /edit beta/i }),
    ).not.toBeInTheDocument()
  })

  it('navigates to place detail when row is clicked', async () => {
    renderWithProviders(
      <Routes>
        <Route path="/places" element={<PlacesPage />} />
        <Route path="/places/:placeId" element={<div>place-detail</div>} />
      </Routes>,
      { initialEntries: ['/places'] },
    )
    await waitFor(() => expect(listPlacesMock).toHaveBeenCalled())
    const row = screen.getByText('Alpha').closest('tr')
    expect(row).toBeTruthy()
    fireEvent.click(row as HTMLElement)
    await waitFor(() =>
      expect(screen.getByText('place-detail')).toBeInTheDocument(),
    )
  })
})
