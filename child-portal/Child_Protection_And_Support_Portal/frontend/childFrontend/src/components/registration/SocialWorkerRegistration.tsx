import React, { useState, useRef } from 'react';
import { Form, Button, Card, Alert, Spinner, ProgressBar, InputGroup, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import './SocialWorkerRegistration.css';

interface SocialWorkerRegistrationForm {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  password: string;
  confirmPassword: string;
  licenseNumber: string;
  issuingAuthority: string;
  licenseExpiryDate: string;
  organization: string;
  experience: string;
  specializations: string[];
  languages: string[];
  areasOfOperation: string[];
  emergencyAvailability: string;
  maxHelpRequestCapacity: number;
  certificationDocuments: File[];
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

const ISSUING_AUTHORITIES = [
  'State Council of Social Work',
  'National Board of Social Workers',
  'University of Colombo',
  'University of Peradeniya',
  'Open University of Sri Lanka',
  'Other'
];

const SPECIALIZATIONS = [
  'Child Counseling',
  'Trauma Healing',
  'Family Mediation',
  'Educational Support',
  'Medical Social Work',
  'Legal Assistance',
  'Shelter Management',
  'Rehabilitation',
  'Crisis Intervention'
];

const LANGUAGES = [
  'Sinhala',
  'Tamil',
  'English',
  'Hindi',
  'Malayalam',
  'Other'
];

const SocialWorkerRegistration: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<SocialWorkerRegistrationForm>({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    password: '',
    confirmPassword: '',
    licenseNumber: '',
    issuingAuthority: '',
    licenseExpiryDate: '',
    organization: '',
    experience: '',
    specializations: [],
    languages: [],
    areasOfOperation: [],
    emergencyAvailability: 'BUSINESS_HOURS',
    maxHelpRequestCapacity: 10,
    certificationDocuments: [],
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
  const [documentPreviews, setDocumentPreviews] = useState<{ [key: number]: string }>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      if (!formData.licenseNumber.trim()) newErrors.licenseNumber = 'License number is required';
      else if (!/^SWL-LK-\d{4}-\d+$/.test(formData.licenseNumber)) {
        newErrors.licenseNumber = 'Format: SWL-LK-<YEAR>-<SEQUENCE> (e.g., SWL-LK-2024-001)';
      }
      if (!formData.issuingAuthority) newErrors.issuingAuthority = 'Issuing authority is required';
      if (!formData.licenseExpiryDate) newErrors.licenseExpiryDate = 'License expiry date is required';
      if (formData.certificationDocuments.length < 3) {
        newErrors.certificationDocuments = 'Please upload all 3 required documents';
      }
    } else if (step === 2) {
    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = 'Invalid email format';
      }
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!formData.address.trim()) newErrors.address = 'Address is required';
      if (!formData.organization.trim()) newErrors.organization = 'Organization is required';
    } else if (step === 3) {
      if (!formData.experience) newErrors.experience = 'Years of experience is required';
      if (formData.specializations.length === 0) {
        newErrors.specializations = 'Select at least one specialization';
      }
      if (formData.languages.length === 0) {
        newErrors.languages = 'Select at least one language';
      }
      if (formData.areasOfOperation.length === 0) {
        newErrors.areasOfOperation = 'Select at least one area of operation';
      }
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

  const handleSpecializationChange = (specialization: string) => {
    setFormData(prev => ({
      ...prev,
      specializations: prev.specializations.includes(specialization)
        ? prev.specializations.filter(s => s !== specialization)
        : [...prev.specializations, specialization]
    }));
    if (errors.specializations) setErrors(prev => ({ ...prev, specializations: '' }));
  };

  const handleLanguageChange = (language: string) => {
    setFormData(prev => ({
      ...prev,
      languages: prev.languages.includes(language)
        ? prev.languages.filter(l => l !== language)
        : [...prev.languages, language]
    }));
    if (errors.languages) setErrors(prev => ({ ...prev, languages: '' }));
  };

  const handleAreaChange = (area: string) => {
    setFormData(prev => ({
      ...prev,
      areasOfOperation: prev.areasOfOperation.includes(area)
        ? prev.areasOfOperation.filter(a => a !== area)
        : [...prev.areasOfOperation, area]
    }));
    if (errors.areasOfOperation) setErrors(prev => ({ ...prev, areasOfOperation: '' }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles: File[] = [];
    const totalSize = formData.certificationDocuments.reduce((sum, f) => sum + f.size, 0);

    files.forEach((file, index) => {
      if (file.size > 10 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, certificationDocuments: 'Each file must be less than 10MB' }));
        return;
      }
      if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
        setErrors(prev => ({ ...prev, certificationDocuments: 'Files must be images or PDFs' }));
        return;
      }
      if (totalSize + file.size > 10 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, certificationDocuments: 'Total size must be less than 10MB' }));
        return;
      }
      validFiles.push(file);
      
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setDocumentPreviews(prev => ({ ...prev, [formData.certificationDocuments.length + index]: reader.result as string }));
        };
        reader.readAsDataURL(file);
      }
    });

    setFormData(prev => ({
      ...prev,
      certificationDocuments: [...prev.certificationDocuments, ...validFiles]
    }));
    if (errors.certificationDocuments) setErrors(prev => ({ ...prev, certificationDocuments: '' }));
  };

  const removeDocument = (index: number) => {
    setFormData(prev => ({
      ...prev,
      certificationDocuments: prev.certificationDocuments.filter((_, i) => i !== index)
    }));
    const newPreviews = { ...documentPreviews };
    delete newPreviews[index];
    setDocumentPreviews(newPreviews);
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
      // Convert first certification document to base64 (backend expects a URL string)
      let certificationDocumentUrl = '';
      if (formData.certificationDocuments.length > 0) {
        try {
          const base64 = await fileToBase64(formData.certificationDocuments[0]);
          // For now, we'll use a data URL format. In production, you'd upload to a storage service first
          certificationDocumentUrl = `data:${formData.certificationDocuments[0].type};base64,${base64}`;
        } catch (error) {
          setApiError('Failed to process certification document');
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
        role: 'SW', // Backend expects 'SW' for social worker
        licenseNumber: formData.licenseNumber,
        organization: formData.organization,
        yearsOfExperience: formData.experience, // Backend expects 'yearsOfExperience'
        specializations: formData.specializations.join(', '), // Backend expects string, not array
        certificationDocumentUrl: certificationDocumentUrl,
        termsAccepted: formData.termsAccepted.termsOfService && 
                      formData.termsAccepted.privacyPolicy && 
                      formData.termsAccepted.childProtectionGuidelines
      };

      const response = await authService.registerSocialWorker(requestData);
      
      if (response.success && response.token) {
        navigate('/register/social-worker/success', { 
          state: { 
            user: response.user,
            userName: formData.fullName,
            licenseNumber: formData.licenseNumber,
            specializations: formData.specializations,
            experience: formData.experience
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
          <span className="step-icon">🏥</span> LICENSE & CERTIFICATION
        </h5>
        <Alert variant="info" className="mb-4">
          <strong>SOCIAL WORKER REGISTRATION - CERTIFIED PROFESSIONALS ONLY</strong>
        </Alert>

        <Form.Group className="mb-3">
          <Form.Label className="fw-semibold">Professional License Number *</Form.Label>
          <Form.Control
            type="text"
            name="licenseNumber"
            value={formData.licenseNumber}
            onChange={handleChange}
            placeholder="SWL-LK-2024-001"
            isInvalid={!!errors.licenseNumber}
            required
          />
          <Form.Text className="text-muted">
            Format: SWL-LK-&lt;YEAR&gt;-&lt;SEQUENCE&gt;
          </Form.Text>
          <Form.Control.Feedback type="invalid">{errors.licenseNumber}</Form.Control.Feedback>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label className="fw-semibold">Issuing Authority *</Form.Label>
          <Form.Select
            name="issuingAuthority"
            value={formData.issuingAuthority}
            onChange={handleChange}
            isInvalid={!!errors.issuingAuthority}
            required
          >
            <option value="">Select issuing authority</option>
            {ISSUING_AUTHORITIES.map(auth => (
              <option key={auth} value={auth}>{auth}</option>
            ))}
          </Form.Select>
          <Form.Control.Feedback type="invalid">{errors.issuingAuthority}</Form.Control.Feedback>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label className="fw-semibold">License Expiry Date *</Form.Label>
          <Form.Control
            type="date"
            name="licenseExpiryDate"
            value={formData.licenseExpiryDate}
            onChange={handleChange}
            isInvalid={!!errors.licenseExpiryDate}
            required
          />
          <Form.Control.Feedback type="invalid">{errors.licenseExpiryDate}</Form.Control.Feedback>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label className="fw-semibold">Upload Certification Documents *</Form.Label>
          <div className="file-upload-area" onClick={() => fileInputRef.current?.click()}>
            <div className="upload-placeholder">
              <i className="bi bi-cloud-upload" style={{ fontSize: '3rem' }}></i>
              <p className="mt-2 mb-0">Drag & drop files or click to upload</p>
              <small className="text-muted">Max 10MB total • PDF, JPG, PNG</small>
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            multiple
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
          <div className="mt-3">
            <small className="text-muted d-block mb-2">Required documents:</small>
            <ul className="small text-muted">
              <li>1. License Certificate (PDF/Image)</li>
              <li>2. Degree/Diploma Certificate</li>
              <li>3. ID Proof (NIC/Passport)</li>
            </ul>
          </div>
          {formData.certificationDocuments.length > 0 && (
            <div className="uploaded-files mt-3">
              {formData.certificationDocuments.map((file, index) => (
                <div key={index} className="uploaded-file-item mb-2">
                  <div className="d-flex align-items-center justify-content-between">
                    <div className="d-flex align-items-center">
                      {documentPreviews[index] ? (
                        <img src={documentPreviews[index]} alt="Preview" className="file-preview me-2" />
                      ) : (
                        <i className="bi bi-file-earmark-pdf me-2" style={{ fontSize: '1.5rem' }}></i>
                      )}
                      <span className="small">{file.name}</span>
                    </div>
                    <Button
                      variant="link"
                      size="sm"
                      onClick={() => removeDocument(index)}
                      className="text-danger"
                    >
                      <i className="bi bi-x-circle"></i>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
          {errors.certificationDocuments && (
            <Form.Text className="text-danger">{errors.certificationDocuments}</Form.Text>
          )}
        </Form.Group>
      </Card.Body>
    </Card>
  );

  const renderStep2 = () => (
    <Card className="step-card">
      <Card.Body className="p-4">
        <h5 className="fw-bold mb-4">
          <span className="step-icon">🏢</span> ORGANIZATION & PERSONAL INFORMATION
              </h5>
              
        <Form.Group className="mb-3">
          <Form.Label className="fw-semibold">Organization *</Form.Label>
          <Form.Control
            type="text"
            name="organization"
            value={formData.organization}
            onChange={handleChange}
            placeholder="Enter your organization name"
            isInvalid={!!errors.organization}
            required
          />
          <Form.Control.Feedback type="invalid">{errors.organization}</Form.Control.Feedback>
        </Form.Group>

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

  const renderStep3 = () => (
    <Card className="step-card">
      <Card.Body className="p-4">
        <h5 className="fw-bold mb-4">
          <span className="step-icon">🎯</span> SPECIALIZATIONS & EXPERIENCE
        </h5>

        <Form.Group className="mb-3">
          <Form.Label className="fw-semibold">Years of Experience *</Form.Label>
          <Form.Select
            name="experience"
            value={formData.experience}
            onChange={handleChange}
            isInvalid={!!errors.experience}
            required
          >
            <option value="">Select experience</option>
            <option value="<1 year">Less than 1 year</option>
            <option value="1-3 years">1-3 years</option>
            <option value="3-5 years">3-5 years</option>
            <option value="5-10 years">5-10 years</option>
            <option value="10+ years">10+ years</option>
          </Form.Select>
          <Form.Control.Feedback type="invalid">{errors.experience}</Form.Control.Feedback>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label className="fw-semibold">Specializations (Select all that apply) *</Form.Label>
          <div className="specializations-grid">
            {SPECIALIZATIONS.map(spec => (
              <Form.Check
                key={spec}
                type="checkbox"
                id={`spec-${spec}`}
                label={spec}
                checked={formData.specializations.includes(spec)}
                onChange={() => handleSpecializationChange(spec)}
                className="mb-2"
              />
            ))}
          </div>
          {errors.specializations && (
            <Form.Text className="text-danger">{errors.specializations}</Form.Text>
          )}
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label className="fw-semibold">Languages Spoken *</Form.Label>
          <div className="languages-grid">
            {LANGUAGES.map(lang => (
              <Form.Check
                key={lang}
                type="checkbox"
                id={`lang-${lang}`}
                label={lang}
                checked={formData.languages.includes(lang)}
                onChange={() => handleLanguageChange(lang)}
                className="mb-2"
              />
            ))}
          </div>
          {errors.languages && (
            <Form.Text className="text-danger">{errors.languages}</Form.Text>
          )}
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label className="fw-semibold">Areas of Operation *</Form.Label>
          <div className="areas-grid">
            {SRI_LANKA_CITIES.map(city => (
              <Form.Check
                key={city}
                type="checkbox"
                id={`area-${city}`}
                label={city}
                checked={formData.areasOfOperation.includes(city)}
                onChange={() => handleAreaChange(city)}
                className="mb-2"
              />
            ))}
          </div>
          {errors.areasOfOperation && (
            <Form.Text className="text-danger">{errors.areasOfOperation}</Form.Text>
          )}
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label className="fw-semibold">Availability for Emergency Calls</Form.Label>
          <div className="availability-options">
            {[
              { value: '24_7', label: '24/7 Available' },
              { value: 'BUSINESS_HOURS', label: 'Business Hours' },
              { value: 'WEEKDAYS_ONLY', label: 'Weekdays Only' }
            ].map(option => (
              <Form.Check
                key={option.value}
                type="radio"
                name="emergencyAvailability"
                id={`avail-${option.value}`}
                label={option.label}
                value={option.value}
                checked={formData.emergencyAvailability === option.value}
                onChange={handleChange}
                className="mb-2"
              />
            ))}
          </div>
                  </Form.Group>
              
        <Form.Group className="mb-3">
                    <Form.Label className="fw-semibold">
            Max Help Requests Capacity (Default: 10)
                    </Form.Label>
          <div className="d-flex align-items-center gap-3">
            <Form.Control
              type="number"
              name="maxHelpRequestCapacity"
              value={formData.maxHelpRequestCapacity}
              onChange={handleChange}
              min="5"
              max="20"
              style={{ width: '80px' }}
            />
            <Form.Range
              name="maxHelpRequestCapacity"
              value={formData.maxHelpRequestCapacity}
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
    <div className="social-worker-registration">
      <Card className="registration-container shadow-lg border-0">
        <Card.Body className="p-5">
          <div className="text-center mb-4">
            <h2 className="display-5 fw-bold text-success mb-2">
              SOCIAL WORKER REGISTRATION - STEP {currentStep} OF {totalSteps}
            </h2>
            
            <div className="progress-section mb-4">
              <ProgressBar now={progressPercentage} className="mb-2" style={{ height: '10px' }} />
              <div className="step-indicators d-flex justify-content-between">
                <span className={currentStep >= 1 ? 'active' : ''}>① License</span>
                <span className={currentStep >= 2 ? 'active' : ''}>② Organization</span>
                <span className={currentStep >= 3 ? 'active' : ''}>③ Experience</span>
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
                <Button variant="success" onClick={nextStep}>
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

export default SocialWorkerRegistration;
