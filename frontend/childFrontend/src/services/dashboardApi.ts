import { apiGet, apiPost, apiPut, apiPostFormData } from './api'
import type { CaseDTO, HelpRequestDTO, ServiceOfferDTO, NotificationDTO, MessageDTO, ConversationDTO, ServicePackageDTO } from '../types/dashboard'

// Cases
export async function getMyCases(): Promise<CaseDTO[]> {
  return apiGet<CaseDTO[]>('/cases/my-cases')
}

export async function getCase(caseId: string): Promise<CaseDTO> {
  return apiGet<CaseDTO>(`/cases/${caseId}`)
}

export async function reportCase(data: {
  anonymous: boolean
  caseType: string
  caseDescription: string
  location?: string
  incidentDate?: string // ISO string for LocalDateTime
  evidenceUrls?: string[]
}) {
  return apiPost<{ success: boolean; message?: string; caseId?: string; trackingId?: string }>(
    '/cases/report',
    data
  )
}

export async function uploadCaseEvidence(caseId: string, file: File): Promise<CaseDTO> {
  const fd = new FormData()
  fd.append('file', file)
  return apiPostFormData<CaseDTO>(`/cases/${caseId}/evidence`, fd)
}

export async function cancelCase(caseId: string): Promise<string> {
  return apiPut<CaseDTO>(`/cases/${caseId}/status?status=CANCELLED`, {}).then(() => 'Cancelled')
}

// Help requests
export async function getMyRequests(): Promise<HelpRequestDTO[]> {
  return apiGet<HelpRequestDTO[]>('/help-requests/my-requests')
}

export async function getHelpRequest(requestId: string): Promise<HelpRequestDTO> {
  return apiGet<HelpRequestDTO>(`/help-requests/${requestId}`)
}

/** Get applied service package for a help request (public user). Returns null if none applied. */
export async function getAppliedPackage(requestId: string): Promise<ServicePackageDTO | null> {
  try {
    const r = await apiGet<HelpRequestDTO>(`/help-requests/${requestId}`)
    return r.appliedPackage ?? null
  } catch {
    return null
  }
}

/** Public user: Accept the applied service package. */
export async function acceptAppliedPackage(requestId: string): Promise<HelpRequestDTO> {
  return apiPut<HelpRequestDTO>(`/help-requests/${requestId}/package/accept`, {})
}

/** Public user: Reject the applied service package. */
export async function rejectAppliedPackage(requestId: string, reason?: string): Promise<HelpRequestDTO> {
  return apiPut<HelpRequestDTO>(`/help-requests/${requestId}/package/reject`, { reason: reason ?? '' })
}

/** Public user: Submit follow-up & execution plan after accepting package. Auto-marked in calendar. */
export async function submitPackageFollowUp(
  requestId: string,
  data: { followUpDate: string; followUpType: 'VISIT' | 'CALL' | 'SESSION'; notes?: string }
): Promise<HelpRequestDTO> {
  return apiPost<HelpRequestDTO>(`/help-requests/${requestId}/package/follow-up`, data)
}

/** Public user: Request adjustment for a specific service item. */
export async function requestServiceAdjustment(
  requestId: string,
  serviceItem: string,
  message: string
): Promise<HelpRequestDTO> {
  return apiPost<HelpRequestDTO>(`/help-requests/${requestId}/package/adjustment`, { serviceItem, message })
}

export async function createHelpRequest(data: {
  anonymous: boolean
  helpType: string
  description: string
  location?: string
  documentUrls?: string[]
}) {
  return apiPost<{ success: boolean; message?: string; requestId?: string }>(
    '/help-requests/request',
    data
  )
}

export async function uploadHelpRequestDocument(requestId: string, file: File): Promise<HelpRequestDTO> {
  const fd = new FormData()
  fd.append('file', file)
  return apiPostFormData<HelpRequestDTO>(`/help-requests/${requestId}/document`, fd)
}

// Service offers
export async function getPendingOffers(userId: string): Promise<ServiceOfferDTO[]> {
  return apiGet<ServiceOfferDTO[]>(`/services/user/${userId}/pending`)
}

export async function getOffersForUser(userId: string): Promise<ServiceOfferDTO[]> {
  return apiGet<ServiceOfferDTO[]>(`/services/user/${userId}`)
}

export async function respondToOffer(offerId: string, accepted: boolean, message?: string): Promise<ServiceOfferDTO> {
  return apiPost<ServiceOfferDTO>('/services/respond', {
    offerId,
    accepted,
    responseMessage: message,
  })
}

// Notifications
export async function getNotifications(): Promise<NotificationDTO[]> {
  return apiGet<NotificationDTO[]>('/notifications')
}

export async function getUnreadCount(): Promise<number> {
  return apiGet<number>('/notifications/unread-count')
}

export async function markNotificationRead(id: string): Promise<NotificationDTO> {
  return apiPut<NotificationDTO>(`/notifications/${id}/read`, {})
}

export async function markAllNotificationsRead(): Promise<void> {
  await apiPut('/notifications/read-all', {})
}

// Messages
export async function getConversations(): Promise<ConversationDTO[]> {
  return apiGet<ConversationDTO[]>('/messages/conversations')
}

export async function getMessages(participantId: string): Promise<MessageDTO[]> {
  return apiGet<MessageDTO[]>(`/messages/conversations/${participantId}/messages`)
}

export async function sendMessage(participantId: string, message: string, relatedCaseId?: string, relatedRequestId?: string): Promise<MessageDTO> {
  return apiPost<MessageDTO>(`/messages/conversations/${participantId}/messages`, {
    message,
    relatedCaseId,
    relatedRequestId,
  })
}

// Timeline
export async function getCaseTimeline(caseId: string) {
  return apiGet(`/timeline/case/${caseId}`)
}

export async function getHelpRequestTimeline(helpRequestId: string) {
  return apiGet(`/timeline/help-request/${helpRequestId}`)
}

// Dashboard stats
export async function getDashboardStats(): Promise<Record<string, number>> {
  return apiGet<Record<string, number>>('/dashboard/stats')
}
