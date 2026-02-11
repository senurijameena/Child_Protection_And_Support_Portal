import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Card, Badge, Spinner, ListGroup } from 'react-bootstrap'
import { getUploadBaseUrl } from '../../services/api'
import { getCase, getCaseTimeline } from '../../services/dashboardApi'
import { CASE_STATUS_LABELS, CASE_TYPE_LABELS } from '../../types/dashboard'
import type { CaseDTO } from '../../types/dashboard'

export function CaseDetailsPage() {
  const { caseId } = useParams<{ caseId: string }>()
  const [c, setC] = useState<CaseDTO | null>(null)
  const [timeline, setTimeline] = useState<unknown[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!caseId) return
    Promise.all([getCase(caseId), getCaseTimeline(caseId)])
      .then(([caseData, tl]) => {
        setC(caseData)
        setTimeline(Array.isArray(tl) ? tl : [])
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [caseId])

  if (loading || !c) {
    return (
      <div className="d-flex justify-content-center py-5">
        <Spinner animation="border" variant="primary" />
      </div>
    )
  }

  return (
    <div className="animate-fade-in-up">
      <div className="mb-3">
        <Link to="/dashboard/my-cases" className="text-primary text-decoration-none">← Back to My Cases</Link>
      </div>
      <h2 className="h4 fw-bold mb-4">
        Case {c.trackingId || c.id}
        <Badge bg="light" text="dark" className="ms-2">
          {CASE_STATUS_LABELS[(c.status as keyof typeof CASE_STATUS_LABELS) || 'REPORTED']}
        </Badge>
      </h2>
      <div className="row g-4">
        <div className="col-lg-8">
          <Card className="border-0 shadow-sm rounded-4 mb-4">
            <Card.Header className="bg-white border-0 pt-3">
              <h5 className="mb-0">Details</h5>
            </Card.Header>
            <Card.Body>
              <p><strong>Type:</strong> {CASE_TYPE_LABELS[(c.caseType as keyof typeof CASE_TYPE_LABELS) || 'OTHER']}</p>
              <p><strong>Submitted:</strong> {c.reportDate ? new Date(c.reportDate).toLocaleString() : '-'}</p>
              <p><strong>Location:</strong> {c.location || '-'}</p>
              <p><strong>Description:</strong></p>
              <p className="text-muted">{c.caseDescription || '-'}</p>
              {c.evidenceUrls && c.evidenceUrls.length > 0 && (
                <div>
                  <strong>Evidence:</strong>
                  <ul className="mb-0">
                    {c.evidenceUrls.map((url, i) => (
                      <li key={i}>
                        <a href={`${getUploadBaseUrl()}${url}`} target="_blank" rel="noopener noreferrer">{url.split('/').pop()}</a>
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
                {c.assignedWorkerId || c.assignedOfficerId || c.assignedStationId
                  ? 'A social worker or police officer has been assigned. Use Messages to communicate.'
                  : 'Not yet assigned.'}
              </p>
              <Link to={`/dashboard/messages?case=${c.id}`} className="btn btn-outline-primary btn-sm rounded-pill mt-3">
                Open Messages
              </Link>
            </Card.Body>
          </Card>
        </div>
      </div>
    </div>
  )
}
