package com.example.childPortal.controller;

import com.example.childPortal.dto.ServicePackageDTO;
import com.example.childPortal.model.HelpType;
import com.example.childPortal.model.ServicePackage.Status;
import com.example.childPortal.service.ServicePackageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/service-packages")
public class ServicePackageController {

    @Autowired
    private ServicePackageService servicePackageService;

    @GetMapping
    public ResponseEntity<List<ServicePackageDTO>> getPackages(
            @RequestParam(value = "type", required = false) HelpType type,
            @RequestParam(value = "status", required = false) Status status,
            @RequestParam(value = "search", required = false) String search
    ) {
        return ResponseEntity.ok(servicePackageService.getAll(type, status, search));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ServicePackageDTO> getById(@PathVariable String id) {
        return servicePackageService.getById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<ServicePackageDTO> create(
            @RequestBody ServicePackageDTO dto,
            @AuthenticationPrincipal String userId
    ) {
        ServicePackageDTO created = servicePackageService.create(dto, userId);
        return ResponseEntity.ok(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ServicePackageDTO> update(
            @PathVariable String id,
            @RequestBody ServicePackageDTO dto
    ) {
        return servicePackageService.update(id, dto)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        boolean deleted = servicePackageService.delete(id);
        return deleted ? ResponseEntity.noContent().build() : ResponseEntity.notFound().build();
    }
}

