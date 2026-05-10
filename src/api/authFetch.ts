type AuthFetchHandlers = {
  getAccessToken: () => string | null
  refresh: () => Promise<string | null>
}

let handlers: AuthFetchHandlers | null = null

export function configureAuthFetch(h: AuthFetchHandlers | null) {
  handlers = h
}

export function peekAccessToken(): string | null {
  return handlers?.getAccessToken() ?? null
}

async function requestWithToken(
  input: string,
  init: RequestInit,
  token: string | null,
): Promise<Response> {
  const headers = new Headers(init.headers)
  if (token) headers.set('Authorization', `Bearer ${token}`)
  else headers.delete('Authorization')
  return fetch(input, { ...init, headers })
}

export async function authFetch(
  input: string,
  init: RequestInit = {},
): Promise<Response> {
  if (!handlers) return fetch(input, init)
  const token = handlers.getAccessToken()
  const first = await requestWithToken(input, init, token)
  if (first.status !== 401) return first
  if (!token) return first
  const next = await handlers.refresh()
  if (!next) return first
  return requestWithToken(input, init, next)
}
