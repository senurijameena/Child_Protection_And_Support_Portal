package com.example.childPortal.model;
@Entity
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
}
