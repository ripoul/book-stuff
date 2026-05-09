import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { HomePage } from './HomePage.tsx'
import { renderWithProviders } from '../test-utils.tsx'

describe('HomePage', () => {
  it('shows product copy and navigation actions', () => {
    renderWithProviders(<HomePage />)
    expect(
      screen.getByText(/simple way to organise places/i),
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /view places/i })).toHaveAttribute(
      'href',
      '/places',
    )
    expect(screen.getByRole('link', { name: /sign in/i })).toHaveAttribute(
      'href',
      '/login',
    )
    expect(
      screen.getByRole('link', { name: /create account/i }),
    ).toHaveAttribute('href', '/signup')
  })
})
