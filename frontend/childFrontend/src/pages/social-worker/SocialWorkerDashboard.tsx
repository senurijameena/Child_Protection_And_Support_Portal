import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Card, Container, Row, Col, Badge, Form, Modal, Button, Spinner } from 'react-bootstrap'
import { useAuth } from '../../hooks/useAuth'
import {
  getAssignedRequests,
  getMyFollowUps,
  getAvailableSocialWorkers,
  requestHelpRequestTransfer,
  getActiveAnnouncements,
  type FollowUpDTO,
} from '../../services/socialWorkerApi'
import {
  type HelpRequestDTO,
  type AnnouncementDTO,
  REQUEST_STATUS_BADGE_VARIANTS,
  REQUEST_STATUS_LABELS,
} from '../../types/dashboard'
import './SocialWorkerDashboard.css'
import { SystemAnnouncementCard } from '../../components/social-worker/SystemAnnouncementCard'

interface CaseStats {
  active: number
  pending: number
  completed: number
  followUp: number
}

export function SocialWorkerDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [caseStats, setCaseStats] = useState<CaseStats | null>(null)
  const [recentRequests, setRecentRequests] = useState<HelpRequestDTO[]>([])
  const [assignedRequestsState, setAssignedRequestsState] = useState<HelpRequestDTO[]>([])
  const [announcements, setAnnouncements] = useState<AnnouncementDTO[]>([])
  const [followUps, setFollowUps] = useState<FollowUpDTO[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [requestSearch, setRequestSearch] = useState('')
  const [showTransferModal, setShowTransferModal] = useState(false)
  const [availableSW, setAvailableSW] = useState<
    Array<{ userId: string; fullName: string; availabilityStatus?: string; specializations?: string[]; serviceArea?: string }>
  >([])
  const [transferRequestId, setTransferRequestId] = useState('')
  const [transferReason, setTransferReason] = useState('')
  const [selectedTransferSwId, setSelectedTransferSwId] = useState('')
  const [transferSubmitting, setTransferSubmitting] = useState(false)
  const [transferError, setTransferError] = useState<string | null>(null)
  const [loadingSW, setLoadingSW] = useState(false)

  useEffect(() => {
    let isMounted = true

    const loadData = async () => {
      if (!user?.userId) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const [assignedRequests, followUps, activeAnnouncements] = await Promise.all([
          getAssignedRequests(user.userId),
          getMyFollowUps(),
          getActiveAnnouncements(),
        ])

        if (!isMounted) return

        const active = assignedRequests.filter(
          (r) => r.status === 'ASSIGNED' || r.status === 'IN_PROGRESS'
        ).length
        const pending = assignedRequests.filter(
          (r) => r.status === 'REQUESTED' || r.status === 'UNDER_REVIEW'
        ).length
        const completed = assignedRequests.filter((r) => r.status === 'COMPLETED').length

        setCaseStats({
          active,
          pending,
          completed,
          followUp: followUps.length,
        })

        setAssignedRequestsState(assignedRequests)
        setAnnouncements(activeAnnouncements)

        // Show latest assigned requests (sorted by status priority then date)
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

        const sortedRequests = [...assignedRequests].sort((a, b) => {
          const priorityA = STATUS_PRIORITY[a.status || 'REQUESTED'] || 99
          const priorityB = STATUS_PRIORITY[b.status || 'REQUESTED'] || 99

          if (priorityA !== priorityB) {
            return priorityA - priorityB
          }

          const aDate = a.requestDate ? new Date(a.requestDate).getTime() : 0
          const bDate = b.requestDate ? new Date(b.requestDate).getTime() : 0
          return bDate - aDate
        })

        setRecentRequests(sortedRequests.slice(0, 5))

        // Upcoming follow-ups (sorted by scheduled date)
        const sortedFollowUps = [...followUps].sort((a, b) => {
          const aDate = a.scheduledDate ? new Date(a.scheduledDate).getTime() : 0
          const bDate = b.scheduledDate ? new Date(b.scheduledDate).getTime() : 0
          return aDate - bDate
        })

        setFollowUps(sortedFollowUps)
        setError(null)
      } catch (err) {
        console.error('Failed to load social worker dashboard data', err)
        setError((err as Error).message)
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

  const StatCard = ({
    label,
    value,
    icon,
    color,
  }: {
    label: string
    value: number
    icon: string
    color: string
  }) => (
    <Card className="sw-stat-card border-0 h-100">
      <Card.Body className="d-flex align-items-center justify-content-between">
        <div>
          <p className="text-muted small fw-600 mb-1">{label}</p>
          <h3 className="mb-0 fw-700" style={{ color }}>
            {value}
          </h3>
        </div>
        <div className="stat-icon" style={{ fontSize: '2.5rem' }}>
          {icon}
        </div>
      </Card.Body>
    </Card>
  )

  const formatDateTime = (iso?: string) => {
    if (!iso) return ''
    const date = new Date(iso)
    if (Number.isNaN(date.getTime())) return ''
    return date.toLocaleString()
  }

  const getOverdueByText = (iso?: string) => {
    if (!iso) return ''
    const dueDate = new Date(iso)
    if (Number.isNaN(dueDate.getTime())) return ''
    const now = new Date()
    const diffMs = now.getTime() - dueDate.getTime()
    if (diffMs <= 0) return ''
    const days = Math.max(1, Math.round(diffMs / (1000 * 60 * 60 * 24)))
    return `Overdue by ${days} day${days > 1 ? 's' : ''}`
  }

  const getTaskStatusVariant = (status?: string) => {
    switch (status) {
      case 'URGENT':
      case 'MISSED':
        return 'danger'
      case 'UPCOMING':
      case 'SCHEDULED':
      case 'CONFIRMED':
        return 'success'
      default:
        return 'secondary'
    }
  }

  const totalAssignedRequests =
    (caseStats?.active ?? 0) + (caseStats?.pending ?? 0) + (caseStats?.completed ?? 0)

  const getRequestDisplayId = (helpRequestId?: string | null) => {
    if (!helpRequestId) return '-'
    const req = assignedRequestsState.find((r) => r.id === helpRequestId)
    return req?.trackingId ?? helpRequestId
  }

  const now = new Date()
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)

  const overdueFollowUps = followUps.filter((task) => {
    if (!task.scheduledDate) return false
    const date = new Date(task.scheduledDate)
    if (Number.isNaN(date.getTime())) return false
    const isCompleted = task.status === 'COMPLETED' || task.status === 'DONE'
    return !isCompleted && date < startOfToday
  })

  const todaysFollowUps = followUps.filter((task) => {
    if (!task.scheduledDate) return false
    const date = new Date(task.scheduledDate)
    if (Number.isNaN(date.getTime())) return false
    return date >= startOfToday && date < endOfToday
  })

  const overdueFollowUpsCount = overdueFollowUps.length
  const todaysFollowUpsCount = todaysFollowUps.length

  const pendingFeedbackCount = 0 // TODO: Integrate with real feedback data when available

  // --- Lightweight real-time analytics (computed from live data already fetched) ---
  const statusBreakdown = useMemo(() => {
    const counts: Record<string, number> = {}
    assignedRequestsState.forEach((req) => {
      const key = req.status ?? 'UNKNOWN'
      counts[key] = (counts[key] || 0) + 1
    })
    return counts
  }, [assignedRequestsState])

  const typeBreakdown = useMemo(() => {
    const counts: Record<string, number> = {}
    assignedRequestsState.forEach((req) => {
      const key = req.helpType ?? 'OTHER'
      counts[key] = (counts[key] || 0) + 1
    })
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5) // top 5 to keep UI compact
  }, [assignedRequestsState])

  const completionRate = useMemo(() => {
    const total = assignedRequestsState.length
    if (total === 0) return 0
    const done = assignedRequestsState.filter((r) => r.status === 'COMPLETED').length
    return Math.round((done / total) * 100)
  }, [assignedRequestsState])

  // Eligible requests for transfer (hide completed/rejected/cancelled)
  const transferableRequests = useMemo(
    () =>
      assignedRequestsState.filter(
        (r) => !['COMPLETED', 'REJECTED', 'CANCELLED'].includes((r.status || '').toUpperCase())
      ),
    [assignedRequestsState]
  )

  const filteredRecentRequests = useMemo(() => {
    const q = requestSearch.trim().toLowerCase()
    if (!q) return recentRequests

    const normalizeId = (value?: string) =>
      (value ?? '')
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '')

    const qNormalized = normalizeId(q.startsWith('#') ? q.slice(1) : q)
    const source = assignedRequestsState

    return source.filter((req) => {
      const trackingNormalized = normalizeId(req.trackingId)
      const idNormalized = normalizeId(req.id)
      if (qNormalized && (trackingNormalized.includes(qNormalized) || idNormalized.includes(qNormalized))) {
        return true
      }
      const searchable = [
        req.id ?? '',
        req.trackingId ?? '',
        req.requesterName ?? '',
        req.helpType ?? '',
        req.status ?? '',
      ]
        .join(' ')
        .toLowerCase()
      return searchable.includes(q)
    })
  }, [recentRequests, assignedRequestsState, requestSearch])

  const loadAvailableSW = async () => {
    setLoadingSW(true)
    try {
      const list = await getAvailableSocialWorkers()
      setAvailableSW(Array.isArray(list) ? list : [])
      setTransferError(null)
    } catch (err) {
      console.error('Failed to load available social workers', err)
      setAvailableSW([])
      setTransferError(err instanceof Error ? err.message : 'Failed to load social workers')
    } finally {
      setLoadingSW(false)
    }
  }

  const handleOpenTransferModal = () => {
    setShowTransferModal(true)
    loadAvailableSW()
  }

  const handleSubmitTransfer = async () => {
    if (!transferRequestId || !selectedTransferSwId || !transferReason.trim()) {
      setTransferError('Request, social worker, and reason are required.')
      return
    }
    setTransferSubmitting(true)
    setTransferError(null)
    try {
      await requestHelpRequestTransfer({
        helpRequestId: transferRequestId,
        requestedAssigneeId: selectedTransferSwId,
        reason: transferReason.trim(),
      })
      setShowTransferModal(false)
      setTransferReason('')
      setTransferRequestId('')
      setSelectedTransferSwId('')
    } catch (err) {
      setTransferError(err instanceof Error ? err.message : 'Failed to submit transfer request')
    } finally {
      setTransferSubmitting(false)
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
      {/* Header Section */}
      <Row className="mb-5">
        <Col xs={12}>
          <div className="sw-dashboard-header mb-4">
            <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
              <div>
                <h1 className="h2 fw-700 mb-1">Welcome back!</h1>
                <p className="text-muted mb-0">
                  Here&apos;s your dashboard overview. Stay on top of your assigned cases and upcoming tasks.
                </p>
              </div>
              <Link
                to="/social-worker/reports"
                className="btn btn-outline-primary rounded-pill"
              >
                View Reports
              </Link>
            </div>
          </div>
        </Col>
      </Row>

      {/* System Announcements */}
      {announcements.length > 0 && (
        <Row className="mb-4">
          <Col xs={12}>
            <SystemAnnouncementCard announcements={announcements} />
          </Col>
        </Row>
      )}

      {/* Statistics Cards */}
      <Row className="mb-5 g-3">
        <Col xs={12} sm={6} lg={3}>
          <StatCard
            label="Total Assigned Requests"
            value={totalAssignedRequests}
            icon="📂"
            color="var(--sw-primary-blue)"
          />
        </Col>
        <Col xs={12} sm={6} lg={3}>
          <StatCard
            label="Overdue Follow-ups"
            value={overdueFollowUpsCount}
            icon="⚠️"
            color="#ef4444"
          />
        </Col>
        <Col xs={12} sm={6} lg={3}>
          <StatCard
            label="Today’s Scheduled Follow-ups"
            value={todaysFollowUpsCount}
            icon="📅"
            color="#10b981"
          />
        </Col>
        <Col xs={12} sm={6} lg={3}>
          <StatCard
            label="Pending Feedback"
            value={pendingFeedbackCount}
            icon="⭐"
            color="#f59e0b"
          />
        </Col>
      </Row>

      {/* My Analytics (computed from live data) */}
      <Row className="g-3 mb-5">
        <Col xs={12} lg={4}>
          <Card className="sw-card border-0 h-100">
            <Card.Header className="bg-white border-0 pt-4 pb-2">
              <h6 className="mb-0 fw-700">Status Breakdown</h6>
              <div className="text-muted small">Based on your assigned requests</div>
            </Card.Header>
            <Card.Body className="pt-0 pb-3">
              {Object.keys(statusBreakdown).length === 0 ? (
                <div className="text-muted small">No requests yet.</div>
              ) : (
                <div className="d-flex flex-wrap gap-2">
                  {Object.entries(statusBreakdown).map(([status, count]) => (
                    <Badge key={status} bg="light" text="dark" className="border">
                      {REQUEST_STATUS_LABELS[status as keyof typeof REQUEST_STATUS_LABELS] ?? status}: {count}
                    </Badge>
                  ))}
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} lg={4}>
          <Card className="sw-card border-0 h-100">
            <Card.Header className="bg-white border-0 pt-4 pb-2">
              <h6 className="mb-0 fw-700">Top Help Types</h6>
              <div className="text-muted small">Most common request types you handle</div>
            </Card.Header>
            <Card.Body className="pt-0 pb-3">
              {typeBreakdown.length === 0 ? (
                <div className="text-muted small">No data yet.</div>
              ) : (
                <ul className="list-unstyled mb-0 small">
                  {typeBreakdown.map(([type, count]) => (
                    <li key={type} className="d-flex justify-content-between py-1 border-bottom">
                      <span>{type.replace(/_/g, ' ')}</span>
                      <span className="fw-700">{count}</span>
                    </li>
                  ))}
                </ul>
              )}
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} lg={4}>
          <Card className="sw-card border-0 h-100 text-center">
            <Card.Header className="bg-white border-0 pt-4 pb-2">
              <h6 className="mb-0 fw-700">Completion Rate</h6>
              <div className="text-muted small">Completed vs assigned</div>
            </Card.Header>
            <Card.Body className="pt-0 pb-4 d-flex flex-column justify-content-center">
              <div className="display-5 fw-700 text-success">{completionRate}%</div>
              <div className="text-muted small">
                {assignedRequestsState.filter((r) => r.status === 'COMPLETED').length} of {assignedRequestsState.length} completed
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Overdue Cases & Today's Schedule */}
      <Row className="g-4 mb-5">
        {/* Overdue Cases Panel */}
        <Col xs={12} lg={7}>
          <Card className="sw-card border-0 h-100">
            <Card.Header className="bg-white border-0 pt-4 pb-3">
              <h5 className="mb-0 fw-700">Overdue Follow-ups</h5>
            </Card.Header>
            <Card.Body className="p-0">
              {loading && followUps.length === 0 ? (
                <div className="p-5 text-center text-muted">
                  <p className="mb-0">Loading overdue follow-ups...</p>
                </div>
              ) : overdueFollowUps.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead className="border-top">
                      <tr className="text-muted small">
                        <th className="px-4 py-3">Requester / ID</th>
                        <th className="py-3">Type</th>
                        <th className="py-3">Due Date</th>
                        <th className="py-3 text-center">Status</th>
                        <th className="py-3 text-end pe-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {overdueFollowUps.map((task) => (
                        <tr
                          key={task.id}
                          className="border-bottom"
                          style={{ backgroundColor: 'rgba(248, 113, 113, 0.04)' }}
                        >
                          <td className="px-4 py-3 small">
                            <div className="fw-600">
                              {task.childName ||
                                assignedRequestsState.find((r) => r.id === task.helpRequestId)
                                  ?.requesterName ||
                                'Anonymous'}
                            </div>
                            <div className="text-muted small">
                              #{getRequestDisplayId(task.helpRequestId)}

                            </div>
                            <div className="text-danger small">
                              {getOverdueByText(task.scheduledDate)}
                            </div>
                          </td>
                          <td className="py-3 small">
                            {task.type || 'Follow-up'}
                          </td>
                          <td className="py-3 small">
                            {formatDateTime(task.scheduledDate) || 'Not set'}
                          </td>
                          <td className="py-3 text-center">
                            <Badge bg={getTaskStatusVariant(task.status)}>
                              {task.status || 'URGENT'}
                            </Badge>
                          </td>
                          <td className="py-3 text-end pe-4">
                            <div className="d-flex justify-content-end gap-2">
                              {task.helpRequestId && (
                                <Link
                                  to={`/social-worker/requests/${task.helpRequestId}`}
                                  className="btn btn-sm btn-outline-primary rounded-pill"
                                >
                                  View
                                </Link>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-5 text-center text-muted">
                  <p className="mb-0">No overdue follow-ups 🎉</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* Today's Schedule Panel */}
        <Col xs={12} lg={5}>
          <Card className="sw-card border-0 h-100">
            <Card.Header className="bg-white border-0 pt-4 pb-3">
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0 fw-700">Today&apos;s Schedule</h5>
                <div className="small text-success d-flex align-items-center gap-2">
                  <span>📅</span>
                  <span>Today</span>
                </div>
              </div>
            </Card.Header>
            <Card.Body>
              {loading && followUps.length === 0 ? (
                <div className="p-5 text-center text-muted">
                  <p className="mb-0">Loading today&apos;s schedule...</p>
                </div>
              ) : todaysFollowUps.length > 0 ? (
                <div className="d-flex flex-column gap-3">
                  {todaysFollowUps.map((task) => (
                    <div
                      key={task.id}
                      className="p-3 rounded-2 border border-light bg-light bg-opacity-50 transition-all hover-lift"
                    >
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <div>
                          <h6 className="mb-1 fw-600 text-dark">
                            {task.type || 'Follow-up'}
                            {task.childName ? ` • ${task.childName}` : ''}
                          </h6>
                          <p className="mb-1 text-muted small d-flex align-items-center gap-2">
                            <span>🕒</span>
                            {formatDateTime(task.scheduledDate) || 'Not scheduled'}
                          </p>
                        </div>
                        <Badge bg={getTaskStatusVariant(task.status)} className="ms-2">
                          {task.status || 'SCHEDULED'}
                        </Badge>
                      </div>
                      <div className="d-flex flex-wrap gap-2 mt-2">
                        <button
                          type="button"
                          className="btn btn-sm btn-success rounded-pill"
                        >
                          Mark as completed
                        </button>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-secondary rounded-pill"
                        >
                          Reschedule
                        </button>
                        {/* Hide Message button for anonymous requests to protect user identity */}
                        {(() => {
                          const linkedRequest = assignedRequestsState.find(
                            (r) => r.id === task.helpRequestId
                          )
                          // Only show message button if request exists, has userId, and is NOT anonymous
                          if (linkedRequest?.requesterUserId && !linkedRequest.anonymous) {
                            return (
                              <button
                                type="button"
                                className="btn btn-sm btn-outline-primary rounded-pill"
                                onClick={() => {
                                  navigate(
                                    `/social-worker/messages?userId=${encodeURIComponent(
                                      linkedRequest.requesterUserId!
                                    )}`
                                  )
                                }}
                              >
                                Send message
                              </button>
                            )
                          }
                          return null
                        })()}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-5 text-center text-muted">
                  <p className="mb-0">No follow-ups scheduled for today</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="g-4 mb-5">
        {/* Recent Requests */}
        <Col xs={12}>
          <Card className="sw-card border-0 h-100">
            <Card.Header className="bg-white border-0 pt-4 pb-3">
              <div className="d-flex flex-wrap gap-2 justify-content-between align-items-center">
                <h5 className="mb-0 fw-700">Recent Requests</h5>
                <Form.Control
                  type="search"
                  value={requestSearch}
                  onChange={(e) => setRequestSearch(e.target.value)}
                  placeholder="Search by request ID, user, type..."
                  style={{ maxWidth: 340 }}
                  aria-label="Search recent requests"
                />
              </div>
            </Card.Header>
            <Card.Body className="p-0">
              {loading && recentRequests.length === 0 ? (
                <div className="p-5 text-center text-muted">
                  <p className="mb-0">Loading recent requests...</p>
                </div>
              ) : filteredRecentRequests.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead className="border-top">
                      <tr className="text-muted small">
                        <th className="px-4 py-3">Requester / ID</th>
                        <th className="py-3">Type</th>
                        <th className="py-3">Status</th>
                        <th className="py-3">Action</th>
                        <th className="py-3 text-end pe-4">Requested At</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRecentRequests.map((req) => (
                        <tr key={req.id} className="border-bottom align-middle">
                          <td className="px-4 py-3">
                            <div className="fw-600">{req.requesterName || 'Anonymous Requester'}</div>
                            <div className="text-muted small">#{req.trackingId ?? req.id}</div>
                          </td>
                          <td className="py-3 small">{req.helpType ?? 'Support Request'}</td>
                          <td className="py-3">
                            <Badge
                              bg={
                                REQUEST_STATUS_BADGE_VARIANTS[
                                (req.status as keyof typeof REQUEST_STATUS_BADGE_VARIANTS) ??
                                'REQUESTED'
                                ]
                              }
                            >
                              {REQUEST_STATUS_LABELS[
                                (req.status as keyof typeof REQUEST_STATUS_LABELS) ?? 'REQUESTED'
                              ]}
                            </Badge>
                          </td>
                          <td className="py-3 small">
                            <Link
                              to={`/social-worker/requests/${req.id}`}
                              className="btn btn-sm btn-outline-primary rounded-pill"
                            >
                              View
                            </Link>
                          </td>
                          <td className="py-3 text-end pe-4 text-muted small">{formatDateTime(req.requestDate)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-5 text-center text-muted">
                  <p className="mb-0">
                    {requestSearch.trim() ? 'No matching requests' : 'No recent requests'}
                  </p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Quick Actions / Shortcuts */}
      <Row className="g-3 mb-5">
        <Col xs={12} md={6} lg={4}>
          <Card className="sw-quick-action-card h-100 cursor-pointer">
            <Card.Body className="d-flex align-items-center justify-content-between p-3">
              <div>
                <h6 className="card-title mb-1 fw-600">Create Service Package</h6>
                <p className="text-muted small mb-0">
                  Bundle support options for a vulnerable child.
                </p>
              </div>
              <div className="quick-action-icon fs-2">📦</div>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} md={6} lg={4}>
          <Card className="sw-quick-action-card h-100 cursor-pointer">
            <Card.Body className="d-flex align-items-center justify-content-between p-3">
              <div>
                <h6 className="card-title mb-1 fw-600">View All Cases</h6>
                <p className="text-muted small mb-0">
                  Browse and filter all assigned and historical cases.
                </p>
              </div>
              <div className="quick-action-icon fs-2">📁</div>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} md={6} lg={4}>
          <Card className="sw-quick-action-card h-100 cursor-pointer">
            <Card.Body className="d-flex align-items-center justify-content-between p-3">
              <div>
                <h6 className="card-title mb-1 fw-600">View Resources</h6>
                <p className="text-muted small mb-0">
                  Access shelters, counselors, and community partners.
                </p>
              </div>
              <div className="quick-action-icon fs-2">🗂️</div>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} md={6} lg={4}>
          <Card className="sw-quick-action-card h-100 cursor-pointer">
            <Card.Body className="d-flex align-items-center justify-content-between p-3">
              <div>
                <h6 className="card-title mb-1 fw-600">Send Message</h6>
                <p className="text-muted small mb-0">
                  Quickly reach out to a family or resource person.
                </p>
              </div>
              <div className="quick-action-icon fs-2">💬</div>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} md={6} lg={4}>
          <Card className="sw-quick-action-card h-100 cursor-pointer" onClick={handleOpenTransferModal}>
            <Card.Body className="d-flex align-items-center justify-content-between p-3">
              <div>
                <h6 className="card-title mb-1 fw-600">Request Transfer</h6>
                <p className="text-muted small mb-0">
                  Move a request to another social worker.
                </p>
              </div>
              <div className="quick-action-icon fs-2">🔄</div>
            </Card.Body>
          </Card>
        </Col>

      </Row>

      {/* Transfer modal */}
      <Modal show={showTransferModal} onHide={() => setShowTransferModal(false)} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>New Transfer Request</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row className="g-3 mb-3">
            <Col xs={12} md={6}>
              <label className="small text-muted fw-600">Help Request *</label>
              <Form.Select
                value={transferRequestId}
                onChange={(e) => setTransferRequestId(e.target.value)}
                disabled={transferableRequests.length === 0}
              >
                <option value="">
                  {transferableRequests.length === 0
                    ? 'No eligible requests (completed/rejected hidden)'
                    : 'Select a request'}
                </option>
                {transferableRequests.map((req) => (
                  <option key={req.id} value={req.id}>
                    {(req.trackingId || req.id)} — {req.helpType || 'Request'} ({req.status})
                  </option>
                ))}
              </Form.Select>
            </Col>
            <Col xs={12} md={6}>
              <label className="small text-muted fw-600">Reason *</label>
              <Form.Control
                type="text"
                placeholder="Why transfer this request?"
                value={transferReason}
                onChange={(e) => setTransferReason(e.target.value)}
              />
            </Col>
          </Row>

          <div className="d-flex align-items-center justify-content-between mb-2">
            <h6 className="mb-0 fw-700">Available Social Workers</h6>
            {loadingSW && <Spinner animation="border" size="sm" />}
          </div>
          <div className="table-responsive" style={{ maxHeight: 320, overflowY: 'auto' }}>
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light small text-muted">
                <tr>
                  <th>Name</th>
                  <th>Availability</th>
                  <th>Specializations</th>
                  <th className="text-end">Select</th>
                </tr>
              </thead>
              <tbody>
                {availableSW.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center text-muted py-3">
                      {loadingSW ? 'Loading...' : 'No social workers available'}
                    </td>
                  </tr>
                ) : (
                  availableSW.map((sw) => (
                    <tr key={sw.userId}>
                      <td>{sw.fullName}</td>
                      <td>
                        <Badge
                          bg={
                            sw.availabilityStatus === 'AVAILABLE'
                              ? 'success'
                              : sw.availabilityStatus === 'BUSY'
                                ? 'warning'
                                : 'secondary'
                          }
                        >
                          {sw.availabilityStatus || 'Unknown'}
                        </Badge>
                      </td>
                      <td className="small">
                        {(sw.specializations || []).join(', ') || '—'}
                      </td>
                      <td className="text-end">
                        <Form.Check
                          type="radio"
                          name="transfer-sw"
                          value={sw.userId}
                          checked={selectedTransferSwId === sw.userId}
                          onChange={() => setSelectedTransferSwId(sw.userId)}
                        />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {transferError && <div className="alert alert-danger py-2 small mt-3 mb-0">{transferError}</div>}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={() => setShowTransferModal(false)} disabled={transferSubmitting}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmitTransfer} disabled={transferSubmitting}>
            {transferSubmitting ? 'Sending…' : 'Send Transfer Request'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Footer / Helpful Info */}
      <Row className="mt-4">
        <Col xs={12}>
          <footer className="text-center text-muted small py-3">
            <div className="mb-1">
              <strong>Emergency contacts:</strong> 119 &nbsp;|&nbsp; 1929 &nbsp;|&nbsp; Local Child
              Protection Unit
            </div>
            <div className="mb-1">
              <a href="/resources" className="text-decoration-none me-3">
                View resources
              </a>
              <a href="/help" className="text-decoration-none">
                Get support
              </a>
            </div>
            <div>
              &copy; {new Date().getFullYear()} Child Protection &amp; Support Portal
            </div>
          </footer>
        </Col>
      </Row>
    </Container>
  )
}
