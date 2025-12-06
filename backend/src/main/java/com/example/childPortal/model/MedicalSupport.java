package com.example.childPortal.model;
@Entity
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
}
