package com.example.childPortal.dto;

import java.time.LocalDateTime;

/**
 * Public-safe view of a follow-up. Shown to the Public User on request details.
 * Includes: date, time, method (type), status flow (SCHEDULED, COMPLETED, MISSED, RESCHEDULED).
 * For MISSED/RESCHEDULED, nextScheduledDate is the new date. Does NOT include internal notes.
 */
public class UpcomingFollowUpPublicDTO {
    private String scheduledDate;   // ISO date-time string for frontend to format
    private String method;         // e.g. "Phone Call", "Home Visit"
    private String status;         // SCHEDULED, COMPLETED, MISSED, RESCHEDULED
    private String nextScheduledDate; // When status is MISSED/RESCHEDULED, the new date (ISO)

    public String getScheduledDate() {
        return scheduledDate;
    }

    public void setScheduledDate(String scheduledDate) {
        this.scheduledDate = scheduledDate;
    }

    public String getMethod() {
        return method;
    }

    public void setMethod(String method) {
        this.method = method;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getNextScheduledDate() {
        return nextScheduledDate;
    }

    public void setNextScheduledDate(String nextScheduledDate) {
        this.nextScheduledDate = nextScheduledDate;
    }
}
