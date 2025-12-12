package com.example.childPortal.service;

import com.example.childPortal.dto.ServiceOfferDTO;
import com.example.childPortal.dto.ServiceResponseDTO;
import com.example.childPortal.model.ServiceOffer.OfferStatus;
import java.util.List;

public interface ServiceOfferService {
    ServiceOfferDTO createServiceOffer(ServiceOfferDTO serviceOfferDTO);
    ServiceOfferDTO getServiceOfferById(String offerId);
    List<ServiceOfferDTO> getOffersForUser(String userId);
    List<ServiceOfferDTO> getOffersBySocialWorker(String workerId);
    List<ServiceOfferDTO> getOffersByHelpRequest(String helpRequestId);
    ServiceOfferDTO respondToServiceOffer(ServiceResponseDTO responseDTO);
    ServiceOfferDTO updateServiceOfferStatus(String offerId, OfferStatus status);
    boolean cancelServiceOffer(String offerId);
}