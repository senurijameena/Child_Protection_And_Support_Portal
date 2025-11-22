package com.example.childPortal.dto;

import com.example.childPortal.model.Role;

public class RegisterRequest {
    private String fullName;
    private String email;
    private String phone;
    private String password;
    private String confirmPassword;
    private Role role;
    private String officialIdFile;
    private String certificationFile;
    private boolean termsAccepted;

    public RegisterRequest() {}

    public String getFullName() { 
        return fullName; 
    }
    public void setFullName(String fullName) { 
        this.fullName = fullName; 
    }

    public String getEmail() { 
        return email; 
    }
    public void setEmail(String email) { 
        this.email = email; 
    }

    public String getPhone() {
         return phone; 
    }
    public void setPhone(String phone) { 
        this.phone = phone; 
    }

    public String getPassword() { 
        return password; 
    }
    public void setPassword(String password) { 
        this.password = password; 
    }

    public String getConfirmPassword() { 
        return confirmPassword; 
    }
    public void setConfirmPassword(String confirmPassword) { 
        this.confirmPassword = confirmPassword; 
    }

    public Role getRole() {
         return role; 
    }
    public void setRole(Role role) {
         this.role = role; 
    }

    public String getOfficialIdFile() {
         return officialIdFile; 
    }
    public void setOfficialIdFile(String officialIdFile) {
         this.officialIdFile = officialIdFile; 
    }

    public String getCertificationFile() {
         return certificationFile; 
    }
    public void setCertificationFile(String certificationFile) {
         this.certificationFile = certificationFile; 
    }

    public boolean isTermsAccepted() {
         return termsAccepted; 
    }
    public void setTermsAccepted(boolean termsAccepted) {
         this.termsAccepted = termsAccepted; 
    }
}