package com.example.childPortal.service.impl;

import com.example.childPortal.dto.*;
import com.example.childPortal.model.*;
import com.example.childPortal.model.Feedback.FeedbackStatus;
import com.example.childPortal.model.Feedback.FeedbackType;
import com.example.childPortal.model.Feedback.Category;
import com.example.childPortal.model.Feedback.Privacy;
import com.example.childPortal.repository.*;
import com.example.childPortal.service.FeedbackService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
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
    private ServiceOffer serviceOfferRepository;
    
    @Override
    public FeedbackResponseDTO submitFeedback(FeedbackDTO feedbackDTO, String userId) {
        try {
            Feedback feedback = new Feedback();
            
            feedback.setUserId(userId);
            feedback.setCaseId(feedbackDTO.getCaseTitle());
            feedback.setHelpRequestId(feedbackDTO.getHelpRequestId());
            feedback.setServiceOfferId(feedbackDTO.getServiceOfferId());
            feedback.setFeedbackType(feedbackDTO.getFeedbackText());
            feedback.setFeedbackText(feedbackDTO.getFeedbackText());
            feedback.setRating(feedbackDTO.getRatingStars());
            feedback.setCategory(feedbackDTO.getCategory());
            feedback.setPrivacy(feedbackDTO.getPrivacy());
            feedback.setAnonymous(feedbackDTO.isAnonymous());
            feedback.setStatus(FeedbackStatus.SUBMITTED);
            feedback.setSubmissionDate(LocalDateTime.now());
            
            Feedback savedFeedback = feedbackRepository.save(feedback);
            
            notifyAdmins(savedFeedback);
            
            return new FeedbackResponseDTO(savedFeedback.getId(), "Feedback submitted successfully", true);
        } catch (Exception e) {
            return new FeedbackResponseDTO(null, "Failed to submit feedback: " + e.getMessage(), false);
        }
    }
    
    @Override
    public FeedbackResponseDTO getFeedbackById(String feedbackId) {
        Optional<Feedback> feedbackOpt = feedbackRepository.findById(feedbackId);
        if (feedbackOpt.isPresent()) {
            return convertToDTO(feedbackOpt.get());
        }
        return null;
    }
    
    @Override
    public List getFeedbackByUser(String userId) {
        List<Feedback> feedbackList = feedbackRepository.findByUserId(userId);
        return feedbackList.stream().map(this::convertToDTO).collect(Collectors.toList());
    }
    
    @Override
    public List getFeedbackByCase(String caseId) {
        List<Feedback> feedbackList = feedbackRepository.findByCaseId(caseId);
        return feedbackList.stream().map(this::convertToDTO).collect(Collectors.toList());
    }
    
    @Override
    public List getAllFeedback() {
        List<Feedback> feedbackList = feedbackRepository.findAll();
        return feedbackList.stream().map(this::convertToDTO).collect(Collectors.toList());
    }
    
    @Override
    public List getFeedbackByType(FeedbackType type) {
        List<Feedback> feedbackList = feedbackRepository.findByFeedbackType(type);
        return feedbackList.stream().map(this::convertToDTO).collect(Collectors.toList());
    }
    
    @Override
    public List getFeedbackByCategory(Category category) {
        List<Feedback> feedbackList = feedbackRepository.findByCategory(category);
        return feedbackList.stream().map(this::convertToDTO).collect(Collectors.toList());
    }
    
    @Override
    public List getFeedbackByStatus(FeedbackStatus status) {
        List<Feedback> feedbackList = feedbackRepository.findByStatus(status);
        return feedbackList.stream().map(this::convertToDTO).collect(Collectors.toList());
    }
    
    @Override
    public FeedbackResponseDTO updateFeedbackStatus(String feedbackId, FeedbackStatus status) {
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
    public FeedbackResponseDTO respondToFeedback(String feedbackId, String response, String adminId) {
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
    public List getPublicFeedback() {
        List<Feedback> feedbackList = feedbackRepository.findByPrivacy(Privacy.PUBLIC);
        return feedbackList.stream()
            .map(this::convertToDTO)
            .peek(dto -> {
                if (dto.isAnonymous()) {
                    dto.setUserType("Anonymous User");
                } else {
                    String userName = dto.getUserName();
                    if (userName != null) {
                        String[] nameParts = userName.split(" ");
                        if (nameParts.length > 1) {
                            dto.setUserType(nameParts[0] + " " + nameParts[1].charAt(0) + ".");
                        }
                    }
                }
            })
            .collect(Collectors.toList());
    }
    
    @Override
    public List<FeedbackDTO> getFeedbackForDashboard(FeedbackFilterDTO filter) {
        List<Feedback> allFeedback;
        
        if (filter.getCaseId() != null) {
            allFeedback = feedbackRepository.findByCaseId(filter.getCaseId());
        } else if (filter.getHelpRequestId() != null) {
            allFeedback = feedbackRepository.findByHelpRequestId(filter.getHelpRequestId());
        } else if (filter.getUserId() != null) {
            allFeedback = feedbackRepository.findByUserId(filter.getUserId());
        } else if (filter.getFeedbackType() != null) {
            allFeedback = feedbackRepository.findByFeedbackType(filter.getFeedbackType());
        } else if (filter.getCategory() != null) {
            allFeedback = feedbackRepository.findByCategory(filter.getCategory());
        } else if (filter.getStatus() != null) {
            allFeedback = feedbackRepository.findByStatus(filter.getStatus());
        } else if (filter.getRating() != null) {
            allFeedback = feedbackRepository.findByRating(filter.getRating());
        } else {
            allFeedback = feedbackRepository.findAll();
        }
        
        List<Feedback> filteredFeedback = allFeedback.stream()
            .filter(feedback -> {
                if (filter.getStartDate() != null && feedback.getSubmissionDate().isBefore(filter.getStartDate())) {
                    return false;
                }
                if (filter.getEndDate() != null && feedback.getSubmissionDate().isAfter(filter.getEndDate())) {
                    return false;
                }
                if (filter.isAnonymousOnly() && !feedback.isAnonymous()) {
                    return false;
                }
                
                if (filter.getMinRating() != null && feedback.getRating() != null && feedback.getRating() < filter.getMinRating()) {
                    return false;
                }
                if (filter.getMaxRating() != null && feedback.getRating() != null && feedback.getRating() > filter.getMaxRating()) {
                    return false;
                }
                
                if (filter.getSearchText() != null && !filter.getSearchText().isEmpty()) {
                    String searchLower = filter.getSearchText().toLowerCase();
                    boolean matches = feedback.getFeedbackText().toLowerCase().contains(searchLower);
                    if (!matches && feedback.getCaseId() != null) {
                        Optional<Case> caseOpt = caseRepository.findById(feedback.getCaseId());
                        if (caseOpt.isPresent()) {
                            Case caseEntity = caseOpt.get();
                            matches = caseEntity.getCaseDescription().toLowerCase().contains(searchLower) || 
                                     caseEntity.getLocation().toLowerCase().contains(searchLower);
                        }
                    }
                    
                    if (!matches && feedback.getUserId() != null) {
                        Optional<User> userOpt = userRepository.findById(feedback.getUserId());
                        if (userOpt.isPresent()) {
                            matches = userOpt.get().getFullName().toLowerCase().contains(searchLower);
                        }
                    }
                    return matches;
                }
                return true;
            })
            .sorted((f1, f2) -> {
                if (filter.getSortBy() != null) {
                    switch (filter.getSortBy()) {
                        case "date_asc":
                            return f1.getSubmissionDate().compareTo(f2.getSubmissionDate());
                        case "rating_desc":
                            if (f1.getRating() == null && f2.getRating() == null) return 0;
                            if (f1.getRating() == null) return 1;
                            if (f2.getRating() == null) return -1;
                            return f2.getRating().compareTo(f1.getRating());
                        case "rating_asc":
                            if (f1.getRating() == null && f2.getRating() == null) return 0;
                            if (f1.getRating() == null) return -1;
                            if (f2.getRating() == null) return 1;
                            return f1.getRating().compareTo(f2.getRating());
                        default:
                            return f2.getSubmissionDate().compareTo(f1.getSubmissionDate());
                    }
                }
                return f2.getSubmissionDate().compareTo(f1.getSubmissionDate());
            })
            .collect(Collectors.toList());
        
        return filteredFeedback.stream()
            .map(this::convertToEnhancedDTO)
            .collect(Collectors.toList());
    }
    
    @Override
    public FeedbackStatisticsDTO getFeedbackStatistics() {
        FeedbackStatisticsDTO stats = new FeedbackStatisticsDTO();
        List<Feedback> allFeedback = feedbackRepository.findAll();
        stats.setTotalFeedback((long) allFeedback.size());
        
        Map<FeedbackStatus, Long> statusCounts = allFeedback.stream()
            .collect(Collectors.groupingBy(Feedback::getStatus, Collectors.counting()));
        
        stats.setSubmittedCount(statusCounts.getOrDefault(FeedbackStatus.SUBMITTED, 0L));
        stats.setReviewedCount(statusCounts.getOrDefault(FeedbackStatus.REVIEWED, 0L));
        stats.setRespondedCount(statusCounts.getOrDefault(FeedbackStatus.RESPONDED, 0L));
        stats.setReviewedCount(statusCounts.getOrDefault(FeedbackStatus.RESOLVED, 0L));
        
        Map<Category, Long> categoryCounts = allFeedback.stream()
            .collect(Collectors.groupingBy(Feedback::getCategory, Collectors.counting()));
        
        stats.setComplimentCount(categoryCounts.getOrDefault(Category.COMPLIMENT, 0L));
        stats.setSuggestionCount(categoryCounts.getOrDefault(Category.SUGGESTION, 0L));
        stats.setComplimentCount(categoryCounts.getOrDefault(Category.COMPLAINT, 0L));
        stats.setIssueCount(categoryCounts.getOrDefault(Category.ISSUE, 0L));
        
        List<Feedback> ratedFeedback = allFeedback.stream()
            .filter(f -> f.getRating() != null)
            .collect(Collectors.toList());
        
        stats.setRatedFeedbackCount((long) ratedFeedback.size());
        
        if (!ratedFeedback.isEmpty()) {
            double average = ratedFeedback.stream()
                .mapToInt(Feedback::getRating)
                .average()
                .orElse(0.0);
            stats.setAverageRating(Math.round(average * 10.0) / 10.0);
            
            Map<Integer, Long> ratingCounts = ratedFeedback.stream()
                .collect(Collectors.groupingBy(Feedback::getRating, Collectors.counting()));
            
            for (int i = 1; i <= 5; i++) {
                stats.getRatingDistribution().put(i, ratingCounts.getOrDefault(i, 0L));
            }
            
            for (int i = 1; i <= 5; i++) {
                double percentage = ratedFeedback.isEmpty() ? 0 : 
                    (ratingCounts.getOrDefault(i, 0L) * 100.0) / ratedFeedback.size();
                stats.getRatingPercentages().put(i, Math.round(percentage * 10.0) / 10.0);
            }
        }
        
        LocalDateTime thirtyDaysAgo = LocalDateTime.now().minusDays(30);
        long recentCount = allFeedback.stream()
            .filter(f -> f.getSubmissionDate().isAfter(thirtyDaysAgo))
            .count();
        stats.setRatedFeedbackCount(recentCount);
        
        long anonymousCount = allFeedback.stream()
            .filter(Feedback::isAnonymous)
            .count();
        stats.setAnonymousCount(anonymousCount);
        stats.setNamedCount(allFeedback.size() - anonymousCount);
        
        return stats;
    }
    
    @Override
    public List<FeedbackDTO> getRecentFeedback(int limit) {
        List<Feedback> allFeedback = feedbackRepository.findAll();
        return allFeedback.stream()
            .sorted((f1, f2) -> f2.getSubmissionDate().compareTo(f1.getSubmissionDate()))
            .limit(limit)
            .map(this::convertToEnhancedDTO)
            .collect(Collectors.toList());
    }
    
    @Override
    public List<FeedbackDTO> getFeedbackWithRatingsOnly() {
        List<Feedback> allFeedback = feedbackRepository.findAll();
        return allFeedback.stream()
            .filter(f -> f.getRating() != null)
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }
    
    @Override
    public Map<String, Object> getFeedbackAnalytics(LocalDateTime startDate, LocalDateTime endDate) {
        Map<String, Object> analytics = new HashMap<>();
        List<Feedback> allFeedback = feedbackRepository.findAll();
        
        List<Feedback> filteredFeedback = allFeedback.stream()
            .filter(f -> !f.getSubmissionDate().isBefore(startDate) && !f.getSubmissionDate().isAfter(endDate))
            .collect(Collectors.toList());
        
        analytics.put("totalFeedback", (long) filteredFeedback.size());
        analytics.put("averageRating", getAverageRatingInRange(filteredFeedback));
        analytics.put("categoryDistribution", getCategoryDistribution(filteredFeedback));
        analytics.put("statusDistribution", getStatusDistribution(filteredFeedback));
        
        return analytics;
    }
    
    private double getAverageRatingInRange(List<Feedback> feedbacks) {
        List<Feedback> ratedFeedbacks = feedbacks.stream()
            .filter(f -> f.getRating() != null)
            .collect(Collectors.toList());
        
        if (ratedFeedbacks.isEmpty()) {
            return 0.0;
        }
        
        return ratedFeedbacks.stream()
            .mapToInt(Feedback::getRating)
            .average()
            .orElse(0.0);
    }
    
    private Map<String, Long> getCategoryDistribution(List<Feedback> feedbacks) {
        return feedbacks.stream()
            .collect(Collectors.groupingBy(
                f -> f.getCategory().name(),
                Collectors.counting()
            ));
    }
    
    private Map<String, Long> getStatusDistribution(List<Feedback> feedbacks) {
        return feedbacks.stream()
            .collect(Collectors.groupingBy(
                f -> f.getStatus().name(),
                Collectors.counting()
            ));
    }
    
    private FeedbackDTO convertToEnhancedDTO(Feedback feedback) {
        FeedbackResponseDTO dto = convertToDTO(feedback);
        dto.setFormattedDate(formatDate(feedback.getSubmissionDate()));
        
        if (feedback.getRating() != null) {
            dto.setRating(generateStarRating(feedback.getRating()));
        }
        
        if (feedback.getUserId() != null) {
            Optional<User> userOpt = userRepository.findById(feedback.getUserId());
            if (userOpt.isPresent()) {
                User user = userOpt.get();
                switch (user.getRole()) {
                    case PU:
                        dto.setUserType("Public User");
                        break;
                    case PO:
                        dto.setUserType("Police Officer");
                        break;
                    case SW:
                        dto.setUserType("Social Worker");
                        break;
                    case ADMIN:
                        dto.setUserType("Admin");
                        break;
                }
            }
        } else if (feedback.isAnonymous()) {
            dto.setUserType("Anonymous User");
        }
        
        if (feedback.getCaseId() != null) {
            Optional<Case> caseOpt = caseRepository.findById(feedback.getCaseId());
            if (caseOpt.isPresent()) {
                Case caseEntity = caseOpt.get();
                dto.setCaseTitle("Case: " + caseEntity.getCaseType() + " - " + caseEntity.getLocation());
                if (caseEntity.getAssignedOfficerId() != null) {
                    Optional<User> officerOpt = userRepository.findById(caseEntity.getAssignedOfficerId());
                    if (officerOpt.isPresent()) {
                        User officer = officerOpt.get();
                        dto.setAssignedToName(officer.getFullName());
                        dto.setAssignedToRole("Police Officer");
                    }
                }
            }
        } else if (feedback.getHelpRequestId() != null) {
            Optional<HelpRequest> helpRequestOpt = helpRequestRepository.findById(feedback.getHelpRequestId());
            if (helpRequestOpt.isPresent()) {
                HelpRequest helpRequest = helpRequestOpt.get();
                dto.setCaseTitle("Help Request: " + helpRequest.getHelpType() + " - " + helpRequest.getLocation());
                if (helpRequest.getAssignedWorkerId() != null) {
                    Optional<User> workerOpt = userRepository.findById(helpRequest.getAssignedWorkerId());
                    if (workerOpt.isPresent()) {
                        User worker = workerOpt.get();
                        dto.setAssignedToName(worker.getFullName());
                        dto.setAssignedToRole("Social Worker");
                    }
                }
            }
        }
        
        if (feedback.getAdminResponse() != null && !feedback.getAdminResponse().isEmpty()) {
            dto.setResponseStatus("Responded");
        } else if (feedback.getStatus() == FeedbackStatus.REVIEWED) {
            dto.setResponseStatus("Reviewed");
        } else {
            dto.setResponseStatus("Pending Response");
        }
        
        return dto;
    }
    
    private String formatDate(LocalDateTime date) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MMMM dd, yyyy", Locale.ENGLISH);
        return date.format(formatter);
    }
    
    private String generateStarRating(int rating) {
        StringBuilder stars = new StringBuilder();
        for (int i = 0; i < 5; i++) {
            if (i < rating) {
                stars.append("★");
            } else {
                stars.append("☆");
            }
        }
        return stars.toString();
    }
    
    private FeedbackDTO convertToDTO(Feedback feedback) {
        FeedbackDTO dto = new FeedbackDTO();
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
        dto.setResponseStatus(feedback.getRespondedBy());
        dto.setResponseStatus(feedback.getResponseDate());
        dto.setSubmissionDate(feedback.getSubmissionDate());
        dto.setLastUpdated(feedback.getLastUpdated());
        
        if (feedback.getUserId() != null && !feedback.isAnonymous()) {
            Optional<User> user = userRepository.findById(feedback.getUserId());
            user.ifPresent(u -> dto.setUserType(u.getFullName()));
        } else if (feedback.isAnonymous()) {
            dto.setUserType("Anonymous User");
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
        System.out.println("Feedback status update notification sent to user: " + feedback.getUserId());
        System.out.println("Feedback ID: " + feedback.getId());
        System.out.println("New Status: " + status);
    }
    
    private void notifyUserResponse(Feedback feedback, String response) {
        System.out.println("Feedback response notification sent to user: " + feedback.getUserId());
        System.out.println("Feedback ID: " + feedback.getId());
        System.out.println("Admin Response: " + response.substring(0, Math.min(50, response.length())) + "...");
    }
}