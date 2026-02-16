import { useEffect, useState } from 'react'
import { Card, Row, Col, Spinner } from 'react-bootstrap'
import { getPoliceDashboardStats, getPoliceStationCases } from '../../services/policeApi'
import type { PoliceDashboardStats } from '../../services/policeApi'
import type { CaseDTO } from '../../types/dashboard'

export function PoliceReportsPage() {
  const [stats, setStats] = useState<PoliceDashboardStats | null>(null)
  const [cases, setCases] = useState<CaseDTO[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([getPoliceDashboardStats(), getPoliceStationCases()])
      .then(([s, c]) => {
        setStats(s)
        setCases(c)
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

  const closedCount = cases.filter((c) => c.status === 'CLOSED' || c.status === 'RESOLVED').length
  const activeCount = cases.filter(
    (c) =>
      c.status !== 'CLOSED' &&
      c.status !== 'RESOLVED' &&
      c.status !== 'REJECTED' &&
      c.status !== 'CANCELLED'
  ).length

  return (
    <div className="animate-fade-in-up">
      <div className="mb-4">
        <h1 className="h3 fw-bold text-dark mb-1">Reports & Statistics</h1>
        <p className="text-muted mb-0">
          Station case statistics and investigation progress.
        </p>
      </div>

      <Row className="g-4 mb-4">
        <Col md={4}>
          <Card className="border-0 shadow-sm rounded-3 h-100">
            <Card.Body>
              <h6 className="text-muted mb-2">Total Cases</h6>
              <h3 className="fw-bold mb-0">{stats?.assignedCases ?? 0}</h3>
              <small className="text-muted">Assigned to station</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="border-0 shadow-sm rounded-3 h-100">
            <Card.Body>
              <h6 className="text-muted mb-2">Active Investigations</h6>
              <h3 className="fw-bold mb-0">{activeCount}</h3>
              <small className="text-muted">In progress</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="border-0 shadow-sm rounded-3 h-100">
            <Card.Body>
              <h6 className="text-muted mb-2">Closed</h6>
              <h3 className="fw-bold mb-0">{closedCount}</h3>
              <small className="text-muted">Resolved or closed</small>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Card className="border-0 shadow-sm rounded-3">
        <Card.Header className="bg-white border-0 pt-3">
          <h5 className="mb-0">Performance</h5>
        </Card.Header>
        <Card.Body>
          <Row className="g-3">
            <Col md={6}>
              <div className="p-3 bg-light rounded">
                <strong>Average Response Time</strong>
                <p className="mb-0 text-muted">{stats?.avgResponse ?? '-'}</p>
              </div>
            </Col>
            <Col md={6}>
              <div className="p-3 bg-light rounded">
                <strong>Urgent Cases</strong>
                <p className="mb-0 text-muted">{stats?.urgentCases ?? 0}</p>
              </div>
            </Col>
          </Row>
          <p className="text-muted small mt-3 mb-0">
            Export case reports (PDF) requires admin approval. Contact admin for downloadable reports.
          </p>
        </Card.Body>
      </Card>
    </div>
  )
}
