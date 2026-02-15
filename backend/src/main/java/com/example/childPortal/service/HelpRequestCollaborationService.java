package com.example.childPortal.service;

import com.example.childPortal.dto.HelpRequestCollaborationRequestDTO;
import com.example.childPortal.dto.HelpRequestCollaborationSummaryDTO;
import com.example.childPortal.dto.HelpRequestCollaboratorDTO;
import com.example.childPortal.model.HelpRequest;
import com.example.childPortal.model.HelpRequestCollaboration;
import com.example.childPortal.model.Role;
import com.example.childPortal.model.SocialWorker;
import com.example.childPortal.model.User;
import com.example.childPortal.repository.HelpRequestCollaborationRepository;
import com.example.childPortal.repository.HelpRequestRepository;
import com.example.childPortal.repository.SocialWorkerRepository;
import com.example.childPortal.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class HelpRequestCollaborationService {

    private final HelpRequestCollaborationRepository collaborationRepository;
    private final HelpRequestRepository helpRequestRepository;
    private final UserRepository userRepository;
    private final SocialWorkerRepository socialWorkerRepository;
    private final NotificationService notificationService;
    private final CaseTimelineService timelineService;

    public HelpRequestCollaborationService(
            HelpRequestCollaborationRepository collaborationRepository,
            HelpRequestRepository helpRequestRepository,
            UserRepository userRepository,
            SocialWorkerRepository socialWorkerRepository,
            NotificationService notificationService,
            CaseTimelineService timelineService) {
        this.collaborationRepository = collaborationRepository;
        this.helpRequestRepository = helpRequestRepository;
        this.userRepository = userRepository;
        this.socialWorkerRepository = socialWorkerRepository;
        this.notificationService = notificationService;
        this.timelineService = timelineService;
    }

    public HelpRequestCollaborationSummaryDTO getSummary(String helpRequestId, String userId) {
        HelpRequest request = getRequest(helpRequestId);
        User currentUser = getUser(userId);
        if (!canViewCollaboration(currentUser, request, userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You do not have access to this collaboration");
        }

        return buildSummary(request, userId);
    }

    public HelpRequestCollaboratorDTO requestCollaborator(
            String helpRequestId,
            String ownerUserId,
            HelpRequestCollaborationRequestDTO body) {
        HelpRequest request = getRequest(helpRequestId);
        User owner = getUser(ownerUserId);
        if (owner.getRole() != Role.SW || !isOwnerUser(request, ownerUserId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only case owner can request collaborators");
        }

        String collaboratorUserId = body.getCollaboratorUserId();
        if (collaboratorUserId == null || collaboratorUserId.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Collaborator user ID is required");
        }
        if (ownerUserId.equals(collaboratorUserId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Owner cannot add themselves as collaborator");
        }

        User collaborator = getUser(collaboratorUserId);
        if (collaborator.getRole() != Role.SW) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Only social workers can collaborate");
        }

        Optional<HelpRequestCollaboration> existing = collaborationRepository
                .findByHelpRequestIdAndCollaboratorUserIdAndStatusIn(
                        helpRequestId,
                        collaboratorUserId,
                        List.of(
                                HelpRequestCollaboration.Status.PENDING,
                                HelpRequestCollaboration.Status.ACCEPTED));

        if (existing.isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Collaborator request already exists");
        }

        HelpRequestCollaboration collaboration = new HelpRequestCollaboration();
        collaboration.setHelpRequestId(helpRequestId);
        collaboration.setOwnerUserId(ownerUserId);
        collaboration.setCollaboratorUserId(collaboratorUserId);
        collaboration.setReason(body.getReason());
        collaboration.setPermission(parsePermission(body.getPermission()));
        collaboration.setStatus(HelpRequestCollaboration.Status.PENDING);
        collaboration.setRequestedAt(LocalDateTime.now());
        collaboration = collaborationRepository.save(collaboration);

        notificationService.sendHelpRequestCollaborationRequested(
                collaboratorUserId,
                helpRequestId,
                request.getTrackingId(),
                owner.getFullName(),
                collaboration.getPermission().name());

        addTimelineNote(
                helpRequestId,
                ownerUserId,
                owner.getFullName(),
                "Collaboration requested for " + collaborator.getFullName() + " (" + collaboration.getPermission() + ")"
        );

        return toDTO(collaboration, collaborator);
    }

    public HelpRequestCollaboratorDTO acceptRequest(String collaborationId, String collaboratorUserId) {
        HelpRequestCollaboration collaboration = getCollaboration(collaborationId);
        if (!collaboratorUserId.equals(collaboration.getCollaboratorUserId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only selected collaborator can accept");
        }
        if (collaboration.getStatus() != HelpRequestCollaboration.Status.PENDING) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Request is not pending");
        }

        collaboration.setStatus(HelpRequestCollaboration.Status.ACCEPTED);
        collaboration.setRespondedAt(LocalDateTime.now());
        collaboration = collaborationRepository.save(collaboration);

        HelpRequest request = getRequest(collaboration.getHelpRequestId());
        User collaborator = getUser(collaboratorUserId);
        notificationService.sendHelpRequestCollaborationDecision(
                collaboration.getOwnerUserId(),
                request.getId(),
                request.getTrackingId(),
                collaborator.getFullName(),
                true);

        addTimelineNote(
                request.getId(),
                collaboratorUserId,
                collaborator.getFullName(),
                collaborator.getFullName() + " joined as collaborator"
        );

        return toDTO(collaboration, collaborator);
    }

    public HelpRequestCollaboratorDTO rejectRequest(String collaborationId, String collaboratorUserId) {
        HelpRequestCollaboration collaboration = getCollaboration(collaborationId);
        if (!collaboratorUserId.equals(collaboration.getCollaboratorUserId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only selected collaborator can reject");
        }
        if (collaboration.getStatus() != HelpRequestCollaboration.Status.PENDING) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Request is not pending");
        }

        collaboration.setStatus(HelpRequestCollaboration.Status.REJECTED);
        collaboration.setRespondedAt(LocalDateTime.now());
        collaboration = collaborationRepository.save(collaboration);

        HelpRequest request = getRequest(collaboration.getHelpRequestId());
        User collaborator = getUser(collaboratorUserId);
        notificationService.sendHelpRequestCollaborationDecision(
                collaboration.getOwnerUserId(),
                request.getId(),
                request.getTrackingId(),
                collaborator.getFullName(),
                false);

        return toDTO(collaboration, collaborator);
    }

    public void removeCollaborator(String helpRequestId, String collaboratorUserId, String ownerUserId) {
        HelpRequest request = getRequest(helpRequestId);
        User owner = getUser(ownerUserId);
        if (owner.getRole() != Role.SW || !isOwnerUser(request, ownerUserId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only case owner can remove collaborators");
        }

        HelpRequestCollaboration collaboration = collaborationRepository
                .findByHelpRequestIdAndCollaboratorUserIdAndStatusIn(
                        helpRequestId,
                        collaboratorUserId,
                        List.of(HelpRequestCollaboration.Status.ACCEPTED))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Collaborator not found"));

        collaboration.setStatus(HelpRequestCollaboration.Status.REMOVED);
        collaboration.setRemovedByUserId(ownerUserId);
        collaboration.setRemovedAt(LocalDateTime.now());
        collaborationRepository.save(collaboration);

        User collaborator = getUser(collaboratorUserId);
        notificationService.sendHelpRequestCollaboratorRemoved(
                collaboratorUserId,
                helpRequestId,
                request.getTrackingId(),
                owner.getFullName());

        addTimelineNote(
                helpRequestId,
                ownerUserId,
                owner.getFullName(),
                collaborator.getFullName() + " removed from collaboration"
        );
    }

    public List<HelpRequestCollaboratorDTO> getMyActiveCollaborations(String userId) {
        getUser(userId);
        List<HelpRequestCollaboration> accepted = collaborationRepository
                .findByCollaboratorUserIdAndStatusOrderByRequestedAtDesc(
                        userId,
                        HelpRequestCollaboration.Status.ACCEPTED);

        Map<String, User> ownerUserMap = userRepository.findAllById(
                        accepted.stream().map(HelpRequestCollaboration::getOwnerUserId).collect(Collectors.toSet()))
                .stream()
                .collect(Collectors.toMap(User::getId, u -> u));

        Map<String, HelpRequest> requestMap = helpRequestRepository.findAllById(
                        accepted.stream().map(HelpRequestCollaboration::getHelpRequestId).collect(Collectors.toSet()))
                .stream()
                .collect(Collectors.toMap(HelpRequest::getId, r -> r));

        Map<String, SocialWorker> workerMap = socialWorkerRepository.findAll().stream()
                .collect(Collectors.toMap(SocialWorker::getUserId, sw -> sw, (a, b) -> a));

        return accepted.stream()
                .map(collab -> {
                    HelpRequest request = requestMap.get(collab.getHelpRequestId());
                    User owner = ownerUserMap.get(collab.getOwnerUserId());
                    SocialWorker ownerWorker = owner != null ? workerMap.get(owner.getId()) : null;
                    return toPendingDTO(collab, request, owner, ownerWorker);
                })
                .collect(Collectors.toList());
    }

    public List<HelpRequestCollaboratorDTO> getMyPendingRequests(String userId) {
        getUser(userId);
        List<HelpRequestCollaboration> pending = collaborationRepository
                .findByCollaboratorUserIdAndStatusOrderByRequestedAtDesc(
                        userId,
                        HelpRequestCollaboration.Status.PENDING);

        // Fetch owner users (the ones who sent the collaboration invites)
        Map<String, User> ownerUserMap = userRepository.findAllById(
                        pending.stream().map(HelpRequestCollaboration::getOwnerUserId).collect(Collectors.toSet()))
                .stream()
                .collect(Collectors.toMap(User::getId, u -> u));

        // Fetch help requests to get category, tracking ID, etc.
        Map<String, HelpRequest> requestMap = helpRequestRepository.findAllById(
                        pending.stream().map(HelpRequestCollaboration::getHelpRequestId).collect(Collectors.toSet()))
                .stream()
                .collect(Collectors.toMap(HelpRequest::getId, r -> r));

        // Fetch social worker info for owner districts
        Map<String, SocialWorker> workerMap = socialWorkerRepository.findAll().stream()
                .collect(Collectors.toMap(SocialWorker::getUserId, sw -> sw, (a, b) -> a));

        return pending.stream()
                .map(collab -> {
                    HelpRequest request = requestMap.get(collab.getHelpRequestId());
                    User owner = ownerUserMap.get(collab.getOwnerUserId());
                    SocialWorker ownerWorker = owner != null ? workerMap.get(owner.getId()) : null;
                    return toPendingDTO(collab, request, owner, ownerWorker);
                })
                .collect(Collectors.toList());
    }

    private HelpRequestCollaboratorDTO toPendingDTO(
            HelpRequestCollaboration collaboration,
            HelpRequest request,
            User owner,
            SocialWorker ownerWorker) {
        HelpRequestCollaboratorDTO dto = new HelpRequestCollaboratorDTO();
        dto.setCollaborationId(collaboration.getId());
        dto.setUserId(collaboration.getCollaboratorUserId());
        dto.setPermission(collaboration.getPermission().name());
        dto.setStatus(collaboration.getStatus().name());
        dto.setReason(collaboration.getReason());
        dto.setRequestedAt(collaboration.getRequestedAt());
        dto.setRespondedAt(collaboration.getRespondedAt());
        
        // Help request details
        if (request != null) {
            dto.setHelpRequestId(request.getId());
            dto.setRequestTrackingId(request.getTrackingId());
            dto.setRequestCategory(request.getHelpType() != null ? request.getHelpType().name() : null);
            // Privacy-safe preview (limited info)
            dto.setProblemSummary(request.getDescription() != null && request.getDescription().length() > 200 
                    ? request.getDescription().substring(0, 200) + "..." 
                    : request.getDescription());
            dto.setCurrentProgress(request.getStatus() != null ? request.getStatus().name() : null);
            // Services applied placeholder (model has no appliedPackage accessor)
            dto.setServicesApplied(java.util.Collections.emptyList());
        }
        
        // Owner (requester) details
        dto.setOwnerUserId(collaboration.getOwnerUserId());
        if (owner != null) {
            dto.setOwnerName(owner.getFullName());
            dto.setOwnerProfilePhoto(owner.getProfilePhoto());
        } else {
            dto.setOwnerName("Social Worker");
        }
        
        // Owner's district from their social worker profile
        if (ownerWorker != null) {
            dto.setDistrict(ownerWorker.getServiceArea());
        }
        
        return dto;
    }

    private HelpRequestCollaborationSummaryDTO buildSummary(HelpRequest request, String currentUserId) {
        List<HelpRequestCollaboration> items = collaborationRepository
                .findByHelpRequestIdOrderByRequestedAtDesc(request.getId());

        List<String> userIds = items.stream()
                .flatMap(c -> java.util.stream.Stream.of(c.getCollaboratorUserId(), c.getOwnerUserId()))
                .filter(id -> id != null && !id.isBlank())
                .distinct()
                .collect(Collectors.toList());
        userIds.add(request.getAssignedWorkerId());

        Map<String, User> users = userRepository.findAllById(userIds)
                .stream()
                .collect(Collectors.toMap(User::getId, u -> u, (a, b) -> a));
        Map<String, SocialWorker> workers = socialWorkerRepository.findAll().stream()
                .collect(Collectors.toMap(SocialWorker::getUserId, sw -> sw, (a, b) -> a));

        HelpRequestCollaborationSummaryDTO summary = new HelpRequestCollaborationSummaryDTO();
        summary.setHelpRequestId(request.getId());
        summary.setOwnerUserId(request.getAssignedWorkerId());
        User owner = users.get(request.getAssignedWorkerId());
        summary.setOwnerName(owner != null ? owner.getFullName() : "Assigned Social Worker");
        summary.setOwnerProfilePhoto(owner != null ? owner.getProfilePhoto() : null);

        List<HelpRequestCollaboratorDTO> collaborators = items.stream()
                .filter(item -> item.getStatus() == HelpRequestCollaboration.Status.ACCEPTED)
                .map(item -> toDTO(item, users.get(item.getCollaboratorUserId()), workers.get(item.getCollaboratorUserId())))
                .collect(Collectors.toList());
        summary.setCollaborators(collaborators);
        summary.setActiveCollaboratorCount(collaborators.size());

        List<HelpRequestCollaboratorDTO> pending = items.stream()
                .filter(item -> item.getStatus() == HelpRequestCollaboration.Status.PENDING)
                .filter(item -> currentUserId.equals(item.getOwnerUserId()) || currentUserId.equals(item.getCollaboratorUserId()))
                .map(item -> toDTO(item, users.get(item.getCollaboratorUserId()), workers.get(item.getCollaboratorUserId())))
                .collect(Collectors.toList());
        summary.setPendingRequests(pending);

        return summary;
    }

    private boolean canViewCollaboration(User user, HelpRequest request, String userId) {
        if (user.getRole() == Role.ADMIN) return true;
        if (isOwnerUser(request, userId)) return true;
        return collaborationRepository.findByHelpRequestIdAndCollaboratorUserIdAndStatusIn(
                        request.getId(),
                        userId,
                        List.of(HelpRequestCollaboration.Status.ACCEPTED, HelpRequestCollaboration.Status.PENDING))
                .isPresent();
    }

    private boolean isOwnerUser(HelpRequest request, String userId) {
        if (request.getAssignedWorkerId() == null || userId == null) return false;
        if (userId.equals(request.getAssignedWorkerId())) return true;
        return socialWorkerRepository.findByUserId(userId)
                .map(sw -> sw.getId() != null && sw.getId().equals(request.getAssignedWorkerId()))
                .orElse(false);
    }

    private HelpRequestCollaboration.Permission parsePermission(String raw) {
        if (raw == null || raw.isBlank()) {
            return HelpRequestCollaboration.Permission.VIEW_ONLY;
        }
        try {
            return HelpRequestCollaboration.Permission.valueOf(raw.trim().toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid permission");
        }
    }

    private HelpRequest getRequest(String helpRequestId) {
        return helpRequestRepository.findById(helpRequestId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Help request not found"));
    }

    private HelpRequestCollaboration getCollaboration(String collaborationId) {
        return collaborationRepository.findById(collaborationId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Collaboration request not found"));
    }

    private User getUser(String userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));
    }

    private HelpRequestCollaboratorDTO toDTO(HelpRequestCollaboration collaboration, User user) {
        SocialWorker worker = user != null ? socialWorkerRepository.findByUserId(user.getId()).orElse(null) : null;
        return toDTO(collaboration, user, worker);
    }

    private HelpRequestCollaboratorDTO toDTO(
            HelpRequestCollaboration collaboration,
            User user,
            SocialWorker worker) {
        HelpRequestCollaboratorDTO dto = new HelpRequestCollaboratorDTO();
        dto.setCollaborationId(collaboration.getId());
        dto.setUserId(collaboration.getCollaboratorUserId());
        dto.setName(user != null ? user.getFullName() : "Social Worker");
        dto.setEmail(user != null ? user.getEmail() : null);
        dto.setProfilePhoto(user != null ? user.getProfilePhoto() : null);
        dto.setPermission(collaboration.getPermission().name());
        dto.setStatus(collaboration.getStatus().name());
        dto.setReason(collaboration.getReason());
        dto.setRequestedAt(collaboration.getRequestedAt());
        dto.setRespondedAt(collaboration.getRespondedAt());
        dto.setDistrict(worker != null ? worker.getServiceArea() : null);
        dto.setSpecialization(worker != null && worker.getSpecializations() != null
                ? String.join(", ", worker.getSpecializations())
                : null);
        dto.setAvailability(user != null && user.getAvailabilityStatus() != null
                ? user.getAvailabilityStatus().name()
                : null);
        return dto;
    }

    private void addTimelineNote(String helpRequestId, String actorUserId, String actorName, String note) {
        try {
            timelineService.createHelpRequestNoteAddedEvent(helpRequestId, actorUserId, actorName, note);
        } catch (Exception ex) {
            System.err.println("Failed to add collaboration timeline note: " + ex.getMessage());
        }
    }
}
