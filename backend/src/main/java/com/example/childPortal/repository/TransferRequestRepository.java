package com.example.childPortal.repository; 

import com.example.childPortal.model.TransferRequest; 
import com.example.childPortal.model.TransferRequest.TransferStatus; 
import org.springframework.data.mongodb.repository.MongoRepository; 
import org.springframework.data.mongodb.repository.Query; 
import java.time.LocalDateTime; 
import java.util.List; 
import java.util.Optional; 

public interface TransferRequestRepository extends MongoRepository<TransferRequest, String> { 
List<TransferRequest> findByStatus(TransferStatus status); 
List<TransferRequest> findByRequestedByUserId(String userId); 
List<TransferRequest> findByCurrentAssigneeId(String userId); 
List<TransferRequest> findByRequestedAssigneeId(String userId); 
List<TransferRequest> findByCaseId(String caseId); 
List<TransferRequest> findByHelpRequestId(String helpRequestId); 
List<TransferRequest> findByReviewedByAdminId(String adminId); 
List<TransferRequest> findByRequestDateBetween(LocalDateTime start, LocalDateTime end); 
List<TransferRequest> findByUrgent(boolean urgent); 
Optional<TransferRequest> findById(String id); 
@Query("{'status': 'PENDING', 'urgent': true}") 
List<TransferRequest> findUrgentPendingRequests(); 
    @Query("{'caseId': ?0, 'status': { $in: ['PENDING', 'APPROVED'] }}") 
    List<TransferRequest> findActiveTransfersForCase(String caseId); 
     
    @Query("{'helpRequestId': ?0, 'status': { $in: ['PENDING', 'APPROVED'] }}") 
    List<TransferRequest> findActiveTransfersForHelpRequest(String helpRequestId); 
     
    long countByStatus(TransferStatus status); 
    long countByRequestedByUserIdAndStatus(String userId, TransferStatus status); 
}
