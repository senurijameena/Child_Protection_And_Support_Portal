package com.example.childPortal.repository;

import com.example.childPortal.model.HelpRequestCollaboration;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface HelpRequestCollaborationRepository extends MongoRepository<HelpRequestCollaboration, String> {
    List<HelpRequestCollaboration> findByHelpRequestIdOrderByRequestedAtDesc(String helpRequestId);

    List<HelpRequestCollaboration> findByCollaboratorUserIdAndStatusOrderByRequestedAtDesc(
            String collaboratorUserId,
            HelpRequestCollaboration.Status status
    );

    Optional<HelpRequestCollaboration> findByHelpRequestIdAndCollaboratorUserIdAndStatusIn(
            String helpRequestId,
            String collaboratorUserId,
            List<HelpRequestCollaboration.Status> statuses
    );
}
