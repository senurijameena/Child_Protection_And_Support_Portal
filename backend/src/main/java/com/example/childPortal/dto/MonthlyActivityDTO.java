package com.example.childPortal.dto;

import java.time.LocalDateTime;

public class MonthlyActivityDTO {
    private String month;
    private LocalDateTime period;
    private long cases;
    private long helpRequests;

    public MonthlyActivityDTO() {
    }

    public MonthlyActivityDTO(String month, LocalDateTime period, long cases, long helpRequests) {
        this.month = month;
        this.period = period;
        this.cases = cases;
        this.helpRequests = helpRequests;
    }

    public String getMonth() {
        return month;
    }

    public void setMonth(String month) {
        this.month = month;
    }

    public LocalDateTime getPeriod() {
        return period;
    }

    public void setPeriod(LocalDateTime period) {
        this.period = period;
    }

    public long getCases() {
        return cases;
    }

    public void setCases(long cases) {
        this.cases = cases;
    }

    public long getHelpRequests() {
        return helpRequests;
    }

    public void setHelpRequests(long helpRequests) {
        this.helpRequests = helpRequests;
    }
}

