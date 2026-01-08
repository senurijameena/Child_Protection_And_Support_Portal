import { api } from './api';

export const messageService = {
  // Get all conversations for the current user
  getConversations: () => 
    api.get('/api/messages/conversations'),
  
  // Get messages for a specific conversation (by participantId)
  getConversationMessages: (participantId) => 
    api.get(`/api/messages/conversations/${participantId}/messages`),
  
  // Send a message in a conversation (by participantId)
  sendConversationMessage: (participantId, messageData) => 
    api.post(`/api/messages/conversations/${participantId}/messages`, messageData),
  
  // Send message directly (alternative endpoint)
  sendMessage: (messageData) => 
    api.post('/api/messages/send', messageData),
  
  // Mark message as read
  markAsRead: (messageId) => 
    api.put(`/api/messages/${messageId}/read`),
  
  // Get unread message count
  getUnreadCount: () => 
    api.get('/api/messages/unread-count')
};