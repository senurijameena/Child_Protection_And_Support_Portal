
import { api } from './api';

export const analyticsService = {

  getDashboardMetrics: () => 
    api.get('/api/analytics/dashboard'),

  getCaseStatistics: (startDate?: string, endDate?: string) => {
    const params: any = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    return api.get('/api/analytics/cases/statistics', { params });
  },

  getCaseStatusDistribution: () => 
    api.get('/api/analytics/cases/status-distribution'),

  getCaseTypeDistribution: () => 
    api.get('/api/analytics/cases/type-distribution'),

  getCaseTrends: (period: string = 'monthly') => 
    api.get('/api/analytics/cases/trends', { params: { period } }),

  getHelpRequestStatistics: (startDate?: string, endDate?: string) => {
    const params: any = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    return api.get('/api/analytics/help-requests/statistics', { params });
  },

  getHelpTypeDistribution: () => 
    api.get('/api/analytics/help-requests/type-distribution'),

  getUserStatistics: () => 
    api.get('/api/analytics/users/statistics'),

  getMostActiveUsers: (limit: number = 10) => 
    api.get('/api/analytics/users/activity', { params: { limit } }),

  getResponseTimeMetrics: () => 
    api.get('/api/analytics/performance/response-times'),

  getResolutionRates: () => 
    api.get('/api/analytics/performance/resolution-rates'),

  getLocationAnalytics: () => 
    api.get('/api/analytics/geographical/locations'),

  generateCustomReport: (reportData: {
    type: string;
    startDate: string;
    endDate: string;
    filters?: any;
    format?: 'PDF' | 'EXCEL' | 'CSV';
  }) => 
    api.post('/api/analytics/reports/custom', reportData),

  getRealtimeUpdates: () => 
    api.get('/api/analytics/realtime/updates')
};
