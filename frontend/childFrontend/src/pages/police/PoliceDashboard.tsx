import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Card, Row, Col, Badge, Spinner, Table } from 'react-bootstrap'
import { getPoliceDashboardStats, getPoliceStationCases } from '../../services/policeApi'
import type { PoliceDashboardStats } from '../../services/policeApi'
import type { CaseDTO } from '../../types/dashboard'
import { CASE_STATUS_LABELS, CASE_TYPE_LABELS } from '../../types/dashboard'

export function PoliceDashboard() {
  const [stats, setStats] = useState<PoliceDashboardStats | null>(null)
  const [cases, setCases] = useState<CaseDTO[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([getPoliceDashboardStats(), getPoliceStationCases()])
      .then(([s, c]) => {
        setStats(s)
        setCases(c)
      })
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

  if (error) {
    return (
      <div className="alert alert-danger">
        {error}
      </div>
    )
  }

  const statCards = [
    {
      title: 'Station Cases',
      value: Math.max(cases.length, stats?.assignedCases ?? 0),
      sub: 'Assigned to your station',
      color: 'primary',
      icon: '📁',
      link: '/police/cases',
    },
    {
      title: 'Active Investigations',
      value: stats?.activeCases ?? 0,
      sub: 'In progress',
      color: 'info',
      icon: '🔍',
    },
    {
      title: 'Urgent',
      value: stats?.urgentCases ?? 0,
      sub: 'Requires attention',
      color: 'danger',
      icon: '🚨',
    },
    {
      title: 'Avg Response',
      value: stats?.avgResponse ?? '-',
      sub: 'Response time',
      color: 'secondary',
      icon: '⏱️',
    },
  ]

  return (
    <div className="animate-fade-in-up">
      <div className="mb-4">
        <h1 className="h3 fw-bold text-dark mb-1">Investigation Dashboard</h1>
        <p className="text-muted mb-0">
          Review assigned cases and manage investigations. Region-assigned cases only.
        </p>
      </div>

      <Row className="g-3 mb-4">
        {statCards.map((card) => (
          <Col key={card.title} xs={12} sm={6} lg={3}>
            {card.link ? (
              <Link to={card.link} className="text-decoration-none text-dark">
                <Card
                  className="border-0 shadow-sm rounded-3 h-100 bg-white"
                  style={{ transition: 'transform 0.2s, box-shadow 0.2s' }}
                >
                  <Card.Body className="d-flex align-items-center gap-3">
                    <div
                      className="rounded-3 d-flex align-items-center justify-content-center flex-shrink-0"
                      style={{
                        width: 48,
                        height: 48,
                        backgroundColor: '#e2e8f0',
                      }}
                    >
                      <span className="fs-4">{card.icon}</span>
                    </div>
                    <div className="flex-grow-1 min-w-0">
                      <div className="text-muted small">{card.title}</div>
                      <div className="fw-bold fs-4">{card.value}</div>
                      <div className="text-muted small">{card.sub}</div>
                    </div>
                  </Card.Body>
                </Card>
              </Link>
            ) : (
              <Card
                className="border-0 shadow-sm rounded-3 h-100 bg-white"
                style={{ transition: 'transform 0.2s, box-shadow 0.2s' }}
              >
                <Card.Body className="d-flex align-items-center gap-3">
                  <div
                    className="rounded-3 d-flex align-items-center justify-content-center flex-shrink-0"
                    style={{
                      width: 48,
                      height: 48,
                      backgroundColor: '#e2e8f0',
                    }}
                  >
                    <span className="fs-4">{card.icon}</span>
                  </div>
                  <div className="flex-grow-1 min-w-0">
                    <div className="text-muted small">{card.title}</div>
                    <div className="fw-bold fs-4">{card.value}</div>
                    <div className="text-muted small">{card.sub}</div>
                  </div>
                </Card.Body>
              </Card>
            )}
          </Col>
        ))}
      </Row>

      <Card className="border-0 shadow-sm rounded-3">
        <Card.Header className="bg-white border-0 pt-3 d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Recent Station Cases</h5>
          <Link to="/police/cases" className="btn btn-sm btn-outline-primary">
            View All
          </Link>
        </Card.Header>
        <Card.Body className="p-0">
          {cases.length === 0 ? (
            <div className="p-5 text-muted text-center">No cases assigned to your station</div>
          ) : (
            <Table hover responsive className="mb-0">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Type</th>
                  <th>Reporter</th>
                  <th>Status</th>
                  <th>Priority</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {cases.slice(0, 6).map((c) => (
                  <tr key={c.id}>
                    <td>
                      <Link
                        to={`/police/cases/${c.id}`}
                        className="text-primary text-decoration-none"
                      >
                        {c.trackingId || c.id?.slice(0, 8)}
                      </Link>
                    </td>
                    <td>{CASE_TYPE_LABELS[(c.caseType as keyof typeof CASE_TYPE_LABELS) || 'OTHER']}</td>
                    <td>
                      {c.anonymous ? (
                        <Badge bg="secondary">Anonymous</Badge>
                      ) : (
                        'Reporter'
                      )}
                    </td>
                    <td>
                      <Badge
                        bg={
                          c.status === 'REPORTED' || c.status === 'UNDER_REVIEW'
                            ? 'warning'
                            : c.status === 'CLOSED' || c.status === 'RESOLVED'
                              ? 'success'
                              : 'primary'
                        }
                      >
                        {CASE_STATUS_LABELS[(c.status as keyof typeof CASE_STATUS_LABELS) || 'REPORTED']}
                      </Badge>
                    </td>
                    <td>
                      {c.emergency ? (
                        <Badge bg="danger">Emergency</Badge>
                      ) : (
                        <Badge bg="secondary">Normal</Badge>
                      )}
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
    </div>
  )
}
