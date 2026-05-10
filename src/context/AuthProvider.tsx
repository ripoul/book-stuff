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
import { jwtAccountEmail } from '../api/jwt.ts'
import { configureAuthFetch } from '../api/authFetch.ts'
import { jwtExpUnixSeconds } from '../api/jwt.ts'
import { AuthContext } from './auth-context.ts'

const STORAGE_ACCESS = 'bookstuff_access'
const STORAGE_REFRESH = 'bookstuff_refresh'
const STORAGE_ACCOUNT_EMAIL = 'bookstuff_account_email'

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

function initialAccountEmail(): string | null {
  const stored = readStored(STORAGE_ACCOUNT_EMAIL)
  if (stored) return stored
  const access = readStored(STORAGE_ACCESS)
  if (access) {
    const fromJwt = jwtAccountEmail(access)
    if (fromJwt) return fromJwt
  }
  return null
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate()
  const [accessToken, setAccessToken] = useState<string | null>(() =>
    readStored(STORAGE_ACCESS),
  )
  const [refreshToken, setRefreshToken] = useState<string | null>(() =>
    readStored(STORAGE_REFRESH),
  )
  const [accountEmail, setAccountEmailState] = useState<string | null>(
    initialAccountEmail,
  )

  const accessTokenRef = useRef(accessToken)
  const refreshTokenRef = useRef(refreshToken)

  const logout = useCallback(() => {
    setAccessToken(null)
    setRefreshToken(null)
    setAccountEmailState(null)
    writeStored(STORAGE_ACCESS, null)
    writeStored(STORAGE_REFRESH, null)
    writeStored(STORAGE_ACCOUNT_EMAIL, null)
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

  const setAccountEmail = useCallback((email: string) => {
    const normalized = email.trim().toLowerCase()
    setAccountEmailState(normalized)
    writeStored(STORAGE_ACCOUNT_EMAIL, normalized)
  }, [])

  const login = useCallback(
    async (email: string, password: string) => {
      const pair = await loginWithPassword(email, password)
      setAccessToken(pair.access)
      setRefreshToken(pair.refresh)
      writeStored(STORAGE_ACCESS, pair.access)
      writeStored(STORAGE_REFRESH, pair.refresh)
      setAccountEmail(email)
    },
    [setAccountEmail],
  )

  const value = useMemo(
    () => ({
      accessToken,
      refreshToken,
      accountEmail,
      isAuthenticated: Boolean(accessToken || refreshToken),
      login,
      logout,
      refreshSession,
      setAccountEmail,
    }),
    [
      accessToken,
      refreshToken,
      accountEmail,
      login,
      logout,
      refreshSession,
      setAccountEmail,
    ],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
