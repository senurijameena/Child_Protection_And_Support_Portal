import React, { useState } from 'react';
import { Row, Col, Button, ButtonGroup, Alert, Modal, Form, Spinner, Card } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAdminDashboardData } from '../../hooks/useAdminDashboardData';
import { helpRequestService } from '../../services/helpRequestService';
import { transferService } from '../../services/transferService';
import { DoughnutChart, BarChart } from '../../components/charts';
import StatCard from '../../components/dashboard/StatCard';
import RecentCasesTable from '../../components/dashboard/RecentCasesTable';
import RecentHelpRequestsTable from '../../components/dashboard/RecentHelpRequestsTable';
import '../../components/modern/GlassCard.css';
import './AdminDashboard.css';

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [dateFilter, setDateFilter] = useState('today');
  const {
    loading,
    error,
    stats,
    recentCases,
    recentHelpRequests,
    pendingTransfers,
    caseStatusDistribution,
    helpRequestTypeDistribution,
    socialWorkers,
    refresh
  } = useAdminDashboardData(dateFilter);

  // Modal State
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [selectedWorkerId, setSelectedWorkerId] = useState<string>('');
  const [assigning, setAssigning] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [workerSearchQuery, setWorkerSearchQuery] = useState('');
  const [actionError, setActionError] = useState<string | null>(null);

  const handleOpenAssignModal = (requestId: string) => {
    setSelectedRequestId(requestId);
    setShowAssignModal(true);
  };

  const handleAssignWorker = async () => {
    if (!selectedRequestId || !selectedWorkerId) return;

    try {
      setAssigning(true);
      setActionError(null);
      await helpRequestService.assignSocialWorker(selectedRequestId, selectedWorkerId);

      setSuccessMessage('Help request assigned successfully!');
      setShowAssignModal(false);
      setSelectedRequestId(null);
      setSelectedWorkerId('');
      setWorkerSearchQuery('');

      refresh();

      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      console.error('Error assigning worker:', err);
      setActionError(err.response?.data?.message || 'Failed to assign help request');
    } finally {
      setAssigning(false);
    }
  };

  const approveTransfer = async (id: string) => {
    try {
      await transferService.approveTransfer(id);
      refresh();
      setSuccessMessage('Transfer approved successfully');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error('Error approving transfer:', err);
    }
  };

  const rejectTransfer = async (id: string) => {
    try {
      await transferService.rejectTransfer(id, 'Rejected by admin');
      refresh();
      setSuccessMessage('Transfer rejected');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error('Error rejecting transfer:', err);
    }
  };


  const filteredWorkers = socialWorkers.filter(worker =>
    worker.fullName.toLowerCase().includes(workerSearchQuery.toLowerCase()) ||
    worker.specialization.toLowerCase().includes(workerSearchQuery.toLowerCase())
  );

  if (loading && stats.totalCases === 0) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <Spinner animation="border" variant="primary" />
        <span className="ms-3 text-muted">Loading dashboard...</span>
      </div>
    );
  }

  return (
    <div className="admin-dashboard container-fluid px-4 py-4">
      {/* Header Section */}
      <div className="d-flex justify-content-between align-items-center mb-5">
        <div>
          <h2 className="fw-bold mb-1 text-dark">Admin Overview</h2>
          <p className="text-muted mb-0">Welcome back! Here's what's happening today.</p>
        </div>
        <ButtonGroup className="bg-white rounded-pill shadow-sm p-1">
          {['today', '7days', '30days'].map((filter) => (
            <Button
              key={filter}
              variant={dateFilter === filter ? 'primary' : 'light'}
              size="sm"
              onClick={() => setDateFilter(filter)}
              className="rounded-pill px-3 py-1 border-0 fw-medium"
            >
              {filter === 'today' ? 'Today' : filter === '7days' ? 'Week' : 'Month'}
            </Button>
          ))}
        </ButtonGroup>
      </div>

      {(error || actionError) && (
        <Alert variant="danger" dismissible onClose={() => { setError(null); setActionError(null); }}>
          {error || actionError}
        </Alert>
      )}

      {successMessage && (
        <Alert variant="success" dismissible onClose={() => setSuccessMessage(null)}>
          {successMessage}
        </Alert>
      )}

      {/* Stats Grid */}
      <Row className="g-4 mb-5">
        <Col md={6} lg={3}>
          <StatCard
            title="Total Cases"
            value={stats.totalCases.toLocaleString()}
            icon={<i className="bi bi-file-earmark-text"></i>}
            colorVariant="blue"
            onClick={() => navigate('/admin/cases/all')}
          />
        </Col>
        <Col md={6} lg={3}>
          <StatCard
            title="Active Cases"
            value={stats.activeCases.toLocaleString()}
            icon={<i className="bi bi-arrow-repeat"></i>}
            colorVariant="yellow"
            onClick={() => navigate('/admin/cases/assigned')}
          />
        </Col>
        <Col md={6} lg={3}>
          <StatCard
            title="Emergencies"
            value={stats.emergencyCases.toLocaleString()}
            icon={<i className="bi bi-exclamation-triangle"></i>}
            colorVariant="red"
            onClick={() => navigate('/admin/cases/emergency')}
          />
        </Col>
        <Col md={6} lg={3}>
          <StatCard
            title="Requests"
            value={stats.totalHelpRequests.toLocaleString()}
            icon={<i className="bi bi-hand-thumbs-up"></i>}
            colorVariant="purple"
            onClick={() => navigate('/admin/help-requests/all')}
          />
        </Col>
      </Row>

      {/* User Stats Row */}
      <Row className="g-4 mb-5">
        <Col md={4}>
          <div className="glass-card d-flex align-items-center justify-content-between cursor-pointer" onClick={() => navigate('/admin/users/public')}>
            <div>
              <h3 className="fw-bold mb-0">{stats.totalPublicUsers}</h3>
              <small className="text-muted text-uppercase fw-bold">Public Users</small>
            </div>
            <div className="text-primary bg-primary-subtle p-3 rounded-circle">
              <i className="bi bi-people fs-4"></i>
            </div>
          </div>
        </Col>
        <Col md={4}>
          <div className="glass-card d-flex align-items-center justify-content-between cursor-pointer" onClick={() => navigate('/admin/users/police')}>
            <div>
              <h3 className="fw-bold mb-0">{stats.policeOfficers}</h3>
              <small className="text-muted text-uppercase fw-bold">Police Officers</small>
            </div>
            <div className="text-info bg-info-subtle p-3 rounded-circle">
              <i className="bi bi-shield-check fs-4"></i>
            </div>
          </div>
        </Col>
        <Col md={4}>
          <div className="glass-card d-flex align-items-center justify-content-between cursor-pointer" onClick={() => navigate('/admin/users/social-workers')}>
            <div>
              <h3 className="fw-bold mb-0">{stats.socialWorkers}</h3>
              <small className="text-muted text-uppercase fw-bold">Social Workers</small>
            </div>
            <div className="text-success bg-success-subtle p-3 rounded-circle">
              <i className="bi bi-heart-pulse fs-4"></i>
            </div>
          </div>
        </Col>
      </Row>

      {/* Main Content Grid */}
      <Row className="g-4 mb-5">
        {/* Charts & Analytics */}
        <Col xl={8}>
          <Row className="g-4 mb-4">
            <Col md={6}>
              <div className="glass-card h-100 p-4">
                <h5 className="fw-bold mb-4">Case Status Distribution</h5>
                {caseStatusDistribution.length > 0 ? (
                  <DoughnutChart data={caseStatusDistribution} labelKey="status" valueKey="count" height={250} />
                ) : <p className="text-muted">No data available</p>}
              </div>
            </Col>
            <Col md={6}>
              <div className="glass-card h-100 p-4">
                <h5 className="fw-bold mb-4">Help Types</h5>
                {helpRequestTypeDistribution.length > 0 ? (
                  <BarChart data={helpRequestTypeDistribution} xKey="type" yKey="count" height={250} color="#3B82F6" />
                ) : <p className="text-muted">No data available</p>}
              </div>
            </Col>
          </Row>

          {/* Recent Data Tables */}
          <div className="mb-4" style={{ minHeight: '400px' }}>
            <RecentCasesTable cases={recentCases} />
          </div>
          <div style={{ minHeight: '400px' }}>
            <RecentHelpRequestsTable requests={recentHelpRequests} onAssign={handleOpenAssignModal} />
          </div>

        </Col>

        {/* Sidebar Widgets */}
        <Col xl={4}>
          {/* Pending Approvals Widget */}
          <div className="glass-card mb-4 p-4 text-center">
            <div className="mb-3">
              <span className="display-4 fw-bold text-warning">{stats.pendingApprovals}</span>
            </div>
            <h5 className="fw-bold">Pending Approvals</h5>
            <p className="text-muted mb-4 small">New users awaiting veirfication</p>
            <Button variant="warning" className="w-100 text-white fw-bold rounded-pill" onClick={() => navigate('/admin/users')}>
              Review Approvals
            </Button>
          </div>

          {/* Pending Transfers Widget */}
          <div className="glass-card p-0 overflow-hidden">
            <div className="p-4 border-bottom bg-light bg-opacity-50">
              <h5 className="mb-0 fw-bold">Pending Transfers</h5>
            </div>
            <div className="p-2">
              {pendingTransfers.length > 0 ? (
                pendingTransfers.slice(0, 5).map((t, idx) => (
                  <div key={t.id} className={`p-3 d-flex justify-content-between align-items-center ${idx !== pendingTransfers.length - 1 ? 'border-bottom' : ''}`}>
                    <div>
                      <div className="fw-bold text-dark small">{t.type} Transfer</div>
                      <div className="text-muted x-small" style={{ fontSize: '0.75rem' }}>
                        From: {t.fromUserName || t.fromUserId.substring(0, 5)} <br />
                        To: {t.toUserName || t.toUserId.substring(0, 5)}
                      </div>
                    </div>
                    <div className="d-flex gap-2">
                      <Button variant="outline-success" size="sm" className="rounded-circle p-0 d-flex align-items-center justify-content-center" style={{ width: '28px', height: '28px' }} onClick={() => approveTransfer(t.id)}>
                        <i className="bi bi-check"></i>
                      </Button>
                      <Button variant="outline-danger" size="sm" className="rounded-circle p-0 d-flex align-items-center justify-content-center" style={{ width: '28px', height: '28px' }} onClick={() => rejectTransfer(t.id)}>
                        <i className="bi bi-x"></i>
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-muted small">No pending transfers</div>
              )}
            </div>
            {pendingTransfers.length > 5 && (
              <div className="p-3 border-top text-center bg-light bg-opacity-25">
                <Button variant="link" size="sm" onClick={() => navigate('/admin/transfers')}>View All</Button>
              </div>
            )}
          </div>
        </Col>
      </Row>

      {/* Assignment Modal */}
      <Modal show={showAssignModal} onHide={() => { setShowAssignModal(false); setWorkerSearchQuery(''); }} centered size="lg" backdrop="static">
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fw-bold">Assign Social Worker</Modal.Title>
        </Modal.Header>
        <Modal.Body className="pt-4">
          <div className="mb-4 bg-light p-3 rounded-3">
            <div className="d-flex justify-content-between">
              <span className="text-muted">Request ID:</span>
              <span className="fw-bold font-monospace">{selectedRequestId}</span>
            </div>
          </div>

          <Form.Control
            type="text"
            placeholder="Search workers..."
            value={workerSearchQuery}
            onChange={(e) => setWorkerSearchQuery(e.target.value)}
            className="mb-4 rounded-pill px-4 py-2 border-primary-subtle shadow-sm"
          />

          <div className="list-group list-group-flush border rounded-3 overflow-auto" style={{ maxHeight: '300px' }}>
            {filteredWorkers.map(worker => (
              <button
                key={worker.userId}
                className={`list-group-item list-group-item-action d-flex align-items-center justify-content-between p-3 ${selectedWorkerId === worker.userId ? 'active bg-primary border-primary' : ''}`}
                onClick={() => setSelectedWorkerId(worker.userId)}
              >
                <div className="d-flex align-items-center">
                  <div className={`avatar rounded-circle d-flex align-items-center justify-content-center me-3 text-white fw-bold ${selectedWorkerId === worker.userId ? 'bg-white text-primary' : 'bg-secondary'}`} style={{ width: '40px', height: '40px' }}>
                    {worker.fullName.charAt(0)}
                  </div>
                  <div>
                    <div className="fw-bold">{worker.fullName}</div>
                    <small className={`opacity-75 ${selectedWorkerId === worker.userId ? 'text-white' : 'text-muted'}`}>{worker.specialization}</small>
                  </div>
                </div>
                {selectedWorkerId === worker.userId && <i className="bi bi-check-circle-fill fs-5"></i>}
              </button>
            ))}
          </div>
        </Modal.Body>
        <Modal.Footer className="border-0 pt-0">
          <Button variant="light" onClick={() => setShowAssignModal(false)}>Cancel</Button>
          <Button variant="primary" onClick={handleAssignWorker} disabled={!selectedWorkerId || assigning}>
            {assigning ? <Spinner size="sm" animation="border" /> : 'Confirm Assignment'}
          </Button>
        </Modal.Footer>
      </Modal>

    </div>
  );
};

export default AdminDashboard;
