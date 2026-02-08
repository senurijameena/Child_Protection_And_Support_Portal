import { apiGet, apiPost, apiPut, apiPostFormData } from './api'
import type { CaseDTO } from '../types/dashboard'

export interface PoliceDashboardStats {
  assignedCases: number
  activeCases: number
  urgentCases: number
  emergencyCases: number
  resolvedToday: number
  avgResponse: string
  pendingTransfers: number
  unreadNotifications: number
}

export async function getPoliceDashboardStats(): Promise<PoliceDashboardStats> {
  return apiGet<PoliceDashboardStats>('/police/dashboard/stats')
}

export async function getPoliceAssignedCases(): Promise<CaseDTO[]> {
  return apiGet<CaseDTO[]>('/police/dashboard/cases')
}

export async function getPoliceStationCases(): Promise<CaseDTO[]> {
  return apiGet<CaseDTO[]>('/police/dashboard/station-cases')
}

export async function acceptCase(caseId: string): Promise<CaseDTO> {
  return apiPost<CaseDTO>(`/police/dashboard/cases/${caseId}/accept`, {})
}

export async function declineCase(caseId: string, reason: string): Promise<CaseDTO> {
  return apiPost<CaseDTO>(`/police/dashboard/cases/${caseId}/decline`, { reason })
}

export async function getCase(caseId: string): Promise<CaseDTO> {
  return apiGet<CaseDTO>(`/cases/${caseId}`)
}

export async function updateCaseStatus(caseId: string, status: string): Promise<CaseDTO> {
  return apiPut<CaseDTO>(`/cases/${caseId}/status?status=${status}`, {})
}

export async function updateCaseNotes(caseId: string, notes: string): Promise<CaseDTO> {
  return apiPut<CaseDTO>(`/cases/${caseId}/notes`, { notes })
}

export async function addCaseNote(caseId: string, note: string, currentNotes?: string): Promise<CaseDTO> {
  const updatedNotes = currentNotes ? `${currentNotes}\n\n${note}` : note
  return apiPut<CaseDTO>(`/cases/${caseId}/notes`, { notes: updatedNotes })
}

export async function uploadCaseEvidence(caseId: string, file: File): Promise<CaseDTO> {
  const fd = new FormData()
  fd.append('file', file)
  return apiPostFormData<CaseDTO>(`/cases/${caseId}/evidence`, fd)
}

export async function getCaseTimeline(caseId: string) {
  return apiGet(`/timeline/case/${caseId}`)
}

export async function createTimelineNote(caseId: string, note: string) {
  return apiPost('/timeline/create', {
    caseId,
    eventType: 'NOTE_ADDED',
    description: note,
    eventTime: new Date().toISOString(),
  })
}

export async function requestCaseTransfer(caseId: string, targetStationId: string, reason: string) {
  return apiPost('/transfers/case/request', {
    caseId,
    requestedAssigneeId: targetStationId,
    reason,
  })
}

export async function getAllPoliceStations() {
  return apiGet<Array<{ id: string; stationName?: string; district?: string; city?: string }>>('/stations')
}
