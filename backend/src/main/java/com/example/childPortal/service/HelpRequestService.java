package com.example.childPortal.service;

import com.example.childPortal.dto.HelpRequestDTO; 
import com.example.childPortal.dto.HelpResponse; 
import com.example.childPortal.model.HelpRequest.RequestStatus; 
import com.example.childPortal.model.HelpType; 
import java.util.List;

public interface HelpRequestService {
    HelpResponse createHelpRequest(HelpRequestDTO helpRequestDTO, String requesterUserId); 
    HelpRequestDTO getHelpRequestById(String requestId); 
    List<HelpRequestDTO> getHelpRequestsByRequester(String requesterUserId); 
    List<HelpRequestDTO> getAllHelpRequests(); 
    List<HelpRequestDTO> getHelpRequestsByStatus(RequestStatus status); 
    List<HelpRequestDTO> getHelpRequestsByType(HelpType helpType); 
    HelpRequestDTO updateHelpRequestStatus(String requestId, RequestStatus status); 
    HelpRequestDTO assignHelpRequestToWorker(String requestId, String workerId); 
    boolean deleteHelpRequest(String requestId); 
    List<HelpRequestDTO> searchHelpRequestsByLocation(String location); 
}
