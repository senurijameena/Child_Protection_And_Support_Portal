package com.example.childPortal.service;

import com.example.childPortal.dto.InformationRequestDTO; 
import com.example.childPortal.dto.InformationResponseDTO; 
import com.example.childPortal.dto.UserResponseDTO; 
import com.example.childPortal.model.InformationRequest.RequestStatus;

import java.time.LocalDateTime;
import java.util.List;

public interface InformationRequestService {
    InformationRequestDTO createInformationRequest(InformationRequestDTO requestDTO);
    InformationRequestDTO getInformationRequestById(String id);
    List<InformationRequestDTO> getPendingRequestsForUser(String userId);
    List<InformationRequestDTO> getRequestsByCase(String caseId);
    List<InformationRequestDTO> getRequestsByHelpRequest(String helpRequestId); 
    List<InformationRequestDTO> getUrgentRequests(); 
    List<InformationRequestDTO> getOverdueRequests();
    UserResponseDTO submitResponse(InformationResponseDTO responseDTO, String userId); 
    InformationRequestDTO updateRequestStatus(String requestId, RequestStatus status);
    InformationRequestDTO requestExtension(String requestId, String reason, LocalDateTime newDueDate); 

    boolean deleteInformationRequest(String requestId);

}
