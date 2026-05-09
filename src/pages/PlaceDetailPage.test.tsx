import { screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { Route, Routes } from 'react-router-dom'
import { getPlace } from '../api/places.ts'
import { listResources } from '../api/resources.ts'
import { renderWithProviders } from '../test-utils.tsx'
import { PlaceDetailPage } from './PlaceDetailPage.tsx'

vi.mock('../api/places.ts', () => ({
  listPlaces: vi.fn(),
  createPlace: vi.fn(),
  updatePlace: vi.fn(),
  getPlace: vi.fn(),
}))

vi.mock('../api/resources.ts', () => ({
  listResources: vi.fn(),
  createResource: vi.fn(),
  updateResource: vi.fn(),
}))

const getPlaceMock = vi.mocked(getPlace)
const listResourcesMock = vi.mocked(listResources)

describe('PlaceDetailPage', () => {
  it('shows place name and resources', async () => {
    getPlaceMock.mockResolvedValue({
      id: 3,
      name: 'Lab North',
      public: true,
      can_manage: true,
      created_at: '2020-01-01T00:00:00Z',
      updated_at: '2020-01-01T00:00:00Z',
    })
    listResourcesMock.mockResolvedValue({
      count: 1,
      next: null,
      previous: null,
      results: [
        {
          id: 10,
          place: 3,
          name: 'Bench 1',
          created_at: '2020-01-01T00:00:00Z',
          updated_at: '2020-01-01T00:00:00Z',
        },
      ],
    })
    renderWithProviders(
      <Routes>
        <Route path="/places/:placeId" element={<PlaceDetailPage />} />
      </Routes>,
      { initialEntries: ['/places/3'] },
    )
    expect(
      await screen.findByRole('heading', { name: 'Lab North' }),
    ).toBeInTheDocument()
    expect(await screen.findByText('Bench 1')).toBeInTheDocument()
    await waitFor(() =>
      expect(listResourcesMock).toHaveBeenCalledWith(
        expect.objectContaining({ place: 3 }),
      ),
    )
  })

  it('hides add resource when cannot manage', async () => {
    getPlaceMock.mockResolvedValue({
      id: 5,
      name: 'Read only',
      public: true,
      can_manage: false,
      created_at: '2020-01-01T00:00:00Z',
      updated_at: '2020-01-01T00:00:00Z',
    })
    listResourcesMock.mockResolvedValue({
      count: 0,
      next: null,
      previous: null,
      results: [],
    })
    renderWithProviders(
      <Routes>
        <Route path="/places/:placeId" element={<PlaceDetailPage />} />
      </Routes>,
      { initialEntries: ['/places/5'] },
    )
    await screen.findByRole('heading', { name: 'Read only' })
    expect(
      screen.queryByRole('button', { name: /add resource/i }),
    ).not.toBeInTheDocument()
  })
})
