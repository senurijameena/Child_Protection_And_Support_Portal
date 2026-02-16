package com.example.childPortal.repository;

import com.example.childPortal.model.PoliceStation;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PoliceStationRepository extends MongoRepository<PoliceStation, String> {
    List<PoliceStation> findByCity(String city);

    List<PoliceStation> findByDistrict(String district);
}
