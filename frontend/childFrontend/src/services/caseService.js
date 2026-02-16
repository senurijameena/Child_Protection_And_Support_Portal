
import { apiGet, apiPost, apiPut, apiDelete } from './api';

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
  reportCase: async (caseData) => {
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

    const data = await apiPost('/cases/report', requestBody);
    return { data: transformCaseResponse(data) };
  },

  getCaseById: async (caseId) => {
    const data = await apiGet(`/cases/${caseId}`);
    return { data: transformCaseResponse(data) };
  },

  getMyCases: async () => {
    const data = await apiGet('/cases/my-cases');
    const transformed = Array.isArray(data) ? data.map(transformCaseResponse) : data;
    return { data: transformed };
  },

  getAllCases: async () => {
    const data = await apiGet('/cases/all');
    const transformed = Array.isArray(data) ? data.map(transformCaseResponse) : data;
    return { data: transformed };
  },

  getCasesByStatus: async (status) => {
    const data = await apiGet(`/cases/status/${status}`);
    const transformed = Array.isArray(data) ? data.map(transformCaseResponse) : data;
    return { data: transformed };
  },

  updateStatus: async (caseId, status) => {
    const data = await apiPut(`/cases/${caseId}/status?status=${status}`, {});
    return { data };
  },

  assignOfficer: async (caseId, officerId) => {
    const data = await apiPut(`/cases/${caseId}/assign/officer?officerId=${officerId}`, {});
    return { data };
  },

  assignSocialWorker: async (caseId, workerId) => {
    const data = await apiPut(`/cases/${caseId}/assign/social-worker?workerId=${workerId}`, {});
    return { data };
  },

  deleteCase: (caseId) => apiDelete(`/cases/${caseId}`),

  getAllCasesWithDetails: async () => {
    const data = await apiGet('/cases/admin/all-details');
    return { data };
  },

  getPublicActiveCases: async () => {
    const data = await apiGet('/cases/public/active');
    return { data };
  },

  // Close/Decline case with reason
  closeCase: (caseId, reason) =>
    caseService.updateStatus(caseId, 'CLOSED')
};

export const caseAPI = caseService;