package com.example.childPortal.repository;

import com.example.childPortal.model.EducationalSupport;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EducationalSupportRepository extends MongoRepository<EducationalSupport, String> {

    List<EducationalSupport> findByCaseId(String caseId);
    List<EducationalSupport> findByAssignedById(String socialWorkerId);

}
