import { buildUrl } from './http.ts'

export type JwtPair = {
  access: string
  refresh: string
}

export type JwtRefresh = {
  access: string
}

export async function loginWithPassword(
  email: string,
  password: string,
): Promise<JwtPair> {
  const url = buildUrl('/auth/jwt/create/')
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ username: email.trim().toLowerCase(), password }),
  })
  if (!res.ok) {
    const msg = await readErrorMessage(res)
    throw new Error(msg)
  }
  return res.json() as Promise<JwtPair>
}

export async function refreshAccessToken(refresh: string): Promise<string> {
  const url = buildUrl('/auth/jwt/refresh/')
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ refresh }),
  })
  if (!res.ok) {
    const msg = await readErrorMessage(res)
    throw new Error(msg)
  }
  const data = (await res.json()) as JwtRefresh
  return data.access
}

export type RegisterBody = {
  email: string
  password: string
}

export type UserCreated = {
  id: number
  email: string
}

export async function registerUser(body: RegisterBody): Promise<UserCreated> {
  const url = buildUrl('/accounts/users/')
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({
      email: body.email.trim().toLowerCase(),
      password: body.password,
    }),
  })
  if (!res.ok) {
    const msg = await readErrorMessage(res)
    throw new Error(msg)
  }
  return res.json() as Promise<UserCreated>
}

async function readErrorMessage(res: Response): Promise<string> {
  try {
    const data = (await res.json()) as Record<string, unknown>
    if (typeof data.detail === 'string') return data.detail
    const parts: string[] = []
    for (const [k, v] of Object.entries(data)) {
      if (Array.isArray(v) && v.every((x) => typeof x === 'string')) {
        parts.push(`${k}: ${v.join(', ')}`)
      } else if (typeof v === 'string') {
        parts.push(`${k}: ${v}`)
      }
    }
    if (parts.length) return parts.join(' · ')
  } catch {
    /* ignore */
  }
  return `Request failed (${res.status})`
}
