package com.example.childPortal.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.mongodb.core.mapping.DocumentReference;
import java.time.LocalDateTime;
import java.util.List;

@Document(collection = "social_worker_calendars")
public class SocialWorkerCalendar {

    @Id
    private String id;

    @DBRef
    private SocialWorker socialWorker;

    @DocumentReference(lazy = true)
    private List<CalendarEvent> events;
    
    private String calendarTheme;
    private String workingHours; // e.g., "9:00-17:00"
    private boolean showWeekends;
    
    @CreatedDate
    private LocalDateTime createdAt;

    public SocialWorkerCalendar() {
        this.createdAt = LocalDateTime.now();
    }

    public String getId() { 
      return id; 
    }
    public void setId(String id) { 
      this.id = id; 
    }
    
    public SocialWorker getSocialWorker() { 
      return socialWorker; 
    }
    public void setSocialWorker(SocialWorker socialWorker) { 
      this.socialWorker = socialWorker; 
    }
    
    public List<CalendarEvent> getEvents() { 
      return events; 
    }
    public void setEvents(List<CalendarEvent> events) { 
      this.events = events; 
    }
    
    public String getCalendarTheme() { 
      return calendarTheme; 
    }
    public void setCalendarTheme(String calendarTheme) { 
      this.calendarTheme = calendarTheme; 
    }
    
    public String getWorkingHours() { 
      return workingHours; 
    }
    public void setWorkingHours(String workingHours) { 
      this.workingHours = workingHours; 
    }
    
    public boolean isShowWeekends() { 
      return showWeekends; 
    }
    public void setShowWeekends(boolean showWeekends) { 
      this.showWeekends = showWeekends; 
    }
    
    public LocalDateTime getCreatedAt() { 
      return createdAt; 
    }
    public void setCreatedAt(LocalDateTime createdAt) { 
      this.createdAt = createdAt; 
    }
}
