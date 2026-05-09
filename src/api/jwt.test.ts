import { describe, expect, it } from 'vitest'
import { jwtExpUnixSeconds } from './jwt.ts'

describe('jwtExpUnixSeconds', () => {
  it('reads exp from a JWT payload', () => {
    const header = btoa('{}').replace(/=/g, '')
    const payload = btoa(JSON.stringify({ exp: 1700000000 })).replace(/=/g, '')
    const token = `${header}.${payload}.sig`
    expect(jwtExpUnixSeconds(token)).toBe(1700000000)
  })

  it('returns null for invalid token', () => {
    expect(jwtExpUnixSeconds('not-a-jwt')).toBeNull()
  })
})
