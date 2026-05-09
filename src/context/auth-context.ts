import { createContext } from 'react'

export type AuthState = {
  accessToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  refreshSession: () => Promise<string | null>
}

export const AuthContext = createContext<AuthState | null>(null)
