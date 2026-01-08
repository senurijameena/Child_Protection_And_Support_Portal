package com.example.childPortal.controller;

import com.example.childPortal.dto.ConversationDTO;
import com.example.childPortal.dto.MessageDTO;
import com.example.childPortal.dto.SendMessageRequest;
import com.example.childPortal.service.MessageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/messages")
@CrossOrigin(origins = "*")
public class MessageController {

    @Autowired
    private MessageService messageService;

    @GetMapping("/conversations")
    public ResponseEntity<List<ConversationDTO>> getConversations(
            @AuthenticationPrincipal String userId) {
        List<ConversationDTO> conversations = messageService.getConversations(userId);
        return ResponseEntity.ok(conversations);
    }

    @GetMapping("/conversations/{participantId}/messages")
    public ResponseEntity<List<MessageDTO>> getConversationMessages(
            @AuthenticationPrincipal String userId,
            @PathVariable String participantId) {
        List<MessageDTO> messages = messageService.getConversationMessages(userId, participantId);
        return ResponseEntity.ok(messages);
    }

    @PostMapping("/conversations/{participantId}/messages")
    public ResponseEntity<MessageDTO> sendMessage(
            @AuthenticationPrincipal String fromUserId,
            @PathVariable String participantId,
            @RequestBody SendMessageRequest request) {
        request.setToUserId(participantId);
        MessageDTO message = messageService.sendMessage(fromUserId, request);
        return ResponseEntity.ok(message);
    }

    @PostMapping("/send")
    public ResponseEntity<MessageDTO> sendMessageDirect(
            @AuthenticationPrincipal String fromUserId,
            @RequestBody SendMessageRequest request) {
        MessageDTO message = messageService.sendMessage(fromUserId, request);
        return ResponseEntity.ok(message);
    }

    @PutMapping("/{messageId}/read")
    public ResponseEntity<?> markAsRead(
            @AuthenticationPrincipal String userId,
            @PathVariable String messageId) {
        messageService.markAsRead(messageId, userId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/unread-count")
    public ResponseEntity<Long> getUnreadCount(@AuthenticationPrincipal String userId) {
        long count = messageService.getUnreadCount(userId);
        return ResponseEntity.ok(count);
    }
}

