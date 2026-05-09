import { CssBaseline, ThemeProvider } from '@mui/material'
import { render, type RenderOptions } from '@testing-library/react'
import { MemoryRouter, type MemoryRouterProps } from 'react-router-dom'
import type { ReactElement, ReactNode } from 'react'
import { AuthProvider } from './context/AuthProvider.tsx'
import { appTheme } from './theme.ts'

type ProviderOptions = {
  initialEntries?: MemoryRouterProps['initialEntries']
}

function createWrapper(options?: ProviderOptions) {
  const initialEntries = options?.initialEntries ?? ['/']
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <MemoryRouter initialEntries={initialEntries}>
        <ThemeProvider theme={appTheme}>
          <CssBaseline />
          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
      </MemoryRouter>
    )
  }
}

export function renderWithProviders(
  ui: ReactElement,
  options?: RenderOptions & ProviderOptions,
) {
  const { initialEntries, ...rest } = options ?? {}
  return render(ui, {
    wrapper: createWrapper({ initialEntries }),
    ...rest,
  })
}
