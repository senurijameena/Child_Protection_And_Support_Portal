import { useEffect, useMemo, useState } from 'react'
import { Card, Container, Row, Col, Badge, Button, Form } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import {
  getAssignedRequests,
  getMyFollowUps,
  type FollowUpDTO,
} from '../../services/socialWorkerApi'
import type { HelpRequestDTO, HelpType } from '../../types/dashboard'
import { HELP_TYPE_LABELS } from '../../types/dashboard'
import './SocialWorkerDashboard.css'

type PriorityFilter = 'ALL' | 'LOW' | 'MEDIUM' | 'HIGH'
type CaseTypeFilter = 'ALL' | 'COUNSELING' | 'FINANCIAL' | 'MEDICAL' | 'SHELTER'
type StatusFilter = 'ALL' | 'ASSIGNED' | 'IN_PROGRESS' | 'WAITING' | 'OVERDUE'
type ConsentFilter = 'ALL' | 'FULL' | 'PARTIAL' | 'ANONYMOUS'

const CASE_TYPE_MAP: Record<Exclude<CaseTypeFilter, 'ALL'>, HelpType[]> = {
  COUNSELING: ['COUNSELING'],
  // Approximations until we have more granular financial types
  FINANCIAL: ['LIVELIHOOD_EMPLOYMENT'],
  MEDICAL: ['MEDICAL_HELP'],
  SHELTER: ['SHELTER'],
}

const formatDateTime = (iso?: string) => {
  if (!iso) return ''
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleString()
}

const getPriorityVariant = (priority?: string) => {
  const p = priority?.toUpperCase()
  if (p === 'HIGH') return 'danger'
  if (p === 'MEDIUM') return 'warning'
  if (p === 'LOW') return 'primary'
  return 'secondary'
}

const getStatusVariant = (status?: string) => {
  switch (status) {
    case 'ASSIGNED':
      return 'info'
    case 'IN_PROGRESS':
      return 'primary'
    case 'COMPLETED':
      return 'success'
    case 'REJECTED':
    case 'CANCELLED':
      return 'secondary'
    default:
      return 'light'
  }
}

const getHelpTypeIcon = (type?: HelpType) => {
  switch (type) {
    case 'FOOD_ASSISTANCE':
      return '🥗'
    case 'EDUCATION_SUPPORT':
      return '🎓'
    case 'MEDICAL_HELP':
      return '⚕️'
    case 'SHELTER':
      return '🏠'
    case 'CLOTHING':
      return '👕'
    case 'COUNSELING':
      return '🗣️'
    case 'LEGAL_PROTECTION':
      return '⚖️'
    case 'LIVELIHOOD_EMPLOYMENT':
      return '💼'
    case 'DISABILITY_SUPPORT':
      return '♿'
    case 'EMERGENCY_DISASTER':
      return '🚨'
    default:
      return '📂'
  }
}

export function SocialWorkerRequestsPage() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [requests, setRequests] = useState<HelpRequestDTO[]>([])
  const [followUps, setFollowUps] = useState<FollowUpDTO[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const [search, setSearch] = useState('')
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>('ALL')
  const [caseTypeFilter, setCaseTypeFilter] = useState<CaseTypeFilter>('ALL')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL')
  const [consentFilter, setConsentFilter] = useState<ConsentFilter>('ALL')
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null)

  useEffect(() => {
    if (!user?.userId) {
      setLoading(false)
      return
    }

    let isMounted = true

    const loadData = async () => {
      try {
        setLoading(true)
        const [assignedRequests, myFollowUps] = await Promise.all([
          getAssignedRequests(user.userId),
          getMyFollowUps(),
        ])

        if (!isMounted) return

        setRequests(assignedRequests)
        setFollowUps(myFollowUps)
        setError(null)
      } catch (err) {
        console.error('Failed to load assigned requests', err)
        if (isMounted) {
          setError((err as Error).message ?? 'Failed to load assigned requests')
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    loadData()

    return () => {
      isMounted = false
    }
  }, [user?.userId])

  const todayStart = useMemo(() => {
    const n = new Date()
    return new Date(n.getFullYear(), n.getMonth(), n.getDate())
  }, [])

  const { overdueRequestIds, requestDueMap } = useMemo(() => {
    const overdue = new Set<string>()
    const dueMap: Record<string, string> = {}

    followUps.forEach((fu) => {
      if (!fu.helpRequestId || !fu.scheduledDate) return
      const date = new Date(fu.scheduledDate)
      if (Number.isNaN(date.getTime())) return

      const existing = dueMap[fu.helpRequestId]
      if (!existing || new Date(existing) > date) {
        dueMap[fu.helpRequestId] = fu.scheduledDate
      }

      const isCompleted = fu.status === 'COMPLETED' || fu.status === 'DONE'
      if (!isCompleted && date < todayStart) {
        overdue.add(fu.helpRequestId)
      }
    })

    return { overdueRequestIds: overdue, requestDueMap: dueMap }
  }, [followUps, todayStart])

  const resetFilters = () => {
    setSearch('')
    setPriorityFilter('ALL')
    setCaseTypeFilter('ALL')
    setStatusFilter('ALL')
    setConsentFilter('ALL')
  }

  const filteredAndSortedRequests = useMemo(() => {
    const q = search.trim().toLowerCase()

    const filtered = requests.filter((req) => {
      // Search
      if (q) {
        const label =
          (req.trackingId ?? req.id ?? '').toString().toLowerCase() +
          ' ' +
          (req.requesterName ?? '').toLowerCase() +
          ' ' +
          (req.helpType ? HELP_TYPE_LABELS[req.helpType] : '')
            .toString()
            .toLowerCase()

        if (!label.includes(q)) {
          return false
        }
      }

      // Priority
      if (priorityFilter !== 'ALL') {
        if ((req.priority ?? '').toUpperCase() !== priorityFilter) {
          return false
        }
      }

      // Case type
      if (caseTypeFilter !== 'ALL') {
        const types = CASE_TYPE_MAP[caseTypeFilter]
        if (!req.helpType || !types.includes(req.helpType)) {
          return false
        }
      }

      // Consent level
      if (consentFilter !== 'ALL') {
        const isAnonymous = !!req.anonymous
        if (consentFilter === 'ANONYMOUS' && !isAnonymous) return false
        if ((consentFilter === 'FULL' || consentFilter === 'PARTIAL') && isAnonymous) {
          return false
        }
        // NOTE: We don't yet distinguish full vs partial consent in data;
        // they are treated equivalently for now.
      }

      // Status
      if (statusFilter !== 'ALL') {
        const s = req.status
        if (statusFilter === 'ASSIGNED' && s !== 'ASSIGNED') return false
        if (statusFilter === 'IN_PROGRESS' && s !== 'IN_PROGRESS') return false
        if (statusFilter === 'WAITING' && s !== 'REQUESTED' && s !== 'UNDER_REVIEW') return false
        if (statusFilter === 'OVERDUE' && !overdueRequestIds.has(req.id)) return false
      }

      return true
    })

    // Sort by assigned date (most recent first)
    return filtered.sort((a, b) => {
      const aDate = a.requestDate ? new Date(a.requestDate).getTime() : 0
      const bDate = b.requestDate ? new Date(b.requestDate).getTime() : 0
      return bDate - aDate
    })
  }, [requests, search, priorityFilter, caseTypeFilter, statusFilter, consentFilter, overdueRequestIds, requestDueMap])

  const selectedRequest = useMemo(
    () => filteredAndSortedRequests.find((r) => r.id === selectedRequestId) ?? null,
    [filteredAndSortedRequests, selectedRequestId]
  )

  const getConsentLabel = (req: HelpRequestDTO) => {
    if (req.anonymous) return 'Anonymous'
    // TODO: Distinguish full vs partial consent when backend supports it
    return 'Full consent'
  }

  const getDueDateLabel = (req: HelpRequestDTO) => {
    const due = requestDueMap[req.id]
    return due ? formatDateTime(due) : 'No follow-up scheduled'
  }

  const handleCardClick = (req: HelpRequestDTO) => {
    setSelectedRequestId(req.id)
  }

  const handleViewDetails = (req: HelpRequestDTO) => {
    navigate(`/social-worker/requests/${req.id}`)
  }

  const handleAccept = async (req: HelpRequestDTO) => {
    // TODO: Integrate with acceptHelpRequest API when backend is ready
    setUpdatingId(req.id)
    try {
      // Optimistically mark as in progress so buttons hide
      setRequests((prev) =>
        prev.map((r) =>
          r.id === req.id
            ? {
              ...r,
              status: 'IN_PROGRESS',
            }
            : r
        )
      )
    } finally {
      setUpdatingId(null)
    }
  }

  const handleDecline = async (req: HelpRequestDTO) => {
    // TODO: Integrate with declineHelpRequest API when backend is ready
    setUpdatingId(req.id)
    try {
      // Optimistically mark as rejected so buttons hide
      setRequests((prev) =>
        prev.map((r) =>
          r.id === req.id
            ? {
              ...r,
              status: 'REJECTED',
            }
            : r
        )
      )
    } finally {
      setUpdatingId(null)
    }
  }

  return (
    <Container fluid className="py-4 sw-dashboard">
      {error && (
        <Row className="mb-3">
          <Col xs={12}>
            <div className="alert alert-danger mb-0 small">{error}</div>
          </Col>
        </Row>
      )}

      {/* Header */}
      <Row className="mb-4">
        <Col xs={12}>
          <div className="d-flex flex-wrap justify-content-between align-items-center gap-2">
            <div>
              <h1 className="h3 fw-700 mb-1">Assigned Requests</h1>
              <p className="text-muted mb-0">
                Review, filter, and act on all requests currently assigned to you.
              </p>
            </div>
          </div>
        </Col>
      </Row>

      {/* Filters & Search */}
      <Row className="mb-4">
        <Col xs={12}>
          <Card className="sw-card border-0">
            <Card.Body>
              <Row className="g-3 align-items-end">
                <Col xs={12} md={4} lg={4}>
                  <Form.Label className="small fw-600 text-muted">
                    Search
                  </Form.Label>
                  <Form.Control
                    type="search"
                    placeholder="Search by request ID, user, type…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </Col>
                <Col xs={6} sm={6} md={4} lg={2}>
                  <Form.Label className="small fw-600 text-muted">
                    Priority
                  </Form.Label>
                  <Form.Select
                    value={priorityFilter}
                    onChange={(e) => setPriorityFilter(e.target.value as PriorityFilter)}
                  >
                    <option value="ALL">All</option>
                    <option value="HIGH">High</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="LOW">Low</option>
                  </Form.Select>
                </Col>
                <Col xs={6} sm={6} md={4} lg={2}>
                  <Form.Label className="small fw-600 text-muted">
                    Case type
                  </Form.Label>
                  <Form.Select
                    value={caseTypeFilter}
                    onChange={(e) => setCaseTypeFilter(e.target.value as CaseTypeFilter)}
                  >
                    <option value="ALL">All</option>
                    <option value="COUNSELING">Counseling</option>
                    <option value="FINANCIAL">Financial</option>
                    <option value="MEDICAL">Medical</option>
                    <option value="SHELTER">Shelter</option>
                  </Form.Select>
                </Col>
                <Col xs={6} sm={6} md={4} lg={2}>
                  <Form.Label className="small fw-600 text-muted">
                    Status
                  </Form.Label>
                  <Form.Select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                  >
                    <option value="ALL">All</option>
                    <option value="ASSIGNED">Assigned</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="WAITING">Waiting</option>
                    <option value="OVERDUE">Overdue</option>
                  </Form.Select>
                </Col>
                <Col xs={6} sm={6} md={4} lg={2}>
                  <Form.Label className="small fw-600 text-muted">
                    Consent level
                  </Form.Label>
                  <Form.Select
                    value={consentFilter}
                    onChange={(e) => setConsentFilter(e.target.value as ConsentFilter)}
                  >
                    <option value="ALL">All</option>
                    <option value="FULL">Full Consent</option>
                    <option value="ANONYMOUS">Anonymous Only</option>
                  </Form.Select>
                </Col>

              </Row>
              <div className="d-flex justify-content-between align-items-center mt-3">
                <div className="small text-muted">
                  {filteredAndSortedRequests.length} request
                  {filteredAndSortedRequests.length !== 1 ? 's' : ''} matching filters
                </div>
                <Button variant="outline-secondary" size="sm" onClick={resetFilters}>
                  Reset filters
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* List + Optional Right Panel */}
      <Row className="g-4">
        <Col xs={12} lg={selectedRequest ? 8 : 12}>
          {loading && filteredAndSortedRequests.length === 0 ? (
            <Card className="sw-card border-0">
              <Card.Body className="p-5 text-center text-muted">
                Loading assigned requests...
              </Card.Body>
            </Card>
          ) : filteredAndSortedRequests.length === 0 ? (
            <Card className="sw-card border-0">
              <Card.Body className="p-5 text-center text-muted">
                No assigned requests match your filters.
              </Card.Body>
            </Card>
          ) : (
            <Row className="g-3">
              {filteredAndSortedRequests.map((req) => {
                const isOverdue = overdueRequestIds.has(req.id)
                const isSelected = selectedRequestId === req.id
                const helpIcon = getHelpTypeIcon(req.helpType)
                const helpLabel = req.helpType ? HELP_TYPE_LABELS[req.helpType] : 'Support request'
                const consent = getConsentLabel(req)
                const status = req.status
                const isRejected = status === 'REJECTED'
                const canTakeAssignmentAction =
                  status === 'ASSIGNED' || status === 'REQUESTED' || status === 'UNDER_REVIEW'

                return (
                  <Col xs={12} md={6} xl={4} key={req.id}>
                    <Card
                      className={`sw-card h-100 hover-lift cursor-pointer ${isSelected ? 'border-primary' : ''
                        }`}
                      style={
                        isOverdue
                          ? { backgroundColor: 'rgba(248, 113, 113, 0.04)', borderColor: '#fecaca' }
                          : undefined
                      }
                      onClick={() => handleCardClick(req)}
                    >
                      <Card.Body className="d-flex flex-column justify-content-between">
                        <div className="mb-3">
                          <div className="d-flex justify-content-between align-items-start mb-1">
                            <div>
                              <div className="small text-muted">Request ID</div>
                              <div className="fw-600">
                                #{req.trackingId ?? req.id}
                              </div>
                            </div>
                            <Badge bg={getPriorityVariant(req.priority)}>
                              {req.priority?.toUpperCase() ?? 'MEDIUM'}
                            </Badge>
                          </div>
                          <div className="small text-muted mb-1">
                            {req.requesterName && !req.anonymous
                              ? req.requesterName
                              : 'Public user'}
                            {' • '}
                            {consent}
                          </div>
                          <div className="d-flex align-items-center gap-2 small text-muted">
                            <span>{helpIcon}</span>
                            <span>{helpLabel}</span>
                          </div>
                        </div>
                        <div className="small mb-3">
                          <div className="d-flex justify-content-between mb-1">
                            <span className="text-muted">Assigned</span>
                            <span className="fw-500">
                              {formatDateTime(req.requestDate) || 'Not set'}
                            </span>
                          </div>
                          <div className="d-flex justify-content-between align-items-center">
                            <span className="text-muted">Status</span>
                            <Badge bg={getStatusVariant(req.status)}>
                              {req.status ?? 'ASSIGNED'}
                            </Badge>
                          </div>
                          <div className="d-flex justify-content-between align-items-center mt-1">
                            <span className="text-muted">Follow-up due</span>
                            <span className="small fw-500">
                              {getDueDateLabel(req)}
                            </span>
                          </div>
                        </div>
                        <div className="d-flex flex-wrap gap-2 mt-2">
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleViewDetails(req)
                            }}
                          >
                            View details
                          </Button>
                          {canTakeAssignmentAction && !isRejected && (
                            <>
                              <Button
                                variant="outline-success"
                                size="sm"
                                disabled={updatingId === req.id}
                                onClick={(e) => {
                                  e.stopPropagation()
                                  void handleAccept(req)
                                }}
                              >
                                Accept
                              </Button>
                              <Button
                                variant="outline-danger"
                                size="sm"
                                disabled={updatingId === req.id}
                                onClick={(e) => {
                                  e.stopPropagation()
                                  void handleDecline(req)
                                }}
                              >
                                Decline
                              </Button>
                            </>
                          )}
                          {!isRejected && (
                            <Button
                              variant="outline-secondary"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                // TODO: Open messaging panel
                              }}
                            >
                              Message
                            </Button>
                          )}
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                )
              })}
            </Row>
          )}
        </Col>

        {/* Right sidebar / quick info */}
        {selectedRequest && (
          <Col xs={12} lg={4}>
            <Card className="sw-card border-0 h-100">
              <Card.Header className="bg-white border-0 pt-4 pb-3">
                <h5 className="mb-0 fw-700">Request overview</h5>
              </Card.Header>
              <Card.Body>
                <div className="mb-3">
                  <div className="small text-muted mb-1">Request ID</div>
                  <div className="fw-600 mb-1">
                    #{selectedRequest.trackingId ?? selectedRequest.id}
                  </div>
                  <div className="small text-muted">
                    {selectedRequest.requesterName && !selectedRequest.anonymous
                      ? selectedRequest.requesterName
                      : 'Public user'}
                    {' • '}
                    {getConsentLabel(selectedRequest)}
                  </div>
                </div>
                <div className="mb-3 small">
                  <div className="text-muted mb-1">Summary</div>
                  <div className="fw-500">
                    {selectedRequest.description || 'No description provided.'}
                  </div>
                </div>
                <div className="mb-3 small">
                  <div className="text-muted mb-1">Follow-up due</div>
                  <div className="fw-500">{getDueDateLabel(selectedRequest)}</div>
                </div>
                <div className="mb-3 small">
                  <div className="text-muted mb-1">Location</div>
                  <div className="fw-500">
                    {selectedRequest.location || 'Not specified'}
                  </div>
                </div>
                <div className="mb-3 small">
                  <div className="text-muted mb-1">Timeline (recent)</div>
                  <ul className="mb-0 ps-3">
                    {followUps
                      .filter((fu) => fu.helpRequestId === selectedRequest.id)
                      .slice(0, 3)
                      .map((fu) => (
                        <li key={fu.id} className="mb-1">
                          <span className="fw-500">{fu.type || 'Follow-up'}:</span>{' '}
                          <span className="text-muted">
                            {formatDateTime(fu.scheduledDate) || 'Not scheduled'} •{' '}
                            {fu.status || 'SCHEDULED'}
                          </span>
                        </li>
                      ))}
                    {followUps.filter((fu) => fu.helpRequestId === selectedRequest.id).length === 0 && (
                      <li className="text-muted">No follow-ups scheduled yet.</li>
                    )}
                  </ul>
                </div>
                <div className="mb-3 small">
                  <div className="text-muted mb-1">Linked resources</div>
                  <ul className="mb-0 ps-3">
                    <li>Local child protection unit</li>
                    <li>Nearest hospital / clinic</li>
                    <li>Available shelters</li>
                  </ul>
                </div>
                <div className="d-flex gap-2 mt-3">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleViewDetails(selectedRequest)}
                  >
                    Open full case
                  </Button>
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    onClick={() => setSelectedRequestId(null)}
                  >
                    Close panel
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        )}
      </Row>

      {/* Bulk actions (UI only for now) */}
      <Row className="mt-4">
        <Col xs={12}>
          <Card className="sw-card border-0">
            <Card.Body className="d-flex flex-wrap justify-content-between align-items-center gap-2">
              <div className="small text-muted">
                Bulk actions (select specific requests from this list in a future update).
              </div>
              <div className="d-flex flex-wrap gap-2">
                <Button variant="outline-primary" size="sm" disabled>
                  Mark selected as In Progress
                </Button>
                <Button variant="outline-secondary" size="sm" disabled>
                  Export selected
                </Button>
                <Button variant="outline-danger" size="sm" disabled>
                  Send reminders for overdue
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  )
}
