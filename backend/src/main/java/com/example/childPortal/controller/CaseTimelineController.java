package com.example.childPortal.controller;

import com.example.childPortal.dto.CaseTimelineDTO;
import com.example.childPortal.dto.TimelineFilterDTO;
import com.example.childPortal.service.CaseTimelineService; 
import org.springframework.beans.factory.annotation.Autowired; 
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*; 
import java.util.List;

@RestController 
@RequestMapping("/api/timeline") 
@CrossOrigin(origins = "*")
public class CaseTimelineController {
  @Autowired
  private CaseTimelineService caseTimelineService;
  
  @GetMapping("/case/{caseId}")
  public ResponseEntity<List<CaseTimelineDTO>> getCaseTimeline(@PathVariable String caseId) {
    List<CaseTimelineDTO> timeline = caseTimelineService.getTimelineForCase(caseId); 
    return ResponseEntity.ok(timeline);
  }
  
  @GetMapping("/help-request/{helpRequestId}")
  public ResponseEntity<List<CaseTimelineDTO>> getHelpRequestTimeline(@PathVariable String helpRequestId) {
    List<CaseTimelineDTO> timeline = caseTimelineService.getTimelineForHelpRequest(helpRequestId);
    return ResponseEntity.ok(timeline); 
  }
  
  @PostMapping("/filter")
  public ResponseEntity<List<CaseTimelineDTO>> getFilteredTimeline(@RequestBody TimelineFilterDTO filter) {
    List<CaseTimelineDTO> timeline = caseTimelineService.getFilteredTimeline(filter);
    return ResponseEntity.ok(timeline); 
  }
  
  @GetMapping("/recent")
  public ResponseEntity<List<CaseTimelineDTO>> getRecentActivity(@RequestParam(defaultValue = "10") int limit) {
    List<CaseTimelineDTO> recentActivity = caseTimelineService.getRecentActivity(limit);
    return ResponseEntity.ok(recentActivity); 
  }
  
  @GetMapping("/event/{eventId}")
  public ResponseEntity<CaseTimelineDTO> getTimelineEvent(@PathVariable String eventId) {
    CaseTimelineDTO event = caseTimelineService.getTimelineEvent(eventId); 
    return event != null ?
      ResponseEntity.ok(event) :
      ResponseEntity.notFound().build(); 
  }

  @GetMapping("/case/{caseId}/count")
  public ResponseEntity<Long> getEventCount(@PathVariable String caseId) {
    long count = caseTimelineService.getEventCountForCase(caseId);
    return ResponseEntity.ok(count);
  }
  
  @PostMapping("/create")
  public ResponseEntity<String> createTimelineEvent(@RequestBody CaseTimelineDTO timelineDTO) {
    caseTimelineService.createTimelineEvent(timelineDTO);
    return ResponseEntity.ok("Timeline event created successfully"); 
  }
  
  @DeleteMapping("/event/{eventId}")
  public ResponseEntity<String> deleteTimelineEvent(@PathVariable String eventId) {
    caseTimelineService.deleteTimelineEvent(eventId);
    return ResponseEntity.ok("Timeline event deleted successfully"); 
  }
}