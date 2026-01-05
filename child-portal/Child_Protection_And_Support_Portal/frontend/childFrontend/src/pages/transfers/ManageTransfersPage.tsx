
import React, { useState, useEffect } from 'react';
import {
  Container, Row, Col, Card, Button, Alert, Spinner,
  Badge, Nav, Table, Dropdown, Modal, Form,
  Pagination, ProgressBar, ListGroup, FormCheck
} from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import { transferService } from '../../services/transferService';

const UserRole = {
  PUBLIC: 'PUBLIC',
  POLICE: 'POLICE',
  SOCIAL_WORKER: 'SOCIAL_WORKER',
  ADMIN: 'ADMIN'
} as const;


interface TransferRequest {
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

interface TransferStats {
  totalTransfers: number;
  pendingCount: number;
  approvedCount: number;
  rejectedCount: number;
  cancelledCount: number;
  approvalRate: number;
  averageProcessingTime: number;
  monthlyStats: {
    month: string;
    transfers: number;
    approved: number;
    rejected: number;
  }[];
  reasonBreakdown: {
    reason: string;
    count: number;
    percentage: number;
  }[];
  topRequesters: {
    name: string;
    transfers: number;
    role: string;
  }[];
  topRecipients: {
    name: string;
    received: number;
    role: string;
  }[];
}

const ManageTransfersPage: React.FC = () => {
  const navigate = useNavigate();
  const [user] = useState(authService.getCurrentUser());
  const [loading, setLoading] = useState(true);
  const [loadingStats, setLoadingStats] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('my_requests');
  const [transferRequests, setTransferRequests] = useState<TransferRequest[]>([]);
  const [stats, setStats] = useState<TransferStats | null>(null);
  const [selectedRequests, setSelectedRequests] = useState<string[]>([]);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [selectedTransfer, setSelectedTransfer] = useState<TransferRequest | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  const isAdmin = user?.role === UserRole.ADMIN;
  const isPoliceOfficer = user?.role === UserRole.POLICE;
  const isSocialWorker = user?.role === UserRole.SOCIAL_WORKER;

  const getTabs = () => {
    const baseTabs: Record<string, string> = {
      my_requests: '📤 My Transfer Requests',
      to_me: '📥 Transfers To Me',
      pending: '🔄 Pending Transfers',
      all: '📋 All Transfers'
    };

    if (isAdmin) {
      return baseTabs;
    }

    const { pending, ...nonAdminTabs } = baseTabs;
    return nonAdminTabs;
  };

  const tabs = getTabs();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    loadTransferRequests();
    loadTransferStats();
  }, [user, navigate, activeTab, currentPage]);

  useEffect(() => {

    setSelectedRequests([]);
  }, [transferRequests]);

  const loadTransferRequests = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!user?.id) {
        setError('User not found');
        return;
      }

      let response;
      if (activeTab === 'my_requests') {
        response = await transferService.getTransfersByUser(user.id);
      } else if (activeTab === 'pending') {
        response = await transferService.getPendingTransfers();
      } else {
        response = await transferService.getTransfersByUser(user.id);
      }

      const apiTransfers = response.data || [];
      
      const transformedTransfers: TransferRequest[] = apiTransfers.map((t: any) => ({
        id: t.id || '',
        transferNumber: t.transferNumber || t.transferId || t.id,
        entityType: t.entityType || 'CASE',
        entityId: t.entityId || t.caseId || t.helpRequestId || '',
          entityDetails: {
          number: t.entityDetails?.number || t.entityNumber || '',
          title: t.entityDetails?.title || t.entityTitle || '',
          type: t.entityDetails?.type || t.entityType || '',
          location: t.entityDetails?.location || t.location || '',
          priority: t.entityDetails?.priority || t.priority,
          urgency: t.entityDetails?.urgency || t.urgency
          },
          requester: {
          id: t.requester?.id || t.requesterId || '',
          name: t.requester?.name || '',
          role: t.requester?.role || '',
          badgeNumber: t.requester?.badgeNumber,
          licenseNumber: t.requester?.licenseNumber
          },
          recipient: {
          id: t.recipient?.id || t.recipientId || '',
          name: t.recipient?.name || '',
          role: t.recipient?.role || '',
          badgeNumber: t.recipient?.badgeNumber,
          licenseNumber: t.recipient?.licenseNumber
        },
        status: t.status || 'PENDING',
        reasonCategory: t.reasonCategory || '',
        detailedReason: t.detailedReason || t.reason || '',
        urgency: t.urgency || 'NORMAL',
        createdAt: t.createdAt || new Date().toISOString(),
        updatedAt: t.updatedAt || t.createdAt || new Date().toISOString(),
        notes: t.notes,
        canApprove: t.canApprove,
        canCancel: t.canCancel
      }));

      setTransferRequests(transformedTransfers);
      setTotalItems(transformedTransfers.length);
    } catch (err: any) {
      console.error('Error loading transfer requests:', err);
      setError(err.response?.data?.message || 'Failed to load transfer requests. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadTransferStats = async () => {
    try {
      setLoadingStats(true);

      if (!user?.id) {
        return;
      }

      // Calculate stats from actual transfer requests
      // Note: This should ideally come from a dedicated stats endpoint
      const allTransfers = await transferService.getTransfersByUser(user.id);
      const transfers = allTransfers.data || [];
      
      const totalTransfers = transfers.length;
      const pendingCount = transfers.filter((t: any) => t.status === 'PENDING').length;
      const approvedCount = transfers.filter((t: any) => t.status === 'APPROVED').length;
      const rejectedCount = transfers.filter((t: any) => t.status === 'REJECTED').length;
      const cancelledCount = transfers.filter((t: any) => t.status === 'CANCELLED').length;
      const approvalRate = totalTransfers > 0 ? Math.round((approvedCount / totalTransfers) * 100) : 0;
      
      // Calculate average processing time
      let totalProcessingTime = 0;
      let processedCount = 0;
      transfers.forEach((t: any) => {
        if (t.updatedAt && t.createdAt && t.status !== 'PENDING') {
          const processingTime = (new Date(t.updatedAt).getTime() - new Date(t.createdAt).getTime()) / (1000 * 60 * 60);
          if (processingTime > 0) {
            totalProcessingTime += processingTime;
            processedCount++;
          }
        }
      });
      const averageProcessingTime = processedCount > 0 ? Math.round(totalProcessingTime / processedCount) : 0;

      // Generate monthly stats from actual data
      const monthlyMap = new Map<string, { transfers: number; approved: number; rejected: number }>();
      transfers.forEach((t: any) => {
        const month = new Date(t.createdAt || t.updatedAt).toLocaleDateString('en-US', { month: 'short' });
        const existing = monthlyMap.get(month) || { transfers: 0, approved: 0, rejected: 0 };
        existing.transfers++;
        if (t.status === 'APPROVED') existing.approved++;
        if (t.status === 'REJECTED') existing.rejected++;
        monthlyMap.set(month, existing);
      });
      const monthlyStats = Array.from(monthlyMap.entries()).map(([month, data]) => ({
        month,
        ...data
      }));

      // Reason breakdown
      const reasonMap = new Map<string, number>();
      transfers.forEach((t: any) => {
        const reason = t.reasonCategory || 'OTHER';
        reasonMap.set(reason, (reasonMap.get(reason) || 0) + 1);
      });
      const reasonBreakdown = Array.from(reasonMap.entries()).map(([reason, count]) => ({
        reason,
        count,
        percentage: totalTransfers > 0 ? Math.round((count / totalTransfers) * 100) : 0
      }));

      const calculatedStats: TransferStats = {
        totalTransfers,
        pendingCount,
        approvedCount,
        rejectedCount,
        cancelledCount,
        approvalRate,
        averageProcessingTime,
        monthlyStats,
        reasonBreakdown,
        topRequesters: [],
        topRecipients: []
      };
      
      setStats(calculatedStats);
    } catch (err) {
      console.error('Error loading transfer stats:', err);
    } finally {
      setLoadingStats(false);
    }
  };

  const handleApproveTransfer = async (transferId: string) => {
    try {
      await transferService.approveTransfer(transferId);
      await loadTransferRequests();
      await loadTransferStats();
      setError(null);
      alert('Transfer request approved successfully!');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to approve transfer. Please try again.');
    }
  };

  const handleRejectTransfer = async (transferId: string, reason?: string) => {
    try {
      await transferService.rejectTransfer(transferId, reason);
      setShowReviewModal(false);
      setRejectReason('');
      setSelectedTransfer(null);
      await loadTransferRequests();
      await loadTransferStats();
      setError(null);
      alert('Transfer request rejected successfully!');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to reject transfer. Please try again.');
    }
  };

  const handleCancelTransfer = async (transferId: string) => {
    if (!window.confirm('Are you sure you want to cancel this transfer request?')) {
      return;
    }

    try {
      await transferService.cancelTransfer(transferId);
      await loadTransferRequests();
      await loadTransferStats();
      setError(null);
      alert('Transfer request cancelled successfully!');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to cancel transfer. Please try again.');
    }
  };

  const handleBulkApprove = async () => {
    if (selectedRequests.length === 0) {
      setError('Please select at least one transfer request');
      return;
    }

    if (!window.confirm(`Approve ${selectedRequests.length} selected transfer(s)?`)) {
      return;
    }

    try {



      setSelectedRequests([]);
      await loadTransferRequests();
      await loadTransferStats();
      setError(null);
      alert(`${selectedRequests.length} transfer(s) approved successfully!`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to approve transfers');
    }
  };

  const handleBulkReject = async () => {
    if (selectedRequests.length === 0) {
      setError('Please select at least one transfer request');
      return;
    }

    const reason = prompt('Enter reason for rejection:');
    if (!reason) {
      setError('Rejection reason is required');
      return;
    }

    if (!window.confirm(`Reject ${selectedRequests.length} selected transfer(s)?`)) {
      return;
    }

    try {



      setSelectedRequests([]);
      await loadTransferRequests();
      await loadTransferStats();
      setError(null);
      alert(`${selectedRequests.length} transfer(s) rejected successfully!`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to reject transfers');
    }
  };

  const handleSelectAll = () => {
    if (selectedRequests.length === transferRequests.length) {
      setSelectedRequests([]);
    } else {
      setSelectedRequests(transferRequests.map(t => t.id));
    }
  };

  const handleSelectRequest = (transferId: string) => {
    setSelectedRequests(prev => {
      if (prev.includes(transferId)) {
        return prev.filter(id => id !== transferId);
      } else {
        return [...prev, transferId];
      }
    });
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { variant: string; text: string; icon: string }> = {
      PENDING: { variant: 'warning', text: 'PENDING', icon: 'bi-clock' },
      APPROVED: { variant: 'success', text: 'APPROVED', icon: 'bi-check-circle' },
      REJECTED: { variant: 'danger', text: 'REJECTED', icon: 'bi-x-circle' },
      CANCELLED: { variant: 'secondary', text: 'CANCELLED', icon: 'bi-slash-circle' },
      COMPLETED: { variant: 'primary', text: 'COMPLETED', icon: 'bi-check-circle-fill' }
    };
    
    const badgeConfig = config[status];
    if (!badgeConfig) return null;
    
    return (
      <Badge bg={badgeConfig.variant} className="d-flex align-items-center">
        <i className={`bi ${badgeConfig.icon} me-1`}></i>
        {badgeConfig.text}
      </Badge>
    );
  };

  const getEntityIcon = (entityType: string) => {
    return entityType === 'CASE' ? '📋' : '🆘';
  };

  const getUrgencyBadge = (urgency: string) => {
    const config: Record<string, { variant: string; text: string }> = {
      NORMAL: { variant: 'success', text: 'Normal' },
      URGENT: { variant: 'warning', text: 'Urgent' },
      EMERGENCY: { variant: 'danger', text: 'Emergency' }
    };
    
    const badgeConfig = config[urgency];
    if (!badgeConfig) return null;
    
    return (
      <Badge bg={badgeConfig.variant} className="me-1">
        {badgeConfig.text}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else {
      return `${diffDays}d ago`;
    }
  };

  const renderStatsCard = () => (
    <Card className="mb-4">
      <Card.Header className="bg-primary text-white d-flex justify-content-between align-items-center">
        <h5 className="mb-0">
          <i className="bi bi-graph-up me-2"></i>
          Transfer Analytics
        </h5>
        <Button 
          variant="outline-light" 
          size="sm"
          onClick={() => setShowStatsModal(true)}
        >
          <i className="bi bi-arrows-fullscreen me-1"></i>
          Full View
        </Button>
      </Card.Header>
      <Card.Body>
        {loadingStats ? (
          <div className="text-center py-3">
            <Spinner animation="border" size="sm" />
            <p className="mt-2">Loading statistics...</p>
          </div>
        ) : stats ? (
          <Row>
            <Col md={6}>
              <ListGroup variant="flush">
                <ListGroup.Item className="d-flex justify-content-between">
                  <span>This Month:</span>
                  <strong>{stats.totalTransfers} transfers</strong>
                </ListGroup.Item>
                <ListGroup.Item className="d-flex justify-content-between">
                  <span>Approval Rate:</span>
                  <strong>{stats.approvalRate}%</strong>
                </ListGroup.Item>
                <ListGroup.Item className="d-flex justify-content-between">
                  <span>Avg. Processing Time:</span>
                  <strong>{stats.averageProcessingTime} hours</strong>
                </ListGroup.Item>
                <ListGroup.Item className="d-flex justify-content-between">
                  <span>Most Common Reason:</span>
                  <strong>{stats.reasonBreakdown[0]?.reason || 'N/A'}</strong>
                </ListGroup.Item>
              </ListGroup>
            </Col>
            <Col md={6}>
              <div className="mt-3 mt-md-0">
                <h6>Status Distribution</h6>
                <div className="mb-2">
                  <div className="d-flex justify-content-between mb-1">
                    <small>Pending</small>
                    <small>{stats.pendingCount}</small>
                  </div>
                  <ProgressBar 
                    now={(stats.pendingCount / stats.totalTransfers) * 100}
                    variant="warning"
                    style={{ height: '6px' }}
                  />
                </div>
                <div className="mb-2">
                  <div className="d-flex justify-content-between mb-1">
                    <small>Approved</small>
                    <small>{stats.approvedCount}</small>
                  </div>
                  <ProgressBar 
                    now={(stats.approvedCount / stats.totalTransfers) * 100}
                    variant="success"
                    style={{ height: '6px' }}
                  />
                </div>
                <div>
                  <div className="d-flex justify-content-between mb-1">
                    <small>Rejected</small>
                    <small>{stats.rejectedCount}</small>
                  </div>
                  <ProgressBar 
                    now={(stats.rejectedCount / stats.totalTransfers) * 100}
                    variant="danger"
                    style={{ height: '6px' }}
                  />
                </div>
              </div>
            </Col>
          </Row>
        ) : (
          <Alert variant="info" className="text-center">
            <i className="bi bi-info-circle me-2"></i>
            No statistics available
          </Alert>
        )}
      </Card.Body>
    </Card>
  );

  const renderTable = () => (
    <div className="table-responsive">
      <Table hover className="align-middle">
        <thead>
          <tr>
            {isAdmin && activeTab === 'pending' && (
              <th style={{ width: '40px' }}>
                <FormCheck
                  checked={selectedRequests.length === transferRequests.length && transferRequests.length > 0}
                  onChange={handleSelectAll}
                />
              </th>
            )}
            <th>Transfer ID</th>
            <th>Entity</th>
            {activeTab === 'my_requests' || activeTab === 'all' ? (
              <>
                <th>From → To</th>
                <th>Status</th>
              </>
            ) : (
              <>
                <th>From</th>
                <th>Reason</th>
              </>
            )}
            <th>Urgency</th>
            <th>Created</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {transferRequests.map(request => (
            <tr key={request.id}>
              {isAdmin && activeTab === 'pending' && (
                <td>
                  <FormCheck
                    checked={selectedRequests.includes(request.id)}
                    onChange={() => handleSelectRequest(request.id)}
                  />
                </td>
              )}
              <td>
                <strong>{request.transferNumber}</strong>
              </td>
              <td>
                <div className="d-flex align-items-center">
                  <span className="me-2">{getEntityIcon(request.entityType)}</span>
                  <div>
                    <div>{request.entityDetails.number}</div>
                    <small className="text-muted">{request.entityDetails.type}</small>
                  </div>
                </div>
              </td>
              {activeTab === 'my_requests' || activeTab === 'all' ? (
                <>
                  <td>
                    <div className="transfer-direction">
                      <small className="text-muted">From:</small>
                      <div>{request.requester.name}</div>
                      <small className="text-muted d-block mt-1">To:</small>
                      <div>{request.recipient.name}</div>
                    </div>
                  </td>
                  <td>{getStatusBadge(request.status)}</td>
                </>
              ) : (
                <>
                  <td>
                    <div>{request.requester.name}</div>
                    <small className="text-muted">{request.requester.role}</small>
                    {request.requester.badgeNumber && (
                      <small className="text-muted d-block">Badge: {request.requester.badgeNumber}</small>
                    )}
                  </td>
                  <td>
                    <div className="text-truncate" style={{ maxWidth: '150px' }}>
                      {request.reasonCategory}
                    </div>
                  </td>
                </>
              )}
              <td>{getUrgencyBadge(request.urgency)}</td>
              <td>
                <div>{formatDate(request.createdAt)}</div>
                <small className="text-muted">{formatTimeAgo(request.createdAt)}</small>
              </td>
              <td>
                <div className="d-flex gap-1">
                  {request.status === 'PENDING' && (
                    <>
                      {(activeTab === 'to_me' || isAdmin) && (
                        <>
                          <Button
                            variant="outline-success"
                            size="sm"
                            onClick={() => handleApproveTransfer(request.id)}
                          >
                            <i className="bi bi-check"></i>
                          </Button>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => {
                              setSelectedTransfer(request);
                              setShowReviewModal(true);
                            }}
                          >
                            <i className="bi bi-x"></i>
                          </Button>
                        </>
                      )}
                      
                      {activeTab === 'my_requests' && (
                        <Button
                          variant="outline-warning"
                          size="sm"
                          onClick={() => handleCancelTransfer(request.id)}
                        >
                          <i className="bi bi-x-circle"></i>
                        </Button>
                      )}
                    </>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );

  const renderCards = () => (
    <Row className="row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
      {transferRequests.map(request => (
        <Col key={request.id}>
          <Card className="transfer-card h-100">
            <Card.Body>
              {isAdmin && activeTab === 'pending' && (
                <div className="position-absolute top-0 end-0 p-2">
                  <FormCheck
                    checked={selectedRequests.includes(request.id)}
                    onChange={() => handleSelectRequest(request.id)}
                  />
                </div>
              )}
              
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div>
                  <h6 className="mb-1">{request.transferNumber}</h6>
                  <div className="text-muted small">
                    {formatDate(request.createdAt)}
                  </div>
                </div>
                {getStatusBadge(request.status)}
              </div>
              
              <div className="mb-3">
                <div className="d-flex align-items-center mb-2">
                  <span className="me-2">{getEntityIcon(request.entityType)}</span>
                  <div>
                    <strong>{request.entityDetails.number}</strong>
                    <div className="text-muted small">{request.entityDetails.type}</div>
                  </div>
                </div>
                
                <div className="transfer-details">
                  {activeTab === 'my_requests' || activeTab === 'all' ? (
                    <>
                      <div className="d-flex justify-content-between mb-1">
                        <span className="text-muted">From:</span>
                        <span>{request.requester.name}</span>
                      </div>
                      <div className="d-flex justify-content-between mb-1">
                        <span className="text-muted">To:</span>
                        <span>{request.recipient.name}</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="d-flex justify-content-between mb-1">
                        <span className="text-muted">From:</span>
                        <span>{request.requester.name}</span>
                      </div>
                      <div className="d-flex justify-content-between mb-1">
                        <span className="text-muted">Reason:</span>
                        <span>{request.reasonCategory}</span>
                      </div>
                    </>
                  )}
                  <div className="d-flex justify-content-between">
                    <span className="text-muted">Urgency:</span>
                    <span>{getUrgencyBadge(request.urgency)}</span>
                  </div>
                </div>
              </div>
              
              <div className="d-flex justify-content-between align-items-center">
                {request.status === 'PENDING' && (
                  <div className="d-flex gap-1">
                    {(activeTab === 'to_me' || isAdmin) && (
                      <>
                        <Button
                          variant="outline-success"
                          size="sm"
                          onClick={() => handleApproveTransfer(request.id)}
                        >
                          <i className="bi bi-check"></i>
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => {
                            setSelectedTransfer(request);
                            setShowReviewModal(true);
                          }}
                        >
                          <i className="bi bi-x"></i>
                        </Button>
                      </>
                    )}
                    
                    {activeTab === 'my_requests' && (
                      <Button
                        variant="outline-warning"
                        size="sm"
                        onClick={() => handleCancelTransfer(request.id)}
                      >
                        <i className="bi bi-x-circle"></i>
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </Card.Body>
          </Card>
        </Col>
      ))}
    </Row>
  );

  const renderBulkActions = () => {
    if (!isAdmin || activeTab !== 'pending' || selectedRequests.length === 0) {
      return null;
    }

    return (
      <Card className="mb-4">
        <Card.Body className="bg-light">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h6 className="mb-0">
                <i className="bi bi-check-all me-2"></i>
                Bulk Actions ({selectedRequests.length} selected)
              </h6>
              <small className="text-muted">
                Apply actions to all selected transfers
              </small>
            </div>
            <div className="d-flex gap-2">
              <Button variant="success" size="sm" onClick={handleBulkApprove}>
                <i className="bi bi-check-circle me-1"></i>
                BULK APPROVE
              </Button>
              <Button variant="danger" size="sm" onClick={handleBulkReject}>
                <i className="bi bi-x-circle me-1"></i>
                BULK REJECT
              </Button>
              <Button variant="outline-secondary" size="sm">
                <i className="bi bi-download me-1"></i>
                EXPORT LOG
              </Button>
              <Button
                variant="link"
                className="text-danger"
                size="sm"
                onClick={() => setSelectedRequests([])}
              >
                Clear Selection
              </Button>
            </div>
          </div>
        </Card.Body>
      </Card>
    );
  };

  const renderPagination = () => {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    if (totalPages <= 1) return null;

    return (
      <div className="d-flex justify-content-center mt-4">
        <Pagination>
          <Pagination.First 
            onClick={() => setCurrentPage(1)} 
            disabled={currentPage === 1}
          />
          <Pagination.Prev 
            onClick={() => setCurrentPage(currentPage - 1)} 
            disabled={currentPage === 1}
          />
          
          {[...Array(Math.min(5, totalPages))].map((_, i) => {
            let pageNum;
            if (totalPages <= 5) {
              pageNum = i + 1;
            } else if (currentPage <= 3) {
              pageNum = i + 1;
            } else if (currentPage >= totalPages - 2) {
              pageNum = totalPages - 4 + i;
            } else {
              pageNum = currentPage - 2 + i;
            }
            
            return (
              <Pagination.Item
                key={pageNum}
                active={pageNum === currentPage}
                onClick={() => setCurrentPage(pageNum)}
              >
                {pageNum}
              </Pagination.Item>
            );
          })}
          
          <Pagination.Next 
            onClick={() => setCurrentPage(currentPage + 1)} 
            disabled={currentPage === totalPages}
          />
          <Pagination.Last 
            onClick={() => setCurrentPage(totalPages)} 
            disabled={currentPage === totalPages}
          />
        </Pagination>
      </div>
    );
  };

  const renderReviewModal = () => (
    <Modal show={showReviewModal} onHide={() => setShowReviewModal(false)}>
      <Modal.Header closeButton>
        <Modal.Title>
          <i className="bi bi-search me-2"></i>
          Review Transfer Request
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {selectedTransfer && (
          <div>
            <Alert variant="info">
              <strong>{selectedTransfer.transferNumber}</strong>
              <div className="small">
                {getEntityIcon(selectedTransfer.entityType)} {selectedTransfer.entityDetails.number}
              </div>
            </Alert>
            
            <Table bordered size="sm" className="mb-3">
              <tbody>
                <tr>
                  <td style={{ width: '30%' }}><strong>From:</strong></td>
                  <td>{selectedTransfer.requester.name}</td>
                </tr>
                <tr>
                  <td><strong>To:</strong></td>
                  <td>{selectedTransfer.recipient.name}</td>
                </tr>
                <tr>
                  <td><strong>Reason:</strong></td>
                  <td>{selectedTransfer.reasonCategory}</td>
                </tr>
                <tr>
                  <td><strong>Urgency:</strong></td>
                  <td>{getUrgencyBadge(selectedTransfer.urgency)}</td>
                </tr>
                <tr>
                  <td><strong>Details:</strong></td>
                  <td>{selectedTransfer.detailedReason}</td>
                </tr>
              </tbody>
            </Table>
            
            <Form.Group className="mb-3">
              <Form.Label>Rejection Reason (Optional)</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Provide reason for rejection..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
              />
            </Form.Group>
          </div>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={() => setShowReviewModal(false)}>
          Cancel
        </Button>
        <Button 
          variant="success" 
          onClick={() => {
            if (selectedTransfer) {
              handleApproveTransfer(selectedTransfer.id);
            }
            setShowReviewModal(false);
          }}
        >
          <i className="bi bi-check me-2"></i>
          Approve
        </Button>
        <Button 
          variant="danger" 
          onClick={() => {
            if (selectedTransfer) {
              handleRejectTransfer(selectedTransfer.id, rejectReason);
            }
          }}
        >
          <i className="bi bi-x me-2"></i>
          Reject
        </Button>
      </Modal.Footer>
    </Modal>
  );

  const renderStatsModal = () => (
    <Modal show={showStatsModal} onHide={() => setShowStatsModal(false)} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>
          <i className="bi bi-graph-up me-2"></i>
          Transfer Analytics Dashboard
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {loadingStats ? (
          <div className="text-center py-5">
            <Spinner animation="border" />
            <p className="mt-3">Loading analytics...</p>
          </div>
        ) : stats ? (
          <div>
            {}
            <Row className="g-3 mb-4">
              <Col md={3}>
                <Card className="text-center border-0 bg-light">
                  <Card.Body>
                    <h2 className="text-primary">{stats.totalTransfers}</h2>
                    <small className="text-muted">Total Transfers</small>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={3}>
                <Card className="text-center border-0 bg-light">
                  <Card.Body>
                    <h2 className="text-success">{stats.approvalRate}%</h2>
                    <small className="text-muted">Approval Rate</small>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={3}>
                <Card className="text-center border-0 bg-light">
                  <Card.Body>
                    <h2 className="text-warning">{stats.pendingCount}</h2>
                    <small className="text-muted">Pending</small>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={3}>
                <Card className="text-center border-0 bg-light">
                  <Card.Body>
                    <h2 className="text-info">{stats.averageProcessingTime}h</h2>
                    <small className="text-muted">Avg. Processing Time</small>
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            {}
            <Card className="mb-4">
              <Card.Header>
                <h5 className="mb-0">Reason Breakdown</h5>
              </Card.Header>
              <Card.Body>
                <ListGroup variant="flush">
                  {stats.reasonBreakdown.map(reason => (
                    <ListGroup.Item key={reason.reason} className="d-flex justify-content-between align-items-center">
                      <span>{reason.reason}</span>
                      <div className="d-flex align-items-center">
                        <span className="me-3">{reason.count} ({reason.percentage}%)</span>
                        <ProgressBar 
                          now={reason.percentage} 
                          style={{ width: '100px', height: '6px' }}
                          variant="info"
                        />
                      </div>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              </Card.Body>
            </Card>

            {}
            <Row>
              <Col md={6}>
                <Card className="h-100">
                  <Card.Header>
                    <h5 className="mb-0">Top Requesters</h5>
                  </Card.Header>
                  <Card.Body>
                    <ListGroup variant="flush">
                      {stats.topRequesters.map(requester => (
                        <ListGroup.Item key={requester.name} className="d-flex justify-content-between">
                          <div>
                            <strong>{requester.name}</strong>
                            <div className="text-muted small">{requester.role}</div>
                          </div>
                          <Badge bg="primary">{requester.transfers} transfers</Badge>
                        </ListGroup.Item>
                      ))}
                    </ListGroup>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={6}>
                <Card className="h-100">
                  <Card.Header>
                    <h5 className="mb-0">Top Recipients</h5>
                  </Card.Header>
                  <Card.Body>
                    <ListGroup variant="flush">
                      {stats.topRecipients.map(recipient => (
                        <ListGroup.Item key={recipient.name} className="d-flex justify-content-between">
                          <div>
                            <strong>{recipient.name}</strong>
                            <div className="text-muted small">{recipient.role}</div>
                          </div>
                          <Badge bg="success">{recipient.received} received</Badge>
                        </ListGroup.Item>
                      ))}
                    </ListGroup>
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            {}
            <Card className="mt-4">
              <Card.Header>
                <h5 className="mb-0">Monthly Statistics</h5>
              </Card.Header>
              <Card.Body>
                <Table bordered size="sm">
                  <thead>
                    <tr>
                      <th>Month</th>
                      <th>Total Transfers</th>
                      <th>Approved</th>
                      <th>Rejected</th>
                      <th>Approval Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.monthlyStats.map(month => {
                      const approvalRate = month.transfers > 0 
                        ? Math.round((month.approved / month.transfers) * 100) 
                        : 0;
                      
                      return (
                        <tr key={month.month}>
                          <td>{month.month}</td>
                          <td>{month.transfers}</td>
                          <td className="text-success">{month.approved}</td>
                          <td className="text-danger">{month.rejected}</td>
                          <td>
                            <Badge bg={approvalRate >= 80 ? 'success' : approvalRate >= 60 ? 'warning' : 'danger'}>
                              {approvalRate}%
                            </Badge>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          </div>
        ) : (
          <Alert variant="info" className="text-center">
            <i className="bi bi-info-circle me-2"></i>
            No statistics available
          </Alert>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={() => setShowStatsModal(false)}>
          Close
        </Button>
        <Button variant="outline-primary">
          <i className="bi bi-download me-2"></i>
          Export Analytics
        </Button>
      </Modal.Footer>
    </Modal>
  );

  return (
    <Container className="py-4">
      <div className="page-header mb-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <h1 className="display-6 fw-bold text-primary mb-2">
              <i className="bi bi-arrow-left-right me-3"></i>
              Transfer Management
            </h1>
            <p className="text-muted mb-0">
              Manage case and help request transfers between officers and social workers
            </p>
          </div>
          <div className="d-flex gap-2">
            {!isSocialWorker && (
              <Button 
                variant="primary"
                onClick={() => navigate('/transfers/new')}
              >
                <i className="bi bi-plus-circle me-2"></i>
                New Transfer
              </Button>
            )}
            <Button 
              variant="outline-secondary"
              onClick={() => setViewMode(viewMode === 'table' ? 'cards' : 'table')}
            >
              <i className={`bi bi-${viewMode === 'table' ? 'grid' : 'list'} me-2`}></i>
              {viewMode === 'table' ? 'Cards View' : 'Table View'}
            </Button>
            <Dropdown>
              <Dropdown.Toggle variant="outline-primary">
                <i className="bi bi-gear me-2"></i>
                Options
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item>
                  <i className="bi bi-funnel me-2"></i>
                  Filter Options
                </Dropdown.Item>
                <Dropdown.Item>
                  <i className="bi bi-sort-down me-2"></i>
                  Sort By
                </Dropdown.Item>
                <Dropdown.Divider />
                <Dropdown.Item>
                  <i className="bi bi-download me-2"></i>
                  Export Data
                </Dropdown.Item>
                <Dropdown.Item>
                  <i className="bi bi-printer me-2"></i>
                  Print Report
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </div>
        </div>

        {}
        <div className="role-indicator mb-4">
          <Badge bg={isAdmin ? 'danger' : isPoliceOfficer ? 'warning' : 'success'} className="px-3 py-2">
            <i className={`bi bi-${isAdmin ? 'shield' : isPoliceOfficer ? 'shield-check' : 'heart'} me-2`}></i>
            {isAdmin ? 'Administrator View' : isPoliceOfficer ? 'Police Officer View' : 'Social Worker View'}
          </Badge>
        </div>

        {}
        {error && (
          <Alert variant="danger" dismissible onClose={() => setError(null)} className="mb-4">
            <Alert.Heading>
              <i className="bi bi-exclamation-triangle me-2"></i>
              Error
            </Alert.Heading>
            <p className="mb-0">{error}</p>
          </Alert>
        )}

        {}
        {renderStatsCard()}

        {}
        <Card className="mb-4">
          <Card.Header className="bg-light">
            <Nav variant="tabs" activeKey={activeTab} onSelect={(key) => setActiveTab(key || 'my_requests')}>
              {Object.entries(tabs).map(([key, label]) => (
                <Nav.Item key={key}>
                  <Nav.Link eventKey={key}>{label}</Nav.Link>
                </Nav.Item>
              ))}
            </Nav>
          </Card.Header>
          <Card.Body>
            {}
            {renderBulkActions()}

            {}
            {loading && (
              <div className="text-center py-5">
                <Spinner animation="border" variant="primary" />
                <p className="mt-3">Loading transfer requests...</p>
              </div>
            )}

            {}
            {!loading && transferRequests.length === 0 && (
              <div className="text-center py-5">
                <div className="mb-3">
                  <i className="bi bi-arrow-left-right text-muted" style={{ fontSize: '4rem' }}></i>
                </div>
                <h4 className="text-muted mb-3">No Transfer Requests Found</h4>
                <p className="text-muted mb-4">
                  {activeTab === 'my_requests' ? 'You have not created any transfer requests.' :
                   activeTab === 'to_me' ? 'No transfer requests have been sent to you.' :
                   activeTab === 'pending' ? 'No pending transfers require approval.' :
                   'No transfer requests found in the system.'}
                </p>
                {activeTab === 'my_requests' && !isSocialWorker && (
                  <Button 
                    variant="primary"
                    onClick={() => navigate('/transfers/new')}
                  >
                    <i className="bi bi-plus-circle me-2"></i>
                    Create Your First Transfer
                  </Button>
                )}
              </div>
            )}

            {}
            {!loading && transferRequests.length > 0 && (
              <>
                {}
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div>
                    <span className="text-muted">
                      Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
                      {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} transfers
                    </span>
                  </div>
                  <div className="d-flex gap-2">
                    <Dropdown>
                      <Dropdown.Toggle variant="outline-secondary" size="sm">
                        <i className="bi bi-filter me-2"></i>
                        Filter
                      </Dropdown.Toggle>
                      <Dropdown.Menu>
                        <Dropdown.Item>All Status</Dropdown.Item>
                        <Dropdown.Item>Pending Only</Dropdown.Item>
                        <Dropdown.Item>Approved Only</Dropdown.Item>
                        <Dropdown.Item>Rejected Only</Dropdown.Item>
                        <Dropdown.Divider />
                        <Dropdown.Item>Cases Only</Dropdown.Item>
                        <Dropdown.Item>Help Requests Only</Dropdown.Item>
                      </Dropdown.Menu>
                    </Dropdown>
                    <Dropdown>
                      <Dropdown.Toggle variant="outline-secondary" size="sm">
                        <i className="bi bi-sort-down me-2"></i>
                        Sort
                      </Dropdown.Toggle>
                      <Dropdown.Menu>
                        <Dropdown.Item>Newest First</Dropdown.Item>
                        <Dropdown.Item>Oldest First</Dropdown.Item>
                        <Dropdown.Divider />
                        <Dropdown.Item>Urgency (High to Low)</Dropdown.Item>
                        <Dropdown.Item>Urgency (Low to High)</Dropdown.Item>
                      </Dropdown.Menu>
                    </Dropdown>
                  </div>
                </div>

                {}
                {viewMode === 'table' ? renderTable() : renderCards()}

                {}
                {renderPagination()}
              </>
            )}
          </Card.Body>
        </Card>

        {}
        {stats && !loadingStats && (
          <Card className="mb-4">
            <Card.Header className="bg-light">
              <h5 className="mb-0">
                <i className="bi bi-speedometer2 me-2"></i>
                Quick Stats
              </h5>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={3}>
                  <div className="text-center">
                    <div className="display-6 text-warning">{stats.pendingCount}</div>
                    <small className="text-muted">Pending Transfers</small>
                  </div>
                </Col>
                <Col md={3}>
                  <div className="text-center">
                    <div className="display-6 text-success">{stats.approvedCount}</div>
                    <small className="text-muted">Approved This Month</small>
                  </div>
                </Col>
                <Col md={3}>
                  <div className="text-center">
                    <div className="display-6 text-danger">{stats.rejectedCount}</div>
                    <small className="text-muted">Rejected This Month</small>
                  </div>
                </Col>
                <Col md={3}>
                  <div className="text-center">
                    <div className="display-6 text-primary">{stats.averageProcessingTime}h</div>
                    <small className="text-muted">Avg. Processing Time</small>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        )}

        {}
        <Card>
          <Card.Header className="bg-light">
            <h5 className="mb-0">
              <i className="bi bi-info-circle me-2"></i>
              Status Legend
            </h5>
          </Card.Header>
          <Card.Body>
            <div className="d-flex flex-wrap gap-3">
              <div className="d-flex align-items-center">
                <Badge bg="warning" className="me-2">PENDING</Badge>
                <small className="text-muted">Awaiting approval/review</small>
              </div>
              <div className="d-flex align-items-center">
                <Badge bg="success" className="me-2">APPROVED</Badge>
                <small className="text-muted">Transfer approved</small>
              </div>
              <div className="d-flex align-items-center">
                <Badge bg="danger" className="me-2">REJECTED</Badge>
                <small className="text-muted">Transfer rejected</small>
              </div>
              <div className="d-flex align-items-center">
                <Badge bg="secondary" className="me-2">CANCELLED</Badge>
                <small className="text-muted">Transfer cancelled by requester</small>
              </div>
              <div className="d-flex align-items-center">
                <Badge bg="primary" className="me-2">COMPLETED</Badge>
                <small className="text-muted">Transfer completed</small>
              </div>
            </div>
          </Card.Body>
        </Card>

        {}
        {renderReviewModal()}
        {renderStatsModal()}
      </div>
    </Container>
  );
};

export default ManageTransfersPage;
                 