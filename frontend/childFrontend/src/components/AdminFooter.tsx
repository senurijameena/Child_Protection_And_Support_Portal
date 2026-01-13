import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import './AdminFooter.css';

const AdminFooter: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const adminQuickLinks = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: 'bi bi-speedometer2' },
    { name: 'User Management', path: '/admin/users', icon: 'bi bi-people' },
    { name: 'Case Management', path: '/admin/cases/all', icon: 'bi bi-folder' },
    { name: 'Analytics', path: '/admin/analytics', icon: 'bi bi-graph-up' },
    { name: 'System Settings', path: '/admin/settings', icon: 'bi bi-gear' },
    { name: 'Support', path: '/admin/support', icon: 'bi bi-question-circle' }
  ];

  const systemInfo = [
    { label: 'System Version', value: 'v2.1.0' },
    { label: 'Last Updated', value: new Date().toLocaleDateString() },
    { label: 'Server Status', value: '🟢 Online' }
  ];

  const adminResources = [
    { name: 'Admin Documentation', path: '/admin/docs', icon: 'bi bi-file-text' },
    { name: 'API Reference', path: '/admin/api-docs', icon: 'bi bi-code-slash' },
    { name: 'Audit Logs', path: '/admin/audit-logs', icon: 'bi bi-journal-text' },
    { name: 'Backup & Restore', path: '/admin/backup', icon: 'bi bi-database' }
  ];

  return (
    <footer className="admin-footer">
      <Container fluid>
        <Row className="g-4 py-4">
          { }
          <Col lg={4} md={6}>
            <div className="mb-3">
              <h6 className="admin-footer-title mb-3">
                <i className="bi bi-link-45deg me-2"></i>
                Admin Quick Links
              </h6>
              <ul className="list-unstyled admin-footer-links">
                {adminQuickLinks.map((link, index) => (
                  <li key={index} className="mb-2">
                    <Link
                      to={link.path}
                      className="admin-footer-link d-flex align-items-center"
                    >
                      <i className={`${link.icon} me-2`}></i>
                      <span>{link.name}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </Col>

          <Col lg={4} md={6}>
            <div className="mb-3">
              <h6 className="admin-footer-title mb-3">
                <i className="bi bi-info-circle me-2"></i>
                System Information
              </h6>
              <ul className="list-unstyled admin-footer-info">
                {systemInfo.map((info, index) => (
                  <li key={index} className="mb-2 d-flex justify-content-between">
                    <span className="admin-footer-label">{info.label}:</span>
                    <span className="admin-footer-value">{info.value}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-4 pt-3 admin-footer-divider">
              <h6 className="admin-footer-title mb-3">
                <i className="bi bi-box-seam me-2"></i>
                Resources
              </h6>
              <ul className="list-unstyled admin-footer-links">
                {adminResources.map((resource, index) => (
                  <li key={index} className="mb-2">
                    <Link
                      to={resource.path}
                      className="admin-footer-link d-flex align-items-center"
                    >
                      <i className={`${resource.icon} me-2`}></i>
                      <span>{resource.name}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </Col>

          <Col lg={4} md={12}>
            <div className="mb-3">
              <h6 className="admin-footer-title mb-3">
                <i className="bi bi-headset me-2"></i>
                Admin Support
              </h6>
              <div className="admin-footer-support">
                <p className="mb-2">
                  <i className="bi bi-envelope me-2"></i>
                  <strong>Email:</strong>{' '}
                  <a href="mailto:admin@childportal.gov.in" className="admin-footer-link">
                    admin@childportal.gov.in
                  </a>
                </p>
                <p className="mb-2">
                  <i className="bi bi-telephone me-2"></i>
                  <strong>Hotline:</strong>{' '}
                  <a href="tel:+911234567890" className="admin-footer-link">
                    +91 123 456 7890
                  </a>
                </p>
                <p className="mb-0">
                  <i className="bi bi-clock me-2"></i>
                  <strong>Support Hours:</strong> 24/7
                </p>
              </div>
            </div>

            { }
            <div className="mt-4 pt-3 admin-footer-divider">
              <h6 className="admin-footer-title mb-2">
                <i className="bi bi-shield-check me-2"></i>
                Security Notice
              </h6>
              <p className="admin-footer-security small mb-0">
                This is a secure administrative area. All activities are logged and monitored.
                Unauthorized access is prohibited.
              </p>
            </div>
          </Col>
        </Row>

        { }
        <Row>
          <Col>
            <div className="admin-footer-bottom">
              <div className="d-flex flex-wrap justify-content-between align-items-center">
                <div>
                  <p className="mb-0 small">
                    &copy; {currentYear} <strong>CHILD PROTECTION AND SUPPORT PORTAL</strong> - Admin Dashboard
                  </p>
                  <p className="mb-0 small text-muted">
                    System Administrator Access | All rights reserved
                  </p>
                </div>
                <div className="admin-footer-legal">
                  <Link to="/admin/terms" className="admin-footer-link small me-3">
                    Terms of Service
                  </Link>
                  <Link to="/admin/privacy" className="admin-footer-link small me-3">
                    Privacy Policy
                  </Link>
                  <Link to="/admin/security" className="admin-footer-link small">
                    Security Policy
                  </Link>
                </div>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default AdminFooter;

