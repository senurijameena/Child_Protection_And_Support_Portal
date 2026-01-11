package com.example.childPortal.repository;

import com.example.childPortal.model.Case;
import com.example.childPortal.model.Case.CaseStatus;
import com.example.childPortal.model.CaseType;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface CaseRepository extends MongoRepository<Case, String> {
    List<Case> findByReporterUserId(String reporterUserId);

    List<Case> findByStatus(CaseStatus status);

    long countByStatus(CaseStatus status);

    List<Case> findByCaseType(CaseType caseType);

    List<Case> findByAssignedOfficerId(String officerId);

    List<Case> findByAssignedWorkerId(String workerId);

    List<Case> findAllByOrderByReportDateDesc();

    List<Case> findTop5ByOrderByReportDateDesc();

    long countByEmergency(boolean emergency);

    long countByStatusIn(List<CaseStatus> statuses);

    List<Case> findByLocationAndApproximateAgeAndGenderAndIncidentDateBetween(
            String location,
            String approximateAge,
            String gender,
            LocalDateTime startDate,
            LocalDateTime endDate);

    List<Case> findByAnonymous(boolean anonymous);

    // Query cases with tracking IDs that start with the given prefix
    // Using a simple prefix match for better performance and reliability
    @Query("{ 'trackingId': { $regex: ?0, $options: '' } }")
    List<Case> findByTrackingIdStartingWith(String regexPattern);

    // Check if a tracking ID already exists
    boolean existsByTrackingId(String trackingId);

    // Find case by tracking ID
    Optional<Case> findByTrackingId(String trackingId);
}
