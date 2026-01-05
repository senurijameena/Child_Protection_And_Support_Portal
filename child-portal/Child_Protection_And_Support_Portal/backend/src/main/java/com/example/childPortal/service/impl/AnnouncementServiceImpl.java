package com.example.childPortal.service.impl;

import com.example.childPortal.dto.AnnouncementDTO;
import com.example.childPortal.model.Announcement;
import com.example.childPortal.model.Announcement.AnnouncementType;
import com.example.childPortal.repository.AnnouncementRepository;
import com.example.childPortal.service.AnnouncementService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class AnnouncementServiceImpl implements AnnouncementService {

    @Autowired
    private AnnouncementRepository announcementRepository;

    @Override
    public List<AnnouncementDTO> getActiveAnnouncements() {
        LocalDateTime now = LocalDateTime.now();
        List<Announcement> expiredAfter = announcementRepository
                .findByActiveTrueAndExpiresAtAfterOrderByCreatedAtDesc(now);
        List<Announcement> noExpiry = announcementRepository
                .findByActiveTrueAndExpiresAtIsNullOrderByCreatedAtDesc();

        List<Announcement> allAnnouncements = new ArrayList<>();
        allAnnouncements.addAll(expiredAfter);
        allAnnouncements.addAll(noExpiry);
        
        allAnnouncements.sort((a1, a2) -> {
            if (a1.getCreatedAt() == null && a2.getCreatedAt() == null) return 0;
            if (a1.getCreatedAt() == null) return 1;
            if (a2.getCreatedAt() == null) return -1;
            return a2.getCreatedAt().compareTo(a1.getCreatedAt());
        });
        
        return allAnnouncements.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<AnnouncementDTO> getAnnouncementsByType(AnnouncementType type) {
        List<Announcement> announcements = announcementRepository
                .findByTypeAndActiveTrueOrderByCreatedAtDesc(type);
        return announcements.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public AnnouncementDTO createAnnouncement(AnnouncementDTO announcementDTO, String createdBy) {
        Announcement announcement = new Announcement();
        announcement.setTitle(announcementDTO.getTitle());
        announcement.setMessage(announcementDTO.getMessage());
        announcement.setIcon(announcementDTO.getIcon());
        announcement.setType(announcementDTO.getType());
        announcement.setActive(announcementDTO.isActive());
        announcement.setExpiresAt(announcementDTO.getExpiresAt());
        announcement.setCreatedBy(createdBy);
        announcement.setCreatedAt(LocalDateTime.now());

        announcement = announcementRepository.save(announcement);
        return convertToDTO(announcement);
    }

    @Override
    public AnnouncementDTO updateAnnouncement(String id, AnnouncementDTO announcementDTO) {
        Optional<Announcement> optionalAnnouncement = announcementRepository.findById(id);
        if (optionalAnnouncement.isPresent()) {
            Announcement announcement = optionalAnnouncement.get();
            announcement.setTitle(announcementDTO.getTitle());
            announcement.setMessage(announcementDTO.getMessage());
            announcement.setIcon(announcementDTO.getIcon());
            announcement.setType(announcementDTO.getType());
            announcement.setActive(announcementDTO.isActive());
            announcement.setExpiresAt(announcementDTO.getExpiresAt());

            announcement = announcementRepository.save(announcement);
            return convertToDTO(announcement);
        }
        throw new RuntimeException("Announcement not found with id: " + id);
    }

    @Override
    public void deleteAnnouncement(String id) {
        announcementRepository.deleteById(id);
    }

    @Override
    public AnnouncementDTO getAnnouncementById(String id) {
        Optional<Announcement> announcement = announcementRepository.findById(id);
        if (announcement.isPresent()) {
            return convertToDTO(announcement.get());
        }
        throw new RuntimeException("Announcement not found with id: " + id);
    }

    private AnnouncementDTO convertToDTO(Announcement announcement) {
        AnnouncementDTO dto = new AnnouncementDTO();
        dto.setId(announcement.getId());
        dto.setTitle(announcement.getTitle());
        dto.setMessage(announcement.getMessage());
        dto.setIcon(announcement.getIcon());
        dto.setType(announcement.getType());
        dto.setActive(announcement.isActive());
        dto.setCreatedAt(announcement.getCreatedAt());
        dto.setExpiresAt(announcement.getExpiresAt());
        return dto;
    }
}

