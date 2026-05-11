import { fireEvent, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { Route, Routes } from 'react-router-dom'
import * as invitationsApi from '../api/invitations.ts'
import { renderWithProviders } from '../test-utils.tsx'
import { MyInvitationsPage } from './MyInvitationsPage.tsx'

const PID = '60000000-0000-4000-a000-000000000006'
const IID = '70000000-0000-4000-a000-000000000007'

describe('MyInvitationsPage', () => {
  it('lists invitations and filters by status', async () => {
    localStorage.setItem('bookstuff_access', 'acc')
    localStorage.setItem('bookstuff_refresh', 'ref')
    localStorage.setItem('bookstuff_account_email', 'me@test.dev')
    const listSpy = vi
      .spyOn(invitationsApi, 'listMyInvitations')
      .mockResolvedValue({
        count: 1,
        next: null,
        previous: null,
        results: [
          {
            id: IID,
            place: PID,
            place_name: 'Hall',
            email: 'inv@test.dev',
            status: 'pending' as const,
            accepted_by: null,
            invited_by: 1,
            created_at: '2020-01-01T00:00:00Z',
            updated_at: '2020-01-01T00:00:00Z',
          },
        ],
      })
    renderWithProviders(
      <Routes>
        <Route path="/account/invitations" element={<MyInvitationsPage />} />
      </Routes>,
      { initialEntries: ['/account/invitations'] },
    )
    await waitFor(() => {
      expect(listSpy).toHaveBeenCalled()
    })
    expect(await screen.findByText('Hall')).toBeInTheDocument()
    expect(screen.getByText('inv@test.dev')).toBeInTheDocument()
    fireEvent.mouseDown(screen.getByLabelText(/status/i))
    fireEvent.click(await screen.findByRole('option', { name: 'pending' }))
    await waitFor(() => {
      const calls = listSpy.mock.calls.map((c) => c[0] as { status?: string })
      expect(calls.some((p) => p.status === 'pending')).toBe(true)
    })
  })
})
