package com.example.childPortal.repository;

import com.example.childPortal.model.TransferRequest;
import com.example.childPortal.model.TransferRequest.TransferStatus;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface TransferRequestRepository extends MongoRepository<TransferRequest, String> {
    List<TransferRequest> findByStatus(TransferStatus status);
    List<TransferRequest> findByFromUserId(String userId);
    List<TransferRequest> findByToUserId(String userId);
    List<TransferRequest> findByEntityId(String entityId);
    List<TransferRequest> findByEntityType(String entityType);
}