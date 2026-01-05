import React, { useState, useEffect } from 'react';
import {
  Row, Col, Card, Button, Spinner, Alert,
  Form, Table, Badge, InputGroup
} from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { caseService } from '../../services/caseService';
import { duplicateDetectionService } from '../../services/duplicateDetectionService';
import './DuplicateDetection.css';

interface Case {
  id: string;
  trackingId?: string;
  caseType?: string;
  status?: string;
  priority?: string;
  location?: string;
  approximateAge?: string;
  gender?: string;
  identificationMarks?: string;
  incidentDate?: string;
  description?: string;
  reporterName?: string;
}

interface DuplicateMatch {
  id: string;
  trackingId?: string;
  type: string;
  title: string;
  description?: string;
  location?: string;
  approximateAge?: string;
  gender?: string;
  identificationMarks?: string;
  date?: string;
  status?: string;
  similarityScore: number;
  similarityReason?: string;
}

const DuplicateDetection: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cases, setCases] = useState<Case[]>([]);
  const [selectedCaseA, setSelectedCaseA] = useState<Case | null>(null);
  const [selectedCaseB, setSelectedCaseB] = useState<Case | null>(null);
  const [duplicates, setDuplicates] = useState<DuplicateMatch[]>([]);
  const [similarityScore, setSimilarityScore] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchCases();
  }, []);

  useEffect(() => {
    if (selectedCaseA) {
      findDuplicates(selectedCaseA.id);
    }
  }, [selectedCaseA]);

  const fetchCases = async () => {
    try {
      setLoading(true);
      const response = await caseService.getAllCases();
      if (response.data && Array.isArray(response.data)) {
        setCases(response.data);
      }
    } catch (err: any) {
      console.error('Error fetching cases:', err);
      setError(err.response?.data?.message || 'Failed to load cases');
    } finally {
      setLoading(false);
    }
  };

  const findDuplicates = async (caseId: string) => {
    try {
      const matches = await duplicateDetectionService.findDuplicateCases(caseId);
      setDuplicates(matches);
    } catch (err: any) {
      console.error('Error finding duplicates:', err);
    }
  };

  const handleSelectCaseA = (caseItem: Case) => {
    setSelectedCaseA(caseItem);
    setSelectedCaseB(null);
    setSimilarityScore(0);
  };

  const handleSelectCaseB = (caseItem: Case) => {
    setSelectedCaseB(caseItem);
    if (selectedCaseA && caseItem) {

      const match = duplicates.find(d => d.id === caseItem.id);
      if (match) {
        setSimilarityScore(match.similarityScore);
      }
    }
  };

  const getSimilarityColor = (score: number) => {
    if (score >= 0.8) return 'danger';
    if (score >= 0.6) return 'warning';
    if (score >= 0.4) return 'info';
    return 'secondary';
  };

  const highlightSimilarFields = (fieldA: string, fieldB: string) => {
    if (fieldA && fieldB && fieldA.toLowerCase() === fieldB.toLowerCase()) {
      return { backgroundColor: '#fff3cd', padding: '2px 4px', borderRadius: '4px' };
    }
    return {};
  };

  const filteredCases = cases.filter(c =>
    !searchQuery ||
    c.trackingId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.caseType?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.location?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="duplicate-detection">
      <div className="page-header mb-4">
        <h2 className="page-title">🔍 Duplicate Detection</h2>
        <p className="page-subtitle">Compare and identify potential duplicate cases</p>
      </div>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {}
      <Card className="mb-4">
        <Card.Body>
          <Row>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Search Cases</Form.Label>
                <InputGroup>
                  <Form.Control
                    type="text"
                    placeholder="Search by ID, Type, Location..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <InputGroup.Text>🔍</InputGroup.Text>
                </InputGroup>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Select Case A (Primary)</Form.Label>
                <Form.Select
                  value={selectedCaseA?.id || ''}
                  onChange={(e) => {
                    const caseItem = cases.find(c => c.id === e.target.value);
                    if (caseItem) handleSelectCaseA(caseItem);
                  }}
                >
                  <option value="">Select a case...</option>
                  {filteredCases.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.trackingId || c.id.substring(0, 8)} - {c.caseType} - {c.location}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {}
      {selectedCaseA && (
        <Row className="g-4">
          {}
          <Col md={6}>
            <Card className="case-comparison-card">
              <Card.Header className="bg-primary text-white">
                <h5 className="mb-0">Case A: {selectedCaseA.trackingId || selectedCaseA.id.substring(0, 8)}</h5>
              </Card.Header>
              <Card.Body>
                <div className="case-details">
                  <div className="detail-row">
                    <strong>Type:</strong>
                    <span style={highlightSimilarFields(selectedCaseA.caseType || '', selectedCaseB?.caseType || '')}>
                      {selectedCaseA.caseType || 'N/A'}
                    </span>
                  </div>
                  <div className="detail-row">
                    <strong>Location:</strong>
                    <span style={highlightSimilarFields(selectedCaseA.location || '', selectedCaseB?.location || '')}>
                      {selectedCaseA.location || 'N/A'}
                    </span>
                  </div>
                  <div className="detail-row">
                    <strong>Age:</strong>
                    <span style={highlightSimilarFields(selectedCaseA.approximateAge || '', selectedCaseB?.approximateAge || '')}>
                      {selectedCaseA.approximateAge || 'N/A'}
                    </span>
                  </div>
                  <div className="detail-row">
                    <strong>Gender:</strong>
                    <span style={highlightSimilarFields(selectedCaseA.gender || '', selectedCaseB?.gender || '')}>
                      {selectedCaseA.gender || 'N/A'}
                    </span>
                  </div>
                  <div className="detail-row">
                    <strong>Identification Marks:</strong>
                    <span style={highlightSimilarFields(selectedCaseA.identificationMarks || '', selectedCaseB?.identificationMarks || '')}>
                      {selectedCaseA.identificationMarks || 'N/A'}
                    </span>
                  </div>
                  <div className="detail-row">
                    <strong>Incident Date:</strong>
                    <span>
                      {selectedCaseA.incidentDate ? 
                        new Date(selectedCaseA.incidentDate).toLocaleDateString() : 
                        'N/A'}
                    </span>
                  </div>
                  <div className="detail-row">
                    <strong>Status:</strong>
                    <Badge bg="info">{selectedCaseA.status || 'N/A'}</Badge>
                  </div>
                  <div className="detail-row">
                    <strong>Description:</strong>
                    <p className="mt-2">{selectedCaseA.description || 'No description'}</p>
                  </div>
                </div>
                <div className="mt-3">
                  <Button
                    variant="outline-primary"
                    onClick={() => navigate(`/admin/cases/${selectedCaseA.id}`)}
                  >
                    View Full Details
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>

          {}
          <Col md={6}>
            {selectedCaseB ? (
              <Card className="case-comparison-card">
                <Card.Header className="bg-success text-white">
                  <h5 className="mb-0">Case B: {selectedCaseB.trackingId || selectedCaseB.id.substring(0, 8)}</h5>
                </Card.Header>
                <Card.Body>
                  <div className="similarity-score mb-3">
                    <Badge bg={getSimilarityColor(similarityScore)} className="p-2" style={{ fontSize: '1.2rem' }}>
                      Similarity: {(similarityScore * 100).toFixed(1)}%
                    </Badge>
                  </div>
                  <div className="case-details">
                    <div className="detail-row">
                      <strong>Type:</strong>
                      <span style={highlightSimilarFields(selectedCaseA.caseType || '', selectedCaseB.caseType || '')}>
                        {selectedCaseB.caseType || 'N/A'}
                      </span>
                    </div>
                    <div className="detail-row">
                      <strong>Location:</strong>
                      <span style={highlightSimilarFields(selectedCaseA.location || '', selectedCaseB.location || '')}>
                        {selectedCaseB.location || 'N/A'}
                      </span>
                    </div>
                    <div className="detail-row">
                      <strong>Age:</strong>
                      <span style={highlightSimilarFields(selectedCaseA.approximateAge || '', selectedCaseB.approximateAge || '')}>
                        {selectedCaseB.approximateAge || 'N/A'}
                      </span>
                    </div>
                    <div className="detail-row">
                      <strong>Gender:</strong>
                      <span style={highlightSimilarFields(selectedCaseA.gender || '', selectedCaseB.gender || '')}>
                        {selectedCaseB.gender || 'N/A'}
                      </span>
                    </div>
                    <div className="detail-row">
                      <strong>Identification Marks:</strong>
                      <span style={highlightSimilarFields(selectedCaseA.identificationMarks || '', selectedCaseB.identificationMarks || '')}>
                        {selectedCaseB.identificationMarks || 'N/A'}
                      </span>
                    </div>
                    <div className="detail-row">
                      <strong>Incident Date:</strong>
                      <span>
                        {selectedCaseB.incidentDate ? 
                          new Date(selectedCaseB.incidentDate).toLocaleDateString() : 
                          'N/A'}
                      </span>
                    </div>
                    <div className="detail-row">
                      <strong>Status:</strong>
                      <Badge bg="info">{selectedCaseB.status || 'N/A'}</Badge>
                    </div>
                    <div className="detail-row">
                      <strong>Description:</strong>
                      <p className="mt-2">{selectedCaseB.description || 'No description'}</p>
                    </div>
                  </div>
                  <div className="mt-3 d-flex gap-2">
                    <Button
                      variant="outline-primary"
                      onClick={() => navigate(`/admin/cases/${selectedCaseB.id}`)}
                    >
                      View Full Details
                    </Button>
                    <Button variant="warning" onClick={() => setSelectedCaseB(null)}>
                      Clear Selection
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            ) : (
              <Card>
                <Card.Header>
                  <h5 className="mb-0">Potential Duplicates</h5>
                </Card.Header>
                <Card.Body>
                  {duplicates.length === 0 ? (
                    <div className="text-center py-4">
                      <p className="text-muted">No potential duplicates found</p>
                    </div>
                  ) : (
                    <Table responsive hover>
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Similarity</th>
                          <th>Type</th>
                          <th>Location</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {duplicates.map((dup) => {
                          const caseItem = cases.find(c => c.id === dup.id);
                          return (
                            <tr key={dup.id}>
                              <td>{dup.trackingId || dup.id.substring(0, 8)}</td>
                              <td>
                                <Badge bg={getSimilarityColor(dup.similarityScore)}>
                                  {(dup.similarityScore * 100).toFixed(0)}%
                                </Badge>
                              </td>
                              <td>{dup.title}</td>
                              <td>{dup.location || 'N/A'}</td>
                              <td>
                                <Button
                                  variant="link"
                                  size="sm"
                                  onClick={() => caseItem && handleSelectCaseB(caseItem)}
                                >
                                  Compare
                                </Button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </Table>
                  )}
                </Card.Body>
              </Card>
            )}
          </Col>
        </Row>
      )}

      {!selectedCaseA && (
        <Card>
          <Card.Body className="text-center py-5">
            <p className="text-muted">Select a case from the dropdown above to start duplicate detection</p>
          </Card.Body>
        </Card>
      )}
    </div>
  );
};

export default DuplicateDetection;

