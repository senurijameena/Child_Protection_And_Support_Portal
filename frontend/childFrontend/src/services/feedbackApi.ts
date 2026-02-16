import { apiGet, apiPost } from './api'
import type { FeedbackResponseDTO } from '../types/admin'

export type FeedbackType = 'CASE' | 'HELP_REQUEST' | 'SERVICE' | 'SYSTEM' | 'GENERAL'

export interface SubmitFeedbackPayload {
  type: FeedbackType
  message: string
  rating?: number
  caseId?: string
  helpRequestId?: string
  category?: string
  helpfulness?: string
  expectedHelp?: string
  behavior?: string
  anonymous?: boolean
}

export async function submitFeedback(payload: SubmitFeedbackPayload): Promise<FeedbackResponseDTO> {
  return apiPost<FeedbackResponseDTO>('/feedback/submit', payload)
}

export async function getMyFeedback(userId: string): Promise<FeedbackResponseDTO[]> {
  return apiGet<FeedbackResponseDTO[]>(`/feedback/user/${userId}`)
}

export async function getPublicFeedback(): Promise<FeedbackResponseDTO[]> {
  return apiGet<FeedbackResponseDTO[]>('/feedback/public')
}
