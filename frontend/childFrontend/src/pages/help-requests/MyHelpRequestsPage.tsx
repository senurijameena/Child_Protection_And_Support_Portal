import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Card, 
  Button, 
  Form, 
  Row, 
  Col, 
  Badge,
  Alert,
  Spinner,
  InputGroup
} from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { helpRequestService } from '../../services/helpRequestService';
import { serviceOfferService } from '../../services/serviceOfferService';
import { authService } from '../../services/authService';
import { formatTrackingId, formatHelpRequestId } from '../../utils/trackingIdFormatter';
import './MyHelpRequestsPage.css';

interface HelpRequest {
  id: string;
  trackingId?: string;
  helpType?: string;
  status?: string;
  priority?: string;
  requestDate?: string;
  assignedWorkerId?: string;
  assignedWorkerName?: string;
  description?: string;
  location?: string;
  anonymous?: boolean;
}

interface ServiceOffer {
  id: string;
  helpRequestId: string;
  status?: string;
  scheduledDateTime?: string;
  serviceDetails?: string;
  offeredByUserId?: string;
  offeredByName?: string;
}

const HELP_TYPES = [
  { value: 'ALL', label: 'All' },
  { value: 'FOOD_ASSISTANCE', label: 'Food Assistance', icon: '🍎' },
  { value: 'EDUCATION_SUPPORT', label: 'Education Support', icon: '👨🏫' },
  { value: 'MEDICAL_HELP', label: 'Medical Help', icon: '🏥' },
  { value: 'SHELTER', label: 'Shelter', icon: '🏠' },
  { value: 'CLOTHING', label: 'Clothing', icon: '👕' },
  { value: 'COUNSELING', label: 'Counseling', icon: '💬' },
  { value: 'OTHER', label: 'Other', icon: '📝' },
];

const STATUS_OPTIONS = [
  { value: 'ALL', label: 'All' },
  { value: 'REQUESTED', label: 'Requested' },
  { value: 'UNDER_REVIEW', label: 'Under Review' },
  { value: 'ASSIGNED', label: 'Assigned' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'REJECTED', label: 'Rejected' },
];

const PRIORITY_OPTIONS = [
  { value: 'ALL', label: 'All' },
  { value: 'LOW', label: 'Low' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'HIGH', label: 'High' },
];

const OFFER_OPTIONS = [
  { value: 'ALL', label: 'All' },
  { value: 'WITH_OFFER', label: 'With Offer' },
  { value: 'WITHOUT_OFFER', label: 'Without Offer' },
];

const MyHelpRequestsPage: React.FC = () => {
  const navigate = useNavigate();
  const user = authService.getCurrentUser();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [requests, setRequests] = useState<HelpRequest[]>([]);
  const [serviceOffers, setServiceOffers] = useState<Record<string, ServiceOffer[]>>({});
  const [filteredRequests, setFilteredRequests] = useState<HelpRequest[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    status: 'ALL',
    type: 'ALL',
    priority: 'ALL',
    offers: 'ALL',
  });

  useEffect(() => {
    fetchHelpRequests();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [requests, filters, searchQuery, serviceOffers]);

  const fetchHelpRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await helpRequestService.getMyRequests();
      const requestsData = Array.isArray(response.data) ? response.data : [];
      setRequests(requestsData);
      
      // Fetch service offers for each request
      if (requestsData.length > 0) {
        const offersMap: Record<string, ServiceOffer[]> = {};
        await Promise.all(
          requestsData.map(async (request) => {
            try {
              const offersResponse = await serviceOfferService.getOffersByHelpRequest(request.id);
              const offers = Array.isArray(offersResponse.data) ? offersResponse.data : [];
              offersMap[request.id] = offers;
            } catch (err) {
              console.error(`Error fetching offers for request ${request.id}:`, err);
              offersMap[request.id] = [];
            }
          })
        );
        setServiceOffers(offersMap);
      }
    } catch (err: any) {
      console.error('Error fetching help requests:', err);
      setError('Failed to load help requests. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...requests];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(r => 
        r.trackingId?.toLowerCase().includes(query) ||
        r.helpType?.toLowerCase().includes(query) ||
        r.description?.toLowerCase().includes(query) ||
        r.location?.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (filters.status !== 'ALL') {
      filtered = filtered.filter(r => r.status?.toUpperCase() === filters.status.toUpperCase());
    }

    // Type filter
    if (filters.type !== 'ALL') {
      filtered = filtered.filter(r => r.helpType?.toUpperCase() === filters.type.toUpperCase());
    }

    // Priority filter
    if (filters.priority !== 'ALL') {
      filtered = filtered.filter(r => r.priority?.toUpperCase() === filters.priority.toUpperCase());
    }

    // Offers filter
    if (filters.offers !== 'ALL') {
      filtered = filtered.filter(r => {
        const offers = serviceOffers[r.id] || [];
        const hasOffer = offers.length > 0;
        return filters.offers === 'WITH_OFFER' ? hasOffer : !hasOffer;
      });
    }

    setFilteredRequests(filtered);
  };

  const formatDate = (dateString?: string): string => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffMins < 60) return `Today, ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`;
      if (diffHours < 24) return `${diffHours} hours ago`;
      if (diffDays === 1) return '1 day ago';
      if (diffDays < 7) return `${diffDays} days ago`;
      if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const getHelpTypeIcon = (helpType?: string): string => {
    if (!helpType) return '📋';
    const type = helpType.toUpperCase();
    if (type.includes('FOOD')) return '🍎';
    if (type.includes('EDUCATION')) return '👨🏫';
    if (type.includes('MEDICAL')) return '🏥';
    if (type.includes('SHELTER')) return '🏠';
    if (type.includes('CLOTHING')) return '👕';
    if (type.includes('COUNSELING')) return '💬';
    return '📝';
  };

  const getHelpTypeLabel = (helpType?: string): string => {
    if (!helpType) return 'Unknown';
    const type = helpType.toUpperCase();
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
    if (statusUpper === 'REQUESTED') {
      return <Badge bg="primary">🟢 REQUESTED</Badge>;
    }
    return <Badge bg="secondary">{status}</Badge>;
  };

  const getPriorityBadge = (priority?: string) => {
    if (!priority) return <Badge bg="warning">🟡 MEDIUM</Badge>;
    const priorityUpper = priority.toUpperCase();
    if (priorityUpper === 'URGENT') {
      return <Badge bg="danger">🔴 URGENT</Badge>;
    }
    if (priorityUpper === 'HIGH') {
      return <Badge bg="danger">🟠 HIGH</Badge>;
    }
    if (priorityUpper === 'MEDIUM') {
      return <Badge bg="warning">🟡 MEDIUM</Badge>;
    }
    if (priorityUpper === 'LOW') {
      return <Badge bg="success">🟢 LOW</Badge>;
    }
    return <Badge bg="secondary">{priority}</Badge>;
  };

  const getServiceOfferStatus = (requestId: string): { status: string; offer?: ServiceOffer; message: string } => {
    const offers = serviceOffers[requestId] || [];
    if (offers.length === 0) {
      return { status: 'NONE', message: '⏳ No service offer yet' };
    }
    
    const pendingOffer = offers.find(o => o.status?.toUpperCase() === 'PENDING');
    const acceptedOffer = offers.find(o => o.status?.toUpperCase() === 'ACCEPTED');
    const completedOffer = offers.find(o => o.status?.toUpperCase() === 'COMPLETED');
    
    if (pendingOffer) {
      return { status: 'PENDING', offer: pendingOffer, message: '📋 SERVICE OFFER: Received (Pending Your Response)' };
    }
    if (acceptedOffer) {
      const scheduledDate = acceptedOffer.scheduledDateTime 
        ? new Date(acceptedOffer.scheduledDateTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        : 'TBD';
      return { status: 'ACCEPTED', offer: acceptedOffer, message: `✅ SERVICE OFFER: Accepted (Scheduled for ${scheduledDate})` };
    }
    if (completedOffer) {
      return { status: 'COMPLETED', offer: completedOffer, message: '✅ SERVICE OFFER: Completed (Service provided)' };
    }
    
    return { status: 'OTHER', message: '📋 SERVICE OFFER: Available' };
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  return (
    <div className="my-help-requests-page">
      <Container>
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="mb-0">❤️ MY HELP REQUESTS</h2>
          <div className="d-flex gap-2">
            <Button variant="outline-primary" onClick={fetchHelpRequests}>
              🔄 Refresh
            </Button>
            <InputGroup style={{ width: '200px' }}>
              <Form.Control
                placeholder="🔍 Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </InputGroup>
            <Button variant="primary" onClick={() => navigate('/request-help')}>
              ➕ New Request
            </Button>
          </div>
        </div>

        {error && (
          <Alert variant="danger" dismissible onClose={() => setError(null)} className="mb-4">
            {error}
          </Alert>
        )}

        {/* Filters */}
        <Card className="mb-4">
          <Card.Body>
            <div className="mb-2 fw-bold">FILTERS:</div>
            <Row className="g-3">
              <Col md={3}>
                <Form.Label>Status:</Form.Label>
                <Form.Select
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                >
                  {STATUS_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </Form.Select>
              </Col>
              <Col md={3}>
                <Form.Label>Type:</Form.Label>
                <Form.Select
                  value={filters.type}
                  onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                >
                  {HELP_TYPES.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </Form.Select>
              </Col>
              <Col md={3}>
                <Form.Label>Priority:</Form.Label>
                <Form.Select
                  value={filters.priority}
                  onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
                >
                  {PRIORITY_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </Form.Select>
              </Col>
              <Col md={3}>
                <Form.Label>Offers:</Form.Label>
                <Form.Select
                  value={filters.offers}
                  onChange={(e) => setFilters({ ...filters, offers: e.target.value })}
                >
                  {OFFER_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </Form.Select>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* Requests List */}
        <div className="mb-3">
          <h5 className="mb-3">REQUESTS LIST: ({filteredRequests.length} {filteredRequests.length === 1 ? 'request' : 'requests'})</h5>
          
          {filteredRequests.length === 0 ? (
            <Card>
              <Card.Body className="text-center py-5">
                <div className="text-muted">No help requests found</div>
              </Card.Body>
            </Card>
          ) : (
            filteredRequests.map((request) => {
              const offerStatus = getServiceOfferStatus(request.id);
              const statusUpper = request.status?.toUpperCase();
              const isCompleted = statusUpper === 'COMPLETED';
              const isRejected = statusUpper === 'REJECTED';
              const isAssigned = statusUpper === 'ASSIGNED' || statusUpper === 'IN_PROGRESS';
              const hasPendingOffer = offerStatus.status === 'PENDING';
              
              return (
                <Card key={request.id} className="mb-3 help-request-card">
                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <div>
                        <h5 className="mb-2">
                          {formatTrackingId(
                            request.trackingId,
                            request.anonymous,
                            'HELP'
                          ) || formatHelpRequestId(request.id, request.anonymous)}
                        </h5>
                        <div className="d-flex align-items-center gap-2 mb-2">
                          <span>{getHelpTypeIcon(request.helpType)}</span>
                          <span className="fw-bold">{getHelpTypeLabel(request.helpType)}</span>
                          {getPriorityBadge(request.priority)}
                          {getStatusBadge(request.status)}
                        </div>
                      </div>
                    </div>

                    <div className="mb-3">
                      <div className="text-muted small mb-1">
                        Requested: {formatDate(request.requestDate)}
                      </div>
                      {request.assignedWorkerId && (
                        <div className="text-muted small mb-1">
                          Assigned: {request.assignedWorkerName || `Worker ${request.assignedWorkerId.slice(0, 8)}`}
                        </div>
                      )}
                      {!request.assignedWorkerId && statusUpper === 'UNDER_REVIEW' && (
                        <div className="text-muted small mb-1">
                          Status: Waiting for assignment
                        </div>
                      )}
                      {isRejected && (
                        <div className="text-muted small mb-1">
                          Rejected: Invalid request
                        </div>
                      )}
                    </div>

                    {/* Service Offer Status */}
                    <div className="mb-3 p-2 bg-light rounded">
                      {offerStatus.status === 'NONE' && isRejected ? (
                        <div className="text-muted">❌ No offer - Request rejected</div>
                      ) : (
                        <div className={offerStatus.status === 'PENDING' ? 'text-warning' : 
                                       offerStatus.status === 'ACCEPTED' || offerStatus.status === 'COMPLETED' ? 'text-success' : 
                                       'text-muted'}>
                          {offerStatus.message}
                        </div>
                      )}
                    </div>

                    <div className="d-flex gap-2 flex-wrap">
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          if (request.id) {
                            console.log('Navigating to help request:', request.id);
                            navigate(`/help-requests/${request.id}`);
                          } else {
                            console.error('Request ID is missing:', request);
                            alert('Error: Request ID is missing. Please try again.');
                          }
                        }}
                      >
                        📋 View Details
                      </Button>
                      
                      {hasPendingOffer && (
                        <Button
                          variant="outline-warning"
                          size="sm"
                          onClick={() => navigate(`/help-requests/${request.id}/review-offer`)}
                        >
                          📋 Review Offer
                        </Button>
                      )}
                      
                      {hasPendingOffer && isAssigned && request.assignedWorkerId && (
                        <Button
                          variant="outline-success"
                          size="sm"
                          onClick={() => navigate(`/messages?helpRequestId=${request.id}`)}
                        >
                          💬 Message Worker
                        </Button>
                      )}
                      
                      {!isCompleted && !isRejected && !hasPendingOffer && statusUpper === 'UNDER_REVIEW' && (
                        <>
                          <Button
                            variant="outline-secondary"
                            size="sm"
                            onClick={() => navigate(`/help-requests/${request.id}/edit`)}
                          >
                            ✏️ Edit Request
                          </Button>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => {
                              if (window.confirm('Are you sure you want to cancel this request?')) {
                                // Handle cancel
                              }
                            }}
                          >
                            🗑️ Cancel
                          </Button>
                        </>
                      )}
                      
                      {offerStatus.status === 'ACCEPTED' && (
                        <>
                          <Button
                            variant="outline-info"
                            size="sm"
                            onClick={() => navigate(`/help-requests/${request.id}/reschedule`)}
                          >
                            📅 Reschedule
                          </Button>
                          <Button
                            variant="outline-success"
                            size="sm"
                            onClick={() => navigate(`/messages?helpRequestId=${request.id}`)}
                          >
                            💬 Message
                          </Button>
                        </>
                      )}
                      
                      {isCompleted && (
                        <>
                          <Button
                            variant="outline-warning"
                            size="sm"
                            onClick={() => navigate(`/feedback?helpRequestId=${request.id}`)}
                          >
                            ⭐ Give Feedback
                          </Button>
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => {
                              // Handle download certificate
                            }}
                          >
                            📄 Download Certificate
                          </Button>
                        </>
                      )}
                      
                      {isRejected && (
                        <Button
                          variant="outline-primary"
                          size="sm"
                          onClick={() => navigate('/request-help')}
                        >
                          📝 Re-submit Request
                        </Button>
                      )}
                    </div>
                  </Card.Body>
                </Card>
              );
            })
          )}
        </div>
      </Container>
    </div>
  );
};

export default MyHelpRequestsPage;
