package com.example.childPortal.dto;

import com.example.childPortal.model.AppointmentStatus;
import java.util.List;

public class TodayAppointmentsDTO {
    private List<AppointmentDetailDTO> appointments;
    private int totalAppointments;
    private int completedCount;
    private int pendingCount;
    private int overdueCount;

    public TodayAppointmentsDTO() {}
 
    public TodayAppointmentsDTO(List<AppointmentDetailDTO> appointments, int totalAppointments, 
                                int completedCount, int pendingCount, int overdueCount) {
        this.appointments = appointments;
        this.totalAppointments = totalAppointments;
        this.completedCount = completedCount;
        this.pendingCount = pendingCount;
        this.overdueCount = overdueCount;
    }

    public List<AppointmentDetailDTO> getAppointments() {
        return appointments;
    }

    public void setAppointments(List<AppointmentDetailDTO> appointments) {
        this.appointments = appointments;
    }

    public int getTotalAppointments() {
        return totalAppointments;
    }

    public void setTotalAppointments(int totalAppointments) {
        this.totalAppointments = totalAppointments;
    }

    public int getCompletedCount() {
        return completedCount;
    }

    public void setCompletedCount(int completedCount) {
        this.completedCount = completedCount;
    }

    public int getPendingCount() {
        return pendingCount;
    }

    public void setPendingCount(int pendingCount) {
        this.pendingCount = pendingCount;
    }

    public int getOverdueCount() {
        return overdueCount;
    }

    public void setOverdueCount(int overdueCount) {
        this.overdueCount = overdueCount;
    }

    public void calculateCounts() {
        this.totalAppointments = appointments != null ? appointments.size() : 0;
        this.completedCount = (int) (appointments != null ? 
            appointments.stream().filter(a -> a.getStatus() == AppointmentStatus.COMPLETED).count() : 0);
        this.pendingCount = (int) (appointments != null ? 
            appointments.stream().filter(a -> a.getStatus() == AppointmentStatus.SCHEDULED || 
                                              a.getStatus() == AppointmentStatus.IN_PROGRESS).count() : 0);
        this.overdueCount = (int) (appointments != null ? 
            appointments.stream().filter(a -> a.isOverdue()).count() : 0);
    }

    @Override
    public String toString() {
        return "TodayAppointmentsDTO{" +
                "appointments=" + (appointments != null ? appointments.size() : 0) +
                ", totalAppointments=" + totalAppointments +
                ", completedCount=" + completedCount +
                ", pendingCount=" + pendingCount +
                ", overdueCount=" + overdueCount +
                '}';
    }

    public enum AppointmentStatus {
        SCHEDULED,
        IN_PROGRESS,
        COMPLETED
    }
}
