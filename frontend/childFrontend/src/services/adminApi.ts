import { apiGet, apiPost, apiPut, apiDelete } from './api'
import type {
  AdminDashboardOverviewDTO,
  UserManagementDTO,
  PoliceStationDTO,
  SocialWorkerDTO,
  TransferRequestDTO,
  AnnouncementDTO,
  DuplicateDetectionDTO,
  FeedbackResponseDTO,
} from '../types/admin'
import type { CaseDTO, HelpRequestDTO } from '../types/dashboard'

const API = { apiGet, apiPost, apiPut, apiDelete }

// Dashboard overview
export async function getAdminDashboardOverview(): Promise<AdminDashboardOverviewDTO> {
  return API.apiGet<AdminDashboardOverviewDTO>('/analytics/dashboard/overview')
}

export async function getDashboardMetrics() {
  return API.apiGet<AdminDashboardOverviewDTO['metrics']>('/analytics/dashboard')
}

// Cases - admin uses full details
export async function getAllCasesWithDetails(): Promise<CaseDTO[]> {
  return API.apiGet<CaseDTO[]>('/cases/admin/all-details')
}

export async function getAllCases(): Promise<CaseDTO[]> {
  return API.apiGet<CaseDTO[]>('/cases/all')
}

export async function updateCaseStatus(caseId: string, status: string): Promise<CaseDTO> {
  return API.apiPut<CaseDTO>(`/cases/${caseId}/status?status=${status}`, {})
}

export async function assignCaseToStation(caseId: string, stationId: string): Promise<CaseDTO> {
  return API.apiPut<CaseDTO>(`/cases/${caseId}/assign/station?stationId=${stationId}`, {})
}

export async function assignCaseToOfficer(caseId: string, officerId: string): Promise<CaseDTO> {
  return API.apiPut<CaseDTO>(`/cases/${caseId}/assign/officer?officerId=${officerId}`, {})
}

export async function assignCaseToSocialWorker(caseId: string, workerId: string): Promise<CaseDTO> {
  return API.apiPut<CaseDTO>(`/cases/${caseId}/assign/social-worker?workerId=${workerId}`, {})
}

// Help requests
export async function getAllHelpRequests(): Promise<HelpRequestDTO[]> {
  return API.apiGet<HelpRequestDTO[]>('/help-requests/all')
}

export async function updateHelpRequestStatus(
  requestId: string,
  status: string
): Promise<HelpRequestDTO> {
  return API.apiPut<HelpRequestDTO>(`/help-requests/${requestId}/status?status=${status}`, {})
}

export async function rejectHelpRequest(
  requestId: string,
  reason: string
): Promise<HelpRequestDTO> {
  return API.apiPut<HelpRequestDTO>(`/help-requests/${requestId}/reject`, { reason })
}

export async function assignHelpRequestToWorker(
  requestId: string,
  workerId: string
): Promise<HelpRequestDTO> {
  return API.apiPut<HelpRequestDTO>(
    `/help-requests/${requestId}/assign?workerId=${workerId}`,
    {}
  )
}

// Admin - users
export async function getPendingApprovals() {
  return API.apiGet<unknown[]>('/admin/pending-approvals')
}

export async function getUsersByRole(role: string) {
  return API.apiGet<unknown[]>(`/admin/users-by-role/${role}`)
}

export async function approveUser(userId: string): Promise<string> {
  return API.apiPost<string>(`/admin/approve/${userId}`, {})
}

export async function rejectUser(userId: string): Promise<string> {
  return API.apiPost<string>(`/admin/reject/${userId}`, {})
}

export async function getPoliceOfficers() {
  return API.apiGet<unknown[]>('/admin/police-officers')
}

export async function getSocialWorkers(): Promise<SocialWorkerDTO[]> {
  return API.apiGet<SocialWorkerDTO[]>('/admin/social-workers')
}

export async function getUserWithDetails(userId: string) {
  return API.apiGet<Record<string, unknown>>(`/admin/user-with-details/${userId}`)
}

// User management (use existing admin endpoints; extend backend if needed)
export async function getAllUsersForManagement(): Promise<UserManagementDTO[]> {
  return API.apiGet<UserManagementDTO[]>('/admin/users/management')
}

export async function getUsersByRoleForManagement(
  role: string
): Promise<UserManagementDTO[]> {
  return API.apiGet<UserManagementDTO[]>(`/admin/users/management/role/${role}`)
}

export async function adminUpdateUser(
  userId: string,
  body: { active?: boolean; fullName?: string; email?: string; phone?: string }
): Promise<unknown> {
  return API.apiPut(`/admin/users/${userId}`, body)
}

export async function adminDeactivateUser(userId: string): Promise<unknown> {
  return API.apiPut(`/admin/users/${userId}/deactivate`, {})
}

export async function adminActivateUser(userId: string): Promise<unknown> {
  return API.apiPut(`/admin/users/${userId}/activate`, {})
}

// Police stations
export async function getAllPoliceStations(): Promise<PoliceStationDTO[]> {
  return API.apiGet<PoliceStationDTO[]>('/stations')
}

// Transfers
export async function getPendingTransfers(): Promise<TransferRequestDTO[]> {
  return API.apiGet<TransferRequestDTO[]>('/transfers/pending')
}

export async function approveTransfer(transferId: string): Promise<TransferRequestDTO> {
  return API.apiPost<TransferRequestDTO>(`/transfers/${transferId}/approve`, {})
}

export async function rejectTransfer(
  transferId: string,
  reason: string
): Promise<TransferRequestDTO> {
  return API.apiPost<TransferRequestDTO>(`/transfers/${transferId}/reject`, { reason })
}

export async function getPendingTransferCount(): Promise<number> {
  return API.apiGet<number>('/transfers/count/pending')
}

// Announcements
export async function getActiveAnnouncements(): Promise<AnnouncementDTO[]> {
  return API.apiGet<AnnouncementDTO[]>('/announcements/active')
}

export async function createAnnouncement(data: {
  title: string
  message: string
  type?: AnnouncementDTO['type']
  active?: boolean
  expiresAt?: string
}): Promise<AnnouncementDTO> {
  return API.apiPost<AnnouncementDTO>('/announcements', data)
}

export async function updateAnnouncement(id: string, data: Partial<AnnouncementDTO>) {
  return API.apiPut(`/announcements/${id}`, data)
}

export async function deleteAnnouncement(id: string) {
  return API.apiDelete(`/announcements/${id}`)
}

// Duplicate detection
export async function findDuplicateCases(caseId: string): Promise<DuplicateDetectionDTO[]> {
  return API.apiGet<DuplicateDetectionDTO[]>(`/duplicates/cases/${caseId}`)
}

export async function findDuplicateHelpRequests(
  helpRequestId: string
): Promise<DuplicateDetectionDTO[]> {
  return API.apiGet<DuplicateDetectionDTO[]>(`/duplicates/help-requests/${helpRequestId}`)
}

// Feedback
export async function getAllFeedback(): Promise<FeedbackResponseDTO[]> {
  return API.apiGet<FeedbackResponseDTO[]>('/feedback/all')
}

export async function respondToFeedback(
  feedbackId: string,
  response: string
): Promise<FeedbackResponseDTO> {
  return API.apiPost<FeedbackResponseDTO>(`/feedback/${feedbackId}/respond`, { response })
}

export async function updateFeedbackStatus(
  feedbackId: string,
  status: string
): Promise<FeedbackResponseDTO> {
  return API.apiPut<FeedbackResponseDTO>(
    `/feedback/${feedbackId}/status?status=${status}`,
    {}
  )
}

// Available users for assignment (AI-assisted suggestions)
export async function getAvailableUsersForAssignment(
  role: string,
  location?: string,
  caseType?: string
) {
  const params = new URLSearchParams()
  if (location) params.set('location', location)
  if (caseType) params.set('caseType', caseType)
  const qs = params.toString()
  return API.apiGet<{ policeOfficers?: unknown[]; socialWorkers?: unknown[] }>(
    `/status/available/${role}${qs ? `?${qs}` : ''}`
  )
}
