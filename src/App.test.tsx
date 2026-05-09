import { CssBaseline, ThemeProvider } from '@mui/material'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import App from './App.tsx'
import { AuthProvider } from './context/AuthProvider.tsx'
import { appTheme } from './theme.ts'

const listPlacesMock = vi.hoisted(() =>
  vi.fn().mockResolvedValue({
    count: 0,
    next: null,
    previous: null,
    results: [],
  }),
)

const getPlaceMock = vi.hoisted(() =>
  vi.fn().mockResolvedValue({
    id: 1,
    name: 'Sample',
    public: true,
    can_manage: true,
    created_at: '2020-01-01T00:00:00Z',
    updated_at: '2020-01-01T00:00:00Z',
  }),
)

const listResourcesMock = vi.hoisted(() =>
  vi.fn().mockResolvedValue({
    count: 0,
    next: null,
    previous: null,
    results: [],
  }),
)

vi.mock('./api/places.ts', () => ({
  listPlaces: listPlacesMock,
  getPlace: getPlaceMock,
  createPlace: vi.fn(),
  updatePlace: vi.fn(),
}))

vi.mock('./api/resources.ts', () => ({
  listResources: listResourcesMock,
  createResource: vi.fn(),
  updateResource: vi.fn(),
}))

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <ThemeProvider theme={appTheme}>
        <CssBaseline />
        <AuthProvider>
          <App />
        </AuthProvider>
      </ThemeProvider>
    </MemoryRouter>,
  )
}

describe('App', () => {
  it('home presents the project', async () => {
    renderAt('/')
    expect(
      await screen.findByText(/simple way to organise places/i),
    ).toBeInTheDocument()
  })

  it('places route loads list', async () => {
    renderAt('/places')
    expect(
      await screen.findByRole('heading', { name: /^places$/i }),
    ).toBeInTheDocument()
    expect(listPlacesMock).toHaveBeenCalled()
  })

  it('place detail route loads place', async () => {
    renderAt('/places/1')
    expect(
      await screen.findByRole('heading', { name: 'Sample' }),
    ).toBeInTheDocument()
    expect(getPlaceMock).toHaveBeenCalled()
    expect(listResourcesMock).toHaveBeenCalled()
  })

  it('login route shows form', async () => {
    renderAt('/login')
    expect(
      await screen.findByRole('heading', { name: /^sign in$/i }),
    ).toBeInTheDocument()
  })

  it('signup route shows form', async () => {
    renderAt('/signup')
    expect(
      await screen.findByRole('heading', { name: /create account/i }),
    ).toBeInTheDocument()
  })
})
