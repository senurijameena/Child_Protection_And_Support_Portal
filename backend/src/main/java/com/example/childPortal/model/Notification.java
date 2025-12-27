package com.example.childPortal.model;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document; 
import java.time.LocalDateTime;

@Document(collection = "notifications") 
  public class Notification {
    @Id
    private String id;
