import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach, beforeEach, vi } from 'vitest'

const memory = new Map<string, string>()

const memoryStorage: Storage = {
  get length() {
    return memory.size
  },
  clear() {
    memory.clear()
  },
  getItem(key: string) {
    return memory.get(key) ?? null
  },
  setItem(key: string, value: string) {
    memory.set(key, String(value))
  },
  removeItem(key: string) {
    memory.delete(key)
  },
  key(index: number) {
    return Array.from(memory.keys())[index] ?? null
  },
} as Storage

function ensureLocalStorage(): void {
  if (typeof globalThis.localStorage?.clear === 'function') return
  Object.defineProperty(globalThis, 'localStorage', {
    value: memoryStorage,
    configurable: true,
    writable: true,
  })
}

beforeEach(() => {
  ensureLocalStorage()
  globalThis.localStorage.clear()
})

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})
