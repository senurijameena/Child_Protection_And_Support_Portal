
import { api } from './api';

export const statusService = {

  changeOwnStatus: (statusData: {
    newStatus: string;
    note?: string;
    expectedReturnTime?: string;
  }) => 
    api.put('/api/status/change', statusData),

  getMyStatus: () => 
    api.get('/api/status/my-status'),

  getAvailableUsers: (role: string, location?: string, caseType?: string) => {
    const params: any = {};
    if (location) params.location = location;
    if (caseType) params.caseType = caseType;
    return api.get(`/api/status/available/${role}`, { params });
  },

  adminChangeUserStatus: (userId: string, statusData: {
    newStatus: string;
    note?: string;
    expectedReturnTime?: string;
  }) => 
    api.put(`/api/status/admin/change/${userId}`, statusData),

  getStatusStatistics: (role: string) => 
    api.get(`/api/status/statistics/${role}`),

  setAvailable: (note?: string) => {
    const params: any = {};
    if (note) params.note = note;
    return api.post('/api/status/available', {}, { params });
  },

  setBusy: (note?: string) => {
    const params: any = {};
    if (note) params.note = note;
    return api.post('/api/status/busy', {}, { params });
  },

  setOffDuty: (note?: string, expectedReturn?: string) => {
    const params: any = {};
    if (note) params.note = note;
    if (expectedReturn) params.expectedReturn = expectedReturn;
    return api.post('/api/status/off-duty', {}, { params });
  },

  setEmergencyOnly: (note?: string) => 
    api.post('/api/status/emergency-only', null, { params: note ? { note } : {} })
};

