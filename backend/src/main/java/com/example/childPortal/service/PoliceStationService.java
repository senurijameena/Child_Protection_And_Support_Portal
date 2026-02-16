package com.example.childPortal.service;

import com.example.childPortal.model.PoliceStation;
import java.util.List;
import java.util.Optional;

public interface PoliceStationService {
    PoliceStation createStation(PoliceStation station);

    List<PoliceStation> getAllStations();

    Optional<PoliceStation> getStationById(String id);

    List<PoliceStation> getStationsByDistrict(String district);

    PoliceStation updateStation(String id, PoliceStation stationDetails);

    void deleteStation(String id);
}
