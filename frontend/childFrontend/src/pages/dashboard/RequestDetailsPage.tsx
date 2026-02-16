import { useEffect, useState } from 'react'
import { useParams, Link, useLocation } from 'react-router-dom'
import { Card, Badge, Spinner, ListGroup, Button, Form, Modal } from 'react-bootstrap'
import { getUploadBaseUrl } from '../../services/api'
import {
  getHelpRequest,
  getHelpRequestTimeline,
  acceptAppliedPackage,
  rejectAppliedPackage,
  requestServiceAdjustment,
  getAssignedResourcesPublic,
  getFollowUpsPublic,
  type PublicAssignedResourceDTO,
  type UpcomingFollowUpPublicDTO,
} from '../../services/dashboardApi'
import { submitFeedback, getLatestFeedbackForHelpRequest } from '../../services/feedbackApi'
import { REQUEST_STATUS_LABELS, REQUEST_STATUS_BADGE_VARIANTS, HELP_TYPE_LABELS, APPLIED_PACKAGE_STATUS_LABELS } from '../../types/dashboard'
import type { HelpRequestDTO, AppliedPackageStatus, RequestStatus } from '../../types/dashboard'
import type { FeedbackResponseDTO } from '../../types/admin'

const formatDate = (iso?: string) => {
  if (!iso) return '—'
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? '—' : d.toLocaleString()
}

const formatFollowUpDate = (iso?: string) => {
  if (!iso) return '—'
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? '—' : d.toLocaleDateString()
}

const formatFollowUpTime = (iso?: string) => {
  if (!iso) return '—'
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? '—' : d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

const followUpMethodIcon = (method?: string) => {
  const m = String(method ?? '').toUpperCase()
  if (m.includes('PHONE')) return '📞'
  if (m.includes('HOME')) return '🏠'
  if (m.includes('ONLINE') || m.includes('MEETING')) return '💻'
  if (m.includes('HOSPITAL')) return '🏥'
  if (m.includes('OFFICE') || m.includes('DOCUMENT')) return '🏢'
  return '📅'
}

const getPriorityVariant = (priority: unknown) => {
  const p = String(priority ?? '').toUpperCase()
  if (p === 'HIGH') return 'danger'
  if (p === 'MEDIUM') return 'warning'
  if (p === 'LOW') return 'primary'
  return 'secondary'
}

export function RequestDetailsPage() {
  const { requestId } = useParams<{ requestId: string }>()
  const location = useLocation()
  const [r, setR] = useState<HelpRequestDTO | null>(null)
  const [timeline, setTimeline] = useState<unknown[]>([])
  const [loading, setLoading] = useState(true)
  const [packageAccepting, setPackageAccepting] = useState(false)
  const [packageRejecting, setPackageRejecting] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [adjustmentItem, setAdjustmentItem] = useState<string | null>(null)
  const [adjustmentMessage, setAdjustmentMessage] = useState('')
  const [adjustmentSubmitting, setAdjustmentSubmitting] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [showFeedbackModal, setShowFeedbackModal] = useState(false)
  const [feedbackSubmitting, setFeedbackSubmitting] = useState(false)
  const [feedbackError, setFeedbackError] = useState<string | null>(null)
  const [existingFeedback, setExistingFeedback] = useState<FeedbackResponseDTO | null>(null)
  const [feedbackLoading, setFeedbackLoading] = useState(false)
  const [feedbackRating, setFeedbackRating] = useState(5)
  const [feedbackHelpfulness, setFeedbackHelpfulness] = useState('VERY_HELPFUL')
  const [feedbackExpectedHelp, setFeedbackExpectedHelp] = useState('YES')
  const [feedbackBehavior, setFeedbackBehavior] = useState('EXCELLENT')
  const [feedbackRecommend, setFeedbackRecommend] = useState('YES')
  const [feedbackComment, setFeedbackComment] = useState('')
  const [assignedResources, setAssignedResources] = useState<PublicAssignedResourceDTO[]>([])
  const [upcomingFollowUps, setUpcomingFollowUps] = useState<UpcomingFollowUpPublicDTO[]>([])

  const load = () => {
    if (!requestId) return
    setLoadError(null)
    Promise.allSettled([
      getHelpRequest(requestId),
      getHelpRequestTimeline(requestId),
      getAssignedResourcesPublic(requestId),
      getFollowUpsPublic(requestId),
    ])
      .then(([reqRes, tlRes, resourcesRes, followUpsRes]) => {
        if (reqRes.status === 'fulfilled') {
          setR(reqRes.value)
        } else {
          setR(null)
          setLoadError('Unable to load request details. Please try again.')
        }
        if (tlRes.status === 'fulfilled') {
          setTimeline(Array.isArray(tlRes.value) ? tlRes.value : [])
        } else {
          setTimeline([])
        }
        if (resourcesRes.status === 'fulfilled') {
          setAssignedResources(resourcesRes.value)
        } else {
          setAssignedResources([])
        }
        if (followUpsRes.status === 'fulfilled') {
          setUpcomingFollowUps(followUpsRes.value)
        } else {
          setUpcomingFollowUps([])
        }
      })
      .catch(() => {
        setR(null)
        setTimeline([])
        setAssignedResources([])
        setUpcomingFollowUps([])
        setLoadError('Unable to load request details. Please try again.')
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    setLoading(true)
    load()
  }, [requestId])

  useEffect(() => {
    if (!r?.id) return
    const eligibleStatuses: RequestStatus[] = ['COMPLETED', 'CLOSED', 'ARCHIVED']
    const feedbackEligible =
      (!!r.status && eligibleStatuses.includes(r.status)) || !!r.caseFinalized || !!r.allServicesCompleted
    if (!feedbackEligible) {
      setExistingFeedback(null)
      return
    }
    setFeedbackLoading(true)
    getLatestFeedbackForHelpRequest(r.id)
      .then((fb) => setExistingFeedback(fb))
      .catch(() => setExistingFeedback(null))
      .finally(() => setFeedbackLoading(false))
  }, [r?.id, r?.status])

  const pkg = r?.appliedPackage
  const pkgStatus: AppliedPackageStatus | undefined = r?.appliedPackageStatus
  const isPending = !pkgStatus || pkgStatus === 'PENDING'
  const isAccepted = pkgStatus === 'ACCEPTED'
  const isRejected = pkgStatus === 'REJECTED'
  const feedbackEligibleStatuses: RequestStatus[] = ['COMPLETED', 'CLOSED', 'ARCHIVED']
  const isFeedbackEligible =
    (!!r?.status && feedbackEligibleStatuses.includes(r.status)) || !!r?.caseFinalized || !!r?.allServicesCompleted
  const canShowGiveFeedbackButton = isFeedbackEligible && !existingFeedback
  const effectiveRequestStatus: RequestStatus =
    (r?.status === 'COMPLETED' || r?.status === 'CLOSED' || r?.status === 'ARCHIVED')
      ? r.status
      : r?.appliedPackageStatus === 'REJECTED'
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

  const buildFeedbackMessage = () => {
    const lines = [
      `Satisfaction: ${feedbackHelpfulness.replace('_', ' ')}`,
      `Expected help received: ${feedbackExpectedHelp}`,
      `Social worker behavior: ${feedbackBehavior}`,
      `Would recommend: ${feedbackRecommend}`,
    ]
    if (feedbackComment.trim()) {
      lines.push(`Comment: ${feedbackComment.trim()}`)
    }
    return lines.join('\n')
  }

  const handleSubmitFeedback = async () => {
    if (!r?.id) return
    setFeedbackSubmitting(true)
    setFeedbackError(null)
    try {
      const saved = await submitFeedback({
        type: 'HELP_REQUEST',
        helpRequestId: r.id,
        rating: feedbackRating,
        helpfulness: feedbackHelpfulness,
        expectedHelp: feedbackExpectedHelp,
        behavior: feedbackBehavior,
        category: `RECOMMEND_${feedbackRecommend}`,
        message: buildFeedbackMessage(),
      })
      setExistingFeedback(saved)
      setShowFeedbackModal(false)
      setMessage('Feedback submitted successfully. Thank you for your response.')
    } catch (err) {
      setFeedbackError(err instanceof Error ? err.message : 'Failed to submit feedback')
    } finally {
      setFeedbackSubmitting(false)
    }
  }

  useEffect(() => {
    const shouldOpenFromQuery = new URLSearchParams(location.search).get('feedback') === '1'
    if (!shouldOpenFromQuery) return
    if (!isFeedbackEligible || !!existingFeedback || feedbackLoading) return
    setFeedbackError(null)
    setShowFeedbackModal(true)
  }, [location.search, isFeedbackEligible, existingFeedback, feedbackLoading])

  if (loading) {
    return (
      <div className="d-flex justify-content-center py-5">
        <Spinner animation="border" variant="primary" />
      </div>
    )
  }

  if (!r) {
    return (
      <div className="animate-fade-in-up">
        <div className="mb-3">
          <Link to="/dashboard/my-requests" className="text-primary text-decoration-none">Back to My Requests</Link>
        </div>
        <div className="alert alert-warning mb-0">
          {loadError || 'Request details are unavailable right now.'}
        </div>
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
              <p>
                <strong>Priority:</strong>{' '}
                <Badge bg={getPriorityVariant(r.priority)}>
                  {(r.priority || 'MEDIUM').toUpperCase()}
                </Badge>
              </p>
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
                        <a href={`${getUploadBaseUrl()}${url}`} target="_blank" rel="noopener noreferrer">{url.split('/').pop()}</a>
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

                {/* Follow-Up & Execution Plan section removed */}

                {isRejected && (
                  <p className="text-muted small mb-0">You rejected this package. The social worker has been notified and may propose a different plan.</p>
                )}

                {/* When accepted: show service execution status so PU sees "Service Started" etc. */}
                {isAccepted && (pkg?.items?.length ?? 0) > 0 && (() => {
                  const appliedExecutions = ((r as any)?.appliedPackageItemExecutions ?? []) as any[]
                  const executions =
                    appliedExecutions.length > 0
                      ? appliedExecutions
                      : (pkg?.items ?? []).map((s) => ({ serviceItem: s, status: 'PENDING' as const }))

                  return (
                    <div className="mt-3 pt-3 border-top">
                      <h6 className="fw-600 mb-2">Service status</h6>
                      <ul className="list-unstyled mb-0">
                        {executions.map((itemOrExec: any) => {
                          const item = itemOrExec?.serviceItem ?? ''
                          const status = itemOrExec?.status ?? 'PENDING'
                          const label =
                            status === 'IN_PROGRESS'
                              ? 'Service Started'
                              : status === 'COMPLETED'
                                ? 'Completed'
                                : status === 'SCHEDULED'
                                  ? 'Scheduled'
                                  : 'Pending'
                          const variant =
                            status === 'IN_PROGRESS'
                              ? 'primary'
                              : status === 'COMPLETED'
                                ? 'success'
                                : 'secondary'
                          return (
                            <li
                              key={item}
                              className="d-flex align-items-center justify-content-between py-2 border-bottom border-light"
                            >
                              <span>{item}</span>
                              <Badge bg={variant}>{label}</Badge>
                            </li>
                          )
                        })}
                      </ul>
                    </div>
                  )
                })()}

                <div className="mt-3 pt-3 border-top">
                  <h6 className="fw-600 mb-2">🏥 Assigned Resources</h6>
                  {(() => {
                    const fallbackResources = (((r as any)?.appliedPackageItemExecutions ?? []) as any[])
                      .filter((x) => !!x?.assignedResource)
                      .map((x) => ({
                        resourceName: x.assignedResource as string,
                        serviceType: x.serviceItem as string | undefined,
                        contactPhone: '',
                        address: '',
                        emergencySupport: undefined,
                        instructions: x.notes as string | undefined,
                        assignedAt: x.updatedAt as string | undefined,
                      }))
                    const resourcesToShow = assignedResources.length > 0 ? assignedResources : fallbackResources
                    if (resourcesToShow.length === 0) {
                      return <p className="small text-muted mb-0">No assigned resources yet.</p>
                    }
                    return (
                      <div className="d-grid gap-2">
                        {resourcesToShow.map((res, idx) => (
                          <div key={`${res.resourceName ?? 'resource'}-${idx}`} className="border rounded-3 p-3">
                            <div className="fw-600 mb-1">{res.resourceName || 'Assigned Resource'}</div>
                            <div className="small">
                              <div><strong>Service Type:</strong> {res.serviceType || '—'}</div>
                              <div><strong>Contact Phone:</strong> {res.contactPhone || '—'}</div>
                              <div><strong>Location:</strong> {res.address || '—'}</div>
                              <div><strong>Emergency Support:</strong> {res.emergencySupport === true ? 'Yes' : res.emergencySupport === false ? 'No' : '—'}</div>
                              <div><strong>Assigned On:</strong> {formatDate(res.assignedAt)}</div>
                              <div><strong>Instructions:</strong> {res.instructions || '—'}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )
                  })()}
                </div>

                <div className="mt-3 pt-3 border-top">
                  <h6 className="fw-600 mb-2">📅 Upcoming Follow-Up</h6>
                  {upcomingFollowUps.length === 0 ? (
                    <p className="small text-muted mb-0">No follow-up updates yet.</p>
                  ) : (
                    <div className="d-grid gap-2">
                      {upcomingFollowUps.map((fu, idx) => {
                        const status = String(fu.status ?? 'SCHEDULED').toUpperCase()
                        return (
                          <div key={`${fu.scheduledDate}-${idx}`} className="border rounded-3 p-3">
                            <div className="fw-600 mb-1">
                              {followUpMethodIcon(fu.method)} {fu.method || 'Follow-Up'}
                            </div>
                            <div className="small">
                              <div><strong>Date:</strong> {formatFollowUpDate(fu.scheduledDate)}</div>
                              <div><strong>Time:</strong> {formatFollowUpTime(fu.scheduledDate)}</div>
                              <div><strong>Method:</strong> {fu.method || '—'}</div>
                            </div>
                            <div className="small text-muted mt-2">
                              You will be contacted by your Social Worker. Please ensure your phone is reachable.
                            </div>
                            {status === 'COMPLETED' && (
                              <div className="small text-success mt-2">
                                Follow-Up Completed on {formatFollowUpDate(fu.scheduledDate)}.
                              </div>
                            )}
                            {(status === 'MISSED' || status === 'RESCHEDULED') && (
                              <div className="small text-warning mt-2">
                                Follow-Up was rescheduled.
                                {fu.nextScheduledDate ? ` New Date: ${formatFollowUpDate(fu.nextScheduledDate)}.` : ''}
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
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

              {isFeedbackEligible && (
                <div className="mt-4 pt-3 border-top">
                  <h6 className="fw-semibold mb-2">Service Feedback</h6>
                  {feedbackLoading ? (
                    <div className="small text-muted">Checking existing feedback...</div>
                  ) : canShowGiveFeedbackButton ? (
                    <Button
                      variant="warning"
                      className="rounded-pill btn-sm fw-semibold"
                      onClick={() => {
                        setFeedbackError(null)
                        setShowFeedbackModal(true)
                      }}
                    >
                      Give Feedback
                    </Button>
                  ) : (
                    <div className="small text-success">Feedback already submitted. Thank you.</div>
                  )}
                </div>
              )}
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

      {/* Give feedback modal */}
      <Modal show={showFeedbackModal} onHide={() => setShowFeedbackModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Public User Feedback Form</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="mb-3">
            <div className="fw-semibold mb-2">Rating Section</div>
            <div className="d-flex gap-2 flex-wrap">
              {[1, 2, 3, 4, 5].map((n) => (
                <Button
                  key={n}
                  type="button"
                  variant={feedbackRating === n ? 'warning' : 'outline-secondary'}
                  size="sm"
                  onClick={() => setFeedbackRating(n)}
                >
                  {'⭐'.repeat(n)}
                </Button>
              ))}
            </div>
            <div className="small text-muted mt-1">1–5 star</div>
          </div>

          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold">Satisfaction Options</Form.Label>
            <div className="d-flex flex-column gap-1">
              <Form.Check
                type="radio"
                name="feedbackHelpfulness"
                id="helpfulness-very-helpful"
                label="Very Helpful"
                checked={feedbackHelpfulness === 'VERY_HELPFUL'}
                onChange={() => setFeedbackHelpfulness('VERY_HELPFUL')}
              />
              <Form.Check
                type="radio"
                name="feedbackHelpfulness"
                id="helpfulness-helpful"
                label="Helpful"
                checked={feedbackHelpfulness === 'HELPFUL'}
                onChange={() => setFeedbackHelpfulness('HELPFUL')}
              />
              <Form.Check
                type="radio"
                name="feedbackHelpfulness"
                id="helpfulness-neutral"
                label="Neutral"
                checked={feedbackHelpfulness === 'NEUTRAL'}
                onChange={() => setFeedbackHelpfulness('NEUTRAL')}
              />
              <Form.Check
                type="radio"
                name="feedbackHelpfulness"
                id="helpfulness-not-helpful"
                label="Not Helpful"
                checked={feedbackHelpfulness === 'NOT_HELPFUL'}
                onChange={() => setFeedbackHelpfulness('NOT_HELPFUL')}
              />
            </div>
          </Form.Group>

          <div className="fw-semibold mb-2">Questions</div>

          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold">Did you receive the expected help?</Form.Label>
            <div className="d-flex flex-column gap-1">
              <Form.Check
                type="radio"
                name="feedbackExpectedHelp"
                id="expected-help-yes"
                label="Yes"
                checked={feedbackExpectedHelp === 'YES'}
                onChange={() => setFeedbackExpectedHelp('YES')}
              />
              <Form.Check
                type="radio"
                name="feedbackExpectedHelp"
                id="expected-help-partially"
                label="Partially"
                checked={feedbackExpectedHelp === 'PARTIALLY'}
                onChange={() => setFeedbackExpectedHelp('PARTIALLY')}
              />
              <Form.Check
                type="radio"
                name="feedbackExpectedHelp"
                id="expected-help-no"
                label="No"
                checked={feedbackExpectedHelp === 'NO'}
                onChange={() => setFeedbackExpectedHelp('NO')}
              />
            </div>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold">Behavior of Social Worker</Form.Label>
            <div className="d-flex flex-column gap-1">
              <Form.Check
                type="radio"
                name="feedbackBehavior"
                id="behavior-excellent"
                label="Excellent"
                checked={feedbackBehavior === 'EXCELLENT'}
                onChange={() => setFeedbackBehavior('EXCELLENT')}
              />
              <Form.Check
                type="radio"
                name="feedbackBehavior"
                id="behavior-good"
                label="Good"
                checked={feedbackBehavior === 'GOOD'}
                onChange={() => setFeedbackBehavior('GOOD')}
              />
              <Form.Check
                type="radio"
                name="feedbackBehavior"
                id="behavior-average"
                label="Average"
                checked={feedbackBehavior === 'AVERAGE'}
                onChange={() => setFeedbackBehavior('AVERAGE')}
              />
              <Form.Check
                type="radio"
                name="feedbackBehavior"
                id="behavior-poor"
                label="Poor"
                checked={feedbackBehavior === 'POOR'}
                onChange={() => setFeedbackBehavior('POOR')}
              />
            </div>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold">Would you recommend this service?</Form.Label>
            <div className="d-flex flex-column gap-1">
              <Form.Check
                type="radio"
                name="feedbackRecommend"
                id="recommend-yes"
                label="Yes"
                checked={feedbackRecommend === 'YES'}
                onChange={() => setFeedbackRecommend('YES')}
              />
              <Form.Check
                type="radio"
                name="feedbackRecommend"
                id="recommend-no"
                label="No"
                checked={feedbackRecommend === 'NO'}
                onChange={() => setFeedbackRecommend('NO')}
              />
            </div>
          </Form.Group>

          <Form.Group className="mb-2">
            <Form.Label className="fw-semibold">Comment Box</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={feedbackComment}
              onChange={(e) => setFeedbackComment(e.target.value)}
              placeholder="Write your experience (optional)"
            />
          </Form.Group>

          {feedbackError && <div className="alert alert-danger py-2 small mb-0 mt-3">{feedbackError}</div>}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={() => setShowFeedbackModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmitFeedback} disabled={feedbackSubmitting}>
            {feedbackSubmitting ? 'Submitting...' : 'Submit Feedback'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}
