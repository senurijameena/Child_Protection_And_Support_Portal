package com.example.childPortal.service;

import com.example.childPortal.model.User;
import com.example.childPortal.dto.RegisterRequest;
import com.example.childPortal.dto.LoginResponse;
import java.util.List;
import java.util.Optional;

public interface UserService {
    LoginResponse registerUser(RegisterRequest request);
    LoginResponse loginUser(String email, String password);
    List<User> getPendingApprovals();
    boolean approveUser(String userId);
    boolean rejectUser(String userId);
    Optional<User> getUserById(String userId);
    List<User> getAllUsers();
}