// File: src/services/transferService.js
import { api } from './api';

export const transferService = {
  // POST /api/transfers/case/request - Request case transfer
  requestCaseTransfer: (transferData) =>
    api.post('/api/transfers/case/request', transferData),

  // POST /api/transfers/help-request/request - Request help request transfer
  requestHelpRequestTransfer: (transferData) =>
    api.post('/api/transfers/help-request/request', transferData),

  // GET /api/transfers/pending - Get pending transfers
  getPendingTransfers: () =>
    api.get('/api/transfers/pending'),

  // GET /api/transfers/urgent - Get urgent transfers
  getUrgentTransfers: () =>
    api.get('/api/transfers/urgent'),

  // GET /api/transfers/user/{userId} - Get transfers by user
  getTransfersByUser: (userId) =>
    api.get(`/api/transfers/user/${userId}`),

  // GET /api/transfers/case/{caseId} - Get transfers for case
  getTransfersForCase: (caseId) =>
    api.get(`/api/transfers/case/${caseId}`),

  // GET /api/transfers/help-request/{helpRequestId} - Get transfers for help request
  getTransfersForHelpRequest: (helpRequestId) =>
    api.get(`/api/transfers/help-request/${helpRequestId}`),

  // GET /api/transfers/{transferId} - Get transfer request
  getTransferRequest: (transferId) =>
    api.get(`/api/transfers/${transferId}`),

  // POST /api/transfers/{transferId}/approve - Approve transfer
  approveTransfer: (transferId) =>
    api.post(`/api/transfers/${transferId}/approve`),

  // POST /api/transfers/{transferId}/reject - Reject transfer
  rejectTransfer: (transferId, reason) =>
    api.post(`/api/transfers/${transferId}/reject`, reason ? { reason } : {}),

  // POST /api/transfers/{transferId}/cancel - Cancel transfer
  cancelTransfer: (transferId) =>
    api.post(`/api/transfers/${transferId}/cancel`),

  // GET /api/transfers/user/{userId}/history - Get transfer history
  getTransferHistory: (userId) =>
    api.get(`/api/transfers/user/${userId}/history`),

  // GET /api/transfers/count/pending - Get pending transfer count
  getPendingTransferCount: () =>
    api.get('/api/transfers/count/pending'),

  // POST /api/transfers/{transferId}/execute - Execute transfer
  executeTransfer: (transferId) =>
    api.post(`/api/transfers/${transferId}/execute`),

  // GET /api/transfers/available-social-workers - Get available social workers for transfer
  getAvailableSocialWorkers: () =>
    api.get('/api/transfers/available-social-workers').then(res => res.data)
};

// Export as transferAPI for backward compatibility
export const transferAPI = transferService;