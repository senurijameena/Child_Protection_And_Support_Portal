import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Card, Table, Spinner, Form, Badge } from 'react-bootstrap'
import { getMyCases } from '../../services/dashboardApi'
import { CASE_STATUS_LABELS, CASE_TYPE_LABELS } from '../../types/dashboard'
import type { CaseDTO } from '../../types/dashboard'

export function MyCasesPage() {
  const [cases, setCases] = useState<CaseDTO[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')

  useEffect(() => {
    getMyCases()
      .then(setCases)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const filtered = filter
    ? cases.filter(
        (c) =>
          (c.trackingId || '').toLowerCase().includes(filter.toLowerCase()) ||
          (c.caseDescription || '').toLowerCase().includes(filter.toLowerCase()) ||
          (c.status || '').toLowerCase().includes(filter.toLowerCase())
      )
    : cases

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
        <h2 className="h4 fw-bold mb-0">My Cases</h2>
        <Link to="/dashboard/report-case" className="btn btn-primary rounded-pill">
          Report New Case
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
                      No cases found. <Link to="/dashboard/report-case">Report a case</Link>
                    </td>
                  </tr>
                ) : (
                  filtered.map((c) => (
                    <tr key={c.id}>
                      <td>
                        <Link to={`/dashboard/cases/${c.id}`} className="fw-medium text-decoration-none">
                          {c.trackingId || c.id}
                        </Link>
                      </td>
                      <td>{CASE_TYPE_LABELS[(c.caseType as keyof typeof CASE_TYPE_LABELS) || 'OTHER']}</td>
                      <td>
                        <Badge bg="light" text="dark">
                          {CASE_STATUS_LABELS[(c.status as keyof typeof CASE_STATUS_LABELS) || 'REPORTED']}
                        </Badge>
                      </td>
                      <td>{c.reportDate ? new Date(c.reportDate).toLocaleDateString() : '-'}</td>
                      <td>
                        <Link to={`/dashboard/cases/${c.id}`} className="btn btn-sm btn-outline-primary rounded-pill">
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
