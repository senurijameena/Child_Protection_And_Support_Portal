package com.example.childPortal.service; 
import com.example.childPortal.dto.TransferRequestDTO; 
import java.util.List; 
 
public interface TransferService { 
    TransferRequestDTO createCaseTransfer(String caseId, String fromUserId, String toUserId, String reason); 
    TransferRequestDTO createHelpRequestTransfer(String helpRequestId, String fromUserId, String toUserId, String reason); 
    TransferRequestDTO getTransferRequest(String transferId); 
    List<TransferRequestDTO> getPendingTransfers(); 
    List<TransferRequestDTO> getTransfersByUser(String userId); 
    List<TransferRequestDTO> getTransfersForEntity(String entityId); 
    TransferRequestDTO approveTransfer(String transferId, String adminId); 
    TransferRequestDTO rejectTransfer(String transferId, String adminId, String reason); 
    TransferRequestDTO cancelTransfer(String transferId, String userId); 
    TransferRequestDTO acceptTransferByRecipient(String transferId, String recipientUserId);
    TransferRequestDTO rejectTransferByRecipient(String transferId, String recipientUserId, String reason);

    List<TransferRequestDTO> getUrgentTransferRequests();
    List<TransferRequestDTO> getTransferHistory(String userId);
    long getPendingTransferCount();
    boolean executeTransfer(String transferId);
}
