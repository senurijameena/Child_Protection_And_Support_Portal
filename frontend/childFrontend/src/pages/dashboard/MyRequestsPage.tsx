import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Card, Table, Spinner, Form, Badge } from 'react-bootstrap'
import { getMyRequests } from '../../services/dashboardApi'
import { REQUEST_STATUS_LABELS, HELP_TYPE_LABELS } from '../../types/dashboard'
import type { HelpRequestDTO } from '../../types/dashboard'

export function MyRequestsPage() {
  const [requests, setRequests] = useState<HelpRequestDTO[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')

  useEffect(() => {
    getMyRequests()
      .then(setRequests)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const filtered = filter
    ? requests.filter(
        (r) =>
          (r.trackingId || '').toLowerCase().includes(filter.toLowerCase()) ||
          (r.description || '').toLowerCase().includes(filter.toLowerCase()) ||
          (r.status || '').toLowerCase().includes(filter.toLowerCase())
      )
    : requests

  if (loading) {
    return (
      <div className="d-flex justify-content-center py-5">
        <Spinner animation="border" variant="primary" />
      </div>
    )
  }

  return (
    <div className="animate-fade-in-up">
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4">
        <h2 className="h4 fw-bold mb-0">My Help Requests</h2>
        <Link to="/dashboard/request-help" className="btn btn-primary rounded-pill">
          Request Help
        </Link>
      </div>
      <Card className="border-0 shadow-sm rounded-4">
        <Card.Body>
          <Form.Group className="mb-3">
            <Form.Control
              type="search"
              placeholder="Search by ID, description, status..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="rounded-pill"
            />
          </Form.Group>
          <div className="table-responsive">
            <Table hover className="mb-0">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center text-muted py-4">
                      No requests found. <Link to="/dashboard/request-help">Request help</Link>
                    </td>
                  </tr>
                ) : (
                  filtered.map((r) => (
                    <tr key={r.id}>
                      <td>
                        <Link to={`/dashboard/requests/${r.id}`} className="fw-medium text-decoration-none">
                          {r.trackingId || r.id}
                        </Link>
                      </td>
                      <td>{HELP_TYPE_LABELS[(r.helpType as keyof typeof HELP_TYPE_LABELS) || 'OTHER']}</td>
                      <td>
                        <Badge bg="light" text="dark">
                          {REQUEST_STATUS_LABELS[(r.status as keyof typeof REQUEST_STATUS_LABELS) || 'REQUESTED']}
                        </Badge>
                      </td>
                      <td>{r.requestDate ? new Date(r.requestDate).toLocaleDateString() : '-'}</td>
                      <td>
                        <Link to={`/dashboard/requests/${r.id}`} className="btn btn-sm btn-outline-primary rounded-pill">
                          View
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>
    </div>
  )
}
