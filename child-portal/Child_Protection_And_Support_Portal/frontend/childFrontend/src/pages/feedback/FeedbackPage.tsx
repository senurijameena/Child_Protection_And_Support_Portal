import React, { useState, useEffect } from 'react';
import { Container, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { useNavigate, useSearchParams } from 'react-router-dom';
import feedbackService from '../../services/feedbackService';
import { caseService } from '../../services/caseService';
import { helpRequestService } from '../../services/helpRequestService';
import './FeedbackPage.css';

interface Case {
  id: string;
  trackingId?: string;
  caseType?: string;
}

interface HelpRequest {
  id: string;
  trackingId?: string;
  helpType?: string;
}

const FEEDBACK_TYPES = [
  { value: 'CASE', label: 'Case Handling' },
  { value: 'HELP_REQUEST', label: 'Help Request' },
  { value: 'SYSTEM', label: 'System' },
  { value: 'GENERAL', label: 'General' },
];

const FEEDBACK_CATEGORIES = [
  { value: 'RESPONSE_TIME', label: 'Response Time' },
  { value: 'SERVICE_QUALITY', label: 'Service Quality' },
  { value: 'COMMUNICATION', label: 'Communication' },
  { value: 'RESOLUTION', label: 'Resolution' },
  { value: 'SYSTEM_USABILITY', label: 'System Usability' },
  { value: 'OTHER', label: 'Other' },
];

const FeedbackPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const caseIdParam = searchParams.get('caseId');
  const helpRequestIdParam = searchParams.get('helpRequestId');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [feedbackType, setFeedbackType] = useState<string>('');
  const [relatedCaseId, setRelatedCaseId] = useState<string>('');
  const [relatedRequestId, setRelatedRequestId] = useState<string>('');
  const [category, setCategory] = useState<string>('');
  const [rating, setRating] = useState<number>(0);
  const [hoveredRating, setHoveredRating] = useState<number>(0);
  const [message, setMessage] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);

  const [cases, setCases] = useState<Case[]>([]);
  const [helpRequests, setHelpRequests] = useState<HelpRequest[]>([]);
  const [loadingData, setLoadingData] = useState(false);

  useEffect(() => {
    if (caseIdParam) {
      setFeedbackType('CASE');
      setRelatedCaseId(caseIdParam);
      fetchCases();
    } else if (helpRequestIdParam) {
      setFeedbackType('HELP_REQUEST');
      setRelatedRequestId(helpRequestIdParam);
      fetchHelpRequests();
    } else {
      fetchCases();
      fetchHelpRequests();
    }
  }, [caseIdParam, helpRequestIdParam]);

  const fetchCases = async () => {
    try {
      setLoadingData(true);
      const response = await caseService.getMyCases();
      const casesData = Array.isArray(response.data) ? response.data : [];
      setCases(casesData);
    } catch (err) {
      console.error('Error fetching cases:', err);
    } finally {
      setLoadingData(false);
    }
  };

  const fetchHelpRequests = async () => {
    try {
      const response = await helpRequestService.getMyRequests();
      const helpRequestsData = Array.isArray(response.data) ? response.data : [];
      setHelpRequests(helpRequestsData);
    } catch (err) {
      console.error('Error fetching help requests:', err);
    }
  };

  const handleRatingClick = (value: number) => {
    setRating(value);
  };

  const handleRatingHover = (value: number) => {
    setHoveredRating(value);
  };

  const handleRatingLeave = () => {
    setHoveredRating(0);
  };

  const handleFeedbackTypeChange = (value: string) => {
    setFeedbackType(value);
    if (value !== 'CASE') {
      setRelatedCaseId('');
    }
    if (value !== 'HELP_REQUEST') {
      setRelatedRequestId('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!feedbackType) {
      setError('Please select a feedback type.');
      return;
    }
    if (!category) {
      setError('Please select a category.');
      return;
    }
    if (rating === 0) {
      setError('Please provide a rating.');
      return;
    }
    if (!message.trim()) {
      setError('Please provide a message.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const feedbackData = {
        type: feedbackType as 'CASE' | 'HELP_REQUEST' | 'SERVICE' | 'SYSTEM' | 'GENERAL',
        category: category || undefined,
        rating: rating,
        message: message,
        anonymous: isAnonymous,
        caseId: feedbackType === 'CASE' && relatedCaseId ? relatedCaseId : undefined,
        helpRequestId: feedbackType === 'HELP_REQUEST' && relatedRequestId ? relatedRequestId : undefined,
      };

      if (feedbackType === 'CASE' && relatedCaseId) {
        feedbackData.caseId = relatedCaseId;
      } else if (feedbackType === 'HELP_REQUEST' && relatedRequestId) {
        feedbackData.helpRequestId = relatedRequestId;
      }

      await feedbackService.submitFeedback(feedbackData);
      
      setSuccess(true);
      setTimeout(() => {
        navigate('/public/dashboard');
      }, 2000);
    } catch (err: any) {
      console.error('Error submitting feedback:', err);
      setError(err.response?.data?.message || 'Failed to submit feedback. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const getDisplayRating = () => {
    return hoveredRating || rating;
  };

  if (success) {
    return (
      <Container className="feedback-page">
        <Card className="success-card">
          <Card.Body className="text-center py-5">
            <div className="success-icon mb-4">✅</div>
            <h2 className="mb-4">Feedback Submitted Successfully!</h2>
            <p className="text-muted mb-4">Thank you for your feedback. We appreciate your input!</p>
            <Button variant="primary" onClick={() => navigate('/public/dashboard')}>
              Return to Dashboard
            </Button>
          </Card.Body>
        </Card>
      </Container>
    );
  }

  return (
    <div className="feedback-page">
      <Container>
        <div className="mb-4">
          <h2 className="mb-0">⭐ SUBMIT FEEDBACK</h2>
        </div>

        {error && (
          <Alert variant="danger" dismissible onClose={() => setError(null)} className="mb-4">
            {error}
          </Alert>
        )}

        <Card>
          <Card.Body>
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-bold">Feedback For:</Form.Label>
                <Form.Select
                  value={feedbackType}
                  onChange={(e) => handleFeedbackTypeChange(e.target.value)}
                  required
                >
                  <option value="">Select...</option>
                  {FEEDBACK_TYPES.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </Form.Select>
              </Form.Group>

              {(feedbackType === 'CASE' || feedbackType === 'HELP_REQUEST') && (
                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold">
                    Related {feedbackType === 'CASE' ? 'Case' : 'Request'}:
                  </Form.Label>
                  {feedbackType === 'CASE' ? (
                    <Form.Select
                      value={relatedCaseId}
                      onChange={(e) => setRelatedCaseId(e.target.value)}
                    >
                      <option value="">Select if applicable...</option>
                      {cases.map(c => (
                        <option key={c.id} value={c.id}>
                          {c.trackingId || `CASE-${c.id.slice(0, 4).toUpperCase()}`} {c.caseType ? `- ${c.caseType.replace(/_/g, ' ')}` : ''}
                        </option>
                      ))}
                    </Form.Select>
                  ) : (
                    <Form.Select
                      value={relatedRequestId}
                      onChange={(e) => setRelatedRequestId(e.target.value)}
                    >
                      <option value="">Select if applicable...</option>
                      {helpRequests.map(hr => (
                        <option key={hr.id} value={hr.id}>
                          {hr.trackingId || `HELP-${hr.id.slice(0, 4).toUpperCase()}`}
                        </option>
                      ))}
                    </Form.Select>
                  )}
                </Form.Group>
              )}

              <Form.Group className="mb-3">
                <Form.Label className="fw-bold">Category:</Form.Label>
                <Form.Select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  required
                >
                  <option value="">Select...</option>
                  {FEEDBACK_CATEGORIES.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label className="fw-bold">Rating:</Form.Label>
                <div className="rating-container">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <span
                      key={value}
                      className={`star ${value <= getDisplayRating() ? 'filled' : ''}`}
                      onClick={() => handleRatingClick(value)}
                      onMouseEnter={() => handleRatingHover(value)}
                      onMouseLeave={handleRatingLeave}
                    >
                      ★
                    </span>
                  ))}
                  {rating > 0 && (
                    <span className="rating-text ms-2">
                      {rating} {rating === 1 ? 'star' : 'stars'}
                    </span>
                  )}
                </div>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label className="fw-bold">Message:</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Share your experience..."
                  required
                />
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Check
                  type="checkbox"
                  label="⚠️ Submit Anonymously: Hide my identity"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                />
              </Form.Group>

              <div className="d-flex gap-2 justify-content-end">
                <Button
                  variant="secondary"
                  onClick={() => navigate('/public/dashboard')}
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  type="submit"
                  disabled={submitting || loadingData}
                >
                  {submitting ? (
                    <>
                      <Spinner animation="border" size="sm" className="me-2" />
                      Submitting...
                    </>
                  ) : (
                    'Submit Feedback'
                  )}
                </Button>
              </div>
            </Form>
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
};

export default FeedbackPage;
