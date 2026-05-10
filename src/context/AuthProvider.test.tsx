import { fireEvent, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { useAuth } from './useAuth.ts'
import { renderWithProviders } from '../test-utils.tsx'

function AuthProbe() {
  const { login, logout, isAuthenticated } = useAuth()
  return (
    <div>
      <span data-testid="auth-state">{isAuthenticated ? 'in' : 'out'}</span>
      <button
        type="button"
        onClick={() => void login('u@test.dev', 'password123')}
      >
        do-login
      </button>
      <button type="button" onClick={logout}>
        do-logout
      </button>
    </div>
  )
}

describe('AuthProvider', () => {
  it('persists session after login and clears on logout', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() =>
        Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve({ access: 'acc', refresh: 'ref' }),
        } as Response),
      ),
    )
    renderWithProviders(<AuthProbe />)
    expect(screen.getByTestId('auth-state')).toHaveTextContent('out')
    fireEvent.click(screen.getByRole('button', { name: 'do-login' }))
    await waitFor(() => {
      expect(screen.getByTestId('auth-state')).toHaveTextContent('in')
    })
    expect(localStorage.getItem('bookstuff_access')).toBe('acc')
    expect(localStorage.getItem('bookstuff_account_email')).toBe('u@test.dev')
    fireEvent.click(screen.getByRole('button', { name: 'do-logout' }))
    expect(screen.getByTestId('auth-state')).toHaveTextContent('out')
    expect(localStorage.getItem('bookstuff_access')).toBeNull()
    expect(localStorage.getItem('bookstuff_account_email')).toBeNull()
  })
})
