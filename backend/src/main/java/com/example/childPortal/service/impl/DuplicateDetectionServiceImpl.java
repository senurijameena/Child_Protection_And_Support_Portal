package com.example.childPortal.service.impl;

import com.example.childPortal.dto.DuplicateDetectionDTO;
import com.example.childPortal.model.Case;
import com.example.childPortal.model.HelpRequest;
import com.example.childPortal.repository.CaseRepository;
import com.example.childPortal.repository.HelpRequestRepository;
import com.example.childPortal.service.DuplicateDetectionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class DuplicateDetectionServiceImpl implements DuplicateDetectionService {

    @Autowired
    private CaseRepository caseRepository;
    
    @Autowired
    private HelpRequestRepository helpRequestRepository;

    @Override
    public List<DuplicateDetectionDTO> findDuplicateCases(String caseId) {
        Optional<Case> caseOpt = caseRepository.findById(caseId);
        if (caseOpt.isEmpty()) {
            return new ArrayList<>();
        }
        
        Case currentCase = caseOpt.get();
        List<Case> allCases = caseRepository.findAll();
        
        return allCases.stream()
            .filter(c -> !c.getId().equals(caseId)) // Exclude current case
            .map(c -> calculateCaseSimilarity(currentCase, c))
            .filter(dto -> dto.getSimilarityScore() >= 0.5) // Only return if similarity >= 50%
            .sorted((a, b) -> Double.compare(b.getSimilarityScore(), a.getSimilarityScore()))
            .collect(Collectors.toList());
    }

    @Override
    public List<DuplicateDetectionDTO> findDuplicateHelpRequests(String helpRequestId) {
        Optional<HelpRequest> requestOpt = helpRequestRepository.findById(helpRequestId);
        if (requestOpt.isEmpty()) {
            return new ArrayList<>();
        }
        
        HelpRequest currentRequest = requestOpt.get();
        List<HelpRequest> allRequests = helpRequestRepository.findAll();
        
        return allRequests.stream()
            .filter(r -> !r.getId().equals(helpRequestId)) // Exclude current request
            .map(r -> calculateHelpRequestSimilarity(currentRequest, r))
            .filter(dto -> dto.getSimilarityScore() >= 0.5) // Only return if similarity >= 50%
            .sorted((a, b) -> Double.compare(b.getSimilarityScore(), a.getSimilarityScore()))
            .collect(Collectors.toList());
    }

    @Override
    public List<DuplicateDetectionDTO> searchSimilarCases(String location, String approximateAge, 
                                                         String gender, String identificationMarks) {
        List<Case> similarCases = caseRepository.findByLocationAndApproximateAgeAndGenderAndIncidentDateBetween(
            location,
            approximateAge,
            gender,
            LocalDateTime.now().minusDays(30), // Search within last 30 days
            LocalDateTime.now().plusDays(1)
        );
        
        return similarCases.stream()
            .map(c -> {
                DuplicateDetectionDTO dto = new DuplicateDetectionDTO();
                dto.setId(c.getId());
                dto.setTrackingId(c.getTrackingId());
                dto.setType("CASE");
                dto.setTitle("Case: " + c.getCaseType());
                dto.setDescription(c.getCaseDescription());
                dto.setLocation(c.getLocation());
                dto.setApproximateAge(c.getApproximateAge());
                dto.setGender(c.getGender());
                dto.setIdentificationMarks(c.getIdentificationMarks());
                dto.setDate(c.getIncidentDate());
                dto.setStatus(c.getStatus().toString());
                dto.setReporterName(c.isAnonymous() ? "Anonymous" : c.getReporterName());

                double score = calculateSimilarityScore(
                    location, approximateAge, gender, identificationMarks,
                    c.getLocation(), c.getApproximateAge(), c.getGender(), c.getIdentificationMarks()
                );
                dto.setSimilarityScore(score);
                dto.setSimilarityReason(buildSimilarityReason(location, approximateAge, gender, identificationMarks,
                    c.getLocation(), c.getApproximateAge(), c.getGender(), c.getIdentificationMarks()));
                
                return dto;
            })
            .filter(dto -> dto.getSimilarityScore() >= 0.3) // Lower threshold for search
            .sorted((a, b) -> Double.compare(b.getSimilarityScore(), a.getSimilarityScore()))
            .collect(Collectors.toList());
    }

    @Override
    public List<DuplicateDetectionDTO> searchSimilarHelpRequests(String location, String approximateAge, 
                                                                 String gender, String helpType) {
        List<HelpRequest> similarRequests = helpRequestRepository.findByLocationAndApproximateAgeAndGenderAndHelpType(
            location,
            approximateAge,
            gender,
            com.example.childPortal.model.HelpType.valueOf(helpType)
        );
        
        return similarRequests.stream()
            .map(r -> {
                DuplicateDetectionDTO dto = new DuplicateDetectionDTO();
                dto.setId(r.getId());
                dto.setTrackingId(r.getTrackingId());
                dto.setType("HELP_REQUEST");
                dto.setTitle("Help Request: " + r.getHelpType());
                dto.setDescription(r.getDescription());
                dto.setLocation(r.getLocation());
                dto.setApproximateAge(r.getApproximateAge());
                dto.setGender(r.getGender());
                dto.setDate(r.getRequestDate());
                dto.setStatus(r.getStatus().toString());
                dto.setRequesterName(r.isAnonymous() ? "Anonymous" : r.getRequesterName());

                double score = calculateSimilarityScore(
                    location, approximateAge, gender, null,
                    r.getLocation(), r.getApproximateAge(), r.getGender(), null
                );
                dto.setSimilarityScore(score);
                dto.setSimilarityReason(buildSimilarityReason(location, approximateAge, gender, null,
                    r.getLocation(), r.getApproximateAge(), r.getGender(), null));
                
                return dto;
            })
            .filter(dto -> dto.getSimilarityScore() >= 0.3) // Lower threshold for search
            .sorted((a, b) -> Double.compare(b.getSimilarityScore(), a.getSimilarityScore()))
            .collect(Collectors.toList());
    }

    @Override
    public List<DuplicateDetectionDTO> checkPotentialDuplicateCase(String location, String approximateAge, 
                                                                  String gender, String identificationMarks,
                                                                  LocalDateTime incidentDate) {
        List<Case> similarCases = caseRepository.findByLocationAndApproximateAgeAndGenderAndIncidentDateBetween(
            location,
            approximateAge,
            gender,
            incidentDate.minusHours(24), // Within 24 hours
            incidentDate.plusHours(24)
        );
        
        return similarCases.stream()
            .map(c -> {
                DuplicateDetectionDTO dto = new DuplicateDetectionDTO();
                dto.setId(c.getId());
                dto.setTrackingId(c.getTrackingId());
                dto.setType("CASE");
                dto.setTitle("Case: " + c.getCaseType());
                dto.setDescription(c.getCaseDescription());
                dto.setLocation(c.getLocation());
                dto.setApproximateAge(c.getApproximateAge());
                dto.setGender(c.getGender());
                dto.setIdentificationMarks(c.getIdentificationMarks());
                dto.setDate(c.getIncidentDate());
                dto.setStatus(c.getStatus().toString());
                dto.setReporterName(c.isAnonymous() ? "Anonymous" : c.getReporterName());
                
                double score = calculateSimilarityScore(
                    location, approximateAge, gender, identificationMarks,
                    c.getLocation(), c.getApproximateAge(), c.getGender(), c.getIdentificationMarks()
                );
                dto.setSimilarityScore(score);
                dto.setSimilarityReason(buildSimilarityReason(location, approximateAge, gender, identificationMarks,
                    c.getLocation(), c.getApproximateAge(), c.getGender(), c.getIdentificationMarks()));
                
                return dto;
            })
            .filter(dto -> dto.getSimilarityScore() >= 0.5)
            .sorted((a, b) -> Double.compare(b.getSimilarityScore(), a.getSimilarityScore()))
            .collect(Collectors.toList());
    }

    @Override
    public List<DuplicateDetectionDTO> checkPotentialDuplicateHelpRequest(String location, String approximateAge, 
                                                                          String gender, String helpType) {
        List<HelpRequest> similarRequests = helpRequestRepository.findByLocationAndApproximateAgeAndGenderAndHelpType(
            location,
            approximateAge,
            gender,
            com.example.childPortal.model.HelpType.valueOf(helpType)
        );
        
        LocalDateTime oneDayAgo = LocalDateTime.now().minusDays(1);
        
        return similarRequests.stream()
            .filter(r -> r.getRequestDate().isAfter(oneDayAgo)) // Only recent requests
            .map(r -> {
                DuplicateDetectionDTO dto = new DuplicateDetectionDTO();
                dto.setId(r.getId());
                dto.setTrackingId(r.getTrackingId());
                dto.setType("HELP_REQUEST");
                dto.setTitle("Help Request: " + r.getHelpType());
                dto.setDescription(r.getDescription());
                dto.setLocation(r.getLocation());
                dto.setApproximateAge(r.getApproximateAge());
                dto.setGender(r.getGender());
                dto.setDate(r.getRequestDate());
                dto.setStatus(r.getStatus().toString());
                dto.setRequesterName(r.isAnonymous() ? "Anonymous" : r.getRequesterName());
                
                double score = calculateSimilarityScore(
                    location, approximateAge, gender, null,
                    r.getLocation(), r.getApproximateAge(), r.getGender(), null
                );
                dto.setSimilarityScore(score);
                dto.setSimilarityReason(buildSimilarityReason(location, approximateAge, gender, null,
                    r.getLocation(), r.getApproximateAge(), r.getGender(), null));
                
                return dto;
            })
            .filter(dto -> dto.getSimilarityScore() >= 0.5)
            .sorted((a, b) -> Double.compare(b.getSimilarityScore(), a.getSimilarityScore()))
            .collect(Collectors.toList());
    }

    private DuplicateDetectionDTO calculateCaseSimilarity(Case case1, Case case2) {
        DuplicateDetectionDTO dto = new DuplicateDetectionDTO();
        dto.setId(case2.getId());
        dto.setTrackingId(case2.getTrackingId());
        dto.setType("CASE");
        dto.setTitle("Case: " + case2.getCaseType());
        dto.setDescription(case2.getCaseDescription());
        dto.setLocation(case2.getLocation());
        dto.setApproximateAge(case2.getApproximateAge());
        dto.setGender(case2.getGender());
        dto.setIdentificationMarks(case2.getIdentificationMarks());
        dto.setDate(case2.getIncidentDate());
        dto.setStatus(case2.getStatus().toString());
        dto.setReporterName(case2.isAnonymous() ? "Anonymous" : case2.getReporterName());
        
        double score = calculateSimilarityScore(
            case1.getLocation(), case1.getApproximateAge(), case1.getGender(), case1.getIdentificationMarks(),
            case2.getLocation(), case2.getApproximateAge(), case2.getGender(), case2.getIdentificationMarks()
        );
        dto.setSimilarityScore(score);
        dto.setSimilarityReason(buildSimilarityReason(
            case1.getLocation(), case1.getApproximateAge(), case1.getGender(), case1.getIdentificationMarks(),
            case2.getLocation(), case2.getApproximateAge(), case2.getGender(), case2.getIdentificationMarks()
        ));
        
        return dto;
    }

    private DuplicateDetectionDTO calculateHelpRequestSimilarity(HelpRequest req1, HelpRequest req2) {
        DuplicateDetectionDTO dto = new DuplicateDetectionDTO();
        dto.setId(req2.getId());
        dto.setTrackingId(req2.getTrackingId());
        dto.setType("HELP_REQUEST");
        dto.setTitle("Help Request: " + req2.getHelpType());
        dto.setDescription(req2.getDescription());
        dto.setLocation(req2.getLocation());
        dto.setApproximateAge(req2.getApproximateAge());
        dto.setGender(req2.getGender());
        dto.setDate(req2.getRequestDate());
        dto.setStatus(req2.getStatus().toString());
        dto.setRequesterName(req2.isAnonymous() ? "Anonymous" : req2.getRequesterName());
        
        double score = calculateSimilarityScore(
            req1.getLocation(), req1.getApproximateAge(), req1.getGender(), null,
            req2.getLocation(), req2.getApproximateAge(), req2.getGender(), null
        );
        dto.setSimilarityScore(score);
        dto.setSimilarityReason(buildSimilarityReason(
            req1.getLocation(), req1.getApproximateAge(), req1.getGender(), null,
            req2.getLocation(), req2.getApproximateAge(), req2.getGender(), null
        ));
        
        return dto;
    }

    private double calculateSimilarityScore(String loc1, String age1, String gender1, String marks1,
                                           String loc2, String age2, String gender2, String marks2) {
        double score = 0.0;
        int factors = 0;

        if (loc1 != null && loc2 != null && !loc1.isEmpty() && !loc2.isEmpty()) {
            if (loc1.equalsIgnoreCase(loc2)) {
                score += 0.4;
            } else if (loc1.toLowerCase().contains(loc2.toLowerCase()) || 
                      loc2.toLowerCase().contains(loc1.toLowerCase())) {
                score += 0.2;
            }
            factors++;
        }

        if (age1 != null && age2 != null && !age1.isEmpty() && !age2.isEmpty()) {
            if (age1.equalsIgnoreCase(age2)) {
                score += 0.2;
            }
            factors++;
        }

        if (gender1 != null && gender2 != null && !gender1.isEmpty() && !gender2.isEmpty()) {
            if (gender1.equalsIgnoreCase(gender2)) {
                score += 0.2;
            }
            factors++;
        }

        if (marks1 != null && marks2 != null && !marks1.isEmpty() && !marks2.isEmpty()) {
            if (marks1.equalsIgnoreCase(marks2)) {
                score += 0.2;
            } else if (marks1.toLowerCase().contains(marks2.toLowerCase()) || 
                      marks2.toLowerCase().contains(marks1.toLowerCase())) {
                score += 0.1;
            }
            factors++;
        }
        
        return factors > 0 ? score : 0.0;
    }

    private String buildSimilarityReason(String loc1, String age1, String gender1, String marks1,
                                         String loc2, String age2, String gender2, String marks2) {
        List<String> reasons = new ArrayList<>();
        
        if (loc1 != null && loc2 != null && loc1.equalsIgnoreCase(loc2)) {
            reasons.add("Same location");
        }
        if (age1 != null && age2 != null && age1.equalsIgnoreCase(age2)) {
            reasons.add("Same age");
        }
        if (gender1 != null && gender2 != null && gender1.equalsIgnoreCase(gender2)) {
            reasons.add("Same gender");
        }
        if (marks1 != null && marks2 != null && marks1.equalsIgnoreCase(marks2)) {
            reasons.add("Same identification marks");
        }
        
        return reasons.isEmpty() ? "Some matching criteria" : String.join(", ", reasons);
    }
}

