import { apiGet, apiPost, apiPut, apiDelete, apiPostFormData } from './api'
import type {
  HelpRequestDTO,
  ServiceOfferDTO,
  MessageDTO,
  ConversationDTO,
  RequestStatus,
  ServicePackageDTO,
} from '../types/dashboard'

export interface FollowUpDTO {
  id: string
  socialWorkerId?: string
  helpRequestId?: string
  childName?: string
  type?: string
  status?: string
  priority?: string
  scheduledDate?: string
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
  toUserId?: string
  reason?: string
  status?: string
  requestedAt?: string
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
  Array<{ id: string; userId: string; fullName: string; email?: string; specializations?: string[] }>
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

export async function getUnreadCount(): Promise<number> {
  return apiGet<number>('/notifications/unread-count')
}

export async function markNotificationRead(id: string) {
  return apiPut(`/notifications/${id}/read`, {})
}

export async function markAllNotificationsRead() {
  return apiPut('/notifications/read-all', {})
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
