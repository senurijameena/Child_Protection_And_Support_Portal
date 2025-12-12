package com.example.childPortal.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.annotation.CreatedDate;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.LocalDateTime;

@Document(collection = "medical_supports")
public class MedicalSupport {
 @Id
 @GeneratedValue(strategy = GenerationType.IDENTITY)
 private Long id;

 @ManyToOne
 private Case case;

 private String hospitalClinicName;
 private String doctorName;
 private String medicalCondition;
 private String treatmentPlan;
 private String specialRequirements;

 @Enumerated(EnumType.STRING)
 private MedicalServiceType type;

 @Enumerated(EnumType.STRING)
 private ServiceStatus status;

 private LocalDate appointmentDate;
 private LocalTime appointmentTime;
 private LocalDate followUpDate;
 private String prescribedMedication;

 @ManyToOne
 private SocialWorker assignedBy;

 @CreatedDate
    private LocalDateTime assignedAt;

  public MedicalSupport() {
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
    
    public String getHospitalClinicName() { 
     return hospitalClinicName; 
    }
    public void setHospitalClinicName(String hospitalClinicName) { 
     this.hospitalClinicName = hospitalClinicName; 
    }
    
    public String getDoctorName() { 
     return doctorName; 
    }
    public void setDoctorName(String doctorName) { 
     this.doctorName = doctorName; 
    }
    
    public String getMedicalCondition() { 
     return medicalCondition; 
    }
    public void setMedicalCondition(String medicalCondition) { 
     this.medicalCondition = medicalCondition; 
    }
    
    public String getTreatmentPlan() { 
     return treatmentPlan; 
    }
    public void setTreatmentPlan(String treatmentPlan) { 
     this.treatmentPlan = treatmentPlan; 
    }
    
    public String getSpecialRequirements() { 
     return specialRequirements; 
    }
    public void setSpecialRequirements(String specialRequirements) {
     this.specialRequirements = specialRequirements; 
    }
    
    public String getType() { 
     return type; 
    }
    public void setType(String type) { 
     this.type = type; 
    }
    
    public String getStatus() { 
     return status; 
    }
    public void setStatus(String status) { 
     this.status = status; 
    }
    
    public LocalDate getAppointmentDate() { 
     return appointmentDate; 
    }
    public void setAppointmentDate(LocalDate appointmentDate) { 
     this.appointmentDate = appointmentDate; 
    }
    
    public LocalTime getAppointmentTime() { 
     return appointmentTime; 
    }
    public void setAppointmentTime(LocalTime appointmentTime) { 
     this.appointmentTime = appointmentTime; 
    }
    
    public LocalDate getFollowUpDate() { 
     return followUpDate; 
    }
    public void setFollowUpDate(LocalDate followUpDate) { 
     this.followUpDate = followUpDate; 
    }
    
    public String getPrescribedMedication() { 
     return prescribedMedication; 
    }
    public void setPrescribedMedication(String prescribedMedication) { 
     this.prescribedMedication = prescribedMedication; 
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
 
}
