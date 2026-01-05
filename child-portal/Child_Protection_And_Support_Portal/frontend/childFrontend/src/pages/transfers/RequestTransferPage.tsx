
import React, { useState, useEffect } from 'react';
import {
  Container, Row, Col, Card, Form, Button, Alert, Spinner,
  ProgressBar, Badge, Modal, Table
} from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import { caseService } from '../../services/caseService';
import { helpRequestService } from '../../services/helpRequestService';
import { transferService } from '../../services/transferService';

const UserRole = {
  PUBLIC: 'PUBLIC',
  POLICE: 'POLICE',
  SOCIAL_WORKER: 'SOCIAL_WORKER',
  ADMIN: 'ADMIN'
} as const;


interface Case {
  id: string;
  caseNumber: string;
  caseType: string;
  title: string;
  status: string;
  priority: string;
  assignedDate: string;
  description: string;
  location: string;
}

interface HelpRequest {
  id: string;
  requestNumber: string;
  helpTypes: string[];
  status: string;
  assignedDate: string;
  description: string;
  location: string;
  urgency: string;
}

interface AvailableOfficer {
  id: string;
  name: string;
  badgeNumber: string;
  rank: string;
  department: string;
  status: 'AVAILABLE' | 'BUSY' | 'OFF_DUTY';
  currentCaseCount: number;
  maxCases: number;
  distanceKm: number;
  specializationMatch: number;
  responseTime: number;
  rating: number;
  lastTransferDate?: string;
}

interface AvailableSocialWorker {
  id: string;
  name: string;
  licenseNumber: string;
  status: 'AVAILABLE' | 'BUSY' | 'ON_LEAVE';
  currentRequestCount: number;
  maxRequests: number;
  distanceKm: number;
  specializationMatch: number;
  responseTime: number;
  rating: number;
  specializations: string[];
}

interface TransferForm {
  entityType: 'CASE' | 'HELP_REQUEST' | null;
  entityId: string | null;
  recipientId: string | null;
  reasonCategory: '' | 'WORKLOAD' | 'SPECIALIZATION' | 'LOCATION' | 'PERSONAL' | 'OTHER';
  detailedReason: string;
  urgency: 'NORMAL' | 'URGENT' | 'EMERGENCY';
  notes: string;
}

const RequestTransferPage: React.FC = () => {
  const navigate = useNavigate();
  const [user] = useState(authService.getCurrentUser());
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [submittedTransferId, setSubmittedTransferId] = useState<string | null>(null);

  const [formData, setFormData] = useState<TransferForm>({
    entityType: null,
    entityId: null,
    recipientId: null,
    reasonCategory: '',
    detailedReason: '',
    urgency: 'NORMAL',
    notes: ''
  });

  const [myCases, setMyCases] = useState<Case[]>([]);
  const [myHelpRequests, setMyHelpRequests] = useState<HelpRequest[]>([]);
  const [availableOfficers, setAvailableOfficers] = useState<AvailableOfficer[]>([]);
  const [availableWorkers, setAvailableWorkers] = useState<AvailableSocialWorker[]>([]);
  const [loadingCases, setLoadingCases] = useState(false);
  const [loadingHelpRequests, setLoadingHelpRequests] = useState(false);
  const [loadingRecipients, setLoadingRecipients] = useState(false);

  const [selectedCase, setSelectedCase] = useState<Case | null>(null);
  const [selectedHelpRequest, setSelectedHelpRequest] = useState<HelpRequest | null>(null);
  const [selectedRecipient, setSelectedRecipient] = useState<AvailableOfficer | AvailableSocialWorker | null>(null);
  const [showEntityDetails, setShowEntityDetails] = useState(false);

  const reasonCategories = [
    { id: 'WORKLOAD', label: 'Workload', icon: '🏋️', description: 'Too many assigned items' },
    { id: 'SPECIALIZATION', label: 'Specialization needed', icon: '🎯', description: 'Requires specific expertise' },
    { id: 'LOCATION', label: 'Location', icon: '📍', description: 'Better geographical fit' },
    { id: 'PERSONAL', label: 'Personal reasons', icon: '👤', description: 'Personal circumstances' },
    { id: 'OTHER', label: 'Other', icon: '📝', description: 'Other reasons' }
  ];

  const urgencyLevels = [
    { id: 'NORMAL', label: 'Normal (within 3 days)', color: 'success' },
    { id: 'URGENT', label: 'Urgent (within 24 hours)', color: 'warning' },
    { id: 'EMERGENCY', label: 'Emergency (immediate)', color: 'danger' }
  ];

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (user.role !== UserRole.POLICE && 
        user.role !== UserRole.SOCIAL_WORKER && 
        user.role !== UserRole.ADMIN) {
      navigate('/dashboard');
      return;
    }

    if (user.role === UserRole.POLICE) {
      loadMyAssignedCases();
    } else if (user.role === UserRole.SOCIAL_WORKER) {
      loadMyAssignedHelpRequests();
    }
  }, [user, navigate]);

  const loadMyAssignedCases = async () => {
    try {
      setLoadingCases(true);
      const response = await caseService.getMyCases();
      const apiCases = response.data || [];
      
      const transformedCases: Case[] = apiCases.map((c: any) => ({
        id: c.id || '',
        caseNumber: c.caseTrackingId || c.caseNumber || c.id,
        caseType: c.caseType || '',
        title: c.title || c.caseDescription || '',
        status: c.status || '',
        priority: c.priority || 'NORMAL',
        assignedDate: c.assignedDate || c.createdAt || new Date().toISOString(),
        description: c.caseDescription || c.description || '',
        location: c.location || ''
      }));
      
      setMyCases(transformedCases);
      setFormData(prev => ({ ...prev, entityType: 'CASE' }));
    } catch (err) {
      console.error('Error loading assigned cases:', err);
      setError('Failed to load assigned cases. Please try again.');
    } finally {
      setLoadingCases(false);
    }
  };

  const loadMyAssignedHelpRequests = async () => {
    try {
      setLoadingHelpRequests(true);
      const response = await helpRequestService.getMyRequests();
      const apiRequests = response.data || [];
      
      const transformedRequests: HelpRequest[] = apiRequests.map((hr: any) => ({
        id: hr.id || '',
        requestNumber: hr.requestId || hr.id || '',
        helpTypes: Array.isArray(hr.helpTypes) ? hr.helpTypes : [hr.helpType || ''],
        status: hr.status || '',
        assignedDate: hr.assignedDate || hr.createdAt || new Date().toISOString(),
        description: hr.description || hr.requestDescription || '',
        location: hr.location || '',
        urgency: hr.urgency || 'NORMAL'
      }));
      
      setMyHelpRequests(transformedRequests);
      setFormData(prev => ({ ...prev, entityType: 'HELP_REQUEST' }));
    } catch (err) {
      console.error('Error loading assigned help requests:', err);
      setError('Failed to load assigned help requests. Please try again.');
    } finally {
      setLoadingHelpRequests(false);
    }
  };

  const loadAvailableRecipients = async () => {
    try {
      setLoadingRecipients(true);
      
      // TODO: Replace with actual API endpoints when available
      // For now, set empty arrays - these should come from backend API
      // Example: GET /api/transfers/available-officers or GET /api/transfers/available-workers
      
      if (formData.entityType === 'CASE') {
        // This would need an API endpoint like: GET /api/police/available?caseId=xxx
        setAvailableOfficers([]);
        setError('Available officers endpoint not implemented. Please contact administrator.');
      } else if (formData.entityType === 'HELP_REQUEST') {
        // This would need an API endpoint like: GET /api/social-workers/available?helpRequestId=xxx
        setAvailableWorkers([]);
        setError('Available workers endpoint not implemented. Please contact administrator.');
      }
    } catch (err) {
      console.error('Error loading available recipients:', err);
      setError('Failed to load available recipients. Please try again.');
    } finally {
      setLoadingRecipients(false);
    }
  };

  const handleNextStep = () => {
    if (validateCurrentStep()) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
      setError(null);
    }
  };

  const handlePrevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const validateCurrentStep = (): boolean => {
    let isValid = true;
    let errorMessage = '';

    switch (currentStep) {
      case 1:
        if (!formData.entityType) {
          isValid = false;
          errorMessage = 'Please select what you want to transfer';
        } else if (!formData.entityId) {
          isValid = false;
          errorMessage = 'Please select an item to transfer';
        }
        break;

      case 2:
        if (!formData.recipientId) {
          isValid = false;
          errorMessage = 'Please select a recipient for the transfer';
        }
        break;

      case 3:
        if (!formData.reasonCategory) {
          isValid = false;
          errorMessage = 'Please select a reason category';
        } else if (!formData.detailedReason.trim()) {
          isValid = false;
          errorMessage = 'Please provide a detailed explanation';
        }
        break;

      case 4:

        if (!formData.urgency) {
          isValid = false;
          errorMessage = 'Please select urgency level';
        }
        break;
    }

    if (!isValid) {
      setError(errorMessage);
    }

    return isValid;
  };

  const handleSelectEntity = (entityType: 'CASE' | 'HELP_REQUEST', entityId: string) => {
    setFormData(prev => ({
      ...prev,
      entityType,
      entityId
    }));

    if (entityType === 'CASE') {
      const selected = myCases.find(c => c.id === entityId);
      setSelectedCase(selected || null);
      setSelectedHelpRequest(null);
    } else {
      const selected = myHelpRequests.find(r => r.id === entityId);
      setSelectedHelpRequest(selected || null);
      setSelectedCase(null);
    }
  };

  const handleSelectRecipient = (recipientId: string) => {
    setFormData(prev => ({ ...prev, recipientId }));

    if (formData.entityType === 'CASE') {
      const recipient = availableOfficers.find(o => o.id === recipientId);
      setSelectedRecipient(recipient || null);
    } else {
      const recipient = availableWorkers.find(w => w.id === recipientId);
      setSelectedRecipient(recipient || null);
    }
  };

  const handleSubmitTransfer = async () => {
    if (!validateCurrentStep()) {
      return;
    }

    setLoading(true);
    setError(null);

    try {









      let response;
      if (formData.entityType === 'CASE') {
        response = await transferService.requestCaseTransfer({
          caseId: formData.entityId,
          recipientId: formData.recipientId,
          reasonCategory: formData.reasonCategory,
          detailedReason: formData.detailedReason,
          urgency: formData.urgency,
          notes: formData.notes
        });
      } else {
        response = await transferService.requestHelpRequestTransfer({
          helpRequestId: formData.entityId,
          recipientId: formData.recipientId,
          reasonCategory: formData.reasonCategory,
          detailedReason: formData.detailedReason,
          urgency: formData.urgency,
          notes: formData.notes
        });
      }

      const transferId = response.data?.id || response.data?.transferId || response.data?.transferNumber;
      setSubmittedTransferId(transferId);
      setSuccess(true);

      setTimeout(() => {
        navigate(`/transfers/requests/${transferId}`);
      }, 3000);
    } catch (err: any) {
      console.error('Error submitting transfer request:', err);
      setError(err.response?.data?.message || 'Failed to submit transfer request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <Card className="mb-4">
      <Card.Body>
        <Card.Title className="mb-4">
          <span className="step-icon">🔄</span>
          Step 1 of 4: What do you want to transfer?
        </Card.Title>

        {}
        <div className="mb-4">
          <h5>Select Entity Type:</h5>
          <div className="entity-type-selector">
            <Row className="g-3">
              {(user?.role === UserRole.POLICE || user?.role === UserRole.ADMIN) && (
                <Col md={6}>
                  <div 
                    className={`entity-type-card p-4 text-center cursor-pointer ${
                      formData.entityType === 'CASE' ? 'selected' : ''
                    }`}
                    onClick={() => setFormData(prev => ({ ...prev, entityType: 'CASE' }))}
                  >
                    <div className="entity-type-icon mb-3">
                      <i className="bi bi-file-text fs-1"></i>
                    </div>
                    <h4>📋 CASE</h4>
                    <p className="text-muted">Transfer a case to another officer</p>
                  </div>
                </Col>
              )}

              {(user?.role === UserRole.SOCIAL_WORKER || user?.role === UserRole.ADMIN) && (
                <Col md={6}>
                  <div 
                    className={`entity-type-card p-4 text-center cursor-pointer ${
                      formData.entityType === 'HELP_REQUEST' ? 'selected' : ''
                    }`}
                    onClick={() => setFormData(prev => ({ ...prev, entityType: 'HELP_REQUEST' }))}
                  >
                    <div className="entity-type-icon mb-3">
                      <i className="bi bi-megaphone fs-1"></i>
                    </div>
                    <h4>🆘 HELP REQUEST</h4>
                    <p className="text-muted">Transfer a help request to another worker</p>
                  </div>
                </Col>
              )}
            </Row>
          </div>
        </div>

        {}
        {formData.entityType && (
          <div className="assigned-items-section">
            <h5 className="mb-3">
              {formData.entityType === 'CASE' ? '📋 Your Assigned Cases' : '🆘 Your Assigned Help Requests'}
            </h5>

            {loadingCases || loadingHelpRequests ? (
              <div className="text-center py-4">
                <Spinner animation="border" />
                <p className="mt-2">Loading assigned items...</p>
              </div>
            ) : (
              <>
                {formData.entityType === 'CASE' ? (
                  myCases.length === 0 ? (
                    <Alert variant="info" className="text-center">
                      <i className="bi bi-info-circle me-2"></i>
                      You don't have any assigned cases to transfer.
                    </Alert>
                  ) : (
                    <div className="assigned-items-list">
                      {myCases.map(caseItem => (
                        <Card 
                          key={caseItem.id}
                          className={`mb-3 cursor-pointer ${
                            formData.entityId === caseItem.id ? 'selected' : ''
                          }`}
                          onClick={() => handleSelectEntity('CASE', caseItem.id)}
                        >
                          <Card.Body>
                            <div className="d-flex justify-content-between align-items-start">
                              <div>
                                <h6 className="mb-1">{caseItem.caseNumber}</h6>
                                <div className="mb-2">
                                  <Badge bg="info" className="me-2">{caseItem.caseType}</Badge>
                                  <Badge bg={
                                    caseItem.priority === 'CRITICAL' ? 'danger' :
                                    caseItem.priority === 'URGENT' ? 'warning' : 'secondary'
                                  }>
                                    {caseItem.priority}
                                  </Badge>
                                </div>
                                <div className="text-muted small">
                                  <i className="bi bi-geo-alt me-1"></i>
                                  {caseItem.location}
                                </div>
                              </div>
                              <Button
                                variant="outline-primary"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSelectEntity('CASE', caseItem.id);
                                  setShowEntityDetails(true);
                                }}
                              >
                                View Details
                              </Button>
                            </div>
                            <div className="mt-2">
                              <small className="text-muted">
                                <i className="bi bi-calendar me-1"></i>
                                Assigned: {new Date(caseItem.assignedDate).toLocaleDateString()}
                              </small>
                            </div>
                          </Card.Body>
                        </Card>
                      ))}
                    </div>
                  )
                ) : (
                  myHelpRequests.length === 0 ? (
                    <Alert variant="info" className="text-center">
                      <i className="bi bi-info-circle me-2"></i>
                      You don't have any assigned help requests to transfer.
                    </Alert>
                  ) : (
                    <div className="assigned-items-list">
                      {myHelpRequests.map(request => (
                        <Card 
                          key={request.id}
                          className={`mb-3 cursor-pointer ${
                            formData.entityId === request.id ? 'selected' : ''
                          }`}
                          onClick={() => handleSelectEntity('HELP_REQUEST', request.id)}
                        >
                          <Card.Body>
                            <div className="d-flex justify-content-between align-items-start">
                              <div>
                                <h6 className="mb-1">{request.requestNumber}</h6>
                                <div className="mb-2">
                                  {request.helpTypes.map(type => (
                                    <Badge key={type} bg="info" className="me-1">
                                      {type}
                                    </Badge>
                                  ))}
                                  <Badge bg={
                                    request.urgency === 'IMMEDIATE' ? 'danger' :
                                    request.urgency === 'WITHIN_3_DAYS' ? 'warning' : 'secondary'
                                  }>
                                    {request.urgency}
                                  </Badge>
                                </div>
                                <div className="text-muted small">
                                  <i className="bi bi-geo-alt me-1"></i>
                                  {request.location}
                                </div>
                              </div>
                              <Button
                                variant="outline-primary"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSelectEntity('HELP_REQUEST', request.id);
                                  setShowEntityDetails(true);
                                }}
                              >
                                View Details
                              </Button>
                            </div>
                            <div className="mt-2">
                              <small className="text-muted">
                                <i className="bi bi-calendar me-1"></i>
                                Assigned: {new Date(request.assignedDate).toLocaleDateString()}
                              </small>
                            </div>
                          </Card.Body>
                        </Card>
                      ))}
                    </div>
                  )
                )}
              </>
            )}
          </div>
        )}

        {}
        <Modal 
          show={showEntityDetails} 
          onHide={() => setShowEntityDetails(false)}
          size="lg"
        >
          <Modal.Header closeButton>
            <Modal.Title>
              <i className="bi bi-info-circle me-2"></i>
              {selectedCase ? 'Case Details' : 'Help Request Details'}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {selectedCase ? (
              <div>
                <h5>{selectedCase.caseNumber}</h5>
                <Table bordered size="sm" className="mb-3">
                  <tbody>
                    <tr>
                      <td style={{ width: '30%' }}><strong>Type:</strong></td>
                      <td>{selectedCase.caseType}</td>
                    </tr>
                    <tr>
                      <td><strong>Status:</strong></td>
                      <td>
                        <Badge bg={
                          selectedCase.status === 'INVESTIGATING' ? 'warning' :
                          selectedCase.status === 'ASSIGNED' ? 'primary' : 'secondary'
                        }>
                          {selectedCase.status}
                        </Badge>
                      </td>
                    </tr>
                    <tr>
                      <td><strong>Priority:</strong></td>
                      <td>
                        <Badge bg={
                          selectedCase.priority === 'CRITICAL' ? 'danger' :
                          selectedCase.priority === 'URGENT' ? 'warning' : 'secondary'
                        }>
                          {selectedCase.priority}
                        </Badge>
                      </td>
                    </tr>
                    <tr>
                      <td><strong>Location:</strong></td>
                      <td>{selectedCase.location}</td>
                    </tr>
                    <tr>
                      <td><strong>Assigned Date:</strong></td>
                      <td>{new Date(selectedCase.assignedDate).toLocaleDateString()}</td>
                    </tr>
                  </tbody>
                </Table>
                <div>
                  <strong>Description:</strong>
                  <p className="mb-0">{selectedCase.description}</p>
                </div>
              </div>
            ) : selectedHelpRequest ? (
              <div>
                <h5>{selectedHelpRequest.requestNumber}</h5>
                <Table bordered size="sm" className="mb-3">
                  <tbody>
                    <tr>
                      <td style={{ width: '30%' }}><strong>Types:</strong></td>
                      <td>{selectedHelpRequest.helpTypes.join(', ')}</td>
                    </tr>
                    <tr>
                      <td><strong>Status:</strong></td>
                      <td>
                        <Badge bg={
                          selectedHelpRequest.status === 'PENDING' ? 'warning' :
                          selectedHelpRequest.status === 'ASSIGNED' ? 'primary' : 'secondary'
                        }>
                          {selectedHelpRequest.status}
                        </Badge>
                      </td>
                    </tr>
                    <tr>
                      <td><strong>Urgency:</strong></td>
                      <td>
                        <Badge bg={
                          selectedHelpRequest.urgency === 'IMMEDIATE' ? 'danger' :
                          selectedHelpRequest.urgency === 'WITHIN_3_DAYS' ? 'warning' : 'secondary'
                        }>
                          {selectedHelpRequest.urgency.replace('_', ' ')}
                        </Badge>
                      </td>
                    </tr>
                    <tr>
                      <td><strong>Location:</strong></td>
                      <td>{selectedHelpRequest.location}</td>
                    </tr>
                    <tr>
                      <td><strong>Assigned Date:</strong></td>
                      <td>{new Date(selectedHelpRequest.assignedDate).toLocaleDateString()}</td>
                    </tr>
                  </tbody>
                </Table>
                <div>
                  <strong>Description:</strong>
                  <p className="mb-0">{selectedHelpRequest.description}</p>
                </div>
              </div>
            ) : (
              <Alert variant="warning">
                No details available
              </Alert>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowEntityDetails(false)}>
              Close
            </Button>
            <Button 
              variant="primary" 
              onClick={() => {
                setShowEntityDetails(false);
                handleNextStep();
              }}
            >
              Select This Item
            </Button>
          </Modal.Footer>
        </Modal>
      </Card.Body>
    </Card>
  );

  const renderStep2 = () => {

    React.useEffect(() => {
      if (currentStep === 2 && formData.entityType && !formData.recipientId) {
        loadAvailableRecipients();
      }
    }, [currentStep, formData.entityType]);

    return (
      <Card className="mb-4">
        <Card.Body>
          <Card.Title className="mb-4">
            <span className="step-icon">👥</span>
            Step 2 of 4: Who should this be transferred to?
          </Card.Title>

          <div className="mb-3">
            <Alert variant="info">
              <i className="bi bi-info-circle me-2"></i>
              Available recipients are sorted by suitability based on workload, location, and specialization match.
            </Alert>
          </div>

          {loadingRecipients ? (
            <div className="text-center py-4">
              <Spinner animation="border" />
              <p className="mt-2">Loading available recipients...</p>
            </div>
          ) : (
            <div className="recipients-list">
              <h5 className="mb-3">
                Available {formData.entityType === 'CASE' ? 'Officers' : 'Social Workers'} 
                <span className="text-muted ms-2">
                  (sorted by suitability)
                </span>
              </h5>

              {formData.entityType === 'CASE' ? (
                availableOfficers.length === 0 ? (
                  <Alert variant="warning" className="text-center">
                    <i className="bi bi-exclamation-triangle me-2"></i>
                    No available officers found. Try adjusting filters or check back later.
                  </Alert>
                ) : (
                  <Row className="g-3">
                    {availableOfficers.map(officer => (
                      <Col key={officer.id} md={6}>
                        <Card className={`recipient-card h-100 ${
                          formData.recipientId === officer.id ? 'selected' : ''
                        }`}>
                          <Card.Body>
                            <div className="d-flex justify-content-between align-items-start mb-3">
                              <div>
                                <h5 className="mb-1">{officer.name}</h5>
                                <div className="text-muted small">
                                  {officer.rank} • {officer.department}
                                </div>
                              </div>
                              <div className="text-end">
                                <Badge bg={
                                  officer.status === 'AVAILABLE' ? 'success' :
                                  officer.status === 'BUSY' ? 'warning' : 'secondary'
                                }>
                                  {officer.status.replace('_', ' ')}
                                </Badge>
                              </div>
                            </div>

                            <div className="recipient-stats mb-3">
                              <Row className="g-2">
                                <Col xs={6}>
                                  <div className="stat-item text-center">
                                    <div className="stat-value">
                                      <i className="bi bi-geo-alt"></i>
                                    </div>
                                    <div className="stat-label small">
                                      {officer.distanceKm}km away
                                    </div>
                                  </div>
                                </Col>
                                <Col xs={6}>
                                  <div className="stat-item text-center">
                                    <div className="stat-value">
                                      <i className="bi bi-briefcase"></i>
                                    </div>
                                    <div className="stat-label small">
                                      {officer.currentCaseCount}/{officer.maxCases} cases
                                    </div>
                                  </div>
                                </Col>
                                <Col xs={6}>
                                  <div className="stat-item text-center">
                                    <div className="stat-value">
                                      <i className="bi bi-star"></i>
                                    </div>
                                    <div className="stat-label small">
                                      {officer.specializationMatch}% match
                                    </div>
                                  </div>
                                </Col>
                                <Col xs={6}>
                                  <div className="stat-item text-center">
                                    <div className="stat-value">
                                      <i className="bi bi-clock"></i>
                                    </div>
                                    <div className="stat-label small">
                                      {officer.responseTime}h response
                                    </div>
                                  </div>
                                </Col>
                              </Row>
                            </div>

                            {}
                            <div className="mb-3">
                              <div className="d-flex justify-content-between mb-1">
                                <small>Workload</small>
                                <small>{Math.round((officer.currentCaseCount / officer.maxCases) * 100)}%</small>
                              </div>
                              <ProgressBar 
                                now={(officer.currentCaseCount / officer.maxCases) * 100}
                                variant={
                                  officer.currentCaseCount / officer.maxCases > 0.8 ? 'danger' :
                                  officer.currentCaseCount / officer.maxCases > 0.6 ? 'warning' : 'success'
                                }
                                style={{ height: '6px' }}
                              />
                            </div>

                            <div className="d-flex justify-content-between align-items-center">
                              <small className="text-muted">
                                Rating: {officer.rating}/5
                              </small>
                              <Button
                                variant={
                                  formData.recipientId === officer.id ? 'primary' : 'outline-primary'
                                }
                                size="sm"
                                onClick={() => handleSelectRecipient(officer.id)}
                              >
                                {formData.recipientId === officer.id ? 'Selected' : 'Select'}
                              </Button>
                            </div>
                          </Card.Body>
                        </Card>
                      </Col>
                    ))}
                  </Row>
                )
              ) : (
                availableWorkers.length === 0 ? (
                  <Alert variant="warning" className="text-center">
                    <i className="bi bi-exclamation-triangle me-2"></i>
                    No available social workers found. Try adjusting filters or check back later.
                  </Alert>
                ) : (
                  <Row className="g-3">
                    {availableWorkers.map(worker => (
                      <Col key={worker.id} md={6}>
                        <Card className={`recipient-card h-100 ${
                          formData.recipientId === worker.id ? 'selected' : ''
                        }`}>
                          <Card.Body>
                            <div className="d-flex justify-content-between align-items-start mb-3">
                              <div>
                                <h5 className="mb-1">{worker.name}</h5>
                                <div className="text-muted small">
                                  License: {worker.licenseNumber}
                                </div>
                              </div>
                              <div className="text-end">
                                <Badge bg={
                                  worker.status === 'AVAILABLE' ? 'success' :
                                  worker.status === 'BUSY' ? 'warning' : 'secondary'
                                }>
                                  {worker.status.replace('_', ' ')}
                                </Badge>
                              </div>
                            </div>

                            <div className="recipient-stats mb-3">
                              <Row className="g-2">
                                <Col xs={6}>
                                  <div className="stat-item text-center">
                                    <div className="stat-value">
                                      <i className="bi bi-geo-alt"></i>
                                    </div>
                                    <div className="stat-label small">
                                      {worker.distanceKm}km away
                                    </div>
                                  </div>
                                </Col>
                                <Col xs={6}>
                                  <div className="stat-item text-center">
                                    <div className="stat-value">
                                      <i className="bi bi-briefcase"></i>
                                    </div>
                                    <div className="stat-label small">
                                      {worker.currentRequestCount}/{worker.maxRequests} requests
                                    </div>
                                  </div>
                                </Col>
                                <Col xs={6}>
                                  <div className="stat-item text-center">
                                    <div className="stat-value">
                                      <i className="bi bi-star"></i>
                                    </div>
                                    <div className="stat-label small">
                                      {worker.specializationMatch}% match
                                    </div>
                                  </div>
                                </Col>
                                <Col xs={6}>
                                  <div className="stat-item text-center">
                                    <div className="stat-value">
                                      <i className="bi bi-clock"></i>
                                    </div>
                                    <div className="stat-label small">
                                      {worker.responseTime}h response
                                    </div>
                                  </div>
                                </Col>
                              </Row>
                            </div>

                            {}
                            <div className="mb-3">
                              <small className="text-muted d-block mb-1">Specializations:</small>
                              <div className="d-flex flex-wrap gap-1">
                                {worker.specializations.slice(0, 3).map(spec => (
                                  <Badge key={spec} bg="info" className="small">
                                    {spec}
                                  </Badge>
                                ))}
                                {worker.specializations.length > 3 && (
                                  <Badge bg="secondary" className="small">
                                    +{worker.specializations.length - 3}
                                  </Badge>
                                )}
                              </div>
                            </div>

                            {}
                            <div className="mb-3">
                              <div className="d-flex justify-content-between mb-1">
                                <small>Workload</small>
                                <small>{Math.round((worker.currentRequestCount / worker.maxRequests) * 100)}%</small>
                              </div>
                              <ProgressBar 
                                now={(worker.currentRequestCount / worker.maxRequests) * 100}
                                variant={
                                  worker.currentRequestCount / worker.maxRequests > 0.8 ? 'danger' :
                                  worker.currentRequestCount / worker.maxRequests > 0.6 ? 'warning' : 'success'
                                }
                                style={{ height: '6px' }}
                              />
                            </div>

                            <div className="d-flex justify-content-between align-items-center">
                              <small className="text-muted">
                                Rating: {worker.rating}/5
                              </small>
                              <Button
                                variant={
                                  formData.recipientId === worker.id ? 'primary' : 'outline-primary'
                                }
                                size="sm"
                                onClick={() => handleSelectRecipient(worker.id)}
                              >
                                {formData.recipientId === worker.id ? 'Selected' : 'Select'}
                              </Button>
                            </div>
                          </Card.Body>
                        </Card>
                      </Col>
                    ))}
                  </Row>
                )
              )}
            </div>
          )}

          {}
          {selectedRecipient && (
            <Alert variant="success" className="mt-4">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="mb-1">Selected Recipient:</h6>
                  <strong>{'name' in selectedRecipient ? selectedRecipient.name : ''}</strong>
                  {'badgeNumber' in selectedRecipient && (
                    <div className="text-muted small">Badge: {selectedRecipient.badgeNumber}</div>
                  )}
                  {'licenseNumber' in selectedRecipient && (
                    <div className="text-muted small">License: {selectedRecipient.licenseNumber}</div>
                  )}
                </div>
                <Button
                  variant="outline-success"
                  size="sm"
                  onClick={() => {
                    setFormData(prev => ({ ...prev, recipientId: null }));
                    setSelectedRecipient(null);
                  }}
                >
                  Change
                </Button>
              </div>
            </Alert>
          )}
        </Card.Body>
      </Card>
    );
  };

  const renderStep3 = () => (
    <Card className="mb-4">
      <Card.Body>
        <Card.Title className="mb-4">
          <span className="step-icon">📝</span>
          Step 3 of 4: Why are you requesting this transfer?
        </Card.Title>

        <Form.Group className="mb-4">
          <Form.Label className="fw-bold">
            <i className="bi bi-tag me-2"></i>
            Reason Category *
          </Form.Label>
          <div className="reason-categories">
            <Row className="g-3">
              {reasonCategories.map(category => (
                <Col key={category.id} md={6}>
                  <div 
                    className={`reason-card p-3 cursor-pointer ${
                      formData.reasonCategory === category.id ? 'selected' : ''
                    }`}
                    onClick={() => setFormData(prev => ({ ...prev, reasonCategory: category.id as TransferForm['reasonCategory'] }))}
                  >
                    <div className="d-flex align-items-center">
                      <div className="reason-icon me-3 fs-3">
                        {category.icon}
                      </div>
                      <div>
                        <h6 className="mb-1">{category.label}</h6>
                        <p className="text-muted small mb-0">{category.description}</p>
                      </div>
                    </div>
                  </div>
                </Col>
              ))}
            </Row>
          </div>
        </Form.Group>

        <Form.Group className="mb-4">
          <Form.Label className="fw-bold">
            <i className="bi bi-text-paragraph me-2"></i>
            Detailed Explanation *
          </Form.Label>
          <Form.Control
            as="textarea"
            rows={5}
            placeholder="Please provide a detailed explanation for this transfer request..."
            value={formData.detailedReason}
            onChange={(e) => setFormData(prev => ({ ...prev, detailedReason: e.target.value }))}
            required
          />
          <Form.Text className="text-muted">
            Be specific about why this transfer is needed. This helps administrators and the recipient understand the context.
          </Form.Text>
        </Form.Group>

        <Form.Group className="mb-4">
          <Form.Label className="fw-bold">
            <i className="bi bi-alarm me-2"></i>
            Urgency Level *
          </Form.Label>
          <div className="urgency-levels">
            <Row className="g-3">
              {urgencyLevels.map(level => (
                <Col key={level.id} md={4}>
                  <div 
                    className={`urgency-card p-3 text-center cursor-pointer ${
                      formData.urgency === level.id ? 'selected' : ''
                    }`}
                    onClick={() => setFormData(prev => ({ ...prev, urgency: level.id as TransferForm['urgency'] }))}
                  >
                    <Badge bg={level.color} className="mb-2 d-inline-block">
                      {level.label.split(' ')[0]}
                    </Badge>
                    <p className="mb-0 small">{level.label}</p>
                  </div>
                </Col>
              ))}
            </Row>
          </div>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>
            <i className="bi bi-sticky me-2"></i>
            Additional Notes (Optional)
          </Form.Label>
          <Form.Control
            as="textarea"
            rows={2}
            placeholder="Any additional information or special instructions..."
            value={formData.notes}
            onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
          />
        </Form.Group>
      </Card.Body>
    </Card>
  );

  const renderStep4 = () => {
    const getEntityTitle = () => {
      if (selectedCase) return `${selectedCase.caseNumber} - ${selectedCase.caseType}`;
      if (selectedHelpRequest) return `${selectedHelpRequest.requestNumber} - ${selectedHelpRequest.helpTypes.join(', ')}`;
      return 'Unknown Entity';
    };

    const getRecipientTitle = () => {
      if (!selectedRecipient) return 'Not Selected';
      if ('badgeNumber' in selectedRecipient) {
        return `${selectedRecipient.name} (${selectedRecipient.rank})`;
      } else {
        return `${selectedRecipient.name} (Social Worker)`;
      }
    };

    const getReasonCategoryLabel = () => {
      const category = reasonCategories.find(c => c.id === formData.reasonCategory);
      return category ? category.label : 'Not Selected';
    };

    const getUrgencyLabel = () => {
      const urgency = urgencyLevels.find(u => u.id === formData.urgency);
      return urgency ? urgency.label : 'Not Selected';
    };

    return (
      <Card className="mb-4">
        <Card.Body>
          <Card.Title className="mb-4">
            <span className="step-icon">🔄</span>
            Step 4 of 4: Review & Submit
          </Card.Title>

          {}
          <Card className="mb-4 summary-card">
            <Card.Body>
              <h5 className="text-center mb-4">
                <i className="bi bi-clipboard-check me-2"></i>
                TRANSFER REQUEST SUMMARY
              </h5>
              
              <Row>
                <Col md={6}>
                  <div className="summary-item mb-3">
                    <strong>Entity:</strong>
                    <div>{getEntityTitle()}</div>
                    {selectedCase && (
                      <div className="text-muted small">
                        Location: {selectedCase.location}
                      </div>
                    )}
                    {selectedHelpRequest && (
                      <div className="text-muted small">
                        Location: {selectedHelpRequest.location}
                      </div>
                    )}
                  </div>
                  
                  <div className="summary-item mb-3">
                    <strong>From:</strong>
                    <div>{user?.name || 'You'}</div>
                    <div className="text-muted small">
                      {user?.role?.replace('_', ' ') || 'User'}
                    </div>
                  </div>
                </Col>
                
                <Col md={6}>
                  <div className="summary-item mb-3">
                    <strong>To:</strong>
                    <div>{getRecipientTitle()}</div>
                    {selectedRecipient && (
                      <div className="text-muted small">
                        {selectedRecipient.status === 'AVAILABLE' ? '🟢 Available' : 
                         selectedRecipient.status === 'BUSY' ? '🟡 Busy' : '⚪ Off Duty'}
                      </div>
                    )}
                  </div>
                  
                  <div className="summary-item mb-3">
                    <strong>Urgency:</strong>
                    <div>
                      <Badge bg={
                        formData.urgency === 'EMERGENCY' ? 'danger' :
                        formData.urgency === 'URGENT' ? 'warning' : 'success'
                      }>
                        {getUrgencyLabel()}
                      </Badge>
                    </div>
                  </div>
                </Col>
              </Row>
              
              <div className="summary-item mb-3">
                <strong>Reason:</strong>
                <div>{getReasonCategoryLabel()}</div>
                {formData.detailedReason && (
                  <div className="text-muted small mt-1">{formData.detailedReason}</div>
                )}
              </div>
              
              {formData.notes && (
                <div className="summary-item">
                  <strong>Additional Notes:</strong>
                  <div className="text-muted small mt-1">{formData.notes}</div>
                </div>
              )}
            </Card.Body>
          </Card>

          {}
          <Card className="mb-4 terms-card">
            <Card.Body>
              <h6>
                <i className="bi bi-shield-check me-2"></i>
                Terms & Conditions
              </h6>
              <ul className="small text-muted">
                <li className="mb-2">
                  ✓ The recipient must accept the transfer request before it becomes effective
                </li>
                <li className="mb-2">
                  ✓ You remain responsible for the item until the transfer is complete
                </li>
                <li className="mb-2">
                  ✓ Transfers may be reviewed and approved by administrators
                </li>
                <li className="mb-2">
                  ✓ Frequent transfer requests may be reviewed for patterns
                </li>
                <li>
                  ✓ By submitting, you confirm this transfer is necessary and appropriate
                </li>
              </ul>
            </Card.Body>
          </Card>
        </Card.Body>
      </Card>
    );
  };

  if (success) {
    return (
      <Container className="py-5">
        <div className="text-center">
          <div className="success-icon mb-4">
            <i className="bi bi-check-circle-fill text-success" style={{ fontSize: '4rem' }}></i>
          </div>
          <h2 className="mb-3">Transfer Request Submitted Successfully!</h2>
          <Card className="mb-4 mx-auto" style={{ maxWidth: '500px' }}>
            <Card.Body>
              <h5 className="mb-3">
                <i className="bi bi-clipboard-data me-2"></i>
                Transfer Reference Number
              </h5>
              <div className="display-6 fw-bold text-primary mb-3">
                {submittedTransferId}
              </div>
              <p className="text-muted mb-0">
                The recipient will be notified and must accept the transfer
              </p>
            </Card.Body>
          </Card>
          <p className="text-muted mb-4">
            You will be redirected to the transfer details in 5 seconds...
          </p>
          <div className="d-flex justify-content-center gap-3">
            <Button variant="primary" onClick={() => navigate(`/transfers/requests/${submittedTransferId}`)}>
              <i className="bi bi-eye me-2"></i>
              View Transfer
            </Button>
            <Button variant="outline-secondary" onClick={() => navigate('/transfers/my-requests')}>
              <i className="bi bi-list-ul me-2"></i>
              My Transfer Requests
            </Button>
          </div>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      {}
      <div className="mb-4">
        <Button 
          variant="outline-primary" 
          onClick={() => navigate('/dashboard')}
          className="d-flex align-items-center"
        >
          <i className="bi bi-arrow-left me-2"></i>
          Back to Dashboard
        </Button>
      </div>

      {}
      <Card className="mb-4">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h4 className="mb-0">
              <i className="bi bi-arrow-left-right me-2"></i>
              Request Transfer
            </h4>
            <Badge bg="primary" className="fs-6">
              Step {currentStep} of 4
            </Badge>
          </div>
          <ProgressBar 
            now={(currentStep / 4) * 100} 
            className="mb-0"
            variant="primary"
            style={{ height: '8px' }}
          />
        </Card.Body>
      </Card>

      {}
      {error && (
        <Alert variant="danger" className="mb-4" dismissible onClose={() => setError(null)}>
          <i className="bi bi-exclamation-triangle me-2"></i>
          {error}
        </Alert>
      )}

      {}
      {currentStep === 1 && renderStep1()}
      {currentStep === 2 && renderStep2()}
      {currentStep === 3 && renderStep3()}
      {currentStep === 4 && renderStep4()}

      {}
      <div className="d-flex justify-content-between">
        <Button
          variant="outline-secondary"
          onClick={handlePrevStep}
          disabled={currentStep === 1}
          className="d-flex align-items-center"
        >
          <i className="bi bi-arrow-left me-2"></i>
          Previous
        </Button>

        {currentStep < 4 ? (
          <Button 
            variant="primary" 
            onClick={handleNextStep}
            className="d-flex align-items-center"
          >
            Next Step
            <i className="bi bi-arrow-right ms-2"></i>
          </Button>
        ) : (
          <Button 
            variant="success" 
            onClick={handleSubmitTransfer}
            disabled={loading}
            className="d-flex align-items-center"
            size="lg"
          >
            {loading ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Submitting...
              </>
            ) : (
              <>
                <i className="bi bi-send-check me-2"></i>
                SUBMIT TRANSFER REQUEST
              </>
            )}
          </Button>
        )}
      </div>
    </Container>
  );
};

export default RequestTransferPage;