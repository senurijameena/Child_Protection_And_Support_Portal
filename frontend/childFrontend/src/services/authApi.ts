import type { LoginRequest, LoginResponse, RegisterRequest } from '../types/auth'

// Combined mode: frontend served from backend → use /api. Dev: Vite on 5173 → backend on 8080.
const API_BASE = import.meta.env.VITE_API_URL ?? (import.meta.env.PROD ? '/api' : 'http://localhost:8080/api')

export async function uploadRegistrationDocument(file: File): Promise<string> {
  const formData = new FormData()
  formData.append('file', file)
  const res = await fetch(`${API_BASE}/auth/upload-document`, {
    method: 'POST',
    body: formData,
  })
  const data = (await res.json().catch(() => ({}))) as { url?: string; error?: string }
  if (!res.ok || data.error) throw new Error(data.error || 'Upload failed')
  return data.url!
}

async function handleResponse<T>(res: Response): Promise<T> {
  const data = await res.json().catch(() => ({})) as Record<string, unknown>
  if (!res.ok) {
    const msg = (data.message as string) || (data.error as string) || `Request failed: ${res.status}`
    throw new Error(msg)
  }
  return data as T
}

export async function login(data: LoginRequest): Promise<LoginResponse> {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  return handleResponse<LoginResponse>(res)
}

export async function registerPublicUser(data: RegisterRequest): Promise<LoginResponse> {
  const res = await fetch(`${API_BASE}/auth/register/public`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...data, role: 'PU' }),
  })
  return handleResponse<LoginResponse>(res)
}

export async function registerPoliceStation(data: RegisterRequest): Promise<LoginResponse> {
  const res = await fetch(`${API_BASE}/auth/register/police-station`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...data, role: 'PO' }),
  })
  return handleResponse<LoginResponse>(res)
}

export async function registerSocialWorker(data: RegisterRequest): Promise<LoginResponse> {
  const res = await fetch(`${API_BASE}/auth/register/social-worker`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...data, role: 'SW' }),
  })
  return handleResponse<LoginResponse>(res)
}
