package com.example.childPortal.repository;

import com.example.childPortal.model.HelpRequest;
import com.example.childPortal.model.HelpRequest.RequestStatus;
import com.example.childPortal.model.HelpType;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface HelpRequestRepository extends MongoRepository<HelpRequest, String> {
    List<HelpRequest> findByRequesterUserId(String requesterUserId);

    List<HelpRequest> findByStatus(RequestStatus status);

    long countByStatus(RequestStatus status);

    List<HelpRequest> findByAssignedWorkerId(String workerId);

    List<HelpRequest> findByHelpType(HelpType helpType);

    List<HelpRequest> findByAnonymous(boolean anonymous);

    List<HelpRequest> findTop5ByOrderByRequestDateDesc();

    long countByStatusIn(List<RequestStatus> statuses);

    List<HelpRequest> findAllByOrderByRequestDateDesc();

    List<HelpRequest> findByLocationContainingIgnoreCase(String location);

    List<HelpRequest> findByLocationAndApproximateAgeAndGenderAndHelpType(
            String location,
            String approximateAge,
            String gender,
            HelpType helpType);

    @Query("{ 'trackingId': { $regex: ?0, $options: 'i' } }")
    List<HelpRequest> findByTrackingIdStartingWith(String prefix);

    java.util.Optional<HelpRequest> findByTrackingId(String trackingId);
}
