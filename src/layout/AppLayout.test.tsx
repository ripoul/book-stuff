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
    const logo = screen.getByRole('link', { name: /home page logo/i })
    expect(logo).toHaveAttribute('href', '/')
    expect(logo.querySelector('img')).toHaveAttribute('src', '/favicon.svg')
    expect(screen.getByRole('contentinfo')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /ripoul/i })).toHaveAttribute(
      'href',
      'https://github.com/ripoul',
    )
  })

  it('shows navigation in the app bar on wide viewport', () => {
    renderWithProviders(
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<span>x</span>} />
        </Route>
      </Routes>,
    )
    expect(
      screen.getByRole('navigation', { name: /main/i }),
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /^home$/i })).toHaveAttribute(
      'href',
      '/',
    )
  })

  it('opens navigation drawer from burger on narrow viewport', () => {
    const w = window.innerWidth
    Object.defineProperty(window, 'innerWidth', {
      value: 600,
      configurable: true,
    })
    try {
      renderWithProviders(
        <Routes>
          <Route element={<AppLayout />}>
            <Route index element={<span>x</span>} />
          </Route>
        </Routes>,
      )
      expect(screen.queryByRole('navigation', { name: /main/i })).toBeNull()
      fireEvent.click(screen.getByRole('button', { name: /open menu/i }))
      expect(screen.getByRole('link', { name: /^home$/i })).toHaveAttribute(
        'href',
        '/',
      )
    } finally {
      Object.defineProperty(window, 'innerWidth', {
        value: w,
        configurable: true,
      })
    }
  })
})
