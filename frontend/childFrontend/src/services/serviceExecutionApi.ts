import { apiGet, apiPost, apiPut } from './api'
import type { HelpRequestDTO } from '../types/dashboard'

// ==================== TYPES ====================

export interface ResourceAssignmentDTO {
  id?: string
  helpRequestId?: string
  serviceItem: string
  serviceItemIndex: number
  resourceName: string
  resourceOrganization: string
  resourceContactPerson?: string
  resourcePhone?: string
  resourceEmail?: string
  resourceAddress?: string
  scheduledDate: string // ISO date string
  scheduledTime?: string // HH:mm format
  estimatedDurationMinutes?: number
  location?: string
  status?: string
  confirmationStatus?: string
  assignmentNotes?: string
  specialInstructions?: string
}

export interface ServiceOutcomeDTO {
  serviceItem: string
  serviceItemIndex: number
  outcome: 'COMPLETED_SUCCESSFULLY' | 'PARTIALLY_COMPLETED' | 'NOT_DELIVERED' | 'RESCHEDULED'
  outcomeReason?: 'RESOURCE_UNAVAILABLE' | 'USER_UNAVAILABLE' | 'INCORRECT_INFO'
  outcomeNotes?: string
  proofUrls?: string[]
  proofDescription?: string
  newScheduledDate?: string
  newScheduledTime?: string
  rescheduleReason?: string
  adjustmentPlan?: string
}

export interface FinalAssessmentDTO {
  id?: string
  helpRequestId?: string
  objectiveAchieved: boolean
  objectiveAchievedDetails?: string
  childSafe: boolean
  childSafetyDetails?: string
  childSafetyRating?: 'SAFE' | 'AT_RISK' | 'REQUIRES_MONITORING'
  needsContinuedMonitoring: boolean
  monitoringPlan?: string
  monitoringDurationMonths?: number
  recommendClosure: boolean
  closureRecommendationReason?: string
  overallProgressScore?: number
  familySupportScore?: number
  childWellbeingScore?: number
  serviceEffectivenessScore?: number
  overallSummary?: string
  achievedOutcomes?: string[]
  remainingConcerns?: string[]
  recommendedNextSteps?: string[]
  lessonsLearned?: string[]
  attachmentUrls?: string[]
  signedOff: boolean
  digitalSignature?: string
}

export interface ServiceExecutionStatusDTO {
  helpRequestId: string
  trackingId: string
  status: string
  progress: number
  serviceStarted: boolean
  resourcesAssigned: boolean
  allServicesCompleted: boolean
  finalAssessmentCompleted: boolean
  caseFinalized: boolean
  serviceStartedAt?: string
  serviceFinalizedAt?: string
  finalAssessmentAt?: string
  completedAt?: string
  totalServices: number
  completedServices: number
  partiallyCompletedServices: number
  pendingServices: number
  scheduledServices: number
  serviceItems: ServiceItemStatusDTO[]
  canStartService: boolean
  canAssignResources: boolean
  canFinalizeCase: boolean
  canSubmitFinalAssessment: boolean
  canMarkCompleted: boolean
  alerts: string[]
  pendingActions: string[]
}

export interface ServiceItemStatusDTO {
  serviceItem: string
  index: number
  status: string
  outcome?: string
  assignedResource?: string
  resourceOrganization?: string
  scheduledDate?: string
  scheduledTime?: string
  progressContribution: number
  hasProof: boolean
  rescheduleCount: number
}

export interface ServiceExecutionDashboardDTO {
  socialWorkerId: string
  date: string
  todayFollowUpCount: number
  pendingUpdatesCount: number
  overdueServicesCount: number
  activeServicesCount: number
  todaySchedule: ScheduledServiceDTO[]
  pendingUpdates: PendingUpdateDTO[]
  overdueServices: OverdueServiceDTO[]
  recentCompletions: RecentCompletionDTO[]
  upcomingFollowUps: UpcomingFollowUpDTO[]
  morningAlerts: string[]
  actionRequired: string[]
}

export interface ScheduledServiceDTO {
  helpRequestId: string
  trackingId: string
  serviceItem: string
  resourceName: string
  resourceOrganization: string
  scheduledTime: string
  location?: string
  status: string
}

export interface PendingUpdateDTO {
  helpRequestId: string
  trackingId: string
  serviceItem: string
  scheduledDateTime: string
  resourceName: string
  hoursPastDue: number
}

export interface OverdueServiceDTO {
  helpRequestId: string
  trackingId: string
  serviceItem: string
  originalDate: string
  daysPastDue: number
  rescheduleCount: number
}

export interface RecentCompletionDTO {
  helpRequestId: string
  trackingId: string
  serviceItem: string
  completedAt: string
  outcome: string
}

export interface UpcomingFollowUpDTO {
  id: string
  helpRequestId: string
  trackingId?: string
  childName: string
  type: string
  scheduledDate: string
  priority: string
}

export interface MonitoringChecklistDTO {
  id: string
  helpRequestId: string
  socialWorkerId: string
  items: ChecklistItemDTO[]
  overallStatus: string
  completedCount: number
  totalCount: number
  createdAt: string
  updatedAt: string
}

export interface ChecklistItemDTO {
  itemId: string
  title: string
  description?: string
  category: string
  completed: boolean
  completedBy?: string
  completedAt?: string
  notes?: string
  order: number
}

export interface DailyActivityTrackerDTO {
  id?: string
  helpRequestId: string
  socialWorkerId: string
  trackingDate: string
  activities: DailyActivityDTO[]
  scheduledServices: ScheduledServiceTrackerDTO[]
  totalScheduled: number
  completedCount: number
  pendingCount: number
  missedCount: number
  morningReminderSent: boolean
  eveningCheckDone: boolean
  allActivitiesProcessed: boolean
}

export interface DailyActivityDTO {
  activityId: string
  type: string
  description: string
  status: string
  scheduledTime?: string
  completedTime?: string
  notes?: string
  relatedServiceItem?: string
  relatedFollowUpId?: string
}

export interface ScheduledServiceTrackerDTO {
  serviceItem: string
  resource: string
  scheduledDateTime: string
  status: string
  updateRequested: boolean
  updateRequestedAt?: string
}

export interface ServiceItemExecutionDTO {
  serviceItem: string
  index: number
  status: string
  assignedResource?: string
  resourceOrganization?: string
  scheduledDate?: string
  scheduledTime?: string
  notes?: string
  outcome?: string
  outcomeReason?: string
  outcomeNotes?: string
  outcomeRecordedAt?: string
  progressContribution?: number
  proofUrls?: string[]
  proofDescription?: string
  originalScheduledDate?: string
  rescheduleCount: number
  lastRescheduleReason?: string
  nextFollowUpDate?: string
  followUpId?: string
  adjustmentPlan?: string
  adjustmentRequired: boolean
  helpRequestId?: string
  trackingId?: string
  createdAt?: string
  updatedAt?: string
  completedAt?: string
}

export interface FinalAssessmentResponseDTO extends FinalAssessmentDTO {
  socialWorkerId: string
  socialWorkerName: string
  status: string
  adminReviewNotes?: string
  reviewedBy?: string
  reviewedAt?: string
  signedOffAt?: string
  signedOffBy?: string
  createdAt: string
  updatedAt: string
  submittedAt?: string
}

// ==================== START SERVICE ====================

export async function startService(helpRequestId: string): Promise<HelpRequestDTO> {
  return apiPost<HelpRequestDTO>(`/service-execution/${helpRequestId}/start`, {})
}

// ==================== RESOURCE ASSIGNMENT ====================

export async function assignResource(
  helpRequestId: string,
  assignment: ResourceAssignmentDTO
): Promise<ResourceAssignmentDTO> {
  return apiPost<ResourceAssignmentDTO>(`/service-execution/${helpRequestId}/assign-resource`, assignment)
}

export async function assignResources(
  helpRequestId: string,
  assignments: ResourceAssignmentDTO[]
): Promise<ResourceAssignmentDTO[]> {
  return apiPost<ResourceAssignmentDTO[]>(`/service-execution/${helpRequestId}/assign-resources`, assignments)
}

export async function getResourceAssignments(helpRequestId: string): Promise<ResourceAssignmentDTO[]> {
  return apiGet<ResourceAssignmentDTO[]>(`/service-execution/${helpRequestId}/resources`)
}

export async function getResourceAssignmentsByDate(date: string): Promise<ResourceAssignmentDTO[]> {
  return apiGet<ResourceAssignmentDTO[]>(`/service-execution/resources/by-date?date=${date}`)
}

export async function rescheduleAssignment(
  assignmentId: string,
  newDate: string,
  newTime: string,
  reason: string
): Promise<ResourceAssignmentDTO> {
  return apiPut<ResourceAssignmentDTO>(`/service-execution/resources/${assignmentId}/reschedule`, {
    newDate,
    newTime,
    reason,
  })
}

// ==================== SERVICE OUTCOME UPDATES ====================

export async function updateServiceOutcome(
  helpRequestId: string,
  outcome: ServiceOutcomeDTO
): Promise<HelpRequestDTO> {
  return apiPost<HelpRequestDTO>(`/service-execution/${helpRequestId}/update-outcome`, outcome)
}

export async function uploadServiceProof(
  helpRequestId: string,
  serviceItem: string,
  proofUrls: string[],
  proofDescription: string
): Promise<HelpRequestDTO> {
  return apiPost<HelpRequestDTO>(`/service-execution/${helpRequestId}/upload-proof`, {
    serviceItem,
    proofUrls,
    proofDescription,
  })
}

export async function createAdjustmentPlan(
  helpRequestId: string,
  serviceItem: string,
  adjustmentPlan: string
): Promise<HelpRequestDTO> {
  return apiPost<HelpRequestDTO>(`/service-execution/${helpRequestId}/adjustment-plan`, {
    serviceItem,
    adjustmentPlan,
  })
}

// ==================== DAILY FOLLOW-UP CYCLE ====================

export async function getTodayActivities(): Promise<DailyActivityTrackerDTO> {
  return apiGet<DailyActivityTrackerDTO>('/service-execution/today-activities')
}

export async function getPendingServiceUpdates(): Promise<ServiceItemExecutionDTO[]> {
  return apiGet<ServiceItemExecutionDTO[]>('/service-execution/pending-updates')
}

export async function getIncompleteActivities(date: string): Promise<DailyActivityDTO[]> {
  return apiGet<DailyActivityDTO[]>(`/service-execution/incomplete-activities?date=${date}`)
}

export async function markActivityAttempted(
  helpRequestId: string,
  serviceItem: string,
  notes: string
): Promise<void> {
  return apiPost<void>(`/service-execution/${helpRequestId}/mark-attempted`, {
    serviceItem,
    notes,
  })
}

export async function postponeActivity(
  helpRequestId: string,
  serviceItem: string,
  newDate: string,
  reason: string
): Promise<void> {
  return apiPost<void>(`/service-execution/${helpRequestId}/postpone`, {
    serviceItem,
    newDate,
    reason,
  })
}

// ==================== MONITORING CHECKLIST ====================

export async function getMonitoringChecklist(helpRequestId: string): Promise<MonitoringChecklistDTO | null> {
  try {
    return await apiGet<MonitoringChecklistDTO>(`/service-execution/${helpRequestId}/checklist`)
  } catch {
    return null
  }
}

export async function updateChecklistItem(
  helpRequestId: string,
  itemId: string,
  completed: boolean,
  notes?: string
): Promise<MonitoringChecklistDTO> {
  return apiPut<MonitoringChecklistDTO>(`/service-execution/${helpRequestId}/checklist/${itemId}`, {
    completed,
    notes,
  })
}

// ==================== FINALIZATION ====================

export async function isCaseReadyForFinalization(helpRequestId: string): Promise<boolean> {
  const response = await apiGet<{ ready: boolean }>(`/service-execution/${helpRequestId}/ready-for-finalization`)
  return response.ready
}

export async function finalizeCase(helpRequestId: string): Promise<HelpRequestDTO> {
  return apiPost<HelpRequestDTO>(`/service-execution/${helpRequestId}/finalize`, {})
}

// ==================== FINAL ASSESSMENT ====================

export async function submitFinalAssessment(
  helpRequestId: string,
  assessment: FinalAssessmentDTO
): Promise<FinalAssessmentResponseDTO> {
  return apiPost<FinalAssessmentResponseDTO>(`/service-execution/${helpRequestId}/final-assessment`, assessment)
}

export async function getFinalAssessment(helpRequestId: string): Promise<FinalAssessmentResponseDTO | null> {
  try {
    return await apiGet<FinalAssessmentResponseDTO>(`/service-execution/${helpRequestId}/final-assessment`)
  } catch {
    return null
  }
}

export async function updateFinalAssessment(
  assessmentId: string,
  assessment: FinalAssessmentDTO
): Promise<FinalAssessmentResponseDTO> {
  return apiPut<FinalAssessmentResponseDTO>(`/service-execution/final-assessment/${assessmentId}`, assessment)
}

// ==================== CASE COMPLETION ====================

export async function markAsCompleted(helpRequestId: string): Promise<HelpRequestDTO> {
  return apiPost<HelpRequestDTO>(`/service-execution/${helpRequestId}/complete`, {})
}

// ==================== PROGRESS & STATUS ====================

export async function getExecutionStatus(helpRequestId: string): Promise<ServiceExecutionStatusDTO> {
  return apiGet<ServiceExecutionStatusDTO>(`/service-execution/${helpRequestId}/status`)
}

export async function recalculateProgress(helpRequestId: string): Promise<number> {
  const response = await apiPost<{ progress: number }>(`/service-execution/${helpRequestId}/recalculate-progress`, {})
  return response.progress
}

// ==================== DASHBOARD DATA ====================

export async function getServiceExecutionDashboard(): Promise<ServiceExecutionDashboardDTO> {
  return apiGet<ServiceExecutionDashboardDTO>('/service-execution/dashboard')
}

export async function getTodayFollowUpCount(): Promise<number> {
  const response = await apiGet<{ count: number }>('/service-execution/today-followup-count')
  return response.count
}

export async function getOverdueServices(): Promise<ServiceItemExecutionDTO[]> {
  return apiGet<ServiceItemExecutionDTO[]>('/service-execution/overdue-services')
}
