// File: src/services/serviceOfferService.js
import { api } from './api';

export const serviceOfferService = {
  // POST /api/services/offer - Create service offer
  createServiceOffer: (offerData) => 
    api.post('/api/services/offer', offerData),
  
  // GET /api/services/{offerId} - Get service offer by ID
  getServiceOffer: (offerId) => 
    api.get(`/api/services/${offerId}`),
  
  // GET /api/services/user/{userId} - Get offers for user
  getOffersForUser: (userId) => 
    api.get(`/api/services/user/${userId}`),
  
  // GET /api/services/user/{userId}/pending - Get pending offers for user
  getPendingOffersForUser: (userId) => 
    api.get(`/api/services/user/${userId}/pending`),
  
  // GET /api/services/user/{userId}/upcoming - Get upcoming services
  getUpcomingServices: (userId) => 
    api.get(`/api/services/user/${userId}/upcoming`),
  
  // GET /api/services/worker/{workerId} - Get offers by social worker
  getOffersByWorker: (workerId) => 
    api.get(`/api/services/worker/${workerId}`),
  
  // GET /api/services/help-request/{helpRequestId} - Get offers by help request
  getOffersByHelpRequest: (helpRequestId) => 
    api.get(`/api/services/help-request/${helpRequestId}`),
  
  // GET /api/services/type/{serviceType} - Get offers by type
  getOffersByType: (serviceType) => 
    api.get(`/api/services/type/${serviceType}`),
  
  // POST /api/services/respond - Respond to offer
  respondToOffer: (responseData) => 
    api.post('/api/services/respond', responseData),
  
  // PUT /api/services/{offerId}/status - Update offer status
  updateOfferStatus: (offerId, status) => 
    api.put(`/api/services/${offerId}/status`, null, { params: { status } }),
  
  // DELETE /api/services/{offerId} - Cancel service offer
  cancelServiceOffer: (offerId) => 
    api.delete(`/api/services/${offerId}`)
};

// File: src/services/scheduleService.js
export const scheduleService = {
  // Create service schedule
  createSchedule: (offerId, scheduleData) => 
    api.post(`/service-offers/${offerId}/schedule`, scheduleData),
  
  // Get service schedule
  getSchedule: (offerId) => 
    api.get(`/service-offers/${offerId}/schedule`),
  
  // Update schedule
  updateSchedule: (offerId, scheduleId, updates) => 
    api.put(`/service-offers/${offerId}/schedule/${scheduleId}`, updates),
  
  // Get upcoming services
  getUpcomingServices: (params = {}) => 
    api.get('/service-offers/upcoming', { params }),
  
  // Get service calendar
  getServiceCalendar: (month, year) => 
    api.get(`/service-offers/calendar/${year}/${month}`)
};