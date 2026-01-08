
import { api } from './api';

export interface Announcement {
  id: string;
  title: string;
  message: string;
  icon: string;
  type: 'FEATURE' | 'WORKSHOP' | 'MAINTENANCE' | 'GENERAL';
  active: boolean;
  createdAt: string;
  expiresAt?: string;
}

export const announcementService = {

  getActiveAnnouncements: async (): Promise<Announcement[]> => {
    const response = await api.get('/api/announcements/active');
    return response.data || [];
  },

  getAnnouncementsByType: async (type: string): Promise<Announcement[]> => {
    const response = await api.get(`/api/announcements/type/${type}`);
    return response.data || [];
  },

  getAnnouncementById: async (id: string): Promise<Announcement> => {
    const response = await api.get(`/api/announcements/${id}`);
    return response.data;
  },

  createAnnouncement: async (announcement: Partial<Announcement>): Promise<Announcement> => {
    const response = await api.post('/api/announcements', announcement);
    return response.data;
  },

  updateAnnouncement: async (id: string, announcement: Partial<Announcement>): Promise<Announcement> => {
    const response = await api.put(`/api/announcements/${id}`, announcement);
    return response.data;
  },

  deleteAnnouncement: async (id: string): Promise<void> => {
    await api.delete(`/api/announcements/${id}`);
  }
};

