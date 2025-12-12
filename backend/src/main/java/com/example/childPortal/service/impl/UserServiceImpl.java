package com.example.childPortal.service.impl;

import com.example.childPortal.dto.*;
import com.example.childPortal.model.*;
import com.example.childPortal.repository.*;
import com.example.childPortal.security.JwtUtil;
import com.example.childPortal.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.*;

@Service
public class UserServiceImpl implements UserService {

    @Autowired private UserRepository userRepository;
    @Autowired private PoliceOfficerRepository policeOfficerRepository;
    @Autowired private SocialWorkerRepository socialWorkerRepository;
    @Autowired private PasswordEncoder passwordEncoder;
    @Autowired private JwtUtil jwtUtil;

    @Override
    public LoginResponse registerUser(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            return new LoginResponse(null, "Email already exists", false);
        }

        User user = new User();
        user.setFullName(request.getFullName());
        user.setEmail(request.getEmail());
        user.setPhone(request.getPhone());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(request.getRole());
        user.setActive(true);
        user.setApproved(false); // Needs admin approval
        user.setOfficialIdFile(request.getOfficialIdFile());
        user.setRegistrationDate(LocalDateTime.now());

        user = userRepository.save(user);

        // Create role-specific profile
        if (user.getRole() == Role.PO && request.getBadgeNumber() != null) {
            PoliceOfficer officer = new PoliceOfficer();
            officer.setUserId(user.getId());
            officer.setBadgeNumber(request.getBadgeNumber());
            officer.setDepartment(request.getDepartment());
            officer.setRank(request.getRank());
            officer.setStationAddress(request.getStationAddress());
            officer.setIdDocumentUrl(request.getOfficialIdFile());
            policeOfficerRepository.save(officer);
        } else if (user.getRole() == Role.SW && request.getLicenseNumber() != null) {
            SocialWorker worker = new SocialWorker();
            worker.setUserId(user.getId());
            worker.setLicenseNumber(request.getLicenseNumber());
            worker.setOrganization(request.getOrganization());
            worker.setIdDocumentUrl(request.getOfficialIdFile());
            socialWorkerRepository.save(worker);
        }

        return new LoginResponse(null, "Registration successful. Awaiting admin approval.", false);
    }

    @Override
    public LoginResponse loginUser(LoginRequest request) {
        Optional<User> userOpt = userRepository.findByEmail(request.getEmail());
        if (userOpt.isEmpty()) {
            return new LoginResponse(null, "Invalid credentials", false);
        }

        User user = userOpt.get();
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            return new LoginResponse(null, "Invalid credentials", false);
        }

        if (!user.isActive()) {
            return new LoginResponse(null, "Account is deactivated", false);
        }

        if (!user.isApproved()) {
            return new LoginResponse(null, "Account pending approval", false);
        }

        // Generate token with userId, email, and role
        String token = jwtUtil.generateToken(user.getId(), user.getEmail(), user.getRole().name());
        user.setLastLogin(LocalDateTime.now());
        userRepository.save(user);

        return new LoginResponse(token, user.getId(), user.getEmail(), user.getRole(), true);
    }

    // ... rest of the methods remain the same ...
}

    @Override
    public UserDTO getUserProfile(String userId) {
        return userRepository.findById(userId)
                .map(this::convertToDTO)
                .orElse(null);
    }

    @Override
    public List<User> getPendingApprovals() {
        return userRepository.findByApproved(false);
    }

    @Override
    public List<User> getUsersByRole(String role) {
        return userRepository.findByRole(Role.valueOf(role));
    }

    @Override
    public boolean approveUser(String userId) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            user.setApproved(true);
            userRepository.save(user);
            return true;
        }
        return false;
    }

    @Override
    public boolean rejectUser(String userId) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isPresent()) {
            userRepository.delete(userOpt.get());
            return true;
        }
        return false;
    }

    @Override
    public boolean updateUser(String userId, UserDTO userDTO) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            user.setFullName(userDTO.getFullName());
            user.setEmail(userDTO.getEmail());
            user.setPhone(userDTO.getPhone());
            user.setActive(userDTO.isActive());
            userRepository.save(user);
            return true;
        }
        return false;
    }

    @Override
    public boolean deactivateUser(String userId) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            user.setActive(false);
            userRepository.save(user);
            return true;
        }
        return false;
    }

    @Override
    public boolean activateUser(String userId) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            user.setActive(true);
            userRepository.save(user);
            return true;
        }
        return false;
    }

    @Override
    public List<UserDTO> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::convertToDTO)
                .toList();
    }

    private UserDTO convertToDTO(User user) {
        UserDTO dto = new UserDTO();
        dto.setId(user.getId());
        dto.setFullName(user.getFullName());
        dto.setEmail(user.getEmail());
        dto.setPhone(user.getPhone());
        dto.setRole(user.getRole());
        dto.setActive(user.isActive());
        dto.setApproved(user.isApproved());
        dto.setRegistrationDate(user.getRegistrationDate());
        return dto;
    }
}