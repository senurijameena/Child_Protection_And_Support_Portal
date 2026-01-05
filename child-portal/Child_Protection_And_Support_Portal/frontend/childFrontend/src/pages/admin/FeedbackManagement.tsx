import React, { useState, useEffect } from 'react';
import {
  Row, Col, Card, Button, Spinner, Alert,
  Form, Table, Badge, InputGroup, Modal
} from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import './FeedbackManagement.css';

interface Feedback {
  id: string;
  rating: number;
  message?: string;
  category?: string;
  type?: string;
  status: string;
  adminResponse?: string;
  createdAt: string;
  userId?: string;
  userName?: string;
  caseId?: string;
  helpRequestId?: string;
}

const FeedbackManagement: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [filteredFeedbacks, setFilteredFeedbacks] = useState<Feedback[]>([]);

  const [searchQuery, setSearchQuery] = useState('');
  const [ratingFilter, setRatingFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');

  const [showResponseModal, setShowResponseModal] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);
  const [responseText, setResponseText] = useState('');

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchQuery, ratingFilter, statusFilter, categoryFilter, feedbacks]);

  const fetchFeedbacks = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/feedback/all');
      if (response.data && Array.isArray(response.data)) {
        setFeedbacks(response.data);
      }
    } catch (err: any) {
      console.error('Error fetching feedbacks:', err);
      setError(err.response?.data?.message || 'Failed to load feedback');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...feedbacks];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(f =>
        f.message?.toLowerCase().includes(query) ||
        f.userName?.toLowerCase().includes(query) ||
        f.category?.toLowerCase().includes(query)
      );
    }

    if (ratingFilter !== 'ALL') {
      const rating = parseInt(ratingFilter);
      filtered = filtered.filter(f => f.rating === rating);
    }

    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(f => f.status === statusFilter);
    }

    if (categoryFilter !== 'ALL') {
      filtered = filtered.filter(f => f.category === categoryFilter);
    }

    setFilteredFeedbacks(filtered);
  };

  const handleRespond = (feedback: Feedback) => {
    setSelectedFeedback(feedback);
    setResponseText(feedback.adminResponse || '');
    setShowResponseModal(true);
  };

  const handleSubmitResponse = async () => {
    if (!selectedFeedback || !responseText.trim()) {
      setError('Response text is required');
      return;
    }

    try {
      await api.post(`/api/feedback/${selectedFeedback.id}/respond`, {
        response: responseText
      });
      setSuccess('Response submitted successfully');
      setShowResponseModal(false);
      setSelectedFeedback(null);
      setResponseText('');
      fetchFeedbacks();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit response');
    }
  };

  const getRatingStars = (rating: number) => {
    return '⭐'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  const getStatusBadge = (status: string) => {
    const statusUpper = status.toUpperCase();
    if (statusUpper === 'RESPONDED') {
      return <Badge bg="success">Responded</Badge>;
    }
    if (statusUpper === 'SUBMITTED' || statusUpper === 'PENDING') {
      return <Badge bg="warning">Pending</Badge>;
    }
    return <Badge bg="secondary">{status}</Badge>;
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Loading feedback...</p>
      </div>
    );
  }

  return (
    <div className="feedback-management">
      <div className="page-header mb-4">
        <h2 className="page-title">⭐ Feedback Management</h2>
        <p className="page-subtitle">Review and respond to user feedback</p>
      </div>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert variant="success" dismissible onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      {}
      <Card className="filter-card mb-4">
        <Card.Body>
          <Row className="g-3">
            <Col md={4}>
              <Form.Group>
                <Form.Label>Search</Form.Label>
                <InputGroup>
                  <Form.Control
                    type="text"
                    placeholder="Message, User, Category..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <InputGroup.Text>🔍</InputGroup.Text>
                </InputGroup>
              </Form.Group>
            </Col>
            <Col md={2}>
              <Form.Group>
                <Form.Label>Rating</Form.Label>
                <Form.Select
                  value={ratingFilter}
                  onChange={(e) => setRatingFilter(e.target.value)}
                >
                  <option value="ALL">All Ratings</option>
                  <option value="5">5 Stars</option>
                  <option value="4">4 Stars</option>
                  <option value="3">3 Stars</option>
                  <option value="2">2 Stars</option>
                  <option value="1">1 Star</option>
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
                  <option value="SUBMITTED">Submitted</option>
                  <option value="PENDING">Pending</option>
                  <option value="RESPONDED">Responded</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={2}>
              <Form.Group>
                <Form.Label>Category</Form.Label>
                <Form.Select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                >
                  <option value="ALL">All Categories</option>
                  <option value="CASE">Case</option>
                  <option value="HELP_REQUEST">Help Request</option>
                  <option value="SYSTEM">System</option>
                  <option value="GENERAL">General</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={2} className="d-flex align-items-end">
              <Button variant="outline-secondary" onClick={() => {
                setSearchQuery('');
                setRatingFilter('ALL');
                setStatusFilter('ALL');
                setCategoryFilter('ALL');
              }}>
                Clear
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {}
      <Card>
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Feedback ({filteredFeedbacks.length})</h5>
          <Button variant="primary" onClick={fetchFeedbacks}>
            <i className="bi bi-arrow-clockwise me-2"></i>
            Refresh
          </Button>
        </Card.Header>
        <Card.Body>
          {filteredFeedbacks.length === 0 ? (
            <div className="text-center py-5">
              <p className="text-muted">No feedback found</p>
            </div>
          ) : (
            <Table responsive hover>
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Rating</th>
                  <th>Category</th>
                  <th>Message</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredFeedbacks.map((feedback) => (
                  <tr key={feedback.id}>
                    <td>
                      <Badge bg="info">
                        {feedback.type || feedback.caseId ? 'Case' : feedback.helpRequestId ? 'Help' : 'General'}
                      </Badge>
                    </td>
                    <td>{getRatingStars(feedback.rating || 0)}</td>
                    <td>{feedback.category || 'N/A'}</td>
                    <td>
                      <div style={{ maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {feedback.message || 'No message'}
                      </div>
                    </td>
                    <td>{getStatusBadge(feedback.status)}</td>
                    <td>{new Date(feedback.createdAt).toLocaleDateString()}</td>
                    <td>
                      <Button
                        variant="link"
                        size="sm"
                        onClick={() => handleRespond(feedback)}
                      >
                        {feedback.adminResponse ? 'Edit Response' : 'Respond'}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      {}
      <Modal show={showResponseModal} onHide={() => {
        setShowResponseModal(false);
        setSelectedFeedback(null);
        setResponseText('');
      }}>
        <Modal.Header closeButton>
          <Modal.Title>Respond to Feedback</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedFeedback && (
            <>
              <div className="mb-3">
                <strong>Rating:</strong> {getRatingStars(selectedFeedback.rating || 0)}
              </div>
              <div className="mb-3">
                <strong>Message:</strong>
                <p className="mt-2">{selectedFeedback.message || 'No message'}</p>
              </div>
              <Form.Group>
                <Form.Label>Admin Response</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={4}
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  placeholder="Enter your response..."
                />
              </Form.Group>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => {
            setShowResponseModal(false);
            setSelectedFeedback(null);
            setResponseText('');
          }}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmitResponse}>
            Submit Response
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default FeedbackManagement;

