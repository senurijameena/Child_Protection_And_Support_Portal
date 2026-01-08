package com.example.childPortal.repository;

import com.example.childPortal.model.HelpType;
import com.example.childPortal.model.ServiceOffer;
import com.example.childPortal.model.ServiceOffer.OfferStatus;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface ServiceOfferRepository extends MongoRepository<ServiceOffer, String> {
    List<ServiceOffer> findByOfferedByUserId(String userId);
    List<ServiceOffer> findByOfferedToUserId(String userId);
    List<ServiceOffer> findByHelpRequestId(String helpRequestId);
    List<ServiceOffer> findByServiceType(HelpType serviceType); 
    List<ServiceOffer> findByStatus(OfferStatus status);
}