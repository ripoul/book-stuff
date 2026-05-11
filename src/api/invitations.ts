import type {
  InvitationStatus,
  ManagerInvitation,
  MyInvitation,
  Paginated,
} from '../types/booking.ts'
import { authFetch } from './authFetch.ts'
import { ApiError } from './errors.ts'
import { buildUrl } from './http.ts'

async function readErrorMessage(res: Response): Promise<string> {
  try {
    const data = (await res.json()) as Record<string, unknown>
    if (typeof data.detail === 'string') return data.detail
    const parts: string[] = []
    for (const [k, v] of Object.entries(data)) {
      if (Array.isArray(v) && v.every((x) => typeof x === 'string')) {
        parts.push(`${k}: ${v.join(', ')}`)
      } else if (typeof v === 'string') {
        parts.push(`${k}: ${v}`)
      }
    }
    if (parts.length) return parts.join(' · ')
  } catch {
    /* ignore */
  }
  return `Request failed (${res.status})`
}

export type ListMyInvitationsParams = {
  limit: number
  offset: number
  ordering?: string
  status?: InvitationStatus
}

export async function listMyInvitations(
  params: ListMyInvitationsParams,
): Promise<Paginated<MyInvitation>> {
  const query: Record<string, string | number | string[] | undefined> = {
    limit: params.limit,
    offset: params.offset,
  }
  if (params.ordering) query.ordering = params.ordering
  if (params.status) query.status = params.status
  const url = buildUrl('/booking/me/invitations/', query)
  const res = await authFetch(url, { headers: { Accept: 'application/json' } })
  if (!res.ok) {
    throw new ApiError(res.status, await readErrorMessage(res))
  }
  return res.json() as Promise<Paginated<MyInvitation>>
}

export type PatchMyInvitationBody = {
  status: InvitationStatus
}

export async function patchMyInvitation(
  id: string,
  body: PatchMyInvitationBody,
): Promise<MyInvitation> {
  const url = buildUrl(`/booking/me/invitations/${id}/`)
  const res = await authFetch(url, {
    method: 'PATCH',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    throw new ApiError(res.status, await readErrorMessage(res))
  }
  return res.json() as Promise<MyInvitation>
}

export type ListManagedInvitationsParams = {
  limit: number
  offset: number
  ordering?: string
  place?: string
  status?: InvitationStatus[]
}

export async function listManagedInvitations(
  params: ListManagedInvitationsParams,
): Promise<Paginated<ManagerInvitation>> {
  const query: Record<string, string | number | string[] | undefined> = {
    limit: params.limit,
    offset: params.offset,
  }
  if (params.ordering) query.ordering = params.ordering
  if (params.place?.trim()) query.place = params.place.trim()
  if (params.status?.length) query.status = params.status
  const url = buildUrl('/booking/manage/invitations/', query)
  const res = await authFetch(url, { headers: { Accept: 'application/json' } })
  if (!res.ok) {
    throw new ApiError(res.status, await readErrorMessage(res))
  }
  return res.json() as Promise<Paginated<ManagerInvitation>>
}

export type CreateManagedInvitationBody = {
  place: string
  email: string
}

export async function createManagedInvitation(
  body: CreateManagedInvitationBody,
): Promise<ManagerInvitation> {
  const url = buildUrl('/booking/manage/invitations/')
  const res = await authFetch(url, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      place: body.place.trim(),
      email: body.email.trim().toLowerCase(),
    }),
  })
  if (!res.ok) {
    throw new ApiError(res.status, await readErrorMessage(res))
  }
  return res.json() as Promise<ManagerInvitation>
}

export type PatchManagedInvitationBody = {
  status: InvitationStatus
}

export async function patchManagedInvitation(
  id: string,
  body: PatchManagedInvitationBody,
): Promise<ManagerInvitation> {
  const url = buildUrl(`/booking/manage/invitations/${id}/`)
  const res = await authFetch(url, {
    method: 'PATCH',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    throw new ApiError(res.status, await readErrorMessage(res))
  }
  return res.json() as Promise<ManagerInvitation>
}
