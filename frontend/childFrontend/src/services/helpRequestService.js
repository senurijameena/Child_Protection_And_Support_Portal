
// File: src/services/helpRequestService.js
import { apiGet, apiPost, apiPut, apiDelete } from './api';

// Transform backend response to frontend expected structure
const transformHelpRequestResponse = (backendData) => {
  if (!backendData) return null;

  // If already transformed, return as is
  if (backendData.requesterInfo) return backendData;

  // Transform flat backend structure to nested frontend structure
  return {
    ...backendData,
    requesterInfo: {
      isAnonymous: backendData.anonymous || false,
      name: backendData.anonymous ? 'Anonymous' : (backendData.requesterName || ''),
      relationship: backendData.requesterRelationship || '',
      contact: backendData.requesterContact || '',
      userId: backendData.requesterUserId || ''
    },
    peopleDetails: backendData.peopleDetails || {
      numberOfPeople: 1,
      ages: backendData.approximateAge || '',
      specialNeeds: backendData.specialNeeds || []
    },
    location: typeof backendData.location === 'string'
      ? { address: backendData.location }
      : (backendData.location || {}),
    helpTypes: Array.isArray(backendData.helpTypes)
      ? backendData.helpTypes
      : (backendData.helpType ? [backendData.helpType] : []),
    urgency: backendData.priority || backendData.urgency || 'MEDIUM'
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
    const data = await apiPost('/help-requests/request', backendData);
    return { data: transformHelpRequestResponse(data) };
  },

  // GET /api/help-requests/{requestId} - Get help request by ID
  getHelpRequest: async (requestId) => {
    const data = await apiGet(`/help-requests/${requestId}`);
    return { data: transformHelpRequestResponse(data) };
  },

  // GET /api/help-requests/my-requests - Get my help requests
  getMyRequests: async () => {
    const data = await apiGet('/help-requests/my-requests');
    const transformed = Array.isArray(data) ? data.map(transformHelpRequestResponse) : data;
    return { data: transformed };
  },

  // GET /api/help-requests/all - Get all help requests
  getAllRequests: async () => {
    const data = await apiGet('/help-requests/all');
    const transformed = Array.isArray(data) ? data.map(transformHelpRequestResponse) : data;
    return { data: transformed };
  },

  // GET /api/help-requests/status/{status} - Get by status
  getByStatus: async (status) => {
    const data = await apiGet(`/help-requests/status/${status}`);
    const transformed = Array.isArray(data) ? data.map(transformHelpRequestResponse) : data;
    return { data: transformed };
  },

  // GET /api/help-requests/type/{helpType} - Get by help type
  getByType: async (helpType) => {
    const data = await apiGet(`/help-requests/type/${helpType}`);
    const transformed = Array.isArray(data) ? data.map(transformHelpRequestResponse) : data;
    return { data: transformed };
  },

  // GET /api/help-requests/search/location - Search by location
  searchByLocation: async (location) => {
    const data = await apiGet(`/help-requests/search/location?location=${encodeURIComponent(location)}`);
    const transformed = Array.isArray(data) ? data.map(transformHelpRequestResponse) : data;
    return { data: transformed };
  },

  // PUT /api/help-requests/{requestId}/status - Update status
  updateStatus: async (requestId, status) => {
    const data = await apiPut(`/help-requests/${requestId}/status?status=${status}`, {});
    return { data };
  },

  // PUT /api/help-requests/{requestId}/assign - Assign to social worker
  assignSocialWorker: async (requestId, workerId) => {
    const data = await apiPut(`/help-requests/${requestId}/assign?workerId=${workerId}`, {});
    return { data };
  },

  // DELETE /api/help-requests/{requestId} - Delete help request
  deleteRequest: async (requestId) => {
    return apiDelete(`/help-requests/${requestId}`);
  },

  // Close/Decline help request with reason
  closeRequest: (requestId, reason) =>
    helpRequestService.updateStatus(requestId, 'COMPLETED')
};