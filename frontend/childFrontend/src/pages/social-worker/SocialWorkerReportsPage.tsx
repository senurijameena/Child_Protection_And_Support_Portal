import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Card, Row, Col, Badge, Spinner, Table } from 'react-bootstrap'
import { useAuth } from '../../hooks/useAuth'
import {
  getAssignedRequests,
  getMyFollowUps,
  getOffersByWorker,
} from '../../services/socialWorkerApi'
import type { HelpRequestDTO } from '../../types/dashboard'
import type { FollowUpDTO } from '../../services/socialWorkerApi'
import { REQUEST_STATUS_LABELS } from '../../types/dashboard'

export function SocialWorkerReportsPage() {
  const { user } = useAuth()
  const userId = user?.userId ?? ''
  const [requests, setRequests] = useState<HelpRequestDTO[]>([])
  const [followUps, setFollowUps] = useState<FollowUpDTO[]>([])
  const [offers, setOffers] = useState<{ id: string; status?: string }[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) return
    Promise.all([
      getAssignedRequests(userId),
      getMyFollowUps(),
      getOffersByWorker(userId),
    ])
      .then(([reqs, follow, off]) => {
        setRequests(reqs)
        setFollowUps(follow)
        setOffers(off)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [userId])

  if (loading) {
    return (
      <div className="d-flex justify-content-center py-5">
        <Spinner animation="border" style={{ color: '#2d6a4f' }} />
      </div>
    )
  }

  const completed = requests.filter((r) => r.status === 'COMPLETED' || r.status === 'REJECTED').length
  const inProgress = requests.filter((r) => r.status === 'IN_PROGRESS').length
  const completionRate = requests.length > 0 ? Math.round((completed / requests.length) * 100) : 0
  const acceptedOffers = offers.filter((o) => o.status === 'ACCEPTED').length
  const upcomingFollowUps = followUps.filter(
    (f) => f.status === 'UPCOMING' || f.status === 'SCHEDULED' || f.status === 'URGENT'
  )

  const metrics = [
    { title: 'Requests Handled', value: requests.length, sub: 'Total assigned' },
    { title: 'Completion Rate', value: `${completionRate}%`, sub: 'Resolved or closed' },
    { title: 'In Progress', value: inProgress, sub: 'Active service delivery' },
    { title: 'Accepted Offers', value: acceptedOffers, sub: 'User accepted packages' },
  ]

  return (
    <div className="animate-fade-in-up">
      <div className="mb-4">
        <h1 className="h3 fw-bold text-dark mb-1">Performance & Reports</h1>
        <p className="text-muted mb-0">
          Personal performance metrics and follow-up reminders.
        </p>
      </div>

      <Row className="g-3 mb-4">
        {metrics.map((m) => (
          <Col key={m.title} xs={12} sm={6} lg={3}>
            <Card className="border-0 shadow-sm rounded-3 sw-stat-card">
              <Card.Body>
                <div className="fw-bold fs-4" style={{ color: '#2d6a4f' }}>{m.value}</div>
                <div className="text-muted small">{m.title}</div>
                <div className="text-muted small">{m.sub}</div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      <Card className="border-0 shadow-sm rounded-3 mb-4">
        <Card.Header className="bg-white border-0 pt-3">
          <h5 className="mb-0">Upcoming Follow-ups</h5>
        </Card.Header>
        <Card.Body className="p-0">
          {upcomingFollowUps.length === 0 ? (
            <div className="p-4 text-muted text-center">No upcoming follow-ups</div>
          ) : (
            <Table hover responsive className="mb-0">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Child / Context</th>
                  <th>Status</th>
                  <th>Scheduled</th>
                  <th>Request</th>
                </tr>
              </thead>
              <tbody>
                {upcomingFollowUps.slice(0, 10).map((f) => (
                  <tr key={f.id}>
                    <td>{f.type || '-'}</td>
                    <td>{f.childName || '-'}</td>
                    <td>
                      <Badge bg={f.status === 'URGENT' ? 'danger' : 'info'}>{f.status}</Badge>
                    </td>
                    <td className="text-muted small">
                      {f.scheduledDate ? new Date(f.scheduledDate).toLocaleString() : '-'}
                    </td>
                    <td>
                      {f.helpRequestId ? (
                        <Link to={`/social-worker/requests/${f.helpRequestId}`} className="small">
                          View
                        </Link>
                      ) : (
                        '-'
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      <Card className="border-0 shadow-sm rounded-3">
        <Card.Header className="bg-white border-0 pt-3 d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Recent Completed Requests</h5>
          <Link to="/social-worker/requests" className="btn btn-sm sw-btn-primary">
            View All
          </Link>
        </Card.Header>
        <Card.Body className="p-0">
          {requests.filter((r) => r.status === 'COMPLETED').length === 0 ? (
            <div className="p-4 text-muted text-center">No completed requests yet</div>
          ) : (
            <Table hover responsive className="mb-0">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Status</th>
                  <th>Type</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {requests
                  .filter((r) => r.status === 'COMPLETED')
                  .slice(0, 8)
                  .map((r) => (
                    <tr key={r.id}>
                      <td>
                        <Link to={`/social-worker/requests/${r.id}`} className="text-decoration-none" style={{ color: '#2d6a4f' }}>
                          {r.trackingId || r.id?.slice(0, 8)}
                        </Link>
                      </td>
                      <td>
                        <Badge bg="success">
                          {REQUEST_STATUS_LABELS[(r.status as keyof typeof REQUEST_STATUS_LABELS) || 'REQUESTED']}
                        </Badge>
                      </td>
                      <td>{r.helpType || '-'}</td>
                      <td className="text-muted small">
                        {r.requestDate ? new Date(r.requestDate).toLocaleDateString() : '-'}
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
