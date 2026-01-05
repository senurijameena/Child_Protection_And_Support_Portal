import React, { useState, useEffect } from 'react';
import {
  Row, Col, Card, Button, Spinner, Alert,
  Table, Badge, Dropdown
} from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

import { transferService } from '../../services/transferService.js';
import './TransferRequestManagement.css';

interface Transfer {
  id: string;
  transferId?: string;
  transferType: string;
  type: string;
  fromUserId: string;
  fromUserName: string;
  fromUser?: string;
  toUserId: string;
  toUserName: string;
  toUser?: string;
  reason: string;
  transferReason?: string;
  status: string;
  entityId: string;
  caseId?: string;
  helpRequestId?: string;
  createdAt?: string;
  requestedDate?: string;
}

const TransferRequestManagement: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [filterType, setFilterType] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('PENDING');

  useEffect(() => {
    fetchTransfers();
  }, [filterType]);

  const fetchTransfers = async () => {
    try {
      setLoading(true);
      let response;
      
      if (filterType === 'PENDING') {
        response = await transferService.getPendingTransfers();
      } else if (filterType === 'APPROVED') {
        response = await transferService.getApprovedTransfers?.() || { data: [] };
      } else if (filterType === 'REJECTED') {
        response = await transferService.getRejectedTransfers?.() || { data: [] };
      } else {
        response = await transferService.getAllTransfers?.() || { data: [] };
      }

      if (response.data && Array.isArray(response.data)) {
        const formattedTransfers = response.data.map((t: any) => ({
          id: t.id || t.transferId,
          transferId: t.transferId || t.id,
          transferType: t.transferType || t.type || (t.caseId ? 'Case' : 'Help Request'),
          type: t.transferType || t.type || (t.caseId ? 'Case' : 'Help Request'),
          fromUserId: t.fromUserId || t.requestedBy,
          fromUserName: t.fromUserName || t.fromUser || 'User',
          toUserId: t.toUserId || t.requestedTo,
          toUserName: t.toUserName || t.toUser || 'User',
          reason: t.reason || t.transferReason || 'N/A',
          status: t.status || 'PENDING',
          entityId: t.caseId || t.helpRequestId || t.entityId,
          caseId: t.caseId,
          helpRequestId: t.helpRequestId,
          createdAt: t.createdAt || t.requestedDate
        }));
        setTransfers(formattedTransfers);
      }
    } catch (err: any) {
      console.error('Error fetching transfers:', err);
      setError(err.response?.data?.message || 'Failed to load transfers');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (transferId: string) => {
    try {
      await transferService.approveTransfer(transferId);
      setSuccess('Transfer approved successfully');
      fetchTransfers();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to approve transfer');
    }
  };

  const handleReject = async (transferId: string) => {
    try {
      await transferService.rejectTransfer(transferId);
      setSuccess('Transfer rejected successfully');
      fetchTransfers();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to reject transfer');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusUpper = status.toUpperCase();
    if (statusUpper === 'APPROVED') {
      return <Badge bg="success">Approved</Badge>;
    }
    if (statusUpper === 'REJECTED') {
      return <Badge bg="danger">Rejected</Badge>;
    }
    if (statusUpper === 'PENDING') {
      return <Badge bg="warning">Pending</Badge>;
    }
    return <Badge bg="secondary">{status}</Badge>;
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Loading transfers...</p>
      </div>
    );
  }

  return (
    <div className="transfer-request-management">
      <div className="page-header mb-4">
        <h2 className="page-title">🔄 Transfer Request Management</h2>
        <p className="page-subtitle">Review and manage case and help request transfers</p>
      </div>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert variant="success" dismissible onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      {}
      <Card className="mb-4">
        <Card.Body>
          <div className="d-flex gap-2">
            <Button
              variant={filterType === 'ALL' ? 'primary' : 'outline-primary'}
              onClick={() => setFilterType('ALL')}
            >
              All Transfers
            </Button>
            <Button
              variant={filterType === 'PENDING' ? 'primary' : 'outline-primary'}
              onClick={() => setFilterType('PENDING')}
            >
              Pending ({transfers.filter(t => t.status === 'PENDING').length})
            </Button>
            <Button
              variant={filterType === 'APPROVED' ? 'primary' : 'outline-primary'}
              onClick={() => setFilterType('APPROVED')}
            >
              Approved
            </Button>
            <Button
              variant={filterType === 'REJECTED' ? 'primary' : 'outline-primary'}
              onClick={() => setFilterType('REJECTED')}
            >
              Rejected
            </Button>
          </div>
        </Card.Body>
      </Card>

      {}
      <Card>
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">
            {filterType === 'PENDING' ? 'Pending' : filterType === 'APPROVED' ? 'Approved' : filterType === 'REJECTED' ? 'Rejected' : 'All'} 
            {' '}Transfers ({transfers.length})
          </h5>
          <Button variant="primary" onClick={fetchTransfers}>
            <i className="bi bi-arrow-clockwise me-2"></i>
            Refresh
          </Button>
        </Card.Header>
        <Card.Body>
          {transfers.length === 0 ? (
            <div className="text-center py-5">
              <p className="text-muted">No transfers found</p>
            </div>
          ) : (
            <Table responsive hover>
              <thead>
                <tr>
                  <th>Entity</th>
                  <th>From</th>
                  <th>To</th>
                  <th>Reason</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {transfers.map((transfer) => (
                  <tr key={transfer.id}>
                    <td>
                      <Badge bg="info">{transfer.transferType}</Badge>
                      <br />
                      <small className="text-muted">
                        {transfer.transferType === 'Case' ? 
                          (transfer.caseId || transfer.entityId) : 
                          (transfer.helpRequestId || transfer.entityId)}
                      </small>
                    </td>
                    <td>{transfer.fromUserName}</td>
                    <td>{transfer.toUserName}</td>
                    <td>{transfer.reason}</td>
                    <td>
                      {transfer.createdAt ? 
                        new Date(transfer.createdAt).toLocaleDateString() : 
                        'N/A'}
                    </td>
                    <td>{getStatusBadge(transfer.status)}</td>
                    <td>
                      {transfer.status === 'PENDING' ? (
                        <div className="d-flex gap-2">
                          <Button
                            variant="success"
                            size="sm"
                            onClick={() => handleApprove(transfer.id)}
                          >
                            ✔ Approve
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleReject(transfer.id)}
                          >
                            ✖ Reject
                          </Button>
                        </div>
                      ) : (
                        <Button
                          variant="link"
                          size="sm"
                          onClick={() => {
                            if (transfer.transferType === 'Case') {
                              navigate(`/admin/cases/${transfer.entityId}`);
                            } else {
                              navigate(`/admin/help-requests/${transfer.entityId}`);
                            }
                          }}
                        >
                          View Entity
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>
    </div>
  );
};

export default TransferRequestManagement;

