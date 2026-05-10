import { authFetch, peekAccessToken } from './authFetch.ts'
import { ApiError } from './errors.ts'
import { buildUrl } from './http.ts'
import { jwtUserId } from './jwt.ts'

export type AccountProfile = {
  id: string
  email: string
  first_name: string
  last_name: string
}

export type UpdateAccountBody = {
  email: string
  first_name: string
  last_name: string
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

function requireUserIdFromToken(): string {
  const token = peekAccessToken()
  if (!token) throw new ApiError(401, 'Not signed in')
  const id = jwtUserId(token)
  if (!id) throw new ApiError(401, 'Missing user id in token')
  return id
}

export async function getCurrentAccount(): Promise<AccountProfile> {
  const id = requireUserIdFromToken()
  const url = buildUrl(`/accounts/users/${id}/`)
  const res = await authFetch(url, { headers: { Accept: 'application/json' } })
  if (!res.ok) {
    throw new ApiError(res.status, await readErrorMessage(res))
  }
  return res.json() as Promise<AccountProfile>
}

export async function updateCurrentAccount(
  body: UpdateAccountBody,
): Promise<AccountProfile> {
  const id = requireUserIdFromToken()
  const url = buildUrl(`/accounts/users/${id}/`)
  const res = await authFetch(url, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      email: body.email.trim().toLowerCase(),
      first_name: body.first_name.trim(),
      last_name: body.last_name.trim(),
    }),
  })
  if (!res.ok) {
    throw new ApiError(res.status, await readErrorMessage(res))
  }
  return res.json() as Promise<AccountProfile>
}
