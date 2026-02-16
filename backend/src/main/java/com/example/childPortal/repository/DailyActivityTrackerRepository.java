package com.example.childPortal.repository;

import com.example.childPortal.model.DailyActivityTracker;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface DailyActivityTrackerRepository extends MongoRepository<DailyActivityTracker, String> {
    Optional<DailyActivityTracker> findByHelpRequestIdAndTrackingDate(String helpRequestId, LocalDate trackingDate);
    
    List<DailyActivityTracker> findByHelpRequestId(String helpRequestId);
    
    List<DailyActivityTracker> findBySocialWorkerId(String socialWorkerId);
    
    List<DailyActivityTracker> findBySocialWorkerIdAndTrackingDate(String socialWorkerId, LocalDate trackingDate);
    
    List<DailyActivityTracker> findByTrackingDateAndMorningReminderSentFalse(LocalDate trackingDate);
    
    List<DailyActivityTracker> findByTrackingDateAndEveningCheckDoneFalse(LocalDate trackingDate);
    
    List<DailyActivityTracker> findByTrackingDateAndAllActivitiesProcessedFalse(LocalDate trackingDate);
}
