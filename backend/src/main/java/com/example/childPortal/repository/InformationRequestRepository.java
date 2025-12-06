package com.example.childPortal.repository;

import com.example.childPortal.model.InformationRequest; 
import com.example.childPortal.model.InformationRequest.RequestStatus; 
import com.example.childPortal.model.InformationRequest.Priority; 
import org.springframework.data.mongodb.repository.MongoRepository; 
import java.time.LocalDateTime; 
import java.util.List; 
import java.util.Optional;

public interface InformationRequestRepository  extends MongoRepository<InformationRequest, String> {
    List<InformationRequest> findByCaseId(String caseId); 
    List<InformationRequest> findByHelpRequestId(String helpRequestId); 
    List<InformationRequest> findByRequestedFromUserId(String userId); 
    List<InformationRequest> findByRequestedByUserId(String userId); 
    List<InformationRequest> findByStatus(RequestStatus status); 
    List<InformationRequest> findByPriority(Priority priority); 
    List<InformationRequest> findByDueDateBeforeAndStatus(LocalDateTime dueDate, RequestStatus status); 
    Optional<InformationRequest> findById(String id); 
    List<InformationRequest> findByRequestedFromUserIdAndStatus(String userId, RequestStatus status); 
    List<InformationRequest> findByDueDateBetween(LocalDateTime start, LocalDateTime end);
}
