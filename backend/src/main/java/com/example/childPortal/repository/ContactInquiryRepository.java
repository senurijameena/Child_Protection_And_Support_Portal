package com.example.childPortal.repository;

import com.example.childPortal.model.ContactInquiry;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface ContactInquiryRepository extends MongoRepository<ContactInquiry, String> {
}
