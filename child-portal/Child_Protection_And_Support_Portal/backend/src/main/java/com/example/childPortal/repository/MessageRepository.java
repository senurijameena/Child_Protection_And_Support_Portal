package com.example.childPortal.repository;

import com.example.childPortal.model.Message;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import java.util.List;

public interface MessageRepository extends MongoRepository<Message, String> {
    List<Message> findByFromUserIdOrToUserIdOrderBySentAtDesc(String fromUserId, String toUserId);
    @Query("{ $or: [ { fromUserId: ?0, toUserId: ?1 }, { fromUserId: ?1, toUserId: ?0 } ] }")
    List<Message> findConversationMessages(String userId1, String userId2);
    
    @Query(value = "{ $or: [ { fromUserId: ?0, toUserId: ?1 }, { fromUserId: ?1, toUserId: ?0 } ] }", sort = "{ sentAt: 1 }")
    List<Message> findConversationMessagesOrdered(String userId1, String userId2);
    List<Message> findByToUserIdAndReadFalse(String toUserId);
    long countByToUserIdAndReadFalse(String toUserId);
    List<Message> findByRelatedCaseId(String caseId);
    List<Message> findByRelatedRequestId(String requestId);
}

