package com.example.childPortal.service.impl;

import com.example.childPortal.dto.ServicePackageDTO;
import com.example.childPortal.model.HelpType;
import com.example.childPortal.model.ServicePackage;
import com.example.childPortal.model.ServicePackage.Status;
import com.example.childPortal.repository.ServicePackageRepository;
import com.example.childPortal.service.ServicePackageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ServicePackageServiceImpl implements ServicePackageService {

    @Autowired
    private ServicePackageRepository repository;

    @Override
    public ServicePackageDTO create(ServicePackageDTO dto, String creatorUserId) {
        ServicePackage entity = new ServicePackage();
        applyToEntity(dto, entity);
        entity.setCreatedByUserId(creatorUserId);
        entity.setCreatedAt(LocalDateTime.now());
        entity.setUpdatedAt(LocalDateTime.now());
        ServicePackage saved = repository.save(entity);
        return toDTO(saved);
    }

    @Override
    public Optional<ServicePackageDTO> update(String id, ServicePackageDTO dto) {
        return repository.findById(id).map(existing -> {
            applyToEntity(dto, existing);
            existing.setUpdatedAt(LocalDateTime.now());
            ServicePackage saved = repository.save(existing);
            return toDTO(saved);
        });
    }

    @Override
    public boolean delete(String id) {
        if (!repository.existsById(id)) {
            return false;
        }
        repository.deleteById(id);
        return true;
    }

    @Override
    public Optional<ServicePackageDTO> getById(String id) {
        return repository.findById(id).map(this::toDTO);
    }

    @Override
    public List<ServicePackageDTO> getAll(HelpType typeFilter, Status statusFilter, String search) {
        List<ServicePackage> base;

        if (typeFilter != null && statusFilter != null) {
            base = repository.findByRequestTypeAndStatus(typeFilter, statusFilter);
        } else if (typeFilter != null) {
            base = repository.findByRequestType(typeFilter);
        } else if (statusFilter != null) {
            base = repository.findByStatus(statusFilter);
        } else {
            base = repository.findAll();
        }

        String normalizedSearch = search != null ? search.trim().toLowerCase() : null;

        return base.stream()
                .filter(pkg -> {
                    if (normalizedSearch == null || normalizedSearch.isEmpty()) {
                        return true;
                    }
                    String title = pkg.getTitle() != null ? pkg.getTitle().toLowerCase() : "";
                    return title.contains(normalizedSearch);
                })
                .sorted((a, b) -> {
                    LocalDateTime aTime = a.getUpdatedAt() != null ? a.getUpdatedAt() : a.getCreatedAt();
                    LocalDateTime bTime = b.getUpdatedAt() != null ? b.getUpdatedAt() : b.getCreatedAt();
                    if (aTime == null && bTime == null) return 0;
                    if (aTime == null) return 1;
                    if (bTime == null) return -1;
                    return bTime.compareTo(aTime);
                })
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    private void applyToEntity(ServicePackageDTO dto, ServicePackage entity) {
        entity.setTitle(dto.getTitle());
        entity.setRequestType(dto.getRequestType());
        entity.setDescription(dto.getDescription());
        entity.setEstimatedDuration(dto.getEstimatedDuration());
        entity.setItems(dto.getItems());

        Status status = dto.getStatus();
        if (status == null) {
            status = Status.DRAFT;
        }
        entity.setStatus(status);
    }

    private ServicePackageDTO toDTO(ServicePackage entity) {
        ServicePackageDTO dto = new ServicePackageDTO();
        dto.setId(entity.getId());
        dto.setTitle(entity.getTitle());
        dto.setRequestType(entity.getRequestType());
        dto.setDescription(entity.getDescription());
        dto.setEstimatedDuration(entity.getEstimatedDuration());
        dto.setItems(entity.getItems());
        dto.setStatus(entity.getStatus());
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setUpdatedAt(entity.getUpdatedAt());
        return dto;
    }
}

