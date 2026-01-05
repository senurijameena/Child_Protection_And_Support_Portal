// File: src/services/notificationService.js
import { api } from './api';

// NOTE: Backend notification controller not implemented - these endpoints need backend implementation
export const notificationService = {
  // GET /api/notifications - Get user notifications
  getNotifications: () =>
    api.get('/api/notifications'),
  
  // GET /api/notifications/unread - Get unread notifications
  getUnreadNotifications: () =>
    api.get('/api/notifications/unread'),
  
  // GET /api/notifications/unread-count - Get unread count
  getUnreadCount: () =>
    api.get('/api/notifications/unread-count'),
  
  // PUT /api/notifications/{notificationId}/read - Mark as read
  markAsRead: (notificationId) =>
    api.put(`/api/notifications/${notificationId}/read`),
  
  // PUT /api/notifications/read-all - Mark all as read
  markAllAsRead: () =>
    api.put('/api/notifications/read-all'),
  
  // POST /api/notifications/test/approval - Test approval notification
  testApprovalNotification: () =>
    api.post('/api/notifications/test/approval')
};