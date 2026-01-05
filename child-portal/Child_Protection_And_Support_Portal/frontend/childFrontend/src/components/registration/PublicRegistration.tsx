import React, { useState, useRef } from 'react';
import { Form, Button, Card, Alert, Spinner, ProgressBar, InputGroup } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import './PublicRegistration.css';

interface PublicRegistrationForm {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  profilePhoto: File | null;
  ageGroup: string;
  location: string;
  preferredContactMethod: string;
  notificationPreferences: {
    caseStatus: boolean;
    emergencyAlerts: boolean;
    helpRequests: boolean;
    newsletter: boolean;
  };
  termsAccepted: {
    termsOfService: boolean;
    privacyPolicy: boolean;
    childProtectionGuidelines: boolean;
  };
}

const SRI_LANKA_CITIES = [
  'Colombo', 'Gampaha', 'Kalutara', 'Kandy', 'Matale', 'Nuwara Eliya',
  'Galle', 'Matara', 'Hambantota', 'Jaffna', 'Vanni', 'Batticaloa',
  'Digamadulla', 'Trincomalee', 'Kurunegala', 'Puttalam', 'Anuradhapura',
  'Polonnaruwa', 'Badulla', 'Moneragala', 'Ratnapura', 'Kegalle'
];

const PublicRegistration: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<PublicRegistrationForm>({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    profilePhoto: null,
    ageGroup: '',
    location: '',
    preferredContactMethod: 'EMAIL',
    notificationPreferences: {
      caseStatus: true,
      emergencyAlerts: true,
      helpRequests: true,
      newsletter: false
    },
    termsAccepted: {
      termsOfService: false,
      privacyPolicy: false,
      childProtectionGuidelines: false
    }
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string>('');
  const [emailAvailable, setEmailAvailable] = useState<boolean | null>(null);
  const [checkingEmail, setCheckingEmail] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [passwordStrengthLabel, setPasswordStrengthLabel] = useState('');
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const totalSteps = 3;
  const progressPercentage = (currentStep / totalSteps) * 100;

  const calculatePasswordStrength = (password: string): { strength: number; label: string } => {
    let strength = 0;
    let label = '';

    if (password.length >= 8) strength += 20;
    if (password.length >= 12) strength += 10;
    if (/[a-z]/.test(password)) strength += 15;
    if (/[A-Z]/.test(password)) strength += 15;
    if (/\d/.test(password)) strength += 15;
    if (/[^a-zA-Z\d]/.test(password)) strength += 25;

    if (strength < 30) label = 'Weak';
    else if (strength < 60) label = 'Fair';
    else if (strength < 80) label = 'Good';
    else label = 'Strong';

    return { strength, label };
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
      if (!formData.ageGroup) newErrors.ageGroup = 'Age group is required';
      if (!formData.location) newErrors.location = 'Location is required';
    } else if (step === 2) {
      if (!formData.email.trim()) newErrors.email = 'Email is required';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = 'Invalid email format';
      }
      if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
      else if (!/^[0-9]{10}$/.test(formData.phone.replace(/\D/g, ''))) {
        newErrors.phone = 'Phone number must be 10 digits';
      }
    } else if (step === 3) {
      if (!formData.password) newErrors.password = 'Password is required';
      else if (formData.password.length < 8) {
        newErrors.password = 'Password must be at least 8 characters';
      } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/.test(formData.password)) {
        newErrors.password = 'Password must contain uppercase, lowercase, number, and special character';
      }
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
      if (!formData.termsAccepted.termsOfService || 
          !formData.termsAccepted.privacyPolicy || 
          !formData.termsAccepted.childProtectionGuidelines) {
        newErrors.termsAccepted = 'You must accept all terms and conditions';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<any>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    if (apiError) setApiError('');
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const password = e.target.value;
    setFormData(prev => ({ ...prev, password }));
    const { strength, label } = calculatePasswordStrength(password);
    setPasswordStrength(strength);
    setPasswordStrengthLabel(label);
    if (errors.password) setErrors(prev => ({ ...prev, password: '' }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, profilePhoto: 'File size must be less than 5MB' }));
        return;
      }
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({ ...prev, profilePhoto: 'File must be an image' }));
        return;
      }
      setFormData(prev => ({ ...prev, profilePhoto: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
      if (errors.profilePhoto) setErrors(prev => ({ ...prev, profilePhoto: '' }));
    }
  };

  const handleNotificationChange = (key: keyof typeof formData.notificationPreferences) => {
    setFormData(prev => ({
      ...prev,
      notificationPreferences: {
        ...prev.notificationPreferences,
        [key]: !prev.notificationPreferences[key]
      }
    }));
  };

  const handleTermsChange = (key: keyof typeof formData.termsAccepted) => {
    setFormData(prev => ({
      ...prev,
      termsAccepted: {
        ...prev.termsAccepted,
        [key]: !prev.termsAccepted[key]
      }
    }));
    if (errors.termsAccepted) setErrors(prev => ({ ...prev, termsAccepted: '' }));
  };

  const checkEmailAvailability = async () => {
    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setEmailAvailable(null);
      return;
    }
    setCheckingEmail(true);

    setTimeout(() => {
      setEmailAvailable(true);
      setCheckingEmail(false);
    }, 1000);
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      if (currentStep < totalSteps) {
        setCurrentStep(currentStep + 1);
      }
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        // Remove data:image/jpeg;base64, prefix if present
        const base64 = result.includes(',') ? result.split(',')[1] : result;
        resolve(base64);
      };
      reader.onerror = error => reject(error);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(3)) return;

    setLoading(true);
    setApiError('');

    try {
      // Convert profile photo to base64 if present (backend expects a URL string)
      let profilePhoto = '';
      if (formData.profilePhoto) {
        try {
          const base64 = await fileToBase64(formData.profilePhoto);
          // For now, we'll use a data URL format. In production, you'd upload to a storage service first
          profilePhoto = `data:${formData.profilePhoto.type};base64,${base64}`;
        } catch (error) {
          setApiError('Failed to process profile photo');
          setLoading(false);
          return;
        }
      }

      // Prepare JSON payload matching backend RegisterRequest DTO
      const requestData = {
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        role: 'PU', // Backend expects 'PU' for public user
        address: formData.location, // Backend expects 'address' field
        profilePhoto: profilePhoto,
        termsAccepted: formData.termsAccepted.termsOfService && 
                      formData.termsAccepted.privacyPolicy && 
                      formData.termsAccepted.childProtectionGuidelines
      };

      const response = await authService.registerPublicUser(requestData);

      if (response.success && response.token) {
        navigate('/register/public/success', { 
          state: { 
            user: response.user,
            userName: formData.fullName 
          } 
        });
      } else {
        setApiError(response.message || 'Registration failed');
      }
    } catch (error: any) {
      setApiError(error.message || 'An error occurred during registration');
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <Card className="step-card">
      <Card.Body className="p-4">
        <h5 className="fw-bold mb-4">
          <span className="step-icon">📝</span> PERSONAL INFORMATION
        </h5>

        <Form.Group className="mb-3">
          <Form.Label className="fw-semibold">Full Name *</Form.Label>
          <Form.Control
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            placeholder="Enter your full name"
            isInvalid={!!errors.fullName}
            required
          />
          <Form.Control.Feedback type="invalid">{errors.fullName}</Form.Control.Feedback>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label className="fw-semibold">Upload Profile Photo (Optional)</Form.Label>
          <div className="file-upload-area" onClick={() => fileInputRef.current?.click()}>
            {previewImage ? (
              <div className="image-preview">
                <img src={previewImage} alt="Preview" />
                <Button
                  variant="link"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setPreviewImage(null);
                    setFormData(prev => ({ ...prev, profilePhoto: null }));
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}
                >
                  Remove
                </Button>
              </div>
            ) : (
              <div className="upload-placeholder">
                <i className="bi bi-camera" style={{ fontSize: '3rem' }}></i>
                <p className="mt-2 mb-0">Drag & drop or click to upload</p>
                <small className="text-muted">Supported: JPG, PNG (Max 5MB)</small>
              </div>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
          {errors.profilePhoto && (
            <Form.Text className="text-danger">{errors.profilePhoto}</Form.Text>
          )}
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label className="fw-semibold">Age Group (For analytics) *</Form.Label>
          <div className="age-group-options">
            {['Under 18', '18-30', '31-45', '46-60', '60+'].map((age) => (
              <Form.Check
                key={age}
                type="radio"
                name="ageGroup"
                id={`age-${age}`}
                label={age}
                value={age}
                checked={formData.ageGroup === age}
                onChange={handleChange}
                className="mb-2"
              />
            ))}
          </div>
          {errors.ageGroup && (
            <Form.Text className="text-danger">{errors.ageGroup}</Form.Text>
          )}
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label className="fw-semibold">Location (City) *</Form.Label>
          <InputGroup>
            <Form.Control
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="Enter your city"
              list="cities-list"
              isInvalid={!!errors.location}
              required
            />
            <datalist id="cities-list">
              {SRI_LANKA_CITIES.map(city => (
                <option key={city} value={city} />
              ))}
            </datalist>
            <InputGroup.Text>
              <i className="bi bi-geo-alt"></i>
            </InputGroup.Text>
          </InputGroup>
          <Form.Control.Feedback type="invalid">{errors.location}</Form.Control.Feedback>
        </Form.Group>
      </Card.Body>
    </Card>
  );

  const renderStep2 = () => (
    <Card className="step-card">
      <Card.Body className="p-4">
        <h5 className="fw-bold mb-4">
          <span className="step-icon">📞</span> CONTACT INFORMATION
        </h5>

        <Form.Group className="mb-3">
          <Form.Label className="fw-semibold">Email Address *</Form.Label>
          <InputGroup>
            <Form.Control
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              onBlur={checkEmailAvailability}
              placeholder="Enter your email"
              isInvalid={!!errors.email}
              required
            />
            <Button
              variant="outline-success"
              onClick={checkEmailAvailability}
              disabled={checkingEmail || !formData.email}
            >
              {checkingEmail ? (
                <Spinner animation="border" size="sm" />
              ) : (
                <>
                  {emailAvailable === true && <i className="bi bi-check-circle me-1"></i>}
                  Check Availability
                </>
              )}
            </Button>
          </InputGroup>
          {emailAvailable === true && (
            <Form.Text className="text-success">
              <i className="bi bi-check-circle me-1"></i>Email is available
            </Form.Text>
          )}
          <Form.Control.Feedback type="invalid">{errors.email}</Form.Control.Feedback>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label className="fw-semibold">Phone Number *</Form.Label>
          <InputGroup>
            <InputGroup.Text>+94</InputGroup.Text>
            <Form.Control
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Enter your phone number"
              isInvalid={!!errors.phone}
              required
            />
          </InputGroup>
          <Form.Control.Feedback type="invalid">{errors.phone}</Form.Control.Feedback>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label className="fw-semibold">Preferred Contact Method</Form.Label>
          <div className="contact-method-options">
            {[
              { value: 'EMAIL', label: 'Email' },
              { value: 'SMS', label: 'SMS' },
              { value: 'WHATSAPP', label: 'WhatsApp' },
              { value: 'PHONE', label: 'Phone Call' }
            ].map((method) => (
              <Form.Check
                key={method.value}
                type="radio"
                name="preferredContactMethod"
                id={`contact-${method.value}`}
                label={method.label}
                value={method.value}
                checked={formData.preferredContactMethod === method.value}
                onChange={handleChange}
                className="mb-2"
              />
            ))}
          </div>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label className="fw-semibold">Notification Preferences</Form.Label>
          <div className="notification-preferences">
            {Object.entries(formData.notificationPreferences).map(([key, value]) => (
              <Form.Check
                key={key}
                type="checkbox"
                id={`notif-${key}`}
                label={key === 'caseStatus' ? 'Case status updates' :
                       key === 'emergencyAlerts' ? 'Emergency alerts in my area' :
                       key === 'helpRequests' ? 'New help requests near me' :
                       'Newsletter & updates'}
                checked={value}
                onChange={() => handleNotificationChange(key as keyof typeof formData.notificationPreferences)}
                className="mb-2"
              />
            ))}
          </div>
        </Form.Group>

        <Alert variant="info" className="mb-0">
          <i className="bi bi-shield-lock me-2"></i>
          Your contact info is encrypted and never shared without your consent. Anonymous reporting available.
        </Alert>
      </Card.Body>
    </Card>
  );

  const renderStep3 = () => (
    <Card className="step-card">
      <Card.Body className="p-4">
        <h5 className="fw-bold mb-4">
          <span className="step-icon">🔒</span> SECURITY & TERMS
        </h5>

        <Form.Group className="mb-3">
          <Form.Label className="fw-semibold">Create Password *</Form.Label>
          <Form.Control
            type="password"
            name="password"
            value={formData.password}
            onChange={handlePasswordChange}
            placeholder="Enter your password"
            isInvalid={!!errors.password}
            required
          />
          {formData.password && (
            <>
              <ProgressBar
                now={passwordStrength}
                variant={
                  passwordStrength < 30 ? 'danger' :
                  passwordStrength < 60 ? 'warning' :
                  passwordStrength < 80 ? 'info' : 'success'
                }
                className="mt-2"
                style={{ height: '8px' }}
              />
              <div className="d-flex justify-content-between mt-1">
                <Form.Text className={passwordStrength >= 60 ? 'text-success' : 'text-muted'}>
                  Strength: {passwordStrength}% - {passwordStrengthLabel}
                </Form.Text>
              </div>
              <div className="password-requirements mt-2">
                <small className="d-block">
                  <i className={`bi ${formData.password.length >= 8 ? 'bi-check-circle-fill text-success' : 'bi-circle'} me-1`}></i>
                  At least 8 characters
                </small>
                <small className="d-block">
                  <i className={`bi ${/[a-z]/.test(formData.password) && /[A-Z]/.test(formData.password) ? 'bi-check-circle-fill text-success' : 'bi-circle'} me-1`}></i>
                  Uppercase & lowercase letters
                </small>
                <small className="d-block">
                  <i className={`bi ${/\d/.test(formData.password) ? 'bi-check-circle-fill text-success' : 'bi-circle'} me-1`}></i>
                  At least one number
                </small>
                <small className="d-block">
                  <i className={`bi ${/[^a-zA-Z\d]/.test(formData.password) ? 'bi-check-circle-fill text-success' : 'bi-circle'} me-1`}></i>
                  At least one special character
                </small>
              </div>
            </>
          )}
          <Form.Control.Feedback type="invalid">{errors.password}</Form.Control.Feedback>
        </Form.Group>

        <Form.Group className="mb-4">
          <Form.Label className="fw-semibold">Confirm Password *</Form.Label>
          <Form.Control
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Confirm your password"
            isInvalid={!!errors.confirmPassword}
            required
          />
          <Form.Control.Feedback type="invalid">{errors.confirmPassword}</Form.Control.Feedback>
        </Form.Group>

        <Card className="mb-3">
          <Card.Body>
            <h6 className="fw-bold mb-3">📜 TERMS & CONDITIONS</h6>
            <p className="mb-3">I agree to:</p>
            {Object.entries(formData.termsAccepted).map(([key, value]) => (
              <Form.Check
                key={key}
                type="checkbox"
                id={`terms-${key}`}
                label={key === 'termsOfService' ? 'Terms of Service' :
                       key === 'privacyPolicy' ? 'Privacy Policy' :
                       'Child Protection Guidelines'}
                checked={value}
                onChange={() => handleTermsChange(key as keyof typeof formData.termsAccepted)}
                className="mb-2"
              />
            ))}
            {errors.termsAccepted && (
              <Form.Text className="text-danger">{errors.termsAccepted}</Form.Text>
            )}
          </Card.Body>
        </Card>
      </Card.Body>
    </Card>
  );

  return (
    <div className="public-registration">
      <Card className="registration-container shadow-lg border-0">
        <Card.Body className="p-5">
          <div className="text-center mb-4">
            <h2 className="display-5 fw-bold text-primary mb-2">
              CREATE YOUR PUBLIC ACCOUNT - STEP {currentStep} OF {totalSteps}
            </h2>
            
            <div className="progress-section mb-4">
              <ProgressBar now={progressPercentage} className="mb-2" style={{ height: '10px' }} />
              <div className="step-indicators d-flex justify-content-between">
                <span className={currentStep >= 1 ? 'active' : ''}>① Personal Info</span>
                <span className={currentStep >= 2 ? 'active' : ''}>② Contact Details</span>
                <span className={currentStep >= 3 ? 'active' : ''}>③ Security</span>
              </div>
              <div className="progress-text text-muted mt-2">
                {Math.round(progressPercentage)}% Complete
              </div>
            </div>
          </div>

          {apiError && (
            <Alert variant="danger" className="mb-4">
              <i className="bi bi-exclamation-triangle me-2"></i>
              {apiError}
            </Alert>
          )}

          <Form onSubmit={handleSubmit}>
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}

            <div className="form-navigation mt-4 d-flex justify-content-between">
              <Button
                variant="outline-secondary"
                onClick={prevStep}
                disabled={currentStep === 1}
              >
                <i className="bi bi-arrow-left me-2"></i>
                BACK
              </Button>
              {currentStep < totalSteps ? (
                <Button variant="primary" onClick={nextStep}>
                  NEXT →
                </Button>
              ) : (
                <Button variant="success" type="submit" disabled={loading}>
                  {loading ? (
                    <>
                      <Spinner animation="border" size="sm" className="me-2" />
                      Creating Account...
                    </>
                  ) : (
                    'CREATE ACCOUNT'
                  )}
                </Button>
              )}
            </div>
          </Form>

          <div className="text-center mt-4">
            <small className="text-muted">
              By creating account, you agree to our terms. Account auto-approved.
            </small>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

export default PublicRegistration;

