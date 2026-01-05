
export interface TransferRequest {
  id: string;
  transferNumber: string;
  entityType: 'CASE' | 'HELP_REQUEST';
  entityId: string;
  entityDetails: {
    number: string;
    title: string;
    type: string;
    location: string;
    priority?: string;
    urgency?: string;
  };
  requester: {
    id: string;
    name: string;
    role: string;
    badgeNumber?: string;
    licenseNumber?: string;
  };
  recipient: {
    id: string;
    name: string;
    role: string;
    badgeNumber?: string;
    licenseNumber?: string;
  };
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED' | 'COMPLETED';
  reasonCategory: string;
  detailedReason: string;
  urgency: 'NORMAL' | 'URGENT' | 'EMERGENCY';
  createdAt: string;
  updatedAt: string;
  notes?: string;
  canApprove?: boolean;
  canCancel?: boolean;
}

export interface TransferStats {
  totalTransfers: number;
  pendingCount: number;
  approvedCount: number;
  rejectedCount: number;
  cancelledCount: number;
  approvalRate: number;
  averageProcessingTime: number;
  monthlyStats: Array<{
    month: string;
    transfers: number;
    approved: number;
    rejected: number;
  }>;
  reasonBreakdown: Array<{
    reason: string;
    count: number;
    percentage: number;
  }>;
  topRequesters: Array<{
    name: string;
    transfers: number;
    role: string;
  }>;
  topRecipients: Array<{
    name: string;
    received: number;
    role: string;
  }>;
}