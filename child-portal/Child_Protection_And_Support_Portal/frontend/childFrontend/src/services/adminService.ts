
import { api } from './api';

export const adminService = {

  async getPendingApprovals() {
    try {
      const response = await api.get('/api/admin/pending-approvals');
      return response.data;
    } catch (error) {
      console.error('Error fetching pending approvals:', error);
      throw error;
    }
  },

  async getUsersByRole(role: string) {
    try {
      const response = await api.get(`/api/admin/users-by-role/${role}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching users by role:', error);
      throw error;
    }
  },

  async getPoliceOfficers() {
    try {
      const response = await api.get('/api/admin/police-officers');
      return response.data;
    } catch (error) {
      console.error('Error fetching police officers:', error);
      throw error;
    }
  },

  async getSocialWorkers() {
    try {
      const response = await api.get('/api/admin/social-workers');
      return response.data;
    } catch (error) {
      console.error('Error fetching social workers:', error);
      throw error;
    }
  },

  async getUserWithDetails(userId: string) {
    try {
      const response = await api.get(`/api/admin/user-with-details/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user with details:', error);
      throw error;
    }
  },

  async approveUser(userId: string) {
    try {
      const response = await api.post(`/api/admin/approve/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error approving user:', error);
      throw error;
    }
  },

  async rejectUser(userId: string) {
    try {
      const response = await api.post(`/api/admin/reject/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error rejecting user:', error);
      throw error;
    }
  },

  async getSystemOverview() {
    try {
      const response = await api.get('/api/analytics/dashboard');
      return response.data;
    } catch (error) {
      console.error('Error fetching system overview:', error);
      throw error;
    }
  }
};