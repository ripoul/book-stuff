import { describe, expect, it } from 'vitest'
import { ApiError } from './errors.ts'

describe('ApiError', () => {
  it('carries status and message', () => {
    const err = new ApiError(404, 'Not found')
    expect(err.status).toBe(404)
    expect(err.message).toBe('Not found')
  })
})
