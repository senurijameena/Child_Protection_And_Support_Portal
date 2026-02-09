import { useEffect, useState } from 'react'
import { Card, Row, Col, Spinner, Table, Badge } from 'react-bootstrap'
import { getAdminDashboardOverview } from '../../services/adminApi'
import type { AdminDashboardOverviewDTO } from '../../types/admin'
import { CASE_STATUS_LABELS, HELP_TYPE_LABELS } from '../../types/dashboard'

export function AdminAnalyticsPage() {
  const [data, setData] = useState<AdminDashboardOverviewDTO | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getAdminDashboardOverview()
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="d-flex justify-content-center py-5">
        <Spinner animation="border" variant="primary" />
      </div>
    )
  }

  if (!data) {
    return (
      <div className="alert alert-danger">
        Failed to load analytics
      </div>
    )
  }

  const m = data.metrics
  const casesByStatus = m.casesByStatus ?? {}
  const helpByType = m.helpRequestsByType ?? {}

  return (
    <div className="animate-fade-in-up">
      <div className="mb-4">
        <h1 className="h3 fw-bold text-dark mb-1">Analytics & Overview</h1>
        <p className="text-muted mb-0">Status distribution and workload summary</p>
      </div>

      <Row className="g-3 mb-4">
        <Col xs={6} md={4} lg={2}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body className="text-center py-3">
              <div className="text-muted small">Total Cases</div>
              <div className="fw-bold fs-4">{m.totalCases}</div>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={6} md={4} lg={2}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body className="text-center py-3">
              <div className="text-muted small">Active Cases</div>
              <div className="fw-bold fs-4 text-primary">{m.activeCases}</div>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={6} md={4} lg={2}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body className="text-center py-3">
              <div className="text-muted small">Help Requests</div>
              <div className="fw-bold fs-4">{m.totalHelpRequests}</div>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={6} md={4} lg={2}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body className="text-center py-3">
              <div className="text-muted small">Pending Approval</div>
              <div className="fw-bold fs-4 text-warning">{m.pendingApprovals}</div>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={6} md={4} lg={2}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body className="text-center py-3">
              <div className="text-muted small">Resolved</div>
              <div className="fw-bold fs-4 text-success">{m.resolvedCases}</div>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={6} md={4} lg={2}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body className="text-center py-3">
              <div className="text-muted small">Emergency</div>
              <div className="fw-bold fs-4 text-danger">{m.emergencyCases}</div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="g-4">
        <Col lg={6}>
          <Card className="border-0 shadow-sm rounded-3">
            <Card.Header className="bg-white border-0 pt-3">
              <h5 className="mb-0">Cases by Status</h5>
            </Card.Header>
            <Card.Body>
              {Object.keys(casesByStatus).length === 0 ? (
                <div className="text-muted text-center py-4">No case data yet</div>
              ) : (
                <Table hover responsive className="mb-0">
                  <thead>
                    <tr>
                      <th>Status</th>
                      <th className="text-end">Count</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(casesByStatus).map(([status, count]) => (
                      <tr key={status}>
                        <td>
                          <Badge
                            bg={
                              status === 'REPORTED' || status === 'UNDER_REVIEW'
                                ? 'warning'
                                : status === 'CLOSED' || status === 'RESOLVED'
                                  ? 'success'
                                  : 'primary'
                            }
                          >
                            {CASE_STATUS_LABELS[status as keyof typeof CASE_STATUS_LABELS] || status}
                          </Badge>
                        </td>
                        <td className="text-end">{count}</td>
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
            <Card.Header className="bg-white border-0 pt-3">
              <h5 className="mb-0">Help Requests by Type</h5>
            </Card.Header>
            <Card.Body>
              {Object.keys(helpByType).length === 0 ? (
                <div className="text-muted text-center py-4">No help request data yet</div>
              ) : (
                <Table hover responsive className="mb-0">
                  <thead>
                    <tr>
                      <th>Type</th>
                      <th className="text-end">Count</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(helpByType).map(([type, count]) => (
                      <tr key={type}>
                        <td>{HELP_TYPE_LABELS[type as keyof typeof HELP_TYPE_LABELS] || type}</td>
                        <td className="text-end">{count}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  )
}
