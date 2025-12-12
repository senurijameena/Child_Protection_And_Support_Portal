package com.example.childPortal.repository;

import com.example.childPortal.model.CaseTimelineEvent;
import com.example.childPortal.model.CaseTimelineEvent.EventType; 
import org.springframework.data.mongodb.repository.MongoRepository; 
import org.springframework.data.mongodb.repository.Query;
import java.time.LocalDateTime;
import java.util.List;

public interface CaseTimelineRepository extends MongoRepository<CaseTimelineEvent, String> {

List<CaseTimelineEvent> findByCaseId(String caseId);
List<CaseTimelineEvent> findByHelpRequestId(String helpRequestId);
List<CaseTimelineEvent> findByCaseIdOrderByEventTimeDesc(String caseId);
List<CaseTimelineEvent> findByHelpRequestIdOrderByEventTimeDesc(String helpRequestId);
List<CaseTimelineEvent> findByPerformedByUserId(String userId);
List<CaseTimelineEvent> findByPerformedByRole(String role);
List<CaseTimelineEvent> findByEventType(EventType eventType);
List<CaseTimelineEvent> findByEventTimeBetween(LocalDateTime start, LocalDateTime end);
@Query("{'caseId': ?0, 'eventType': { $in: ?1 }}")
List<CaseTimelineEvent> findByCaseIdAndEventTypeIn(String caseId, List<EventType> eventTypes);
@Query("{'caseId': ?0, 'performedByRole': { $in: ?1 }}")
List<CaseTimelineEvent> findByCaseIdAndPerformedByRoleIn(String caseId, List<String> roles);
@Query("{'caseId': ?0, 'eventTime': { $gte: ?1, $lte: ?2 }}")
List<CaseTimelineEvent> findByCaseIdAndEventTimeBetween(String caseId, LocalDateTime start, LocalDateTime end);
List<CaseTimelineEvent> findByCaseIdAndEventTimeGreaterThanEqual(String caseId, LocalDateTime start);
List<CaseTimelineEvent> findByCaseIdAndEventTimeLessThanEqual(String caseId, LocalDateTime end);
long countByCaseId(String caseId);
long countByHelpRequestId(String helpRequestId);
@Query("{'caseId': ?0}")
List<CaseTimelineEvent> findLatestByCaseId(String caseId, org.springframework.data.domain.Pageable pageable);
}


