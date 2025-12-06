package com.example.childPortal.repository;

import com.example.childPortal.model.HelpRequestTransfer;
import com.example.childPortal.model.HelpRequestTransfer.TransferStatus;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;
import java.util.Optional;

public interface HelpRequestTransferRepository extends MongoRepository<HelpRequestTransfer, String> {
 List<HelpRequestTransfer> findByCurrentSocialWorkerId(String socialWorkerId);
 List<HelpRequestTransfer> findByRequestedSocialWorkerId(String socialWorkerId);
 List<HelpRequestTransfer> findByStatus(TransferStatus status);
 Optional<HelpRequestTransfer> findByHelpRequestId(String helpRequestId);
 List<HelpRequestTransfer> findByUrgent(boolean urgent);
}
