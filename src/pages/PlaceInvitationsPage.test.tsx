import { screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { Route, Routes } from 'react-router-dom'
import * as invitationsApi from '../api/invitations.ts'
import * as placesApi from '../api/places.ts'
import { renderWithProviders } from '../test-utils.tsx'
import { PlaceInvitationsPage } from './PlaceInvitationsPage.tsx'

const PID = '80000000-0000-4000-a000-000000000008'
const IID = '90000000-0000-4000-a000-000000000009'

describe('PlaceInvitationsPage', () => {
  it('loads managed invitations for the place', async () => {
    localStorage.setItem('bookstuff_access', 'acc')
    localStorage.setItem('bookstuff_refresh', 'ref')
    localStorage.setItem('bookstuff_account_email', 'mgr@test.dev')
    vi.spyOn(placesApi, 'getPlace').mockResolvedValue({
      id: PID,
      name: 'Venue',
      public: true,
      can_manage: true,
      created_at: '2020-01-01T00:00:00Z',
      updated_at: '2020-01-01T00:00:00Z',
    })
    vi.spyOn(placesApi, 'listPlaces').mockResolvedValue({
      count: 1,
      next: null,
      previous: null,
      results: [
        {
          id: PID,
          name: 'Venue',
          public: true,
          can_manage: true,
          created_at: '2020-01-01T00:00:00Z',
          updated_at: '2020-01-01T00:00:00Z',
        },
      ],
    })
    const listSpy = vi
      .spyOn(invitationsApi, 'listManagedInvitations')
      .mockResolvedValue({
        count: 1,
        next: null,
        previous: null,
        results: [
          {
            id: IID,
            place: PID,
            email: 'guest@test.dev',
            status: 'pending' as const,
            accepted_by: null,
            invited_by: 2,
            created_at: '2020-01-01T00:00:00Z',
            updated_at: '2020-01-01T00:00:00Z',
          },
        ],
      })
    renderWithProviders(
      <Routes>
        <Route
          path="/places/:placeId/invitations"
          element={<PlaceInvitationsPage />}
        />
      </Routes>,
      { initialEntries: [`/places/${PID}/invitations`] },
    )
    await waitFor(() => {
      expect(listSpy).toHaveBeenCalledWith(
        expect.objectContaining({ place: PID }),
      )
    })
    expect(await screen.findByText('guest@test.dev')).toBeInTheDocument()
  })
})
