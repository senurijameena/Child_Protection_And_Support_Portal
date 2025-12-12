package com.example.childPortal.dto;

import com.example.childPortal.model.Feedback.FeedbackStatus;
import com.example.childPortal.model.Feedback.FeedbackType;
import com.example.childPortal.model.Feedback.Category;
import java.time.LocalDateTime;

public class FeedbackResponseDTO {
    private String id;
    private String caseId;
    private String caseTitle;
    private String userId;
    private String userName;
    private String userRole;
    private String userEmail;
    private FeedbackType type;
    private Category category;
    private String title;
    private String description;
    private Integer rating;
    private FeedbackStatus status;
    private String adminResponse;
    private String adminId;
    private String adminName;
    private LocalDateTime responseDate;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private boolean isAnonymous;
    private boolean isPublic;
    private String message;
    private boolean success;

    public FeedbackResponseDTO() {}

    public FeedbackResponseDTO(String message, boolean success) {
        this.message = message;
        this.success = success;
        this.createdAt = LocalDateTime.now();
    }

    public FeedbackResponseDTO(String caseId, String userId, FeedbackType type, 
                              Category category, String description, Integer rating) {
        this.caseId = caseId;
        this.userId = userId;
        this.type = type;
        this.category = category;
        this.description = description;
        this.rating = rating;
        this.createdAt = LocalDateTime.now();
        this.status = FeedbackStatus.PENDING; 
        this.success = true;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getCaseId() { return caseId; }
    public void setCaseId(String caseId) { this.caseId = caseId; }

    public String getCaseTitle() { return caseTitle; }
    public void setCaseTitle(String caseTitle) { this.caseTitle = caseTitle; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getUserName() { return userName; }
    public void setUserName(String userName) { this.userName = userName; }

    public String getUserRole() { return userRole; }
    public void setUserRole(String userRole) { this.userRole = userRole; }

    public String getUserEmail() { return userEmail; }
    public void setUserEmail(String userEmail) { this.userEmail = userEmail; }

    public FeedbackType getType() { return type; }
    public void setType(FeedbackType type) { this.type = type; }

    public Category getCategory() { return category; }
    public void setCategory(Category category) { this.category = category; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Integer getRating() { return rating; }
    public void setRating(Integer rating) { this.rating = rating; }

    public FeedbackStatus getStatus() { return status; }
    public void setStatus(FeedbackStatus status) { this.status = status; }

    public String getAdminResponse() { return adminResponse; }
    public void setAdminResponse(String adminResponse) { this.adminResponse = adminResponse; }

    public String getAdminId() { return adminId; }
    public void setAdminId(String adminId) { this.adminId = adminId; }

    public String getAdminName() { return adminName; }
    public void setAdminName(String adminName) { this.adminName = adminName; }

    public LocalDateTime getResponseDate() { return responseDate; }
    public void setResponseDate(LocalDateTime responseDate) { this.responseDate = responseDate; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public boolean isAnonymous() { return isAnonymous; }
    public void setAnonymous(boolean anonymous) { isAnonymous = anonymous; }

    public boolean isPublic() { return isPublic; }
    public void setPublic(boolean isPublic) { this.isPublic = isPublic; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public boolean isSuccess() { return success; }
    public void setSuccess(boolean success) { this.success = success; }

    @Override
    public String toString() {
        return "FeedbackResponseDTO{" +
                "id='" + id + '\'' +
                ", caseId='" + caseId + '\'' +
                ", userId='" + userId + '\'' +
                ", type=" + type +
                ", category=" + category +
                ", rating=" + rating +
                ", status=" + status +
                ", createdAt=" + createdAt +
                ", message='" + message + '\'' +
                ", success=" + success +
                '}';
    }
}