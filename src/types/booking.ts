export type Place = {
  id: string
  name: string
  public: boolean
  can_manage?: boolean
  created_at: string
  updated_at: string
}

export type Resource = {
  id: string
  place: string
  name: string
  created_at: string
  updated_at: string
}

export type Paginated<T> = {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

export type InvitationStatus = 'pending' | 'accepted' | 'declined' | 'revoked'

export type MyInvitation = {
  id: string
  place: string
  place_name: string
  email: string
  status: InvitationStatus
  accepted_by: number | null
  invited_by: number
  created_at: string
  updated_at: string
}

export type ManagerInvitation = {
  id: string
  place: string
  email: string
  status: InvitationStatus
  accepted_by: number | null
  invited_by: number
  created_at: string
  updated_at: string
}
