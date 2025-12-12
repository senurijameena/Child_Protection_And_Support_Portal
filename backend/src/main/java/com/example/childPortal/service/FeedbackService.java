package com.example.childPortal.service;

import com.example.childPortal.dto.FeedbackResponseDTO;
import com.example.childPortal.dto.FeedbackDTO;
import com.example.childPortal.dto.FeedbackFilterDTO;
import com.example.childPortal.dto.FeedbackStatisticsDTO;
import com.example.childPortal.model.Feedback.FeedbackStatus;
import com.example.childPortal.model.Feedback.FeedbackType;
import com.example.childPortal.model.Feedback.Category;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

public interface FeedbackService {

    FeedbackResponseDTO submitFeedback(FeedbackResponseDTO feedbackDTO, String userId);

    FeedbackResponseDTO getFeedbackById(String feedbackId);

    List<FeedbackResponseDTO> getFeedbackByUser(String userId);

    List<FeedbackResponseDTO> getFeedbackByCase(String caseId);

    List<FeedbackResponseDTO> getAllFeedback();

    List<FeedbackResponseDTO> getFeedbackByType(FeedbackType type);

    List<FeedbackResponseDTO> getFeedbackByCategory(Category category);

    List<FeedbackResponseDTO> getFeedbackByStatus(FeedbackStatus status);

    FeedbackResponseDTO updateFeedbackStatus(String feedbackId, FeedbackStatus status);

    FeedbackResponseDTO respondToFeedback(String feedbackId, String response, String adminId);

    boolean deleteFeedback(String feedbackId);

    Double getAverageRating();

    List<FeedbackResponseDTO> getPublicFeedback();

    List<FeedbackDTO> getFeedbackForDashboard(FeedbackFilterDTO filter);

    FeedbackStatisticsDTO getFeedbackStatistics();

    List<FeedbackDTO> getRecentFeedback(int limit);

    List<FeedbackDTO> getFeedbackWithRatingsOnly();

    Map<String, Object> getFeedbackAnalytics(LocalDateTime startDate, LocalDateTime endDate);

}
