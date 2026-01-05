import React, { useState } from 'react';
import { 
  Container, 
  Card, 
  Button, 
  Form, 
  Row, 
  Col, 
  Alert,
  ProgressBar,
  Badge
} from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { caseService } from '../../services/caseService';
import { authService } from '../../services/authService';
import { formatCaseId } from '../../utils/trackingIdFormatter';
import './ReportCasePage.css';

interface FormData {
  caseType: string;
  approximateAge: string;
  gender: string;
  identificationMarks: string;
  lastSeenClothing: string;
  location: string;
  incidentDate: string;
  incidentTime: string;
  caseDescription: string;
  priority: string;
  isAnonymous: boolean;
  evidenceFiles: File[];
}

const CASE_TYPES = [
  { value: 'MISSING_CHILD', label: 'Missing Child', icon: '👶', description: 'Missing Child' },
  { value: 'CHILD_ABUSE', label: 'Child Abuse', icon: '🩸', description: 'Child Abuse' },
  { value: 'CHILD_LABOR', label: 'Child Labor', icon: '🏭', description: 'Child Labor' },
  { value: 'CHILD_TRAFFICKING', label: 'Child Trafficking', icon: '🚫', description: 'Child Trafficking' },
  { value: 'OTHER', label: 'Other', icon: '📝', description: 'Other' },
];

const PRIORITY_LEVELS = [
  { value: 'LOW', label: 'LOW', icon: '🟢', description: 'Non-urgent matter' },
  { value: 'MEDIUM', label: 'MEDIUM', icon: '🟡', description: 'Standard priority' },
  { value: 'HIGH', label: 'HIGH', icon: '🟠', description: 'Requires attention soon' },
  { value: 'URGENT', label: 'URGENT', icon: '🔴', description: 'Emergency - Immediate attention required' },
];

const ReportCasePage: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submittedCaseId, setSubmittedCaseId] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    caseType: '',
    approximateAge: '',
    gender: '',
    identificationMarks: '',
    lastSeenClothing: '',
    location: '',
    incidentDate: '',
    incidentTime: '',
    caseDescription: '',
    priority: 'MEDIUM',
    isAnonymous: false,
    evidenceFiles: [],
  });

  const updateFormData = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    // Validation
    if (currentStep === 1 && !formData.caseType) {
      setError('Please select a case type');
      return;
    }
    if (currentStep === 2 && (!formData.approximateAge || !formData.gender)) {
      setError('Please fill in all required fields');
      return;
    }
    if (currentStep === 3) {
      if (!formData.location || !formData.incidentDate || !formData.caseDescription) {
        setError('Please fill in all required fields');
        return;
      }
      if (formData.caseDescription.length < 50) {
        setError('Case description must be at least 50 characters');
        return;
      }
    }
    setError(null);
    setCurrentStep(prev => Math.min(prev + 1, 5));
  };

  const handleBack = () => {
    setError(null);
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const validFiles = files.filter(file => {
      const maxSize = 10 * 1024 * 1024; // 10MB
      const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      return file.size <= maxSize && validTypes.includes(file.type);
    });
    updateFormData('evidenceFiles', [...formData.evidenceFiles, ...validFiles]);
  };

  const removeFile = (index: number) => {
    updateFormData('evidenceFiles', formData.evidenceFiles.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getFileIcon = (fileName: string): string => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif'].includes(ext || '')) return '📸';
    if (ext === 'pdf') return '📄';
    return '📎';
  };

  const handleSubmit = async () => {
    if (!confirmed) {
      setError('Please confirm that all information is accurate');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      // Combine date and time
      const incidentDateTime = new Date(`${formData.incidentDate}T${formData.incidentTime}`);
      
      // Prepare case data (for now, evidence files would need to be uploaded separately)
      // In a real implementation, files would be uploaded first to get URLs
      const caseData = {
        reporterInfo: {
          isAnonymous: formData.isAnonymous,
        },
        childDetails: {
          ageRange: formData.approximateAge,
          gender: formData.gender,
          identificationMarks: formData.identificationMarks || '',
        },
        caseDetails: {
          caseType: formData.caseType,
          location: formData.location,
          incidentDate: incidentDateTime.toISOString(),
          description: formData.caseDescription,
        },
        evidence: [], // Files would need to be uploaded first
      };

      const response = await caseService.reportCase(caseData);
      
      if (response.data?.id || response.data?.success) {
        setSubmittedCaseId(response.data.id || response.data.caseId);
        setCurrentStep(6); // Success step
      } else {
        setError(response.data?.message || 'Failed to submit case. Please try again.');
      }
    } catch (err: any) {
      console.error('Error submitting case:', err);
      setError(err.response?.data?.message || 'Failed to submit case. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Success view
  if (currentStep === 6) {
    return (
      <Container className="report-case-container">
        <Card className="success-card">
          <Card.Body className="text-center py-5">
            <div className="success-icon mb-4">✅</div>
            <h2 className="mb-4">CASE REPORTED SUCCESSFULLY!</h2>
            <Card className="success-info-card mb-4">
              <Card.Body>
                <div className="mb-3">
                  <div className="fs-4 mb-2">🎉 Your case has been submitted for review</div>
                </div>
                <div className="mb-3">
                  <div className="fw-bold mb-1">Tracking ID:</div>
                  <div className="fs-5 text-primary">
                    {submittedCaseId ? formatCaseId(submittedCaseId, formData.isAnonymous) : 'Processing...'}
                  </div>
                  {formData.isAnonymous && (
                    <div className="text-muted small">(Anonymous case)</div>
                  )}
                </div>
                <div className="mb-3">
                  <Badge bg="warning" className="me-2">🟡 REPORTED</Badge>
                  <Badge bg={formData.priority === 'HIGH' ? 'danger' : 'warning'}>
                    {formData.priority === 'HIGH' ? '🔴 URGENT' : formData.priority}
                  </Badge>
                </div>
                <div className="text-start mt-4">
                  <div className="fw-bold mb-2">Next Steps:</div>
                  <ol className="text-start">
                    <li>Case will be reviewed by admin</li>
                    <li>Assigned to police officer</li>
                    <li>You'll receive notifications</li>
                  </ol>
                </div>
                <div className="d-grid gap-2 mt-4">
                  <Button 
                    variant="primary" 
                    onClick={() => navigate(`/cases/${submittedCaseId}`)}
                    className="mb-2"
                  >
                    📋 View Case Details
                  </Button>
                  <Button 
                    variant="outline-primary" 
                    onClick={() => navigate('/public/dashboard')}
                    className="mb-2"
                  >
                    🏠 Return to Dashboard
                  </Button>
                  <Button 
                    variant="outline-secondary" 
                    onClick={() => {
                      setCurrentStep(1);
                      setFormData({
                        caseType: '',
                        approximateAge: '',
                        gender: '',
                        identificationMarks: '',
                        lastSeenClothing: '',
                        location: '',
                        incidentDate: '',
                        incidentTime: '',
                        caseDescription: '',
                        priority: 'MEDIUM',
                        isAnonymous: false,
                        evidenceFiles: [],
                      });
                      setSubmittedCaseId(null);
                      setConfirmed(false);
                    }}
                  >
                    📄 Report Another Case
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Card.Body>
        </Card>
      </Container>
    );
  }

  return (
    <Container className="report-case-container">
      <Card className="report-case-card">
        <Card.Header className="report-case-header">
          <div className="d-flex justify-content-between align-items-center">
            <h4 className="mb-0">📋 REPORT A CASE - STEP {currentStep}/5</h4>
            <ProgressBar 
              now={(currentStep / 5) * 100} 
              variant="primary" 
              style={{ width: '200px', height: '8px' }}
            />
          </div>
        </Card.Header>
        <Card.Body className="p-4">
          {error && (
            <Alert variant="danger" dismissible onClose={() => setError(null)} className="mb-4">
              {error}
            </Alert>
          )}

          {/* Step 1: Case Type Selection */}
          {currentStep === 1 && (
            <div className="step-content">
              <h5 className="mb-4">Select Case Type:</h5>
              <Row className="g-3">
                {CASE_TYPES.map((type) => (
                  <Col key={type.value} md={6} lg={type.value === 'OTHER' ? 12 : 3}>
                    <Card
                      className={`case-type-card ${formData.caseType === type.value ? 'selected' : ''}`}
                      onClick={() => updateFormData('caseType', type.value)}
                      style={{ cursor: 'pointer' }}
                    >
                      <Card.Body className="text-center">
                        <div className="case-type-icon mb-2">{type.icon}</div>
                        <div className="fw-bold">{type.label}</div>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>
            </div>
          )}

          {/* Step 2: Child Information */}
          {currentStep === 2 && (
            <div className="step-content">
              <h5 className="mb-4">Child Information:</h5>
              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>Approximate Age: *</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="e.g., 8 years, 10-12 years"
                    value={formData.approximateAge}
                    onChange={(e) => updateFormData('approximateAge', e.target.value)}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Gender: *</Form.Label>
                  <div>
                    {['Male', 'Female', 'Other'].map((gender) => (
                      <Form.Check
                        key={gender}
                        type="radio"
                        name="gender"
                        label={gender}
                        value={gender}
                        checked={formData.gender === gender}
                        onChange={(e) => updateFormData('gender', e.target.value)}
                        className="mb-2"
                      />
                    ))}
                  </div>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Identification Marks (optional):</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    placeholder="Describe any identifying marks, scars, birthmarks, etc."
                    value={formData.identificationMarks}
                    onChange={(e) => updateFormData('identificationMarks', e.target.value)}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Last Seen Clothing (optional):</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    placeholder="Describe what the child was wearing when last seen"
                    value={formData.lastSeenClothing}
                    onChange={(e) => updateFormData('lastSeenClothing', e.target.value)}
                  />
                </Form.Group>
              </Form>
            </div>
          )}

          {/* Step 3: Incident Details */}
          {currentStep === 3 && (
            <div className="step-content">
              <h5 className="mb-4">Incident Details:</h5>
              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>Location: *</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="City, Area, Landmark"
                    value={formData.location}
                    onChange={(e) => updateFormData('location', e.target.value)}
                    required
                  />
                  <Form.Text className="text-muted">📍 (City, Area, Landmark)</Form.Text>
                </Form.Group>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Incident Date: *</Form.Label>
                      <Form.Control
                        type="date"
                        value={formData.incidentDate}
                        onChange={(e) => updateFormData('incidentDate', e.target.value)}
                        max={new Date().toISOString().split('T')[0]}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Time: *</Form.Label>
                      <Form.Control
                        type="time"
                        value={formData.incidentTime}
                        onChange={(e) => updateFormData('incidentTime', e.target.value)}
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Label>Case Description: *</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={5}
                    placeholder="Provide detailed description of the incident..."
                    value={formData.caseDescription}
                    onChange={(e) => updateFormData('caseDescription', e.target.value)}
                    required
                  />
                  <Form.Text className="text-muted">
                    (Minimum 50 characters) {formData.caseDescription.length}/50
                  </Form.Text>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Priority Level: *</Form.Label>
                  <div>
                    {PRIORITY_LEVELS.map((priority) => (
                      <Form.Check
                        key={priority.value}
                        type="radio"
                        name="priority"
                        label={`${priority.icon} ${priority.label} - ${priority.description}`}
                        value={priority.value}
                        checked={formData.priority === priority.value}
                        onChange={(e) => updateFormData('priority', e.target.value)}
                        className="mb-2"
                      />
                    ))}
                  </div>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Check
                    type="checkbox"
                    label="⚠️ Report Anonymously: Hide my name from officers"
                    checked={formData.isAnonymous}
                    onChange={(e) => updateFormData('isAnonymous', e.target.checked)}
                  />
                </Form.Group>
              </Form>
            </div>
          )}

          {/* Step 4: Upload Evidence */}
          {currentStep === 4 && (
            <div className="step-content">
              <h5 className="mb-4">Upload Evidence:</h5>
              <div className="file-upload-area">
                <input
                  type="file"
                  id="file-upload"
                  multiple
                  accept="image/*,.pdf,.doc,.docx"
                  onChange={handleFileUpload}
                  style={{ display: 'none' }}
                />
                <label htmlFor="file-upload" className="file-upload-label">
                  <div className="text-center py-5">
                    <div className="mb-3" style={{ fontSize: '3rem' }}>🖼️</div>
                    <div className="mb-2">Drag & drop files here or click to browse</div>
                    <div className="text-muted small">
                      Supported: JPG, PNG, PDF, DOC (Max 10MB each)
                    </div>
                  </div>
                </label>
              </div>

              {formData.evidenceFiles.length > 0 && (
                <div className="mt-4">
                  <div className="fw-bold mb-3">Uploaded Files:</div>
                  {formData.evidenceFiles.map((file, index) => (
                    <Card key={index} className="mb-2">
                      <Card.Body className="py-2">
                        <div className="d-flex justify-content-between align-items-center">
                          <div className="d-flex align-items-center">
                            <span className="me-2" style={{ fontSize: '1.5rem' }}>
                              {getFileIcon(file.name)}
                            </span>
                            <div>
                              <div className="fw-bold">{file.name}</div>
                              <div className="text-muted small">{formatFileSize(file.size)}</div>
                            </div>
                          </div>
                          <Button
                            variant="link"
                            size="sm"
                            onClick={() => removeFile(index)}
                            className="text-danger"
                          >
                            🗑️ Remove
                          </Button>
                        </div>
                      </Card.Body>
                    </Card>
                  ))}
                  <Button
                    variant="outline-primary"
                    onClick={() => document.getElementById('file-upload')?.click()}
                    className="mt-2"
                  >
                    📤 Add More Files
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Step 5: Review */}
          {currentStep === 5 && (
            <div className="step-content">
              <h5 className="mb-4">Review Your Report:</h5>
              <Card className="review-card">
                <Card.Body>
                  <div className="mb-3">
                    <div className="fw-bold">Case Type:</div>
                    <div>{CASE_TYPES.find(t => t.value === formData.caseType)?.label}</div>
                  </div>
                  <div className="mb-3">
                    <div className="fw-bold">Priority:</div>
                    <Badge bg={formData.priority === 'HIGH' ? 'danger' : 'warning'}>
                      {formData.priority === 'HIGH' ? '🔴 URGENT' : formData.priority}
                    </Badge>
                  </div>
                  <div className="mb-3">
                    <div className="fw-bold">Child Details:</div>
                    <ul className="mb-0">
                      <li>Age: {formData.approximateAge}</li>
                      <li>Gender: {formData.gender}</li>
                      {formData.lastSeenClothing && (
                        <li>Last seen in {formData.lastSeenClothing}</li>
                      )}
                    </ul>
                  </div>
                  <div className="mb-3">
                    <div className="fw-bold">Incident:</div>
                    <ul className="mb-0">
                      <li>Location: {formData.location}</li>
                      <li>Date: {formData.incidentDate}, Time: {formData.incidentTime}</li>
                      <li>Description: {formData.caseDescription.substring(0, 100)}...</li>
                    </ul>
                  </div>
                  <div className="mb-3">
                    <div className="fw-bold">Evidence:</div>
                    <div>{formData.evidenceFiles.length} files attached</div>
                  </div>
                  <div className="mb-3">
                    <div className="fw-bold">Reporting:</div>
                    <div>{formData.isAnonymous ? 'Anonymous ✅' : 'Not Anonymous'}</div>
                  </div>
                </Card.Body>
              </Card>

              <Form.Group className="mt-4">
                <Form.Check
                  type="checkbox"
                  label="I confirm all information is accurate"
                  checked={confirmed}
                  onChange={(e) => setConfirmed(e.target.checked)}
                />
              </Form.Group>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="d-flex justify-content-between mt-4">
            <Button
              variant="outline-secondary"
              onClick={handleBack}
              disabled={currentStep === 1 || submitting}
            >
              ← Back
            </Button>
            {currentStep < 5 ? (
              <Button variant="primary" onClick={handleNext}>
                Next →
              </Button>
            ) : (
              <Button
                variant="success"
                onClick={handleSubmit}
                disabled={submitting || !confirmed}
              >
                {submitting ? 'Submitting...' : 'Submit Report'}
              </Button>
            )}
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default ReportCasePage;
