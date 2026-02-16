package com.example.childPortal.repository;

import com.example.childPortal.model.CompletedHelpRequestReport;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface CompletedHelpRequestReportRepository extends MongoRepository<CompletedHelpRequestReport, String> {
    Optional<CompletedHelpRequestReport> findByHelpRequestId(String helpRequestId);
    List<CompletedHelpRequestReport> findByGeneratedByUserIdAndWorkflowStatusOrderByGeneratedAtDesc(
            String generatedByUserId,
            CompletedHelpRequestReport.WorkflowStatus workflowStatus
    );

    List<CompletedHelpRequestReport> findByGeneratedByUserIdAndWorkflowStatusInOrderByGeneratedAtDesc(
            String generatedByUserId,
            List<CompletedHelpRequestReport.WorkflowStatus> workflowStatuses
    );
}
