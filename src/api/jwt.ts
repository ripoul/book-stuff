function jwtPayloadRecord(token: string): Record<string, unknown> | null {
  try {
    const part = token.split('.')[1]
    if (!part) return null
    const b64 = part.replace(/-/g, '+').replace(/_/g, '/')
    const pad = '='.repeat((4 - (b64.length % 4)) % 4)
    return JSON.parse(atob(b64 + pad)) as Record<string, unknown>
  } catch {
    return null
  }
}

export function jwtExpUnixSeconds(token: string): number | null {
  const payload = jwtPayloadRecord(token)
  if (!payload) return null
  return typeof payload.exp === 'number' ? payload.exp : null
}

export function jwtAccountEmail(token: string): string | null {
  const payload = jwtPayloadRecord(token)
  if (!payload) return null
  const email = payload.email
  if (typeof email === 'string' && email.length > 0)
    return email.trim().toLowerCase()
  const username = payload.username
  if (typeof username === 'string' && username.includes('@'))
    return username.trim().toLowerCase()
  return null
}

export function jwtUserId(token: string): string | null {
  const payload = jwtPayloadRecord(token)
  if (!payload) return null
  const raw = payload.user_id
  if (typeof raw === 'number' && Number.isFinite(raw)) return String(raw)
  if (typeof raw === 'string' && raw.length > 0) return raw
  return null
}
