package com.example.childPortal.repository;

import com.example.childPortal.model.FinalAssessment;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FinalAssessmentRepository extends MongoRepository<FinalAssessment, String> {
    Optional<FinalAssessment> findByHelpRequestId(String helpRequestId);
    
    List<FinalAssessment> findBySocialWorkerId(String socialWorkerId);
    
    List<FinalAssessment> findByStatus(String status);
    
    List<FinalAssessment> findBySocialWorkerIdAndStatus(String socialWorkerId, String status);
    
    boolean existsByHelpRequestId(String helpRequestId);
}
