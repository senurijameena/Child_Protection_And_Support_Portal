package com.example.childPortal.repository;

import com.example.childPortal.model.MonitoringChecklist;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MonitoringChecklistRepository extends MongoRepository<MonitoringChecklist, String> {
    Optional<MonitoringChecklist> findByHelpRequestId(String helpRequestId);
    
    List<MonitoringChecklist> findBySocialWorkerId(String socialWorkerId);
    
    List<MonitoringChecklist> findByOverallStatus(String status);
    
    List<MonitoringChecklist> findBySocialWorkerIdAndOverallStatus(String socialWorkerId, String status);
}
