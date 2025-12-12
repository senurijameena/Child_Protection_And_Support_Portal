package com.example.childPortal.service.impl;

import com.example.childPortal.dto.PoliceOfficerDTO;
import com.example.childPortal.model.PoliceOfficer;
import com.example.childPortal.repository.PoliceOfficerRepository;
import com.example.childPortal.service.PoliceOfficerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class PoliceOfficerServiceImpl implements PoliceOfficerService {

    @Autowired private PoliceOfficerRepository policeOfficerRepository;

    @Override
    public PoliceOfficer createPoliceOfficer(String userId, PoliceOfficerDTO policeOfficerDTO) {
        PoliceOfficer officer = new PoliceOfficer();
        officer.setUserId(userId);
        officer.setBadgeNumber(policeOfficerDTO.getBadgeNumber());
        officer.setDepartment(policeOfficerDTO.getDepartment());
        officer.setRank(policeOfficerDTO.getRank());
        officer.setStationAddress(policeOfficerDTO.getStationAddress());
        return policeOfficerRepository.save(officer);
    }

    @Override
    public Optional<PoliceOfficer> getPoliceOfficerByUserId(String userId) {
        return policeOfficerRepository.findByUserId(userId);
    }

    @Override
    public List<PoliceOfficer> getAllPoliceOfficers() {
        return policeOfficerRepository.findAll();
    }

    @Override
    public PoliceOfficer updatePoliceOfficer(String userId, PoliceOfficerDTO policeOfficerDTO) {
        Optional<PoliceOfficer> officerOpt = policeOfficerRepository.findByUserId(userId);
        if (officerOpt.isPresent()) {
            PoliceOfficer officer = officerOpt.get();
            officer.setBadgeNumber(policeOfficerDTO.getBadgeNumber());
            officer.setDepartment(policeOfficerDTO.getDepartment());
            officer.setRank(policeOfficerDTO.getRank());
            officer.setStationAddress(policeOfficerDTO.getStationAddress());
            return policeOfficerRepository.save(officer);
        }
        return null;
    }

    @Override
    public void deletePoliceOfficer(String userId) {
        policeOfficerRepository.findByUserId(userId).ifPresent(policeOfficerRepository::delete);
    }
}