package com.example.childPortal.service;

import com.example.childPortal.dto.LoginRequest;
import com.example.childPortal.dto.LoginResponse;
import com.example.childPortal.dto.RegisterRequest;
import com.example.childPortal.dto.UserDTO;
import com.example.childPortal.model.User;
import java.util.List;
import java.util.Optional;

public interface UserService {
    LoginResponse registerUser(RegisterRequest request);
    LoginResponse loginUser(LoginRequest request);
    Optional<User> getUserById(String userId);
    UserDTO getUserProfile(String userId);
    List<User> getPendingApprovals();
    List<User> getUsersByRole(String role);
    boolean approveUser(String userId);
    boolean rejectUser(String userId);
    boolean updateUser(String userId, UserDTO userDTO);
    boolean deactivateUser(String userId);
    boolean activateUser(String userId);
    List<UserDTO> getAllUsers();
}