package com.example.childPortal.controller;

import com.example.childPortal.dto.PublicStatisticsDTO;
import com.example.childPortal.dto.MonthlyActivityDTO;
import com.example.childPortal.model.Case;
import com.example.childPortal.model.Case.CaseStatus;
import com.example.childPortal.model.HelpRequest;
import com.example.childPortal.model.HelpRequest.RequestStatus;
import com.example.childPortal.repository.CaseRepository;
import com.example.childPortal.repository.HelpRequestRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/statistics/public")
@CrossOrigin(origins = "*")
public class PublicStatisticsController {

    @Autowired
    private CaseRepository caseRepository;

    @Autowired
    private HelpRequestRepository helpRequestRepository;

    @GetMapping
    public ResponseEntity<PublicStatisticsDTO> getPublicStatistics() {
        List<Case> allCases = caseRepository.findAll();
        List<HelpRequest> allHelpRequests = helpRequestRepository.findAll();

        PublicStatisticsDTO dto = new PublicStatisticsDTO();

        dto.setTotalCasesReported(allCases.size());

        dto.setActiveCases(allCases.stream()
                .filter(c -> c.getStatus() == CaseStatus.ASSIGNED ||
                           c.getStatus() == CaseStatus.INVESTIGATING ||
                           c.getStatus() == CaseStatus.UNDER_REVIEW ||
                           c.getStatus() == CaseStatus.REPORTED)
                .count());

        long casesSaved = allCases.stream()
                .filter(c -> c.getStatus() == CaseStatus.RESOLVED ||
                           c.getStatus() == CaseStatus.CLOSED)
                .count();
        dto.setCasesSaved(casesSaved);

        double resolutionRate = 0.0;
        if (dto.getTotalCasesReported() > 0) {
            resolutionRate = (casesSaved * 100.0) / dto.getTotalCasesReported();
            resolutionRate = Math.round(resolutionRate * 100.0) / 100.0; // Round to 2 decimal places
        }
        dto.setCaseResolutionRate(resolutionRate);

        dto.setHelpRequestsCompleted(allHelpRequests.stream()
                .filter(r -> r.getStatus() == RequestStatus.COMPLETED)
                .count());


        dto.setChildrenSupported(dto.getHelpRequestsCompleted());

        Map<String, Long> caseTypeDistribution = allCases.stream()
                .collect(Collectors.groupingBy(
                        c -> {
                            if (c.getCaseType() == null) return "OTHER";
                            String type = c.getCaseType().name();

                            switch (type) {
                                case "MISSING": return "Missing";
                                case "ABUSE": return "Abuse";
                                case "LABOR": return "Labor";
                                case "TRAFFICKING": return "Trafficking";
                                default: return "Other";
                            }
                        },
                        Collectors.counting()));
        dto.setCaseTypeDistribution(caseTypeDistribution);

        List<MonthlyActivityDTO> monthlyActivity = new ArrayList<>();
        LocalDateTime now = LocalDateTime.now();
        DateTimeFormatter monthFormatter = DateTimeFormatter.ofPattern("MMM yyyy");

        for (int i = 11; i >= 0; i--) {
            LocalDateTime monthStart = now.minusMonths(i).withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0);
            LocalDateTime monthEnd = monthStart.plusMonths(1);

            long casesInMonth = allCases.stream()
                    .filter(c -> c.getReportDate() != null &&
                               !c.getReportDate().isBefore(monthStart) &&
                               c.getReportDate().isBefore(monthEnd))
                    .count();

            long helpRequestsInMonth = allHelpRequests.stream()
                    .filter(r -> r.getRequestDate() != null &&
                               !r.getRequestDate().isBefore(monthStart) &&
                               r.getRequestDate().isBefore(monthEnd))
                    .count();

            MonthlyActivityDTO activity = new MonthlyActivityDTO(
                    monthStart.format(monthFormatter),
                    monthStart,
                    casesInMonth,
                    helpRequestsInMonth
            );
            monthlyActivity.add(activity);
        }

        dto.setMonthlyActivity(monthlyActivity);
        dto.setLastUpdated(LocalDateTime.now());

        return ResponseEntity.ok(dto);
    }
}

