package com.example.childPortal.service.impl;

import com.example.childPortal.dto.HelpRequestDTO;
import com.example.childPortal.dto.HelpResponse;
import com.example.childPortal.model.HelpRequest;
import com.example.childPortal.model.HelpType;
import com.example.childPortal.model.Priority;
import com.example.childPortal.model.Role;
import com.example.childPortal.model.User;
import com.example.childPortal.model.ServicePackage;
import com.example.childPortal.model.ServiceItemExecution;
import com.example.childPortal.repository.HelpRequestRepository;
import com.example.childPortal.repository.ServicePackageRepository;
import com.example.childPortal.repository.UserRepository;
import com.example.childPortal.service.HelpRequestService;
import com.example.childPortal.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class HelpRequestServiceImpl implements HelpRequestService {

    @Autowired
    private HelpRequestRepository helpRequestRepository;

    @Autowired
    private ServicePackageRepository servicePackageRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired(required = false)
    private NotificationService notificationService;

    @Autowired(required = false)
    private com.example.childPortal.service.SocialWorkerService socialWorkerService;

    @Autowired
    private com.example.childPortal.service.CaseTimelineService timelineService;

    @Autowired(required = false)
    private com.example.childPortal.service.FollowUpService followUpService;

    @Override
    public HelpResponse createHelpRequest(HelpRequestDTO helpRequestDTO, String requesterUserId) {
        try {
            List<HelpRequest> similarRequests = helpRequestRepository
                    .findByLocationAndApproximateAgeAndGenderAndHelpType(
                            helpRequestDTO.getLocation(),
                            helpRequestDTO.getApproximateAge(),
                            helpRequestDTO.getGender(),
                            helpRequestDTO.getHelpType());

            if (!similarRequests.isEmpty()) {
                LocalDateTime oneDayAgo = LocalDateTime.now().minusDays(1);
                long recentDuplicates = similarRequests.stream()
                        .filter(req -> req.getRequestDate().isAfter(oneDayAgo))
                        .count();

                if (recentDuplicates > 0) {
                    return new HelpResponse(
                            null,
                            "A similar help request was made recently. Please check if you need to submit again.",
                            false);
                }
            }

            HelpRequest helpRequest = new HelpRequest();
            helpRequest.setRequesterUserId(requesterUserId);

            String name = "Unknown";
            if (requesterUserId != null) {
                name = userRepository.findById(requesterUserId).map(User::getFullName).orElse("Unknown");
            }
            helpRequest.setRequesterName(name);
            helpRequest.setAnonymous(helpRequestDTO.isAnonymous());
            helpRequest.setApproximateAge(helpRequestDTO.getApproximateAge());
            helpRequest.setGender(helpRequestDTO.getGender());
            helpRequest.setIdentificationMarks(helpRequestDTO.getIdentificationMarks());
            helpRequest.setHelpType(helpRequestDTO.getHelpType());
            helpRequest.setDescription(helpRequestDTO.getDescription());
            helpRequest.setLocation(helpRequestDTO.getLocation());
            helpRequest.setDocumentUrls(helpRequestDTO.getDocumentUrls());

            helpRequest
                    .setPriority(helpRequestDTO.getPriority() != null ? helpRequestDTO.getPriority() : Priority.MEDIUM);

            // Generate sequential tracking ID based on anonymous status (before saving)
            // Extract max number from existing tracking IDs to ensure proper sequencing
            String prefix = helpRequestDTO.isAnonymous() ? "ANON-H-" : "HELP-";
            // Use regex to find tracking IDs starting with the prefix (only non-null
            // trackingIds will match)
            String regexPrefix = "^" + java.util.regex.Pattern.quote(prefix);
            List<HelpRequest> existingRequests = helpRequestRepository.findByTrackingIdStartingWith(regexPrefix);
            long maxNumber = 0;

            for (HelpRequest existingRequest : existingRequests) {
                // The query already filters by trackingId pattern, so these should all have
                // valid trackingIds
                String existingTrackingId = existingRequest.getTrackingId();
                if (existingTrackingId != null && existingTrackingId.startsWith(prefix)) {
                    try {
                        // Extract number from tracking ID (e.g., "HELP-0001" -> 1, "ANON H-0001" -> 1)
                        String numberPart = existingTrackingId.substring(prefix.length());
                        long number = Long.parseLong(numberPart);
                        if (number > maxNumber) {
                            maxNumber = number;
                        }
                    } catch (NumberFormatException e) {
                        // Skip invalid tracking IDs
                    }
                }
            }

            long nextNumber = maxNumber + 1;
            String trackingId = prefix + String.format("%04d", nextNumber);
            helpRequest.setTrackingId(trackingId);

            HelpRequest savedHelpRequest = helpRequestRepository.save(helpRequest);

            // Send notification (app notification only for anonymous, email + app for
            // non-anonymous)
            if (notificationService != null && requesterUserId != null) {
                notificationService.sendHelpRequestCreatedNotification(requesterUserId, savedHelpRequest.getId(),
                        savedHelpRequest.getTrackingId(), helpRequestDTO.isAnonymous());
            }
            // Notify admins of new help request
            if (notificationService != null) {
                notificationService.sendHelpRequestCreatedNotificationToAdmin(savedHelpRequest.getId(),
                        savedHelpRequest.getTrackingId(),
                        savedHelpRequest.getHelpType() != null ? savedHelpRequest.getHelpType().name() : null);
            }

            return new HelpResponse(savedHelpRequest.getId(), "Help request submitted successfully", true);
        } catch (Exception e) {
            return new HelpResponse(null, "Failed to submit help request: " + e.getMessage(), false);
        }
    }

    @Override
    public HelpRequestDTO getHelpRequestById(String requestId) {
        // Try finding by ID first (UUID)
        Optional<HelpRequest> request = helpRequestRepository.findById(requestId);

        // If not found, try finding by trackingId as a fallback
        if (request.isEmpty()) {
            request = helpRequestRepository.findByTrackingId(requestId);
        }

        return request.map(this::convertToFilteredDTO).orElse(null);
    }

    @Override
    public List<HelpRequestDTO> getHelpRequestsByRequester(String requesterUserId) {
        if (requesterUserId == null || requesterUserId.isEmpty() || "anonymousUser".equals(requesterUserId)) {
            return java.util.Collections.emptyList();
        }
        return helpRequestRepository.findByRequesterUserId(requesterUserId).stream()
                .map(this::convertToFilteredDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<HelpRequestDTO> getAllHelpRequests() {
        return helpRequestRepository.findAll().stream()
                .map(this::convertToFilteredDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<HelpRequestDTO> getHelpRequestsByStatus(HelpRequest.RequestStatus status) {
        return helpRequestRepository.findByStatus(status).stream()
                .map(this::convertToFilteredDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<HelpRequestDTO> getHelpRequestsByType(HelpType helpType) {
        return helpRequestRepository.findByHelpType(helpType).stream()
                .map(this::convertToFilteredDTO)
                .collect(Collectors.toList());
    }

    @Override
    public HelpRequestDTO updateHelpRequestStatus(String requestId, HelpRequest.RequestStatus status,
            String updatedBy) {
        return helpRequestRepository.findById(requestId)
                .map(helpRequest -> {
                    // Before allowing a request to be marked as COMPLETED (case closed),
                    // ensure every collaborator-delivered service item is finished.
                    if (status == HelpRequest.RequestStatus.COMPLETED
                            && helpRequest.getAppliedPackageItemExecutions() != null
                            && !helpRequest.getAppliedPackageItemExecutions().isEmpty()) {
                        boolean allDone = helpRequest.getAppliedPackageItemExecutions().stream()
                                .allMatch(ex -> "COMPLETED".equalsIgnoreCase(ex.getStatus()));
                        if (!allDone) {
                            throw new ResponseStatusException(
                                    HttpStatus.CONFLICT,
                                    "Case cannot be closed: one or more collaborator tasks are still in progress.");
                        }
                    }

                    HelpRequest.RequestStatus oldStatus = helpRequest.getStatus();
                    helpRequest.setStatus(status);
                    helpRequest.setLastUpdated(LocalDateTime.now());
                    if (status == HelpRequest.RequestStatus.COMPLETED) {
                        helpRequest.setCompletionDate(LocalDateTime.now());
                    }
                    helpRequestRepository.save(helpRequest);

                    if (timelineService != null) {
                        try {
                            String updaterName = userRepository.findById(updatedBy).map(User::getFullName)
                                    .orElse("Unknown");
                            timelineService.createHelpRequestStatusChangeEvent(
                                    requestId,
                                    updatedBy,
                                    updaterName,
                                    oldStatus,
                                    status,
                                    "Status updated to " + status);
                        } catch (Exception e) {
                            System.err.println("Error adding timeline event: " + e.getMessage());
                        }
                    }

                    // Notify Requester
                    if (notificationService != null && helpRequest.getRequesterUserId() != null) {
                        try {
                            notificationService.sendHelpRequestUpdate(
                                    helpRequest.getRequesterUserId(),
                                    helpRequest.getId(),
                                    status.toString(),
                                    helpRequest.isAnonymous());
                        } catch (Exception e) {
                            System.err.println("Error notifying requester: " + e.getMessage());
                        }
                    }

                    // Notify Admin
                    if (notificationService != null) {
                        try {
                            notificationService.sendHelpRequestUpdateToAdmin(
                                    helpRequest.getId(),
                                    status.toString(),
                                    updatedBy,
                                    helpRequest.getTrackingId());
                        } catch (Exception e) {
                            System.err.println("Error notifying admin: " + e.getMessage());
                        }
                    }

                    return convertToFilteredDTO(helpRequest);
                })
                .orElse(null);
    }

    @Override
    public HelpRequestDTO assignHelpRequestToWorker(String requestId, String workerId, String assignedBy) {
        return helpRequestRepository.findById(requestId)
                .map(helpRequest -> {
                    helpRequest.setAssignedWorkerId(workerId);
                    helpRequest.setStatus(HelpRequest.RequestStatus.ASSIGNED);
                    helpRequest.setLastUpdated(LocalDateTime.now());
                    HelpRequest savedRequest = helpRequestRepository.save(helpRequest);

                    // Send notification to the assigned social worker
                    if (notificationService != null) {
                        try {
                            notificationService.sendHelpRequestAssignmentNotification(
                                    workerId,
                                    savedRequest.getId(),
                                    savedRequest.getTrackingId(),
                                    savedRequest.getPriority().toString(),
                                    savedRequest.isAnonymous());
                        } catch (Exception e) {
                            System.err.println("Error sending assignment notification: " + e.getMessage());
                        }

                        // Notify Requester
                        if (savedRequest.getRequesterUserId() != null) {
                            try {
                                notificationService.sendHelpRequestUpdate(
                                        savedRequest.getRequesterUserId(),
                                        savedRequest.getId(),
                                        "ASSIGNED",
                                        savedRequest.isAnonymous());
                            } catch (Exception e) {
                                System.err.println("Error notifying requester of assignment: " + e.getMessage());
                            }
                        }

                        // Notify Admin
                        try {
                            notificationService.sendHelpRequestUpdateToAdmin(
                                    savedRequest.getId(),
                                    "ASSIGNED",
                                    assignedBy,
                                    savedRequest.getTrackingId());
                        } catch (Exception e) {
                            System.err.println("Error notifying admin of assignment: " + e.getMessage());
                        }
                    }

                    return convertToFilteredDTO(savedRequest);
                })
                .orElse(null);
    }

    @Override
    public boolean deleteHelpRequest(String requestId) {
        if (helpRequestRepository.existsById(requestId)) {
            helpRequestRepository.deleteById(requestId);
            return true;
        }
        return false;
    }

    @Override
    public HelpRequestDTO updateHelpRequestNotes(String requestId, String notes, String updatedBy) {
        return helpRequestRepository.findById(requestId)
                .map(helpRequest -> {
                    // Start of Update Notes Logic
                    // Currently HelpRequest model doesn't have a specific 'notes' field for social
                    // workers,
                    // but we can log this as a timeline event which serves as a progress note.

                    if (timelineService != null && notes != null && !notes.trim().isEmpty()) {
                        try {
                            String updaterName = userRepository.findById(updatedBy).map(User::getFullName)
                                    .orElse("Unknown");
                            timelineService.createHelpRequestNoteAddedEvent(
                                    requestId,
                                    updatedBy,
                                    updaterName,
                                    notes);
                        } catch (Exception e) {
                            System.err.println("Error adding timeline note: " + e.getMessage());
                        }
                    }

                    helpRequest.setLastUpdated(LocalDateTime.now());
                    helpRequestRepository.save(helpRequest);

                    return convertToFilteredDTO(helpRequest);
                })
                .orElse(null);
    }

    @Override
    public List<HelpRequestDTO> searchHelpRequestsByLocation(String location) {
        return helpRequestRepository.findByLocationContainingIgnoreCase(location).stream()
                .map(this::convertToFilteredDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<HelpRequestDTO> getHelpRequestsByWorker(String workerId) {
        System.out.println("Fetching requests for workerId: " + workerId);
        // Find requests assigned to this ID
        List<HelpRequest> requests = new java.util.ArrayList<>(helpRequestRepository.findByAssignedWorkerId(workerId));
        System.out.println("Found " + requests.size() + " requests directly assigned to " + workerId);

        // If this is a User ID, also check if there's a SocialWorker profile and find
        // requests assigned to its ID
        if (socialWorkerService != null) {
            try {
                java.util.Optional<com.example.childPortal.model.SocialWorker> profile = socialWorkerService
                        .getSocialWorkerByUserId(workerId);
                if (profile.isPresent()) {
                    String profileId = profile.get().getId();
                    System.out.println("Found SocialWorker profile ID: " + profileId);
                    if (profileId != null && !workerId.equals(profileId)) {
                        List<HelpRequest> profileRequests = helpRequestRepository.findByAssignedWorkerId(profileId);
                        System.out.println(
                                "Found " + profileRequests.size() + " requests assigned to profile ID " + profileId);
                        for (HelpRequest pr : profileRequests) {
                            if (requests.stream().noneMatch(existing -> existing.getId().equals(pr.getId()))) {
                                requests.add(pr);
                            }
                        }
                    }
                } else {
                    System.out.println("No SocialWorker profile found for userId: " + workerId);
                }
            } catch (Exception e) {
                System.err.println("Error in getHelpRequestsByWorker profile lookup: " + e.getMessage());
            }
        } else {
            System.out.println("SocialWorkerService is null");
        }

        System.out.println("Returning total " + requests.size() + " requests for worker " + workerId);

        return requests.stream()
                .map(this::convertToFilteredDTO)
                .collect(Collectors.toList());
    }

    @Override
    public HelpRequestDTO rejectHelpRequest(String requestId, String reason, String rejectedBy) {
        return helpRequestRepository.findById(requestId)
                .map(helpRequest -> {
                    helpRequest.setStatus(HelpRequest.RequestStatus.REJECTED);
                    helpRequest.setLastUpdated(LocalDateTime.now());

                    String currentNotes = helpRequest.getRequestNotes();
                    String rejectionNote = "Rejected: " + reason;
                    if (currentNotes != null && !currentNotes.isEmpty()) {
                        helpRequest.setRequestNotes(currentNotes + "\n" + rejectionNote);
                    } else {
                        helpRequest.setRequestNotes(rejectionNote);
                    }

                    helpRequestRepository.save(helpRequest);

                    helpRequestRepository.save(helpRequest);

                    // Notify Requester
                    if (notificationService != null && helpRequest.getRequesterUserId() != null) {
                        try {
                            notificationService.sendHelpRequestUpdate(
                                    helpRequest.getRequesterUserId(),
                                    helpRequest.getId(),
                                    "REJECTED",
                                    helpRequest.isAnonymous());
                        } catch (Exception e) {
                            System.err.println("Error notifying requester of rejection: " + e.getMessage());
                        }
                    }

                    // Notify Admin
                    if (notificationService != null) {
                        try {
                            notificationService.sendHelpRequestUpdateToAdmin(
                                    helpRequest.getId(),
                                    "REJECTED",
                                    rejectedBy,
                                    helpRequest.getTrackingId());
                        } catch (Exception e) {
                            System.err.println("Error notifying admin of rejection: " + e.getMessage());
                        }
                    }

                    return convertToFilteredDTO(helpRequest);
                })
                .orElse(null);
    }

    @Override
    public HelpRequestDTO acceptHelpRequest(String requestId, String acceptedBy) {
        return helpRequestRepository.findById(requestId)
                .map(helpRequest -> {
                    String assigned = helpRequest.getAssignedWorkerId();
                    boolean isAssignedToUser = assigned != null && assigned.equals(acceptedBy);
                    boolean isAssignedViaProfile = false;
                    if (socialWorkerService != null && !isAssignedToUser) {
                        isAssignedViaProfile = socialWorkerService.getSocialWorkerByUserId(acceptedBy)
                                .map(sw -> sw.getId() != null && sw.getId().equals(assigned))
                                .orElse(false);
                    }
                    if (!isAssignedToUser && !isAssignedViaProfile) {
                        return null;
                    }
                    helpRequest.setStatus(HelpRequest.RequestStatus.IN_PROGRESS);
                    helpRequest.setLastUpdated(LocalDateTime.now());
                    String currentNotes = helpRequest.getRequestNotes();
                    String acceptNote = "Accepted by worker and service started.";
                    if (currentNotes != null && !currentNotes.isEmpty()) {
                        helpRequest.setRequestNotes(currentNotes + "\n" + acceptNote);
                    } else {
                        helpRequest.setRequestNotes(acceptNote);
                    }
                    helpRequestRepository.save(helpRequest);

                    if (notificationService != null && helpRequest.getRequesterUserId() != null) {
                        try {
                            notificationService.sendHelpRequestUpdate(
                                    helpRequest.getRequesterUserId(),
                                    helpRequest.getId(),
                                    "IN_PROGRESS",
                                    helpRequest.isAnonymous());
                        } catch (Exception e) {
                            System.err.println("Error notifying requester of acceptance: " + e.getMessage());
                        }
                    }
                    if (notificationService != null) {
                        try {
                            notificationService.sendHelpRequestUpdateToAdmin(
                                    helpRequest.getId(),
                                    "IN_PROGRESS",
                                    acceptedBy,
                                    helpRequest.getTrackingId());
                        } catch (Exception e) {
                            System.err.println("Error notifying admin of acceptance: " + e.getMessage());
                        }
                    }
                    return convertToFilteredDTO(helpRequest);
                })
                .orElse(null);
    }

    @Override
    public HelpRequestDTO declineHelpRequest(String requestId, String reason, String declinedBy) {
        return helpRequestRepository.findById(requestId)
                .map(helpRequest -> {
                    helpRequest.setAssignedWorkerId(null);
                    helpRequest.setStatus(HelpRequest.RequestStatus.UNDER_REVIEW);
                    helpRequest.setLastUpdated(LocalDateTime.now());
                    String currentNotes = helpRequest.getRequestNotes();
                    String declineNote = "Declined by worker: " + reason;
                    if (currentNotes != null && !currentNotes.isEmpty()) {
                        helpRequest.setRequestNotes(currentNotes + "\n" + declineNote);
                    } else {
                        helpRequest.setRequestNotes(declineNote);
                    }
                    helpRequestRepository.save(helpRequest);

                    if (notificationService != null) {
                        try {
                            notificationService.sendHelpRequestUpdateToAdmin(
                                    helpRequest.getId(),
                                    "DECLINED",
                                    declinedBy + " - " + reason,
                                    helpRequest.getTrackingId());
                        } catch (Exception e) {
                            System.err.println("Error notifying admin of decline: " + e.getMessage());
                        }
                    }
                    return convertToFilteredDTO(helpRequest);
                })
                .orElse(null);
    }

    @Override
    public HelpRequestDTO addDocumentToHelpRequest(String requestId, String documentUrl) {
        return helpRequestRepository.findById(requestId)
                .map(helpRequest -> {
                    List<String> docs = helpRequest.getDocumentUrls();
                    if (docs == null) {
                        docs = new java.util.ArrayList<>();
                    }
                    docs.add(documentUrl);
                    helpRequest.setDocumentUrls(docs);
                    helpRequest.setLastUpdated(LocalDateTime.now());
                    helpRequestRepository.save(helpRequest);
                    return convertToFilteredDTO(helpRequest);
                })
                .orElse(null);
    }

    @Override
    public HelpRequestDTO applyServicePackageToRequest(String requestId, String packageId, String appliedBy) {
        return helpRequestRepository.findById(requestId)
                .map(helpRequest -> {
                    ServicePackage servicePackage = servicePackageRepository.findById(packageId)
                            .orElseThrow(() -> new RuntimeException("Service package not found"));

                    HelpRequest.RequestStatus oldStatus = helpRequest.getStatus();
                    helpRequest.setAppliedServicePackageId(servicePackage.getId());
                    helpRequest.setAppliedServicePackageAppliedAt(LocalDateTime.now());
                    helpRequest.setAppliedServicePackageStatus("PENDING");
                    helpRequest.setStatus(HelpRequest.RequestStatus.PACKAGE_PROPOSED);
                    helpRequest.setLastUpdated(LocalDateTime.now());

                    helpRequestRepository.save(helpRequest);

                    if (timelineService != null) {
                        try {
                            String updaterName = userRepository.findById(appliedBy).map(User::getFullName)
                                    .orElse("Unknown");
                            timelineService.createHelpRequestStatusChangeEvent(
                                    requestId,
                                    appliedBy,
                                    updaterName,
                                    oldStatus,
                                    HelpRequest.RequestStatus.PACKAGE_PROPOSED,
                                    "Service package proposed: " + servicePackage.getTitle());
                        } catch (Exception e) {
                            System.err.println("Error adding timeline event for package proposal: " + e.getMessage());
                        }
                    }

                    if (notificationService != null && helpRequest.getRequesterUserId() != null) {
                        try {
                            notificationService.sendHelpRequestUpdate(
                                    helpRequest.getRequesterUserId(),
                                    helpRequest.getId(),
                                    "PACKAGE_PROPOSED",
                                    helpRequest.isAnonymous());
                        } catch (Exception e) {
                            System.err.println("Error notifying requester of package proposal: " + e.getMessage());
                        }
                    }

                    if (notificationService != null) {
                        try {
                            notificationService.sendHelpRequestUpdateToAdmin(
                                    helpRequest.getId(),
                                    "PACKAGE_PROPOSED",
                                    appliedBy,
                                    helpRequest.getTrackingId());
                        } catch (Exception e) {
                            System.err.println("Error notifying admin of package proposal: " + e.getMessage());
                        }
                    }

                    return convertToFilteredDTO(helpRequest);
                })
                .orElse(null);
    }

    @Override
    public HelpRequestDTO acceptAppliedPackage(String requestId, String acceptedByUserId) {
        return helpRequestRepository.findById(requestId)
                .map(helpRequest -> {
                    if (helpRequest.getAppliedServicePackageId() == null) {
                        return null;
                    }
                    if (!acceptedByUserId.equals(helpRequest.getRequesterUserId())) {
                        return null;
                    }
                    if (!"PENDING".equals(helpRequest.getAppliedServicePackageStatus())) {
                        return convertToFilteredDTO(helpRequest);
                    }
                    helpRequest.setAppliedServicePackageStatus("ACCEPTED");
                    helpRequest.setStatus(HelpRequest.RequestStatus.IN_PROGRESS);
                    helpRequest.setLastUpdated(LocalDateTime.now());
                    // Initialize per-service executions as PENDING
                    ServicePackage pkg = servicePackageRepository.findById(helpRequest.getAppliedServicePackageId())
                            .orElse(null);
                    if (pkg != null && pkg.getItems() != null && !pkg.getItems().isEmpty()) {
                        List<ServiceItemExecution> executions = new java.util.ArrayList<>();
                        for (String item : pkg.getItems()) {
                            executions.add(new ServiceItemExecution(item, "PENDING"));
                        }
                        helpRequest.setAppliedPackageItemExecutions(executions);
                    }
                    helpRequestRepository.save(helpRequest);

                    if (timelineService != null) {
                        try {
                            String userName = userRepository.findById(acceptedByUserId).map(User::getFullName)
                                    .orElse("User");
                            timelineService.createHelpRequestStatusChangeEvent(
                                    requestId, acceptedByUserId, userName,
                                    HelpRequest.RequestStatus.PACKAGE_PROPOSED,
                                    HelpRequest.RequestStatus.IN_PROGRESS,
                                    "Public user accepted the service package.");
                        } catch (Exception e) {
                            System.err.println("Error adding timeline event: " + e.getMessage());
                        }
                    }
                    if (notificationService != null && helpRequest.getAssignedWorkerId() != null) {
                        try {
                            notificationService.sendHelpRequestUpdate(
                                    helpRequest.getAssignedWorkerId(),
                                    helpRequest.getId(),
                                    "PACKAGE_ACCEPTED",
                                    false);
                        } catch (Exception e) {
                            System.err.println("Error notifying worker: " + e.getMessage());
                        }
                    }
                    if (notificationService != null) {
                        try {
                            notificationService.sendHelpRequestUpdateToAdmin(
                                    helpRequest.getId(),
                                    "PACKAGE_ACCEPTED",
                                    acceptedByUserId,
                                    helpRequest.getTrackingId());
                        } catch (Exception e) {
                            System.err.println("Error notifying admin: " + e.getMessage());
                        }
                    }
                    return convertToFilteredDTO(helpRequest);
                })
                .orElse(null);
    }

    @Override
    public HelpRequestDTO rejectAppliedPackage(String requestId, String reason, String rejectedByUserId) {
        return helpRequestRepository.findById(requestId)
                .map(helpRequest -> {
                    if (helpRequest.getAppliedServicePackageId() == null) {
                        return null;
                    }
                    if (!rejectedByUserId.equals(helpRequest.getRequesterUserId())) {
                        return null;
                    }
                    if (!"PENDING".equals(helpRequest.getAppliedServicePackageStatus())) {
                        return convertToFilteredDTO(helpRequest);
                    }
                    helpRequest.setAppliedServicePackageStatus("REJECTED");
                    helpRequest.setStatus(HelpRequest.RequestStatus.PACKAGE_REJECTED);
                    helpRequest.setLastUpdated(LocalDateTime.now());
                    String note = reason != null && !reason.isBlank() ? " Rejection reason: " + reason : "";
                    String currentNotes = helpRequest.getRequestNotes();
                    String rejectNote = "Public user rejected the service package." + note;
                    helpRequest.setRequestNotes(currentNotes != null && !currentNotes.isEmpty()
                            ? currentNotes + "\n" + rejectNote
                            : rejectNote);
                    helpRequestRepository.save(helpRequest);

                    if (timelineService != null) {
                        try {
                            String userName = userRepository.findById(rejectedByUserId).map(User::getFullName)
                                    .orElse("User");
                            timelineService.createHelpRequestStatusChangeEvent(
                                    requestId, rejectedByUserId, userName,
                                    HelpRequest.RequestStatus.PACKAGE_PROPOSED,
                                    HelpRequest.RequestStatus.PACKAGE_REJECTED,
                                    "Public user rejected the service package." + note);
                        } catch (Exception e) {
                            System.err.println("Error adding timeline event: " + e.getMessage());
                        }
                    }
                    if (notificationService != null && helpRequest.getAssignedWorkerId() != null) {
                        try {
                            notificationService.sendHelpRequestUpdate(
                                    helpRequest.getAssignedWorkerId(),
                                    helpRequest.getId(),
                                    "PACKAGE_REJECTED",
                                    false);
                        } catch (Exception e) {
                            System.err.println("Error notifying worker: " + e.getMessage());
                        }
                    }
                    if (notificationService != null) {
                        try {
                            notificationService.sendHelpRequestUpdateToAdmin(
                                    helpRequest.getId(),
                                    "PACKAGE_REJECTED",
                                    rejectedByUserId,
                                    helpRequest.getTrackingId());
                        } catch (Exception e) {
                            System.err.println("Error notifying admin: " + e.getMessage());
                        }
                    }
                    return convertToFilteredDTO(helpRequest);
                })
                .orElse(null);
    }

    @Override
    public HelpRequestDTO updateServiceItemStatus(String requestId, String serviceItem, String status,
            String updatedByUserId) {
        return updateServiceItemStatus(requestId, serviceItem, status, updatedByUserId, null, null);
    }

    @Override
    public HelpRequestDTO updateServiceItemStatus(String requestId, String serviceItem, String status,
            String updatedByUserId,
            LocalDateTime startDate, String notes) {
        return helpRequestRepository.findById(requestId)
                .map(hr -> {
                    // If there is an applied package but executions were never initialized
                    // (older records), bootstrap executions from the current package items.
                    if (hr.getAppliedPackageItemExecutions() == null
                            || hr.getAppliedPackageItemExecutions().isEmpty()) {
                        if (hr.getAppliedServicePackageId() != null) {
                            servicePackageRepository.findById(hr.getAppliedServicePackageId()).ifPresent(pkg -> {
                                if (pkg.getItems() != null && !pkg.getItems().isEmpty()) {
                                    java.util.List<ServiceItemExecution> executions = new java.util.ArrayList<>();
                                    for (String item : pkg.getItems()) {
                                        executions.add(new ServiceItemExecution(item, "PENDING"));
                                    }
                                    hr.setAppliedPackageItemExecutions(executions);
                                }
                            });
                        }
                    }

                    if (hr.getAppliedPackageItemExecutions() == null
                            || hr.getAppliedPackageItemExecutions().isEmpty()) {
                        return null;
                    }

                    if (!"PENDING".equals(hr.getAppliedServicePackageStatus())
                            && !"ACCEPTED".equals(hr.getAppliedServicePackageStatus())) {
                        return null;
                    }
                    for (ServiceItemExecution ex : hr.getAppliedPackageItemExecutions()) {
                        if (serviceItem != null && serviceItem.equals(ex.getServiceItem())) {
                            ex.setStatus(status != null ? status : "PENDING");
                            if ("IN_PROGRESS".equals(status)) {
                                if (startDate != null)
                                    ex.setScheduledDate(startDate);
                                if (notes != null)
                                    ex.setNotes(notes);
                                if (timelineService != null) {
                                    try {
                                        String userName = userRepository.findById(updatedByUserId)
                                                .map(User::getFullName).orElse("Social Worker");
                                        String desc = "Service \"" + serviceItem + "\" started by " + userName;
                                        if (notes != null && !notes.isBlank())
                                            desc += ". Notes: " + notes;
                                        timelineService.createHelpRequestNoteAddedEvent(requestId, updatedByUserId,
                                                userName, desc);
                                    } catch (Exception e) {
                                        // ignore
                                    }
                                }
                            }
                            hr.setLastUpdated(LocalDateTime.now());
                            helpRequestRepository.save(hr);
                            return convertToFilteredDTO(hr);
                        }
                    }
                    return null;
                })
                .orElse(null);
    }

    @Override
    public HelpRequestDTO assignServiceItemResource(String requestId, String serviceItem, String assignedResource,
            LocalDateTime scheduledDate, String notes, String updatedByUserId) {
        return helpRequestRepository.findById(requestId)
                .map(hr -> {
                    if (hr.getAppliedPackageItemExecutions() == null)
                        return null;
                    for (ServiceItemExecution ex : hr.getAppliedPackageItemExecutions()) {
                        if (serviceItem != null && serviceItem.equals(ex.getServiceItem())) {
                            if (assignedResource != null)
                                ex.setAssignedResource(assignedResource);
                            if (scheduledDate != null)
                                ex.setScheduledDate(scheduledDate);
                            if (notes != null)
                                ex.setNotes(notes);
                            if (scheduledDate != null && ex.getStatus() != null && "PENDING".equals(ex.getStatus())) {
                                ex.setStatus("SCHEDULED");
                            }
                            hr.setLastUpdated(LocalDateTime.now());
                            helpRequestRepository.save(hr);

                            if (timelineService != null && assignedResource != null) {
                                try {
                                    String userName = userRepository.findById(updatedByUserId)
                                            .map(User::getFullName)
                                            .orElse("Social Worker");
                                    StringBuilder desc = new StringBuilder();
                                    desc.append("Resource \"").append(assignedResource)
                                            .append("\" assigned to service \"").append(serviceItem).append("\" by ")
                                            .append(userName);
                                    if (scheduledDate != null) {
                                        desc.append(" (expected on ").append(scheduledDate).append(")");
                                    }
                                    if (notes != null && !notes.isBlank()) {
                                        desc.append(". Notes: ").append(notes);
                                    }
                                    timelineService.createHelpRequestNoteAddedEvent(
                                            requestId,
                                            updatedByUserId,
                                            userName,
                                            desc.toString());
                                } catch (Exception e) {
                                    // ignore timeline failures
                                }
                            }
                            return convertToFilteredDTO(hr);
                        }
                    }
                    return null;
                })
                .orElse(null);
    }

    @Override
    public HelpRequestDTO submitPackageFollowUp(String requestId, String followUpDate, String followUpType,
            String notes,
            String submittedByUserId) {
        return helpRequestRepository.findById(requestId)
                .map(hr -> {
                    if (followUpService == null)
                        return convertToFilteredDTO(hr);
                    com.example.childPortal.model.FollowUp fu = new com.example.childPortal.model.FollowUp();
                    fu.setHelpRequestId(requestId);
                    fu.setSocialWorkerId(
                            hr.getAssignedWorkerId() != null ? hr.getAssignedWorkerId() : submittedByUserId);
                    fu.setType(followUpType != null ? followUpType : "VISIT");
                    fu.setNotes(notes);
                    fu.setStatus("SCHEDULED");
                    if (followUpDate != null && !followUpDate.isEmpty()) {
                        try {
                            fu.setScheduledDate(LocalDateTime.parse(followUpDate.replace("Z", "").substring(0, 19)));
                        } catch (Exception e) {
                            fu.setScheduledDate(LocalDateTime.now());
                        }
                    } else {
                        fu.setScheduledDate(LocalDateTime.now());
                    }
                    followUpService.createFollowUp(fu);
                    hr.setLastUpdated(LocalDateTime.now());
                    helpRequestRepository.save(hr);
                    return convertToFilteredDTO(hr);
                })
                .orElse(null);
    }

    @Override
    public HelpRequestDTO requestServiceAdjustment(String requestId, String serviceItem, String message,
            String requestedByUserId) {
        return helpRequestRepository.findById(requestId)
                .map(helpRequest -> {
                    if (helpRequest.getAppliedServicePackageId() == null) {
                        return null;
                    }
                    if (!requestedByUserId.equals(helpRequest.getRequesterUserId())) {
                        return null;
                    }
                    if (!"PENDING".equals(helpRequest.getAppliedServicePackageStatus())) {
                        return convertToFilteredDTO(helpRequest);
                    }

                    // Treat as a rejection but with specific adjustment context
                    helpRequest.setAppliedServicePackageStatus("REJECTED");
                    helpRequest.setStatus(HelpRequest.RequestStatus.PACKAGE_REJECTED);
                    helpRequest.setLastUpdated(LocalDateTime.now());

                    String note = "Adjustment requested for service '" + serviceItem + "': " + message;
                    String currentNotes = helpRequest.getRequestNotes();
                    helpRequest.setRequestNotes(currentNotes != null && !currentNotes.isEmpty()
                            ? currentNotes + "\n" + note
                            : note);

                    helpRequestRepository.save(helpRequest);

                    if (timelineService != null) {
                        try {
                            String userName = userRepository.findById(requestedByUserId).map(User::getFullName)
                                    .orElse("User");
                            timelineService.createHelpRequestStatusChangeEvent(
                                    requestId, requestedByUserId, userName,
                                    HelpRequest.RequestStatus.PACKAGE_PROPOSED,
                                    HelpRequest.RequestStatus.PACKAGE_REJECTED,
                                    note);
                        } catch (Exception e) {
                            System.err.println("Error adding timeline event: " + e.getMessage());
                        }
                    }

                    if (notificationService != null && helpRequest.getAssignedWorkerId() != null) {
                        try {
                            notificationService.sendHelpRequestUpdate(
                                    helpRequest.getAssignedWorkerId(),
                                    helpRequest.getId(),
                                    "PACKAGE_ADJUSTMENT_REQUESTED",
                                    false);
                        } catch (Exception e) {
                            System.err.println("Error notifying worker: " + e.getMessage());
                        }
                    }

                    return convertToFilteredDTO(helpRequest);
                })
                .orElse(null);
    }

    @Override
    public HelpRequestDTO startServiceExecution(String requestId, String userId) {
        return helpRequestRepository.findById(requestId)
                .map(hr -> {
                    hr.setServiceStarted(true);
                    hr.setServiceStartedAt(LocalDateTime.now());
                    hr.setStatus(HelpRequest.RequestStatus.IN_PROGRESS);
                    hr.setProgress(10);
                    hr.setLastUpdated(LocalDateTime.now());

                    // Automatically create initial follow-up for next day
                    if (followUpService != null) {
                        com.example.childPortal.model.FollowUp fu = new com.example.childPortal.model.FollowUp();
                        fu.setHelpRequestId(requestId);
                        fu.setSocialWorkerId(hr.getAssignedWorkerId());
                        fu.setType("SERVICE_START_FOLLOWUP");
                        fu.setNotes("Initial monitoring after service start.");
                        fu.setStatus("SCHEDULED");
                        fu.setScheduledDate(LocalDateTime.now().plusDays(1).withHour(10).withMinute(0));
                        followUpService.createFollowUp(fu);
                    }

                    helpRequestRepository.save(hr);

                    if (timelineService != null) {
                        String name = userRepository.findById(userId).map(User::getFullName).orElse("Social Worker");
                        timelineService.createHelpRequestNoteAddedEvent(requestId, userId, name,
                                "Service execution started. Initial monitoring scheduled.");
                    }

                    return convertToFilteredDTO(hr);
                }).orElse(null);
    }

    @Override
    public HelpRequestDTO updateServiceOutcome(String requestId, String serviceItem, String outcome, String reason,
            String notes, String userId) {
        return helpRequestRepository.findById(requestId)
                .map(hr -> {
                    if (hr.getAppliedPackageItemExecutions() == null)
                        return null;

                    for (ServiceItemExecution ex : hr.getAppliedPackageItemExecutions()) {
                        if (ex.getServiceItem().equals(serviceItem)) {
                            ex.setOutcome(outcome);
                            ex.setOutcomeReason(reason);
                            ex.setOutcomeNotes(notes);
                            ex.setOutcomeRecordedBy(userId);
                            ex.setOutcomeRecordedAt(LocalDateTime.now());

                            int currentProgress = hr.getProgress();
                            if ("COMPLETED_SUCCESSFULLY".equals(outcome)) {
                                ex.setStatus("COMPLETED");
                                hr.setProgress(Math.min(90, currentProgress + 15));
                                // Schedule next follow-up 3 days later
                                if (followUpService != null) {
                                    com.example.childPortal.model.FollowUp fu = new com.example.childPortal.model.FollowUp();
                                    fu.setHelpRequestId(requestId);
                                    fu.setSocialWorkerId(hr.getAssignedWorkerId());
                                    fu.setType("PERIODIC_FOLLOWUP");
                                    fu.setNotes("Follow-up after successful delivery of " + serviceItem);
                                    fu.setStatus("SCHEDULED");
                                    fu.setScheduledDate(LocalDateTime.now().plusDays(3).withHour(10).withMinute(0));
                                    followUpService.createFollowUp(fu);
                                }
                            } else if ("PARTIALLY_COMPLETED".equals(outcome)) {
                                ex.setStatus("PARTIALLY_COMPLETED");
                                hr.setProgress(Math.min(90, currentProgress + 5));
                                // Schedule next day
                                if (followUpService != null) {
                                    com.example.childPortal.model.FollowUp fu = new com.example.childPortal.model.FollowUp();
                                    fu.setHelpRequestId(requestId);
                                    fu.setSocialWorkerId(hr.getAssignedWorkerId());
                                    fu.setType("ADJUSTMENT_FOLLOWUP");
                                    fu.setNotes("Follow-up for partial delivery of " + serviceItem
                                            + ". Needs adjustment plan.");
                                    fu.setStatus("SCHEDULED");
                                    fu.setScheduledDate(LocalDateTime.now().plusDays(1).withHour(10).withMinute(0));
                                    followUpService.createFollowUp(fu);
                                }
                            } else {
                                ex.setStatus("NOT_DELIVERED");
                                // No progress change, must reschedule
                            }
                            break;
                        }
                    }

                    // Check if all are done
                    boolean allDone = hr.getAppliedPackageItemExecutions().stream()
                            .allMatch(ex -> "COMPLETED".equals(ex.getStatus()));
                    if (allDone) {
                        hr.setAllServicesCompleted(true);
                        hr.setProgress(90);
                    }

                    hr.setLastUpdated(LocalDateTime.now());
                    helpRequestRepository.save(hr);
                    return convertToFilteredDTO(hr);
                }).orElse(null);
    }

    @Override
    public HelpRequestDTO submitFinalAssessment(String requestId, HelpRequest.FinalAssessment assessment,
            String userId) {
        return helpRequestRepository.findById(requestId)
                .map(hr -> {
                    assessment.setAssessedAt(LocalDateTime.now());
                    assessment.setAssessedByUserId(userId);
                    hr.setFinalAssessment(assessment);
                    hr.setFinalAssessmentCompleted(true);
                    hr.setFinalAssessmentAt(LocalDateTime.now());
                    hr.setProgress(100);
                    hr.setLastUpdated(LocalDateTime.now());
                    helpRequestRepository.save(hr);

                    if (timelineService != null) {
                        String name = userRepository.findById(userId).map(User::getFullName).orElse("Social Worker");
                        timelineService.createHelpRequestNoteAddedEvent(requestId, userId, name,
                                "Final assessment completed. Recommend closure: " + assessment.isRecommendClosure());
                    }

                    return convertToFilteredDTO(hr);
                }).orElse(null);
    }

    @Override
    public HelpRequestDTO finalizeCase(String requestId, String userId) {
        return helpRequestRepository.findById(requestId)
                .map(hr -> {
                    hr.setStatus(HelpRequest.RequestStatus.COMPLETED);
                    hr.setCaseFinalized(true);
                    hr.setCompletionDate(LocalDateTime.now());
                    hr.setLastUpdated(LocalDateTime.now());
                    helpRequestRepository.save(hr);

                    if (timelineService != null) {
                        String name = userRepository.findById(userId).map(User::getFullName).orElse("Social Worker");
                        timelineService.createHelpRequestStatusChangeEvent(requestId, userId, name,
                                HelpRequest.RequestStatus.IN_PROGRESS, HelpRequest.RequestStatus.COMPLETED,
                                "Case marked as COMPLETED.");
                    }

                    // Notify Admin
                    if (notificationService != null) {
                        notificationService.sendHelpRequestUpdateToAdmin(requestId, "COMPLETED", userId,
                                hr.getTrackingId());
                    }

                    return convertToFilteredDTO(hr);
                }).orElse(null);
    }

    private HelpRequestDTO convertToFilteredDTO(HelpRequest helpRequest) {
        HelpRequestDTO dto = new HelpRequestDTO();
        dto.setId(helpRequest.getId());
        dto.setTrackingId(helpRequest.getTrackingId());
        dto.setRequesterUserId(helpRequest.getRequesterUserId());
        dto.setAnonymous(helpRequest.isAnonymous());
        dto.setApproximateAge(helpRequest.getApproximateAge());
        dto.setGender(helpRequest.getGender());
        dto.setIdentificationMarks(helpRequest.getIdentificationMarks());
        dto.setHelpType(helpRequest.getHelpType());
        dto.setDescription(helpRequest.getDescription());
        dto.setLocation(helpRequest.getLocation());
        dto.setDocumentUrls(helpRequest.getDocumentUrls());
        dto.setStatus(helpRequest.getStatus());
        dto.setAssignedWorkerId(helpRequest.getAssignedWorkerId());
        dto.setRequestDate(helpRequest.getRequestDate());
        dto.setPriority(helpRequest.getPriority());
        dto.setProgress(helpRequest.getProgress());
        dto.setFinalAssessment(helpRequest.getFinalAssessment());
        dto.setServiceStarted(helpRequest.isServiceStarted());
        dto.setResourcesAssigned(helpRequest.isResourcesAssigned());
        dto.setAllServicesCompleted(helpRequest.isAllServicesCompleted());
        dto.setFinalAssessmentCompleted(helpRequest.isFinalAssessmentCompleted());
        dto.setCaseFinalized(helpRequest.isCaseFinalized());
        dto.setLastUpdated(helpRequest.getLastUpdated());
        dto.setCompletionDate(helpRequest.getCompletionDate());
        dto.setRequestNotes(helpRequest.getRequestNotes());

        // Map applied service package, if any
        if (helpRequest.getAppliedServicePackageId() != null) {
            servicePackageRepository.findById(helpRequest.getAppliedServicePackageId()).ifPresent(pkg -> {
                com.example.childPortal.dto.ServicePackageDTO pkgDto = new com.example.childPortal.dto.ServicePackageDTO();
                pkgDto.setId(pkg.getId());
                pkgDto.setTitle(pkg.getTitle());
                pkgDto.setRequestType(pkg.getRequestType());
                pkgDto.setDescription(pkg.getDescription());
                pkgDto.setEstimatedDuration(pkg.getEstimatedDuration());
                pkgDto.setItems(pkg.getItems());
                pkgDto.setStatus(pkg.getStatus());
                pkgDto.setCreatedAt(pkg.getCreatedAt());
                pkgDto.setUpdatedAt(pkg.getUpdatedAt());
                dto.setAppliedPackage(pkgDto);
            });
            dto.setAppliedPackageStatus(helpRequest.getAppliedServicePackageStatus());
            dto.setAppliedPackageAppliedAt(helpRequest.getAppliedServicePackageAppliedAt());
        }
        if (helpRequest.getAppliedPackageItemExecutions() != null) {
            dto.setAppliedPackageItemExecutions(helpRequest.getAppliedPackageItemExecutions().stream()
                    .map(ex -> {
                        com.example.childPortal.dto.ServiceItemExecutionDTO exDto = new com.example.childPortal.dto.ServiceItemExecutionDTO();
                        exDto.setServiceItem(ex.getServiceItem());
                        exDto.setStatus(ex.getStatus());
                        exDto.setAssignedResource(ex.getAssignedResource());
                        exDto.setScheduledDate(ex.getScheduledDate());
                        exDto.setNotes(ex.getNotes());
                        return exDto;
                    })
                    .collect(Collectors.toList()));
        }

        try {
            org.springframework.security.core.Authentication auth = SecurityContextHolder.getContext()
                    .getAuthentication();
            String currentUserId = (auth != null && auth.isAuthenticated()) ? auth.getName() : null;

            Role userRole = Role.PU;
            if (currentUserId != null && !currentUserId.equals("anonymousUser")) {
                Optional<User> currentUserOpt = userRepository.findById(currentUserId);
                userRole = currentUserOpt.map(User::getRole).orElse(Role.PU);
            }

            if (helpRequest.isAnonymous()) {
                boolean canSeeName = (userRole == Role.ADMIN) ||
                        (currentUserId != null &&
                                helpRequest.getRequesterUserId() != null &&
                                helpRequest.getRequesterUserId().equals(currentUserId));

                if (canSeeName) {
                    dto.setRequesterName(
                            helpRequest.getRequesterName() != null ? helpRequest.getRequesterName() : "Anonymous");
                } else {
                    dto.setRequesterName("Anonymous Requester");
                }
            } else {
                dto.setRequesterName(
                        helpRequest.getRequesterName() != null ? helpRequest.getRequesterName() : "Unknown Requester");
                // Fetch contact details for non-anonymous requests
                if (helpRequest.getRequesterUserId() != null) {
                    userRepository.findById(helpRequest.getRequesterUserId()).ifPresent(reqUser -> {
                        dto.setRequesterContact(reqUser.getPhone() != null ? reqUser.getPhone() : reqUser.getEmail());
                        dto.setRequesterAddress(reqUser.getAddress());
                        dto.setRequesterEmail(reqUser.getEmail());
                        dto.setRequesterPhone(reqUser.getPhone());
                        dto.setRequesterProfilePhoto(reqUser.getProfilePhoto());
                        // Using User ID as the identifier since we don't have a separate NIC/National
                        // ID field
                        // If officialIdFile exists, it could be considered a verified ID document
                    });
                }
            }
        } catch (Exception e) {
            if (helpRequest.isAnonymous()) {
                dto.setRequesterName("Anonymous Requester");
            } else {
                dto.setRequesterName(
                        helpRequest.getRequesterName() != null ? helpRequest.getRequesterName() : "Unknown Requester");
            }
        }

        return dto;
    }
}
