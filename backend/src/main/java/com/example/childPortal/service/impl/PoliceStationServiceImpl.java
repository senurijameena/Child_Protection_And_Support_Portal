package com.example.childPortal.service.impl;

import com.example.childPortal.model.PoliceStation;
import com.example.childPortal.repository.PoliceStationRepository;
import com.example.childPortal.service.PoliceStationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class PoliceStationServiceImpl implements PoliceStationService {

    @Autowired
    private PoliceStationRepository policeStationRepository;

    @Override
    public PoliceStation createStation(PoliceStation station) {
        return policeStationRepository.save(station);
    }

    @Override
    public List<PoliceStation> getAllStations() {
        return policeStationRepository.findAll();
    }

    @Override
    public Optional<PoliceStation> getStationById(String id) {
        return policeStationRepository.findById(id);
    }

    @Override
    public List<PoliceStation> getStationsByDistrict(String district) {
        return policeStationRepository.findByDistrict(district);
    }

    @Override
    public PoliceStation updateStation(String id, PoliceStation stationDetails) {
        Optional<PoliceStation> stationOptional = policeStationRepository.findById(id);
        if (stationOptional.isPresent()) {
            PoliceStation station = stationOptional.get();
            station.setStationName(stationDetails.getStationName());
            station.setDistrict(stationDetails.getDistrict());
            station.setCity(stationDetails.getCity());
            station.setAddress(stationDetails.getAddress());
            station.setContactNumber(stationDetails.getContactNumber());
            station.setEmail(stationDetails.getEmail());
            station.setOfficerInChargeName(stationDetails.getOfficerInChargeName());
            station.setLocationCoordinates(stationDetails.getLocationCoordinates());
            return policeStationRepository.save(station);
        }
        return null;
    }

    @Override
    public void deleteStation(String id) {
        policeStationRepository.deleteById(id);
    }
}
