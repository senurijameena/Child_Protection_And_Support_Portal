import { api } from './api';

export const dashboardService = {
  getDashboardStats: () => api.get('/api/dashboard/stats'),
  
  getMyCases: () => api.get('/api/cases/my-cases'),
  
  getMyHelpRequests: () => api.get('/api/help-requests/my-requests'),
  
  getNotifications: () => api.get('/api/notifications'),
  
  getRecentActivity: (limit = 10) => 
    api.get('/api/timeline/recent', { params: { limit } })
};

