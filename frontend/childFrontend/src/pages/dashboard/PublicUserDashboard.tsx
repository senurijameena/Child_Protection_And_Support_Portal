import React, { useState, useEffect } from 'react';
import { 
  Row, 
  Col, 
  Card, 
  Button, 
  Alert, 
  Spinner,
  Badge
} from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import { caseService } from '../../services/caseService';
import { helpRequestService } from '../../services/helpRequestService';
import { notificationService } from '../../services/notificationService';
import { timelineService } from '../../services/timelineService';
import { userService } from '../../services/userService';
import './PublicUserDashboard.css';

interface Case {
  id: string;
  trackingId?: string;
  caseType?: string;
  caseDescription?: string;
  status?: string;
  assignedOfficerId?: string;
  assignedWorkerId?: string;
  priority?: string;
  emergency?: boolean;
}

interface HelpRequest {
  id: string;
  trackingId?: string;
  helpType?: string;
  description?: string;
  status?: string;
  assignedWorkerId?: string;
  priority?: string;
}

interface Notification {
  id: string;
  title?: string;
  message?: string;
  createdAt?: string;
  read?: boolean;
}

interface Activity {
  id: string;
  eventType?: string;
  description?: string;
  timestamp?: string;
  entityType?: string;
  entityId?: string;
}

const PublicUserDashboard: React.FC = () => {
  const navigate = useNavigate();
  const user = authService.getCurrentUser();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastLogin, setLastLogin] = useState<string | null>(null);
  const [cases, setCases] = useState<Case[]>([]);
  const [helpRequests, setHelpRequests] = useState<HelpRequest[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch user profile for last login
      if (user?.id) {
        try {
          const profileResponse = await userService.getUserProfile(user.id);
          if (profileResponse.data?.lastLogin) {
            const loginDate = new Date(profileResponse.data.lastLogin);
            setLastLogin(formatLastLogin(loginDate));
          }
        } catch (err) {
          console.error('Error fetching user profile:', err);
        }
      }

      // Fetch cases
      try {
        const casesResponse = await caseService.getMyCases();
        const casesData = Array.isArray(casesResponse.data) ? casesResponse.data : [];
        setCases(casesData);
      } catch (err) {
        console.error('Error fetching cases:', err);
        setCases([]);
      }

      // Fetch help requests
      try {
        const helpRequestsResponse = await helpRequestService.getMyRequests();
        const helpRequestsData = Array.isArray(helpRequestsResponse.data) ? helpRequestsResponse.data : [];
        setHelpRequests(helpRequestsData);
      } catch (err) {
        console.error('Error fetching help requests:', err);
        setHelpRequests([]);
      }

      // Fetch notifications
      try {
        const notificationsResponse = await notificationService.getUnreadNotifications();
        const notificationsData = Array.isArray(notificationsResponse.data) 
          ? notificationsResponse.data.slice(0, 5) 
          : [];
        setNotifications(notificationsData);
      } catch (err) {
        console.error('Error fetching notifications:', err);
        setNotifications([]);
      }

      // Fetch recent activity
      try {
        const activityResponse = await timelineService.getRecentActivity(5);
        const activityData = Array.isArray(activityResponse.data) ? activityResponse.data : [];
        setActivities(activityData);
      } catch (err) {
        console.error('Error fetching activity:', err);
        setActivities([]);
      }
    } catch (err: any) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const formatLastLogin = (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) {
      return date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit', 
        hour12: true 
      });
    }
    if (diffDays === 1) return 'Yesterday, ' + date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit', 
      hour12: true 
    });
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatActivityTime = (timestamp?: string): string => {
    if (!timestamp) return '';
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffMins < 60) return `Today, ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`;
      if (diffHours < 24) return `Today, ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`;
      if (diffDays === 1) return `Yesterday, ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`;
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    } catch {
      return timestamp;
    }
  };

  const getStatusBadgeVariant = (status?: string): string => {
    if (!status) return 'secondary';
    const statusUpper = status.toUpperCase();
    if (statusUpper === 'URGENT' || statusUpper === 'EMERGENCY') return 'danger';
    if (statusUpper === 'ASSIGNED' || statusUpper === 'IN_PROGRESS') return 'success';
    if (statusUpper === 'UNDER_REVIEW') return 'warning';
    if (statusUpper === 'RESOLVED' || statusUpper === 'COMPLETED' || statusUpper === 'CLOSED') return 'success';
    return 'secondary';
  };

  const getStatusDisplay = (status?: string): string => {
    if (!status) return 'UNKNOWN';
    return status.replace(/_/g, ' ');
  };

  const getStatusColor = (status?: string): string => {
    if (!status) return '#64748B'; // Disabled Text - Slate Blue
    const statusUpper = status.toUpperCase();
    if (statusUpper === 'URGENT' || statusUpper === 'EMERGENCY') return '#EF4444'; // Danger - Red
    if (statusUpper === 'ASSIGNED' || statusUpper === 'IN_PROGRESS') return '#22D3EE'; // Success - Cyan Blue
    if (statusUpper === 'UNDER_REVIEW') return '#FBBF24'; // Warning - Amber
    if (statusUpper === 'RESOLVED' || statusUpper === 'COMPLETED' || statusUpper === 'CLOSED') return '#22D3EE'; // Success - Cyan Blue
    return '#64748B'; // Disabled Text - Slate Blue
  };

  // Calculate statistics
  const totalCases = cases.length;
  const activeCases = cases.filter(c => {
    const status = c.status?.toUpperCase();
    return status && !['RESOLVED', 'CLOSED', 'REJECTED'].includes(status);
  });
  const resolvedCases = cases.filter(c => {
    const status = c.status?.toUpperCase();
    return status && ['RESOLVED', 'CLOSED'].includes(status);
  }).length;

  const totalHelpRequests = helpRequests.length;
  const activeHelpRequests = helpRequests.filter(hr => {
    const status = hr.status?.toUpperCase();
    return status && !['COMPLETED', 'REJECTED'].includes(status);
  });
  const resolvedHelpRequests = helpRequests.filter(hr => {
    const status = hr.status?.toUpperCase();
    return status && ['COMPLETED'].includes(status);
  }).length;

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  return (
    <div className="public-user-dashboard">
      {/* Welcome Section */}
      <div className="dashboard-header-section mb-4">
        <h2 className="dashboard-title">
          Welcome back, {user?.name || 'User'}! 👋
        </h2>
        {lastLogin && (
          <p className="dashboard-subtitle">Last login: {lastLogin}</p>
        )}
      </div>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)} className="mb-4">
          {error}
        </Alert>
      )}

      {/* Quick Action Buttons */}
      <Row className="mb-4">
        <Col md={6} className="mb-3">
          <Card className="quick-action-card-main">
            <Card.Body className="text-center py-4">
              <div className="quick-action-icon-main mb-3">📄</div>
              <Card.Title className="mb-3">Report Case</Card.Title>
              <Card.Text className="text-muted mb-3">
                Report a new child protection case
              </Card.Text>
              <Button 
                variant="primary" 
                size="lg"
                onClick={() => navigate('/report-case')}
                className="w-100"
              >
                Report Case
              </Button>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6} className="mb-3">
          <Card className="quick-action-card-main">
            <Card.Body className="text-center py-4">
              <div className="quick-action-icon-main mb-3">❤️</div>
              <Card.Title className="mb-3">Request Help</Card.Title>
              <Card.Text className="text-muted mb-3">
                Request assistance or support for a child in need
              </Card.Text>
              <Button 
                variant="warning" 
                size="lg"
                onClick={() => navigate('/request-help')}
                className="w-100"
              >
                Request Help
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Statistics Cards */}
      <Row className="mb-4">
        <Col md={6} lg={3} className="mb-3">
          <Card className="stat-card stat-card-primary">
            <Card.Body>
              <div className="stat-icon">🛡️</div>
              <div className="stat-content">
                <div className="stat-label">Total Cases</div>
                <div className="stat-value">{totalCases}</div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6} lg={3} className="mb-3">
          <Card className="stat-card stat-card-warning">
            <Card.Body>
              <div className="stat-icon">📋</div>
              <div className="stat-content">
                <div className="stat-label">Active Cases</div>
                <div className="stat-value">{activeCases.length}</div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6} lg={3} className="mb-3">
          <Card className="stat-card stat-card-success">
            <Card.Body>
              <div className="stat-icon">📊</div>
              <div className="stat-content">
                <div className="stat-label">Resolved Cases</div>
                <div className="stat-value">{resolvedCases}</div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6} lg={3} className="mb-3">
          <Card className="stat-card stat-card-info">
            <Card.Body>
              <div className="stat-icon">❤️</div>
              <div className="stat-content">
                <div className="stat-label">Help Requests</div>
                <div className="stat-value">{totalHelpRequests}</div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Active Cases and Help Requests */}
      <Row className="mb-4">
        <Col md={6} className="mb-4">
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">📋 MY ACTIVE CASES ({activeCases.length})</h5>
            </Card.Header>
            <Card.Body>
              {activeCases.length > 0 ? (
                <>
                  {activeCases.slice(0, 2).map((caseItem) => (
                    <div key={caseItem.id} className="case-item mb-3 pb-3 border-bottom">
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <div>
                          <div className="fw-bold">{caseItem.trackingId || `CASE-${caseItem.id.slice(0, 4).toUpperCase()}`}</div>
                          <div className="text-muted small">
                            {caseItem.caseType || caseItem.caseDescription?.substring(0, 50) || 'No description'}
                          </div>
                        </div>
                      </div>
                      <div className="d-flex align-items-center gap-2 mb-2">
                        <Badge 
                          bg={getStatusBadgeVariant(caseItem.status)} 
                          style={{ backgroundColor: getStatusColor(caseItem.status) }}
                        >
                          {getStatusDisplay(caseItem.status)}
                        </Badge>
                        {(caseItem.emergency || caseItem.priority === 'HIGH') && (
                          <Badge bg="danger">🔴 URGENT</Badge>
                        )}
                      </div>
                      {caseItem.assignedOfficerId && (
                        <div className="text-muted small mb-2">
                          Assigned: Officer {caseItem.assignedOfficerId.slice(0, 8)}
                        </div>
                      )}
                      <Button 
                        variant="outline-primary" 
                        size="sm"
                        onClick={() => navigate(`/cases/${caseItem.id}`)}
                      >
                        {caseItem.status?.toUpperCase() === 'UNDER_REVIEW' ? 'Track Progress' : 'View Details'}
                      </Button>
                    </div>
                  ))}
                  <Button 
                    variant="link" 
                    className="p-0 mt-2"
                    onClick={() => navigate('/cases/my-cases')}
                  >
                    View All Cases →
                  </Button>
                </>
              ) : (
                <>
                  <div className="text-center text-muted py-4">
                    No active cases
                  </div>
                </>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col md={6} className="mb-4">
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">❤️ ACTIVE HELP REQUESTS ({activeHelpRequests.length})</h5>
            </Card.Header>
            <Card.Body>
              {activeHelpRequests.length > 0 ? (
                <>
                  {activeHelpRequests.slice(0, 2).map((request) => (
                    <div key={request.id} className="help-request-item mb-3 pb-3 border-bottom">
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <div>
                          <div className="fw-bold">{request.trackingId || `HELP-${request.id.slice(0, 4).toUpperCase()}`}</div>
                          <div className="text-muted small">
                            {request.helpType || request.description?.substring(0, 50) || 'No description'}
                          </div>
                        </div>
                      </div>
                      <div className="d-flex align-items-center gap-2 mb-2">
                        <Badge 
                          bg={getStatusBadgeVariant(request.status)}
                          style={{ backgroundColor: getStatusColor(request.status) }}
                        >
                          {getStatusDisplay(request.status)}
                        </Badge>
                      </div>
                      {request.assignedWorkerId && (
                        <div className="text-muted small mb-2">
                          Assigned: Worker {request.assignedWorkerId.slice(0, 8)}
                        </div>
                      )}
                      <Button 
                        variant="outline-warning" 
                        size="sm"
                        onClick={() => navigate(`/help-requests/${request.id}`)}
                      >
                        {request.status?.toUpperCase() === 'UNDER_REVIEW' ? 'Check Status' : 'View Details'}
                      </Button>
                    </div>
                  ))}
                  <Button 
                    variant="link" 
                    className="p-0 mt-2"
                    onClick={() => navigate('/help-requests/my-requests')}
                  >
                    View All Requests →
                  </Button>
                </>
              ) : (
                <>
                  <div className="text-center text-muted py-4">
                    No active help requests
                  </div>
                </>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Notifications and Activity */}
      <Row>
        <Col md={6} className="mb-4">
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">🔔 RECENT NOTIFICATIONS ({notifications.length})</h5>
            </Card.Header>
            <Card.Body>
              {notifications.length > 0 ? (
                <>
                  {notifications.slice(0, 3).map((notification) => (
                    <div key={notification.id} className="notification-item mb-3 pb-3 border-bottom">
                      <div className="fw-bold small mb-1">{notification.title || 'Notification'}</div>
                      <div className="text-muted small mb-2">{notification.message || ''}</div>
                      <Button 
                        variant="link" 
                        size="sm" 
                        className="p-0"
                        onClick={() => navigate('/notifications')}
                      >
                        View
                      </Button>
                    </div>
                  ))}
                  <Button 
                    variant="link" 
                    className="p-0 mt-2"
                    onClick={() => navigate('/notifications')}
                  >
                    See All →
                  </Button>
                </>
              ) : (
                <>
                  <div className="text-center text-muted py-4">
                    No notifications
                  </div>
                </>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col md={6} className="mb-4">
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">📅 RECENT ACTIVITY</h5>
            </Card.Header>
            <Card.Body>
              {activities.length > 0 ? (
                <>
                  {activities.slice(0, 3).map((activity) => (
                    <div key={activity.id} className="activity-item mb-3 pb-3 border-bottom">
                      <div className="text-muted small mb-1">
                        {formatActivityTime(activity.timestamp)}
                      </div>
                      <div className="small">{activity.description || activity.eventType || 'Activity'}</div>
                    </div>
                  ))}
                  <Button 
                    variant="link" 
                    className="p-0 mt-2"
                    onClick={() => navigate('/analytics')}
                  >
                    See All →
                  </Button>
                </>
              ) : (
                <>
                  <div className="text-center text-muted py-4">
                    No recent activity
                  </div>
                </>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default PublicUserDashboard;