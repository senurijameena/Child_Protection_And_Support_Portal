package com.example.childPortal.service;

import com.example.childPortal.model.FollowUp;
import com.example.childPortal.repository.FollowUpRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class FollowUpService {

    @Autowired
    private FollowUpRepository followUpRepository;

    public List<FollowUp> getFollowUpsByWorker(String workerId) {
        return followUpRepository.findBySocialWorkerId(workerId);
    }

    public FollowUp createFollowUp(FollowUp followUp) {
        followUp.setCreatedAt(LocalDateTime.now());
        followUp.setUpdatedAt(LocalDateTime.now());
        return followUpRepository.save(followUp);
    }

    public FollowUp updateFollowUp(String id, FollowUp followUpDetails) {
        Optional<FollowUp> optionalFollowUp = followUpRepository.findById(id);
        if (optionalFollowUp.isPresent()) {
            FollowUp existingFollowUp = optionalFollowUp.get();

            if (followUpDetails.getChildName() != null)
                existingFollowUp.setChildName(followUpDetails.getChildName());
            if (followUpDetails.getType() != null)
                existingFollowUp.setType(followUpDetails.getType());
            if (followUpDetails.getStatus() != null)
                existingFollowUp.setStatus(followUpDetails.getStatus());
            if (followUpDetails.getPriority() != null)
                existingFollowUp.setPriority(followUpDetails.getPriority());
            if (followUpDetails.getScheduledDate() != null)
                existingFollowUp.setScheduledDate(followUpDetails.getScheduledDate());
            if (followUpDetails.getNotes() != null)
                existingFollowUp.setNotes(followUpDetails.getNotes());
            if (followUpDetails.getMissedReason() != null)
                existingFollowUp.setMissedReason(followUpDetails.getMissedReason());

            existingFollowUp.setUpdatedAt(LocalDateTime.now());
            return followUpRepository.save(existingFollowUp);
        }
        return null; // Or throw exception
    }

    public void deleteFollowUp(String id) {
        followUpRepository.deleteById(id);
    }
}
