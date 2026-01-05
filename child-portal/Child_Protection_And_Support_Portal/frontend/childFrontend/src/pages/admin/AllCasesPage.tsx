import React, { useState, useEffect } from 'react';
import {
  Row, Col, Card, Button, Spinner,
  Form, Table, Badge, InputGroup, Modal
} from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { authService, UserRole } from '../../services/authService';

import { caseService } from '../../services/caseService';
import './AllCasesPage.css';

interface Case {
  id: string;
  caseId?: string;
  caseType?: string;
  status?: string;
  priority?: string;
  location?: string;
  incidentDate?: string;
  createdAt?: string;
  reportDate?: string;
  assignedOfficerId?: string;
  assignedSocialWorkerId?: string;
  assignedOfficer?: {
    id: string;
    name: string;
    badgeNumber?: string;
  };
  assignedSocialWorker?: {
    id: string;
    name: string;
    licenseNumber?: string;
  };
  caseDetails?: {
    caseType?: string;
    location?: string;
    incidentDate?: string;
    description?: string;
  };
  childDetails?: {
    approximateAge?: string;
    ageRange?: string;
    gender?: string;
    identificationMarks?: string;
    distinctiveFeatures?: string;
    clothingDescription?: string;
    lastSeen?: string;
  };
  reporterInfo?: {
    isAnonymous?: boolean;
    contactName?: string;
    contactPhone?: string;
    contactEmail?: string;
    userId?: string;
  };
  evidence?: Array<{
    id?: string;
    url?: string;
    type?: string;
    description?: string;
  }>;
  notes?: Array<{
    id?: string;
    content?: string;
    createdAt?: string;
    createdBy?: string;
  }>;
  description?: string;
}

const AllCasesPage: React.FC = () => {
  const navigate = useNavigate();
  const [user] = useState(authService.getCurrentUser());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const [allCases, setAllCases] = useState<Case[]>([]);
  const [filteredCases, setFilteredCases] = useState<Case[]>([]);

  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const [showCaseModal, setShowCaseModal] = useState(false);
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);
  const [loadingCaseDetails, setLoadingCaseDetails] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (user.role !== UserRole.ADMIN) {
      navigate('/unauthorized');
      return;
    }

    loadInitialData();

    const refreshInterval = setInterval(() => {
      loadInitialData();
    }, 30000);

    return () => clearInterval(refreshInterval);
  }, [user, navigate]);

  useEffect(() => {
    applyFilters();
  }, [searchQuery, typeFilter, statusFilter, priorityFilter, allCases]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filteredCases]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await caseService.getAllCasesWithDetails();
      const cases = response.data || [];
      
      setAllCases(cases);
      setFilteredCases(cases);
    } catch (err: any) {
      console.error('Error loading cases:', err);
      setError(err.response?.data?.message || 'Failed to load cases');
    } finally {
      setLoading(false);
    }
  };

  const handleViewCase = async (caseId: string) => {
    try {
      setLoadingCaseDetails(true);
      setError(null);

      const response = await caseService.getCaseById(caseId);
      const caseData = response.data;
      
      setSelectedCase(caseData);
      setShowCaseModal(true);
    } catch (err: any) {
      console.error('Error loading case details:', err);
      setError(err.response?.data?.message || 'Failed to load case details');
    } finally {
      setLoadingCaseDetails(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...allCases];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(caseItem =>
        (caseItem.caseId || caseItem.id || '').toLowerCase().includes(query) ||
        (caseItem.caseDetails?.caseType || caseItem.caseType || '').toLowerCase().includes(query) ||
        (caseItem.caseDetails?.location || caseItem.location || '').toLowerCase().includes(query) ||
        (caseItem.caseDetails?.description || '').toLowerCase().includes(query)
      );
    }

    if (typeFilter !== 'ALL') {
      filtered = filtered.filter(caseItem =>
        (caseItem.caseDetails?.caseType || caseItem.caseType || '').toUpperCase() === typeFilter.toUpperCase()
      );
    }

    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(caseItem =>
        (caseItem.status || '').toUpperCase() === statusFilter.toUpperCase()
      );
    }

    if (priorityFilter !== 'ALL') {
      filtered = filtered.filter(caseItem =>
        (caseItem.priority || '').toUpperCase() === priorityFilter.toUpperCase()
      );
    }

    setFilteredCases(filtered);
  };

  const formatCaseId = (caseId?: string, id?: string): string => {
    const identifier = caseId || id || '';
    if (identifier.startsWith('CASE-') || identifier.startsWith('ANON-')) {
      return identifier.toUpperCase();
    }
    if (identifier.length > 0) {
      return `CASE-${identifier.substring(0, 8).toUpperCase()}`;
    }
    return 'CASE-UNKNOWN';
  };

  const getCaseTypeLabel = (caseType?: string): string => {
    if (!caseType) return 'Unknown';
    const type = caseType.toUpperCase();
    if (type.includes('MISSING')) return 'Missing Child';
    if (type.includes('ABUSE')) return 'Child Abuse';
    if (type.includes('TRAFFICKING')) return 'Trafficking';
    if (type.includes('LABOR')) return 'Labor';
    return caseType;
  };

  const getStatusBadge = (status?: string) => {
    if (!status) return <Badge bg="secondary">Unknown</Badge>;
    
    const statusUpper = status.toUpperCase();
    if (statusUpper.includes('INVESTIGATING') || statusUpper.includes('IN_PROGRESS')) {
      return <Badge bg="info">🔄 Investigating</Badge>;
    }
    if (statusUpper.includes('RESOLVED') || statusUpper.includes('CLOSED')) {
      return <Badge bg="success">✅ Resolved</Badge>;
    }
    if (statusUpper.includes('REVIEW') || statusUpper.includes('PENDING')) {
      return <Badge bg="warning">⏳ Under Review</Badge>;
    }
    if (statusUpper.includes('ASSIGNED')) {
      return <Badge bg="warning">🟡 Assigned</Badge>;
    }
    if (statusUpper.includes('REPORTED') || statusUpper.includes('NEW')) {
      return <Badge bg="success">🟢 Reported</Badge>;
    }
    return <Badge bg="secondary">{status}</Badge>;
  };

  const getPriorityBadge = (priority?: string) => {
    if (!priority) return <Badge bg="secondary">⚪ Medium</Badge>;
    
    const priorityUpper = priority.toUpperCase();
    if (priorityUpper.includes('URGENT') || priorityUpper === 'HIGH') {
      return <Badge bg="danger">⚡ Urgent</Badge>;
    }
    if (priorityUpper === 'HIGH') {
      return <Badge bg="danger">🔴 High</Badge>;
    }
    if (priorityUpper === 'MEDIUM' || priorityUpper === 'MED') {
      return <Badge bg="secondary">⚪ Medium</Badge>;
    }
    if (priorityUpper === 'LOW') {
      return <Badge bg="success">🟢 Low</Badge>;
    }
    return <Badge bg="secondary">⚪ Medium</Badge>;
  };

  const calculateAge = (dateString?: string): string => {
    if (!dateString) return '-';
    
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - date.getTime());
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      const diffYears = Math.floor(diffDays / 365);
      const diffMonths = Math.floor((diffDays % 365) / 30);
      
      if (diffYears > 0) {
        return `${diffYears}y`;
      }
      if (diffMonths > 0) {
        return `${diffMonths}m`;
      }
      if (diffDays > 0) {
        return `${diffDays}d`;
      }
      return 'Today';
    } catch {
      return '-';
    }
  };

  const getUniqueCaseTypes = (): string[] => {
    const types = new Set<string>();
    allCases.forEach(caseItem => {
      const type = caseItem.caseDetails?.caseType || caseItem.caseType;
      if (type) types.add(type);
    });
    return Array.from(types).sort();
  };

  const getUniqueStatuses = (): string[] => {
    const statuses = new Set<string>();
    allCases.forEach(caseItem => {
      if (caseItem.status) statuses.add(caseItem.status);
    });
    return Array.from(statuses).sort();
  };

  const getUniquePriorities = (): string[] => {
    const priorities = new Set<string>();
    allCases.forEach(caseItem => {
      if (caseItem.priority) priorities.add(caseItem.priority);
    });
    return Array.from(priorities).sort();
  };

  const formatDateTime = (dateString?: string): string => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  const getReporterRole = (_userId?: string): string => {

    return 'Public';
  };

  const renderAllCases = () => {
    if (loading) {
      return (
        <div className="text-center py-5">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
          <p className="mt-3">Loading cases...</p>
        </div>
      );
    }

    if (filteredCases.length === 0) {
      return (
        <Card className="text-center py-5">
          <Card.Body>
            <i className="bi bi-inbox display-1 text-muted"></i>
            <p className="mt-3">No cases found</p>
          </Card.Body>
        </Card>
      );
    }

    const indexOfLastCase = currentPage * itemsPerPage;
    const indexOfFirstCase = indexOfLastCase - itemsPerPage;
    const currentCases = filteredCases.slice(indexOfFirstCase, indexOfLastCase);
    const totalPages = Math.ceil(filteredCases.length / itemsPerPage);

    return (
      <>
        {}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="page-title mb-0">
            <span className="title-icon">📋</span>
            ALL CASES ({filteredCases.length})
          </h2>
          <InputGroup style={{ maxWidth: '300px' }}>
            <InputGroup.Text>
              <i className="bi bi-search"></i>
            </InputGroup.Text>
            <Form.Control
              placeholder="🔍 Search cases..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </InputGroup>
        </div>

        {}
        <Card className="mb-4 filter-bar-card">
          <Card.Body className="py-2">
            <Row className="g-3 align-items-center">
              <Col md={3}>
                <div className="d-flex align-items-center gap-2">
                  <label className="filter-label mb-0">Type:</label>
                  <Form.Select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    size="sm"
                    className="filter-select"
                  >
                    <option value="ALL">All</option>
                    {getUniqueCaseTypes().map(type => (
                      <option key={type} value={type}>{getCaseTypeLabel(type)}</option>
                    ))}
                  </Form.Select>
                </div>
              </Col>
              <Col md={3}>
                <div className="d-flex align-items-center gap-2">
                  <label className="filter-label mb-0">Status:</label>
                  <Form.Select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    size="sm"
                    className="filter-select"
                  >
                    <option value="ALL">All</option>
                    {getUniqueStatuses().map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </Form.Select>
                </div>
              </Col>
              <Col md={3}>
                <div className="d-flex align-items-center gap-2">
                  <label className="filter-label mb-0">Priority:</label>
                  <Form.Select
                    value={priorityFilter}
                    onChange={(e) => setPriorityFilter(e.target.value)}
                    size="sm"
                    className="filter-select"
                  >
                    <option value="ALL">All</option>
                    {getUniquePriorities().map(priority => (
                      <option key={priority} value={priority}>{priority}</option>
                    ))}
                  </Form.Select>
                </div>
              </Col>
              <Col md={3} className="text-end">
                <Button
                  variant="outline-secondary"
                  size="sm"
                  onClick={loadInitialData}
                  title="Refresh Data"
                >
                  <i className="bi bi-arrow-clockwise me-1"></i>
                  Refresh
                </Button>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {}
        <div className="table-responsive mb-4">
          <Table hover className="align-middle cases-table">
            <thead>
              <tr>
                <th>TRACKING</th>
                <th>TYPE</th>
                <th>STATUS</th>
                <th>PRIORITY</th>
                <th>AGE</th>
                <th>LOCATION</th>
                <th style={{ width: '100px' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {currentCases.map((caseItem) => (
                <tr key={caseItem.id}>
                  <td>
                    <code className="case-id-code">
                      {formatCaseId(caseItem.caseId, caseItem.id)}
                    </code>
                  </td>
                  <td>
                    <div className="case-type-label">
                      {getCaseTypeLabel(caseItem.caseDetails?.caseType || caseItem.caseType)}
                    </div>
                  </td>
                  <td>
                    {getStatusBadge(caseItem.status)}
                  </td>
                  <td>
                    {getPriorityBadge(caseItem.priority)}
                  </td>
                  <td>
                    <span className="case-age">
                      {calculateAge(caseItem.incidentDate || caseItem.createdAt || caseItem.caseDetails?.incidentDate)}
                    </span>
                  </td>
                  <td>
                    <span className="case-location">
                      {caseItem.caseDetails?.location || caseItem.location || '-'}
                    </span>
                  </td>
                  <td>
                    <div className="d-flex gap-1">
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => handleViewCase(caseItem.id)}
                        title="View Details"
                      >
                        <i className="bi bi-eye"></i>
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>

        {}
        {totalPages > 1 && (
          <nav aria-label="Page navigation">
            <ul className="pagination justify-content-center">
              <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                <Button
                  className="page-link"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
              </li>
              {[...Array(totalPages)].map((_, index) => {
                const page = index + 1;
                if (
                  page === 1 ||
                  page === totalPages ||
                  (page >= currentPage - 1 && page <= currentPage + 1)
                ) {
                  return (
                    <li key={page} className={`page-item ${currentPage === page ? 'active' : ''}`}>
                      <Button
                        className="page-link"
                        onClick={() => setCurrentPage(page)}
                      >
                        {page}
                      </Button>
                    </li>
                  );
                } else if (page === currentPage - 2 || page === currentPage + 2) {
                  return (
                    <li key={page} className="page-item disabled">
                      <span className="page-link">...</span>
                    </li>
                  );
                }
                return null;
              })}
              <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                <Button
                  className="page-link"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </li>
            </ul>
          </nav>
        )}
      </>
    );
  };

  return (
    <div className="all-cases-page">
      {error && (
        <Card bg="danger" text="white" className="mb-3">
          <Card.Body className="d-flex justify-content-between align-items-center">
            <div>{error}</div>
            <Button
              variant="outline-light"
              size="sm"
              onClick={() => setError(null)}
            >
              <i className="bi bi-x"></i>
            </Button>
          </Card.Body>
        </Card>
      )}

      {success && (
        <Card bg="success" text="white" className="mb-3">
          <Card.Body className="d-flex justify-content-between align-items-center">
            <div>{success}</div>
            <Button
              variant="outline-light"
              size="sm"
              onClick={() => setSuccess(null)}
            >
              <i className="bi bi-x"></i>
            </Button>
          </Card.Body>
        </Card>
      )}

      {renderAllCases()}

      <Modal 
        show={showCaseModal} 
        onHide={() => setShowCaseModal(false)}
        size="xl"
        centered
      >
        <Modal.Header closeButton className="case-modal-header">
          <Modal.Title>
            <span className="modal-title-icon">🏷️</span>
            CASE DETAILS: {selectedCase ? formatCaseId(selectedCase.caseId, selectedCase.id) : ''}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="case-modal-body">
          {loadingCaseDetails ? (
            <div className="text-center py-5">
              <Spinner animation="border" />
              <p className="mt-3">Loading case details...</p>
            </div>
          ) : selectedCase ? (
            <>
              <Row className="mb-4">
                <Col md={6}>
                  <Card className="case-info-card">
                    <Card.Header className="case-card-header">
                      <i className="bi bi-search me-2"></i>
                    </Card.Header>
                    <Card.Body>
                      <div className="case-info-item">
                        <strong>Type:</strong> {getCaseTypeLabel(selectedCase.caseDetails?.caseType || selectedCase.caseType)}
                      </div>
                      <div className="case-info-item">
                        <strong>Status:</strong> {getStatusBadge(selectedCase.status)}
                      </div>
                      <div className="case-info-item">
                        <strong>Priority:</strong> {getPriorityBadge(selectedCase.priority)}
                      </div>
                      <div className="case-info-item">
                        <strong>Reporter:</strong> 👤 {selectedCase.reporterInfo?.contactName || 'Unknown'} 
                        {selectedCase.reporterInfo?.userId && ` (${getReporterRole(selectedCase.reporterInfo.userId)})`}
                      </div>
                      <div className="case-info-item">
                        <strong>Anonymous:</strong> {selectedCase.reporterInfo?.isAnonymous ? 'Yes' : 'No'}
                      </div>
                      <div className="case-info-item">
                        <strong>Location:</strong> {selectedCase.caseDetails?.location || selectedCase.location || '-'}
                      </div>
                      <div className="case-info-item">
                        <strong>Incident Date:</strong> {formatDateTime(selectedCase.caseDetails?.incidentDate || selectedCase.incidentDate)}
                      </div>
                      <div className="case-info-item">
                        <strong>Report Date:</strong> {formatDateTime(selectedCase.reportDate || selectedCase.createdAt)}
                      </div>
                    </Card.Body>
                  </Card>
                </Col>

                {}
                <Col md={6}>
                  <Card className="case-info-card">
                    <Card.Header className="case-card-header">
                      <i className="bi bi-person-heart me-2"></i>
                      👶 CHILD DETAILS
                    </Card.Header>
                    <Card.Body>
                      <div className="case-info-item">
                        <strong>Approximate Age:</strong> {selectedCase.childDetails?.approximateAge || selectedCase.childDetails?.ageRange || '-'}
                      </div>
                      <div className="case-info-item">
                        <strong>Gender:</strong> {selectedCase.childDetails?.gender || '-'}
                      </div>
                      <div className="case-info-item">
                        <strong>Identification Marks:</strong> {selectedCase.childDetails?.identificationMarks || selectedCase.childDetails?.distinctiveFeatures || '-'}
                      </div>
                      <div className="case-info-item">
                        <strong>Last Seen:</strong> {selectedCase.childDetails?.lastSeen || '-'}
                      </div>
                      <div className="case-info-item">
                        <strong>Clothing:</strong> {selectedCase.childDetails?.clothingDescription || '-'}
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>

              {}
              <Row>
                <Col>
                  {}
                  <Card className="case-info-card mb-3">
                    <Card.Header className="case-card-header">
                      <i className="bi bi-image me-2"></i>
                      📸 EVIDENCE
                    </Card.Header>
                    <Card.Body>
                      {selectedCase.evidence && selectedCase.evidence.length > 0 ? (
                        <div className="evidence-gallery">
                          {selectedCase.evidence.map((item, index) => (
                            <div key={index} className="evidence-item">
                              {item.url ? (
                                <a href={item.url} target="_blank" rel="noopener noreferrer" className="evidence-link">
                                  <i className="bi bi-file-earmark-image me-2"></i>
                                  {item.description || `Evidence ${index + 1}`}
                                </a>
                              ) : (
                                <span className="text-muted">No evidence available</span>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-muted mb-0">No evidence uploaded</p>
                      )}
                    </Card.Body>
                  </Card>

                  {}
                  <Card className="case-info-card mb-3">
                    <Card.Header className="case-card-header">
                      <i className="bi bi-journal-text me-2"></i>
                      📝 CASE NOTES
                    </Card.Header>
                    <Card.Body>
                      {selectedCase.notes && selectedCase.notes.length > 0 ? (
                        <div className="case-notes-timeline">
                          {selectedCase.notes.map((note, index) => (
                            <div key={index} className="case-note-item">
                              <div className="case-note-time">
                                {formatDateTime(note.createdAt)}
                              </div>
                              <div className="case-note-content">
                                {note.content || '-'}
                              </div>
                              {note.createdBy && (
                                <div className="case-note-author">
                                  By: {note.createdBy}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-muted mb-0">No notes available</p>
                      )}
                    </Card.Body>
                  </Card>

                  {}
                  <Card className="case-info-card">
                    <Card.Header className="case-card-header">
                      <i className="bi bi-people me-2"></i>
                      👥 ASSIGNMENTS
                    </Card.Header>
                    <Card.Body>
                      <div className="case-info-item">
                        <strong>Police Officer:</strong> {selectedCase.assignedOfficer ? (
                          <>👮 {selectedCase.assignedOfficer.name} {selectedCase.assignedOfficer.badgeNumber && `(${selectedCase.assignedOfficer.badgeNumber})`}</>
                        ) : (
                          <span className="text-muted">Not assigned</span>
                        )}
                      </div>
                      <div className="case-info-item">
                        <strong>Social Worker:</strong> {selectedCase.assignedSocialWorker ? (
                          <>🏥 {selectedCase.assignedSocialWorker.name} {selectedCase.assignedSocialWorker.licenseNumber && `(${selectedCase.assignedSocialWorker.licenseNumber})`}</>
                        ) : (
                          <span className="text-muted">Not assigned</span>
                        )}
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </>
          ) : (
            <div className="text-center py-5">
              <p className="text-muted">No case data available</p>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer className="case-modal-footer">
          <Button variant="secondary" onClick={() => setShowCaseModal(false)}>
            Close
          </Button>
          <Button 
            variant="primary" 
            onClick={() => {
              if (selectedCase) {
                navigate(`/admin/cases/${selectedCase.id}`);
              }
            }}
          >
            <i className="bi bi-arrow-right me-2"></i>
            View Full Details
          </Button>
          <Button 
            variant="outline-warning"
            onClick={() => {
              setSuccess('Update status functionality coming soon');
              setTimeout(() => setSuccess(null), 3000);
            }}
          >
            <i className="bi bi-arrow-repeat me-2"></i>
            Update Status
          </Button>
          <Button 
            variant="outline-info"
            onClick={() => {
              setSuccess('Assign officer functionality coming soon');
              setTimeout(() => setSuccess(null), 3000);
            }}
          >
            <i className="bi bi-person-plus me-2"></i>
            Assign Officer
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default AllCasesPage;

