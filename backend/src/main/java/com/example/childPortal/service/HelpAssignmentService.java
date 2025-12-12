package com.example.childPortal.service;

import com.example.childPortal.dto.HelpRequestAssignmentDTO;
import com.example.childPortal.dto.HelpRequestTransferDTO;
import com.example.childPortal.dto.SocialWorkerDashboardDTO;
import com.example.childPortal.dto.HelpRequestDTO;
import com.example.childPortal.model.HelpRequestAssignment.AssignmentStatus;
import java.util.List;

public interface HelpAssignmentService {

 SocialWorkerDashboardDTO getSocialWorkerDashboard(String socialWorkerId);

 HelpRequestAssignmentDTO assignHelpRequest(String helpRequestId, String socialWorkerId);
 HelpRequestAssignmentDTO startWorkingOnHelpRequest(String helpRequestId, String socialWorkerId, String initialNotes);
 HelpRequestAssignmentDTO completeHelpRequest(String helpRequestId, String socialWorkerId, String completionNotes);
 HelpRequestAssignmentDTO updateHelpRequestAssignment(String assignmentId,
 HelpRequestAssignmentDTO assignmentDTO);

 HelpRequestTransferDTO requestTransfer(String helpRequestId, String currentWorkerId, String requestedWorkerId, String reason);
 HelpRequestTransferDTO approveTransfer(String transferId, String approvingWorkerId, String notes);
 HelpRequestTransferDTO rejectTransfer(String transferId, String rejectingWorkerId, String reason);
 HelpRequestTransferDTO completeTransfer(String transferId);

 List<HelpRequestAssignmentDTO> getAssignmentsBySocialWorker(String socialWorkerId);
 List<HelpRequestAssignmentDTO> getAssignmentsByStatus(String socialWorkerId, AssignmentStatus status);
 List<HelpRequestAssignmentDTO> getNewAssignments(String socialWorkerId);
 List<HelpRequestAssignmentDTO> getUrgentAssignments(String socialWorkerId);

 List<HelpRequestTransferDTO> getPendingTransfers(String socialWorkerId);
 List<HelpRequestTransferDTO> getTransferHistory(String socialWorkerId);

 HelpRequestDTO addNotesToHelpRequest(String helpRequestId, String notes, String socialWorkerId);
 HelpRequestDTO uploadEvidenceToHelpRequest(String helpRequestId, String evidenceUrl, String socialWorkerId);
 HelpRequestDTO updateHelpRequestPriority(String helpRequestId, String priority, String socialWorkerId);
}
