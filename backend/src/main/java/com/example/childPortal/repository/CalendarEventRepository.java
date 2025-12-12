package com.example.childPortal.repository;

import com.example.childPortal.model.CalendarEvent;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.time.LocalDate;
import java.util.List;

public interface CalendarEventRepository extends MongoRepository<CalendarEvent, String> {
    List<CalendarEvent> findByCreatedById(String socialWorkerId);
    List<CalendarEvent> findByEventDate(LocalDate date);
    List<CalendarEvent> findByEventDateBetween(LocalDate start, LocalDate end);
    List<CalendarEvent> findByStatus(String status);
    List<CalendarEvent> findByEventType(String eventType);
}
