package com.example.childPortal.repository;

import com.example.childPortal.model.SocialWorker;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;
import java.util.Optional;

public interface SocialWorkerRepository extends MongoRepository<SocialWorker, String> {
    Optional<SocialWorker> findByUserId(String userId);
    Optional<SocialWorker> findByLicenseNumber(String licenseNumber);
    List<SocialWorker> findAll();
    boolean existsByLicenseNumber(String licenseNumber);
}
