import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Card, Badge, Spinner, ListGroup, Button } from 'react-bootstrap'
import { apiGet } from '../../services/api'
import { CASE_STATUS_LABELS, CASE_TYPE_LABELS } from '../../types/dashboard'
import type { CaseDTO } from '../../types/dashboard'

export function AdminCaseDetailsPage() {
  const { caseId } = useParams<{ caseId: string }>()
  const [c, setC] = useState<CaseDTO | null>(null)
  const [timeline, setTimeline] = useState<unknown[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!caseId) return
    Promise.all([
      apiGet<CaseDTO>(`/cases/${caseId}`),
      apiGet<unknown[]>(`/timeline/case/${caseId}`).catch(() => []),
    ])
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
        <Link to="/admin/cases" className="text-primary text-decoration-none">
          ← Back to All Cases
        </Link>
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
              <p>
                <strong>Type:</strong>{' '}
                {CASE_TYPE_LABELS[(c.caseType as keyof typeof CASE_TYPE_LABELS) || 'OTHER']}
              </p>
              <p>
                <strong>Reporter:</strong>{' '}
                {c.anonymous ? (
                  <Badge bg="secondary">Anonymous</Badge>
                ) : (
                  c.reporterName || '-'
                )}
                {!c.anonymous && c.reporterName && (
                  <span className="text-muted small ms-2">
                    (Admin sees full identity)
                  </span>
                )}
              </p>
              <p>
                <strong>Submitted:</strong>{' '}
                {c.reportDate ? new Date(c.reportDate).toLocaleString() : '-'}
              </p>
              <p>
                <strong>Location:</strong> {c.location || '-'}
              </p>
              <p>
                <strong>Priority:</strong>{' '}
                <Badge bg={c.emergency ? 'danger' : 'secondary'}>
                  {c.emergency ? 'Emergency' : c.priority || 'Medium'}
                </Badge>
              </p>
              <p>
                <strong>Description:</strong>
              </p>
              <p className="text-muted">{c.caseDescription || '-'}</p>
              {c.evidenceUrls && c.evidenceUrls.length > 0 && (
                <div>
                  <strong>Evidence / Documents:</strong>
                  <ul className="mb-0 mt-2">
                    {c.evidenceUrls.map((url, i) => (
                      <li key={i}>
                        <a
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary"
                        >
                          {url.split('/').pop()}
                        </a>
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
                    const it = item as {
                      id?: string
                      message?: string
                      timestamp?: string
                      actor?: string
                    }
                    return (
                      <ListGroup.Item
                        key={it.id || i}
                        className="border-0 border-start border-2 border-primary ps-3"
                      >
                        <small className="text-muted">
                          {it.timestamp
                            ? new Date(it.timestamp).toLocaleString()
                            : '-'}
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
              <h5 className="mb-0">Assignment</h5>
            </Card.Header>
            <Card.Body>
              <p className="text-muted mb-2">
                {c.assignedStationId || c.assignedOfficerId || c.assignedWorkerId
                  ? 'Assigned to police station or social worker'
                  : 'Not yet assigned'}
              </p>
              <Link to="/admin/cases">
                <Button variant="outline-primary" size="sm">
                  Assign / Reassign
                </Button>
              </Link>
            </Card.Body>
          </Card>
        </div>
      </div>
    </div>
  )
}
