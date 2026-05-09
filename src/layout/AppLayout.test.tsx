import { fireEvent, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Route, Routes } from 'react-router-dom'
import { renderWithProviders } from '../test-utils.tsx'
import { AppLayout } from './AppLayout.tsx'

describe('AppLayout', () => {
  it('renders title, logo link, and footer', () => {
    renderWithProviders(
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<span>page</span>} />
        </Route>
      </Routes>,
    )
    expect(screen.getByRole('link', { name: /book stuff/i })).toHaveAttribute(
      'href',
      '/',
    )
    const logo = screen.getByRole('link', { name: /home/i })
    expect(logo).toHaveAttribute('href', '/')
    expect(logo.querySelector('img')).toHaveAttribute('src', '/favicon.svg')
    expect(screen.getByRole('contentinfo')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /ripoul/i })).toHaveAttribute(
      'href',
      'https://github.com/ripoul',
    )
  })

  it('opens drawer from menu button', () => {
    renderWithProviders(
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<span>x</span>} />
        </Route>
      </Routes>,
    )
    fireEvent.click(screen.getAllByRole('button', { name: /open menu/i })[0])
    expect(screen.getByText('Menu')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /^home$/i })).toBeInTheDocument()
  })
})
