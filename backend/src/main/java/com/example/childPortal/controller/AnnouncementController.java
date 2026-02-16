package com.example.childPortal.controller;

import com.example.childPortal.dto.AnnouncementDTO;
import com.example.childPortal.model.Announcement.AnnouncementType;
import com.example.childPortal.service.AnnouncementService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/announcements")
@CrossOrigin(origins = "*")
public class AnnouncementController {

    @Autowired
    private AnnouncementService announcementService;

    @GetMapping("/active")
    public ResponseEntity<List<AnnouncementDTO>> getActiveAnnouncements() {
        List<AnnouncementDTO> announcements = announcementService.getActiveAnnouncements();
        return ResponseEntity.ok(announcements);
    }

    @GetMapping("/type/{type}")
    public ResponseEntity<List<AnnouncementDTO>> getAnnouncementsByType(@PathVariable String type) {
        try {
            AnnouncementType announcementType = AnnouncementType.valueOf(type.toUpperCase());
            List<AnnouncementDTO> announcements = announcementService.getAnnouncementsByType(announcementType);
            return ResponseEntity.ok(announcements);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<AnnouncementDTO> createAnnouncement(
            @RequestBody AnnouncementDTO announcementDTO,
            @AuthenticationPrincipal String userId) {
        AnnouncementDTO created = announcementService.createAnnouncement(announcementDTO, userId);
        return ResponseEntity.ok(created);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<AnnouncementDTO> updateAnnouncement(
            @PathVariable String id,
            @RequestBody AnnouncementDTO announcementDTO) {
        AnnouncementDTO updated = announcementService.updateAnnouncement(id, announcementDTO);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteAnnouncement(@PathVariable String id) {
        announcementService.deleteAnnouncement(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<AnnouncementDTO> getAnnouncementById(@PathVariable String id) {
        AnnouncementDTO announcement = announcementService.getAnnouncementById(id);
        return ResponseEntity.ok(announcement);
    }
}

