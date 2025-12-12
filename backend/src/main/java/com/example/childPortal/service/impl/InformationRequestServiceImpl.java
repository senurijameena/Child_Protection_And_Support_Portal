package com.example.childPortal.service.impl;

import com.example.childPortal.dto.InformationRequestDTO; 
import com.example.childPortal.dto.InformationResponseDTO; 
import com.example.childPortal.dto.UserResponseDTO; 
import com.example.childPortal.model.Case; 
import com.example.childPortal.model.CaseResponse; 
import com.example.childPortal.model.InformationRequest; 
import com.example.childPortal.model.User; 
import com.example.childPortal.model.InformationRequest.RequestStatus; 
import com.example.childPortal.repository.CaseRepository; 
import com.example.childPortal.repository.InformationRequestRepository; 
import com.example.childPortal.repository.UserRepository; 
import com.example.childPortal.service.InformationRequestService; 
import org.springframework.beans.factory.annotation.Autowired; 
import org.springframework.stereotype.Service; 
import java.time.LocalDateTime; 
import java.util.List; 
import java.util.Optional; 
import java.util.stream.Collectors;

@Service
public class InformationRequestServiceImpl implements InformationRequestService {

    @Autowired
    private InformationRequestRepository informationRequestRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CaseRepository caseRepository;

    @Override
    public InformationRequestDTO createInformationRequest(InformationRequestDTO requestDTO) {
        InformationRequest request = new InformationRequest();

        request.setCaseId(requestDTO.getCaseId()); 
        request.setHelpRequestId(requestDTO.getHelpRequestId()); 
        request.setRequestedByUserId(requestDTO.getRequestedByUserId());
        request.setRequestedFromUserId(requestDTO.getRequestedFromUserId());
        request.setTitle(requestDTO.getTitle()); 
        request.setDescription(requestDTO.getDescription());
        request.setInformationNeeded(requestDTO.getInformationNeeded()); 
        request.setPriority(requestDTO.getPriority()); 

        InformationRequest savedRequest = informationRequestRepository.save(request);

        sendNotification(savedRequest);
        return convertToDTO(savedRequest);;
    }

    @Override
    public InformationRequestDTO getInformationRequestById(String id) {
        Optional<InformationRequest> requestOpt = informationRequestRepository.findById(requestId); 
        if (requestOpt.isPresent()) { 
            return convertToDTO(requestOpt.get()); 
        }
        return null;
    }

    @Override
    public List<InformationRequestDTO> getPendingRequestsForUser(String userId) {
        List<InformationRequest> requests = informationRequestRepository .findByRequestedFromUserIdAndStatus(userId, RequestStatus.PENDING); 
        return requests.stream()
          .map(this::convertToDTO) 
           .peek(dto -> {
              if (dto.getDueDate() != null && dto.getDueDate().isBefore(LocalDateTime.now())) { 
                    dto.setOverdue(true); 
                      if (dto.getStatus() == RequestStatus.PENDING) {
                        updateRequestStatus(dto.getId(), RequestStatus.OVERDUE);
                        dto.setStatus(RequestStatus.OVERDUE);
                      }
                    }
                    dto.setUrgent(dto.getPriority() == InformationRequest.Priority.URGENT ||  dto.getPriority() == InformationRequest.Priority.CRITICAL); 
           }).collect(Collectors.toList());
    }

    @Override 
    public List<InformationRequestDTO> getRequestsByCase(String caseId) { 
        List<InformationRequest> requests = informationRequestRepository.findByCaseId(caseId); 
        return requests.stream().map(this::convertToDTO).collect(Collectors.toList()); 
    }

    @Override 
    public List<InformationRequestDTO> getRequestsByHelpRequest(String helpRequestId) { 
        List<InformationRequest> requests = informationRequestRepository.findByHelpRequestId(helpRequestId); 
        return requests.stream().map(this::convertToDTO).collect(Collectors.toList()); 
    } 

     @Override 
    public List<InformationRequestDTO> getUrgentRequests() { 
        List<InformationRequest> requests = informationRequestRepository .findByPriority(InformationRequest.Priority.URGENT);
        List<InformationRequest> criticalRequests = informationRequestRepository .findByPriority(InformationRequest.Priority.CRITICAL); 
            requests.addAll(criticalRequests);
        return requests.stream().map(this::convertToDTO).collect(Collectors.toList());
    }

     @Override 
    public List<InformationRequestDTO> getOverdueRequests() { 
        List<InformationRequest> requests = informationRequestRepository .findByDueDateBeforeAndStatus(LocalDateTime.now(), RequestStatus.PENDING);
        requests.forEach(request -> { 
            request.setStatus(RequestStatus.OVERDUE); 
            informationRequestRepository.save(request); 
        });

          return requests.stream().map(this::convertToDTO).collect(Collectors.toList());
    }

      @Override 
    public UserResponseDTO submitResponse(InformationResponseDTO responseDTO, String userId) { 
        Optional<InformationRequest> requestOpt = informationRequestRepository 
            .findById(responseDTO.getInformationRequestId()); 
         
        if (requestOpt.isPresent()) { 
            InformationRequest request = requestOpt.get(); 

            CaseResponse caseResponse = new CaseResponse(); 
            caseResponse.setInformationRequestId(request.getId()); 
            caseResponse.setCaseId(request.getCaseId()); 
            caseResponse.setUserId(userId); 
            caseResponse.setResponseText(responseDTO.getResponseText()); 
            caseResponse.setDocumentUrl(responseDTO.getDocumentUrls() != null ?  String.join(",", responseDTO.getDocumentUrls()) : null); 
            CaseResponse savedResponse = caseResponseRepository.save(caseResponse);

            request.setUserResponse(responseDTO.getResponseText()); 
            request.setResponseDocuments(responseDTO.getDocumentUrls()); 
            request.setResponseDate(LocalDateTime.now()); 
            request.setStatus(RequestStatus.RESPONDED);

             if (responseDTO.isRequestExtension()) { 
                request.setExtensionRequested(true); 
                request.setExtensionReason(responseDTO.getExtensionReason()); 
                request.setNewDueDate(responseDTO.getProposedNewDueDate()); 
                request.setStatus(RequestStatus.EXTENDED); 
            } 

            informationRequestRepository.save(request);

            notifyRequester(request, savedResponse); 

            return convertToUserResponseDTO(savedResponse, request); 
        } 
         
        return null; 
    }

    @Override 
    public InformationRequestDTO updateRequestStatus(String requestId, RequestStatus status) { 
        Optional<InformationRequest> requestOpt = informationRequestRepository.findById(requestId); 
        if (requestOpt.isPresent()) { 
            InformationRequest request = requestOpt.get(); 
            request.setStatus(status); 
            InformationRequest updatedRequest = informationRequestRepository.save(request); 
            return convertToDTO(updatedRequest); 
        } 
        return null; 
    }

     @Override 
    public InformationRequestDTO requestExtension(String requestId, String reason, LocalDateTime newDueDate) { 
        Optional<InformationRequest> requestOpt = informationRequestRepository.findById(requestId); 
        if (requestOpt.isPresent()) { 
            InformationRequest request = requestOpt.get(); 
            request.setExtensionRequested(true); 
            request.setExtensionReason(reason); 
            request.setNewDueDate(newDueDate); 
            request.setStatus(RequestStatus.EXTENDED); 
             
            InformationRequest updatedRequest = informationRequestRepository.save(request); 

            notifyAboutExtension(request); 
             
            return convertToDTO(updatedRequest); 
        } 
        return null; 
    }

    @Override 
    public boolean deleteInformationRequest(String requestId) { 
        if (informationRequestRepository.existsById(requestId)) { 
            informationRequestRepository.deleteById(requestId); 
            return true; 
        } 
        return false; 
    } 
 
    private InformationRequestDTO convertToDTO(InformationRequest request) { 
        InformationRequestDTO dto = new InformationRequestDTO(); 
        dto.setId(request.getId()); 
        dto.setCaseId(request.getCaseId()); 
        dto.setHelpRequestId(request.getHelpRequestId()); 
        dto.setRequestedByUserId(request.getRequestedByUserId()); 
        dto.setRequestedFromUserId(request.getRequestedFromUserId()); 
        dto.setTitle(request.getTitle()); 
        dto.setDescription(request.getDescription()); 
        dto.setInformationNeeded(request.getInformationNeeded()); 
        dto.setPriority(request.getPriority()); 
        dto.setStatus(request.getStatus()); 
        dto.setDateRequested(request.getDateRequested()); 
        dto.setDueDate(request.getDueDate()); 
        dto.setResponseDate(request.getResponseDate()); 
        dto.setUserResponse(request.getUserResponse()); 
        dto.setResponseDocuments(request.getResponseDocuments()); 
        dto.setExtensionRequested(request.isExtensionRequested()); 
        dto.setExtensionReason(request.getExtensionReason()); 
        dto.setNewDueDate(request.getNewDueDate()); 
 
        if (request.getRequestedByUserId() != null) { 
            Optional<User> requester = userRepository.findById(request.getRequestedByUserId()); 
            requester.ifPresent(user -> dto.setRequestedByName(user.getFullName())); 
        } 
         
        if (request.getRequestedFromUserId() != null) { 
            Optional<User> user = userRepository.findById(request.getRequestedFromUserId()); 
            user.ifPresent(u -> dto.setRequestedFromName(u.getFullName())); 
        } 

        if (request.getCaseId() != null) { 
            Optional<Case> caseOpt = caseRepository.findById(request.getCaseId()); 
            if (caseOpt.isPresent()) { 
                Case caseEntity = caseOpt.get(); 
                dto.setCaseTitle("Case #" + caseEntity.getTrackingId() + " - " + caseEntity.getCaseType()); 
                dto.setTrackingId(caseEntity.getTrackingId()); 
            } 
        } 

        if (request.getDueDate() != null &&  
            request.getDueDate().isBefore(LocalDateTime.now()) &&  
            request.getStatus() == RequestStatus.PENDING) { 
            dto.setOverdue(true); 
        } 

        dto.setUrgent(request.getPriority() == InformationRequest.Priority.URGENT ||  
                     request.getPriority() == InformationRequest.Priority.CRITICAL); 
         
        return dto; 
    } 
 
    private UserResponseDTO convertToUserResponseDTO(CaseResponse response, InformationRequest request) { 
        UserResponseDTO dto = new UserResponseDTO(); 
        dto.setResponseId(response.getId()); 
        dto.setInformationRequestId(response.getInformationRequestId()); 
        dto.setCaseId(response.getCaseId()); 
        dto.setResponseText(response.getResponseText()); 
        dto.setResponseDate(response.getResponseDate()); 
        dto.setReviewed(response.isReviewed()); 
        dto.setReviewComments(response.getReviewComments()); 
        dto.setReviewDate(response.getReviewDate()); 

        if (request.getCaseId() != null) { 
            Optional<Case> caseOpt = caseRepository.findById(request.getCaseId()); 
            caseOpt.ifPresent(caseEntity -> dto.setTrackingId(caseEntity.getTrackingId())); 
        } 
         
        return dto; 
    } 
 
    private void sendNotification(InformationRequest request) { 
        System.out.println("Notification sent to user: " + request.getRequestedFromUserId()); 
        System.out.println("New information request: " + request.getTitle()); 
        System.out.println("Due date: " + request.getDueDate()); 
    } 
 
    private void notifyRequester(InformationRequest request, CaseResponse response) { 
        System.out.println("Notification sent to officer/worker: " + 
request.getRequestedByUserId()); 
        System.out.println("User has responded to information request: " + request.getTitle()); 
    } 
 
    private void notifyAboutExtension(InformationRequest request) { 
        System.out.println("Extension request notification sent to: " + 
request.getRequestedByUserId()); 
        System.out.println("Extension reason: " + request.getExtensionReason()); 
        System.out.println("New due date requested: " + request.getNewDueDate()); 
    } 
}