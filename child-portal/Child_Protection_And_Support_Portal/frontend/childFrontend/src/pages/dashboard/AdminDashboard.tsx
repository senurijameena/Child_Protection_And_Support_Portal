import React, { useState, useEffect } from 'react';
import { 
  Row, Col, Card, Button, Spinner, Alert, 
  Table, Badge, ButtonGroup
} from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { analyticsService } from '../../services/analyticsService';
import { caseService } from '../../services/caseService';
import { helpRequestService } from '../../services/helpRequestService';
import { adminService } from '../../services/adminService';
import { transferService } from '../../services/transferService';
import { DoughnutChart, BarChart } from '../../components/charts';
import './AdminDashboard.css';

interface DashboardStats {
  totalCases: number;
  activeCases: number;
  emergencyCases: number;
  closedCases: number;
  totalHelpRequests: number;
  activeHelpRequests: number;
  totalUsers: number;
  policeOfficers: number;
  socialWorkers: number;
  pendingApprovals: number;
  pendingTransfers: number;
}

interface RecentCase {
  id: string;
  trackingId?: string;
  caseType: string;
  location: string;
  priority: string;
  status: string;
  assignedOfficerId?: string;
  assignedWorkerId?: string;
}

interface RecentHelpRequest {
  id: string;
  trackingId?: string;
  helpType: string;
  childAge?: string;
  priority: string;
  status: string;
  assignedWorkerId?: string;
}

interface PendingTransfer {
  id: string;
  type: string;
  fromUserId: string;
  fromUserName?: string;
  toUserId: string;
  toUserName?: string;
}

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [stats, setStats] = useState<DashboardStats>({
    totalCases: 0,
    activeCases: 0,
    emergencyCases: 0,
    closedCases: 0,
    totalHelpRequests: 0,
    activeHelpRequests: 0,
    totalUsers: 0,
    policeOfficers: 0,
    socialWorkers: 0,
    pendingApprovals: 0,
    pendingTransfers: 0
  });

  const [dateFilter, setDateFilter] = useState('today');
  const [recentCases, setRecentCases] = useState<RecentCase[]>([]);
  const [recentHelpRequests, setRecentHelpRequests] = useState<RecentHelpRequest[]>([]);
  const [pendingTransfers, setPendingTransfers] = useState<PendingTransfer[]>([]);
  const [caseStatusDistribution, setCaseStatusDistribution] = useState<any[]>([]);
  const [helpRequestTypeDistribution, setHelpRequestTypeDistribution] = useState<any[]>([]);

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, [dateFilter]);

  const getDateRange = () => {
    const now = new Date();
    let startDate: Date;
    
    switch (dateFilter) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case '7days':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30days':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    }
    
    return {
      startDate: startDate.toISOString(),
      endDate: now.toISOString()
    };
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const dateRange = getDateRange();

      const [dashboardMetrics, caseStats, helpRequestStats, userStats, pendingApprovalsData, caseStatusDist, helpTypeDist] = await Promise.allSettled([
        analyticsService.getDashboardMetrics(),
        analyticsService.getCaseStatistics(dateRange.startDate, dateRange.endDate),
        analyticsService.getHelpRequestStatistics(dateRange.startDate, dateRange.endDate),
        analyticsService.getUserStatistics(),
        adminService.getPendingApprovals(),
        analyticsService.getCaseStatusDistribution(),
        analyticsService.getHelpTypeDistribution()
      ]);

      if (dashboardMetrics.status === 'fulfilled' && dashboardMetrics.value.data) {
        const metrics = dashboardMetrics.value.data;
        setStats(prev => ({
          ...prev,
          totalCases: metrics.totalCases || 0,
          activeCases: metrics.activeCases || 0,
          emergencyCases: metrics.emergencyCases || 0,
          totalHelpRequests: metrics.totalHelpRequests || 0,
          activeHelpRequests: metrics.pendingHelpRequests || 0,
          totalUsers: metrics.totalUsers || 0,
          pendingApprovals: metrics.pendingApprovals || 0
        }));
      }

      if (caseStats.status === 'fulfilled' && caseStats.value.data) {
        const caseData = caseStats.value.data;
        setStats(prev => ({
          ...prev,
          totalCases: caseData.totalCases || prev.totalCases,
          activeCases: caseData.activeCases || prev.activeCases,
          closedCases: caseData.resolvedCases || 0
        }));
      }

      if (helpRequestStats.status === 'fulfilled' && helpRequestStats.value.data) {
        const hrData = helpRequestStats.value.data;
        setStats(prev => ({
          ...prev,
          totalHelpRequests: hrData.total || hrData.totalHelpRequests || prev.totalHelpRequests,
          activeHelpRequests: hrData.active || hrData.activeHelpRequests || prev.activeHelpRequests
        }));
      }

      if (userStats.status === 'fulfilled' && userStats.value.data) {
        const usrData = userStats.value.data;
        setStats(prev => ({
          ...prev,
          totalUsers: usrData.totalUsers || usrData.total || prev.totalUsers,
          policeOfficers: usrData.policeOfficers || usrData.policeCount || 0,
          socialWorkers: usrData.socialWorkers || usrData.socialWorkerCount || 0
        }));
      }

      if (pendingApprovalsData.status === 'fulfilled') {
        const approvals = pendingApprovalsData.value;
        const approvalCount = Array.isArray(approvals) ? approvals.length : (approvals?.length || 0);
        setStats(prev => ({ ...prev, pendingApprovals: approvalCount }));
      }

      // Process case status distribution for chart
      if (caseStatusDist.status === 'fulfilled' && caseStatusDist.value.data) {
        const statusData = caseStatusDist.value.data;
        let distribution: any[] = [];
        
        if (Array.isArray(statusData)) {
          distribution = statusData;
        } else if (typeof statusData === 'object' && statusData !== null) {
          const total = Object.values(statusData).reduce((sum: number, val: any) => sum + Number(val), 0);
          distribution = Object.entries(statusData).map(([status, count]) => ({
            status: status.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
            count: Number(count),
            percentage: total > 0 ? (Number(count) / total) * 100 : 0
          }));
        }
        setCaseStatusDistribution(distribution);
      }

      // Process help request type distribution for chart
      if (helpTypeDist.status === 'fulfilled' && helpTypeDist.value.data) {
        const typeData = helpTypeDist.value.data;
        let distribution: any[] = [];
        
        if (Array.isArray(typeData)) {
          distribution = typeData;
        } else if (typeof typeData === 'object') {
          const total = Object.values(typeData).reduce((sum: number, val: any) => sum + Number(val), 0);
          distribution = Object.entries(typeData).map(([type, count]) => ({
            type: type.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
            count: Number(count),
            percentage: total > 0 ? (Number(count) / total) * 100 : 0
          }));
        }
        setHelpRequestTypeDistribution(distribution);
      }

      // Fetch recent cases
      try {
        const casesResponse = await caseService.getAllCases();
        if (casesResponse.data && Array.isArray(casesResponse.data)) {
          const cases = casesResponse.data.slice(0, 5).map((c: any) => ({
            id: c.id,
            trackingId: c.trackingId || c.id?.substring(0, 8),
            caseType: c.caseType || 'Unknown',
            location: c.location || 'N/A',
            priority: c.priority || 'MEDIUM',
            status: c.status || 'REPORTED',
            assignedOfficerId: c.assignedOfficerId,
            assignedWorkerId: c.assignedWorkerId
          }));
          setRecentCases(cases);

          const closed = casesResponse.data.filter((c: any) => 
            c.status === 'CLOSED' || c.status === 'RESOLVED'
          ).length;
          const emergency = casesResponse.data.filter((c: any) => 
            c.emergency || c.priority === 'URGENT'
          ).length;
          setStats(prev => ({ ...prev, closedCases: closed, emergencyCases: emergency }));
        }
      } catch (err) {
        console.error('Error fetching cases:', err);
      }

      // Fetch recent help requests
      try {
        const helpRequestsResponse = await helpRequestService.getAllRequests();
        if (helpRequestsResponse.data && Array.isArray(helpRequestsResponse.data)) {
          const requests = helpRequestsResponse.data.slice(0, 5).map((hr: any) => ({
            id: hr.id,
            trackingId: hr.trackingId || hr.id?.substring(0, 8),
            helpType: hr.helpType || 'Unknown',
            childAge: hr.childAge,
            priority: hr.priority || 'MEDIUM',
            status: hr.status || 'REQUESTED',
            assignedWorkerId: hr.assignedWorkerId
          }));
          setRecentHelpRequests(requests);
        }
      } catch (err) {
        console.error('Error fetching help requests:', err);
      }

      // Fetch pending transfers
      try {
        const transfersResponse = await transferService.getPendingTransfers();
        if (transfersResponse.data && Array.isArray(transfersResponse.data)) {
          const transfers = transfersResponse.data.map((t: any) => ({
            id: t.id,
            type: t.type || 'CASE',
            fromUserId: t.fromUserId || t.fromUser?.id,
            fromUserName: t.fromUser?.name || t.fromUserName,
            toUserId: t.toUserId || t.toUser?.id,
            toUserName: t.toUser?.name || t.toUserName
          }));
          setPendingTransfers(transfers);
          setStats(prev => ({ ...prev, pendingTransfers: transfers.length }));
        }
      } catch (err) {
        console.error('Error fetching transfers:', err);
      }

    } catch (error: any) {
      console.error('Error fetching dashboard data:', error);
      setError(error.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeColor = (status: string) => {
    const statusUpper = status.toUpperCase();
    if (statusUpper.includes('RESOLVED') || statusUpper.includes('CLOSED')) return 'success';
    if (statusUpper.includes('ACTIVE') || statusUpper.includes('ASSIGNED')) return 'primary';
    if (statusUpper.includes('PENDING') || statusUpper.includes('REVIEW')) return 'warning';
    return 'secondary';
  };

  if (loading && stats.totalCases === 0) {
    return (
      <div className="admin-dashboard">
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3 text-muted">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header mb-4">
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
          <div>
            <h2 className="dashboard-title">Admin Dashboard</h2>
            <p className="dashboard-subtitle mb-0">Overview of cases, users, and help requests</p>
          </div>
          <ButtonGroup className="date-filter-group">
            <Button 
              variant={dateFilter === 'today' ? 'primary' : 'outline-primary'}
              size="sm"
              onClick={() => setDateFilter('today')}
            >
              Today
            </Button>
            <Button 
              variant={dateFilter === '7days' ? 'primary' : 'outline-primary'}
              size="sm"
              onClick={() => setDateFilter('7days')}
            >
              Last 7 Days
            </Button>
            <Button 
              variant={dateFilter === '30days' ? 'primary' : 'outline-primary'}
              size="sm"
              onClick={() => setDateFilter('30days')}
            >
              Last 30 Days
            </Button>
          </ButtonGroup>
        </div>
      </div>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Key Metrics */}
      <Row className="mb-4">
        <Col md={6} lg={3} className="mb-3">
          <Card className="stat-card stat-card-blue" onClick={() => navigate('/admin/cases/all')} style={{ cursor: 'pointer' }}>
            <Card.Body>
              <div className="stat-icon">📋</div>
              <Card.Title className="stat-value">{stats.totalCases.toLocaleString()}</Card.Title>
              <Card.Text className="stat-label">Total Cases</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6} lg={3} className="mb-3">
          <Card className="stat-card stat-card-blue" onClick={() => navigate('/admin/cases/assigned')} style={{ cursor: 'pointer' }}>
            <Card.Body>
              <div className="stat-icon">🔄</div>
              <Card.Title className="stat-value">{stats.activeCases.toLocaleString()}</Card.Title>
              <Card.Text className="stat-label">Active Cases</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6} lg={3} className="mb-3">
          <Card className="stat-card stat-card-red" onClick={() => navigate('/admin/cases/emergency')} style={{ cursor: 'pointer' }}>
            <Card.Body>
              <div className="stat-icon">🚨</div>
              <Card.Title className="stat-value">{stats.emergencyCases.toLocaleString()}</Card.Title>
              <Card.Text className="stat-label">Emergencies</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6} lg={3} className="mb-3">
          <Card className="stat-card stat-card-green" onClick={() => navigate('/admin/cases/closed')} style={{ cursor: 'pointer' }}>
            <Card.Body>
              <div className="stat-icon">✅</div>
              <Card.Title className="stat-value">{stats.closedCases.toLocaleString()}</Card.Title>
              <Card.Text className="stat-label">Closed Cases</Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col md={6} lg={3} className="mb-3">
          <Card className="stat-card stat-card-blue" onClick={() => navigate('/admin/users/public')} style={{ cursor: 'pointer' }}>
            <Card.Body>
              <div className="stat-icon">👥</div>
              <Card.Title className="stat-value">{(stats.totalUsers - stats.policeOfficers - stats.socialWorkers).toLocaleString()}</Card.Title>
              <Card.Text className="stat-label">Public Users</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6} lg={3} className="mb-3">
          <Card className="stat-card stat-card-blue" onClick={() => navigate('/admin/users/police')} style={{ cursor: 'pointer' }}>
            <Card.Body>
              <div className="stat-icon">👮</div>
              <Card.Title className="stat-value">{stats.policeOfficers.toLocaleString()}</Card.Title>
              <Card.Text className="stat-label">Police</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6} lg={3} className="mb-3">
          <Card className="stat-card stat-card-green" onClick={() => navigate('/admin/users/social-workers')} style={{ cursor: 'pointer' }}>
            <Card.Body>
              <div className="stat-icon">🧑‍⚕️</div>
              <Card.Title className="stat-value">{stats.socialWorkers.toLocaleString()}</Card.Title>
              <Card.Text className="stat-label">Social Workers</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6} lg={3} className="mb-3">
          <Card className="stat-card stat-card-yellow" onClick={() => navigate('/admin/help-requests/all')} style={{ cursor: 'pointer' }}>
            <Card.Body>
              <div className="stat-icon">🙏</div>
              <Card.Title className="stat-value">{stats.totalHelpRequests.toLocaleString()}</Card.Title>
              <Card.Text className="stat-label">Help Requests</Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Charts */}
      <Row className="mb-4">
        <Col lg={6} className="mb-3">
          <Card className="dashboard-card">
            <Card.Header>
              <h5 className="mb-0">Case Status Distribution</h5>
            </Card.Header>
            <Card.Body>
              {caseStatusDistribution.length > 0 ? (
                <DoughnutChart
                  data={caseStatusDistribution}
                  labelKey="status"
                  valueKey="count"
                  height={280}
                />
              ) : (
                <div className="text-center py-5">
                  <Spinner animation="border" variant="primary" size="sm" />
                  <p className="text-muted mt-3">Loading chart data...</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
        <Col lg={6} className="mb-3">
          <Card className="dashboard-card">
            <Card.Header>
              <h5 className="mb-0">Help Request Types</h5>
            </Card.Header>
            <Card.Body>
              {helpRequestTypeDistribution.length > 0 ? (
                <BarChart
                  data={helpRequestTypeDistribution}
                  xKey="type"
                  yKey="count"
                  height={280}
                  color="#3949ab"
                />
              ) : (
                <div className="text-center py-5">
                  <Spinner animation="border" variant="primary" size="sm" />
                  <p className="text-muted mt-3">Loading chart data...</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Main Content */}
      <Row>
        <Col lg={8} className="mb-3">
          <Card className="dashboard-card mb-3">
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Recent Cases</h5>
              <Button 
                variant="link" 
                size="sm" 
                onClick={() => navigate('/admin/cases/all')} 
                className="p-0 text-primary"
                style={{ textDecoration: 'none', fontWeight: 500 }}
              >
                View All →
              </Button>
            </Card.Header>
            <Card.Body>
              <Table responsive hover>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Category</th>
                    <th>Location</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Assigned</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {recentCases.length > 0 ? (
                    recentCases.map((c) => (
                      <tr key={c.id}>
                        <td>{c.trackingId || c.id.substring(0, 8)}</td>
                        <td>{c.caseType}</td>
                        <td>{c.location}</td>
                        <td>
                          <Badge bg={c.priority === 'URGENT' ? 'danger' : c.priority === 'HIGH' ? 'warning' : 'secondary'}>
                            {c.priority}
                          </Badge>
                        </td>
                        <td>
                          <Badge bg={getStatusBadgeColor(c.status)}>
                            {c.status}
                          </Badge>
                        </td>
                        <td>{c.assignedOfficerId ? `PO-${c.assignedOfficerId.substring(0, 2)}` : c.assignedWorkerId ? `SW-${c.assignedWorkerId.substring(0, 2)}` : '—'}</td>
                        <td>
                          <Button 
                            variant="link" 
                            size="sm" 
                            onClick={() => navigate(`/admin/cases/${c.id}`)} 
                            className="p-0 text-primary"
                            style={{ textDecoration: 'none' }}
                          >
                            View
                          </Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="text-center text-muted py-4">
                        No recent cases
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </Card.Body>
          </Card>

          <Card className="dashboard-card mb-3">
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Active Help Requests</h5>
              <Button 
                variant="link" 
                size="sm" 
                onClick={() => navigate('/admin/help-requests/all')} 
                className="p-0 text-primary"
                style={{ textDecoration: 'none', fontWeight: 500 }}
              >
                View All →
              </Button>
            </Card.Header>
            <Card.Body>
              <Table responsive hover>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Type</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Worker</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {recentHelpRequests.length > 0 ? (
                    recentHelpRequests.map((hr) => (
                      <tr key={hr.id}>
                        <td>{hr.trackingId || hr.id.substring(0, 8)}</td>
                        <td>{hr.helpType}</td>
                        <td>
                          <Badge bg={hr.priority === 'URGENT' ? 'danger' : hr.priority === 'HIGH' ? 'warning' : 'secondary'}>
                            {hr.priority}
                          </Badge>
                        </td>
                        <td>
                          <Badge bg={hr.status === 'COMPLETED' ? 'success' : hr.status === 'ACTIVE' ? 'primary' : 'warning'}>
                            {hr.status}
                          </Badge>
                        </td>
                        <td>{hr.assignedWorkerId ? `SW-${hr.assignedWorkerId.substring(0, 2)}` : '—'}</td>
                        <td>
                          <Button 
                            variant="link" 
                            size="sm" 
                            onClick={() => navigate(`/admin/help-requests/${hr.id}`)} 
                            className="p-0 text-primary"
                            style={{ textDecoration: 'none' }}
                          >
                            View
                          </Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="text-center text-muted py-4">
                        No active help requests
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4}>
          {stats.pendingApprovals > 0 && (
            <Card className="dashboard-card mb-3">
              <Card.Header>
                <h5 className="mb-0">Pending Approvals</h5>
              </Card.Header>
              <Card.Body>
                <div className="text-center">
                  <h3 className="text-warning">{stats.pendingApprovals}</h3>
                  <p className="text-muted mb-3">Users awaiting approval</p>
                  <Button variant="primary" size="sm" onClick={() => navigate('/admin/users')}>
                    Review Approvals
                  </Button>
                </div>
              </Card.Body>
            </Card>
          )}

          {pendingTransfers.length > 0 && (
            <Card className="dashboard-card mb-3">
              <Card.Header>
                <h5 className="mb-0">Pending Transfers</h5>
              </Card.Header>
              <Card.Body>
                <Table responsive size="sm">
                  <thead>
                    <tr>
                      <th>Type</th>
                      <th>From</th>
                      <th>To</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingTransfers.slice(0, 5).map((transfer) => (
                      <tr key={transfer.id}>
                        <td>{transfer.type}</td>
                        <td>{transfer.fromUserName || transfer.fromUserId.substring(0, 6)}</td>
                        <td>{transfer.toUserName || transfer.toUserId.substring(0, 6)}</td>
                        <td>
                          <Button 
                            variant="link" 
                            size="sm" 
                            className="text-success p-0 me-2"
                            onClick={async () => {
                              try {
                                await transferService.approveTransfer(transfer.id);
                                fetchDashboardData();
                              } catch (err) {
                                console.error('Error approving transfer:', err);
                              }
                            }}
                          >
                            ✓
                          </Button>
                          <Button 
                            variant="link" 
                            size="sm" 
                            className="text-danger p-0"
                            onClick={async () => {
                              try {
                                await transferService.rejectTransfer(transfer.id, 'Rejected by admin');
                                fetchDashboardData();
                              } catch (err) {
                                console.error('Error rejecting transfer:', err);
                              }
                            }}
                          >
                            ✗
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
                {pendingTransfers.length > 5 && (
                  <div className="text-center mt-2">
                    <Button variant="link" size="sm" onClick={() => navigate('/admin/transfers')}>
                      View All ({pendingTransfers.length})
                    </Button>
                  </div>
                )}
              </Card.Body>
            </Card>
          )}
        </Col>
      </Row>
    </div>
  );
};

export default AdminDashboard;
