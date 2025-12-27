package com.example.childPortal.service;
import com.example.childPortal.dto.StatusChangeRequestDTO;
import com.example.childPortal.model.*;
import com.example.childPortal.repository.UserRepository; import org.springframework.beans.factory.annotation.Autowired; import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
@Service
@Transactional
public class StatusManagementService {
@Autowired
private UserRepository userRepository;
@Autowired
private NotificationService notificationService;
    @Autowired
    private CaseService caseService;
    @Autowired
    private HelpRequestService helpRequestService;
  public Map<String, Object> changeUserStatus(String userId, StatusChangeRequestDTO request) {
    Map<String, Object> response = new HashMap<>(); User user = userRepository.findById(userId)
      .orElseThrow(() -> new RuntimeException("User not found"));
    if (user.getRole() != Role.PO && user.getRole() != Role.SW) {
      throw new RuntimeException("Only Police Officers and Social Workers can change status");
    }
    AvailabilityStatus oldStatus = user.getAvailabilityStatus(); 
    AvailabilityStatus newStatus = request.getNewStatus();
    
    if (!isValidStatusTransition(oldStatus, newStatus, user.getRole())) {
      throw new RuntimeException("Invalid status transition from " + oldStatus+ " to " + newStatus);
    }
    
    user.setAvailabilityStatus(newStatus); 
    user.setStatusNote(request.getNote());
    user.setStatusChangedAt(LocalDateTime.now());
    
    if (request.getMaxCapacity() != null) {
      user.setMaxCapacity(request.getMaxCapacity()); 
    }
        userRepository.save(user);
    
    logStatusChange(user, oldStatus, newStatus, request.getNote());
    sendStatusChangeNotifications(user, oldStatus, newStatus);
    handleStatusSpecificActions(user, newStatus);
    response.put("success", true);
    response.put("message", "Status updated successfully"); 
    response.put("oldStatus", oldStatus); response.put("newStatus", newStatus);
    response.put("statusChangedAt", user.getStatusChangedAt());
        return response;
    }
  public Map<String, Object> getUserStatusDetails(String userId) {
    Map<String, Object> details = new HashMap<>();
    
    User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
    details.put("userId", user.getId());
    details.put("fullName", user.getFullName());
    details.put("role", user.getRole());
    details.put("currentStatus", user.getAvailabilityStatus()); 
    details.put("statusNote", user.getStatusNote()); 
    details.put("statusChangedAt", user.getStatusChangedAt());
    details.put("maxCapacity", user.getMaxCapacity()); 
    details.put("canTakeMoreAssignments", user.canTakeMoreAssignments());
    if (user.getRole() == Role.PO) {
      details.put("currentCaseCount", user.getCurrentCaseCount()); 
      details.put("workloadPercentage",(double) user.getCurrentCaseCount() / user.getMaxCapacity() * 100); 
    } else if (user.getRole() == Role.SW) {
      details.put("currentHelpRequestCount", user.getCurrentHelpRequestCount()) details.put("workloadPercentage",(double) user.getCurrentHelpRequestCount() / user.getMaxCapacity() *;100);
    }
    if (user.getWorkSchedule() != null) { 
      details.put("isCurrentlyAvailableBySchedule",user.getWorkSchedule().isCurrentlyAvailable()); 
      details.put("workSchedule", user.getWorkSchedule());
    }
    return details;
  }
  
  public Map<String, Object> getAvailableUsersForAssignment(String role, String location,String caseType) {
    Map<String, Object> result = new HashMap<>(); Role userRole = Role.valueOf(role.toUpperCase());
    List<User> allUsers = userRepository.findByRole(userRole);
    List<Map<String, Object>> availableUsers = new ArrayList<>();
    for (User user : allUsers) {
      if (isUserSuitableForAssignment(user, location, caseType)) {
        Map<String, Object> userInfo = new HashMap<>();
        userInfo.put("userId", user.getId());
        userInfo.put("fullName", user.getFullName());
        userInfo.put("status", user.getAvailabilityStatus()); 
        userInfo.put("currentWorkload",user.getRole() == Role.PO ?user.getCurrentCaseCount() : user.getCurrentHelpRequestCount()); 
        userInfo.put("maxCapacity", user.getMaxCapacity()); 
        userInfo.put("workloadPercentage",(user.getRole() == Role.PO ?
                                           (double) user.getCurrentCaseCount() / user.getMaxCapacity() * 100:
                                           (double) user.getCurrentHelpRequestCount() / user.getMaxCapacity() * 100));
        if (user.getRole() == Role.PO) {
          PoliceOfficer officer = getPoliceOfficerByUserId(user.getId());
          if (officer != null) {
            userInfo.put("specialization", officer.getSpecialization());
            userInfo.put("jurisdictionArea", officer.getJurisdictionArea(
              ));
            userInfo.put("canHandleCaseType", officer.canHandleCaseType(CaseType.valueOf(caseType)));
          }
        } else if (user.getRole() == Role.SW) {
          SocialWorker worker = getSocialWorkerByUserId(user.getId());
          if (worker != null) {
            userInfo.put("specializations", worker.getSpecializations()); 
            userInfo.put("serviceArea", worker.getServiceArea());
            userInfo.put("languages", worker.getLanguages());
          } 
        }
            availableUsers.add(userInfo);
        }
    }
    availableUsers.sort((a, b) -> {
      double workloadA = (double) a.get("workloadPercentage");
      double workloadB = (double) b.get("workloadPercentage"); 
      AvailabilityStatus statusA = (AvailabilityStatus) a.get("status"); 
      AvailabilityStatus statusB = (AvailabilityStatus) b.get("status");
      if (statusA == AvailabilityStatus.EMERGENCY_ONLY && statusB != AvailabilityStatus.EMERGENCY_ONLY) { 
        return 1;
      } else if (statusB == AvailabilityStatus.EMERGENCY_ONLY && statusA != AvailabilityStatus.EMERGENCY_ONLY) {
        return -1; }
      return Double.compare(workloadA, workloadB);
    });
    result.put("availableUsers", availableUsers); 
    result.put("totalAvailable", availableUsers.size());
    return result;
}
  public void autoUpdateStatusBasedOnWorkload(String userId) {
    User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
    int currentWorkload = user.getRole() == Role.PO ? user.getCurrentCaseCount() : user.getCurrentHelpRequestCount();
    int maxCapacity = user.getMaxCapacity();
    AvailabilityStatus newStatus = user.getAvailabilityStatus();
    String note = null;
    if (currentWorkload >= maxCapacity && user.getAvailabilityStatus() != AvailabilityStatus.BUSY) { 
      newStatus = AvailabilityStatus.BUSY;note = "Auto-updated to BUSY due to full workload";
    } else if (currentWorkload <= maxCapacity * 0.5 && user.getAvailabilityStatus() == AvailabilityStatus.BUSY) {
        newStatus = AvailabilityStatus.AVAILABLE;
      note = "Auto-updated to AVAILABLE as workload reduced"; }
    if (newStatus != user.getAvailabilityStatus()) { 
      StatusChangeRequestDTO request = new StatusChangeRequestDTO(); 
      request.setNewStatus(newStatus);
      request.setNote(note);
      changeUserStatus(userId, request);
    }
}

  public Map<String, Object> getStatusStatistics(Role role) {
    Map<String, Object> stats = new HashMap<>();
    List<User> users = userRepository.findByRole(role);
    long totalUsers = users.size();
    long available = users.stream().filter(u -> u.getAvailabilityStatus() == AvailabilityStatus.AVAILABLE).count();
    long busy = users.stream().filter(u -> u.getAvailabilityStatus() == AvailabilityStatus.BUSY).count();
    long offDuty = users.stream().filter(u -> u.getAvailabilityStatus() == AvailabilityStatus.OFF_DUTY).count();
    long emergencyOnly = users.stream().filter(u -> u.getAvailabilityStatus() == AvailabilityStatus.EMERGENCY_ONLY).count();
double avgWorkload = users.stream() .mapToInt(u -> u.getRole() == Role.PO ?
                                              u.getCurrentCaseCount() : u.getCurrentHelpRequestCount()) .average()
  .orElse(0.0);
stats.put("totalUsers", totalUsers);
stats.put("available", available);
stats.put("busy", busy);
stats.put("offDuty", offDuty);
stats.put("emergencyOnly", emergencyOnly);
stats.put("availablePercentage", totalUsers > 0 ? (double) available / totalUsers * 100 : 0);
stats.put("averageWorkload", avgWorkload);
        return stats;
    }
private boolean isValidStatusTransition(AvailabilityStatus oldStatus, AvailabilityStatus newStatus,Role role) {
  Map<AvailabilityStatus, List<AvailabilityStatus>> validTransitions = new Hash Map<>();
  validTransitions.put(AvailabilityStatus.AVAILABLE, Arrays.asList( AvailabilityStatus.BUSY,AvailabilityStatus.OFF_DUTY, AvailabilityStatus.EMERGENCY_ONLY));
validTransitions.put(AvailabilityStatus.BUSY, Arrays.asList( AvailabilityStatus.AVAILABLE, AvailabilityStatus.OFF_DUTY, AvailabilityStatus.EMERGENCY_ONLY));
validTransitions.put(AvailabilityStatus.OFF_DUTY, Arrays.asList( AvailabilityStatus.AVAILABLE, AvailabilityStatus.EMERGENCY_ONLY));
validTransitions.put(AvailabilityStatus.EMERGENCY_ONLY, Arrays.asList( AvailabilityStatus.AVAILABLE,AvailabilityStatus.BUSY,AvailabilityStatus.OFF_DUTY));
return validTransitions.getOrDefault(oldStatus, new ArrayList<>())
        .contains(newStatus);
}
private void logStatusChange(User user, AvailabilityStatus oldStatus, AvailabilityStatus newStatus, String note) {
CaseTimelineDTO timelineEvent = new CaseTimelineDTO();
  timelineEvent.setEventType(CaseTimelineEvent.EventType.SYSTEM_AUTO_ACTION); 
  timelineEvent.setDescription(String.format("User %s changed status from %s to %s. Note: %s",user.getFullName(), oldStatus, newStatus, note != null ? note : "No note" ));
  timelineEvent.setPerformedByUserId(user.getId()); timelineEvent.setPerformedByName(user.getFullName());
  timelineEvent.setEventTime(LocalDateTime.now());
}
  private void sendStatusChangeNotifications(User user, AvailabilityStatus oldStatus, AvailabilityStatus newStatus) {
   notificationService.sendStatusChangeNotificationToAdmin( user.getId(),
    user.getFullName(),
    user.getRole(),
    oldStatus,
    newStatus,
    user.getStatusNote()
);
if (newStatus == AvailabilityStatus.OFF_DUTY) { 
  notificationService.sendOffDutyNotificationToTeam(
        user.getId(),
        user.getRole(),
        user.getStatusNote()
  ); 
}
  }
  private void handleStatusSpecificActions(User user, AvailabilityStatus newStatus) {
if (newStatus == AvailabilityStatus.OFF_DUTY) {
  if (user.getRole() == Role.PO) {
    autoTransferUrgentCases(user.getId());
  } else if (user.getRole() == Role.SW) {
    autoTransferUrgentHelpRequests(user.getId()); }
} else if (newStatus == AvailabilityStatus.EMERGENCY_ONLY) {
  notificationService.sendEmergencyOnlyStatusNotification(user.getId());
}
  }
  private boolean isUserSuitableForAssignment(User user, String location, String ca seType) {
        if (!user.canTakeMoreAssignments()) {
            return false;
        }
    if (user.getWorkSchedule() != null && !user.getWorkSchedule().isCurrentlyAvailable()) { 
      return false;
    }
    if (user.getRole() == Role.PO) {
      PoliceOfficer officer = getPoliceOfficerByUserId(user.getId()); 
      if (officer != null) {
        if (officer.getJurisdictionArea() != null &&location != null &&!isLocationInJurisdiction(location, officer.getJurisdictionArea())) {
            return false;
                }
        if (caseType != null && !officer.canHandleCaseType(CaseType.valueOf(caseType))) { 
          return false;
        }
      }
    } else if (user.getRole() == Role.SW) {
      SocialWorker worker = getSocialWorkerByUserId(user.getId()); 
      if (worker != null) {
        if (worker.getServiceArea() != null &&
            location != null &&
            !isLocationInServiceArea(location, worker.getServiceArea())) { 
          return false;
        } 
      }
    }
        return true;
    }
private PoliceOfficer getPoliceOfficerByUserId(String userId) { 
  return null; 
}
private SocialWorker getSocialWorkerByUserId(String userId) { 
return null; 
}
private boolean isLocationInJurisdiction(String location, String jurisdictionArea ){
return location.toLowerCase().contains(jurisdictionArea.toLowerCase()) || jurisdictionArea.toLowerCase().contains(location.toLowerCase());
}
private boolean isLocationInServiceArea(String location, String serviceArea) { 
return location.toLowerCase().contains(serviceArea.toLowerCase()) ||
serviceArea.toLowerCase().contains(location.toLowerCase());
}
private void autoTransferUrgentCases(String officerId) {
}
private void autoTransferUrgentHelpRequests(String workerId) {
  
} 
}

                                          



  












