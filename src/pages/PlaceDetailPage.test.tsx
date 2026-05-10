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

const PLACE_LAB_ID = '30000000-0000-4000-a000-000000000003'
const PLACE_READONLY_ID = '50000000-0000-4000-a000-000000000005'
const RESOURCE_BENCH_ID = 'a1000000-0000-4000-a000-000000000010'

describe('PlaceDetailPage', () => {
  it('shows place name and resources', async () => {
    getPlaceMock.mockResolvedValue({
      id: PLACE_LAB_ID,
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
          id: RESOURCE_BENCH_ID,
          place: PLACE_LAB_ID,
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
      { initialEntries: [`/places/${PLACE_LAB_ID}`] },
    )
    expect(
      await screen.findByRole('heading', { name: 'Lab North' }),
    ).toBeInTheDocument()
    expect(await screen.findByText('Bench 1')).toBeInTheDocument()
    await waitFor(() =>
      expect(listResourcesMock).toHaveBeenCalledWith(
        expect.objectContaining({ place: PLACE_LAB_ID }),
      ),
    )
  })

  it('hides add resource when cannot manage', async () => {
    getPlaceMock.mockResolvedValue({
      id: PLACE_READONLY_ID,
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
      { initialEntries: [`/places/${PLACE_READONLY_ID}`] },
    )
    await screen.findByRole('heading', { name: 'Read only' })
    expect(
      screen.queryByRole('button', { name: /add resource/i }),
    ).not.toBeInTheDocument()
  })
})
