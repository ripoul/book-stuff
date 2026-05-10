import { fireEvent, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { Route, Routes } from 'react-router-dom'
import * as accountApi from '../api/account.ts'
import { renderWithProviders } from '../test-utils.tsx'
import { AccountPage } from './AccountPage.tsx'

describe('AccountPage', () => {
  it('loads profile and submits updates', async () => {
    localStorage.setItem('bookstuff_access', 'acc')
    localStorage.setItem('bookstuff_refresh', 'ref')
    localStorage.setItem('bookstuff_account_email', 'me@test.dev')
    vi.spyOn(accountApi, 'getCurrentAccount').mockResolvedValue({
      id: '10000000-0000-4000-a000-000000000001',
      email: 'me@test.dev',
      first_name: 'Ada',
      last_name: 'Lovelace',
    })
    const updateSpy = vi
      .spyOn(accountApi, 'updateCurrentAccount')
      .mockResolvedValue({
        id: '10000000-0000-4000-a000-000000000001',
        email: 'me@test.dev',
        first_name: 'Ada',
        last_name: 'Byron',
      })
    renderWithProviders(
      <Routes>
        <Route path="/account" element={<AccountPage />} />
      </Routes>,
      { initialEntries: ['/account'] },
    )
    await waitFor(() => {
      expect(screen.getByLabelText(/first name/i)).toHaveValue('Ada')
    })
    fireEvent.change(screen.getByLabelText(/last name/i), {
      target: { value: 'Byron' },
    })
    fireEvent.click(screen.getByRole('button', { name: /save changes/i }))
    await waitFor(() => {
      expect(updateSpy).toHaveBeenCalledWith({
        email: 'me@test.dev',
        first_name: 'Ada',
        last_name: 'Byron',
      })
    })
  })
})
