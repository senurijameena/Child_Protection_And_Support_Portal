package com.example.childPortal.controller;

import com.example.childPortal.dto.ServiceOfferDTO; 
import com.example.childPortal.dto.ServiceResponseDTO; 
import com.example.childPortal.model.HelpType; 
import com.example.childPortal.model.ServiceOffer.OfferStatus; 
import com.example.childPortal.service.ServiceOfferService; 
import org.springframework.beans.factory.annotation.Autowired; 
import org.springframework.http.ResponseEntity; 
import org.springframework.web.bind.annotation.*; 
import java.util.List;

@RestController 
@RequestMapping("/api/services") 
@CrossOrigin(origins = "*")

public class ServiceOfferController {
    @Autowired 
    private ServiceOfferService serviceOfferService;

    @PostMapping("/offer") 
    public ResponseEntity<ServiceOfferDTO> createServiceOffer(@RequestBody 
    ServiceOfferDTO serviceOfferDTO) { 
            ServiceOfferDTO createdOffer = serviceOfferService.createServiceOffer(serviceOfferDTO); 
            return ResponseEntity.ok(createdOffer); 
    }

    @GetMapping("/user/{userId}") 
    public ResponseEntity<List<ServiceOfferDTO>> getOffersForUser(@PathVariable String userId) { 
        List<ServiceOfferDTO> offers = serviceOfferService.getOffersForUser(userId); 
        return ResponseEntity.ok(offers); 
    }

    @GetMapping("/user/{userId}/pending") 
    public ResponseEntity<List<ServiceOfferDTO>> getPendingOffers(@PathVariable String userId) { 
        List<ServiceOfferDTO> offers = serviceOfferService.getPendingOffersForUser(userId); 
        return ResponseEntity.ok(offers); 
    } 

    @GetMapping("/user/{userId}/upcoming") 
    public ResponseEntity<List<ServiceOfferDTO>> getUpcomingServices(@PathVariable String userId) { 
        List<ServiceOfferDTO> offers = serviceOfferService.getUpcomingServicesForUser(userId); 
        return ResponseEntity.ok(offers); 
    }  

    @GetMapping("/worker/{workerId}") 
    public ResponseEntity<List<ServiceOfferDTO>> getOffersByWorker(@PathVariable String workerId) { 
        List<ServiceOfferDTO> offers = serviceOfferService.getOffersBySocialWorker(workerId); 
        return ResponseEntity.ok(offers); 
    }

    @GetMapping("/help-request/{helpRequestId}") 
    public ResponseEntity<List<ServiceOfferDTO>> getOffersByHelpRequest(@PathVariable String helpRequestId) { 
        List<ServiceOfferDTO> offers = serviceOfferService.getOffersByHelpRequest(helpRequestId); 
        return ResponseEntity.ok(offers); 
    }

    @GetMapping("/type/{serviceType}") 
    public ResponseEntity<List<ServiceOfferDTO>> getOffersByType(@PathVariable HelpType serviceType) { 
        List<ServiceOfferDTO> offers = serviceOfferService.getOffersByServiceType(serviceType); 
        return ResponseEntity.ok(offers); 
    } 

    @PostMapping("/respond") 
    public ResponseEntity<ServiceOfferDTO> respondToOffer( 
            @RequestBody ServiceResponseDTO responseDTO, 
            @RequestHeader("X-User-Id") String userId) { 
                ServiceOfferDTO updatedOffer = serviceOfferService.respondToServiceOffer(responseDTO, userId); 
                return updatedOffer != null ?  ResponseEntity.ok(updatedOffer) :  
                ResponseEntity.notFound().build(); 
    }

    @PutMapping("/{offerId}/status") 
    public ResponseEntity<ServiceOfferDTO> updateStatus( 
            @PathVariable String offerId, 
            @RequestParam OfferStatus status) { 
                ServiceOfferDTO updatedOffer = serviceOfferService.updateServiceOfferStatus(offerId, status); 
                return updatedOffer != null ?  ResponseEntity.ok(updatedOffer) :  
                ResponseEntity.notFound().build(); 
    }

    @DeleteMapping("/{offerId}") 
    public ResponseEntity<String> cancelServiceOffer(@PathVariable String offerId) { 
        boolean cancelled = serviceOfferService.cancelServiceOffer(offerId); 
        return cancelled ?  
            ResponseEntity.ok("Service offer cancelled successfully") :  
            ResponseEntity.notFound().build(); 
    }

    @GetMapping("/{offerId}") 
    public ResponseEntity<ServiceOfferDTO> getServiceOffer(@PathVariable String offerId) { 
        ServiceOfferDTO offer = serviceOfferService.getServiceOfferById(offerId); 
        return offer != null ?  
            ResponseEntity.ok(offer) :  
            ResponseEntity.notFound().build(); 
    } 

    @GetMapping("/{offerId}") 
    public ResponseEntity<ServiceOfferDTO> getServiceOffer(@PathVariable String offerId) { 
        ServiceOfferDTO offer = serviceOfferService.getServiceOfferById(offerId); 
        return offer != null ?  
            ResponseEntity.ok(offer) :  
            ResponseEntity.notFound().build(); 
    } 
}
