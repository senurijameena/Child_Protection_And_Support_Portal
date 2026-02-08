package com.example.childPortal.service.impl;

import com.example.childPortal.dto.*;
import com.example.childPortal.model.*;
import com.example.childPortal.repository.*;
import com.example.childPortal.security.JwtUtil;
import com.example.childPortal.service.CaseService;
import com.example.childPortal.service.FeedbackService;
import com.example.childPortal.service.HelpRequestService;
import com.example.childPortal.service.NotificationService;
import com.example.childPortal.service.UserService;

import jakarta.annotation.PostConstruct;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class UserServiceImpl implements UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PoliceOfficerRepository policeOfficerRepository;

    @Autowired
    private SocialWorkerRepository socialWorkerRepository;

    @Autowired
    private PoliceStationRepository policeStationRepository;

    @Autowired
    private CaseRepository caseRepository;

    @Autowired
    private CaseService caseService;

    @Autowired
    private HelpRequestService helpRequestService;

    @Autowired
    private FeedbackService feedbackService;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    @PostConstruct
    public void createDefaultAdmin() {
        new Thread(() -> {
            try {
                Thread.sleep(2000);

                if (!userRepository.findByEmail("admin@gmail.com").isPresent()) {
                    User admin = new User();
                    admin.setFullName("System Administrator");
                    admin.setEmail("admin@gmail.com");
                    admin.setPhone("+1234567890");
                    admin.setPassword(passwordEncoder.encode("admin123"));
                    admin.setRole(Role.ADMIN);
                    admin.setActive(true);
                    admin.setApproved(true);
                    admin.setOfficialIdFile("system_admin");
                    admin.setRegistrationDate(LocalDateTime.now());

                    userRepository.save(admin);
                    System.out.println("✅ Default admin created successfully");
                }
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                System.err.println("❌ Admin creation thread interrupted");
            } catch (Exception e) {
                System.err.println("❌ Failed to create default admin: " + e.getMessage());

            }
        }).start();
    }

    @Override
    public LoginResponse registerUser(RegisterRequest request) {
        if (!request.getPassword().equals(request.getConfirmPassword())) {
            return new LoginResponse(null, "Passwords do not match", false);
        }

        if (!request.isTermsAccepted()) {
            return new LoginResponse(null, "You must accept the terms and conditions", false);
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            return new LoginResponse(null, "Email already exists", false);
        }

        User user = new User();
        user.setFullName(request.getFullName());
        user.setEmail(request.getEmail());
        user.setPhone(request.getPhone());
        user.setAddress(request.getAddress());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(request.getRole());
        user.setApproved(true);
        user.setRegistrationDate(LocalDateTime.now());
        if (request.getProfilePhoto() != null && !request.getProfilePhoto().isEmpty()) {
            user.setProfilePhoto(request.getProfilePhoto());
        }

        try {
            user = userRepository.save(user);

            String token = jwtUtil.generateToken(user.getId(), user.getEmail(), user.getRole().name());

            try {
                if (user.getRole() == Role.PO) {
                    PoliceOfficer officer = new PoliceOfficer();
                    officer.setUserId(user.getId());
                    officer.setBadgeNumber(request.getBadgeNumber());
                    officer.setDepartment(request.getDepartment());
                    officer.setRank(request.getRank());
                    officer.setStationAddress(request.getStationAddress());
                    officer.setIdDocumentUrl(request.getIdDocumentUrl());
                    policeOfficerRepository.save(officer);

                } else if (user.getRole() == Role.SW) {
                    SocialWorker worker = new SocialWorker();
                    worker.setUserId(user.getId());
                    worker.setLicenseNumber(request.getLicenseNumber());
                    worker.setOrganization(request.getOrganization());
                    worker.setYearsOfExperience(
                            request.getYearsOfExperience() != null ? Integer.parseInt(request.getYearsOfExperience())
                                    : 0);

                    if (request.getSpecializations() != null) {
                        List<String> specializations = Arrays.asList(
                                request.getSpecializations().split(","));
                        worker.setSpecializations(specializations);
                    }

                    worker.setIdDocumentUrl(request.getCertificationDocumentUrl());
                    socialWorkerRepository.save(worker);
                }
            } catch (Exception roleException) {
                System.err.println("Warning: Failed to save role-specific data for user " + user.getId() + ": "
                        + roleException.getMessage());
            }

            try {
                notificationService.sendRegistrationSuccessEmail(user.getId(), user.getRole().name());
            } catch (Exception emailException) {

                System.err.println("Warning: Failed to send registration success email to " + user.getEmail() + ": "
                        + emailException.getMessage());
            }

            LoginResponse response = new LoginResponse(token, user.getId(), user.getEmail(), user.getFullName(),
                    user.getRole(), true);
            response.setProfilePhoto(user.getProfilePhoto());
            return response;

        } catch (Exception e) {
            try {
                if (user.getId() != null) {
                    userRepository.delete(user);
                }
            } catch (Exception deleteException) {
                System.err.println("Failed to cleanup user after registration error: " + deleteException.getMessage());
            }
            return new LoginResponse(null, "Registration failed: " + e.getMessage(), false);
        }
    }

    @Override
    public LoginResponse registerPoliceStation(RegisterRequest request) {
        if (!request.getPassword().equals(request.getConfirmPassword())) {
            return new LoginResponse(null, "Passwords do not match", false);
        }
        if (!request.isTermsAccepted()) {
            return new LoginResponse(null, "You must accept the terms and conditions", false);
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            return new LoginResponse(null, "Email already exists", false);
        }

        User user = new User();
        user.setFullName(request.getFullName() != null && !request.getFullName().isEmpty()
                ? request.getFullName() : request.getOfficerInChargeName());
        user.setEmail(request.getEmail());
        user.setPhone(request.getPhone());
        user.setAddress(request.getAddress());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(Role.PO);
        user.setApproved(true);
        user.setRegistrationDate(LocalDateTime.now());

        try {
            user = userRepository.save(user);

            PoliceStation station = new PoliceStation();
            station.setStationName(request.getStationName());
            station.setDistrict(request.getDistrict());
            station.setCity(request.getCity());
            station.setAddress(request.getAddress());
            station.setContactNumber(request.getPhone());
            station.setEmail(request.getEmail());
            station.setOfficerInChargeName(request.getOfficerInChargeName() != null ? request.getOfficerInChargeName() : request.getFullName());
            station.setRegisteredUserId(user.getId());
            station.setLocationCoordinates(request.getLocationCoordinates());
            station.setOfficerIdProofUrl(request.getOfficerIdProofUrl());
            station.setGovernmentApprovalLetterUrl(request.getGovernmentApprovalLetterUrl());
            station.setAllocatedResources(request.getAllocatedResources());
            station.setStaffDetails(request.getStaffDetails());
            policeStationRepository.save(station);

            String token = jwtUtil.generateToken(user.getId(), user.getEmail(), user.getRole().name());
            try {
                notificationService.sendRegistrationSuccessEmail(user.getId(), user.getRole().name());
            } catch (Exception emailException) {
                System.err.println("Warning: Failed to send registration success email to " + user.getEmail() + ": " + emailException.getMessage());
            }

            LoginResponse response = new LoginResponse(token, user.getId(), user.getEmail(), user.getFullName(),
                    user.getRole(), true);
            response.setProfilePhoto(user.getProfilePhoto());
            return response;
        } catch (Exception e) {
            try {
                if (user.getId() != null) {
                    userRepository.delete(user);
                }
            } catch (Exception deleteException) {
                System.err.println("Failed to cleanup user after police station registration error: " + deleteException.getMessage());
            }
            return new LoginResponse(null, "Registration failed: " + e.getMessage(), false);
        }
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

        String token = jwtUtil.generateToken(user.getId(), user.getEmail(), user.getRole().name());

        String userId = user.getId();
        new Thread(() -> {
            try {
                Optional<User> userToUpdate = userRepository.findById(userId);
                if (userToUpdate.isPresent()) {
                    User userForUpdate = userToUpdate.get();
                    userForUpdate.setLastLogin(LocalDateTime.now());
                    userRepository.save(userForUpdate);
                }
            } catch (Exception e) {
                System.err.println("Failed to update lastLogin for user " + userId + ": " + e.getMessage());
            }
        }).start();

        LoginResponse response = new LoginResponse(token, user.getId(), user.getEmail(), user.getFullName(),
                user.getRole(), true);
        response.setProfilePhoto(user.getProfilePhoto());
        return response;
    }

    @Override
    public Optional<User> getUserById(String userId) {
        return userRepository.findById(userId);
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
        try {
            Role roleEnum = Role.valueOf(role);
            return userRepository.findByRole(roleEnum);
        } catch (IllegalArgumentException e) {
            return Collections.emptyList();
        }
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
                .collect(Collectors.toList());
    }

    @Override
    public List<User> getAllUsersAsEntities() {
        return userRepository.findAll();
    }

    @Override
    public List<User> getUsersByStatus(String status) {
        if ("active".equalsIgnoreCase(status)) {
            return userRepository.findByActive(true);
        } else if ("inactive".equalsIgnoreCase(status)) {
            return userRepository.findByActive(false);
        } else if ("pending".equalsIgnoreCase(status)) {
            return userRepository.findByApproved(false);
        } else if ("approved".equalsIgnoreCase(status)) {
            return userRepository.findByApproved(true);
        }
        return Collections.emptyList();
    }

    @Override
    public List<UserManagementDTO> getAllUsersForManagement() {
        return userRepository.findAll().stream()
                .map(this::convertToUserManagementDTO)
                .collect(Collectors.toList());
    }

    @Override
    public UserManagementDTO getUserForManagement(String userId) {
        return userRepository.findById(userId)
                .map(this::convertToUserManagementDTO)
                .orElse(null);
    }

    @Override
    public boolean deactivateUser(String userId, String reason) {
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
    public boolean updateUserDetails(String userId, com.example.childPortal.dto.UserUpdateRequest updateRequest) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            user.setFullName(updateRequest.getFullName());
            user.setEmail(updateRequest.getEmail());
            user.setPhone(updateRequest.getPhone());
            user.setActive(updateRequest.isActive());

            if (user.getRole() == Role.PO) {
                Optional<PoliceOfficer> officerOpt = policeOfficerRepository.findByUserId(userId);
                if (officerOpt.isPresent()) {
                    PoliceOfficer officer = officerOpt.get();
                    officer.setBadgeNumber(updateRequest.getBadgeNumber());
                    officer.setDepartment(updateRequest.getDepartment());
                    officer.setRank(updateRequest.getRank());
                    officer.setStationAddress(updateRequest.getStationAddress());
                    policeOfficerRepository.save(officer);
                }
            } else if (user.getRole() == Role.SW) {
                Optional<SocialWorker> workerOpt = socialWorkerRepository.findByUserId(userId);
                if (workerOpt.isPresent()) {
                    SocialWorker worker = workerOpt.get();
                    worker.setLicenseNumber(updateRequest.getLicenseNumber());
                    worker.setSpecializations(updateRequest.getSpecializations());
                    worker.setOrganization(updateRequest.getOrganization());
                    socialWorkerRepository.save(worker);
                }
            }

            userRepository.save(user);
            return true;
        }
        return false;
    }

    @Override
    public List<UserManagementDTO> getUsersByRoleForManagement(String role) {
        try {
            Role roleEnum = Role.valueOf(role);
            return userRepository.findByRole(roleEnum).stream()
                    .map(this::convertToUserManagementDTO)
                    .collect(Collectors.toList());
        } catch (IllegalArgumentException e) {
            return Collections.emptyList();
        }
    }

    @Override
    public List<UserManagementDTO> getActiveUsers() {
        return userRepository.findByActive(true).stream()
                .map(this::convertToUserManagementDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<UserManagementDTO> getInactiveUsers() {
        return userRepository.findByActive(false).stream()
                .map(this::convertToUserManagementDTO)
                .collect(Collectors.toList());
    }

    @Override
    public UserManagementDTO convertToUserManagementDTO(User user) {
        UserManagementDTO dto = new UserManagementDTO();
        dto.setUserId(user.getId());
        dto.setFullName(user.getFullName());
        dto.setEmail(user.getEmail());
        dto.setPhone(user.getPhone());
        dto.setRole(user.getRole().name());
        dto.setActive(user.isActive());
        dto.setApproved(user.isApproved());
        dto.setRegistrationDate(user.getRegistrationDate());
        dto.setLastLogin(user.getLastLogin());

        if (user.getRole() == Role.PO) {
            policeOfficerRepository.findByUserId(user.getId()).ifPresent(officer -> {
                dto.setBadgeNumber(officer.getBadgeNumber());
                dto.setDepartment(officer.getDepartment());
                dto.setRank(officer.getRank());
                dto.setStationAddress(officer.getStationAddress());
            });
        } else if (user.getRole() == Role.SW) {
            socialWorkerRepository.findByUserId(user.getId()).ifPresent(worker -> {
                dto.setLicenseNumber(worker.getLicenseNumber());
                dto.setSpecializations(worker.getSpecializations());
                dto.setOrganization(worker.getOrganization());
                dto.setYearsOfExperience(String.valueOf(worker.getYearsOfExperience()));
            });
        }

        return dto;
    }

    @Override
    public Map<String, Long> getUserStatistics() {
        Map<String, Long> stats = new HashMap<>();

        long totalUsers = userRepository.count();
        long activeUsers = userRepository.findByActive(true).size();
        long pendingApprovals = userRepository.findByApproved(false).size();
        long policeOfficers = userRepository.findByRole(Role.PO).size();
        long socialWorkers = userRepository.findByRole(Role.SW).size();
        long publicUsers = userRepository.findByRole(Role.PU).size();
        long admins = userRepository.findByRole(Role.ADMIN).size();

        stats.put("totalUsers", totalUsers);
        stats.put("activeUsers", activeUsers);
        stats.put("pendingApprovals", pendingApprovals);
        stats.put("policeOfficers", policeOfficers);
        stats.put("socialWorkers", socialWorkers);
        stats.put("publicUsers", publicUsers);
        stats.put("admins", admins);

        return stats;
    }

    @Override
    public UserProfileStatsDTO getUserProfileStats(String userId) {
        UserProfileStatsDTO stats = new UserProfileStatsDTO();

        long totalCases = 0;
        try {
            totalCases = caseService.getCasesByReporter(userId).size();
        } catch (Exception ignored) {
        }
        stats.setTotalCases(totalCases);

        long helpRequests = 0;
        try {
            helpRequests = helpRequestService.getHelpRequestsByRequester(userId).size();
        } catch (Exception ignored) {
        }
        stats.setHelpRequests(helpRequests);

        double averageRating = 0.0;
        try {
            java.util.List<com.example.childPortal.dto.FeedbackResponseDTO> feedbackList = feedbackService
                    .getFeedbackByUser(userId);
            java.util.List<com.example.childPortal.dto.FeedbackResponseDTO> rated = feedbackList.stream()
                    .filter(f -> f.getRating() != null)
                    .toList();
            if (!rated.isEmpty()) {
                double sum = rated.stream()
                        .mapToInt(com.example.childPortal.dto.FeedbackResponseDTO::getRating)
                        .sum();
                averageRating = sum / rated.size();
            }
        } catch (Exception ignored) {
        }
        stats.setAverageRating(averageRating);

        double score = 50.0;
        score += Math.min(30.0, totalCases * 2.0);
        score += Math.min(20.0, helpRequests * 2.5);
        score += Math.min(25.0, averageRating * 5.0);

        if (score > 100.0)
            score = 100.0;
        if (score < 0.0)
            score = 0.0;
        stats.setTrustScore((int) Math.round(score));

        return stats;
    }

    @Override
    public PersonalAnalyticsDTO getUserPersonalAnalytics(String userId) {
        PersonalAnalyticsDTO analytics = new PersonalAnalyticsDTO();

        try {
            List<Case> userCases = caseRepository.findByReporterUserId(userId);

            if (userCases.isEmpty()) {
                analytics.setMonthlyActivity(new ArrayList<>());
                analytics.setCaseTypeDistribution(new HashMap<>());
                analytics.setAverageResponseTime(0.0);
                analytics.setFastestResponse(0.0);
                analytics.setResolutionRate(0.0);
                analytics.setAnonymousReports(0);
                analytics.setNamedReports(0);
                analytics.setAnonymousPercentage(0.0);
                analytics.setNamedPercentage(0.0);
                analytics.setAnonymousResponseTimeAdvantage(0.0);
                return analytics;
            }

            Map<String, Long> monthlyCounts = new HashMap<>();
            for (Case caseEntity : userCases) {
                if (caseEntity.getReportDate() != null) {
                    String monthKey = caseEntity.getReportDate().getMonth().name().substring(0, 3) + "-" +
                            caseEntity.getReportDate().getYear();
                    monthlyCounts.put(monthKey, monthlyCounts.getOrDefault(monthKey, 0L) + 1);
                }
            }

            List<PersonalAnalyticsDTO.MonthlyActivityDTO> monthlyActivity = new ArrayList<>();
            for (Map.Entry<String, Long> entry : monthlyCounts.entrySet()) {
                String[] parts = entry.getKey().split("-");
                String month = parts[0];
                int year = Integer.parseInt(parts[1]);
                monthlyActivity.add(new PersonalAnalyticsDTO.MonthlyActivityDTO(month, year, entry.getValue()));
            }
            monthlyActivity.sort((a, b) -> {
                int yearCompare = Integer.compare(a.getYear(), b.getYear());
                if (yearCompare != 0)
                    return yearCompare;
                String[] months = { "JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV",
                        "DEC" };
                int monthA = Arrays.asList(months).indexOf(a.getMonth().toUpperCase());
                int monthB = Arrays.asList(months).indexOf(b.getMonth().toUpperCase());
                return Integer.compare(monthA, monthB);
            });
            analytics.setMonthlyActivity(monthlyActivity);

            Map<String, Long> caseTypeDistribution = new HashMap<>();
            for (Case caseEntity : userCases) {
                if (caseEntity.getCaseType() != null) {
                    String caseType = caseEntity.getCaseType().name();
                    caseTypeDistribution.put(caseType, caseTypeDistribution.getOrDefault(caseType, 0L) + 1);
                }
            }
            analytics.setCaseTypeDistribution(caseTypeDistribution);

            List<Double> responseTimes = new ArrayList<>();
            List<Double> anonymousResponseTimes = new ArrayList<>();
            List<Double> namedResponseTimes = new ArrayList<>();
            long resolvedCount = 0;
            long anonymousCount = 0;
            long namedCount = 0;

            for (Case caseEntity : userCases) {
                if (caseEntity.isAnonymous()) {
                    anonymousCount++;
                } else {
                    namedCount++;
                }

                LocalDateTime responseTime = null;
                if (caseEntity.getLastUpdated() != null &&
                        !caseEntity.getLastUpdated().equals(caseEntity.getReportDate())) {
                    responseTime = caseEntity.getLastUpdated();
                } else if (caseEntity.getResolutionDate() != null) {
                    responseTime = caseEntity.getResolutionDate();
                }

                if (caseEntity.getReportDate() != null && responseTime != null) {
                    long hours = java.time.Duration.between(caseEntity.getReportDate(), responseTime).toHours();
                    double days = hours / 24.0;
                    responseTimes.add(days);

                    if (caseEntity.isAnonymous()) {
                        anonymousResponseTimes.add(days);
                    } else {
                        namedResponseTimes.add(days);
                    }
                }

                if (caseEntity.getStatus() != null &&
                        (caseEntity.getStatus() == Case.CaseStatus.RESOLVED ||
                                caseEntity.getStatus() == Case.CaseStatus.CLOSED)) {
                    resolvedCount++;
                }
            }

            double averageResponseTime = responseTimes.isEmpty() ? 0.0
                    : responseTimes.stream().mapToDouble(Double::doubleValue).average().orElse(0.0);
            analytics.setAverageResponseTime(averageResponseTime);

            double fastestResponse = responseTimes.isEmpty() ? 0.0
                    : responseTimes.stream().mapToDouble(d -> d * 24).min().orElse(0.0);
            analytics.setFastestResponse(fastestResponse);

            double resolutionRate = userCases.isEmpty() ? 0.0 : (resolvedCount * 100.0) / userCases.size();
            analytics.setResolutionRate(resolutionRate);

            analytics.setAnonymousReports(anonymousCount);
            analytics.setNamedReports(namedCount);

            long totalReports = userCases.size();
            double anonymousPercentage = totalReports == 0 ? 0.0 : (anonymousCount * 100.0) / totalReports;
            double namedPercentage = totalReports == 0 ? 0.0 : (namedCount * 100.0) / totalReports;
            analytics.setAnonymousPercentage(anonymousPercentage);
            analytics.setNamedPercentage(namedPercentage);

            double anonymousAvgResponse = anonymousResponseTimes.isEmpty() ? 0.0
                    : anonymousResponseTimes.stream().mapToDouble(Double::doubleValue).average().orElse(0.0);
            double namedAvgResponse = namedResponseTimes.isEmpty() ? 0.0
                    : namedResponseTimes.stream().mapToDouble(Double::doubleValue).average().orElse(0.0);

            double anonymousAdvantage = 0.0;
            if (namedAvgResponse > 0 && anonymousAvgResponse > 0) {

                anonymousAdvantage = ((namedAvgResponse - anonymousAvgResponse) / namedAvgResponse) * 100.0;
            } else if (namedAvgResponse > 0 && anonymousAvgResponse == 0) {
                anonymousAdvantage = 100.0; // Anonymous is instant
            }
            analytics.setAnonymousResponseTimeAdvantage(anonymousAdvantage);

        } catch (Exception e) {
            System.err.println("Error calculating personal analytics for user " + userId + ": " + e.getMessage());

            analytics.setMonthlyActivity(new ArrayList<>());
            analytics.setCaseTypeDistribution(new HashMap<>());
            analytics.setAverageResponseTime(0.0);
            analytics.setFastestResponse(0.0);
            analytics.setResolutionRate(0.0);
            analytics.setAnonymousReports(0);
            analytics.setNamedReports(0);
            analytics.setAnonymousPercentage(0.0);
            analytics.setNamedPercentage(0.0);
            analytics.setAnonymousResponseTimeAdvantage(0.0);
        }

        return analytics;
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
        dto.setLastLogin(user.getLastLogin());
        return dto;
    }

    @Override
    public String uploadProfilePhoto(String userId, MultipartFile file) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            throw new RuntimeException("User not found");
        }

        User user = userOpt.get();
        String fileName = file.getOriginalFilename();
        String photoUrl = "/uploads/profile/" + userId + "/" + fileName;
        user.setProfilePhoto(photoUrl);
        userRepository.save(user);
        return photoUrl;
    }

    @Override
    public void removeProfilePhoto(String userId) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            throw new RuntimeException("User not found");
        }

        User user = userOpt.get();
        user.setProfilePhoto(null);
        userRepository.save(user);
    }

    @Override
    public UserDTO updateUserProfile(String userId, UserUpdateRequest updateRequest) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            throw new RuntimeException("User not found");
        }

        User user = userOpt.get();
        if (updateRequest.getFullName() != null) {
            user.setFullName(updateRequest.getFullName());
        }
        if (updateRequest.getPhone() != null) {
            user.setPhone(updateRequest.getPhone());
        }

        userRepository.save(user);
        return convertToDTO(user);
    }
}