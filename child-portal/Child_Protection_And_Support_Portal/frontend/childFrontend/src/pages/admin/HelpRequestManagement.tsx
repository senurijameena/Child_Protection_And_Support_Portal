import React, { useState, useEffect } from 'react';
import {
  Row, Col, Card, Button, Spinner, Alert,
  Form, Table, Badge, InputGroup, Dropdown
} from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import { helpRequestService } from '../../services/helpRequestService';
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
  
  // Set default filter based on route
  useEffect(() => {
    if (location.pathname.includes('/marketplace')) {
      setStatusFilter('PENDING');
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

  const applyFilters = () => {
    let filtered = [...helpRequests];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(hr =>
        hr.trackingId?.toLowerCase().includes(query) ||
        hr.helpType?.toLowerCase().includes(query) ||
        hr.location?.toLowerCase().includes(query) ||
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
    const statusUpper = status.toUpperCase();
    if (statusUpper.includes('COMPLETED') || statusUpper.includes('RESOLVED')) {
      return <Badge bg="success">{status}</Badge>;
    }
    if (statusUpper.includes('ACTIVE') || statusUpper.includes('IN_PROGRESS')) {
      return <Badge bg="info">{status}</Badge>;
    }
    if (statusUpper.includes('PENDING')) {
      return <Badge bg="warning">{status}</Badge>;
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

      {}
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
                  <option value="FOOD">Food</option>
                  <option value="SHELTER">Shelter</option>
                  <option value="EDUCATION">Education</option>
                  <option value="MEDICAL">Medical</option>
                  <option value="COUNSELING">Counseling</option>
                  <option value="CLOTHING">Clothing</option>
                  <option value="FINANCIAL">Financial</option>
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
                  <option value="PENDING">Pending</option>
                  <option value="ACTIVE">Active</option>
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

      {}
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
                      <td>{hr.trackingId || hr.id.substring(0, 8)}</td>
                      <td>{hr.helpType?.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}</td>
                      <td>{hr.childAge || 'N/A'}</td>
                      <td>{getPriorityBadge(hr.priority)}</td>
                      <td>{getStatusBadge(hr.status)}</td>
                      <td>
                        {hr.assignedWorker?.name || hr.assignedWorkerId ? 
                          (hr.assignedWorker?.name || `SW-${hr.assignedWorkerId?.substring(0, 2)}`) : 
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
                          </Dropdown.Menu>
                        </Dropdown>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>

              {}
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
    </div>
  );
};

export default HelpRequestManagement;

