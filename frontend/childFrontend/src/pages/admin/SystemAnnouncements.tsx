import React, { useState, useEffect } from 'react';
import {
  Row, Col, Card, Button, Spinner, Alert,
  Form, Table, Badge, Modal
} from 'react-bootstrap';
import { api } from '../../services/api';
import './SystemAnnouncements.css';

interface Announcement {
  id: string;
  title: string;
  message: string;
  type: string;
  expiryDate?: string;
  createdAt: string;
  createdBy?: string;
  isActive: boolean;
}

const SystemAnnouncements: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'INFO',
    expiryDate: ''
  });

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);

      const response = await api.get('/api/announcements/all').catch(() => ({ data: [] }));
      if (response.data && Array.isArray(response.data)) {
        setAnnouncements(response.data);
      }
    } catch (err: any) {
      console.error('Error fetching announcements:', err);

      if (err.response?.status !== 404) {
        setError(err.response?.data?.message || 'Failed to load announcements');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!formData.title.trim() || !formData.message.trim()) {
      setError('Title and message are required');
      return;
    }

    try {
      await api.post('/api/announcements', formData);
      setSuccess('Announcement created successfully');
      setShowCreateModal(false);
      setFormData({ title: '', message: '', type: 'INFO', expiryDate: '' });
      fetchAnnouncements();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create announcement');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this announcement?')) {
      return;
    }

    try {
      await api.delete(`/api/announcements/${id}`);
      setSuccess('Announcement deleted successfully');
      fetchAnnouncements();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete announcement');
    }
  };

  const getTypeBadge = (type: string) => {
    const typeUpper = type.toUpperCase();
    if (typeUpper === 'EMERGENCY' || typeUpper === 'URGENT') {
      return <Badge bg="danger">{type}</Badge>;
    }
    if (typeUpper === 'WARNING') {
      return <Badge bg="warning">{type}</Badge>;
    }
    if (typeUpper === 'INFO') {
      return <Badge bg="info">{type}</Badge>;
    }
    return <Badge bg="secondary">{type}</Badge>;
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Loading announcements...</p>
      </div>
    );
  }

  return (
    <div className="system-announcements">
      <div className="page-header mb-4">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h2 className="page-title">📢 System Announcements</h2>
            <p className="page-subtitle">Create and manage system-wide announcements</p>
          </div>
          <Button variant="primary" onClick={() => setShowCreateModal(true)}>
            <i className="bi bi-plus-circle me-2"></i>
            Create New Announcement
          </Button>
        </div>
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
      <Card>
        <Card.Header>
          <h5 className="mb-0">System Announcements ({announcements.length})</h5>
        </Card.Header>
        <Card.Body>
          {announcements.length === 0 ? (
            <div className="text-center py-5">
              <p className="text-muted">No announcements yet</p>
              <Button variant="primary" onClick={() => setShowCreateModal(true)}>
                Create First Announcement
              </Button>
            </div>
          ) : (
            <Table responsive hover>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Type</th>
                  <th>Message</th>
                  <th>Expiry Date</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {announcements.map((announcement) => (
                  <tr key={announcement.id}>
                    <td><strong>{announcement.title}</strong></td>
                    <td>{getTypeBadge(announcement.type)}</td>
                    <td>
                      <div style={{ maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {announcement.message}
                      </div>
                    </td>
                    <td>
                      {announcement.expiryDate ? 
                        new Date(announcement.expiryDate).toLocaleDateString() : 
                        'No expiry'}
                    </td>
                    <td>
                      <Badge bg={announcement.isActive ? 'success' : 'secondary'}>
                        {announcement.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td>{new Date(announcement.createdAt).toLocaleDateString()}</td>
                    <td>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDelete(announcement.id)}
                      >
                        Delete
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
      <Modal show={showCreateModal} onHide={() => {
        setShowCreateModal(false);
        setFormData({ title: '', message: '', type: 'INFO', expiryDate: '' });
      }} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Create New Announcement</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Title *</Form.Label>
              <Form.Control
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter announcement title"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Message *</Form.Label>
              <Form.Control
                as="textarea"
                rows={5}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Enter announcement message"
              />
            </Form.Group>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Type</Form.Label>
                  <Form.Select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  >
                    <option value="INFO">Info</option>
                    <option value="WARNING">Warning</option>
                    <option value="URGENT">Urgent</option>
                    <option value="EMERGENCY">Emergency</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Expiry Date (Optional)</Form.Label>
                  <Form.Control
                    type="date"
                    value={formData.expiryDate}
                    onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                  />
                </Form.Group>
              </Col>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => {
            setShowCreateModal(false);
            setFormData({ title: '', message: '', type: 'INFO', expiryDate: '' });
          }}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleCreate}>
            Publish Announcement
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default SystemAnnouncements;

