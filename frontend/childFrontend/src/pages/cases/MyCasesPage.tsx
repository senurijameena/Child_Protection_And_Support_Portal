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
  InputGroup,
  Pagination,
  Modal
} from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { caseService } from '../../services/caseService';
import { formatTrackingId, formatCaseId } from '../../utils/trackingIdFormatter';
import './MyCasesPage.css';

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
  caseDescription?: string;
  location?: string;
  caseNotes?: string;
  anonymous?: boolean;
  isAnonymous?: boolean;
}

const CASE_TYPES = [
  { value: 'ALL', label: 'All' },
  { value: 'MISSING_CHILD', label: 'Missing Child', icon: '👶' },
  { value: 'CHILD_ABUSE', label: 'Child Abuse', icon: '🩸' },
  { value: 'CHILD_LABOR', label: 'Child Labor', icon: '🏭' },
  { value: 'CHILD_TRAFFICKING', label: 'Child Trafficking', icon: '🚫' },
  { value: 'OTHER', label: 'Other', icon: '📝' },
];

const STATUS_OPTIONS = [
  { value: 'ALL', label: 'All' },
  { value: 'REPORTED', label: 'Reported' },
  { value: 'UNDER_REVIEW', label: 'Under Review' },
  { value: 'ASSIGNED', label: 'Assigned' },
  { value: 'INVESTIGATING', label: 'Investigating' },
  { value: 'RESOLVED', label: 'Resolved' },
  { value: 'CLOSED', label: 'Closed' },
];

const PRIORITY_OPTIONS = [
  { value: 'ALL', label: 'All' },
  { value: 'LOW', label: 'Low' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'HIGH', label: 'High' },
  { value: 'URGENT', label: 'Urgent' },
];

const DATE_OPTIONS = [
  { value: 'ALL', label: 'All' },
  { value: 'TODAY', label: 'Today' },
  { value: 'WEEK', label: 'This Week' },
  { value: 'MONTH', label: 'This Month' },
  { value: 'YEAR', label: 'This Year' },
];

const ITEMS_PER_PAGE = 10;

const MyCasesPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cases, setCases] = useState<Case[]>([]);
  const [filteredCases, setFilteredCases] = useState<Case[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    status: 'ALL',
    type: 'ALL',
    priority: 'ALL',
    date: 'ALL',
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [showDeclineModal, setShowDeclineModal] = useState(false);
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);
  const [declineReason, setDeclineReason] = useState('');
  const [declining, setDeclining] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchCases();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [cases, filters, searchQuery]);

  const fetchCases = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await caseService.getMyCases();
      const casesData = Array.isArray(response.data) ? response.data : [];
      setCases(casesData);
    } catch (err: any) {
      console.error('Error fetching cases:', err);
      setError('Failed to load cases. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...cases];

    // Status filter (apply first)
    if (filters.status !== 'ALL') {
      filtered = filtered.filter(c => {
        const caseStatus = (c.status || '').toUpperCase().trim();
        const filterStatus = filters.status.toUpperCase().trim();
        return caseStatus === filterStatus;
      });
    }

    // Type filter
    if (filters.type !== 'ALL') {
      filtered = filtered.filter(c => {
        const caseType = (c.caseType || '').toUpperCase().trim();
        const filterType = filters.type.toUpperCase().trim();
        return caseType === filterType || caseType.includes(filterType) || filterType.includes(caseType);
      });
    }

    // Priority filter (improved logic)
    if (filters.priority !== 'ALL') {
      const filterPriority = filters.priority.toUpperCase().trim();
      filtered = filtered.filter(c => {
        const casePriority = (c.priority || '').toUpperCase().trim();
        const isEmergency = c.emergency === true;
        
        if (filterPriority === 'URGENT') {
          // URGENT includes emergency cases or HIGH priority
          return isEmergency || casePriority === 'HIGH' || casePriority === 'URGENT';
        } else {
          // Match exact priority (case-insensitive)
          return casePriority === filterPriority;
        }
      });
    }

    // Date filter (improved with better date parsing)
    if (filters.date !== 'ALL') {
      const now = new Date();
      now.setHours(0, 0, 0, 0); // Reset time to start of day for accurate comparison
      
      filtered = filtered.filter(c => {
        if (!c.reportDate) return false;
        
        try {
          const reportDate = new Date(c.reportDate);
          if (isNaN(reportDate.getTime())) return false; // Invalid date
          
          reportDate.setHours(0, 0, 0, 0); // Reset time to start of day
          
          switch (filters.date) {
            case 'TODAY':
              return reportDate.getTime() === now.getTime();
            case 'WEEK': {
              const weekAgo = new Date(now);
              weekAgo.setDate(weekAgo.getDate() - 7);
              return reportDate >= weekAgo && reportDate <= now;
            }
            case 'MONTH': {
              const monthAgo = new Date(now);
              monthAgo.setMonth(monthAgo.getMonth() - 1);
              return reportDate >= monthAgo && reportDate <= now;
            }
            case 'YEAR': {
              const yearAgo = new Date(now);
              yearAgo.setFullYear(yearAgo.getFullYear() - 1);
              return reportDate >= yearAgo && reportDate <= now;
            }
            default:
              return true;
          }
        } catch (error) {
          console.error('Error parsing date:', c.reportDate, error);
          return false;
        }
      });
    }

    // Search filter (apply last, after all other filters)
    if (searchQuery) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(c => {
        const trackingId = (c.trackingId || '').toLowerCase();
        const caseType = (c.caseType || '').toLowerCase();
        const caseDescription = (c.caseDescription || '').toLowerCase();
        const location = (c.location || '').toLowerCase();
        const caseId = (c.id || '').toLowerCase();
        
        return trackingId.includes(query) ||
               caseType.includes(query) ||
               caseDescription.includes(query) ||
               location.includes(query) ||
               caseId.includes(query);
      });
    }

    setFilteredCases(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handleDeclineClick = (caseItem: Case) => {
    setSelectedCase(caseItem);
    setDeclineReason('');
    setShowDeclineModal(true);
  };

  const handleDeclineSubmit = async () => {
    if (!selectedCase || !declineReason.trim()) {
      setError('Please provide a reason/solution for declining this case');
      return;
    }

    if (declineReason.trim().length < 10) {
      setError('Reason/solution must be at least 10 characters');
      return;
    }

    setDeclining(true);
    setError(null);

    try {
      await caseService.closeCase(selectedCase.id, declineReason.trim());
      setSuccess('Case declined/closed successfully');
      setShowDeclineModal(false);
      setSelectedCase(null);
      setDeclineReason('');
      // Refresh cases list
      await fetchCases();
    } catch (err: any) {
      console.error('Error declining case:', err);
      setError(err.response?.data?.message || 'Failed to decline case. Please try again.');
    } finally {
      setDeclining(false);
    }
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
      if (diffDays === 1) return 'Yesterday';
      if (diffDays < 7) return `${diffDays} days ago`;
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
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

  // Pagination
  const totalPages = Math.ceil(filteredCases.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedCases = filteredCases.slice(startIndex, endIndex);

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
    <div className="my-cases-page">
      <Container>
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="mb-0">📄 MY CASES</h2>
          <div className="d-flex gap-2">
            <Button variant="outline-primary" onClick={fetchCases}>
              🔄 Refresh
            </Button>
            <InputGroup style={{ width: '300px' }}>
              <Form.Control
                placeholder="🔍 Search cases..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </InputGroup>
          </div>
        </div>

        {error && (
          <Alert variant="danger" dismissible onClose={() => setError(null)} className="mb-4">
            {error}
          </Alert>
        )}

        {success && (
          <Alert variant="success" dismissible onClose={() => setSuccess(null)} className="mb-4">
            {success}
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
                  {CASE_TYPES.map(type => (
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
                <Form.Label>Date:</Form.Label>
                <Form.Select
                  value={filters.date}
                  onChange={(e) => setFilters({ ...filters, date: e.target.value })}
                >
                  {DATE_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </Form.Select>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* Cases List */}
        <div className="mb-3">
          <h5 className="mb-3">CASES LIST: ({filteredCases.length} {filteredCases.length === 1 ? 'case' : 'cases'})</h5>
          
          {paginatedCases.length === 0 ? (
            <Card>
              <Card.Body className="text-center py-5">
                <div className="text-muted">No cases found</div>
              </Card.Body>
            </Card>
          ) : (
            paginatedCases.map((caseItem) => (
              <Card key={caseItem.id} className="mb-3 case-card">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div>
                      <h5 className="mb-2">
                        {formatTrackingId(
                          caseItem.trackingId,
                          caseItem.anonymous || caseItem.isAnonymous,
                          'CASE'
                        ) || formatCaseId(caseItem.id, caseItem.anonymous || caseItem.isAnonymous)}
                      </h5>
                      <div className="d-flex align-items-center gap-2 mb-2">
                        <span>{getCaseTypeIcon(caseItem.caseType)}</span>
                        <span className="fw-bold">{getCaseTypeLabel(caseItem.caseType)}</span>
                        {getPriorityBadge(caseItem.priority, caseItem.emergency)}
                        {getStatusBadge(caseItem.status)}
                      </div>
                    </div>
                  </div>

                  <div className="mb-3">
                    <div className="text-muted small mb-1">
                      Reported: {formatDate(caseItem.reportDate)}
                    </div>
                    {caseItem.lastUpdated && (
                      <div className="text-muted small mb-1">
                        Last Updated: {formatDate(caseItem.lastUpdated)}
                      </div>
                    )}
                    {caseItem.status?.toUpperCase() === 'RESOLVED' && caseItem.resolutionDate && (
                      <div className="text-muted small mb-1">
                        Resolved: {formatDate(caseItem.resolutionDate)}
                      </div>
                    )}
                    {caseItem.assignedOfficerId && (
                      <div className="text-muted small">
                        Assigned: Officer {caseItem.assignedOfficerName || caseItem.assignedOfficerId.slice(0, 8)}
                      </div>
                    )}
                  </div>

                  {caseItem.status?.toUpperCase() === 'RESOLVED' && caseItem.caseNotes && (
                    <div className="mb-3 p-3 bg-light rounded">
                      <div className="fw-bold small mb-1">Resolution:</div>
                      <div className="small">{caseItem.caseNotes}</div>
                    </div>
                  )}

                  <div className="d-flex gap-2 flex-wrap">
                    <Button
                      variant="outline-primary"
                      size="sm"
                      onClick={() => navigate(`/cases/${caseItem.id}`)}
                    >
                      📋 View Details
                    </Button>
                    <Button
                      variant="outline-info"
                      size="sm"
                      onClick={() => navigate(`/cases/${caseItem.id}#timeline`)}
                    >
                      📈 Track Timeline
                    </Button>
                    {caseItem.assignedOfficerId && caseItem.status?.toUpperCase() !== 'RESOLVED' && (
                      <Button
                        variant="outline-success"
                        size="sm"
                        onClick={() => navigate(`/messages?caseId=${caseItem.id}`)}
                      >
                        💬 Message Officer
                      </Button>
                    )}
                    {caseItem.status?.toUpperCase() === 'RESOLVED' && (
                      <Button
                        variant="outline-warning"
                        size="sm"
                        onClick={() => navigate(`/feedback?caseId=${caseItem.id}`)}
                      >
                        ⭐ Give Feedback
                      </Button>
                    )}
                    {caseItem.status?.toUpperCase() !== 'RESOLVED' && 
                     caseItem.status?.toUpperCase() !== 'CLOSED' && (
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => handleDeclineClick(caseItem)}
                      >
                        ❌ Decline/Close
                      </Button>
                    )}
                  </div>
                </Card.Body>
              </Card>
            ))
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="d-flex justify-content-center">
            <Pagination>
              <Pagination.Prev
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              />
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <Pagination.Item
                  key={page}
                  active={page === currentPage}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </Pagination.Item>
              ))}
              <Pagination.Next
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              />
            </Pagination>
          </div>
        )}

        {/* Decline Case Modal */}
        <Modal show={showDeclineModal} onHide={() => {
          setShowDeclineModal(false);
          setSelectedCase(null);
          setDeclineReason('');
          setError(null);
        }}>
          <Modal.Header closeButton>
            <Modal.Title>❌ Decline/Close Case</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Alert variant="warning" className="mb-3">
              <strong>Warning:</strong> Declining this case will close it. Please provide a reason or solution.
            </Alert>
            {error && (
              <Alert variant="danger" className="mb-3">
                {error}
              </Alert>
            )}
            <Form.Group className="mb-3">
              <Form.Label className="fw-bold">Reason/Solution: *</Form.Label>
              <Form.Control
                as="textarea"
                rows={5}
                placeholder="Please explain why you want to decline/close this case or provide the solution..."
                value={declineReason}
                onChange={(e) => {
                  setDeclineReason(e.target.value);
                  setError(null);
                }}
                required
              />
              <Form.Text className="text-muted">
                Minimum 10 characters required ({declineReason.length}/10)
              </Form.Text>
            </Form.Group>
            {selectedCase && (
              <div className="text-muted small">
                <strong>Case:</strong> {formatTrackingId(
                  selectedCase.trackingId,
                  selectedCase.anonymous || selectedCase.isAnonymous,
                  'CASE'
                ) || formatCaseId(selectedCase.id, selectedCase.anonymous || selectedCase.isAnonymous)}
              </div>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="secondary"
              onClick={() => {
                setShowDeclineModal(false);
                setSelectedCase(null);
                setDeclineReason('');
                setError(null);
              }}
              disabled={declining}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDeclineSubmit}
              disabled={declining || !declineReason.trim() || declineReason.trim().length < 10}
            >
              {declining ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Declining...
                </>
              ) : (
                'Confirm Decline'
              )}
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </div>
  );
};

export default MyCasesPage;
