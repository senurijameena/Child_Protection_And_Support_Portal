package com.example.childPortal.dto;

public class UpcomingFollowUpPublicDTO {
    private String scheduledDate;  
    private String method;         
    private String status;
    private String nextScheduledDate;

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
