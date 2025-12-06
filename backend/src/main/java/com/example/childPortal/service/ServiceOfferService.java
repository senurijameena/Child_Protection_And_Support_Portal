package com.example.childPortal.service;

import com.example.childPortal.dto.ServiceOfferDTO; 
import com.example.childPortal.dto.ServiceResponseDTO; 
import com.example.childPortal.model.ServiceOffer.OfferStatus; 
import com.example.childPortal.model.HelpType; 
import java.util.List; 

public interface ServiceOfferService {
    ServiceOfferDTO createServiceOffer(ServiceOfferDTO serviceOfferDTO);
    ServiceOfferDTO getServiceOfferById(String offerId);
    List<ServiceOfferDTO> getOffersForUser(String userId); 
    List<ServiceOfferDTO> getOffersBySocialWorker(String workerId); 
    List<ServiceOfferDTO> getOffersByHelpRequest(String helpRequestId); 
    List<ServiceOfferDTO> getOffersByServiceType(HelpType serviceType); 
    List<ServiceOfferDTO> getPendingOffersForUser(String userId); 
    List<ServiceOfferDTO> getUpcomingServicesForUser(String userId); 
    ServiceOfferDTO respondToServiceOffer(ServiceResponseDTO responseDTO, String userId); 
    ServiceOfferDTO updateServiceOfferStatus(String offerId, OfferStatus status); 
    boolean cancelServiceOffer(String offerId); List<ServiceOfferDTO> getExpiredOffers();
}
