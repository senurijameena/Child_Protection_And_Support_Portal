package com.example.childPortal.service;

import com.example.childPortal.dto.CompletedHelpReportDraftRequestDTO;
import com.example.childPortal.dto.CompletedHelpReportListItemDTO;
import com.example.childPortal.dto.CompletedHelpReportReviewRequestDTO;
import com.example.childPortal.dto.CompletedHelpRequestReportDTO;
import com.example.childPortal.model.CaseTimelineEvent;
import com.example.childPortal.model.CompletedHelpRequestReport;
import com.example.childPortal.model.FollowUp;
import com.example.childPortal.model.HelpRequest;
import com.example.childPortal.model.Message;
import com.example.childPortal.model.Role;
import com.example.childPortal.model.ServiceItemExecution;
import com.example.childPortal.model.ServicePackage;
import com.example.childPortal.model.User;
import com.example.childPortal.repository.CaseTimelineEventRepository;
import com.example.childPortal.repository.CompletedHelpRequestReportRepository;
import com.example.childPortal.repository.FollowUpRepository;
import com.example.childPortal.repository.HelpRequestRepository;
import com.example.childPortal.repository.MessageRepository;
import com.example.childPortal.repository.ServicePackageRepository;
import com.example.childPortal.repository.UserRepository;
import com.lowagie.text.Document;
import com.lowagie.text.Font;
import com.lowagie.text.FontFactory;
import com.lowagie.text.Paragraph;
import com.lowagie.text.pdf.PdfWriter;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.io.ByteArrayOutputStream;
import java.time.Duration;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Optional;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@Transactional
public class CompletedHelpRequestReportService {

    private final CompletedHelpRequestReportRepository reportRepository;
    private final HelpRequestRepository helpRequestRepository;
    private final UserRepository userRepository;
    private final FollowUpRepository followUpRepository;
    private final ServicePackageRepository servicePackageRepository;
    private final MessageRepository messageRepository;
    private final CaseTimelineEventRepository timelineEventRepository;
    private final AiReportSummaryService aiReportSummaryService;
    private final NotificationService notificationService;

    public CompletedHelpRequestReportService(
            CompletedHelpRequestReportRepository reportRepository,
            HelpRequestRepository helpRequestRepository,
            UserRepository userRepository,
            FollowUpRepository followUpRepository,
            ServicePackageRepository servicePackageRepository,
            MessageRepository messageRepository,
            CaseTimelineEventRepository timelineEventRepository,
            AiReportSummaryService aiReportSummaryService,
            NotificationService notificationService) {
        this.reportRepository = reportRepository;
        this.helpRequestRepository = helpRequestRepository;
        this.userRepository = userRepository;
        this.followUpRepository = followUpRepository;
        this.servicePackageRepository = servicePackageRepository;
        this.messageRepository = messageRepository;
        this.timelineEventRepository = timelineEventRepository;
        this.aiReportSummaryService = aiReportSummaryService;
        this.notificationService = notificationService;
    }

    public CompletedHelpRequestReportDTO getReportPreview(String requestId, String userId) {
        HelpRequest request = getRequestOrThrow(requestId);
        User user = getUserOrThrow(userId);
        validateReadAccess(user, request);
        validateCompleted(request);

        CompletedHelpRequestReport report = getOrCreateReport(request, user);
        return buildReportDto(request, report);
    }

    public CompletedHelpRequestReportDTO saveDraft(String requestId, String userId,
                                                   CompletedHelpReportDraftRequestDTO draft) {
        HelpRequest request = getRequestOrThrow(requestId);
        User user = getUserOrThrow(userId);
        validateSwAccess(user, request);
        validateCompleted(request);
        CompletedHelpRequestReport report = getOrCreateReport(request, user);

        report.setInitialAssessmentSummary(draft.getInitialAssessmentSummary());
        report.setAdjustments(draft.getAdjustments());
        report.setFollowUpObservations(draft.getFollowUpObservations());
        report.setObjectiveAchieved(defaultIfBlank(draft.getObjectiveAchieved(), report.getObjectiveAchieved()));
        report.setImprovementLevel(defaultIfBlank(draft.getImprovementLevel(), report.getImprovementLevel()));
        report.setChildSafetyStatus(defaultIfBlank(draft.getChildSafetyStatus(), report.getChildSafetyStatus()));
        report.setFamilyStabilityStatus(defaultIfBlank(draft.getFamilyStabilityStatus(), report.getFamilyStabilityStatus()));
        report.setEducationContinuityStatus(defaultIfBlank(draft.getEducationContinuityStatus(), report.getEducationContinuityStatus()));
        report.setChallenges(nullSafeList(draft.getChallenges()));
        report.setRecommendations(nullSafeList(draft.getRecommendations()));
        report.setAttachments(nullSafeList(draft.getAttachments()));
        if (draft.getFinalDeclarationText() != null && !draft.getFinalDeclarationText().isBlank()) {
            report.setFinalDeclarationText(draft.getFinalDeclarationText());
        }
        report.setDeclarationSignedAt(LocalDateTime.now());
        report.setDeclarationSignedById(user.getId());
        report.setWorkflowStatus(CompletedHelpRequestReport.WorkflowStatus.DRAFT);
        reportRepository.save(report);

        return buildReportDto(request, report);
    }

    public List<CompletedHelpReportListItemDTO> getDraftReports(String userId) {
        User user = getUserOrThrow(userId);
        if (user.getRole() != Role.SW) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only social workers can view draft reports");
        }

        List<CompletedHelpRequestReport> drafts =
                reportRepository.findByGeneratedByUserIdAndWorkflowStatusOrderByGeneratedAtDesc(
                        userId,
                        CompletedHelpRequestReport.WorkflowStatus.DRAFT
                );

        List<String> requestIds = drafts.stream()
                .map(CompletedHelpRequestReport::getHelpRequestId)
                .filter(id -> id != null && !id.isBlank())
                .collect(Collectors.toList());

        Map<String, HelpRequest> requestMap = helpRequestRepository.findAllById(requestIds)
                .stream()
                .collect(Collectors.toMap(HelpRequest::getId, r -> r));

        return drafts.stream().map(draft -> {
            HelpRequest req = requestMap.get(draft.getHelpRequestId());
            CompletedHelpReportListItemDTO item = new CompletedHelpReportListItemDTO();
            item.setReportId(draft.getReportId());
            item.setHelpRequestId(draft.getHelpRequestId());
            item.setHelpTrackingId(req != null ? req.getTrackingId() : draft.getHelpRequestId());
            item.setRequesterName(req != null
                    ? (req.isAnonymous() ? "Anonymous Requester" : defaultIfBlank(req.getRequesterName(), "Public User"))
                    : "Unknown");
            item.setRequestType(req != null && req.getHelpType() != null ? req.getHelpType().name() : "N/A");
            item.setRequestStatus(req != null && req.getStatus() != null ? req.getStatus().name() : "N/A");
            item.setWorkflowStatus(draft.getWorkflowStatus().name());
            item.setGeneratedAt(draft.getGeneratedAt());
            return item;
        }).collect(Collectors.toList());
    }

    public List<CompletedHelpReportListItemDTO> getSubmittedReports(String userId) {
        User user = getUserOrThrow(userId);
        if (user.getRole() != Role.SW) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only social workers can view submitted reports");
        }

        List<CompletedHelpRequestReport.WorkflowStatus> statuses = List.of(
                CompletedHelpRequestReport.WorkflowStatus.SENT_TO_ADMIN,
                CompletedHelpRequestReport.WorkflowStatus.APPROVED,
                CompletedHelpRequestReport.WorkflowStatus.CLARIFICATION_REQUESTED,
                CompletedHelpRequestReport.WorkflowStatus.REOPEN_REQUESTED
        );

        List<CompletedHelpRequestReport> submitted =
                reportRepository.findByGeneratedByUserIdAndWorkflowStatusInOrderByGeneratedAtDesc(userId, statuses);

        List<String> requestIds = submitted.stream()
                .map(CompletedHelpRequestReport::getHelpRequestId)
                .filter(id -> id != null && !id.isBlank())
                .collect(Collectors.toList());

        Map<String, HelpRequest> requestMap = helpRequestRepository.findAllById(requestIds)
                .stream()
                .collect(Collectors.toMap(HelpRequest::getId, r -> r));

        return submitted.stream().map(report -> {
            HelpRequest req = requestMap.get(report.getHelpRequestId());
            CompletedHelpReportListItemDTO item = new CompletedHelpReportListItemDTO();
            item.setReportId(report.getReportId());
            item.setHelpRequestId(report.getHelpRequestId());
            item.setHelpTrackingId(req != null ? req.getTrackingId() : report.getHelpRequestId());
            item.setRequesterName(req != null
                    ? (req.isAnonymous() ? "Anonymous Requester" : defaultIfBlank(req.getRequesterName(), "Public User"))
                    : "Unknown");
            item.setRequestType(req != null && req.getHelpType() != null ? req.getHelpType().name() : "N/A");
            item.setRequestStatus(req != null && req.getStatus() != null ? req.getStatus().name() : "N/A");
            item.setWorkflowStatus(report.getWorkflowStatus().name());
            item.setGeneratedAt(report.getGeneratedAt());
            return item;
        }).collect(Collectors.toList());
    }

    public CompletedHelpRequestReportDTO sendToAdmin(String requestId, String userId) {
        HelpRequest request = getRequestOrThrow(requestId);
        User user = getUserOrThrow(userId);
        validateSwAccess(user, request);
        validateCompleted(request);
        CompletedHelpRequestReport report = getOrCreateReport(request, user);

        report.setWorkflowStatus(CompletedHelpRequestReport.WorkflowStatus.SENT_TO_ADMIN);
        report.setSentToAdminAt(LocalDateTime.now());
        reportRepository.save(report);

        notificationService.sendCompletedHelpReportToAdmin(
                request.getId(),
                request.getTrackingId(),
                report.getReportId(),
                user.getFullName(),
                user.getId()
        );

        return buildReportDto(request, report);
    }

    public void deleteDraft(String requestId, String userId) {
        HelpRequest request = getRequestOrThrow(requestId);
        User user = getUserOrThrow(userId);
        validateSwAccess(user, request);

        CompletedHelpRequestReport report = reportRepository.findByHelpRequestId(requestId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Draft report not found"));

        if (report.getWorkflowStatus() != CompletedHelpRequestReport.WorkflowStatus.DRAFT) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Only DRAFT reports can be deleted");
        }

        reportRepository.delete(report);
    }

    public CompletedHelpRequestReportDTO reviewByAdmin(String requestId, String adminUserId,
                                                       CompletedHelpReportReviewRequestDTO reviewRequest) {
        HelpRequest request = getRequestOrThrow(requestId);
        User admin = getUserOrThrow(adminUserId);
        if (admin.getRole() != Role.ADMIN) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only admins can review this report");
        }

        CompletedHelpRequestReport report = reportRepository.findByHelpRequestId(requestId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Report not found"));

        String action = (reviewRequest.getAction() == null ? "" : reviewRequest.getAction().trim().toUpperCase(Locale.ROOT));
        if ("APPROVE".equals(action)) {
            report.setWorkflowStatus(CompletedHelpRequestReport.WorkflowStatus.APPROVED);
        } else if ("CLARIFICATION".equals(action)) {
            report.setWorkflowStatus(CompletedHelpRequestReport.WorkflowStatus.CLARIFICATION_REQUESTED);
        } else if ("REOPEN".equals(action)) {
            report.setWorkflowStatus(CompletedHelpRequestReport.WorkflowStatus.REOPEN_REQUESTED);
            request.setStatus(HelpRequest.RequestStatus.IN_PROGRESS);
            request.setLastUpdated(LocalDateTime.now());
            helpRequestRepository.save(request);
        } else {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid review action");
        }

        report.setAdminReviewNote(reviewRequest.getNote());
        report.setReviewedByUserId(admin.getId());
        report.setReviewedByName(admin.getFullName());
        report.setReviewedAt(LocalDateTime.now());
        reportRepository.save(report);

        if (request.getAssignedWorkerId() != null) {
            notificationService.sendCompletedHelpReportReviewToSocialWorker(
                    request.getAssignedWorkerId(),
                    request.getId(),
                    request.getTrackingId(),
                    report.getReportId(),
                    report.getWorkflowStatus().name(),
                    reviewRequest.getNote()
            );
        }

        return buildReportDto(request, report);
    }

    public byte[] generatePdf(String requestId, String userId) {
        CompletedHelpRequestReportDTO dto = getReportPreview(requestId, userId);
        try {
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            Document document = new Document();
            PdfWriter.getInstance(document, out);
            document.open();

            Font title = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 16);
            Font section = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12);
            Font normal = FontFactory.getFont(FontFactory.HELVETICA, 10);

            document.add(new Paragraph(dto.getReportHeader().getReportTitle(), title));
            document.add(new Paragraph("Report ID: " + dto.getReportHeader().getReportId(), normal));
            document.add(new Paragraph("Help ID: " + dto.getReportHeader().getHelpId(), normal));
            document.add(new Paragraph("Generated By: " + dto.getReportHeader().getGeneratedBy()
                    + " (" + dto.getReportHeader().getGeneratedById() + ")", normal));
            document.add(new Paragraph("Generated Date: " + fmt(dto.getReportHeader().getGeneratedDate()), normal));
            document.add(new Paragraph(" "));

            addSection(document, "Help Summary", section, normal,
                    "Type: " + dto.getHelpSummary().getRequestType(),
                    "Priority: " + dto.getHelpSummary().getPriorityLevel(),
                    "Submitted: " + fmt(dto.getHelpSummary().getDateSubmitted()),
                    "Assigned: " + fmt(dto.getHelpSummary().getDateAssignedToSW()),
                    "Service Started: " + fmt(dto.getHelpSummary().getDateServiceStarted()),
                    "Completed: " + fmt(dto.getHelpSummary().getDateCompleted()),
                    "Duration: " + dto.getHelpSummary().getTotalDurationDays() + " day(s)",
                    "Status: " + dto.getHelpSummary().getStatus()
            );

            addSection(document, "Public User Information", section, normal,
                    "Name: " + dto.getPublicUserInfo().getName(),
                    "Contact: " + dto.getPublicUserInfo().getContactNumber(),
                    "Location: " + dto.getPublicUserInfo().getDistrictOrLocation(),
                    "Vulnerability Category: " + dto.getPublicUserInfo().getVulnerabilityCategory()
            );

            addSection(document, "Initial Request Details", section, normal,
                    "Problem Description: " + dto.getInitialRequestDetails().getProblemDescription(),
                    "Initial Assessment Summary: " + dto.getInitialRequestDetails().getInitialAssessmentSummary()
            );

            addSection(document, "Outcome Assessment", section, normal,
                    "Objective Achieved: " + dto.getOutcomeAssessment().getObjectiveAchieved(),
                    "Improvement Level: " + dto.getOutcomeAssessment().getImprovementLevel(),
                    "Child Safety Status: " + dto.getOutcomeAssessment().getChildSafetyStatus(),
                    "Family Stability Status: " + dto.getOutcomeAssessment().getFamilyStabilityStatus(),
                    "Education Continuity Status: " + dto.getOutcomeAssessment().getEducationContinuityStatus()
            );

            addSection(document, "Final Declaration", section, normal,
                    dto.getFinalDeclaration().getStatement(),
                    "Signed By: " + dto.getFinalDeclaration().getSwSignature() + " (" + dto.getFinalDeclaration().getSwId() + ")",
                    "Signed Date: " + fmt(dto.getFinalDeclaration().getDate())
            );

            document.close();
            return out.toByteArray();
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to generate PDF");
        }
    }

    private void addSection(Document document, String title, Font section, Font normal, String... lines)
            throws Exception {
        document.add(new Paragraph(title, section));
        for (String line : lines) {
            document.add(new Paragraph(line == null ? "-" : line, normal));
        }
        document.add(new Paragraph(" "));
    }

    private CompletedHelpRequestReportDTO buildReportDto(HelpRequest request, CompletedHelpRequestReport report) {
        Optional<User> requester = request.getRequesterUserId() == null ? Optional.empty() : userRepository.findById(request.getRequesterUserId());
        Optional<User> socialWorker = request.getAssignedWorkerId() == null ? Optional.empty() : userRepository.findById(request.getAssignedWorkerId());
        Optional<ServicePackage> servicePackage = request.getAppliedServicePackageId() == null
                ? Optional.empty()
                : servicePackageRepository.findById(request.getAppliedServicePackageId());
        List<FollowUp> followUps = followUpRepository.findByHelpRequestId(request.getId());
        List<Message> relatedMessages = messageRepository.findByRelatedRequestId(request.getId());
        List<CaseTimelineEvent> timeline = timelineEventRepository.findByHelpRequestIdOrderByEventTimeDesc(request.getId())
                .stream()
                .sorted(Comparator.comparing(CaseTimelineEvent::getEventTime))
                .collect(Collectors.toList());

        LocalDateTime assignedAt = findTimelineDate(timeline, "assigned", HelpRequest.RequestStatus.ASSIGNED);
        LocalDateTime serviceStartAt = findTimelineDate(timeline, "in progress", HelpRequest.RequestStatus.IN_PROGRESS);
        LocalDateTime packageApprovedAt = findTimelineDateByText(timeline, "approved package", "package accepted");
        LocalDateTime completedAt = request.getCompletionDate() != null
                ? request.getCompletionDate()
                : findTimelineDate(timeline, "completed", HelpRequest.RequestStatus.COMPLETED);

        long durationDays = 0;
        if (request.getRequestDate() != null && completedAt != null) {
            durationDays = Math.max(0, Duration.between(request.getRequestDate(), completedAt).toDays());
        }

        CompletedHelpRequestReportDTO dto = new CompletedHelpRequestReportDTO();
        dto.setWorkflowStatus(report.getWorkflowStatus().name());
        dto.setAdminReviewNote(report.getAdminReviewNote());

        CompletedHelpRequestReportDTO.ReportHeader header = new CompletedHelpRequestReportDTO.ReportHeader();
        header.setOrganizationName("Child Protection Authority");
        header.setSystemName("Child Protection & Support Portal");
        header.setReportTitle("Completed Help Request Report");
        header.setReportId(report.getReportId());
        header.setGeneratedDate(report.getGeneratedAt());
        header.setGeneratedBy(report.getGeneratedByName());
        header.setGeneratedById(report.getGeneratedByDisplayId());
        header.setHelpId(request.getTrackingId());
        dto.setReportHeader(header);

        CompletedHelpRequestReportDTO.HelpSummary helpSummary = new CompletedHelpRequestReportDTO.HelpSummary();
        helpSummary.setHelpId(request.getTrackingId());
        helpSummary.setRequestType(request.getHelpType() == null ? "N/A" : request.getHelpType().name());
        helpSummary.setPriorityLevel(request.getPriority() == null ? "MEDIUM" : request.getPriority().name());
        helpSummary.setDateSubmitted(request.getRequestDate());
        helpSummary.setDateAssignedToSW(assignedAt);
        helpSummary.setDateServiceStarted(serviceStartAt);
        helpSummary.setDateCompleted(completedAt);
        helpSummary.setTotalDurationDays(durationDays);
        helpSummary.setStatus(request.getStatus().name());
        dto.setHelpSummary(helpSummary);

        CompletedHelpRequestReportDTO.PublicUserInfo publicUserInfo = new CompletedHelpRequestReportDTO.PublicUserInfo();
        publicUserInfo.setName(request.isAnonymous()
                ? "Anonymous Public User"
                : requester.map(User::getFullName).orElse(request.getRequesterName() == null ? "N/A" : request.getRequesterName()));
        publicUserInfo.setContactNumber(request.isAnonymous() ? "Hidden" : requester.map(User::getPhone).orElse("N/A"));
        publicUserInfo.setDistrictOrLocation(request.getLocation() == null ? "N/A" : request.getLocation());
        publicUserInfo.setVulnerabilityCategory(request.getApproximateAge() == null ? "N/A" : request.getApproximateAge());
        dto.setPublicUserInfo(publicUserInfo);

        CompletedHelpRequestReportDTO.InitialRequestDetails initialDetails = new CompletedHelpRequestReportDTO.InitialRequestDetails();
        initialDetails.setProblemDescription(defaultIfBlank(request.getDescription(), "N/A"));
        initialDetails.setSupportingDocuments(request.getDocumentUrls() == null ? new ArrayList<>() : request.getDocumentUrls());
        initialDetails.setInitialAssessmentSummary(defaultIfBlank(report.getInitialAssessmentSummary(), "Assessment pending entry by social worker."));
        dto.setInitialRequestDetails(initialDetails);

        CompletedHelpRequestReportDTO.ServicePackageDetails packageDetails = new CompletedHelpRequestReportDTO.ServicePackageDetails();
        packageDetails.setPackageName(servicePackage.map(ServicePackage::getTitle).orElse("N/A"));
        packageDetails.setServicesIncluded(servicePackage.map(ServicePackage::getItems).orElse(new ArrayList<>()));
        packageDetails.setDateApplied(request.getAppliedServicePackageAppliedAt());
        packageDetails.setDateApprovedByPublicUser(packageApprovedAt);
        packageDetails.setAdjustments(defaultIfBlank(report.getAdjustments(), "No adjustments recorded."));
        packageDetails.setFinalApprovedServices(servicePackage.map(ServicePackage::getItems).orElse(new ArrayList<>()));
        dto.setServicePackageDetails(packageDetails);

        List<CompletedHelpRequestReportDTO.ResourceAllocationDetail> resources = new ArrayList<>();
        if (request.getAppliedPackageItemExecutions() != null) {
            for (ServiceItemExecution execution : request.getAppliedPackageItemExecutions()) {
                CompletedHelpRequestReportDTO.ResourceAllocationDetail d =
                        new CompletedHelpRequestReportDTO.ResourceAllocationDetail();
                d.setResourceName(defaultIfBlank(execution.getAssignedResource(), "Not Assigned"));
                d.setResourceType("Service Resource");
                d.setAssignedDate(execution.getScheduledDate());
                d.setServiceProvided(defaultIfBlank(execution.getServiceItem(), "N/A"));
                d.setCompletionDate("COMPLETED".equalsIgnoreCase(execution.getStatus()) ? completedAt : null);
                d.setSupportingDocuments(request.getDocumentUrls() == null ? new ArrayList<>() : request.getDocumentUrls());
                resources.add(d);
            }
        }
        dto.setResourceAllocationDetails(resources);

        List<CompletedHelpRequestReportDTO.ServiceTimelineItem> timelineItems = new ArrayList<>();
        for (CaseTimelineEvent event : timeline) {
            CompletedHelpRequestReportDTO.ServiceTimelineItem item = new CompletedHelpRequestReportDTO.ServiceTimelineItem();
            item.setDate(event.getEventTime());
            item.setTitle(event.getEventType() == null ? "EVENT" : event.getEventType().name());
            item.setDetail(defaultIfBlank(event.getDescription(), "No description"));
            timelineItems.add(item);
        }
        dto.setServiceTimeline(timelineItems);

        CompletedHelpRequestReportDTO.FollowUpMonitoringSummary followUpSummary =
                new CompletedHelpRequestReportDTO.FollowUpMonitoringSummary();
        followUpSummary.setNumberOfFollowUpsConducted(followUps.size());
        followUpSummary.setFollowUpDates(followUps.stream().map(FollowUp::getScheduledDate).collect(Collectors.toList()));
        followUpSummary.setObservations(defaultIfBlank(report.getFollowUpObservations(),
                followUps.stream().map(FollowUp::getNotes).filter(s -> s != null && !s.isBlank()).limit(3).collect(Collectors.joining(" | "))));
        followUpSummary.setOutcomeEvaluation("Communication records: " + relatedMessages.size() + " message(s) linked to this help request.");
        dto.setFollowUpMonitoringSummary(followUpSummary);

        CompletedHelpRequestReportDTO.OutcomeAssessment outcomeAssessment = new CompletedHelpRequestReportDTO.OutcomeAssessment();
        outcomeAssessment.setObjectiveAchieved(report.getObjectiveAchieved());
        outcomeAssessment.setImprovementLevel(report.getImprovementLevel());
        outcomeAssessment.setChildSafetyStatus(report.getChildSafetyStatus());
        outcomeAssessment.setFamilyStabilityStatus(report.getFamilyStabilityStatus());
        outcomeAssessment.setEducationContinuityStatus(report.getEducationContinuityStatus());
        dto.setOutcomeAssessment(outcomeAssessment);

        dto.setChallengesFaced(report.getChallenges());
        dto.setRecommendations(report.getRecommendations());
        dto.setAttachments(report.getAttachments());

        CompletedHelpRequestReportDTO.FinalDeclaration declaration = new CompletedHelpRequestReportDTO.FinalDeclaration();
        declaration.setStatement(report.getFinalDeclarationText());
        declaration.setSwSignature(socialWorker.map(User::getFullName).orElse(report.getGeneratedByName()));
        declaration.setDate(report.getDeclarationSignedAt() == null ? LocalDateTime.now() : report.getDeclarationSignedAt());
        declaration.setSwId(report.getDeclarationSignedById() == null ? report.getGeneratedByDisplayId() : report.getDeclarationSignedById());
        dto.setFinalDeclaration(declaration);

        String aiContext = buildAiContext(dto);
        String aiSummary = aiReportSummaryService.generateCompletedRequestSummary(aiContext);
        report.setAiGeneratedSummary(aiSummary);
        reportRepository.save(report);
        dto.setAiGeneratedSummary(aiSummary);

        return dto;
    }

    private String buildAiContext(CompletedHelpRequestReportDTO dto) {
        return "Help ID: " + dto.getHelpSummary().getHelpId()
                + "\nType: " + dto.getHelpSummary().getRequestType()
                + "\nDuration days: " + dto.getHelpSummary().getTotalDurationDays()
                + "\nFollow-ups: " + dto.getFollowUpMonitoringSummary().getNumberOfFollowUpsConducted()
                + "\nOutcome objective: " + dto.getOutcomeAssessment().getObjectiveAchieved()
                + "\nSafety: " + dto.getOutcomeAssessment().getChildSafetyStatus()
                + "\nFamily stability: " + dto.getOutcomeAssessment().getFamilyStabilityStatus()
                + "\nRecommendations: " + String.join("; ", dto.getRecommendations());
    }

    private LocalDateTime findTimelineDate(List<CaseTimelineEvent> timeline, String keyword,
                                           HelpRequest.RequestStatus status) {
        for (CaseTimelineEvent event : timeline) {
            String description = event.getDescription() == null ? "" : event.getDescription().toLowerCase(Locale.ROOT);
            if (description.contains(keyword)) {
                return event.getEventTime();
            }
            if (event.getNewHelpRequestStatus() == status) {
                return event.getEventTime();
            }
            if (status == HelpRequest.RequestStatus.ASSIGNED && event.getEventType() == CaseTimelineEvent.EventType.HELP_REQUEST_ASSIGNED) {
                return event.getEventTime();
            }
            if (status == HelpRequest.RequestStatus.COMPLETED && event.getEventType() == CaseTimelineEvent.EventType.HELP_REQUEST_COMPLETED) {
                return event.getEventTime();
            }
            if (status == HelpRequest.RequestStatus.IN_PROGRESS && event.getEventType() == CaseTimelineEvent.EventType.SERVICE_STARTED) {
                return event.getEventTime();
            }
        }
        return null;
    }

    private LocalDateTime findTimelineDateByText(List<CaseTimelineEvent> timeline, String... keywords) {
        for (CaseTimelineEvent event : timeline) {
            String description = event.getDescription() == null ? "" : event.getDescription().toLowerCase(Locale.ROOT);
            for (String keyword : keywords) {
                if (description.contains(keyword.toLowerCase(Locale.ROOT))) {
                    return event.getEventTime();
                }
            }
        }
        return null;
    }

    private CompletedHelpRequestReport getOrCreateReport(HelpRequest request, User currentUser) {
        return reportRepository.findByHelpRequestId(request.getId()).orElseGet(() -> {
            CompletedHelpRequestReport report = new CompletedHelpRequestReport();
            report.setHelpRequestId(request.getId());
            report.setReportId(generateReportId(request));
            report.setGeneratedByUserId(currentUser.getId());
            report.setGeneratedByName(currentUser.getFullName() == null ? "Social Worker" : currentUser.getFullName());
            report.setGeneratedByDisplayId("SW-" + tail(currentUser.getId(), 6));
            return reportRepository.save(report);
        });
    }

    private String generateReportId(HelpRequest request) {
        String tracking = request.getTrackingId() == null ? request.getId() : request.getTrackingId();
        return "CHR-" + tail(tracking.replace(" ", ""), 8).toUpperCase(Locale.ROOT) + "-"
                + DateTimeFormatter.ofPattern("yyyyMMddHHmmss").format(LocalDateTime.now());
    }

    private void validateCompleted(HelpRequest request) {
        if (request.getStatus() != HelpRequest.RequestStatus.COMPLETED) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Completed Help Request Report is available only when request status is COMPLETED"
            );
        }
    }

    private void validateReadAccess(User user, HelpRequest request) {
        if (user.getRole() == Role.ADMIN) return;
        if (user.getRole() == Role.SW && user.getId().equals(request.getAssignedWorkerId())) return;
        throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You do not have access to this report");
    }

    private void validateSwAccess(User user, HelpRequest request) {
        if (user.getRole() != Role.SW || !user.getId().equals(request.getAssignedWorkerId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only the assigned social worker can manage this report");
        }
    }

    private HelpRequest getRequestOrThrow(String requestId) {
        return helpRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Help request not found"));
    }

    private User getUserOrThrow(String userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));
    }

    private String defaultIfBlank(String value, String fallback) {
        return (value == null || value.isBlank()) ? fallback : value;
    }

    private String fmt(LocalDateTime time) {
        return time == null ? "-" : time.toString();
    }

    private String tail(String value, int size) {
        if (value == null) return "UNKNOWN";
        if (value.length() <= size) return value;
        return value.substring(value.length() - size);
    }

    private List<String> nullSafeList(List<String> values) {
        return values == null ? new ArrayList<>() : values.stream()
                .filter(v -> v != null && !v.isBlank())
                .collect(Collectors.toList());
    }
}
