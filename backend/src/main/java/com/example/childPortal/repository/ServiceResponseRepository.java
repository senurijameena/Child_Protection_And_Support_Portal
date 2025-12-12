package com.example.childPortal.repository;

import com.example.childPortal.model.ServiceResponse; 
import org.springframework.data.mongodb.repository.MongoRepository; 
import java.util.List; 
import java.util.Optional; 

public interface ServiceResponseRepository  extends MongoRepository<ServiceResponse, String>{
    List<ServiceResponse> findByServiceOfferId(String serviceOfferId);
    List<ServiceResponse> findByUserId(String userId); 
    Optional<ServiceResponse> findById(String id); 
    List<ServiceResponse> findByProcessed(boolean processed); 
}


