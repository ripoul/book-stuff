import type { Paginated, Resource } from '../types/booking.ts'
import { authFetch } from './authFetch.ts'
import { ApiError } from './errors.ts'
import { buildUrl } from './http.ts'

export type ListResourcesParams = {
  limit: number
  offset: number
  place: string
}

export async function listResources(
  params: ListResourcesParams,
): Promise<Paginated<Resource>> {
  const query: Record<string, string | number | undefined> = {
    limit: params.limit,
    offset: params.offset,
    place: params.place,
  }
  const url = buildUrl('/booking/resources/', query)
  const res = await authFetch(url, { headers: { Accept: 'application/json' } })
  if (!res.ok) {
    throw new ApiError(res.status, `Request failed (${res.status})`)
  }
  return res.json() as Promise<Paginated<Resource>>
}

export type CreateResourceBody = {
  place: string
  name: string
}

export async function createResource(
  body: CreateResourceBody,
): Promise<Resource> {
  const url = buildUrl('/booking/resources/')
  const res = await authFetch(url, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
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
  return res.json() as Promise<Resource>
}

export type UpdateResourceBody = {
  name: string
}

export async function updateResource(
  id: string,
  body: UpdateResourceBody,
): Promise<Resource> {
  const url = buildUrl(`/booking/resources/${id}/`)
  const res = await authFetch(url, {
    method: 'PATCH',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
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
  return res.json() as Promise<Resource>
}
