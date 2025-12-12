package com.example.childPortal.service.impl;

import com.example.childPortal.dto.TransferRequestDTO;
import com.example.childPortal.dto.TransferActionDTO;
import com.example.childPortal.model.*;
import com.example.childPortal.model.TransferRequest.TransferStatus;
import com.example.childPortal.repository.*;
import com.example.childPortal.service.CaseTimelineService;
import com.example.childPortal.service.TransferService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class TransferServiceImpl implements TransferService {
    @Autowired
    private TransferRequestRepository transferRequestRepository;
    @Autowired
    private CaseRepository caseRepository;
    @Autowired
    private HelpRequestRepository helpRequestRepository;
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CaseTimelineService caseTimelineService;

    @Override
    @Transactional
    public TransferRequestDTO createCaseTransferRequest(String caseId, String requestedByUserId, String requestedAssigneeId, String reason, String notes) {
        Optional<Case> caseOpt = caseRepository.findById(caseId);
        if (caseOpt.isEmpty()) {
            throw new RuntimeException("Case not found: " + caseId);
        }

        Case caseEntity = caseOpt.get();

        if (!requestedByUserId.equals(caseEntity.getAssignedOfficerId())) {
            throw new RuntimeException("Only the current assignee can request a transfer");
        }

        Optional<User> requestedAssigneeOpt = userRepository.findById(requestedAssigneeId);
        if (requestedAssigneeOpt.isEmpty() || requestedAssigneeOpt.get().getRole() != Role.PO) {
            throw new RuntimeException("Requested assignee must be a police officer");
        }

        List<TransferRequest> existingTransfers = transferRequestRepository.findActiveTransfersForCase(caseId);
        if (!existingTransfers.isEmpty()) {
            throw new RuntimeException("There is already an active transfer request for this case");
        }

        TransferRequest transferRequest = new TransferRequest();
        transferRequest.setCaseId(caseId);
        transferRequest.setRequestedByUserId(requestedByUserId);
        transferRequest.setCurrentAssigneeId(caseEntity.getAssignedOfficerId());
        transferRequest.setRequestedAssigneeId(requestedAssigneeId);
        transferRequest.setTransferReason(reason);
        transferRequest.setNotes(notes);
        transferRequest.setStatus(TransferStatus.PENDING);

        if (caseEntity.getPriority() == Priority.URGENT || caseEntity.getPriority() == Priority.CRITICAL ||
                caseEntity.isEmergency()) {
            transferRequest.setUrgent(true);
            transferRequest.setPriority("URGENT");
        }

        TransferRequest savedRequest = transferRequestRepository.save(transferRequest);

        createTransferTimelineEvent(caseId, savedRequest, "Case transfer requested");

        notifyAdminTransferRequest(savedRequest);

        return convertToDTO(savedRequest);
    }

    @Override
    @Transactional
    public TransferRequestDTO createHelpRequestTransferRequest(String helpRequestId, String requestedByUserId, String requestedAssigneeId, String reason, String notes) {
        Optional<HelpRequest> helpRequestOpt = helpRequestRepository.findById(helpRequestId);
        if (helpRequestOpt.isEmpty()) {
            throw new RuntimeException("Help request not found: " + helpRequestId);
        }

        HelpRequest helpRequest = helpRequestOpt.get();

        if (!requestedByUserId.equals(helpRequest.getAssignedWorkerId())) {
            throw new RuntimeException("Only the current assignee can request a transfer");
        }

        Optional<User> requestedAssigneeOpt = userRepository.findById(requestedAssigneeId);
        if (requestedAssigneeOpt.isEmpty() || requestedAssigneeOpt.get().getRole() != Role.SW) {
            throw new RuntimeException("Requested assignee must be a social worker");
        }

        List<TransferRequest> existingTransfers = transferRequestRepository.findActiveTransfersForHelpRequest(helpRequestId);
        if (!existingTransfers.isEmpty()) {
            throw new RuntimeException("There is already an active transfer request for this help request");
        }

        TransferRequest transferRequest = new TransferRequest();
        transferRequest.setHelpRequestId(helpRequestId);
        transferRequest.setRequestedByUserId(requestedByUserId);
        transferRequest.setCurrentAssigneeId(helpRequest.getAssignedWorkerId());
        transferRequest.setRequestedAssigneeId(requestedAssigneeId);
        transferRequest.setTransferReason(reason);
        transferRequest.setNotes(notes);
        transferRequest.setStatus(TransferStatus.PENDING);

        if (helpRequest.getPriority() == Priority.URGENT || helpRequest.getPriority() == Priority.CRITICAL ||
                helpRequest.isEmergency()) {
            transferRequest.setUrgent(true);
            transferRequest.setPriority("URGENT");
        }

        TransferRequest savedRequest = transferRequestRepository.save(transferRequest);

        createHelpRequestTransferTimelineEvent(helpRequestId, savedRequest, "Help request transfer requested");

        notifyAdminTransferRequest(savedRequest);

        return convertToDTO(savedRequest);
    }

    @Override
    public List<TransferRequestDTO> getPendingTransferRequests() {
        List<TransferRequest> requests = transferRequestRepository.findByStatus(TransferStatus.PENDING);
        return requests.stream()
                .map(this::convertToDTO)
                .sorted((r1, r2) -> {
                    if (r1.isUrgent() && !r2.isUrgent()) return -1;
                    if (!r1.isUrgent() && r2.isUrgent()) return 1;
                    return r2.getRequestDate().compareTo(r1.getRequestDate());
                })
                .collect(Collectors.toList());
    }

    @Override
    public List<TransferRequestDTO> getTransferRequestsByUser(String userId) {
        List<TransferRequest> requests = transferRequestRepository.findByRequestedByUserId(userId);
        return requests.stream()
                .map(this::convertToDTO)
                .sorted((r1, r2) -> r2.getRequestDate().compareTo(r1.getRequestDate()))
                .collect(Collectors.toList());
    }

    @Override
    public List<TransferRequestDTO> getTransferRequestsForCase(String caseId) {
        List<TransferRequest> requests = transferRequestRepository.findByCaseId(caseId);
        return requests.stream()
                .map(this::convertToDTO)
                .sorted((r1, r2) -> r2.getRequestDate().compareTo(r1.getRequestDate()))
                .collect(Collectors.toList());
    }

    @Override
    public List<TransferRequestDTO> getTransferRequestsForHelpRequest(String helpRequestId) {
        List<TransferRequest> requests = transferRequestRepository.findByHelpRequestId(helpRequestId);
        return requests.stream()
                .map(this::convertToDTO)
                .sorted((r1, r2) -> r2.getRequestDate().compareTo(r1.getRequestDate()))
                .collect(Collectors.toList());
    }

    @Override
    public TransferRequestDTO getTransferRequest(String transferId) {
        Optional<TransferRequest> requestOpt = transferRequestRepository.findById(transferId);
        return requestOpt.map(this::convertToDTO).orElse(null);
    }

    @Override
    @Transactional
    public TransferRequestDTO approveTransferRequest(String transferId, String adminId, String notes) {
        Optional<TransferRequest> requestOpt = transferRequestRepository.findById(transferId);
        if (requestOpt.isPresent()) {
            TransferRequest request = requestOpt.get();

            if (request.getStatus() != TransferStatus.PENDING) {
                throw new RuntimeException("Transfer request is no longer pending");
            }
            request.setStatus(TransferStatus.APPROVED);
            request.setReviewedByAdminId(adminId);
            request.setReviewDate(LocalDateTime.now());
            request.setNotes(notes != null ? notes : request.getNotes());

            TransferRequest updatedRequest = transferRequestRepository.save(request);

            executeTransfer(transferId);

            if (updatedRequest.getCaseId() != null) {
                createTransferTimelineEvent(updatedRequest.getCaseId(), updatedRequest, "Transfer approved by admin");
            } else if (updatedRequest.getHelpRequestId() != null) {
                createHelpRequestTransferTimelineEvent(updatedRequest.getHelpRequestId(), updatedRequest, "Transfer approved by admin");
            }
            notifyTransferApproved(updatedRequest);

            return convertToDTO(updatedRequest);
        }
        return null;
    }

    @Override
    @Transactional
    public TransferRequestDTO rejectTransferRequest(String transferId, String adminId, String reason) {
        Optional<TransferRequest> requestOpt = transferRequestRepository.findById(transferId);
        if (requestOpt.isPresent()) {
            TransferRequest request = requestOpt.get();

            if (request.getStatus() != TransferStatus.PENDING) {
                throw new RuntimeException("Transfer request is no longer pending");
            }

            request.setStatus(TransferStatus.REJECTED);
            request.setReviewedByAdminId(adminId);
            request.setReviewDate(LocalDateTime.now());
            request.setRejectionReason(reason);
            request.setResponseDate(LocalDateTime.now());

            TransferRequest updatedRequest = transferRequestRepository.save(request);

            if (updatedRequest.getCaseId() != null) {
                createTransferTimelineEvent(updatedRequest.getCaseId(), updatedRequest, "Transfer rejected: " + reason);
            } else if (updatedRequest.getHelpRequestId() != null) {
                createHelpRequestTransferTimelineEvent(updatedRequest.getHelpRequestId(), updatedRequest, "Transfer rejected: " + reason);
            }
            notifyTransferRejected(updatedRequest, reason);

            return convertToDTO(updatedRequest);
        }
        return null;
    }

    @Override
    @Transactional
    public TransferRequestDTO cancelTransferRequest(String transferId, String userId) {
        Optional<TransferRequest> requestOpt = transferRequestRepository.findById(transferId);
        if (requestOpt.isPresent()) {
            TransferRequest request = requestOpt.get();  // Fixed: Declare the variable properly

            if (!request.getRequestedByUserId().equals(userId)) {
                throw new RuntimeException("Only the requester can cancel the transfer request");
            }

            if (request.getStatus() != TransferStatus.PENDING) {
                throw new RuntimeException("Transfer request can only be cancelled while pending");
            }

            request.setStatus(TransferStatus.CANCELLED);
            request.setResponseDate(LocalDateTime.now());

            TransferRequest updatedRequest = transferRequestRepository.save(request);

            if (updatedRequest.getCaseId() != null) {
                createTransferTimelineEvent(updatedRequest.getCaseId(), updatedRequest, "Transfer cancelled by requester");
            } else if (updatedRequest.getHelpRequestId() != null) {
                createHelpRequestTransferTimelineEvent(updatedRequest.getHelpRequestId(), updatedRequest, "Transfer cancelled by requester");
            }

            notifyTransferCancelled(updatedRequest);

            return convertToDTO(updatedRequest);
        }
        return null;
    }

    @Override
    @Transactional
    public boolean executeTransfer(String transferId) {
        Optional<TransferRequest> requestOpt = transferRequestRepository.findById(transferId);
        if (requestOpt.isPresent()) {
            TransferRequest request = requestOpt.get();

            if (request.getCaseId() != null) {
                Optional<Case> caseOpt = caseRepository.findById(request.getCaseId());
                if (caseOpt.isPresent()) {
                    Case caseEntity = caseOpt.get();
                    caseEntity.setAssignedOfficerId(request.getRequestedAssigneeId());
                    caseRepository.save(caseEntity);

                    request.setStatus(TransferStatus.COMPLETED);
                    request.setTransferDate(LocalDateTime.now());
                    transferRequestRepository.save(request);

                    createTransferTimelineEvent(request.getCaseId(), request,
                            "Case transferred to " + getAssigneeName(request.getRequestedAssigneeId()));

                    notifyNewAssignee(request);

                    return true;
                }
            } else if (request.getHelpRequestId() != null) {
                Optional<HelpRequest> helpRequestOpt = helpRequestRepository.findById(request.getHelpRequestId());
                if (helpRequestOpt.isPresent()) {
                    HelpRequest helpRequest = helpRequestOpt.get();
                    helpRequest.setAssignedWorkerId(request.getRequestedAssigneeId());
                    helpRequestRepository.save(helpRequest);

                    request.setStatus(TransferStatus.COMPLETED);
                    request.setTransferDate(LocalDateTime.now());
                    transferRequestRepository.save(request);

                    createHelpRequestTransferTimelineEvent(request.getHelpRequestId(), request,
                            "Help request transferred to " + getAssigneeName(request.getRequestedAssigneeId()));

                    notifyNewAssignee(request);

                    return true;
                }
            }
        }
        return false;
    }

    @Override
    public List<TransferRequestDTO> getUrgentTransferRequests() {
        List<TransferRequest> requests = transferRequestRepository.findUrgentPendingRequests();
        return requests.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<TransferRequestDTO> getTransferHistory(String userId) {
        List<TransferRequest> requests = transferRequestRepository.findByRequestedByUserId(userId);
        return requests.stream()
                .filter(r -> r.getStatus() != TransferStatus.PENDING)
                .map(this::convertToDTO)
                .sorted((r1, r2) -> r2.getRequestDate().compareTo(r1.getRequestDate()))
                .collect(Collectors.toList());
    }

    @Override
    public long getPendingTransferCount() {
        return transferRequestRepository.countByStatus(TransferStatus.PENDING);
    }

    private TransferRequestDTO convertToDTO(TransferRequest request) {
        TransferRequestDTO dto = new TransferRequestDTO();
        dto.setId(request.getId());
        dto.setCaseId(request.getCaseId());
        dto.setHelpRequestId(request.getHelpRequestId());
        dto.setRequestedByUserId(request.getRequestedByUserId());
        dto.setCurrentAssigneeId(request.getCurrentAssigneeId());
        dto.setRequestedAssigneeId(request.getRequestedAssigneeId());
        dto.setTransferReason(request.getTransferReason());
        dto.setStatus(request.getStatus());
        dto.setRejectionReason(request.getRejectionReason());
        dto.setReviewedByAdminId(request.getReviewedByAdminId());
        dto.setReviewDate(request.getReviewDate());
        dto.setRequestDate(request.getRequestDate());
        dto.setResponseDate(request.getResponseDate());
        dto.setTransferDate(request.getTransferDate());
        dto.setNotes(request.getNotes());
        dto.setUrgent(request.isUrgent());
        dto.setPriority(request.getPriority());

        setDisplayNames(dto, request);

        setTrackingInfo(dto, request);

        setCalculatedFields(dto, request);

        return dto;
    }

    private void setDisplayNames(TransferRequestDTO dto, TransferRequest request) {
        if (request.getRequestedByUserId() != null) {
            Optional<User> requester = userRepository.findById(request.getRequestedByUserId());
            if (requester.isPresent()) {
                dto.setRequestedByName(requester.get().getFullName());
                dto.setRequestedByRole(requester.get().getRole().name());
            }
        }
        if (request.getCurrentAssigneeId() != null) {
            Optional<User> currentAssignee = userRepository.findById(request.getCurrentAssigneeId());
            if (currentAssignee.isPresent()) {
                dto.setCurrentAssigneeName(currentAssignee.get().getFullName());
                dto.setCurrentAssigneeRole(currentAssignee.get().getRole().name());
            }
        }
        if (request.getRequestedAssigneeId() != null) {
            Optional<User> requestedAssignee = userRepository.findById(request.getRequestedAssigneeId());
            if (requestedAssignee.isPresent()) {
                dto.setRequestedAssigneeName(requestedAssignee.get().getFullName());
                dto.setRequestedAssigneeRole(requestedAssignee.get().getRole().name());
            }
        }
        if (request.getReviewedByAdminId() != null) {
            Optional<User> admin = userRepository.findById(request.getReviewedByAdminId());
            admin.ifPresent(user ->
                    dto.setReviewedByAdminName(user.getFullName()));
        }
    }

    private void setTrackingInfo(TransferRequestDTO dto, TransferRequest request) {
        if (request.getCaseId() != null) {
            Optional<Case> caseOpt = caseRepository.findById(request.getCaseId());
            if (caseOpt.isPresent()) {
                Case caseEntity = caseOpt.get();
                dto.setTrackingId(caseEntity.getTrackingId());
                dto.setCaseTitle("Case: " + caseEntity.getCaseType() + " - " + caseEntity.getLocation());
            }
        } else if (request.getHelpRequestId() != null) {
            dto.setTrackingId("RH-" + request.getHelpRequestId().substring(0, Math.min(4, request.getHelpRequestId().length())));
            Optional<HelpRequest> helpRequestOpt = helpRequestRepository.findById(request.getHelpRequestId());
            if (helpRequestOpt.isPresent()) {
                HelpRequest helpRequest = helpRequestOpt.get();
                dto.setCaseTitle("Help Request: " + helpRequest.getHelpType() + " - " + helpRequest.getLocation());
            }
        }
    }

    private void setCalculatedFields(TransferRequestDTO dto, TransferRequest request) {
        if (request.getRequestDate() != null) {
            dto.setTimeSinceRequest(calculateTimeSince(request.getRequestDate()));
        }
        dto.setCanApprove(request.getStatus() == TransferStatus.PENDING);
        dto.setCanReject(request.getStatus() == TransferStatus.PENDING);
        dto.setCanCancel(request.getStatus() == TransferStatus.PENDING && request.getReviewedByAdminId() == null);
    }

    private String calculateTimeSince(LocalDateTime dateTime) {
        Duration duration = Duration.between(dateTime, LocalDateTime.now());

        if (duration.toMinutes() < 1) {
            return "Just now";
        } else if (duration.toHours() < 1) {
            long minutes = duration.toMinutes();
            return minutes + " minute" + (minutes == 1 ? "" : "s") + " ago";
        } else if (duration.toDays() < 1) {
            long hours = duration.toHours();
            return hours + " hour" + (hours == 1 ? "" : "s") + " ago";
        } else {
            long days = duration.toDays();
            return days + " day" + (days == 1 ? "" : "s") + " ago";
        }
    }

    private void createTransferTimelineEvent(String caseId, TransferRequest request, String description) {
        try {
            caseTimelineService.createStatusChangeEvent(
                    caseId,
                    request.getRequestedByUserId(),
                    getAssigneeName(request.getRequestedByUserId()),
                    "ASSIGNED_TO_OFFICER",
                    "TRANSFER_REQUESTED",
                    description
            );
        } catch (Exception e) {
            System.out.println("Failed to create timeline event: " + e.getMessage());
        }
    }

    private void createHelpRequestTransferTimelineEvent(String helpRequestId, TransferRequest request, String description) {
        System.out.println("Timeline event for help request transfer: " + description);
    }

    private void notifyAdminTransferRequest(TransferRequest request) {
        System.out.println("Transfer request notification sent to admins");
        System.out.println("Request ID: " + request.getId());
        System.out.println("Type: " + (request.getCaseId() != null ? "Case" : "Help Request"));
        System.out.println("From: " + getAssigneeName(request.getCurrentAssigneeId()));
        System.out.println("To: " + getAssigneeName(request.getRequestedAssigneeId()));
        System.out.println("Reason: " + request.getTransferReason());
        System.out.println("Urgent: " + request.isUrgent());
    }

    private void notifyTransferApproved(TransferRequest request) {
        System.out.println("Transfer approved notification sent to: " + request.getRequestedByUserId());
        System.out.println("Transfer ID: " + request.getId());
        System.out.println("New assignee: " + getAssigneeName(request.getRequestedAssigneeId()));
    }

    private void notifyTransferRejected(TransferRequest request, String reason) {
        System.out.println("Transfer rejected notification sent to: " + request.getRequestedByUserId());
        System.out.println("Transfer ID: " + request.getId());
        System.out.println("Reason: " + reason);
    }

    private void notifyTransferCancelled(TransferRequest request) {
        System.out.println("Transfer cancelled notification sent to admins");
        System.out.println("Transfer ID: " + request.getId());
        System.out.println("Cancelled by: " + getAssigneeName(request.getRequestedByUserId()));
    }

    private void notifyNewAssignee(TransferRequest request) {
        System.out.println("New assignment notification sent to: " + request.getRequestedAssigneeId());
        System.out.println("You have been assigned to: " +
                (request.getCaseId() != null ? "Case " + request.getCaseId() :
                        "Help Request " + request.getHelpRequestId()));
    }

    private String getAssigneeName(String userId) {
        if (userId == null) return "Unknown";
        Optional<User> user = userRepository.findById(userId);
        return user.map(User::getFullName).orElse("Unknown");
    }
}