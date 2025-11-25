package com.example.childPortal.service;

import com.example.childPortal.model.PoliceOfficer;
import com.example.childPortal.dto.PoliceOfficerDTO;
import java.util.List;
import java.util.Optional;

public interface PoliceOfficerService {
    PoliceOfficer createPoliceOfficer(PoliceOfficerDTO policeOfficerDTO);
    Optional<PoliceOfficer> getPoliceOfficerByUserId(String userId);
    List<PoliceOfficer> getAllPoliceOfficers();
    PoliceOfficer updatePoliceOfficer(String userId, PoliceOfficerDTO policeOfficerDTO);
    void deletePoliceOfficer(String userId);
}