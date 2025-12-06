package com.example.childPortal.model;

@Entity
public class CounselingSession {
 @Id
 @GeneratedValue(strategy = GenerationType.IDENTITY)
 private Long id;

 @ManyToOne
 private Case case;

 private LocalDate sessionDate;
 private LocalTime sessionTime;

 @Enumerated(EnumType.STRING)
 private SessionMode mode;

 private String notes;
 private String specialInstructions;

 @Enumerated(EnumType.STRING)
 private SessionStatus status;
RESCHEDULED

 @ManyToOne
 private SocialWorker scheduledBy;
 private LocalDateTime scheduledAt;
}
