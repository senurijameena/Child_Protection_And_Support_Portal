import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Card, Badge, Spinner, ListGroup } from 'react-bootstrap'
import { getHelpRequest, getHelpRequestTimeline } from '../../services/dashboardApi'
import { REQUEST_STATUS_LABELS, HELP_TYPE_LABELS } from '../../types/dashboard'
import type { HelpRequestDTO } from '../../types/dashboard'

export function RequestDetailsPage() {
  const { requestId } = useParams<{ requestId: string }>()
  const [r, setR] = useState<HelpRequestDTO | null>(null)
  const [timeline, setTimeline] = useState<unknown[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!requestId) return
    Promise.all([getHelpRequest(requestId), getHelpRequestTimeline(requestId)])
      .then(([req, tl]) => {
        setR(req)
        setTimeline(Array.isArray(tl) ? tl : [])
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [requestId])

  if (loading || !r) {
    return (
      <div className="d-flex justify-content-center py-5">
        <Spinner animation="border" variant="primary" />
      </div>
    )
  }

  return (
    <div className="animate-fade-in-up">
      <div className="mb-3">
        <Link to="/dashboard/my-requests" className="text-primary text-decoration-none">Back to My Requests</Link>
      </div>
      <h2 className="h4 fw-bold mb-4">
        Request {r.trackingId || r.id}
        <Badge bg="light" text="dark" className="ms-2">
          {REQUEST_STATUS_LABELS[(r.status as keyof typeof REQUEST_STATUS_LABELS) || 'REQUESTED']}
        </Badge>
      </h2>
      <div className="row g-4">
        <div className="col-lg-8">
          <Card className="border-0 shadow-sm rounded-4 mb-4">
            <Card.Header className="bg-white border-0 pt-3">
              <h5 className="mb-0">Details</h5>
            </Card.Header>
            <Card.Body>
              <p><strong>Type:</strong> {HELP_TYPE_LABELS[(r.helpType as keyof typeof HELP_TYPE_LABELS) || 'OTHER']}</p>
              <p><strong>Submitted:</strong> {r.requestDate ? new Date(r.requestDate).toLocaleString() : '-'}</p>
              <p><strong>Location:</strong> {r.location || '-'}</p>
              <p><strong>Description:</strong></p>
              <p className="text-muted">{r.description || '-'}</p>
              {r.documentUrls && r.documentUrls.length > 0 && (
                <div>
                  <strong>Documents:</strong>
                  <ul className="mb-0">
                    {r.documentUrls.map((url, i) => (
                      <li key={i}>
                        <a href={url} target="_blank" rel="noopener noreferrer">{url.split('/').pop()}</a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </Card.Body>
          </Card>
          {timeline.length > 0 && (
            <Card className="border-0 shadow-sm rounded-4">
              <Card.Header className="bg-white border-0 pt-3">
                <h5 className="mb-0">Timeline</h5>
              </Card.Header>
              <Card.Body>
                <ListGroup variant="flush">
                  {timeline.map((item, i) => {
                    const it = item as { id?: string; message?: string; timestamp?: string; actor?: string }
                    return (
                      <ListGroup.Item key={it.id || i} className="border-0 border-start border-2 border-primary ps-3">
                        <small className="text-muted">
                          {it.timestamp ? new Date(it.timestamp).toLocaleString() : '-'}
                          {it.actor && ` · ${it.actor}`}
                        </small>
                        <p className="mb-0">{it.message || '-'}</p>
                      </ListGroup.Item>
                    )
                  })}
                </ListGroup>
              </Card.Body>
            </Card>
          )}
        </div>
        <div className="col-lg-4">
          <Card className="border-0 shadow-sm rounded-4">
            <Card.Header className="bg-white border-0 pt-3">
              <h5 className="mb-0">Assigned</h5>
            </Card.Header>
            <Card.Body>
              <p className="text-muted mb-0">
                {r.assignedWorkerId
                  ? 'A social worker has been assigned. Check Service Offers for proposals.'
                  : 'Not yet assigned.'}
              </p>
              <Link to={`/dashboard/messages?request=${r.id}`} className="btn btn-outline-primary btn-sm rounded-pill mt-3 me-2">
                Messages
              </Link>
              <Link to="/dashboard/service-offers" className="btn btn-outline-success btn-sm rounded-pill mt-3">
                Service Offers
              </Link>
            </Card.Body>
          </Card>
        </div>
      </div>
    </div>
  )
}
