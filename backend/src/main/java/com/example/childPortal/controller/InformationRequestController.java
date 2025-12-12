package com.example.childPortal.controller; 
 
import com.example.childPortal.dto.InformationRequestDTO; 
import com.example.childPortal.dto.InformationResponseDTO; 
import com.example.childPortal.dto.UserResponseDTO; 
import com.example.childPortal.model.InformationRequest.RequestStatus; 
import com.example.childPortal.service.InformationRequestService; 
import org.springframework.beans.factory.annotation.Autowired; 
import org.springframework.http.ResponseEntity; 
import org.springframework.web.bind.annotation.*; 
import java.time.LocalDateTime; 
import java.util.List;

@RestController 
@RequestMapping("/api/information-requests") 
@CrossOrigin(origins = "*") 
public class InformationRequestController { 
    @Autowired 
    private InformationRequestService informationRequestService; 
    
    @PostMapping("/create") 
    public ResponseEntity<InformationRequestDTO> createInformationRequest( 
        @RequestBody InformationRequestDTO requestDTO) { 
            InformationRequestDTO createdRequest = informationRequestService.createInformationRequest(requestDTO); 
            return ResponseEntity.ok(createdRequest); 
        } 
        
        @GetMapping("/user/{userId}/pending") 
        public ResponseEntity<List<InformationRequestDTO>> getPendingRequests(@PathVariable String userId) { 
            List<InformationRequestDTO> requests = informationRequestService.getPendingRequestsForUser(userId); 
            return ResponseEntity.ok(requests); 
        }
        
        @GetMapping("/case/{caseId}")
        public ResponseEntity<List<InformationRequestDTO>> getRequestsByCase(@PathVariable String caseId) { 
            List<InformationRequestDTO> requests = informationRequestService.getRequestsByCase(caseId); 
            return ResponseEntity.ok(requests); 
        }
        
        @GetMapping("/urgent") 
        public ResponseEntity<List<InformationRequestDTO>> getUrgentRequests() { 
            List<InformationRequestDTO> requests = informationRequestService.getUrgentRequests(); 
            return ResponseEntity.ok(requests); 
        } 
        
        @GetMapping("/overdue") 
        public ResponseEntity<List<InformationRequestDTO>> getOverdueRequests() { 
            List<InformationRequestDTO> requests = informationRequestService.getOverdueRequests();
            return ResponseEntity.ok(requests);
        }
        
        @PostMapping("/respond")
        public ResponseEntity<UserResponseDTO> submitResponse( 
            @RequestBody InformationResponseDTO responseDTO, 
            @RequestHeader("X-User-Id") String userId) {
                UserResponseDTO response = informationRequestService.submitResponse(responseDTO, userId);
                return response != null ?
                ResponseEntity.ok(response) :
                ResponseEntity.notFound().build(); 
            } 

    @PutMapping("/{requestId}/status") 
    public ResponseEntity<InformationRequestDTO> updateStatus( 
            @PathVariable String requestId, 
            @RequestParam RequestStatus status) { 
        InformationRequestDTO updatedRequest = informationRequestService.updateRequestStatus(requestId, status); 
        return updatedRequest != null ?  
            ResponseEntity.ok(updatedRequest) :  
            ResponseEntity.notFound().build(); 
    } 

    @PostMapping("/{requestId}/request-extension") 
    public ResponseEntity<InformationRequestDTO> requestExtension( 
            @PathVariable String requestId, 
            @RequestBody ExtensionRequest extensionRequest) { 
        InformationRequestDTO updatedRequest = informationRequestService.requestExtension( 
            requestId,  
            extensionRequest.getReason(),  
            extensionRequest.getNewDueDate() 
        ); 
        return updatedRequest != null ?  
            ResponseEntity.ok(updatedRequest) :  
            ResponseEntity.notFound().build(); 
    } 

    @GetMapping("/{requestId}") 
    public ResponseEntity<InformationRequestDTO> getInformationRequest(@PathVariable String requestId) { 
        InformationRequestDTO request = informationRequestService.getInformationRequestById(requestId); 
        return request != null ?  
            ResponseEntity.ok(request) :  
            ResponseEntity.notFound().build(); 
    } 

    @DeleteMapping("/{requestId}") 
    public ResponseEntity<String> deleteInformationRequest(@PathVariable String requestId) { 
        boolean deleted = informationRequestService.deleteInformationRequest(requestId); 
        return deleted ?  
            ResponseEntity.ok("Information request deleted successfully") :  
            ResponseEntity.notFound().build(); 
    }

    public static class ExtensionRequest { 
        private String reason; 
        private LocalDateTime newDueDate; 
 
        public String getReason() { 
            return reason; 
        } 
        public void setReason(String reason) { 
            this.reason = reason; 
        } 
 
        public LocalDateTime getNewDueDate() { 
            return newDueDate; 
        } 
        public void setNewDueDate(LocalDateTime newDueDate) { 
            this.newDueDate = newDueDate; 
        } 
    } 
} 
