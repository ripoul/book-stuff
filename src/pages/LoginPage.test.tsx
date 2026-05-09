import { fireEvent, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { LoginPage } from './LoginPage.tsx'
import { renderWithProviders } from '../test-utils.tsx'

describe('LoginPage', () => {
  it('shows success alert when registered query is set', () => {
    renderWithProviders(<LoginPage />, {
      initialEntries: ['/login?registered=1'],
    })
    expect(screen.getByText(/account created/i)).toBeInTheDocument()
  })

  it('shows session expired when session query is set', () => {
    renderWithProviders(<LoginPage />, {
      initialEntries: ['/login?session=expired'],
    })
    expect(screen.getByText(/votre session a expiré/i)).toBeInTheDocument()
  })

  it('stores tokens after successful submit', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() =>
        Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve({ access: 'tok', refresh: 'ref' }),
        } as Response),
      ),
    )
    renderWithProviders(<LoginPage />, { initialEntries: ['/login'] })
    const email = document.querySelector(
      'input[type="email"]',
    ) as HTMLInputElement
    const password = document.querySelector(
      'input[type="password"]',
    ) as HTMLInputElement
    fireEvent.change(email, { target: { value: 'me@test.dev' } })
    fireEvent.change(password, { target: { value: 'password123' } })
    fireEvent.click(screen.getByRole('button', { name: /^sign in$/i }))
    await waitFor(() => {
      expect(localStorage.getItem('bookstuff_access')).toBe('tok')
    })
  })

  it('shows error when credentials are rejected', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() =>
        Promise.resolve({
          ok: false,
          status: 401,
          json: () => Promise.resolve({ detail: 'Invalid credentials' }),
        } as Response),
      ),
    )
    renderWithProviders(<LoginPage />, { initialEntries: ['/login'] })
    const email = document.querySelector(
      'input[type="email"]',
    ) as HTMLInputElement
    const password = document.querySelector(
      'input[type="password"]',
    ) as HTMLInputElement
    fireEvent.change(email, { target: { value: 'x@y.z' } })
    fireEvent.change(password, { target: { value: 'wrongpass1' } })
    fireEvent.click(screen.getByRole('button', { name: /^sign in$/i }))
    expect(await screen.findByText(/invalid credentials/i)).toBeInTheDocument()
  })
})
