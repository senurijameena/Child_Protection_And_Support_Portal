package com.example.childPortal.model;

@Entity
public class ShelterAssignment {
 @Id
 @GeneratedValue(strategy = GenerationType.IDENTITY)
 private Long id;

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
}
