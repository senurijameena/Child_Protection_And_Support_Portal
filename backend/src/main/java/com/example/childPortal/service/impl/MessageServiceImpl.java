package com.example.childPortal.service.impl;

import com.example.childPortal.dto.ConversationDTO;
import com.example.childPortal.dto.MessageDTO;
import com.example.childPortal.dto.SendMessageRequest;
import com.example.childPortal.model.Case;
import com.example.childPortal.model.HelpRequest;
import com.example.childPortal.model.Message;
import com.example.childPortal.model.User;
import com.example.childPortal.repository.CaseRepository;
import com.example.childPortal.repository.HelpRequestRepository;
import com.example.childPortal.repository.MessageRepository;
import com.example.childPortal.repository.UserRepository;
import com.example.childPortal.service.MessageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
public class MessageServiceImpl implements MessageService {

    @Autowired
    private MessageRepository messageRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CaseRepository caseRepository;

    @Autowired
    private HelpRequestRepository helpRequestRepository;

    @Autowired
    private com.example.childPortal.service.NotificationService notificationService;

    @Override
    public List<ConversationDTO> getConversations(String userId) {

        List<Message> allMessages = messageRepository.findByFromUserIdOrToUserIdOrderBySentAtDesc(userId, userId);

        Map<String, List<Message>> conversationsMap = new HashMap<>();

        for (Message msg : allMessages) {
            String participantId;
            if (msg.getFromUserId().equals(userId)) {
                participantId = msg.getToUserId();
            } else {
                participantId = msg.getFromUserId();
            }

            conversationsMap.computeIfAbsent(participantId, k -> new ArrayList<>()).add(msg);
        }

        List<ConversationDTO> conversations = new ArrayList<>();

        for (Map.Entry<String, List<Message>> entry : conversationsMap.entrySet()) {
            String participantId = entry.getKey();
            List<Message> messages = entry.getValue();

            Message lastMessage = messages.get(0);

            long unreadCount = messages.stream()
                    .filter(m -> m.getToUserId().equals(userId) && !m.isRead())
                    .count();

            Optional<User> participantOpt = userRepository.findById(participantId);
            if (!participantOpt.isPresent())
                continue;

            User participant = participantOpt.get();

            ConversationDTO dto = new ConversationDTO();
            dto.setId(participantId); // Use participantId as conversation ID
            dto.setParticipantId(participantId);
            dto.setParticipantName(participant.getFullName());
            dto.setParticipantRole(participant.getRole().name());
            dto.setLastMessage(lastMessage.getMessage());
            dto.setLastMessageTime(lastMessage.getSentAt());
            dto.setUnreadCount((int) unreadCount);

            if (lastMessage.getRelatedCaseId() != null) {
                dto.setRelatedCaseId(lastMessage.getRelatedCaseId());
                Optional<Case> caseOpt = caseRepository.findById(lastMessage.getRelatedCaseId());
                if (caseOpt.isPresent()) {
                    dto.setCaseTrackingId(caseOpt.get().generateTrackingId());
                }
            }

            if (lastMessage.getRelatedRequestId() != null) {
                dto.setRelatedRequestId(lastMessage.getRelatedRequestId());
                Optional<HelpRequest> requestOpt = helpRequestRepository.findById(lastMessage.getRelatedRequestId());
                if (requestOpt.isPresent()) {
                    dto.setRequestTrackingId(requestOpt.get().generateTrackingId());
                }
            }

            conversations.add(dto);
        }

        conversations.sort((a, b) -> b.getLastMessageTime().compareTo(a.getLastMessageTime()));

        return conversations;
    }

    @Override
    public List<MessageDTO> getConversationMessages(String userId, String participantId) {
        List<Message> messages = messageRepository.findConversationMessagesOrdered(userId, participantId);

        return messages.stream().map(msg -> convertToDTO(msg, userId)).collect(Collectors.toList());
    }

    @Override
    public MessageDTO sendMessage(String fromUserId, SendMessageRequest request) {
        Message message = new Message();
        message.setFromUserId(fromUserId);
        message.setToUserId(request.getToUserId());
        message.setMessage(request.getMessage());
        message.setRelatedCaseId(request.getRelatedCaseId());
        message.setRelatedRequestId(request.getRelatedRequestId());
        message.setSentAt(LocalDateTime.now());
        message.setRead(false);

        Message saved = messageRepository.save(message);

        // Notify recipient
        if (notificationService != null) {
            String fromUserName = userRepository.findById(fromUserId).map(User::getFullName).orElse("Someone");
            notificationService.sendNewMessageNotification(request.getToUserId(), fromUserId, fromUserName,
                    request.getMessage());
        }

        return convertToDTO(saved, fromUserId);
    }

    @Override
    public void markAsRead(String messageId, String userId) {
        Optional<Message> messageOpt = messageRepository.findById(messageId);
        if (messageOpt.isPresent()) {
            Message message = messageOpt.get();
            if (message.getToUserId().equals(userId)) {
                message.setRead(true);
                messageRepository.save(message);
            }
        }
    }

    @Override
    public long getUnreadCount(String userId) {
        return messageRepository.countByToUserIdAndReadFalse(userId);
    }

    private MessageDTO convertToDTO(Message message, String currentUserId) {
        MessageDTO dto = new MessageDTO();
        dto.setId(message.getId());
        dto.setFromUserId(message.getFromUserId());
        dto.setToUserId(message.getToUserId());
        dto.setMessage(message.getMessage());
        dto.setRelatedCaseId(message.getRelatedCaseId());
        dto.setRelatedRequestId(message.getRelatedRequestId());
        dto.setSentAt(message.getSentAt());
        dto.setRead(message.isRead());

        Optional<User> fromUser = userRepository.findById(message.getFromUserId());
        Optional<User> toUser = userRepository.findById(message.getToUserId());

        if (fromUser.isPresent()) {
            dto.setFromUserName(fromUser.get().getFullName());
        }
        if (toUser.isPresent()) {
            dto.setToUserName(toUser.get().getFullName());
        }

        return dto;
    }
}
