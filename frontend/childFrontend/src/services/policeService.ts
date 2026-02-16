
import { apiGet, apiPost } from './api';

export const policeService = {

  async getPoliceProfile(userId: string) {
    try {
      const data = await apiGet<any>(`/user/profile/${userId}`);
      return data;
    } catch (error) {
      console.error('Error fetching police profile:', error);
      throw error;
    }
  },

  async getPoliceStatistics() {
    try {
      const data = await apiGet<any>('/police/dashboard/stats');
      return data;
    } catch (error) {
      console.error('Error fetching police statistics:', error);
      throw error;
    }
  },

  async getAssignedCases() {
    try {
      const data = await apiGet<any[]>('/police/dashboard/cases');
      return data;
    } catch (error) {
      console.error('Error fetching assigned cases:', error);
      throw error;
    }
  },

  async getEmergencyAlerts() {
    try {
      const data = await apiGet<any[]>('/cases/status/URGENT');
      return data;
    } catch (error) {
      console.error('Error fetching emergency alerts:', error);
      throw error;
    }
  },

  async getTeamMembers() {
    try {
      const data = await apiGet<any[]>('/status/available/POLICE');
      return data;
    } catch (error) {
      console.error('Error fetching team members:', error);
      throw error;
    }
  },

  async getRecentActivities() {
    try {
      const data = await apiGet<any[]>('/police/activities/recent');
      return data;
    } catch (error) {
      console.error('Error fetching recent activities:', error);
      throw error;
    }
  },

  async updateOfficerStatus(statusData: { status: string; reason?: string }) {
    try {
      const data = await apiPost<any>('/police/status/update', statusData);
      return data;
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
      const data = await apiPost<any>('/transfers/case/request', transferData);
      return data;
    } catch (error) {
      console.error('Error requesting case transfer:', error);
      throw error;
    }
  },

  async getPendingTransfers() {
    try {
      const data = await apiGet<any[]>('/transfers/pending');
      return data;
    } catch (error) {
      console.error('Error fetching pending transfers:', error);
      throw error;
    }
  }
};