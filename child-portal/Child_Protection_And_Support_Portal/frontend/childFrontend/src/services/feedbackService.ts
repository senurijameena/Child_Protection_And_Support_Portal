import { api } from './api';
import type { FeedbackResponseDTO } from '../types';

export interface FeedbackStatistics {
  averageRating: number;
  totalCount: number;
  ratingDistribution: { [key: number]: number };
}

export interface FeedbackFormData {
  type: 'CASE' | 'HELP_REQUEST' | 'SERVICE' | 'SYSTEM' | 'GENERAL';
  message: string;
  rating: number;
  anonymous?: boolean;
  caseId?: string;
  helpRequestId?: string;
}

const feedbackService = {

  async getStatistics(): Promise<FeedbackStatistics> {
    try {
      const response = await api.get('/api/feedback/statistics');
      return {
        averageRating: response.data.averageRating || 0,
        totalCount: response.data.totalCount || 0,
        ratingDistribution: response.data.ratingDistribution || {}
      };
    } catch (error) {
      console.error('Error fetching feedback statistics:', error);
      return {
        averageRating: 0,
        totalCount: 0,
        ratingDistribution: {}
      };
    }
  },

  async getFeedbackByUser(userId: string): Promise<FeedbackResponseDTO[]> {
    try {
      const response = await api.get(`/api/feedback/user/${userId}`);
      return response.data || [];
    } catch (error) {
      console.error('Error fetching user feedback:', error);
      return [];
    }
  },

  async submitFeedback(feedbackData: FeedbackFormData): Promise<{ success: boolean; message: string }> {
    try {
      const response = await api.post('/api/feedback/submit', {
        type: feedbackData.type,
        message: feedbackData.message,
        rating: feedbackData.rating,
        category: feedbackData.category,
        anonymous: feedbackData.anonymous || false,
        caseId: feedbackData.caseId,
        helpRequestId: feedbackData.helpRequestId
      });
      return {
        success: response.data.success || false,
        message: response.data.message || 'Feedback submitted successfully'
      };
    } catch (error: any) {
      console.error('Error submitting feedback:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to submit feedback'
      };
    }
  }
};

export default feedbackService;

