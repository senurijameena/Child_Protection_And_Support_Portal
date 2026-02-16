export type Role = 'PU' | 'PO' | 'SW' | 'ADMIN'

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  token: string | null
  userId?: string
  email?: string
  fullName?: string
  role?: Role
  approved: boolean
  message?: string
  profilePhoto?: string
}

export interface RegisterRequest {
  fullName: string
  email: string
  phone?: string
  address?: string
  password: string
  confirmPassword: string
  role: Role
  termsAccepted: boolean
  profilePhoto?: string

  stationName?: string
  district?: string
  city?: string
  officerInChargeName?: string
  locationCoordinates?: string // "lat,lng"
  officerIdProofUrl?: string
  governmentApprovalLetterUrl?: string
  allocatedResources?: string
  staffDetails?: string

  licenseNumber?: string
  organization?: string
  specializations?: string
  yearsOfExperience?: string
  certificationDocumentUrl?: string
  idDocumentUrl?: string
}

export const ROLE_LABELS: Record<Role, string> = {
  PU: 'Public User',
  PO: 'Police Station',
  SW: 'Social Worker',
  ADMIN: 'Administrator',
}

export function normalizeRole(value?: string | null): Role | undefined {
  const normalized = (value || '').toUpperCase().trim()
  if (normalized === 'PU' || normalized === 'PUBLIC_USER') return 'PU'
  if (normalized === 'PO' || normalized === 'POLICE' || normalized === 'POLICE_STATION') return 'PO'
  if (normalized === 'SW' || normalized === 'SOCIAL_WORKER') return 'SW'
  if (normalized === 'ADMIN' || normalized === 'ADMINISTRATOR') return 'ADMIN'
  if (normalized === 'ROLE_PU') return 'PU'
  if (normalized === 'ROLE_PO') return 'PO'
  if (normalized === 'ROLE_SW') return 'SW'
  if (normalized === 'ROLE_ADMIN') return 'ADMIN'
  if (normalized === 'ROLE_PUBLIC_USER') return 'PU'
  if (normalized === 'ROLE_POLICE_STATION') return 'PO'
  if (normalized === 'ROLE_SOCIAL_WORKER') return 'SW'
  if (normalized === 'ROLE_ADMINISTRATOR') return 'ADMIN'
  if (normalized === 'PU' || normalized === 'PO' || normalized === 'SW' || normalized === 'ADMIN') {
    return normalized
  }
  return undefined
}
