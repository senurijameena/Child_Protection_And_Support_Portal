package com.example.childPortal.service.impl;

import com.example.childPortal.dto.HelpRequestDTO;
import com.example.childPortal.dto.HelpResponse;
import com.example.childPortal.model.HelpRequest;
import com.example.childPortal.model.HelpType;
import com.example.childPortal.model.Priority;
import com.example.childPortal.model.Role;
import com.example.childPortal.model.User;
import com.example.childPortal.repository.HelpRequestRepository;
import com.example.childPortal.repository.UserRepository;
import com.example.childPortal.service.HelpRequestService;
import com.example.childPortal.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class HelpRequestServiceImpl implements HelpRequestService {

    @Autowired
    private HelpRequestRepository helpRequestRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired(required = false)
    private NotificationService notificationService;

    @Autowired(required = false)
    private com.example.childPortal.service.SocialWorkerService socialWorkerService;

    @Autowired
    private com.example.childPortal.service.CaseTimelineService timelineService;

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

            return new HelpResponse(savedHelpRequest.getId(), "Help request submitted successfully", true);
        } catch (Exception e) {
            return new HelpResponse(null, "Failed to submit help request: " + e.getMessage(), false);
        }
    }

    @Override
    public HelpRequestDTO getHelpRequestById(String requestId) {
        return helpRequestRepository.findById(requestId)
                .map(this::convertToFilteredDTO)
                .orElse(null);
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