package com.example.childPortal.model;

public enum NoteType {
    GENERAL("General Note"),
    INVESTIGATION("Investigation Update"),
    EVIDENCE("Evidence Note"),
    LEGAL("Legal Note"),
    FOLLOW_UP("Follow-up Note"),
    MEDICAL("Medical Note"),
    COUNSELING("Counseling Session"),
    SHELTER("Shelter Placement"),
    EDUCATION("Education Support"),
    OTHER("Other");
    
    private final String displayName;
    
    NoteType(String displayName) {
        this.displayName = displayName;
    }
    
    public String getDisplayName() {
        return displayName;
    }
}
