package com.example.childPortal.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.annotation.CreatedDate;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Document(collection = "educational_supports")
public class EducationalSupport {
 @Id
 @GeneratedValue(strategy = GenerationType.IDENTITY)
 private Long id;

 @ManyToOne
 private Case case;

 private String schoolName;
 private String gradeLevel;
 private String educationalNeeds;
 private String specialRequirements;

 @Enumerated(EnumType.STRING)
 private SupportType type; 

 @Enumerated(EnumType.STRING)
 private ServiceStatus status;

 private LocalDate startDate;
 private LocalDate endDate;
 private String assignedTutor;
 private String contactPerson;
 private String contactPhone;

 @ManyToOne
 private SocialWorker assignedBy;

 public EducationalSupport() {
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

 
}
