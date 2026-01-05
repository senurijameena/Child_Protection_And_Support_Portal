import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Card, 
  Button, 
  Row, 
  Col, 
  Badge,
  Alert,
  Spinner
} from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import { caseService } from '../../services/caseService';
import { timelineService } from '../../services/timelineService';
import { formatTrackingId, formatCaseId } from '../../utils/trackingIdFormatter';
import './CaseDetailsPage.css';

interface Case {
  id: string;
  trackingId?: string;
  caseType?: string;
  status?: string;
  priority?: string;
  emergency?: boolean;
  reportDate?: string;
  lastUpdated?: string;
  resolutionDate?: string;
  assignedOfficerId?: string;
  assignedOfficerName?: string;
  assignedOfficerBadge?: string;
  assignedOfficerDepartment?: string;
  assignedOfficerContact?: string;
  childDetails?: {
    ageRange?: string;
    gender?: string;
    identificationMarks?: string;
  };
  caseDetails?: {
    location?: string;
    incidentDate?: string;
    description?: string;
  };
  evidence?: Array<{ url: string; type?: string }>;
  evidenceUrls?: string[];
  caseNotes?: string;
  anonymous?: boolean;
  isAnonymous?: boolean;
  reporterInfo?: {
    isAnonymous?: boolean;
  };
}

interface TimelineEvent {
  id: string;
  eventType?: string;
  description?: string;
  eventTime?: string;
  performedByName?: string;
  performedByUserId?: string;
  assignedFromUserId?: string;
  assignedToUserId?: string;
  targetName?: string;
  metadata?: Record<string, string>;
  details?: string;
}

const CaseDetailsPage: React.FC = () => {
  const navigate = useNavigate();
  const { caseId } = useParams<{ caseId: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [caseData, setCaseData] = useState<Case | null>(null);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);

  useEffect(() => {
    if (caseId) {
      fetchCaseDetails();
      fetchTimeline();
    }
  }, [caseId]);

  // Scroll to timeline if hash is present in URL
  useEffect(() => {
    if (window.location.hash === '#timeline') {
      setTimeout(() => {
        const timelineElement = document.getElementById('case-timeline');
        if (timelineElement) {
          timelineElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 500);
    }
  }, [caseData, timeline]);

  const fetchCaseDetails = async () => {
    if (!caseId) return;
    try {
      setLoading(true);
      setError(null);
      const response = await caseService.getCaseById(caseId);
      if (response.data) {
        setCaseData(response.data);
      } else {
        setError('Case not found');
      }
    } catch (err: any) {
      console.error('Error fetching case details:', err);
      setError('Failed to load case details. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const fetchTimeline = async () => {
    if (!caseId) return;
    try {
      const response = await timelineService.getCaseTimeline(caseId);
      const timelineData = Array.isArray(response.data) ? response.data : [];
      setTimeline(timelineData);
    } catch (err) {
      console.error('Error fetching timeline:', err);
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

  const formatTimeAgo = (dateString?: string): string => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffMins < 60) return `${diffMins} ${diffMins === 1 ? 'minute' : 'minutes'} ago`;
      if (diffHours < 24) return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
      if (diffDays === 1) return 'Yesterday';
      if (diffDays < 7) return `${diffDays} days ago`;
      return formatDate(dateString);
    } catch {
      return dateString;
    }
  };

  const formatTimelineTime = (dateString?: string): string => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffMins < 60) {
        return `Today, ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`;
      }
      if (diffHours < 24) {
        return `Today, ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`;
      }
      if (diffDays === 1) {
        return `Yesterday, ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`;
      }
      return formatDate(dateString);
    } catch {
      return dateString;
    }
  };

  const getCaseTypeIcon = (caseType?: string): string => {
    if (!caseType) return '📄';
    const type = caseType.toUpperCase();
    if (type.includes('MISSING')) return '👶';
    if (type.includes('ABUSE')) return '🩸';
    if (type.includes('LABOR')) return '🏭';
    if (type.includes('TRAFFICKING')) return '🚫';
    return '📝';
  };

  const getCaseTypeLabel = (caseType?: string): string => {
    if (!caseType) return 'Unknown';
    const type = caseType.toUpperCase();
    if (type.includes('MISSING')) return 'Missing Child';
    if (type.includes('ABUSE')) return 'Child Abuse';
    if (type.includes('LABOR')) return 'Child Labor';
    if (type.includes('TRAFFICKING')) return 'Child Trafficking';
    return 'Other';
  };

  const getStatusBadge = (status?: string) => {
    if (!status) return <Badge bg="secondary">Unknown</Badge>;
    const statusUpper = status.toUpperCase();
    if (statusUpper === 'INVESTIGATING') {
      return <Badge bg="info">🔵 INVESTIGATING</Badge>;
    }
    if (statusUpper === 'RESOLVED' || statusUpper === 'CLOSED') {
      return <Badge bg="success">✅ RESOLVED</Badge>;
    }
    if (statusUpper === 'UNDER_REVIEW') {
      return <Badge bg="warning">🟡 UNDER_REVIEW</Badge>;
    }
    if (statusUpper === 'ASSIGNED') {
      return <Badge bg="warning">🟡 ASSIGNED</Badge>;
    }
    if (statusUpper === 'REPORTED') {
      return <Badge bg="primary">🟢 REPORTED</Badge>;
    }
    return <Badge bg="secondary">{status}</Badge>;
  };

  const getPriorityBadge = (priority?: string, emergency?: boolean) => {
    if (emergency) {
      return <Badge bg="danger">🔴 URGENT</Badge>;
    }
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

  const getEventIcon = (eventType?: string): string => {
    if (!eventType) return '📌';
    const type = eventType.toUpperCase();
    if (type.includes('REPORTED') || type.includes('CREATED')) return '🟢';
    if (type.includes('REVIEW')) return '🟡';
    if (type.includes('ASSIGNED') && !type.includes('NOTIFICATION')) return '🔵';
    if (type.includes('TRANSFERRED')) return '🔄';
    if (type.includes('INVESTIGATING')) return '🔄';
    if (type.includes('RESOLVED') || type.includes('COMPLETED')) return '✅';
    if (type.includes('PENDING')) return '⏳';
    if (type.includes('NOTIFICATION')) return '🔔';
    if (type.includes('ASSIGNMENT_NOTIFICATION')) return '👮';
    return '📌';
  };

  const getEventLabel = (eventType?: string): string => {
    if (!eventType) return 'Event';
    const type = eventType.toUpperCase();
    if (type.includes('CASE_REPORTED') || type.includes('CREATED')) return 'CASE_REPORTED';
    if (type.includes('UNDER_REVIEW')) return 'CASE_UNDER_REVIEW';
    if (type.includes('CASE_TRANSFERRED') || type.includes('TRANSFER')) return 'CASE_TRANSFERRED';
    if (type.includes('ASSIGNMENT_NOTIFICATION')) return 'ASSIGNMENT_NOTIFICATION';
    if (type.includes('ASSIGNED') && !type.includes('NOTIFICATION')) return 'CASE_ASSIGNED';
    if (type.includes('INVESTIGATING')) return 'CASE_INVESTIGATING';
    if (type.includes('RESOLVED')) return 'CASE_RESOLVED';
    return eventType.replace(/_/g, ' ');
  };

  const getFileIcon = (url: string): string => {
    const ext = url.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif'].includes(ext || '')) return '📸';
    if (ext === 'pdf') return '📄';
    return '📎';
  };

  const getFileName = (url: string): string => {
    const parts = url.split('/');
    return parts[parts.length - 1] || 'file';
  };

  const evidenceFiles = caseData?.evidence || caseData?.evidenceUrls?.map(url => ({ url })) || [];

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  if (error || !caseData) {
    return (
      <Container>
        <Alert variant="danger">
          {error || 'Case not found'}
        </Alert>
        <Button variant="outline-primary" onClick={() => navigate('/cases/my-cases')}>
          ← Back to My Cases
        </Button>
      </Container>
    );
  }

  return (
    <div className="case-details-page">
      <Container>
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="mb-0">
            📋 CASE DETAILS: {formatTrackingId(
              caseData.trackingId,
              caseData.anonymous || caseData.isAnonymous || caseData.reporterInfo?.isAnonymous,
              'CASE'
            ) || formatCaseId(caseData.id, caseData.anonymous || caseData.isAnonymous || caseData.reporterInfo?.isAnonymous)}
          </h2>
          <Button variant="outline-primary" onClick={() => navigate('/cases/my-cases')}>
            ← Back to My Cases
          </Button>
        </div>

        {/* Case Header */}
        <Card className="mb-4">
          <Card.Body>
            <Row>
              <Col md={6}>
                <div className="mb-2">
                  <strong>Case Type:</strong> {getCaseTypeIcon(caseData.caseType)} {getCaseTypeLabel(caseData.caseType)}
                </div>
                <div className="mb-2">
                  <strong>Priority:</strong> {getPriorityBadge(caseData.priority, caseData.emergency)}
                  {caseData.lastUpdated && (
                    <span className="text-muted ms-2">(Updated {formatTimeAgo(caseData.lastUpdated)})</span>
                  )}
                </div>
                <div className="mb-2">
                  <strong>Status:</strong> {getStatusBadge(caseData.status)}
                </div>
              </Col>
              <Col md={6}>
                <div className="mb-2">
                  <strong>Tracking ID:</strong> {formatTrackingId(
                    caseData.trackingId,
                    caseData.anonymous || caseData.isAnonymous || caseData.reporterInfo?.isAnonymous,
                    'CASE'
                  ) || formatCaseId(caseData.id, caseData.anonymous || caseData.isAnonymous || caseData.reporterInfo?.isAnonymous)}
                </div>
                <div className="mb-2">
                  <strong>Reported:</strong> {formatDate(caseData.reportDate)}
                </div>
                {caseData.lastUpdated && (
                  <div className="mb-2">
                    <strong>Last Updated:</strong> {formatTimeAgo(caseData.lastUpdated)}
                  </div>
                )}
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* Child Details and Incident Information */}
        <Row className="mb-4">
          <Col md={6} className="mb-3">
            <Card>
              <Card.Header>
                <h5 className="mb-0">👤 CHILD DETAILS</h5>
              </Card.Header>
              <Card.Body>
                <div className="mb-2">
                  <strong>Age:</strong> {caseData.childDetails?.ageRange || 'N/A'}
                </div>
                <div className="mb-2">
                  <strong>Gender:</strong> {caseData.childDetails?.gender || 'N/A'}
                </div>
                {caseData.childDetails?.identificationMarks && (
                  <div className="mb-2">
                    <strong>Identification:</strong> {caseData.childDetails.identificationMarks}
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
          <Col md={6} className="mb-3">
            <Card>
              <Card.Header>
                <h5 className="mb-0">📍 INCIDENT INFORMATION</h5>
              </Card.Header>
              <Card.Body>
                <div className="mb-2">
                  <strong>Location:</strong> {caseData.caseDetails?.location || 'N/A'}
                </div>
                {caseData.caseDetails?.incidentDate && (
                  <>
                    <div className="mb-2">
                      <strong>Date:</strong> {formatDate(caseData.caseDetails.incidentDate).split(',')[0]}
                    </div>
                    <div className="mb-2">
                      <strong>Time:</strong> {new Date(caseData.caseDetails.incidentDate).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                    </div>
                  </>
                )}
                {caseData.caseDetails?.description && (
                  <div className="mb-2">
                    <strong>Description:</strong>
                    <div className="mt-1 text-muted small">
                      {caseData.caseDetails.description}
                    </div>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Assigned Officer and Evidence */}
        <Row className="mb-4">
          <Col md={6} className="mb-3">
            <Card>
              <Card.Header>
                <h5 className="mb-0">👮 ASSIGNED OFFICER</h5>
              </Card.Header>
              <Card.Body>
                {caseData.assignedOfficerId ? (
                  <>
                    <div className="mb-2">
                      <strong>Officer {caseData.assignedOfficerName || caseData.assignedOfficerId.slice(0, 8)}</strong>
                    </div>
                    {caseData.assignedOfficerBadge && (
                      <div className="mb-2">
                        <strong>Badge:</strong> #{caseData.assignedOfficerBadge}
                      </div>
                    )}
                    {caseData.assignedOfficerDepartment && (
                      <div className="mb-2">
                        <strong>Department:</strong> {caseData.assignedOfficerDepartment}
                      </div>
                    )}
                    {caseData.assignedOfficerContact && (
                      <div className="mb-3">
                        <strong>Contact:</strong> {caseData.assignedOfficerContact}
                      </div>
                    )}
                    <div className="d-flex gap-2">
                      <Button
                        variant="outline-success"
                        size="sm"
                        onClick={() => navigate(`/messages?caseId=${caseData.id}`)}
                      >
                        💬 Send Message
                      </Button>
                      {caseData.assignedOfficerContact && (
                        <Button
                          variant="outline-primary"
                          size="sm"
                          onClick={() => window.location.href = `tel:${caseData.assignedOfficerContact}`}
                        >
                          📞 Call
                        </Button>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="text-muted">No officer assigned yet</div>
                )}
              </Card.Body>
            </Card>
          </Col>
          <Col md={6} className="mb-3">
            <Card>
              <Card.Header>
                <h5 className="mb-0">🖼️ EVIDENCE ({evidenceFiles.length} {evidenceFiles.length === 1 ? 'file' : 'files'})</h5>
              </Card.Header>
              <Card.Body>
                {evidenceFiles.length > 0 ? (
                  <>
                    {evidenceFiles.map((file, index) => (
                      <div key={index} className="mb-3 p-2 border rounded">
                        <div className="d-flex justify-content-between align-items-center">
                          <div className="d-flex align-items-center">
                            <span className="me-2" style={{ fontSize: '1.5rem' }}>
                              {getFileIcon(file.url)}
                            </span>
                            <div>
                              <div className="fw-bold small">{getFileName(file.url)}</div>
                            </div>
                          </div>
                          <div className="d-flex gap-2">
                            <Button
                              variant="link"
                              size="sm"
                              onClick={() => window.open(file.url, '_blank')}
                              className="p-0"
                            >
                              👁️ View
                            </Button>
                            <Button
                              variant="link"
                              size="sm"
                              onClick={() => {
                                const link = document.createElement('a');
                                link.href = file.url;
                                link.download = getFileName(file.url);
                                link.click();
                              }}
                              className="p-0"
                            >
                              ⬇️ Download
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                    <Button
                      variant="outline-primary"
                      size="sm"
                      onClick={() => navigate(`/cases/${caseData.id}/upload-evidence`)}
                    >
                      📤 Upload More Evidence
                    </Button>
                  </>
                ) : (
                  <div className="text-muted mb-3">No evidence files attached</div>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Case Timeline */}
        <Card id="case-timeline" className="mb-4">
          <Card.Header>
            <h5 className="mb-0">📈 CASE TIMELINE & UPDATES</h5>
          </Card.Header>
          <Card.Body>
            {timeline.length > 0 ? (
              <div className="timeline-container">
                {timeline.map((event, index) => {
                  const isTransfer = event.eventType?.toUpperCase().includes('TRANSFERRED');
                  const isAssignmentNotification = event.eventType?.toUpperCase().includes('ASSIGNMENT_NOTIFICATION');
                  
                  return (
                    <div key={event.id || index} className="timeline-item mb-4">
                      <div className="timeline-time mb-2">
                        {formatTimelineTime(event.eventTime)}
                      </div>
                      <div className="timeline-content">
                        <div className="d-flex align-items-center mb-2">
                          <span className="me-2" style={{ fontSize: '1.5rem' }}>
                            {getEventIcon(event.eventType)}
                          </span>
                          <strong>{getEventLabel(event.eventType)}</strong>
                        </div>
                        
                        {/* Transfer Event Details */}
                        {isTransfer && (
                          <>
                            {event.description ? (
                              <div className="text-muted mb-2">{event.description}</div>
                            ) : (
                              event.assignedFromUserId && event.assignedToUserId && (
                                <div className="text-muted mb-2">
                                  Case transferred from {event.targetName || `Officer ${event.assignedFromUserId.slice(0, 8)}`} to {event.assignedToUserId ? `Officer ${event.assignedToUserId.slice(0, 8)}` : 'another officer'}
                                </div>
                              )
                            )}
                            {(event.metadata?.reason || event.details) && (
                              <div className="text-muted mb-2">
                                <strong>Reason:</strong> {event.metadata?.reason || event.details}
                              </div>
                            )}
                          </>
                        )}
                        
                        {/* Assignment Notification Details */}
                        {isAssignmentNotification && (
                          <>
                            {event.description ? (
                              <div className="text-muted mb-2">{event.description}</div>
                            ) : (
                              event.targetName && (
                                <div className="text-muted mb-2">
                                  {event.targetName} accepted the case
                                </div>
                              )
                            )}
                          </>
                        )}
                        
                        {/* Regular Event Details */}
                        {!isTransfer && !isAssignmentNotification && (
                          <>
                            {event.description && (
                              <div className="text-muted mb-2">{event.description}</div>
                            )}
                            {event.performedByName && (
                              <div className="text-muted small">
                                {event.performedByName}
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-muted">
                <div className="mb-3">
                  {formatTimelineTime(caseData.reportDate)}
                </div>
                <div className="d-flex align-items-center mb-2">
                  <span className="me-2" style={{ fontSize: '1.5rem' }}>🟢</span>
                  <strong>CASE_REPORTED</strong>
                </div>
                <div className="text-muted mb-2">Case reported by you</div>
                {caseData.status?.toUpperCase() === 'UNDER_REVIEW' && (
                  <>
                    <div className="mb-3 mt-4">
                      {formatTimelineTime(caseData.lastUpdated || caseData.reportDate)}
                    </div>
                    <div className="d-flex align-items-center mb-2">
                      <span className="me-2" style={{ fontSize: '1.5rem' }}>🟡</span>
                      <strong>CASE_UNDER_REVIEW</strong>
                    </div>
                    <div className="text-muted mb-2">Case is under review by admin</div>
                  </>
                )}
                {!caseData.assignedOfficerId && (
                  <>
                    <div className="mb-3 mt-4">
                      <div className="d-flex align-items-center mb-2">
                        <span className="me-2" style={{ fontSize: '1.5rem' }}>⏳</span>
                        <strong>Pending: Case Assignment</strong>
                      </div>
                      <div className="text-muted mb-2">Will be assigned to available officer</div>
                    </div>
                  </>
                )}
                <div className="mb-3 mt-4">
                  <div className="d-flex align-items-center mb-2">
                    <span className="me-2" style={{ fontSize: '1.5rem' }}>🔔</span>
                    <strong>NOTIFICATION:</strong>
                  </div>
                  <div className="text-muted">You will receive update when assigned</div>
                </div>
              </div>
            )}
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
};

export default CaseDetailsPage;
