package com.example.childPortal.service;

import com.example.childPortal.dto.FeedbackDTO; 
import com.example.childPortal.dto.FeedbackResponseDTO; 
import com.example.childPortal.model.Feedback.FeedbackStatus; 
import com.example.childPortal.model.Feedback.FeedbackType; 
import com.example.childPortal.model.Feedback.Category; 
import java.util.List; 

public interface FeedbackService {
    FeedbackResponseDTO submitFeedback(FeedbackDTO feedbackDTO, String userId);
    FeedbackDTO getFeedbackById(String feedbackId); 
    List<FeedbackDTO> getFeedbackByUser(String userId); 
    List<FeedbackDTO> getFeedbackByCase(String caseId);
    List<FeedbackDTO> getAllFeedback(); 
    List<FeedbackDTO> getFeedbackByType(FeedbackType type); 
    List<FeedbackDTO> getFeedbackByCategory(Category category);
    List<FeedbackDTO> getFeedbackByStatus(FeedbackStatus status);
    List<FeedbackDTO> getFeedbackByStatus(FeedbackStatus status);
    FeedbackDTO updateFeedbackStatus(String feedbackId, FeedbackStatus status); 
    FeedbackDTO respondToFeedback(String feedbackId, String response, String adminId);
    boolean deleteFeedback(String feedbackId); 
    Double getAverageRating(); 
    List<FeedbackDTO> getPublicFeedback();
}
