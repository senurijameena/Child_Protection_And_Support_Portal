
package com.example.childPortal.repository;

import com.example.childPortal.model.User;
import com.example.childPortal.model.Role;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;
import java.util.Optional;

public interface UserRepository extends MongoRepository<User, String> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    List<User> findByRoleAndApproved(Role role, boolean approved);
    List<User> findByApproved(boolean approved);
    List<User> findByRole(Role role);
    List<User> findByStatus(String status);
}