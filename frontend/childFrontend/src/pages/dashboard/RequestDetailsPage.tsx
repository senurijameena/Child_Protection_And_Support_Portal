import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Card, Badge, Spinner, ListGroup, Button, Form, Modal } from 'react-bootstrap'
import {
  getHelpRequest,
  getHelpRequestTimeline,
  acceptAppliedPackage,
  rejectAppliedPackage,
  submitPackageFollowUp,
  requestServiceAdjustment,
} from '../../services/dashboardApi'
import { REQUEST_STATUS_LABELS, REQUEST_STATUS_BADGE_VARIANTS, HELP_TYPE_LABELS, APPLIED_PACKAGE_STATUS_LABELS } from '../../types/dashboard'
import type { HelpRequestDTO, AppliedPackageStatus, RequestStatus } from '../../types/dashboard'

const formatDate = (iso?: string) => {
  if (!iso) return '—'
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? '—' : d.toLocaleString()
}

type FollowUpType = 'VISIT' | 'CALL' | 'SESSION'

const FOLLOW_UP_TYPE_LABELS: Record<FollowUpType, string> = {
  VISIT: 'Visit',
  CALL: 'Call',
  SESSION: 'Session',
}

export function RequestDetailsPage() {
  const { requestId } = useParams<{ requestId: string }>()
  const [r, setR] = useState<HelpRequestDTO | null>(null)
  const [timeline, setTimeline] = useState<unknown[]>([])
  const [loading, setLoading] = useState(true)
  const [packageAccepting, setPackageAccepting] = useState(false)
  const [packageRejecting, setPackageRejecting] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [followUpDate, setFollowUpDate] = useState('')
  const [followUpType, setFollowUpType] = useState<FollowUpType>('VISIT')
  const [followUpNotes, setFollowUpNotes] = useState('')
  const [followUpSubmitting, setFollowUpSubmitting] = useState(false)
  const [adjustmentItem, setAdjustmentItem] = useState<string | null>(null)
  const [adjustmentMessage, setAdjustmentMessage] = useState('')
  const [adjustmentSubmitting, setAdjustmentSubmitting] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const load = () => {
    if (!requestId) return
    Promise.all([getHelpRequest(requestId), getHelpRequestTimeline(requestId)])
      .then(([req, tl]) => {
        setR(req)
        setTimeline(Array.isArray(tl) ? tl : [])
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    setLoading(true)
    load()
  }, [requestId])

  const pkg = r?.appliedPackage
  const pkgStatus: AppliedPackageStatus | undefined = r?.appliedPackageStatus
  const isPending = !pkgStatus || pkgStatus === 'PENDING'
  const isAccepted = pkgStatus === 'ACCEPTED'
  const isRejected = pkgStatus === 'REJECTED'
  const effectiveRequestStatus: RequestStatus =
    r?.appliedPackageStatus === 'REJECTED'
      ? 'PACKAGE_REJECTED'
      : r?.appliedPackageStatus === 'ACCEPTED'
        ? 'IN_PROGRESS'
        : r?.appliedPackage && (!r.appliedPackageStatus || r.appliedPackageStatus === 'PENDING')
          ? 'PACKAGE_PROPOSED'
          : (r?.status as RequestStatus) ?? 'REQUESTED'

  const handleAcceptAll = async () => {
    if (!requestId) return
    setPackageAccepting(true)
    setMessage(null)
    try {
      const updated = await acceptAppliedPackage(requestId)
      setR(updated)
      setMessage('Package accepted. Help Details have been updated. Please add your follow-up schedule below.')
      load()
    } catch (err) {
      setMessage((err as Error).message ?? 'Failed to accept package.')
    } finally {
      setPackageAccepting(false)
    }
  }

  const handleRejectAll = async () => {
    if (!requestId) return
    setPackageRejecting(true)
    setMessage(null)
    try {
      const updated = await rejectAppliedPackage(requestId, rejectReason)
      setR(updated)
      setShowRejectModal(false)
      setRejectReason('')
      setMessage('Package rejected. Help Details have been updated. The social worker has been notified.')
      load()
    } catch (err) {
      setMessage((err as Error).message ?? 'Failed to reject package.')
    } finally {
      setPackageRejecting(false)
    }
  }

  const handleSubmitFollowUp = async () => {
    if (!requestId || !followUpDate.trim()) return
    setFollowUpSubmitting(true)
    setMessage(null)
    try {
      const updated = await submitPackageFollowUp(requestId, {
        followUpDate: new Date(followUpDate).toISOString(),
        followUpType,
        notes: followUpNotes.trim() || undefined,
      })
      setR(updated)
      setMessage('Follow-up submitted. Help Details have been updated. The social worker has been notified.')
      load()
    } catch (err) {
      setMessage((err as Error).message ?? 'Failed to submit follow-up.')
    } finally {
      setFollowUpSubmitting(false)
    }
  }

  const handleRequestAdjustment = async () => {
    if (!requestId || !adjustmentItem || !adjustmentMessage.trim()) return
    setAdjustmentSubmitting(true)
    setMessage(null)
    try {
      await requestServiceAdjustment(requestId, adjustmentItem, adjustmentMessage.trim())
      setAdjustmentItem(null)
      setAdjustmentMessage('')
      setMessage('Adjustment request sent. Help Details have been updated. The social worker will be notified.')
      load()
    } catch (err) {
      setMessage((err as Error).message ?? 'Failed to send adjustment request.')
    } finally {
      setAdjustmentSubmitting(false)
    }
  }

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
        <Badge bg={REQUEST_STATUS_BADGE_VARIANTS[effectiveRequestStatus] ?? 'light'} className="ms-2">
          {REQUEST_STATUS_LABELS[effectiveRequestStatus]}
        </Badge>
      </h2>

      {message && (
        <div className={`alert mb-3 ${message.includes('Failed') ? 'alert-danger' : 'alert-success'}`}>
          {message}
        </div>
      )}

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

          {/* 📦 Service Package Proposal – Public User Response Flow */}
          {pkg && (
            <Card className="border-0 shadow-sm rounded-4 mb-4 border-primary border-2">
              <Card.Header className="bg-white border-0 pt-4 pb-3">
                <h5 className="mb-1 fw-700">📦 Service Package Proposal</h5>
                <p className="text-muted small mb-0">
                  Your social worker has proposed this package. Choose <strong>Accept</strong>, <strong>Reject</strong>, or <strong>Request adjustment</strong> per service. After you submit, this Help Details page updates automatically.
                </p>
              </Card.Header>
              <Card.Body>
                {/* Package name */}
                <h6 className="fw-700 mb-1">{pkg.title}</h6>
                {/* Description */}
                {pkg.description && (
                  <p className="small text-muted mb-3">{pkg.description}</p>
                )}
                <div className="d-flex flex-wrap align-items-center gap-2 mb-3 small">
                  <Badge
                    bg={
                      pkgStatus === 'ACCEPTED'
                        ? 'success'
                        : pkgStatus === 'REJECTED'
                          ? 'danger'
                          : 'warning'
                    }
                  >
                    {pkgStatus ? APPLIED_PACKAGE_STATUS_LABELS[pkgStatus] : 'Pending your response'}
                  </Badge>
                  <span className="text-muted">Duration: {pkg.estimatedDuration ?? '—'}</span>
                  <span className="text-muted">Applied: {formatDate(r.appliedPackageAppliedAt)}</span>
                </div>

                {/* List of services with checkboxes + Request Adjustment per service */}
                <h6 className="fw-600 mb-2">List of services</h6>
                <ul className="list-unstyled mb-4">
                  {(pkg.items ?? []).map((item) => (
                    <li key={item} className="d-flex align-items-center justify-content-between py-2 border-bottom border-light">
                      <label className="d-flex align-items-center gap-2 mb-0">
                        <Form.Check
                          type="checkbox"
                          defaultChecked
                          disabled={isAccepted || isRejected}
                          aria-label={`Include ${item}`}
                        />
                        <span>{item}</span>
                      </label>
                      {isPending && (
                        <Button
                          variant="outline-secondary"
                          size="sm"
                          onClick={() => setAdjustmentItem(item)}
                        >
                          ✏️ Request adjustment
                        </Button>
                      )}
                    </li>
                  ))}
                </ul>

                {/* Checkbox options: Accept | Reject | Request Adjustment (per service) */}
                {isPending && (
                  <>
                    <h6 className="fw-600 mb-2">Your options</h6>
                    <div className="d-flex flex-wrap gap-2 mb-3">
                      <Button
                        variant="success"
                        onClick={handleAcceptAll}
                        disabled={packageAccepting || packageRejecting}
                      >
                        {packageAccepting ? 'Accepting…' : '✅ Accept'}
                      </Button>
                      <Button
                        variant="outline-danger"
                        onClick={() => setShowRejectModal(true)}
                        disabled={packageAccepting || packageRejecting}
                      >
                        ❌ Reject
                      </Button>
                      <span className="small text-muted align-self-center">
                        Or use <strong>Request adjustment</strong> above for any service.
                      </span>
                    </div>
                    <p className="small text-muted mb-0">
                      After you submit, the Help Details page updates automatically.
                    </p>
                  </>
                )}

                {/* Follow-Up & Execution Plan – after acceptance */}
                {isAccepted && (
                  <div className="mt-4 p-3 rounded-3 bg-light">
                    <h6 className="fw-600 mb-2">Follow-Up &amp; Execution Plan</h6>
                    <p className="small text-muted mb-3">
                      Add your preferred follow-up schedule. It will be auto-marked in the calendar and the social worker will be notified.
                    </p>
                    <Form>
                      <Form.Group className="mb-3">
                        <Form.Label className="small">Date</Form.Label>
                        <Form.Control
                          type="datetime-local"
                          value={followUpDate}
                          onChange={(e) => setFollowUpDate(e.target.value)}
                        />
                      </Form.Group>
                      <Form.Group className="mb-3">
                        <Form.Label className="small">Type</Form.Label>
                        <Form.Select
                          value={followUpType}
                          onChange={(e) => setFollowUpType(e.target.value as FollowUpType)}
                        >
                          {(Object.keys(FOLLOW_UP_TYPE_LABELS) as FollowUpType[]).map((t) => (
                            <option key={t} value={t}>{FOLLOW_UP_TYPE_LABELS[t]}</option>
                          ))}
                        </Form.Select>
                        <Form.Text className="text-muted">Visit / Call / Session</Form.Text>
                      </Form.Group>
                      <Form.Group className="mb-3">
                        <Form.Label className="small">Notes (optional)</Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={2}
                          placeholder="Any special instructions or preferences"
                          value={followUpNotes}
                          onChange={(e) => setFollowUpNotes(e.target.value)}
                        />
                      </Form.Group>
                      <Button
                        variant="primary"
                        onClick={handleSubmitFollowUp}
                        disabled={followUpSubmitting || !followUpDate.trim()}
                      >
                        {followUpSubmitting ? 'Submitting…' : 'Submit follow-up schedule'}
                      </Button>
                    </Form>
                    <p className="small text-muted mt-2 mb-0">
                      Once submitted, status will update on the Help Details page and the social worker will be notified.
                    </p>
                    <p className="small text-muted mt-2 mb-0">
                      <strong>Service execution after approval:</strong> After you accept and submit your follow-up, the package items move into execution and tracking. The social worker will coordinate delivery.
                    </p>
                  </div>
                )}

                {isRejected && (
                  <p className="text-muted small mb-0">You rejected this package. The social worker has been notified and may propose a different plan.</p>
                )}
              </Card.Body>
            </Card>
          )}

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

      {/* Reject package modal */}
      <Modal show={showRejectModal} onHide={() => setShowRejectModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Reject service package</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>Reason (optional)</Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              placeholder="Let the social worker know why you're rejecting"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={() => setShowRejectModal(false)}>Cancel</Button>
          <Button variant="danger" onClick={handleRejectAll} disabled={packageRejecting}>
            {packageRejecting ? 'Rejecting…' : 'Reject all'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Request adjustment modal */}
      <Modal show={!!adjustmentItem} onHide={() => setAdjustmentItem(null)} centered>
        <Modal.Header closeButton>
          <Modal.Title>✏️ Request adjustment</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {adjustmentItem && (
            <>
              <p className="small text-muted mb-2">Service: <strong>{adjustmentItem}</strong></p>
              <Form.Group>
                <Form.Label>Your message</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  placeholder="Describe what you'd like to change or request"
                  value={adjustmentMessage}
                  onChange={(e) => setAdjustmentMessage(e.target.value)}
                />
              </Form.Group>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={() => setAdjustmentItem(null)}>Cancel</Button>
          <Button
            variant="primary"
            onClick={handleRequestAdjustment}
            disabled={adjustmentSubmitting || !adjustmentMessage.trim()}
          >
            {adjustmentSubmitting ? 'Sending…' : 'Send request'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}
