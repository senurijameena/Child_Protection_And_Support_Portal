package com.example.childPortal.service.impl;

import com.example.childPortal.model.SocialWorker;
import com.example.childPortal.dto.SocialWorkerDTO;
import com.example.childPortal.repository.SocialWorkerRepository;
import com.example.childPortal.service.SocialWorkerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class SocialWorkerServiceImpl implements SocialWorkerService {

    @Autowired
    private SocialWorkerRepository socialWorkerRepository;

    @Override
    public SocialWorker createSocialWorker(SocialWorkerDTO socialWorkerDTO) {
        if (socialWorkerRepository.existsByLicenseNumber(socialWorkerDTO.getLicenseNumber())) {
            throw new RuntimeException("License number already exists");
        }

        SocialWorker socialWorker = new SocialWorker(
            socialWorkerDTO.getUserId(),
            socialWorkerDTO.getLicenseNumber(),
            socialWorkerDTO.getSpecializations(),
            socialWorkerDTO.getOrganization(),
            socialWorkerDTO.getYearsOfExperience(),
            socialWorkerDTO.getCertificationUrl()
        );

        return socialWorkerRepository.save(socialWorker);
    }

    @Override
    public Optional<SocialWorker> getSocialWorkerByUserId(String userId) {
        return socialWorkerRepository.findByUserId(userId);
    }

    @Override
    public List<SocialWorker> getAllSocialWorkers() {
        return socialWorkerRepository.findAll();
    }

    @Override
    public SocialWorker updateSocialWorker(String userId, SocialWorkerDTO socialWorkerDTO) {
        Optional<SocialWorker> existingWorker = socialWorkerRepository.findByUserId(userId);
        if (existingWorker.isPresent()) {
            SocialWorker worker = existingWorker.get();
            worker.setLicenseNumber(socialWorkerDTO.getLicenseNumber());
            worker.setSpecializations(socialWorkerDTO.getSpecializations());
            worker.setOrganization(socialWorkerDTO.getOrganization());
            worker.setYearsOfExperience(socialWorkerDTO.getYearsOfExperience());
            worker.setCertificationUrl(socialWorkerDTO.getCertificationUrl());
            return socialWorkerRepository.save(worker);
        }
        return null;
    }

    @Override
    public void deleteSocialWorker(String userId) {
        Optional<SocialWorker> worker = socialWorkerRepository.findByUserId(userId);
        worker.ifPresent(socialWorkerRepository::delete);
    }
}