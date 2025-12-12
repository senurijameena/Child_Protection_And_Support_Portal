package com.example.childPortal.service.impl;

import com.example.childPortal.dto.*;
import com.example.childPortal.model.*;
import com.example.childPortal.model.Feedback.Category;
import com.example.childPortal.model.Feedback.FeedbackStatus;
import com.example.childPortal.model.Feedback.FeedbackType;
import com.example.childPortal.model.Feedback.Privacy;
import com.example.childPortal.repository.*;
import com.example.childPortal.service.FeedbackService;
import org.springframework.beans.factory.annotation.Autowired;
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

    @Override
    public FeedbackResponseDTO submitFeedback(FeedbackDTO feedbackDTO, String userId) {
        try {
            Feedback feedback = new Feedback();

            feedback.setUserId(userId);
            feedback.setCaseId(feedbackDTO.getCaseId());
            feedback.setHelpRequestId(feedbackDTO.getHelpRequestId());
            feedback.setServiceOfferId(feedbackDTO.getServiceOfferId());
            feedback.setFeedbackType(feedbackDTO.getFeedbackType());
            feedback.setFeedbackText(feedbackDTO.getFeedbackText());

            // rating stored as String in model
            if (feedbackDTO.getRatingStars() != null) {
                feedback.setRating(Integer.toString(feedbackDTO.getRatingStars()));
            }

            feedback.setCategory(feedbackDTO.getCategory());
            feedback.setPrivacy(feedbackDTO.getPrivacy());
            feedback.setAnonymous(feedbackDTO.isAnonymous());
            feedback.setStatus(FeedbackStatus.SUBMITTED);
            feedback.setSubmissionDate(LocalDateTime.now());
            feedback.setLastUpdated(LocalDateTime.now());

            Feedback saved = feedbackRepository.save(feedback);

            notifyAdmins(saved);

            return new FeedbackResponseDTO(saved.getId(), "Feedback submitted successfully", true);
        } catch (Exception e) {
            return new FeedbackResponseDTO(null, "Failed to submit feedback: " + e.getMessage(), false);
        }
    }

    @Override
    public FeedbackResponseDTO getFeedbackById(String feedbackId) {
        return feedbackRepository.findById(feedbackId).map(this::convertToResponseDTO).orElse(null);
    }

    @Override
    public List<FeedbackResponseDTO> getFeedbackByUser(String userId) {
        return feedbackRepository.findByUserId(userId).stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<FeedbackResponseDTO> getFeedbackByCase(String caseId) {
        return feedbackRepository.findByCaseId(caseId).stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<FeedbackResponseDTO> getAllFeedback() {
        return feedbackRepository.findAll().stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List getFeedbackByType(FeedbackType type) {
        return feedbackRepository.findByFeedbackType(type).stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List getFeedbackByCategory(Category category) {
        return feedbackRepository.findByCategory(category).stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<FeedbackResponseDTO> getFeedbackByStatus(FeedbackStatus status) {
        return feedbackRepository.findByStatus(status).stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    public FeedbackResponseDTO updateFeedbackStatus(String feedbackId, FeedbackStatus status) {
        Optional<Feedback> opt = feedbackRepository.findById(feedbackId);
        if (opt.isEmpty()) return null;
        Feedback f = opt.get();
        f.setStatus(status);
        f.setLastUpdated(LocalDateTime.now());
        Feedback saved = feedbackRepository.save(f);

        if (status == FeedbackStatus.RESPONDED || status == FeedbackStatus.RESOLVED) {
            notifyUserStatusUpdate(saved, status);
        }
        return convertToResponseDTO(saved);
    }

    @Override
    public FeedbackResponseDTO respondToFeedback(String feedbackId, String response, String adminId) {
        Optional<Feedback> opt = feedbackRepository.findById(feedbackId);
        if (opt.isEmpty()) return null;
        Feedback f = opt.get();
        f.setAdminResponse(response);
        f.setRespondedBy(adminId);
        f.setResponseDate(LocalDateTime.now());
        f.setStatus(FeedbackStatus.RESPONDED);
        f.setLastUpdated(LocalDateTime.now());
        Feedback saved = feedbackRepository.save(f);

        notifyUserResponse(saved, response);
        return convertToResponseDTO(saved);
    }

    @Override
    public boolean deleteFeedback(String feedbackId) {
        if (!feedbackRepository.existsById(feedbackId)) return false;
        feedbackRepository.deleteById(feedbackId);
        return true;
    }

    // ------------------------
    // Analytics & helpers
    // ------------------------

    @Override
    public Double getAverageRating() {
        List<Feedback> all = feedbackRepository.findAll();
        List<Integer> ratings = all.stream()
                .map(Feedback::getRating)
                .filter(Objects::nonNull)
                .map(s -> {
                    try { return Integer.parseInt(s); } catch (NumberFormatException e) { return null; }
                })
                .filter(Objects::nonNull)
                .collect(Collectors.toList());
        if (ratings.isEmpty()) return 0.0;
        double avg = ratings.stream().mapToInt(Integer::intValue).average().orElse(0.0);
        return Math.round(avg * 10.0) / 10.0;
    }

    @Override
    public List<FeedbackResponseDTO> getPublicFeedback() {
        return feedbackRepository.findByPrivacy(Privacy.PUBLIC).stream()
                .map(this::convertToResponseDTO)
                .map(dto -> {
                    if (dto.isAnonymous()) dto.setUserName("Anonymous User");
                    else if (dto.getUserName() != null) {
                        // abbreviate example: "John D."
                        String[] p = dto.getUserName().split(" ");
                        if (p.length > 1) dto.setUserName(p[0] + " " + p[1].charAt(0) + ".");
                    }
                    return dto;
                })
                .collect(Collectors.toList());
    }

    @Override
    public List<FeedbackDTO> getFeedbackForDashboard(FeedbackFilterDTO filter) {
        List<Feedback> candidates = getFilteredFeedback(filter);

        // apply additional in-memory filters (date ranges, ratings, search text)
        List<Feedback> filtered = candidates.stream().filter(fb -> {
            if (filter.getStartDate() != null && fb.getSubmissionDate() != null && fb.getSubmissionDate().isBefore(filter.getStartDate()))
                return false;
            if (filter.getEndDate() != null && fb.getSubmissionDate() != null && fb.getSubmissionDate().isAfter(filter.getEndDate()))
                return false;
            if (filter.isAnonymousOnly() && !fb.isAnonymous()) return false;

            if (filter.getMinRating() != null) {
                Integer r = parseRating(fb);
                if (r == null || r < filter.getMinRating()) return false;
            }
            if (filter.getMaxRating() != null) {
                Integer r = parseRating(fb);
                if (r == null || r > filter.getMaxRating()) return false;
            }

            if (filter.getSearchText() != null && !filter.getSearchText().isBlank()) {
                String s = filter.getSearchText().toLowerCase();
                boolean matches = false;
                if (fb.getFeedbackText() != null && ((String) fb.getFeedbackText()).toLowerCase().contains(s)) matches = true;
                if (!matches && fb.getCaseId() != null) {
                    Optional<Case> c = caseRepository.findById(fb.getCaseId());
                    if (c.isPresent()) {
                        Case ce = c.get();
                        if (ce.getCaseDescription() != null && ce.getCaseDescription().toLowerCase().contains(s)) matches = true;
                        if (!matches && ce.getLocation() != null && ce.getLocation().toLowerCase().contains(s)) matches = true;
                    }
                }
                if (!matches && fb.getUserId() != null) {
                    Optional<User> u = userRepository.findById(fb.getUserId());
                    if (u.isPresent() && u.get().getFullName() != null && u.get().getFullName().toLowerCase().contains(s)) matches = true;
                }
                return matches;
            }
            return true;
        }).collect(Collectors.toList());

        // sorting
        if ("date_asc".equals(filter.getSortBy())) {
            filtered.sort(Comparator.comparing(Feedback::getSubmissionDate, Comparator.nullsLast(Comparator.naturalOrder())));
        } else if ("rating_desc".equals(filter.getSortBy())) {
            filtered.sort((a, b) -> Integer.compare(Optional.ofNullable(parseRating(b)).orElse(-1),
                    Optional.ofNullable(parseRating(a)).orElse(-1)));
        } else if ("rating_asc".equals(filter.getSortBy())) {
            filtered.sort((a, b) -> Integer.compare(Optional.ofNullable(parseRating(a)).orElse(-1),
                    Optional.ofNullable(parseRating(b)).orElse(-1)));
        } else {
            filtered.sort(Comparator.comparing(Feedback::getSubmissionDate, Comparator.nullsLast(Comparator.reverseOrder())));
        }

        return filtered.stream().map(this::convertToEnhancedDTO).collect(Collectors.toList());
    }

    private Integer parseRating(Feedback f) {
        try {
            return f.getRating() == null ? null : Integer.parseInt(f.getRating());
        } catch (NumberFormatException ex) {
            return null;
        }
    }

    private List<Feedback> getFilteredFeedback(FeedbackFilterDTO filter) {
        if (filter == null) return feedbackRepository.findAll();
        if (filter.getCaseId() != null) return feedbackRepository.findByCaseId(filter.getCaseId());
        if (filter.getHelpRequestId() != null) return feedbackRepository.findByHelpRequestId(filter.getHelpRequestId());
        if (filter.getUserId() != null) return feedbackRepository.findByUserId(filter.getUserId());
        if (filter.getFeedbackType() != null) return feedbackRepository.findByFeedbackType(filter.getFeedbackType());
        if (filter.getCategory() != null) return feedbackRepository.findByCategory(filter.getCategory());
        if (filter.getStatus() != null) return feedbackRepository.findByStatus(filter.getStatus());
        if (filter.getRating() != null) return feedbackRepository.findByRating(filter.getRating().toString());
        return feedbackRepository.findAll();
    }

    @Override
    public FeedbackStatisticsDTO getFeedbackStatistics() {
        FeedbackStatisticsDTO stats = new FeedbackStatisticsDTO();
        List<Feedback> all = feedbackRepository.findAll();
        stats.setTotalFeedback((long) all.size());

        Map<FeedbackStatus, Long> statusCounts = all.stream()
                .collect(Collectors.groupingBy(Feedback::getStatus, Collectors.counting()));

        stats.setSubmittedCount(statusCounts.getOrDefault(FeedbackStatus.SUBMITTED, 0L));
        stats.setReviewedCount(statusCounts.getOrDefault(FeedbackStatus.REVIEWED, 0L));
        stats.setRespondedCount(statusCounts.getOrDefault(FeedbackStatus.RESPONDED, 0L));
        stats.setResolvedCount(statusCounts.getOrDefault(FeedbackStatus.RESOLVED, 0L));

        Map<Category, Long> categoryCounts = all.stream()
                .collect(Collectors.groupingBy(Feedback::getCategory, Collectors.counting()));

        stats.setComplimentCount(categoryCounts.getOrDefault(Category.COMPLIMENT, 0L));
        stats.setSuggestionCount(categoryCounts.getOrDefault(Category.SUGGESTION, 0L));
        stats.setComplaintCount(categoryCounts.getOrDefault(Category.COMPLAINT, 0L));
        stats.setIssueCount(categoryCounts.getOrDefault(Category.ISSUE, 0L));

        List<Integer> ratings = all.stream()
                .map(Feedback::getRating)
                .filter(Objects::nonNull)
                .map(r -> {
                    try { return Integer.parseInt(r); } catch (NumberFormatException e) { return null; }
                })
                .filter(Objects::nonNull)
                .collect(Collectors.toList());

        stats.setRatedFeedbackCount((long) ratings.size());
        if (!ratings.isEmpty()) {
            double avg = ratings.stream().mapToInt(Integer::intValue).average().orElse(0.0);
            stats.setAverageRating(Math.round(avg * 10.0) / 10.0);

            Map<Integer, Long> ratingCounts = new HashMap<>();
            for (int i = 1; i <= 5; i++) ratingCounts.put(i, 0L);
            for (Integer r : ratings) ratingCounts.put(r, ratingCounts.getOrDefault(r, 0L) + 1);

            Map<Integer, Long> distribution = new HashMap<>();
            Map<Integer, Double> percentages = new HashMap<>();
            for (int i = 1; i <= 5; i++) {
                distribution.put(i, ratingCounts.getOrDefault(i, 0L));
                double pct = (ratings.isEmpty()) ? 0.0 : (ratingCounts.getOrDefault(i, 0L) * 100.0) / ratings.size();
                percentages.put(i, Math.round(pct * 10.0) / 10.0);
            }
            stats.setRatingDistribution(distribution);
            stats.setRatingPercentages(percentages);
        }

        LocalDateTime thirtyDaysAgo = LocalDateTime.now().minusDays(30);
        long recentCount = all.stream().filter(f -> f.getSubmissionDate() != null && f.getSubmissionDate().isAfter(thirtyDaysAgo)).count();
        stats.setRatedFeedbackCount(recentCount);

        long anonymous = all.stream().filter(Feedback::isAnonymous).count();
        stats.setAnonymousCount(anonymous);
        stats.setNamedCount(all.size() - anonymous);

        return stats;
    }

    @Override
    public List<FeedbackDTO> getRecentFeedback(int limit) {
        return feedbackRepository.findAll().stream()
                .sorted(Comparator.comparing(Feedback::getSubmissionDate, Comparator.nullsLast(Comparator.reverseOrder())))
                .limit(limit)
                .map(this::convertToEnhancedDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<FeedbackDTO> getFeedbackWithRatingsOnly() {
        return feedbackRepository.findAll().stream()
                .filter(f -> f.getRating() != null && !f.getRating().isEmpty())
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public Map<String, Object> getFeedbackAnalytics(LocalDateTime startDate, LocalDateTime endDate) {
        Map<String, Object> analytics = new HashMap<>();
        List<Feedback> all = feedbackRepository.findAll();
        List<Feedback> filtered = all.stream()
                .filter(f -> f.getSubmissionDate() != null &&
                        !f.getSubmissionDate().isBefore(startDate) &&
                        !f.getSubmissionDate().isAfter(endDate))
                .collect(Collectors.toList());

        analytics.put("totalFeedback", (long) filtered.size());
        analytics.put("averageRating", getAverageRatingInRange(filtered));
        analytics.put("categoryDistribution", getCategoryDistribution(filtered));
        analytics.put("statusDistribution", getStatusDistribution(filtered));
        return analytics;
    }

    private double getAverageRatingInRange(List<Feedback> feedbacks) {
        List<Integer> ratings = feedbacks.stream()
                .map(Feedback::getRating)
                .filter(Objects::nonNull)
                .map(s -> {
                    try { return Integer.parseInt(s); } catch (NumberFormatException e) { return null; }
                })
                .filter(Objects::nonNull)
                .collect(Collectors.toList());
        if (ratings.isEmpty()) return 0.0;
        return ratings.stream().mapToInt(Integer::intValue).average().orElse(0.0);
    }

    private Map<String, Long> getCategoryDistribution(List<Feedback> feedbacks) {
        return feedbacks.stream().collect(Collectors.groupingBy(
                f -> f.getCategory() == null ? "UNKNOWN" : f.getCategory().name(),
                Collectors.counting()
        ));
    }

    private Map<String, Long> getStatusDistribution(List<Feedback> feedbacks) {
        return feedbacks.stream().collect(Collectors.groupingBy(
                f -> f.getStatus() == null ? "UNKNOWN" : f.getStatus().name(),
                Collectors.counting()
        ));
    }



    private FeedbackDTO convertToEnhancedDTO(Feedback feedback) {
        FeedbackDTO dto = convertToDTO(feedback);
        if (feedback.getSubmissionDate() != null) dto.setFormattedDate(formatDate(feedback.getSubmissionDate()));
        Integer rating = parseRating(feedback);
        if (rating != null) dto.setRatingStars(generateStarRating(rating));
        if (feedback.getUserId() != null && !feedback.isAnonymous()) {
            userRepository.findById(feedback.getUserId()).ifPresent(u -> dto.setUserType(u.getFullName()));
        } else if (feedback.isAnonymous()) {
            dto.setUserType("Anonymous User");
        }

        if (feedback.getCaseId() != null) {
            caseRepository.findById(feedback.getCaseId()).ifPresent(c -> {
                dto.setCaseTitle("Case: " + c.getCaseType() + " - " + c.getLocation());
                if (c.getAssignedOfficerId() != null) userRepository.findById(c.getAssignedOfficerId()).ifPresent(off -> {
                    dto.setAssignedToName(off.getFullName());
                    dto.setAssignedToRole("Police Officer");
                });
            });
        } else if (feedback.getHelpRequestId() != null) {
            helpRequestRepository.findById(feedback.getHelpRequestId()).ifPresent(hr -> {
                dto.setCaseTitle("Help Request: " + hr.getHelpType() + " - " + hr.getLocation());
                if (hr.getAssignedWorkerId() != null) userRepository.findById(hr.getAssignedWorkerId()).ifPresent(w -> {
                    dto.setAssignedToName(w.getFullName());
                    dto.setAssignedToRole("Social Worker");
                });
            });
        }

        if (feedback.getAdminResponse() != null && !feedback.getAdminResponse().isEmpty()) dto.setResponseStatus("Responded");
        else if (feedback.getStatus() == FeedbackStatus.REVIEWED) dto.setResponseStatus("Reviewed");
        else dto.setResponseStatus("Pending Response");

        return dto;
    }

    private String formatDate(LocalDateTime date) {
        DateTimeFormatter f = DateTimeFormatter.ofPattern("MMMM dd, yyyy", Locale.ENGLISH);
        return date.format(f);
    }

    private String generateStarRating(int rating) {
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < 5; i++) sb.append(i < rating ? "★" : "☆");
        return sb.toString();
    }

    private FeedbackResponseDTO convertToResponseDTO(Feedback feedback) {
        FeedbackResponseDTO dto = new FeedbackResponseDTO();
        dto.setId(feedback.getId());
        dto.setUserId(feedback.getUserId());
        dto.setCaseId(feedback.getCaseId());
        dto.setHelpRequestId(feedback.getHelpRequestId());
        dto.setServiceOfferId(feedback.getServiceOfferId());
        dto.setFeedbackType(feedback.getFeedbackType());
        dto.setFeedbackType(feedback.getFeedbackText());

        if (feedback.getRating() != null && !feedback.getRating().isEmpty()) {
            try { dto.setRating(Integer.parseInt(feedback.getRating())); } catch (NumberFormatException e) { dto.setRating(null); }
        }

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
            userRepository.findById(feedback.getUserId()).ifPresent(u -> dto.setUserName(u.getFullName()));
        } else if (feedback.isAnonymous()) dto.setUserName("Anonymous User");

        if (feedback.getCaseId() != null) {
            caseRepository.findById(feedback.getCaseId()).ifPresent(c -> {
                dto.setCaseTitle("Case #" + c.getTrackingId());
                dto.setTrackingId(c.getTrackingId());
            });
        } else if (feedback.getHelpRequestId() != null) {
            dto.setTrackingId("RH-" + feedback.getHelpRequestId().substring(0, Math.min(4, feedback.getHelpRequestId().length())));
        }

        return dto;
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

        if (feedback.getRating() != null && !feedback.getRating().isEmpty()) {
            try { dto.setRatingStars(Integer.parseInt(feedback.getRating())); } catch (NumberFormatException e) { dto.setRatingStars(null); }
        }

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
            userRepository.findById(feedback.getUserId()).ifPresent(u -> dto.setUserType(u.getFullName()));
        } else if (feedback.isAnonymous()) dto.setUserType("Anonymous User");

        if (feedback.getCaseId() != null) {
            caseRepository.findById(feedback.getCaseId()).ifPresent(c -> {
                dto.setCaseTitle("Case #" + c.getTrackingId());
                dto.setTrackingId(c.getTrackingId());
            });
        } else if (feedback.getHelpRequestId() != null) {
            dto.setTrackingId("RH-" + feedback.getHelpRequestId().substring(0, Math.min(4, feedback.getHelpRequestId().length())));
        }

        return dto;
    }

    // ------------------------
    // Notifications (stubs)
    // ------------------------

    private void notifyAdmins(Feedback f) {
        // TODO: integrate with email/push system
        System.out.println("Notify admins: new feedback " + f.getId() + " type=" + f.getFeedbackType());
    }

    private void notifyUserStatusUpdate(Feedback f, FeedbackStatus status) {
        System.out.println("Notify user " + f.getUserId() + " status updated to " + status);
    }

    private void notifyUserResponse(Feedback f, String response) {
        System.out.println("Notify user " + f.getUserId() + " admin responded: " + (response == null ? "" : response.substring(0, Math.min(80, response.length()))));
    }
}
