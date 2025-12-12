package com.example.childPortal.repository;

import com.example.childPortal.model.Feedback; 
import com.example.childPortal.model.Feedback.FeedbackType; 
import com.example.childPortal.model.Feedback.Category; 
import com.example.childPortal.model.Feedback.FeedbackStatus; 
import org.springframework.data.mongodb.repository.MongoRepository; 
import java.time.LocalDateTime; 
import java.util.List; 
import java.util.Optional; 

public interface FeedbackRepository {
    List<Feedback> findByUserId(String userId); 
    List<Feedback> findByCaseId(String caseId); 
    List<Feedback> findByHelpRequestId(String helpRequestId); 
    List<Feedback> findByServiceOfferId(String serviceOfferId); 
    List<Feedback> findByFeedbackType(FeedbackType feedbackType); 
    List<Feedback> findByCategory(Category category); 
    List<Feedback> findByStatus(FeedbackStatus status); 
    List<Feedback> findByRating(Integer rating); 
    List<Feedback> findBySubmissionDateBetween(LocalDateTime start, LocalDateTime end); 
    List<Feedback> findByAnonymous(boolean anonymous); 
    Optional<Feedback> findById(String id); 
    List<Feedback> findByPrivacy(Feedback.Privacy privacy); 
    List<Feedback> findByRatingBetween(Integer min, Integer max); 
}
