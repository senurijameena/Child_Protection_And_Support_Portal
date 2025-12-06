package com.example.childPortal.service.impl;
import com.example.childPortal.dto.ServiceOfferDTO; 
import com.example.childPortal.dto.ServiceResponseDTO; 
import com.example.childPortal.model.*; 
import com.example.childPortal.model.ServiceOffer.OfferStatus; 
import com.example.childPortal.repository.*; 
import com.example.childPortal.service.ServiceOfferService; 
import org.springframework.beans.factory.annotation.Autowired; 
import org.springframework.stereotype.Service; 
import java.time.LocalDateTime; 
import java.util.List; 
import java.util.Optional; 
import java.util.stream.Collectors; 

@Service
public class ServiceOfferServiceImpl  implements ServiceOfferService{
    @Autowired
    private ServiceOfferRepository serviceOfferRepository; 

    @Autowired
    private ServiceResponseRepository serviceResponseRepository; 

    @Autowired
    private UserRepository userRepository; 
    
    @Autowired 
    private HelpRequestRepository helpRequestRepository; 

    @Override 
    public ServiceOfferDTO createServiceOffer(ServiceOfferDTO serviceOfferDTO) {
        ServiceOffer serviceOffer = new ServiceOffer(); 

        serviceOffer.setHelpRequestId(serviceOfferDTO.getHelpRequestId());
        serviceOffer.setOfferedByUserId(serviceOfferDTO.getOfferedByUserId());
        serviceOffer.setOfferedToUserId(serviceOfferDTO.getOfferedToUserId());
        serviceOffer.setServiceType(serviceOfferDTO.getServiceType());
        serviceOffer.setProviderName(serviceOfferDTO.getProviderName()); 
        serviceOffer.setProviderLocation(serviceOfferDTO.getProviderLocation()); 
        serviceOffer.setServiceDetails(serviceOfferDTO.getServiceDetails()); 
        serviceOffer.setScheduledDateTime(serviceOfferDTO.getScheduledDateTime());
        serviceOffer.setEndDateTime(serviceOfferDTO.getEndDateTime());
        serviceOffer.setDuration(serviceOfferDTO.getDuration());
        serviceOffer.setNotes(serviceOfferDTO.getNotes());
        serviceOffer.setRequiresFollowUp(serviceOfferDTO.isRequiresFollowUp()); 
        serviceOffer.setFollowUpDate(serviceOfferDTO.getFollowUpDate());

        ServiceOffer savedOffer = serviceOfferRepository.save(serviceOffer);
        
        sendNotificationToUser(savedOffer);

        return convertToDTO(savedOffer);
    }
    @Override
    public ServiceOfferDTO getServiceOfferById(String offerId) { 
        Optional<ServiceOffer> offerOpt = serviceOfferRepository.findById(offerId);
        if (offerOpt.isPresent()) { 
            return convertToDTO(offerOpt.get()); 
        } 
        return null; 
    }

    @Override 
    public List<ServiceOfferDTO> getOffersForUser(String userId) { 
        List<ServiceOffer> offers = serviceOfferRepository.findByOfferedToUserId(userId);
        return offers.stream()
          .map(this::convertToDTO)
          .peek(dto -> { 
             dto.setPendingResponse(dto.getStatus() == OfferStatus.PENDING);
              dto.setUpcoming(dto.getScheduledDateTime() != null &&
              dto.getScheduledDateTime().isAfter(LocalDateTime.now()) &&
                (dto.getStatus() == OfferStatus.ACCEPTED || dto.getStatus() == OfferStatus.RESCHEDULED));
                dto.setCompleted(dto.getStatus() == OfferStatus.COMPLETED); 
                  dto.setCanRespond(dto.getStatus() == OfferStatus.PENDING);
          })
        .collect(Collectors.toList());   
    }
    @Override
    public List<ServiceOfferDTO> getOffersBySocialWorker(String workerId) { 
        List<ServiceOffer> offers = serviceOfferRepository.findByOfferedByUserId(workerId);
        return offers.stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    @Override 
    public List<ServiceOfferDTO> getOffersByHelpRequest(String helpRequestId) { 
        List<ServiceOffer> offers = serviceOfferRepository.findByHelpRequestId(helpRequestId); 
        return offers.stream().map(this::convertToDTO).collect(Collectors.toList()); 
    } 

    @Override 
    public List<ServiceOfferDTO> getOffersByServiceType(HelpType serviceType) { 
        List<ServiceOffer> offers = serviceOfferRepository.findByServiceType(serviceType); 
        return offers.stream().map(this::convertToDTO).collect(Collectors.toList()); 
    } 

    @Override 
    public List<ServiceOfferDTO> getPendingOffersForUser(String userId) { 
        List<ServiceOffer> offers = serviceOfferRepository.findByOfferedToUserIdAndStatus(userId, OfferStatus.PENDING); 
        return offers.stream().map(this::convertToDTO).collect(Collectors.toList()); 
    }

    @Override 
    public List<ServiceOfferDTO> getUpcomingServicesForUser(String userId) { 
        LocalDateTime now = LocalDateTime.now(); 
        LocalDateTime nextWeek = now.plusWeeks(1); 

        List<ServiceOffer> offers = serviceOfferRepository.findByOfferedToUserId(userId);
        return offers.stream() 
            .filter(offer -> offer.getScheduledDateTime() != null && 
                            offer.getScheduledDateTime().isAfter(now) && 
                            offer.getScheduledDateTime().isBefore(nextWeek) && 
                            (offer.getStatus() == OfferStatus.ACCEPTED || offer.getStatus() == OfferStatus.RESCHEDULED))
                             .map(this::convertToDTO) 
                             .collect(Collectors.toList());
} 

  @Override 
    public ServiceOfferDTO respondToServiceOffer(ServiceResponseDTO responseDTO, String userId) { 
        Optional<ServiceOffer> offerOpt = serviceOfferRepository.findById(responseDTO.getServiceOfferId());

        if (offerOpt.isPresent()) { 
            ServiceOffer offer = offerOpt.get();
            if (!offer.getOfferedToUserId().equals(userId)) { 
                throw new RuntimeException("User not authorized to respond to this offer");
            }
            ServiceResponse response = new ServiceResponse(); 
            
            response.setServiceOfferId(offer.getId()); 
            response.setUserId(userId); 
            response.setAction(responseDTO.getAction()); 
            response.setResponseMessage(responseDTO.getResponseMessage()); 
            response.setProposedDateTime(responseDTO.getProposedDateTime()); 
            response.setRescheduleReason(responseDTO.getRescheduleReason()); 
            response.setRequestedInfo(responseDTO.getRequestedInfo()); 
             
            ServiceResponse savedResponse = serviceResponseRepository.save(response);
            
            offer.setUserAction(responseDTO.getAction()); 
            offer.setResponseDate(LocalDateTime.now()); 
            offer.setLastUpdated(LocalDateTime.now()); 
             
            switch (responseDTO.getAction()) { 
                case ACCEPT: 
                    offer.setStatus(OfferStatus.ACCEPTED); 
                    notifySocialWorkerAccepted(offer); 
                    break; 
                case REJECT: 
                    offer.setStatus(OfferStatus.REJECTED); 
                    notifySocialWorkerRejected(offer); 
                    break; 
                case RESCHEDULE: 
                    offer.setStatus(OfferStatus.RESCHEDULED); 
                    if (responseDTO.getProposedDateTime() != null) { 
                        offer.setScheduledDateTime(responseDTO.getProposedDateTime()); 
                    } 
                    notifySocialWorkerRescheduled(offer, response); 
                    break; 
                case REQUEST_INFO:
                    notifySocialWorkerInfoRequested(offer, response); 
                    break; 
                }

                ServiceOffer updatedOffer = serviceOfferRepository.save(offer);

                return convertToDTO(updatedOffer);
            }
            return null; 
    } 
 
    @Override 
    public ServiceOfferDTO updateServiceOfferStatus(String offerId, OfferStatus status) { 
        Optional<ServiceOffer> offerOpt = serviceOfferRepository.findById(offerId); 
        if (offerOpt.isPresent()) { 
            ServiceOffer offer = offerOpt.get(); 
            offer.setStatus(status); 
            offer.setLastUpdated(LocalDateTime.now()); 
             
            ServiceOffer updatedOffer = serviceOfferRepository.save(offer); 
 
            if (status == OfferStatus.CANCELLED || status == OfferStatus.COMPLETED) { 
                notifyUserStatusUpdate(offer, status); 
            } 
             
            return convertToDTO(updatedOffer); 
        } 
        return null; 
    } 
 
    @Override 
    public boolean cancelServiceOffer(String offerId) { 
        Optional<ServiceOffer> offerOpt = serviceOfferRepository.findById(offerId); 
        if (offerOpt.isPresent()) { 
            ServiceOffer offer = offerOpt.get(); 
            offer.setStatus(OfferStatus.CANCELLED); 
            offer.setLastUpdated(LocalDateTime.now()); 
            serviceOfferRepository.save(offer); 
             
            notifyUserServiceCancelled(offer); 
            return true; 
        } 
        return false; 
    } 
 
    @Override 
    public List<ServiceOfferDTO> getExpiredOffers() { 
        LocalDateTime weekAgo = LocalDateTime.now().minusWeeks(1); 
        List<ServiceOffer> offers = serviceOfferRepository.findByOfferDateBeforeAndStatus(weekAgo, OfferStatus.PENDING); 

        offers.forEach(offer -> { 
            offer.setStatus(OfferStatus.EXPIRED); 
            offer.setLastUpdated(LocalDateTime.now()); 
            serviceOfferRepository.save(offer); 
        }); 
         
        return offers.stream().map(this::convertToDTO).collect(Collectors.toList()); 
    } 
 
    private ServiceOfferDTO convertToDTO(ServiceOffer offer) { 
        ServiceOfferDTO dto = new ServiceOfferDTO(); 
        dto.setId(offer.getId()); 
        dto.setHelpRequestId(offer.getHelpRequestId()); 
        dto.setOfferedByUserId(offer.getOfferedByUserId()); 
        dto.setOfferedToUserId(offer.getOfferedToUserId()); 
        dto.setServiceType(offer.getServiceType()); 
        dto.setProviderName(offer.getProviderName()); 
        dto.setProviderLocation(offer.getProviderLocation()); 
        dto.setServiceDetails(offer.getServiceDetails()); 
        dto.setScheduledDateTime(offer.getScheduledDateTime()); 
        dto.setEndDateTime(offer.getEndDateTime()); 
        dto.setDuration(offer.getDuration()); 
        dto.setStatus(offer.getStatus()); 
        dto.setUserAction(offer.getUserAction()); 
        dto.setResponseDate(offer.getResponseDate()); 
        dto.setNotes(offer.getNotes()); 
        dto.setRequiresFollowUp(offer.isRequiresFollowUp()); 
        dto.setFollowUpDate(offer.getFollowUpDate()); 
        dto.setOfferDate(offer.getOfferDate()); 
        dto.setLastUpdated(offer.getLastUpdated()); 

        if (offer.getOfferedByUserId() != null) { 
            Optional<User> worker = userRepository.findById(offer.getOfferedByUserId()); 
            worker.ifPresent(user -> dto.setOfferedByName(user.getFullName())); 
        } 
         
        if (offer.getOfferedToUserId() != null) { 
            Optional<User> user = userRepository.findById(offer.getOfferedToUserId()); 
            user.ifPresent(u -> dto.setOfferedToName(u.getFullName())); 
        } 

        dto.setPendingResponse(offer.getStatus() == OfferStatus.PENDING); 
        dto.setUpcoming(offer.getScheduledDateTime() != null &&  
                       offer.getScheduledDateTime().isAfter(LocalDateTime.now()) && 
                       (offer.getStatus() == OfferStatus.ACCEPTED || offer.getStatus() == 
OfferStatus.RESCHEDULED)); 
        dto.setCompleted(offer.getStatus() == OfferStatus.COMPLETED); 
        dto.setCanRespond(offer.getStatus() == OfferStatus.PENDING); 
         
        return dto; 
    } 
 
    private void sendNotificationToUser(ServiceOffer offer) { 
        System.out.println("Service offer notification sent to user: " + offer.getOfferedToUserId()); 
        System.out.println("Service Type: " + offer.getServiceType()); 
        System.out.println("Provider: " + offer.getProviderName()); 
        System.out.println("Scheduled: " + offer.getScheduledDateTime()); 

    } 
 
    private void notifySocialWorkerAccepted(ServiceOffer offer) { 
        System.out.println("Notification sent to social worker: " + offer.getOfferedByUserId()); 
        System.out.println("User accepted service offer: " + offer.getId()); 
        System.out.println("Service Type: " + offer.getServiceType()); 
    } 
 
    private void notifySocialWorkerRejected(ServiceOffer offer) { 
        System.out.println("Notification sent to social worker: " + offer.getOfferedByUserId()); 
        System.out.println("User rejected service offer: " + offer.getId()); 
        System.out.println("Service Type: " + offer.getServiceType()); 
    } 
 
    private void notifySocialWorkerRescheduled(ServiceOffer offer, ServiceResponse response) { 
        System.out.println("Notification sent to social worker: " + offer.getOfferedByUserId()); 
        System.out.println("User requested rescheduling for: " + offer.getId()); 
        System.out.println("Proposed new time: " + response.getProposedDateTime()); 
        System.out.println("Reason: " + response.getRescheduleReason()); 
    } 
 
    private void notifySocialWorkerInfoRequested(ServiceOffer offer, ServiceResponse response) { 
        System.out.println("Notification sent to social worker: " + offer.getOfferedByUserId()); 
        System.out.println("User requested more info for: " + offer.getId()); 
        System.out.println("Requested info: " + response.getRequestedInfo()); 
    } 
 
    private void notifyUserStatusUpdate(ServiceOffer offer, OfferStatus status) { 
        System.out.println("Notification sent to user: " + offer.getOfferedToUserId()); 
        System.out.println("Service offer status updated to: " + status); 
        System.out.println("Service: " + offer.getServiceType()); 
    } 
    
    private void notifyUserServiceCancelled(ServiceOffer offer) { 
        System.out.println("Notification sent to user: " + offer.getOfferedToUserId()); 
        System.out.println("Service offer cancelled: " + offer.getId()); 
        System.out.println("Service: " + offer.getServiceType()); 
    } 
} 
