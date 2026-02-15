package com.example.childPortal.repository;

import com.example.childPortal.model.Feedback;
import com.example.childPortal.model.Feedback.FeedbackStatus;
import com.example.childPortal.model.Feedback.FeedbackType;

import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface FeedbackRepository extends MongoRepository<Feedback, String> {
    List<Feedback> findByUserId(String userId);
    List<Feedback> findByCaseId(String caseId);
    List<Feedback> findByHelpRequestId(String helpRequestId);
    List<Feedback> findByHelpRequestIdIn(List<String> helpRequestIds);
    List<Feedback> findByType(FeedbackType type);
    List<Feedback> findByStatus(FeedbackStatus status);
    List<Feedback> findAllByOrderBySubmissionDateDesc();
}
