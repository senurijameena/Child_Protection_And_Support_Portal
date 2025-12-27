package com.example.childPortal.service;
import com.example.childPortal.model.*;
import com.example.childPortal.repository.UserRepository; 
import org.springframework.beans.factory.annotation.Autowired; 
import org.springframework.stereotype.Service;
import java.util.Comparator; 
import java.util.List;
import java.util.stream.Collectors;
@Service
public class EnhancedTransferService {
@Autowired
private UserRepository userRepository;
@Autowired
private StatusManagementService statusManagementService;
public List<User> findSuitableRecipientsForTransfer(User currentUser, String entityType,String location,boolean isEmergency) {
  Role targetRole = entityType.equals("CASE") ? Role.PO : Role.SW;
  List<User> allUsers = userRepository.findByRole(targetRole);
  return allUsers.stream().filter(user -> !user.getId().equals(currentUser.getId()))
.filter(user -> isUserSuitableForTransfer(user, location, isEmergency)) .sorted(Comparator.comparing(this::calculateTransferSuitabilityScore).reversed())
    .limit(10) 
    .collect(Collectors.toList());
}
  private boolean isUserSuitableForTransfer(User user, String location, boolean isE mergency) {
        if (!user.canTakeMoreAssignments()) {
            return false;
}
if (isEmergency) {
return user.isAvailableForEmergency();
}
if (user.getAvailabilityStatus() == AvailabilityStatus.EMERGENCY_ONLY) { 
  return false;
}
if (user.getAvailabilityStatus() == AvailabilityStatus.OFF_DUTY) {
  return false;
}
    if (user.getWorkSchedule() != null && !user.getWorkSchedule().isCurrentlyAvailable()) { 
      return false;
}
    return true;
}
private double calculateTransferSuitabilityScore(User user) { double score = 0;
    switch (user.getAvailabilityStatus()) {
        case AVAILABLE:
        score += 1.0;
            break;
       case BUSY:
        score += 0.5;
        break;
        case EMERGENCY_ONLY:
        score += 0.3;
        break;
        case OFF_DUTY:
        score = 0;
        break; 
    }
int currentWorkload = user.getRole() == Role.PO ? user.getCurrentCaseCount() : user.getCurrentHelpRequestCount();
double workloadRatio = (double) currentWorkload / user.getMaxCapacity(); score += (1 - workloadRatio) * 0.8; 
    return score;
}
  public boolean validateTransferRequest(String fromUserId, String toUserId, boolean isEmergency) {
User toUser = userRepository.findById(toUserId)
.orElseThrow(() -> new RuntimeException("Recipient not found"));
if (!isUserSuitableForTransfer(toUser, null, isEmergency)) { return false;
}
        return toUser.canTakeMoreAssignments();
    }
}
