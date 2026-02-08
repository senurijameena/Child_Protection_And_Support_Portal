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

  // Police Station
  stationName?: string
  district?: string
  city?: string
  officerInChargeName?: string
  locationCoordinates?: string // "lat,lng"
  officerIdProofUrl?: string
  governmentApprovalLetterUrl?: string
  allocatedResources?: string
  staffDetails?: string

  // Social Worker
  licenseNumber?: string
  organization?: string
  specializations?: string
  yearsOfExperience?: string
  certificationDocumentUrl?: string
}

export const ROLE_LABELS: Record<Role, string> = {
  PU: 'Public User',
  PO: 'Police Station',
  SW: 'Social Worker',
  ADMIN: 'Administrator',
}
