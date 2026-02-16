package com.example.childPortal.repository;

import com.example.childPortal.model.ResourceAssignment;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface ResourceAssignmentRepository extends MongoRepository<ResourceAssignment, String> {
    List<ResourceAssignment> findByHelpRequestId(String helpRequestId);
    
    List<ResourceAssignment> findBySocialWorkerId(String socialWorkerId);
    
    List<ResourceAssignment> findBySocialWorkerIdAndScheduledDate(String socialWorkerId, LocalDate scheduledDate);
    
    List<ResourceAssignment> findByScheduledDate(LocalDate scheduledDate);
    
    List<ResourceAssignment> findByStatus(String status);
    
    List<ResourceAssignment> findByHelpRequestIdAndStatus(String helpRequestId, String status);
    
    List<ResourceAssignment> findBySocialWorkerIdAndStatus(String socialWorkerId, String status);
    
    List<ResourceAssignment> findByScheduledDateAndStatus(LocalDate scheduledDate, String status);
    
    List<ResourceAssignment> findByScheduledDateBetween(LocalDate startDate, LocalDate endDate);
    
    List<ResourceAssignment> findBySocialWorkerIdAndScheduledDateBetween(String socialWorkerId, LocalDate startDate, LocalDate endDate);
}
