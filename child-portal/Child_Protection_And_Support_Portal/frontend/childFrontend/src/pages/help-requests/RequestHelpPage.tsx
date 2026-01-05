import React, { useState } from 'react';
import { 
  Container, 
  Card, 
  Button, 
  Form, 
  Alert,
  Badge
} from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { helpRequestService } from '../../services/helpRequestService';
import { formatHelpRequestId } from '../../utils/trackingIdFormatter';
import './RequestHelpPage.css';

const HELP_TYPES = [
  { value: 'FOOD_ASSISTANCE', label: 'Food Assistance' },
  { value: 'EDUCATION_SUPPORT', label: 'Education Support' },
  { value: 'MEDICAL_HELP', label: 'Medical Help' },
  { value: 'SHELTER', label: 'Shelter' },
  { value: 'CLOTHING', label: 'Clothing' },
  { value: 'COUNSELING', label: 'Counseling' },
  { value: 'OTHER', label: 'Other' },
];

const PRIORITY_LEVELS = [
  { value: 'LOW', label: 'LOW', icon: '🟢', description: 'Can wait a few days' },
  { value: 'MEDIUM', label: 'MEDIUM', icon: '🟡', description: 'Standard need' },
  { value: 'HIGH', label: 'HIGH', icon: '🟠', description: 'Need within 24 hours' },
];

interface FormData {
  helpType: string;
  approximateAge: string;
  gender: string;
  identificationMarks: string;
  description: string;
  location: string;
  priority: string;
  isAnonymous: boolean;
  documentFiles: File[];
}

const RequestHelpPage: React.FC = () => {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [submittedRequestId, setSubmittedRequestId] = useState<string | null>(null);

  const [formData, setFormData] = useState<FormData>({
    helpType: '',
    approximateAge: '',
    gender: '',
    identificationMarks: '',
    description: '',
    location: '',
    priority: 'MEDIUM',
    isAnonymous: false,
    documentFiles: [],
  });

  const updateFormData = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const validFiles = files.filter(file => {
      const maxSize = 10 * 1024 * 1024; // 10MB
      const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      return file.size <= maxSize && validTypes.includes(file.type);
    });
    updateFormData('documentFiles', [...formData.documentFiles, ...validFiles]);
  };

  const removeFile = (index: number) => {
    updateFormData('documentFiles', formData.documentFiles.filter((_, i) => i !== index));
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!formData.helpType) {
      setError('Please select a help type');
      return;
    }
    if (!formData.approximateAge || !formData.gender) {
      setError('Please fill in all required child details');
      return;
    }
    if (!formData.description) {
      setError('Please provide a description of the need');
      return;
    }
    if (!formData.location) {
      setError('Please provide a location');
      return;
    }

    setSubmitting(true);

    try {
      // Prepare help request data
      // Note: In a real implementation, files would be uploaded first to get URLs
      const requestData = {
        requesterInfo: {
          isAnonymous: formData.isAnonymous,
        },
        peopleDetails: {
          ages: formData.approximateAge,
          gender: formData.gender,
          identificationMarks: formData.identificationMarks || '',
        },
        helpTypes: [formData.helpType],
        description: formData.description,
        location: formData.location,
        documentUrls: [], // Files would need to be uploaded first
        priority: formData.priority,
      };

      const response = await helpRequestService.createHelpRequest(requestData);
      
      if (response.data?.id || response.data?.success) {
        setSubmittedRequestId(response.data.id || response.data.requestId);
        setSuccess(true);
      } else {
        setError(response.data?.message || 'Failed to submit help request. Please try again.');
      }
    } catch (err: any) {
      console.error('Error submitting help request:', err);
      setError(err.response?.data?.message || 'Failed to submit help request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/public/dashboard');
  };

  // Success view
  if (success) {
    const trackingId = submittedRequestId 
      ? formatHelpRequestId(submittedRequestId, formData.isAnonymous)
      : 'Processing...';

    return (
      <Container className="request-help-container">
        <Card className="success-card">
          <Card.Body className="text-center py-5">
            <div className="success-icon mb-4">✅</div>
            <h2 className="mb-4">HELP REQUEST SUBMITTED SUCCESSFULLY!</h2>
            <Card className="success-info-card mb-4">
              <Card.Body>
                <div className="mb-4">
                  <div className="fs-4 mb-3">🎉 Your help request has been submitted for review</div>
                </div>
                
                <div className="mb-4 pb-3 border-bottom">
                  <div className="fw-bold mb-2">Tracking ID:</div>
                  <div className="display-6 fw-bold text-primary mb-2">
                    {trackingId}
                  </div>
                  {formData.isAnonymous && (
                    <div className="text-muted small">(Anonymous request)</div>
                  )}
                </div>

                <div className="mb-4 pb-3 border-bottom">
                  <div className="d-flex justify-content-center gap-3 mb-3">
                    <Badge bg="warning" className="px-3 py-2" style={{ fontSize: '1rem' }}>
                      🟡 REQUESTED
                    </Badge>
                    <Badge 
                      bg={formData.priority === 'HIGH' ? 'danger' : formData.priority === 'MEDIUM' ? 'warning' : 'success'} 
                      className="px-3 py-2"
                      style={{ fontSize: '1rem' }}
                    >
                      {formData.priority === 'HIGH' ? '🔴 HIGH' : formData.priority === 'MEDIUM' ? '🟡 MEDIUM' : '🟢 LOW'}
                    </Badge>
                  </div>
                  <div className="text-muted small">
                    Help Type: {HELP_TYPES.find(t => t.value === formData.helpType)?.label || 'N/A'}
                  </div>
                </div>

                <div className="text-start mt-4 mb-4">
                  <div className="fw-bold mb-3 fs-5">Next Steps:</div>
                  <ol className="text-start ps-3">
                    <li className="mb-2">Request will be reviewed by admin</li>
                    <li className="mb-2">Assigned to a social worker</li>
                    <li className="mb-2">You'll receive notifications about updates</li>
                  </ol>
                </div>

                <div className="d-grid gap-2 mt-4">
                  <Button 
                    variant="primary" 
                    size="lg"
                    onClick={() => navigate(`/help-requests/${submittedRequestId}`)}
                    className="mb-2"
                  >
                    📋 View Request Details
                  </Button>
                  <Button 
                    variant="outline-primary" 
                    size="lg"
                    onClick={() => navigate('/public/dashboard')}
                    className="mb-2"
                  >
                    🏠 Return to Dashboard
                  </Button>
                  <Button 
                    variant="outline-secondary" 
                    onClick={() => {
                      setSuccess(false);
                      setFormData({
                        helpType: '',
                        approximateAge: '',
                        gender: '',
                        identificationMarks: '',
                        description: '',
                        location: '',
                        priority: 'MEDIUM',
                        isAnonymous: false,
                        documentFiles: [],
                      });
                      setSubmittedRequestId(null);
                    }}
                  >
                    ❤️ Request Another Help
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
    <Container className="request-help-container">
      <Card className="request-help-card">
        <Card.Header className="request-help-header">
          <h4 className="mb-0">❤️ REQUEST HELP</h4>
        </Card.Header>
        <Card.Body className="p-4">
          {error && (
            <Alert variant="danger" dismissible onClose={() => setError(null)} className="mb-4">
              {error}
            </Alert>
          )}

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-4">
              <Form.Label className="fw-bold">Help Type: *</Form.Label>
              <Form.Select
                value={formData.helpType}
                onChange={(e) => updateFormData('helpType', e.target.value)}
                required
              >
                <option value="">Select Type</option>
                {HELP_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <div className="mb-4">
              <h6 className="fw-bold mb-3">Child Details:</h6>
              
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
                      required
                    />
                  ))}
                </div>
              </Form.Group>
            </div>

            <Form.Group className="mb-4">
              <Form.Label className="fw-bold">Description of Need: *</Form.Label>
              <Form.Control
                as="textarea"
                rows={5}
                placeholder="Please describe what help is needed"
                value={formData.description}
                onChange={(e) => updateFormData('description', e.target.value)}
                required
              />
              <Form.Text className="text-muted">(Please describe what help is needed)</Form.Text>
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label className="fw-bold">Location: *</Form.Label>
              <Form.Control
                type="text"
                placeholder="City, Area, Address"
                value={formData.location}
                onChange={(e) => updateFormData('location', e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label className="fw-bold">Priority Level: *</Form.Label>
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

            <Form.Group className="mb-4">
              <Form.Label className="fw-bold">Documents <span className="text-muted">(optional)</span>:</Form.Label>
              <div className="file-upload-area-small">
                <input
                  type="file"
                  id="document-upload"
                  multiple
                  accept="image/*,.pdf,.doc,.docx"
                  onChange={handleFileUpload}
                  style={{ display: 'none' }}
                />
                <label htmlFor="document-upload" className="file-upload-label-small">
                  <div className="text-center py-3">
                    <div className="mb-2">📁 Upload supporting documents</div>
                    <div className="text-muted small">JPG, PNG, PDF, DOC (Max 10MB each)</div>
                  </div>
                </label>
              </div>

              {formData.documentFiles.length > 0 && (
                <div className="mt-3">
                  {formData.documentFiles.map((file, index) => (
                    <Card key={index} className="mb-2">
                      <Card.Body className="py-2">
                        <div className="d-flex justify-content-between align-items-center">
                          <div className="d-flex align-items-center">
                            <span className="me-2" style={{ fontSize: '1.5rem' }}>
                              {getFileIcon(file.name)}
                            </span>
                            <div>
                              <div className="fw-bold small">{file.name}</div>
                              <div className="text-muted small">{formatFileSize(file.size)}</div>
                            </div>
                          </div>
                          <Button
                            variant="link"
                            size="sm"
                            onClick={() => removeFile(index)}
                            className="text-danger p-0"
                          >
                            🗑️
                          </Button>
                        </div>
                      </Card.Body>
                    </Card>
                  ))}
                </div>
              )}
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Check
                type="checkbox"
                label="⚠️ Request Anonymously: Hide my identity"
                checked={formData.isAnonymous}
                onChange={(e) => updateFormData('isAnonymous', e.target.checked)}
              />
            </Form.Group>

            <div className="d-flex justify-content-end gap-3">
              <Button
                variant="outline-secondary"
                onClick={handleCancel}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                type="submit"
                disabled={submitting}
              >
                {submitting ? 'Submitting...' : 'Submit Request'}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default RequestHelpPage;
