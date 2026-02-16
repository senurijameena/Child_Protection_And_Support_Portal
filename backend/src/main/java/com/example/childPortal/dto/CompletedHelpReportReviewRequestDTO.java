package com.example.childPortal.dto;

public class CompletedHelpReportReviewRequestDTO {
    private String action; // APPROVE | CLARIFICATION | REOPEN
    private String note;

    public String getAction() {
        return action;
    }

    public void setAction(String action) {
        this.action = action;
    }

    public String getNote() {
        return note;
    }

    public void setNote(String note) {
        this.note = note;
    }
}
