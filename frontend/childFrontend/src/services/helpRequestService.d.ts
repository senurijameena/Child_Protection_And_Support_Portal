
import { AxiosPromise } from 'axios';

export interface HelpRequestData {
  [key: string]: any;
}

export const helpRequestService: {
  createHelpRequest: (requestData: HelpRequestData) => AxiosPromise<any>;
  getHelpRequest: (requestId: string) => AxiosPromise<any>;
  getMyRequests: () => AxiosPromise<any>;
  getAllRequests: () => AxiosPromise<any>;
  getByStatus: (status: string) => AxiosPromise<any>;
  getByType: (helpType: string) => AxiosPromise<any>;
  searchByLocation: (location: string) => AxiosPromise<any>;
  updateStatus: (requestId: string, status: string) => AxiosPromise<any>;
  assignSocialWorker: (requestId: string, workerId: string) => AxiosPromise<any>;
  deleteRequest: (requestId: string) => AxiosPromise<any>;
  rejectRequest: (requestId: string, reason: string) => AxiosPromise<any>;
  updateNotes: (requestId: string, notes: string) => AxiosPromise<any>;
  uploadDocument: (requestId: string, file: File) => AxiosPromise<any>;
};
