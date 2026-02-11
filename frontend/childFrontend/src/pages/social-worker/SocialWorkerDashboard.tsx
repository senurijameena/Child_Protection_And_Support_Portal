import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Card, Container, Row, Col, ProgressBar, Badge } from 'react-bootstrap'
import { useAuth } from '../../hooks/useAuth'
import { getAssignedRequests, getMyFollowUps, type FollowUpDTO } from '../../services/socialWorkerApi'
import {
  type HelpRequestDTO,
  REQUEST_STATUS_BADGE_VARIANTS,
  REQUEST_STATUS_LABELS,
} from '../../types/dashboard'
import './SocialWorkerDashboard.css'

interface CaseStats {
  active: number
  pending: number
  completed: number
  followUp: number
}

export function SocialWorkerDashboard() {
  const { user } = useAuth()

  const [caseStats, setCaseStats] = useState<CaseStats | null>(null)
  const [recentRequests, setRecentRequests] = useState<HelpRequestDTO[]>([])
  const [followUps, setFollowUps] = useState<FollowUpDTO[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    const loadData = async () => {
      if (!user?.userId) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const [assignedRequests, followUps] = await Promise.all([
          getAssignedRequests(user.userId),
          getMyFollowUps(),
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

        // Show latest assigned requests (up to 5)
        const sortedRequests = [...assignedRequests].sort((a, b) => {
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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High':
        return 'danger'
      case 'Medium':
        return 'warning'
      case 'Low':
        return 'success'
      default:
        return 'secondary'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'success'
      case 'Pending':
        return 'warning'
      case 'In Progress':
        return 'info'
      case 'Completed':
        return 'secondary'
      default:
        return 'light'
    }
  }

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
            <h1 className="h2 fw-700 mb-1">Welcome back! 👋</h1>
            <p className="text-muted mb-0">
              Here's your dashboard overview. Stay on top of your assigned cases and upcoming tasks.
            </p>
          </div>
        </Col>
      </Row>

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
                        <th className="px-4 py-3">Request / Follow-up</th>
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
                            <div className="fw-600">{task.helpRequestId ?? '-'}</div>
                            <div className="text-danger small">{getOverdueByText(task.scheduledDate)}</div>
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
                                  View help
                                </Link>
                              )}
                              <button
                                type="button"
                                className="btn btn-sm btn-outline-danger rounded-pill"
                              >
                                Send reminder
                              </button>
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
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-primary rounded-pill"
                        >
                          Send message
                        </button>
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
              <h5 className="mb-0 fw-700">Recent Requests</h5>
            </Card.Header>
            <Card.Body className="p-0">
              {loading && recentRequests.length === 0 ? (
                <div className="p-5 text-center text-muted">
                  <p className="mb-0">Loading recent requests...</p>
                </div>
              ) : recentRequests.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead className="border-top">
                      <tr className="text-muted small">
                        <th className="px-4 py-3">Requester / ID</th>
                        <th className="py-3">Type</th>
                        <th className="py-3">Status</th>
                        <th className="py-3 text-center">Priority</th>
                        <th className="py-3 text-end pe-4">Requested At</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentRequests.map((req) => (
                        <tr key={req.id} className="border-bottom">
                          <td className="px-4 py-3">
                            <div className="fw-600">
                              {req.requesterName || 'Anonymous Requester'}
                            </div>
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
                          <td className="py-3 text-center">
                            <Badge bg={getPriorityColor(req.priority ?? '')}>
                              {req.priority ?? 'MEDIUM'}
                            </Badge>
                          </td>
                          <td className="py-3 text-end pe-4 text-muted small">
                            {formatDateTime(req.requestDate)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-5 text-center text-muted">
                  <p className="mb-0">No recent requests</p>
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
          <Card className="sw-quick-action-card h-100 cursor-pointer">
            <Card.Body className="d-flex align-items-center justify-content-between p-3">
              <div>
                <h6 className="card-title mb-1 fw-600">Request Escalation</h6>
                <p className="text-muted small mb-0">
                  Flag complex cases for supervisor or legal review.
                </p>
              </div>
              <div className="quick-action-icon fs-2">⚠️</div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Workload Progress */}
      <Row>
        <Col xs={12}>
          <Card className="sw-card border-0">
            <Card.Header className="bg-white border-0 pt-4 pb-3">
              <h5 className="mb-0 fw-700">Case Workload Progress</h5>
            </Card.Header>
            <Card.Body>
              <Row className="g-4">
                <Col xs={12} sm={6} lg={3}>
                  <div className="mb-3">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span className="small fw-600 text-dark">
                        Active Cases
                      </span>
                      <span className="text-muted small">
                        {caseStats?.active ?? 0}
                      </span>
                    </div>
                    <ProgressBar
                      now={
                        caseStats && caseStats.active > 0
                          ? (caseStats.active / caseStats.active) * 100
                          : 0
                      }
                      className="sw-progress-bar"
                      style={{ height: '8px' }}
                    />
                  </div>
                </Col>
                <Col xs={12} sm={6} lg={3}>
                  <div className="mb-3">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span className="small fw-600 text-dark">
                        Follow-ups
                      </span>
                      <span className="text-muted small">
                        {caseStats?.followUp ?? 0}
                      </span>
                    </div>
                    <ProgressBar
                      now={
                        caseStats && caseStats.followUp > 0
                          ? (caseStats.followUp / caseStats.followUp) * 100
                          : 0
                      }
                      variant="success"
                      className="sw-progress-bar"
                      style={{ height: '8px' }}
                    />
                  </div>
                </Col>
                <Col xs={12} sm={6} lg={3}>
                  <div className="mb-3">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span className="small fw-600 text-dark">
                        Monthly Target
                      </span>
                      <span className="text-muted small">68%</span>
                    </div>
                    <ProgressBar
                      now={68}
                      className="sw-progress-bar"
                      style={{ height: '8px' }}
                    />
                  </div>
                </Col>
                <Col xs={12} sm={6} lg={3}>
                  <div className="mb-3">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span className="small fw-600 text-dark">
                        Team Capacity
                      </span>
                      <span className="text-muted small">45%</span>
                    </div>
                    <ProgressBar
                      now={45}
                      variant="info"
                      className="sw-progress-bar"
                      style={{ height: '8px' }}
                    />
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

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
