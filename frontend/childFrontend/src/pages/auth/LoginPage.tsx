import React, { useState, useEffect } from 'react';
import { Form, Alert, Spinner } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import { authService, type LoginCredentials } from '../../services/authService';
import Header from '../../components/LandingHeader';
import './LoginPage.css';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();

  // Form State
  const [formData, setFormData] = useState<LoginCredentials>({
    email: '',
    password: ''
  });

  // UI States
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string>('');

  // Handle Input Changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    if (apiError) setApiError('');
  };

  // Form Validation
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle Login Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setApiError('');

    if (!validateForm()) return;

    setLoading(true);
    try {
      const response = await authService.login(formData);

      if (response.success) {
        // Determine storage based on "Remember Me"
        const token = response.token;
        if (token) {
          if (rememberMe) {
            localStorage.setItem('authToken', token);
          } else {
            sessionStorage.setItem('authToken', token);
            // Also clear from localStorage if user unchecked it
            localStorage.removeItem('authToken');
          }
        }

        const user = authService.getCurrentUser();
        if (user) {
          // Redirect based on role requirements in the prompt
          switch (user.role) {
            case 'ADMIN':
              navigate('/dashboard/admin');
              break;
            case 'POLICE':
              navigate('/dashboard/officer');
              break;
            case 'SOCIAL_WORKER':
              navigate('/dashboard/social-worker');
              break;
            case 'PUBLIC':
              navigate('/dashboard/user');
              break;
            default:
              navigate('/dashboard');
          }
        } else {
          navigate('/dashboard');
        }
      } else {
        setApiError(response.message || 'Invalid credentials. Please try again.');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      if (!navigator.onLine) {
        setApiError('No internet connection. Please check your network.');
      } else if (error.response?.status === 403) {
        setApiError('Account not yet approved by administrator.');
      } else {
        setApiError('Server unavailable. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Hydrate email if remembered
  useEffect(() => {
    const rememberedEmail = localStorage.getItem('lastEmail');
    if (rememberedEmail) {
      setFormData(prev => ({ ...prev, email: rememberedEmail }));
      setRememberMe(true);
    }
  }, []);

  // Save/Clear email on change if needed
  useEffect(() => {
    if (rememberMe && formData.email) {
      localStorage.setItem('lastEmail', formData.email);
    } else if (!rememberMe) {
      localStorage.removeItem('lastEmail');
    }
  }, [rememberMe, formData.email]);

  return (
    <div className="login-page-wrapper">
      <Header />
      <div className="login-split-container">
        {/* Left Section: Visual & Trust (60% Desktop) */}
        <div className="login-visual-section">
          <div className="login-visual-content">
            <h1>Welcome Back</h1>
            <p>
              Secure access for citizens, police officers,
              social workers, and administrators.
              We work together to protect our future.
            </p>

            <div className="trust-badges">
              <div className="badge-item">
                <div className="badge-icon">🔒</div>
                <div className="badge-text">Secure Login</div>
              </div>
              <div className="badge-item">
                <div className="badge-icon">🛡️</div>
                <div className="badge-text">Role-based Access</div>
              </div>
              <div className="badge-item">
                <div className="badge-icon">👁️</div>
                <div className="badge-text">Privacy Protected</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Section: Form (40% Desktop) */}
        <div className="login-form-section">
          <div className="login-card">
            <h2>Login to Portal</h2>
            <p className="subtitle">Enter your credentials below</p>

            <Form onSubmit={handleSubmit}>
              {/* Email Field */}
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <div className="input-container">
                  <i className="bi bi-envelope input-icon"></i>
                  <input
                    type="email"
                    name="email"
                    className={`form-input ${errors.email ? 'border-danger' : ''}`}
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
                {errors.email && <div className="text-danger small mt-1 font-bold">{errors.email}</div>}
              </div>

              {/* Password Field */}
              <div className="form-group">
                <label className="form-label">Password</label>
                <div className="input-container">
                  <i className="bi bi-lock input-icon"></i>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    className={`form-input ${errors.password ? 'border-danger' : ''}`}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                    onCopy={(e) => e.preventDefault()}
                    onPaste={(e) => e.preventDefault()}
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    title={showPassword ? 'Hide Password' : 'Show Password'}
                  >
                    <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                  </button>
                </div>
                {errors.password && <div className="text-danger small mt-1 font-bold">{errors.password}</div>}
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="form-options">
                <label className="remember-me">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  Keep me logged in
                </label>
                <Link to="/forgot-password" title="Restore password access" className="forgot-password">
                  Forgot Password?
                </Link>
              </div>

              {/* API Status Alerts */}
              {apiError && (
                <Alert variant="danger" className="text-sm py-2 px-3 mb-4 rounded-lg">
                  <i className="bi bi-exclamation-triangle-fill me-2"></i>
                  {apiError}
                </Alert>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                className="submit-btn"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Spinner size="sm" animation="border" />
                    Authenticating...
                  </>
                ) : (
                  <>
                    Login
                    <i className="bi bi-arrow-right-short text-2xl"></i>
                  </>
                )}
              </button>
            </Form>

            {/* Registration Links Section */}
            <div className="registration-section">
              <p>Don't have an account?</p>
              <div className="reg-links-grid">
                <Link to="/register/public" className="reg-btn">
                  <i className="bi bi-person-fill"></i>
                  Register as Public User
                </Link>
                <Link to="/register/police" className="reg-btn">
                  <i className="bi bi-shield-shaded"></i>
                  Register as Police Officer
                </Link>
                <Link to="/register/social-worker" className="reg-btn">
                  <i className="bi bi-heart-fill"></i>
                  Register as Social Worker
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
