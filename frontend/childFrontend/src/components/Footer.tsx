import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="login-page-footer">
      <Container fluid="xxl">
        <div className="login-footer-content">
          <Row className="g-4">
            { }
            <Col md={4} sm={12}>
              <div className="footer-section">
                <h5 className="footer-section-title">
                  <i className="bi bi-telephone-fill me-2"></i>
                  24/7 Emergency Support
                </h5>
                <div className="footer-emergency-contacts">
                  <div className="emergency-contact-item">
                    <span className="emergency-icon">📞</span>
                    <div className="emergency-details">
                      <strong>Childline</strong>
                      <a href="tel:1098" className="emergency-number">1098</a>
                    </div>
                  </div>
                  <div className="emergency-contact-item">
                    <span className="emergency-icon">🚨</span>
                    <div className="emergency-details">
                      <strong>Emergency</strong>
                      <a href="tel:112" className="emergency-number">112</a>
                    </div>
                  </div>
                </div>
              </div>
            </Col>

            { }
            <Col md={4} sm={12}>
              <div className="footer-section">
                <h5 className="footer-section-title">
                  <i className="bi bi-link-45deg me-2"></i>
                  Quick Links
                </h5>
                <ul className="footer-links-list">
                  <li>
                    <Link to="/about">
                      <i className="bi bi-info-circle me-2"></i>
                      About Us
                    </Link>
                  </li>
                  <li>
                    <Link to="/contact">
                      <i className="bi bi-envelope me-2"></i>
                      Contact Us
                    </Link>
                  </li>
                  <li>
                    <Link to="/register">
                      <i className="bi bi-person-plus me-2"></i>
                      Register
                    </Link>
                  </li>
                  <li>
                    <Link to="/">
                      <i className="bi bi-house-door me-2"></i>
                      Home
                    </Link>
                  </li>
                </ul>
              </div>
            </Col>

            { }
            <Col md={4} sm={12}>
              <div className="footer-section">
                <h5 className="footer-section-title">
                  <i className="bi bi-share-fill me-2"></i>
                  Connect With Us
                </h5>
                <div className="footer-social-links">
                  <a href="#" className="social-link" title="Facebook">
                    <i className="bi bi-facebook"></i>
                  </a>
                  <a href="#" className="social-link" title="Twitter">
                    <i className="bi bi-twitter-x"></i>
                  </a>
                  <a href="#" className="social-link" title="LinkedIn">
                    <i className="bi bi-linkedin"></i>
                  </a>
                  <a href="#" className="social-link" title="YouTube">
                    <i className="bi bi-youtube"></i>
                  </a>
                </div>
                <div className="footer-security-badge">
                  <i className="bi bi-shield-check me-2"></i>
                  <span>Secure Government Portal</span>
                </div>
              </div>
            </Col>
          </Row>

          { }
          <div className="footer-bottom">
            <Row className="align-items-center">
              <Col md={6} sm={12} className="text-center text-md-start mb-2 mb-md-0">
                <p className="footer-copyright">
                  © {currentYear} CHILD PROTECTION AND SUPPORT PORTAL. All rights reserved.
                </p>
              </Col>
              <Col md={6} sm={12} className="text-center text-md-end">
                <div className="footer-legal-links">
                  <Link to="/about">Privacy Policy</Link>
                  <span className="separator">|</span>
                  <Link to="/about">Terms of Service</Link>
                  <span className="separator">|</span>
                  <Link to="/about">Security</Link>
                </div>
              </Col>
            </Row>
          </div>
        </div>
      </Container>
    </footer>
  );
};

export default Footer;
