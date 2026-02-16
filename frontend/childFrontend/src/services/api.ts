/**
 * Base API client with JWT auth for authenticated endpoints
 */
const API_BASE = import.meta.env.VITE_API_URL ?? (import.meta.env.PROD ? '/api' : 'http://localhost:8080/api')

/** Base URL for backend (uploads, documents). Use when linking to /uploads/... so the request hits the server, not the SPA router. */
export function getUploadBaseUrl(): string {
  const u = import.meta.env.VITE_API_URL ?? (import.meta.env.PROD ? '/api' : 'http://localhost:8080/api')
  if (u.endsWith('/api')) return u.slice(0, -4)
  return typeof window !== 'undefined' ? window.location.origin : ''
}

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('token')
  const headers: HeadersInit = { 'Content-Type': 'application/json' }
  if (token) (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`
  return headers
}

export async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, { headers: getAuthHeaders() })
  return handleRes<T>(res)
}

export async function apiPost<T>(path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: body ? JSON.stringify(body) : undefined,
  })
  return handleRes<T>(res)
}

export async function apiPut<T>(path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: body ? JSON.stringify(body) : undefined,
  })
  return handleRes<T>(res)
}

export async function apiDelete<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, { method: 'DELETE', headers: getAuthHeaders() })
  return handleRes<T>(res)
}

export async function apiPostFormData<T>(path: string, formData: FormData): Promise<T> {
  const token = localStorage.getItem('token')
  const headers: HeadersInit = {}
  if (token) (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`
  const res = await fetch(`${API_BASE}${path}`, { method: 'POST', headers, body: formData })
  return handleRes<T>(res)
}

async function handleRes<T>(res: Response): Promise<T> {
  const data = await res.json().catch(() => ({})) as Record<string, unknown>
  if (!res.ok) {
    const msg = (data.message as string) || (data.error as string) || `Request failed: ${res.status}`
    // include request url and status to aid debugging when backend returns generic 404/500
    const detail = `${msg} (${res.status} ${res.url})`
    throw new Error(detail)
  }
  return data as T
}

export interface PublicStatisticsResponse {
  totalCasesReported?: number
  activeCases?: number
  casesSaved?: number
  caseResolutionRate?: number
  helpRequestsCompleted?: number
  childrenSupported?: number
  publicUsersCount?: number
  socialWorkersCount?: number
  policeOfficersCount?: number
  lastUpdated?: string
}

/**
 * Public statistics endpoint - no authentication required
 * Returns overview statistics for the landing page.
 *
 * Backend has been served in two route styles across environments:
 * - /api/statistics/public
 * - /statistics/public
 * Try both and normalize numeric fields so the landing page gets real values.
 */
export async function getPublicStatistics(): Promise<PublicStatisticsResponse> {
  const roots = [API_BASE, API_BASE.endsWith('/api') ? API_BASE.slice(0, -4) : API_BASE]

  for (const root of roots) {
    try {
      const res = await fetch(`${root}/statistics/public`, {
        headers: { 'Content-Type': 'application/json' },
      })
      const data = await handleRes<Record<string, unknown>>(res)

      return {
        totalCasesReported: Number(data.totalCasesReported ?? 0),
        activeCases: Number(data.activeCases ?? 0),
        casesSaved: Number(data.casesSaved ?? 0),
        caseResolutionRate: Number(data.caseResolutionRate ?? 0),
        helpRequestsCompleted: Number(data.helpRequestsCompleted ?? 0),
        childrenSupported: Number(data.childrenSupported ?? 0),
        publicUsersCount: Number(data.publicUsersCount ?? 0),
        socialWorkersCount: Number(data.socialWorkersCount ?? 0),
        policeOfficersCount: Number(data.policeOfficersCount ?? 0),
        lastUpdated: typeof data.lastUpdated === 'string' ? data.lastUpdated : '',
      }
    } catch {
      // try next root
    }
  }

  return {}
}
