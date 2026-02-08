import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Card, Row, Col, Badge, Spinner, Table } from 'react-bootstrap'
import { useAuth } from '../../hooks/useAuth'
import {
  getAssignedRequests,
  getMyFollowUps,
  getOffersByWorker,
  getNotifications,
} from '../../services/socialWorkerApi'
import type { HelpRequestDTO } from '../../types/dashboard'
import type { FollowUpDTO } from '../../services/socialWorkerApi'
import { REQUEST_STATUS_LABELS, HELP_TYPE_LABELS } from '../../types/dashboard'

export function SocialWorkerDashboard() {
  const { user } = useAuth()
  const userId = user?.userId ?? ''
  const [requests, setRequests] = useState<HelpRequestDTO[]>([])
  const [followUps, setFollowUps] = useState<FollowUpDTO[]>([])
  const [notifications, setNotifications] = useState<{ id: string; title?: string; message?: string; read: boolean; actionUrl?: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!userId) {
      setLoading(false)
      return
    }
    Promise.all([
      getAssignedRequests(userId),
      getMyFollowUps(),
      getOffersByWorker(userId),
      getNotifications().catch(() => []),
    ])
      .then(([reqs, follow, , notifs]) => {
        setRequests(reqs)
        setFollowUps(follow)
        setNotifications(Array.isArray(notifs) ? notifs : [])
      })
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load'))
      .finally(() => setLoading(false))
  }, [userId])

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5">
        <Spinner animation="border" style={{ color: '#2d6a4f' }} />
      </div>
    )
  }

  if (error) {
    return (
      <div className="alert alert-danger">
        {error}
      </div>
    )
  }

  const assigned = requests.filter((r) => r.status === 'ASSIGNED').length
  const inProgress = requests.filter((r) => r.status === 'IN_PROGRESS').length
  const completed = requests.filter((r) => r.status === 'COMPLETED' || r.status === 'REJECTED').length
  const upcomingFollowUps = followUps.filter(
    (f) => f.status === 'UPCOMING' || f.status === 'SCHEDULED' || f.status === 'URGENT'
  ).length
  const unreadNotifications = notifications.filter((n) => !n.read)
  const overdueRequests = requests.filter(
    (r) =>
      r.status === 'IN_PROGRESS' &&
      r.requestDate &&
      new Date(r.requestDate).getTime() < Date.now() - 7 * 24 * 60 * 60 * 1000
  )
  // Categorize alerts by notification type
  const getAlertType = (n: { type?: string; title?: string }) => {
    const t = (n.type || '').toLowerCase()
    const title = (n.title || '').toLowerCase()
    if (t.includes('assign') || title.includes('assign')) return 'assignment' as const
    if (t.includes('message') || title.includes('message')) return 'message' as const
    if (t.includes('follow') || title.includes('follow')) return 'followup' as const
    if (t.includes('transfer') || title.includes('reassign')) return 'reassignment' as const
    return 'info' as const
  }
  const followUpDeadlines = followUps.filter((f) => {
    if (!f.scheduledDate || f.status === 'COMPLETED' || f.status === 'MISSED') return false
    const d = new Date(f.scheduledDate)
    const in48h = d.getTime() - Date.now() < 48 * 60 * 60 * 1000
    return in48h && d >= new Date()
  })

  const alerts = [
    ...unreadNotifications.slice(0, 5).map((n) => ({
      type: getAlertType(n),
      title: n.title || 'Notification',
      message: n.message,
      link: n.actionUrl,
    })),
    ...overdueRequests.slice(0, 2).map((r) => ({ type: 'overdue' as const, title: 'Overdue Request', message: `${r.trackingId || r.id} - requires attention`, link: `/social-worker/requests/${r.id}` })),
    ...followUpDeadlines.slice(0, 2).map((f) => ({
      type: 'followup' as const,
      title: 'Follow-up Due Soon',
      message: `${f.type || 'Session'}${f.childName ? ` - ${f.childName}` : ''} due ${f.scheduledDate ? new Date(f.scheduledDate).toLocaleString() : ''}`,
      link: f.helpRequestId ? `/social-worker/requests/${f.helpRequestId}` : '/social-worker/calendar',
    })),
  ]

  // Analytics: type distribution
  const typeDistribution = Object.entries(HELP_TYPE_LABELS).map(([k, v]) => ({
    type: v,
    count: requests.filter((r) => r.helpType === k).length,
  })).filter((d) => d.count > 0)

  // Average resolution time (days) - for completed, from requestDate to now as proxy
  const completedRequests = requests.filter((r) => r.status === 'COMPLETED' || r.status === 'REJECTED')
  const avgResolutionDays = completedRequests.length > 0
    ? Math.round(
        completedRequests.reduce((acc, req) => {
          const start = req.requestDate ? new Date(req.requestDate).getTime() : Date.now()
          return acc + (Date.now() - start) / (24 * 60 * 60 * 1000)
        }, 0) / completedRequests.length
      )
    : 0

  const statCards = [
    {
      title: 'Assigned Requests',
      value: assigned,
      sub: 'Awaiting acceptance',
      color: '#2d6a4f',
      icon: '📋',
      link: '/social-worker/requests',
    },
    {
      title: 'In Progress',
      value: inProgress,
      sub: 'Active service delivery',
      color: '#40916c',
      icon: '🔄',
    },
    {
      title: 'Completed',
      value: completed,
      sub: 'Resolved or closed',
      color: '#6b7280',
      icon: '✅',
    },
    {
      title: 'Upcoming Follow-ups',
      value: upcomingFollowUps,
      sub: 'Scheduled visits/sessions',
      color: '#0d9488',
      icon: '📅',
    },
  ]

  return (
    <div className="animate-fade-in-up">
      <div className="mb-4">
        <h1 className="h3 fw-bold text-dark mb-1">Care & Support Dashboard</h1>
        <p className="text-muted mb-0">
          Manage assigned help requests, deliver services, and track follow-ups.
        </p>
      </div>

      <Row className="g-3 mb-4">
        {statCards.map((card) => (
          <Col key={card.title} xs={12} sm={6} lg={3}>
            {card.link ? (
              <Link to={card.link} className="text-decoration-none text-dark">
                <Card
                  className="border-0 shadow-sm rounded-3 h-100 bg-white sw-stat-card"
                  style={{ transition: 'transform 0.2s, box-shadow 0.2s' }}
                >
                  <Card.Body className="d-flex align-items-center gap-3">
                    <div
                      className="rounded-3 d-flex align-items-center justify-content-center flex-shrink-0"
                      style={{
                        width: 48,
                        height: 48,
                        backgroundColor: `${card.color}18`,
                      }}
                    >
                      <span className="fs-4">{card.icon}</span>
                    </div>
                    <div className="flex-grow-1 min-w-0">
                      <div className="text-muted small">{card.title}</div>
                      <div className="fw-bold fs-4" style={{ color: card.color }}>{card.value}</div>
                      <div className="text-muted small">{card.sub}</div>
                    </div>
                  </Card.Body>
                </Card>
              </Link>
            ) : (
              <Card
                className="border-0 shadow-sm rounded-3 h-100 bg-white sw-stat-card"
                style={{ transition: 'transform 0.2s, box-shadow 0.2s' }}
              >
                <Card.Body className="d-flex align-items-center gap-3">
                  <div
                    className="rounded-3 d-flex align-items-center justify-content-center flex-shrink-0"
                    style={{
                      width: 48,
                      height: 48,
                      backgroundColor: `${card.color}18`,
                    }}
                  >
                    <span className="fs-4">{card.icon}</span>
                  </div>
                  <div className="flex-grow-1 min-w-0">
                    <div className="text-muted small">{card.title}</div>
                    <div className="fw-bold fs-4" style={{ color: card.color }}>{card.value}</div>
                    <div className="text-muted small">{card.sub}</div>
                  </div>
                </Card.Body>
              </Card>
            )}
          </Col>
        ))}
      </Row>

      <Card className="border-0 shadow-sm rounded-3 mb-4">
        <Card.Header className="bg-white border-0 pt-3">
          <h5 className="mb-0">Request Analytics & Insights</h5>
        </Card.Header>
        <Card.Body>
          <div className="row g-3">
            <div className="col-md-6">
              <h6 className="text-muted small mb-2">Status Distribution</h6>
              <div className="d-flex gap-2 flex-wrap">
                <span className="badge rounded-pill px-3 py-2" style={{ backgroundColor: '#2d6a4f' }}>Active: {assigned + inProgress}</span>
                <span className="badge rounded-pill px-3 py-2 bg-secondary">Completed: {completed}</span>
              </div>
            </div>
            <div className="col-md-6">
              <h6 className="text-muted small mb-2">Avg Resolution: {avgResolutionDays} days</h6>
              <h6 className="text-muted small mb-2">Pending Follow-ups: {upcomingFollowUps}</h6>
            </div>
            {typeDistribution.length > 0 && (
              <div className="col-12">
                <h6 className="text-muted small mb-2">By Type</h6>
                <div className="d-flex flex-wrap gap-2">
                  {typeDistribution.map((d) => (
                    <div key={d.type} className="d-flex align-items-center gap-2">
                      <div
                        className="rounded"
                        style={{
                          width: Math.max(20, Math.min(80, d.count * 15)),
                          height: 20,
                          backgroundColor: '#2d6a4f',
                          opacity: 0.7,
                        }}
                      />
                      <span className="small">{d.type}: {d.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card.Body>
      </Card>

      {alerts.length > 0 && (
        <Card className="border-0 shadow-sm rounded-3 mb-4 border-start border-4" style={{ borderLeftColor: '#2d6a4f' }}>
          <Card.Header className="bg-white border-0 pt-3">
            <h5 className="mb-0">Alerts & Notifications</h5>
          </Card.Header>
          <Card.Body className="py-2">
            <div className="d-flex flex-column gap-2">
              {alerts.map((a, i) => (
                <div key={i} className="d-flex align-items-center gap-2 p-2 rounded bg-light">
                  <span
                    className="badge"
                    style={{
                      backgroundColor:
                        a.type === 'overdue' ? '#dc3545' :
                        a.type === 'assignment' ? '#2d6a4f' :
                        a.type === 'message' ? '#0d6efd' :
                        a.type === 'followup' ? '#fd7e14' :
                        a.type === 'reassignment' ? '#6f42c1' : '#6b7280',
                    }}
                  >
                    {a.type === 'overdue' ? 'Overdue' : a.type === 'assignment' ? 'New Assignment' : a.type === 'message' ? 'Message' : a.type === 'followup' ? 'Follow-up' : a.type === 'reassignment' ? 'Reassignment' : 'New'}
                  </span>
                  <div className="flex-grow-1">
                    <strong className="small">{a.title}</strong>
                    <p className="mb-0 text-muted small">{a.message}</p>
                  </div>
                  {a.link && (
                    <Link to={a.link.startsWith('/') ? a.link : '#'} className="btn btn-sm sw-btn-primary">
                      View
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </Card.Body>
        </Card>
      )}

      <Card className="border-0 shadow-sm rounded-3">
        <Card.Header className="bg-white border-0 pt-3 d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Recent Assigned Requests</h5>
          <Link to="/social-worker/requests" className="btn btn-sm sw-btn-primary">
            View All
          </Link>
        </Card.Header>
        <Card.Body className="p-0">
          {requests.length === 0 ? (
            <div className="p-5 text-muted text-center">
              No requests assigned yet. Admin will assign help requests to you.
            </div>
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
                </tr>
              </thead>
              <tbody>
                {requests.slice(0, 6).map((r) => (
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
                      {r.requestDate
                        ? new Date(r.requestDate).toLocaleDateString()
                        : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>
    </div>
  )
}
