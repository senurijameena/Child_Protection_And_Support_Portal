import React, { useState, useEffect } from 'react';
import { Container, Card, Row, Col, Button, Spinner, Alert, Badge, Modal, Form, InputGroup } from 'react-bootstrap';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { helpRequestService } from '../../services/helpRequestService';
import { serviceOfferService } from '../../services/serviceOfferService';
import { timelineService } from '../../services/timelineService';
import { formatTrackingId, formatHelpRequestId } from '../../utils/trackingIdFormatter';
import './HelpRequestDetailsPage.css';

interface HelpRequestDetails {
  id: string;
  trackingId?: string;
  helpType?: string;
  priority?: string;
  status?: string;
  requestDate?: string;
  lastUpdated?: string;
  assignedDate?: string;
  assignedWorkerId?: string;
  assignedWorkerName?: string;
  description?: string;
  location?: string;
  approximateAge?: string;
  gender?: string;
  identificationMarks?: string;
  documentUrls?: string[];
  anonymous?: boolean;
  requesterUserId?: string;
  requesterName?: string;
  requesterEmail?: string;
  requesterPhone?: string;
  requesterAddress?: string;
  requesterContact?: string;
  requesterProfilePhoto?: string;
}

interface ServiceOffer {
  id: string;
  helpRequestId: string;
  offeredByUserId?: string;
  offeredByName?: string;
  offeredByOrganization?: string;
  offeredBySpecialization?: string;
  offeredByContact?: string;
  status?: string;
  scheduledDateTime?: string;
  serviceType?: string;
  serviceDetails?: string;
  additionalNotes?: string;
  offerDate?: string;
  validUntil?: string;
}

interface TimelineEvent {
  id: string;
  eventType: string;
  description: string;
  eventTime: string;
  performedByUserId?: string;
  performedByName?: string;
  title?: string;
  assignedFromUserId?: string;
  assignedToUserId?: string;
  targetName?: string;
  metadata?: Record<string, any>;
  transferReason?: string;
}

const HelpRequestDetailsPage: React.FC = () => {
  const { requestId } = useParams<{ requestId: string }>();
  const navigate = useNavigate();
  const [helpRequest, setHelpRequest] = useState<HelpRequestDetails | null>(null);
  const [serviceOffer, setServiceOffer] = useState<ServiceOffer | null>(null);
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [acceptConfirmationMessage, setAcceptConfirmationMessage] = useState('');
  const [sendConfirmationToWorker, setSendConfirmationToWorker] = useState(true);
  const [showAdjustmentModal, setShowAdjustmentModal] = useState(false);
  const [adjustmentType, setAdjustmentType] = useState<string>('');
  const [preferredDate, setPreferredDate] = useState('');
  const [preferredTime, setPreferredTime] = useState('');
  const [preferredLocation, setPreferredLocation] = useState('');
  const [adjustmentReason, setAdjustmentReason] = useState('');
  const [keepCurrentOffer, setKeepCurrentOffer] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState<string>('');
  const [rejectComments, setRejectComments] = useState('');

  const location = useLocation();
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [updateStatus, setUpdateStatus] = useState<string>('');
  const [updateNotes, setUpdateNotes] = useState('');

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    if (searchParams.get('action') === 'update') {
      setShowUpdateModal(true);
      // Initialize status if available
      if (helpRequest) {
        setUpdateStatus(helpRequest.status || '');
      }
    }
  }, [location.search, helpRequest]);

  useEffect(() => {
    console.log('HelpRequestDetailsPage mounted with requestId:', requestId);
    if (requestId && requestId !== 'undefined') {
      fetchHelpRequestDetails();
      fetchServiceOffer();
      fetchTimeline();
    } else {
      setError('No request ID provided in URL.');
      setLoading(false);
    }
  }, [requestId]);

  const fetchHelpRequestDetails = async () => {
    if (!requestId || requestId === 'undefined') {
      setError('Request ID is missing from URL.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      console.log('Fetching help request details for ID:', requestId);
      const response = await helpRequestService.getHelpRequest(requestId);
      console.log('Help request response:', response);
      console.log('Response data:', response?.data);

      if (response && response.data) {
        // Ensure we have at least an id
        if (!response.data.id && requestId) {
          response.data.id = requestId;
        }
        setHelpRequest(response.data);
        console.log('Help request data set successfully:', response.data);
      } else if (response && !response.data) {
        console.warn('Response received but no data:', response);
        setError('Help request data is empty. Please try again.');
      } else {
        console.error('No response received');
        setError('Help request not found. The request may have been deleted or you may not have permission to view it.');
      }
    } catch (err: any) {
      console.error('Error fetching help request details:', err);
      console.error('Error details:', {
        message: err.message,
        response: err.response,
        status: err.response?.status,
        data: err.response?.data
      });
      const errorMessage = err.response?.data?.message || err.message || 'Failed to load help request details.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const fetchServiceOffer = async () => {
    try {
      const response = await serviceOfferService.getOffersByHelpRequest(requestId!);
      const offers = Array.isArray(response.data) ? response.data : [];
      // Get the most recent or pending offer
      const pendingOffer = offers.find((o: ServiceOffer) => o.status?.toUpperCase() === 'PENDING');
      const acceptedOffer = offers.find((o: ServiceOffer) => o.status?.toUpperCase() === 'ACCEPTED');
      setServiceOffer(pendingOffer || acceptedOffer || (offers.length > 0 ? offers[0] : null));
    } catch (err) {
      console.error('Error fetching service offer:', err);
      // Not critical, so just log error
    }
  };

  const fetchTimeline = async () => {
    try {
      const response = await timelineService.getHelpRequestTimeline(requestId!);
      if (response.data) {
        setTimelineEvents(Array.isArray(response.data) ? response.data : []);
      }
    } catch (err) {
      console.error('Error fetching timeline:', err);
      // Not critical, so just log error
    }
  };

  const formatDate = (dateString?: string): string => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    } catch {
      return dateString;
    }
  };

  const formatRelativeTime = (dateString?: string): string => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffMins < 60) return `${diffMins} minutes ago`;
      if (diffHours < 24) return `${diffHours} hours ago`;
      if (diffDays === 1) return '1 day ago';
      if (diffDays < 7) return `${diffDays} days ago`;
      return formatDate(dateString);
    } catch {
      return dateString;
    }
  };

  const getHelpTypeIcon = (helpType?: string | string[]): string => {
    if (!helpType) return '📋';
    const typeStr = Array.isArray(helpType) ? helpType[0] : helpType;
    if (!typeStr) return '📋';
    const type = typeStr.toUpperCase();
    if (type.includes('FOOD')) return '🍎';
    if (type.includes('EDUCATION')) return '👨🏫';
    if (type.includes('MEDICAL')) return '🏥';
    if (type.includes('SHELTER')) return '🏠';
    if (type.includes('CLOTHING')) return '👕';
    if (type.includes('COUNSELING')) return '💬';
    return '📝';
  };

  const getHelpTypeLabel = (helpType?: string | string[]): string => {
    if (!helpType) return 'Unknown';
    const typeStr = Array.isArray(helpType) ? helpType[0] : helpType;
    if (!typeStr) return 'Unknown';
    const type = typeStr.toUpperCase();
    if (type.includes('FOOD')) return 'Food Assistance';
    if (type.includes('EDUCATION')) return 'Education Support';
    if (type.includes('MEDICAL')) return 'Medical Help';
    if (type.includes('SHELTER')) return 'Shelter';
    if (type.includes('CLOTHING')) return 'Clothing';
    if (type.includes('COUNSELING')) return 'Counseling';
    return 'Other';
  };

  const getStatusBadge = (status?: string) => {
    if (!status) return <Badge bg="secondary">Unknown</Badge>;
    const statusUpper = status.toUpperCase();
    if (statusUpper === 'IN_PROGRESS') {
      return <Badge bg="info">🔵 IN_PROGRESS</Badge>;
    }
    if (statusUpper === 'COMPLETED') {
      return <Badge bg="success">✅ COMPLETED</Badge>;
    }
    if (statusUpper === 'UNDER_REVIEW') {
      return <Badge bg="warning">🟡 UNDER_REVIEW</Badge>;
    }
    if (statusUpper === 'ASSIGNED') {
      return <Badge bg="success">🟢 ASSIGNED</Badge>;
    }
    if (statusUpper === 'REJECTED') {
      return <Badge bg="danger">🔴 REJECTED</Badge>;
    }
    return <Badge bg="secondary">{status}</Badge>;
  };

  const getPriorityBadge = (priority?: string) => {
    if (!priority) return <Badge bg="secondary">MEDIUM</Badge>;
    const priorityUpper = priority.toUpperCase();
    if (priorityUpper === 'HIGH' || priorityUpper === 'URGENT') {
      return <Badge bg="danger">🔴 URGENT</Badge>;
    }
    if (priorityUpper === 'MEDIUM') {
      return <Badge bg="warning">🟠 HIGH</Badge>;
    }
    if (priorityUpper === 'LOW') {
      return <Badge bg="success">🟢 LOW</Badge>;
    }
    return <Badge bg="secondary">{priority}</Badge>;
  };

  const getTimelineEventIcon = (eventType: string): string => {
    const type = eventType.toUpperCase();
    if (type.includes('CREATED') || type.includes('SUBMITTED')) return '🟢';
    if (type.includes('UNDER_REVIEW')) return '🟡';
    if (type.includes('ASSIGNED') && !type.includes('TRANSFER') && !type.includes('NOTIFICATION')) return '🟢';
    if (type.includes('TRANSFER')) return '🔄';
    if (type.includes('ASSIGNMENT_NOTIFICATION')) return '👩⚕️';
    if (type.includes('OFFER_RECEIVED') || type.includes('OFFER_CREATED')) return '📋';
    if (type.includes('OFFER_ACCEPTED')) return '✅';
    if (type.includes('OFFER_DECLINED') || type.includes('OFFER_REJECTED')) return '❌';
    if (type.includes('COMPLETED')) return '✅';
    if (type.includes('REJECTED') || type.includes('CANCELLED')) return '❌';
    return '🔵';
  };

  const handleAcceptOffer = () => {
    setShowAcceptModal(true);
  };

  const handleConfirmAcceptance = async () => {
    if (!serviceOffer) return;
    try {
      await serviceOfferService.respondToOffer({
        offerId: serviceOffer.id,
        accepted: true,
        responseMessage: acceptConfirmationMessage || undefined
      });
      setShowAcceptModal(false);
      setAcceptConfirmationMessage('');
      setSendConfirmationToWorker(true);
      alert('Offer accepted successfully!');
      fetchServiceOffer();
      fetchTimeline();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to accept offer.');
    }
  };

  const handleRejectOffer = () => {
    setShowRejectModal(true);
  };

  const handleConfirmRejection = async () => {
    if (!serviceOffer || !rejectReason) {
      alert('Please select a reason for rejection.');
      return;
    }
    if (!window.confirm('Are you sure you want to reject this offer? This will cancel the help request and close it.')) return;

    try {
      await serviceOfferService.respondToOffer({
        offerId: serviceOffer.id,
        accepted: false,
        responseMessage: rejectComments || rejectReason
      });
      setShowRejectModal(false);
      setRejectReason('');
      setRejectComments('');
      alert('Offer rejected. The help request has been closed.');
      fetchServiceOffer();
      fetchTimeline();
      // Optionally refresh the help request details
      fetchHelpRequestDetails();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to reject offer.');
    }
  };

  const handleUpdateRequest = async () => {
    if (!requestId) return;
    try {
      if (updateStatus && updateStatus !== helpRequest?.status) {
        // @ts-ignore - updateStatus is dynamically added
        await helpRequestService.updateStatus(requestId, updateStatus);
      }
      if (updateNotes) {
        // @ts-ignore - updateNotes is dynamically added
        await helpRequestService.updateNotes(requestId, updateNotes);
      }
      setShowUpdateModal(false);
      setUpdateNotes('');
      fetchHelpRequestDetails();
      fetchTimeline();
      // Clear query param
      navigate(`/help-requests/${requestId}`, { replace: true });
      alert('Request updated successfully');
    } catch (err: any) {
      console.error('Update error:', err);
      alert('Failed to update request: ' + (err.response?.data?.message || err.message));
    }
  };

  const formatScheduledDateTime = (dateTimeString?: string): { date: string; time: string } | null => {
    if (!dateTimeString) return null;
    try {
      const date = new Date(dateTimeString);
      return {
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        time: date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
      };
    } catch {
      return { date: dateTimeString, time: '' };
    }
  };

  if (loading) {
    return (
      <div className="help-request-details-container text-center py-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p className="mt-3">Loading help request details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="help-request-details-container py-5">
        <Alert variant="danger" className="text-center">
          <Alert.Heading>Error Loading Help Request</Alert.Heading>
          <p>{error}</p>
          {requestId && (
            <p className="small text-muted mt-2">Request ID: {requestId}</p>
          )}
        </Alert>
        <div className="text-center mt-3">
          <Button variant="primary" onClick={() => navigate('/help-requests/my-requests')} className="me-2">
            ← Back to My Requests
          </Button>
          {requestId && (
            <Button variant="outline-primary" onClick={() => {
              setError(null);
              setLoading(true);
              fetchHelpRequestDetails();
            }}>
              🔄 Retry
            </Button>
          )}
        </div>
      </div>
    );
  }

  if (!helpRequest) {
    return (
      <div className="help-request-details-container py-5">
        <Alert variant="info" className="text-center">No help request details available.</Alert>
        <div className="text-center">
          <Button variant="primary" onClick={() => navigate('/help-requests/my-requests')}>
            ← Back to My Requests
          </Button>
        </div>
      </div>
    );
  }

  const requestedDateTime = helpRequest.requestDate ? new Date(helpRequest.requestDate) : null;
  const assignedDateTime = helpRequest.assignedDate ? new Date(helpRequest.assignedDate) : null;
  const scheduledDateTime = serviceOffer?.scheduledDateTime ? formatScheduledDateTime(serviceOffer.scheduledDateTime) : null;
  const offerStatus = serviceOffer?.status?.toUpperCase();
  const isPendingOffer = offerStatus === 'PENDING';

  return (
    <div className="help-request-details-container">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="help-request-details-title">
          ❤️ HELP REQUEST: {formatTrackingId(
            helpRequest.trackingId,
            helpRequest.anonymous,
            'HELP'
          ) || formatHelpRequestId(helpRequest.id, helpRequest.anonymous)}
        </h2>
        <Button variant="outline-secondary" onClick={() => navigate('/help-requests/my-requests')}>
          ← Back to My Requests
        </Button>
      </div>

      {/* Request Header */}
      <Card className="request-header-card mb-4">
        <Card.Body>
          <Row className="g-3">
            <Col md={6} lg={3}>
              <div className="detail-item">
                <span className="detail-label">Type:</span>
                <span className="detail-value">{getHelpTypeIcon(helpRequest.helpType || (helpRequest as any).helpTypes)} {getHelpTypeLabel(helpRequest.helpType || (helpRequest as any).helpTypes)}</span>
              </div>
            </Col>
            <Col md={6} lg={3}>
              <div className="detail-item">
                <span className="detail-label">Priority:</span>
                <span className="detail-value">{getPriorityBadge(helpRequest.priority)}</span>
              </div>
            </Col>
            <Col md={6} lg={3}>
              <div className="detail-item">
                <span className="detail-label">Status:</span>
                <span className="detail-value">{getStatusBadge(helpRequest.status)}</span>
              </div>
            </Col>
            <Col md={6} lg={3}>
              <div className="detail-item">
                <span className="detail-label">Tracking ID:</span>
                <span className="detail-value">{formatTrackingId(
                  helpRequest.trackingId,
                  helpRequest.anonymous,
                  'HELP'
                ) || formatHelpRequestId(helpRequest.id, helpRequest.anonymous)}</span>
              </div>
            </Col>
            <Col md={6} lg={3}>
              <div className="detail-item">
                <span className="detail-label">Requested:</span>
                <span className="detail-value">{requestedDateTime ? formatDate(requestedDateTime.toISOString()) : 'N/A'}</span>
              </div>
            </Col>
            {assignedDateTime && (
              <Col md={6} lg={3}>
                <div className="detail-item">
                  <span className="detail-label">Assigned:</span>
                  <span className="detail-value">{formatRelativeTime(assignedDateTime.toISOString())}</span>
                </div>
              </Col>
            )}
          </Row>
        </Card.Body>
      </Card>

      <Row className="mb-4">
        {/* Child Details */}
        <Col md={6} className="mb-4 mb-md-0">
          <Card className="h-100">
            <Card.Header>
              <h5 className="mb-0">👤 CHILD DETAILS</h5>
            </Card.Header>
            <Card.Body>
              <p><strong>Age:</strong> {helpRequest.approximateAge || (helpRequest as any).peopleDetails?.ages || 'N/A'}</p>
              <p><strong>Gender:</strong> {helpRequest.gender || (helpRequest as any).peopleDetails?.gender || 'N/A'}</p>
              {(helpRequest.identificationMarks || (helpRequest as any).peopleDetails?.identificationMarks) && (
                <p><strong>Medical Condition:</strong> {helpRequest.identificationMarks || (helpRequest as any).peopleDetails?.identificationMarks}</p>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* Request Information */}
        <Col md={6}>
          <Card className="h-100">
            <Card.Header>
              <h5 className="mb-0">📍 REQUEST INFORMATION</h5>
            </Card.Header>
            <Card.Body>
              <p><strong>Location:</strong> {typeof helpRequest.location === 'string' ? helpRequest.location : ((helpRequest.location as any)?.address || 'N/A')}</p>
              <p><strong>Description:</strong> {helpRequest.description || 'N/A'}</p>
              {helpRequest.documentUrls && helpRequest.documentUrls.length > 0 && (
                <div className="mt-3">
                  <strong>Documents:</strong>
                  <ul className="mt-2">
                    {helpRequest.documentUrls.map((url, index) => (
                      <li key={index}>
                        <a href={url} target="_blank" rel="noopener noreferrer">Document {index + 1}</a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Requester Details (Non-Anonymous Only) */}
      {!helpRequest.anonymous && (
        <Card className="mb-4">
          <Card.Header>
            <h5 className="mb-0">👤 REQUESTER DETAILS</h5>
          </Card.Header>
          <Card.Body>
            <Row>
              <Col md={6}>
                <div className="mb-3">
                  <p className="mb-1"><strong>Name:</strong> {helpRequest.requesterName || 'N/A'}</p>
                  <p className="mb-1"><strong>Address:</strong> {helpRequest.requesterAddress || 'N/A'}</p>
                  <p className="mb-1"><strong>User ID:</strong> {helpRequest.requesterUserId || 'N/A'}</p>
                </div>
              </Col>
              <Col md={6}>
                <div className="mb-3">
                  <p className="mb-1"><strong>Phone:</strong> {helpRequest.requesterPhone || helpRequest.requesterContact || 'N/A'}</p>
                  <p className="mb-1"><strong>Email:</strong> {helpRequest.requesterEmail || 'N/A'}</p>
                  {helpRequest.requesterProfilePhoto && (
                    <div className="mt-2">
                      <img
                        src={helpRequest.requesterProfilePhoto}
                        alt="Profile"
                        style={{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover' }}
                      />
                    </div>
                  )}
                </div>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      )}

      {/* Service Offer Details */}
      {serviceOffer && (
        <Card className="mb-4 service-offer-card">
          <Card.Header>
            <h5 className="mb-0">👩⚕️ SERVICE OFFER DETAILS (One Offer Per Request)</h5>
          </Card.Header>
          <Card.Body>
            <div className="mb-3">
              <p className="mb-1"><strong>FROM:</strong> {serviceOffer.offeredByName || 'Unknown Worker'}</p>
              {serviceOffer.offeredByOrganization && (
                <p className="mb-1"><strong>Organization:</strong> {serviceOffer.offeredByOrganization}</p>
              )}
              {serviceOffer.offeredBySpecialization && (
                <p className="mb-1"><strong>Specialization:</strong> {serviceOffer.offeredBySpecialization}</p>
              )}
              {serviceOffer.offeredByContact && (
                <p className="mb-1"><strong>Contact:</strong> {serviceOffer.offeredByContact}</p>
              )}
            </div>

            <div className="mb-3 border-top pt-3">
              <h6 className="mb-2">📋 OFFER DETAILS:</h6>
              <p className="mb-1"><strong>Service Type:</strong> {serviceOffer.serviceType || getHelpTypeLabel(helpRequest.helpType)}</p>
              {scheduledDateTime && (
                <>
                  <p className="mb-1"><strong>Proposed Date:</strong> {scheduledDateTime.date}</p>
                  <p className="mb-1"><strong>Time:</strong> {scheduledDateTime.time}</p>
                </>
              )}
              {serviceOffer.serviceDetails && (
                <p className="mb-1"><strong>Location:</strong> {serviceOffer.serviceDetails}</p>
              )}
            </div>

            {serviceOffer.additionalNotes && (
              <div className="mb-3 border-top pt-3">
                <h6 className="mb-2">📝 ADDITIONAL NOTES:</h6>
                <div style={{ whiteSpace: 'pre-wrap' }}>{serviceOffer.additionalNotes}</div>
              </div>
            )}

            {serviceOffer.validUntil && (
              <div className="mb-3 border-top pt-3">
                <p className="mb-0"><strong>⏰ OFFER VALID UNTIL:</strong> {formatDate(serviceOffer.validUntil)}</p>
              </div>
            )}

            <div className="mb-3 border-top pt-3">
              <p className="mb-1"><strong>OFFER STATUS:</strong></p>
              {isPendingOffer ? (
                <Badge bg="warning">📋 PENDING YOUR RESPONSE</Badge>
              ) : offerStatus === 'ACCEPTED' ? (
                <Badge bg="success">✅ ACCEPTED</Badge>
              ) : offerStatus === 'REJECTED' ? (
                <Badge bg="danger">❌ REJECTED</Badge>
              ) : (
                <Badge bg="info">{serviceOffer.status}</Badge>
              )}
              {isPendingOffer && (
                <p className="mt-2 text-muted small">(Response required within 24 hours)</p>
              )}
            </div>

            {/* Response Actions */}
            {isPendingOffer && (
              <div className="border-top pt-3">
                <h6 className="mb-3">RESPONSE ACTIONS:</h6>
                <div className="d-flex gap-2 flex-wrap">
                  <Button variant="success" onClick={handleAcceptOffer}>
                    ✅ ACCEPT OFFER
                  </Button>
                  <Button variant="outline-warning" onClick={() => navigate(`/help-requests/${requestId}/request-adjustment`)}>
                    ✏️ REQUEST ADJUSTMENT
                  </Button>
                  <Button variant="outline-info" onClick={() => navigate(`/help-requests/${requestId}/propose-time`)}>
                    📅 PROPOSE NEW TIME
                  </Button>
                  <Button variant="danger" onClick={handleRejectOffer}>
                    ❌ REJECT OFFER
                  </Button>
                </div>
              </div>
            )}
          </Card.Body>
        </Card>
      )}

      {/* Request Timeline */}
      <Card className="mb-4">
        <Card.Header>
          <h5 className="mb-0">📈 REQUEST TIMELINE:</h5>
        </Card.Header>
        <Card.Body>
          {timelineEvents.length > 0 ? (
            <div className="timeline">
              {timelineEvents.map((event) => (
                <div key={event.id} className="timeline-item">
                  <div className="timeline-dot">{getTimelineEventIcon(event.eventType)}</div>
                  <div className="timeline-content">
                    <div className="timeline-date">{formatDate(event.eventTime)}</div>
                    <div className="timeline-title">{event.title || event.eventType.replace(/_/g, ' ')}</div>
                    <div className="timeline-description">
                      {event.eventType.toUpperCase().includes('TRANSFERRED') && event.assignedFromUserId && event.targetName ? (
                        <>
                          Request transferred from {event.performedByName || 'Social Worker'} to {event.targetName}
                          {event.transferReason && (
                            <>
                              <br />
                              <strong>Reason:</strong> {event.transferReason}
                            </>
                          )}
                        </>
                      ) : event.eventType.toUpperCase().includes('ASSIGNMENT_NOTIFICATION') && event.targetName ? (
                        <>
                          {event.targetName} accepted the request
                        </>
                      ) : (
                        event.description
                      )}
                    </div>
                    {event.performedByName && !event.eventType.toUpperCase().includes('TRANSFERRED') && (
                      <small className="text-muted">By: {event.performedByName}</small>
                    )}
                    {event.eventType.toUpperCase().includes('OFFER') && serviceOffer && (
                      <Button
                        variant="link"
                        size="sm"
                        className="p-0 mt-1"
                        onClick={() => {
                          const offerSection = document.querySelector('.service-offer-card');
                          offerSection?.scrollIntoView({ behavior: 'smooth' });
                        }}
                      >
                        👁️ View Offer Details
                      </Button>
                    )}
                  </div>
                </div>
              ))}
              {isPendingOffer && (
                <div className="timeline-item pending-item">
                  <div className="timeline-dot">⏳</div>
                  <div className="timeline-content">
                    <div className="timeline-date">Pending</div>
                    <div className="timeline-title">Your Response to Service Offer</div>
                    <div className="timeline-description">Please accept or request adjustment</div>
                    {serviceOffer?.validUntil && (
                      <small className="text-muted">
                        (Expires in: {Math.ceil((new Date(serviceOffer.validUntil).getTime() - Date.now()) / (1000 * 60 * 60))} hours)
                      </small>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="timeline">
              <div className="timeline-item">
                <div className="timeline-dot">🟢</div>
                <div className="timeline-content">
                  <div className="timeline-date">{requestedDateTime ? formatDate(requestedDateTime.toISOString()) : 'N/A'}</div>
                  <div className="timeline-title">HELP_REQUEST_CREATED</div>
                  <div className="timeline-description">Request submitted by {helpRequest.anonymous ? 'an anonymous user' : 'you'}</div>
                </div>
              </div>
              {helpRequest.status === 'UNDER_REVIEW' && (
                <div className="timeline-item">
                  <div className="timeline-dot">🟡</div>
                  <div className="timeline-content">
                    <div className="timeline-date">{formatRelativeTime(helpRequest.lastUpdated)}</div>
                    <div className="timeline-title">HELP_REQUEST_UNDER_REVIEW</div>
                    <div className="timeline-description">Request under review</div>
                  </div>
                </div>
              )}
              {helpRequest.assignedWorkerId && (
                <div className="timeline-item">
                  <div className="timeline-dot">🟢</div>
                  <div className="timeline-content">
                    <div className="timeline-date">{assignedDateTime ? formatDate(assignedDateTime.toISOString()) : 'N/A'}</div>
                    <div className="timeline-title">HELP_REQUEST_ASSIGNED</div>
                    <div className="timeline-description">Assigned to {helpRequest.assignedWorkerName || 'Social Worker'}</div>
                  </div>
                </div>
              )}
              {serviceOffer && (
                <div className="timeline-item">
                  <div className="timeline-dot">📋</div>
                  <div className="timeline-content">
                    <div className="timeline-date">{serviceOffer.offerDate ? formatDate(serviceOffer.offerDate) : 'N/A'}</div>
                    <div className="timeline-title">SERVICE_OFFER_RECEIVED</div>
                    <div className="timeline-description">{serviceOffer.offeredByName || 'Social Worker'} sent service offer</div>
                    <Button
                      variant="link"
                      size="sm"
                      className="p-0 mt-1"
                      onClick={() => {
                        const offerSection = document.querySelector('.service-offer-card');
                        offerSection?.scrollIntoView({ behavior: 'smooth' });
                      }}
                    >
                      👁️ View Offer Details
                    </Button>
                  </div>
                </div>
              )}
              {isPendingOffer && (
                <div className="timeline-item pending-item">
                  <div className="timeline-dot">⏳</div>
                  <div className="timeline-content">
                    <div className="timeline-date">Pending</div>
                    <div className="timeline-title">Your Response to Service Offer</div>
                    <div className="timeline-description">Please accept or request adjustment</div>
                    {serviceOffer?.validUntil && (
                      <small className="text-muted">
                        (Expires in: {Math.ceil((new Date(serviceOffer.validUntil).getTime() - Date.now()) / (1000 * 60 * 60))} hours)
                      </small>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Accept Offer Modal */}
      <Modal show={showAcceptModal} onHide={() => {
        setShowAcceptModal(false);
        setAcceptConfirmationMessage('');
        setSendConfirmationToWorker(true);
      }} centered>
        <Modal.Header closeButton>
          <Modal.Title>✅ ACCEPT SERVICE OFFER</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {serviceOffer && (
            <>
              <div className="mb-3">
                <p className="mb-2">You are accepting the service offer from:</p>
                <p className="fw-bold mb-3">{serviceOffer.offeredByName || 'Unknown Worker'}</p>

                <div className="border rounded p-3 mb-3 bg-light">
                  <p className="mb-1"><strong>Service:</strong> {serviceOffer.serviceType || getHelpTypeLabel(helpRequest.helpType)}</p>
                  {scheduledDateTime && (
                    <>
                      <p className="mb-1"><strong>Date:</strong> {scheduledDateTime.date}</p>
                      <p className="mb-1"><strong>Time:</strong> {scheduledDateTime.time}</p>
                    </>
                  )}
                  {serviceOffer.serviceDetails && (
                    <p className="mb-0"><strong>Location:</strong> {serviceOffer.serviceDetails}</p>
                  )}
                </div>
              </div>

              <Form.Group className="mb-3">
                <Form.Label>Confirmation Message (Optional):</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={acceptConfirmationMessage}
                  onChange={(e) => setAcceptConfirmationMessage(e.target.value)}
                  placeholder="Add any additional message or notes..."
                />
              </Form.Group>

              <Form.Group className="mb-0">
                <Form.Check
                  type="checkbox"
                  label="Send confirmation message to worker"
                  checked={sendConfirmationToWorker}
                  onChange={(e) => setSendConfirmationToWorker(e.target.checked)}
                />
              </Form.Group>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => {
            setShowAcceptModal(false);
            setAcceptConfirmationMessage('');
            setSendConfirmationToWorker(true);
          }}>
            Cancel
          </Button>
          <Button variant="success" onClick={handleConfirmAcceptance}>
            Confirm Acceptance
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Reject Offer Modal */}
      <Modal show={showRejectModal} onHide={() => {
        setShowRejectModal(false);
        setRejectReason('');
        setRejectComments('');
      }} centered>
        <Modal.Header closeButton>
          <Modal.Title>❌ REJECT SERVICE OFFER</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="mb-3">
            <p className="mb-3">Please provide reason for rejection:</p>

            <Form.Group className="mb-3">
              <Form.Label className="fw-bold">Reason:</Form.Label>
              <div>
                <Form.Check
                  type="radio"
                  label="Timing not suitable"
                  name="rejectReason"
                  value="TIMING"
                  checked={rejectReason === 'TIMING'}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="mb-2"
                />
                <Form.Check
                  type="radio"
                  label="Location not convenient"
                  name="rejectReason"
                  value="LOCATION"
                  checked={rejectReason === 'LOCATION'}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="mb-2"
                />
                <Form.Check
                  type="radio"
                  label="Service doesn't match needs"
                  name="rejectReason"
                  value="SERVICE_MISMATCH"
                  checked={rejectReason === 'SERVICE_MISMATCH'}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="mb-2"
                />
                <Form.Check
                  type="radio"
                  label="Found alternative help"
                  name="rejectReason"
                  value="ALTERNATIVE"
                  checked={rejectReason === 'ALTERNATIVE'}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="mb-2"
                />
                <Form.Check
                  type="radio"
                  label="Other"
                  name="rejectReason"
                  value="OTHER"
                  checked={rejectReason === 'OTHER'}
                  onChange={(e) => setRejectReason(e.target.value)}
                />
              </div>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Additional Comments (optional):</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={rejectComments}
                onChange={(e) => setRejectComments(e.target.value)}
                placeholder="Add any additional comments..."
              />
            </Form.Group>

            <Alert variant="warning" className="mb-0">
              <strong>⚠️ Note:</strong> Rejecting will cancel this help request and it will be closed.
            </Alert>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => {
            setShowRejectModal(false);
            setRejectReason('');
            setRejectComments('');
          }}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleConfirmRejection}>
            Confirm Rejection
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Update Request Modal */}
      <Modal show={showUpdateModal} onHide={() => {
        setShowUpdateModal(false);
        setUpdateNotes('');
      }} centered>
        <Modal.Header closeButton>
          <Modal.Title>✏️ UPDATE HELP REQUEST</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Status:</Form.Label>
            <Form.Select
              value={updateStatus}
              onChange={(e) => setUpdateStatus(e.target.value)}
            >
              <option value="ASSIGNED">ASSIGNED</option>
              <option value="IN_PROGRESS">IN_PROGRESS</option>
              <option value="COMPLETED">COMPLETED</option>
              <option value="CANCELLED">CANCELLED</option>
            </Form.Select>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Add Notes:</Form.Label>
            <Form.Control
              as="textarea"
              rows={4}
              value={updateNotes}
              onChange={(e) => setUpdateNotes(e.target.value)}
              placeholder="Enter progress notes or updates..."
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => {
            setShowUpdateModal(false);
            setUpdateNotes('');
          }}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleUpdateRequest}>
            Update Request
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default HelpRequestDetailsPage;
