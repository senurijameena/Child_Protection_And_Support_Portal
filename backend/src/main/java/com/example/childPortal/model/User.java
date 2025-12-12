package com.example.childPortal.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;
import java.time.LocalDateTime;

@Document(collection = "users")
public class User {
    @Id
    private String id;

    private String fullName;

    @Indexed(unique = true)
    private String email;

    private String phone;
    private String password;
    private Role role;
    private String officialIdFile;
    private String certificationFile;
    private boolean approved;
    private boolean termsAccepted;
    private LocalDateTime submissionDate;
    private String status;
    private LocalDateTime lastLogin;
    private boolean active;
    private String deactivationReason;
    private LocalDateTime deactivationDate;

    public User() {}

    public User(String fullName, String email, String phone, String password, Role role) {
        this.fullName = fullName;
        this.email = email;
        this.phone = phone;
        this.password = password;
        this.role = role;
        this.approved = (role == Role.PU || role == Role.ADMIN);
        this.active = true;
        this.submissionDate = LocalDateTime.now();
        this.status = this.approved ? "APPROVED" : "PENDING";
    }

    // Getters and setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }

    public String getOfficialIdFile() { return officialIdFile; }
    public void setOfficialIdFile(String officialIdFile) { this.officialIdFile = officialIdFile; }

    public String getCertificationFile() { return certificationFile; }
    public void setCertificationFile(String certificationFile) { this.certificationFile = certificationFile; }

    public boolean isApproved() { return approved; }
    public void setApproved(boolean approved) { this.approved = approved; }

    public boolean isTermsAccepted() { return termsAccepted; }
    public void setTermsAccepted(boolean termsAccepted) { this.termsAccepted = termsAccepted; }

    public LocalDateTime getSubmissionDate() { return submissionDate; }
    public void setSubmissionDate(LocalDateTime submissionDate) { this.submissionDate = submissionDate; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getLastLogin() { return lastLogin; }
    public void setLastLogin(LocalDateTime lastLogin) { this.lastLogin = lastLogin; }

    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }

    public String getDeactivationReason() { return deactivationReason; }
    public void setDeactivationReason(String deactivationReason) { this.deactivationReason = deactivationReason; }

    public LocalDateTime getDeactivationDate() { return deactivationDate; }
    public void setDeactivationDate(LocalDateTime deactivationDate) { this.deactivationDate = deactivationDate; }
}
