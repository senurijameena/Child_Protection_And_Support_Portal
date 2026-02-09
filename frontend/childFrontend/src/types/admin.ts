import type { CaseDTO, HelpRequestDTO } from './dashboard'

export interface DashboardMetricsDTO {
  totalCases: number
  activeCases: number
  emergencyCases: number
  totalHelpRequests: number
  pendingHelpRequests: number
  totalUsers: number
  pendingApprovals: number
  resolvedCases: number
  averageResponseTime: number
  caseResolutionRate: number
  casesByStatus?: Record<string, number>
  helpRequestsByType?: Record<string, number>
  lastUpdated?: string
}

export interface AdminDashboardOverviewDTO {
  metrics: DashboardMetricsDTO
  recentCases: CaseDTO[]
  recentHelpRequests: HelpRequestDTO[]
  pendingTransfers: PendingTransferDTO[]
}

export interface PendingTransferDTO {
  id: string
  entityId: string
  entityType: 'CASE' | 'HELP_REQUEST'
  fromUserId?: string
  fromUserName?: string
  toUserId?: string
  toUserName?: string
  reason?: string
  status: string
  requestedAt?: string
}

export interface TransferRequestDTO {
  id: string
  entityId: string
  entityType: 'CASE' | 'HELP_REQUEST'
  fromUserId?: string
  toUserId?: string
  reason?: string
  status: string
  requestedAt?: string
}

export interface UserManagementDTO {
  userId: string
  fullName?: string
  email?: string
  phone?: string
  role?: string
  active: boolean
  approved: boolean
  registrationDate?: string
  lastLogin?: string
  badgeNumber?: string
  department?: string
  rank?: string
  stationAddress?: string
  licenseNumber?: string
  specializations?: string[]
  organization?: string
  yearsOfExperience?: string
}

export interface PoliceStationDTO {
  id: string
  stationName?: string
  district?: string
  city?: string
  address?: string
  contactNumber?: string
  email?: string
  officerInChargeName?: string
  locationCoordinates?: string
}

export interface SocialWorkerDTO {
  id?: string
  userId?: string
  fullName?: string
  email?: string
  phone?: string
  specializations?: string[]
  organization?: string
  available?: boolean
  registrationDate?: string
}

export interface AnnouncementDTO {
  id: string
  title?: string
  message?: string
  icon?: string
  type?: 'GENERAL' | 'MAINTENANCE' | 'FEATURE' | 'WORKSHOP'
  active: boolean
  createdAt?: string
  expiresAt?: string
}

export interface DuplicateDetectionDTO {
  id: string
  trackingId?: string
  type?: string
  title?: string
  description?: string
  location?: string
  approximateAge?: string
  gender?: string
  identificationMarks?: string
  date?: string
  status?: string
  reporterName?: string
  requesterName?: string
  similarityScore: number
  similarityReason?: string
}

export interface FeedbackResponseDTO {
  id: string
  caseId?: string
  userId?: string
  type?: string
  category?: string
  description?: string
  rating?: number
  status?: string
  adminResponse?: string
  createdAt?: string
  message?: string
  userName?: string
  anonymous?: boolean
}

export type Priority = 'LOW' | 'MEDIUM' | 'HIGH'
export type CaseCategory = 'ABUSE' | 'NEGLECT' | 'FINANCIAL' | 'MEDICAL' | 'EDUCATION' | 'OTHER'
