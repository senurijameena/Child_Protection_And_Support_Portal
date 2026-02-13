import { useEffect, useMemo, useState } from 'react'
import { Card, Container, Row, Col, Badge, Button, Form } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import {
  getAssignedRequests,
  getMyFollowUps,
  updateRequestStatus,
  type FollowUpDTO,
} from '../../services/socialWorkerApi'
import type { HelpRequestDTO, HelpType } from '../../types/dashboard'
import { HELP_TYPE_LABELS } from '../../types/dashboard'
import { SmartRequestTable } from '../../components/social-worker/SmartRequestTable'
import VerticalTimeline from '../../components/ui/VerticalTimeline'
import type { TimelineStep } from '../../components/ui/HorizontalTimeline'
import './SocialWorkerDashboard.css'

type PriorityFilter = 'ALL' | 'LOW' | 'MEDIUM' | 'HIGH'
type CaseTypeFilter = 'ALL' | 'COUNSELING' | 'FINANCIAL' | 'MEDICAL' | 'SHELTER'
type StatusFilter = 'ALL' | 'ASSIGNED' | 'IN_PROGRESS' | 'WAITING' | 'OVERDUE'
type ConsentFilter = 'ALL' | 'FULL' | 'PARTIAL' | 'ANONYMOUS'
type ViewMode = 'CARD' | 'LIST'
type RequestActionState = 'initial' | 'viewed' | 'accepted' | 'rejected'

const CASE_TYPE_MAP: Record<Exclude<CaseTypeFilter, 'ALL'>, HelpType[]> = {
  COUNSELING: ['COUNSELING'],
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
  const [viewMode, setViewMode] = useState<ViewMode>('LIST')
  const [requestActionStates, setRequestActionStates] = useState<Record<string, RequestActionState>>({})
  const [currentPage, setCurrentPage] = useState(1)
  const [showApplyPackageModal, setShowApplyPackageModal] = useState<string | null>(null)

  const itemsPerPage = viewMode === 'CARD' ? 6 : 10

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
    setCurrentPage(1)
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

    // Sort by status priority (active first), then by assigned date (most recent first)
    const STATUS_PRIORITY: Record<string, number> = {
      'ASSIGNED': 1,
      'PACKAGE_PROPOSED': 2,
      'IN_PROGRESS': 3,
      'UNDER_REVIEW': 4,
      'REQUESTED': 5,
      'COMPLETED': 10,
      'REJECTED': 11,
      'PACKAGE_REJECTED': 12,
      'CANCELLED': 13,
    }

    return filtered.sort((a, b) => {
      const priorityA = STATUS_PRIORITY[a.status || 'REQUESTED'] || 99
      const priorityB = STATUS_PRIORITY[b.status || 'REQUESTED'] || 99

      if (priorityA !== priorityB) {
        return priorityA - priorityB
      }

      const aDate = a.requestDate ? new Date(a.requestDate).getTime() : 0
      const bDate = b.requestDate ? new Date(b.requestDate).getTime() : 0
      return bDate - aDate
    })
  }, [requests, search, priorityFilter, caseTypeFilter, statusFilter, consentFilter, overdueRequestIds, requestDueMap])

  // Pagination calculations
  const totalPages = Math.ceil(filteredAndSortedRequests.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedRequests = filteredAndSortedRequests.slice(startIndex, endIndex)

  // Reset to page 1 when filters change
  useMemo(() => {
    setCurrentPage(1)
  }, [search, priorityFilter, caseTypeFilter, statusFilter, consentFilter])

  const selectedRequest = useMemo(
    () => filteredAndSortedRequests.find((r) => r.id === selectedRequestId) ?? null,
    [filteredAndSortedRequests, selectedRequestId]
  )
  const selectedActionState = selectedRequestId ? requestActionStates[selectedRequestId] : undefined

  // Build timeline steps from help request and related follow-ups
  const buildTimelineSteps = (req: HelpRequestDTO): TimelineStep[] => {
    const steps: TimelineStep[] = []

    // Requested step
    steps.push({
      id: 'requested',
      label: 'Requested',
      status: ['REQUESTED', 'UNDER_REVIEW', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED'].includes(req.status || 'REQUESTED') ? 'completed' : 'pending',
      date: req.requestDate ? new Date(req.requestDate).toLocaleDateString() : undefined,
      icon: '📝',
    })

    // Under Review step
    steps.push({
      id: 'review',
      label: 'Under Review',
      status: ['UNDER_REVIEW', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED'].includes(req.status || 'REQUESTED') ? 'completed' : 'pending',
      icon: '👁️',
    })

    // Assigned step
    steps.push({
      id: 'assigned',
      label: 'Assigned',
      status: ['ASSIGNED', 'IN_PROGRESS', 'COMPLETED'].includes(req.status || 'REQUESTED') ? 'completed' : 'pending',
      icon: '✓',
    })

    // In Progress step
    steps.push({
      id: 'progress',
      label: 'In Progress',
      status: req.status === 'IN_PROGRESS' ? 'active' : ['COMPLETED'].includes(req.status || 'REQUESTED') ? 'completed' : 'pending',
      icon: '⚙️',
    })

    // Completed step
    steps.push({
      id: 'completed',
      label: 'Completed',
      status: req.status === 'COMPLETED' ? 'completed' : 'pending',
      icon: '✅',
    })

    return steps
  }

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
    // Set the request to "viewed" state to show Accept/Reject buttons
    setRequestActionStates((prev) => ({
      ...prev,
      [req.id]: 'viewed',
    }))
    // Also select the request to show the right panel
    setSelectedRequestId(req.id)
  }

  const handleGoToFullDetails = (req: HelpRequestDTO) => {
    navigate(`/social-worker/requests/${req.id}`)
  }

  const getRequestActionState = (reqId: string): RequestActionState => {
    return requestActionStates[reqId] || 'initial'
  }

  const maskUserIdForTable = (id: string | undefined, anonymous: boolean): string => {
    if (anonymous || !id) return 'Anonymous'
    if (id.length <= 8) return id
    return `${id.slice(0, 4)}…${id.slice(-4)}`
  }



  const handleAccept = async (req: HelpRequestDTO) => {
    setUpdatingId(req.id)
    try {
      await updateRequestStatus(req.id, 'IN_PROGRESS')
      // Update local state to reflect change
      setRequests((prev) =>
        prev.map((r) =>
          r.id === req.id
            ? { ...r, status: 'IN_PROGRESS' }
            : r
        )
      )
      // Redirect to details page
      navigate(`/social-worker/requests/${req.id}`)
    } catch (err) {
      console.error('Failed to accept request', err)
      // gracefully handle error, maybe show a toast (but existing code handles error via state)
    } finally {
      setUpdatingId(null)
    }
  }

  const handleDecline = async (req: HelpRequestDTO) => {
    // Set state to 'rejected' to show only user and request details
    setRequestActionStates((prev) => ({
      ...prev,
      [req.id]: 'rejected',
    }))
    setUpdatingId(req.id)
    try {
      // Optimistically mark as rejected
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
            <div className="d-flex gap-2 bg-white rounded-pill p-1 border shadow-sm">
              <Button
                variant={viewMode === 'LIST' ? 'primary' : 'light'}
                size="sm"
                className="rounded-pill px-3 fw-600"
                onClick={() => setViewMode('LIST')}
              >
                📋 List
              </Button>
              <Button
                variant={viewMode === 'CARD' ? 'primary' : 'light'}
                size="sm"
                className="rounded-pill px-3 fw-600"
                onClick={() => setViewMode('CARD')}
              >
                🆔 Cards
              </Button>
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
            <>
              {viewMode === 'CARD' ? (
                <Row className="g-3 mb-4">
                  {paginatedRequests.map((req) => {
                    const isOverdue = overdueRequestIds.has(req.id)
                    const isSelected = selectedRequestId === req.id
                    const helpIcon = getHelpTypeIcon(req.helpType)
                    const helpLabel = req.helpType ? HELP_TYPE_LABELS[req.helpType] : 'Support request'
                    const consent = getConsentLabel(req)
                    const actionState = getRequestActionState(req.id)
                    const isRejectedState = actionState === 'rejected'
                    const isAcceptedState = actionState === 'accepted'
                    const isViewedState = actionState === 'viewed'
                    const isInitialState = actionState === 'initial'

                    return (
                      <Col xs={12} md={6} xl={4} key={req.id}>
                        <Card
                          className={`sw-card h-100 hover-lift cursor-pointer ${isSelected ? 'border-primary' : ''
                            } ${isRejectedState ? 'border-danger' : ''} ${isAcceptedState ? 'border-success' : ''}`}
                          style={
                            isOverdue
                              ? { backgroundColor: 'rgba(248, 113, 113, 0.04)', borderColor: '#fecaca' }
                              : isRejectedState
                                ? { backgroundColor: 'rgba(248, 113, 113, 0.08)' }
                                : isAcceptedState
                                  ? { backgroundColor: 'rgba(34, 197, 94, 0.08)' }
                                  : undefined
                          }
                          onClick={() => handleCardClick(req)}
                        >
                          <Card.Body className="d-flex flex-column justify-content-between">
                            {/* Public User Details - Always visible */}
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

                            {/* Request Details - Always visible */}
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

                            {/* REJECTED STATE - Show only status message, hide all buttons */}
                            {isRejectedState && (
                              <div className="text-center py-3">
                                <div className="mb-2">
                                  <span style={{ fontSize: '2rem' }}>❌</span>
                                </div>
                                <div className="fw-600 text-danger mb-1">Request Rejected</div>
                                <div className="small text-muted">
                                  This request has been declined.
                                </div>
                              </div>
                            )}

                            {/* INITIAL STATE - Show only View Details button */}
                            {isInitialState && (
                              <div className="d-flex justify-content-center mt-2">
                                <Button
                                  variant="primary"
                                  size="lg"
                                  className="px-4 py-2 fw-600"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleViewDetails(req)
                                  }}
                                >
                                  View Details
                                </Button>
                              </div>
                            )}

                            {/* VIEWED STATE - Show large Accept and Reject buttons */}
                            {isViewedState && (
                              <div className="d-flex flex-column gap-2 mt-2">
                                <div className="d-flex gap-2 justify-content-center">
                                  <Button
                                    variant="success"
                                    size="lg"
                                    className="flex-fill py-3 fw-bold"
                                    style={{ fontSize: '1.1rem' }}
                                    disabled={updatingId === req.id}
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      void handleAccept(req)
                                    }}
                                  >
                                    ✓ Accept
                                  </Button>
                                  <Button
                                    variant="danger"
                                    size="lg"
                                    className="flex-fill py-3 fw-bold"
                                    style={{ fontSize: '1.1rem' }}
                                    disabled={updatingId === req.id}
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      void handleDecline(req)
                                    }}
                                  >
                                    ✗ Reject
                                  </Button>
                                </div>
                                <Button
                                  variant="outline-secondary"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleGoToFullDetails(req)
                                  }}
                                >
                                  Open full case details
                                </Button>
                              </div>
                            )}

                            {/* ACCEPTED STATE - Show Apply Package and Message buttons */}
                            {isAcceptedState && (
                              <div className="d-flex flex-column gap-2 mt-2">
                                <div className="text-center mb-2">
                                  <span style={{ fontSize: '1.5rem' }}>✅</span>
                                  <div className="fw-600 text-success small">Request Accepted</div>
                                </div>
                                <Button
                                  variant="primary"
                                  size="lg"
                                  className="py-2 fw-600"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    navigate(`/social-worker/requests/${req.id}?applyPackage=true`)
                                  }}
                                >
                                  📦 Apply Package
                                </Button>
                                {/* Hide Message button for anonymous requests to protect user identity */}
                                {req.requesterUserId && !req.anonymous && (
                                  <Button
                                    variant="outline-primary"
                                    size="lg"
                                    className="py-2 fw-600"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      navigate(`/social-worker/messages?userId=${encodeURIComponent(req.requesterUserId!)}`)
                                    }}
                                  >
                                    💬 Message User
                                  </Button>
                                )}
                                <Button
                                  variant="outline-secondary"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleGoToFullDetails(req)
                                  }}
                                >
                                  Open full case details
                                </Button>
                              </div>
                            )}
                          </Card.Body>
                        </Card>
                      </Col>
                    )
                  })}
                </Row>
              ) : (
                <div className="mb-4">
                  <SmartRequestTable
                    requests={paginatedRequests}
                    maskUserId={maskUserIdForTable}
                    hideControls={true}
                    onSelect={(id) => setSelectedRequestId(id)}
                  />
                </div>
              )}

              {/* Combined Pagination */}
              {totalPages > 1 && (
                <Card className="sw-card border-0 mb-4">
                  <Card.Body className="d-flex justify-content-between align-items-center py-3">
                    <div className="small text-muted">
                      Showing {startIndex + 1}–{Math.min(endIndex, filteredAndSortedRequests.length)} of {filteredAndSortedRequests.length} requests
                    </div>
                    <div className="d-flex gap-2 align-items-center">
                      <Button
                        variant="outline-secondary"
                        size="sm"
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      >
                        ← Previous
                      </Button>
                      <span className="small fw-500 px-2">
                        Page {currentPage} of {totalPages}
                      </span>
                      <Button
                        variant="outline-secondary"
                        size="sm"
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      >
                        Next →
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              )}
            </>
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
                    {selectedRequest.anonymous
                      ? 'Anonymous Public User'
                      : (selectedRequest.requesterName || 'Public user')}
                    {' • '}
                    {getConsentLabel(selectedRequest)}
                  </div>
                </div>

                <div className="mb-3 small">
                  <div className="text-muted mb-1">Request details</div>
                  <div className="fw-500">
                    {selectedRequest.description || 'No description provided.'}
                  </div>
                  <div className="mt-2">
                    <span className="text-muted">Location:</span>{' '}
                    <span className="fw-500">{selectedRequest.location || 'Not specified'}</span>
                  </div>
                  <div className="mt-1">
                    <span className="text-muted">Help type:</span>{' '}
                    <span className="fw-500">
                      {selectedRequest.helpType ? HELP_TYPE_LABELS[selectedRequest.helpType] : 'Support request'}
                    </span>
                  </div>
                </div>

                <div className="mb-3 small">
                  <div className="text-muted mb-1">Follow-up due</div>
                  <div className="fw-500">{getDueDateLabel(selectedRequest)}</div>
                </div>

                <div className="mb-4">
                  <div className="text-muted mb-3 small fw-600">Progress Timeline</div>
                  <VerticalTimeline
                    steps={buildTimelineSteps(selectedRequest)}
                    compact={true}
                  />
                </div>

                {selectedRequest.status === 'ASSIGNED' && (
                  <div className="d-flex flex-column gap-2">
                    <Button
                      variant="success"
                      className="fw-600 py-2"
                      onClick={() => handleAccept(selectedRequest)}
                    >
                      Accept & Start
                    </Button>
                    <Button
                      variant="outline-danger"
                      className="fw-600 py-2"
                      onClick={() => handleDecline(selectedRequest)}
                    >
                      Reject
                    </Button>
                  </div>
                )}

                {selectedRequest.status === 'IN_PROGRESS' && (
                  <div className="d-flex flex-column gap-2">
                    <Button
                      variant="primary"
                      className="fw-600 py-2"
                      onClick={() => navigate(`/social-worker/requests/${selectedRequest.id}`)}
                    >
                      View Help Details
                    </Button>
                    <Button
                      variant="outline-primary"
                      className="fw-600 py-2"
                      onClick={() => navigate(`/social-worker/requests/${selectedRequest.id}?applyPackage=true`)}
                    >
                      Apply Package
                    </Button>
                    {!selectedRequest.anonymous && (
                      <Button
                        variant="outline-primary"
                        className="fw-600 py-2"
                        onClick={() => navigate(`/social-worker/messages?participantId=${selectedRequest.requesterUserId}`)}
                      >
                        Message
                      </Button>
                    )}
                    <Button
                      variant="outline-secondary"
                      className="fw-600 py-2"
                      onClick={() => window.print()}
                    >
                      Print
                    </Button>
                  </div>
                )}

                <div className="d-flex gap-2 mt-3">
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

    </Container>
  )
}
