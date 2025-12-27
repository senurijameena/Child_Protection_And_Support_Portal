package com.example.childPortal.model;
import java.time.DayOfWeek;
import java.time.LocalTime;
import java.util.Map;
public class WorkSchedule {
    private Map<DayOfWeek, Shift> weeklySchedule;
    private boolean availableOnWeekends;
    private boolean availableOnHolidays;
    private String timezone;
public static class Shift {
      private LocalTime startTime;
    private LocalTime endTime;
    private boolean available;

  public LocalTime getStartTime() { 
    return startTime;
  }
  public void setStartTime(LocalTime startTime) {
    this.startTime = startTime; 
  } 
  public LocalTime getEndTime() {
    return endTime; 
  }
  public void setEndTime(LocalTime endTime) { 
    this.endTime = endTime; 
  }
  public boolean isAvailable() {
    return available; 
  }
  public void setAvailable(boolean available) { 
    this.available = available;
  }
}
  public Map<DayOfWeek, Shift> getWeeklySchedule() { 
    return weeklySchedule; 
  } 
  public void setWeeklySchedule(Map<DayOfWeek, Shift> weeklySchedule) {
    this.weeklySchedule = weeklySchedule;
  }
  public boolean isAvailableOnWeekends() { 
    return availableOnWeekends; 
  } 
  public void setAvailableOnWeekends(boolean availableOnWeekends) {
    this.availableOnWeekends = availableOnWeekends; 
  }
  public boolean isAvailableOnHolidays() { 
    return availableOnHolidays; 
  } 
  public void setAvailableOnHolidays(boolean availableOnHolidays) {
    this.availableOnHolidays = availableOnHolidays;
  }
  public String getTimezone() { 
    return timezone;
  }
  public void setTimezone(String timezone) { 
    this.timezone = timezone; 
  }
  public boolean isCurrentlyAvailable() {
    DayOfWeek today = DayOfWeek.from(java.time.LocalDate.now());
    Shift todayShift = weeklySchedule.get(today);
    if (todayShift == null || !todayShift.isAvailable()) { 
      return false;
      }
    LocalTime now = LocalTime.now();
    return !now.isBefore(todayShift.getStartTime()) &&
      !now.isAfter(todayShift.getEndTime());
  }
}
