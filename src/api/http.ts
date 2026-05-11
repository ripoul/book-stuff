export function baseUrl(): string {
  const v = import.meta.env.VITE_API_BASE_URL
  return typeof v === 'string' && v.length > 0 ? v.replace(/\/$/, '') : '/api'
}

function apiRoot(): string {
  const base = baseUrl()
  if (base.startsWith('http://') || base.startsWith('https://')) {
    return base.replace(/\/$/, '')
  }
  const path = base.startsWith('/') ? base : `/${base}`
  return `${window.location.origin}${path}`.replace(/\/$/, '')
}

export type BuildUrlQueryValue = string | number | string[] | undefined

export function buildUrl(
  path: string,
  query?: Record<string, BuildUrlQueryValue>,
): string {
  const p = path.startsWith('/') ? path : `/${path}`
  const u = new URL(`${apiRoot()}${p}`)
  if (query) {
    for (const [k, v] of Object.entries(query)) {
      if (v === undefined) continue
      if (Array.isArray(v)) {
        const parts = v.filter((s) => s !== '')
        for (const item of parts) u.searchParams.append(k, item)
        continue
      }
      if (v !== '') u.searchParams.set(k, String(v))
    }
  }
  return u.toString()
}
