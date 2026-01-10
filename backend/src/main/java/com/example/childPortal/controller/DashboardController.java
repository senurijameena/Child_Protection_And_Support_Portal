package com.example.childPortal.controller;

import com.example.childPortal.dto.CaseDTO;
import com.example.childPortal.dto.HelpRequestDTO;
import com.example.childPortal.dto.ServiceOfferDTO;
import com.example.childPortal.model.Case.CaseStatus;
import com.example.childPortal.model.HelpRequest.RequestStatus;
import com.example.childPortal.model.ServiceOffer.OfferStatus;
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

                List<ServiceOfferDTO> userOffers = serviceOfferService.getOffersForUser(userId);

                long pendingOffers = userOffers.stream()
                                .filter(o -> o.getOfferedToUserId() != null &&
                                                o.getOfferedToUserId().equals(userId) &&
                                                o.getStatus() == OfferStatus.PENDING)
                                .count();
                long acceptedServices = userOffers.stream()
                                .filter(o -> o.getOfferedToUserId() != null &&
                                                o.getOfferedToUserId().equals(userId) &&
                                                o.getStatus() == OfferStatus.ACCEPTED)
                                .count();

                stats.put("activeCases", activeCases);
                stats.put("pendingRequests", pendingRequests);
                stats.put("pendingOffers", pendingOffers);
                stats.put("totalCases", (long) userCases.size());
                stats.put("totalRequests", (long) userRequests.size());
                stats.put("totalOffers", (long) userOffers.stream()
                                .filter(o -> o.getOfferedToUserId() != null && o.getOfferedToUserId().equals(userId))
                                .count());
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
}
