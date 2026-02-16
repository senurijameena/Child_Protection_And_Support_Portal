package com.example.childPortal.dto;

import java.util.Map;

public class UserStatisticsDTO {
    private long totalUsers;
    private long activeUsers;
    private long pendingUsers;
    private long suspendedUsers;
    private Map<String, Long> usersByRole;
    private long totalPoliceOfficers;
    private long totalSocialWorkers;
    private long totalPublicUsers;
    private long totalAdmins;

    public long getTotalUsers() {
        return totalUsers;
    }

    public void setTotalUsers(long totalUsers) {
        this.totalUsers = totalUsers;
    }

    public long getActiveUsers() {
        return activeUsers;
    }

    public void setActiveUsers(long activeUsers) {
        this.activeUsers = activeUsers;
    }

    public long getPendingUsers() {
        return pendingUsers;
    }

    public void setPendingUsers(long pendingUsers) {
        this.pendingUsers = pendingUsers;
    }

    public long getSuspendedUsers() {
        return suspendedUsers;
    }

    public void setSuspendedUsers(long suspendedUsers) {
        this.suspendedUsers = suspendedUsers;
    }

    public Map<String, Long> getUsersByRole() {
        return usersByRole;
    }

    public void setUsersByRole(Map<String, Long> usersByRole) {
        this.usersByRole = usersByRole;
    }

    public long getTotalPoliceOfficers() {
        return totalPoliceOfficers;
    }

    public void setTotalPoliceOfficers(long totalPoliceOfficers) {
        this.totalPoliceOfficers = totalPoliceOfficers;
    }

    public long getTotalSocialWorkers() {
        return totalSocialWorkers;
    }

    public void setTotalSocialWorkers(long totalSocialWorkers) {
        this.totalSocialWorkers = totalSocialWorkers;
    }

    public long getTotalPublicUsers() {
        return totalPublicUsers;
    }

    public void setTotalPublicUsers(long totalPublicUsers) {
        this.totalPublicUsers = totalPublicUsers;
    }

    public long getTotalAdmins() {
        return totalAdmins;
    }

    public void setTotalAdmins(long totalAdmins) {
        this.totalAdmins = totalAdmins;
    }
}

