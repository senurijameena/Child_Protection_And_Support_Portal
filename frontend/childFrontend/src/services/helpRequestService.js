// File: src/services/helpRequestService.js
import { api } from './api';

// Transform backend response to frontend expected structure
const transformHelpRequestResponse = (backendData) => {
  if (!backendData) return null;

  // If already transformed, return as is
  if (backendData.requesterInfo) return backendData;

  // Transform flat backend structure to nested frontend structure
  return {
    ...backendData,
    id: backendData.id || backendData.helpRequestId || backendData._id || 'Unknown',
    requesterInfo: {
      isAnonymous: backendData.anonymous || false,
      name: backendData.anonymous ? 'Anonymous' : (backendData.requesterName || ''),
      relationship: backendData.requesterRelationship || '',
      contact: backendData.requesterContact || '',
      userId: backendData.requesterUserId || ''
    },
    trackingId: backendData.trackingId || 'Unknown',
    helpTypes: Array.isArray(backendData.helpTypes)
      ? backendData.helpTypes
      : (backendData.helpType ? [backendData.helpType] : []),
    helpType: backendData.helpType || (Array.isArray(backendData.helpTypes) && backendData.helpTypes.length > 0 ? backendData.helpTypes[0] : ''),
    urgency: backendData.priority || backendData.urgency || 'MEDIUM',
    childAge: backendData.approximateAge || (backendData.peopleDetails?.ages) || '',
    priority: backendData.priority || backendData.urgency || 'MEDIUM',
    status: backendData.status || 'REQUESTED'
  };
};

export const helpRequestService = {
  // POST /api/help-requests/request - Create help request
  createHelpRequest: async (requestData) => {
    // Transform nested frontend structure to flat backend DTO structure
    const backendData = {
      anonymous: requestData.requesterInfo?.isAnonymous || requestData.anonymous || false,
      requesterName: requestData.requesterInfo?.isAnonymous
        ? (requestData.requesterInfo?.name || 'Anonymous')
        : (requestData.requesterInfo?.name || ''),
      approximateAge: Array.isArray(requestData.peopleDetails?.ages)
        ? requestData.peopleDetails.ages[0]
        : (requestData.peopleDetails?.ages || requestData.approximateAge || ''),
      gender: requestData.peopleDetails?.gender || requestData.gender || '',
      identificationMarks: requestData.peopleDetails?.identificationMarks || requestData.identificationMarks || '',
      helpType: Array.isArray(requestData.helpTypes)
        ? requestData.helpTypes[0]
        : (requestData.helpTypes || requestData.helpType || ''),
      description: requestData.description || '',
      location: typeof requestData.location === 'string'
        ? requestData.location
        : (requestData.location?.address || ''),
      documentUrls: requestData.documentUrls || [],
      priority: requestData.urgency || requestData.priority || 'MEDIUM'
    };
    const response = await api.post('/api/help-requests/request', backendData);
    // Transform response to frontend structure
    if (response.data) {
      response.data = transformHelpRequestResponse(response.data);
    }
    return response;
  },

  // GET /api/help-requests/{requestId} - Get help request by ID
  getHelpRequest: async (requestId) => {
    const response = await api.get(`/api/help-requests/${requestId}`);
    // Transform response to frontend structure
    if (response.data) {
      response.data = transformHelpRequestResponse(response.data);
    }
    return response;
  },

  // GET /api/help-requests/my-requests - Get my help requests
  getMyRequests: async () => {
    const response = await api.get('/api/help-requests/my-requests');
    // Transform response array
    if (Array.isArray(response.data)) {
      response.data = response.data.map(transformHelpRequestResponse).filter(r => r !== null);
    }
    return response;
  },

  // GET /api/help-requests/all - Get all help requests
  getAllRequests: async () => {
    const response = await api.get('/api/help-requests/all');
    // Transform response array
    if (Array.isArray(response.data)) {
      response.data = response.data.map(transformHelpRequestResponse).filter(r => r !== null);
    }
    return response;
  },

  // GET /api/help-requests/status/{status} - Get by status
  getByStatus: async (status) => {
    const response = await api.get(`/api/help-requests/status/${status}`);
    // Transform response array
    if (Array.isArray(response.data)) {
      response.data = response.data.map(transformHelpRequestResponse);
    }
    return response;
  },

  // GET /api/help-requests/type/{helpType} - Get by help type
  getByType: async (helpType) => {
    const response = await api.get(`/api/help-requests/type/${helpType}`);
    // Transform response array
    if (Array.isArray(response.data)) {
      response.data = response.data.map(transformHelpRequestResponse);
    }
    return response;
  },

  // GET /api/help-requests/search/location - Search by location
  searchByLocation: async (location) => {
    const response = await api.get('/api/help-requests/search/location', { params: { location } });
    // Transform response array
    if (Array.isArray(response.data)) {
      response.data = response.data.map(transformHelpRequestResponse);
    }
    return response;
  },

  // PUT /api/help-requests/{requestId}/status - Update status
  updateStatus: (requestId, status) =>
    api.put(`/api/help-requests/${requestId}/status`, null, { params: { status } }),

  // PUT /api/help-requests/{requestId}/assign - Assign to social worker
  assignSocialWorker: (requestId, workerId) =>
    api.put(`/api/help-requests/${requestId}/assign`, null, { params: { workerId } }),

  // DELETE /api/help-requests/{requestId} - Delete help request
  deleteRequest: (requestId) =>
    api.delete(`/api/help-requests/${requestId}`),

  // Close/Decline help request with reason
  closeRequest: (requestId, reason) =>
    api.put(`/api/help-requests/${requestId}/close`, { reason, solution: reason }),

  // Reject help request with reason
  rejectRequest: (requestId, reason) =>
    api.put(`/api/help-requests/${requestId}/reject`, { reason }),

  // Update notes
  updateNotes: (requestId, notes) =>
    api.put(`/api/help-requests/${requestId}/notes`, { notes }),

  // POST /api/help-requests/{requestId}/document - Upload document
  uploadDocument: async (requestId, file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post(`/api/help-requests/${requestId}/document`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    if (response.data) {
      response.data = transformHelpRequestResponse(response.data);
    }
    return response;
  },
};