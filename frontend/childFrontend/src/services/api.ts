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

/**
 * Public statistics endpoint - no authentication required
 * Returns overview statistics for the landing page
 */
export async function getPublicStatistics(): Promise<{
  registeredUsers: number
  reportedCases: number
  helpRequests: number
  resolvedCases: number
  activeStations: number
  activeSocialWorkers: number
}> {
  try {
    const res = await fetch(`${API_BASE}/public/statistics`, {
      headers: { 'Content-Type': 'application/json' },
    })
    return handleRes(res)
  } catch {
    // Return default values if endpoint fails
    return {
      registeredUsers: 0,
      reportedCases: 0,
      helpRequests: 0,
      resolvedCases: 0,
      activeStations: 0,
      activeSocialWorkers: 0,
    }
  }
}
