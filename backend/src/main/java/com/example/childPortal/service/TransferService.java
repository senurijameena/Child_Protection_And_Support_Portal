package com.example.childPortal.service; 
 
import com.example.childPortal.dto.TransferRequestDTO; 
import com.example.childPortal.dto.TransferActionDTO; 
import com.example.childPortal.model.TransferRequest.TransferStatus; 
import java.util.List; 
 
public interface TransferService { 
    TransferRequestDTO createCaseTransferRequest(String caseId, String requestedByUserId,  String requestedAssigneeId, String reason, String notes); 
    TransferRequestDTO createHelpRequestTransferRequest(String helpRequestId, String requestedByUserId, String requestedAssigneeId, String reason, String notes); 
    List<TransferRequestDTO> getPendingTransferRequests(); 
    List<TransferRequestDTO> getTransferRequestsByUser(String userId); 
    List<TransferRequestDTO> getTransferRequestsForCase(String caseId); 
    List<TransferRequestDTO> getTransferRequestsForHelpRequest(String helpRequestId); 
    TransferRequestDTO getTransferRequest(String transferId); 
    TransferRequestDTO approveTransferRequest(String transferId, String adminId, String notes); 
    TransferRequestDTO rejectTransferRequest(String transferId, String adminId, String reason); 
    TransferRequestDTO cancelTransferRequest(String transferId, String userId); 
    boolean executeTransfer(String transferId); 
    List<TransferRequestDTO> getUrgentTransferRequests(); 
    List<TransferRequestDTO> getTransferHistory(String userId); 
    long getPendingTransferCount(); 
}
