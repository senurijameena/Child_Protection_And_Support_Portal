package com.example.childPortal.dto;
import com.example.childPortal.model.Role;

public class LoginResponse {
    private String token;
    private String userId;
    private String email;
    private Role role;
    private boolean approved;
    private String message;

    public LoginResponse() {}
    public LoginResponse(String token, String userId, String email, Role role, boolean approved) {
        this.token = token;
        this.userId = userId;
        this.email = email;
        this.role = role;
        this.approved = approved;
        this.message = approved ? "Login successful" : "Account pending approval";
    }

    // Getters and setters
    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }
    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }
    public boolean isApproved() { return approved; }
    public void setApproved(boolean approved) { this.approved = approved; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
}