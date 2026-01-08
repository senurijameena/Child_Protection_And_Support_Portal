package com.example.childPortal.service.impl;

import com.example.childPortal.dto.*;
import com.example.childPortal.model.*;
import com.example.childPortal.repository.ServiceOfferRepository;
import com.example.childPortal.service.ServiceOfferService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream; 

@Service
public class ServiceOfferServiceImpl implements ServiceOfferService {

    @Autowired 
    private ServiceOfferRepository serviceOfferRepository;

    @Override
    public ServiceOfferDTO createServiceOffer(ServiceOfferDTO serviceOfferDTO) {
        try {
            ServiceOffer offer = new ServiceOffer();
            offer.setHelpRequestId(serviceOfferDTO.getHelpRequestId());
            offer.setOfferedByUserId(serviceOfferDTO.getOfferedByUserId());
            offer.setOfferedToUserId(serviceOfferDTO.getOfferedToUserId());
            offer.setServiceType(serviceOfferDTO.getServiceType());
            offer.setServiceDetails(serviceOfferDTO.getServiceDetails());
            offer.setScheduledDateTime(serviceOfferDTO.getScheduledDateTime()); 
            offer.setStatus(ServiceOffer.OfferStatus.PENDING);
            offer.setOfferDate(LocalDateTime.now());
            
            offer = serviceOfferRepository.save(offer);
            return convertToDTO(offer);
        } catch (Exception e) {
            ServiceOfferDTO errorDTO = new ServiceOfferDTO();
            errorDTO.setServiceDetails("Error creating service offer: " + e.getMessage());
            return errorDTO;
        }
    }

    @Override
    public ServiceOfferDTO getServiceOfferById(String offerId) {
        return serviceOfferRepository.findById(offerId)
                .map(this::convertToDTO)
                .orElse(null);
    }

    @Override
    public List<ServiceOfferDTO> getOffersForUser(String userId) {
        List<ServiceOffer> sent = serviceOfferRepository.findByOfferedByUserId(userId);
        List<ServiceOffer> received = serviceOfferRepository.findByOfferedToUserId(userId);
        
        return Stream.concat(sent.stream(), received.stream())
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<ServiceOfferDTO> getOffersBySocialWorker(String workerId) {
        return serviceOfferRepository.findByOfferedByUserId(workerId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<ServiceOfferDTO> getOffersByHelpRequest(String helpRequestId) {
        return serviceOfferRepository.findByHelpRequestId(helpRequestId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<ServiceOfferDTO> getOffersByServiceType(HelpType serviceType) {
        return serviceOfferRepository.findByServiceType(serviceType).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<ServiceOfferDTO> getPendingOffersForUser(String userId) {
        return serviceOfferRepository.findByOfferedToUserId(userId).stream()
                .filter(offer -> offer.getStatus() == ServiceOffer.OfferStatus.PENDING)
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<ServiceOfferDTO> getUpcomingServicesForUser(String userId) {
        LocalDateTime now = LocalDateTime.now();
        return serviceOfferRepository.findByOfferedToUserId(userId).stream()
                .filter(offer -> offer.getStatus() == ServiceOffer.OfferStatus.ACCEPTED)
                .filter(offer -> offer.getScheduledDateTime() != null && 
                                 offer.getScheduledDateTime().isAfter(now))
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<ServiceOfferDTO> getExpiredOffers() {
        LocalDateTime now = LocalDateTime.now();
        return serviceOfferRepository.findAll().stream()
                .filter(offer -> offer.getStatus() == ServiceOffer.OfferStatus.PENDING)
                .filter(offer -> offer.getOfferDate() != null && 
                                 offer.getOfferDate().plusDays(7).isBefore(now)) 
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public ServiceOfferDTO respondToServiceOffer(ServiceResponseDTO responseDTO) {
        return serviceOfferRepository.findById(responseDTO.getOfferId())
                .map(offer -> {
                    if (responseDTO.isAccepted()) {
                        offer.setStatus(ServiceOffer.OfferStatus.ACCEPTED);
                    } else {
                        offer.setStatus(ServiceOffer.OfferStatus.REJECTED);
                    }
                    offer.setResponseDate(LocalDateTime.now());
                    serviceOfferRepository.save(offer);
                    return convertToDTO(offer);
                })
                .orElse(null);
    }

    @Override
    public ServiceOfferDTO updateServiceOfferStatus(String offerId, ServiceOffer.OfferStatus status) {
        return serviceOfferRepository.findById(offerId)
                .map(offer -> {
                    offer.setStatus(status);
                    serviceOfferRepository.save(offer);
                    return convertToDTO(offer);
                })
                .orElse(null);
    }

    @Override
    public boolean cancelServiceOffer(String offerId) {
        return serviceOfferRepository.findById(offerId)
                .map(offer -> {
                    offer.setStatus(ServiceOffer.OfferStatus.CANCELLED);
                    serviceOfferRepository.save(offer);
                    return true;
                })
                .orElse(false);
    }

    private ServiceOfferDTO convertToDTO(ServiceOffer offer) {
        ServiceOfferDTO dto = new ServiceOfferDTO();
        dto.setId(offer.getId());
        dto.setHelpRequestId(offer.getHelpRequestId());
        dto.setOfferedByUserId(offer.getOfferedByUserId());
        dto.setOfferedToUserId(offer.getOfferedToUserId());
        dto.setServiceType(offer.getServiceType());
        dto.setServiceDetails(offer.getServiceDetails());
        dto.setScheduledDateTime(offer.getScheduledDateTime());
        dto.setStatus(offer.getStatus());
        dto.setOfferDate(offer.getOfferDate());
        return dto;
    }
}