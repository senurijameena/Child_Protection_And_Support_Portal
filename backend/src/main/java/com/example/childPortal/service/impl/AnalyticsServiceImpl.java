package com.example.childPortal.service.impl;

import com.example.childPortal.dto.*;
import com.example.childPortal.model.*;
import com.example.childPortal.model.Case.CaseStatus;
import com.example.childPortal.model.HelpRequest.RequestStatus;
import com.example.childPortal.repository.CaseRepository;
import com.example.childPortal.repository.HelpRequestRepository;
import com.example.childPortal.repository.UserRepository;
import com.example.childPortal.service.AnalyticsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AnalyticsServiceImpl implements AnalyticsService {

        @Autowired
        private CaseRepository caseRepository;

        @Autowired
        private HelpRequestRepository helpRequestRepository;

        @Autowired
        private UserRepository userRepository;

        @Override
        public CaseStatisticsDTO getCaseStatistics(LocalDateTime startDate, LocalDateTime endDate) {
                List<Case> allCases = caseRepository.findAll();
                List<Case> filteredCases = allCases.stream()
                                .filter(c -> {
                                        LocalDateTime reportDate = c.getReportDate();
                                        return reportDate != null &&
                                                        !reportDate.isBefore(startDate) &&
                                                        !reportDate.isAfter(endDate);
                                })
                                .collect(Collectors.toList());

                CaseStatisticsDTO dto = new CaseStatisticsDTO();
                dto.setTotalCases(filteredCases.size());
                dto.setActiveCases((long) filteredCases.stream()
                                .filter(c -> c.getStatus() == CaseStatus.ASSIGNED ||
                                                c.getStatus() == CaseStatus.INVESTIGATING ||
                                                c.getStatus() == CaseStatus.UNDER_REVIEW)
                                .count());
                dto.setResolvedCases((long) filteredCases.stream()
                                .filter(c -> c.getStatus() == CaseStatus.RESOLVED)
                                .count());
                dto.setClosedCases((long) filteredCases.stream()
                                .filter(c -> c.getStatus() == CaseStatus.CLOSED)
                                .count());
                dto.setEmergencyCases((long) filteredCases.stream()
                                .filter(Case::isEmergency)
                                .count());

                List<Case> resolvedCases = filteredCases.stream()
                                .filter(c -> c.getStatus() == CaseStatus.RESOLVED || c.getStatus() == CaseStatus.CLOSED)
                                .filter(c -> c.getReportDate() != null && c.getResolutionDate() != null)
                                .collect(Collectors.toList());

                if (!resolvedCases.isEmpty()) {
                        double avgResolutionTime = resolvedCases.stream()
                                        .mapToLong(c -> ChronoUnit.HOURS.between(c.getReportDate(),
                                                        c.getResolutionDate()))
                                        .average()
                                        .orElse(0.0);
                        dto.setAverageResolutionTime(avgResolutionTime);
                } else {
                        dto.setAverageResolutionTime(0.0);
                }

                Map<String, Long> casesByType = filteredCases.stream()
                                .collect(Collectors.groupingBy(
                                                c -> c.getCaseType() != null ? c.getCaseType().name() : "UNKNOWN",
                                                Collectors.counting()));
                dto.setCasesByType(casesByType);

                Map<String, Long> casesByStatus = filteredCases.stream()
                                .collect(Collectors.groupingBy(
                                                c -> c.getStatus() != null ? c.getStatus().name() : "UNKNOWN",
                                                Collectors.counting()));
                dto.setCasesByStatus(casesByStatus);

                Map<String, Long> casesByPriority = filteredCases.stream()
                                .collect(Collectors.groupingBy(
                                                c -> c.getPriority() != null ? c.getPriority().name() : "MEDIUM",
                                                Collectors.counting()));
                dto.setCasesByPriority(casesByPriority);

                dto.setStartDate(startDate);
                dto.setEndDate(endDate);

                return dto;
        }

        @Override
        public Map<String, Long> getCaseStatusDistribution() {
                List<Case> allCases = caseRepository.findAll();
                return allCases.stream()
                                .collect(Collectors.groupingBy(
                                                c -> c.getStatus() != null ? c.getStatus().name() : "UNKNOWN",
                                                Collectors.counting()));
        }

        @Override
        public Map<String, Long> getCaseTypeDistribution() {
                List<Case> allCases = caseRepository.findAll();
                return allCases.stream()
                                .collect(Collectors.groupingBy(
                                                c -> c.getCaseType() != null ? c.getCaseType().name() : "UNKNOWN",
                                                Collectors.counting()));
        }

        @Override
        public List<CaseTrendDTO> getCaseTrends(String period) {
                List<Case> allCases = caseRepository.findAll();
                List<CaseTrendDTO> trends = new ArrayList<>();

                LocalDateTime now = LocalDateTime.now();
                int periods = 12;

                if ("daily".equalsIgnoreCase(period)) {
                        for (int i = periods - 1; i >= 0; i--) {
                                LocalDateTime periodStart = now.minusDays(i).withHour(0).withMinute(0).withSecond(0);
                                LocalDateTime periodEnd = periodStart.plusDays(1);

                                List<Case> periodCases = allCases.stream()
                                                .filter(c -> c.getReportDate() != null &&
                                                                !c.getReportDate().isBefore(periodStart) &&
                                                                c.getReportDate().isBefore(periodEnd))
                                                .collect(Collectors.toList());

                                CaseTrendDTO trend = new CaseTrendDTO();
                                trend.setPeriod(periodStart);
                                trend.setNewCases(periodCases.size());
                                trend.setResolvedCases((long) periodCases.stream()
                                                .filter(c -> c.getStatus() == CaseStatus.RESOLVED
                                                                || c.getStatus() == CaseStatus.CLOSED)
                                                .count());
                                trend.setActiveCases((long) periodCases.stream()
                                                .filter(c -> c.getStatus() == CaseStatus.ASSIGNED ||
                                                                c.getStatus() == CaseStatus.INVESTIGATING)
                                                .count());

                                long total = periodCases.size();
                                long resolved = trend.getResolvedCases();
                                trend.setResolutionRate(total > 0 ? (double) resolved / total * 100 : 0.0);

                                trends.add(trend);
                        }
                } else if ("weekly".equalsIgnoreCase(period)) {
                        for (int i = periods - 1; i >= 0; i--) {
                                LocalDateTime periodStart = now.minusWeeks(i).with(java.time.DayOfWeek.MONDAY)
                                                .withHour(0).withMinute(0).withSecond(0);
                                LocalDateTime periodEnd = periodStart.plusWeeks(1);

                                List<Case> periodCases = allCases.stream()
                                                .filter(c -> c.getReportDate() != null &&
                                                                !c.getReportDate().isBefore(periodStart) &&
                                                                c.getReportDate().isBefore(periodEnd))
                                                .collect(Collectors.toList());

                                CaseTrendDTO trend = new CaseTrendDTO();
                                trend.setPeriod(periodStart);
                                trend.setNewCases(periodCases.size());
                                trend.setResolvedCases((long) periodCases.stream()
                                                .filter(c -> c.getStatus() == CaseStatus.RESOLVED
                                                                || c.getStatus() == CaseStatus.CLOSED)
                                                .count());
                                trend.setActiveCases((long) periodCases.stream()
                                                .filter(c -> c.getStatus() == CaseStatus.ASSIGNED ||
                                                                c.getStatus() == CaseStatus.INVESTIGATING)
                                                .count());

                                long total = periodCases.size();
                                long resolved = trend.getResolvedCases();
                                trend.setResolutionRate(total > 0 ? (double) resolved / total * 100 : 0.0);

                                trends.add(trend);
                        }
                } else {
                        for (int i = periods - 1; i >= 0; i--) {
                                LocalDateTime periodStart = now.minusMonths(i).withDayOfMonth(1).withHour(0)
                                                .withMinute(0).withSecond(0);
                                LocalDateTime periodEnd = periodStart.plusMonths(1);

                                List<Case> periodCases = allCases.stream()
                                                .filter(c -> c.getReportDate() != null &&
                                                                !c.getReportDate().isBefore(periodStart) &&
                                                                c.getReportDate().isBefore(periodEnd))
                                                .collect(Collectors.toList());

                                CaseTrendDTO trend = new CaseTrendDTO();
                                trend.setPeriod(periodStart);
                                trend.setNewCases(periodCases.size());
                                trend.setResolvedCases((long) periodCases.stream()
                                                .filter(c -> c.getStatus() == CaseStatus.RESOLVED
                                                                || c.getStatus() == CaseStatus.CLOSED)
                                                .count());
                                trend.setActiveCases((long) periodCases.stream()
                                                .filter(c -> c.getStatus() == CaseStatus.ASSIGNED ||
                                                                c.getStatus() == CaseStatus.INVESTIGATING)
                                                .count());

                                long total = periodCases.size();
                                long resolved = trend.getResolvedCases();
                                trend.setResolutionRate(total > 0 ? (double) resolved / total * 100 : 0.0);

                                trends.add(trend);
                        }
                }

                return trends;
        }

        @Override
        public HelpRequestStatisticsDTO getHelpRequestStatistics(LocalDateTime startDate, LocalDateTime endDate) {
                List<HelpRequest> allRequests = helpRequestRepository.findAll();
                List<HelpRequest> filteredRequests = allRequests.stream()
                                .filter(r -> {
                                        LocalDateTime requestDate = r.getRequestDate();
                                        return requestDate != null &&
                                                        !requestDate.isBefore(startDate) &&
                                                        !requestDate.isAfter(endDate);
                                })
                                .collect(Collectors.toList());

                HelpRequestStatisticsDTO dto = new HelpRequestStatisticsDTO();
                dto.setTotalRequests(filteredRequests.size());
                dto.setPendingRequests((long) filteredRequests.stream()
                                .filter(r -> r.getStatus() == RequestStatus.REQUESTED ||
                                                r.getStatus() == RequestStatus.UNDER_REVIEW)
                                .count());
                dto.setActiveRequests((long) filteredRequests.stream()
                                .filter(r -> r.getStatus() == RequestStatus.ASSIGNED ||
                                                r.getStatus() == RequestStatus.IN_PROGRESS)
                                .count());
                dto.setCompletedRequests((long) filteredRequests.stream()
                                .filter(r -> r.getStatus() == RequestStatus.COMPLETED)
                                .count());
                dto.setUrgentRequests((long) filteredRequests.stream()
                                .filter(r -> r.getPriority() == Priority.HIGH)
                                .count());

                List<HelpRequest> completedRequests = filteredRequests.stream()
                                .filter(r -> r.getStatus() == RequestStatus.COMPLETED)
                                .filter(r -> r.getRequestDate() != null && r.getCompletionDate() != null)
                                .collect(Collectors.toList());

                if (!completedRequests.isEmpty()) {
                        double avgResponseTime = completedRequests.stream()
                                        .mapToLong(r -> ChronoUnit.HOURS.between(r.getRequestDate(),
                                                        r.getCompletionDate()))
                                        .average()
                                        .orElse(0.0);
                        dto.setAverageResponseTime(avgResponseTime);
                } else {
                        dto.setAverageResponseTime(0.0);
                }

                Map<String, Long> requestsByType = filteredRequests.stream()
                                .collect(Collectors.groupingBy(
                                                r -> r.getHelpType() != null ? r.getHelpType().name() : "UNKNOWN",
                                                Collectors.counting()));
                dto.setRequestsByType(requestsByType);

                Map<String, Long> requestsByStatus = filteredRequests.stream()
                                .collect(Collectors.groupingBy(
                                                r -> r.getStatus() != null ? r.getStatus().name() : "UNKNOWN",
                                                Collectors.counting()));
                dto.setRequestsByStatus(requestsByStatus);

                Map<String, Long> requestsByUrgency = filteredRequests.stream()
                                .collect(Collectors.groupingBy(
                                                r -> r.getPriority() != null ? r.getPriority().name() : "MEDIUM",
                                                Collectors.counting()));
                dto.setRequestsByUrgency(requestsByUrgency);

                dto.setStartDate(startDate);
                dto.setEndDate(endDate);

                return dto;
        }

        @Override
        public Map<String, Long> getHelpTypeDistribution() {
                List<HelpRequest> allRequests = helpRequestRepository.findAll();
                return allRequests.stream()
                                .collect(Collectors.groupingBy(
                                                r -> r.getHelpType() != null ? r.getHelpType().name() : "UNKNOWN",
                                                Collectors.counting()));
        }

        @Override
        public Map<String, Long> getHelpRequestStatusDistribution() {
                List<HelpRequest> allRequests = helpRequestRepository.findAll();
                return allRequests.stream()
                                .collect(Collectors.groupingBy(
                                                r -> r.getStatus() != null ? r.getStatus().name() : "UNKNOWN",
                                                Collectors.counting()));
        }

        @Override
        public UserStatisticsDTO getUserStatistics() {
                UserStatisticsDTO dto = new UserStatisticsDTO();
                dto.setTotalUsers(userRepository.count());
                dto.setActiveUsers(userRepository.countByActive(true));
                dto.setPendingUsers(userRepository.countByApproved(false));
                dto.setSuspendedUsers(userRepository.countByActive(false));

                Map<String, Long> usersByRole = new HashMap<>();
                for (Role role : Role.values()) {
                        usersByRole.put(role.name(), userRepository.countByRole(role));
                }
                dto.setUsersByRole(usersByRole);

                dto.setTotalPoliceOfficers(usersByRole.getOrDefault("PO", 0L));
                dto.setTotalSocialWorkers(usersByRole.getOrDefault("SW", 0L));
                dto.setTotalPublicUsers(usersByRole.getOrDefault("PU", 0L));
                dto.setTotalAdmins(usersByRole.getOrDefault("ADMIN", 0L));

                return dto;
        }

        @Override
        public Map<String, Long> getUserRoleDistribution() {
                List<User> allUsers = userRepository.findAll();
                return allUsers.stream()
                                .collect(Collectors.groupingBy(
                                                u -> u.getRole() != null ? u.getRole().name() : "UNKNOWN",
                                                Collectors.counting()));
        }

        @Override
        public List<UserActivityDTO> getMostActiveUsers(int limit) {
                List<User> allUsers = userRepository.findAll();
                List<Case> allCases = caseRepository.findAll();
                List<HelpRequest> allRequests = helpRequestRepository.findAll();

                Map<String, UserActivityDTO> userActivityMap = new HashMap<>();

                for (User user : allUsers) {
                        UserActivityDTO activity = new UserActivityDTO();
                        activity.setUserId(user.getId());
                        activity.setUserName(user.getFullName());
                        activity.setRole(user.getRole() != null ? user.getRole().name() : "UNKNOWN");
                        activity.setCasesHandled(0);
                        activity.setHelpRequestsHandled(0);
                        activity.setTransfersRequested(0);
                        activity.setTransfersApproved(0);
                        activity.setFeedbackSubmitted(0);
                        activity.setAverageRating(0.0);
                        userActivityMap.put(user.getId(), activity);
                }

                for (Case c : allCases) {
                        if (c.getAssignedOfficerId() != null) {
                                UserActivityDTO activity = userActivityMap.get(c.getAssignedOfficerId());
                                if (activity != null) {
                                        activity.setCasesHandled(activity.getCasesHandled() + 1);
                                }
                        }
                        if (c.getAssignedWorkerId() != null) {
                                UserActivityDTO activity = userActivityMap.get(c.getAssignedWorkerId());
                                if (activity != null) {
                                        activity.setCasesHandled(activity.getCasesHandled() + 1);
                                }
                        }
                }

                for (HelpRequest r : allRequests) {
                        if (r.getAssignedWorkerId() != null) {
                                UserActivityDTO activity = userActivityMap.get(r.getAssignedWorkerId());
                                if (activity != null) {
                                        activity.setHelpRequestsHandled(activity.getHelpRequestsHandled() + 1);
                                }
                        }
                }

                for (UserActivityDTO activity : userActivityMap.values()) {
                        long totalActivity = activity.getCasesHandled() +
                                        activity.getHelpRequestsHandled() +
                                        activity.getTransfersRequested() +
                                        activity.getTransfersApproved() +
                                        activity.getFeedbackSubmitted();
                        activity.setTotalActivity(totalActivity);
                }

                return userActivityMap.values().stream()
                                .sorted((a, b) -> Long.compare(b.getTotalActivity(), a.getTotalActivity()))
                                .limit(limit)
                                .collect(Collectors.toList());
        }

        @Override
        public ResponseTimeMetricsDTO getResponseTimeMetrics() {
                List<Case> allCases = caseRepository.findAll();
                List<HelpRequest> allRequests = helpRequestRepository.findAll();

                ResponseTimeMetricsDTO dto = new ResponseTimeMetricsDTO();

                List<Case> resolvedCases = allCases.stream()
                                .filter(c -> c.getStatus() == CaseStatus.RESOLVED || c.getStatus() == CaseStatus.CLOSED)
                                .filter(c -> c.getReportDate() != null && c.getResolutionDate() != null)
                                .collect(Collectors.toList());

                if (!resolvedCases.isEmpty()) {
                        List<Long> caseResponseTimes = resolvedCases.stream()
                                        .mapToLong(c -> ChronoUnit.HOURS.between(c.getReportDate(),
                                                        c.getResolutionDate()))
                                        .boxed()
                                        .sorted()
                                        .collect(Collectors.toList());

                        dto.setAverageCaseResponseTime(caseResponseTimes.stream()
                                        .mapToLong(Long::longValue)
                                        .average()
                                        .orElse(0.0));

                        int medianIndex = caseResponseTimes.size() / 2;
                        dto.setMedianCaseResponseTime(caseResponseTimes.get(medianIndex).doubleValue());
                        dto.setFastestResponseTime(caseResponseTimes.get(0).doubleValue());
                        dto.setSlowestResponseTime(caseResponseTimes.get(caseResponseTimes.size() - 1).doubleValue());
                }

                List<HelpRequest> completedRequests = allRequests.stream()
                                .filter(r -> r.getStatus() == RequestStatus.COMPLETED)
                                .filter(r -> r.getRequestDate() != null && r.getCompletionDate() != null)
                                .collect(Collectors.toList());

                if (!completedRequests.isEmpty()) {
                        List<Long> requestResponseTimes = completedRequests.stream()
                                        .mapToLong(r -> ChronoUnit.HOURS.between(r.getRequestDate(),
                                                        r.getCompletionDate()))
                                        .boxed()
                                        .sorted()
                                        .collect(Collectors.toList());

                        dto.setAverageHelpRequestResponseTime(requestResponseTimes.stream()
                                        .mapToLong(Long::longValue)
                                        .average()
                                        .orElse(0.0));

                        int medianIndex = requestResponseTimes.size() / 2;
                        dto.setMedianHelpRequestResponseTime(requestResponseTimes.get(medianIndex).doubleValue());
                }

                dto.setTotalResponses(resolvedCases.size() + completedRequests.size());

                return dto;
        }

        @Override
        public ResolutionRateDTO getResolutionRates() {
                List<Case> allCases = caseRepository.findAll();
                List<HelpRequest> allRequests = helpRequestRepository.findAll();

                ResolutionRateDTO dto = new ResolutionRateDTO();

                long totalCases = allCases.size();
                long resolvedCases = allCases.stream()
                                .filter(c -> c.getStatus() == CaseStatus.RESOLVED || c.getStatus() == CaseStatus.CLOSED)
                                .count();

                long totalHelpRequests = allRequests.size();
                long resolvedHelpRequests = allRequests.stream()
                                .filter(r -> r.getStatus() == RequestStatus.COMPLETED)
                                .count();

                dto.setTotalCases(totalCases);
                dto.setResolvedCases(resolvedCases);
                dto.setTotalHelpRequests(totalHelpRequests);
                dto.setResolvedHelpRequests(resolvedHelpRequests);

                dto.setCaseResolutionRate(totalCases > 0 ? (double) resolvedCases / totalCases * 100 : 0.0);
                dto.setHelpRequestResolutionRate(
                                totalHelpRequests > 0 ? (double) resolvedHelpRequests / totalHelpRequests * 100 : 0.0);

                long totalEntities = totalCases + totalHelpRequests;
                long totalResolved = resolvedCases + resolvedHelpRequests;
                dto.setOverallResolutionRate(totalEntities > 0 ? (double) totalResolved / totalEntities * 100 : 0.0);

                List<Case> resolvedCaseList = allCases.stream()
                                .filter(c -> c.getStatus() == CaseStatus.RESOLVED || c.getStatus() == CaseStatus.CLOSED)
                                .filter(c -> c.getReportDate() != null && c.getResolutionDate() != null)
                                .collect(Collectors.toList());

                List<HelpRequest> resolvedRequestList = allRequests.stream()
                                .filter(r -> r.getStatus() == RequestStatus.COMPLETED)
                                .filter(r -> r.getRequestDate() != null && r.getCompletionDate() != null)
                                .collect(Collectors.toList());

                List<Long> allResolutionTimes = new ArrayList<>();
                allResolutionTimes.addAll(resolvedCaseList.stream()
                                .mapToLong(c -> ChronoUnit.HOURS.between(c.getReportDate(), c.getResolutionDate()))
                                .boxed()
                                .collect(Collectors.toList()));
                allResolutionTimes.addAll(resolvedRequestList.stream()
                                .mapToLong(r -> ChronoUnit.HOURS.between(r.getRequestDate(), r.getCompletionDate()))
                                .boxed()
                                .collect(Collectors.toList()));

                if (!allResolutionTimes.isEmpty()) {
                        dto.setAverageResolutionTime(allResolutionTimes.stream()
                                        .mapToLong(Long::longValue)
                                        .average()
                                        .orElse(0.0));
                } else {
                        dto.setAverageResolutionTime(0.0);
                }

                return dto;
        }

        @Override
        public List<LocationAnalyticsDTO> getLocationAnalytics() {
                List<Case> allCases = caseRepository.findAll();
                List<HelpRequest> allRequests = helpRequestRepository.findAll();

                Map<String, LocationAnalyticsDTO> locationMap = new HashMap<>();

                for (Case c : allCases) {
                        if (c.getLocation() != null && !c.getLocation().isEmpty()) {
                                String location = c.getLocation();
                                LocationAnalyticsDTO analytics = locationMap.getOrDefault(location,
                                                new LocationAnalyticsDTO());
                                analytics.setLocation(location);
                                analytics.setTotalCases(analytics.getTotalCases() + 1);

                                if (c.getStatus() == CaseStatus.ASSIGNED ||
                                                c.getStatus() == CaseStatus.INVESTIGATING ||
                                                c.getStatus() == CaseStatus.UNDER_REVIEW) {
                                        analytics.setActiveCases(analytics.getActiveCases() + 1);
                                }

                                locationMap.put(location, analytics);
                        }
                }

                for (HelpRequest r : allRequests) {
                        if (r.getLocation() != null && !r.getLocation().isEmpty()) {
                                String location = r.getLocation();
                                LocationAnalyticsDTO analytics = locationMap.getOrDefault(location,
                                                new LocationAnalyticsDTO());
                                analytics.setLocation(location);
                                analytics.setTotalHelpRequests(analytics.getTotalHelpRequests() + 1);

                                if (r.getStatus() == RequestStatus.REQUESTED ||
                                                r.getStatus() == RequestStatus.UNDER_REVIEW) {
                                        analytics.setPendingHelpRequests(analytics.getPendingHelpRequests() + 1);
                                }

                                locationMap.put(location, analytics);
                        }
                }

                for (LocationAnalyticsDTO analytics : locationMap.values()) {

                        analytics.setAverageResponseTime(24.0); // Placeholder

                        long total = analytics.getTotalCases() + analytics.getTotalHelpRequests();
                        long resolved = analytics.getTotalCases() - analytics.getActiveCases() +
                                        analytics.getTotalHelpRequests() - analytics.getPendingHelpRequests();
                        analytics.setResolutionRate(total > 0 ? (double) resolved / total * 100 : 0.0);
                }

                return locationMap.values().stream()
                                .sorted((a, b) -> Long.compare(b.getTotalCases() + b.getTotalHelpRequests(),
                                                a.getTotalCases() + a.getTotalHelpRequests()))
                                .collect(Collectors.toList());
        }

        @Override
        public Map<String, Long> getCaseDistributionByLocation() {
                List<Case> allCases = caseRepository.findAll();
                return allCases.stream()
                                .filter(c -> c.getLocation() != null && !c.getLocation().isEmpty())
                                .collect(Collectors.groupingBy(Case::getLocation, Collectors.counting()));
        }

        @Override
        public DashboardMetricsDTO getDashboardMetrics() {
                DashboardMetricsDTO dto = new DashboardMetricsDTO();
                dto.setTotalCases(caseRepository.count());
                dto.setActiveCases(caseRepository.countByStatusIn(Arrays.asList(
                                CaseStatus.ASSIGNED,
                                CaseStatus.INVESTIGATING,
                                CaseStatus.UNDER_REVIEW)));
                dto.setEmergencyCases(caseRepository.countByEmergency(true));
                dto.setTotalHelpRequests(helpRequestRepository.count());
                dto.setPendingHelpRequests(helpRequestRepository.countByStatusIn(Arrays.asList(
                                RequestStatus.REQUESTED,
                                RequestStatus.UNDER_REVIEW)));
                dto.setTotalUsers(userRepository.count());
                dto.setPendingApprovals(userRepository.countByApproved(false));

                long resolvedCount = caseRepository.countByStatus(CaseStatus.RESOLVED)
                                + caseRepository.countByStatus(CaseStatus.CLOSED);
                dto.setResolvedCases(resolvedCount);

                List<Case> resolvedCaseList = caseRepository.findByStatus(CaseStatus.RESOLVED);
                if (!resolvedCaseList.isEmpty()) {
                        double avgResponseTime = resolvedCaseList.stream()
                                        .filter(c -> c.getReportDate() != null && c.getResolutionDate() != null)
                                        .mapToLong(c -> ChronoUnit.HOURS.between(c.getReportDate(),
                                                        c.getResolutionDate()))
                                        .average()
                                        .orElse(0.0);
                        dto.setAverageResponseTime(avgResponseTime);
                } else {
                        dto.setAverageResponseTime(0.0);
                }

                long totalCases = dto.getTotalCases();
                dto.setCaseResolutionRate(totalCases > 0 ? (double) resolvedCount / totalCases * 100 : 0.0);

                // Populate casesByStatus
                Map<String, Long> casesByStatusMap = getCaseStatusDistribution();
                dto.setCasesByStatus(casesByStatusMap);

                // Populate helpRequestsByType
                Map<String, Long> helpRequestsByTypeMap = getHelpTypeDistribution();
                dto.setHelpRequestsByType(helpRequestsByTypeMap);

                dto.setLastUpdated(LocalDateTime.now());
                return dto;
        }

        @Override
        public AdminDashboardOverviewDTO getAdminDashboardOverview() {
                AdminDashboardOverviewDTO overview = new AdminDashboardOverviewDTO();
                overview.setMetrics(getDashboardMetrics());

                List<Case> recentCases = caseRepository.findTop5ByOrderByReportDateDesc();
                overview.setRecentCases(recentCases.stream().map(this::mapToCaseDTO).collect(Collectors.toList()));

                List<HelpRequest> recentRequests = helpRequestRepository.findTop5ByOrderByRequestDateDesc();
                overview.setRecentHelpRequests(
                                recentRequests.stream().map(this::mapToHelpRequestDTO).collect(Collectors.toList()));

                return overview;
        }

        private CaseDTO mapToCaseDTO(Case c) {
                CaseDTO dto = new CaseDTO();
                dto.setId(c.getId());
                dto.setTrackingId(c.getTrackingId());
                dto.setCaseType(c.getCaseType());
                dto.setLocation(c.getLocation());
                dto.setPriority(c.getPriority());
                dto.setStatus(c.getStatus());
                dto.setAssignedOfficerId(c.getAssignedOfficerId());
                dto.setAssignedWorkerId(c.getAssignedWorkerId());
                dto.setReportDate(c.getReportDate());
                return dto;
        }

        private HelpRequestDTO mapToHelpRequestDTO(HelpRequest hr) {
                HelpRequestDTO dto = new HelpRequestDTO();
                dto.setId(hr.getId());
                dto.setTrackingId(hr.getTrackingId());
                dto.setHelpType(hr.getHelpType());
                dto.setPriority(hr.getPriority());
                dto.setStatus(hr.getStatus());
                dto.setAssignedWorkerId(hr.getAssignedWorkerId());
                dto.setRequestDate(hr.getRequestDate());
                dto.setApproximateAge(hr.getApproximateAge());
                return dto;
        }

        @Override
        public CustomReportDTO generateCustomReport(ReportRequestDTO request) {
                CustomReportDTO report = new CustomReportDTO();
                report.setReportId(UUID.randomUUID().toString());
                report.setReportType(request.getReportType());
                report.setFormat(request.getFormat() != null ? request.getFormat() : "PDF");
                report.setGeneratedAt(LocalDateTime.now());
                report.setStatus("COMPLETED");

                long recordCount = 0;
                if ("CASES".equalsIgnoreCase(request.getReportType())) {
                        List<Case> cases = caseRepository.findAll();
                        if (request.getStartDate() != null && request.getEndDate() != null) {
                                cases = cases.stream()
                                                .filter(c -> c.getReportDate() != null &&
                                                                !c.getReportDate().isBefore(request.getStartDate()) &&
                                                                !c.getReportDate().isAfter(request.getEndDate()))
                                                .collect(Collectors.toList());
                        }
                        recordCount = cases.size();
                } else if ("HELP_REQUESTS".equalsIgnoreCase(request.getReportType())) {
                        List<HelpRequest> requests = helpRequestRepository.findAll();
                        if (request.getStartDate() != null && request.getEndDate() != null) {
                                requests = requests.stream()
                                                .filter(r -> r.getRequestDate() != null &&
                                                                !r.getRequestDate().isBefore(request.getStartDate()) &&
                                                                !r.getRequestDate().isAfter(request.getEndDate()))
                                                .collect(Collectors.toList());
                        }
                        recordCount = requests.size();
                } else if ("USERS".equalsIgnoreCase(request.getReportType())) {
                        recordCount = userRepository.findAll().size();
                }

                report.setRecordCount(recordCount);
                report.setDownloadUrl("/api/reports/download/" + report.getReportId());

                return report;
        }
}
