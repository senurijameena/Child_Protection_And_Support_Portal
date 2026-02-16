package com.example.childPortal.model;

/**
 * Follow-up status flow. Stored in DB as string (e.g. status field).
 */
public enum FollowUpStatus {
    SCHEDULED,
    COMPLETED,
    MISSED,
    RESCHEDULED
}
