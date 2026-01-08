// File: src/services/officerService.js
import { api } from './api';

export const officerService = {
  // GET /api/admin/police-officers - Get all police officers
  getAllOfficers: () => api.get('/api/admin/police-officers'),
  
  // GET /api/admin/user-with-details/{userId} - Get officer details by user ID
  getOfficerByUserId: (userId) => api.get(`/api/admin/user-with-details/${userId}`)
};

// Export as officerAPI for backward compatibility
export const officerAPI = officerService;

