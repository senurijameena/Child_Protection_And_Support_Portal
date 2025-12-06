package com.example.childPortal.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.annotation.CreatedDate;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.LocalDateTime;

@Document(collection = "counseling_sessions")
public class CounselingSession {
 @Id
 @GeneratedValue(strategy = GenerationType.IDENTITY)
 private Long id;

 @ManyToOne
 private Case case;

 private LocalDate sessionDate;
 private LocalTime sessionTime;

 @Enumerated(EnumType.STRING)
 private SessionMode mode;

 private String notes;
 private String specialInstructions;

 @Enumerated(EnumType.STRING)
 private SessionStatus status;
RESCHEDULED

 @ManyToOne
 private SocialWorker scheduledBy;
 private LocalDateTime scheduledAt;

  public CounselingSession() {
        this.scheduledAt = LocalDateTime.now();
    }

  public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public Case getCase() {
        return case;
    }

    public void setCase(Case case) {
        this.case = case;
    }

    public LocalDate getSessionDate() {
        return sessionDate;
    }

    public void setSessionDate(LocalDate sessionDate) {
        this.sessionDate = sessionDate;
    }

    public LocalTime getSessionTime() {
        return sessionTime;
    }

    public void setSessionTime(LocalTime sessionTime) {
        this.sessionTime = sessionTime;
    }

    public String getMode() {
        return mode;
    }

    public void setMode(String mode) {
        this.mode = mode;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public String getSpecialInstructions() {
        return specialInstructions;
    }

    public void setSpecialInstructions(String specialInstructions) {
        this.specialInstructions = specialInstructions;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public SocialWorker getScheduledBy() {
        return scheduledBy;
    }

    public void setScheduledBy(SocialWorker scheduledBy) {
        this.scheduledBy = scheduledBy;
    }

    public LocalDateTime getScheduledAt() {
        return scheduledAt;
    }

    public void setScheduledAt(LocalDateTime scheduledAt) {
        this.scheduledAt = scheduledAt;
    }

    @Override
    public String toString() {
        return "CounselingSession{" +
                "id='" + id + '\'' +
                ", case=" + (case != null ? case.getId() : null) +
                ", sessionDate=" + sessionDate +
                ", sessionTime=" + sessionTime +
                ", mode='" + mode + '\'' +
                ", notes='" + notes + '\'' +
                ", specialInstructions='" + specialInstructions + '\'' +
                ", status='" + status + '\'' +
                ", scheduledBy=" + (scheduledBy != null ? scheduledBy.getId() : null) +
                ", scheduledAt=" + scheduledAt +
                '}';
    }
 
}
