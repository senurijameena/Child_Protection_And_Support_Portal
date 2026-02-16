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
  | 'PACKAGE_PROPOSED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CLOSED'
  | 'ARCHIVED'
  | 'REJECTED'
  | 'PACKAGE_REJECTED'
  | 'CANCELLED'
  | 'TRANSFER_REQUESTED'
  | 'TRANSFERRED'

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
  gender?: string
  photographUrl?: string
  physicalIdentificationMarks?: string
  lastSeenDressDetails?: string
}

/** Status of the service package applied to a help request (public user view). */
export type AppliedPackageStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED'

export interface HelpRequestDTO {
  id: string
  trackingId?: string
  requesterUserId?: string
  requesterName?: string
  anonymous: boolean
  helpType?: HelpType
  description?: string
  location?: string
  gender?: string
  documentUrls?: string[]
  status?: RequestStatus
  assignedWorkerId?: string
  requestDate?: string
  priority?: string
  // Food Assistance fields
  familyMembers?: number
  monthlyIncomeRange?: string
  employmentStatus?: string
  // Education fields
  schoolGrade?: string
  requiredItems?: string[]
  examYear?: string
  // Medical fields
  conditionDescription?: string
  urgencyLevel?: string
  hospitalName?: string
  estimatedCost?: string
  medicalReportUrl?: string
  // Shelter fields
  currentHousingType?: string
  riskOfEviction?: boolean
  immediateDanger?: boolean
  // Clothing fields
  quantityNeeded?: string
  // Counseling fields
  counselingType?: string
  preferredContactMethod?: string
  /** Applied service package (when SW has sent one for approval). */
  appliedPackage?: ServicePackageDTO
  /** Public user acceptance status of the applied package. */
  appliedPackageStatus?: AppliedPackageStatus
  /** When the service package was applied to this request (ISO date). */
  appliedPackageAppliedAt?: string
  /** Per-service execution status (populated when PU accepts). */
  appliedPackageItemExecutions?: ServiceItemExecutionDTO[]
  progress?: number
  serviceStarted?: boolean
  resourcesAssigned?: boolean
  allServicesCompleted?: boolean
  finalAssessmentCompleted?: boolean
  caseFinalized?: boolean
  finalAssessment?: FinalAssessmentDTO
}

export interface FinalAssessmentDTO {
  objectivesAchieved: boolean
  childSafe: boolean
  needsContinuedMonitoring: boolean
  recommendClosure: boolean
  remarks: string
  assessedAt?: string
  assessedByUserId?: string
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

/** Per-service execution status within an applied package */
export interface ServiceItemExecutionDTO {
  serviceItem: string
  status: 'PENDING' | 'IN_PROGRESS' | 'SCHEDULED' | 'COMPLETED' | 'PARTIALLY_COMPLETED' | 'NOT_DELIVERED'
  assignedResource?: string
  scheduledDate?: string
  notes?: string
  outcome?: string
  outcomeReason?: string
  outcomeNotes?: string
}

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

export type AnnouncementType = 'FEATURE' | 'WORKSHOP' | 'MAINTENANCE' | 'GENERAL'

export interface AnnouncementDTO {
  id: string
  title: string
  message: string
  icon?: string
  type: AnnouncementType
  active: boolean
  createdAt?: string
  expiresAt?: string
}

export type CompletedReportWorkflowStatus =
  | 'DRAFT'
  | 'SENT_TO_ADMIN'
  | 'APPROVED'
  | 'CLARIFICATION_REQUESTED'
  | 'REOPEN_REQUESTED'

export interface CompletedHelpRequestReportDTO {
  reportHeader: {
    organizationName: string
    systemName: string
    reportTitle: string
    reportId: string
    generatedDate?: string
    generatedBy: string
    generatedById: string
    helpId: string
  }
  helpSummary: {
    helpId: string
    requestType: string
    priorityLevel: string
    dateSubmitted?: string
    dateAssignedToSW?: string
    dateServiceStarted?: string
    dateCompleted?: string
    totalDurationDays: number
    status: string
  }
  publicUserInfo: {
    name: string
    contactNumber: string
    districtOrLocation: string
    vulnerabilityCategory: string
  }
  initialRequestDetails: {
    problemDescription: string
    supportingDocuments: string[]
    initialAssessmentSummary: string
  }
  servicePackageDetails: {
    packageName: string
    servicesIncluded: string[]
    dateApplied?: string
    dateApprovedByPublicUser?: string
    adjustments: string
    finalApprovedServices: string[]
  }
  resourceAllocationDetails: Array<{
    resourceName: string
    resourceType: string
    assignedDate?: string
    serviceProvided: string
    completionDate?: string
    supportingDocuments: string[]
  }>
  serviceTimeline: Array<{
    date?: string
    title: string
    detail: string
  }>
  followUpMonitoringSummary: {
    numberOfFollowUpsConducted: number
    followUpDates: string[]
    observations: string
    outcomeEvaluation: string
  }
  outcomeAssessment: {
    objectiveAchieved: string
    improvementLevel: string
    childSafetyStatus: string
    familyStabilityStatus: string
    educationContinuityStatus: string
  }
  challengesFaced: string[]
  recommendations: string[]
  attachments: string[]
  finalDeclaration: {
    statement: string
    swSignature: string
    date?: string
    swId: string
  }
  aiGeneratedSummary: string
  workflowStatus: CompletedReportWorkflowStatus
  adminReviewNote?: string
}

export interface CompletedHelpReportListItemDTO {
  reportId: string
  helpRequestId: string
  helpTrackingId: string
  requesterName: string
  requestType: string
  requestStatus: string
  workflowStatus: string
  generatedAt?: string
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
  PACKAGE_PROPOSED: 'Package Proposed',
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed',
  CLOSED: 'Closed',
  ARCHIVED: 'Archived',
  REJECTED: 'Rejected',
  PACKAGE_REJECTED: 'Package Rejected',
  CANCELLED: 'Cancelled',
  TRANSFER_REQUESTED: 'Transfer Requested',
  TRANSFERRED: 'Transferred',
}

export const REQUEST_STATUS_BADGE_VARIANTS: Record<
  RequestStatus,
  'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'dark'
> = {
  REQUESTED: 'info',
  UNDER_REVIEW: 'warning',
  ASSIGNED: 'primary',
  PACKAGE_PROPOSED: 'warning',
  IN_PROGRESS: 'warning',
  COMPLETED: 'success',
  CLOSED: 'dark',
  ARCHIVED: 'secondary',
  REJECTED: 'danger',
  PACKAGE_REJECTED: 'danger',
  CANCELLED: 'danger',
  TRANSFER_REQUESTED: 'info',
  TRANSFERRED: 'info',
}

/** Labels for applied package acceptance (shown in Help Details). */
export const APPLIED_PACKAGE_STATUS_LABELS: Record<AppliedPackageStatus, string> = {
  PENDING: 'Pending Approval',
  ACCEPTED: 'Accepted',
  REJECTED: 'Rejected',
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
