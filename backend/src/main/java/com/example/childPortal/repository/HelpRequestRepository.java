package com.example.childPortal.repository;

import com.example.childPortal.model.HelpRequest;
import com.example.childPortal.model.HelpRequest.RequestStatus;
import com.example.childPortal.model.HelpType;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface HelpRequestRepository extends MongoRepository<HelpRequest, String> {
    List<HelpRequest> findByRequesterUserId(String requesterUserId);
    List<HelpRequest> findByStatus(RequestStatus status);
    List<HelpRequest> findByHelpType(HelpType helpType);
    List<HelpRequest> findByAssignedWorkerId(String workerId);
    List<HelpRequest> findAllByOrderByRequestDateDesc();
}
