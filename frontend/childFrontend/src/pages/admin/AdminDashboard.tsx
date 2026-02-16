import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Card, Row, Col, Badge, Spinner, Table } from 'react-bootstrap'
import { getAdminDashboardOverview, getUserStatistics, getAllPoliceStations } from '../../services/adminApi'
import type { AdminDashboardOverviewDTO, UserStatisticsDTO, PoliceStationDTO } from '../../types/admin'
import {
  CASE_STATUS_BADGE_VARIANTS,
  CASE_STATUS_LABELS,
  REQUEST_STATUS_BADGE_VARIANTS,
  REQUEST_STATUS_LABELS,
} from '../../types/dashboard'

// Chart colors
const CHART_COLORS = {
  primary: '#4A90E2',
  success: '#50C878',
  warning: '#FFB347',
  danger: '#FF6B6B',
  info: '#5DADE2',
  purple: '#9B59B6',
  orange: '#FF8C42',
  teal: '#1ABC9C',
}

const STAT_CARD_COLORS = [
  { bg: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', text: '#fff' },
  { bg: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', text: '#fff' },
  { bg: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', text: '#fff' },
  { bg: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', text: '#fff' },
  { bg: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', text: '#fff' },
  { bg: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)', text: '#fff' },
]

export function AdminDashboard() {
  const [data, setData] = useState<AdminDashboardOverviewDTO | null>(null)
  const [userStats, setUserStats] = useState<UserStatisticsDTO | null>(null)
  const [stations, setStations] = useState<PoliceStationDTO[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        const [overview, stats, stationsRes] = await Promise.all([
          getAdminDashboardOverview(),
          getUserStatistics(),
          getAllPoliceStations(),
        ])
        setData(overview)
        setUserStats(stats)
        setStations(stationsRes)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load')
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5">
        <Spinner animation="border" variant="primary" />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="alert alert-danger">
        {error || 'Failed to load dashboard data'}
      </div>
    )
  }

  const m = data.metrics
  const totalPoliceStations = stations.length
  const totalSocialWorkers = userStats?.totalSocialWorkers ?? 0

  // Recent activity timeline
  const timelineEvents: Array<{ type: string; title: string; time: string; icon: string; color: string }> = []
  
  // Add recent cases
  data.recentCases?.slice(0, 3).forEach((c) => {
    timelineEvents.push({
      type: 'case',
      title: `New case: ${c.trackingId || c.id?.slice(0, 8)}`,
      time: c.reportDate ? new Date(c.reportDate).toLocaleString() : 'Recently',
      icon: '📋',
      color: CHART_COLORS.primary,
    })
  })

  // Add recent help requests
  data.recentHelpRequests?.slice(0, 3).forEach((r) => {
    timelineEvents.push({
      type: 'request',
      title: `Help request: ${r.trackingId || r.id?.slice(0, 8)}`,
      time: r.requestDate ? new Date(r.requestDate).toLocaleString() : 'Recently',
      icon: '🆘',
      color: CHART_COLORS.danger,
    })
  })

  // Sort by time (most recent first)
  timelineEvents.sort((a, b) => {
    const timeA = new Date(a.time).getTime()
    const timeB = new Date(b.time).getTime()
    return timeB - timeA
  })

  const statCards = [
    {
      title: 'Total Cases',
      value: m.totalCases,
      color: STAT_CARD_COLORS[0],
      link: '/admin/cases',
    },
    {
      title: 'Help Requests',
      value: m.totalHelpRequests,
      color: STAT_CARD_COLORS[1],
      link: '/admin/help-requests',
    },
    {
      title: 'Total Users',
      value: m.totalUsers,
      color: STAT_CARD_COLORS[2],
      link: '/admin/users',
    },
    {
      title: 'Police Stations',
      value: totalPoliceStations,
      color: STAT_CARD_COLORS[4],
      link: '/admin/users',
    },
    {
      title: 'Social Workers',
      value: totalSocialWorkers,
      color: STAT_CARD_COLORS[5],
      link: '/admin/users',
    },
    {
      title: 'Resolved Cases',
      value: m.resolvedCases ?? 0,
      color: STAT_CARD_COLORS[3],
      link: '/admin/cases',
    },
  ]

  return (
    <div className="animate-fade-in-up">
      <div className="mb-4">
        <h1 className="h2 fw-bold text-dark mb-1">Admin Dashboard</h1>
        <p className="text-muted mb-0">
          Overview of cases, help requests, and system activity
        </p>
      </div>

      {/* Colorful Stat Cards */}
      <Row className="g-4 mb-4">
        {statCards.map((card, idx) => (
          <Col key={card.title} xs={12} sm={6} lg={4}>
            {card.link ? (
              <Link to={card.link} className="text-decoration-none">
                <Card
                  className="border-0 shadow-lg rounded-4 h-100 admin-stat-card"
                      style={{
                    background: card.color.bg,
                    color: card.color.text,
                    transition: 'all 0.3s ease',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-5px)'
                    e.currentTarget.style.boxShadow = '0 10px 25px rgba(0,0,0,0.2)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = '0 5px 15px rgba(0,0,0,0.1)'
                      }}
                    >
                  <Card.Body className="p-4">
                    <div>
                      <div className="text-white-50 text-uppercase small mb-2 fw-semibold" style={{ opacity: 0.9 }}>
                        {card.title}
                    </div>
                      <div className="fw-bold display-4 text-white">{card.value}</div>
                    </div>
                  </Card.Body>
                </Card>
              </Link>
            ) : (
              <Card
                className="border-0 shadow-lg rounded-4 h-100 admin-stat-card"
                    style={{
                  background: card.color.bg,
                  color: card.color.text,
                  transition: 'all 0.3s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-5px)'
                  e.currentTarget.style.boxShadow = '0 10px 25px rgba(0,0,0,0.2)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = '0 5px 15px rgba(0,0,0,0.1)'
                    }}
                  >
                <Card.Body className="p-4">
                  <div>
                    <div className="text-white-50 text-uppercase small mb-2 fw-semibold" style={{ opacity: 0.9 }}>
                      {card.title}
                  </div>
                    <div className="fw-bold display-4 text-white">{card.value}</div>
                  </div>
                </Card.Body>
              </Card>
            )}
          </Col>
        ))}
      </Row>

      {/* Timeline and Recent Activity Row */}
      <Row className="g-4 mb-4">
        <Col lg={8}>
      <Row className="g-4">
            <Col xs={12}>
              <Card className="border-0 shadow-sm rounded-4">
            <Card.Header className="bg-white border-0 pt-3 d-flex justify-content-between align-items-center">
                  <h5 className="mb-0 fw-bold">Recent Cases</h5>
              <Link to="/admin/cases" className="btn btn-sm btn-outline-primary">
                View All
              </Link>
            </Card.Header>
            <Card.Body className="p-0">
              {(data.recentCases?.length ?? 0) === 0 ? (
                <div className="p-4 text-muted text-center">No recent cases</div>
              ) : (
                <Table hover responsive className="mb-0">
                      <thead className="table-light">
                    <tr>
                      <th>ID</th>
                      <th>Type</th>
                      <th>Status</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.recentCases?.slice(0, 5).map((c) => (
                      <tr key={c.id}>
                        <td>
                          <Link
                            to={`/admin/cases/${c.id}`}
                                className="text-primary text-decoration-none fw-semibold"
                          >
                            {c.trackingId || c.id?.slice(0, 8)}
                          </Link>
                        </td>
                        <td>{c.caseType || '-'}</td>
                        <td>
                          <Badge
                            bg={
                                  CASE_STATUS_BADGE_VARIANTS[
                                    (c.status as keyof typeof CASE_STATUS_BADGE_VARIANTS) || 'REPORTED'
                                  ]
                                }
                              >
                                {c.status === 'UNDER_REVIEW'
                                  ? 'Accepted'
                                  : CASE_STATUS_LABELS[(c.status as keyof typeof CASE_STATUS_LABELS) || 'REPORTED']}
                          </Badge>
                        </td>
                        <td className="text-muted small">
                          {c.reportDate
                            ? new Date(c.reportDate).toLocaleDateString()
                            : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </Col>

            <Col xs={12}>
              <Card className="border-0 shadow-sm rounded-4">
            <Card.Header className="bg-white border-0 pt-3 d-flex justify-content-between align-items-center">
                  <h5 className="mb-0 fw-bold">Recent Help Requests</h5>
              <Link to="/admin/help-requests" className="btn btn-sm btn-outline-primary">
                View All
              </Link>
            </Card.Header>
            <Card.Body className="p-0">
              {(data.recentHelpRequests?.length ?? 0) === 0 ? (
                    <div className="p-4 text-muted text-center">No recent help requests</div>
              ) : (
                <Table hover responsive className="mb-0">
                      <thead className="table-light">
                    <tr>
                      <th>ID</th>
                      <th>Type</th>
                      <th>Status</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.recentHelpRequests?.slice(0, 5).map((r) => (
                      <tr key={r.id}>
                        <td>
                          <Link
                            to={`/admin/help-requests/${r.id}`}
                                className="text-primary text-decoration-none fw-semibold"
                          >
                            {r.trackingId || r.id?.slice(0, 8)}
                          </Link>
                        </td>
                        <td>{r.helpType || '-'}</td>
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
        </Col>
          </Row>
        </Col>

        <Col lg={4}>
          <Card className="border-0 shadow-sm rounded-4 h-100">
            <Card.Header className="bg-white border-0 pt-3">
              <h5 className="mb-0 fw-bold">Activity Timeline</h5>
              <p className="text-muted small mb-0">Recent system activity</p>
            </Card.Header>
            <Card.Body>
              {timelineEvents.length === 0 ? (
                <div className="text-center text-muted py-4">No recent activity</div>
              ) : (
                <div className="timeline">
                  {timelineEvents.slice(0, 8).map((event, idx) => (
                    <div
                      key={idx}
                      className="d-flex mb-3 pb-3"
                      style={{
                        borderBottom: idx < timelineEvents.length - 1 ? '1px solid #e9ecef' : 'none',
                      }}
                    >
                      <div
                        className="d-flex align-items-center justify-content-center rounded-circle me-3"
                        style={{
                          width: '40px',
                          height: '40px',
                          backgroundColor: event.color + '20',
                          color: event.color,
                          fontSize: '18px',
                          flexShrink: 0,
                        }}
                      >
                        {event.icon}
                      </div>
                      <div className="flex-grow-1">
                        <div className="fw-semibold text-dark mb-1">{event.title}</div>
                        <div className="text-muted small">{event.time}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Pending Transfers */}
        {data.pendingTransfers && data.pendingTransfers.length > 0 && (
        <Row className="g-4">
          <Col xs={12}>
            <Card className="border-0 shadow-sm rounded-4">
              <Card.Header className="bg-white border-0 pt-3 d-flex justify-content-between align-items-center">
                <h5 className="mb-0 fw-bold">Pending Transfer Requests</h5>
                <Link to="/admin/transfers" className="btn btn-sm btn-outline-primary">
                  Manage
                </Link>
              </Card.Header>
              <Card.Body className="p-0">
                <Table hover responsive className="mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Entity</th>
                      <th>Type</th>
                      <th>From</th>
                      <th>Reason</th>
                      <th>Requested</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.pendingTransfers.slice(0, 5).map((t) => (
                      <tr key={t.id}>
                        <td>{t.entityId?.slice(0, 8)}</td>
                        <td>{t.entityType}</td>
                        <td>{t.fromUserName || t.fromUserId || '-'}</td>
                        <td className="text-muted">{t.reason?.slice(0, 40) || '-'}</td>
                        <td className="text-muted small">
                          {t.requestedAt
                            ? new Date(t.requestedAt).toLocaleString()
                            : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          </Col>
        </Row>
        )}
    </div>
  )
}
