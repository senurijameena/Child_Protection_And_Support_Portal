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
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { authService } from '../../services/authService';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import './ResetPasswordPage.css';

const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setError('Invalid or missing reset token. Please request a new password reset.');
    }
  }, [token]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
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
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!token) {
      setError('Invalid reset token');
      return;
    }

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const response = await authService.resetPassword(token, formData.password);
      
      if (response.success) {
        setSuccess(true);

        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        setError(response.message || 'Failed to reset password');
      }
    } catch (error: any) {
      console.error('Password reset error:', error);
      setError(error.response?.data?.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <>
        <Header />
        <div className="reset-password-page">
          <Container className="py-5">
            <Row className="justify-content-center">
              <Col xs={12} sm={10} md={8} lg={6} xl={5}>
                <Card className="reset-password-card border-0 shadow-lg">
                  <Card.Body className="p-4 p-md-5 text-center">
                    <div className="success-icon mb-4">
                      <i className="bi bi-check-circle-fill text-success" style={{ fontSize: '4rem' }}></i>
                    </div>
                    <h2 className="h3 fw-bold mb-3">Password Reset Successful!</h2>
                    <p className="text-muted mb-4">
                      Your password has been successfully reset. You will be redirected to the login page shortly.
                    </p>
                    <Button
                      variant="primary"
                      onClick={() => navigate('/login')}
                      className="w-100"
                    >
                      <i className="bi bi-box-arrow-in-right me-2"></i>
                      Go to Login
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Container>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="reset-password-page">
        <Container className="py-5">
          <Row className="justify-content-center">
            <Col xs={12} sm={10} md={8} lg={6} xl={5}>
              <Card className="reset-password-card border-0 shadow-lg">
                <Card.Body className="p-4 p-md-5">
                  <div className="text-center mb-4">
                    <div className="reset-password-icon mb-3">
                      <i className="bi bi-shield-lock-fill text-primary fs-1"></i>
                    </div>
                    <h2 className="h3 fw-bold mb-2">Reset Your Password</h2>
                    <p className="text-muted">
                      Enter your new password below
                    </p>
                  </div>

                  {error && (
                    <Alert variant="danger" className="mb-4">
                      <i className="bi bi-exclamation-triangle-fill me-2"></i>
                      {error}
                    </Alert>
                  )}

                  <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-semibold">New Password:</Form.Label>
                      <InputGroup hasValidation>
                        <Form.Control
                          type={showPassword ? 'text' : 'password'}
                          name="password"
                          value={formData.password}
                          onChange={handleChange}
                          placeholder="Enter new password"
                          isInvalid={!!errors.password}
                          required
                          autoFocus
                        />
                        <InputGroup.Text
                          onClick={() => setShowPassword(!showPassword)}
                          style={{ cursor: 'pointer' }}
                          title={showPassword ? 'Hide Password' : 'Show Password'}
                        >
                          <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                        </InputGroup.Text>
                        <Form.Control.Feedback type="invalid">
                          {errors.password}
                        </Form.Control.Feedback>
                      </InputGroup>
                      <Form.Text className="text-muted small">
                        Password must be at least 8 characters with uppercase, lowercase, and number
                      </Form.Text>
                    </Form.Group>

                    <Form.Group className="mb-4">
                      <Form.Label className="fw-semibold">Confirm Password:</Form.Label>
                      <InputGroup hasValidation>
                        <Form.Control
                          type={showConfirmPassword ? 'text' : 'password'}
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          placeholder="Confirm new password"
                          isInvalid={!!errors.confirmPassword}
                          required
                        />
                        <InputGroup.Text
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          style={{ cursor: 'pointer' }}
                          title={showConfirmPassword ? 'Hide Password' : 'Show Password'}
                        >
                          <i className={`bi ${showConfirmPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                        </InputGroup.Text>
                        <Form.Control.Feedback type="invalid">
                          {errors.confirmPassword}
                        </Form.Control.Feedback>
                      </InputGroup>
                    </Form.Group>

                    <Button
                      variant="primary"
                      type="submit"
                      size="lg"
                      className="w-100 py-2 fw-bold mb-3 reset-btn"
                      disabled={loading || !token}
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
                          Resetting...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-key-fill me-2"></i>
                          Reset Password
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

export default ResetPasswordPage;

