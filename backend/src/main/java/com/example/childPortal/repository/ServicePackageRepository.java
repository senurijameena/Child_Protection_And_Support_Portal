package com.example.childPortal.repository;

import com.example.childPortal.model.HelpType;
import com.example.childPortal.model.ServicePackage;
import com.example.childPortal.model.ServicePackage.Status;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface ServicePackageRepository extends MongoRepository<ServicePackage, String> {

    List<ServicePackage> findByRequestType(HelpType requestType);

    List<ServicePackage> findByStatus(Status status);

    List<ServicePackage> findByRequestTypeAndStatus(HelpType requestType, Status status);
}

