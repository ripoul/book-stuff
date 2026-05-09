import { useCallback, useMemo, useState, type ReactNode } from 'react'
import { loginWithPassword, refreshAccessToken } from '../api/auth.ts'
import { AuthContext } from './auth-context.ts'

const STORAGE_ACCESS = 'bookstuff_access'
const STORAGE_REFRESH = 'bookstuff_refresh'

function readStored(key: string): string | null {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

function writeStored(key: string, value: string | null) {
  try {
    if (value === null) localStorage.removeItem(key)
    else localStorage.setItem(key, value)
  } catch {
    /* ignore */
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [accessToken, setAccessToken] = useState<string | null>(() =>
    readStored(STORAGE_ACCESS),
  )
  const [refreshToken, setRefreshToken] = useState<string | null>(() =>
    readStored(STORAGE_REFRESH),
  )

  const logout = useCallback(() => {
    setAccessToken(null)
    setRefreshToken(null)
    writeStored(STORAGE_ACCESS, null)
    writeStored(STORAGE_REFRESH, null)
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const pair = await loginWithPassword(email, password)
    setAccessToken(pair.access)
    setRefreshToken(pair.refresh)
    writeStored(STORAGE_ACCESS, pair.access)
    writeStored(STORAGE_REFRESH, pair.refresh)
  }, [])

  const refreshSession = useCallback(async () => {
    if (!refreshToken) return null
    try {
      const access = await refreshAccessToken(refreshToken)
      setAccessToken(access)
      writeStored(STORAGE_ACCESS, access)
      return access
    } catch {
      logout()
      return null
    }
  }, [refreshToken, logout])

  const value = useMemo(
    () => ({
      accessToken,
      refreshToken,
      isAuthenticated: Boolean(accessToken || refreshToken),
      login,
      logout,
      refreshSession,
    }),
    [accessToken, refreshToken, login, logout, refreshSession],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
