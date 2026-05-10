import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { configureAuthFetch } from './authFetch.ts'
import { getCurrentAccount, updateCurrentAccount } from './account.ts'

function jsonResponse(data: unknown, ok = true, status = 200): Response {
  return {
    ok,
    status,
    json: () => Promise.resolve(data),
  } as Response
}

function jwtWithUserId(userId: string | number): string {
  const enc = (o: object) =>
    btoa(JSON.stringify(o))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '')
  return `${enc({ alg: 'none', typ: 'JWT' })}.${enc({ user_id: userId })}.x`
}

const UID = '10000000-0000-4000-a000-000000000001'

describe('account API', () => {
  beforeEach(() => {
    configureAuthFetch({
      getAccessToken: () => jwtWithUserId(UID),
      refresh: async () => null,
    })
    vi.stubGlobal(
      'fetch',
      vi.fn(() => jsonResponse({})),
    )
  })

  afterEach(() => {
    configureAuthFetch(null)
    vi.unstubAllGlobals()
  })

  it('getCurrentAccount GET /accounts/users/{id}/ from jwt user_id', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      jsonResponse({
        id: UID,
        email: 'a@b.c',
        first_name: 'A',
        last_name: 'B',
      }),
    )
    const me = await getCurrentAccount()
    expect(me.email).toBe('a@b.c')
    const calledUrl = String(vi.mocked(fetch).mock.calls[0][0])
    expect(calledUrl).toContain(`/accounts/users/${UID}`)
  })

  it('getCurrentAccount accepts numeric user_id in jwt', async () => {
    configureAuthFetch({
      getAccessToken: () => jwtWithUserId(99),
      refresh: async () => null,
    })
    vi.mocked(fetch).mockResolvedValueOnce(
      jsonResponse({
        id: '99',
        email: 'n@n.n',
        first_name: 'N',
        last_name: 'N',
      }),
    )
    await getCurrentAccount()
    expect(String(vi.mocked(fetch).mock.calls[0][0])).toContain(
      '/accounts/users/99',
    )
  })

  it('updateCurrentAccount PATCH /accounts/users/{id}/ from jwt', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      jsonResponse({
        id: UID,
        email: 'x@y.z',
        first_name: 'X',
        last_name: 'Y',
      }),
    )
    await updateCurrentAccount({
      email: 'X@Y.Z',
      first_name: '  X ',
      last_name: ' Y ',
    })
    const [calledUrl, init] = vi.mocked(fetch).mock.calls[0]
    expect(String(calledUrl)).toContain(`/accounts/users/${UID}`)
    expect(init?.method).toBe('PATCH')
    const body = JSON.parse(String(init?.body))
    expect(body.email).toBe('x@y.z')
  })
})
