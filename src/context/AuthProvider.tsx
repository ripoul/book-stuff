import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { useNavigate } from 'react-router-dom'
import { loginWithPassword, refreshAccessToken } from '../api/auth.ts'
import { configureAuthFetch } from '../api/authFetch.ts'
import { jwtExpUnixSeconds } from '../api/jwt.ts'
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
  const navigate = useNavigate()
  const [accessToken, setAccessToken] = useState<string | null>(() =>
    readStored(STORAGE_ACCESS),
  )
  const [refreshToken, setRefreshToken] = useState<string | null>(() =>
    readStored(STORAGE_REFRESH),
  )

  const accessTokenRef = useRef(accessToken)
  const refreshTokenRef = useRef(refreshToken)

  const logout = useCallback(() => {
    setAccessToken(null)
    setRefreshToken(null)
    writeStored(STORAGE_ACCESS, null)
    writeStored(STORAGE_REFRESH, null)
  }, [])

  const refreshSessionRef = useRef<() => Promise<string | null>>(
    async () => null,
  )

  const refreshSession = useCallback(async () => {
    const rt = refreshTokenRef.current
    if (!rt) return null
    try {
      const access = await refreshAccessToken(rt)
      setAccessToken(access)
      writeStored(STORAGE_ACCESS, access)
      return access
    } catch {
      logout()
      navigate('/login?session=expired', { replace: true })
      return null
    }
  }, [logout, navigate])

  useEffect(() => {
    accessTokenRef.current = accessToken
    refreshTokenRef.current = refreshToken
  }, [accessToken, refreshToken])

  useEffect(() => {
    refreshSessionRef.current = refreshSession
  }, [refreshSession])

  useEffect(() => {
    configureAuthFetch({
      getAccessToken: () => accessTokenRef.current,
      refresh: () => refreshSessionRef.current(),
    })
    return () => configureAuthFetch(null)
  }, [])

  useEffect(() => {
    if (!accessToken) return
    const exp = jwtExpUnixSeconds(accessToken)
    if (!exp) return
    const now = Math.floor(Date.now() / 1000)
    const skew = 60
    const delayMs = Math.max(0, (exp - now - skew) * 1000)
    const id = window.setTimeout(() => {
      void refreshSessionRef.current()
    }, delayMs)
    return () => window.clearTimeout(id)
  }, [accessToken])

  const login = useCallback(async (email: string, password: string) => {
    const pair = await loginWithPassword(email, password)
    setAccessToken(pair.access)
    setRefreshToken(pair.refresh)
    writeStored(STORAGE_ACCESS, pair.access)
    writeStored(STORAGE_REFRESH, pair.refresh)
  }, [])

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
