package com.example.childPortal.service;

import com.example.childPortal.dto.FeedbacResponseDTO; 
import com.example.childPortal.dto.FeedbacResponseDTO; 
import com.example.childPortal.model.Feedback.FeedbackStatus; 
import com.example.childPortal.model.Feedback.FeedbackType; 
import com.example.childPortal.model.Feedback.Category; 
import java.util.List; 

public interface FeedbackService {
    FeedbacResponseDTO submitFeedback(FeedbacResponseDTO feedbackDTO, String userId);
    FeedbacResponseDTO getFeedbackById(String feedbackId); 
    List<FeedbacResponseDTO> getFeedbackByUser(String userId); 
    List<FeedbacResponseDTO> getFeedbackByCase(String caseId);
    List<FeedbacResponseDTO> getAllFeedback(); 
    List<FeedbacResponseDTO> getFeedbackByType(FeedbackType type); 
    List<FeedbacResponseDTO> getFeedbackByCategory(Category category);
    List<FeedbacResponseDTO> getFeedbackByStatus(FeedbackStatus status);
    List<FeedbacResponseDTO> getFeedbackByStatus(FeedbackStatus status);
    FeedbacResponseDTO updateFeedbackStatus(String feedbackId, FeedbackStatus status); 
    FeedbacResponseDTO respondToFeedback(String feedbackId, String response, String adminId);
    boolean deleteFeedback(String feedbackId); 
    Double getAverageRating(); 
    List<FeedbacResponseDTO> getPublicFeedback();
}
