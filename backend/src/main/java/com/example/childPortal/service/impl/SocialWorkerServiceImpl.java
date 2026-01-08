package com.example.childPortal.service.impl;

import com.example.childPortal.dto.SocialWorkerDTO;
import com.example.childPortal.model.SocialWorker;
import com.example.childPortal.repository.SocialWorkerRepository;
import com.example.childPortal.service.SocialWorkerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class SocialWorkerServiceImpl implements SocialWorkerService {

    @Autowired private SocialWorkerRepository socialWorkerRepository;

    @Override
    public SocialWorker createSocialWorker(String userId, SocialWorkerDTO socialWorkerDTO) {
        SocialWorker worker = new SocialWorker();
        worker.setUserId(userId);
        worker.setLicenseNumber(socialWorkerDTO.getLicenseNumber());
        worker.setSpecializations(socialWorkerDTO.getSpecializations());
        worker.setOrganization(socialWorkerDTO.getOrganization());
        worker.setYearsOfExperience(Integer.parseInt(socialWorkerDTO.getYearsOfExperience()));
        worker.setIdDocumentUrl(socialWorkerDTO.getLicenseNumber()); 
        return socialWorkerRepository.save(worker);
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
        Optional<SocialWorker> workerOpt = socialWorkerRepository.findByUserId(userId);
        if (workerOpt.isPresent()) {
            SocialWorker worker = workerOpt.get();
            worker.setLicenseNumber(socialWorkerDTO.getLicenseNumber());
            worker.setSpecializations(socialWorkerDTO.getSpecializations());
            worker.setOrganization(socialWorkerDTO.getOrganization());
            worker.setYearsOfExperience(Integer.parseInt(socialWorkerDTO.getYearsOfExperience()));
            return socialWorkerRepository.save(worker);
        }
        return null;
    }

    @Override
    public void deleteSocialWorker(String userId) {
        socialWorkerRepository.findByUserId(userId).ifPresent(socialWorkerRepository::delete);
    }

    @Override
    public List<SocialWorker> getAvailableSocialWorkers() {
        return socialWorkerRepository.findByAvailable(true);
    }
}