import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Card,
  Table,
  Badge,
  Button,
  Form,
  Modal,
  Spinner,
  Dropdown,
} from 'react-bootstrap'
import {
  getAllHelpRequests,
  getSocialWorkers,
  updateHelpRequestStatus,
  rejectHelpRequest,
  assignHelpRequestToWorker,
} from '../../services/adminApi'
import type { HelpRequestDTO } from '../../types/dashboard'
import type { SocialWorkerDTO } from '../../types/admin'
import { REQUEST_STATUS_BADGE_VARIANTS, REQUEST_STATUS_LABELS, HELP_TYPE_LABELS } from '../../types/dashboard'

const STATUS_OPTIONS = [
  'REQUESTED',
  'UNDER_REVIEW',
  'ASSIGNED',
  'IN_PROGRESS',
  'COMPLETED',
  'REJECTED',
  'CANCELLED',
]

export function HelpRequestManagementPage() {
  const [requests, setRequests] = useState<HelpRequestDTO[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState('')
  const [filterType, setFilterType] = useState('')
  const [selectedRequest, setSelectedRequest] = useState<HelpRequestDTO | null>(null)
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [workers, setWorkers] = useState<SocialWorkerDTO[]>([])
  const [assignWorkerId, setAssignWorkerId] = useState('')
  const [assignLoading, setAssignLoading] = useState(false)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [actionLoading, setActionLoading] = useState(false)

  const getPriorityVariant = (priority?: string) => {
    const p = priority?.toUpperCase()
    if (p === 'HIGH') return 'danger'
    if (p === 'MEDIUM') return 'warning'
    if (p === 'LOW') return 'primary'
    return 'secondary'
  }

  const loadRequests = () => {
    setLoading(true)
    getAllHelpRequests()
      .then(setRequests)
      .catch(() => setRequests([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadRequests()
  }, [])

  useEffect(() => {
    getSocialWorkers().then(setWorkers).catch(() => setWorkers([]))
  }, [])

  const filtered = requests.filter((r) => {
    if (filterStatus && r.status !== filterStatus) return false
    if (filterType && r.helpType !== filterType) return false
    return true
  })

  const handleStatusChange = async (id: string, status: string) => {
    setActionLoading(true)
    try {
      await updateHelpRequestStatus(id, status)
      loadRequests()
      setSelectedRequest(null)
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Failed to update')
    } finally {
      setActionLoading(false)
    }
  }

  const openAssignModal = (r: HelpRequestDTO) => {
    setSelectedRequest(r)
    setShowAssignModal(true)
    setAssignWorkerId('')
  }

  const handleAssign = async () => {
    if (!selectedRequest || !assignWorkerId) return
    setAssignLoading(true)
    try {
      await assignHelpRequestToWorker(selectedRequest.id, assignWorkerId)
      loadRequests()
      setShowAssignModal(false)
      setSelectedRequest(null)
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Failed to assign')
    } finally {
      setAssignLoading(false)
    }
  }

  const openRejectModal = (r: HelpRequestDTO) => {
    setSelectedRequest(r)
    setShowRejectModal(true)
    setRejectReason('')
  }

  const handleReject = async () => {
    if (!selectedRequest) return
    setActionLoading(true)
    try {
      await rejectHelpRequest(selectedRequest.id, rejectReason || 'No reason provided')
      loadRequests()
      setShowRejectModal(false)
      setSelectedRequest(null)
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Failed to reject')
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="d-flex justify-content-center py-5">
        <Spinner animation="border" variant="primary" />
      </div>
    )
  }

  return (
    <div className="animate-fade-in-up">
      <div className="mb-4">
        <h1 className="h3 fw-bold text-dark mb-1">Help Request Management</h1>
        <p className="text-muted mb-0">View and manage help requests from public users</p>
      </div>

      <Card className="border-0 shadow-sm rounded-3 mb-4">
        <Card.Body>
          <div className="row g-3">
            <div className="col-md-4">
              <Form.Label className="small text-muted">Status</Form.Label>
              <Form.Select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="">All</option>
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {REQUEST_STATUS_LABELS[s as keyof typeof REQUEST_STATUS_LABELS] || s}
                  </option>
                ))}
              </Form.Select>
            </div>
            <div className="col-md-4">
              <Form.Label className="small text-muted">Help Type</Form.Label>
              <Form.Select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <option value="">All</option>
                <option value="FOOD_ASSISTANCE">Food Assistance</option>
                <option value="EDUCATION_SUPPORT">Education Support</option>
                <option value="MEDICAL_HELP">Medical Help</option>
                <option value="SHELTER">Shelter</option>
                <option value="CLOTHING">Clothing</option>
                <option value="COUNSELING">Counseling</option>
                <option value="OTHER">Other</option>
              </Form.Select>
            </div>
          </div>
        </Card.Body>
      </Card>

      <Card className="border-0 shadow-sm rounded-3">
        <Card.Body className="p-0">
          <Table hover responsive className="mb-0">
            <thead>
              <tr>
                <th>ID</th>
                <th>Type</th>
                <th>Priority</th>
                <th>Requester</th>
                <th>Location</th>
                <th>Status</th>
                <th>Date</th>
                <th>Assigned</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-5 text-muted">
                    No help requests found
                  </td>
                </tr>
              ) : (
                filtered.map((r) => (
                  <tr key={r.id}>
                    <td>
                      <code className="small">{r.trackingId || r.id?.slice(0, 8)}</code>
                    </td>
                    <td>
                      {HELP_TYPE_LABELS[(r.helpType as keyof typeof HELP_TYPE_LABELS) || 'OTHER']}
                    </td>
                    <td>
                      <Badge bg={getPriorityVariant(r.priority)}>
                        {(r.priority || 'MEDIUM').toUpperCase()}
                      </Badge>
                    </td>
                    <td>
                      {r.anonymous ? (
                        <Badge bg="secondary">Anonymous</Badge>
                      ) : (
                        r.requesterName || '-'
                      )}
                    </td>
                    <td>{r.location || '-'}</td>
                    <td>
                      <Badge
                        bg={
                          REQUEST_STATUS_BADGE_VARIANTS[
                            (r.status as keyof typeof REQUEST_STATUS_BADGE_VARIANTS) || 'REQUESTED'
                          ]
                        }
                      >
                        {REQUEST_STATUS_LABELS[(r.status as keyof typeof REQUEST_STATUS_LABELS) || 'REQUESTED']}
                      </Badge>
                    </td>
                    <td className="text-muted small">
                      {r.requestDate
                        ? new Date(r.requestDate).toLocaleString()
                        : '-'}
                    </td>
                    <td>
                      {r.assignedWorkerId ? (
                        <Badge bg="success">Assigned</Badge>
                      ) : (
                        <Badge bg="secondary">Unassigned</Badge>
                      )}
                    </td>
                    <td className="text-end">
                      <Dropdown>
                        <Dropdown.Toggle
                          variant="outline-primary"
                          size="sm"
                          id={`actions-${r.id}`}
                        >
                          Actions
                        </Dropdown.Toggle>
                        <Dropdown.Menu align="end">
                          <Dropdown.Item as={Link} to={`/admin/help-requests/${r.id}`}>
                            View Details
                          </Dropdown.Item>
                          {(r.status === 'REQUESTED' || r.status === 'UNDER_REVIEW') && (
                            <>
                              <Dropdown.Divider />
                              <Dropdown.Item onClick={() => openAssignModal(r)}>
                                Assign to Social Worker
                              </Dropdown.Item>
                              <Dropdown.Item
                                onClick={() =>
                                  handleStatusChange(r.id, 'UNDER_REVIEW')
                                }
                              >
                                Accept for Review
                              </Dropdown.Item>
                              <Dropdown.Item
                                onClick={() => openRejectModal(r)}
                                className="text-danger"
                              >
                                Reject
                              </Dropdown.Item>
                            </>
                          )}
                          {(r.status === 'ASSIGNED' || r.status === 'IN_PROGRESS') && (
                            <>
                              <Dropdown.Divider />
                              <Dropdown.Item onClick={() => openAssignModal(r)}>
                                Reassign
                              </Dropdown.Item>
                              <Dropdown.Item
                                onClick={() =>
                                  handleStatusChange(r.id, 'COMPLETED')
                                }
                              >
                                Mark Completed
                              </Dropdown.Item>
                            </>
                          )}
                        </Dropdown.Menu>
                      </Dropdown>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      <Modal show={showAssignModal} onHide={() => setShowAssignModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Assign to Social Worker</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedRequest && (
            <>
              <p className="text-muted small mb-3">
                Request: {selectedRequest.trackingId || selectedRequest.id}
              </p>
              <div className="alert alert-info py-2 small">
                AI suggestion: Match by specializations and workload for best outcome.
              </div>
              <Form.Group className="mb-3">
                <Form.Label>Select Social Worker</Form.Label>
                <Form.Select
                  value={assignWorkerId}
                  onChange={(e) => setAssignWorkerId(e.target.value)}
                >
                  <option value="">Choose...</option>
                  {workers.map((w) => (
                    <option key={w.userId || w.id} value={w.userId || w.id}>
                      {w.fullName} - {w.organization || 'N/A'}
                      {w.specializations?.length
                        ? ` (${w.specializations.join(', ')})`
                        : ''}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAssignModal(false)}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleAssign}
            disabled={assignLoading || !assignWorkerId}
          >
            {assignLoading ? 'Assigning...' : 'Assign'}
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showRejectModal} onHide={() => setShowRejectModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Reject Help Request</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>Reason (required)</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Provide a reason for rejection..."
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowRejectModal(false)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleReject}
            disabled={actionLoading}
          >
            {actionLoading ? 'Rejecting...' : 'Reject'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}
