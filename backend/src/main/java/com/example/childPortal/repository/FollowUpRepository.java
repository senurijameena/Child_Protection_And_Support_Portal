package com.example.childPortal.repository;

import com.example.childPortal.model.FollowUp;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FollowUpRepository extends MongoRepository<FollowUp, String> {
    List<FollowUp> findBySocialWorkerId(String socialWorkerId);

    List<FollowUp> findByHelpRequestId(String helpRequestId);

    List<FollowUp> findByStatus(String status);
}
