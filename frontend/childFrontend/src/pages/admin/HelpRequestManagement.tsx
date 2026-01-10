import React, { useState, useEffect } from 'react';
import {
  Row, Col, Card, Button, Spinner, Alert,
  Form, Table, Badge, InputGroup, Dropdown, Modal
} from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import { helpRequestService } from '../../services/helpRequestService';
import { adminService } from '../../services/adminService';
import './HelpRequestManagement.css';

interface HelpRequest {
  id: string;
  trackingId?: string;
  helpType: string;
  status: string;
  priority: string;
  childAge?: string;
  location?: string;
  assignedWorkerId?: string;
  assignedWorker?: {
    id: string;
    name: string;
  };
  requestDate?: string;
  requesterName?: string;
  description?: string;
}

interface SocialWorker {
  id: string;
  userId: string;
  fullName: string;
  specialization: string;
  availabilityStatus: string;
  registrationDate?: string;
}

const HelpRequestManagement: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [helpRequests, setHelpRequests] = useState<HelpRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<HelpRequest[]>([]);

  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');

  const [socialWorkers, setSocialWorkers] = useState<SocialWorker[]>([]);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [selectedWorkerId, setSelectedWorkerId] = useState<string>('');
  const [assigning, setAssigning] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [workerSearchQuery, setWorkerSearchQuery] = useState('');

  // Set default filter based on route
  useEffect(() => {
    if (location.pathname.includes('/marketplace')) {
      setStatusFilter('REQUESTED');
    } else if (location.pathname.includes('/assigned')) {
      setStatusFilter('ASSIGNED');
    } else if (location.pathname.includes('/completed')) {
      setStatusFilter('COMPLETED');
    } else {
      setStatusFilter('ALL');
    }
  }, [location.pathname]);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    fetchHelpRequests();
    fetchSocialWorkers();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchQuery, typeFilter, statusFilter, priorityFilter, helpRequests]);

  const fetchHelpRequests = async () => {
    try {
      setLoading(true);
      const response = await helpRequestService.getAllRequests();
      if (response.data && Array.isArray(response.data)) {
        setHelpRequests(response.data);
      }
    } catch (err: any) {
      console.error('Error fetching help requests:', err);
      setError(err.response?.data?.message || 'Failed to load help requests');
    } finally {
      setLoading(false);
    }
  };

  const fetchSocialWorkers = async () => {
    try {
      const workers = await adminService.getSocialWorkers();
      if (Array.isArray(workers)) {
        // Map backend SocialWorker model to frontend structure if necessary
        // Assuming workers already have fullName or we need to fetch user details
        const mappedWorkers = workers.map((w: any) => {
          const id = w.id || w.userId || 'unknown';
          return {
            id: id,
            userId: w.userId || id,
            fullName: w.fullName || w.name || `Social Worker (${id.substring(0, 5)})`,
            specialization: Array.isArray(w.specializations) ? w.specializations.join(', ') : (w.specialization || 'General Social Work'),
            availabilityStatus: w.available ? 'AVAILABLE' : 'BUSY',
            registrationDate: w.registrationDate
          };
        });
        setSocialWorkers(mappedWorkers);
      }
    } catch (err) {
      console.error('Error fetching social workers:', err);
    }
  };

  const handleOpenAssignModal = (requestId: string) => {
    setSelectedRequestId(requestId);
    setShowAssignModal(true);
  };

  const handleAssignWorker = async () => {
    if (!selectedRequestId || !selectedWorkerId) return;

    try {
      setAssigning(true);
      setError(null);
      await helpRequestService.assignSocialWorker(selectedRequestId, selectedWorkerId);

      setSuccessMessage('Help request assigned successfully!');
      setShowAssignModal(false);
      setSelectedRequestId(null);
      setSelectedWorkerId('');
      setWorkerSearchQuery('');

      // Refresh requests
      fetchHelpRequests();

      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      console.error('Error assigning worker:', err);
      setError(err.response?.data?.message || 'Failed to assign help request');
    } finally {
      setAssigning(false);
    }
  };

  const filteredWorkers = socialWorkers.filter(worker =>
    worker.fullName.toLowerCase().includes(workerSearchQuery.toLowerCase()) ||
    worker.specialization.toLowerCase().includes(workerSearchQuery.toLowerCase())
  );

  const applyFilters = () => {
    let filtered = [...helpRequests];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(hr =>
        hr.trackingId?.toLowerCase().includes(query) ||
        hr.helpType?.toLowerCase().includes(query) ||
        hr.description?.toLowerCase().includes(query) || // Added description to search
        (typeof hr.location === 'string'
          ? hr.location.toLowerCase().includes(query)
          : (hr.location as any)?.address?.toLowerCase().includes(query)) || // Robust location search
        hr.requesterName?.toLowerCase().includes(query)
      );
    }

    if (typeFilter !== 'ALL') {
      filtered = filtered.filter(hr => hr.helpType === typeFilter);
    }

    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(hr => hr.status === statusFilter);
    }

    if (priorityFilter !== 'ALL') {
      filtered = filtered.filter(hr => hr.priority === priorityFilter);
    }

    setFilteredRequests(filtered);
    setCurrentPage(1);
  };

  const getStatusBadge = (status: string) => {
    const statusUpper = (status || '').toUpperCase();
    if (statusUpper.includes('COMPLETED') || statusUpper.includes('RESOLVED') || statusUpper.includes('DONE')) {
      return <Badge bg="success">COMPLETED</Badge>;
    }
    if (statusUpper.includes('UNDER_REVIEW') || statusUpper.includes('REVIEW')) {
      return <Badge bg="warning">UNDER REVIEW</Badge>;
    }
    if (statusUpper.includes('ACTIVE') || statusUpper.includes('IN_PROGRESS')) {
      return <Badge bg="info">IN PROGRESS</Badge>;
    }
    if (statusUpper.includes('PENDING') || statusUpper.includes('REQUESTED')) {
      return <Badge bg="primary">REQUESTED</Badge>;
    }
    if (statusUpper.includes('ASSIGNED')) {
      return <Badge bg="info">ASSIGNED</Badge>;
    }
    if (statusUpper.includes('REJECTED') || statusUpper.includes('CANCELLED')) {
      return <Badge bg="danger">{status}</Badge>;
    }
    return <Badge bg="secondary">{status}</Badge>;
  };

  const getPriorityBadge = (priority: string) => {
    const priorityUpper = priority.toUpperCase();
    if (priorityUpper === 'URGENT') {
      return <Badge bg="danger">URGENT</Badge>;
    }
    if (priorityUpper === 'HIGH') {
      return <Badge bg="warning">HIGH</Badge>;
    }
    if (priorityUpper === 'MEDIUM') {
      return <Badge bg="info">MEDIUM</Badge>;
    }
    return <Badge bg="secondary">LOW</Badge>;
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredRequests.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Loading help requests...</p>
      </div>
    );
  }

  return (
    <div className="help-request-management">
      <div className="page-header mb-4">
        <h2 className="page-title">🤝 Help Request Management</h2>
        <p className="page-subtitle">Manage and monitor all help requests in the system</p>
      </div>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {successMessage && (
        <Alert variant="success" dismissible onClose={() => setSuccessMessage(null)}>
          {successMessage}
        </Alert>
      )}

      { }
      <Card className="filter-card mb-4">
        <Card.Body>
          <Row className="g-3">
            <Col md={3}>
              <Form.Group>
                <Form.Label>Search</Form.Label>
                <InputGroup>
                  <Form.Control
                    type="text"
                    placeholder="ID, Type, Location..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <InputGroup.Text>🔍</InputGroup.Text>
                </InputGroup>
              </Form.Group>
            </Col>
            <Col md={2}>
              <Form.Group>
                <Form.Label>Type</Form.Label>
                <Form.Select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                >
                  <option value="ALL">All Types</option>
                  <option value="FOOD_ASSISTANCE">Food Assistance</option>
                  <option value="SHELTER">Shelter</option>
                  <option value="EDUCATION_SUPPORT">Education Support</option>
                  <option value="MEDICAL_HELP">Medical Help</option>
                  <option value="COUNSELING">Counseling</option>
                  <option value="CLOTHING">Clothing</option>
                  <option value="OTHER">Other</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={2}>
              <Form.Group>
                <Form.Label>Status</Form.Label>
                <Form.Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="ALL">All Status</option>
                  <option value="REQUESTED">Requested</option>
                  <option value="UNDER_REVIEW">Under Review</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="ASSIGNED">Assigned</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="REJECTED">Rejected</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={2}>
              <Form.Group>
                <Form.Label>Priority</Form.Label>
                <Form.Select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                >
                  <option value="ALL">All Priorities</option>
                  <option value="URGENT">Urgent</option>
                  <option value="HIGH">High</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="LOW">Low</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={3} className="d-flex align-items-end">
              <Button variant="outline-secondary" onClick={() => {
                setSearchQuery('');
                setTypeFilter('ALL');
                setStatusFilter('ALL');
                setPriorityFilter('ALL');
              }}>
                Clear Filters
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      { }
      <Card>
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Help Requests ({filteredRequests.length})</h5>
          <Button variant="primary" onClick={fetchHelpRequests}>
            <i className="bi bi-arrow-clockwise me-2"></i>
            Refresh
          </Button>
        </Card.Header>
        <Card.Body>
          {filteredRequests.length === 0 ? (
            <div className="text-center py-5">
              <p className="text-muted">No help requests found</p>
            </div>
          ) : (
            <>
              <Table responsive hover>
                <thead>
                  <tr>
                    <th>Tracking ID</th>
                    <th>Type</th>
                    <th>Child Age</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Worker</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentItems.map((hr) => (
                    <tr key={hr.id}>
                      <td>{hr.trackingId || (hr.id && hr.id.length >= 8 ? hr.id.substring(0, 8) : hr.id || 'N/A')}</td>
                      <td>{hr.helpType?.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}</td>
                      <td>{hr.childAge || 'N/A'}</td>
                      <td>{getPriorityBadge(hr.priority)}</td>
                      <td>{getStatusBadge(hr.status)}</td>
                      <td>
                        {hr.assignedWorker?.name ? hr.assignedWorker.name :
                          hr.assignedWorkerId ? `SW-${hr.assignedWorkerId.toString().substring(0, Math.min(hr.assignedWorkerId.toString().length, 4)).toUpperCase()}` :
                            '—'}
                      </td>
                      <td>
                        <Dropdown>
                          <Dropdown.Toggle variant="link" size="sm" className="p-0">
                            👁
                          </Dropdown.Toggle>
                          <Dropdown.Menu>
                            <Dropdown.Item onClick={() => navigate(`/admin/help-requests/${hr.id}`)}>
                              View Details
                            </Dropdown.Item>
                            <Dropdown.Item onClick={() => navigate(`/admin/help-requests/${hr.id}/edit`)}>
                              Edit
                            </Dropdown.Item>
                            <Dropdown.Item onClick={() => navigate(`/admin/transfers?helpRequestId=${hr.id}`)}>
                              Transfer
                            </Dropdown.Item>
                            <Dropdown.Divider />
                            <Dropdown.Item
                              onClick={() => handleOpenAssignModal(hr.id)}
                              disabled={hr.status === 'COMPLETED' || hr.status === 'REJECTED'}
                              className="text-primary"
                            >
                              Assign Worker
                            </Dropdown.Item>
                          </Dropdown.Menu>
                        </Dropdown>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>

              { }
              {totalPages > 1 && (
                <div className="d-flex justify-content-between align-items-center mt-3">
                  <div>
                    Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredRequests.length)} of {filteredRequests.length} requests
                  </div>
                  <div>
                    <Button
                      variant="outline-primary"
                      size="sm"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(currentPage - 1)}
                      className="me-2"
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline-primary"
                      size="sm"
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(currentPage + 1)}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </Card.Body>
      </Card>

      {/* Assignment Modal */}
      <Modal show={showAssignModal} onHide={() => { setShowAssignModal(false); setWorkerSearchQuery(''); }} centered size="lg">
        <Modal.Header closeButton className="bg-primary text-white">
          <Modal.Title>🤝 Assign Social Worker</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="mb-4">
            <h6 className="text-muted mb-2">Assigning Request ID: <code className="text-primary">{selectedRequestId}</code></h6>
            <Form.Control
              type="text"
              placeholder="🔍 Search workers by name or specialization..."
              value={workerSearchQuery}
              onChange={(e) => setWorkerSearchQuery(e.target.value)}
              className="mb-3 rounded-pill"
            />
          </div>

          <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            <Table hover responsive borderless className="align-middle">
              <thead className="bg-light sticky-top">
                <tr>
                  <th style={{ width: '40%' }}>Worker Name</th>
                  <th style={{ width: '30%' }}>Specializations</th>
                  <th style={{ width: '15%' }}>Registered</th>
                  <th style={{ width: '15%' }} className="text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredWorkers.length > 0 ? (
                  filteredWorkers.map(worker => (
                    <tr key={worker.id} className={selectedWorkerId === worker.id ? 'table-primary' : ''}>
                      <td>
                        <div className="fw-bold">{worker.fullName}</div>
                        <small className="text-muted">ID: {worker.id.substring(0, 8)}</small>
                      </td>
                      <td>
                        {worker.specialization.split(',').map((spec, idx) => (
                          <Badge
                            key={idx}
                            bg="info"
                            className="me-1 mb-1 fw-normal text-capitalize"
                            style={{ fontSize: '0.75rem', backgroundColor: '#e0f2f1', color: '#00695c', border: '1px solid #b2dfdb' }}
                          >
                            {spec.trim().toLowerCase().replace(/_/g, ' ')}
                          </Badge>
                        ))}
                      </td>
                      <td>
                        <small className="text-muted">
                          {worker.registrationDate ? new Date(worker.registrationDate).toLocaleDateString() : 'N/A'}
                        </small>
                      </td>
                      <td className="text-center">
                        <Button
                          variant={selectedWorkerId === worker.id ? 'primary' : 'outline-primary'}
                          size="sm"
                          onClick={() => setSelectedWorkerId(worker.id)}
                          className="rounded-pill px-3"
                        >
                          {selectedWorkerId === worker.id ? 'Selected ✓' : 'Select'}
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="text-center py-5 text-muted">
                      No social workers found matching your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>
        </Modal.Body>
        <Modal.Footer className="bg-light">
          <Button variant="outline-secondary" onClick={() => { setShowAssignModal(false); setWorkerSearchQuery(''); }} disabled={assigning}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleAssignWorker}
            disabled={assigning || !selectedWorkerId}
            className="px-4"
          >
            {assigning ? <><Spinner size="sm" className="me-2" /> Assigning...</> : 'Confirm Assignment'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default HelpRequestManagement;

