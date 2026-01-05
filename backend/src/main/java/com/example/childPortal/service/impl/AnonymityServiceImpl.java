package com.example.childPortal.service.impl;

import com.example.childPortal.dto.AnonymityStatsDTO;
import com.example.childPortal.dto.ConversionRequestDTO;
import com.example.childPortal.model.Case;
import com.example.childPortal.model.Case.CaseStatus;
import com.example.childPortal.model.HelpRequest;
import com.example.childPortal.model.HelpRequest.RequestStatus;
import com.example.childPortal.repository.CaseRepository;
import com.example.childPortal.repository.HelpRequestRepository;
import com.example.childPortal.service.AnonymityService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class AnonymityServiceImpl implements AnonymityService {

    @Autowired
    private CaseRepository caseRepository;

    @Autowired
    private HelpRequestRepository helpRequestRepository;

    @Override
    public AnonymityStatsDTO getAnonymityStats(String userId) {
        AnonymityStatsDTO stats = new AnonymityStatsDTO();

        List<Case> userCases = caseRepository.findByReporterUserId(userId);
        List<HelpRequest> userRequests = helpRequestRepository.findByRequesterUserId(userId);

        long totalCases = userCases.size();
        long totalRequests = userRequests.size();
        stats.setTotalSubmissions(totalCases + totalRequests);

        long anonymousCases = userCases.stream().filter(Case::isAnonymous).count();
        long anonymousRequests = userRequests.stream().filter(HelpRequest::isAnonymous).count();
        stats.setAnonymousCases(anonymousCases);
        stats.setAnonymousHelpRequests(anonymousRequests);
        stats.setAnonymousSubmissions(anonymousCases + anonymousRequests);
        stats.setRegisteredSubmissions((totalCases - anonymousCases) + (totalRequests - anonymousRequests));

        if (stats.getTotalSubmissions() > 0) {
            stats.setAnonymousPercentage((double) stats.getAnonymousSubmissions() / stats.getTotalSubmissions() * 100);
            stats.setRegisteredPercentage((double) stats.getRegisteredSubmissions() / stats.getTotalSubmissions() * 100);
        }

        double avgResponseAnonymous = calculateAverageResponseTime(userCases, userRequests, true);
        double avgResponseRegistered = calculateAverageResponseTime(userCases, userRequests, false);
        stats.setAverageResponseTimeAnonymous(avgResponseAnonymous);
        stats.setAverageResponseTimeRegistered(avgResponseRegistered);

        double resolutionRateAnonymous = calculateResolutionRate(userCases, userRequests, true);
        double resolutionRateRegistered = calculateResolutionRate(userCases, userRequests, false);
        stats.setResolutionRateAnonymous(resolutionRateAnonymous);
        stats.setResolutionRateRegistered(resolutionRateRegistered);

        int securityScore = calculateSecurityScore(userCases, userRequests);
        stats.setSecurityScore(securityScore);

        Map<String, Long> submissionsByType = new HashMap<>();
        submissionsByType.put("Cases", totalCases);
        submissionsByType.put("Help Requests", totalRequests);
        submissionsByType.put("Anonymous Cases", anonymousCases);
        submissionsByType.put("Anonymous Requests", anonymousRequests);
        stats.setSubmissionsByType(submissionsByType);

        return stats;
    }

    private double calculateAverageResponseTime(List<Case> cases, List<HelpRequest> requests, boolean anonymous) {
        long totalDays = 0;
        long count = 0;

        for (Case c : cases) {
            if (c.isAnonymous() == anonymous && c.getReportDate() != null && c.getLastUpdated() != null) {
                Duration duration = Duration.between(c.getReportDate(), c.getLastUpdated());
                totalDays += duration.toDays();
                count++;
            }
        }

        for (HelpRequest r : requests) {
            if (r.isAnonymous() == anonymous && r.getRequestDate() != null && r.getLastUpdated() != null) {
                Duration duration = Duration.between(r.getRequestDate(), r.getLastUpdated());
                totalDays += duration.toDays();
                count++;
            }
        }

        return count > 0 ? (double) totalDays / count : 0.0;
    }

    private double calculateResolutionRate(List<Case> cases, List<HelpRequest> requests, boolean anonymous) {
        long total = 0;
        long resolved = 0;

        for (Case c : cases) {
            if (c.isAnonymous() == anonymous) {
                total++;
                if (c.getStatus() == CaseStatus.RESOLVED || c.getStatus() == CaseStatus.CLOSED) {
                    resolved++;
                }
            }
        }

        for (HelpRequest r : requests) {
            if (r.isAnonymous() == anonymous) {
                total++;
                if (r.getStatus() == RequestStatus.COMPLETED) {
                    resolved++;
                }
            }
        }

        return total > 0 ? (double) resolved / total * 100 : 0.0;
    }

    private int calculateSecurityScore(List<Case> cases, List<HelpRequest> requests) {
        int score = 100;

        long registeredCount = cases.stream().filter(c -> !c.isAnonymous()).count() +
                             requests.stream().filter(r -> !r.isAnonymous()).count();
        score -= Math.min(registeredCount * 2, 30); // Max 30 points deduction

        long anonymousCount = cases.stream().filter(Case::isAnonymous).count() +
                             requests.stream().filter(HelpRequest::isAnonymous).count();
        score += Math.min(anonymousCount, 20); // Max 20 points bonus
        
        return Math.max(0, Math.min(100, score));
    }

    @Override
    @Transactional
    public boolean convertCaseToAnonymous(String caseId, String userId) {
        Optional<Case> caseOpt = caseRepository.findById(caseId);
        if (caseOpt.isPresent()) {
            Case caseEntity = caseOpt.get();
            if (caseEntity.getReporterUserId().equals(userId)) {
                caseEntity.setAnonymous(true);
                caseEntity.setReporterName("Anonymous Reporter");
                caseRepository.save(caseEntity);
                return true;
            }
        }
        return false;
    }

    @Override
    @Transactional
    public boolean convertCaseToRegistered(String caseId, String userId, ConversionRequestDTO request) {
        Optional<Case> caseOpt = caseRepository.findById(caseId);
        if (caseOpt.isPresent()) {
            Case caseEntity = caseOpt.get();

            if (caseEntity.getReporterUserId().equals(userId)) {
                caseEntity.setAnonymous(false);

                if (request.isRevealIdentity()) {


                }
                caseRepository.save(caseEntity);
                return true;
            }
        }
        return false;
    }

    @Override
    @Transactional
    public boolean convertHelpRequestToAnonymous(String requestId, String userId) {
        Optional<HelpRequest> requestOpt = helpRequestRepository.findById(requestId);
        if (requestOpt.isPresent()) {
            HelpRequest request = requestOpt.get();
            if (request.getRequesterUserId().equals(userId)) {
                request.setAnonymous(true);
                request.setRequesterName("Anonymous Requester");
                helpRequestRepository.save(request);
                return true;
            }
        }
        return false;
    }

    @Override
    @Transactional
    public boolean convertHelpRequestToRegistered(String requestId, String userId, ConversionRequestDTO conversionRequest) {
        Optional<HelpRequest> requestOpt = helpRequestRepository.findById(requestId);
        if (requestOpt.isPresent()) {
            HelpRequest request = requestOpt.get();
            if (request.getRequesterUserId().equals(userId)) {
                request.setAnonymous(false);

                if (conversionRequest.isRevealIdentity()) {

                }
                helpRequestRepository.save(request);
                return true;
            }
        }
        return false;
    }
}

