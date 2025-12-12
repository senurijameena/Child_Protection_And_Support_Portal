package com.example.childPortal.dto;

import com.example.childPortal.model.Role;

public class LoginResponse {
    private String token;
    private String email;
    private Role role;
    private boolean approved;
    private String message;

    public LoginResponse() {}
    public LoginResponse(String token, String email, Role role, boolean approved, String message) {
        this.token = token;
        this.email = email;
        this.role = role;
        this.approved = approved;
        this.message = message;
    }

    public String getToken() { 
        return token; 
    }
    public void setToken(String token) { 
        this.token = token; 
    }

    public String getEmail() { 
        return email; 
    }
    public void setEmail(String email) {
         this.email = email; 
    }

    public Role getRole() {
         return role; 
    }
    public void setRole(Role role) { 
        this.role = role; 
    }

    public boolean isApproved() { 
        return approved; 
    }
    public void setApproved(boolean approved) { 
        this.approved = approved; 
    }

    public String getMessage() { 
        return message; 
    }
    public void setMessage(String message) { 
        this.message = message; 
    }
}