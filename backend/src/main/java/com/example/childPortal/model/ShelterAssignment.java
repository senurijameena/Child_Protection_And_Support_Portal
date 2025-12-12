package com.example.childPortal.model;

import javax.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Document(collection = "shelter_assignments")
public class ShelterAssignment {
 @Id
 @GeneratedValue(strategy = GenerationType.IDENTITY)
 private String id;

 @ManyToOne
 private Case case;

 @ManyToOne
 private ShelterFacility shelter;

 private Integer durationDays; 
 private String specialConditions;
 private String capacityAvailable;
 private String roomType; 

 @Enumerated(EnumType.STRING)
 private ServiceStatus status;

 private LocalDate startDate;
 private LocalDate endDate;
 private LocalDateTime assignedAt;

 @ManyToOne
 private SocialWorker assignedBy;

 public ShelterAssignment() {
        this.assignedAt = LocalDateTime.now();
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
 public ShelterFacility getShelter() {
        return shelter;
 }
 public void setShelter(ShelterFacility shelter) {
        this.shelter = shelter;
 }
 public Integer getDurationDays() {
        return durationDays;
 }
 public void setDurationDays(Integer durationDays) {
        this.durationDays = durationDays;
  }
 public String getSpecialConditions() {
        return specialConditions;
  }
 public void setSpecialConditions(String specialConditions) {
        this.specialConditions = specialConditions;
  }
 public String getCapacityAvailable() {
        return capacityAvailable;
  }
 public void setCapacityAvailable(String capacityAvailable) {
        this.capacityAvailable = capacityAvailable;
 }
  public String getRoomType() {
        return roomType;
  }
 public void setRoomType(String roomType) {
        this.roomType = roomType;
 }
 public String getStatus() {
        return status;
 }
 public void setStatus(String status) {
        this.status = status;
 }
 public LocalDate getStartDate() {
        return startDate;
 }
 public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
 }
 public LocalDate getEndDate() {
        return endDate;
 }
 public void setEndDate(LocalDate endDate) {
        this.endDate = endDate;
 }
 public LocalDateTime getAssignedAt() {
        return assignedAt;
 }
 public void setAssignedAt(LocalDateTime assignedAt) {
        this.assignedAt = assignedAt;
 }
 public SocialWorker getAssignedBy() {
        return assignedBy;
 }
 public void setAssignedBy(SocialWorker assignedBy) {
        this.assignedBy = assignedBy;
 }
 @Override
    public String toString() {
        return "ShelterAssignment{" +
                "id='" + id + '\'' +
                ", case=" + (case != null ? case.getId() : null) +
                ", shelter=" + (shelter != null ? shelter.getId() : null) +
                ", durationDays=" + durationDays +
                ", specialConditions='" + specialConditions + '\'' +
                ", capacityAvailable='" + capacityAvailable + '\'' +
                ", roomType='" + roomType + '\'' +
                ", status='" + status + '\'' +
                ", startDate=" + startDate +
                ", endDate=" + endDate +
                ", assignedAt=" + assignedAt +
                ", assignedBy=" + (assignedBy != null ? assignedBy.getId() : null) +
                '}';
    }
}
