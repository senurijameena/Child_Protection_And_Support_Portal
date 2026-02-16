import { useEffect, useState } from 'react'
import { Card, Table, Spinner } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { getSocialWorkerCompletedRequests, type CompletedRequestRow } from '../../services/socialWorkerApi'
import { HELP_TYPE_LABELS } from '../../types/dashboard'

const renderStars = (rating?: number | string) => {
  const value = Number(rating)
  if (!value || Number.isNaN(value)) return '—'
  return '⭐'.repeat(Math.min(5, Math.max(1, value)))
}

export function SocialWorkerFeedbackPage() {
  const [rows, setRows] = useState<CompletedRequestRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    getSocialWorkerCompletedRequests()
      .then((data) => {
        if (!cancelled) setRows(Array.isArray(data) ? data : [])
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5">
        <Spinner animation="border" style={{ color: '#0f766e' }} />
      </div>
    )
  }

  return (
    <Card className="border-0 shadow-sm rounded-3">
      <Card.Header className="bg-white">
        <h5 className="mb-0 fw-bold">Social Worker Feedback</h5>
        <div className="text-muted small">Completed requests with feedback summary</div>
      </Card.Header>
      <Card.Body className="p-0">
        {error && <div className="alert alert-danger m-3">{error}</div>}
        {!error && rows.length === 0 ? (
          <div className="p-4 text-center text-muted small">No closed requests yet.</div>
        ) : (
          <div className="table-responsive">
            <Table hover className="align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th className="small text-muted py-3 ps-3">Request ID</th>
                  <th className="small text-muted py-3">Type</th>
                  <th className="small text-muted py-3">Rating</th>
                  <th className="small text-muted py-3">Feedback</th>
                  <th className="small text-muted py-3">Closed Date</th>
                  <th className="small text-muted py-3 pe-3 text-end">Action</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id}>
                    <td className="py-3 ps-3 fw-600">{row.requestId || row.id?.slice(0, 8) || '—'}</td>
                    <td className="py-3 small">
                      {row.type ? (HELP_TYPE_LABELS as Record<string, string>)[row.type] ?? row.type : '—'}
                    </td>
                    <td className="py-3 small">{renderStars(row.rating)}</td>
                    <td className="py-3 small">{row.hasFeedback ? 'Yes' : 'No'}</td>
                    <td className="py-3 small">
                      {row.closedDate ? new Date(row.closedDate).toLocaleDateString() : '—'}
                    </td>
                    <td className="py-3 pe-3 text-end">
                      <Link to={`/social-worker/feedback/${row.id}`} className="btn btn-sm btn-primary">
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        )}
      </Card.Body>
    </Card>
  )
}
