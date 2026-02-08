import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  Card,
  Badge,
  Spinner,
  Button,
  Form,
  Modal,
  ListGroup,
  Tab,
  Tabs,
} from 'react-bootstrap'
import {
  getHelpRequest,
  getHelpRequestTimeline,
  getOffersByHelpRequest,
  acceptHelpRequest,
  declineHelpRequest,
  updateRequestStatus,
  updateRequestNotes,
  uploadRequestDocument,
  createServiceOffer,
  requestHelpRequestTransfer,
  getAvailableSocialWorkers,
  getTransfersForHelpRequest,
} from '../../services/socialWorkerApi'
import type { HelpRequestDTO, ServiceOfferDTO } from '../../types/dashboard'
import { REQUEST_STATUS_LABELS, HELP_TYPE_LABELS } from '../../types/dashboard'
import type { RequestStatus } from '../../types/dashboard'

const STATUS_FLOW: RequestStatus[] = ['ASSIGNED', 'IN_PROGRESS', 'COMPLETED']

export function SocialWorkerRequestDetailsPage() {
  const { requestId } = useParams<{ requestId: string }>()
  const [r, setR] = useState<HelpRequestDTO | null>(null)
  const [timeline, setTimeline] = useState<unknown[]>([])
  const [offers, setOffers] = useState<ServiceOfferDTO[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [notes, setNotes] = useState('')
  const [showDeclineModal, setShowDeclineModal] = useState(false)
  const [declineReason, setDeclineReason] = useState('')
  const [showOfferModal, setShowOfferModal] = useState(false)
  const [offerDetails, setOfferDetails] = useState('')
  const [offerType, setOfferType] = useState('')
  const [offerDate, setOfferDate] = useState('')
  const [showCompletionModal, setShowCompletionModal] = useState(false)
  const [completionSummary, setCompletionSummary] = useState('')
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [checklist, setChecklist] = useState<{ id: string; label: string; done: boolean }[]>([])
  const [newChecklistItem, setNewChecklistItem] = useState('')
  const [selectedServiceTypes, setSelectedServiceTypes] = useState<string[]>([])
  const [showTransferModal, setShowTransferModal] = useState(false)
  const [transferTargetId, setTransferTargetId] = useState('')
  const [transferReason, setTransferReason] = useState('')
  const [workers, setWorkers] = useState<Array<{ userId: string; fullName: string }>>([])
  const [transfers, setTransfers] = useState<{ id: string; status?: string }[]>([])

  const DEFAULT_CHECKLIST = [
    { id: '1', label: 'Call user to confirm', done: false },
    { id: '2', label: 'Schedule visit/session', done: false },
    { id: '3', label: 'Complete session notes', done: false },
    { id: '4', label: 'Submit report', done: false },
  ]

  const loadData = () => {
    if (!requestId) return
    setLoading(true)
    Promise.all([
      getHelpRequest(requestId),
      getHelpRequestTimeline(requestId),
      getOffersByHelpRequest(requestId),
      getTransfersForHelpRequest(requestId).catch(() => []),
    ])
      .then(([req, tl, off, tr]) => {
        setR(req)
        setTimeline(Array.isArray(tl) ? tl : [])
        setOffers(off)
        setTransfers(Array.isArray(tr) ? tr : [])
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadData()
  }, [requestId])

  useEffect(() => {
    if (requestId) {
      try {
        const stored = localStorage.getItem(`sw-checklist-${requestId}`)
        setChecklist(stored ? JSON.parse(stored) : DEFAULT_CHECKLIST)
      } catch {
        setChecklist(DEFAULT_CHECKLIST)
      }
    }
  }, [requestId])

  const saveChecklist = (items: { id: string; label: string; done: boolean }[]) => {
    if (requestId) {
      localStorage.setItem(`sw-checklist-${requestId}`, JSON.stringify(items))
      setChecklist(items)
    }
  }

  const toggleChecklistItem = (id: string) => {
    const next = checklist.map((c) => (c.id === id ? { ...c, done: !c.done } : c))
    saveChecklist(next)
  }

  const addChecklistItem = () => {
    if (!newChecklistItem.trim()) return
    const next = [...checklist, { id: Date.now().toString(), label: newChecklistItem.trim(), done: false }]
    saveChecklist(next)
    setNewChecklistItem('')
  }

  const openTransferModal = () => {
    setShowTransferModal(true)
    setTransferTargetId('')
    setTransferReason('')
    getAvailableSocialWorkers().then(setWorkers).catch(() => setWorkers([]))
  }

  const handleRequestTransfer = async () => {
    if (!requestId || !transferTargetId || !transferReason.trim()) return
    setActionLoading(true)
    try {
      await requestHelpRequestTransfer({
        helpRequestId: requestId,
        requestedAssigneeId: transferTargetId,
        reason: transferReason.trim(),
      })
      setShowTransferModal(false)
      loadData()
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Failed to request transfer')
    } finally {
      setActionLoading(false)
    }
  }

  const handleAccept = async () => {
    if (!requestId) return
    setActionLoading(true)
    try {
      await acceptHelpRequest(requestId)
      loadData()
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Failed to accept')
    } finally {
      setActionLoading(false)
    }
  }

  const handleDecline = async () => {
    if (!requestId || !declineReason.trim()) {
      alert('Reason is required')
      return
    }
    setActionLoading(true)
    try {
      await declineHelpRequest(requestId, declineReason.trim())
      loadData()
      setShowDeclineModal(false)
      setDeclineReason('')
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Failed to decline')
    } finally {
      setActionLoading(false)
    }
  }

  const handleStatusUpdate = async (status: RequestStatus) => {
    if (!requestId) return
    setActionLoading(true)
    try {
      await updateRequestStatus(requestId, status)
      loadData()
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Failed to update status')
    } finally {
      setActionLoading(false)
    }
  }

  const handleAddNotes = async () => {
    if (!requestId || !notes.trim()) return
    setActionLoading(true)
    try {
      await updateRequestNotes(requestId, notes.trim())
      setNotes('')
      loadData()
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Failed to add notes')
    } finally {
      setActionLoading(false)
    }
  }

  const handleUpload = async () => {
    if (!requestId || !uploadFile) return
    setActionLoading(true)
    try {
      await uploadRequestDocument(requestId, uploadFile)
      setUploadFile(null)
      loadData()
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Failed to upload')
    } finally {
      setActionLoading(false)
    }
  }

  const handleCreateOffer = async () => {
    const services = selectedServiceTypes.length > 0 ? selectedServiceTypes : (offerType ? [offerType] : [])
    const details = selectedServiceTypes.length > 1
      ? `Custom package: ${services.map((s) => HELP_TYPE_LABELS[s as keyof typeof HELP_TYPE_LABELS]).join(' + ')}. ${offerDetails.trim()}`
      : offerDetails.trim()
    if (!r || !r.requesterUserId || !details || (services.length === 0 && !offerType)) {
      alert('Service type and details are required')
      return
    }
    setActionLoading(true)
    try {
      await createServiceOffer({
        helpRequestId: r.id,
        offeredToUserId: r.requesterUserId,
        serviceType: services[0] || offerType,
        serviceDetails: details,
        scheduledDateTime: offerDate || undefined,
      })
      setShowOfferModal(false)
      setOfferDetails('')
      setOfferType('')
      setOfferDate('')
      setSelectedServiceTypes([])
      loadData()
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Failed to create offer')
    } finally {
      setActionLoading(false)
    }
  }

  const handleCompletionReport = async () => {
    if (!requestId || !completionSummary.trim()) {
      alert('Completion summary is required')
      return
    }
    setActionLoading(true)
    try {
      await updateRequestNotes(requestId, `[Completion Report] ${completionSummary.trim()}`)
      await updateRequestStatus(requestId, 'COMPLETED')
      setShowCompletionModal(false)
      setCompletionSummary('')
      loadData()
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Failed to submit')
    } finally {
      setActionLoading(false)
    }
  }

  if (loading || !r) {
    return (
      <div className="d-flex justify-content-center py-5">
        <Spinner animation="border" style={{ color: '#2d6a4f' }} />
      </div>
    )
  }

  const canAccept = r.status === 'ASSIGNED'
  const canDecline = r.status === 'ASSIGNED'
  const canUpdateStatus = r.status === 'ASSIGNED' || r.status === 'IN_PROGRESS'
  const canAddNotes = r.status === 'IN_PROGRESS' || r.status === 'COMPLETED'
  const canCreateOffer = r.requesterUserId && (r.status === 'IN_PROGRESS' || r.status === 'ASSIGNED')
  const canSubmitCompletion = r.status === 'IN_PROGRESS'

  const nextStatus =
    r.status === 'ASSIGNED'
      ? 'IN_PROGRESS'
      : r.status === 'IN_PROGRESS'
        ? 'COMPLETED'
        : null

  return (
    <div className="animate-fade-in-up">
      <div className="mb-3">
        <Link
          to="/social-worker/requests"
          className="text-decoration-none"
          style={{ color: '#2d6a4f' }}
        >
          ← Back to Requests
        </Link>
      </div>

      <div className="d-flex flex-wrap justify-content-between align-items-start gap-3 mb-4">
        <h2 className="h4 fw-bold mb-0">
          {r.trackingId || r.id}
          <Badge
            bg={
              r.status === 'ASSIGNED'
                ? 'warning'
                : r.status === 'IN_PROGRESS'
                  ? 'info'
                  : 'success'
            }
            className="ms-2"
          >
            {REQUEST_STATUS_LABELS[(r.status as keyof typeof REQUEST_STATUS_LABELS) || 'REQUESTED']}
          </Badge>
        </h2>
        <div className="d-flex gap-2 flex-wrap">
          {canAccept && (
            <Button
              className="sw-btn-primary"
              onClick={handleAccept}
              disabled={actionLoading}
            >
              Accept & Start
            </Button>
          )}
          {canDecline && (
            <Button
              variant="outline-danger"
              onClick={() => setShowDeclineModal(true)}
              disabled={actionLoading}
            >
              Decline
            </Button>
          )}
          {canUpdateStatus && nextStatus && (
            <Button
              className="sw-btn-primary"
              onClick={() => handleStatusUpdate(nextStatus)}
              disabled={actionLoading}
            >
              Set to {REQUEST_STATUS_LABELS[nextStatus]}
            </Button>
          )}
          {canSubmitCompletion && (
            <Button
              className="sw-btn-primary"
              onClick={() => setShowCompletionModal(true)}
              disabled={actionLoading}
            >
              Submit Completion Report
            </Button>
          )}
          {r.requesterUserId && (
            <Link
              to={`/social-worker/messages?request=${r.id}&participant=${r.requesterUserId}`}
              className="btn btn-outline-secondary"
            >
              Message User
            </Link>
          )}
          <Button
            variant="outline-secondary"
            onClick={() => window.print()}
          >
            Export / Print
          </Button>
          {(r.status === 'IN_PROGRESS' || r.status === 'ASSIGNED') && transfers.filter((t) => t.status === 'PENDING').length === 0 && (
            <Button variant="outline-warning" onClick={openTransferModal}>
              Request Transfer
            </Button>
          )}
        </div>
      </div>

      <Tabs defaultActiveKey="details" className="mb-3">
        <Tab eventKey="details" title="Details">
          <div className="row g-4 mt-2">
            <div className="col-lg-8">
              <Card className="border-0 shadow-sm rounded-3 mb-4">
                <Card.Header className="bg-white border-0 pt-3">
                  <h5 className="mb-0">Request Details</h5>
                </Card.Header>
                <Card.Body>
                  <p><strong>Type:</strong> {HELP_TYPE_LABELS[(r.helpType as keyof typeof HELP_TYPE_LABELS) || 'OTHER']}</p>
                  <p><strong>Requester:</strong>{' '}
                    {r.anonymous ? (
                      <Badge bg="secondary">Anonymous (identity masked)</Badge>
                    ) : (
                      r.requesterName || 'Requester'
                    )}
                  </p>
                  <p><strong>Submitted:</strong> {r.requestDate ? new Date(r.requestDate).toLocaleString() : '-'}</p>
                  <p><strong>Location:</strong> {r.location || '-'}</p>
                  <p><strong>Priority:</strong> <Badge bg={r.priority === 'HIGH' ? 'danger' : 'secondary'}>{r.priority || 'MEDIUM'}</Badge></p>
                  <p><strong>Description:</strong></p>
                  <p className="text-muted">{r.description || '-'}</p>
                  {r.documentUrls && r.documentUrls.length > 0 && (
                    <div>
                      <strong>Documents:</strong>
                      <ul className="mb-0 mt-2">
                        {r.documentUrls.map((url: string, idx: number) => (
                          <li key={idx}>
                            <button
                              type="button"
                              className="btn btn-link p-0 text-primary text-decoration-none"
                              onClick={() => setPreviewUrl(url)}
                            >
                              {url.split('/').pop()}
                            </button>
                            <a href={url} target="_blank" rel="noopener noreferrer" className="ms-2 small">
                              Download
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </Card.Body>
              </Card>

              {(canAddNotes || r.status !== 'REQUESTED') && (
                <Card className="border-0 shadow-sm rounded-3 mb-4">
                  <Card.Header className="bg-white border-0 pt-3">
                    <h5 className="mb-0">Follow-Up Checklist</h5>
                  </Card.Header>
                  <Card.Body>
                    <p className="text-muted small mb-2">Track actions to ensure nothing is missed.</p>
                    <div className="mb-2">
                      {checklist.map((item) => (
                        <div key={item.id} className="form-check">
                          <input
                            type="checkbox"
                            className="form-check-input"
                            id={`check-${item.id}`}
                            checked={item.done}
                            onChange={() => toggleChecklistItem(item.id)}
                          />
                          <label className={`form-check-label ${item.done ? 'text-decoration-line-through text-muted' : ''}`} htmlFor={`check-${item.id}`}>
                            {item.label}
                          </label>
                        </div>
                      ))}
                    </div>
                    <div className="d-flex gap-2">
                      <Form.Control
                        size="sm"
                        placeholder="Add action..."
                        value={newChecklistItem}
                        onChange={(e) => setNewChecklistItem(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && addChecklistItem()}
                      />
                      <Button size="sm" className="sw-btn-primary" onClick={addChecklistItem}>Add</Button>
                    </div>
                  </Card.Body>
                </Card>
              )}

              {canAddNotes && (
                <Card className="border-0 shadow-sm rounded-3 mb-4">
                  <Card.Header className="bg-white border-0 pt-3">
                    <h5 className="mb-0">Session Notes (confidential)</h5>
                  </Card.Header>
                  <Card.Body>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      placeholder="Add session notes..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="mb-2"
                    />
                    <Button className="sw-btn-primary" onClick={handleAddNotes} disabled={!notes.trim() || actionLoading}>
                      Add Note
                    </Button>
                  </Card.Body>
                </Card>
              )}

              {canAddNotes && (
                <Card className="border-0 shadow-sm rounded-3 mb-4">
                  <Card.Header className="bg-white border-0 pt-3">
                    <h5 className="mb-0">Attach Document</h5>
                  </Card.Header>
                  <Card.Body>
                    <Form.Control
                      type="file"
                      onChange={(e) => setUploadFile((e.target as HTMLInputElement).files?.[0] || null)}
                      className="mb-2"
                    />
                    <Button className="sw-btn-primary" onClick={handleUpload} disabled={!uploadFile || actionLoading}>
                      Upload
                    </Button>
                  </Card.Body>
                </Card>
              )}

              {timeline.length > 0 && (
                <Card className="border-0 shadow-sm rounded-3">
                  <Card.Header className="bg-white border-0 pt-3">
                    <h5 className="mb-0">Timeline</h5>
                  </Card.Header>
                  <Card.Body>
                    <ListGroup variant="flush">
                      {timeline.map((item, i) => {
                        const it = item as { id?: string; message?: string; timestamp?: string; actor?: string }
                        return (
                          <ListGroup.Item key={it.id || i} className="border-0 border-start border-2 ps-3" style={{ borderColor: '#2d6a4f' }}>
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
              <Card className="border-0 shadow-sm rounded-3">
                <Card.Header className="bg-white border-0 pt-3">
                  <h5 className="mb-0">Milestone Tracker</h5>
                </Card.Header>
                <Card.Body>
                  <div className="mb-2">
                    <div className="d-flex align-items-start justify-content-between position-relative">
                      {STATUS_FLOW.map((s, idx) => {
                        const currentIdx = STATUS_FLOW.indexOf(r.status as RequestStatus)
                        const isDone = currentIdx > idx || (currentIdx === idx && (r.status === 'COMPLETED' || r.status === 'REJECTED'))
                        const isCurrent = r.status === s
                        return (
                          <div key={s} className="d-flex flex-column align-items-center" style={{ flex: 1 }}>
                            <div
                              className="rounded-circle d-flex align-items-center justify-content-center mb-1"
                              style={{
                                width: 32,
                                height: 32,
                                backgroundColor: isDone || isCurrent ? '#2d6a4f' : '#e5e7eb',
                                color: isDone || isCurrent ? '#fff' : '#9ca3af',
                                fontSize: 12,
                                fontWeight: 600,
                              }}
                            >
                              {isDone ? '✓' : idx + 1}
                            </div>
                            <span className={`small text-center ${isCurrent ? 'fw-bold' : ''}`} style={{ color: isDone || isCurrent ? '#2d6a4f' : '#9ca3af' }}>
                              {REQUEST_STATUS_LABELS[s]}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                    <div className="mt-2">
                      <div className="progress" style={{ height: 6 }}>
                        <div
                          className="progress-bar"
                          style={{
                            width: `${Math.min(100, ((STATUS_FLOW.indexOf(r.status as RequestStatus) + 1) / STATUS_FLOW.length) * 100)}%`,
                            backgroundColor: '#2d6a4f',
                          }}
                        />
                      </div>
                    </div>
                    {r.requestDate && (
                      <div className="mt-2 small text-muted">
                        Started: {new Date(r.requestDate).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                  {transfers.some((t) => t.status === 'PENDING') && (
                    <Badge bg="warning" className="mt-2">Transfer pending</Badge>
                  )}
                </Card.Body>
              </Card>

              {canCreateOffer && (
                <Card className="border-0 shadow-sm rounded-3 mt-3">
                  <Card.Header className="bg-white border-0 pt-3">
                    <h5 className="mb-0">Service Packages</h5>
                  </Card.Header>
                  <Card.Body>
                    <Button
                      className="sw-btn-primary w-100 mb-2"
                      onClick={() => setShowOfferModal(true)}
                      disabled={actionLoading}
                    >
                      Create Service Offer
                    </Button>
                    {offers.length > 0 && (
                      <div className="small">
                        {offers.map((o) => (
                          <div key={o.id} className="py-2 border-bottom">
                            <Badge bg={o.status === 'PENDING' ? 'warning' : o.status === 'ACCEPTED' ? 'success' : 'secondary'}>
                              {o.status}
                            </Badge>
                            <div className="text-muted">{o.serviceDetails?.slice(0, 60)}...</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </Card.Body>
                </Card>
              )}
            </div>
          </div>
        </Tab>
      </Tabs>

      <Modal show={showDeclineModal} onHide={() => setShowDeclineModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Decline Request</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="text-muted small">A mandatory reason will be sent to the admin.</p>
          <Form.Control as="textarea" rows={3} value={declineReason} onChange={(e) => setDeclineReason(e.target.value)} placeholder="Reason..." />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeclineModal(false)}>Cancel</Button>
          <Button variant="danger" onClick={handleDecline} disabled={!declineReason.trim() || actionLoading}>
            Decline
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showOfferModal} onHide={() => setShowOfferModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Create Service Offer</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-2">
            <Form.Label>Custom Package (optional)</Form.Label>
            <p className="text-muted small mb-1">Combine multiple services for a personalized package.</p>
            <div className="d-flex flex-wrap gap-2">
              {Object.entries(HELP_TYPE_LABELS).map(([k, v]) => (
                <Form.Check
                  key={k}
                  type="checkbox"
                  id={`offer-${k}`}
                  label={v}
                  checked={selectedServiceTypes.includes(k)}
                  onChange={(e) => {
                    if (e.target.checked) setSelectedServiceTypes([...selectedServiceTypes, k])
                    else setSelectedServiceTypes(selectedServiceTypes.filter((s) => s !== k))
                  }}
                />
              ))}
            </div>
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Label>Or Single Service Type</Form.Label>
            <Form.Select value={offerType} onChange={(e) => setOfferType(e.target.value)}>
              <option value="">Select...</option>
              {Object.entries(HELP_TYPE_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </Form.Select>
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Label>Details</Form.Label>
            <Form.Control as="textarea" rows={3} value={offerDetails} onChange={(e) => setOfferDetails(e.target.value)} placeholder="Describe the service package, duration, scope..." />
          </Form.Group>
          <Form.Group>
            <Form.Label>Scheduled Date (optional)</Form.Label>
            <Form.Control type="datetime-local" value={offerDate} onChange={(e) => setOfferDate(e.target.value)} />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowOfferModal(false)}>Cancel</Button>
          <Button
            className="sw-btn-primary"
            onClick={handleCreateOffer}
            disabled={(!offerType && selectedServiceTypes.length === 0) || !offerDetails.trim() || actionLoading}
          >
            Create Offer
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={!!previewUrl} onHide={() => setPreviewUrl(null)} size="xl">
        <Modal.Header closeButton>
          <Modal.Title>Document Preview</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-0" style={{ minHeight: 400 }}>
          {previewUrl && (() => {
            const base = (import.meta.env.VITE_API_URL as string)?.replace(/\/api\/?$/, '') || 'http://localhost:8080'
            const fullUrl = previewUrl.startsWith('http') ? previewUrl : `${base}${previewUrl.startsWith('/') ? '' : '/'}${previewUrl}`
            return (
              <div className="p-3">
                {previewUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                  <img src={fullUrl} alt="Preview" style={{ maxWidth: '100%', maxHeight: 500 }} />
                ) : previewUrl.match(/\.pdf$/i) ? (
                  <iframe src={fullUrl} title="PDF" style={{ width: '100%', height: 500 }} />
                ) : (
                  <p className="text-muted">Preview not available. <a href={fullUrl} target="_blank" rel="noopener noreferrer">Download</a></p>
                )}
              </div>
            )
          })()}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setPreviewUrl(null)}>Close</Button>
          {previewUrl && (() => {
            const base = (import.meta.env.VITE_API_URL as string)?.replace(/\/api\/?$/, '') || 'http://localhost:8080'
            const fullUrl = previewUrl.startsWith('http') ? previewUrl : `${base}${previewUrl.startsWith('/') ? '' : '/'}${previewUrl}`
            return (
              <a href={fullUrl} target="_blank" rel="noopener noreferrer" className="btn sw-btn-primary">
                Download
              </a>
            )
          })()}
        </Modal.Footer>
      </Modal>

      <Modal show={showTransferModal} onHide={() => setShowTransferModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Request Transfer</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="text-muted small mb-3">
            A mandatory reason will be sent to the admin. The request will be reassigned upon approval.
          </p>
          <Form.Group className="mb-2">
            <Form.Label>Transfer To</Form.Label>
            <Form.Select value={transferTargetId} onChange={(e) => setTransferTargetId(e.target.value)}>
              <option value="">Select social worker...</option>
              {workers.map((w) => (
                <option key={w.userId} value={w.userId}>{w.fullName}</option>
              ))}
            </Form.Select>
          </Form.Group>
          <Form.Group>
            <Form.Label>Reason (required)</Form.Label>
            <Form.Control as="textarea" rows={3} value={transferReason} onChange={(e) => setTransferReason(e.target.value)} placeholder="Explain why this transfer is needed..." />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowTransferModal(false)}>Cancel</Button>
          <Button
            className="sw-btn-primary"
            onClick={handleRequestTransfer}
            disabled={!transferTargetId || !transferReason.trim() || actionLoading}
          >
            {actionLoading ? 'Submitting...' : 'Submit Request'}
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showCompletionModal} onHide={() => setShowCompletionModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Submit Completion Report</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="text-muted small">Final service summary sent to admin for closure and analytics.</p>
          <Form.Control as="textarea" rows={4} value={completionSummary} onChange={(e) => setCompletionSummary(e.target.value)} placeholder="Summarize outcomes, services delivered, and recommendations..." />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCompletionModal(false)}>Cancel</Button>
          <Button className="sw-btn-primary" onClick={handleCompletionReport} disabled={!completionSummary.trim() || actionLoading}>
            Submit
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}
