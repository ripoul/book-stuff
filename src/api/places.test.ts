import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ApiError } from './errors.ts'
import { createPlace, listPlaces, updatePlace } from './places.ts'

function jsonResponse(data: unknown, ok = true, status = 200): Response {
  return {
    ok,
    status,
    text: () => Promise.resolve(JSON.stringify(data)),
    json: () => Promise.resolve(data),
  } as Response
}

describe('places API', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('listPlaces passes token and returns payload', async () => {
    const payload = {
      count: 1,
      next: null,
      previous: null,
      results: [
        {
          id: 1,
          name: 'Lab',
          public: true,
          created_at: '2020-01-01T00:00:00Z',
          updated_at: '2020-01-01T00:00:00Z',
        },
      ],
    }
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse(payload))
    const res = await listPlaces(
      { limit: 10, offset: 0, name: 'La', ordering: 'name' },
      'tok',
    )
    expect(res.count).toBe(1)
    expect(res.results[0].name).toBe('Lab')
    const [url, init] = vi.mocked(fetch).mock.calls[0]
    expect(String(url)).toContain('booking/places/')
    expect(String(url)).toContain('limit=10')
    expect(String(url)).toContain('name=La')
    expect(String(url)).toContain('ordering=name')
    expect(init?.headers).toMatchObject({
      Authorization: 'Bearer tok',
    })
  })

  it('listPlaces adds managed_by_me when true', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      jsonResponse({
        count: 0,
        next: null,
        previous: null,
        results: [],
      }),
    )
    await listPlaces({ limit: 5, offset: 0, managed_by_me: true }, null)
    const [url] = vi.mocked(fetch).mock.calls[0]
    expect(String(url)).toContain('managed_by_me=true')
  })

  it('updatePlace sends PATCH', async () => {
    const updated = {
      id: 3,
      name: 'Renamed',
      public: true,
      can_manage: true,
      created_at: '2020-01-01T00:00:00Z',
      updated_at: '2020-01-03T00:00:00Z',
    }
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse(updated))
    const place = await updatePlace(
      3,
      { name: 'Renamed', public: true },
      'access-token',
    )
    expect(place.name).toBe('Renamed')
    const [url, init] = vi.mocked(fetch).mock.calls[0]
    expect(String(url)).toContain('booking/places/3/')
    expect(init?.method).toBe('PATCH')
    expect(JSON.parse(String(init?.body))).toEqual({
      name: 'Renamed',
      public: true,
    })
  })

  it('listPlaces throws ApiError when not ok', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse({}, false, 500))
    await expect(listPlaces({ limit: 10, offset: 0 }, null)).rejects.toThrow(
      ApiError,
    )
  })

  it('createPlace sends JSON body', async () => {
    const created = {
      id: 2,
      name: 'New',
      public: false,
      created_at: '2020-01-02T00:00:00Z',
      updated_at: '2020-01-02T00:00:00Z',
    }
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse(created))
    const place = await createPlace(
      { name: 'New', public: false },
      'access-token',
    )
    expect(place.id).toBe(2)
    const [, init] = vi.mocked(fetch).mock.calls[0]
    expect(init?.method).toBe('POST')
    expect(JSON.parse(String(init?.body))).toEqual({
      name: 'New',
      public: false,
    })
  })
})
