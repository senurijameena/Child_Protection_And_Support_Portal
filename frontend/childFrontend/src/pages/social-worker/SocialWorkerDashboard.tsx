import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Card, Row, Col, Badge, Spinner, Table, Tab, Tabs } from 'react-bootstrap'
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

// Chart colors
const CHART_COLORS = {
  ASSIGNED: '#f59e0b',
  IN_PROGRESS: '#3b82f6',
  COMPLETED: '#22c55e',
  REJECTED: '#ef4444',
  CANCELLED: '#6b7280',
  UNDER_REVIEW: '#8b5cf6',
  REQUESTED: '#94a3b8',
}

const PIE_COLORS = {
  COUNSELING: '#2d6a4f',
  FOOD_ASSISTANCE: '#40916c',
  EDUCATION_SUPPORT: '#52b788',
  MEDICAL_HELP: '#74c69d',
  SHELTER: '#95d5b2',
  CLOTHING: '#b7e4c7',
  LEGAL_PROTECTION: '#0f766e',
  LIVELIHOOD_EMPLOYMENT: '#0369a1',
  DISABILITY_SUPPORT: '#4b5563',
  EMERGENCY_DISASTER: '#b91c1c',
  OTHER: '#d8f3dc',
}

function maskUserId(id: string | undefined, anonymous: boolean): string {
  if (anonymous || !id) return 'Anonymous'
  if (id.length <= 8) return `${id.slice(0, 4)}****`
  return `${id.slice(0, 4)}****${id.slice(-4)}`
}

export function SocialWorkerDashboard() {
  const { user } = useAuth()
  const userId = user?.userId ?? ''
  const [requests, setRequests] = useState<HelpRequestDTO[]>([])
  const [followUps, setFollowUps] = useState<FollowUpDTO[]>([])
  const [notifications, setNotifications] = useState<{ id: string; title?: string; message?: string; read: boolean; actionUrl?: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'analytics'>('overview')

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
      .then(([reqs, follow, offers, notifs]) => {
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

  // Analytics metrics
  const totalAssigned = requests.length
  const pendingAcceptance = requests.filter((r) => r.status === 'ASSIGNED').length
  const activeRequests = requests.filter((r) => r.status === 'IN_PROGRESS').length
  const completedRequests = requests.filter((r) => r.status === 'COMPLETED').length
  const rejectedRequests = requests.filter((r) => r.status === 'REJECTED').length
  const completionRate = totalAssigned > 0 ? Math.round((completedRequests / totalAssigned) * 100) : 0

  // Status distribution for bar chart
  const statusData = [
    { status: 'Assigned', count: requests.filter((r) => r.status === 'ASSIGNED').length, color: CHART_COLORS.ASSIGNED },
    { status: 'In Progress', count: requests.filter((r) => r.status === 'IN_PROGRESS').length, color: CHART_COLORS.IN_PROGRESS },
    { status: 'Completed', count: requests.filter((r) => r.status === 'COMPLETED').length, color: CHART_COLORS.COMPLETED },
    { status: 'Closed/Rejected', count: requests.filter((r) => r.status === 'REJECTED' || r.status === 'CANCELLED').length, color: CHART_COLORS.REJECTED },
  ]

  // Line chart: requests by month
  const requestsByMonth = requests.reduce<Record<string, number>>((acc, r) => {
    const d = r.requestDate ? new Date(r.requestDate) : new Date()
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    acc[key] = (acc[key] || 0) + 1
    return acc
  }, {})
  const lineData = Object.entries(requestsByMonth)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-6)
    .map(([month, count]) => ({ month: month.replace('-', '/'), count }))

  const maxLineValue = Math.max(...lineData.map((d) => d.count), 1)

  // Pie chart: service package distribution
  const typeDistribution = Object.entries(HELP_TYPE_LABELS).map(([k, v]) => ({
    type: v,
    key: k,
    count: requests.filter((r) => r.helpType === k).length,
  })).filter((d) => d.count > 0)

  const totalPie = typeDistribution.reduce((s, d) => s + d.count, 0)
  const pieGradient = typeDistribution.reduce<{ start: number; end: number; color: string }[]>((acc, d, i) => {
    const prevEnd = acc.length > 0 ? acc[acc.length - 1].end : 0
    const slice = totalPie > 0 ? (d.count / totalPie) * 360 : 0
    acc.push({
      start: prevEnd,
      end: prevEnd + slice,
      color: (PIE_COLORS as Record<string, string>)[d.key] || '#6b7280',
    })
    return acc
  }, [])

  const statCards = [
    { title: 'Total Assigned', value: totalAssigned, sub: 'Help requests assigned to you', color: '#2d6a4f', icon: '📋' },
    { title: 'Active Requests', value: activeRequests, sub: 'Currently in progress', color: '#40916c', icon: '🔄' },
    { title: 'Completed', value: completedRequests, sub: 'Resolved or closed', color: '#22c55e', icon: '✅' },
    { title: 'Pending Acceptance', value: pendingAcceptance, sub: 'Awaiting your acceptance', color: '#f59e0b', icon: '⏳' },
    { title: 'Rejected Packages', value: rejectedRequests, sub: 'Service packages declined', color: '#ef4444', icon: '❌' },
  ]

  const alerts = [
    ...notifications.filter((n) => !n.read).slice(0, 5).map((n) => ({
      type: 'info' as const,
      title: n.title || 'Notification',
      message: n.message,
      link: n.actionUrl,
    })),
    ...requests.filter((r) => r.status === 'ASSIGNED').slice(0, 2).map((r) => ({
      type: 'assignment' as const,
      title: 'New Assignment',
      message: `${r.trackingId || r.id?.slice(0, 8)} - Accept or decline`,
      link: `/social-worker/requests/${r.id}`,
    })),
  ]

  return (
    <div className="animate-fade-in-up">
      <div className="mb-4">
        <h1 className="h3 fw-bold text-dark mb-1">Care & Support Dashboard</h1>
        <p className="text-muted mb-0">
          Manage assigned help requests, deliver services, and track performance.
        </p>
      </div>

      <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab((k as 'overview' | 'analytics') || 'overview')} className="mb-4">
        <Tab eventKey="overview" title="📊 Overview">
          <Row className="g-3 mb-4">
            {statCards.map((card) => (
              <Col key={card.title} xs={12} sm={6} lg={4} xl>
                <Card className="border-0 shadow-sm rounded-3 h-100 sw-stat-card">
                  <Card.Body className="d-flex align-items-center gap-3">
                    <div
                      className="rounded-3 d-flex align-items-center justify-content-center flex-shrink-0"
                      style={{ width: 48, height: 48, backgroundColor: `${card.color}18` }}
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
              </Col>
            ))}
          </Row>

          <Card className="border-0 shadow-sm rounded-3 mb-4">
            <Card.Header className="bg-white border-0 pt-3">
              <h5 className="mb-0">Completion Rate</h5>
            </Card.Header>
            <Card.Body>
              <div className="d-flex align-items-center gap-3">
                <div className="flex-grow-1">
                  <div className="progress" style={{ height: 20, borderRadius: 10 }}>
                    <div
                      className="progress-bar"
                      style={{ width: `${completionRate}%`, backgroundColor: '#2d6a4f' }}
                    />
                  </div>
                </div>
                <span className="fw-bold" style={{ color: '#2d6a4f', minWidth: 60 }}>{completionRate}%</span>
              </div>
              <p className="text-muted small mb-0 mt-2">Completed requests out of total assigned</p>
            </Card.Body>
          </Card>

          {alerts.length > 0 && (
            <Card className="border-0 shadow-sm rounded-3 mb-4 border-start border-4" style={{ borderLeftColor: '#2d6a4f' }}>
              <Card.Header className="bg-white border-0 pt-3">
                <h5 className="mb-0">Alerts & Notifications</h5>
              </Card.Header>
              <Card.Body className="py-2">
                {alerts.map((a, i) => (
                  <div key={i} className="d-flex align-items-center gap-2 p-2 rounded bg-light mb-2">
                    <span className="badge" style={{ backgroundColor: a.type === 'assignment' ? '#2d6a4f' : '#6b7280' }}>
                      {a.type === 'assignment' ? 'New' : 'Info'}
                    </span>
                    <div className="flex-grow-1">
                      <strong className="small">{a.title}</strong>
                      <p className="mb-0 text-muted small">{a.message}</p>
                    </div>
                    {a.link && (
                      <Link to={a.link || '#'} className="btn btn-sm sw-btn-primary">View</Link>
                    )}
                  </div>
                ))}
              </Card.Body>
            </Card>
          )}

          <Card className="border-0 shadow-sm rounded-3">
            <Card.Header className="bg-white border-0 pt-3 d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Recent Assigned Requests</h5>
              <Link to="/social-worker/requests" className="btn btn-sm sw-btn-primary">View All</Link>
            </Card.Header>
            <Card.Body className="p-0">
              {requests.length === 0 ? (
                <div className="p-5 text-muted text-center">No requests assigned yet.</div>
              ) : (
                <Table hover responsive className="mb-0">
                  <thead>
                    <tr>
                      <th>Request ID</th>
                      <th>Category</th>
                      <th>Priority</th>
                      <th>Status</th>
                      <th>Assigned Date</th>
                      <th>Requester</th>
                    </tr>
                  </thead>
                  <tbody>
                    {requests.slice(0, 6).map((r) => (
                      <tr key={r.id}>
                        <td>
                          <Link to={`/social-worker/requests/${r.id}`} className="text-decoration-none" style={{ color: '#2d6a4f' }}>
                            {r.trackingId || r.id?.slice(0, 8)}
                          </Link>
                        </td>
                        <td>{HELP_TYPE_LABELS[(r.helpType as keyof typeof HELP_TYPE_LABELS) || 'OTHER']}</td>
                        <td><Badge bg={r.priority === 'HIGH' ? 'danger' : 'secondary'}>{r.priority || 'MEDIUM'}</Badge></td>
                        <td>
                          <Badge bg={r.status === 'ASSIGNED' ? 'warning' : r.status === 'IN_PROGRESS' ? 'info' : 'success'}>
                            {REQUEST_STATUS_LABELS[(r.status as keyof typeof REQUEST_STATUS_LABELS) || 'REQUESTED']}
                          </Badge>
                        </td>
                        <td className="text-muted small">{r.requestDate ? new Date(r.requestDate).toLocaleDateString() : '-'}</td>
                        <td>{maskUserId(r.requesterUserId, r.anonymous ? true : false)}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </Tab>

        <Tab eventKey="analytics" title="📈 Analytics">
          <div className="mb-4">
            <h5 className="fw-bold mb-2">Analytics & Performance Overview</h5>
            <p className="text-muted small mb-0">Visual charts for your workload and service distribution</p>
          </div>

          <Row className="g-4 mb-4">
            {statCards.map((card) => (
              <Col key={card.title} xs={6} md={4} lg={2}>
                <Card className="border-0 shadow-sm h-100">
                  <Card.Body className="text-center py-3">
                    <div className="text-muted small">{card.title}</div>
                    <div className="fw-bold fs-4" style={{ color: card.color }}>{card.value}</div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>

          <Row className="g-4 mb-4">
            <Col lg={6}>
              <Card className="border-0 shadow-sm rounded-3 h-100">
                <Card.Header className="bg-white border-0 pt-3">
                  <h5 className="mb-0">Requests by Status</h5>
                  <p className="text-muted small mb-0">Bar Chart</p>
                </Card.Header>
                <Card.Body>
                  {statusData.every((d) => d.count === 0) ? (
                    <div className="text-muted text-center py-4">No data yet</div>
                  ) : (
                    <div className="d-flex flex-column gap-2">
                      {statusData.map((d) => {
                        const max = Math.max(...statusData.map((x) => x.count), 1)
                        const pct = (d.count / max) * 100
                        return (
                          <div key={d.status}>
                            <div className="d-flex justify-content-between small mb-1">
                              <span>{d.status}</span>
                              <span className="fw-medium">{d.count}</span>
                            </div>
                            <div className="progress" style={{ height: 8, borderRadius: 4 }}>
                              <div className="progress-bar" style={{ width: `${pct}%`, backgroundColor: d.color }} />
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Col>
            <Col lg={6}>
              <Card className="border-0 shadow-sm rounded-3 h-100">
                <Card.Header className="bg-white border-0 pt-3">
                  <h5 className="mb-0">Requests Handled Over Time</h5>
                  <p className="text-muted small mb-0">Line Chart</p>
                </Card.Header>
                <Card.Body>
                  {lineData.length === 0 ? (
                    <div className="text-muted text-center py-4">No data yet</div>
                  ) : (
                    <div className="d-flex align-items-end gap-3" style={{ height: 180 }}>
                      {lineData.map((d, i) => (
                        <div key={d.month} className="flex-grow-1 d-flex flex-column align-items-center">
                          <div
                            className="w-100 rounded-top"
                            style={{
                              height: `${(d.count / maxLineValue) * 140}px`,
                              minHeight: d.count > 0 ? 8 : 0,
                              backgroundColor: '#2d6a4f',
                              opacity: 0.8,
                            }}
                          />
                          <span className="small text-muted mt-2">{d.month}</span>
                          <span className="small fw-medium">{d.count}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <Row className="g-4 mb-4">
            <Col lg={6}>
              <Card className="border-0 shadow-sm rounded-3">
                <Card.Header className="bg-white border-0 pt-3">
                  <h5 className="mb-0">Service Package Distribution</h5>
                  <p className="text-muted small mb-0">By Type (Counseling, Financial Aid, Shelter, etc.)</p>
                </Card.Header>
                <Card.Body>
                  {typeDistribution.length === 0 ? (
                    <div className="text-muted text-center py-4">No data yet</div>
                  ) : (
                    <div className="d-flex flex-wrap gap-3 align-items-center">
                      <div
                        className="rounded-circle d-flex align-items-center justify-content-center"
                        style={{
                          width: 120,
                          height: 120,
                          background: pieGradient.length > 0
                            ? `conic-gradient(${pieGradient.map((g) => `${g.color} ${g.start}deg ${g.end}deg`).join(', ')})`
                            : '#e5e7eb',
                        }}
                      />
                      <div className="d-flex flex-column gap-1">
                        {typeDistribution.map((d) => (
                          <div key={d.key} className="d-flex align-items-center gap-2">
                            <div
                              className="rounded"
                              style={{
                                width: 12,
                                height: 12,
                                backgroundColor: (PIE_COLORS as Record<string, string>)[d.key] || '#6b7280',
                              }}
                            />
                            <span className="small">{d.type}: {d.count}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Col>
            <Col lg={6}>
              <Card className="border-0 shadow-sm rounded-3 h-100">
                <Card.Header className="bg-white border-0 pt-3">
                  <h5 className="mb-0">Completion Rate</h5>
                  <p className="text-muted small mb-0">Progress Indicator</p>
                </Card.Header>
                <Card.Body className="d-flex flex-column justify-content-center">
                  <div className="text-center mb-3">
                    <div
                      className="d-inline-flex align-items-center justify-content-center rounded-circle position-relative"
                      style={{
                        width: 140,
                        height: 140,
                        background: `conic-gradient(#2d6a4f 0deg ${completionRate * 3.6}deg, #e5e7eb ${completionRate * 3.6}deg 360deg)`,
                      }}
                    >
                      <div
                        className="rounded-circle bg-white d-flex align-items-center justify-content-center"
                        style={{ width: 100, height: 100 }}
                      >
                        <span className="fw-bold fs-2" style={{ color: '#2d6a4f' }}>{completionRate}%</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-muted small text-center mb-0">
                    {completedRequests} of {totalAssigned} requests completed
                  </p>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Tab>
      </Tabs>
    </div>
  )
}
