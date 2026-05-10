import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { configureAuthFetch } from './authFetch.ts'
import { ApiError } from './errors.ts'
import { createPlace, getPlace, listPlaces, updatePlace } from './places.ts'

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
const PID2 = '20000000-0000-4000-a000-000000000002'
const PID3 = '30000000-0000-4000-a000-000000000003'
const PID4 = '40000000-0000-4000-a000-000000000004'

describe('places API', () => {
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

  it('listPlaces passes token and returns payload', async () => {
    const payload = {
      count: 1,
      next: null,
      previous: null,
      results: [
        {
          id: PID1,
          name: 'Lab',
          public: true,
          created_at: '2020-01-01T00:00:00Z',
          updated_at: '2020-01-01T00:00:00Z',
        },
      ],
    }
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse(payload))
    const res = await listPlaces({
      limit: 10,
      offset: 0,
      name: 'La',
      ordering: 'name',
    })
    expect(res.count).toBe(1)
    expect(res.results[0].name).toBe('Lab')
    const [url, init] = vi.mocked(fetch).mock.calls[0]
    expect(String(url)).toContain('booking/places/')
    expect(String(url)).toContain('limit=10')
    expect(String(url)).toContain('name=La')
    expect(String(url)).toContain('ordering=name')
    expect(new Headers(init?.headers).get('Authorization')).toBe('Bearer tok')
  })

  it('getPlace requests detail URL', async () => {
    const place = {
      id: PID4,
      name: 'Solo',
      public: false,
      can_manage: false,
      created_at: '2020-01-01T00:00:00Z',
      updated_at: '2020-01-01T00:00:00Z',
    }
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse(place))
    const res = await getPlace(PID4)
    expect(res.name).toBe('Solo')
    const [url, init] = vi.mocked(fetch).mock.calls[0]
    expect(String(url)).toContain(`booking/places/${PID4}/`)
    expect(new Headers(init?.headers).get('Authorization')).toBe('Bearer tok')
  })

  it('listPlaces adds managed_by_me when true', async () => {
    tokenForTests = null
    vi.mocked(fetch).mockResolvedValueOnce(
      jsonResponse({
        count: 0,
        next: null,
        previous: null,
        results: [],
      }),
    )
    await listPlaces({ limit: 5, offset: 0, managed_by_me: true })
    const [url, init] = vi.mocked(fetch).mock.calls[0]
    expect(String(url)).toContain('managed_by_me=true')
    expect(new Headers(init?.headers).get('Authorization')).toBeNull()
  })

  it('updatePlace sends PATCH', async () => {
    tokenForTests = 'access-token'
    const updated = {
      id: PID3,
      name: 'Renamed',
      public: true,
      can_manage: true,
      created_at: '2020-01-01T00:00:00Z',
      updated_at: '2020-01-03T00:00:00Z',
    }
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse(updated))
    const place = await updatePlace(PID3, { name: 'Renamed', public: true })
    expect(place.name).toBe('Renamed')
    const [url, init] = vi.mocked(fetch).mock.calls[0]
    expect(String(url)).toContain(`booking/places/${PID3}/`)
    expect(init?.method).toBe('PATCH')
    expect(JSON.parse(String(init?.body))).toEqual({
      name: 'Renamed',
      public: true,
    })
  })

  it('listPlaces throws ApiError when not ok', async () => {
    tokenForTests = null
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse({}, false, 500))
    await expect(listPlaces({ limit: 10, offset: 0 })).rejects.toThrow(ApiError)
  })

  it('createPlace sends JSON body', async () => {
    tokenForTests = 'access-token'
    const created = {
      id: PID2,
      name: 'New',
      public: false,
      created_at: '2020-01-02T00:00:00Z',
      updated_at: '2020-01-02T00:00:00Z',
    }
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse(created))
    const place = await createPlace({ name: 'New', public: false })
    expect(place.id).toBe(PID2)
    const [, init] = vi.mocked(fetch).mock.calls[0]
    expect(init?.method).toBe('POST')
    expect(JSON.parse(String(init?.body))).toEqual({
      name: 'New',
      public: false,
    })
  })
})
