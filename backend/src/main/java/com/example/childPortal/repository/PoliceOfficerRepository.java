package com.example.childPortal.repository;

import com.example.childPortal.model.PoliceOfficer;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.Optional;

public interface PoliceOfficerRepository extends MongoRepository<PoliceOfficer, String> {
    Optional<PoliceOfficer> findByUserId(String userId);
    Optional<PoliceOfficer> findByBadgeNumber(String badgeNumber);
    boolean existsByBadgeNumber(String badgeNumber);
}
