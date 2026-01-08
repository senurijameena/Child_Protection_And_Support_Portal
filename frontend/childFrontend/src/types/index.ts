export interface Case {
  id: string;
  caseNumber: string;
  title: string;
  description: string;
  location: string;
  status: 'OPEN' | 'UNDER_REVIEW' | 'RESOLVED' | 'CLOSED';
  createdAt: string;
  updatedAt: string;
  reportedBy?: string;
}

export interface Feedback {
  id: string;
  userId: string;
  userName?: string;
  rating: number;
  comment: string;
  createdAt: string;
  adminResponse?: string;
  category?: string;
  status?: string;
  isAnonymous?: boolean;
  type?: string;
  caseId?: string;
  helpRequestId?: string;
}

export interface Statistics {
  casesResolved: number;
  activeOfficers: number;
  socialWorkers: number;
  childrenHelped: number;
  totalFeedback?: number;
  averageRating?: number;
}

export interface HowItWorksStep {
  id: number;
  icon: string;
  title: string;
  description: string;
}

export interface FeedbackDTO {
  id: string;
  userId: string;
  caseId?: string;
  helpRequestId?: string;
  type?: string;
  message: string;
  rating?: number;
  category?: string;
  anonymous?: boolean;
  submissionDate?: string;
}

export interface FeedbackResponseDTO {
  id: string;
  caseId?: string;
  userId: string;
  type?: string;
  category?: string;
  description?: string;
  rating?: number;
  status?: string;
  adminResponse?: string;
  createdAt: string;
  message?: string;
  success: boolean;
}

export interface FeedbackStats {
  totalFeedback: number;
  averageRating: number;
  positiveFeedback: number;
  negativeFeedback: number;
}

export interface PoliceOfficer {
  id: string;
  userId: string;
  name: string;
  badgeNumber: string;
  department: string;
  rank: string;
  stationAddress: string;
  availability: 'AVAILABLE' | 'BUSY' | 'ON_DUTY' | 'OFF_DUTY' | 'EMERGENCY_ONLY';
  currentStatus: string;
  workload: number; // 0-5 scale
  totalCases: number;
  resolvedCases: number;
  pendingCases: number;
  emergencyCases: number;
  performanceScore: number;
  rankInDepartment: number;
  departmentSize: number;
  averageResponseTime: number; // in hours
  specialization: string[];
  joinedDate: string;
  lastActive: string;
}

export interface PoliceAssignment {
  id: string;
  caseId: string;
  caseNumber: string;
  title: string;
  type: 'MISSING_CHILD' | 'CHILD_ABUSE' | 'TRAFFICKING' | 'CYBER_CRIME' | 'OTHER';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: 'ASSIGNED' | 'INVESTIGATING' | 'AWAITING_REVIEW' | 'CLOSED' | 'TRANSFERRED';
  assignedDate: string;
  daysOpen: number;
  nextAction: string;
  nextActionDue: string;
  location: string;
  victimAge?: number;
  lastUpdated: string;
  assignedOfficerId: string;
  emergencyLevel?: number; // 1-5
}

export interface TeamMember {
  id: string;
  name: string;
  rank: string;
  badgeNumber: string;
  availability: 'AVAILABLE' | 'BUSY' | 'ON_DUTY' | 'OFF_DUTY' | 'EMERGENCY_ONLY';
  currentWorkload: number;
  maxWorkload: number;
  activeCases: number;
  specialization: string[];
  lastActive: string;
  location?: string;
}

export interface PerformanceMetrics {
  thisMonth: {
    cases: number;
    emergencyCases: number;
    transfers: number;
  };
  averageTime: {
    regular: number; // hours
    emergency: number; // hours
    investigation: number; // hours
  };
  resolution: {
    rate: number; // percentage
    emergencyRate: number;
    openRate: number;
  };
  performance: {
    score: number;
    rank: number;
    departmentSize: number;
    trend: number; // percentage change
  };
}

export interface EmergencyAlert {
  id: string;
  caseId: string;
  caseNumber: string;
  title: string;
  type: string;
  location: string;
  reportedAt: string;
  timeAgo: string;
  priority: 'URGENT' | 'HIGH';
  actionRequired: boolean;
}

export interface TransferRequest {
  id: string;
  caseId: string;
  caseNumber: string;
  title: string;
  requesterId: string;
  requesterName: string;
  currentAssigneeId: string;
  currentAssigneeName: string;
  requestedAssigneeId: string;
  requestedAssigneeName: string;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
  requestedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
}