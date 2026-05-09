import type { Paginated, Place } from '../types/booking.ts'
import { ApiError } from './errors.ts'
import { buildUrl } from './http.ts'

export type ListPlacesParams = {
  limit: number
  offset: number
  name?: string
  ordering?: string
  managed_by_me?: boolean
}

export async function listPlaces(
  params: ListPlacesParams,
  accessToken: string | null,
): Promise<Paginated<Place>> {
  const query: Record<string, string | number | undefined> = {
    limit: params.limit,
    offset: params.offset,
  }
  if (params.name?.trim()) query.name = params.name.trim()
  if (params.ordering) query.ordering = params.ordering
  if (params.managed_by_me === true) query.managed_by_me = 'true'
  const url = buildUrl('/booking/places/', query)
  const headers: HeadersInit = { Accept: 'application/json' }
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`
  const res = await fetch(url, { headers })
  if (!res.ok) {
    throw new ApiError(res.status, `Request failed (${res.status})`)
  }
  return res.json() as Promise<Paginated<Place>>
}

export type CreatePlaceBody = {
  name: string
  public: boolean
}

export async function createPlace(
  body: CreatePlaceBody,
  accessToken: string,
): Promise<Place> {
  const url = buildUrl('/booking/places/')
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const text = await res.text()
    try {
      const data = JSON.parse(text) as Record<string, unknown>
      const parts: string[] = []
      for (const [k, v] of Object.entries(data)) {
        if (Array.isArray(v) && v.every((x) => typeof x === 'string')) {
          parts.push(`${k}: ${v.join(', ')}`)
        }
      }
      if (parts.length) throw new ApiError(res.status, parts.join(' · '))
    } catch (e) {
      if (e instanceof ApiError) throw e
    }
    throw new ApiError(res.status, `Request failed (${res.status})`)
  }
  return res.json() as Promise<Place>
}

export type UpdatePlaceBody = CreatePlaceBody

export async function updatePlace(
  id: number,
  body: UpdatePlaceBody,
  accessToken: string,
): Promise<Place> {
  const url = buildUrl(`/booking/places/${id}/`)
  const res = await fetch(url, {
    method: 'PATCH',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const text = await res.text()
    try {
      const data = JSON.parse(text) as Record<string, unknown>
      const parts: string[] = []
      for (const [k, v] of Object.entries(data)) {
        if (Array.isArray(v) && v.every((x) => typeof x === 'string')) {
          parts.push(`${k}: ${v.join(', ')}`)
        }
      }
      if (parts.length) throw new ApiError(res.status, parts.join(' · '))
    } catch (e) {
      if (e instanceof ApiError) throw e
    }
    throw new ApiError(res.status, `Request failed (${res.status})`)
  }
  return res.json() as Promise<Place>
}
