package com.example.childPortal.repository;

import com.example.childPortal.model.Announcement;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.time.LocalDateTime;
import java.util.List;

public interface AnnouncementRepository extends MongoRepository<Announcement, String> {
    List<Announcement> findByActiveTrueOrderByCreatedAtDesc();
    List<Announcement> findByActiveTrueAndExpiresAtAfterOrderByCreatedAtDesc(LocalDateTime now);
    List<Announcement> findByActiveTrueAndExpiresAtIsNullOrderByCreatedAtDesc();
    List<Announcement> findByTypeAndActiveTrueOrderByCreatedAtDesc(Announcement.AnnouncementType type);
}

