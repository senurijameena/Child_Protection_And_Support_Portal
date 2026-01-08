import React, { useState } from 'react';
import { 
  Container, 
  Row, 
  Col, 
  Card, 
  Form, 
  Button, 
  Alert, 
  Spinner
} from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../../services/authService';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import './ForgotPasswordPage.css';

const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const validateEmail = (): boolean => {
    if (!email.trim()) {
      setError('Email is required');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Invalid email format');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    
    if (!validateEmail()) {
      return;
    }

    setLoading(true);

    try {
      const response = await authService.requestPasswordReset(email);
      
      if (response.success) {
        setSuccess(true);
      } else {
        setError(response.message || 'Failed to send password reset email');
      }
    } catch (error: any) {
      console.error('Password reset request error:', error);
      setError(error.response?.data?.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <div className="forgot-password-page">
        <Container className="py-5">
          <Row className="justify-content-center">
            <Col xs={12} sm={10} md={8} lg={6} xl={5}>
              <Card className="forgot-password-card border-0 shadow-lg">
                <Card.Body className="p-4 p-md-5">
                  <div className="text-center mb-4">
                    <div className="forgot-password-icon mb-3">
                      <i className="bi bi-key-fill text-primary fs-1"></i>
                    </div>
                    <h2 className="h3 fw-bold mb-2">Forgot Password?</h2>
                    <p className="text-muted">
                      Enter your email address and we'll send you a link to reset your password.
                    </p>
                  </div>

                  {error && (
                    <Alert variant="danger" className="mb-4">
                      <i className="bi bi-exclamation-triangle-fill me-2"></i>
                      {error}
                    </Alert>
                  )}

                  {success ? (
                    <div className="text-center">
                      <Alert variant="success" className="mb-4">
                        <i className="bi bi-check-circle-fill me-2"></i>
                        <strong>Password reset email sent!</strong>
                        <br />
                        <small>
                          Please check your email for instructions to reset your password.
                          If you don't see the email, check your spam folder.
                        </small>
                      </Alert>
                      <div className="d-flex flex-column gap-2">
                        <Button
                          variant="primary"
                          onClick={() => navigate('/login')}
                          className="w-100"
                        >
                          <i className="bi bi-arrow-left me-2"></i>
                          Back to Login
                        </Button>
                        <Button
                          variant="outline-secondary"
                          onClick={() => {
                            setSuccess(false);
                            setEmail('');
                          }}
                          className="w-100"
                        >
                          Send Another Email
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Form onSubmit={handleSubmit}>
                      <Form.Group className="mb-4">
                        <Form.Label className="fw-semibold">Email Address:</Form.Label>
                        <Form.Control
                          type="email"
                          value={email}
                          onChange={(e) => {
                            setEmail(e.target.value);
                            if (error) setError('');
                          }}
                          placeholder="Enter your registered email"
                          required
                          autoFocus
                        />
                        <Form.Text className="text-muted">
                          We'll send password reset instructions to this email
                        </Form.Text>
                      </Form.Group>

                      <Button
                        variant="primary"
                        type="submit"
                        size="lg"
                        className="w-100 py-2 fw-bold mb-3 reset-btn"
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
                            Sending...
                          </>
                        ) : (
                          <>
                            <i className="bi bi-envelope-paper me-2"></i>
                            Send Reset Link
                          </>
                        )}
                      </Button>

                      <div className="text-center">
                        <Link 
                          to="/login" 
                          className="text-decoration-none text-primary fw-medium"
                        >
                          <i className="bi bi-arrow-left me-1"></i>
                          Back to Login
                        </Link>
                      </div>
                    </Form>
                  )}
                </Card.Body>
              </Card>

              {}
              <Card className="mt-4 border-info help-card">
                <Card.Body className="py-3">
                  <div className="d-flex align-items-center">
                    <div className="help-icon me-3">
                      <i className="bi bi-info-circle-fill text-info fs-4"></i>
                    </div>
                    <div>
                      <p className="mb-1 fw-bold text-info">
                        Need Help?
                      </p>
                      <p className="mb-0 small text-muted">
                        If you're having trouble resetting your password, please contact support at{' '}
                        <a href="mailto:support@childportal.gov.in" className="text-decoration-none">
                          support@childportal.gov.in
                        </a>
                      </p>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
      <Footer />
    </>
  );
};

export default ForgotPasswordPage;

