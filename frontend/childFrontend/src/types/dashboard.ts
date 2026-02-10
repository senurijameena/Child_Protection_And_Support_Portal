export type CaseStatus =
  | 'REPORTED'
  | 'UNDER_REVIEW'
  | 'ASSIGNED'
  | 'INVESTIGATING'
  | 'RESOLVED'
  | 'CLOSED'
  | 'REJECTED'
  | 'CANCELLED'

export type RequestStatus =
  | 'REQUESTED'
  | 'UNDER_REVIEW'
  | 'ASSIGNED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'REJECTED'
  | 'CANCELLED'

export type CaseType =
  | 'MISSING_CHILD'
  | 'CHILD_ABUSE'
  | 'CHILD_LABOR'
  | 'CHILD_TRAFFICKING'
  | 'CHILD_MISSING'
  | 'OTHER'

export type HelpType =
  | 'FOOD_ASSISTANCE'
  | 'EDUCATION_SUPPORT'
  | 'MEDICAL_HELP'
  | 'SHELTER'
  | 'CLOTHING'
  | 'COUNSELING'
  | 'LEGAL_PROTECTION'
  | 'LIVELIHOOD_EMPLOYMENT'
  | 'DISABILITY_SUPPORT'
  | 'EMERGENCY_DISASTER'
  | 'OTHER'

export type OfferStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'COMPLETED' | 'CANCELLED'

export interface CaseDTO {
  id: string
  trackingId?: string
  reporterUserId?: string
  anonymous: boolean
  reporterName?: string
  caseType?: CaseType
  location?: string
  incidentDate?: string
  caseDescription?: string
  evidenceUrls?: string[]
  status?: CaseStatus
  assignedOfficerId?: string
  assignedStationId?: string
  assignedWorkerId?: string
  reportDate?: string
  emergency?: boolean
  priority?: string
  caseNotes?: string
}

export interface HelpRequestDTO {
  id: string
  trackingId?: string
  requesterUserId?: string
  requesterName?: string
  anonymous: boolean
  helpType?: HelpType
  description?: string
  location?: string
  documentUrls?: string[]
  status?: RequestStatus
  assignedWorkerId?: string
  requestDate?: string
  priority?: string
}

export interface ServiceOfferDTO {
  id: string
  helpRequestId?: string
  offeredByUserId?: string
  offeredToUserId?: string
  serviceType?: HelpType
  serviceDetails?: string
  scheduledDateTime?: string
  status?: OfferStatus
  offerDate?: string
}

export type ServicePackageStatus = 'DRAFT' | 'PUBLISHED'

export interface ServicePackageDTO {
  id: string
  title: string
  requestType: HelpType
  description?: string
  estimatedDuration?: string
  items: string[]
  status: ServicePackageStatus
  createdAt?: string
  updatedAt?: string
}

export interface NotificationDTO {
  id: string
  userId?: string
  type?: string
  title?: string
  message?: string
  read: boolean
  actionUrl?: string
  createdAt?: string
}

export interface MessageDTO {
  id: string
  fromUserId?: string
  toUserId?: string
  message?: string
  createdAt?: string
  read?: boolean
}

export interface ConversationDTO {
  participantId: string
  participantName?: string
  lastMessage?: string
  unreadCount?: number
}

export const CASE_STATUS_LABELS: Record<CaseStatus, string> = {
  REPORTED: 'Submitted',
  UNDER_REVIEW: 'Under Review',
  ASSIGNED: 'Assigned',
  INVESTIGATING: 'In Progress',
  RESOLVED: 'Resolved',
  CLOSED: 'Closed',
  REJECTED: 'Rejected',
  CANCELLED: 'Cancelled',
}

// Bootstrap badge variants per case status for consistent coloring in UI
export const CASE_STATUS_BADGE_VARIANTS: Record<
  CaseStatus,
  'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'dark'
> = {
  REPORTED: 'info', // newly submitted, informational
  UNDER_REVIEW: 'warning', // accepted / under review - highlight in yellow
  ASSIGNED: 'primary', // actively owned
  INVESTIGATING: 'warning', // in progress / attention
  RESOLVED: 'success', // successfully resolved
  CLOSED: 'dark', // finalized / archived
  REJECTED: 'danger', // negative outcome
  CANCELLED: 'danger', // also negative / stopped
}

export const REQUEST_STATUS_LABELS: Record<RequestStatus, string> = {
  REQUESTED: 'Submitted',
  UNDER_REVIEW: 'Under Review',
  ASSIGNED: 'Assigned',
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed',
  REJECTED: 'Rejected',
  CANCELLED: 'Cancelled',
}

export const REQUEST_STATUS_BADGE_VARIANTS: Record<
  RequestStatus,
  'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'dark'
> = {
  REQUESTED: 'info', // newly submitted
  UNDER_REVIEW: 'warning', // accepted / under review
  ASSIGNED: 'primary', // owned
  IN_PROGRESS: 'warning', // ongoing
  COMPLETED: 'success', // done
  REJECTED: 'danger',
  CANCELLED: 'danger',
}

export const CASE_TYPE_LABELS: Record<CaseType, string> = {
  MISSING_CHILD: 'Missing Child',
  CHILD_ABUSE: 'Child Abuse',
  CHILD_LABOR: 'Child Labor',
  CHILD_TRAFFICKING: 'Child Trafficking',
  CHILD_MISSING: 'Child Missing',
  OTHER: 'Other',
}

export const HELP_TYPE_LABELS: Record<HelpType, string> = {
  FOOD_ASSISTANCE: 'Food Assistance',
  EDUCATION_SUPPORT: 'Education Support',
  MEDICAL_HELP: 'Medical Help',
  SHELTER: 'Shelter',
  CLOTHING: 'Clothing',
  COUNSELING: 'Counseling',
  LEGAL_PROTECTION: 'Legal / Protection',
  LIVELIHOOD_EMPLOYMENT: 'Livelihood / Employment',
  DISABILITY_SUPPORT: 'Disability / Special Needs',
  EMERGENCY_DISASTER: 'Emergency / Disaster',
  OTHER: 'Custom / Other',
}
