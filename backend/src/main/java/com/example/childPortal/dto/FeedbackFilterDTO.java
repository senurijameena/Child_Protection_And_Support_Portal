package com.example.childPortal.dto;

import com.example.childPortal.model.Feedback.FeedbackType; import com.example.childPortal.model.Feedback.Category;
import com.example.childPortal.model.Feedback.FeedbackStatus; import java.time.LocalDateTime;
public class FeedbackFilterDTO { 
  private String caseId;
  private String helpRequestId; 
  private String userId;
  private FeedbackType feedbackType; 
  private Category category;
  private FeedbackStatus status; 
  private Integer rating;
  private Integer minRating;
  private Integer maxRating;
  private LocalDateTime startDate;
  private LocalDateTime endDate;
  private boolean anonymousOnly;
  private String searchText;
  private String sortBy;
  private int page;
  private int pageSize;
  
  public FeedbackFilterDTO() { 
    this.page = 0; 
    this.pageSize = 20; 
    this.sortBy = "date_desc";
  }

  public String getCaseId() { 
    return caseId; 
  }
  public void setCaseId(String caseId) {
    this.caseId = caseId; 
  }
  public String getHelpRequestId() {
    return helpRequestId; 
  }
  public void setHelpRequestId(String helpRequestId) {
    this.helpRequestId = helpRequestId; 
  }
  public String getUserId() {
    return userId; 
  }
  public void setUserId(String userId) { 
    this.userId = userId; 
  }
  public FeedbackType getFeedbackType() { 
    return feedbackType; 
  }
  public void setFeedbackType(FeedbackType feedbackType) { 
    this.feedbackType = feedbackType; 
  }
  public Category getCategory() { 
    return category; 
  }
  public void setCategory(Category category) {
    this.category = category; 
  }
  public FeedbackStatus getStatus() {
    return status; 
  }
  public void setStatus(FeedbackStatus status) {
    this.status = status;
  }
  public Integer getRating() {
    return rating;
  }
  public void setRating(Integer rating) { 
    this.rating = rating;
  }
  public Integer getMinRating() { 
    return minRating; 
  }
  public void setMinRating(Integer minRating) { 
    this.minRating = minRating; 
  }
  public Integer getMaxRating() { 
    return maxRating; 
  }
  public void setMaxRating(Integer maxRating) {
    this.maxRating = maxRating; 
  }
  public LocalDateTime getStartDate() {
    return startDate; 
  }
  public void setStartDate(LocalDateTime startDate) { 
    this.startDate = startDate; 
  }
  public LocalDateTime getEndDate() { 
    return endDate; 
  }
  public void setEndDate(LocalDateTime endDate) {
    this.endDate = endDate;
  }
  public boolean isAnonymousOnly() {
    return anonymousOnly;
  }
  public void setAnonymousOnly(boolean anonymousOnly) { 
    this.anonymousOnly = anonymousOnly;
  }
  public String getSearchText() { 
    return searchText; 
  }
  public void setSearchText(String searchText) {
    this.searchText = searchText; 
  }
  public String getSortBy() {
    return sortBy; 
  }
  public void setSortBy(String sortBy) {
    this.sortBy = sortBy;
  }
  public int getPage() { 
    return page; 
  }
  public void setPage(int page) { 
    this.page = page;
  }
  public int getPageSize() { 
    return pageSize;
  }
  public void setPageSize(int pageSize) { 
    this.pageSize = pageSize; 
  } 
}

