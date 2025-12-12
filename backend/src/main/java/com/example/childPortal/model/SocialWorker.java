package com.example.childPortal.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.util.List;

@Document(collection = "social_workers")
public class SocialWorker {
    @Id
    private String id;
    private String userId;
    private String licenseNumber;
    private List<String> specializations;
    private String organization;
    private String yearsOfExperience;
    private String certificationUrl;

    public SocialWorker() {}

    public SocialWorker(String userId, String licenseNumber, List<String> specializations, String organization, String yearsOfExperience, String certificationUrl) {
        this.userId = userId;
        this.licenseNumber = licenseNumber;
        this.specializations = specializations;
        this.organization = organization;
        this.yearsOfExperience = yearsOfExperience;
        this.certificationUrl = certificationUrl;
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
    public void setUserId(String userId) { this.userId = userId; 

    }

    public String getLicenseNumber() { 
        return licenseNumber; }
    public void setLicenseNumber(String licenseNumber) { 
        this.licenseNumber = licenseNumber; 
    }

    public List<String> getSpecializations() { 
        return specializations; 
    }
    public void setSpecializations(List<String> specializations) { 
        this.specializations = specializations; 
    }

    public String getOrganization() { 
        return organization; 
    }
    public void setOrganization(String organization) { 
        this.organization = organization; 
    }

    public String getYearsOfExperience() { 
        return yearsOfExperience; 
    }
    public void setYearsOfExperience(String yearsOfExperience) { 
        this.yearsOfExperience = yearsOfExperience; 
    }

    public String getCertificationUrl() { 
        return certificationUrl; 
    }
    public void setCertificationUrl(String certificationUrl) { 
        this.certificationUrl = certificationUrl; 
    }
}
