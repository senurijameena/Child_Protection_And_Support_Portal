package com.example.childPortal.repository;

import com.example.childPortal.model.PoliceStation;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PoliceStationRepository extends MongoRepository<PoliceStation, String> {
    List<PoliceStation> findByCity(String city);

    List<PoliceStation> findByDistrict(String district);

    /**
     * Station account that manages this station (created via Register Police Station).
     */
    Optional<PoliceStation> findByRegisteredUserId(String registeredUserId);

    /**
     * Fallback mapping: sometimes station accounts are linked by email.
     */
    Optional<PoliceStation> findByEmail(String email);
}
