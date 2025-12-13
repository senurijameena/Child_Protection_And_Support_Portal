package com.example.childPortal.service;

import com.example.childPortal.dto.*;
import com.example.childPortal.model.User;
import java.util.List;
import java.util.Map;
import java.util.Optional;

public interface UserService {
    LoginResponse registerUser(RegisterRequest request);
    LoginResponse loginUser(LoginRequest request);
    Optional<User> getUserById(String userId);
    UserDTO getUserProfile(String userId);
    List<User> getPendingApprovals();
    List<User> getUsersByRole(String role);
    List<User> getUsersByStatus(String status);
    boolean approveUser(String userId);
    boolean rejectUser(String userId);
    boolean updateUser(String userId, UserDTO userDTO);
    boolean deactivateUser(String userId);
    boolean activateUser(String userId);
    List<UserDTO> getAllUsers();
    List<User> getAllUsersAsEntities();
    
    // Management methods
    List<UserManagementDTO> getAllUsersForManagement();
    UserManagementDTO getUserForManagement(String userId);
    boolean deactivateUser(String userId, String reason);
    boolean updateUserDetails(String userId, UserUpdateRequest updateRequest);
    List<UserManagementDTO> getUsersByRoleForManagement(String role);
    List<UserManagementDTO> getActiveUsers();
    List<UserManagementDTO> getInactiveUsers();
    UserManagementDTO convertToUserManagementDTO(User user);
    Map<String, Long> getUserStatistics();
}