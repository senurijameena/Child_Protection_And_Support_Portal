package com.example.childPortal.dto;

import java.util.List;
import java.util.Map;

public class PersonalAnalyticsDTO {
    private List<MonthlyActivityDTO> monthlyActivity;

    private Map<String, Long> caseTypeDistribution;
   
    private double averageResponseTime; // in days
    private double fastestResponse; // in hours
    private double resolutionRate; // percentage
 
    private long anonymousReports;
    private long namedReports;
    private double anonymousPercentage;
    private double namedPercentage;
    private double anonymousResponseTimeAdvantage; // percentage faster

    public List<MonthlyActivityDTO> getMonthlyActivity() {
        return monthlyActivity;
    }

    public void setMonthlyActivity(List<MonthlyActivityDTO> monthlyActivity) {
        this.monthlyActivity = monthlyActivity;
    }

    public Map<String, Long> getCaseTypeDistribution() {
        return caseTypeDistribution;
    }

    public void setCaseTypeDistribution(Map<String, Long> caseTypeDistribution) {
        this.caseTypeDistribution = caseTypeDistribution;
    }

    public double getAverageResponseTime() {
        return averageResponseTime;
    }

    public void setAverageResponseTime(double averageResponseTime) {
        this.averageResponseTime = averageResponseTime;
    }

    public double getFastestResponse() {
        return fastestResponse;
    }

    public void setFastestResponse(double fastestResponse) {
        this.fastestResponse = fastestResponse;
    }

    public double getResolutionRate() {
        return resolutionRate;
    }

    public void setResolutionRate(double resolutionRate) {
        this.resolutionRate = resolutionRate;
    }

    public long getAnonymousReports() {
        return anonymousReports;
    }

    public void setAnonymousReports(long anonymousReports) {
        this.anonymousReports = anonymousReports;
    }

    public long getNamedReports() {
        return namedReports;
    }

    public void setNamedReports(long namedReports) {
        this.namedReports = namedReports;
    }

    public double getAnonymousPercentage() {
        return anonymousPercentage;
    }

    public void setAnonymousPercentage(double anonymousPercentage) {
        this.anonymousPercentage = anonymousPercentage;
    }

    public double getNamedPercentage() {
        return namedPercentage;
    }

    public void setNamedPercentage(double namedPercentage) {
        this.namedPercentage = namedPercentage;
    }

    public double getAnonymousResponseTimeAdvantage() {
        return anonymousResponseTimeAdvantage;
    }

    public void setAnonymousResponseTimeAdvantage(double anonymousResponseTimeAdvantage) {
        this.anonymousResponseTimeAdvantage = anonymousResponseTimeAdvantage;
    }

    public static class MonthlyActivityDTO {
        private String month; // e.g., "Jan", "Feb"
        private int year;
        private long caseCount;

        public MonthlyActivityDTO() {}

        public MonthlyActivityDTO(String month, int year, long caseCount) {
            this.month = month;
            this.year = year;
            this.caseCount = caseCount;
        }

        public String getMonth() {
            return month;
        }

        public void setMonth(String month) {
            this.month = month;
        }

        public int getYear() {
            return year;
        }

        public void setYear(int year) {
            this.year = year;
        }

        public long getCaseCount() {
            return caseCount;
        }

        public void setCaseCount(long caseCount) {
            this.caseCount = caseCount;
        }
    }
}

