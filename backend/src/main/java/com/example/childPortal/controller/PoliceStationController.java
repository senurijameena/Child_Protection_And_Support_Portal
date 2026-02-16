package com.example.childPortal.controller;

import com.example.childPortal.model.PoliceStation;
import com.example.childPortal.service.PoliceStationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/stations")
public class PoliceStationController {

    @Autowired
    private PoliceStationService policeStationService;

    @GetMapping
    public List<PoliceStation> getAllStations() {
        return policeStationService.getAllStations();
    }

    @GetMapping("/{id}")
    public ResponseEntity<PoliceStation> getStationById(@PathVariable String id) {
        return policeStationService.getStationById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/district/{district}")
    public List<PoliceStation> getStationsByDistrict(@PathVariable String district) {
        return policeStationService.getStationsByDistrict(district);
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public PoliceStation createStation(@RequestBody PoliceStation station) {
        return policeStationService.createStation(station);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PoliceStation> updateStation(@PathVariable String id,
            @RequestBody PoliceStation stationDetails) {
        PoliceStation updatedStation = policeStationService.updateStation(id, stationDetails);
        if (updatedStation != null) {
            return ResponseEntity.ok(updatedStation);
        }
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteStation(@PathVariable String id) {
        policeStationService.deleteStation(id);
        return ResponseEntity.ok().build();
    }
}
