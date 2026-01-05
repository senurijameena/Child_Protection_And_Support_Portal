
import { api } from './api';

export interface DuplicateDetection {
  id: string;
  trackingId: string;
  type: 'CASE' | 'HELP_REQUEST';
  title: string;
  description: string;
  location: string;
  approximateAge: string;
  gender: string;
  identificationMarks?: string;
  date: string;
  status: string;
  reporterName?: string;
  requesterName?: string;
  similarityScore: number; // 0.0 to 1.0
  similarityReason: string;
}

export const duplicateDetectionService = {

  findDuplicateCases: async (caseId: string): Promise<DuplicateDetection[]> => {
    try {
      const response = await api.get(`/api/duplicates/cases/${caseId}`);
      return response.data || [];
    } catch (error) {
      console.error('Error finding duplicate cases:', error);
      throw error;
    }
  },

  findDuplicateHelpRequests: async (helpRequestId: string): Promise<DuplicateDetection[]> => {
    try {
      const response = await api.get(`/api/duplicates/help-requests/${helpRequestId}`);
      return response.data || [];
    } catch (error) {
      console.error('Error finding duplicate help requests:', error);
      throw error;
    }
  },

  searchSimilarCases: async (
    location?: string,
    approximateAge?: string,
    gender?: string,
    identificationMarks?: string
  ): Promise<DuplicateDetection[]> => {
    try {
      const params: any = {};
      if (location) params.location = location;
      if (approximateAge) params.approximateAge = approximateAge;
      if (gender) params.gender = gender;
      if (identificationMarks) params.identificationMarks = identificationMarks;

      const response = await api.get('/api/duplicates/cases/search', { params });
      return response.data || [];
    } catch (error) {
      console.error('Error searching similar cases:', error);
      throw error;
    }
  },

  searchSimilarHelpRequests: async (
    location?: string,
    approximateAge?: string,
    gender?: string,
    helpType?: string
  ): Promise<DuplicateDetection[]> => {
    try {
      const params: any = {};
      if (location) params.location = location;
      if (approximateAge) params.approximateAge = approximateAge;
      if (gender) params.gender = gender;
      if (helpType) params.helpType = helpType;

      const response = await api.get('/api/duplicates/help-requests/search', { params });
      return response.data || [];
    } catch (error) {
      console.error('Error searching similar help requests:', error);
      throw error;
    }
  },

  checkPotentialDuplicateCase: async (
    location: string,
    approximateAge?: string,
    gender?: string,
    identificationMarks?: string,
    incidentDate?: string
  ): Promise<DuplicateDetection[]> => {
    try {
      const params: any = { location };
      if (approximateAge) params.approximateAge = approximateAge;
      if (gender) params.gender = gender;
      if (identificationMarks) params.identificationMarks = identificationMarks;
      if (incidentDate) params.incidentDate = incidentDate;

      const response = await api.post('/api/duplicates/cases/check', null, { params });
      return response.data || [];
    } catch (error) {
      console.error('Error checking potential duplicate case:', error);
      throw error;
    }
  },

  checkPotentialDuplicateHelpRequest: async (
    location: string,
    approximateAge?: string,
    gender?: string,
    helpType?: string
  ): Promise<DuplicateDetection[]> => {
    try {
      const params: any = { location };
      if (approximateAge) params.approximateAge = approximateAge;
      if (gender) params.gender = gender;
      if (helpType) params.helpType = helpType;

      const response = await api.post('/api/duplicates/help-requests/check', null, { params });
      return response.data || [];
    } catch (error) {
      console.error('Error checking potential duplicate help request:', error);
      throw error;
    }
  }
};

