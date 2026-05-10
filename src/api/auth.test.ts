import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { loginWithPassword, refreshAccessToken, registerUser } from './auth.ts'

function jsonResponse(data: unknown, ok = true, status = 200): Response {
  return {
    ok,
    status,
    json: () => Promise.resolve(data),
  } as Response
}

describe('auth API', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() => jsonResponse({ access: 'a', refresh: 'r' })),
    )
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('loginWithPassword posts username and password', async () => {
    const pair = await loginWithPassword('User@Mail.com', 'secret12')
    expect(pair.access).toBe('a')
    expect(pair.refresh).toBe('r')
    expect(fetch).toHaveBeenCalled()
    const [, init] = vi.mocked(fetch).mock.calls[0]
    expect(init?.method).toBe('POST')
    const body = JSON.parse(String(init?.body))
    expect(body.username).toBe('user@mail.com')
    expect(body.password).toBe('secret12')
  })

  it('loginWithPassword throws on failure', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      jsonResponse({ detail: 'No active account' }, false, 401),
    )
    await expect(loginWithPassword('x@y.z', 'bad')).rejects.toThrow()
  })

  it('refreshAccessToken returns new access', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse({ access: 'new' }))
    const access = await refreshAccessToken('old-refresh')
    expect(access).toBe('new')
  })

  it('registerUser posts names email and password', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      jsonResponse({
        id: '10000000-0000-4000-a000-000000000001',
        email: 'a@b.c',
      }),
    )
    const user = await registerUser({
      first_name: '  Jane ',
      last_name: ' Doe ',
      email: 'A@B.C',
      password: 'longenough',
    })
    expect(user.id).toBe('10000000-0000-4000-a000-000000000001')
    const [, init] = vi.mocked(fetch).mock.calls[0]
    const body = JSON.parse(String(init?.body))
    expect(body.first_name).toBe('Jane')
    expect(body.last_name).toBe('Doe')
    expect(body.email).toBe('a@b.c')
    expect(body.password).toBe('longenough')
  })
})
