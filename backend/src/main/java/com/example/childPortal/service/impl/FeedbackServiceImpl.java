package com.example.childPortal.service.impl;

import com.example.childPortal.dto.*;
import com.example.childPortal.model.*;
import com.example.childPortal.repository.*;
import com.example.childPortal.service.FeedbackService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class FeedbackServiceImpl implements FeedbackService {

    @Autowired private FeedbackRepository feedbackRepository;

    @Override
    public FeedbackResponseDTO submitFeedback(FeedbackDTO feedbackDTO, String userId) {
        try {
            Feedback feedback = new Feedback();
            feedback.setUserId(userId);
            feedback.setCaseId(feedbackDTO.getCaseId());
            feedback.setHelpRequestId(feedbackDTO.getHelpRequestId());
            feedback.setType(feedbackDTO.getType());
            feedback.setMessage(feedbackDTO.getMessage());

            if (feedbackDTO.getRating() != null) {
                feedback.setRating(feedbackDTO.getRating().toString());
            }
            
            feedback.setCategory(feedbackDTO.getCategory());
            feedback.setAnonymous(feedbackDTO.isAnonymous());
            feedback.setSubmissionDate(LocalDateTime.now());

            feedback = feedbackRepository.save(feedback);
            
            FeedbackResponseDTO response = new FeedbackResponseDTO();
            response.setId(feedback.getId());
            response.setMessage("Feedback submitted successfully");
            response.setSuccess(true);
            return response;
        } catch (Exception e) {
            return new FeedbackResponseDTO("Failed to submit feedback: " + e.getMessage(), false);
        }
    }

    @Override
    public FeedbackResponseDTO getFeedbackById(String feedbackId) {
        return feedbackRepository.findById(feedbackId)
                .map(this::convertToResponseDTO)
                .orElse(null);
    }

    @Override
    public List<FeedbackResponseDTO> getFeedbackByUser(String userId) {
        return feedbackRepository.findByUserId(userId).stream()
                .map(this::convertToResponseDTO)
                .toList();
    }

    @Override
    public List<FeedbackResponseDTO> getFeedbackByCase(String caseId) {
        return feedbackRepository.findById(caseId).stream()
                .map(this::convertToResponseDTO)
                .toList();
    }

    @Override
    public List<FeedbackResponseDTO> getAllFeedback() {
        return feedbackRepository.findAll().stream()
                .map(this::convertToResponseDTO)
                .toList();
    }
    
    @Override
    public List<FeedbackResponseDTO> getFeedbackByStatus(Feedback.FeedbackStatus status) {
        return feedbackRepository.findByStatus(status).stream()
                .map(this::convertToResponseDTO)
                .toList();
    }

    @Override
    public List<FeedbackResponseDTO> getFeedbackByType(Feedback.FeedbackType type) {
        return feedbackRepository.findByCaseId(type).stream()
                .map(this::convertToResponseDTO)
                .toList();
    }

    @Override
    public FeedbackResponseDTO updateFeedbackStatus(String feedbackId, Feedback.FeedbackStatus status, String updatedBy) {
        return feedbackRepository.findById(feedbackId)
                .map(feedback -> {
                    feedback.setStatus(status);
                    feedbackRepository.save(feedback);
                    return convertToResponseDTO(feedback);
                })
                .orElse(null);
    }

    @Override
    public FeedbackResponseDTO respondToFeedback(String feedbackId, String response, String adminId) {
        return feedbackRepository.findById(feedbackId)
                .map(feedback -> {
                    feedback.setAdminResponse(response);
                    feedback.setResponseDate(LocalDateTime.now());
                    feedback.setStatus(Feedback.FeedbackStatus.RESPONDED);
                    feedbackRepository.save(feedback);
                    return convertToResponseDTO(feedback);
                })
                .orElse(null);
    }

    @Override
    public boolean deleteFeedback(String feedbackId) {
        if (feedbackRepository.existsById(feedbackId)) {
            feedbackRepository.deleteById(feedbackId);
            return true;
        }
        return false;
    }

    @Override
    public Double getAverageRating() {
        List<Feedback> feedbacks = feedbackRepository.findAll();
        if (feedbacks.isEmpty()) return 0.0;
        
        double sum = feedbacks.stream()
                .filter(f -> f.getRating() != null)
                .mapToInt(f -> Integer.parseUnsignedInt(f.getRating().toString())) 
                .sum();
        long count = feedbacks.stream()
                .filter(f -> f.getRating() != null)
                .count();
        
        return count > 0 ? sum / count : 0.0;
    }

    @Override
    public List<FeedbackResponseDTO> getPublicFeedback() {
        return feedbackRepository.findAll().stream()
                .map(this::convertToResponseDTO)
                .toList();
    }

    private FeedbackResponseDTO convertToResponseDTO(Feedback feedback) {
        FeedbackResponseDTO dto = new FeedbackResponseDTO();
        dto.setId(feedback.getId());
        dto.setUserId(feedback.getUserId());
        dto.setCaseId(feedback.getCaseId());
        dto.setType(feedback.getType());
        if (feedback.getRating() != null) {
            try {
                dto.setRating(Integer.parseUnsignedInt(feedback.getRating().toString()));
            } catch (NumberFormatException e) {
                dto.setRating(null);
            }
        }
        
        dto.setCategory(feedback.getCategory());
        dto.setStatus(feedback.getStatus());
        dto.setAdminResponse(feedback.getAdminResponse());
        dto.setCreatedAt(feedback.getSubmissionDate());
        dto.setSuccess(true);
        return dto;
    }
}