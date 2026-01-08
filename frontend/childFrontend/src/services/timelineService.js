// File: src/services/timelineService.js
import { api } from './api';

export const timelineService = {
  // GET /api/timeline/case/{caseId} - Get case timeline
  getCaseTimeline: (caseId) => api.get(`/api/timeline/case/${caseId}`),
  
  // GET /api/timeline/help-request/{helpRequestId} - Get help request timeline
  getHelpRequestTimeline: (helpRequestId) => 
    api.get(`/api/timeline/help-request/${helpRequestId}`),
  
  // POST /api/timeline/filter - Get filtered timeline
  getFilteredTimeline: (filterData) => 
    api.post('/api/timeline/filter', filterData),
  
  // GET /api/timeline/recent - Get recent activity
  getRecentActivity: (limit = 10) => 
    api.get('/api/timeline/recent', { params: { limit } }),
  
  // GET /api/timeline/event/{eventId} - Get timeline event
  getTimelineEvent: (eventId) => 
    api.get(`/api/timeline/event/${eventId}`),
  
  // GET /api/timeline/case/{caseId}/count - Get event count for case
  getCaseEventCount: (caseId) => 
    api.get(`/api/timeline/case/${caseId}/count`),
  
  // POST /api/timeline/create - Create timeline event
  createTimelineEvent: (eventData) => 
    api.post('/api/timeline/create', eventData),
  
  // DELETE /api/timeline/event/{eventId} - Delete timeline event
  deleteTimelineEvent: (eventId) => 
    api.delete(`/api/timeline/event/${eventId}`)
};

// Export as timelineAPI for backward compatibility
export const timelineAPI = timelineService;