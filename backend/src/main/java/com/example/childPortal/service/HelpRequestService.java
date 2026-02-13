package com.example.childPortal.service;

import com.example.childPortal.dto.HelpRequestDTO;
import com.example.childPortal.dto.HelpResponse;
import com.example.childPortal.model.HelpRequest;
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
         * Apply a published service package to a help request and send it to the public
         * user
         * for approval. This moves the request into the "PACKAGE_PROPOSED" phase.
         */
        HelpRequestDTO applyServicePackageToRequest(String requestId, String packageId, String appliedBy);

        /**
         * Public user accepts the applied service package. Sets appliedPackageStatus to
         * ACCEPTED,
         * request status to IN_PROGRESS.
         */
        HelpRequestDTO acceptAppliedPackage(String requestId, String acceptedByUserId);

        /**
         * Public user rejects the applied service package. Sets appliedPackageStatus to
         * REJECTED,
         * request status to PACKAGE_REJECTED.
         */
        HelpRequestDTO rejectAppliedPackage(String requestId, String reason, String rejectedByUserId);

        /**
         * SW updates a service item's execution status (PENDING, IN_PROGRESS,
         * SCHEDULED, COMPLETED).
         * When status is IN_PROGRESS, optional startDate and notes can be provided; a
         * timeline event is added.
         */
        HelpRequestDTO updateServiceItemStatus(String requestId, String serviceItem, String status,
                        String updatedByUserId);

        HelpRequestDTO updateServiceItemStatus(String requestId, String serviceItem, String status,
                        String updatedByUserId,
                        java.time.LocalDateTime startDate, String notes);

        /**
         * SW assigns resource and scheduled date to a service item.
         */
        HelpRequestDTO assignServiceItemResource(String requestId, String serviceItem, String assignedResource,
                        java.time.LocalDateTime scheduledDate, String notes, String updatedByUserId);

        /**
         * PU or SW submits a follow-up for the package (e.g. visit, call, session).
         * Creates FollowUp and links to request.
         */
        HelpRequestDTO submitPackageFollowUp(String requestId, String followUpDate, String followUpType, String notes,
                        String submittedByUserId);

        /**
         * PU requests an adjustment for a specific service item in the proposed
         * package.
         */
        HelpRequestDTO requestServiceAdjustment(String requestId, String serviceItem, String message,
                        String requestedByUserId);

        // New Service Workflow
        HelpRequestDTO startServiceExecution(String requestId, String userId);

        HelpRequestDTO updateServiceOutcome(String requestId, String serviceItem, String outcome, String reason,
                        String notes, String userId);

        HelpRequestDTO submitFinalAssessment(String requestId,
                        HelpRequest.FinalAssessment assessment, String userId);

        HelpRequestDTO finalizeCase(String requestId, String userId);
}
