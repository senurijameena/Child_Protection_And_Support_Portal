import React, { useState, useEffect } from 'react';
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Alert,
  Spinner,
  InputGroup
} from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import { authService, type LoginCredentials } from '../../services/authService';
import Header from '../../components/Header';
import './LoginPage.css';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState<LoginCredentials>({
    email: '',
    password: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string>('PUBLIC');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string>('');
  const [loginStats, setLoginStats] = useState<number>(1247);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    if (apiError) setApiError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Prevent duplicate submissions
    if (loading) {
      return;
    }

    // Clear any previous errors
    setApiError('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const response = await authService.login(formData);

      if (response.success) {
        if (rememberMe) {
          localStorage.setItem('rememberedEmail', formData.email);

          const expirationDate = new Date();
          expirationDate.setDate(expirationDate.getDate() + 30);
          localStorage.setItem('rememberMeExpiration', expirationDate.toISOString());
        } else {
          localStorage.removeItem('rememberedEmail');
          localStorage.removeItem('rememberMeExpiration');
        }

        const user = authService.getCurrentUser();
        if (user) {
          // Verify that the logged-in user matches the selected role
          if (user.role !== selectedRole && selectedRole !== 'PUBLIC') {
            // Allow PUBLIC selection to login as anyone (or maybe not? standard behavior is usually restrict)
            // Actually, if I select SOCIAL WORKER, I expect to be a SOCIAL WORKER.
            // If I select PUBLIC, I expect to be PUBLIC.

            // Let's be strict:
            if (user.role !== selectedRole) {
              console.warn(`Role mismatch: Selected ${selectedRole} but logged in as ${user.role}`);
              authService.logout();
              setApiError(`Access Denied: This account is registered as ${user.role.replace('_', ' ')}, not ${selectedRole.replace('_', ' ')}.`);
              return;
            }
          }

          const dashboardPath = authService.getDashboardPath();
          console.log('Navigating to dashboard:', dashboardPath);
          navigate(dashboardPath);
        } else {

          console.warn('User data not available after login, redirecting to default dashboard');
          navigate('/dashboard');
        }
      } else {
        const errorMessage = response.message || 'Login failed. Please check your credentials.';
        setApiError(errorMessage);
      }
    } catch (error: any) {
      console.error('Login error:', error);
      const errorMessage = error.response?.data?.message || 'Login failed. Please check your credentials.';
      setApiError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    const expiration = localStorage.getItem('rememberMeExpiration');

    if (rememberedEmail && expiration) {
      const expirationDate = new Date(expiration);
      if (expirationDate > new Date()) {
        setFormData(prev => ({ ...prev, email: rememberedEmail }));
        setRememberMe(true);
      } else {
        localStorage.removeItem('rememberedEmail');
        localStorage.removeItem('rememberMeExpiration');
      }
    }

    const interval = setInterval(() => {
      setLoginStats(prev => prev + Math.floor(Math.random() * 3));
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="login-page-wrapper">
      <Header />

      <div className="login-main-content">
        <Container fluid className="login-split-container">
          <Row className="g-0 h-100">
            { }
            <Col lg={6} className="login-image-section">
              <div className="login-image-wrapper">
                <img
                  src="/images/login.jpg"
                  alt="Child Protection Portal"
                  className="login-hero-image"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/images/default-login.jpg';
                  }}
                />
              </div>
              { }
              <div className="login-portal-info">
                <div className="login-portal-info-content">
                  <h2 className="login-portal-info-title">🛡️ Child Protection Portal</h2>
                  <p className="login-portal-info-subtitle">
                    Protecting Childhood, Building Futures
                  </p>
                  <div className="login-portal-info-stats">
                    <div className="portal-stat-item">
                      <span className="portal-stat-number">{loginStats.toLocaleString()}+</span>
                      <span className="portal-stat-label">Users Today</span>
                    </div>
                    <div className="portal-stat-item">
                      <span className="portal-stat-number">24/7</span>
                      <span className="portal-stat-label">Support</span>
                    </div>
                  </div>
                </div>
              </div>
            </Col>

            { }
            <Col lg={6} className="login-form-section">
              <div className="login-form-wrapper">
                <Card className="login-card">
                  <Card.Body className="login-card-body">
                    { }
                    <div className="login-welcome-section">
                      <h1 className="login-welcome-title">WELCOME BACK</h1>
                      <p className="login-welcome-subtitle">
                        Secure login to Child Protection and Support Portal
                      </p>
                    </div>

                    { }
                    {apiError && (
                      <Alert variant="danger" className="login-error-alert">
                        <i className="bi bi-exclamation-triangle-fill me-2"></i>
                        {apiError}
                      </Alert>
                    )}

                    { }
                    <Form onSubmit={handleSubmit} className="login-form">
                      { }
                      <Form.Group className="login-form-group">
                        <Form.Label className="login-form-label">
                          Login As <span className="required-asterisk">*</span>
                        </Form.Label>
                        <Form.Select
                          value={selectedRole}
                          onChange={(e) => setSelectedRole(e.target.value)}
                          className="login-form-input"
                        >
                          <option value="PUBLIC">👤 Public User</option>
                          <option value="POLICE">👮 Police Officer</option>
                          <option value="SOCIAL_WORKER">👩⚕️ Social Worker</option>
                          <option value="ADMIN">👨‍💼 Administrator</option>
                        </Form.Select>
                        <Form.Text className="text-muted">
                          Select your user type to login
                        </Form.Text>
                      </Form.Group>

                      { }
                      <Form.Group className="login-form-group">
                        <Form.Label className="login-form-label">
                          Email Address <span className="required-asterisk">*</span>
                        </Form.Label>
                        <Form.Control
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="Enter your email address"
                          isInvalid={!!errors.email}
                          required
                          className="login-form-input"
                        />
                        <Form.Control.Feedback type="invalid">
                          {errors.email}
                        </Form.Control.Feedback>
                      </Form.Group>

                      { }
                      <Form.Group className="login-form-group">
                        <Form.Label className="login-form-label">
                          Password <span className="required-asterisk">*</span>
                        </Form.Label>
                        <InputGroup hasValidation>
                          <Form.Control
                            type={showPassword ? 'text' : 'password'}
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Enter your password"
                            isInvalid={!!errors.password}
                            required
                            className="login-form-input"
                          />
                          <InputGroup.Text
                            onClick={() => setShowPassword(!showPassword)}
                            className="password-toggle-btn"
                            title={showPassword ? 'Hide Password' : 'Show Password'}
                          >
                            {showPassword ? '🙈' : '👁️'}
                          </InputGroup.Text>
                          <Form.Control.Feedback type="invalid">
                            {errors.password}
                          </Form.Control.Feedback>
                        </InputGroup>
                      </Form.Group>

                      { }
                      <Form.Group className="login-form-group">
                        <Form.Check
                          type="checkbox"
                          id="rememberMe"
                          label="Remember me for 30 days"
                          checked={rememberMe}
                          onChange={(e) => setRememberMe(e.target.checked)}
                          className="remember-me-checkbox"
                        />
                      </Form.Group>

                      { }
                      <div className="login-button-section">
                        <Button
                          variant="primary"
                          type="submit"
                          size="lg"
                          className="login-submit-btn"
                          disabled={loading}
                        >
                          {loading ? (
                            <>
                              <Spinner
                                as="span"
                                animation="border"
                                size="sm"
                                role="status"
                                aria-hidden="true"
                                className="me-2"
                              />
                              Logging in...
                            </>
                          ) : (
                            'LOGIN'
                          )}
                        </Button>
                      </div>
                    </Form>

                    { }
                    <div className="login-additional-links">
                      <div className="login-link-item">
                        <span className="login-link-icon">🔐</span>
                        <span className="login-link-text">Forgot Password?</span>
                        <Link to="/forgot-password" className="login-link-action">
                          Reset here
                        </Link>
                      </div>
                      <div className="login-link-item">
                        <span className="login-link-icon">🆕</span>
                        <span className="login-link-text">New User?</span>
                        <Link to="/register" className="login-link-action">
                          Register here
                        </Link>
                      </div>
                    </div>

                    { }
                    <Card className="security-features-card">
                      <Card.Body>
                        <div className="security-features-title">
                          🔒 This is a secure government portal
                        </div>
                        <div className="security-features-list">
                          <div className="security-feature-item">
                            <span className="security-check">✅</span>
                            <span>End-to-end encryption</span>
                          </div>
                          <div className="security-feature-item">
                            <span className="security-check">✅</span>
                            <span>Two-factor authentication available</span>
                          </div>
                          <div className="security-feature-item">
                            <span className="security-check">✅</span>
                            <span>Activity logging enabled</span>
                          </div>
                        </div>
                      </Card.Body>
                    </Card>
                  </Card.Body>
                </Card>
              </div>
            </Col>
          </Row>
        </Container>
      </div>

      { }
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
                    © {new Date().getFullYear()} Child Protection and Support Portal. All rights reserved.
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
    </div>
  );
};

export default LoginPage;

