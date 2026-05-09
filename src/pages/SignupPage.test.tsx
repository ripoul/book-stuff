import { fireEvent, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { SignupPage } from './SignupPage.tsx'
import { renderWithProviders } from '../test-utils.tsx'

function fillSignup(emailVal: string, pass1: string, pass2: string) {
  const email = document.querySelector(
    'input[type="email"]',
  ) as HTMLInputElement
  const pwds = document.querySelectorAll('input[type="password"]')
  fireEvent.change(email, { target: { value: emailVal } })
  fireEvent.change(pwds[0], { target: { value: pass1 } })
  fireEvent.change(pwds[1], { target: { value: pass2 } })
}

describe('SignupPage', () => {
  it('validates password length before calling API', () => {
    renderWithProviders(<SignupPage />)
    fillSignup('a@b.c', 'short', 'short')
    fireEvent.click(screen.getByRole('button', { name: /create account/i }))
    expect(screen.getByRole('alert')).toHaveTextContent(
      /password must be at least 8 characters/i,
    )
  })

  it('validates password match', () => {
    renderWithProviders(<SignupPage />)
    fillSignup('a@b.c', 'longenough1', 'longenough2')
    fireEvent.click(screen.getByRole('button', { name: /create account/i }))
    expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument()
  })

  it('calls registration API with payload', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() =>
        Promise.resolve({
          ok: true,
          status: 201,
          json: () => Promise.resolve({ id: 1, email: 'new@test.dev' }),
        } as Response),
      ),
    )
    renderWithProviders(<SignupPage />, { initialEntries: ['/signup'] })
    fillSignup('new@test.dev', 'password123', 'password123')
    fireEvent.click(screen.getByRole('button', { name: /create account/i }))
    await waitFor(() => {
      expect(fetch).toHaveBeenCalled()
    })
    const calledUrl = String(vi.mocked(fetch).mock.calls[0][0])
    expect(calledUrl).toContain('accounts/users')
  })
})
