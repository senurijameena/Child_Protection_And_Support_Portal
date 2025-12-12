package com.example.childPortal.repository;

import com.example.childPortal.model.EducationalSupport;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface EducationalSupportRepository extends MongoRepository<EducationalSupport, String> {
    List<EducationalSupport> findByAssignedById(String socialWorkerId);
    List<EducationalSupport> findByCaseId(String caseId);
    List<EducationalSupport> findByStatus(String status);
}
