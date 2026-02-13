import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Card, Badge, Spinner, ListGroup, Button, Form, Alert } from 'react-bootstrap'
import { apiGet, getUploadBaseUrl } from '../../services/api'
import { CASE_STATUS_BADGE_VARIANTS, CASE_STATUS_LABELS, CASE_TYPE_LABELS } from '../../types/dashboard'
import type { CaseDTO } from '../../types/dashboard'
import type { PoliceStationDTO } from '../../types/admin'
import { assignCaseToStation, getAllPoliceStations, updateCaseStatus } from '../../services/adminApi'

export function AdminCaseDetailsPage() {
  const { caseId } = useParams<{ caseId: string }>()
  const [c, setC] = useState<CaseDTO | null>(null)
  const [timeline, setTimeline] = useState<unknown[]>([])
  const [loading, setLoading] = useState(true)
  const [stations, setStations] = useState<PoliceStationDTO[]>([])
  const [assignStationId, setAssignStationId] = useState('')
  const [assignLoading, setAssignLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

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

  useEffect(() => {
    getAllPoliceStations().then(setStations).catch(() => setStations([]))
  }, [])

  const refreshCase = async () => {
    if (!caseId) return
    const latest = await apiGet<CaseDTO>(`/cases/${caseId}`)
    setC(latest)
  }

  const handleAccept = async () => {
    if (!c || !caseId) return
    setActionLoading(true)
    setSuccessMessage(null)
    try {
      await updateCaseStatus(caseId, 'UNDER_REVIEW')
      await refreshCase()
      setSuccessMessage('Case accepted. You can now assign a police station.')
    } catch (e) {
       
      alert(e instanceof Error ? e.message : 'Failed to accept case')
    } finally {
      setActionLoading(false)
    }
  }

  const handleReject = async () => {
    if (!c || !caseId || !rejectReason.trim()) return
    setActionLoading(true)
    setSuccessMessage(null)
    try {
      await updateCaseStatus(caseId, 'REJECTED')
      await refreshCase()
      setSuccessMessage('Case rejected. The case is now read-only.')
    } catch (e) {
       
      alert(e instanceof Error ? e.message : 'Failed to reject case')
    } finally {
      setActionLoading(false)
    }
  }

  const handleAssign = async () => {
    if (!c || !caseId || !assignStationId) return
    setAssignLoading(true)
    setSuccessMessage(null)
    try {
      // Assign to selected police station
      await assignCaseToStation(caseId, assignStationId)
      // Ensure status is explicitly marked as ASSIGNED after assignment
      await updateCaseStatus(caseId, 'ASSIGNED')
      await refreshCase()
      setSuccessMessage('Case assigned to the selected police station and marked as Assigned.')
    } catch (e) {
       
      alert(e instanceof Error ? e.message : 'Failed to assign case')
    } finally {
      setAssignLoading(false)
    }
  }

  const isFinalized =
    c?.status === 'REJECTED' || c?.status === 'RESOLVED' || c?.status === 'CLOSED' || c?.status === 'CANCELLED'

  const canShowAdminActions = c?.status === 'REPORTED'
  const canShowAssignSection = c?.status === 'UNDER_REVIEW'

  if (loading || !c) {
    return (
      <div className="d-flex justify-content-center py-5">
        <Spinner animation="border" variant="primary" />
      </div>
    )
  }

  return (
    <div className="animate-fade-in-up">
      <div className="d-flex align-items-center justify-content-between mb-3">
        <Link
          to="/admin/cases"
          className="btn btn-outline-secondary btn-sm"
        >
          ← Back to All Cases
        </Link>
        <div className="text-end">
          <h2 className="h4 fw-bold mb-0">
            Case {c.trackingId || c.id}
          </h2>
          <Badge
            bg={CASE_STATUS_BADGE_VARIANTS[(c.status as keyof typeof CASE_STATUS_BADGE_VARIANTS) || 'REPORTED']}
            className="mt-1"
          >
            {CASE_STATUS_LABELS[(c.status as keyof typeof CASE_STATUS_LABELS) || 'REPORTED']}
          </Badge>
        </div>
      </div>
      {successMessage && (
        <Alert variant="success" className="mb-3">
          {successMessage}
        </Alert>
      )}
      <div className="row g-4">
        <div className="col-lg-8">
          <Card className="border-0 shadow-sm rounded-4 mb-4">
            <Card.Header className="bg-white border-0 pt-3">
              <h5 className="mb-0">Case Details</h5>
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
                <strong>Submitted Date:</strong>{' '}
                {c.reportDate ? new Date(c.reportDate).toLocaleString() : '-'}
              </p>
              <p>
                <strong>Approximate Age:</strong> {c.approximateAge || '-'}
              </p>
              <p>
                <strong>Gender:</strong> {c.gender || '-'}
              </p>
              <p>
                <strong>Location:</strong> {c.location || '-'}
              </p>
              <p>
                <strong>Description:</strong>
              </p>
              <p className="text-muted">{c.caseDescription || '-'}</p>
              {c.physicalIdentificationMarks && (
                <div className="mt-3 p-3 bg-light rounded-3">
                  <h6 className="mb-2">Physical Identification Marks</h6>
                  <p className="text-muted mb-0">{c.physicalIdentificationMarks}</p>
                </div>
              )}
              {c.lastSeenDressDetails && (
                <div className="mt-3 p-3 bg-light rounded-3">
                  <h6 className="mb-2">Last Seen Dress Details</h6>
                  <p className="text-muted mb-0">{c.lastSeenDressDetails}</p>
                </div>
              )}
              {c.photographUrl && (
                <div className="mt-3 p-3 bg-light rounded-3">
                  <h6 className="mb-2">Child's Photograph</h6>
                  <img src={`${getUploadBaseUrl()}${c.photographUrl}`} alt="Child photograph" style={{ maxWidth: '200px', maxHeight: '200px', borderRadius: '8px' }} />
                </div>
              )}
              {c.evidenceUrls && c.evidenceUrls.length > 0 && (
                <div className="mt-4">
                  <h6 className="mb-1">Evidence</h6>
                  <div className="text-muted small mb-2">Read-only evidence uploaded by the reporter</div>
                  <div className="d-flex flex-wrap gap-3">
                    {c.evidenceUrls.map((url, i) => {
                      const fullUrl = `${getUploadBaseUrl()}${url}`
                      const lower = url.toLowerCase()
                      const isImage =
                        lower.endsWith('.jpg') ||
                        lower.endsWith('.jpeg') ||
                        lower.endsWith('.png') ||
                        lower.endsWith('.gif') ||
                        lower.endsWith('.webp')
                      const isPdf = lower.endsWith('.pdf')
                      const label = url.split('/').pop() || `Evidence ${i + 1}`
                      return (
                        <Card key={url} style={{ width: 180 }} className="border-0 shadow-sm">
                          {isImage ? (
                            <a href={fullUrl} target="_blank" rel="noopener noreferrer">
                              <img
                                src={fullUrl}
                                alt={label}
                                className="card-img-top"
                                style={{ maxHeight: 120, objectFit: 'cover' }}
                              />
                            </a>
                          ) : (
                            <div className="p-3 text-center">
                              <span className="d-block mb-2">{isPdf ? 'PDF Document' : 'File'}</span>
                            </div>
                          )}
                          <Card.Body className="py-2 px-3">
                            <div className="small text-truncate" title={label}>
                              {label}
                            </div>
                            <a
                              href={fullUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="small text-primary d-block mt-1"
                            >
                              View
                            </a>
                          </Card.Body>
                        </Card>
                      )
                    })}
                  </div>
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
              <h5 className="mb-0">Admin Actions</h5>
            </Card.Header>
            <Card.Body>
              <p className="text-muted small">
                Decisions are only available inside this case view. Once rejected or closed, the case becomes read-only.
              </p>
              {canShowAdminActions && (
                <>
                  <div className="d-flex flex-column gap-2 mb-3">
                    <Button
                      variant="success"
                      size="sm"
                      disabled={actionLoading || isFinalized}
                      onClick={handleAccept}
                    >
                      Accept Case
                    </Button>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      disabled={actionLoading || isFinalized || !rejectReason.trim()}
                      onClick={handleReject}
                    >
                      Reject Case
                    </Button>
                  </div>
                  <Form.Group className="mb-3">
                    <Form.Label className="small">Rejection reason (required to reject)</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      placeholder="Provide a clear reason explaining why this case is being rejected."
                      disabled={isFinalized}
                    />
                  </Form.Group>
                </>
              )}
              {canShowAssignSection && (
                <>
                  <hr />
                  <h6>Assign Police Station</h6>
                  <p className="text-muted small">
                    After accepting the case, select a primary police station to handle it.
                  </p>
                  <Form.Group className="mb-2">
                    <Form.Label className="small">Police Station</Form.Label>
                    <Form.Select
                      value={assignStationId}
                      onChange={(e) => setAssignStationId(e.target.value)}
                      disabled={isFinalized}
                    >
                      <option value="">Select station...</option>
                      {stations.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.stationName} {s.district ? `- ${s.district}` : ''}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                  <Button
                    variant="primary"
                    size="sm"
                    className="mt-2"
                    disabled={assignLoading || !assignStationId || isFinalized}
                    onClick={handleAssign}
                  >
                    {assignLoading ? 'Assigning...' : 'Assign Station'}
                  </Button>
                </>
              )}
              {!canShowAdminActions && !canShowAssignSection && (
                <p className="text-muted small mb-0">
                  No further admin actions are available for this status.
                </p>
              )}
            </Card.Body>
          </Card>
        </div>
      </div>

    </div>
  )
}
