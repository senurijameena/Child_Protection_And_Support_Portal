public Map<String, Long> getUserStatistics() {
Map<String, Long> stats = new HashMap<>();
  List<User> allUsers = userRepository.findAll(); 
  stats.put("totalUsers", (long) allUsers.size());
  stats.put("totalPoliceOfficers", allUsers.stream()
            .filter(u -> u.getRole() == Role.PO)
            .count());
  stats.put("totalSocialWorkers", allUsers.stream()
            .filter(u -> u.getRole() == Role.SW)
            .count());
  stats.put("totalPublicUsers", allUsers.stream()
            .filter(u -> u.getRole() == Role.PU) .count());
  stats.put("activeUsers", allUsers.stream()
            .filter(User::isActive)
            .count());
  stats.put("inactiveUsers", allUsers.stream()
            .filter(u -> !u.isActive()) .count());
  stats.put("pendingApproval", allUsers.stream()
            .filter(u -> "PENDING".equals(u.getStatus()))
            .count());
  stats.put("approvedUsers", allUsers.stream()
            .filter(User::isApproved) .count());
  return stats; 
}
