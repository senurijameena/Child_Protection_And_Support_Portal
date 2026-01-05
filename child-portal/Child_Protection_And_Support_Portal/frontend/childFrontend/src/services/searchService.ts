
import { api } from './api';

export const searchService = {

  searchCases: (
    searchData: {
      keyword?: string;
      status?: string;
      caseType?: string;
      location?: string;
      startDate?: string;
      endDate?: string;
      priority?: string;
      assignedTo?: string;
    },
    pagination?: {
      page?: number;
      size?: number;
      sortBy?: string;
      sortDirection?: 'ASC' | 'DESC';
    }
  ) => {
    const params: any = {};
    if (pagination) {
      if (pagination.page !== undefined) params.page = pagination.page;
      if (pagination.size !== undefined) params.size = pagination.size;
      if (pagination.sortBy) params.sortBy = pagination.sortBy;
      if (pagination.sortDirection) params.sortDirection = pagination.sortDirection;
    }
    return api.post('/api/search/cases', searchData, { params });
  },

  searchHelpRequests: (
    searchData: {
      keyword?: string;
      status?: string;
      helpType?: string;
      location?: string;
      startDate?: string;
      endDate?: string;
      urgency?: string;
    },
    pagination?: {
      page?: number;
      size?: number;
      sortBy?: string;
      sortDirection?: 'ASC' | 'DESC';
    }
  ) => {
    const params: any = {};
    if (pagination) {
      if (pagination.page !== undefined) params.page = pagination.page;
      if (pagination.size !== undefined) params.size = pagination.size;
      if (pagination.sortBy) params.sortBy = pagination.sortBy;
      if (pagination.sortDirection) params.sortDirection = pagination.sortDirection;
    }
    return api.post('/api/search/help-requests', searchData, { params });
  },

  quickSearchCases: (keyword: string, page: number = 0, size: number = 10) => 
    api.get('/api/search/quick/cases', { params: { keyword, page, size } })
};

