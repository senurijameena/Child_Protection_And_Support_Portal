package com.example.childPortal.controller;

import com.example.childPortal.dto.PublicStatisticsDTO;
import com.example.childPortal.dto.MonthlyActivityDTO;
import com.example.childPortal.model.Case;
import com.example.childPortal.model.Case.CaseStatus;
import com.example.childPortal.model.HelpRequest;
import com.example.childPortal.model.HelpRequest.RequestStatus;
import com.example.childPortal.model.Role;
import com.example.childPortal.repository.CaseRepository;
import com.example.childPortal.repository.HelpRequestRepository;
import com.example.childPortal.repository.UserRepository;
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

        @Autowired
        private UserRepository userRepository;

        @GetMapping
        public ResponseEntity<PublicStatisticsDTO> getPublicStatistics() {
                PublicStatisticsDTO dto = new PublicStatisticsDTO();
                DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

                try {
                        // 1. Case Statistics
                        dto.setTotalCasesReported(caseRepository.count());

                        long active = caseRepository.countByStatus(CaseStatus.REPORTED) +
                                        caseRepository.countByStatus(CaseStatus.ASSIGNED) +
                                        caseRepository.countByStatus(CaseStatus.INVESTIGATING) +
                                        caseRepository.countByStatus(CaseStatus.UNDER_REVIEW);
                        dto.setActiveCases(active);

                        long saved = caseRepository.countByStatus(CaseStatus.RESOLVED) +
                                        caseRepository.countByStatus(CaseStatus.CLOSED);
                        dto.setCasesSaved(saved);

                        if (dto.getTotalCasesReported() > 0) {
                                double rate = (saved * 100.0) / dto.getTotalCasesReported();
                                dto.setCaseResolutionRate(Math.round(rate * 100.0) / 100.0);
                        }

                        // 2. Help Request Statistics
                        dto.setHelpRequestsCompleted(helpRequestRepository.countByStatus(RequestStatus.COMPLETED));
                        dto.setChildrenSupported(dto.getHelpRequestsCompleted());

                        // 3. User Statistics
                        dto.setPublicUsersCount(userRepository.countByRole(Role.PU));
                        dto.setSocialWorkersCount(userRepository.countByRole(Role.SW));
                        dto.setPoliceOfficersCount(userRepository.countByRole(Role.PO));

                        // 4. Case Type Distribution
                        List<Case> cases = caseRepository.findAll();
                        Map<String, Long> dist = cases.stream()
                                        .collect(Collectors.groupingBy(
                                                        c -> {
                                                                if (c.getCaseType() == null)
                                                                        return "Other";
                                                                String name = c.getCaseType().name();
                                                                if (name.contains("MISSING"))
                                                                        return "Missing";
                                                                if (name.contains("ABUSE"))
                                                                        return "Abuse";
                                                                if (name.contains("LABOR"))
                                                                        return "Labor";
                                                                if (name.contains("TRAFFICKING"))
                                                                        return "Trafficking";
                                                                return "Other";
                                                        },
                                                        Collectors.counting()));
                        dto.setCaseTypeDistribution(dist);

                        // 5. Monthly Activity
                        List<HelpRequest> reqs = helpRequestRepository.findAll();
                        List<MonthlyActivityDTO> monthlyActivity = new ArrayList<>();
                        LocalDateTime now = LocalDateTime.now();
                        DateTimeFormatter monthFormatter = DateTimeFormatter.ofPattern("MMM yyyy");

                        for (int i = 5; i >= 0; i--) {
                                LocalDateTime monthStart = now.minusMonths(i).withDayOfMonth(1).withHour(0)
                                                .withMinute(0).withSecond(0);
                                LocalDateTime monthEnd = monthStart.plusMonths(1);

                                long casesInMonth = cases.stream()
                                                .filter(c -> c.getReportDate() != null &&
                                                                !c.getReportDate().isBefore(monthStart) &&
                                                                c.getReportDate().isBefore(monthEnd))
                                                .count();

                                long reqsInMonth = reqs.stream()
                                                .filter(r -> r.getRequestDate() != null &&
                                                                !r.getRequestDate().isBefore(monthStart) &&
                                                                r.getRequestDate().isBefore(monthEnd))
                                                .count();

                                monthlyActivity.add(new MonthlyActivityDTO(
                                                monthStart.format(monthFormatter),
                                                monthStart,
                                                casesInMonth,
                                                reqsInMonth));
                        }
                        dto.setMonthlyActivity(monthlyActivity);

                } catch (Exception e) {
                        System.err.println("Error in PublicStatistics: " + e.getMessage());
                }

                dto.setLastUpdated(LocalDateTime.now().format(formatter));
                return ResponseEntity.ok(dto);
        }
}
