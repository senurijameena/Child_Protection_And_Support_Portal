import { useState, useEffect } from 'react'
import type { Role } from '../types/auth'

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

  useEffect(() => {
    const token = localStorage.getItem('token')
    const stored = localStorage.getItem('user')
    if (token && stored) {
      try {
        setUser(JSON.parse(stored))
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
        setUser(JSON.parse(stored))
      } catch {
        setUser(null)
      }
    }
  }

  return { user, loading, isAuthenticated: !!user, logout, refreshUser }
}
