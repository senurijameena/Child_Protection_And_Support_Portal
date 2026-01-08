import { api } from './api';

const transformCaseResponse = (backendData) => {
  if (!backendData) return null;
  
  if (backendData.reporterInfo) return backendData;
  
  return {
    ...backendData,
    reporterInfo: {
      isAnonymous: backendData.anonymous || false,
      contactName: backendData.anonymous ? 'Anonymous Reporter' : (backendData.reporterName || ''),
      contactPhone: backendData.reporterPhone || '',
      contactEmail: backendData.reporterEmail || '',
      userId: backendData.reporterUserId || ''
    },
    childDetails: backendData.childDetails || {
      ageRange: backendData.approximateAge || '',
      gender: backendData.gender || '',
      identificationMarks: backendData.identificationMarks || ''
    },
    caseDetails: backendData.caseDetails || {
      caseType: backendData.caseType || '',
      location: backendData.location || '',
      incidentDate: backendData.incidentDate || '',
      description: backendData.caseDescription || ''
    },
    evidence: backendData.evidenceUrls?.map(url => ({ url, type: 'link' })) || []
  };
};

export const caseService = {
  reportCase: (caseData) => {
    const requestBody = {
      anonymous: caseData.reporterInfo?.isAnonymous || false,
      approximateAge: caseData.childDetails?.ageRange || caseData.childDetails?.approximateAge || '',
      gender: caseData.childDetails?.gender || '',
      identificationMarks: caseData.childDetails?.identificationMarks || '',
      caseType: caseData.caseDetails?.caseType || '',
      location: caseData.caseDetails?.location || '',
      incidentDate: caseData.caseDetails?.incidentDate || new Date().toISOString(),
      caseDescription: caseData.caseDetails?.description || '',
      evidenceUrls: caseData.evidence?.map(item => item.url || '').filter(url => url) || []
    };
    
    return api.post('/api/cases/report', requestBody);
  },
  
  getCaseById: async (caseId) => {
    const response = await api.get(`/api/cases/${caseId}`);
    // Transform response to frontend structure
    if (response.data) {
      response.data = transformCaseResponse(response.data);
    }
    return response;
  },
  
  getMyCases: async () => {
    const response = await api.get('/api/cases/my-cases');
    if (Array.isArray(response.data)) {
      response.data = response.data.map(transformCaseResponse);
    }
    return response;
  },
  
  getAllCases: async () => {
    const response = await api.get('/api/cases/all');
    if (Array.isArray(response.data)) {
      response.data = response.data.map(transformCaseResponse);
    }
    return response;
  },
  
  getCasesByStatus: async (status) => {
    const response = await api.get(`/api/cases/status/${status}`);
    if (Array.isArray(response.data)) {
      response.data = response.data.map(transformCaseResponse);
    }
    return response;
  },
  
  updateStatus: (caseId, status) => 
    api.put(`/api/cases/${caseId}/status`, null, { params: { status } }),
  
  assignOfficer: (caseId, officerId) =>
    api.put(`/api/cases/${caseId}/assign/officer`, null, { params: { officerId } }),
  
  assignSocialWorker: (caseId, workerId) =>
    api.put(`/api/cases/${caseId}/assign/social-worker`, null, { params: { workerId } }),
  
  deleteCase: (caseId) => api.delete(`/api/cases/${caseId}`),
  
  getAllCasesWithDetails: () => api.get('/api/cases/admin/all-details'),
  
  getPublicActiveCases: () => api.get('/api/cases/public/active'),
  
  // Close/Decline case with reason
  closeCase: (caseId, reason) => 
    api.put(`/api/cases/${caseId}/close`, { reason, solution: reason })
};

export const caseAPI = caseService;