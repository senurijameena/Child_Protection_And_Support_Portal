package com.example.childPortal.service;

import com.example.childPortal.dto.AdminDashboardDTO;
import com.example.childPortal.dto.CaseApproveDTO;
import com.example.childPortal.dto.HelpRequestApproveDTO; 
import java.util.List;


public interface AdminService {
AdminDashboardDTO getDashboardData();
List<CaseApproveDTO> getPendingCases();
List<CaseApproveDTO> getEmergencyCases();
List<HelpRequestApproveDTO> getPendingHelpRequests();
boolean approveCase(String caseId, String adminId);
boolean rejectCase(String caseId, String reason, String adminId);
boolean approveHelpRequest(String helpRequestId, String adminId);
boolean rejectHelpRequest(String helpRequestId, String reason, String adminId); 
CaseApproveDTO getCaseForApproval(String caseId);
HelpRequestApproveDTO getHelpRequestForApproval(String helpRequestId); 
void updateCasePriority(String caseId, String priority);
void updateHelpRequestPriority(String helpRequestId, String priority);

}
