package com.example.childPortal.service;

import com.example.childPortal.dto.ServicePackageDTO;
import com.example.childPortal.model.HelpType;
import com.example.childPortal.model.ServicePackage.Status;

import java.util.List;
import java.util.Optional;

public interface ServicePackageService {

    ServicePackageDTO create(ServicePackageDTO dto, String creatorUserId);

    Optional<ServicePackageDTO> update(String id, ServicePackageDTO dto);

    boolean delete(String id);

    Optional<ServicePackageDTO> getById(String id);

    List<ServicePackageDTO> getAll(HelpType typeFilter, Status statusFilter, String search);
}

