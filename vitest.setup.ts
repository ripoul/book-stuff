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

function mediaQueryMatch(query: string, width: number): boolean {
  const mins = [...query.matchAll(/min-width:\s*(\d+(?:\.\d+)?)px/gi)]
  if (mins.length) return mins.every((m) => width >= Number(m[1]))
  const maxs = [...query.matchAll(/max-width:\s*(\d+(?:\.\d+)?)px/gi)]
  if (maxs.length) return maxs.every((m) => width <= Number(m[1]))
  return false
}

beforeEach(() => {
  ensureLocalStorage()
  globalThis.localStorage.clear()
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: (query: string) => ({
      get matches() {
        return mediaQueryMatch(query, window.innerWidth)
      },
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }),
  })
})

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
  vi.unstubAllGlobals()
})
