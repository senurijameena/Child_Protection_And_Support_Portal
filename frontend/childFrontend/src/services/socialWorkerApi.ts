import { apiGet, apiPost, apiPut, apiDelete, apiPostFormData } from './api'
import type {
  HelpRequestDTO,
  ServiceOfferDTO,
  MessageDTO,
  ConversationDTO,
  RequestStatus,
  ServicePackageDTO,
  CompletedHelpRequestReportDTO,
  CompletedHelpReportListItemDTO,
  AnnouncementDTO,
} from '../types/dashboard'
import type { FeedbackResponseDTO } from '../types/admin'

export interface FollowUpDTO {
  id: string
  socialWorkerId?: string
  helpRequestId?: string
  childName?: string
  type?: string
  status?: string
  priority?: string
  scheduledDate?: string
  nextScheduledDate?: string
  notes?: string
  missedReason?: string
  createdAt?: string
  updatedAt?: string
}

export interface TransferRequestDTO {
  id: string
  entityType?: string
  entityId?: string
  fromUserId?: string
  fromUserName?: string
  toUserId?: string
  toUserName?: string
  reason?: string
  status?: string
  requestedAt?: string
  processedAt?: string
  processedBy?: string
}

export interface CompletedRequestRow {
  id: string
  requestId?: string
  type?: string
  rating?: number
  hasFeedback?: boolean
  closedDate?: string
}

export type CollaborationPermission = 'FULL_ACCESS' | 'VIEW_ONLY' | 'SERVICE_ONLY'
export type CollaborationStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'REMOVED'

export interface HelpRequestCollaboratorDTO {
  collaborationId: string
  userId: string
  name?: string
  email?: string
  profilePhoto?: string
  permission: CollaborationPermission
  status: CollaborationStatus
  reason?: string
  requestedAt?: string
  respondedAt?: string
  district?: string
  specialization?: string
  availability?: string
}

export interface HelpRequestCollaborationSummaryDTO {
  helpRequestId: string
  ownerUserId?: string
  ownerName?: string
  ownerProfilePhoto?: string
  activeCollaboratorCount: number
  collaborators: HelpRequestCollaboratorDTO[]
  pendingRequests: HelpRequestCollaboratorDTO[]
}

// Help requests assigned to worker
export async function getAssignedRequests(workerId: string): Promise<HelpRequestDTO[]> {
  return apiGet<HelpRequestDTO[]>(`/help-requests/worker/${workerId}`)
}

export async function getHelpRequest(requestId: string): Promise<HelpRequestDTO> {
  return apiGet<HelpRequestDTO>(`/help-requests/${requestId}`)
}

export async function acceptHelpRequest(requestId: string): Promise<HelpRequestDTO> {
  return apiPut<HelpRequestDTO>(`/help-requests/${requestId}/accept`, {})
}

export async function declineHelpRequest(requestId: string, reason: string): Promise<HelpRequestDTO> {
  return apiPut<HelpRequestDTO>(`/help-requests/${requestId}/decline`, { reason })
}

export async function updateRequestStatus(
  requestId: string,
  status: RequestStatus
): Promise<HelpRequestDTO> {
  return apiPut<HelpRequestDTO>(`/help-requests/${requestId}/status?status=${status}`, {})
}

export async function updateRequestNotes(requestId: string, notes: string): Promise<HelpRequestDTO> {
  return apiPut<HelpRequestDTO>(`/help-requests/${requestId}/notes`, { notes })
}

export async function uploadRequestDocument(
  requestId: string,
  file: File
): Promise<HelpRequestDTO> {
  const fd = new FormData()
  fd.append('file', file)
  return apiPostFormData<HelpRequestDTO>(`/help-requests/${requestId}/document`, fd)
}

// Update service item execution status (PENDING, IN_PROGRESS, SCHEDULED, COMPLETED).
// When status is IN_PROGRESS, optional startDate (ISO string) and notes can be provided.
export async function updateServiceItemStatus(
  requestId: string,
  serviceItem: string,
  status: string,
  options?: { startDate?: string; notes?: string }
): Promise<HelpRequestDTO> {
  const body: Record<string, unknown> = { serviceItem, status }
  if (options?.startDate) body.startDate = options.startDate
  if (options?.notes) body.notes = options.notes
  // debug: log the exact endpoint and payload to help diagnose 404s
  console.debug('Calling updateServiceItemStatus', {
    url: `/help-requests/${requestId}/package/service/status`,
    body,
  })
  return apiPut<HelpRequestDTO>(`/help-requests/${requestId}/package/service/status`, body)
}

// Assign resource and scheduled date to a service item
export async function assignServiceItemResource(
  requestId: string,
  serviceItem: string,
  data: { assignedResource?: string; scheduledDate?: string; notes?: string }
): Promise<HelpRequestDTO> {
  return apiPut<HelpRequestDTO>(`/help-requests/${requestId}/package/service/resource`, { serviceItem, ...data })
}

// Submit package follow-up (visit, call, session)
export async function submitPackageFollowUp(
  requestId: string,
  data: { followUpDate: string; followUpType: string; notes?: string }
): Promise<HelpRequestDTO> {
  return apiPost<HelpRequestDTO>(`/help-requests/${requestId}/package/follow-up`, data)
}

// Apply a service package to a help request and send it to the public user for approval
export async function applyServicePackageToRequest(
  requestId: string,
  packageId: string
): Promise<HelpRequestDTO> {
  return apiPost<HelpRequestDTO>(`/help-requests/${requestId}/apply-package`, {
    packageId,
  })
}

// Service offers
export async function createServiceOffer(data: {
  helpRequestId: string
  offeredToUserId: string
  serviceType: string
  serviceDetails: string
  scheduledDateTime?: string
}): Promise<ServiceOfferDTO> {
  return apiPost<ServiceOfferDTO>('/services/offer', data)
}

export async function getOffersByWorker(workerId: string): Promise<ServiceOfferDTO[]> {
  return apiGet<ServiceOfferDTO[]>(`/services/worker/${workerId}`)
}

export async function getOffersByHelpRequest(helpRequestId: string): Promise<ServiceOfferDTO[]> {
  return apiGet<ServiceOfferDTO[]>(`/services/help-request/${helpRequestId}`)
}

// Follow-ups
export async function getMyFollowUps(): Promise<FollowUpDTO[]> {
  return apiGet<FollowUpDTO[]>('/follow-ups/my-schedule')
}

export async function createFollowUp(data: Partial<FollowUpDTO>): Promise<FollowUpDTO> {
  return apiPost<FollowUpDTO>('/follow-ups', data)
}

export async function updateFollowUp(id: string, data: Partial<FollowUpDTO>): Promise<FollowUpDTO> {
  return apiPut<FollowUpDTO>(`/follow-ups/${id}`, data)
}

export async function deleteFollowUp(id: string): Promise<void> {
  await apiDelete(`/follow-ups/${id}`)
}

// Transfers
export async function requestHelpRequestTransfer(data: {
  helpRequestId: string
  requestedAssigneeId: string
  reason: string
}): Promise<TransferRequestDTO> {
  return apiPost<TransferRequestDTO>('/transfers/help-request/request', data)
}

export async function getAvailableSocialWorkers(): Promise<
  Array<{
    id: string
    userId: string
    fullName: string
    email?: string
    phone?: string
    specializations?: string[]
    organization?: string
    serviceArea?: string
    available?: boolean
    availabilityStatus?: string
  }>
> {
  return apiGet('/transfers/available-social-workers')
}

export async function getTransfersByUser(userId: string): Promise<TransferRequestDTO[]> {
  return apiGet<TransferRequestDTO[]>(`/transfers/user/${userId}`)
}

export async function getTransfersForHelpRequest(helpRequestId: string): Promise<TransferRequestDTO[]> {
  return apiGet<TransferRequestDTO[]>(`/transfers/help-request/${helpRequestId}`)
}

export async function cancelTransfer(transferId: string): Promise<TransferRequestDTO> {
  return apiPost<TransferRequestDTO>(`/transfers/${transferId}/cancel`, {})
}

export async function acceptIncomingTransfer(transferId: string): Promise<TransferRequestDTO> {
  return apiPost<TransferRequestDTO>(`/transfers/${transferId}/accept`, {})
}

export async function rejectIncomingTransfer(transferId: string, reason: string): Promise<TransferRequestDTO> {
  return apiPost<TransferRequestDTO>(`/transfers/${transferId}/reject-by-recipient`, { reason })
}

export async function getHelpRequestCollaboration(
  requestId: string
): Promise<HelpRequestCollaborationSummaryDTO> {
  return apiGet<HelpRequestCollaborationSummaryDTO>(`/help-requests/${requestId}/collaboration`)
}

export async function requestHelpRequestCollaborator(
  requestId: string,
  data: {
    collaboratorUserId: string
    permission: CollaborationPermission
    reason?: string
  }
): Promise<HelpRequestCollaboratorDTO> {
  return apiPost<HelpRequestCollaboratorDTO>(`/help-requests/${requestId}/collaboration/request`, data)
}

export async function acceptHelpRequestCollaborationRequest(
  collaborationId: string
): Promise<HelpRequestCollaboratorDTO> {
  return apiPost<HelpRequestCollaboratorDTO>(`/help-requests/collaboration/${collaborationId}/accept`, {})
}

export async function rejectHelpRequestCollaborationRequest(
  collaborationId: string,
  reason?: string
): Promise<HelpRequestCollaboratorDTO> {
  return apiPost<HelpRequestCollaboratorDTO>(`/help-requests/collaboration/${collaborationId}/reject`, reason ? { reason } : {})
}

export async function removeHelpRequestCollaborator(
  requestId: string,
  collaboratorUserId: string
): Promise<void> {
  await apiDelete(`/help-requests/${requestId}/collaboration/${collaboratorUserId}`)
}

// Get pending collaboration requests for current user (requests where others invited this user)
export interface PendingCollaborationRequestDTO {
  collaborationId: string
  userId?: string // The current user's ID (the invited collaborator)
  permission: CollaborationPermission
  status?: CollaborationStatus
  reason?: string
  requestedAt?: string
  respondedAt?: string
  district?: string

  // Help request details (populated for pending requests)
  helpRequestId?: string
  requestId?: string // tracking ID (alias)
  requestTrackingId?: string // tracking ID from backend
  requestCategory?: string

  // Owner details (the SW who sent the invitation)
  ownerUserId?: string
  ownerName?: string
  ownerProfilePhoto?: string

  // Privacy-safe preview data
  problemSummary?: string
  currentProgress?: string
  servicesApplied?: string[]
}

/** Normalize a raw item from API (handles snake_case or wrapped dates) into PendingCollaborationRequestDTO */
function normalizePendingCollaborationItem(raw: Record<string, unknown>): PendingCollaborationRequestDTO {
  const getStr = (key: string, snake?: string) =>
    (raw[key] ?? raw[snake ?? ''] ?? '') as string
  const getArr = (key: string) => (raw[key] as string[] | undefined) ?? []
  let requestedAt = raw.requestedAt ?? raw.requested_at
  if (Array.isArray(requestedAt)) requestedAt = requestedAt.length >= 6 ? `${requestedAt[0]}-${String(requestedAt[1]).padStart(2, '0')}-${String(requestedAt[2]).padStart(2, '0')}T${String(requestedAt[3]).padStart(2, '0')}:${String(requestedAt[4]).padStart(2, '0')}:00` : ''
  if (requestedAt && typeof requestedAt !== 'string') requestedAt = String(requestedAt)

  return {
    collaborationId: getStr('collaborationId', 'collaboration_id') || (raw.id as string) || '',
    userId: getStr('userId', 'user_id') || undefined,
    permission: (getStr('permission') || 'VIEW_ONLY') as CollaborationPermission,
    status: (getStr('status') as CollaborationStatus | undefined) || undefined,
    reason: getStr('reason') || undefined,
    requestedAt: (requestedAt as string) || undefined,
    respondedAt: getStr('respondedAt', 'responded_at') || undefined,
    district: getStr('district') || undefined,
    helpRequestId: getStr('helpRequestId', 'help_request_id') || undefined,
    requestTrackingId: getStr('requestTrackingId', 'request_tracking_id') || undefined,
    requestCategory: getStr('requestCategory', 'request_category') || undefined,
    ownerUserId: getStr('ownerUserId', 'owner_user_id') || undefined,
    ownerName: getStr('ownerName', 'owner_name') || undefined,
    ownerProfilePhoto: getStr('ownerProfilePhoto', 'owner_profile_photo') || undefined,
    problemSummary: getStr('problemSummary', 'problem_summary') || undefined,
    currentProgress: getStr('currentProgress', 'current_progress') || undefined,
    servicesApplied: getArr('servicesApplied')?.length ? getArr('servicesApplied') : getArr('services_applied') || [],
  }
}

export async function getMyPendingCollaborationRequests(): Promise<PendingCollaborationRequestDTO[]> {
  const res = await apiGet<PendingCollaborationRequestDTO[] | { data?: unknown[]; content?: unknown[] }>('/help-requests/collaboration/my-pending')
  let list: unknown[] = []
  if (Array.isArray(res)) list = res
  else if (res && typeof res === 'object' && Array.isArray((res as { data?: unknown[] }).data)) list = (res as { data: unknown[] }).data
  else if (res && typeof res === 'object' && Array.isArray((res as { content?: unknown[] }).content)) list = (res as { content: unknown[] }).content
  return list.map((item) => normalizePendingCollaborationItem((item as Record<string, unknown>) || {}))
}

/** Active collaborations where current user is collaborator (status ACCEPTED). Same DTO shape as pending. */
export async function getMyActiveCollaborationRequests(): Promise<PendingCollaborationRequestDTO[]> {
  const res = await apiGet<PendingCollaborationRequestDTO[] | { data?: unknown[]; content?: unknown[] }>('/help-requests/collaboration/my-active')
  let list: unknown[] = []
  if (Array.isArray(res)) list = res
  else if (res && typeof res === 'object' && Array.isArray((res as { data?: unknown[] }).data)) list = (res as { data: unknown[] }).data
  else if (res && typeof res === 'object' && Array.isArray((res as { content?: unknown[] }).content)) list = (res as { content: unknown[] }).content
  return list.map((item) => normalizePendingCollaborationItem((item as Record<string, unknown>) || {}))
}

// Messages
export async function getConversations(): Promise<ConversationDTO[]> {
  return apiGet<ConversationDTO[]>('/messages/conversations')
}

export async function getMessages(participantId: string): Promise<MessageDTO[]> {
  return apiGet<MessageDTO[]>(`/messages/conversations/${participantId}/messages`)
}

export async function sendMessage(
  participantId: string,
  message: string,
  relatedRequestId?: string
): Promise<MessageDTO> {
  return apiPost<MessageDTO>(`/messages/conversations/${participantId}/messages`, {
    message,
    relatedRequestId,
  })
}

// Timeline
export async function getHelpRequestTimeline(helpRequestId: string) {
  return apiGet(`/timeline/help-request/${helpRequestId}`)
}

// Create a timeline entry for a help request. Backend accepts generic timeline create payload.
export async function createHelpRequestTimelineNote(helpRequestId: string, description: string) {
  return apiPost('/timeline/create', {
    helpRequestId,
    eventType: 'SERVICE_STARTED',
    description,
    eventTime: new Date().toISOString(),
  })
}

// Notifications
export async function getNotifications(): Promise<{ id: string; type?: string; title?: string; message?: string; read: boolean; actionUrl?: string; createdAt?: string }[]> {
  return apiGet('/notifications')
}

// Social worker dashboard: closed/archived requests with feedback summary
export async function getSocialWorkerCompletedRequests(): Promise<CompletedRequestRow[]> {
  return apiGet<CompletedRequestRow[]>('/dashboard/social-worker/completed-requests')
}

// Feedback for a help request
export async function getLatestFeedbackForHelpRequest(requestId: string): Promise<FeedbackResponseDTO> {
  return apiGet<FeedbackResponseDTO>(`/feedback/help-request/${requestId}/latest`)
}

export async function sendSocialWorkerFeedbackResponse(feedbackId: string, response: string): Promise<FeedbackResponseDTO> {
  return apiPost<FeedbackResponseDTO>(`/feedback/${feedbackId}/social-worker-response`, { response })
}

export async function getUnreadCount(): Promise<number> {
  return apiGet<number>('/notifications/unread-count')
}

export async function markNotificationRead(id: string) {
  return apiPut(`/notifications/${id}/read`, {})
}

export async function markAllNotificationsRead() {
  return apiPut('/notifications/read-all', {})
}

// Announcements
export async function getActiveAnnouncements(): Promise<AnnouncementDTO[]> {
  return apiGet<AnnouncementDTO[]>('/announcements/active')
}

// User profile (shared across roles)
export async function getUserProfile(userId: string) {
  return apiGet<{
    id: string
    fullName?: string
    email?: string
    phone?: string
    address?: string
    profilePhoto?: string
    licenseNumber?: string
    organization?: string
    specializations?: string[]
    yearsOfExperience?: string
    certificationDocumentUrl?: string
  }>(`/user/profile/${userId}`)
}

export async function updateUserProfile(
  userId: string,
  data: {
    fullName?: string
    email?: string
    phone?: string
    address?: string
    licenseNumber?: string
    organization?: string
    specializations?: string[]
    yearsOfExperience?: string
    certificationDocumentUrl?: string
  }
) {
  return apiPut<{ success: boolean; user?: unknown }>(`/user/profile/${userId}`, data)
}

export async function uploadProfilePhoto(userId: string, file: File) {
  const fd = new FormData()
  fd.append('photo', file)
  const res = await fetch(
    `${import.meta.env.VITE_API_URL ?? (import.meta.env.PROD ? '/api' : 'http://localhost:8080/api')}/user/profile/${userId}/photo`,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      body: fd,
    }
  )
  const data = await res.json().catch(() => ({})) as { success?: boolean; photoUrl?: string; message?: string }
  if (!res.ok) throw new Error(data.message || 'Upload failed')
  return data.photoUrl as string
}

export async function changePassword(userId: string, currentPassword: string, newPassword: string) {
  return apiPut(`/user/profile/${userId}/change-password`, {
    currentPassword,
    newPassword,
  })
}

// Completed Help Request Report
export async function getCompletedHelpRequestReport(requestId: string): Promise<CompletedHelpRequestReportDTO> {
  return apiGet<CompletedHelpRequestReportDTO>(`/help-requests/${requestId}/completed-report`)
}

export async function saveCompletedHelpRequestReportDraft(
  requestId: string,
  draft: {
    initialAssessmentSummary?: string
    adjustments?: string
    followUpObservations?: string
    objectiveAchieved?: string
    improvementLevel?: string
    childSafetyStatus?: string
    familyStabilityStatus?: string
    educationContinuityStatus?: string
    challenges?: string[]
    recommendations?: string[]
    attachments?: string[]
    finalDeclarationText?: string
  }
): Promise<CompletedHelpRequestReportDTO> {
  return apiPut<CompletedHelpRequestReportDTO>(`/help-requests/${requestId}/completed-report/draft`, draft)
}

export async function sendCompletedHelpRequestReportToAdmin(
  requestId: string
): Promise<CompletedHelpRequestReportDTO> {
  return apiPost<CompletedHelpRequestReportDTO>(`/help-requests/${requestId}/completed-report/send-to-admin`, {})
}

export async function downloadCompletedHelpRequestReportPdf(requestId: string): Promise<Blob> {
  const token = localStorage.getItem('token')
  const baseUrl = import.meta.env.VITE_API_URL ?? (import.meta.env.PROD ? '/api' : 'http://localhost:8080/api')
  const response = await fetch(`${baseUrl}/help-requests/${requestId}/completed-report/pdf`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  })
  if (!response.ok) {
    const msg = await response.text().catch(() => 'Failed to download report PDF')
    throw new Error(msg || 'Failed to download report PDF')
  }
  return response.blob()
}

export async function getDraftCompletedHelpReports(): Promise<CompletedHelpReportListItemDTO[]> {
  return apiGet<CompletedHelpReportListItemDTO[]>('/reports/completed-help/drafts')
}

export async function getSubmittedCompletedHelpReports(): Promise<CompletedHelpReportListItemDTO[]> {
  return apiGet<CompletedHelpReportListItemDTO[]>('/reports/completed-help/submitted')
}

export async function deleteDraftCompletedHelpReport(requestId: string): Promise<void> {
  await apiDelete(`/reports/completed-help/${requestId}/draft`)
}

// Service packages (templates, managed by social worker)
export async function getServicePackages(params?: {
  type?: string
  status?: string
  search?: string
}): Promise<ServicePackageDTO[]> {
  const query = new URLSearchParams()
  if (params?.type) query.set('type', params.type)
  if (params?.status) query.set('status', params.status)
  if (params?.search) query.set('search', params.search)

  const qs = query.toString()
  const path = qs ? `/service-packages?${qs}` : '/service-packages'
  return apiGet<ServicePackageDTO[]>(path)
}

export async function getServicePackage(id: string): Promise<ServicePackageDTO> {
  return apiGet<ServicePackageDTO>(`/service-packages/${id}`)
}

export async function createServicePackage(
  data: Omit<ServicePackageDTO, 'id' | 'createdAt' | 'updatedAt'>
): Promise<ServicePackageDTO> {
  return apiPost<ServicePackageDTO>('/service-packages', data)
}

export async function updateServicePackage(
  id: string,
  data: Omit<ServicePackageDTO, 'id' | 'createdAt' | 'updatedAt'>
): Promise<ServicePackageDTO> {
  return apiPut<ServicePackageDTO>(`/service-packages/${id}`, data)
}

export async function deleteServicePackage(id: string): Promise<void> {
  await apiDelete(`/service-packages/${id}`)
}
// Help Request Service Workflow
export async function startServiceExecution(requestId: string): Promise<HelpRequestDTO> {
  return apiPost<HelpRequestDTO>(`/help-requests/${requestId}/service/start`, {})
}

export async function updateServiceOutcome(
  requestId: string,
  data: {
    serviceItem: string
    outcome: string
    reason?: string
    notes?: string
  }
): Promise<HelpRequestDTO> {
  return apiPut<HelpRequestDTO>(`/help-requests/${requestId}/service/outcome`, data)
}

export async function submitFinalAssessment(
  requestId: string,
  assessment: {
    objectivesAchieved: boolean
    childSafe: boolean
    needsContinuedMonitoring: boolean
    recommendClosure: boolean
    remarks: string
  }
): Promise<HelpRequestDTO> {
  return apiPost<HelpRequestDTO>(`/help-requests/${requestId}/service/assessment`, assessment)
}

export async function finalizeCase(requestId: string): Promise<HelpRequestDTO> {
  return apiPost<HelpRequestDTO>(`/help-requests/${requestId}/finalize`, {})
}

export async function requestPackageAdjustment(
  requestId: string,
  serviceItem: string,
  message: string
): Promise<HelpRequestDTO> {
  return apiPost<HelpRequestDTO>(`/help-requests/${requestId}/package/adjustment`, {
    serviceItem,
    message,
  })
}
