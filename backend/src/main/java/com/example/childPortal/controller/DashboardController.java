package com.example.childPortal.controller;

import com.example.childPortal.dto.CaseDTO;
import com.example.childPortal.dto.HelpRequestDTO;
import com.example.childPortal.dto.ServiceOfferDTO;
import com.example.childPortal.model.Case.CaseStatus;
import com.example.childPortal.model.Feedback;
import com.example.childPortal.model.HelpRequest.RequestStatus;
import com.example.childPortal.model.ServiceOffer.OfferStatus;
import com.example.childPortal.repository.FeedbackRepository;
import com.example.childPortal.repository.HelpRequestRepository;
import com.example.childPortal.service.CaseService;
import com.example.childPortal.service.HelpRequestService;
import com.example.childPortal.service.ServiceOfferService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin(origins = "*")
public class DashboardController {

        @Autowired
        private CaseService caseService;

        @Autowired
        private HelpRequestService helpRequestService;

        @Autowired
        private ServiceOfferService serviceOfferService;

        @Autowired
        private HelpRequestRepository helpRequestRepository;

        @Autowired
        private FeedbackRepository feedbackRepository;

        @GetMapping("/stats")
        public ResponseEntity<Map<String, Object>> getDashboardStats(@AuthenticationPrincipal String userId) {
                Map<String, Object> stats = new HashMap<>();

                List<CaseDTO> userCases = caseService.getCasesByReporter(userId);
                long activeCases = userCases.stream()
                                .filter(c -> c.getStatus() == CaseStatus.REPORTED ||
                                                c.getStatus() == CaseStatus.UNDER_REVIEW ||
                                                c.getStatus() == CaseStatus.ASSIGNED ||
                                                c.getStatus() == CaseStatus.INVESTIGATING)
                                .count();
                long resolvedCases = userCases.stream()
                                .filter(c -> c.getStatus() == CaseStatus.RESOLVED || c.getStatus() == CaseStatus.CLOSED)
                                .count();

                List<HelpRequestDTO> userRequests = helpRequestService.getHelpRequestsByRequester(userId);
                long pendingRequests = userRequests.stream()
                                .filter(r -> r.getStatus() == RequestStatus.REQUESTED ||
                                                r.getStatus() == RequestStatus.UNDER_REVIEW)
                                .count();
                long activeRequests = userRequests.stream()
                                .filter(r -> r.getStatus() == RequestStatus.ASSIGNED ||
                                                r.getStatus() == RequestStatus.IN_PROGRESS)
                                .count();

                // Pending offers: help requests with applied service package awaiting user response
                long pendingOffers = userRequests.stream()
                                .filter(r -> r.getAppliedPackage() != null &&
                                                ("PENDING".equals(r.getAppliedPackageStatus()) || r.getAppliedPackageStatus() == null))
                                .count();
                // Accepted services: help requests with accepted package + legacy ServiceOffer accepted count
                long acceptedServices = userRequests.stream()
                                .filter(r -> r.getAppliedPackage() != null && "ACCEPTED".equals(r.getAppliedPackageStatus()))
                                .count();
                List<ServiceOfferDTO> userOffers = serviceOfferService.getOffersForUser(userId);
                acceptedServices += userOffers.stream()
                                .filter(o -> o.getOfferedToUserId() != null &&
                                                o.getOfferedToUserId().equals(userId) &&
                                                o.getStatus() == OfferStatus.ACCEPTED)
                                .count();

                stats.put("activeCases", activeCases);
                stats.put("pendingRequests", pendingRequests);
                stats.put("pendingOffers", pendingOffers);
                stats.put("totalCases", (long) userCases.size());
                stats.put("totalRequests", (long) userRequests.size());
                long totalOffersFromRequests = userRequests.stream()
                                .filter(r -> r.getAppliedPackage() != null)
                                .count();
                long totalOffersFromServiceOffers = userOffers.stream()
                                .filter(o -> o.getOfferedToUserId() != null && o.getOfferedToUserId().equals(userId))
                                .count();
                stats.put("totalOffers", totalOffersFromRequests + totalOffersFromServiceOffers);
                stats.put("resolvedCases", resolvedCases);
                stats.put("activeRequests", activeRequests);
                stats.put("acceptedServices", acceptedServices);

                long anonymousCases = userCases.stream()
                                .filter(c -> c.isAnonymous())
                                .count();
                long anonymousRequests = userRequests.stream()
                                .filter(r -> r.isAnonymous())
                                .count();
                stats.put("anonymousCases", anonymousCases);
                stats.put("anonymousRequests", anonymousRequests);
                stats.put("totalAnonymous", anonymousCases + anonymousRequests);

                return ResponseEntity.ok(stats);
        }

        @GetMapping("/social-worker/completed-requests")
        public ResponseEntity<List<Map<String, Object>>> getSocialWorkerCompletedRequests(
                        @AuthenticationPrincipal String userId) {
                if (userId == null || "anonymousUser".equals(userId)) {
                        return ResponseEntity.status(401).build();
                }

                var closedRequests = helpRequestRepository.findByAssignedWorkerId(userId).stream()
                                .filter(r -> r.getStatus() == RequestStatus.CLOSED
                                                || r.getStatus() == RequestStatus.ARCHIVED)
                                .toList();

                Set<String> requestIds = closedRequests.stream().map(r -> r.getId()).collect(Collectors.toSet());
                Map<String, Feedback> latestFeedbackByRequest = requestIds.isEmpty() ? Map.of()
                                : feedbackRepository.findByHelpRequestIdIn(List.copyOf(requestIds))
                                                .stream()
                                                .collect(Collectors.toMap(
                                                                Feedback::getHelpRequestId,
                                                                f -> f,
                                                                (a, b) -> {
                                                                        var aTime = a.getSubmissionDate();
                                                                        var bTime = b.getSubmissionDate();
                                                                        if (aTime == null)
                                                                                return b;
                                                                        if (bTime == null)
                                                                                return a;
                                                                        return bTime.isAfter(aTime) ? b : a;
                                                                }));

                List<Map<String, Object>> rows = closedRequests.stream().map(r -> {
                        Feedback feedback = latestFeedbackByRequest.get(r.getId());
                        Map<String, Object> row = new HashMap<>();
                        row.put("id", r.getId());
                        row.put("requestId", r.getTrackingId());
                        row.put("type", r.getHelpType() != null ? r.getHelpType().name() : null);
                        row.put("rating", feedback != null ? feedback.getRating() : null);
                        row.put("hasFeedback", feedback != null);
                        row.put("closedDate", r.getClosedDate() != null ? r.getClosedDate() : r.getCompletionDate());
                        return row;
                }).toList();

                return ResponseEntity.ok(rows);
        }
}
