package com.example.childPortal.repository;

import com.example.childPortal.model.Case;
import com.example.childPortal.model.Case.CaseStatus;
import com.example.childPortal.model.CaseType;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface CaseRepository extends MongoRepository<Case, String> {
    List<Case> findByReporterUserId(String reporterUserId);
    List<Case> findByStatus(CaseStatus status);
    List<Case> findByCaseType(CaseType caseType);
    List<Case> findByAssignedOfficerId(String officerId);
    List<Case> findByAssignedWorkerId(String workerId);
    List<Case> findAllByOrderByReportDateDesc();
    List<Case> findByLocationAndApproximateAgeAndGenderAndIncidentDateBetween(
        String location, 
        String approximateAge, 
        String gender, 
        LocalDateTime startDate, 
        LocalDateTime endDate
    );
}
