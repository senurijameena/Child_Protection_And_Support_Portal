import { useEffect, useMemo, useState } from 'react'
import { Card, Container, Badge, Button, Row, Col, Form, Modal } from 'react-bootstrap'
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom'
import { getUploadBaseUrl } from '../../services/api'
import {
  getHelpRequest,
  getMyFollowUps,
  getUserProfile,
  getServicePackages,
  updateRequestStatus,
  applyServicePackageToRequest,
  updateServiceItemStatus,
  assignServiceItemResource,
  getHelpRequestTimeline,
  createHelpRequestTimelineNote,
  createFollowUp,
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

type TimelineItem = {
  id?: string
  message?: string
  timestamp?: string
  actor?: string
}

type AssignmentResourceType = 'HOSPITAL' | 'SHELTER' | 'NGO' | 'LEGAL' | 'OTHER'
type AssignmentAvailability = 'AVAILABLE' | 'BUSY' | 'FULL'

interface AssignmentResource {
  id: string
  name: string
  type: AssignmentResourceType
  location: string
  availability: AssignmentAvailability
  verified: boolean
  contactPhone?: string
  contactEmail?: string
}

const ASSIGNMENT_RESOURCE_TYPE_LABELS: Record<AssignmentResourceType, string> = {
  HOSPITAL: 'Hospital',
  SHELTER: 'Shelter',
  NGO: 'NGO',
  LEGAL: 'Legal',
  OTHER: 'Other',
}

const ASSIGNMENT_AVAILABILITY_LABELS: Record<AssignmentAvailability, string> = {
  AVAILABLE: 'Available',
  BUSY: 'Busy',
  FULL: 'Full',
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
  const [timeline, setTimeline] = useState<TimelineItem[]>([])

  // Apply existing package modal
  const [showApplyModal, setShowApplyModal] = useState(false)
  const [availablePackages, setAvailablePackages] = useState<ServicePackageDTO[]>([])
  const [selectedPackageId, setSelectedPackageId] = useState<string>('')
  const [applyPackageLoading, setApplyPackageLoading] = useState(false)
  const [applyPackageMessage, setApplyPackageMessage] = useState<string | null>(null)
  const [closeRequestLoading, setCloseRequestLoading] = useState(false)
  const [serviceActionLoading, setServiceActionLoading] = useState<string | null>(null)
  const [startServiceModal, setStartServiceModal] = useState<{ item: string } | null>(null)
  const [startServiceDate, setStartServiceDate] = useState('')
  const [startServiceNotes, setStartServiceNotes] = useState('')
  const [assignResourceModal, setAssignResourceModal] = useState<{ item: string } | null>(null)
  const [resourceSearch, setResourceSearch] = useState('')
  const [resourceTypeFilter, setResourceTypeFilter] = useState<'ALL' | AssignmentResourceType>('ALL')
  const [resourceAvailabilityFilter, setResourceAvailabilityFilter] = useState<'ALL' | AssignmentAvailability>('ALL')
  const [resourceVerifiedOnly, setResourceVerifiedOnly] = useState(false)
  const [selectedResourceId, setSelectedResourceId] = useState<string | null>(null)
  const [assignExpectedDate, setAssignExpectedDate] = useState('')
  const [assignNotes, setAssignNotes] = useState('')
  const [assignSendNotification, setAssignSendNotification] = useState(true)
  const [assignLoading, setAssignLoading] = useState(false)
  const [assignError, setAssignError] = useState<string | null>(null)
  const [assignmentResources, setAssignmentResources] = useState<AssignmentResource[]>([])
  const [followUpModal, setFollowUpModal] = useState<{ item?: string } | null>(null)
  const [followUpDate, setFollowUpDate] = useState('')
  const [followUpMode, setFollowUpMode] = useState<'PHONE' | 'VISIT' | 'ONLINE' | 'FIELD'>('PHONE')
  const [followUpResolved, setFollowUpResolved] = useState<boolean | null>(null)
  const [followUpNotes, setFollowUpNotes] = useState('')
  const [followUpSubmitting, setFollowUpSubmitting] = useState(false)
  const [followUpError, setFollowUpError] = useState<string | null>(null)
  const [expectedCompletionDate, setExpectedCompletionDate] = useState('')
  const [resourcesAssigned, setResourcesAssigned] = useState(false)
  const [startServiceError, setStartServiceError] = useState<string | null>(null)

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
        const [req, allFollowUps, tl] = await Promise.all([
          getHelpRequest(requestId),
          getMyFollowUps(),
          getHelpRequestTimeline(requestId),
        ])
        if (!isMounted) return
        setRequest(req)
        setFollowUps(allFollowUps.filter((fu) => fu.helpRequestId === req.id))
        setTimeline(Array.isArray(tl) ? tl : [])

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

  useEffect(() => {
    // Load latest resources from the same storage used by SocialWorkerLibraryPage
    try {
      const raw = localStorage.getItem('sw_resources')
      if (!raw) {
        setAssignmentResources([])
        return
      }
      const parsed = JSON.parse(raw)
      if (!Array.isArray(parsed)) {
        setAssignmentResources([])
        return
      }
      const mapped: AssignmentResource[] = parsed.map((r: any) => ({
        id: r.id,
        name: r.name,
        type: r.type,
        location: r.location,
        availability: r.availability,
        // Treat emergencySupport as "verified" for now
        verified: !!r.emergencySupport,
        contactPhone: r.contactPhone,
        contactEmail: r.contactEmail,
      }))
      setAssignmentResources(mapped)
    } catch {
      setAssignmentResources([])
    }
  }, [])

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
                  <div className="mb-2 small text-muted">Gender</div>
                  <div className="fw-500">
                    {request.gender || 'Not specified'}
                  </div>
                </Col>
                <Col xs={12} md={6}>
                  <div className="mb-2 small text-muted">Approximate Age</div>
                  <div className="fw-500">
                    {request.approximateAge || 'Not specified'}
                  </div>
                </Col>
              </Row>
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

              {/* 🥘 Food Assistance Conditional Fields */}
              {request.helpType === 'FOOD_ASSISTANCE' && (
                <Card className="bg-light border-0 mt-3 mb-3">
                  <Card.Body className="py-3">
                    <h6 className="mb-2 fw-700">🥘 Food Assistance Details</h6>
                    <Row className="g-2 small">
                      <Col xs={12} md={6}>
                        <span className="text-muted">Family Members:</span> <span className="fw-600">{request.familyMembers || '-'}</span>
                      </Col>
                      <Col xs={12} md={6}>
                        <span className="text-muted">Monthly Income:</span> <span className="fw-600">{request.monthlyIncomeRange || '-'}</span>
                      </Col>
                      <Col xs={12} md={6}>
                        <span className="text-muted">Employment Status:</span> <span className="fw-600">{request.employmentStatus || '-'}</span>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>
              )}

              {/* 🎓 Education Conditional Fields */}
              {request.helpType === 'EDUCATION_SUPPORT' && (
                <Card className="bg-light border-0 mt-3 mb-3">
                  <Card.Body className="py-3">
                    <h6 className="mb-2 fw-700">🎓 Education Support Details</h6>
                    <Row className="g-2 small">
                      <Col xs={12} md={6}>
                        <span className="text-muted">School Grade:</span> <span className="fw-600">{request.schoolGrade || '-'}</span>
                      </Col>
                      <Col xs={12} md={6}>
                        <span className="text-muted">Exam Year:</span> <span className="fw-600">{request.examYear || '-'}</span>
                      </Col>
                      <Col xs={12}>
                        <span className="text-muted">Required Items:</span> <span className="fw-600">{request.requiredItems?.length ? request.requiredItems.join(', ') : '-'}</span>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>
              )}

              {/* 🏥 Medical Conditional Fields */}
              {request.helpType === 'MEDICAL_HELP' && (
                <Card className="bg-light border-0 mt-3 mb-3">
                  <Card.Body className="py-3">
                    <h6 className="mb-2 fw-700">🏥 Medical Help Details</h6>
                    <Row className="g-2 small">
                      <Col xs={12} md={6}>
                        <span className="text-muted">Urgency Level:</span> <span className="fw-600">{request.urgencyLevel || '-'}</span>
                      </Col>
                      <Col xs={12} md={6}>
                        <span className="text-muted">Hospital/Clinic:</span> <span className="fw-600">{request.hospitalName || '-'}</span>
                      </Col>
                      <Col xs={12} md={6}>
                        <span className="text-muted">Estimated Cost:</span> <span className="fw-600">{request.estimatedCost || '-'}</span>
                      </Col>
                    </Row>
                    <div className="text-muted small mt-2">{request.conditionDescription || 'No condition description provided'}</div>
                    {request.medicalReportUrl && (
                      <a href={`${getUploadBaseUrl()}${request.medicalReportUrl}`} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline-primary mt-2">
                        View Medical Report
                      </a>
                    )}
                  </Card.Body>
                </Card>
              )}

              {/* 🏠 Shelter Conditional Fields */}
              {request.helpType === 'SHELTER' && (
                <Card className="bg-light border-0 mt-3 mb-3">
                  <Card.Body className="py-3">
                    <h6 className="mb-2 fw-700">🏠 Shelter Details</h6>
                    <Row className="g-2 small">
                      <Col xs={12} md={6}>
                        <span className="text-muted">Housing Type:</span> <span className="fw-600">{request.currentHousingType || '-'}</span>
                      </Col>
                      <Col xs={12} md={6}>
                        <span className="text-muted">Risk of Eviction:</span> <span className="fw-600">{request.riskOfEviction ? 'Yes' : 'No'}</span>
                      </Col>
                      <Col xs={12} md={6}>
                        <span className="text-muted">Immediate Danger:</span> <span className="fw-600 text-danger">{request.immediateDanger ? 'Yes - URGENT' : 'No'}</span>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>
              )}

              {/* 👕 Clothing Conditional Fields */}
              {request.helpType === 'CLOTHING' && (
                <Card className="bg-light border-0 mt-3 mb-3">
                  <Card.Body className="py-3">
                    <h6 className="mb-2 fw-700">👕 Clothing Details</h6>
                    <div className="small"><span className="text-muted">Quantity Needed:</span> <span className="fw-600">{request.quantityNeeded || '-'}</span></div>
                  </Card.Body>
                </Card>
              )}

              {/* 🧠 Counseling Conditional Fields */}
              {request.helpType === 'COUNSELING' && (
                <Card className="bg-light border-0 mt-3 mb-3">
                  <Card.Body className="py-3">
                    <h6 className="mb-2 fw-700">🧠 Counseling Details</h6>
                    <Row className="g-2 small">
                      <Col xs={12} md={6}>
                        <span className="text-muted">Counseling Type:</span> <span className="fw-600">{request.counselingType || '-'}</span>
                      </Col>
                      <Col xs={12} md={6}>
                        <span className="text-muted">Preferred Contact:</span> <span className="fw-600">{request.preferredContactMethod || '-'}</span>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>
              )}

              <div className="mb-3">
                <div className="mb-2 small text-muted">Attachments</div>
                {request.documentUrls && request.documentUrls.length > 0 ? (
                  <ul className="mb-0 small">
                    {request.documentUrls.map((url, idx) => (
                      <li key={url} className="mb-1">
                        <a
                          href={`${getUploadBaseUrl()}${url}`}
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

          {timeline.length > 0 && (
            <Card className="sw-card border-0 mb-4">
              <Card.Header className="bg-white border-0 pt-4 pb-3">
                <h5 className="mb-0 fw-700">Request Timeline</h5>
              </Card.Header>
              <Card.Body>
                <div className="sw-timeline-horizontal">
                  {timeline.map((item, index) => {
                    const dateLabel = item.timestamp ? formatDateTime(item.timestamp) : ''
                    return (
                      <div key={item.id || index} className="sw-timeline-step">
                        <div className="sw-timeline-dot-wrapper">
                          <div className="sw-timeline-dot" />
                          {index < timeline.length - 1 && <div className="sw-timeline-connector" />}
                        </div>
                        <div className="sw-timeline-content">
                          <div className="sw-timeline-message">
                            {item.message || '—'}
                          </div>
                          {dateLabel && (
                            <div className="sw-timeline-time small">
                              {dateLabel}
                            </div>
                          )}
                          {item.actor && (
                            <div className="sw-timeline-actor small">
                              {item.actor}
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </Card.Body>
            </Card>
          )}

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
                {/* Scenario A: User Accepted – Service Execution Controls (Start, Assign, Follow-Up) */}
                {pkgStatus === 'ACCEPTED' && (
                  <div className="mt-3">
                    <h6 className="fw-600 mb-2">🚀 Service Execution Controls</h6>
                    <p className="small text-muted mb-3">Request status: In Progress. Each service is pending execution. Use the actions below.</p>
                    <ul className="list-unstyled mb-0">
                      {(request.appliedPackageItemExecutions ?? request.appliedPackage?.items ?? []).map((itemOrExec) => {
                        const item = typeof itemOrExec === 'string' ? itemOrExec : itemOrExec.serviceItem
                        const exec = typeof itemOrExec === 'object' ? itemOrExec : null
                        const status = exec?.status ?? 'PENDING'
                        const canStart = status === 'PENDING' || status === 'SCHEDULED'
                        const isActionLoading = serviceActionLoading === item

                        const openStartModal = () => {
                          // default start date to now in input-local format
                          const d = new Date()
                          const pad = (n: number) => n.toString().padStart(2, '0')
                          const local = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
                            d.getHours()
                          )}:${pad(d.getMinutes())}`
                          setStartServiceModal({ item })
                          setStartServiceDate(local)
                          setStartServiceNotes('')
                          setExpectedCompletionDate('')
                          setResourcesAssigned(false)
                          setStartServiceError(null)
                        }

                        const openAssignResourceModal = () => {
                          setAssignResourceModal({ item })
                          setResourceSearch('')
                          setResourceTypeFilter('ALL')
                          setResourceAvailabilityFilter('ALL')
                          setResourceVerifiedOnly(false)
                          setSelectedResourceId(null)
                          setAssignExpectedDate('')
                          setAssignNotes('')
                          setAssignSendNotification(true)
                          setAssignError(null)
                        }

                        const handleAddFollowUp = () => {
                          const d = new Date()
                          const pad = (n: number) => n.toString().padStart(2, '0')
                          const local = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
                            d.getHours()
                          )}:${pad(d.getMinutes())}`
                          setFollowUpModal({ item })
                          setFollowUpDate(local)
                          setFollowUpMode('PHONE')
                          setFollowUpResolved(null)
                          setFollowUpNotes('')
                          setFollowUpError(null)
                        }

                        return (
                          <li key={item} className="d-flex flex-column py-2 border-bottom border-light gap-1">
                            <div className="d-flex flex-wrap align-items-center justify-content-between gap-2">
                              <span className="fw-500">{item}</span>
                              <Badge
                                bg={status === 'COMPLETED' ? 'success' : status === 'IN_PROGRESS' ? 'primary' : 'secondary'}
                                className="me-2"
                              >
                                {status === 'IN_PROGRESS' ? 'In Progress' : status}
                              </Badge>
                              <div className="d-flex flex-wrap gap-1">
                                {canStart && (
                                  <Button variant="success" size="sm" onClick={openStartModal} disabled={!!isActionLoading}>
                                    {isActionLoading ? 'Updating…' : '🟢 Start Service'}
                                  </Button>
                                )}
                                <Button variant="warning" size="sm" onClick={openAssignResourceModal}>
                                  🟡 Assign Resource
                                </Button>
                                <Button variant="info" size="sm" onClick={handleAddFollowUp}>
                                  🔵 Follow-Up
                                </Button>
                              </div>
                            </div>
                            {exec?.assignedResource && (
                              <div className="small text-muted ms-1">
                                Assigned resource: <strong>{exec.assignedResource}</strong>
                              </div>
                            )}
                          </li>
                        )
                      })}
                    </ul>
                    {Array.isArray(request.appliedPackageItemExecutions) &&
                      request.appliedPackageItemExecutions.some((ex) => ex.assignedResource) && (
                        <div className="mt-3 pt-3 border-top">
                          <h6 className="fw-600 mb-2">🏢 Assigned Resources</h6>
                          <ul className="list-unstyled mb-0 small">
                            {request.appliedPackageItemExecutions
                              .filter((ex) => ex.assignedResource)
                              .map((ex) => (
                                <li key={`${ex.serviceItem}-${ex.assignedResource}`}>
                                  <strong>{ex.assignedResource}</strong>
                                  <span className="text-muted"> • {ex.serviceItem}</span>
                                </li>
                              ))}
                          </ul>
                        </div>
                      )}
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

      {/* Start Service confirmation modal */}
      <Modal show={!!startServiceModal} onHide={() => setStartServiceModal(null)} centered>
        <Modal.Header closeButton>
          <Modal.Title>🟢 Start Service</Modal.Title>
        </Modal.Header>
        <Modal.Body>
              {startServiceModal && (
            <>
              <p className="mb-3">Start execution of <strong>{startServiceModal.item}</strong>? The service status will change to <strong>In Progress</strong> and the public user will see the update.</p>
              <Form.Group className="mb-2">
                <Form.Label className="small">Start date</Form.Label>
                <Form.Control
                  type="datetime-local"
                  value={startServiceDate}
                  onChange={(e) => setStartServiceDate(e.target.value)}
                />
              </Form.Group>

              <Form.Group className="mb-2">
                <Form.Label className="small">Expected completion date (optional)</Form.Label>
                <Form.Control
                  type="date"
                  value={expectedCompletionDate}
                  onChange={(e) => setExpectedCompletionDate(e.target.value)}
                />
              </Form.Group>

              <Form.Group className="mb-2">
                <Form.Check
                  type="checkbox"
                  label="Resources assigned to this service"
                  checked={resourcesAssigned}
                  onChange={(e) => setResourcesAssigned(e.target.checked)}
                />
              </Form.Group>

              <Form.Group>
                <Form.Label className="small">Execution notes (required)</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  placeholder="Provide initial notes required to start this service…"
                  value={startServiceNotes}
                  onChange={(e) => setStartServiceNotes(e.target.value)}
                />
              </Form.Group>
              {startServiceError && <div className="text-danger small mt-2">{startServiceError}</div>}
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button type="button" variant="outline-secondary" onClick={() => setStartServiceModal(null)}>Cancel</Button>
          <Button
            type="button"
            variant="success"
            onClick={async () => {
              if (!requestId || !startServiceModal) return
              // validation: notes required
              if (!startServiceNotes || !startServiceNotes.trim()) {
                setStartServiceError('Please add initial execution notes before starting the service.')
                return
              }
              setStartServiceError(null)
              setServiceActionLoading(startServiceModal.item)
              try {
                // preflight checks to avoid backend 404 when the request state doesn't allow starting a service
                console.debug('Preflight: request summary', {
                  id: request?.id,
                  appliedPackageStatus: request?.appliedPackageStatus,
                  appliedPackageItems: request?.appliedPackageItemExecutions ?? request?.appliedPackage?.items ?? [],
                })
                const executions = request?.appliedPackageItemExecutions ?? request?.appliedPackage?.items ?? []
                const hasItem = executions.some((e: any) => (typeof e === 'string' ? e : e.serviceItem) === startServiceModal.item)
                if (!hasItem) {
                  const msg = 'Cannot start service: this service item is not part of the applied package.'
                  console.warn(msg)
                  setStartServiceError(msg)
                  setServiceActionLoading(null)
                  return
                }
                if (!(request?.appliedPackageStatus === 'PENDING' || request?.appliedPackageStatus === 'ACCEPTED')) {
                  const msg = `Cannot start service: package status is ${request?.appliedPackageStatus ?? 'none'}.`
                  console.warn(msg)
                  setStartServiceError(msg)
                  setServiceActionLoading(null)
                  return
                }

                setError(null)
                const opts: { startDate?: string; notes?: string } = {}
                if (startServiceDate) opts.startDate = new Date(startServiceDate).toISOString()
                if (startServiceNotes.trim()) opts.notes = startServiceNotes.trim()

                // update service item status to IN_PROGRESS
                const updated = await updateServiceItemStatus(requestId, startServiceModal.item, 'IN_PROGRESS', opts)
                if (updated) setRequest(updated)

                // ensure overall request status is ACTIVE
                try {
                  const reqUpdated = await updateRequestStatus(requestId, 'ACTIVE')
                  if (reqUpdated) setRequest(reqUpdated)
                } catch (innerErr) {
                  // non-blocking: if setting request status fails, log but continue
                  console.error('Failed to set request status ACTIVE', innerErr)
                }

                // add timeline note for this start action
                try {
                  const parts = [
                    `Service started: ${startServiceModal.item}`,
                    startServiceDate ? `Start: ${new Date(startServiceDate).toLocaleString()}` : null,
                    expectedCompletionDate ? `Expected completion: ${new Date(expectedCompletionDate).toLocaleDateString()}` : null,
                    resourcesAssigned ? 'Resources assigned' : null,
                    startServiceNotes ? `Notes: ${startServiceNotes.trim()}` : null,
                  ].filter(Boolean)
                  await createHelpRequestTimelineNote(requestId, parts.join(' — '))
                } catch (tlErr) {
                  console.error('Failed to create timeline note', tlErr)
                }

                setStartServiceModal(null)
                setStartServiceDate('')
                setStartServiceNotes('')
                setExpectedCompletionDate('')
                setResourcesAssigned(false)
                setError(null)
              } catch (err) {
                const msg = err instanceof Error ? err.message : 'Failed to start service'
                console.error('Start service failed', err)
                setStartServiceError(msg)
                setError(msg)
              } finally {
                setServiceActionLoading(null)
              }
            }}
            disabled={serviceActionLoading !== null && serviceActionLoading !== startServiceModal?.item}
          >
            {serviceActionLoading ? 'Starting…' : 'Confirm'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Assign Resource panel */}
      <Modal
        show={!!assignResourceModal}
        onHide={() => setAssignResourceModal(null)}
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title className="h6 fw-700">
            🏢 Assign Resource{assignResourceModal ? ` for "${assignResourceModal.item}"` : ''}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row className="g-3 mb-3">
            <Col xs={12} md={4}>
              <Form.Label className="small fw-600 text-muted">Search</Form.Label>
              <Form.Control
                type="search"
                placeholder="Search by name or location…"
                value={resourceSearch}
                onChange={(e) => setResourceSearch(e.target.value)}
              />
            </Col>
            <Col xs={6} md={3}>
              <Form.Label className="small fw-600 text-muted">Service type</Form.Label>
              <Form.Select
                value={resourceTypeFilter}
                onChange={(e) =>
                  setResourceTypeFilter(e.target.value as 'ALL' | AssignmentResourceType)
                }
              >
                <option value="ALL">All</option>
                <option value="HOSPITAL">Hospital</option>
                <option value="SHELTER">Shelter</option>
                <option value="NGO">NGO</option>
                <option value="LEGAL">Legal</option>
                <option value="OTHER">Other</option>
              </Form.Select>
            </Col>
            <Col xs={6} md={3}>
              <Form.Label className="small fw-600 text-muted">Availability</Form.Label>
              <Form.Select
                value={resourceAvailabilityFilter}
                onChange={(e) =>
                  setResourceAvailabilityFilter(e.target.value as 'ALL' | AssignmentAvailability)
                }
              >
                <option value="ALL">All</option>
                <option value="AVAILABLE">Available</option>
                <option value="BUSY">Busy</option>
                <option value="FULL">Full</option>
              </Form.Select>
            </Col>
            <Col xs={12} md={2} className="d-flex align-items-end">
              <Form.Check
                type="switch"
                id="verifiedOnly"
                label="Verified only"
                className="small"
                checked={resourceVerifiedOnly}
                onChange={(e) => setResourceVerifiedOnly(e.target.checked)}
              />
            </Col>
          </Row>

          <Row>
            <Col xs={12} lg={7}>
              <div className="table-responsive mb-3">
                <table className="table table-sm align-middle">
                  <thead className="table-light">
                    <tr className="small text-muted">
                      <th>Resource</th>
                      <th>Type</th>
                      <th>Location</th>
                      <th>Availability</th>
                      <th>Contact</th>
                      <th className="text-end">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {assignmentResources.filter((res) => {
                      const q = resourceSearch.trim().toLowerCase()
                      if (q) {
                        const label = `${res.name} ${res.location}`.toLowerCase()
                        if (!label.includes(q)) return false
                      }
                      if (resourceTypeFilter !== 'ALL' && res.type !== resourceTypeFilter) return false
                      if (
                        resourceAvailabilityFilter !== 'ALL' &&
                        res.availability !== resourceAvailabilityFilter
                      )
                        return false
                      if (resourceVerifiedOnly && !res.verified) return false
                      return true
                    }).map((res) => {
                      const selected = res.id === selectedResourceId
                      return (
                        <tr key={res.id} className={selected ? 'table-primary' : undefined}>
                          <td>
                            <div className="fw-600 small">{res.name}</div>
                            {res.verified && (
                              <div className="small text-success">Verified</div>
                            )}
                          </td>
                          <td className="small">
                            {ASSIGNMENT_RESOURCE_TYPE_LABELS[res.type]}
                          </td>
                          <td className="small">{res.location}</td>
                          <td className="small">
                            {ASSIGNMENT_AVAILABILITY_LABELS[res.availability]}
                          </td>
                          <td className="small">
                            {res.contactPhone && <div>{res.contactPhone}</div>}
                            {res.contactEmail && (
                              <div className="text-muted">{res.contactEmail}</div>
                            )}
                          </td>
                          <td className="text-end">
                            <Button
                              size="sm"
                              variant={selected ? 'secondary' : 'outline-primary'}
                              onClick={() =>
                                setSelectedResourceId(selected ? null : res.id)
                              }
                            >
                              {selected ? 'Selected' : 'Assign'}
                            </Button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </Col>
            <Col xs={12} lg={5}>
              <h6 className="fw-600 mb-2">Assignment details</h6>
              {assignError && (
                <div className="alert alert-danger py-2 small">{assignError}</div>
              )}
              {!selectedResourceId && (
                <p className="small text-muted">
                  Select a resource from the list to continue.
                </p>
              )}
                {selectedResourceId && (() => {
                  const res = assignmentResources.find((r) => r.id === selectedResourceId)
                  if (!res) return null
                  return (
                <>
                  <Form.Group className="mb-3">
                    <Form.Label className="small fw-600 text-muted">
                      Expected service date
                    </Form.Label>
                    <Form.Control
                      type="datetime-local"
                      value={assignExpectedDate}
                      onChange={(e) => setAssignExpectedDate(e.target.value)}
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label className="small fw-600 text-muted">
                      Notes to resource
                    </Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={2}
                      value={assignNotes}
                      onChange={(e) => setAssignNotes(e.target.value)}
                      placeholder="Include key context or instructions…"
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Check
                      type="switch"
                      id="sendNotification"
                      label="Send notification to resource (recorded in notes)"
                      checked={assignSendNotification}
                      onChange={(e) => setAssignSendNotification(e.target.checked)}
                      className="small"
                    />
                  </Form.Group>
                </>
                  )
                })()}
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="outline-secondary"
            size="sm"
            onClick={() => setAssignResourceModal(null)}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            disabled={!assignResourceModal || !selectedResourceId || assignLoading}
            onClick={async () => {
              if (!assignResourceModal || !requestId || !selectedResourceId) return
              const res = assignmentResources.find((r: AssignmentResource) => r.id === selectedResourceId)
              if (!res) return
              if (!assignExpectedDate) {
                setAssignError('Please choose expected service date.')
                return
              }
              setAssignError(null)
              setAssignLoading(true)
              try {
                const scheduledDate = new Date(assignExpectedDate).toISOString()
                const noteParts = [
                  assignNotes.trim(),
                  `Notify resource: ${assignSendNotification ? 'Yes' : 'No'}`,
                  `Assigned resource: ${res.name} (${ASSIGNMENT_RESOURCE_TYPE_LABELS[res.type as AssignmentResourceType]} - ${res.location})`,
                ].filter(Boolean)
                const notesCombined = noteParts.join(' | ')
                const updated = await assignServiceItemResource(requestId, assignResourceModal.item, {
                  assignedResource: `${res.name} (${res.location})`,
                  scheduledDate,
                  notes: notesCombined,
                })
                if (updated) {
                  setRequest(updated)
                  setAssignResourceModal(null)
                  setSelectedResourceId(null)
                  setAssignExpectedDate('')
                  setAssignNotes('')
                }
              } catch (err) {
                setAssignError(
                  err instanceof Error ? err.message : 'Failed to assign resource.'
                )
              } finally {
                setAssignLoading(false)
              }
            }}
          >
            {assignLoading ? 'Assigning…' : 'Confirm assignment'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Follow-Up panel */}
      <Modal
        show={!!followUpModal}
        onHide={() => setFollowUpModal(null)}
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title className="h6 fw-700">
            ⏰ Add Follow-Up
            {followUpModal?.item ? ` for "${followUpModal.item}"` : ''}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row className="g-4">
            {/* Section 1 – Add Follow Up */}
            <Col xs={12} lg={5}>
              <h6 className="fw-600 mb-2">New follow-up</h6>
              <p className="small text-muted">
                Track progress and check outcomes with a quick follow-up note.
              </p>
              {followUpError && (
                <div className="alert alert-danger py-2 small">{followUpError}</div>
              )}
              <Form.Group className="mb-3">
                <Form.Label className="small fw-600 text-muted">📅 Follow-up date</Form.Label>
                <Form.Control
                  type="datetime-local"
                  value={followUpDate}
                  onChange={(e) => setFollowUpDate(e.target.value)}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label className="small fw-600 text-muted">📍 Mode</Form.Label>
                <Form.Select
                  value={followUpMode}
                  onChange={(e) =>
                    setFollowUpMode(
                      e.target.value as 'PHONE' | 'VISIT' | 'ONLINE' | 'FIELD'
                    )
                  }
                >
                  <option value="PHONE">Phone</option>
                  <option value="VISIT">Visit</option>
                  <option value="ONLINE">Online</option>
                  <option value="FIELD">Field</option>
                </Form.Select>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label className="small fw-600 text-muted">
                  🔘 Is issue resolved?
                </Form.Label>
                <div className="d-flex gap-3 small">
                  <Form.Check
                    type="radio"
                    id="fu-resolved-yes"
                    label="Yes"
                    checked={followUpResolved === true}
                    onChange={() => setFollowUpResolved(true)}
                  />
                  <Form.Check
                    type="radio"
                    id="fu-resolved-no"
                    label="No"
                    checked={followUpResolved === false}
                    onChange={() => setFollowUpResolved(false)}
                  />
                </div>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label className="small fw-600 text-muted">📝 Notes</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={followUpNotes}
                  onChange={(e) => setFollowUpNotes(e.target.value)}
                  placeholder="What was checked, any risks, next steps…"
                />
              </Form.Group>
            </Col>

            {/* Section 2 – Follow-Up History Timeline */}
            <Col xs={12} lg={7}>
              <h6 className="fw-600 mb-2">Follow-up history</h6>
              {followUps.length === 0 ? (
                <p className="small text-muted mb-0">
                  No follow-ups recorded for this request yet.
                </p>
              ) : (
                <div className="small" style={{ maxHeight: 260, overflowY: 'auto' }}>
                  <ul className="list-unstyled mb-0">
                    {[...followUps]
                      .slice()
                      .sort((a, b) => {
                        const aTime = a.scheduledDate
                          ? new Date(a.scheduledDate).getTime()
                          : 0
                        const bTime = b.scheduledDate
                          ? new Date(b.scheduledDate).getTime()
                          : 0
                        return bTime - aTime
                      })
                      .map((fu) => {
                        const dateLabel = fu.scheduledDate
                          ? new Date(fu.scheduledDate).toLocaleString()
                          : 'Not scheduled'
                        const mode = fu.type || 'Follow-up'
                        const resolved =
                          fu.status === 'COMPLETED' || fu.status === 'DONE' ? 'Resolved' : 'Ongoing'
                        return (
                          <li
                            key={fu.id}
                            className="mb-2 ps-2 border-start border-2 border-primary"
                          >
                            <div className="d-flex justify-content-between">
                              <span className="fw-600">{dateLabel}</span>
                              <span className="text-muted">{mode}</span>
                            </div>
                            <div className="text-muted">
                              Outcome:{' '}
                              <strong>
                                {resolved}
                              </strong>
                            </div>
                            {fu.notes && (
                              <div className="text-muted">
                                Notes: {fu.notes}
                              </div>
                            )}
                          </li>
                        )
                      })}
                  </ul>
                </div>
              )}
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="outline-secondary"
            size="sm"
            onClick={() => setFollowUpModal(null)}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            disabled={followUpSubmitting}
            onClick={async () => {
              if (!requestId || !followUpDate) {
                setFollowUpError('Please select a follow-up date.')
                return
              }
              setFollowUpError(null)
              setFollowUpSubmitting(true)
              try {
                const scheduledDateIso = new Date(followUpDate).toISOString()
                const outcomeText =
                  followUpResolved === null
                    ? 'Outcome: Not specified'
                    : `Outcome: ${followUpResolved ? 'Resolved' : 'Not resolved'}`
                const notesCombined = [followUpNotes.trim(), outcomeText]
                  .filter(Boolean)
                  .join(' | ')
                const created = await createFollowUp({
                  helpRequestId: requestId,
                  type:
                    followUpMode === 'PHONE'
                      ? 'Phone'
                      : followUpMode === 'VISIT'
                        ? 'Visit'
                        : followUpMode === 'ONLINE'
                          ? 'Online'
                          : 'Field',
                  scheduledDate: scheduledDateIso,
                  notes: notesCombined,
                  status: followUpResolved ? 'COMPLETED' : 'SCHEDULED',
                })
                setFollowUps((prev) => [...prev, created])
                setFollowUpModal(null)
                setFollowUpDate('')
                setFollowUpNotes('')
                setFollowUpResolved(null)
              } catch (err) {
                setFollowUpError(
                  err instanceof Error ? err.message : 'Failed to create follow-up.'
                )
              } finally {
                setFollowUpSubmitting(false)
              }
            }}
          >
            {followUpSubmitting ? 'Saving…' : 'Submit follow-up'}
          </Button>
        </Modal.Footer>
      </Modal>

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
