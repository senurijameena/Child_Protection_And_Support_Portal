import React, { useState, useEffect } from 'react';
import { Nav, Accordion, Badge, Spinner, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import { authService } from '../services/authService';
import { notificationService } from '../services/notificationService';
import './SidebarNavigation.css';

interface SidebarNavigationProps {
  userType: 'PUBLIC' | 'POLICE' | 'SOCIAL_WORKER' | 'ADMIN';
}

const SidebarNavigation: React.FC<SidebarNavigationProps> = ({ userType }) => {
  const location = useLocation();
  const user = authService.getCurrentUser();
  const [collapsed, setCollapsed] = useState(false);
  const [stats, setStats] = useState({
    emergencyCases: 5,
    vettingQueue: 12,
    pendingTransfers: 3,
    unreadNotifications: 8,
    overdueFollowups: 3
  });

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const renderTooltip = (text: string) => (
    <Tooltip id={`tooltip-${text.replace(/\s+/g, '-').toLowerCase()}`}>
      {text}
    </Tooltip>
  );

  const adminSidebar = () => (
    <div className={`admin-sidebar-container ${collapsed ? 'collapsed' : ''}`}>
      {/* 🟦 1. Sidebar Header */}
      <div className="sidebar-header-admin">
        <div className="logo-section">
          <i className="bi bi-shield-lock-fill logo-icon"></i>
          {!collapsed && <span className="logo-text">Admin Console</span>}
        </div>
        <button className="collapse-toggle" onClick={() => setCollapsed(!collapsed)}>
          <i className={`bi ${collapsed ? 'bi-text-indent-left' : 'bi-text-indent-right'}`}></i>
        </button>
      </div>

      <div className="sidebar-scroll-container">
        {/* 📊 2. DASHBOARD GROUP */}
        <div className="sidebar-group-label">System Terminal</div>
        <Nav.Item>
          <Nav.Link as={Link} to="/admin/dashboard" className={`sidebar-link ${isActive('/admin/dashboard') ? 'active' : ''}`}>
            <i className="bi bi-house-door-fill"></i>
            <span>Overview</span>
            {!collapsed && stats.emergencyCases > 0 && <span className="status-indicator-dot bg-danger ms-auto"></span>}
          </Nav.Link>
        </Nav.Item>

        {/* 👥 3. USER MANAGEMENT */}
        {!collapsed && <div className="sidebar-group-label">Access Control</div>}
        <Accordion defaultActiveKey={location.pathname.includes('/admin/users') ? 'users' : undefined}>
          <Accordion.Item eventKey="users" className="sidebar-accordion border-0">
            <Accordion.Header>
              <i className="bi bi-people-fill"></i>
              <span>User Management</span>
            </Accordion.Header>
            <Accordion.Body className="p-0">
              <Nav className="flex-column">
                <Nav.Link as={Link} to="/admin/users/all" className={`sidebar-sublink ${isActive('/admin/users/all') ? 'active' : ''}`}>
                  <div className="sublink-dot"></div> All Personnel
                </Nav.Link>
                <Nav.Link as={Link} to="/admin/users/police" className={`sidebar-sublink ${isActive('/admin/users/police') ? 'active' : ''}`}>
                  <div className="sublink-dot"></div> Police Force
                </Nav.Link>
                <Nav.Link as={Link} to="/admin/users/social-workers" className={`sidebar-sublink ${isActive('/admin/users/social-workers') ? 'active' : ''}`}>
                  <div className="sublink-dot"></div> Welfare Force
                </Nav.Link>
                <Nav.Link as={Link} to="/admin/users/pending" className={`sidebar-sublink ${isActive('/admin/users/pending') ? 'active' : ''}`}>
                  <div className="sublink-dot"></div> Vetting Queue
                  <Badge bg="warning" text="dark" className="ms-auto rounded-pill px-2">{stats.vettingQueue}</Badge>
                </Nav.Link>
              </Nav>
            </Accordion.Body>
          </Accordion.Item>
        </Accordion>

        {/* 📁 4. CASE MANAGEMENT */}
        <Accordion defaultActiveKey={location.pathname.includes('/admin/cases') ? 'cases' : undefined}>
          <Accordion.Item eventKey="cases" className="sidebar-accordion border-0">
            <Accordion.Header>
              <i className="bi bi-folder-fill"></i>
              <span>Case Center</span>
            </Accordion.Header>
            <Accordion.Body className="p-0">
              <Nav className="flex-column">
                <Nav.Link as={Link} to="/admin/cases/all" className={`sidebar-sublink ${isActive('/admin/cases/all') ? 'active' : ''}`}>
                  <div className="sublink-dot"></div> All Records
                </Nav.Link>
                <Nav.Link as={Link} to="/admin/cases/emergency" className={`sidebar-sublink ${isActive('/admin/cases/emergency') ? 'active' : ''}`}>
                  <div className="sublink-dot"></div> Emergency Alerts
                  <Badge bg="danger" className="ms-auto rounded-pill px-2">{stats.emergencyCases}</Badge>
                </Nav.Link>
                <Nav.Link as={Link} to="/admin/cases/anonymous" className={`sidebar-sublink ${isActive('/admin/cases/anonymous') ? 'active' : ''}`}>
                  <div className="sublink-dot"></div> Anonymous Intel
                </Nav.Link>
                <Nav.Link as={Link} to="/admin/transfers" className={`sidebar-sublink ${isActive('/admin/transfers') ? 'active' : ''}`}>
                  <div className="sublink-dot"></div> Case Transfers
                </Nav.Link>
              </Nav>
            </Accordion.Body>
          </Accordion.Item>
        </Accordion>

        {/* 🆘 5. HELP REQUESTS */}
        <Accordion defaultActiveKey={isActive('/admin/help-requests') ? 'help' : undefined}>
          <Accordion.Item eventKey="help" className="sidebar-accordion border-0">
            <Accordion.Header>
              <i className="bi bi-heart-pulse-fill"></i>
              <span>Assistance</span>
            </Accordion.Header>
            <Accordion.Body className="p-0">
              <Nav className="flex-column">
                <Nav.Link as={Link} to="/admin/help-requests/all" className={`sidebar-sublink ${isActive('/admin/help-requests/all') ? 'active' : ''}`}>
                  <div className="sublink-dot"></div> Total Log
                </Nav.Link>
                <Nav.Link as={Link} to="/admin/help-requests/pending-review" className={`sidebar-sublink ${isActive('/admin/help-requests/pending-review') ? 'active' : ''}`}>
                  <div className="sublink-dot"></div> Pending Review
                </Nav.Link>
                <Nav.Link as={Link} to="/admin/help-requests/in-progress" className={`sidebar-sublink ${isActive('/admin/help-requests/in-progress') ? 'active' : ''}`}>
                  <div className="sublink-dot"></div> Mission Active
                </Nav.Link>
              </Nav>
            </Accordion.Body>
          </Accordion.Item>
        </Accordion>

        {/* 🏢 6. POLICE STATIONS */}
        <Accordion defaultActiveKey={isActive('/admin/stations') ? 'stations' : undefined}>
          <Accordion.Item eventKey="stations" className="sidebar-accordion border-0">
            <Accordion.Header>
              <i className="bi bi-buildings-fill"></i>
              <span>Jurisdictions</span>
            </Accordion.Header>
            <Accordion.Body className="p-0">
              <Nav className="flex-column">
                <Nav.Link as={Link} to="/admin/stations/list" className={`sidebar-sublink ${isActive('/admin/stations/list') ? 'active' : ''}`}>
                  <div className="sublink-dot"></div> Unit Directory
                </Nav.Link>
                <Nav.Link as={Link} to="/admin/stations/coverage" className={`sidebar-sublink ${isActive('/admin/stations/coverage') ? 'active' : ''}`}>
                  <div className="sublink-dot"></div> Service Coverage
                </Nav.Link>
              </Nav>
            </Accordion.Body>
          </Accordion.Item>
        </Accordion>

        {/* 📢 7. ANNOUNCEMENTS */}
        {!collapsed && <div className="sidebar-group-label">Administrative</div>}
        <Nav.Item>
          <Nav.Link as={Link} to="/admin/announcements" className={`sidebar-link ${isActive('/admin/announcements') ? 'active' : ''}`}>
            <i className="bi bi-megaphone-fill"></i>
            <span>Broadcasts</span>
          </Nav.Link>
        </Nav.Item>

        {/* 💬 8. FEEDBACK */}
        <Nav.Item>
          <Nav.Link as={Link} to="/admin/feedback" className={`sidebar-link ${isActive('/admin/feedback') ? 'active' : ''}`}>
            <i className="bi bi-chat-left-dots-fill"></i>
            <span>Citizen Feedback</span>
          </Nav.Link>
        </Nav.Item>

        {/* 🔁 9. TRANSFERS */}
        <Nav.Item>
          <Nav.Link as={Link} to="/admin/transfers/pending" className={`sidebar-link ${isActive('/admin/transfers') ? 'active' : ''}`}>
            <i className="bi bi-arrow-down-up"></i>
            <span>Inter-Unit Transfers</span>
            {!collapsed && stats.pendingTransfers > 0 && <Badge bg="primary" className="ms-auto rounded-pill px-2">{stats.pendingTransfers}</Badge>}
          </Nav.Link>
        </Nav.Item>

        {/* 📅 10. FOLLOW-UPS */}
        <Nav.Item>
          <Nav.Link as={Link} to="/admin/follow-ups" className={`sidebar-link ${isActive('/admin/follow-ups') ? 'active' : ''}`}>
            <i className="bi bi-calendar-check-fill"></i>
            <span>Tactical Log</span>
            {!collapsed && stats.overdueFollowups > 0 && <Badge bg="danger" className="ms-auto rounded-pill px-2">{stats.overdueFollowups}</Badge>}
          </Nav.Link>
        </Nav.Item>

        {/* 📉 11. ANALYTICS */}
        {!collapsed && <div className="sidebar-group-label">Intelligence</div>}
        <Nav.Item>
          <Nav.Link as={Link} to="/admin/analytics/dashboard" className={`sidebar-link ${isActive('/admin/analytics') ? 'active' : ''}`}>
            <i className="bi bi-graph-up-arrow"></i>
            <span>Strategic Intel</span>
          </Nav.Link>
        </Nav.Item>

        {/* ⚙️ 12. SYSTEM */}
        <Accordion defaultActiveKey={isActive('/admin/system') ? 'system' : undefined}>
          <Accordion.Item eventKey="system" className="sidebar-accordion border-0">
            <Accordion.Header>
              <i className="bi bi-cpu-fill"></i>
              <span>Architecture</span>
            </Accordion.Header>
            <Accordion.Body className="p-0">
              <Nav className="flex-column">
                <Nav.Link as={Link} to="/admin/health" className={`sidebar-sublink ${isActive('/admin/health') ? 'active' : ''}`}>
                  <div className="sublink-dot text-success"></div> System Vitality
                </Nav.Link>
                <Nav.Link as={Link} to="/admin/audit-logs" className={`sidebar-sublink ${isActive('/admin/audit-logs') ? 'active' : ''}`}>
                  <div className="sublink-dot"></div> Audit Archive
                </Nav.Link>
              </Nav>
            </Accordion.Body>
          </Accordion.Item>
        </Accordion>
      </div>

      {/* 🟩 13. SIDEBAR FOOTER */}
      <div className="sidebar-footer-admin">
        <div className="status-panel">
          <div className="admin-brief">
            <div className="avatar-small">{user?.name?.charAt(0) || 'A'}</div>
            {!collapsed && (
              <div className="admin-brief-text">
                <span className="admin-brief-name">{user?.name || 'Administrator'}</span>
                <span className="admin-brief-role">High Command</span>
              </div>
            )}
          </div>
          <div className="system-status-indicator">
            <i className="bi bi-record-fill fs-6"></i>
            <span>System Operational</span>
          </div>
        </div>

        <div className="footer-actions">
          <OverlayTrigger placement="right" overlay={renderTooltip('Notifications')}>
            <button className="footer-action-btn" onClick={() => navigate('/admin/notifications')}>
              <i className="bi bi-bell-fill"></i>
            </button>
          </OverlayTrigger>
          <OverlayTrigger placement="right" overlay={renderTooltip('Quick Protocol')}>
            <button className="footer-action-btn">
              <i className="bi bi-lightning-charge-fill"></i>
            </button>
          </OverlayTrigger>
          <OverlayTrigger placement="right" overlay={renderTooltip('Terminate Session')}>
            <button className="footer-action-btn logout" onClick={() => { if (window.confirm('Terminate protocol session?')) authService.logout(); window.location.href = '/login'; }}>
              <i className="bi bi-power"></i>
            </button>
          </OverlayTrigger>
        </div>
      </div>
    </div>
  );

  const navigate = (path: string) => {
    window.location.href = path;
  };

  const getSidebarContent = () => {
    switch (userType) {
      case 'ADMIN':
        return adminSidebar();
      default:
        return null; // For simplicity, only rendering ADMIN based on prompt
    }
  };

  return (
    <div className={`sidebar-navigation ${collapsed ? 'collapsed' : ''}`}>
      {getSidebarContent()}
    </div>
  );
};

export default SidebarNavigation;