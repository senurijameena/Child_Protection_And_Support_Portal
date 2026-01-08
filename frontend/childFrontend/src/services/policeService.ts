
import { api } from './api';

export const policeService = {

  async getPoliceProfile(userId: string) {
    try {
      const response = await api.get(`/api/police/profile/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching police profile:', error);
      throw error;
    }
  },

  async getPoliceStatistics(userId: string) {
    try {
      const response = await api.get(`/api/police/statistics/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching police statistics:', error);
      throw error;
    }
  },

  async getAssignedCases(userId: string) {
    try {
      const response = await api.get(`/api/police/cases/assigned/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching assigned cases:', error);
      throw error;
    }
  },

  async getEmergencyAlerts() {
    try {
      const response = await api.get('/api/police/alerts/emergency');
      return response.data;
    } catch (error) {
      console.error('Error fetching emergency alerts:', error);
      throw error;
    }
  },

  async getTeamMembers() {
    try {
      const response = await api.get('/api/police/team');
      return response.data;
    } catch (error) {
      console.error('Error fetching team members:', error);
      throw error;
    }
  },

  async getRecentActivities() {
    try {
      const response = await api.get('/api/police/activities/recent');
      return response.data;
    } catch (error) {
      console.error('Error fetching recent activities:', error);
      throw error;
    }
  },

  async updateOfficerStatus(statusData: { status: string; reason?: string }) {
    try {
      const response = await api.post('/api/police/status/update', statusData);
      return response.data;
    } catch (error) {
      console.error('Error updating officer status:', error);
      throw error;
    }
  },

  async requestCaseTransfer(transferData: {
    caseId: string;
    requestedAssigneeId: string;
    reason: string;
  }) {
    try {
      const response = await api.post('/api/transfers/case/request', transferData);
      return response.data;
    } catch (error) {
      console.error('Error requesting case transfer:', error);
      throw error;
    }
  },

  async getPendingTransfers() {
    try {
      const response = await api.get('/api/transfers/pending');
      return response.data;
    } catch (error) {
      console.error('Error fetching pending transfers:', error);
      throw error;
    }
  }
};