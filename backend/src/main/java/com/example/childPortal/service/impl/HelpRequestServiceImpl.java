package com.example.childPortal.service.impl;

import com.example.childPortal.dto.HelpRequestDTO;
import com.example.childPortal.dto.HelpResponse;
import com.example.childPortal.model.HelpRequest;
import com.example.childPortal.model.HelpType;
import com.example.childPortal.model.Priority;
import com.example.childPortal.model.Role;
import com.example.childPortal.model.User;
import com.example.childPortal.repository.HelpRequestRepository;
import com.example.childPortal.repository.UserRepository;
import com.example.childPortal.service.HelpRequestService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
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
            HelpRequest helpRequest = new HelpRequest();
            helpRequest.setRequesterUserId(requesterUserId);
            helpRequest.setAnonymous(helpRequestDTO.isAnonymous());
            helpRequest.setApproximateAge(helpRequestDTO.getApproximateAge());
            helpRequest.setGender(helpRequestDTO.getGender());
            helpRequest.setIdentificationMarks(helpRequestDTO.getIdentificationMarks());
            helpRequest.setHelpType(helpRequestDTO.getHelpType());
            helpRequest.setDescription(helpRequestDTO.getDescription());
            helpRequest.setLocation(helpRequestDTO.getLocation());
            helpRequest.setDocumentUrls(helpRequestDTO.getDocumentUrls());

            helpRequest.setPriority(helpRequestDTO.getPriority() != null ? 
                helpRequestDTO.getPriority() : Priority.MEDIUM);

            Optional<User> reporterOpt = userRepository.findById(requesterUserId);
            if (reporterOpt.isPresent()) {
                helpRequest.setRequesterName(reporterOpt.get().getFullName());
            }

            HelpRequest savedHelpRequest = helpRequestRepository.save(helpRequest);
            return new HelpResponse(savedHelpRequest.getId(), "Help request submitted successfully", true);
        } catch (Exception e) {
            return new HelpResponse(null, "Failed to submit help request: " + e.getMessage(), false);
        }
    }

    @Override
    public HelpRequestDTO getHelpRequestById(String requestId) {
        return helpRequestRepository.findById(requestId)
                .map(this::convertToFilteredDTO)
                .orElse(null);
    }

    @Override
    public List<HelpRequestDTO> getHelpRequestsByRequester(String requesterUserId) {
        return helpRequestRepository.findByRequesterUserId(requesterUserId).stream()
                .map(this::convertToFilteredDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<HelpRequestDTO> getAllHelpRequests() {
        return helpRequestRepository.findAll().stream()
                .map(this::convertToFilteredDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<HelpRequestDTO> getHelpRequestsByStatus(HelpRequest.RequestStatus status) {
        return helpRequestRepository.findByStatus(status).stream()
                .map(this::convertToFilteredDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<HelpRequestDTO> getHelpRequestsByType(HelpType helpType) {
        return helpRequestRepository.findByHelpType(helpType).stream()
                .map(this::convertToFilteredDTO)
                .collect(Collectors.toList());
    }

    @Override
    public HelpRequestDTO updateHelpRequestStatus(String requestId, HelpRequest.RequestStatus status, String updatedBy) {
        return helpRequestRepository.findById(requestId)
                .map(helpRequest -> {
                    helpRequest.setStatus(status);
                    helpRequest.setLastUpdated(LocalDateTime.now());
                    if (status == HelpRequest.RequestStatus.COMPLETED) {
                        helpRequest.setCompletionDate(LocalDateTime.now());
                    }
                    helpRequestRepository.save(helpRequest);
                    return convertToFilteredDTO(helpRequest);
                })
                .orElse(null);
    }

    @Override
    public HelpRequestDTO assignHelpRequestToWorker(String requestId, String workerId, String assignedBy) {
        return helpRequestRepository.findById(requestId)
                .map(helpRequest -> {
                    helpRequest.setAssignedWorkerId(workerId);
                    helpRequest.setStatus(HelpRequest.RequestStatus.ASSIGNED);
                    helpRequest.setLastUpdated(LocalDateTime.now());
                    helpRequestRepository.save(helpRequest);
                    return convertToFilteredDTO(helpRequest);
                })
                .orElse(null);
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
    public HelpRequestDTO updateHelpRequestNotes(String requestId, String notes, String updatedBy) {
        return helpRequestRepository.findById(requestId)
                .map(helpRequest -> {
                    helpRequest.setRequestNotes(notes);
                    helpRequest.setLastUpdated(LocalDateTime.now());
                    helpRequestRepository.save(helpRequest);
                    return convertToFilteredDTO(helpRequest);
                })
                .orElse(null);
    }

    @Override
    public List<HelpRequestDTO> searchHelpRequestsByLocation(String location) {
        return helpRequestRepository.findByLocationContainingIgnoreCase(location).stream()
                .map(this::convertToFilteredDTO)
                .collect(Collectors.toList());
    }

    private HelpRequestDTO convertToFilteredDTO(HelpRequest helpRequest) {
        HelpRequestDTO dto = new HelpRequestDTO();
        dto.setId(helpRequest.getId());
        dto.setTrackingId(helpRequest.getTrackingId());
        dto.setRequesterUserId(helpRequest.getRequesterUserId());
        dto.setAnonymous(helpRequest.isAnonymous());
        dto.setApproximateAge(helpRequest.getApproximateAge());
        dto.setGender(helpRequest.getGender());
        dto.setIdentificationMarks(helpRequest.getIdentificationMarks());
        dto.setHelpType(helpRequest.getHelpType());
        dto.setDescription(helpRequest.getDescription());
        dto.setLocation(helpRequest.getLocation());
        dto.setDocumentUrls(helpRequest.getDocumentUrls());
        dto.setStatus(helpRequest.getStatus());
        dto.setAssignedWorkerId(helpRequest.getAssignedWorkerId());
        dto.setRequestDate(helpRequest.getRequestDate());
        dto.setPriority(helpRequest.getPriority());

        try {
            String currentUserId = SecurityContextHolder.getContext().getAuthentication().getName();
            Optional<User> currentUserOpt = userRepository.findById(currentUserId);
            Role userRole = currentUserOpt.map(User::getRole).orElse(Role.PU);
            
            if (helpRequest.isAnonymous()) {
                if (userRole == Role.ADMIN || 
                    (helpRequest.getRequesterUserId() != null && 
                     helpRequest.getRequesterUserId().equals(currentUserId))) {
                    dto.setRequesterName(helpRequest.getRequesterName());
                } else {
                    dto.setRequesterName("Anonymous Requester");
                }
            } else {
                dto.setRequesterName(helpRequest.getRequesterName());
            }
        } catch (Exception e) {
            if (helpRequest.isAnonymous()) {
                dto.setRequesterName("Anonymous Requester");
            } else {
                dto.setRequesterName(helpRequest.getRequesterName());
            }
        }
        
        return dto;
    }
}