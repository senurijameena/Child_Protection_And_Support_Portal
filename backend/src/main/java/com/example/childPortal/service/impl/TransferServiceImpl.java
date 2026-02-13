package com.example.childPortal.service.impl;

import com.example.childPortal.dto.TransferRequestDTO;
import com.example.childPortal.model.TransferRequest;
import com.example.childPortal.repository.TransferRequestRepository;
import com.example.childPortal.service.HelpRequestService;
import com.example.childPortal.service.NotificationService;
import com.example.childPortal.service.TransferService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
public class TransferServiceImpl implements TransferService {

    @Autowired private TransferRequestRepository transferRequestRepository;
    @Autowired private HelpRequestService helpRequestService;
    @Autowired(required = false) private NotificationService notificationService;

    @Override
    public TransferRequestDTO createCaseTransfer(String caseId, String fromUserId, String toUserId, String reason) {
        TransferRequest transfer = new TransferRequest();
        transfer.setEntityId(caseId);
        transfer.setEntityType("CASE");
        transfer.setFromUserId(fromUserId);
        transfer.setToUserId(toUserId);
        transfer.setReason(reason);
        transfer.setRequestedAt(LocalDateTime.now());
        transfer.setStatus(TransferRequest.TransferStatus.PENDING);
        
        transfer = transferRequestRepository.save(transfer);
        return convertToDTO(transfer);
    }

    @Override
    public TransferRequestDTO createHelpRequestTransfer(String helpRequestId, String fromUserId, String toUserId, String reason) {
        TransferRequest transfer = new TransferRequest();
        transfer.setEntityId(helpRequestId);
        transfer.setEntityType("HELP_REQUEST");
        transfer.setFromUserId(fromUserId);
        transfer.setToUserId(toUserId);
        transfer.setReason(reason);
        transfer.setRequestedAt(LocalDateTime.now());
        transfer.setStatus(TransferRequest.TransferStatus.PENDING);
        
        transfer = transferRequestRepository.save(transfer);
        return convertToDTO(transfer);
    }

    @Override
    public TransferRequestDTO getTransferRequest(String transferId) {
        return transferRequestRepository.findById(transferId)
                .map(this::convertToDTO)
                .orElse(null);
    }

    @Override
    public List<TransferRequestDTO> getPendingTransfers() {
        return transferRequestRepository.findByStatus(TransferRequest.TransferStatus.PENDING).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<TransferRequestDTO> getTransfersByUser(String userId) {
        List<TransferRequest> fromUser = transferRequestRepository.findByFromUserId(userId);
        List<TransferRequest> toUser = transferRequestRepository.findByToUserId(userId);

        return Stream.concat(fromUser.stream(), toUser.stream())
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<TransferRequestDTO> getTransfersForEntity(String entityId) {
        return transferRequestRepository.findByEntityId(entityId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public TransferRequestDTO approveTransfer(String transferId, String adminId) {
        return transferRequestRepository.findById(transferId)
                .map(transfer -> {
                    transfer.setStatus(TransferRequest.TransferStatus.APPROVED);
                    transfer.setProcessedAt(LocalDateTime.now());
                    transfer.setProcessedBy(adminId);
                    transferRequestRepository.save(transfer);
                    return convertToDTO(transfer);
                })
                .orElse(null);
    }

    @Override
    public TransferRequestDTO rejectTransfer(String transferId, String adminId, String reason) {
        return transferRequestRepository.findById(transferId)
                .map(transfer -> {
                    transfer.setStatus(TransferRequest.TransferStatus.REJECTED);
                    transfer.setReason(transfer.getReason() + " | Rejection Reason: " + reason);
                    transfer.setProcessedAt(LocalDateTime.now());
                    transfer.setProcessedBy(adminId);
                    transferRequestRepository.save(transfer);
                    return convertToDTO(transfer);
                })
                .orElse(null);
    }

    @Override
    public TransferRequestDTO cancelTransfer(String transferId, String userId) {
        return transferRequestRepository.findById(transferId)
                .map(transfer -> {
                    boolean canCancel = transfer.getFromUserId().equals(userId)
                            && transfer.getStatus() == TransferRequest.TransferStatus.PENDING;
                    if (canCancel) {
                        transfer.setStatus(TransferRequest.TransferStatus.CANCELLED);
                        transfer.setProcessedAt(LocalDateTime.now());
                        transfer.setProcessedBy(userId);
                        transferRequestRepository.save(transfer);
                        return convertToDTO(transfer);
                    }
                    return null;
                })
                .orElse(null);
    }

    @Override
    public TransferRequestDTO acceptTransferByRecipient(String transferId, String recipientUserId) {
        return transferRequestRepository.findById(transferId)
                .map(transfer -> {
                    boolean validRecipient = transfer.getToUserId() != null
                            && transfer.getToUserId().equals(recipientUserId);
                    boolean isPending = transfer.getStatus() == TransferRequest.TransferStatus.PENDING;
                    if (!validRecipient || !isPending) {
                        return null;
                    }

                    if ("HELP_REQUEST".equalsIgnoreCase(transfer.getEntityType()) && transfer.getEntityId() != null) {
                        helpRequestService.assignHelpRequestToWorker(
                                transfer.getEntityId(),
                                recipientUserId,
                                recipientUserId);
                    }

                    transfer.setStatus(TransferRequest.TransferStatus.ACTIVE);
                    transfer.setProcessedAt(LocalDateTime.now());
                    transfer.setProcessedBy(recipientUserId);
                    transferRequestRepository.save(transfer);

                    if (notificationService != null && transfer.getFromUserId() != null) {
                        String actionUrl = "HELP_REQUEST".equalsIgnoreCase(transfer.getEntityType())
                                ? "/social-worker/requests/" + transfer.getEntityId()
                                : null;
                        notificationService.createNotification(
                                transfer.getFromUserId(),
                                "TRANSFER_ACCEPTED",
                                "Transfer Accepted",
                                "Your transfer request " + transfer.getId() + " was accepted by " + recipientUserId + ".",
                                actionUrl);
                    }

                    return convertToDTO(transfer);
                })
                .orElse(null);
    }

    @Override
    public TransferRequestDTO rejectTransferByRecipient(String transferId, String recipientUserId, String reason) {
        return transferRequestRepository.findById(transferId)
                .map(transfer -> {
                    boolean validRecipient = transfer.getToUserId() != null
                            && transfer.getToUserId().equals(recipientUserId);
                    boolean isPending = transfer.getStatus() == TransferRequest.TransferStatus.PENDING;
                    if (!validRecipient || !isPending) {
                        return null;
                    }

                    transfer.setStatus(TransferRequest.TransferStatus.REJECTED);
                    String rejectReason = reason != null && !reason.trim().isEmpty() ? reason.trim() : "No reason provided";
                    transfer.setReason((transfer.getReason() != null ? transfer.getReason() : "")
                            + " | Rejection Reason: " + rejectReason);
                    transfer.setProcessedAt(LocalDateTime.now());
                    transfer.setProcessedBy(recipientUserId);
                    transferRequestRepository.save(transfer);

                    if (notificationService != null && transfer.getFromUserId() != null) {
                        notificationService.createNotification(
                                transfer.getFromUserId(),
                                "TRANSFER_REJECTED",
                                "Transfer Rejected",
                                "Your transfer request " + transfer.getId() + " was rejected. Reason: " + rejectReason,
                                null);
                    }

                    return convertToDTO(transfer);
                })
                .orElse(null);
    }

    @Override
    public boolean executeTransfer(String transferId) {
        Optional<TransferRequest> transferOpt = transferRequestRepository.findById(transferId);
        if (transferOpt.isPresent()) {
            TransferRequest transfer = transferOpt.get();
            transfer.setStatus(TransferRequest.TransferStatus.APPROVED); // Or add an EXECUTED status
            transferRequestRepository.save(transfer);
            return true;
        }
        return false;
    }

    @Override
    public List<TransferRequestDTO> getUrgentTransferRequests() {
        return getPendingTransfers();
    }

    @Override
    public List<TransferRequestDTO> getTransferHistory(String userId) {
        return getTransfersByUser(userId);
    }

    @Override
    public long getPendingTransferCount() {
        return transferRequestRepository.findByStatus(TransferRequest.TransferStatus.PENDING).size();
    }

    private TransferRequestDTO convertToDTO(TransferRequest transfer) {
        TransferRequestDTO dto = new TransferRequestDTO();
        dto.setId(transfer.getId());
        dto.setEntityId(transfer.getEntityId());
        dto.setEntityType(transfer.getEntityType());
        dto.setFromUserId(transfer.getFromUserId());
        dto.setToUserId(transfer.getToUserId());
        dto.setReason(transfer.getReason());
        dto.setStatus(transfer.getStatus().name());
        dto.setRequestedAt(transfer.getRequestedAt());
        return dto;
    }
}
