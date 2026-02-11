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

    HelpRequestDTO updateHelpRequestStatus(String requestId, RequestStatus status, String updatedBy);

    HelpRequestDTO assignHelpRequestToWorker(String requestId, String workerId, String assignedBy);

    boolean deleteHelpRequest(String requestId);

    HelpRequestDTO updateHelpRequestNotes(String requestId, String notes, String updatedBy);

    List<HelpRequestDTO> searchHelpRequestsByLocation(String location);

    List<HelpRequestDTO> getHelpRequestsByWorker(String workerId);

    HelpRequestDTO rejectHelpRequest(String requestId, String reason, String rejectedBy);

    HelpRequestDTO acceptHelpRequest(String requestId, String acceptedBy);

    HelpRequestDTO declineHelpRequest(String requestId, String reason, String declinedBy);

    HelpRequestDTO addDocumentToHelpRequest(String requestId, String documentUrl);

  /**
   * Apply a published service package to a help request and send it to the public user
   * for approval. This moves the request into the "PACKAGE_PROPOSED" phase.
   */
  HelpRequestDTO applyServicePackageToRequest(String requestId, String packageId, String appliedBy);
}