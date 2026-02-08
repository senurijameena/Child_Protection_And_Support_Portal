import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Card,
  Row,
  Col,
  Table,
  Badge,
  Form,
  Modal,
  Spinner,
  Button,
} from 'react-bootstrap'
import { useAuth } from '../../hooks/useAuth'
import {
  getAssignedRequests,
  acceptHelpRequest,
  declineHelpRequest,
} from '../../services/socialWorkerApi'
import type { HelpRequestDTO } from '../../types/dashboard'
import { REQUEST_STATUS_LABELS, HELP_TYPE_LABELS } from '../../types/dashboard'

const STATUS_OPTIONS = ['ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'REJECTED', 'CANCELLED']
const PRIORITY_OPTIONS = ['HIGH', 'MEDIUM', 'LOW']

export function SocialWorkerRequestsPage() {
  const { user } = useAuth()
  const userId = user?.userId ?? ''
  const [requests, setRequests] = useState<HelpRequestDTO[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'list' | 'card'>('list')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterType, setFilterType] = useState('')
  const [filterPriority, setFilterPriority] = useState('')
  const [filterDateFrom, setFilterDateFrom] = useState('')
  const [showDeclineModal, setShowDeclineModal] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState<HelpRequestDTO | null>(null)
  const [declineReason, setDeclineReason] = useState('')
  const [actionLoading, setActionLoading] = useState(false)

  const loadRequests = () => {
    if (!userId) return
    setLoading(true)
    getAssignedRequests(userId)
      .then(setRequests)
      .catch(() => setRequests([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadRequests()
  }, [userId])

  const filtered = requests.filter((r) => {
    if (filterStatus && r.status !== filterStatus) return false
    if (filterType && r.helpType !== filterType) return false
    if (filterPriority && r.priority !== filterPriority) return false
    if (filterDateFrom && r.requestDate) {
      const reqDate = new Date(r.requestDate)
      const fromDate = new Date(filterDateFrom)
      if (reqDate < fromDate) return false
    }
    return true
  })

  const canAccept = (r: HelpRequestDTO) => r.status === 'ASSIGNED'
  const canDecline = (r: HelpRequestDTO) => r.status === 'ASSIGNED'

  const handleAccept = async (requestId: string) => {
    setActionLoading(true)
    try {
      await acceptHelpRequest(requestId)
      loadRequests()
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Failed to accept')
    } finally {
      setActionLoading(false)
    }
  }

  const openDeclineModal = (r: HelpRequestDTO) => {
    setSelectedRequest(r)
    setShowDeclineModal(true)
    setDeclineReason('')
  }

  const handleDecline = async () => {
    if (!selectedRequest || !declineReason.trim()) {
      alert('Reason is required when declining')
      return
    }
    setActionLoading(true)
    try {
      await declineHelpRequest(selectedRequest.id, declineReason.trim())
      loadRequests()
      setShowDeclineModal(false)
      setSelectedRequest(null)
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Failed to decline')
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="d-flex justify-content-center py-5">
        <Spinner animation="border" style={{ color: '#2d6a4f' }} />
      </div>
    )
  }

  return (
    <div className="animate-fade-in-up">
      <div className="d-flex flex-wrap justify-content-between align-items-start gap-3 mb-4">
        <div>
          <h1 className="h3 fw-bold text-dark mb-1">Assigned Requests</h1>
          <p className="text-muted mb-0">
            View, accept, or decline assigned help requests. Accept to begin service delivery.
          </p>
        </div>
        <div className="d-flex gap-2 align-items-center">
          <Button
            variant={viewMode === 'list' ? 'outline-secondary' : 'light'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            List
          </Button>
          <Button
            variant={viewMode === 'card' ? 'outline-secondary' : 'light'}
            size="sm"
            onClick={() => setViewMode('card')}
          >
            Cards
          </Button>
        </div>
      </div>

      <Card className="border-0 shadow-sm rounded-3 mb-4">
        <Card.Body>
          <Row className="g-3">
            <Col md={6} lg={3}>
              <Form.Label className="small text-muted">Status</Form.Label>
              <Form.Select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="">All</option>
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>{REQUEST_STATUS_LABELS[s as keyof typeof REQUEST_STATUS_LABELS]}</option>
                ))}
              </Form.Select>
            </Col>
            <Col md={6} lg={3}>
              <Form.Label className="small text-muted">Type</Form.Label>
              <Form.Select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <option value="">All</option>
                {Object.entries(HELP_TYPE_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </Form.Select>
            </Col>
            <Col md={6} lg={2}>
              <Form.Label className="small text-muted">Priority</Form.Label>
              <Form.Select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
              >
                <option value="">All</option>
                {PRIORITY_OPTIONS.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </Form.Select>
            </Col>
            <Col md={6} lg={2}>
              <Form.Label className="small text-muted">From date</Form.Label>
              <Form.Control
                type="date"
                value={filterDateFrom}
                onChange={(e) => setFilterDateFrom(e.target.value)}
              />
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {viewMode === 'list' ? (
        <Card className="border-0 shadow-sm rounded-3">
          <Card.Body className="p-0">
            {filtered.length === 0 ? (
              <div className="p-5 text-muted text-center">No requests match your filters.</div>
            ) : (
              <Table hover responsive className="mb-0">
                <thead>
                  <tr>
                    <th>Tracking ID</th>
                    <th>Type</th>
                    <th>Requester</th>
                    <th>Status</th>
                    <th>Priority</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r) => (
                    <tr key={r.id}>
                      <td>
                        <Link
                          to={`/social-worker/requests/${r.id}`}
                          className="text-decoration-none"
                          style={{ color: '#2d6a4f' }}
                        >
                          {r.trackingId || r.id?.slice(0, 8)}
                        </Link>
                      </td>
                      <td>{HELP_TYPE_LABELS[(r.helpType as keyof typeof HELP_TYPE_LABELS) || 'OTHER']}</td>
                      <td>
                        {r.anonymous ? (
                          <Badge bg="secondary">Anonymous</Badge>
                        ) : (
                          r.requesterName || 'Requester'
                        )}
                      </td>
                      <td>
                        <Badge
                          bg={
                            r.status === 'ASSIGNED'
                              ? 'warning'
                              : r.status === 'IN_PROGRESS'
                                ? 'info'
                                : r.status === 'COMPLETED' || r.status === 'REJECTED'
                                  ? 'success'
                                  : 'secondary'
                          }
                        >
                          {REQUEST_STATUS_LABELS[(r.status as keyof typeof REQUEST_STATUS_LABELS) || 'REQUESTED']}
                        </Badge>
                      </td>
                      <td>
                        <Badge bg={r.priority === 'HIGH' ? 'danger' : 'secondary'}>
                          {r.priority || 'MEDIUM'}
                        </Badge>
                      </td>
                      <td className="text-muted small">
                        {r.requestDate ? new Date(r.requestDate).toLocaleDateString() : '-'}
                      </td>
                      <td>
                        {canAccept(r) && (
                          <Button
                            size="sm"
                            className="me-1 sw-btn-primary"
                            onClick={() => handleAccept(r.id)}
                            disabled={actionLoading}
                          >
                            Accept
                          </Button>
                        )}
                        {canDecline(r) && (
                          <Button
                            size="sm"
                            variant="outline-danger"
                            onClick={() => openDeclineModal(r)}
                            disabled={actionLoading}
                          >
                            Decline
                          </Button>
                        )}
                        {r.status !== 'ASSIGNED' && (
                          <Link
                            to={`/social-worker/requests/${r.id}`}
                            className="btn btn-sm btn-outline-secondary ms-1"
                          >
                            View
                          </Link>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </Card.Body>
        </Card>
      ) : (
        <Row className="g-3">
          {filtered.map((r) => (
            <Col key={r.id} xs={12} md={6} lg={4}>
              <Card className="border-0 shadow-sm rounded-3 h-100 sw-stat-card">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <Link
                      to={`/social-worker/requests/${r.id}`}
                      className="text-decoration-none fw-bold"
                      style={{ color: '#2d6a4f' }}
                    >
                      {r.trackingId || r.id?.slice(0, 8)}
                    </Link>
                    <Badge
                      bg={
                        r.status === 'ASSIGNED'
                          ? 'warning'
                          : r.status === 'IN_PROGRESS'
                            ? 'info'
                            : 'success'
                      }
                    >
                      {REQUEST_STATUS_LABELS[(r.status as keyof typeof REQUEST_STATUS_LABELS) || 'REQUESTED']}
                    </Badge>
                  </div>
                  <div className="small text-muted mb-2">
                    {HELP_TYPE_LABELS[(r.helpType as keyof typeof HELP_TYPE_LABELS) || 'OTHER']}
                  </div>
                  <div className="small mb-2">
                    {r.anonymous ? (
                      <Badge bg="secondary">Anonymous</Badge>
                    ) : (
                      r.requesterName || 'Requester'
                    )}
                  </div>
                  <div className="d-flex gap-1 flex-wrap">
                    {canAccept(r) && (
                      <Button
                        size="sm"
                        className="sw-btn-primary"
                        onClick={() => handleAccept(r.id)}
                        disabled={actionLoading}
                      >
                        Accept
                      </Button>
                    )}
                    {canDecline(r) && (
                      <Button
                        size="sm"
                        variant="outline-danger"
                        onClick={() => openDeclineModal(r)}
                        disabled={actionLoading}
                      >
                        Decline
                      </Button>
                    )}
                    <Link
                      to={`/social-worker/requests/${r.id}`}
                      className="btn btn-sm btn-outline-secondary"
                    >
                      View
                    </Link>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      <Modal show={showDeclineModal} onHide={() => setShowDeclineModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Decline Request</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="text-muted small">
            A mandatory reason will be sent to the admin for reassignment.
          </p>
          <Form.Group>
            <Form.Label>Reason (required)</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={declineReason}
              onChange={(e) => setDeclineReason(e.target.value)}
              placeholder="Explain why you cannot take this request..."
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeclineModal(false)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleDecline}
            disabled={!declineReason.trim() || actionLoading}
          >
            {actionLoading ? 'Declining...' : 'Decline'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}
