import React, { useState } from 'react';
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
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import { useAuth } from '../../hooks/useAuth';
import './ChangePasswordPage.css';

const ChangePasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Redirect if not authenticated
  React.useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }

    if (!formData.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.newPassword)) {
      newErrors.newPassword = 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
    } else if (formData.currentPassword === formData.newPassword) {
      newErrors.newPassword = 'New password must be different from current password';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.newPassword !== formData.confirmPassword) {
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
    setSuccess(false);
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const response = await authService.changePassword(
        formData.currentPassword,
        formData.newPassword
      );
      
      if (response.success) {
        setSuccess(true);
        setFormData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });

        setTimeout(() => {
          navigate('/profile');
        }, 2000);
      } else {
        setError(response.message || 'Failed to change password');
      }
    } catch (error: any) {
      console.error('Password change error:', error);
      setError(error.response?.data?.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  if (success) {
    return (
      <Container className="change-password-page py-5">
        <Row className="justify-content-center">
          <Col md={6} lg={5}>
            <Card className="change-password-card shadow">
              <Card.Body className="text-center p-5">
                <div className="success-icon mb-4">
                  <i className="bi bi-check-circle-fill text-success" style={{ fontSize: '4rem' }}></i>
                </div>
                <h3 className="mb-3">Password Changed Successfully!</h3>
                <p className="text-muted mb-4">
                  Your password has been updated. You will be redirected to your profile page shortly.
                </p>
                <Spinner animation="border" size="sm" className="me-2" />
                <span className="text-muted">Redirecting...</span>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    );
  }

  return (
    <Container className="change-password-page py-5">
      <Row className="justify-content-center">
        <Col md={6} lg={5}>
          <Card className="change-password-card shadow">
            <Card.Header className="text-center py-3">
              <h3 className="mb-0">
                <i className="bi bi-lock-fill me-2"></i>
                Change Password
              </h3>
            </Card.Header>
            <Card.Body className="p-4">
              {error && (
                <Alert variant="danger" dismissible onClose={() => setError('')} className="mb-4">
                  <i className="bi bi-exclamation-triangle-fill me-2"></i>
                  {error}
                </Alert>
              )}

              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">Current Password:</Form.Label>
                  <InputGroup hasValidation>
                    <Form.Control
                      type={showCurrentPassword ? 'text' : 'password'}
                      name="currentPassword"
                      value={formData.currentPassword}
                      onChange={handleChange}
                      placeholder="Enter current password"
                      isInvalid={!!errors.currentPassword}
                      required
                      autoFocus
                    />
                    <InputGroup.Text
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      style={{ cursor: 'pointer' }}
                      title={showCurrentPassword ? 'Hide Password' : 'Show Password'}
                    >
                      <i className={`bi ${showCurrentPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                    </InputGroup.Text>
                    <Form.Control.Feedback type="invalid">
                      {errors.currentPassword}
                    </Form.Control.Feedback>
                  </InputGroup>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">New Password:</Form.Label>
                  <InputGroup hasValidation>
                    <Form.Control
                      type={showNewPassword ? 'text' : 'password'}
                      name="newPassword"
                      value={formData.newPassword}
                      onChange={handleChange}
                      placeholder="Enter new password"
                      isInvalid={!!errors.newPassword}
                      required
                    />
                    <InputGroup.Text
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      style={{ cursor: 'pointer' }}
                      title={showNewPassword ? 'Hide Password' : 'Show Password'}
                    >
                      <i className={`bi ${showNewPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                    </InputGroup.Text>
                    <Form.Control.Feedback type="invalid">
                      {errors.newPassword}
                    </Form.Control.Feedback>
                  </InputGroup>
                  <Form.Text className="text-muted small">
                    Password must be at least 8 characters with uppercase, lowercase, and number
                  </Form.Text>
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label className="fw-semibold">Confirm New Password:</Form.Label>
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

                <div className="d-grid gap-2">
                  <Button
                    variant="primary"
                    type="submit"
                    size="lg"
                    disabled={loading}
                    className="change-password-submit-btn"
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
                        Changing Password...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-key-fill me-2"></i>
                        Change Password
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline-secondary"
                    type="button"
                    onClick={() => navigate('/profile')}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ChangePasswordPage;

