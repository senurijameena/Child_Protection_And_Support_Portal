import { useEffect, useMemo, useState } from 'react'
import { Card, Container, Badge, Button, Row, Col, Form, Modal } from 'react-bootstrap'
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom'
import {
  getHelpRequest,
  getMyFollowUps,
  getUserProfile,
  getServicePackages,
  updateRequestStatus,
  applyServicePackageToRequest,
  type FollowUpDTO,
} from '../../services/socialWorkerApi'
import type { ServicePackageDTO } from '../../types/dashboard'
import type { HelpRequestDTO, HelpType, AppliedPackageStatus } from '../../types/dashboard'
import { HELP_TYPE_LABELS, APPLIED_PACKAGE_STATUS_LABELS } from '../../types/dashboard'
import './SocialWorkerDashboard.css'

const formatDateTime = (iso?: string) => {
  if (!iso) return ''
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleString()
}

const getHelpTypeIcon = (type?: HelpType) => {
  switch (type) {
    case 'FOOD_ASSISTANCE':
      return '🥗'
    case 'EDUCATION_SUPPORT':
      return '🎓'
    case 'MEDICAL_HELP':
      return '⚕️'
    case 'SHELTER':
      return '🏠'
    case 'CLOTHING':
      return '👕'
    case 'COUNSELING':
      return '🗣️'
    case 'LEGAL_PROTECTION':
      return '⚖️'
    case 'LIVELIHOOD_EMPLOYMENT':
      return '💼'
    case 'DISABILITY_SUPPORT':
      return '♿'
    case 'EMERGENCY_DISASTER':
      return '🚨'
    default:
      return '📂'
  }
}

const getPriorityVariant = (priority?: string) => {
  const p = priority?.toUpperCase()
  if (p === 'HIGH') return 'danger'
  if (p === 'MEDIUM') return 'warning'
  if (p === 'LOW') return 'primary'
  return 'secondary'
}

const getStatusVariantAndLabel = (
  status?: string,
  isOverdue?: boolean
): { variant: string; label: string } => {
  if (isOverdue) {
    return { variant: 'danger', label: 'Overdue' }
  }
  switch (status) {
    case 'ASSIGNED':
      return { variant: 'info', label: 'Assigned' }
    case 'PACKAGE_PROPOSED':
      return { variant: 'warning', label: 'Package Proposed' }
    case 'PACKAGE_REJECTED':
      return { variant: 'danger', label: 'Package Rejected' }
    case 'IN_PROGRESS':
      return { variant: 'success', label: 'In Progress' }
    case 'REQUESTED':
    case 'UNDER_REVIEW':
      return { variant: 'warning', label: 'Waiting' }
    case 'COMPLETED':
      return { variant: 'secondary', label: 'Completed' }
    default:
      return { variant: 'light', label: status || 'Unknown' }
  }
}

export function SocialWorkerRequestDetailsPage() {
  const { requestId } = useParams<{ requestId: string }>()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const applyPackageId = searchParams.get('applyPackage')

  const [request, setRequest] = useState<HelpRequestDTO | null>(null)
  const [followUps, setFollowUps] = useState<FollowUpDTO[]>([])
  const [userProfile, setUserProfile] = useState<{
    fullName?: string
    email?: string
    phone?: string
    address?: string
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Apply existing package modal
  const [showApplyModal, setShowApplyModal] = useState(false)
  const [availablePackages, setAvailablePackages] = useState<ServicePackageDTO[]>([])
  const [selectedPackageId, setSelectedPackageId] = useState<string>('')
  const [applyPackageLoading, setApplyPackageLoading] = useState(false)
  const [applyPackageMessage, setApplyPackageMessage] = useState<string | null>(null)
  const [closeRequestLoading, setCloseRequestLoading] = useState(false)

  useEffect(() => {
    if (applyPackageId) setShowApplyModal(true)
  }, [applyPackageId])

  useEffect(() => {
    if (!showApplyModal) return
    const load = async () => {
      try {
        const all = await getServicePackages({ status: 'PUBLISHED' })
        setAvailablePackages(all)
        setSelectedPackageId((prev) => {
          if (applyPackageId && all.some((p) => p.id === applyPackageId)) return applyPackageId
          if (all.length > 0) return all[0].id
          return prev
        })
      } catch (err) {
        console.error('Failed to load packages', err)
      }
    }
    void load()
  }, [showApplyModal, applyPackageId])

  const handleApplyPackage = async () => {
    if (!selectedPackageId || !requestId) return
    setApplyPackageLoading(true)
    setApplyPackageMessage(null)
    try {
      const updated = await applyServicePackageToRequest(requestId, selectedPackageId)
      setRequest(updated)
      setApplyPackageMessage('Service package applied. Sent to Public User for approval.')
      setTimeout(() => {
        setShowApplyModal(false)
        setApplyPackageMessage(null)
      }, 1500)
    } catch (err) {
      setApplyPackageMessage((err as Error).message ?? 'Failed to apply package')
    } finally {
      setApplyPackageLoading(false)
    }
  }

  const handleCloseRequest = async () => {
    if (!requestId) return
    setCloseRequestLoading(true)
    try {
      const updated = await updateRequestStatus(requestId, 'CANCELLED')
      setRequest(updated)
    } catch (err) {
      console.error('Failed to close request', err)
    } finally {
      setCloseRequestLoading(false)
    }
  }

  useEffect(() => {
    if (!requestId) {
      setLoading(false)
      setError('Missing request ID')
      return
    }

    let isMounted = true

    const load = async () => {
      try {
        setLoading(true)
        const [req, allFollowUps] = await Promise.all([
          getHelpRequest(requestId),
          getMyFollowUps(),
        ])
        if (!isMounted) return
        setRequest(req)
        setFollowUps(allFollowUps.filter((fu) => fu.helpRequestId === req.id))

        // Fetch user profile if not anonymous
        if (req.requesterUserId && !req.anonymous) {
          try {
            const profile = await getUserProfile(req.requesterUserId)
            if (isMounted) {
              setUserProfile(profile)
            }
          } catch (profileErr) {
            console.error('Failed to load user profile', profileErr)
            // Don't fail the whole page if profile fails
          }
        }

        setError(null)
      } catch (err) {
        console.error('Failed to load help request', err)
        if (isMounted) {
          setError((err as Error).message ?? 'Failed to load request')
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    load()

    return () => {
      isMounted = false
    }
  }, [requestId])

  const earliestDueDate = useMemo(() => {
    if (!followUps.length) return undefined
    const sorted = [...followUps]
      .filter((fu) => fu.scheduledDate)
      .sort((a, b) => {
        const aTime = a.scheduledDate ? new Date(a.scheduledDate).getTime() : 0
        const bTime = b.scheduledDate ? new Date(b.scheduledDate).getTime() : 0
        return aTime - bTime
      })
    return sorted[0]?.scheduledDate
  }, [followUps])

  const isOverdue = useMemo(() => {
    if (!earliestDueDate) return false
    const due = new Date(earliestDueDate)
    if (Number.isNaN(due.getTime())) return false
    const now = new Date()
    return due < now && !followUps.some((fu) => fu.status === 'COMPLETED' || fu.status === 'DONE')
  }, [earliestDueDate, followUps])

  if (loading && !request) {
    return (
      <Container fluid className="py-4 sw-dashboard">
        <Row>
          <Col xs={12}>
            <Card className="sw-card border-0">
              <Card.Body className="p-5 text-center text-muted">
                Loading request details...
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    )
  }

  if (!request) {
    return (
      <Container fluid className="py-4 sw-dashboard">
        <Row className="mb-3">
          <Col xs={12}>
            <Link
              to="/social-worker/requests"
              className="btn btn-link text-decoration-none mb-2 p-0"
            >
              ← Back to Assigned Requests
            </Link>
            {error && <div className="alert alert-danger small mb-0">{error}</div>}
          </Col>
        </Row>
      </Container>
    )
  }

  const effectiveStatus =
    request.appliedPackageStatus === 'REJECTED'
      ? 'PACKAGE_REJECTED'
      : request.appliedPackageStatus === 'ACCEPTED'
        ? 'IN_PROGRESS'
        : request.appliedPackage && (!request.appliedPackageStatus || request.appliedPackageStatus === 'PENDING')
          ? 'PACKAGE_PROPOSED'
          : request.status
  const { variant: statusVariant, label: statusLabel } = getStatusVariantAndLabel(
    effectiveStatus,
    isOverdue
  )
  const pkgStatus: AppliedPackageStatus | undefined = request.appliedPackageStatus
  const packageStatusLabel = pkgStatus ? APPLIED_PACKAGE_STATUS_LABELS[pkgStatus] : 'Pending Approval'
  const packageStatusVariant =
    pkgStatus === 'ACCEPTED' ? 'success' : pkgStatus === 'REJECTED' ? 'danger' : 'warning'

  const helpIcon = getHelpTypeIcon(request.helpType)
  const helpLabel = request.helpType ? HELP_TYPE_LABELS[request.helpType] : 'Support request'

  return (
    <Container fluid className="py-4 sw-dashboard">
      <Row className="mb-3">
        <Col xs={12} className="d-flex justify-content-between align-items-start flex-wrap gap-2">
          <div>
            <button
              type="button"
              className="btn btn-link text-decoration-none mb-2 p-0"
              onClick={() => navigate('/social-worker/requests')}
            >
              ← Back to Assigned Requests
            </button>
            <div className="d-flex flex-column">
              <span className="small text-muted">Request ID</span>
              <h2 className="h4 fw-700 mb-1">
                #{request.trackingId ?? request.id}
              </h2>
              <p className="mb-0 text-muted">
                {request.description || 'No short description available.'}
              </p>
            </div>
          </div>
          <div className="d-flex flex-column align-items-end gap-2">
            <div className="d-flex flex-wrap gap-2 justify-content-end">
              <Badge bg={statusVariant} className="px-3 py-2">
                {statusLabel}
              </Badge>
              <Badge bg={getPriorityVariant(request.priority)} className="px-3 py-2">
                Priority: {request.priority?.toUpperCase() ?? 'MEDIUM'}
              </Badge>
            </div>
            <div className="d-flex flex-wrap gap-2 justify-content-end">
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={() => window.print()}
              >
                Print
              </Button>
              <Button
                variant="outline-secondary"
                size="sm"
              // TODO: Wire to export handler
              >
                Export
              </Button>
            </div>
          </div>
        </Col>
      </Row>

      <Row className="g-4">
        {/* Left: Request details and service package */}
        <Col xs={12} lg={8}>
          {/* Help Request Description / Details Panel */}
          <Card className="sw-card border-0 mb-4">
            <Card.Header className="bg-white border-0 pt-4 pb-3">
              <h5 className="mb-0 fw-700">Help Request Details</h5>
            </Card.Header>
            <Card.Body>
              <Row className="mb-3">
                <Col xs={12} md={6}>
                  <div className="mb-2 small text-muted">Type of request</div>
                  <div className="d-flex align-items-center gap-2 fw-600">
                    <span>{helpIcon}</span>
                    <span>{helpLabel}</span>
                  </div>
                </Col>
                <Col xs={12} md={6}>
                  <div className="mb-2 small text-muted">Submitted on</div>
                  <div className="fw-500">
                    {formatDateTime(request.requestDate) || 'Not specified'}
                  </div>
                </Col>
              </Row>
              <div className="mb-3">
                <div className="mb-2 small text-muted">Description</div>
                <div
                  className="p-3 rounded-3 bg-light bg-opacity-50 small"
                  style={{ maxHeight: '200px', overflowY: 'auto' }}
                >
                  {request.description || 'No detailed description provided.'}
                </div>
              </div>
              <Row className="mb-3">
                <Col xs={12} md={6}>
                  <div className="mb-2 small text-muted">Location</div>
                  <div className="fw-500">
                    {request.location || 'Not specified'}
                  </div>
                </Col>
                <Col xs={12} md={6}>
                  <div className="mb-2 small text-muted">Follow-up due</div>
                  <div className="fw-500">
                    {earliestDueDate ? formatDateTime(earliestDueDate) : 'No follow-up scheduled'}
                  </div>
                </Col>
              </Row>
              <div className="mb-3">
                <div className="mb-2 small text-muted">Attachments</div>
                {request.documentUrls && request.documentUrls.length > 0 ? (
                  <ul className="mb-0 small">
                    {request.documentUrls.map((url, idx) => (
                      <li key={url} className="mb-1">
                        <a
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-decoration-none"
                        >
                          Attachment {idx + 1}
                        </a>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="small text-muted">No attachments uploaded.</div>
                )}
              </div>
            </Card.Body>
          </Card>

          {/* 📦 Applied Service Package Panel – appears after package is applied */}
          {request.appliedPackage && (
            <Card className="sw-card border-0 mb-4 border-primary border-2">
              <Card.Header className="bg-white border-0 pt-4 pb-3">
                <h5 className="mb-0 fw-700">📦 Applied Service Package</h5>
              </Card.Header>
              <Card.Body>
                {/* A. Package Overview Card (Top Summary) */}
                <Card className="border-0 bg-light bg-opacity-50 mb-3">
                  <Card.Body className="py-3">
                    <div className="d-flex flex-wrap justify-content-between align-items-start gap-2 mb-2">
                      <h6 className="mb-0 fw-700">{request.appliedPackage.title}</h6>
                      <Badge bg={packageStatusVariant}>{packageStatusLabel}</Badge>
                    </div>
                    {request.appliedPackage.description && (
                      <p className="small text-muted mb-2">{request.appliedPackage.description}</p>
                    )}
                    <Row className="g-2 small">
                      <Col xs={6} md={3}>
                        <span className="text-muted">Total services:</span>{' '}
                        <span className="fw-600">{request.appliedPackage.items?.length ?? 0}</span>
                      </Col>
                      <Col xs={6} md={3}>
                        <span className="text-muted">Duration:</span>{' '}
                        <span className="fw-600">{request.appliedPackage.estimatedDuration ?? '—'}</span>
                      </Col>
                      <Col xs={6} md={3}>
                        <span className="text-muted">Applied date:</span>{' '}
                        <span className="fw-600">
                          {request.appliedPackageAppliedAt
                            ? formatDateTime(request.appliedPackageAppliedAt)
                            : '—'}
                        </span>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>
                {/* Scenario A: User Accepted – Request status In Progress, each service Pending Execution, SW action buttons */}
                {pkgStatus === 'ACCEPTED' && (
                  <div className="mt-3">
                    <h6 className="fw-600 mb-2">Services – Execution</h6>
                    <p className="small text-muted mb-3">Request status: In Progress. Each service is pending execution. Use the actions below.</p>
                    <ul className="list-unstyled mb-0">
                      {(request.appliedPackage?.items ?? []).map((item) => (
                        <li key={item} className="d-flex flex-wrap align-items-center justify-content-between py-2 border-bottom border-light gap-2">
                          <span className="fw-500">{item}</span>
                          <Badge bg="secondary" className="me-2">Pending Execution</Badge>
                          <div className="d-flex flex-wrap gap-1">
                            <Button variant="outline-success" size="sm">Start Service</Button>
                            <Button variant="outline-primary" size="sm">Assign Resource</Button>
                            <Button variant="outline-info" size="sm">Add Follow-up</Button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Scenario B: Pending (adjustment need) – can Revise or Apply different package */}
                {(!pkgStatus || pkgStatus === 'PENDING') && (
                  <div className="mt-3">
                    <p className="small text-muted mb-2">Waiting for public user to accept or reject this package.</p>
                    <p className="small text-muted mb-2">If the user requested <strong>adjustments</strong>, you can:</p>
                    <div className="d-flex flex-wrap gap-2">
                      <Button variant="outline-primary" size="sm" onClick={() => setShowApplyModal(true)}>
                        Revise package
                      </Button>
                      <Button variant="outline-secondary" size="sm" onClick={() => setShowApplyModal(true)}>
                        Apply different package
                      </Button>
                    </div>
                  </div>
                )}

                {/* Scenario C: Fully Rejected – Request status Package Rejected, SW can Revise / Apply different / Close */}
                {pkgStatus === 'REJECTED' && (
                  <div className="mt-3">
                    <p className="small text-muted mb-2">The public user rejected this package. Request status: <strong>Package Rejected</strong>.</p>
                    <p className="small fw-600 mb-2">You can:</p>
                    <div className="d-flex flex-wrap gap-2">
                      <Button variant="outline-primary" size="sm" onClick={() => setShowApplyModal(true)}>
                        Revise package
                      </Button>
                      <Button variant="outline-secondary" size="sm" onClick={() => setShowApplyModal(true)}>
                        Apply different package
                      </Button>
                      <Button variant="outline-danger" size="sm" onClick={handleCloseRequest} disabled={closeRequestLoading}>
                        {closeRequestLoading ? 'Closing…' : 'Close request'}
                      </Button>
                    </div>
                  </div>
                )}
              </Card.Body>
            </Card>
          )}

          {/* Apply Service Package – when no package applied yet */}
          {!request.appliedPackage && (
            <div className="mb-3">
              <Button
                variant="outline-success"
                size="sm"
                onClick={() => setShowApplyModal(true)}
              >
                ➕ Apply Service Package
              </Button>
            </div>
          )}
        </Col>

        {/* Right: Public User / Requester Info */}
        <Col xs={12} lg={4}>
          <Card className="sw-card border-0 mb-4">
            <Card.Header className="bg-white border-0 pt-4 pb-3">
              <h5 className="mb-0 fw-700">Public User Details</h5>
            </Card.Header>
            <Card.Body>
              {request.anonymous ? (
                <div className="text-center py-4">
                  <div className="mb-3">
                    <span style={{ fontSize: '3rem' }}>🔒</span>
                  </div>
                  <h6 className="fw-600 mb-2">Anonymous Request</h6>
                  <p className="small text-muted mb-0">
                    This user has chosen to remain anonymous. Personal details are not available.
                  </p>
                </div>
              ) : (
                <>
                  <div className="mb-3">
                    <div className="mb-1 small text-muted">Full Name</div>
                    <div className="fw-500">
                      {userProfile?.fullName || request.requesterName || 'Not provided'}
                    </div>
                  </div>
                  <div className="mb-3">
                    <div className="mb-1 small text-muted">Email</div>
                    <div className="fw-500">
                      {userProfile?.email || 'Not provided'}
                    </div>
                  </div>
                  <div className="mb-3">
                    <div className="mb-1 small text-muted">Phone</div>
                    <div className="fw-500">
                      {userProfile?.phone || 'Not provided'}
                    </div>
                  </div>
                  <div className="mb-3">
                    <div className="mb-1 small text-muted">Address</div>
                    <div className="fw-500">
                      {userProfile?.address || request.location || 'Not provided'}
                    </div>
                  </div>
                  <div className="mb-3">
                    <div className="mb-1 small text-muted">Request Location</div>
                    <div className="fw-500">
                      {request.location || 'Not specified'}
                    </div>
                  </div>
                </>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Apply Service Package Modal */}
      <Modal show={showApplyModal} onHide={() => setShowApplyModal(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>Apply Service Package</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="text-muted small mb-3">
            Select an Active package to apply to this help request. The public user will receive it for approval.
          </p>
          <Form.Group className="mb-3">
            <Form.Label>Select package</Form.Label>
            <Form.Select
              value={selectedPackageId}
              onChange={(e) => setSelectedPackageId(e.target.value)}
            >
              <option value="">Choose a package…</option>
              {availablePackages.map((pkg) => (
                <option key={pkg.id} value={pkg.id}>
                  {pkg.title} ({pkg.items?.length ?? 0} services)
                </option>
              ))}
            </Form.Select>
          </Form.Group>
          {selectedPackageId && (
            <div className="mb-3">
              <h6 className="fw-600 mb-2">Preview included services</h6>
              {(() => {
                const pkg = availablePackages.find((p) => p.id === selectedPackageId)
                if (!pkg?.items?.length) return <div className="small text-muted">No items.</div>
                return (
                  <ul className="mb-0 ps-3 small">
                    {pkg.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                )
              })()}
            </div>
          )}
          {applyPackageMessage && (
            <div className={`alert small mb-0 ${applyPackageMessage.includes('Failed') ? 'alert-danger' : 'alert-success'}`}>
              {applyPackageMessage}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={() => setShowApplyModal(false)}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleApplyPackage}
            disabled={!selectedPackageId || applyPackageLoading}
          >
            {applyPackageLoading ? 'Sending…' : 'Send to Public User for Approval'}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  )
}
