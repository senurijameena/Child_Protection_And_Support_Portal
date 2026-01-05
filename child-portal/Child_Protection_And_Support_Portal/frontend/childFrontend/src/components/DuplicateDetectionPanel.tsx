import React, { useState, useEffect } from 'react';
import { Card, Alert, Spinner, Badge, Button, Modal, Table } from 'react-bootstrap';
import { duplicateDetectionService, type DuplicateDetection } from '../services/duplicateDetectionService';
import { useNavigate } from 'react-router-dom';

interface DuplicateDetectionPanelProps {
  entityId: string;
  entityType: 'CASE' | 'HELP_REQUEST';
  onViewDuplicate?: (id: string, type: string) => void;
}

const DuplicateDetectionPanel: React.FC<DuplicateDetectionPanelProps> = ({
  entityId,
  entityType,
  onViewDuplicate
}) => {
  const navigate = useNavigate();
  const [duplicates, setDuplicates] = useState<DuplicateDetection[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedDuplicate, setSelectedDuplicate] = useState<DuplicateDetection | null>(null);

  useEffect(() => {
    loadDuplicates();
  }, [entityId, entityType]);

  const loadDuplicates = async () => {
    setLoading(true);
    setError(null);
    try {
      const results = entityType === 'CASE'
        ? await duplicateDetectionService.findDuplicateCases(entityId)
        : await duplicateDetectionService.findDuplicateHelpRequests(entityId);
      setDuplicates(results);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load potential duplicates');
      console.error('Error loading duplicates:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDuplicate = (duplicate: DuplicateDetection) => {
    setSelectedDuplicate(duplicate);
    setShowDetails(true);
  };

  const handleNavigateToDuplicate = (duplicate: DuplicateDetection) => {
    if (onViewDuplicate) {
      onViewDuplicate(duplicate.id, duplicate.type);
    } else {
      const path = duplicate.type === 'CASE'
        ? `/cases/${duplicate.id}`
        : `/help-requests/${duplicate.id}`;
      navigate(path);
    }
  };

  const getSimilarityBadgeVariant = (score: number): string => {
    if (score >= 0.8) return 'danger';
    if (score >= 0.6) return 'warning';
    return 'info';
  };

  const getSimilarityLabel = (score: number): string => {
    if (score >= 0.8) return 'High Similarity';
    if (score >= 0.6) return 'Medium Similarity';
    return 'Low Similarity';
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  if (loading) {
    return (
      <Card className="mb-4">
        <Card.Header>
          <h5 className="mb-0">
            <i className="bi bi-search me-2"></i>
            Potential Duplicates
          </h5>
        </Card.Header>
        <Card.Body className="text-center">
          <Spinner animation="border" size="sm" className="me-2" />
          <span>Checking for duplicates...</span>
        </Card.Body>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="mb-4">
        <Card.Header>
          <h5 className="mb-0">
            <i className="bi bi-exclamation-triangle me-2"></i>
            Duplicate Detection
          </h5>
        </Card.Header>
        <Card.Body>
          <Alert variant="warning">{error}</Alert>
        </Card.Body>
      </Card>
    );
  }

  if (duplicates.length === 0) {
    return (
      <Card className="mb-4">
        <Card.Header>
          <h5 className="mb-0">
            <i className="bi bi-check-circle me-2 text-success"></i>
            No Duplicates Found
          </h5>
        </Card.Header>
        <Card.Body>
          <p className="text-muted mb-0">
            No similar {entityType === 'CASE' ? 'cases' : 'help requests'} found in the system.
          </p>
        </Card.Body>
      </Card>
    );
  }

  return (
    <>
      <Card className="mb-4 border-warning">
        <Card.Header className="bg-warning bg-opacity-10">
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0">
              <i className="bi bi-exclamation-triangle-fill me-2 text-warning"></i>
              Potential Duplicates Found ({duplicates.length})
            </h5>
            <Button variant="outline-secondary" size="sm" onClick={loadDuplicates}>
              <i className="bi bi-arrow-clockwise me-1"></i>
              Refresh
            </Button>
          </div>
        </Card.Header>
        <Card.Body>
          <Alert variant="warning" className="mb-3">
            <strong>Warning:</strong> The following {entityType === 'CASE' ? 'cases' : 'help requests'} 
            have similar characteristics. Please review to ensure they are not duplicates.
          </Alert>

          <div className="table-responsive">
            <Table hover size="sm">
              <thead>
                <tr>
                  <th>Tracking ID</th>
                  <th>Type</th>
                  <th>Location</th>
                  <th>Age/Gender</th>
                  <th>Date</th>
                  <th>Similarity</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {duplicates.map((duplicate) => (
                  <tr key={duplicate.id}>
                    <td>
                      <code>{duplicate.trackingId}</code>
                    </td>
                    <td>
                      <Badge bg={duplicate.type === 'CASE' ? 'primary' : 'info'}>
                        {duplicate.type === 'CASE' ? 'Case' : 'Help Request'}
                      </Badge>
                    </td>
                    <td>{duplicate.location || 'N/A'}</td>
                    <td>
                      {duplicate.approximateAge || 'N/A'} / {duplicate.gender || 'N/A'}
                    </td>
                    <td>{formatDate(duplicate.date)}</td>
                    <td>
                      <Badge bg={getSimilarityBadgeVariant(duplicate.similarityScore)}>
                        {Math.round(duplicate.similarityScore * 100)}% - {getSimilarityLabel(duplicate.similarityScore)}
                      </Badge>
                      <br />
                      <small className="text-muted">{duplicate.similarityReason}</small>
                    </td>
                    <td>
                      <div className="d-flex gap-1">
                        <Button
                          variant="outline-primary"
                          size="sm"
                          onClick={() => handleViewDuplicate(duplicate)}
                          title="View Details"
                        >
                          <i className="bi bi-eye"></i>
                        </Button>
                        <Button
                          variant="outline-success"
                          size="sm"
                          onClick={() => handleNavigateToDuplicate(duplicate)}
                          title="Open {duplicate.type}"
                        >
                          <i className="bi bi-box-arrow-up-right"></i>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>

      <Modal show={showDetails} onHide={() => setShowDetails(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            Duplicate Details - {selectedDuplicate?.trackingId}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedDuplicate && (
            <div>
              <Table borderless size="sm">
                <tbody>
                  <tr>
                    <td><strong>Type:</strong></td>
                    <td>
                      <Badge bg={selectedDuplicate.type === 'CASE' ? 'primary' : 'info'}>
                        {selectedDuplicate.type}
                      </Badge>
                    </td>
                  </tr>
                  <tr>
                    <td><strong>Title:</strong></td>
                    <td>{selectedDuplicate.title}</td>
                  </tr>
                  <tr>
                    <td><strong>Location:</strong></td>
                    <td>{selectedDuplicate.location || 'N/A'}</td>
                  </tr>
                  <tr>
                    <td><strong>Age:</strong></td>
                    <td>{selectedDuplicate.approximateAge || 'N/A'}</td>
                  </tr>
                  <tr>
                    <td><strong>Gender:</strong></td>
                    <td>{selectedDuplicate.gender || 'N/A'}</td>
                  </tr>
                  {selectedDuplicate.identificationMarks && (
                    <tr>
                      <td><strong>ID Marks:</strong></td>
                      <td>{selectedDuplicate.identificationMarks}</td>
                    </tr>
                  )}
                  <tr>
                    <td><strong>Date:</strong></td>
                    <td>{formatDate(selectedDuplicate.date)}</td>
                  </tr>
                  <tr>
                    <td><strong>Status:</strong></td>
                    <td>
                      <Badge bg="secondary">{selectedDuplicate.status}</Badge>
                    </td>
                  </tr>
                  <tr>
                    <td><strong>Reporter/Requester:</strong></td>
                    <td>
                      {selectedDuplicate.reporterName || selectedDuplicate.requesterName || 'N/A'}
                    </td>
                  </tr>
                  <tr>
                    <td><strong>Similarity Score:</strong></td>
                    <td>
                      <Badge bg={getSimilarityBadgeVariant(selectedDuplicate.similarityScore)}>
                        {Math.round(selectedDuplicate.similarityScore * 100)}%
                      </Badge>
                    </td>
                  </tr>
                  <tr>
                    <td><strong>Similarity Reason:</strong></td>
                    <td>{selectedDuplicate.similarityReason}</td>
                  </tr>
                  {selectedDuplicate.description && (
                    <tr>
                      <td><strong>Description:</strong></td>
                      <td>{selectedDuplicate.description}</td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDetails(false)}>
            Close
          </Button>
          {selectedDuplicate && (
            <Button
              variant="primary"
              onClick={() => {
                setShowDetails(false);
                handleNavigateToDuplicate(selectedDuplicate);
              }}
            >
              <i className="bi bi-box-arrow-up-right me-1"></i>
              Open {selectedDuplicate.type}
            </Button>
          )}
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default DuplicateDetectionPanel;

