package com.example.childPortal.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "police_officers")
public class PoliceOfficer {
    @Id
    private String id;
    private String userId;
    private String badgeNumber;
    private String department;
    private String rank;
    private String stationAddress;
    private String idDocumentUrl;

    public PoliceOfficer() {}

    public PoliceOfficer(String userId, String badgeNumber, String department, String rank, String stationAddress, String idDocumentUrl) {
        this.userId = userId;
        this.badgeNumber = badgeNumber;
        this.department = department;
        this.rank = rank;
        this.stationAddress = stationAddress;
        this.idDocumentUrl = idDocumentUrl;
    }

    public String getId() { 
        return id; 
    }
    public void setId(String id) { 
        this.id = id; 
    }

    public String getUserId() { 
        return userId; 
    }
    public void setUserId(String userId) {
         this.userId = userId; 
    }

    public String getBadgeNumber() { 
        return badgeNumber; 
    }
    public void setBadgeNumber(String badgeNumber) { 
        this.badgeNumber = badgeNumber; 
    }

    public String getDepartment() { 
        return department; 
    }
    public void setDepartment(String department) { 
        this.department = department; 
    }

    public String getRank() { 
        return rank; 
    }
    public void setRank(String rank) { 
        this.rank = rank; 
    }

    public String getStationAddress() { 
        return stationAddress; 
    }
    public void setStationAddress(String stationAddress) { 
        this.stationAddress = stationAddress; 
    }

    public String getIdDocumentUrl() { 
        return idDocumentUrl; 
    }
    public void setIdDocumentUrl(String idDocumentUrl) { 
        this.idDocumentUrl = idDocumentUrl; 
    }
}
