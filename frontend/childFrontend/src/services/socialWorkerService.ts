
import { apiGet, apiPost } from './api';

export const socialWorkerService = {

  async getSocialWorkerProfile(userId: string) {
    try {
      const data = await apiGet<any>(`/social-worker/profile/${userId}`);
      return data;
    } catch (error) {
      console.error('Error fetching social worker profile:', error);
      throw error;
    }
  },

  async getSocialWorkerStatistics(userId: string) {
    try {
      const data = await apiGet<any>(`/social-worker/statistics/${userId}`);
      return data;
    } catch (error) {
      console.error('Error fetching social worker statistics:', error);
      throw error;
    }
  },

  async getActiveAssignments(userId: string) {
    try {
      const data = await apiGet<any[]>(`/social-worker/assignments/active/${userId}`);
      return data;
    } catch (error) {
      console.error('Error fetching active assignments:', error);
      throw error;
    }
  },

  async getPendingOffers(userId: string) {
    try {
      const data = await apiGet<any[]>(`/social-worker/offers/pending/${userId}`);
      return data;
    } catch (error) {
      console.error('Error fetching pending offers:', error);
      throw error;
    }
  },

  async getUrgentRequests() {
    try {
      const data = await apiGet<any[]>('/social-worker/requests/urgent');
      return data;
    } catch (error) {
      console.error('Error fetching urgent requests:', error);
      throw error;
    }
  },

  async getAvailableRequests(userId: string) {
    try {
      const data = await apiGet<any[]>(`/social-worker/requests/available/${userId}`);
      return data;
    } catch (error) {
      console.error('Error fetching available requests:', error);
      throw error;
    }
  },

  async getTodaySchedule(userId: string) {
    try {
      const today = new Date().toISOString().split('T')[0];
      const data = await apiGet<any[]>(`/social-worker/schedule/${userId}?date=${today}`);
      return data;
    } catch (error) {
      console.error('Error fetching today schedule:', error);
      throw error;
    }
  },

  async getAvailableResources(userId: string) {
    try {
      const data = await apiGet<any[]>(`/social-worker/resources/available/${userId}`);
      return data;
    } catch (error) {
      console.error('Error fetching available resources:', error);
      throw error;
    }
  },

  async updateWorkerStatus(statusData: { status: string; reason?: string }) {
    try {
      const data = await apiPost<any>('/social-worker/status/update', statusData);
      return data;
    } catch (error) {
      console.error('Error updating worker status:', error);
      throw error;
    }
  },

  async makeServiceOffer(offerData: {
    helpRequestId: string;
    workerId: string;
    serviceTypes: string[];
    terms: string;
  }) {
    try {
      const data = await apiPost<any>('/services/offer', offerData);
      return data;
    } catch (error) {
      console.error('Error making service offer:', error);
      throw error;
    }
  },

  async requestResources(resourceData: {
    resourceId: string;
    quantity: number;
    reason: string;
    urgency: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  }) {
    try {
      const data = await apiPost<any>('/social-worker/resources/request', resourceData);
      return data;
    } catch (error) {
      console.error('Error requesting resources:', error);
      throw error;
    }
  }
};