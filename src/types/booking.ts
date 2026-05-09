export type Place = {
  id: number
  name: string
  public: boolean
  can_manage?: boolean
  created_at: string
  updated_at: string
}

export type Resource = {
  id: number
  place: number
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
