
import { AxiosPromise } from 'axios';

export interface CaseData {
  reporterInfo?: {
    isAnonymous?: boolean;
    contactName?: string;
    contactPhone?: string;
    contactEmail?: string;
    userId?: string;
  };
  childDetails?: {
    ageRange?: string;
    approximateAge?: string;
    gender?: string;
    identificationMarks?: string;
  };
  caseDetails?: {
    caseType?: string;
    location?: string;
    incidentDate?: string;
    description?: string;
  };
  evidence?: Array<{ url: string; type?: string }>;
  [key: string]: any;
}

export const caseService: {
  reportCase: (caseData: CaseData) => AxiosPromise<any>;
  getCaseById: (caseId: string) => Promise<any>;
  getMyCases: () => Promise<any>;
  getAllCases: () => Promise<any>;
  getCasesByStatus: (status: string) => Promise<any>;
  updateStatus: (caseId: string, status: string) => AxiosPromise<any>;
  assignOfficer: (caseId: string, officerId: string) => AxiosPromise<any>;
  assignSocialWorker: (caseId: string, workerId: string) => AxiosPromise<any>;
  deleteCase: (caseId: string) => AxiosPromise<any>;
  getAllCasesWithDetails: () => AxiosPromise<any>;
  getPublicActiveCases: () => AxiosPromise<any>;
  closeCase: (caseId: string, reason: string) => AxiosPromise<any>;
  uploadEvidence: (caseId: string, file: File) => Promise<any>;
};

export const caseAPI: typeof caseService;
