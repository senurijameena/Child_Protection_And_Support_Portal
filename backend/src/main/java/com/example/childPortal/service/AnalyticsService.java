package com.example.childPortal.service;
import com.example.childPortal.dto.*;
import java.time.LocalDateTime; 
import java.util.List;
import java.util.Map;

public interface AnalyticsService { 
    CaseStatisticsDTO getCaseStatistics(LocalDateTime startDate, LocalDateTime endDate);
Map<String, Long> getCaseStatusDistribution();
Map<String, Long> getCasetypeDistribution();
List<CaseTrendDTO> getCaseTrends(String period);

HelpRequestStatisticsDTO getHelpRequestStatistics(LocalDateTime startDate, LocalD ateTime endDate);
Map<String, Long> getHelpTypeDistribution(); 
Map<String, Long> getHelpRequestStatusDistribution();

UserStatisticsDTO getUserStatistics();
Map<String, Long> getUserRoleDistribution(); 
List<UserActivityDTO> getMostActiveUsers(int limit);

ResponseTimeMetricsDTO getResponseTimeMetrics(); 
ResolutionRateDTO getResolutionRates();

List<LocationAnalyticsDTO> getLocationAnalytics();
Map<String, Long> getCaseDistributionByLocation();

DashboardMetricsDTO getDashboardMetrics();

CustomReportDTO generateCustomReport(ReportRequestDTO request); 
}

    
