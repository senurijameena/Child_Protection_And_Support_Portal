package com.example.childPortal.controller;
  import com.example.childPortal.dto.*;
  import com.example.childPortal.service.AnalyticsService;
  import org.springframework.beans.factory.annotation.Autowired; 
  import org.springframework.format.annotation.DateTimeFormat; 
  import org.springframework.http.ResponseEntity;
  import org.springframework.security.access.prepost.PreAuthorize; 
  import org.springframework.web.bind.annotation.*;
  import java.time.LocalDateTime;
  import java.util.List;
  import java.util.Map;

@RestController 
@RequestMapping("/api/analytics") 
@CrossOrigin(origins = "*") 
@PreAuthorize("hasRole('ADMIN')") public class AnalyticsController {

@Autowired
  private AnalyticsService analyticsService;

@GetMapping("/dashboard")
  public ResponseEntity<DashboardMetricsDTO> getDashboardMetrics() {
    DashboardMetricsDTO metrics = analyticsService.getDashboardMetrics();
      return ResponseEntity.ok(metrics);
    }

@GetMapping("/cases/statistics")
  public ResponseEntity<CaseStatisticsDTO> getCaseStatistics(
    @RequestParam(required = false)
    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
    @RequestParam(required = false)
    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
if (startDate == null) {
startDate = LocalDateTime.now().minusDays(30);
        }
        if (endDate == null) {
            endDate = LocalDateTime.now();
        }
  CaseStatisticsDTO statistics = analyticsService.getCaseStatistics(startDate, endDate);
        return ResponseEntity.ok(statistics);
    }

@GetMapping("/cases/status-distribution")
  public ResponseEntity<Map<String, Long>> getCaseStatusDistribution() {
  Map<String, Long> distribution = analyticsService.getCaseStatusDistribution();
}
  return ResponseEntity.ok(distribution);

@GetMapping("/cases/type-distribution")
  public ResponseEntity<Map<String, Long>> getCaseTypeDistribution() {
  Map<String, Long> distribution = analyticsService.getCaseTypeDistribution();
    return ResponseEntity.ok(distribution);
}

@GetMapping("/cases/trends")
  public ResponseEntity<List<CaseTrendDTO>> getCaseTrends( 
    @RequestParam(defaultValue = "monthly") String period) {
    List<CaseTrendDTO> trends = analyticsService.getCaseTrends(period);
      return ResponseEntity.ok(trends);
}

@GetMapping("/help-requests/statistics")
  public ResponseEntity<HelpRequestStatisticsDTO> getHelpRequestStatistics(

    @RequestParam(required = false)
    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
    @RequestParam(required = false)
    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
    if (startDate == null) {
  startDate = LocalDateTime.now().minusDays(30);
    }
    if (endDate == null) {
        endDate = LocalDateTime.now();
    }
HelpRequestStatisticsDTO statistics = analyticsService.getHelpRequestStatistics(startDate, endDate);
    return ResponseEntity.ok(statistics);
}

@GetMapping("/users/statistics")
  public ResponseEntity<UserStatisticsDTO> getUserStatistics() {
  UserStatisticsDTO statistics = analyticsService.getUserStatistics();
    return ResponseEntity.ok(statistics);
}

@GetMapping("/users/activity")
  public ResponseEntity<List<UserActivityDTO>> getMostActiveUsers(
@RequestParam(defaultValue = "10") int limit) {
  List<UserActivityDTO> activeUsers = analyticsService.getMostActiveUsers(limit
    return ResponseEntity.ok(activeUsers);
}

@GetMapping("/performance/response-times")
  public ResponseEntity<ResponseTimeMetricsDTO> getResponseTimeMetrics() {
    ResponseTimeMetricsDTO metrics = analyticsService.getResponseTimeMetrics();
    return ResponseEntity.ok(metrics);
}

@GetMapping("/performance/resolution-rates")
  public ResponseEntity<ResolutionRateDTO> getResolutionRates() {
    ResolutionRateDTO rates = analyticsService.getResolutionRates();
    return ResponseEntity.ok(rates);
}

@GetMapping("/geographical/locations")
  public ResponseEntity<List<LocationAnalyticsDTO>> getLocationAnalytics() {
  List<LocationAnalyticsDTO> analytics = analyticsService.getLocationAnalytics();
  return ResponseEntity.ok(analytics);
}

@PostMapping("/reports/custom")
  public ResponseEntity<CustomReportDTO> generateCustomReport(
    @RequestBody ReportRequestDTO request) {
    CustomReportDTO report = analyticsService.generateCustomReport(request); 
    return ResponseEntity.ok(report);
}

@GetMapping("/realtime/updates")
  public ResponseEntity<RealtimeUpdatesDTO> getRealtimeUpdates() {
  DashboardMetricsDTO metrics = analyticsService.getDashboardMetrics(); 
  RealtimeUpdatesDTO updates = new RealtimeUpdatesDTO(); 
  updates.setMetrics(metrics); 
  updates.setTimestamp(LocalDateTime.now());
        return ResponseEntity.ok(updates);
    }
}
