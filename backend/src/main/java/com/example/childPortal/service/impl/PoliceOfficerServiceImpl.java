package com.example.childPortal.service.impl;

import com.example.childPortal.model.PoliceOfficer;
import com.example.childPortal.dto.PoliceOfficerDTO;
import com.example.childPortal.repository.PoliceOfficerRepository;
import com.example.childPortal.service.PoliceOfficerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class PoliceOfficerServiceImpl implements PoliceOfficerService {

    @Autowired
    private PoliceOfficerRepository policeOfficerRepository;

    @Override
    public PoliceOfficer createPoliceOfficer(PoliceOfficerDTO policeOfficerDTO) {
        if (policeOfficerRepository.existsByBadgeNumber(policeOfficerDTO.getBadgeNumber())) {
            throw new RuntimeException("Badge number already exists");
        }

        PoliceOfficer policeOfficer = new PoliceOfficer(
            policeOfficerDTO.getUserId(),
            policeOfficerDTO.getBadgeNumber(),
            policeOfficerDTO.getDepartment(),
            policeOfficerDTO.getRank(),
            policeOfficerDTO.getStationAddress(),
            policeOfficerDTO.getIdDocumentUrl()
        );

        return policeOfficerRepository.save(policeOfficer);
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
        Optional<PoliceOfficer> existingOfficer = policeOfficerRepository.findByUserId(userId);
        if (existingOfficer.isPresent()) {
            PoliceOfficer officer = existingOfficer.get();
            officer.setBadgeNumber(policeOfficerDTO.getBadgeNumber());
            officer.setDepartment(policeOfficerDTO.getDepartment());
            officer.setRank(policeOfficerDTO.getRank());
            officer.setStationAddress(policeOfficerDTO.getStationAddress());
            officer.setIdDocumentUrl(policeOfficerDTO.getIdDocumentUrl());
            return policeOfficerRepository.save(officer);
        }
        return null;
    }

    @Override
    public void deletePoliceOfficer(String userId) {
        Optional<PoliceOfficer> officer = policeOfficerRepository.findByUserId(userId);
        officer.ifPresent(policeOfficerRepository::delete);
    }
}