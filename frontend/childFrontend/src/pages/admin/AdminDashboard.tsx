import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Card, Row, Col, Badge, Spinner, Table } from 'react-bootstrap'
import { getAdminDashboardOverview } from '../../services/adminApi'
import type { AdminDashboardOverviewDTO } from '../../types/admin'
import {
  CASE_STATUS_BADGE_VARIANTS,
  CASE_STATUS_LABELS,
  REQUEST_STATUS_BADGE_VARIANTS,
  REQUEST_STATUS_LABELS,
} from '../../types/dashboard'

export function AdminDashboard() {
  const [data, setData] = useState<AdminDashboardOverviewDTO | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getAdminDashboardOverview()
      .then(setData)
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load'))
      .finally(() => setLoading(false))
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

  const statCards = [
    {
      title: 'Total Cases',
      value: m.totalCases,
      sub: `${m.activeCases} active`,
      color: 'primary',
      link: '/admin/cases',
    },
    {
      title: 'Help Requests',
      value: m.totalHelpRequests,
      sub: `${m.pendingHelpRequests} pending`,
      color: 'success',
      link: '/admin/help-requests',
    },
    {
      title: 'Total Users',
      value: m.totalUsers,
      sub: `${m.pendingApprovals} pending approval`,
      color: 'info',
      link: '/admin/users',
    },
    {
      title: 'Pending Transfers',
      value: data.pendingTransfers?.length ?? 0,
      sub: 'Awaiting action',
      color: 'warning',
      link: '/admin/transfers',
    },
  ]

  return (
    <div className="animate-fade-in-up">
      <div className="mb-4">
        <h1 className="h3 fw-bold text-dark mb-1">Admin Dashboard</h1>
        <p className="text-muted mb-0">
          Overview of cases, help requests, and system activity
        </p>
      </div>

      <Row className="g-3 mb-4">
        {statCards.map((card) => (
          <Col key={card.title} xs={12} sm={6} lg={4}>
            {card.link ? (
              <Link to={card.link} className="text-decoration-none text-dark">
                <Card className="border-0 shadow-sm rounded-3 h-100 admin-stat-card bg-white">
                  <Card.Body className="py-3">
                    <div className="text-muted text-uppercase small mb-1">{card.title}</div>
                    <div className="fw-bold display-6 text-dark mb-1">{card.value}</div>
                    <div className="text-muted small">{card.sub}</div>
                  </Card.Body>
                </Card>
              </Link>
            ) : (
              <Card className="border-0 shadow-sm rounded-3 h-100 admin-stat-card bg-white">
                <Card.Body className="py-3">
                  <div className="text-muted text-uppercase small mb-1">{card.title}</div>
                  <div className="fw-bold display-6 text-dark mb-1">{card.value}</div>
                  <div className="text-muted small">{card.sub}</div>
                </Card.Body>
              </Card>
            )}
          </Col>
        ))}
      </Row>

      <Row className="g-4">
        <Col lg={6}>
          <Card className="border-0 shadow-sm rounded-3">
            <Card.Header className="bg-white border-0 pt-3 d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Recent Cases</h5>
              <Link to="/admin/cases" className="btn btn-sm btn-outline-primary">
                View All
              </Link>
            </Card.Header>
            <Card.Body className="p-0">
              {(data.recentCases?.length ?? 0) === 0 ? (
                <div className="p-4 text-muted text-center">No recent cases</div>
              ) : (
                <Table hover responsive className="mb-0">
                  <thead>
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
                            className="text-primary text-decoration-none"
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

        <Col lg={6}>
          <Card className="border-0 shadow-sm rounded-3">
            <Card.Header className="bg-white border-0 pt-3 d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Recent Help Requests</h5>
              <Link to="/admin/help-requests" className="btn btn-sm btn-outline-primary">
                View All
              </Link>
            </Card.Header>
            <Card.Body className="p-0">
              {(data.recentHelpRequests?.length ?? 0) === 0 ? (
                <div className="p-4 text-muted text-center">
                  No recent help requests
                </div>
              ) : (
                <Table hover responsive className="mb-0">
                  <thead>
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
                            className="text-primary text-decoration-none"
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

        {data.pendingTransfers && data.pendingTransfers.length > 0 && (
          <Col xs={12}>
            <Card className="border-0 shadow-sm rounded-3">
              <Card.Header className="bg-white border-0 pt-3 d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Pending Transfer Requests</h5>
                <Link to="/admin/transfers" className="btn btn-sm btn-outline-primary">
                  Manage
                </Link>
              </Card.Header>
              <Card.Body className="p-0">
                <Table hover responsive className="mb-0">
                  <thead>
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
        )}
      </Row>
    </div>
  )
}
