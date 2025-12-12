package com.example.childPortal.service;

import com.example.childPortal.model.SocialWorker;
import com.example.childPortal.dto.SocialWorkerDTO;
import java.util.List;
import java.util.Optional;

public interface SocialWorkerService {
    SocialWorker createSocialWorker(SocialWorkerDTO socialWorkerDTO);
    Optional<SocialWorker> getSocialWorkerByUserId(String userId);
    List<SocialWorker> getAllSocialWorkers();
    SocialWorker updateSocialWorker(String userId, SocialWorkerDTO socialWorkerDTO);
    void deleteSocialWorker(String userId);
}