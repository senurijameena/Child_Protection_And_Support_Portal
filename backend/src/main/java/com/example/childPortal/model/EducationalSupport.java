package com.example.childPortal.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Document(collection = "educational_supports")
public class EducationalSupport {

    @Id
    private String id;

    @DBRef
    private Case childCase;
    private String schoolName;
    private String gradeLevel;
    private String educationalNeeds;
    private String specialRequirements;

    private SupportType type; 
    private ServiceStatus status;

    private LocalDate startDate;
    private LocalDate endDate;
    private String assignedTutor;
    private String contactPerson;
    private String contactPhone;

    @DBRef
    private SocialWorker assignedBy;

    private LocalDateTime assignedAt;

    public EducationalSupport() {
        this.assignedAt = LocalDateTime.now();
    }

    public String getId() {
        return id;
    }
    public void setId(String id) {
        this.id = id;
    }

    public Case getChildCase() {
        return childCase;
    }
    public void setChildCase(Case childCase) {
        this.childCase = childCase;
    }

    public String getSchoolName() {
        return schoolName;
    }
    public void setSchoolName(String schoolName) {
        this.schoolName = schoolName;
    }

    public String getGradeLevel() {
        return gradeLevel;
    }
    public void setGradeLevel(String gradeLevel) {
        this.gradeLevel = gradeLevel;
    }

    public String getEducationalNeeds() {
        return educationalNeeds;
    }
    public void setEducationalNeeds(String educationalNeeds) {
        this.educationalNeeds = educationalNeeds;
    }

    public String getSpecialRequirements() {
        return specialRequirements;
    }
    public void setSpecialRequirements(String specialRequirements) {
        this.specialRequirements = specialRequirements;
    }

    public SupportType getType() {
        return type;
    }
    public void setType(SupportType type) {
        this.type = type;
    }

    public ServiceStatus getStatus() {
        return status;
    }
    public void setStatus(ServiceStatus status) {
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

    public String getAssignedTutor() {
        return assignedTutor;
    }
    public void setAssignedTutor(String assignedTutor) {
        this.assignedTutor = assignedTutor;
    }

    public String getContactPerson() {
        return contactPerson;
    }
    public void setContactPerson(String contactPerson) {
        this.contactPerson = contactPerson;
    }

    public String getContactPhone() {
        return contactPhone;
    }
    public void setContactPhone(String contactPhone) {
        this.contactPhone = contactPhone;
    }

    public SocialWorker getAssignedBy() {
        return assignedBy;
    }
    public void setAssignedBy(SocialWorker assignedBy) {
        this.assignedBy = assignedBy;
    }

    public LocalDateTime getAssignedAt() {
        return assignedAt;
    }
    public void setAssignedAt(LocalDateTime assignedAt) {
        this.assignedAt = assignedAt;
    }

    @Override
    public String toString() {
        return "EducationalSupport{" +
                "id='" + id + '\'' +
                ", childCase=" + (childCase != null ? childCase.getId() : null) +
                ", schoolName='" + schoolName + '\'' +
                ", gradeLevel='" + gradeLevel + '\'' +
                ", educationalNeeds='" + educationalNeeds + '\'' +
                ", specialRequirements='" + specialRequirements + '\'' +
                ", type=" + type +
                ", status=" + status +
                ", startDate=" + startDate +
                ", endDate=" + endDate +
                ", assignedTutor='" + assignedTutor + '\'' +
                ", contactPerson='" + contactPerson + '\'' +
                ", contactPhone='" + contactPhone + '\'' +
                ", assignedBy=" + (assignedBy != null ? assignedBy.getId() : null) +
                ", assignedAt=" + assignedAt +
                '}';
    }
}
