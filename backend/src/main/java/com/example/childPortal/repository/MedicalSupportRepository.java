package com.example.childPortal.repository;

import com.example.childPortal.model.MedicalSupport;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.time.LocalDate;
import java.util.List;

public interface MedicalSupportRepository extends MongoRepository<MedicalSupport, String> {
    List<MedicalSupport> findByAssignedById(String socialWorkerId);
    List<MedicalSupport> findByCaseId(String caseId);
    List<MedicalSupport> findByAppointmentDate(LocalDate date);
    List<MedicalSupport> findByStatus(String status);
}
