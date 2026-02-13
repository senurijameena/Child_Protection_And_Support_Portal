import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Badge, Button, Card, Col, Container, Form, Modal, Row, Spinner, Table } from 'react-bootstrap'
import { useAuth } from '../../hooks/useAuth'
import {
  getAvailableSocialWorkers,
  getAssignedRequests,
  getTransfersByUser,
  requestHelpRequestTransfer,
  type TransferRequestDTO,
} from '../../services/socialWorkerApi'

// Types for transfer requests
type TransferStatus = 'PENDING' | 'APPROVED' | 'ACTIVE' | 'COMPLETED' | 'REJECTED' | 'CANCELLED'
type TransferDirection = 'INCOMING' | 'OUTGOING'

const STATUS_VARIANTS: Record<TransferStatus, string> = {
  PENDING: 'warning',
  APPROVED: 'primary',
  ACTIVE: 'primary',
  COMPLETED: 'success',
  REJECTED: 'danger',
  CANCELLED: 'secondary',
}

export function SocialWorkerTransfersPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<'pending' | 'active' | 'completed'>('pending')
  const [transfers, setTransfers] = useState<TransferRequestDTO[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [availableSW, setAvailableSW] = useState<
    Array<{ userId: string; fullName: string; availabilityStatus?: string; specializations?: string[]; serviceArea?: string }>
  >([])
  const [assignedRequests, setAssignedRequests] = useState<{ id: string; trackingId?: string; status?: string; helpType?: string }[]>([])
  const [selectedRequestId, setSelectedRequestId] = useState('')
  const [selectedSwUserId, setSelectedSwUserId] = useState('')
  const [transferReason, setTransferReason] = useState('')
  const [transferSubmitting, setTransferSubmitting] = useState(false)
  const [transferError, setTransferError] = useState<string | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [loadingSW, setLoadingSW] = useState(false)
  
  // Filter states
  const [directionFilter, setDirectionFilter] = useState<'ALL' | TransferDirection>('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  
  // Modal states
  const [selectedPending, setSelectedPending] = useState<PendingTransfer | null>(null)
  const [showPendingModal, setShowPendingModal] = useState(false)
  const [selectedActive, setSelectedActive] = useState<ActiveTransfer | null>(null)
  const [showTimelineModal, setShowTimelineModal] = useState(false)
  const [selectedCompleted, setSelectedCompleted] = useState<CompletedTransfer | null>(null)
  const [showAuditModal, setShowAuditModal] = useState(false)

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  const formatShortDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
    })
  }

  const fetchTransfers = async (uid: string) => {
    setLoading(true)
    try {
      const list = await getTransfersByUser(uid)
      setTransfers(Array.isArray(list) ? list : [])
      setError(null)
    } catch (err) {
      console.error('Failed to load transfers', err)
      setError(err instanceof Error ? err.message : 'Failed to load transfers')
      setTransfers([])
    } finally {
      setLoading(false)
    }
  }

  const loadAvailableSW = async () => {
    setLoadingSW(true)
    try {
      const list = await getAvailableSocialWorkers()
      setAvailableSW(Array.isArray(list) ? list : [])
    } catch {
      setAvailableSW([])
    } finally {
      setLoadingSW(false)
    }
  }

  const loadAssigned = async (uid: string) => {
    try {
      const list = await getAssignedRequests(uid)
      setAssignedRequests(Array.isArray(list) ? list : [])
    } catch {
      setAssignedRequests([])
    }
  }

  useEffect(() => {
    if (!user?.userId) return
    fetchTransfers(user.userId)
    loadAssigned(user.userId)
  }, [user?.userId])

  const filteredPendingTransfers = useMemo(() => {
    return transfers
      .filter((t) => (t.status || '').toUpperCase() === 'PENDING')
      .map((t) => ({
        ...t,
        direction: t.toUserId === user?.userId ? 'INCOMING' : 'OUTGOING',
      }))
      .filter((t) => {
        const matchesDirection = directionFilter === 'ALL' || (t as any).direction === directionFilter
        const rq = (t.requestId || t.id || '').toLowerCase()
        const matchesSearch =
          searchQuery === '' ||
          rq.includes(searchQuery.toLowerCase()) ||
          (t.reason || '').toLowerCase().includes(searchQuery.toLowerCase())
        return matchesDirection && matchesSearch
      })
  }, [transfers, directionFilter, searchQuery, user?.userId])

  const activeTransfers = useMemo(
    () => transfers.filter((t) => ['APPROVED', 'ACTIVE'].includes((t.status || '').toUpperCase())),
    [transfers]
  )

  const completedTransfers = useMemo(
    () => transfers.filter((t) => ['COMPLETED', 'REJECTED', 'CANCELLED'].includes((t.status || '').toUpperCase())),
    [transfers]
  )

  // Handlers for pending transfers (stubbed until accept/reject APIs exist)
  const handleAccept = (transferId: string) => {
    console.log('Accept transfer (todo API):', transferId)
  }

  const handleReject = (transferId: string) => {
    console.log('Reject transfer (todo API):', transferId)
  }

  const handleCancel = (transferId: string) => {
    console.log('Cancel transfer (todo API):', transferId)
  }

  const handleViewPending = (transfer: PendingTransfer) => {
    setSelectedPending(transfer)
    setShowPendingModal(true)
  }

  const handleViewTimeline = (transfer: ActiveTransfer) => {
    setSelectedActive(transfer)
    setShowTimelineModal(true)
  }

  const handleViewAudit = (transfer: CompletedTransfer) => {
    setSelectedCompleted(transfer)
    setShowAuditModal(true)
  }

  const handleOpenRequest = (helpRequestId: string) => {
    navigate(`/social-worker/requests/${helpRequestId}`)
  }

  // Count incoming pending transfers for badge
  const incomingPendingCount = filteredPendingTransfers.filter((t: any) => t.direction === 'INCOMING').length

  // Render Pending Requests Tab
  const renderPendingTab = () => (
    <div>
      {/* Filters */}
      <div className="d-flex flex-wrap gap-3 mb-4">
        <Form.Control
          type="search"
          placeholder="Search by Request ID, Owner..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ maxWidth: 300 }}
          className="rounded-pill"
        />
        <Form.Select
          value={directionFilter}
          onChange={(e) => setDirectionFilter(e.target.value as 'ALL' | TransferDirection)}
          style={{ maxWidth: 180 }}
          className="rounded-pill"
        >
          <option value="ALL">All Requests</option>
          <option value="INCOMING">Incoming Only</option>
          <option value="OUTGOING">Outgoing Only</option>
        </Form.Select>
      </div>

      {loading ? (
        <div className="text-center text-muted py-5">
          <Spinner animation="border" />
          <p className="mt-3 mb-0">Loading transfers...</p>
        </div>
      ) : filteredPendingTransfers.length === 0 ? (
        <div className="text-center text-muted py-5">
          <span style={{ fontSize: '3rem' }}>📭</span>
          <p className="mt-3 mb-0">No pending transfer requests.</p>
        </div>
      ) : (
        <div className="table-responsive">
          <Table hover className="align-middle mb-0">
            <thead className="bg-light">
              <tr>
                <th className="fw-600 text-muted small py-3 ps-3">Request ID</th>
                <th className="fw-600 text-muted small py-3">Original Owner</th>
                <th className="fw-600 text-muted small py-3">New Owner</th>
                <th className="fw-600 text-muted small py-3">Reason</th>
                <th className="fw-600 text-muted small py-3">Date</th>
                <th className="fw-600 text-muted small py-3">Direction</th>
                <th className="fw-600 text-muted small py-3 pe-3 text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPendingTransfers.map((transfer: any) => (
                <tr key={transfer.id} className="border-bottom">
                  <td className="py-3 ps-3">
                    <span className="fw-600">{transfer.requestId || transfer.helpRequestId || transfer.id}</span>
                  </td>
                  <td className="py-3">
                    <span className="small">{transfer.fromUserId || 'N/A'}</span>
                  </td>
                  <td className="py-3">
                    <span className="small fw-600 text-primary">{transfer.toUserId || 'N/A'}</span>
                  </td>
                  <td className="py-3">
                    <span 
                      className="small text-muted" 
                      style={{ 
                        display: 'block',
                        maxWidth: 200,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                      title={transfer.reason}
                    >
                      {transfer.reason}
                    </span>
                  </td>
                  <td className="py-3">
                    <span className="small text-muted">{formatShortDate(transfer.requestedDate)}</span>
                  </td>
                  <td className="py-3">
                    <Badge bg={transfer.direction === 'INCOMING' ? 'info' : 'secondary'}>
                      {transfer.direction === 'INCOMING' ? '← Incoming' : '→ Outgoing'}
                    </Badge>
                  </td>
                  <td className="py-3 pe-3">
                    <div className="d-flex justify-content-end gap-2 flex-wrap">
                      {transfer.direction === 'INCOMING' ? (
                        <>
                          <Button
                            variant="success"
                            size="sm"
                            className="rounded-pill px-2"
                            onClick={() => handleAccept(transfer.id)}
                          >
                            Accept
                          </Button>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            className="rounded-pill px-2"
                            onClick={() => handleReject(transfer.id)}
                          >
                            Reject
                          </Button>
                        </>
                      ) : (
                        <Button
                          variant="outline-secondary"
                          size="sm"
                          className="rounded-pill px-2"
                          onClick={() => handleCancel(transfer.id)}
                        >
                          Cancel
                        </Button>
                      )}
                      <Button
                        variant="outline-primary"
                        size="sm"
                        className="rounded-pill px-2"
                        onClick={() => handleViewPending(transfer)}
                      >
                        View
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      )}
    </div>
  )

  // Render Active Transfers Tab
  const renderActiveTab = () => (
    <div>
      {activeTransfers.length === 0 ? (
        <div className="text-center text-muted py-5">
          <span style={{ fontSize: '3rem' }}>📂</span>
          <p className="mt-3 mb-0">No active transfers in progress.</p>
        </div>
      ) : (
        <div className="table-responsive">
          <Table hover className="align-middle mb-0">
            <thead className="bg-light">
              <tr>
                <th className="fw-600 text-muted small py-3 ps-3">Request ID</th>
                <th className="fw-600 text-muted small py-3">Original Owner</th>
                <th className="fw-600 text-muted small py-3">New Owner</th>
                <th className="fw-600 text-muted small py-3">Role Type</th>
                <th className="fw-600 text-muted small py-3">Approval Date</th>
                <th className="fw-600 text-muted small py-3 text-center">Pending Tasks</th>
                <th className="fw-600 text-muted small py-3">Status</th>
                <th className="fw-600 text-muted small py-3 pe-3 text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {activeTransfers.map((transfer) => (
                <tr key={transfer.id} className="border-bottom">
                  <td className="py-3 ps-3">
                    <span className="fw-600 text-primary">{transfer.requestId}</span>
                  </td>
                  <td className="py-3">
                    <span className="small">{transfer.originalOwner}</span>
                  </td>
                  <td className="py-3">
                    <span className="small">{transfer.newOwner}</span>
                  </td>
                  <td className="py-3">
                    <Badge bg={transfer.roleType === 'FULL' ? 'primary' : 'info'} className="fw-normal">
                      {ROLE_TYPE_LABELS[transfer.roleType]}
                    </Badge>
                  </td>
                  <td className="py-3">
                    <span className="small text-muted">{formatShortDate(transfer.approvalDate)}</span>
                  </td>
                  <td className="py-3 text-center">
                    <span className={`small fw-600 ${transfer.pendingTasks.completed === transfer.pendingTasks.total ? 'text-success' : 'text-warning'}`}>
                      {transfer.pendingTasks.completed}/{transfer.pendingTasks.total}
                    </span>
                  </td>
                  <td className="py-3">
                    <Badge bg="primary">Active</Badge>
                  </td>
                  <td className="py-3 pe-3">
                    <div className="d-flex justify-content-end gap-2 flex-wrap">
                      <Button
                        variant="primary"
                        size="sm"
                        className="rounded-pill px-2"
                        onClick={() => handleOpenRequest(transfer.helpRequestId)}
                      >
                        Open
                      </Button>
                      <Button
                        variant="outline-secondary"
                        size="sm"
                        className="rounded-pill px-2"
                        onClick={() => handleViewTimeline(transfer)}
                      >
                        Timeline
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      )}

      {/* Active Transfer Info */}
      <div className="bg-info bg-opacity-10 border border-info rounded-3 p-3 mt-4">
        <div className="d-flex align-items-start gap-2">
          <span>ℹ️</span>
          <p className="mb-0 small text-muted">
            <strong className="text-dark">Active Transfers:</strong> These transfers have been approved and are in progress. 
            Complete pending tasks to finalize the transfer. Click "Open" to view the full request details.
          </p>
        </div>
      </div>
    </div>
  )

  // Render Completed Transfers Tab
  const renderCompletedTab = () => (
    <div>
      {/* Summary Stats */}
      <Row className="g-3 mb-4">
        <Col xs={6} md={3}>
          <div className="bg-light rounded-3 p-3 text-center">
            <div className="fw-700 h4 mb-1 text-primary">{completedTransfers.length}</div>
            <div className="small text-muted">Total Completed</div>
          </div>
        </Col>
        <Col xs={6} md={3}>
          <div className="bg-light rounded-3 p-3 text-center">
            <div className="fw-700 h4 mb-1 text-success">
              {completedTransfers.filter((t) => t.outcome === 'COMPLETED').length}
            </div>
            <div className="small text-muted">Fully Completed</div>
          </div>
        </Col>
        <Col xs={6} md={3}>
          <div className="bg-light rounded-3 p-3 text-center">
            <div className="fw-700 h4 mb-1 text-info">
              {completedTransfers.filter((t) => t.roleType === 'FULL').length}
            </div>
            <div className="small text-muted">Full Transfers</div>
          </div>
        </Col>
        <Col xs={6} md={3}>
          <div className="bg-light rounded-3 p-3 text-center">
            <div className="fw-700 h4 mb-1 text-warning">
              {completedTransfers.filter((t) => t.roleType === 'PARTIAL').length}
            </div>
            <div className="small text-muted">Partial Transfers</div>
          </div>
        </Col>
      </Row>

      {completedTransfers.length === 0 ? (
        <div className="text-center text-muted py-5">
          <span style={{ fontSize: '3rem' }}>📜</span>
          <p className="mt-3 mb-0">No completed transfers found.</p>
        </div>
      ) : (
        <div className="table-responsive">
          <Table hover className="align-middle mb-0">
            <thead className="bg-light">
              <tr>
                <th className="fw-600 text-muted small py-3 ps-3">Request ID</th>
                <th className="fw-600 text-muted small py-3">Original Owner</th>
                <th className="fw-600 text-muted small py-3">New Owner</th>
                <th className="fw-600 text-muted small py-3">Role Type</th>
                <th className="fw-600 text-muted small py-3">Transfer Date</th>
                <th className="fw-600 text-muted small py-3">Outcome</th>
                <th className="fw-600 text-muted small py-3 pe-3 text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {completedTransfers.map((transfer) => (
                <tr key={transfer.id} className="border-bottom">
                  <td className="py-3 ps-3">
                    <span className="fw-600">{transfer.requestId}</span>
                  </td>
                  <td className="py-3">
                    <span className="small">{transfer.originalOwner}</span>
                  </td>
                  <td className="py-3">
                    <span className="small">{transfer.newOwner}</span>
                  </td>
                  <td className="py-3">
                    <Badge bg={transfer.roleType === 'FULL' ? 'primary' : 'info'} className="fw-normal">
                      {ROLE_TYPE_LABELS[transfer.roleType]}
                    </Badge>
                  </td>
                  <td className="py-3">
                    <span className="small text-muted">{formatShortDate(transfer.transferDate)}</span>
                  </td>
                  <td className="py-3">
                    <Badge bg="success">Completed</Badge>
                  </td>
                  <td className="py-3 pe-3">
                    <div className="d-flex justify-content-end gap-2 flex-wrap">
                      <Button
                        variant="outline-primary"
                        size="sm"
                        className="rounded-pill px-2"
                        onClick={() => handleOpenRequest(transfer.helpRequestId)}
                      >
                        View Case
                      </Button>
                      <Button
                        variant="outline-secondary"
                        size="sm"
                        className="rounded-pill px-2"
                        onClick={() => handleViewAudit(transfer)}
                      >
                        Audit Trail
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      )}

      {/* History Info */}
      <div className="bg-secondary bg-opacity-10 border border-secondary rounded-3 p-3 mt-4">
        <div className="d-flex align-items-start gap-2">
          <span>📋</span>
          <p className="mb-0 small text-muted">
            <strong className="text-dark">Transfer History:</strong> This section maintains a complete record of all completed transfers 
            for auditing and accountability purposes. Click "Audit Trail" to see the full transfer timeline.
          </p>
        </div>
      </div>
    </div>
  )

  return (
    <Container fluid className="py-4 sw-dashboard">
      {/* Header */}
      <Row className="mb-4">
        <Col xs={12}>
          <div className="d-flex align-items-center gap-2 mb-2">
            <span style={{ fontSize: '1.75rem' }}>🔄</span>
            <h1 className="h3 fw-700 mb-0">Transfer Requests</h1>
          </div>
          <p className="text-muted mb-0">
            Manage case transfers between social workers.
          </p>
        </Col>
      </Row>

      {/* Tabs */}
      <Row className="mb-4">
        <Col xs={12}>
          <Card className="sw-card border-0">
            <Card.Body className="p-0">
              <div className="d-flex border-bottom">
                <button
                  type="button"
                  className={`btn btn-link text-decoration-none px-4 py-3 rounded-0 fw-600 position-relative ${
                    activeTab === 'pending'
                      ? 'text-primary border-bottom border-primary border-2'
                      : 'text-muted'
                  }`}
                  onClick={() => setActiveTab('pending')}
                >
                  Pending Requests
                  {incomingPendingCount > 0 && (
                    <Badge
                      bg="danger"
                      pill
                      className="ms-2"
                      style={{ fontSize: '0.65rem' }}
                    >
                      {incomingPendingCount}
                    </Badge>
                  )}
                </button>
                <button
                  type="button"
                  className={`btn btn-link text-decoration-none px-4 py-3 rounded-0 fw-600 ${
                    activeTab === 'active'
                      ? 'text-primary border-bottom border-primary border-2'
                      : 'text-muted'
                  }`}
                  onClick={() => setActiveTab('active')}
                >
                  Active Transfers
                  {activeTransfers.length > 0 && (
                    <Badge
                      bg="primary"
                      pill
                      className="ms-2"
                      style={{ fontSize: '0.65rem' }}
                    >
                      {activeTransfers.length}
                    </Badge>
                  )}
                </button>
                <button
                  type="button"
                  className={`btn btn-link text-decoration-none px-4 py-3 rounded-0 fw-600 ${
                    activeTab === 'completed'
                      ? 'text-primary border-bottom border-primary border-2'
                      : 'text-muted'
                  }`}
                  onClick={() => setActiveTab('completed')}
                >
                  Completed Transfers
                </button>
              </div>

              {/* Tab Content */}
              <div className="p-4">
                {activeTab === 'pending' && renderPendingTab()}
                {activeTab === 'active' && renderActiveTab()}
                {activeTab === 'completed' && renderCompletedTab()}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Pending Transfer View Modal */}
      <Modal
        show={showPendingModal}
        onHide={() => setShowPendingModal(false)}
        centered
        size="lg"
      >
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fw-700">
            <span className="me-2">📋</span>
            Transfer Request Details
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="pt-2">
          {selectedPending && (
            <div>
              {/* Request Info Header */}
              <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 pb-3 border-bottom">
                <div>
                  <span className="text-muted small">Request ID</span>
                  <h5 className="fw-700 mb-0">{selectedPending.requestId}</h5>
                </div>
                <Badge bg={selectedPending.direction === 'INCOMING' ? 'info' : 'secondary'} className="px-3 py-2">
                  {selectedPending.direction === 'INCOMING' ? '← Incoming' : '→ Outgoing'}
                </Badge>
              </div>

              {/* Transfer Details */}
              <Row className="mb-4">
                <Col md={6}>
                  <div className="bg-light rounded-3 p-3 h-100">
                    <span className="text-muted small d-block mb-1">Original Owner</span>
                    <span className="fw-600">{selectedPending.originalOwner}</span>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="bg-light rounded-3 p-3 h-100">
                    <span className="text-muted small d-block mb-1">Requested New Owner</span>
                    <span className="fw-600">{selectedPending.requestedNewOwner}</span>
                  </div>
                </Col>
              </Row>

              {/* Reason */}
              <div className="mb-4">
                <h6 className="fw-700 text-dark mb-2">
                  <span className="me-2">📝</span>
                  Transfer Reason
                </h6>
                <div className="bg-light rounded-3 p-3">
                  <p className="mb-0 text-dark">{selectedPending.reason}</p>
                </div>
              </div>

              {/* Case Summary */}
              <div className="mb-4">
                <h6 className="fw-700 text-dark mb-2">
                  <span className="me-2">📂</span>
                  Case Summary
                </h6>
                <div className="bg-light rounded-3 p-3">
                  <div className="mb-2">
                    <Badge bg="secondary" className="me-2">{selectedPending.caseCategory}</Badge>
                  </div>
                  <p className="mb-0 text-dark">{selectedPending.caseSummary}</p>
                </div>
              </div>

              {/* Current Progress */}
              <div className="mb-4">
                <h6 className="fw-700 text-dark mb-2">
                  <span className="me-2">📊</span>
                  Current Progress
                </h6>
                <div className="bg-light rounded-3 p-3">
                  <p className="mb-0 text-dark">{selectedPending.currentProgress}</p>
                </div>
              </div>

              {/* Notes */}
              <div className="mb-3">
                <h6 className="fw-700 text-dark mb-2">
                  <span className="me-2">📌</span>
                  Additional Notes
                </h6>
                <div className="bg-light rounded-3 p-3">
                  <p className="mb-0 text-dark">{selectedPending.notes}</p>
                </div>
              </div>

              {/* Date */}
              <div className="text-muted small mt-3">
                Requested on: {formatDate(selectedPending.requestedDate)}
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer className="border-0 pt-0">
          <Button
            variant="outline-secondary"
            onClick={() => setShowPendingModal(false)}
            className="rounded-pill px-4"
          >
            Close
          </Button>
          {selectedPending?.direction === 'INCOMING' && (
            <>
              <Button
                variant="outline-danger"
                className="rounded-pill px-4"
                onClick={() => {
                  handleReject(selectedPending.id)
                  setShowPendingModal(false)
                }}
              >
                Reject
              </Button>
              <Button
                variant="success"
                className="rounded-pill px-4"
                onClick={() => {
                  handleAccept(selectedPending.id)
                  setShowPendingModal(false)
                }}
              >
                Accept Transfer
              </Button>
            </>
          )}
          {selectedPending?.direction === 'OUTGOING' && (
            <Button
              variant="outline-danger"
              className="rounded-pill px-4"
              onClick={() => {
                handleCancel(selectedPending.id)
                setShowPendingModal(false)
              }}
            >
              Cancel Request
            </Button>
          )}
        </Modal.Footer>
      </Modal>

      {/* Timeline Modal */}
      <Modal
        show={showTimelineModal}
        onHide={() => setShowTimelineModal(false)}
        centered
      >
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fw-700">
            <span className="me-2">📅</span>
            Transfer Timeline
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="pt-2">
          {selectedActive && (
            <div>
              <div className="mb-4 pb-3 border-bottom">
                <span className="text-muted small">Request ID</span>
                <h5 className="fw-700 mb-0">{selectedActive.requestId}</h5>
                <div className="mt-2">
                  <Badge bg={selectedActive.roleType === 'FULL' ? 'primary' : 'info'}>
                    {ROLE_TYPE_LABELS[selectedActive.roleType]}
                  </Badge>
                </div>
              </div>

              <div className="timeline-container">
                {selectedActive.timeline.map((item, index) => (
                  <div key={index} className="d-flex gap-3 mb-3">
                    <div className="d-flex flex-column align-items-center">
                      <div 
                        className="rounded-circle bg-primary d-flex align-items-center justify-content-center text-white"
                        style={{ width: 32, height: 32, fontSize: '0.8rem' }}
                      >
                        {index + 1}
                      </div>
                      {index < selectedActive.timeline.length - 1 && (
                        <div className="flex-grow-1 bg-light" style={{ width: 2, minHeight: 30 }} />
                      )}
                    </div>
                    <div className="flex-grow-1 pb-3">
                      <div className="fw-600 small">{item.action}</div>
                      <div className="text-muted small">
                        {formatDate(item.date)} • {item.by}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-light rounded-3 p-3 mt-3">
                <div className="d-flex justify-content-between small">
                  <span className="text-muted">Progress:</span>
                  <span className="fw-600">
                    {selectedActive.pendingTasks.completed}/{selectedActive.pendingTasks.total} tasks completed
                  </span>
                </div>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer className="border-0 pt-0">
          <Button
            variant="outline-secondary"
            onClick={() => setShowTimelineModal(false)}
            className="rounded-pill px-4"
          >
            Close
          </Button>
          {selectedActive && (
            <Button
              variant="primary"
              className="rounded-pill px-4"
              onClick={() => {
                handleOpenRequest(selectedActive.helpRequestId)
                setShowTimelineModal(false)
              }}
            >
              Open Request
            </Button>
          )}
        </Modal.Footer>
      </Modal>

      {/* Audit Trail Modal */}
      <Modal
        show={showAuditModal}
        onHide={() => setShowAuditModal(false)}
        centered
        size="lg"
      >
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fw-700">
            <span className="me-2">📜</span>
            Audit Trail
            <Badge bg="secondary" className="ms-2 fw-normal" style={{ fontSize: '0.7rem' }}>
              Read Only
            </Badge>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="pt-2">
          {selectedCompleted && (
            <div>
              <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 pb-3 border-bottom">
                <div>
                  <span className="text-muted small">Request ID</span>
                  <h5 className="fw-700 mb-0">{selectedCompleted.requestId}</h5>
                </div>
                <Badge bg="success" className="px-3 py-2">Completed</Badge>
              </div>

              {/* Transfer Info */}
              <Row className="mb-4">
                <Col md={6}>
                  <div className="bg-light rounded-3 p-3">
                    <span className="text-muted small d-block">From</span>
                    <span className="fw-600">{selectedCompleted.originalOwner}</span>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="bg-light rounded-3 p-3">
                    <span className="text-muted small d-block">To</span>
                    <span className="fw-600">{selectedCompleted.newOwner}</span>
                  </div>
                </Col>
              </Row>

              {/* Audit Trail */}
              <h6 className="fw-700 text-dark mb-3">
                <span className="me-2">📋</span>
                Complete Audit Trail
              </h6>
              <div className="border rounded-3 overflow-hidden">
                <Table className="mb-0 small">
                  <thead className="bg-light">
                    <tr>
                      <th className="py-2 ps-3">Date</th>
                      <th className="py-2">Action</th>
                      <th className="py-2">By</th>
                      <th className="py-2 pe-3">Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedCompleted.auditTrail.map((item, index) => (
                      <tr key={index}>
                        <td className="py-2 ps-3 text-muted">{formatShortDate(item.date)}</td>
                        <td className="py-2 fw-600">{item.action}</td>
                        <td className="py-2">{item.by}</td>
                        <td className="py-2 pe-3 text-muted">{item.details}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>

              {/* Notes */}
              <div className="mt-4">
                <h6 className="fw-700 text-dark mb-2">
                  <span className="me-2">📝</span>
                  Final Notes
                </h6>
                <div className="bg-light rounded-3 p-3">
                  <p className="mb-0">{selectedCompleted.notes}</p>
                </div>
              </div>

              {/* Archive Notice */}
              <div className="bg-secondary bg-opacity-10 border border-secondary rounded-3 p-3 mt-4">
                <div className="d-flex align-items-start gap-2">
                  <span>📂</span>
                  <p className="mb-0 small text-muted">
                    <strong className="text-dark">Archived Record:</strong> This transfer has been completed and archived. 
                    All actions are recorded for accountability and auditing purposes.
                  </p>
                </div>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer className="border-0 pt-0">
          <Button
            variant="outline-secondary"
            onClick={() => setShowAuditModal(false)}
            className="rounded-pill px-4"
          >
            Close
          </Button>
          {selectedCompleted && (
            <Button
              variant="outline-primary"
              className="rounded-pill px-4"
              onClick={() => {
                handleOpenRequest(selectedCompleted.helpRequestId)
                setShowAuditModal(false)
              }}
            >
              View Case Summary
            </Button>
          )}
        </Modal.Footer>
      </Modal>
    </Container>
  )
}
