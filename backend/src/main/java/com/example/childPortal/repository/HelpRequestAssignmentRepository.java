package com.example.childPortal.repository;

import com.example.childPortal.model.HelpRequestAssignment;
import com.example.childPortal.model.HelpRequestAssignment.AssignmentStatus;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;
import java.util.Optional;

public interface HelpRequestAssignmentRepository extends MongoRepository<HelpRequestAssignment, String> {
 List<HelpRequestAssignment> findBySocialWorkerId(String socialWorkerId);
 List<HelpRequestAssignment> findBySocialWorkerIdAndStatus(String socialWorkerId,AssignmentStatus status);
 Optional<HelpRequestAssignment> findByHelpRequestId(String helpRequestId);
 List<HelpRequestAssignment> findByStatus(AssignmentStatus status);
 List<HelpRequestAssignment> findByPriority(String priority);
 List<HelpRequestAssignment> findByTransferRequested(boolean transferRequested);
}
