import { describe, expect, it } from 'vitest'
import { jwtAccountEmail, jwtExpUnixSeconds, jwtUserId } from './jwt.ts'

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

describe('jwtAccountEmail', () => {
  it('reads email from payload', () => {
    const header = btoa('{}').replace(/=/g, '')
    const payload = btoa(JSON.stringify({ email: 'User@X.Y' }))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '')
    const token = `${header}.${payload}.sig`
    expect(jwtAccountEmail(token)).toBe('user@x.y')
  })

  it('reads username when it looks like an email', () => {
    const header = btoa('{}').replace(/=/g, '')
    const payload = btoa(JSON.stringify({ username: 'A@B.C' }))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '')
    const token = `${header}.${payload}.sig`
    expect(jwtAccountEmail(token)).toBe('a@b.c')
  })

  it('returns null when missing', () => {
    const header = btoa('{}').replace(/=/g, '')
    const payload = btoa(JSON.stringify({ sub: '1' }))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '')
    const token = `${header}.${payload}.sig`
    expect(jwtAccountEmail(token)).toBeNull()
  })
})

describe('jwtUserId', () => {
  it('reads string user_id', () => {
    const header = btoa('{}').replace(/=/g, '')
    const payload = btoa(JSON.stringify({ user_id: 'abc-uuid-1' }))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '')
    const token = `${header}.${payload}.sig`
    expect(jwtUserId(token)).toBe('abc-uuid-1')
  })

  it('reads numeric user_id', () => {
    const header = btoa('{}').replace(/=/g, '')
    const payload = btoa(JSON.stringify({ user_id: 42 }))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '')
    const token = `${header}.${payload}.sig`
    expect(jwtUserId(token)).toBe('42')
  })
})
