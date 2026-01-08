package com.example.childPortal.service;

import com.example.childPortal.dto.ConversationDTO;
import com.example.childPortal.dto.MessageDTO;
import com.example.childPortal.dto.SendMessageRequest;
import java.util.List;

public interface MessageService {
    List<ConversationDTO> getConversations(String userId);
    List<MessageDTO> getConversationMessages(String userId, String participantId);
    MessageDTO sendMessage(String fromUserId, SendMessageRequest request);
    void markAsRead(String messageId, String userId);
    long getUnreadCount(String userId);
}

