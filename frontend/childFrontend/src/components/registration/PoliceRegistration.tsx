import React, { useState, useRef } from 'react';
import { Form, Button, Card, Alert, Spinner, ProgressBar, InputGroup, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import { POLICE_DEPARTMENTS, POLICE_RANKS } from '../../utils/constants';
import './PoliceRegistration.css';

interface PoliceRegistrationForm {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  password: string;
  confirmPassword: string;
  badgeNumber: string;
  policeStation: string;
  department: string;
  rank: string;
  stationContact: string;
  workingHoursStart: string;
  workingHoursEnd: string;
  workingDays: string;
  maxCaseCapacity: number;
  idDocumentFront: File | null;
  idDocumentBack: File | null;
  termsAccepted: {
    termsOfService: boolean;
    privacyPolicy: boolean;
    childProtectionGuidelines: boolean;
  };
}

const SRI_LANKA_POLICE_STATIONS = [
  'Colombo Central Police Station', 'Gampaha Police Station', 'Kalutara Police Station',
  'Kandy Police Station', 'Matale Police Station', 'Nuwara Eliya Police Station',
  'Galle Police Station', 'Matara Police Station', 'Hambantota Police Station',
  'Jaffna Police Station', 'Vavuniya Police Station', 'Batticaloa Police Station',
  'Trincomalee Police Station', 'Kurunegala Police Station', 'Puttalam Police Station',
  'Anuradhapura Police Station', 'Polonnaruwa Police Station', 'Badulla Police Station',
  'Moneragala Police Station', 'Ratnapura Police Station', 'Kegalle Police Station'
];

const PoliceRegistration: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<PoliceRegistrationForm>({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    password: '',
    confirmPassword: '',
    badgeNumber: '',
    policeStation: '',
    department: '',
    rank: 'Constable',
    stationContact: '',
    workingHoursStart: '08:00',
    workingHoursEnd: '18:00',
    workingDays: 'Mon-Fri',
    maxCaseCapacity: 10,
    idDocumentFront: null,
    idDocumentBack: null,
    termsAccepted: {
      termsOfService: false,
      privacyPolicy: false,
      childProtectionGuidelines: false
    }
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string>('');
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [passwordStrengthLabel, setPasswordStrengthLabel] = useState('');
  const [previewFront, setPreviewFront] = useState<string | null>(null);
  const [previewBack, setPreviewBack] = useState<string | null>(null);
  const frontFileInputRef = useRef<HTMLInputElement>(null);
  const backFileInputRef = useRef<HTMLInputElement>(null);

  const totalSteps = 4;
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
      if (!formData.email.trim()) newErrors.email = 'Email is required';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = 'Invalid email format';
      }
      if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
      if (!formData.address.trim()) newErrors.address = 'Address is required';
    } else if (step === 2) {
      if (!formData.badgeNumber.trim()) newErrors.badgeNumber = 'Badge number is required';
      else if (!/^SLP-[A-Z]+-\d{4}-\d+$/.test(formData.badgeNumber)) {
        newErrors.badgeNumber = 'Format: SLP-<DISTRICT>-<YEAR>-<SEQUENCE> (e.g., SLP-COL-2024-001)';
      }
      if (!formData.idDocumentFront) newErrors.idDocumentFront = 'Front side of ID card is required';
      if (!formData.idDocumentBack) newErrors.idDocumentBack = 'Back side of ID card is required';
    } else if (step === 3) {
      if (!formData.policeStation) newErrors.policeStation = 'Police station is required';
      if (!formData.department) newErrors.department = 'Department is required';
      if (!formData.rank) newErrors.rank = 'Rank is required';
    } else if (step === 4) {
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
    const { name, value, type } = e.target;
    
    if (type === 'range') {
      setFormData(prev => ({ ...prev, [name]: parseInt(value) }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
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

  const handleFileChange = (side: 'front' | 'back', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, [`idDocument${side.charAt(0).toUpperCase() + side.slice(1)}`]: 'File size must be less than 5MB' }));
        return;
      }
      if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
        setErrors(prev => ({ ...prev, [`idDocument${side.charAt(0).toUpperCase() + side.slice(1)}`]: 'File must be an image or PDF' }));
        return;
      }
      
      if (side === 'front') {
        setFormData(prev => ({ ...prev, idDocumentFront: file }));
        if (file.type.startsWith('image/')) {
          const reader = new FileReader();
          reader.onloadend = () => setPreviewFront(reader.result as string);
          reader.readAsDataURL(file);
        }
      } else {
        setFormData(prev => ({ ...prev, idDocumentBack: file }));
        if (file.type.startsWith('image/')) {
          const reader = new FileReader();
          reader.onloadend = () => setPreviewBack(reader.result as string);
          reader.readAsDataURL(file);
        }
      }
      
      const errorKey = `idDocument${side.charAt(0).toUpperCase() + side.slice(1)}`;
      if (errors[errorKey]) setErrors(prev => ({ ...prev, [errorKey]: '' }));
    }
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
    if (!validateStep(4)) return;

    setLoading(true);
    setApiError('');

    try {
      // Convert ID document to base64 (backend expects a URL string)
      let idDocumentUrl = '';
      if (formData.idDocumentFront) {
        try {
          const base64 = await fileToBase64(formData.idDocumentFront);
          // For now, we'll use a data URL format. In production, you'd upload to a storage service first
          idDocumentUrl = `data:${formData.idDocumentFront.type};base64,${base64}`;
        } catch (error) {
          setApiError('Failed to process ID document');
          setLoading(false);
          return;
        }
      }

      // Prepare JSON payload matching backend RegisterRequest DTO
      const requestData = {
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        role: 'PO', // Backend expects 'PO' for police officer
        badgeNumber: formData.badgeNumber,
        department: formData.department,
        rank: formData.rank,
        stationAddress: formData.policeStation,
        idDocumentUrl: idDocumentUrl, // Backend expects 'idDocumentUrl' (singular)
        termsAccepted: formData.termsAccepted.termsOfService && 
                      formData.termsAccepted.privacyPolicy && 
                      formData.termsAccepted.childProtectionGuidelines
      };

      const response = await authService.registerPoliceOfficer(requestData);

      if (response.success && response.token) {
        navigate('/register/police/success', { 
          state: { 
            user: response.user,
            userName: formData.fullName,
            badgeNumber: formData.badgeNumber,
            station: formData.policeStation,
            rank: formData.rank
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
          <span className="step-icon">👤</span> PERSONAL INFORMATION
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
          <Form.Label className="fw-semibold">Email Address *</Form.Label>
          <Form.Control
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter your email"
            isInvalid={!!errors.email}
            required
          />
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
          <Form.Label className="fw-semibold">Address *</Form.Label>
          <Form.Control
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="Enter your address"
            isInvalid={!!errors.address}
            required
          />
          <Form.Control.Feedback type="invalid">{errors.address}</Form.Control.Feedback>
        </Form.Group>
      </Card.Body>
    </Card>
  );

  const renderStep2 = () => (
    <Card className="step-card">
      <Card.Body className="p-4">
        <h5 className="fw-bold mb-4">
          <span className="step-icon">🚔</span> POLICE ID VERIFICATION
        </h5>

        <Form.Group className="mb-4">
          <Form.Label className="fw-semibold">Official Badge Number *</Form.Label>
          <Form.Control
            type="text"
            name="badgeNumber"
            value={formData.badgeNumber}
            onChange={handleChange}
            placeholder="SLP-COL-2024-001"
            isInvalid={!!errors.badgeNumber}
            required
          />
          <Form.Text className="text-muted">
            Format: SLP-&lt;DISTRICT&gt;-&lt;YEAR&gt;-&lt;SEQUENCE&gt;
          </Form.Text>
          <Form.Control.Feedback type="invalid">{errors.badgeNumber}</Form.Control.Feedback>
        </Form.Group>

        <Row>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">Upload Police ID Card (Front Side) *</Form.Label>
              <div className="file-upload-area" onClick={() => frontFileInputRef.current?.click()}>
                {previewFront ? (
                  <div className="image-preview">
                    <img src={previewFront} alt="Front Preview" />
                    <Button
                      variant="link"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setPreviewFront(null);
                        setFormData(prev => ({ ...prev, idDocumentFront: null }));
                        if (frontFileInputRef.current) frontFileInputRef.current.value = '';
                      }}
                    >
                      Remove
                    </Button>
                  </div>
                ) : (
                  <div className="upload-placeholder">
                    <i className="bi bi-upload" style={{ fontSize: '2rem' }}></i>
                    <p className="mt-2 mb-0">Upload</p>
                    <small className="text-muted">Max 5MB each</small>
                    <small className="text-muted d-block">JPG/PNG/PDF</small>
                  </div>
                )}
              </div>
              <input
                ref={frontFileInputRef}
                type="file"
                accept="image/jpeg,image/png,application/pdf"
                onChange={(e) => handleFileChange('front', e)}
                style={{ display: 'none' }}
              />
              {errors.idDocumentFront && (
                <Form.Text className="text-danger">{errors.idDocumentFront}</Form.Text>
              )}
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">Upload Police ID Card (Back Side) *</Form.Label>
              <div className="file-upload-area" onClick={() => backFileInputRef.current?.click()}>
                {previewBack ? (
                  <div className="image-preview">
                    <img src={previewBack} alt="Back Preview" />
                    <Button
                      variant="link"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setPreviewBack(null);
                        setFormData(prev => ({ ...prev, idDocumentBack: null }));
                        if (backFileInputRef.current) backFileInputRef.current.value = '';
                      }}
                    >
                      Remove
                    </Button>
                  </div>
                ) : (
                  <div className="upload-placeholder">
                    <i className="bi bi-upload" style={{ fontSize: '2rem' }}></i>
                    <p className="mt-2 mb-0">Upload</p>
                    <small className="text-muted">Max 5MB each</small>
                    <small className="text-muted d-block">JPG/PNG/PDF</small>
                  </div>
                )}
              </div>
              <input
                ref={backFileInputRef}
                type="file"
                accept="image/jpeg,image/png,application/pdf"
                onChange={(e) => handleFileChange('back', e)}
                style={{ display: 'none' }}
              />
              {errors.idDocumentBack && (
                <Form.Text className="text-danger">{errors.idDocumentBack}</Form.Text>
              )}
            </Form.Group>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );

  const renderStep3 = () => (
    <Card className="step-card">
      <Card.Body className="p-4">
        <h5 className="fw-bold mb-4">
          <span className="step-icon">🏢</span> DEPARTMENT INFORMATION
        </h5>

        <Form.Group className="mb-3">
          <Form.Label className="fw-semibold">Police Station *</Form.Label>
          <InputGroup>
            <Form.Control
              type="text"
              name="policeStation"
              value={formData.policeStation}
              onChange={handleChange}
              placeholder="Search or select from dropdown"
              list="stations-list"
              isInvalid={!!errors.policeStation}
              required
            />
            <datalist id="stations-list">
              {SRI_LANKA_POLICE_STATIONS.map(station => (
                <option key={station} value={station} />
              ))}
            </datalist>
            <InputGroup.Text>
              <i className="bi bi-search"></i>
            </InputGroup.Text>
          </InputGroup>
          <Form.Control.Feedback type="invalid">{errors.policeStation}</Form.Control.Feedback>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label className="fw-semibold">Department *</Form.Label>
          <div className="department-options">
            {[
              { value: 'Child Protection Unit', label: 'Child Protection Unit' },
              { value: 'Women Safety Cell', label: 'Women Safety Cell' },
              { value: 'Cyber Crime', label: 'Cyber Crime' },
              { value: 'General Duty', label: 'General Duty' },
              { value: 'Special Juvenile Unit', label: 'Special Juvenile Unit' },
              { value: 'Other', label: 'Other' }
            ].map((dept) => (
              <Form.Check
                key={dept.value}
                type="radio"
                name="department"
                id={`dept-${dept.value}`}
                label={dept.label}
                value={dept.value}
                checked={formData.department === dept.value}
                onChange={handleChange}
                className="mb-2"
              />
            ))}
          </div>
          {errors.department && (
            <Form.Text className="text-danger">{errors.department}</Form.Text>
          )}
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label className="fw-semibold">Rank *</Form.Label>
          <Form.Select
            name="rank"
            value={formData.rank}
            onChange={handleChange}
            isInvalid={!!errors.rank}
            required
          >
            <option value="">Select rank</option>
            {POLICE_RANKS.map(rank => (
              <option key={rank} value={rank}>{rank}</option>
            ))}
          </Form.Select>
          <Form.Control.Feedback type="invalid">{errors.rank}</Form.Control.Feedback>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label className="fw-semibold">Station Contact Number</Form.Label>
          <Form.Control
            type="tel"
            name="stationContact"
            value={formData.stationContact}
            onChange={handleChange}
            placeholder="Enter station contact number"
          />
        </Form.Group>

        <Row>
          <Col md={4}>
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">Working Hours Start</Form.Label>
              <Form.Control
                type="time"
                name="workingHoursStart"
                value={formData.workingHoursStart}
                onChange={handleChange}
              />
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">Working Hours End</Form.Label>
              <Form.Control
                type="time"
                name="workingHoursEnd"
                value={formData.workingHoursEnd}
                onChange={handleChange}
              />
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">Working Days</Form.Label>
              <Form.Select
                name="workingDays"
                value={formData.workingDays}
                onChange={handleChange}
              >
                <option value="Mon-Fri">Mon-Fri</option>
                <option value="Mon-Sat">Mon-Sat</option>
                <option value="All Week">All Week</option>
                <option value="Shift Based">Shift Based</option>
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>

        <Form.Group className="mb-3">
          <Form.Label className="fw-semibold">
            Max Case Capacity (Default: 10, adjustable)
          </Form.Label>
          <div className="d-flex align-items-center gap-3">
            <Form.Control
              type="number"
              name="maxCaseCapacity"
              value={formData.maxCaseCapacity}
              onChange={handleChange}
              min="5"
              max="20"
              style={{ width: '80px' }}
            />
            <Form.Range
              name="maxCaseCapacity"
              value={formData.maxCaseCapacity}
              onChange={handleChange}
              min="5"
              max="20"
              style={{ flex: 1 }}
            />
            <span className="text-muted">5─────10─────15─────20</span>
          </div>
        </Form.Group>
      </Card.Body>
    </Card>
  );

  const renderStep4 = () => (
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
    <div className="police-registration">
      <Card className="registration-container shadow-lg border-0">
        <Card.Body className="p-5">
          <div className="text-center mb-4">
            <h2 className="display-5 fw-bold text-danger mb-2">
              POLICE OFFICER REGISTRATION - STEP {currentStep} OF {totalSteps}
            </h2>
            
            <div className="progress-section mb-4">
              <ProgressBar now={progressPercentage} className="mb-2" style={{ height: '10px' }} />
              <div className="step-indicators d-flex justify-content-between">
                <span className={currentStep >= 1 ? 'active' : ''}>① Personal</span>
                <span className={currentStep >= 2 ? 'active' : ''}>② Police ID</span>
                <span className={currentStep >= 3 ? 'active' : ''}>③ Department</span>
                <span className={currentStep >= 4 ? 'active' : ''}>④ Security</span>
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
            {currentStep === 4 && renderStep4()}

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
                <Button variant="danger" onClick={nextStep}>
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
        </Card.Body>
      </Card>
    </div>
  );
};

export default PoliceRegistration;
