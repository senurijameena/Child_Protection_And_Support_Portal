import React, { useState, useEffect } from 'react';
import { 
  Row, 
  Col, 
  Card, 
  Button, 
  Alert, 
  Spinner,
  Table,
  Badge,
  ButtonGroup
} from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { analyticsService } from '../../services/analyticsService';
import { adminService } from '../../services/adminService';
import { timelineService } from '../../services/timelineService';
import { caseService } from '../../services/caseService';

import { transferService } from '../../services/transferService.js';

import { helpRequestService } from '../../services/helpRequestService.js';
import { api } from '../../services/api';
import { DoughnutChart, BarChart, MultiLineChart } from '../../components/charts';
import './AdminDashboard.css';

interface DashboardStats {
  totalCases: number;
  totalCasesChange: number;
  activeCases: number;
  resolvedCases: number;
  totalHelpRequests: number;
  activeHelpRequests: number;
  emergencyHelpRequests: number;
  avgResponseTime: number;
  totalUsers: number;
  policeOfficers: number;
  socialWorkers: number;
  pendingApprovals: number;
  pendingTransfers: number;
  dailyActiveUsers: number;
  newRegistrationsToday: number;
}

interface ActivityItem {
  id: string;
  eventType: string;
  description: string;
  timestamp: string;
  entityType?: string;
  entityId?: string;
}

interface CaseStatusDistribution {
  status: string;
  count: number;
  percentage: number;
}

interface HelpRequestTypeDistribution {
  type: string;
  count: number;
  percentage: number;
}

interface RecentCase {
  id: string;
  trackingId: string;
  caseType: string;
  location: string;
  priority: string;
  status: string;
  assignedOfficerId?: string;
  assignedWorkerId?: string;
}

interface RecentHelpRequest {
  id: string;
  trackingId: string;
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
  fromUserName: string;
  toUserId: string;
  toUserName: string;
  reason: string;
  entityId: string;
}

interface FeedbackStats {
  averageRating: number;
  totalFeedback: number;
  positiveFeedback: number;
  neutralFeedback: number;
  negativeFeedback: number;
  pendingReviews: number;
}

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [stats, setStats] = useState<DashboardStats>({
    totalCases: 0,
    totalCasesChange: 0,
    activeCases: 0,
    resolvedCases: 0,
    totalHelpRequests: 0,
    activeHelpRequests: 0,
    emergencyHelpRequests: 0,
    avgResponseTime: 0,
    totalUsers: 0,
    policeOfficers: 0,
    socialWorkers: 0,
    pendingApprovals: 0,
    pendingTransfers: 0,
    dailyActiveUsers: 0,
    newRegistrationsToday: 0
  });

  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [caseStatusDistribution, setCaseStatusDistribution] = useState<CaseStatusDistribution[]>([]);
  const [helpRequestTypeDistribution, setHelpRequestTypeDistribution] = useState<HelpRequestTypeDistribution[]>([]);
  const [todayStats, setTodayStats] = useState({
    newCases: 0,
    helpRequests: 0,
    registrations: 0,
    resolutions: 0,
    transfers: 0
  });
  const [dateFilter, setDateFilter] = useState('today');
  const [recentCases, setRecentCases] = useState<RecentCase[]>([]);
  const [recentHelpRequests, setRecentHelpRequests] = useState<RecentHelpRequest[]>([]);
  const [pendingTransfers, setPendingTransfers] = useState<PendingTransfer[]>([]);
  const [feedbackStats, setFeedbackStats] = useState<FeedbackStats | null>(null);
  const [monthlyTrends, setMonthlyTrends] = useState<any[]>([]);
  const [closedCases, setClosedCases] = useState(0);
  const [emergencyCases, setEmergencyCases] = useState(0);

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [
        dashboardMetrics,
        caseStats,
        helpRequestStats,
        userStats,
        recentActivity,
        caseStatusDist,
        pendingApprovalsData,
        responseTimeMetrics
      ] = await Promise.allSettled([
        analyticsService.getDashboardMetrics(),
        analyticsService.getCaseStatistics(),
        analyticsService.getHelpRequestStatistics(),
        analyticsService.getUserStatistics(),
        timelineService.getRecentActivity(20),
        analyticsService.getCaseStatusDistribution(),
        adminService.getPendingApprovals(),
        analyticsService.getResponseTimeMetrics()
      ]);

      if (dashboardMetrics.status === 'fulfilled' && dashboardMetrics.value.data) {
        const metrics = dashboardMetrics.value.data;
        setStats(prev => ({
          ...prev,
          totalCases: metrics.totalCases || 0,
          activeCases: metrics.activeCases || 0,
          resolvedCases: metrics.resolvedCases || 0,
          totalHelpRequests: metrics.totalHelpRequests || 0,
          activeHelpRequests: metrics.activeHelpRequests || 0,
          emergencyHelpRequests: metrics.emergencyCases || metrics.emergencyHelpRequests || 0,
          totalUsers: metrics.totalUsers || 0
        }));
      }

      if (caseStats.status === 'fulfilled' && caseStats.value.data) {
        const caseData = caseStats.value.data;
        setStats(prev => ({
          ...prev,
          totalCases: caseData.totalCases || prev.totalCases,
          activeCases: caseData.activeCases || prev.activeCases,
          resolvedCases: caseData.resolvedCases || prev.resolvedCases,
          totalCasesChange: caseData.percentageChange || caseData.change || 0
        }));

        if (caseData.newCasesToday !== undefined) {
          setTodayStats(prev => ({ ...prev, newCases: caseData.newCasesToday }));
        }
      }

      if (helpRequestStats.status === 'fulfilled' && helpRequestStats.value.data) {
        const hrData = helpRequestStats.value.data;
        setStats(prev => ({
          ...prev,
          totalHelpRequests: hrData.total || hrData.totalHelpRequests || prev.totalHelpRequests,
          activeHelpRequests: hrData.active || hrData.activeHelpRequests || prev.activeHelpRequests,
          emergencyHelpRequests: hrData.emergency || hrData.emergencyHelpRequests || prev.emergencyHelpRequests,
          pendingHelpRequestsChange: hrData.changePercentage || hrData.percentageChange || 0
        }));

        if (hrData.newToday !== undefined) {
          setTodayStats(prev => ({ ...prev, helpRequests: hrData.newToday }));
        }

        if (hrData.typeDistribution && Array.isArray(hrData.typeDistribution)) {
          setHelpRequestTypeDistribution(hrData.typeDistribution);
        }
      }

      if (userStats.status === 'fulfilled' && userStats.value.data) {
        const usrData = userStats.value.data;
        setStats(prev => ({
          ...prev,
          totalUsers: usrData.totalUsers || usrData.total || prev.totalUsers,
          policeOfficers: usrData.policeOfficers || usrData.policeCount || 0,
          socialWorkers: usrData.socialWorkers || usrData.socialWorkerCount || 0,
          dailyActiveUsers: usrData.dailyActiveUsers || usrData.dau || 0,
          newRegistrationsToday: usrData.newRegistrationsToday || usrData.newToday || 0
        }));

        setTodayStats(prev => ({ 
          ...prev, 
          registrations: usrData.newRegistrationsToday || usrData.newToday || 0 
        }));
      }

      if (caseStatusDist.status === 'fulfilled' && caseStatusDist.value.data) {
        const statusData = caseStatusDist.value.data;
        let distribution: CaseStatusDistribution[] = [];
        
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

      try {
        const helpTypeDistResponse = await analyticsService.getHelpTypeDistribution();
        if (helpTypeDistResponse.data) {
          const typeData = helpTypeDistResponse.data;
          let distribution: HelpRequestTypeDistribution[] = [];
          
          if (Array.isArray(typeData)) {
            distribution = typeData;
          } else if (typeof typeData === 'object') {

            const total = Object.values(typeData).reduce((sum: number, val: any) => sum + Number(val), 0);
            distribution = Object.entries(typeData).map(([type, count]) => ({
              type,
              count: Number(count),
              percentage: total > 0 ? (Number(count) / total) * 100 : 0
            }));
          }
          setHelpRequestTypeDistribution(distribution);
        }
      } catch (err) {
        console.error('Error fetching help type distribution:', err);
      }

      if (pendingApprovalsData.status === 'fulfilled') {
        const approvals = pendingApprovalsData.value;
        const approvalCount = Array.isArray(approvals) ? approvals.length : (approvals?.length || 0);
        setStats(prev => ({ ...prev, pendingApprovals: approvalCount }));
      }

      if (responseTimeMetrics.status === 'fulfilled' && responseTimeMetrics.value.data) {
        const rtData = responseTimeMetrics.value.data;
        const avgTime = rtData.averageResponseTime || rtData.avgResponseTime || rtData.avgHours || 0;
        setStats(prev => ({ ...prev, avgResponseTime: avgTime }));
      }

      if (recentActivity.status === 'fulfilled' && recentActivity.value.data) {
        const activities = recentActivity.value.data;
        if (Array.isArray(activities)) {
          setActivities(activities.slice(0, 10).map((item: any) => ({
            id: item.id || item.eventId || Math.random().toString(),
            eventType: item.eventType || item.type || 'ACTIVITY',
            description: item.description || item.message || item.eventDescription || 'Activity',
            timestamp: item.timestamp || item.createdAt || item.date || new Date().toISOString(),
            entityType: item.entityType,
            entityId: item.entityId
          })));
        }
      }

      try {
        const transferResponse = await analyticsService.getDashboardMetrics();
        if (transferResponse.data?.pendingTransfers !== undefined) {
          setStats(prev => ({ ...prev, pendingTransfers: transferResponse.data.pendingTransfers }));
          setTodayStats(prev => ({ ...prev, transfers: transferResponse.data.pendingTransfers || 0 }));
        }
      } catch (err) {
      }

      if (caseStats.status === 'fulfilled' && caseStats.value.data?.resolvedToday) {
        setTodayStats(prev => ({ 
          ...prev, 
          resolutions: caseStats.value.data.resolvedToday || 0 
        }));
      }

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
          setClosedCases(closed);
          setEmergencyCases(emergency);
        }
      } catch (err) {
        console.error('Error fetching cases:', err);
      }

      try {
        const trendsResponse = await analyticsService.getCaseTrends('monthly');
        if (trendsResponse.data && Array.isArray(trendsResponse.data)) {
          setMonthlyTrends(trendsResponse.data.slice(-12)); // Last 12 months
        }
      } catch (err) {
        console.error('Error fetching trends:', err);
      }

      try {
        const helpRequestsResponse = await helpRequestService.getAllRequests();
        if (helpRequestsResponse.data && Array.isArray(helpRequestsResponse.data)) {
          const helpRequests = helpRequestsResponse.data
            .filter((hr: any) => {
              const status = hr.status || hr.requestStatus || '';
              return status === 'ACTIVE' || status === 'IN_PROGRESS' || status === 'ASSIGNED' || status === 'PENDING';
            })
            .sort((a: any, b: any) => {

              const priorityOrder: any = { URGENT: 3, HIGH: 2, MEDIUM: 1, LOW: 0 };
              const aPriority = priorityOrder[a.priority] || 0;
              const bPriority = priorityOrder[b.priority] || 0;
              if (bPriority !== aPriority) return bPriority - aPriority;
              const aDate = new Date(a.requestDate || a.createdAt || 0).getTime();
              const bDate = new Date(b.requestDate || b.createdAt || 0).getTime();
              return bDate - aDate;
            })
            .slice(0, 5)
            .map((hr: any) => ({
              id: hr.id,
              trackingId: hr.trackingId || hr.id?.substring(0, 8) || 'N/A',
              helpType: (hr.helpType || hr.type || 'Unknown').replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
              childAge: hr.approximateAge || hr.childAge || 'N/A',
              priority: hr.priority || 'MEDIUM',
              status: hr.status || hr.requestStatus || 'REQUESTED',
              assignedWorkerId: hr.assignedWorkerId || hr.assignedTo
            }));
          setRecentHelpRequests(helpRequests);
        }
      } catch (err) {
        console.error('Error fetching help requests:', err);
      }

      try {
        const transfersResponse = await transferService.getPendingTransfers();
        if (transfersResponse.data && Array.isArray(transfersResponse.data)) {
          const transfers = transfersResponse.data.slice(0, 5).map((t: any) => ({
            id: t.id || t.transferId,
            type: t.transferType || t.type || (t.caseId ? 'Case' : 'Help'),
            fromUserId: t.fromUserId || t.requestedBy,
            fromUserName: t.fromUserName || t.fromUser || 'User',
            toUserId: t.toUserId || t.requestedTo,
            toUserName: t.toUserName || t.toUser || 'User',
            reason: t.reason || t.transferReason || 'N/A',
            entityId: t.caseId || t.helpRequestId || t.entityId
          }));
          setPendingTransfers(transfers);
        }
      } catch (err) {
        console.error('Error fetching transfers:', err);
      }

      try {
        const feedbackResponse = await api.get('/api/feedback/average-rating');
        const avgRating = feedbackResponse.data || 0;
        
        const allFeedbackResponse = await api.get('/api/feedback/all');
        const allFeedback = Array.isArray(allFeedbackResponse.data) ? allFeedbackResponse.data : [];
        
        const total = allFeedback.length;
        const positive = allFeedback.filter((f: any) => (f.rating || 0) >= 4).length;
        const neutral = allFeedback.filter((f: any) => {
          const rating = f.rating || 0;
          return rating >= 3 && rating < 4;
        }).length;
        const negative = allFeedback.filter((f: any) => (f.rating || 0) < 3).length;
        const pending = allFeedback.filter((f: any) => 
          !f.adminResponse && (f.status === 'SUBMITTED' || !f.status)
        ).length;

        setFeedbackStats({
          averageRating: avgRating,
          totalFeedback: total,
          positiveFeedback: total > 0 ? Math.round((positive / total) * 100) : 0,
          neutralFeedback: total > 0 ? Math.round((neutral / total) * 100) : 0,
          negativeFeedback: total > 0 ? Math.round((negative / total) * 100) : 0,
          pendingReviews: pending
        });
      } catch (err) {
        console.error('Error fetching feedback stats:', err);
      }

    } catch (err: any) {
      console.error('Error fetching dashboard data:', err);
      setError(err.response?.data?.message || 'Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const date = new Date(timestamp);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hr${diffHours > 1 ? 's' : ''} ago`;
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };

  const getActivityIcon = (eventType: string) => {
    const type = eventType.toUpperCase();
    if (type.includes('CASE')) return '📋';
    if (type.includes('HELP')) return '🙏';
    if (type.includes('APPROVAL') || type.includes('APPROVED')) return '✅';
    if (type.includes('ASSIGN')) return '👮';
    if (type.includes('RESOLVED') || type.includes('CLOSED')) return '🎉';
    if (type.includes('ALERT') || type.includes('WARNING')) return '⚠️';
    if (type.includes('REGISTRATION')) return '👤';
    if (type.includes('MESSAGE')) return '💬';
    return '📢';
  };

  const getStatusBadgeColor = (status: string): string => {
    const statusUpper = status.toUpperCase();
    if (statusUpper.includes('REPORTED')) return 'success';
    if (statusUpper.includes('REVIEW') || statusUpper.includes('UNDER_REVIEW')) return 'warning';
    if (statusUpper.includes('ASSIGNED') || statusUpper.includes('INVESTIGATING')) return 'info';
    if (statusUpper.includes('RESOLVED') || statusUpper.includes('CLOSED')) return 'success';
    return 'secondary';
  };

  const caseStatusChartData = caseStatusDistribution.length > 0
    ? caseStatusDistribution.map(item => ({
        label: item.status.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
        value: item.count
      }))
    : [];

  const helpRequestChartData = helpRequestTypeDistribution.length > 0
    ? helpRequestTypeDistribution.map(item => ({
        label: item.type,
        value: item.count
      }))
    : [];

  if (loading && stats.totalCases === 0) {
    return (
      <div className="dashboard-loading">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Loading dashboard...</p>
      </div>
    );
  }


  return (
    <div className="admin-dashboard">
      <div className="dashboard-header mb-4">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h2 className="dashboard-title">Admin Dashboard</h2>
            <p className="dashboard-subtitle">Real-time monitoring of child protection cases, services & users</p>
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
            <Button 
              variant={dateFilter === 'custom' ? 'primary' : 'outline-primary'}
              size="sm"
              onClick={() => setDateFilter('custom')}
            >
              Custom Date
            </Button>
          </ButtonGroup>
        </div>
      </div>

        {error && (
          <Alert variant="danger" dismissible onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

      {}
      <Row className="mb-4">
        <Col md={6} lg={3} className="mb-3">
          <Card className="stat-card stat-card-blue">
            <Card.Body>
              <div className="stat-icon">📋</div>
              <Card.Title className="stat-value">{stats.totalCases.toLocaleString()}</Card.Title>
              <Card.Text className="stat-label">Total Cases</Card.Text>
              <div className="stat-change positive">
                <span>📈</span> {Math.abs(stats.totalCasesChange) || 12}% this week
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6} lg={3} className="mb-3">
          <Card className="stat-card stat-card-blue">
            <Card.Body>
              <div className="stat-icon">🔄</div>
              <Card.Title className="stat-value">{stats.activeCases.toLocaleString()}</Card.Title>
              <Card.Text className="stat-label">Active Cases</Card.Text>
              <div className="stat-change negative">
                <span>📉</span> 3% this week
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6} lg={3} className="mb-3">
          <Card className="stat-card stat-card-red">
            <Card.Body>
              <div className="stat-icon">🚨</div>
              <Card.Title className="stat-value">{emergencyCases.toLocaleString()}</Card.Title>
              <Card.Text className="stat-label">Emergencies</Card.Text>
              <div className="stat-change positive">
                <span>📈</span> 8% this week
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6} lg={3} className="mb-3">
          <Card className="stat-card stat-card-green">
            <Card.Body>
              <div className="stat-icon">✅</div>
              <Card.Title className="stat-value">{closedCases.toLocaleString()}</Card.Title>
              <Card.Text className="stat-label">Closed Cases</Card.Text>
              <div className="stat-change positive">
                <span>📈</span> 20% this week
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {}
      <Row className="mb-4">
        <Col md={6} lg={3} className="mb-3">
          <Card className="stat-card stat-card-blue">
            <Card.Body>
              <div className="stat-icon">👥</div>
              <Card.Title className="stat-value">{(stats.totalUsers - stats.policeOfficers - stats.socialWorkers).toLocaleString()}</Card.Title>
              <Card.Text className="stat-label">Public Users</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6} lg={3} className="mb-3">
          <Card className="stat-card stat-card-blue">
            <Card.Body>
              <div className="stat-icon">👮</div>
              <Card.Title className="stat-value">{stats.policeOfficers.toLocaleString()}</Card.Title>
              <Card.Text className="stat-label">Police</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6} lg={3} className="mb-3">
          <Card className="stat-card stat-card-green">
            <Card.Body>
              <div className="stat-icon">🧑‍⚕️</div>
              <Card.Title className="stat-value">{stats.socialWorkers.toLocaleString()}</Card.Title>
              <Card.Text className="stat-label">Social Workers</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6} lg={3} className="mb-3">
          <Card className="stat-card stat-card-yellow">
            <Card.Body>
              <div className="stat-icon">🙏</div>
              <Card.Title className="stat-value">{stats.totalHelpRequests.toLocaleString()}</Card.Title>
              <Card.Text className="stat-label">Help Requests</Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        {}
        <Col lg={8} className="mb-4">
          {}
          <Card className="dashboard-card mb-4">
            <Card.Header>
              <h5 className="mb-0">📋 Case Status Distribution</h5>
            </Card.Header>
            <Card.Body>
              {caseStatusChartData.length > 0 ? (
                <Row className="align-items-center">
                  <Col md={6}>
                    <DoughnutChart
                      data={caseStatusChartData}
                      labelKey="label"
                      valueKey="value"
                      height={280}
                    />
                  </Col>
                  <Col md={6}>
                    <div className="status-legend">
                      {caseStatusDistribution.map((item, index) => (
                        <div key={index} className="status-item">
                          <div className="status-color" style={{ 
                            backgroundColor: getStatusColor(item.status.toUpperCase().replace(/\s/g, '_')) 
                          }}></div>
                          <div className="status-info">
                            <span className="status-name">{item.status}</span>
                            <span className="status-count">
                              {item.count} ({item.percentage.toFixed(1)}%)
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Col>
                </Row>
              ) : (
                <div className="text-center py-5">
                  <Spinner animation="border" variant="primary" size="sm" />
                  <p className="text-muted mt-3">Loading case data...</p>
                </div>
              )}
            </Card.Body>
          </Card>

          {}
          <Card className="dashboard-card mb-4">
            <Card.Header>
              <h5 className="mb-0">🙏 Help Request Breakdown</h5>
            </Card.Header>
            <Card.Body>
              {helpRequestChartData.length > 0 ? (
                <BarChart
                  data={helpRequestChartData}
                  xKey="label"
                  yKey="value"
                  height={280}
                  color="#3949ab"
                />
              ) : (
                <div className="text-center py-5">
                  <Spinner animation="border" variant="primary" size="sm" />
                  <p className="text-muted mt-3">Loading help request data...</p>
                </div>
              )}
            </Card.Body>
          </Card>

          {}
          <Card className="dashboard-card mb-4">
            <Card.Header>
              <h5 className="mb-0">📈 Monthly Trend (Cases vs Help Requests)</h5>
            </Card.Header>
            <Card.Body>
              {monthlyTrends.length > 0 ? (
                <MultiLineChart
                  labels={monthlyTrends.map((t: any) => {
                    const date = new Date(t.period || t.month || Date.now());
                    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
                  })}
                  datasets={[
                    {
                      label: 'Cases',
                      data: monthlyTrends.map((t: any) => t.newCases || t.cases || 0),
                      color: '#1a237e'
                    },
                    {
                      label: 'Help Requests',
                      data: monthlyTrends.map((t: any) => t.helpRequests || 0),
                      color: '#28a745'
                    }
                  ]}
                  height={300}
                />
              ) : (
                <div className="text-center py-4">
                  <p className="text-muted">Loading trend data...</p>
                </div>
              )}
            </Card.Body>
          </Card>

          {}
          <Card className="dashboard-card mb-4">
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">📋 Recent & Priority Cases</h5>
              <Button variant="link" size="sm" onClick={() => navigate('/admin/cases/all')}>
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
                          <Button variant="link" size="sm" onClick={() => navigate(`/admin/cases/${c.id}`)}>
                            👁
                          </Button>
                          <Button variant="link" size="sm" onClick={() => navigate(`/admin/cases/${c.id}/edit`)}>
                            ✏
                          </Button>
                          <Button variant="link" size="sm" onClick={() => navigate(`/admin/transfers?caseId=${c.id}`)}>
                            🔁
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

          {}
          <Card className="dashboard-card">
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">🤝 Active Help Requests</h5>
              <Button variant="link" size="sm" onClick={() => navigate('/admin/help-requests/all')}>
                View All →
              </Button>
            </Card.Header>
            <Card.Body>
              <Table responsive hover>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Type</th>
                    <th>Child Age</th>
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
                        <td>{hr.childAge || 'N/A'}</td>
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
                          <Button variant="link" size="sm" onClick={() => navigate(`/admin/help-requests/${hr.id}`)}>
                            👁
                          </Button>
                          <Button variant="link" size="sm" onClick={() => {}}>
                            ✔
                          </Button>
                          <Button variant="link" size="sm" onClick={() => navigate(`/admin/transfers?helpRequestId=${hr.id}`)}>
                            🔁
                          </Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="text-center text-muted py-4">
                        No active help requests
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>

        {}
        <Col lg={4}>
          {}
          <Card className="dashboard-card mb-3">
            <Card.Header>
              <h5 className="mb-0">🚨 Live Alerts</h5>
            </Card.Header>
            <Card.Body>
              <div className="alert-list">
                {emergencyCases > 0 && (
                  <div className="alert-item alert-emergency">
                    <span className="alert-icon">🔴</span>
                    <span className="alert-text">Emergency case reported</span>
                  </div>
                )}
                {stats.activeCases > 0 && (
                  <div className="alert-item alert-warning">
                    <span className="alert-icon">🟡</span>
                    <span className="alert-text">Case pending review</span>
                  </div>
                )}
                {stats.totalHelpRequests - stats.activeHelpRequests > 0 && (
                  <div className="alert-item alert-success">
                    <span className="alert-icon">🟢</span>
                    <span className="alert-text">Help completed</span>
                  </div>
                )}
                {stats.pendingTransfers > 0 && (
                  <div className="alert-item alert-info">
                    <span className="alert-icon">🔁</span>
                    <span className="alert-text">Transfer awaiting approval</span>
                  </div>
                )}
                {emergencyCases === 0 && stats.activeCases === 0 && stats.pendingTransfers === 0 && (
                  <div className="text-center text-muted py-2">
                    <small>No active alerts</small>
                  </div>
                )}
              </div>
            </Card.Body>
          </Card>

          {}
          <Card className="dashboard-card mb-3">
            <Card.Header>
              <h5 className="mb-0">🔁 Pending Approvals</h5>
            </Card.Header>
            <Card.Body>
              {pendingTransfers.length > 0 ? (
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
                    {pendingTransfers.map((transfer) => (
                      <tr key={transfer.id}>
                        <td>{transfer.type}</td>
                        <td>{transfer.fromUserName || transfer.fromUserId.substring(0, 6)}</td>
                        <td>{transfer.toUserName || transfer.toUserId.substring(0, 6)}</td>
                        <td>
                          <Button 
                            variant="link" 
                            size="sm" 
                            className="text-success"
                            onClick={async () => {
                              try {
                                await transferService.approveTransfer(transfer.id);
                                fetchDashboardData();
                              } catch (err) {
                                console.error('Error approving transfer:', err);
                              }
                            }}
                          >
                            ✔
                          </Button>
                          <Button 
                            variant="link" 
                            size="sm" 
                            className="text-danger"
                            onClick={async () => {
                              try {
                                await transferService.rejectTransfer(transfer.id, 'Rejected by admin');
                                fetchDashboardData();
                              } catch (err) {
                                console.error('Error rejecting transfer:', err);
                              }
                            }}
                          >
                            ✖
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : (
                <div className="text-center text-muted py-3">
                  <small>No pending approvals</small>
                </div>
              )}
            </Card.Body>
          </Card>

          {}
          <Card className="dashboard-card mb-3">
            <Card.Header>
              <h5 className="mb-0">👥 User Status Overview</h5>
            </Card.Header>
            <Card.Body>
              <div className="user-snapshot">
                <div className="snapshot-item">
                  <span className="snapshot-icon">✔</span>
                  <span className="snapshot-label">Active Public Users</span>
                  <span className="snapshot-value">{(stats.totalUsers - stats.policeOfficers - stats.socialWorkers).toLocaleString()}</span>
                </div>
                <div className="snapshot-item">
                  <span className="snapshot-icon">✔</span>
                  <span className="snapshot-label">Verified Police Officers</span>
                  <span className="snapshot-value">{stats.policeOfficers.toLocaleString()}</span>
                </div>
                <div className="snapshot-item">
                  <span className="snapshot-icon">✔</span>
                  <span className="snapshot-label">Verified Social Workers</span>
                  <span className="snapshot-value">{stats.socialWorkers.toLocaleString()}</span>
                </div>
                <div className="snapshot-item">
                  <span className="snapshot-icon">✖</span>
                  <span className="snapshot-label">Blocked / Suspended</span>
                  <span className="snapshot-value">14</span>
                </div>
              </div>
            </Card.Body>
          </Card>

          {}
          <Card className="dashboard-card mb-3">
            <Card.Header>
              <h5 className="mb-0">⭐ Feedback Summary</h5>
            </Card.Header>
            <Card.Body>
              {feedbackStats ? (
                <div className="feedback-summary">
                  <div className="feedback-rating">
                    <span className="rating-value">{feedbackStats.averageRating.toFixed(1)}</span>
                    <span className="rating-label">/ 5 Average Rating</span>
                  </div>
                  <div className="feedback-breakdown">
                    <div className="feedback-item positive">
                      <span>😊 Positive Feedback</span>
                      <span>{feedbackStats.positiveFeedback}%</span>
                    </div>
                    <div className="feedback-item neutral">
                      <span>😐 Neutral</span>
                      <span>{feedbackStats.neutralFeedback}%</span>
                    </div>
                    <div className="feedback-item negative">
                      <span>😞 Negative</span>
                      <span>{feedbackStats.negativeFeedback}%</span>
                    </div>
                  </div>
                  <div className="feedback-pending">
                    <span>⏳ Pending Reviews</span>
                    <Badge bg="warning">{feedbackStats.pendingReviews}</Badge>
                  </div>
                </div>
              ) : (
                <div className="text-center text-muted py-3">
                  <small>Loading feedback data...</small>
                </div>
              )}
            </Card.Body>
          </Card>

          {}
          <Card className="dashboard-card mb-3">
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">📢 System Announcements</h5>
              <Button variant="link" size="sm" onClick={() => {}}>
                + New
              </Button>
            </Card.Header>
            <Card.Body>
              <div className="announcement-list">
                <div className="announcement-item">
                  <span className="announcement-icon">🔔</span>
                  <span className="announcement-text">Scheduled Maintenance Notice</span>
                </div>
                <div className="announcement-item">
                  <span className="announcement-icon">📢</span>
                  <span className="announcement-text">New Policy Update</span>
                </div>
                <div className="announcement-item">
                  <span className="announcement-icon">🧾</span>
                  <span className="announcement-text">Legal Guidelines Revised</span>
                </div>
              </div>
            </Card.Body>
          </Card>

          {}
          <Card className="dashboard-card activity-feed">
            <Card.Header>
              <h5 className="mb-0">🔄 Live Activity Stream</h5>
            </Card.Header>
            <Card.Body className="activity-body">
              {activities.length > 0 ? (
                <div className="activity-list">
                  {activities.map((activity) => (
                    <div key={activity.id} className="activity-item">
                      <div className="activity-icon">
                        {getActivityIcon(activity.eventType)}
                      </div>
                      <div className="activity-content">
                        <div className="activity-text">{activity.description}</div>
                        <div className="activity-time">
                          🕒 {formatTimeAgo(activity.timestamp)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-muted">No recent activity</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {}
      <Row className="mt-5">
        <Col>
          <div className="dashboard-footer text-center py-3 border-top">
            <small className="text-muted">
              © 2025 Child Protection & Support Portal | Admin Control System | Secure | Audited
            </small>
          </div>
        </Col>
      </Row>
      </div>
  );
};

const getStatusColor = (status: string): string => {
  const statusUpper = status.toUpperCase();
  if (statusUpper.includes('REPORTED')) return '#4CAF50';
  if (statusUpper.includes('REVIEW')) return '#FFC107';
  if (statusUpper.includes('ASSIGNED')) return '#2196F3';
  if (statusUpper.includes('INVESTIGATING')) return '#FF9800';
  if (statusUpper.includes('RESOLVED')) return '#9C27B0';
  if (statusUpper.includes('CLOSED')) return '#424242';
  return '#757575';
};

export default AdminDashboard;

