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
