
import axios from 'axios';
import type { Case, Feedback, Statistics } from '../types';
import { API_BASE_URL } from '../utils/constants';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const apiService = {

  async getStatistics(): Promise<Statistics> {
    try {
      const response = await api.get('/statistics/public');
      return response.data;
    } catch (error) {
      console.error('Error fetching statistics:', error);

      return {
        casesResolved: 5247,
        activeOfficers: 342,
        socialWorkers: 218,
        childrenHelped: 1894
      };
    }
  },

  async getPublicCases(): Promise<Case[]> {
    try {
      const response = await api.get('/api/cases/public/active');
      return response.data;
    } catch (error) {
      console.error('Error fetching public cases:', error);
      return []; // Return empty array on error
    }
  },

  async getPublicFeedback(): Promise<Feedback[]> {
    try {
      const response = await api.get('/api/feedback/public');

      return response.data.map((feedbackDto: any) => ({
        id: feedbackDto.id,
        userId: feedbackDto.userId,
        userName: feedbackDto.userName || `User-${feedbackDto.userId?.substring(0, 8) || 'Anonymous'}`,
        rating: feedbackDto.rating || 5, // Default to 5 stars if not provided
        comment: feedbackDto.message || feedbackDto.description || 'No comment provided',
        adminResponse: feedbackDto.adminResponse,
        createdAt: feedbackDto.createdAt || feedbackDto.submissionDate || new Date().toISOString()
      }));
    } catch (error) {
      console.error('Error fetching feedback from API:', error);

      try {
        const fallbackResponse = await api.get('/feedback/all');
        return fallbackResponse.data.slice(0, 3); // Limit to 3 items
      } catch (fallbackError) {
        console.error('Fallback endpoint also failed:', fallbackError);
        return []; // Return empty array on error
      }
    }
  },

  async getFeedbackStats(): Promise<{
    totalFeedback: number;
    averageRating: number;
    positiveFeedback: number;
  }> {
    try {
      const response = await api.get('/api/feedback/average-rating');
      const averageRating = response.data;

      const allFeedback = await this.getPublicFeedback();
      
      return {
        totalFeedback: allFeedback.length,
        averageRating: averageRating || 4.5,
        positiveFeedback: allFeedback.filter(f => f.rating >= 4).length
      };
    } catch (error) {
      console.error('Error fetching feedback stats:', error);
      return {
        totalFeedback: 0,
        averageRating: 4.5,
        positiveFeedback: 0
      };
    }
  },

  async submitFeedback(feedbackData: {
    message: string;
    rating?: number;
    category?: string;
    anonymous?: boolean;
    caseId?: string;
    helpRequestId?: string;
    type?: string;
  }): Promise<{ success: boolean; message: string }> {
    try {
      const response = await api.post('/api/feedback/submit', feedbackData);
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
  },

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) {
      return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    } else if (diffDays < 7) {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    }
  },

  getStatusClass(status: string): string {
    switch (status) {
      case 'UNDER_REVIEW': return 'warning';
      case 'OPEN': return 'primary';
      case 'RESOLVED': return 'success';
      case 'CLOSED': return 'secondary';
      default: return 'light';
    }
  },

  getStatusText(status: string): string {
    switch (status) {
      case 'UNDER_REVIEW': return 'Under Review';
      case 'OPEN': return 'Open';
      case 'RESOLVED': return 'Resolved';
      case 'CLOSED': return 'Closed';
      default: return status;
    }
  },

  getUserDisplayName(feedback: Feedback): string {
    if (feedback.isAnonymous) {
      return 'Anonymous User';
    }
    
    if (feedback.userName) {
      return feedback.userName;
    }
    
    if (feedback.userId) {
      const role = feedback.userId.startsWith('PO') ? 'Police Officer' :
                   feedback.userId.startsWith('SW') ? 'Social Worker' :
                   feedback.userId.startsWith('AD') ? 'Admin' :
                   'Community Member';
      return `${role} (ID: ${feedback.userId.substring(0, 6)}...)`;
    }
    
    return 'Community Member';
  }
};

export default apiService;