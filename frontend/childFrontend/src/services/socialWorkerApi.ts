import { apiGet, apiPost, apiPut, apiDelete, apiPostFormData } from './api'
import type {
  HelpRequestDTO,
  ServiceOfferDTO,
  MessageDTO,
  ConversationDTO,
  RequestStatus,
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
