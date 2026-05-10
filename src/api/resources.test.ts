import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { configureAuthFetch } from './authFetch.ts'
import { ApiError } from './errors.ts'
import { createResource, listResources, updateResource } from './resources.ts'

function jsonResponse(data: unknown, ok = true, status = 200): Response {
  return {
    ok,
    status,
    text: () => Promise.resolve(JSON.stringify(data)),
    json: () => Promise.resolve(data),
  } as Response
}

let tokenForTests: string | null = 'tok'

const PID1 = '10000000-0000-4000-a000-000000000001'
const PID7 = '70000000-0000-4000-a000-000000000007'
const RID1 = 'c1000000-0000-4000-a000-000000000001'
const RID2 = 'c2000000-0000-4000-a000-000000000002'

describe('resources API', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
    tokenForTests = 'tok'
    configureAuthFetch({
      getAccessToken: () => tokenForTests,
      refresh: async () => {
        tokenForTests = 'refreshed'
        return 'refreshed'
      },
    })
  })

  afterEach(() => {
    configureAuthFetch(null)
    vi.unstubAllGlobals()
  })

  it('listResources filters by place id', async () => {
    tokenForTests = null
    vi.mocked(fetch).mockResolvedValueOnce(
      jsonResponse({
        count: 0,
        next: null,
        previous: null,
        results: [],
      }),
    )
    await listResources({ limit: 10, offset: 0, place: PID7 })
    const [url] = vi.mocked(fetch).mock.calls[0]
    expect(String(url)).toContain('booking/resources/')
    expect(String(url)).toContain(`place=${PID7}`)
    expect(String(url)).toContain('limit=10')
  })

  it('createResource posts place and name', async () => {
    tokenForTests = 'access-token'
    const created = {
      id: RID1,
      place: PID7,
      name: 'Desk A',
      created_at: '2020-01-01T00:00:00Z',
      updated_at: '2020-01-01T00:00:00Z',
    }
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse(created))
    const r = await createResource({ place: PID7, name: 'Desk A' })
    expect(r.name).toBe('Desk A')
    const [, init] = vi.mocked(fetch).mock.calls[0]
    expect(init?.method).toBe('POST')
    expect(JSON.parse(String(init?.body))).toEqual({
      place: PID7,
      name: 'Desk A',
    })
  })

  it('updateResource sends PATCH', async () => {
    tokenForTests = 'access-token'
    const updated = {
      id: RID2,
      place: PID7,
      name: 'Desk B',
      created_at: '2020-01-01T00:00:00Z',
      updated_at: '2020-01-02T00:00:00Z',
    }
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse(updated))
    const r = await updateResource(RID2, { name: 'Desk B' })
    expect(r.name).toBe('Desk B')
    const [url, init] = vi.mocked(fetch).mock.calls[0]
    expect(String(url)).toContain(`booking/resources/${RID2}/`)
    expect(init?.method).toBe('PATCH')
  })

  it('listResources throws ApiError when not ok', async () => {
    tokenForTests = null
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse({}, false, 500))
    await expect(
      listResources({ limit: 5, offset: 0, place: PID1 }),
    ).rejects.toThrow(ApiError)
  })
})
