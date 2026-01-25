import React, { useState } from 'react';
import { Row, Col, Button, ButtonGroup, Alert, Modal, Form, Spinner, Card, Badge, Table } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import { useAdminDashboardData } from '../../hooks/useAdminDashboardData';
import { helpRequestService } from '../../services/helpRequestService';
import { transferService } from '../../services/transferService';
import { DoughnutChart, BarChart, LineChart } from '../../components/charts';
import StatCard from '../../components/dashboard/StatCard';
import RecentCasesTable from '../../components/dashboard/RecentCasesTable';
import RecentHelpRequestsTable from '../../components/dashboard/RecentHelpRequestsTable';
import './AdminDashboard.css';

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [dateFilter, setDateFilter] = useState('7days');
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

  // Modal State for Assignment
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
      refresh();
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setActionError(err.response?.data?.message || 'Failed to assign help request');
    } finally {
      setAssigning(false);
    }
  };

  const filteredWorkers = socialWorkers.filter(worker =>
    worker.fullName.toLowerCase().includes(workerSearchQuery.toLowerCase()) ||
    worker.specialization.toLowerCase().includes(workerSearchQuery.toLowerCase())
  );

  // Mocked Activity Feed Data for visual completeness
  const activityFeed = [
    { id: 1, type: 'CASE', action: 'New Critical Incident', user: 'System Bot', time: '2 mins ago', color: 'red' },
    { id: 2, type: 'USER', action: 'Officer Raj verified', user: 'Admin Sarah', time: '15 mins ago', color: 'blue' },
    { id: 3, type: 'HELP', action: 'Emergency Support Match', user: 'Auto-Assign', time: '1 hour ago', color: 'emerald' },
    { id: 4, type: 'SYSTEM', action: 'Global Broadcast Issued', user: 'Admin Console', time: '3 hours ago', color: 'amber' },
  ];

  if (loading && stats.totalCases === 0) {
    return (
      <div className="d-flex flex-column justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
        <Spinner animation="grow" variant="primary" />
        <span className="mt-3 font-extrabold text-slate-400 tracking-widest text-xs">INITIALIZING CONSOLE...</span>
      </div>
    );
  }

  return (
    <div className="admin-dashboard px-xl-5 py-4">
      {/* 🧭 Top Section: Greeting & Quick Filters */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-5 gap-3">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <Badge bg="primary" className="rounded-1 text-[10px] px-2 py-1 uppercase tracking-widest">Live System</Badge>
            <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">• Command Center Overview</span>
          </div>
          <h2 className="font-black text-slate-900 tracking-tighter display-6 mb-0">System Intelligence</h2>
        </div>
        <div className="d-flex gap-2 bg-white p-1.5 rounded-3xl shadow-sm border border-slate-100">
          {['today', '7days', '30days'].map((filter) => (
            <Button
              key={filter}
              variant={dateFilter === filter ? 'primary' : 'white'}
              size="sm"
              onClick={() => setDateFilter(filter)}
              className={`rounded-2xl px-4 py-2 font-bold text-xs uppercase tracking-widest border-0 transition-all ${dateFilter === filter ? 'shadow-lg' : 'text-slate-500 hover:text-slate-900'
                }`}
            >
              {filter === 'today' ? 'Live' : filter === '7days' ? 'Weekly' : 'Archive'}
            </Button>
          ))}
        </div>
      </div>

      {successMessage && <Alert variant="success" className="rounded-3xl border-0 shadow-lg mb-4">{successMessage}</Alert>}
      {error && <Alert variant="danger" className="rounded-3xl border-0 shadow-lg mb-4">{error}</Alert>}

      {/* 📊 Section 3: Overview Metrics (Top Cards) */}
      <Row className="g-4 mb-5">
        <Col md={6} lg={3}>
          <Link to="/admin/cases/emergency" className="metric-link">
            <div className="glass-card metric-card-content border-bottom border-red-500 border-4">
              <div className="d-flex justify-content-between mb-3">
                <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-500 d-flex align-items-center justify-content-center fs-4 shadow-sm">
                  <i className="bi bi-shield-fill-exclamation animate-pulse"></i>
                </div>
                <Badge bg="red-50" className="text-red-500 border border-red-100 rounded-pill d-flex align-items-center px-3">+4%</Badge>
              </div>
              <h3 className="font-black text-3xl text-slate-900 mb-1">{stats.emergencyCases}</h3>
              <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mb-0">Active Emergencies</p>
            </div>
          </Link>
        </Col>
        <Col md={6} lg={3}>
          <Link to="/admin/cases/all" className="metric-link">
            <div className="glass-card metric-card-content border-bottom border-blue-500 border-4">
              <div className="d-flex justify-content-between mb-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-500 d-flex align-items-center justify-content-center fs-4 shadow-sm">
                  <i className="bi bi-stack"></i>
                </div>
                <Badge bg="blue-50" className="text-blue-500 border border-blue-100 rounded-pill d-flex align-items-center px-3">Total</Badge>
              </div>
              <h3 className="font-black text-3xl text-slate-900 mb-1">{stats.totalCases}</h3>
              <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mb-0">Operational Cases</p>
            </div>
          </Link>
        </Col>
        <Col md={6} lg={3}>
          <Link to="/admin/help-requests/all" className="metric-link">
            <div className="glass-card metric-card-content border-bottom border-amber-500 border-4">
              <div className="d-flex justify-content-between mb-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-500 d-flex align-items-center justify-content-center fs-4 shadow-sm">
                  <i className="bi bi-person-heart"></i>
                </div>
                <Badge bg="amber-50" className="text-amber-500 border border-amber-100 rounded-pill d-flex align-items-center px-3">Review</Badge>
              </div>
              <h3 className="font-black text-3xl text-slate-900 mb-1">{stats.activeHelpRequests}</h3>
              <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mb-0">Pending Requests</p>
            </div>
          </Link>
        </Col>
        <Col md={6} lg={3}>
          <div className="glass-card metric-card-content border-bottom border-emerald-500 border-4">
            <div className="d-flex justify-content-between mb-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-500 d-flex align-items-center justify-content-center fs-4 shadow-sm">
                <i className="bi bi-people-fill"></i>
              </div>
              <div className="d-flex align-items-center gap-1">
                <span className="status-online fs-5 animate__animated animate__flash animate__infinite">●</span>
                <span className="text-emerald-600 font-bold text-xs">Live</span>
              </div>
            </div>
            <h3 className="font-black text-3xl text-slate-900 mb-1">{stats.totalUsers}</h3>
            <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mb-0">Users Registered</p>
          </div>
        </Col>
      </Row>

      {/* 🚨 Section 4: Alerts & Emergency Panel (High Priority) */}
      {stats.emergencyCases > 0 && (
        <div className="glass-card emergency-panel mb-5 p-4 d-flex flex-column flex-md-row align-items-center justify-content-between">
          <div className="d-flex align-items-center gap-4 mb-3 mb-md-0">
            <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 d-flex align-items-center justify-content-center fs-2 shadow-inner">
              <i className="bi bi-shield-fill-exclamation text-red-500"></i>
            </div>
            <div>
              <h4 className="font-black text-slate-900 mb-1 tracking-tight">Immediate Action Required</h4>
              <p className="text-slate-500 mb-0 font-medium">There are <span className="text-red-600 font-black">{stats.emergencyCases} unassigned emergency incidents</span> that require tactical response.</p>
            </div>
          </div>
          <Button
            className="btn-action btn-action-primary px-5 py-3 rounded-2xl font-black shadow-xl"
            onClick={() => navigate('/admin/cases/emergency')}
          >
            Deploy Response Force
          </Button>
        </div>
      )}

      {/* 📊 Section 5 & 6 Main Content Area */}
      <Row className="g-5">
        {/* Left Column (Charts & Workforce) */}
        <Col xl={8}>
          {/* Case Analytics */}
          <div className="glass-card p-5 mb-5 overflow-hidden">
            <div className="d-flex justify-content-between align-items-start mb-5">
              <div>
                <h5 className="font-black text-slate-900 tracking-tight mb-2 uppercase text-xs tracking-widest text-slate-400">Tactical Analytics</h5>
                <h3 className="font-black text-2xl text-slate-900 tracking-tighter">Incident Distribution</h3>
              </div>
              <ButtonGroup className="bg-slate-50 p-1 rounded-2xl border border-slate-100">
                <Button variant="white" size="sm" className="px-3 rounded-xl font-bold border-0 shadow-sm text-xs">BY STATUS</Button>
                <Button variant="white" size="sm" className="px-3 rounded-xl font-bold border-0 text-xs opacity-50">BY TYPE</Button>
              </ButtonGroup>
            </div>

            <Row className="g-5 align-items-center">
              <Col lg={5}>
                <div style={{ height: '280px' }}>
                  <DoughnutChart data={caseStatusDistribution} labelKey="status" valueKey="count" />
                </div>
              </Col>
              <Col lg={7}>
                <div className="bg-slate-50/50 rounded-3xl p-4 border border-slate-100">
                  <h6 className="font-black text-[10px] text-slate-400 uppercase tracking-widest mb-4">Live Statistics</h6>
                  <div className="d-flex flex-column gap-3">
                    {caseStatusDistribution.map((item, idx) => (
                      <div key={idx} className="d-flex align-items-center justify-content-between">
                        <div className="d-flex align-items-center gap-2">
                          <div className="w-2 h-2 rounded-full" style={{ background: ['#2563eb', '#f59e0b', '#ef4444', '#10b981'][idx % 4] }}></div>
                          <span className="font-bold text-slate-700 text-sm">{item.status}</span>
                        </div>
                        <span className="font-black text-slate-900">{item.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </Col>
            </Row>
          </div>

          {/* Workforce Status Section 6 */}
          <div className="glass-card p-0 overflow-hidden mb-5">
            <div className="p-5 border-bottom bg-slate-50/30">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h5 className="font-black text-slate-900 tracking-tight mb-1 uppercase text-xs tracking-widest text-slate-400">Strategic Support</h5>
                  <h3 className="font-black text-2xl text-slate-900 tracking-tighter">Social Workforce Status</h3>
                </div>
                <Button variant="outline-primary" className="rounded-2xl font-black text-xs px-4" onClick={() => navigate('/admin/users/social-workers')}>
                  Management Panel
                </Button>
              </div>
            </div>
            <div className="table-responsive">
              <Table className="table-premium mb-0 bg-transparent">
                <thead>
                  <tr>
                    <th className="ps-5">Force Member</th>
                    <th>Specialization</th>
                    <th>Deployment</th>
                    <th>Readiness</th>
                    <th className="pe-5 text-end">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {socialWorkers.slice(0, 5).map((worker, idx) => (
                    <tr key={worker.id} className="border-bottom border-slate-50">
                      <td className="ps-5">
                        <div className="d-flex align-items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 d-flex align-items-center justify-content-center font-black">
                            {worker.fullName.charAt(0)}
                          </div>
                          <span className="font-black text-slate-800">{worker.fullName}</span>
                        </div>
                      </td>
                      <td className="text-slate-500 font-bold">{worker.specialization}</td>
                      <td>
                        <div className="d-flex flex-column">
                          <span className="font-black text-slate-800">4 Active</span>
                          <div className="progress mt-1" style={{ height: '4px', width: '80px' }}>
                            <div className="progress-bar bg-blue-500" style={{ width: '60%' }}></div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <Badge bg={worker.availabilityStatus === 'AVAILABLE' ? 'emerald-500' : 'amber-500'} className="rounded-pill px-3 py-1 font-black text-[10px] uppercase">
                          {worker.availabilityStatus}
                        </Badge>
                      </td>
                      <td className="pe-5 text-end">
                        <Button variant="light" size="sm" className="rounded-xl border border-slate-200">
                          <i className="bi bi-three-dots-vertical"></i>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </div>

          {/* Recent Incidents */}
          <div className="mb-0">
            <RecentCasesTable cases={recentCases} />
          </div>
        </Col>

        {/* Right Column (Section 7 & 8) */}
        <Col xl={4}>
          {/* Section 8: Quick Admin Actions */}
          <div className="glass-card p-5 mb-5">
            <h5 className="font-black text-slate-900 tracking-tight mb-4 uppercase text-xs tracking-widest text-slate-400 font-bold mb-4">Command Actions</h5>
            <div className="d-flex flex-column gap-3">
              <Button onClick={() => navigate('/admin/announcements')} variant="primary" className="btn-action btn-action-primary text-left justify-content-start w-100 d-flex align-items-center gap-3 p-3 px-4">
                <div className="w-8 h-8 rounded-lg bg-white/20 d-flex align-items-center justify-content-center"><i className="bi bi-megaphone"></i></div>
                <div className="text-left"><span className="d-block font-black tracking-tight">Issue Broadcast</span><small className="opacity-70 font-bold">Alert all system users</small></div>
              </Button>
              <Button onClick={() => navigate('/admin/users/all')} variant="outline-primary" className="btn-action w-100 d-flex align-items-center gap-3 p-3 px-4 border-2 border-slate-100 text-slate-700 hover:bg-slate-50">
                <div className="w-8 h-8 rounded-lg bg-slate-100 d-flex align-items-center justify-content-center"><i className="bi bi-person-plus"></i></div>
                <div className="text-left text-left"><span className="d-block font-black tracking-tight text-slate-900">Authorize Personnel</span><small className="opacity-70 font-bold">Review account queue</small></div>
              </Button>
              <Button onClick={() => navigate('/admin/analytics/dashboard')} variant="outline-dark" className="btn-action w-100 d-flex align-items-center gap-3 p-3 px-4 border-2 border-slate-100 text-slate-700 hover:bg-slate-50">
                <div className="w-8 h-8 rounded-lg bg-slate-100 d-flex align-items-center justify-content-center"><i className="bi bi-file-earmark-pdf"></i></div>
                <div className="text-left"><span className="d-block font-black tracking-tight text-slate-900">Intelligence Brief</span><small className="opacity-70 font-bold">Generate PDF report</small></div>
              </Button>
            </div>
          </div>

          {/* Section 7: System Activity Feed */}
          <div className="glass-card p-5">
            <div className="d-flex justify-content-between align-items-center mb-5">
              <h5 className="font-black text-slate-900 tracking-tight mb-0 uppercase text-xs tracking-widest text-slate-400 font-bold mb-4">Command Log</h5>
              <Badge bg="blue-500" className="rounded-pill animate-pulse">Live Feed</Badge>
            </div>
            <div className="activity-feed">
              {activityFeed.map((item) => (
                <div key={item.id} className="activity-item">
                  <div className={`activity-dot bg-${item.color}-500`}></div>
                  <div className="d-flex justify-content-between align-items-start mb-1">
                    <span className="font-black text-slate-800 text-sm tracking-tight">{item.action}</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">{item.time}</span>
                  </div>
                  <div className="d-flex align-items-center gap-2">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{item.type}</span>
                    <span className="text-xs font-black text-blue-600">@{item.user}</span>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="link" className="w-100 mt-4 font-black text-xs text-blue-600 text-decoration-none border-top pt-4 border-slate-50 uppercase tracking-widest" onClick={() => navigate('/admin/audit-logs')}>
              Full Mission Log →
            </Button>
          </div>
        </Col>
      </Row>

      {/* 🏙️ Hidden Section: Jurisdiction Stats Title Block */}
      <div className="mt-5 pt-5 pb-4 border-top border-slate-100">
        <h5 className="font-bold text-slate-400 uppercase tracking-[0.2em] text-[10px] mb-4 text-center">National Jurisdiction Monitoring</h5>
        <div className="d-flex flex-wrap justify-content-center gap-5 opacity-40">
          {['NORTHERN HUB', 'SOUTHERN STATION', 'EASTERN UNIT', 'WESTERN SECTOR', 'METRO COMMAND'].map(station => (
            <span key={station} className="font-black text-slate-500 tracking-widest text-xs uppercase">{station}</span>
          ))}
        </div>
      </div>

      {/* Assignment Modal */}
      <Modal show={showAssignModal} onHide={() => setShowAssignModal(false)} centered size="lg" contentClassName="rounded-3xl border-0 shadow-2xl">
        <Modal.Header closeButton className="border-0 p-5 pb-0">
          <div>
            <h3 className="font-black text-slate-900 tracking-tighter mb-1">Authorization Assignment</h3>
            <p className="text-slate-500 font-bold mb-0">DEPLOY PERSONNEL TO REQUEST: {selectedRequestId}</p>
          </div>
        </Modal.Header>
        <Modal.Body className="p-5">
          <Form.Control
            type="text"
            placeholder="FILTER PERSONNEL..."
            value={workerSearchQuery}
            onChange={(e) => setWorkerSearchQuery(e.target.value)}
            className="mb-4 rounded-2xl px-4 py-3 border-slate-100 bg-slate-50 font-bold text-sm tracking-widest uppercase shadow-inner"
          />

          <div className="list-group list-group-flush border rounded-3xl overflow-auto" style={{ maxHeight: '300px' }}>
            {filteredWorkers.map(worker => (
              <button
                key={worker.userId}
                className={`list-group-item list-group-item-action d-flex align-items-center justify-content-between p-4 ${selectedWorkerId === worker.userId ? 'bg-blue-50 border-blue-100' : ''}`}
                onClick={() => setSelectedWorkerId(worker.userId)}
              >
                <div className="d-flex align-items-center">
                  <div className={`w-12 h-12 rounded-xl d-flex align-items-center justify-content-center me-3 font-black ${selectedWorkerId === worker.userId ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-100 text-slate-400'}`}>
                    {worker.fullName.charAt(0)}
                  </div>
                  <div>
                    <div className="font-black text-slate-900">{worker.fullName}</div>
                    <small className="font-bold text-blue-600 uppercase tracking-widest text-[9px]">{worker.specialization}</small>
                  </div>
                </div>
                {selectedWorkerId === worker.userId && <i className="bi bi-check-circle-fill text-blue-600 fs-4 animate__animated animate__zoomIn"></i>}
              </button>
            ))}
          </div>
        </Modal.Body>
        <Modal.Footer className="border-0 p-5 pt-0">
          <Button variant="light" className="rounded-2xl px-4 font-black text-xs uppercase" onClick={() => setShowAssignModal(false)}>Cancel</Button>
          <Button variant="primary" className="rounded-2xl px-5 font-black text-xs uppercase shadow-xl" onClick={handleAssignWorker} disabled={!selectedWorkerId || assigning}>
            {assigning ? <Spinner size="sm" animation="border" /> : 'Confirm Deployment'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default AdminDashboard;
