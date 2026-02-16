import { useState, useEffect } from 'react'
import type { Role } from '../types/auth'
import { normalizeRole } from '../types/auth'

interface User {
  userId: string
  email?: string
  fullName?: string
  role?: Role
  phone?: string
  address?: string
  profilePhoto?: string

  // Social worker / police extra details that may be present in stored user
  licenseNumber?: string
  organization?: string
  specializations?: string[] | string
  yearsOfExperience?: string
  certificationDocumentUrl?: string
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const normalizeUser = (raw: unknown): User | null => {
    if (!raw || typeof raw !== 'object') return null
    const parsed = raw as Record<string, unknown>
    const userId = parsed.userId != null ? String(parsed.userId) : ''
    if (!userId) return null
    const role = normalizeRole((parsed.role as string | undefined) ?? undefined)
    return {
      userId,
      email: typeof parsed.email === 'string' ? parsed.email : undefined,
      fullName: typeof parsed.fullName === 'string' ? parsed.fullName : undefined,
      phone: typeof parsed.phone === 'string' ? parsed.phone : undefined,
      address: typeof parsed.address === 'string' ? parsed.address : undefined,
      profilePhoto: typeof parsed.profilePhoto === 'string' ? parsed.profilePhoto : undefined,
      licenseNumber: typeof parsed.licenseNumber === 'string' ? parsed.licenseNumber : undefined,
      organization: typeof parsed.organization === 'string' ? parsed.organization : undefined,
      specializations:
        typeof parsed.specializations === 'string' || Array.isArray(parsed.specializations)
          ? (parsed.specializations as string[] | string)
          : undefined,
      yearsOfExperience: typeof parsed.yearsOfExperience === 'string' ? parsed.yearsOfExperience : undefined,
      certificationDocumentUrl:
        typeof parsed.certificationDocumentUrl === 'string' ? parsed.certificationDocumentUrl : undefined,
      role,
    }
  }

  useEffect(() => {
    const token = localStorage.getItem('token')
    const stored = localStorage.getItem('user')
    if (token && stored) {
      try {
        setUser(normalizeUser(JSON.parse(stored)))
      } catch {
        setUser(null)
      }
    } else {
      setUser(null)
    }
    setLoading(false)
  }, [])

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
  }

  const refreshUser = () => {
    const stored = localStorage.getItem('user')
    if (stored) {
      try {
        setUser(normalizeUser(JSON.parse(stored)))
      } catch {
        setUser(null)
      }
    }
  }

  return { user, loading, isAuthenticated: !!user, logout, refreshUser }
}
