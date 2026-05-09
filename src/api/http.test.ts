import { describe, expect, it } from 'vitest'
import { buildUrl } from './http.ts'

describe('buildUrl', () => {
  it('joins path and query with configured API base', () => {
    const url = buildUrl('/booking/places/', { limit: 10, offset: 0 })
    expect(url).toBe('http://test.book/api/booking/places/?limit=10&offset=0')
  })

  it('omits empty query values', () => {
    const url = buildUrl('/booking/places/', {
      limit: 5,
      offset: 0,
      name: '',
      ordering: 'name',
    })
    expect(url).toContain('limit=5')
    expect(url).toContain('ordering=name')
    expect(url).not.toContain('name=')
  })
})
