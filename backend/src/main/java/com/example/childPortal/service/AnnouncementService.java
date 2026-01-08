package com.example.childPortal.service;

import com.example.childPortal.dto.AnnouncementDTO;
import com.example.childPortal.model.Announcement.AnnouncementType;
import java.util.List;

public interface AnnouncementService {
    List<AnnouncementDTO> getActiveAnnouncements();
    List<AnnouncementDTO> getAnnouncementsByType(AnnouncementType type);
    AnnouncementDTO createAnnouncement(AnnouncementDTO announcementDTO, String createdBy);
    AnnouncementDTO updateAnnouncement(String id, AnnouncementDTO announcementDTO);
    void deleteAnnouncement(String id);
    AnnouncementDTO getAnnouncementById(String id);
}

