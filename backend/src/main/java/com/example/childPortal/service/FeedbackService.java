package com.example.childPortal.service;

import com.example.childPortal.dto.FeedbackDTO;
import com.example.childPortal.dto.FeedbackResponseDTO;
import com.example.childPortal.model.Feedback.FeedbackStatus;
import java.util.List;

public interface FeedbackService {
    FeedbackResponseDTO submitFeedback(FeedbackDTO feedbackDTO, String userId);
    FeedbackResponseDTO getFeedbackById(String feedbackId);
    List<FeedbackResponseDTO> getFeedbackByUser(String userId);
    List<FeedbackResponseDTO> getFeedbackByCase(String caseId);
    List<FeedbackResponseDTO> getAllFeedback();
    List<FeedbackResponseDTO> getPublicFeedback();
    List<FeedbackResponseDTO> getFeedbackByStatus(FeedbackStatus status);
    FeedbackResponseDTO updateFeedbackStatus(String feedbackId, FeedbackStatus status, String updatedBy);
    FeedbackResponseDTO respondToFeedback(String feedbackId, String response, String adminId);
    boolean deleteFeedback(String feedbackId);
    Double getAverageRating();
}