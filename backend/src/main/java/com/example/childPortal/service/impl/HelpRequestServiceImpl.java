package com.example.childPortal.service.impl;

import com.example.childPortal.dto.HelpRequestDTO; 
import com.example.childPortal.dto.HelpResponse; 
import com.example.childPortal.model.HelpRequest; 
import com.example.childPortal.model.HelpRequest.RequestStatus; 
import com.example.childPortal.model.HelpType; 
import com.example.childPortal.model.User; 
import com.example.childPortal.repository.HelpRequestRepository; 
import com.example.childPortal.repository.UserRepository; 
import com.example.childPortal.service.HelpRequestService; 
import org.springframework.beans.factory.annotation.Autowired; 
import org.springframework.stereotype.Service; 
import java.time.LocalDateTime; 
import java.util.List; 
import java.util.Optional; 
import java.util.stream.Collectors; 

@Service
public class HelpRequestServiceImpl implements HelpRequestService {
    @Autowired 
    private HelpRequestRepository helpRequestRepository; 
 
    @Autowired 
    private UserRepository userRepository; 
 
    @Override 
    public HelpResponse createHelpRequest(HelpRequestDTO helpRequestDTO, String requesterUserId) { 
        try { 
            HelpRequest helpRequest = convertToEntity(helpRequestDTO); 
             
            if (!helpRequest.isAnonymous() && requesterUserId != null) { 
                helpRequest.setRequesterUserId(requesterUserId); 
            } 
             
            helpRequest.setStatus(RequestStatus.REQUESTED); 
            helpRequest.setRequestDate(LocalDateTime.now()); 
            helpRequest.setLastUpdated(LocalDateTime.now()); 
 
            HelpRequest savedRequest = helpRequestRepository.save(helpRequest); 

            notifySocialWorkers(savedRequest); 
             
            return new HelpResponse(savedRequest.getId(), "Help request submitted successfully", true); 
        } 
        catch (Exception e) { 
            return new HelpResponse(null, "Failed to submit help request: " + e.getMessage(), false); 
        } 
    } 
 
    @Override 
    public HelpRequestDTO getHelpRequestById(String requestId) { 
        Optional<HelpRequest> requestOpt = helpRequestRepository.findById(requestId); 
        if (requestOpt.isPresent()) { 
            return convertToDTO(requestOpt.get()); 
        } 
        return null; 
    } 
 
    @Override 
    public List<HelpRequestDTO> getHelpRequestsByRequester(String requesterUserId) { 
        List<HelpRequest> requests = helpRequestRepository.findByRequesterUserId(requesterUserId); 
        return requests.stream().map(this::convertToDTO).collect(Collectors.toList()); 
    } 
 
    @Override 
    public List<HelpRequestDTO> getAllHelpRequests() { 
        List<HelpRequest> requests = helpRequestRepository.findAllByOrderByRequestDateDesc(); 
        return requests.stream().map(this::convertToDTO).collect(Collectors.toList()); 
    } 
 
    @Override 
    public List<HelpRequestDTO> getHelpRequestsByStatus(RequestStatus status) { 
        List<HelpRequest> requests = helpRequestRepository.findByStatus(status); 
        return requests.stream().map(this::convertToDTO).collect(Collectors.toList()); 
    } 
 
    @Override 
    public List<HelpRequestDTO> getHelpRequestsByType(HelpType helpType) { 
        List<HelpRequest> requests = helpRequestRepository.findByHelpType(helpType); 
        return requests.stream().map(this::convertToDTO).collect(Collectors.toList()); 
    } 
 
    @Override 
    public HelpRequestDTO updateHelpRequestStatus(String requestId, RequestStatus status) { 
        Optional<HelpRequest> requestOpt = helpRequestRepository.findById(requestId); 
        if (requestOpt.isPresent()) { 
            HelpRequest helpRequest = requestOpt.get(); 
            helpRequest.setStatus(status); 
            helpRequest.setLastUpdated(LocalDateTime.now()); 
            HelpRequest updatedRequest = helpRequestRepository.save(helpRequest); 
            return convertToDTO(updatedRequest); 
        } 
        return null; 
    } 
 
    @Override 
    public HelpRequestDTO assignHelpRequestToWorker(String requestId, String workerId) { 
        Optional<HelpRequest> requestOpt = helpRequestRepository.findById(requestId); 
        if (requestOpt.isPresent()) { 
            HelpRequest helpRequest = requestOpt.get(); 
            helpRequest.setAssignedWorkerId(workerId); 
            helpRequest.setStatus(RequestStatus.ASSIGNED_TO_WORKER); 
            helpRequest.setLastUpdated(LocalDateTime.now()); 
            HelpRequest updatedRequest = helpRequestRepository.save(helpRequest); 
            return convertToDTO(updatedRequest); 
        } 
        return null; 
    } 
 
    @Override 
    public boolean deleteHelpRequest(String requestId) { 
        if (helpRequestRepository.existsById(requestId)) { 
            helpRequestRepository.deleteById(requestId); 
            return true; 
        } 
        return false; 
    } 
 
    @Override 
    public List<HelpRequestDTO> searchHelpRequestsByLocation(String location) { 
        List<HelpRequest> requests = helpRequestRepository.findByLocationContainingIgnoreCase(location); 
        return requests.stream().map(this::convertToDTO).collect(Collectors.toList()); 
    } 
 
    private HelpRequest convertToEntity(HelpRequestDTO dto) { 
        HelpRequest entity = new HelpRequest(); 
        entity.setAnonymous(dto.isAnonymous()); 
        entity.setApproximateAge(dto.getApproximateAge()); 
        entity.setGender(dto.getGender()); 
        entity.setIdentificationMarks(dto.getIdentificationMarks()); 
        entity.setHelpType(dto.getHelpType()); 
        entity.setDescription(dto.getDescription()); 
        entity.setLocation(dto.getLocation()); 
        entity.setPreferredContactMethod(dto.getPreferredContactMethod()); 
        entity.setContactDetails(dto.getContactDetails()); 
        entity.setDocumentUrls(dto.getDocumentUrls()); 
         
        if (dto.getRequesterUserId() != null) { 
            entity.setRequesterUserId(dto.getRequesterUserId()); 
        } 
         
        return entity; 
    } 
 
    private HelpRequestDTO convertToDTO(HelpRequest entity) { 
        HelpRequestDTO dto = new HelpRequestDTO(); 
        dto.setId(entity.getId()); 
        dto.setTrackingId(entity.getTrackingId())
        dto.setRequesterUserId(entity.getRequesterUserId()); 
        dto.setAnonymous(entity.isAnonymous()); 
        dto.setApproximateAge(entity.getApproximateAge()); 
        dto.setGender(entity.getGender()); 
        dto.setIdentificationMarks(entity.getIdentificationMarks()); 
        dto.setHelpType(entity.getHelpType()); 
        dto.setDescription(entity.getDescription()); 
        dto.setLocation(entity.getLocation()); 
        dto.setPreferredContactMethod(entity.getPreferredContactMethod()); 
        dto.setContactDetails(entity.getContactDetails()); 
        dto.setDocumentUrls(entity.getDocumentUrls()); 
        dto.setStatus(entity.getStatus()); 
        dto.setAssignedWorkerId(entity.getAssignedWorkerId()); 
        dto.setRequestDate(entity.getRequestDate()); 
        dto.setLastUpdated(entity.getLastUpdated()); 

        if (!entity.isAnonymous() && entity.getRequesterUserId() != null) { 
            Optional<User> requester = userRepository.findById(entity.getRequesterUserId()); 
            requester.ifPresent(user -> dto.setRequesterName(user.getFullName())); 
        } 
 
        if (entity.getAssignedWorkerId() != null) { 
            Optional<User> worker = userRepository.findById(entity.getAssignedWorkerId()); 
            worker.ifPresent(user -> dto.setAssignedWorkerName(user.getFullName())); 
        } 
 
        return dto; 
    } 
 
    private void notifySocialWorkers(HelpRequest helpRequest) { 
        System.out.println("Notifying social workers about new help request: " + helpRequest.getId()); 
        System.out.println("Help Type: " + helpRequest.getHelpType()); 
        System.out.println("Location: " + helpRequest.getLocation()); 
    } 

    private void calculateInitialPriority(HelpRequest helpRequest) {
    String description = helpRequest.getDescription().toLowerCase();
    boolean basicNeeds = helpRequest.getHelpType() == HelpType.FOOD_ASSISTANCE || helpRequest.getHelpType() == HelpType.SHELTER || helpRequest.getHelpType() == HelpType.MEDICAL_HELP;
    boolean urgentKeywords = description.contains("urgent") || description.contains("emergency") ||description.contains("immediate");
    if (basicNeeds && urgentKeywords) { 
        helpRequest.setPriority(Priority.HIGH);
    } else if (basicNeeds) { 
        helpRequest.setPriority(Priority.MEDIUM);
    } else { 
        helpRequest.setPriority(Priority.LOW);
    }
    helpRequest.setEmergency(helpRequest.getPriority() == Priority.URGENT || helpRequest.getPriority() == Priority.CRITICAL);
}

} 

