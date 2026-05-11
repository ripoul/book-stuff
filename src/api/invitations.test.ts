import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { configureAuthFetch } from './authFetch.ts'
import { buildUrl } from './http.ts'
import {
  createManagedInvitation,
  listManagedInvitations,
  listMyInvitations,
  patchManagedInvitation,
  patchMyInvitation,
} from './invitations.ts'

function jsonResponse(data: unknown, ok = true, status = 200): Response {
  return {
    ok,
    status,
    text: () => Promise.resolve(JSON.stringify(data)),
    json: () => Promise.resolve(data),
  } as Response
}

const IID = 'a0000000-0000-4000-a000-000000000001'
const PID = 'b0000000-0000-4000-a000-000000000002'

describe('invitations API', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
    configureAuthFetch({
      getAccessToken: () => 'tok',
      refresh: async () => 'tok2',
    })
  })

  afterEach(() => {
    configureAuthFetch(null)
    vi.unstubAllGlobals()
  })

  it('listMyInvitations builds URL with single status', async () => {
    const payload = {
      count: 0,
      next: null,
      previous: null,
      results: [],
    }
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse(payload))
    await listMyInvitations({
      limit: 5,
      offset: 0,
      status: 'pending',
    })
    const url = String(vi.mocked(fetch).mock.calls[0][0])
    expect(url).toContain('/booking/me/invitations/')
    expect(url).toContain('status=pending')
  })

  it('listManagedInvitations repeats status query params', async () => {
    const payload = {
      count: 0,
      next: null,
      previous: null,
      results: [],
    }
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse(payload))
    await listManagedInvitations({
      limit: 10,
      offset: 0,
      place: PID,
      status: ['pending', 'revoked'],
    })
    const url = String(vi.mocked(fetch).mock.calls[0][0])
    const u = new URL(url)
    expect(u.pathname).toContain('/booking/manage/invitations/')
    expect(u.searchParams.getAll('status')).toEqual(['pending', 'revoked'])
    expect(u.searchParams.get('place')).toBe(PID)
  })

  it('buildUrl documents explode form for manage list', () => {
    const url = buildUrl('/booking/manage/invitations/', {
      limit: 1,
      offset: 0,
      status: ['declined', 'accepted'],
    })
    expect(new URL(url).searchParams.getAll('status')).toEqual([
      'declined',
      'accepted',
    ])
  })

  it('patchMyInvitation sends JSON body', async () => {
    const row = {
      id: IID,
      place: PID,
      place_name: 'Spot',
      email: 'a@b.co',
      status: 'accepted' as const,
      accepted_by: 1,
      invited_by: 2,
      created_at: '2020-01-01T00:00:00Z',
      updated_at: '2020-01-01T00:00:00Z',
    }
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse(row))
    const out = await patchMyInvitation(IID, { status: 'accepted' })
    expect(out.status).toBe('accepted')
    const init = vi.mocked(fetch).mock.calls[0][1] as RequestInit
    expect(init.method).toBe('PATCH')
    expect(init.body).toBe(JSON.stringify({ status: 'accepted' }))
  })

  it('createManagedInvitation posts place and email', async () => {
    const row = {
      id: IID,
      place: PID,
      email: 'inv@te.dev',
      status: 'pending' as const,
      accepted_by: null,
      invited_by: 3,
      created_at: '2020-01-01T00:00:00Z',
      updated_at: '2020-01-01T00:00:00Z',
    }
    vi.mocked(fetch).mockResolvedValueOnce(
      jsonResponse(row, true, 201) as Response,
    )
    await createManagedInvitation({ place: PID, email: 'Inv@TE.dev' })
    const init = vi.mocked(fetch).mock.calls[0][1] as RequestInit
    expect(init.method).toBe('POST')
    expect(init.body).toBe(JSON.stringify({ place: PID, email: 'inv@te.dev' }))
  })

  it('patchManagedInvitation throws ApiError on failure', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: () => Promise.resolve({ detail: 'bad' }),
    } as Response)
    await expect(
      patchManagedInvitation(IID, { status: 'revoked' }),
    ).rejects.toMatchObject({ status: 400, message: 'bad' })
  })
})
