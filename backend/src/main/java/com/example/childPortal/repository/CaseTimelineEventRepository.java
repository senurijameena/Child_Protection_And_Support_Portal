package com.example.childPortal.repository;

import com.example.childPortal.model.CaseTimelineEvent;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import java.util.List;
import java.time.LocalDateTime;

public interface CaseTimelineEventRepository extends MongoRepository<CaseTimelineEvent, String> {
    List<CaseTimelineEvent> findByCaseIdOrderByEventTimeDesc(String caseId);
    List<CaseTimelineEvent> findByHelpRequestIdOrderByEventTimeDesc(String helpRequestId);
    long countByCaseId(String caseId);
    long countByHelpRequestId(String helpRequestId);
    
    @Query("{ $or: [ { caseId: ?0 }, { helpRequestId: ?0 } ], eventTime: { $gte: ?1, $lte: ?2 } }")
    List<CaseTimelineEvent> findByEntityIdAndDateRange(String entityId, LocalDateTime startDate, LocalDateTime endDate);
    
    List<CaseTimelineEvent> findByEventTypeInOrderByEventTimeDesc(List<CaseTimelineEvent.EventType> eventTypes);
    
    @Query("{ eventTime: { $gte: ?0 } }")
    List<CaseTimelineEvent> findRecentEvents(LocalDateTime since, org.springframework.data.domain.Pageable pageable);
}

