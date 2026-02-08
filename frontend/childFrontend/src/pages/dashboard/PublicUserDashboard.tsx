import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Card, Row, Col, Spinner, ListGroup } from 'react-bootstrap'
import { useAuth } from '../../hooks/useAuth'
import { getDashboardStats, getMyCases, getMyRequests } from '../../services/dashboardApi'
import { CASE_STATUS_LABELS, REQUEST_STATUS_LABELS } from '../../types/dashboard'
import type { CaseDTO, HelpRequestDTO } from '../../types/dashboard'

export function PublicUserDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState<Record<string, number> | null>(null)
  const [recentCases, setRecentCases] = useState<CaseDTO[]>([])
  const [recentRequests, setRecentRequests] = useState<HelpRequestDTO[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([getDashboardStats(), getMyCases(), getMyRequests()])
      .then(([s, cases, requests]) => {
        setStats(s)
        setRecentCases(cases.slice(0, 5))
        setRecentRequests(requests.slice(0, 5))
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="d-flex justify-content-center py-5">
        <Spinner animation="border" variant="primary" />
      </div>
    )
  }

  return (
    <div className="animate-fade-in-up">
      <div className="mb-4">
        <h1 className="h3 fw-bold text-dark">
          Welcome, {user?.fullName || user?.email || 'User'}
        </h1>
        <p className="text-secondary mb-0">Manage your cases, requests, and messages</p>
      </div>

      <Row className="g-4 mb-4">
        <Col xs={12} sm={6} md={3}>
          <Card className="border-0 shadow-sm rounded-4 h-100 feature-card">
            <Card.Body>
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <small className="text-muted d-block">Active Cases</small>
                  <h3 className="fw-bold text-primary mb-0">{stats?.activeCases ?? 0}</h3>
                </div>
                <div className="rounded-circle bg-primary bg-opacity-10 p-3">
                  <span className="text-primary fs-4">📋</span>
                </div>
              </div>
              <Link to="/dashboard/my-cases" className="stretched-link small text-primary mt-2 d-block">
                View cases →
              </Link>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} sm={6} md={3}>
          <Card className="border-0 shadow-sm rounded-4 h-100 feature-card">
            <Card.Body>
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <small className="text-muted d-block">Pending Requests</small>
                  <h3 className="fw-bold text-success mb-0">{stats?.pendingRequests ?? 0}</h3>
                </div>
                <div className="rounded-circle bg-success bg-opacity-10 p-3">
                  <span className="text-success fs-4">🆘</span>
                </div>
              </div>
              <Link to="/dashboard/my-requests" className="stretched-link small text-primary mt-2 d-block">
                View requests →
              </Link>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} sm={6} md={3}>
          <Card className="border-0 shadow-sm rounded-4 h-100 feature-card">
            <Card.Body>
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <small className="text-muted d-block">Pending Offers</small>
                  <h3 className="fw-bold text-info mb-0">{stats?.pendingOffers ?? 0}</h3>
                </div>
                <div className="rounded-circle bg-info bg-opacity-10 p-3">
                  <span className="text-info fs-4">📦</span>
                </div>
              </div>
              <Link to="/dashboard/service-offers" className="stretched-link small text-primary mt-2 d-block">
                View offers →
              </Link>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} sm={6} md={3}>
          <Card className="border-0 shadow-sm rounded-4 h-100 feature-card">
            <Card.Body>
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <small className="text-muted d-block">Resolved</small>
                  <h3 className="fw-bold text-secondary mb-0">{(stats?.resolvedCases ?? 0) + (stats?.acceptedServices ?? 0)}</h3>
                </div>
                <div className="rounded-circle bg-secondary bg-opacity-10 p-3">
                  <span className="text-secondary fs-4">✓</span>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col lg={6} className="mb-4">
          <Card className="border-0 shadow-sm rounded-4 h-100">
            <Card.Header className="bg-white border-0 pt-3 pb-0">
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Recent Cases</h5>
                <Link to="/dashboard/my-cases" className="btn btn-sm btn-outline-primary rounded-pill">
                  View all
                </Link>
              </div>
            </Card.Header>
            <Card.Body>
              {recentCases.length === 0 ? (
                <p className="text-muted mb-0">No cases yet. <Link to="/dashboard/report-case">Report a case</Link></p>
              ) : (
                <ListGroup variant="flush">
                  {recentCases.map((c) => (
                    <ListGroup.Item key={c.id} className="border-0 px-0">
                      <Link to={`/dashboard/cases/${c.id}`} className="text-decoration-none text-dark">
                        <div className="d-flex justify-content-between">
                          <span className="fw-medium">{c.trackingId || c.id}</span>
                          <span className="badge bg-light text-dark">{CASE_STATUS_LABELS[(c.status as keyof typeof CASE_STATUS_LABELS) || 'REPORTED']}</span>
                        </div>
                        <small className="text-muted">{c.caseDescription?.slice(0, 60)}...</small>
                      </Link>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              )}
            </Card.Body>
          </Card>
        </Col>
        <Col lg={6} className="mb-4">
          <Card className="border-0 shadow-sm rounded-4 h-100">
            <Card.Header className="bg-white border-0 pt-3 pb-0">
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Recent Help Requests</h5>
                <Link to="/dashboard/my-requests" className="btn btn-sm btn-outline-primary rounded-pill">
                  View all
                </Link>
              </div>
            </Card.Header>
            <Card.Body>
              {recentRequests.length === 0 ? (
                <p className="text-muted mb-0">No requests yet. <Link to="/dashboard/request-help">Request help</Link></p>
              ) : (
                <ListGroup variant="flush">
                  {recentRequests.map((r) => (
                    <ListGroup.Item key={r.id} className="border-0 px-0">
                      <Link to={`/dashboard/requests/${r.id}`} className="text-decoration-none text-dark">
                        <div className="d-flex justify-content-between">
                          <span className="fw-medium">{r.trackingId || r.id}</span>
                          <span className="badge bg-light text-dark">{REQUEST_STATUS_LABELS[(r.status as keyof typeof REQUEST_STATUS_LABELS) || 'REQUESTED']}</span>
                        </div>
                        <small className="text-muted">{r.description?.slice(0, 60)}...</small>
                      </Link>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  )
}
