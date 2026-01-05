package com.example.childPortal.controller;

import com.example.childPortal.dto.UserDTO;
import com.example.childPortal.dto.UserProfileStatsDTO;
import com.example.childPortal.dto.PersonalAnalyticsDTO;
import com.example.childPortal.dto.UserUpdateRequest;
import com.example.childPortal.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/user")
@CrossOrigin(origins = "*")
public class UserController {

    @Autowired
    private UserService userService;

    @GetMapping("/profile/{userId}")
    public ResponseEntity<UserDTO> getUserProfile(@PathVariable String userId) {
        UserDTO user = userService.getUserProfile(userId);
        return user != null ? ResponseEntity.ok(user) : ResponseEntity.notFound().build();
    }

    @GetMapping("/profile/{userId}/stats")
    public ResponseEntity<UserProfileStatsDTO> getUserProfileStats(@PathVariable String userId) {
        UserProfileStatsDTO stats = userService.getUserProfileStats(userId);
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/profile/{userId}/analytics")
    public ResponseEntity<PersonalAnalyticsDTO> getUserPersonalAnalytics(@PathVariable String userId) {
        PersonalAnalyticsDTO analytics = userService.getUserPersonalAnalytics(userId);
        return ResponseEntity.ok(analytics);
    }

    @PostMapping("/profile/{userId}/photo")
    public ResponseEntity<Map<String, Object>> uploadProfilePhoto(
            @PathVariable String userId,
            @RequestParam("photo") MultipartFile file,
            @AuthenticationPrincipal String authenticatedUserId) {

        if (!userId.equals(authenticatedUserId)) {
            return ResponseEntity.status(403).body(Map.of("error", "Unauthorized"));
        }
        
        try {
            String photoUrl = userService.uploadProfilePhoto(userId, file);
            return ResponseEntity.ok(Map.of(
                "success", true,
                "photoUrl", photoUrl,
                "profilePhoto", photoUrl,
                "profileImage", photoUrl
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", e.getMessage()
            ));
        }
    }

    @DeleteMapping("/profile/{userId}/photo")
    public ResponseEntity<Map<String, Object>> removeProfilePhoto(
            @PathVariable String userId,
            @AuthenticationPrincipal String authenticatedUserId) {

        if (!userId.equals(authenticatedUserId)) {
            return ResponseEntity.status(403).body(Map.of("error", "Unauthorized"));
        }
        
        try {
            userService.removeProfilePhoto(userId);
            return ResponseEntity.ok(Map.of("success", true, "message", "Profile photo removed successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", e.getMessage()
            ));
        }
    }

    @PutMapping("/profile/{userId}")
    public ResponseEntity<Map<String, Object>> updateUserProfile(
            @PathVariable String userId,
            @RequestBody UserUpdateRequest updateRequest,
            @AuthenticationPrincipal String authenticatedUserId) {

        if (!userId.equals(authenticatedUserId)) {
            return ResponseEntity.status(403).body(Map.of("error", "Unauthorized"));
        }
        
        try {
            UserDTO updatedUser = userService.updateUserProfile(userId, updateRequest);
            return ResponseEntity.ok(Map.of(
                "success", true,
                "user", updatedUser
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", e.getMessage()
            ));
        }
    }
}