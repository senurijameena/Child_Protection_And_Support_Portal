package com.example.childPortal.service.impl; 

import com.example.childPortal.dto.FeedbacResponseDTO; 
import com.example.childPortal.model.*; 
import com.example.childPortal.model.Feedback.FeedbackStatus; 
import com.example.childPortal.repository.*; 
import com.example.childPortal.service.FeedbackService; 
import org.springframework.beans.factory.annotation.Autowired; 
import org.springframework.stereotype.Service; 
import java.time.LocalDateTime; 
import java.util.List; 
import java.util.Optional; 
import java.util.stream.Collectors; 
@Service 
public class FeedbackServiceImpl implements FeedbackService { 
 
    @Autowired 
    private FeedbackRepository feedbackRepository; 
 
    @Autowired 
    private UserRepository userRepository; 
 
    @Autowired 
    private CaseRepository caseRepository; 
 
    @Autowired 
    private HelpRequestRepository helpRequestRepository; 
 
    @Autowired 
    private ServiceOfferRepository serviceOfferRepository; 
 
    @Override 
    public FeedbackResponseDTO submitFeedback(FeedbacResponseDTO feedbackDTO, String userId) { 
        try { 
            Feedback feedback = new Feedback(); 
             
            feedback.setUserId(userId); 
            feedback.setCaseId(feedbackDTO.getCaseId()); 
            feedback.setHelpRequestId(feedbackDTO.getHelpRequestId()); 
            feedback.setServiceOfferId(feedbackDTO.getServiceOfferId()); 
            feedback.setFeedbackType(feedbackDTO.getFeedbackType()); 
            feedback.setFeedbackText(feedbackDTO.getFeedbackText()); 
            feedback.setRating(feedbackDTO.getRating()); 
            feedback.setCategory(feedbackDTO.getCategory()); 
            feedback.setPrivacy(feedbackDTO.getPrivacy()); 
            feedback.setAnonymous(feedbackDTO.isAnonymous()); 
             
            Feedback savedFeedback = feedbackRepository.save(feedback); 
 
            notifyAdmins(savedFeedback); 
             
            return new FeedbackResponseDTO(savedFeedback.getId(), "Feedback submitted successfully", true); 
        } catch (Exception e) { 
            return new FeedbackResponseDTO(null, "Failed to submit feedback: " + e.getMessage(), false); 
        } 
    } 
 
    @Override 
    public FeedbacResponseDTO getFeedbackById(String feedbackId) { 
        Optional<Feedback> feedbackOpt = feedbackRepository.findById(feedbackId); 
        if (feedbackOpt.isPresent()) { 
            return convertToDTO(feedbackOpt.get()); 
        } 
        return null; 
    } 
 
    @Override 
    public List<FeedbacResponseDTO> getFeedbackByUser(String userId) { 
        List<Feedback> feedbackList = feedbackRepository.findByUserId(userId); 
        return feedbackList.stream().map(this::convertToDTO).collect(Collectors.toList()); 
    } 
 
    @Override 
    public List<FeedbacResponseDTO> getFeedbackByCase(String caseId) { 
        List<Feedback> feedbackList = feedbackRepository.findByCaseId(caseId); 
        return feedbackList.stream().map(this::convertToDTO).collect(Collectors.toList()); 
    } 
 
    @Override 
    public List<FeedbacResponseDTO> getAllFeedback() { 
        List<Feedback> feedbackList = feedbackRepository.findAll(); 
        return feedbackList.stream().map(this::convertToDTO).collect(Collectors.toList()); 
    } 
 
    @Override 
    public List<FeedbacResponseDTO> getFeedbackByType(FeedbackType type) { 
        List<Feedback> feedbackList = feedbackRepository.findByFeedbackType(type); 
        return feedbackList.stream().map(this::convertToDTO).collect(Collectors.toList()); 
    } 
 
    @Override 
    public List<FeedbacResponseDTO> getFeedbackByCategory(Category category) { 
        List<Feedback> feedbackList = feedbackRepository.findByCategory(category); 
        return feedbackList.stream().map(this::convertToDTO).collect(Collectors.toList()); 
    } 
 
    @Override 
    public List<FeedbacResponseDTO> getFeedbackByStatus(FeedbackStatus status) { 
        List<Feedback> feedbackList = feedbackRepository.findByStatus(status); 
        return feedbackList.stream().map(this::convertToDTO).collect(Collectors.toList()); 
    } 
 
    @Override 
    public FeedbacResponseDTO updateFeedbackStatus(String feedbackId, FeedbackStatus status) { 
        Optional<Feedback> feedbackOpt = feedbackRepository.findById(feedbackId); 
        if (feedbackOpt.isPresent()) { 
            Feedback feedback = feedbackOpt.get(); 
            feedback.setStatus(status); 
            feedback.setLastUpdated(LocalDateTime.now()); 
             
            Feedback updatedFeedback = feedbackRepository.save(feedback); 

            if (status == FeedbackStatus.RESPONDED || status == FeedbackStatus.RESOLVED) { 
                notifyUserStatusUpdate(feedback, status); 
            } 
             
            return convertToDTO(updatedFeedback); 
        } 
        return null; 
    } 
 
    @Override 
    public FeedbacResponseDTO respondToFeedback(String feedbackId, String response, String adminId) { 
        Optional<Feedback> feedbackOpt = feedbackRepository.findById(feedbackId); 
        if (feedbackOpt.isPresent()) { 
            Feedback feedback = feedbackOpt.get(); 
            feedback.setAdminResponse(response); 
            feedback.setRespondedBy(adminId); 
            feedback.setResponseDate(LocalDateTime.now()); 
            feedback.setStatus(FeedbackStatus.RESPONDED); 
            feedback.setLastUpdated(LocalDateTime.now()); 
             
            Feedback updatedFeedback = feedbackRepository.save(feedback); 

            notifyUserResponse(feedback, response); 
             
            return convertToDTO(updatedFeedback); 
        } 
        return null; 
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
        List<Feedback> allFeedback = feedbackRepository.findAll(); 
        List<Feedback> ratedFeedback = allFeedback.stream() 
            .filter(f -> f.getRating() != null) 
            .collect(Collectors.toList()); 
         
        if (ratedFeedback.isEmpty()) { 
            return 0.0; 
        } 
         
        double sum = ratedFeedback.stream() 
            .mapToInt(Feedback::getRating) 
            .sum(); 
         
        return sum / ratedFeedback.size(); 
    } 
 
    @Override 
    public List<FeedbacResponseDTO> getPublicFeedback() { 
        List<Feedback> feedbackList = 
feedbackRepository.findByPrivacy(Feedback.Privacy.PUBLIC); 
        return feedbackList.stream() 
            .map(this::convertToDTO) 
            .peek(dto -> {
                if (dto.isAnonymous()) { 
                    dto.setUserName("Anonymous User"); 
                } else { 
                    String[] nameParts = dto.getUserName().split(" "); 
                    if (nameParts.length > 1) { 
                        dto.setUserName(nameParts[0] + " " + nameParts[1].charAt(0) + "."); 
                    } 
                } 
            }) 
            .collect(Collectors.toList()); 
    } 
 
    private FeedbacResponseDTO convertToDTO(Feedback feedback) { 
        FeedbacResponseDTO dto = new FeedbacResponseDTO(); 
        dto.setId(feedback.getId()); 
        dto.setUserId(feedback.getUserId()); 
        dto.setCaseId(feedback.getCaseId()); 
        dto.setHelpRequestId(feedback.getHelpRequestId()); 
        dto.setServiceOfferId(feedback.getServiceOfferId()); 
        dto.setFeedbackType(feedback.getFeedbackType()); 
        dto.setFeedbackText(feedback.getFeedbackText()); 
        dto.setRating(feedback.getRating()); 
        dto.setCategory(feedback.getCategory()); 
        dto.setPrivacy(feedback.getPrivacy()); 
        dto.setStatus(feedback.getStatus()); 
        dto.setAnonymous(feedback.isAnonymous()); 
        dto.setAdminResponse(feedback.getAdminResponse()); 
        dto.setRespondedBy(feedback.getRespondedBy()); 
        dto.setResponseDate(feedback.getResponseDate()); 
        dto.setSubmissionDate(feedback.getSubmissionDate()); 
        dto.setLastUpdated(feedback.getLastUpdated()); 

        if (feedback.getUserId() != null && !feedback.isAnonymous()) { 
            Optional<User> user = userRepository.findById(feedback.getUserId()); 
            user.ifPresent(u -> dto.setUserName(u.getFullName())); 
        } else if (feedback.isAnonymous()) { 
            dto.setUserName("Anonymous User"); 
        }
        if (feedback.getCaseId() != null) { 
            Optional<Case> caseOpt = caseRepository.findById(feedback.getCaseId()); 
            if (caseOpt.isPresent()) { 
                Case caseEntity = caseOpt.get(); 
                dto.setCaseTitle("Case #" + caseEntity.getTrackingId()); 
                dto.setTrackingId(caseEntity.getTrackingId()); 
            } 
        } else if (feedback.getHelpRequestId() != null) { 
            dto.setTrackingId("RH-" + feedback.getHelpRequestId().substring(0, Math.min(4, feedback.getHelpRequestId().length()))); 
        } 
         
        return dto; 
    } 
 
    private void notifyAdmins(Feedback feedback) { 
        System.out.println("New feedback notification sent to admins"); 
        System.out.println("Feedback ID: " + feedback.getId()); 
        System.out.println("Type: " + feedback.getFeedbackType()); 
        System.out.println("Category: " + feedback.getCategory()); 
         
        if (feedback.getRating() != null) { 
            System.out.println("Rating: " + feedback.getRating() + "/5"); 
        } 
    } 
 
    private void notifyUserStatusUpdate(Feedback feedback, FeedbackStatus status) { 
        System.out.println("Feedback status update notification sent to user: " + 
feedback.getUserId()); 
        System.out.println("Feedback ID: " + feedback.getId()); 
        System.out.println("New Status: " + status);
    } 
 
    private void notifyUserResponse(Feedback feedback, String response) { 
        System.out.println("Feedback response notification sent to user: " + 
feedback.getUserId()); 
        System.out.println("Feedback ID: " + feedback.getId()); 
        System.out.println("Admin Response: " + response.substring(0, Math.min(50, 
response.length())) + "..."); 
} 
} 
