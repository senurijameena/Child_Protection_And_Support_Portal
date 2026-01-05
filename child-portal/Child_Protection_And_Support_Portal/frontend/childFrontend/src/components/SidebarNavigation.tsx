import React, { useState, useEffect } from 'react';
import { Nav, Accordion, Badge, Spinner } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import { authService } from '../services/authService';
import { notificationService } from '../services/notificationService';
import './SidebarNavigation.css';

interface SidebarNavigationProps {
  userType: 'PUBLIC' | 'POLICE' | 'SOCIAL_WORKER' | 'ADMIN';
}

const getActiveServicesCount = () => 0; 
const getPendingOffersCount = () => 0; 
const getUrgentRequestsCount = () => 0; 


const SidebarNavigation: React.FC<SidebarNavigationProps> = ({ userType }) => {
  const location = useLocation();
  const user = authService.getCurrentUser();
  const [stats, setStats] = useState({
    activeCases: 0,
    emergencyCases: 0,
    pendingTransfers: 0,
    unreadNotifications: 0
  });
  const [loading, setLoading] = useState(true);

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  useEffect(() => {
    const fetchPoliceStats = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const response = await fetch('/api/police/dashboard/stats', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (error) {
        console.error('Error fetching police stats:', error);
      } finally {
        setLoading(false);
      }
    };

    if (userType === 'POLICE') {
      fetchPoliceStats();
    } else {
      setLoading(false);
    }
  }, [userType]);


  const policeSidebar = () => (
    <>
      <Nav.Item>
        <Nav.Link 
          as={Link} 
          to="/police/dashboard" 
          className={`sidebar-link ${isActive('/police/dashboard') ? 'active' : ''}`}
        >
          <i className="bi bi-speedometer2 me-2"></i>
          Dashboard Home
        </Nav.Link>
      </Nav.Item>

      <Accordion defaultActiveKey={isActive('/police/assignments') ? '0' : undefined}>
        <Accordion.Item eventKey="0" className="sidebar-accordion">
          <Accordion.Header className="sidebar-accordion-header">
            <div className="d-flex align-items-center w-100">
              <i className="bi bi-shield me-2"></i>
              <span>My Assignments</span>
              {loading ? (
                <Spinner animation="border" size="sm" className="ms-auto" />
              ) : (
                <Badge bg="primary" className="ms-auto">
                  {stats.activeCases + stats.emergencyCases}
                </Badge>
              )}
            </div>
          </Accordion.Header>
          <Accordion.Body className="p-0">
            <Nav className="flex-column">
              <Nav.Link 
                as={Link} 
                to="/police/assignments/active" 
                className={`sidebar-sublink ${isActive('/police/assignments/active') ? 'active' : ''}`}
              >
                <i className="bi bi-folder me-2"></i>
                Active Cases
                {!loading && stats.activeCases > 0 && (
                  <Badge bg="primary" className="ms-2">{stats.activeCases}</Badge>
                )}
              </Nav.Link>
              <Nav.Link 
                as={Link} 
                to="/police/assignments/emergency" 
                className={`sidebar-sublink ${isActive('/police/assignments/emergency') ? 'active' : ''}`}
              >
                <i className="bi bi-exclamation-triangle me-2"></i>
                Emergency Cases
                {!loading && stats.emergencyCases > 0 && (
                  <Badge bg="danger" className="ms-2">{stats.emergencyCases}</Badge>
                )}
              </Nav.Link>
              <Nav.Link 
                as={Link} 
                to="/police/assignments/history" 
                className={`sidebar-sublink ${isActive('/police/assignments/history') ? 'active' : ''}`}
              >
                <i className="bi bi-clock-history me-2"></i>
                Case History
              </Nav.Link>
            </Nav>
          </Accordion.Body>
        </Accordion.Item>
      </Accordion>

      <Accordion>
        <Accordion.Item eventKey="1" className="sidebar-accordion">
          <Accordion.Header className="sidebar-accordion-header">
            <div className="d-flex align-items-center w-100">
              <i className="bi bi-files me-2"></i>
              <span>All Cases</span>
            </div>
          </Accordion.Header>
          <Accordion.Body className="p-0">
            <Nav className="flex-column">
              <Nav.Link 
                as={Link} 
                to="/police/cases/search" 
                className={`sidebar-sublink ${isActive('/police/cases/search') ? 'active' : ''}`}
              >
                <i className="bi bi-search me-2"></i>
                Search Cases
              </Nav.Link>
              <Nav.Link 
                as={Link} 
                to="/police/cases/map" 
                className={`sidebar-sublink ${isActive('/police/cases/map') ? 'active' : ''}`}
              >
                <i className="bi bi-geo-alt me-2"></i>
                Map View
              </Nav.Link>
              <Nav.Link 
                as={Link} 
                to="/police/cases/bulk-actions" 
                className={`sidebar-sublink ${isActive('/police/cases/bulk-actions') ? 'active' : ''}`}
              >
                <i className="bi bi-collection me-2"></i>
                Bulk Actions
              </Nav.Link>
            </Nav>
          </Accordion.Body>
        </Accordion.Item>
      </Accordion>

      <Accordion>
        <Accordion.Item eventKey="2" className="sidebar-accordion">
          <Accordion.Header className="sidebar-accordion-header">
            <div className="d-flex align-items-center w-100">
              <i className="bi bi-arrow-left-right me-2"></i>
              <span>Transfer Management</span>
              {!loading && stats.pendingTransfers > 0 && (
                <Badge bg="warning" className="ms-auto">{stats.pendingTransfers}</Badge>
              )}
            </div>
          </Accordion.Header>
          <Accordion.Body className="p-0">
            <Nav className="flex-column">
              <Nav.Link 
                as={Link} 
                to="/police/transfers/request" 
                className={`sidebar-sublink ${isActive('/police/transfers/request') ? 'active' : ''}`}
              >
                <i className="bi bi-send me-2"></i>
                Request Transfer
              </Nav.Link>
              <Nav.Link 
                as={Link} 
                to="/police/transfers/pending" 
                className={`sidebar-sublink ${isActive('/police/transfers/pending') ? 'active' : ''}`}
              >
                <i className="bi bi-hourglass-split me-2"></i>
                Pending Transfers
              </Nav.Link>
            </Nav>
          </Accordion.Body>
        </Accordion.Item>
      </Accordion>

      <Accordion>
        <Accordion.Item eventKey="3" className="sidebar-accordion">
          <Accordion.Header className="sidebar-accordion-header">
            <div className="d-flex align-items-center w-100">
              <i className="bi bi-bar-chart me-2"></i>
              <span>Performance</span>
            </div>
          </Accordion.Header>
          <Accordion.Body className="p-0">
            <Nav className="flex-column">
              <Nav.Link 
                as={Link} 
                to="/police/performance/stats" 
                className={`sidebar-sublink ${isActive('/police/performance/stats') ? 'active' : ''}`}
              >
                <i className="bi bi-graph-up me-2"></i>
                My Statistics
              </Nav.Link>
              <Nav.Link 
                as={Link} 
                to="/police/performance/team" 
                className={`sidebar-sublink ${isActive('/police/performance/team') ? 'active' : ''}`}
              >
                <i className="bi bi-people me-2"></i>
                Team Metrics
              </Nav.Link>
            </Nav>
          </Accordion.Body>
        </Accordion.Item>
      </Accordion>

      <Nav.Item>
        <Nav.Link 
          as={Link} 
          to="/police/status" 
          className={`sidebar-link ${isActive('/police/status') ? 'active' : ''}`}
        >
          <i className="bi bi-lightning-charge me-2"></i>
          Status
          <Badge bg="success" className="ms-2">ON DUTY</Badge>
        </Nav.Link>
      </Nav.Item>

      <Nav.Item>
        <Nav.Link 
          as={Link} 
          to="/police/duty-roster" 
          className={`sidebar-link ${isActive('/police/duty-roster') ? 'active' : ''}`}
        >
          <i className="bi bi-calendar-week me-2"></i>
          Duty Roster
          <Badge bg="info" className="ms-2">2</Badge>
        </Nav.Link>
      </Nav.Item>

      <Nav.Item>
        <Nav.Link 
          as={Link} 
          to="/police/notifications" 
          className={`sidebar-link ${isActive('/police/notifications') ? 'active' : ''}`}
        >
          <i className="bi bi-bell me-2"></i>
          Notifications
          {!loading && stats.unreadNotifications > 0 && (
            <Badge bg="danger" className="ms-2">{stats.unreadNotifications}</Badge>
          )}
        </Nav.Link>
      </Nav.Item>

      <hr className="my-2" />

      <Nav.Item>
        <Nav.Link 
          as={Link} 
          to="/police/settings" 
          className="sidebar-link"
        >
          <i className="bi bi-gear me-2"></i>
          Settings
        </Nav.Link>
      </Nav.Item>

      <div className="px-3 mt-3 mb-2">
        <small className="text-muted fw-bold">QUICK ACTIONS</small>
      </div>

      <Nav.Item>
        <Nav.Link 
          as={Link} 
          to="/police/quick/new-case" 
          className="sidebar-link"
        >
          <i className="bi bi-plus-circle me-2 text-success"></i>
          <span className="text-success">Create New Case</span>
        </Nav.Link>
      </Nav.Item>
      <Nav.Item>
        <Nav.Link 
          as={Link} 
          to="/police/quick/update-status" 
          className="sidebar-link"
        >
          <i className="bi bi-pencil-square me-2 text-warning"></i>
          <span className="text-warning">Update Status</span>
        </Nav.Link>
      </Nav.Item>
      <Nav.Item>
        <Nav.Link 
          as={Link} 
          to="/police/quick/emergency" 
          className="sidebar-link"
        >
          <i className="bi bi-exclamation-triangle me-2 text-danger"></i>
          <span className="text-danger">Emergency Protocol</span>
        </Nav.Link>
      </Nav.Item>
    </>
  );

  const socialWorkerSidebarContent = () => (
    <>
      {}
      <Nav.Item>
        <Nav.Link 
          as={Link} 
          to="/social-worker/dashboard" 
          className={`sidebar-link ${isActive('/social-worker/dashboard') ? 'active' : ''}`}
        >
          <i className="bi bi-speedometer2 me-2"></i>
          🏠 Dashboard
        </Nav.Link>
      </Nav.Item>

      {}
      <Nav.Item>
        <Nav.Link 
          as={Link} 
          to="/social-worker/help-requests/my-requests" 
          className={`sidebar-link ${isActive('/social-worker/help-requests/my-requests') ? 'active' : ''}`}
        >
          <i className="bi bi-list-ul me-2"></i>
          📋 My Help Requests
          <Badge bg="primary" className="ms-2">{getActiveServicesCount()}</Badge>
        </Nav.Link>
      </Nav.Item>

      {}
      <Accordion defaultActiveKey={isActive('/social-worker/help-actions') ? '0' : undefined}>
        <Accordion.Item eventKey="0" className="sidebar-accordion">
          <Accordion.Header className="sidebar-accordion-header">
            <div className="d-flex align-items-center w-100">
              <i className="bi bi-tools me-2"></i>
              <span>🛠️ Help Actions</span>
            </div>
          </Accordion.Header>
          <Accordion.Body className="p-0">
            <Nav className="flex-column">
              <Nav.Link 
                as={Link} 
                to="/social-worker/help-actions/request-transfer" 
                className={`sidebar-sublink ${isActive('/social-worker/help-actions/request-transfer') ? 'active' : ''}`}
              >
                <i className="bi bi-arrow-left-right me-2"></i>
                Request Transfer
              </Nav.Link>
              <Nav.Link 
                as={Link} 
                to="/social-worker/help-actions/transfer-history" 
                className={`sidebar-sublink ${isActive('/social-worker/help-actions/transfer-history') ? 'active' : ''}`}
              >
                <i className="bi bi-clock-history me-2"></i>
                Transfer History
              </Nav.Link>
              <Nav.Link 
                as={Link} 
                to="/social-worker/help-actions/service-management" 
                className={`sidebar-sublink ${isActive('/social-worker/help-actions/service-management') ? 'active' : ''}`}
              >
                <i className="bi bi-gear me-2"></i>
                Service Management
              </Nav.Link>
            </Nav>
          </Accordion.Body>
        </Accordion.Item>
      </Accordion>

      {}
      <Nav.Item>
        <Nav.Link 
          as={Link} 
          to="/social-worker/messages" 
          className={`sidebar-link ${isActive('/social-worker/messages') ? 'active' : ''}`}
        >
          <i className="bi bi-chat-dots me-2"></i>
          📩 Messages
          <Badge bg="danger" className="ms-2">3</Badge>
        </Nav.Link>
      </Nav.Item>

      {}
      <Nav.Item>
        <Nav.Link 
          as={Link} 
          to="/social-worker/analytics" 
          className={`sidebar-link ${isActive('/social-worker/analytics') ? 'active' : ''}`}
        >
          <i className="bi bi-graph-up me-2"></i>
          📊 Analytics
        </Nav.Link>
      </Nav.Item>

      {}
      <Nav.Item>
        <Nav.Link 
          as={Link} 
          to="/social-worker/profile" 
          className={`sidebar-link ${isActive('/social-worker/profile') ? 'active' : ''}`}
        >
          <i className="bi bi-person-circle me-2"></i>
          👤 Profile & Availability
        </Nav.Link>
      </Nav.Item>
    </>
  );

  const adminSidebarContent = () => (
    <>
      {}
      <div className="admin-avatar-section mb-3 px-3">
        <div className="d-flex align-items-center">
          <div className="admin-avatar me-3">
            {user?.profileImage ? (
              <img 
                src={user.profileImage} 
                alt={user.name || 'Admin'} 
                className="avatar-img"
                style={{ width: '50px', height: '50px', borderRadius: '50%', objectFit: 'cover' }}
              />
            ) : (
              <div 
                className="avatar-placeholder"
                style={{ 
                  width: '50px', 
                  height: '50px', 
                  borderRadius: '50%', 
                  background: 'linear-gradient(135deg, #1a237e, #3949ab)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '1.5rem',
                  fontWeight: 'bold'
                }}
              >
                👤
              </div>
            )}
          </div>
          <div className="admin-info">
            <div className="fw-bold" style={{ fontSize: '0.95rem' }}>
              {user?.name || 'Administrator'}
            </div>
            <div className="text-muted" style={{ fontSize: '0.75rem' }}>
              System Administrator
            </div>
          </div>
        </div>
      </div>

      <hr className="my-2 mx-3" />

      {}
      <Nav.Item>
        <Nav.Link 
          as={Link} 
          to="/admin/dashboard" 
          className={`sidebar-link ${isActive('/admin/dashboard') ? 'active' : ''}`}
        >
          <i className="bi bi-speedometer2 me-2"></i>
          🏠 Dashboard
        </Nav.Link>
      </Nav.Item>

      {}
      <Accordion defaultActiveKey={isActive('/admin/users') ? '0' : undefined}>
        <Accordion.Item eventKey="0" className="sidebar-accordion">
          <Accordion.Header className="sidebar-accordion-header">
            <div className="d-flex align-items-center w-100">
              <i className="bi bi-people me-2"></i>
              <span>👥 User Management</span>
            </div>
          </Accordion.Header>
          <Accordion.Body className="p-0">
            <Nav className="flex-column">
              <Nav.Link 
                as={Link} 
                to="/admin/users/all" 
                className={`sidebar-sublink ${isActive('/admin/users/all') ? 'active' : ''}`}
              >
                <i className="bi bi-people-fill me-2"></i>
                All Users
              </Nav.Link>
              <Nav.Link 
                as={Link} 
                to="/admin/users/public" 
                className={`sidebar-sublink ${isActive('/admin/users/public') ? 'active' : ''}`}
              >
                <i className="bi bi-person me-2"></i>
                Public Users
              </Nav.Link>
              <Nav.Link 
                as={Link} 
                to="/admin/users/police" 
                className={`sidebar-sublink ${isActive('/admin/users/police') ? 'active' : ''}`}
              >
                <i className="bi bi-shield-check me-2"></i>
                Police Officers
              </Nav.Link>
              <Nav.Link 
                as={Link} 
                to="/admin/users/social-workers" 
                className={`sidebar-sublink ${isActive('/admin/users/social-workers') ? 'active' : ''}`}
              >
                <i className="bi bi-heart-pulse me-2"></i>
                Social Workers
              </Nav.Link>
              <Nav.Link 
                as={Link} 
                to="/admin/users/deactivated" 
                className={`sidebar-sublink ${isActive('/admin/users/deactivated') ? 'active' : ''}`}
              >
                <i className="bi bi-person-x me-2"></i>
                Deactivated Users
              </Nav.Link>
            </Nav>
          </Accordion.Body>
        </Accordion.Item>
      </Accordion>

      {}
      <Accordion defaultActiveKey={isActive('/admin/cases') ? '1' : undefined}>
        <Accordion.Item eventKey="1" className="sidebar-accordion">
          <Accordion.Header className="sidebar-accordion-header">
            <div className="d-flex align-items-center w-100">
              <i className="bi bi-folder me-2"></i>
              <span>🚨 Case Management</span>
            </div>
          </Accordion.Header>
          <Accordion.Body className="p-0">
            <Nav className="flex-column">
              <Nav.Link 
                as={Link} 
                to="/admin/cases/all" 
                className={`sidebar-sublink ${isActive('/admin/cases/all') ? 'active' : ''}`}
              >
                <i className="bi bi-list-ul me-2"></i>
                All Cases
              </Nav.Link>
              <Nav.Link 
                as={Link} 
                to="/admin/cases/emergency" 
                className={`sidebar-sublink ${isActive('/admin/cases/emergency') ? 'active' : ''}`}
              >
                <i className="bi bi-exclamation-triangle me-2"></i>
                Emergency Cases
              </Nav.Link>
              <Nav.Link 
                as={Link} 
                to="/admin/cases/pending-review" 
                className={`sidebar-sublink ${isActive('/admin/cases/pending-review') ? 'active' : ''}`}
              >
                <i className="bi bi-hourglass-split me-2"></i>
                Pending Review
              </Nav.Link>
              <Nav.Link 
                as={Link} 
                to="/admin/cases/assigned" 
                className={`sidebar-sublink ${isActive('/admin/cases/assigned') ? 'active' : ''}`}
              >
                <i className="bi bi-person-check me-2"></i>
                Assigned Cases
              </Nav.Link>
              <Nav.Link 
                as={Link} 
                to="/admin/cases/resolved" 
                className={`sidebar-sublink ${isActive('/admin/cases/resolved') ? 'active' : ''}`}
              >
                <i className="bi bi-check-circle me-2"></i>
                Resolved Cases
              </Nav.Link>
              <Nav.Link 
                as={Link} 
                to="/admin/cases/closed" 
                className={`sidebar-sublink ${isActive('/admin/cases/closed') ? 'active' : ''}`}
              >
                <i className="bi bi-archive me-2"></i>
                Closed Cases
              </Nav.Link>
            </Nav>
          </Accordion.Body>
        </Accordion.Item>
      </Accordion>

      {}
      <Accordion defaultActiveKey={isActive('/admin/help-requests') ? '2' : undefined}>
        <Accordion.Item eventKey="2" className="sidebar-accordion">
          <Accordion.Header className="sidebar-accordion-header">
            <div className="d-flex align-items-center w-100">
              <i className="bi bi-question-circle me-2"></i>
              <span>🤝 Help Requests</span>
            </div>
          </Accordion.Header>
          <Accordion.Body className="p-0">
            <Nav className="flex-column">
              <Nav.Link 
                as={Link} 
                to="/admin/help-requests/all" 
                className={`sidebar-sublink ${isActive('/admin/help-requests') ? 'active' : ''}`}
              >
                <i className="bi bi-list-ul me-2"></i>
                All Help Requests
              </Nav.Link>
              <Nav.Link 
                as={Link} 
                to="/admin/help-requests/marketplace" 
                className={`sidebar-sublink ${isActive('/admin/help-requests/marketplace') ? 'active' : ''}`}
              >
                <i className="bi bi-shop me-2"></i>
                Marketplace
              </Nav.Link>
              <Nav.Link 
                as={Link} 
                to="/admin/help-requests/assigned" 
                className={`sidebar-sublink ${isActive('/admin/help-requests/assigned') ? 'active' : ''}`}
              >
                <i className="bi bi-person-check me-2"></i>
                Assigned Requests
              </Nav.Link>
              <Nav.Link 
                as={Link} 
                to="/admin/help-requests/completed" 
                className={`sidebar-sublink ${isActive('/admin/help-requests/completed') ? 'active' : ''}`}
              >
                <i className="bi bi-check-circle me-2"></i>
                Completed Requests
              </Nav.Link>
            </Nav>
          </Accordion.Body>
        </Accordion.Item>
      </Accordion>

      {}
      <Accordion defaultActiveKey={isActive('/admin/transfers') ? '3' : undefined}>
        <Accordion.Item eventKey="3" className="sidebar-accordion">
          <Accordion.Header className="sidebar-accordion-header">
            <div className="d-flex align-items-center w-100">
              <i className="bi bi-arrow-left-right me-2"></i>
              <span>🔄 Transfers</span>
            </div>
          </Accordion.Header>
          <Accordion.Body className="p-0">
            <Nav className="flex-column">
              <Nav.Link 
                as={Link} 
                to="/admin/transfers/pending" 
                className={`sidebar-sublink ${isActive('/admin/transfers/pending') ? 'active' : ''}`}
              >
                <i className="bi bi-hourglass-split me-2"></i>
                Pending Transfers
              </Nav.Link>
              <Nav.Link 
                as={Link} 
                to="/admin/transfers/approved" 
                className={`sidebar-sublink ${isActive('/admin/transfers/approved') ? 'active' : ''}`}
              >
                <i className="bi bi-check-circle me-2"></i>
                Approved Transfers
              </Nav.Link>
              <Nav.Link 
                as={Link} 
                to="/admin/transfers/rejected" 
                className={`sidebar-sublink ${isActive('/admin/transfers/rejected') ? 'active' : ''}`}
              >
                <i className="bi bi-x-circle me-2"></i>
                Rejected Transfers
              </Nav.Link>
            </Nav>
          </Accordion.Body>
        </Accordion.Item>
      </Accordion>

      {}
      <Accordion defaultActiveKey={isActive('/admin/analytics') ? '4' : undefined}>
        <Accordion.Item eventKey="4" className="sidebar-accordion">
          <Accordion.Header className="sidebar-accordion-header">
            <div className="d-flex align-items-center w-100">
              <i className="bi bi-graph-up me-2"></i>
              <span>📊 Analytics & Reports</span>
            </div>
          </Accordion.Header>
          <Accordion.Body className="p-0">
            <Nav className="flex-column">
              <Nav.Link 
                as={Link} 
                to="/admin/analytics/dashboard" 
                className={`sidebar-sublink ${isActive('/admin/analytics/dashboard') ? 'active' : ''}`}
              >
                <i className="bi bi-speedometer me-2"></i>
                Analytics Dashboard
              </Nav.Link>
              <Nav.Link 
                as={Link} 
                to="/admin/analytics/custom-reports" 
                className={`sidebar-sublink ${isActive('/admin/analytics/custom-reports') ? 'active' : ''}`}
              >
                <i className="bi bi-file-earmark-text me-2"></i>
                Custom Reports
              </Nav.Link>
            </Nav>
          </Accordion.Body>
        </Accordion.Item>
      </Accordion>

      {}
      <Accordion defaultActiveKey={isActive('/admin/system') ? '5' : undefined}>
        <Accordion.Item eventKey="5" className="sidebar-accordion">
          <Accordion.Header className="sidebar-accordion-header">
            <div className="d-flex align-items-center w-100">
              <i className="bi bi-gear me-2"></i>
              <span>📢 System</span>
            </div>
          </Accordion.Header>
          <Accordion.Body className="p-0">
            <Nav className="flex-column">
              <Nav.Link 
                as={Link} 
                to="/admin/announcements" 
                className={`sidebar-sublink ${isActive('/admin/announcements') ? 'active' : ''}`}
              >
                <i className="bi bi-megaphone me-2"></i>
                Announcements
              </Nav.Link>
              <Nav.Link 
                as={Link} 
                to="/admin/feedback" 
                className={`sidebar-sublink ${isActive('/admin/feedback') ? 'active' : ''}`}
              >
                <i className="bi bi-star me-2"></i>
                Feedback Management
              </Nav.Link>
              <Nav.Link 
                as={Link} 
                to="/admin/cases/duplicate-detection" 
                className={`sidebar-sublink ${isActive('/admin/cases/duplicate-detection') ? 'active' : ''}`}
              >
                <i className="bi bi-search me-2"></i>
                Duplicate Detection
              </Nav.Link>
              <Nav.Link 
                as={Link} 
                to="/admin/settings" 
                className={`sidebar-sublink ${isActive('/admin/settings') ? 'active' : ''}`}
              >
                <i className="bi bi-gear me-2"></i>
                System Configuration
              </Nav.Link>
            </Nav>
          </Accordion.Body>
        </Accordion.Item>
      </Accordion>

      <hr className="my-2 mx-3" />

      {}
      <Nav.Item>
        <Nav.Link 
          as={Link} 
          to="/login" 
          onClick={(e) => {
            e.preventDefault();
            authService.logout();
            window.location.href = '/login';
          }}
          className="sidebar-link logout-link"
        >
          <i className="bi bi-box-arrow-right me-2"></i>
          🚪 Logout
        </Nav.Link>
      </Nav.Item>
    </>
  );


  const publicUserSidebar = () => {

    return (
      <>
        <Nav.Item>
          <Nav.Link 
            as={Link} 
            to="/public/dashboard" 
            className={`sidebar-link ${isActive('/public/dashboard') || isActive('/dashboard') ? 'active' : ''}`}
          >
            <span className="sidebar-icon">📊</span>
            <span className="sidebar-text">DASHBOARD</span>
          </Nav.Link>
        </Nav.Item>

        <Nav.Item>
          <Nav.Link 
            as={Link} 
            to="/cases/my-cases" 
            className={`sidebar-link ${isActive('/cases/my-cases') || isActive('/cases') ? 'active' : ''}`}
          >
            <span className="sidebar-icon">📄</span>
            <span className="sidebar-text">MY CASES</span>
          </Nav.Link>
        </Nav.Item>

        <Nav.Item>
          <Nav.Link 
            as={Link} 
            to="/help-requests/my-requests" 
            className={`sidebar-link ${isActive('/help-requests/my-requests') || isActive('/help-requests') ? 'active' : ''}`}
          >
            <span className="sidebar-icon">❤️</span>
            <span className="sidebar-text">MY HELP REQUESTS</span>
          </Nav.Link>
        </Nav.Item>

        <Nav.Item>
          <Nav.Link 
            as={Link} 
            to="/messages" 
            className={`sidebar-link ${isActive('/messages') ? 'active' : ''}`}
          >
            <span className="sidebar-icon">💬</span>
            <span className="sidebar-text">MESSAGES</span>
          </Nav.Link>
        </Nav.Item>

        <Nav.Item>
          <Nav.Link 
            as={Link} 
            to="/feedback" 
            className={`sidebar-link ${isActive('/feedback') ? 'active' : ''}`}
          >
            <span className="sidebar-icon">⭐</span>
            <span className="sidebar-text">FEEDBACK</span>
          </Nav.Link>
        </Nav.Item>

        <Nav.Item>
          <Nav.Link 
            as={Link} 
            to="/analytics" 
            className={`sidebar-link ${isActive('/analytics') ? 'active' : ''}`}
          >
            <span className="sidebar-icon">📈</span>
            <span className="sidebar-text">ANALYTICS</span>
          </Nav.Link>
        </Nav.Item>

        <Nav.Item>
          <Nav.Link 
            as={Link} 
            to="/profile" 
            className={`sidebar-link ${isActive('/profile') ? 'active' : ''}`}
          >
            <span className="sidebar-icon">👤</span>
            <span className="sidebar-text">PROFILE</span>
          </Nav.Link>
        </Nav.Item>

        <Nav.Item>
          <Nav.Link 
            as={Link} 
            to="/notifications" 
            className={`sidebar-link ${isActive('/notifications') ? 'active' : ''}`}
          >
            <span className="sidebar-icon">🔔</span>
            <span className="sidebar-text">Notifications</span>
          </Nav.Link>
        </Nav.Item>


        <Nav.Item>
          <Nav.Link 
            onClick={(e) => {
              e.preventDefault();
              authService.logout();
              window.location.href = '/login';
            }}
            className="sidebar-link logout-link"
          >
            <span className="sidebar-icon">🚪</span>
            <span className="sidebar-text">Logout</span>
          </Nav.Link>
        </Nav.Item>
      </>
    );
  };

  const getSidebarContent = () => {
    switch (userType) {
      case 'PUBLIC':
        return publicUserSidebar();
      case 'POLICE':
        return policeSidebar();
      case 'SOCIAL_WORKER':
        return socialWorkerSidebarContent();
      case 'ADMIN':
        return adminSidebarContent();
      default:
        return publicUserSidebar();
    }
  };

  const getDashboardTitle = () => {
    switch (userType) {
      case 'PUBLIC':
        return 'Public Dashboard';
      case 'POLICE':
        return 'Police Dashboard';
      case 'SOCIAL_WORKER':
        return 'Social Worker Dashboard';
      case 'ADMIN':
        return 'Admin Dashboard';
      default:
        return 'Dashboard';
    }
  };

  const getRoleSpecificInfo = () => {
    if (!user) return null;
    
    switch (userType) {
      case 'POLICE':
        return (
          <>
            <small className="text-muted">
              <strong>Badge:</strong> {user.badgeNumber || 'N/A'}
            </small>
            <br />
            <small className="text-muted">
              <strong>Dept:</strong> {user.department || 'N/A'}
            </small>
          </>
        );
      case 'SOCIAL_WORKER':
        return (
          <>
            <small className="text-muted">
              <strong>License:</strong> {user.licenseNumber || 'N/A'}
            </small>
          </>
        );
      case 'ADMIN':
        return (
          <small className="text-muted">
            <strong>System Administrator</strong>
          </small>
        );
      default:
        return (
          <small className="text-muted">
            <strong>Community Member</strong>
          </small>
        );
    }
  };

  return (
    <div className={`sidebar-navigation ${userType === 'PUBLIC' ? 'public-user-sidebar' : ''}`}>
      <div className="sidebar-header">
        <h6 className="sidebar-title">
          <i className="bi bi-menu-button-wide me-2"></i>
          {getDashboardTitle()}
        </h6>
        {user && (
          <div className="sidebar-user-info">
            <small className="text-muted">
              Logged in as <strong>{user.name?.split(' ')[0] || 'User'}</strong>
            </small>
            <br />
            {getRoleSpecificInfo()}
          </div>
        )}
      </div>
      
      <Nav className="flex-column sidebar-nav">
        {getSidebarContent()}
      </Nav>
    </div>
  );
};

export default SidebarNavigation;