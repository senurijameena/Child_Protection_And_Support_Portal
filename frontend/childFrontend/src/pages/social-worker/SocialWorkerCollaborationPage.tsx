import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Badge, Button, Card, Col, Container, Form, Modal, Row, Spinner, Table } from 'react-bootstrap'
import {
  getAvailableSocialWorkers,
  getAssignedRequests,
  requestHelpRequestCollaborator,
  getMyPendingCollaborationRequests,
  getMyActiveCollaborationRequests,
  acceptHelpRequestCollaborationRequest,
  rejectHelpRequestCollaborationRequest,
  type CollaborationPermission,
  type PendingCollaborationRequestDTO,
} from '../../services/socialWorkerApi'
import { useAuth } from '../../hooks/useAuth'
import type { HelpRequestDTO, RequestStatus } from '../../types/dashboard'

// Types for collaboration requests
interface CollaborationRequest {
  id: string
  requestId: string
  requestCategory: 'MEDICAL_HELP' | 'SHELTER' | 'EDUCATION_SUPPORT' | 'FOOD_ASSISTANCE' | 'COUNSELING' | 'CLOTHING' | 'OTHER'
  ownerName: string
  district: string
  requestedRole: 'FULL_ACCESS' | 'VIEW_ONLY' | 'SERVICE_ONLY'
  reason: string
  requestedDate: string
  // Preview data (privacy-safe)
  problemSummary: string
  currentProgress: string
  servicesApplied: string[]
}

// Category labels
const CATEGORY_LABELS: Record<CollaborationRequest['requestCategory'], string> = {
  MEDICAL_HELP: 'Medical',
  SHELTER: 'Shelter',
  EDUCATION_SUPPORT: 'Education',
  FOOD_ASSISTANCE: 'Food Assistance',
  COUNSELING: 'Counseling',
  CLOTHING: 'Clothing',
  OTHER: 'Other',
}

// Category badge colors
const CATEGORY_VARIANTS: Record<CollaborationRequest['requestCategory'], string> = {
  MEDICAL_HELP: 'danger',
  SHELTER: 'warning',
  EDUCATION_SUPPORT: 'info',
  FOOD_ASSISTANCE: 'success',
  COUNSELING: 'primary',
  CLOTHING: 'secondary',
  OTHER: 'dark',
}

// Role labels
const ROLE_LABELS: Record<CollaborationRequest['requestedRole'], string> = {
  FULL_ACCESS: 'Full Access',
  VIEW_ONLY: 'View Only',
  SERVICE_ONLY: 'Service Only',
}

// Role badge colors
const ROLE_VARIANTS: Record<CollaborationRequest['requestedRole'], string> = {
  FULL_ACCESS: 'primary',
  VIEW_ONLY: 'secondary',
  SERVICE_ONLY: 'info',
}

// Types for active collaborations
interface ActiveCollaboration {
  id: string
  helpRequestId: string
  requestId: string
  trackingId?: string
  ownerUserId?: string
  role: 'FULL_ACCESS' | 'VIEW_ONLY' | 'SERVICE_ONLY'
  ownerName: string
  category: CollaborationRequest['requestCategory']
  pendingTasks: number
  lastUpdate: string
  status: 'ACTIVE' | 'ON_HOLD' | 'PENDING_REVIEW'
}

// Status labels and variants
const STATUS_LABELS: Record<ActiveCollaboration['status'], string> = {
  ACTIVE: 'Active',
  ON_HOLD: 'On Hold',
  PENDING_REVIEW: 'Pending Review',
}

const STATUS_VARIANTS: Record<ActiveCollaboration['status'], string> = {
  ACTIVE: 'success',
  ON_HOLD: 'warning',
  PENDING_REVIEW: 'info',
}

const getCollaborationPriority = (pendingTasks: number) => {
  if (pendingTasks >= 5) return 'HIGH'
  if (pendingTasks >= 1) return 'MEDIUM'
  return 'LOW'
}

// Types for past collaborations
interface PastCollaboration {
  id: string
  helpRequestId: string
  requestId: string
  ownerName: string
  category: CollaborationRequest['requestCategory']
  contribution: 'SERVICE' | 'COUNSELING' | 'RESOURCE' | 'ASSESSMENT' | 'DOCUMENTATION' | 'MULTIPLE'
  completionDate: string
  outcome: 'RESOLVED' | 'PARTIAL' | 'ESCALATED'
  // Summary data for read-only view
  problemSummary: string
  yourActions: string[]
  finalNotes: string
}

// Contribution labels
const CONTRIBUTION_LABELS: Record<PastCollaboration['contribution'], string> = {
  SERVICE: 'Service Delivery',
  COUNSELING: 'Counseling',
  RESOURCE: 'Resource Allocation',
  ASSESSMENT: 'Assessment',
  DOCUMENTATION: 'Documentation',
  MULTIPLE: 'Multiple Areas',
}

// Outcome labels and variants
const OUTCOME_LABELS: Record<PastCollaboration['outcome'], string> = {
  RESOLVED: 'Resolved',
  PARTIAL: 'Partial',
  ESCALATED: 'Escalated',
}

const OUTCOME_VARIANTS: Record<PastCollaboration['outcome'], string> = {
  RESOLVED: 'success',
  PARTIAL: 'warning',
  ESCALATED: 'danger',
}

export function SocialWorkerCollaborationPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const currentUserId = user?.userId
  const [activeTab, setActiveTab] = useState<'new' | 'participating' | 'past'>('new')
  const [newRequests, setNewRequests] = useState<PendingCollaborationRequestDTO[]>([])
  const [loadingRequests, setLoadingRequests] = useState(false)
  const [requestsError, setRequestsError] = useState<string | null>(null)
  const [activeCollaborations, setActiveCollaborations] = useState<ActiveCollaboration[]>([])
  const [loadingActive, setLoadingActive] = useState(false)
  const [activeError, setActiveError] = useState<string | null>(null)
  const [pastCollaborations] = useState<PastCollaboration[]>([])
  const [selectedRequest, setSelectedRequest] = useState<PendingCollaborationRequestDTO | null>(null)
  const [selectedPastCollab, setSelectedPastCollab] = useState<PastCollaboration | null>(null)
  const [showSummaryModal, setShowSummaryModal] = useState(false)
  const [showPastSummaryModal, setShowPastSummaryModal] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [availableSW, setAvailableSW] = useState<
    Array<{ userId: string; fullName: string; availabilityStatus?: string; specializations?: string[]; serviceArea?: string }>
  >([])
  const [swSearch, setSwSearch] = useState('')
  const [swAvailability, setSwAvailability] = useState<'ALL' | 'AVAILABLE' | 'BUSY' | 'ON_LEAVE'>('ALL')
  const [swSpecialization, setSwSpecialization] = useState('ALL')
  const [selectedSwUserId, setSelectedSwUserId] = useState('')
  const [createReason, setCreateReason] = useState('')
  const [createRequestId, setCreateRequestId] = useState('')
  const [createPermission, setCreatePermission] = useState<CollaborationPermission>('VIEW_ONLY')
  const [createSubmitting, setCreateSubmitting] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [rejectReasonPreset, setRejectReasonPreset] = useState<'WORKLOAD' | 'SPECIALIZATION' | 'DISTRICT' | 'OTHER' | ''>('')
  const [rejectTargetId, setRejectTargetId] = useState<string | null>(null)
  const [rejectError, setRejectError] = useState<string | null>(null)
  const [myRequests, setMyRequests] = useState<HelpRequestDTO[]>([])
  const [loadingMyRequests, setLoadingMyRequests] = useState(false)
  const [myRequestsError, setMyRequestsError] = useState<string | null>(null)

  // Fetch pending collaboration requests on mount
  useEffect(() => {
    const fetchPendingRequests = async () => {
      setLoadingRequests(true)
      setRequestsError(null)
      try {
        const data = await getMyPendingCollaborationRequests()
        setNewRequests(Array.isArray(data) ? data : [])
      } catch (err) {
        console.error('Failed to fetch pending collaboration requests:', err)
        setRequestsError(err instanceof Error ? err.message : 'Failed to load pending requests')
      } finally {
        setLoadingRequests(false)
      }
    }
    fetchPendingRequests()
  }, [])

  // Fetch active collaborations (where current user is accepted collaborator) on mount
  useEffect(() => {
    const fetchActiveCollaborations = async () => {
      setLoadingActive(true)
      setActiveError(null)
      try {
        const data = await getMyActiveCollaborationRequests()
        const list = Array.isArray(data) ? data : []
        const mapped: ActiveCollaboration[] = list.map((d) => {
          const category = (d.requestCategory?.toUpperCase() || 'OTHER') as CollaborationRequest['requestCategory']
          const role = (d.permission?.toUpperCase() || 'VIEW_ONLY') as ActiveCollaboration['role']
          const lastUpdate = d.respondedAt || d.requestedAt || new Date().toISOString()
          return {
            id: d.collaborationId,
            helpRequestId: d.helpRequestId || '',
            requestId: d.requestTrackingId || d.requestId || d.helpRequestId || '',
            trackingId: d.requestTrackingId,
            ownerUserId: d.ownerUserId,
            role,
            ownerName: d.ownerName || 'Social Worker',
            category,
            pendingTasks: 0,
            lastUpdate: typeof lastUpdate === 'string' ? lastUpdate : new Date(lastUpdate).toISOString(),
            status: 'ACTIVE',
          }
        })
        setActiveCollaborations(mapped)
      } catch (err) {
        console.error('Failed to fetch active collaborations:', err)
        setActiveError(err instanceof Error ? err.message : 'Failed to load active collaborations')
      } finally {
        setLoadingActive(false)
      }
    }
    fetchActiveCollaborations()
  }, [])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return formatDate(dateString)
  }

  const handleRowClick = (helpRequestId: string) => {
    // Navigate to request details with collaboration mode
    navigate(`/social-worker/requests/${helpRequestId}?mode=collaborator`)
  }

  const handleMessageWorker = (targetUserId?: string | null) => {
    if (!targetUserId || !currentUserId || targetUserId === currentUserId) return
    navigate(`/social-worker/messages?userId=${encodeURIComponent(targetUserId)}`)
  }

  const handleViewSummary = (request: PendingCollaborationRequestDTO) => {
    // For new collaboration invitations, show a privacy-safe preview in a modal (no PII)
    setSelectedRequest(request)
    setShowSummaryModal(true)
  }

  const handleAccept = async (collaborationId: string) => {
    setProcessingId(collaborationId)
    try {
      await acceptHelpRequestCollaborationRequest(collaborationId)
      setNewRequests((prev) => prev.filter((r) => r.collaborationId !== collaborationId))
      setShowSummaryModal(false)
      setActiveTab('participating')
      // Refetch active collaborations so Participating tab shows real data from backend
      getMyActiveCollaborationRequests()
        .then((data) => {
          const list = Array.isArray(data) ? data : []
          const mapped: ActiveCollaboration[] = list.map((d) => {
            const category = (d.requestCategory?.toUpperCase() || 'OTHER') as CollaborationRequest['requestCategory']
            const role = (d.permission?.toUpperCase() || 'VIEW_ONLY') as ActiveCollaboration['role']
            const lastUpdate = d.respondedAt || d.requestedAt || new Date().toISOString()
            return {
              id: d.collaborationId,
              helpRequestId: d.helpRequestId || '',
              requestId: d.requestTrackingId || d.requestId || d.helpRequestId || '',
              trackingId: d.requestTrackingId,
              ownerUserId: d.ownerUserId,
              role,
              ownerName: d.ownerName || 'Social Worker',
              category,
              pendingTasks: 0,
              lastUpdate: typeof lastUpdate === 'string' ? lastUpdate : new Date(lastUpdate).toISOString(),
              status: 'ACTIVE',
            }
          })
          setActiveCollaborations(mapped)
        })
        .catch(() => {})
    } catch (err) {
      console.error('Failed to accept collaboration:', err)
      alert(err instanceof Error ? err.message : 'Failed to accept collaboration')
    } finally {
      setProcessingId(null)
    }
  }

  const handleReject = async (collaborationId: string, reason: string) => {
    if (!reason.trim()) {
      setRejectError('Reason is required.')
      return
    }
    setProcessingId(collaborationId)
    try {
      await rejectHelpRequestCollaborationRequest(collaborationId, reason.trim())
      setNewRequests((prev) => prev.filter((r) => r.collaborationId !== collaborationId))
      setShowRejectModal(false)
      setRejectTargetId(null)
      setRejectReason('')
      setRejectError(null)
    } catch (err) {
      console.error('Failed to reject collaboration:', err)
      alert(err instanceof Error ? err.message : 'Failed to reject collaboration')
    } finally {
      setProcessingId(null)
    }
  }

  useEffect(() => {
    if (!showCreateModal) return
    // Load available social workers for selector
    getAvailableSocialWorkers()
      .then((list) => setAvailableSW(Array.isArray(list) ? list : []))
      .catch(() => setAvailableSW([]))
  }, [showCreateModal])

  // Load accepted but not completed requests assigned to current worker
  useEffect(() => {
    if (!showCreateModal || !user?.userId) return
    setLoadingMyRequests(true)
    setMyRequestsError(null)
    getAssignedRequests(user.userId)
      .then((list) => setMyRequests(Array.isArray(list) ? list : []))
      .catch((err) => {
        console.error('Failed to load assigned requests for collaboration dropdown', err)
        setMyRequests([])
        setMyRequestsError(err instanceof Error ? err.message : 'Could not load your requests')
      })
      .finally(() => setLoadingMyRequests(false))
  }, [showCreateModal, user?.userId])

  const filteredSW = useMemo(() => {
    const q = swSearch.trim().toLowerCase()
    return availableSW.filter((sw) => {
      if (q && !(sw.fullName?.toLowerCase().includes(q))) return false
      if (swAvailability !== 'ALL') {
        const avail = (sw.availabilityStatus || '').toUpperCase()
        if (avail !== swAvailability) return false
      }
      if (swSpecialization !== 'ALL') {
        if (!(sw.specializations || []).includes(swSpecialization)) return false
      }
      return true
    })
  }, [availableSW, swSearch, swAvailability, swSpecialization])

  // Only requests that are already accepted/assigned but not completed/closed
  const eligibleRequests = useMemo(() => {
    const allowedStatuses: RequestStatus[] = ['ASSIGNED', 'IN_PROGRESS', 'PACKAGE_PROPOSED']
    const blocked: RequestStatus[] = ['COMPLETED', 'CANCELLED', 'REJECTED']
    return myRequests.filter((req) => {
      const status = (req.status || '').toUpperCase() as RequestStatus
      if (blocked.includes(status)) return false
      return allowedStatuses.includes(status)
    })
  }, [myRequests])

  const handleCreateCollaboration = async () => {
    if (!createRequestId.trim() || !selectedSwUserId || !createReason.trim()) {
      setCreateError('Request, collaborator, and reason are required.')
      return
    }
    setCreateSubmitting(true)
    setCreateError(null)
    try {
      await requestHelpRequestCollaborator(createRequestId.trim(), {
        collaboratorUserId: selectedSwUserId,
        permission: createPermission,
        reason: createReason.trim(),
      })
      setShowCreateModal(false)
      setCreateReason('')
      setCreateRequestId('')
      setSelectedSwUserId('')
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : 'Failed to create collaboration')
    } finally {
      setCreateSubmitting(false)
    }
  }

  const renderNewRequestsTab = () => (
    <div>
      {loadingRequests ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3 mb-0 text-muted">Loading collaboration requests...</p>
        </div>
      ) : requestsError ? (
        <div className="text-center text-danger py-5">
          <span style={{ fontSize: '3rem' }}>⚠️</span>
          <p className="mt-3 mb-0">{requestsError}</p>
        </div>
      ) : newRequests.length === 0 ? (
        <div className="text-center text-muted py-5">
          <span style={{ fontSize: '3rem' }}>📭</span>
          <p className="mt-3 mb-0">No new collaboration requests at the moment.</p>
        </div>
      ) : (
        <>
          <p className="text-muted small mb-3">
            Another social worker invited you to collaborate on these requests. You have not accepted or rejected them yet.
          </p>
          <Row className="g-3">
            {newRequests.map((request) => {
              const category = (request.requestCategory?.toUpperCase() || 'OTHER') as CollaborationRequest['requestCategory']
              const role = (request.permission?.toUpperCase() || 'VIEW_ONLY') as CollaborationRequest['requestedRole']
              const isProcessing = processingId === request.collaborationId
              const requestId =
                request.requestTrackingId || request.requestId || request.helpRequestId || '-'

              return (
                <Col xs={12} md={6} key={request.collaborationId}>
                  <Card className="h-100 border-0 shadow-sm">
                    <Card.Body className="d-flex flex-column justify-content-between">
                      <div>
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <div>
                            <div className="small text-muted">Request ID</div>
                            <div className="fw-600">{requestId}</div>
                          </div>
                          <Badge bg={CATEGORY_VARIANTS[category] || 'secondary'}>
                            {CATEGORY_LABELS[category] || request.requestCategory || 'Other'}
                          </Badge>
                        </div>
                        <div className="small text-muted mb-1">
                          Category:{' '}
                          <span className="fw-500">
                            {CATEGORY_LABELS[category] || request.requestCategory || 'Other'}
                          </span>
                        </div>
                        <div className="small text-muted mb-1">
                          Request owner:{' '}
                          <span className="fw-500">
                            {request.ownerName || 'Social Worker'}
                          </span>
                        </div>
                        <div className="small text-muted mb-1">
                          Requested role:{' '}
                          <Badge bg={ROLE_VARIANTS[role] || 'secondary'} className="fw-normal ms-1">
                            {ROLE_LABELS[role] || request.permission || 'View Only'}
                          </Badge>
                        </div>
                        <div className="small text-muted mb-1">
                          Requested date:{' '}
                          <span className="fw-500">
                            {request.requestedAt ? formatDate(request.requestedAt) : '-'}
                          </span>
                        </div>
                        <div className="mt-2">
                          <div className="small text-muted mb-1">Reason for collaboration</div>
                          <div className="bg-light rounded-3 p-2 small" style={{ minHeight: 48 }}>
                            {request.reason || 'No reason provided'}
                          </div>
                        </div>
                      </div>
                      <div className="d-flex flex-wrap gap-2 mt-3">
                        <Button
                          variant="outline-secondary"
                          size="sm"
                          className="flex-grow-1"
                          onClick={() => handleViewSummary(request)}
                          disabled={isProcessing}
                        >
                          View Summary
                        </Button>
                        <Button
                          variant="success"
                          size="sm"
                          className="flex-grow-1"
                          onClick={() => handleAccept(request.collaborationId)}
                          disabled={isProcessing}
                        >
                          {isProcessing ? <Spinner size="sm" animation="border" /> : 'Accept'}
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          className="flex-grow-1"
                          onClick={() => {
                            setSelectedRequest(request)
                            setRejectTargetId(request.collaborationId)
                            setRejectReason('');
                            setRejectError(null)
                            setShowRejectModal(true)
                          }}
                          disabled={isProcessing}
                        >
                          {isProcessing ? <Spinner size="sm" animation="border" /> : 'Reject'}
                        </Button>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              )
            })}
          </Row>

          {selectedRequest && (
            <Card className="mt-4 border-0 shadow-sm">
              <Card.Header className="bg-light border-0 pb-2">
                <h6 className="mb-0 fw-700">
                  Collaboration preview
                  <span className="text-muted fw-normal ms-2 small">(read-only)</span>
                </h6>
              </Card.Header>
              <Card.Body>
                <div className="mb-3">
                  <div className="text-muted small mb-1">Short problem summary</div>
                  <div className="bg-light rounded-3 p-3">
                    <p className="mb-0 text-dark">
                      {selectedRequest.problemSummary || 'No summary available'}
                    </p>
                  </div>
                </div>

                <div className="mb-3">
                  <div className="text-muted small mb-1">Current status</div>
                  <div className="bg-light rounded-3 p-3">
                    <p className="mb-0 text-dark">
                      {selectedRequest.currentProgress || 'No status information available'}
                    </p>
                  </div>
                </div>

                <div>
                  <div className="text-muted small mb-1">Why collaboration is needed</div>
                  <div className="bg-light rounded-3 p-3">
                    <p className="mb-0 text-dark">
                      {selectedRequest.reason || 'No reason provided'}
                    </p>
                  </div>
                </div>
              </Card.Body>
            </Card>
          )}
        </>
      )}
    </div>
  )

  const renderParticipatingTab = () => (
    <div>
      {loadingActive ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3 mb-0 text-muted">Loading active collaborations...</p>
        </div>
      ) : activeError ? (
        <div className="text-center text-danger py-5">
          <span style={{ fontSize: '3rem' }}>⚠️</span>
          <p className="mt-3 mb-0">{activeError}</p>
        </div>
      ) : activeCollaborations.length === 0 ? (
        <div className="text-center text-muted py-5">
          <span style={{ fontSize: '3rem' }}>📂</span>
          <p className="mt-3 mb-0">You are not participating in any collaborations yet.</p>
        </div>
      ) : (
        <div className="table-responsive">
          <Table hover className="align-middle mb-0">
            <thead className="bg-light">
              <tr>
                <th className="fw-600 text-muted small py-3 ps-3">Request ID</th>
                <th className="fw-600 text-muted small py-3">Role</th>
                <th className="fw-600 text-muted small py-3">Owner</th>
                <th className="fw-600 text-muted small py-3">Category</th>
                <th className="fw-600 text-muted small py-3 text-center">Your Pending Tasks</th>
                <th className="fw-600 text-muted small py-3">Last Update</th>
                <th className="fw-600 text-muted small py-3">Priority</th>
                <th className="fw-600 text-muted small py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {activeCollaborations.map((collab) => (
                <tr
                  key={collab.id}
                  className="border-bottom"
                  onClick={() => handleRowClick(collab.helpRequestId)}
                  style={{ cursor: 'pointer' }}
                >
                  <td className="py-3 ps-3">
                    <span className="fw-600 text-primary">
                      {collab.trackingId || collab.requestId}
                    </span>
                  </td>
                  <td className="py-3">
                    <Badge bg={ROLE_VARIANTS[collab.role]} className="fw-normal">
                      {ROLE_LABELS[collab.role]}
                    </Badge>
                  </td>
                  <td className="py-3">
                    <span className="small">{collab.ownerName}</span>
                  </td>
                  <td className="py-3">
                    <Badge bg={CATEGORY_VARIANTS[collab.category]} className="fw-normal">
                      {CATEGORY_LABELS[collab.category]}
                    </Badge>
                  </td>
                  <td className="py-3 text-center">
                    {collab.pendingTasks > 0 ? (
                      <Badge bg="danger" pill>
                        {collab.pendingTasks}
                      </Badge>
                    ) : (
                      <span className="text-muted small">—</span>
                    )}
                  </td>
                  <td className="py-3">
                    <span className="small text-muted">
                      {formatRelativeTime(collab.lastUpdate)}
                    </span>
                  </td>
                  <td className="py-3">
                    {(() => {
                      const p = getCollaborationPriority(collab.pendingTasks)
                      const variant = p === 'HIGH' ? 'danger' : p === 'MEDIUM' ? 'warning' : 'secondary'
                      return (
                        <Badge bg={variant} className="fw-normal">
                          {p.charAt(0) + p.slice(1).toLowerCase()}
                        </Badge>
                      )
                    })()}
                  </td>
                  <td className="py-3">
                    <Badge bg={STATUS_VARIANTS[collab.status]} className="fw-normal">
                      {STATUS_LABELS[collab.status]}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>

          {/* Quick Actions Legend */}
          <div className="bg-light rounded-3 p-3 mt-4">
            <div className="d-flex align-items-center gap-2 mb-2">
              <span>ℹ️</span>
              <span className="fw-600 small">As a Collaborator, you can:</span>
            </div>
            <div className="d-flex flex-wrap gap-3 small text-muted">
              <span>📝 Add internal note</span>
              <span>🔗 Assign resource</span>
              <span>💬 Send message</span>
              <span>⏰ Add follow-up</span>
              <span>📎 Upload document</span>
            </div>
            <div className="mt-2 small text-danger">
              <span>🚫 Note: Collaborators cannot close cases</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )

  const handleViewPastSummary = (collab: PastCollaboration) => {
    setSelectedPastCollab(collab)
    setShowPastSummaryModal(true)
  }

  const renderAllCollaborationsTab = () => (
    <div>
      {activeCollaborations.length > 0 && (
        <div className="mb-4">
          <h6 className="fw-700 mb-3">Active Collaborations</h6>
          <div className="table-responsive">
            <Table hover size="sm" className="align-middle mb-0">
              <thead className="bg-light">
                <tr>
                  <th className="fw-600 text-muted small py-3 ps-3">Request ID</th>
                  <th className="fw-600 text-muted small py-3">Owner</th>
                  <th className="fw-600 text-muted small py-3">Category</th>
                  <th className="fw-600 text-muted small py-3">Role</th>
                  <th className="fw-600 text-muted small py-3">Status</th>
                  <th className="fw-600 text-muted small py-3 pe-3 text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {activeCollaborations.map((collab) => (
                  <tr key={collab.id} className="border-bottom">
                    <td className="py-3 ps-3">
                      <span className="fw-600 text-primary">
                        {collab.trackingId || collab.requestId}
                      </span>
                    </td>
                    <td className="py-3 small">{collab.ownerName}</td>
                    <td className="py-3">
                      <Badge bg={CATEGORY_VARIANTS[collab.category]} className="fw-normal">
                        {CATEGORY_LABELS[collab.category]}
                      </Badge>
                    </td>
                    <td className="py-3">
                      <Badge bg={ROLE_VARIANTS[collab.role]} className="fw-normal">
                        {ROLE_LABELS[collab.role]}
                      </Badge>
                    </td>
                    <td className="py-3">
                      <Badge bg={STATUS_VARIANTS['ACTIVE']} className="fw-normal">
                        Active
                      </Badge>
                    </td>
                    <td className="py-3 pe-3 text-end">
                      <div className="d-flex justify-content-end gap-2">
                        <Button
                          size="sm"
                          variant="outline-primary"
                          className="rounded-pill"
                          onClick={() => handleRowClick(collab.helpRequestId)}
                        >
                          View
                        </Button>
                        {collab.ownerUserId &&
                          currentUserId &&
                          collab.ownerUserId !== currentUserId && (
                            <Button
                              size="sm"
                              variant="outline-secondary"
                              className="rounded-pill"
                              onClick={() => handleMessageWorker(collab.ownerUserId)}
                            >
                              Message
                            </Button>
                          )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </div>
      )}

      {pastCollaborations.length === 0 ? (
        <div className="text-center text-muted py-5">
          <span style={{ fontSize: '3rem' }}>📜</span>
          <p className="mt-3 mb-0">No past collaborations found.</p>
        </div>
      ) : (
        <div>
          {/* Summary Stats */}
          <Row className="g-3 mb-4">
            <Col xs={6} md={3}>
              <div className="bg-light rounded-3 p-3 text-center">
                <div className="fw-700 h4 mb-1 text-primary">{pastCollaborations.length}</div>
                <div className="small text-muted">Total Collaborations</div>
              </div>
            </Col>
            <Col xs={6} md={3}>
              <div className="bg-light rounded-3 p-3 text-center">
                <div className="fw-700 h4 mb-1 text-success">
                  {pastCollaborations.filter(c => c.outcome === 'RESOLVED').length}
                </div>
                <div className="small text-muted">Resolved</div>
              </div>
            </Col>
            <Col xs={6} md={3}>
              <div className="bg-light rounded-3 p-3 text-center">
                <div className="fw-700 h4 mb-1 text-warning">
                  {pastCollaborations.filter(c => c.outcome === 'PARTIAL').length}
                </div>
                <div className="small text-muted">Partial</div>
              </div>
            </Col>
            <Col xs={6} md={3}>
              <div className="bg-light rounded-3 p-3 text-center">
                <div className="fw-700 h4 mb-1 text-danger">
                  {pastCollaborations.filter(c => c.outcome === 'ESCALATED').length}
                </div>
                <div className="small text-muted">Escalated</div>
              </div>
            </Col>
          </Row>

          {/* Table */}
          <div className="table-responsive">
            <Table hover className="align-middle mb-0">
              <thead className="bg-light">
                <tr>
                  <th className="fw-600 text-muted small py-3 ps-3">Request ID</th>
                  <th className="fw-600 text-muted small py-3">Owner</th>
                  <th className="fw-600 text-muted small py-3">Category</th>
                  <th className="fw-600 text-muted small py-3">Your Contribution</th>
                  <th className="fw-600 text-muted small py-3">Completion Date</th>
                  <th className="fw-600 text-muted small py-3 pe-3">Outcome</th>
                </tr>
              </thead>
              <tbody>
                {pastCollaborations.map((collab) => (
                  <tr
                    key={collab.id}
                    onClick={() => handleViewPastSummary(collab)}
                    style={{ cursor: 'pointer' }}
                    className="border-bottom"
                  >
                    <td className="py-3 ps-3">
                      <span className="fw-600">{collab.requestId}</span>
                    </td>
                    <td className="py-3">
                      <span className="small">{collab.ownerName}</span>
                    </td>
                    <td className="py-3">
                      <Badge bg={CATEGORY_VARIANTS[collab.category]} className="fw-normal">
                        {CATEGORY_LABELS[collab.category]}
                      </Badge>
                    </td>
                    <td className="py-3">
                      <span className="small">{CONTRIBUTION_LABELS[collab.contribution]}</span>
                    </td>
                    <td className="py-3">
                      <span className="small text-muted">{formatDate(collab.completionDate)}</span>
                    </td>
                    <td className="py-3 pe-3">
                      <Badge bg={OUTCOME_VARIANTS[collab.outcome]} className="fw-normal">
                        {OUTCOME_LABELS[collab.outcome]}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>

          {/* Info Note */}
          <div className="bg-info bg-opacity-10 border border-info rounded-3 p-3 mt-4">
            <div className="d-flex align-items-start gap-2">
              <span>📋</span>
              <p className="mb-0 small text-muted">
                <strong className="text-dark">History & Accountability:</strong> This record shows all your past collaboration contributions. 
                Click on any row to view a read-only summary of your involvement.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )

  return (
    <Container fluid className="py-4 sw-dashboard">
      {/* Header */}
      <Row className="mb-4">
        <Col xs={12}>
          <div className="d-flex align-items-center justify-content-between gap-2 mb-2">
            <div className="d-flex align-items-center gap-2">
              <span style={{ fontSize: '1.75rem' }}>👥</span>
              <h1 className="h3 fw-700 mb-0">Collaboration Center</h1>
            </div>
            <Button variant="primary" size="sm" onClick={() => setShowCreateModal(true)}>
              + New Collaboration
            </Button>
          </div>
          <p className="text-muted mb-0">
            Collaborate with other social workers on shared requests.
          </p>
        </Col>
      </Row>

      {/* Tabs */}
      <Row className="mb-4">
        <Col xs={12}>
          <Card className="sw-card border-0">
            <Card.Body className="p-0">
              <div className="d-flex border-bottom">
                <button
                  type="button"
                  className={`btn btn-link text-decoration-none px-4 py-3 rounded-0 fw-600 position-relative ${
                    activeTab === 'new'
                      ? 'text-primary border-bottom border-primary border-2'
                      : 'text-muted'
                  }`}
                  onClick={() => setActiveTab('new')}
                >
                  New Requests
                  {newRequests.length > 0 && (
                    <Badge
                      bg="danger"
                      pill
                      className="ms-2"
                      style={{ fontSize: '0.65rem' }}
                    >
                      {newRequests.length}
                    </Badge>
                  )}
                </button>
                <button
                  type="button"
                  className={`btn btn-link text-decoration-none px-4 py-3 rounded-0 fw-600 ${
                    activeTab === 'participating'
                      ? 'text-primary border-bottom border-primary border-2'
                      : 'text-muted'
                  }`}
                  onClick={() => setActiveTab('participating')}
                >
                  Active Collaborations
                </button>
                <button
                  type="button"
                  className={`btn btn-link text-decoration-none px-4 py-3 rounded-0 fw-600 ${
                    activeTab === 'past'
                      ? 'text-primary border-bottom border-primary border-2'
                      : 'text-muted'
                  }`}
                  onClick={() => setActiveTab('past')}
                >
                  Past Collaborations
                </button>
              </div>

              {/* Tab Content */}
              <div className="p-4">
                {activeTab === 'new' && renderNewRequestsTab()}
                {activeTab === 'participating' && renderParticipatingTab()}
                {activeTab === 'past' && renderAllCollaborationsTab()}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Create collaboration modal */}
      <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Create Collaboration</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row className="g-3">
            <Col xs={12} md={6}>
              <label className="small fw-600 text-muted">Help Request *</label>
              <select
                className="form-select"
                value={createRequestId}
                onChange={(e) => setCreateRequestId(e.target.value)}
                disabled={loadingMyRequests || (!!myRequestsError && eligibleRequests.length === 0)}
              >
                <option value="">
                  {loadingMyRequests
                    ? 'Loading your accepted requests...'
                    : eligibleRequests.length > 0
                      ? 'Select a request'
                      : myRequestsError
                        ? 'Unable to load your requests'
                        : 'No accepted requests available'}
                </option>
                {eligibleRequests.map((req) => (
                  <option key={req.id} value={req.id}>
                    {req.trackingId || req.id} — {req.helpType || 'Request'} ({req.status})
                  </option>
                ))}
              </select>
              <div className="form-text">
                Shows requests assigned to you that are accepted/active but not completed.
              </div>
              {myRequestsError && (
                <div className="text-danger small mt-1">
                  {myRequestsError}
                </div>
              )}
            </Col>
            <Col xs={12} md={6}>
              <label className="small fw-600 text-muted">Permission</label>
              <select
                className="form-select"
                value={createPermission}
                onChange={(e) => setCreatePermission(e.target.value as CollaborationPermission)}
              >
                <option value="FULL_ACCESS">Full Access</option>
                <option value="VIEW_ONLY">View Only</option>
                <option value="SERVICE_ONLY">Service Only</option>
              </select>
            </Col>
            <Col xs={12}>
              <label className="small fw-600 text-muted">Reason *</label>
              <textarea
                className="form-control"
                rows={3}
                value={createReason}
                onChange={(e) => setCreateReason(e.target.value)}
                placeholder="Explain why you need this collaborator"
              />
            </Col>
          </Row>

          <hr />
          <h6 className="fw-700 mb-3">Select Social Worker (availability & specialization)</h6>
          <Row className="g-3 mb-3">
            <Col xs={12} md={4}>
              <label className="small text-muted fw-600">Search</label>
              <input
                type="text"
                className="form-control"
                placeholder="Name"
                value={swSearch}
                onChange={(e) => setSwSearch(e.target.value)}
              />
            </Col>
            <Col xs={6} md={4}>
              <label className="small text-muted fw-600">Availability</label>
              <select
                className="form-select"
                value={swAvailability}
                onChange={(e) => setSwAvailability(e.target.value as typeof swAvailability)}
              >
                <option value="ALL">All</option>
                <option value="AVAILABLE">Available</option>
                <option value="BUSY">Busy</option>
                <option value="ON_LEAVE">On Leave</option>
              </select>
            </Col>
            <Col xs={6} md={4}>
              <label className="small text-muted fw-600">Specialization</label>
              <select
                className="form-select"
                value={swSpecialization}
                onChange={(e) => setSwSpecialization(e.target.value)}
              >
                <option value="ALL">All</option>
                {[...new Set(availableSW.flatMap((sw) => sw.specializations || []))].map((spec) => (
                  <option key={spec} value={spec}>
                    {spec}
                  </option>
                ))}
              </select>
            </Col>
          </Row>

          <div className="table-responsive" style={{ maxHeight: 320, overflowY: 'auto' }}>
            <Table hover size="sm" className="align-middle">
              <thead className="table-light">
                <tr className="small text-muted">
                  <th>Name</th>
                  <th>Availability</th>
                  <th>Specializations</th>
                  <th className="text-end">Select</th>
                </tr>
              </thead>
              <tbody>
                {filteredSW.length === 0 && (
                  <tr>
                    <td colSpan={4} className="text-center text-muted py-3">
                      No social workers match your filters.
                    </td>
                  </tr>
                )}
                {filteredSW.map((sw) => (
                  <tr key={sw.userId}>
                    <td>{sw.fullName}</td>
                    <td>
                      <Badge bg={sw.availabilityStatus === 'AVAILABLE' ? 'success' : sw.availabilityStatus === 'BUSY' ? 'warning' : 'secondary'}>
                        {sw.availabilityStatus || 'Unknown'}
                      </Badge>
                    </td>
                    <td className="small">
                      {(sw.specializations || []).join(', ') || '—'}
                    </td>
                    <td className="text-end">
                      <input
                        type="radio"
                        name="sw-select"
                        value={sw.userId}
                        checked={selectedSwUserId === sw.userId}
                        onChange={() => setSelectedSwUserId(sw.userId)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
          {createError && <div className="alert alert-danger py-2 small mt-2 mb-0">{createError}</div>}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={() => setShowCreateModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" disabled={createSubmitting} onClick={handleCreateCollaboration}>
            {createSubmitting ? 'Sending…' : 'Send Collaboration Request'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* View Summary Modal */}
      <Modal
        show={showSummaryModal}
        onHide={() => setShowSummaryModal(false)}
        centered
        size="lg"
      >
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fw-700">
            <span className="me-2">📋</span>
            Request Summary
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="pt-2">
          {selectedRequest && (() => {
            const category = (selectedRequest.requestCategory?.toUpperCase() || 'OTHER') as CollaborationRequest['requestCategory']
            const role = (selectedRequest.permission?.toUpperCase() || 'VIEW_ONLY') as CollaborationRequest['requestedRole']
            const isProcessing = processingId === selectedRequest.collaborationId
            
            return (
              <div>
                {/* Request Info Header */}
                <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 pb-3 border-bottom">
                  <div>
                    <span className="text-muted small">Request ID</span>
                    <h5 className="fw-700 mb-0">{selectedRequest.requestId || selectedRequest.helpRequestId}</h5>
                    <span className="small text-muted">From: {selectedRequest.ownerName || 'Social Worker'}</span>
                  </div>
                  <div className="d-flex gap-2">
                    <Badge bg={CATEGORY_VARIANTS[category] || 'secondary'} className="px-3 py-2">
                      {CATEGORY_LABELS[category] || selectedRequest.requestCategory || 'Other'}
                    </Badge>
                    <Badge bg={ROLE_VARIANTS[role] || 'secondary'} className="px-3 py-2">
                      {ROLE_LABELS[role] || selectedRequest.permission || 'View Only'}
                    </Badge>
                  </div>
                </div>

                {/* Problem Summary */}
                <div className="mb-4">
                  <h6 className="fw-700 text-dark mb-2">
                    <span className="me-2">📝</span>
                    Problem Summary
                  </h6>
                  <div className="bg-light rounded-3 p-3">
                    <p className="mb-0 text-dark">{selectedRequest.problemSummary || 'No summary available'}</p>
                  </div>
                </div>

                {/* Current Progress */}
                <div className="mb-4">
                  <h6 className="fw-700 text-dark mb-2">
                    <span className="me-2">📊</span>
                    Current Progress
                  </h6>
                  <div className="bg-light rounded-3 p-3">
                    <p className="mb-0 text-dark">{selectedRequest.currentProgress || 'No progress information available'}</p>
                  </div>
                </div>

                {/* Services Applied */}
                <div className="mb-3">
                  <h6 className="fw-700 text-dark mb-2">
                    <span className="me-2">🛠️</span>
                    Services Already Applied
                  </h6>
                  <div className="bg-light rounded-3 p-3">
                    {selectedRequest.servicesApplied && selectedRequest.servicesApplied.length > 0 ? (
                      <div className="d-flex flex-wrap gap-2">
                        {selectedRequest.servicesApplied.map((service, index) => (
                          <Badge 
                            key={index} 
                            bg="white" 
                            text="dark" 
                            className="border px-3 py-2 fw-normal"
                          >
                            ✓ {service}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="mb-0 text-muted">No services applied yet.</p>
                    )}
                  </div>
                </div>

                {/* Privacy Notice */}
                <div className="bg-warning bg-opacity-10 border border-warning rounded-3 p-3 mt-4">
                  <div className="d-flex align-items-start gap-2">
                    <span>🔒</span>
                    <p className="mb-0 small text-muted">
                      <strong className="text-dark">Privacy Notice:</strong> Detailed personal information 
                      about the child and family will only be visible after you accept this collaboration request.
                    </p>
                  </div>
                </div>

                {/* Modal Footer Actions */}
                <div className="d-flex justify-content-end gap-2 mt-4 pt-3 border-top">
                  <Button
                    variant="outline-secondary"
                    onClick={() => setShowSummaryModal(false)}
                    className="rounded-pill px-4"
                    disabled={isProcessing}
                  >
                    Close
                  </Button>
                  <Button
                    variant="outline-danger"
                    className="rounded-pill px-4"
                    onClick={() => {
                      setRejectTargetId(selectedRequest.collaborationId)
                      setRejectReason('')
                      setRejectError(null)
                      setShowRejectModal(true)
                    }}
                    disabled={isProcessing}
                  >
                    {isProcessing ? <Spinner size="sm" animation="border" /> : 'Reject'}
                  </Button>
                  <Button
                    variant="success"
                    className="rounded-pill px-4"
                    onClick={() => handleAccept(selectedRequest.collaborationId)}
                    disabled={isProcessing}
                  >
                    {isProcessing ? <Spinner size="sm" animation="border" /> : 'Accept Collaboration'}
                  </Button>
                </div>
              </div>
            )
          })()}
        </Modal.Body>
      </Modal>

      {/* Reject reason modal */}
      <Modal
        show={showRejectModal}
        onHide={() => {
          if (processingId) return
          setShowRejectModal(false)
          setRejectError(null)
          setRejectReason('')
          setRejectReasonPreset('')
        }}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title className="fw-700">Reject collaboration request</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="small text-muted mb-3">
            Please select a reason for rejecting this collaboration. The owner social worker may see this message.
          </p>
          <div className="mb-3">
            <label className="small fw-600 text-muted d-block mb-1">Reason (required)</label>
            <div className="d-flex flex-column gap-1 small">
              <Form.Check
                type="radio"
                id="reject-workload"
                label="Workload high"
                checked={rejectReasonPreset === 'WORKLOAD'}
                disabled={!!processingId}
                onChange={() => {
                  setRejectReasonPreset('WORKLOAD')
                  setRejectReason('Workload high / not able to take more cases at the moment.')
                  setRejectError(null)
                }}
              />
              <Form.Check
                type="radio"
                id="reject-specialization"
                label="Not my specialization"
                checked={rejectReasonPreset === 'SPECIALIZATION'}
                disabled={!!processingId}
                onChange={() => {
                  setRejectReasonPreset('SPECIALIZATION')
                  setRejectReason('Not my specialization / another worker may be better suited.')
                  setRejectError(null)
                }}
              />
              <Form.Check
                type="radio"
                id="reject-district"
                label="Not my district"
                checked={rejectReasonPreset === 'DISTRICT'}
                disabled={!!processingId}
                onChange={() => {
                  setRejectReasonPreset('DISTRICT')
                  setRejectReason('Not my district / outside my service area.')
                  setRejectError(null)
                }}
              />
              <Form.Check
                type="radio"
                id="reject-other"
                label="Other"
                checked={rejectReasonPreset === 'OTHER'}
                disabled={!!processingId}
                onChange={() => {
                  setRejectReasonPreset('OTHER')
                  setRejectError(null)
                }}
              />
            </div>
          </div>

          {rejectReasonPreset === 'OTHER' && (
            <div className="mb-3">
              <label className="small fw-600 text-muted">Details (optional)</label>
              <textarea
                className="form-control"
                rows={3}
                value={rejectReason}
                onChange={(e) => {
                  setRejectReason(e.target.value)
                  if (rejectError) setRejectError(null)
                }}
                disabled={!!processingId}
              />
            </div>
          )}

          {rejectError && <div className="text-danger small mt-1">{rejectError}</div>}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="outline-secondary"
            onClick={() => {
              if (processingId) return
              setShowRejectModal(false)
              setRejectError(null)
              setRejectReason('')
              setRejectReasonPreset('')
            }}
            disabled={!!processingId}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              if (!rejectTargetId) return
              void handleReject(rejectTargetId, rejectReason)
            }}
            disabled={!!processingId}
          >
            {processingId ? 'Rejecting…' : 'Reject request'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Past Collaboration Summary Modal (Read-Only) */}
      <Modal
        show={showPastSummaryModal}
        onHide={() => setShowPastSummaryModal(false)}
        centered
        size="lg"
      >
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fw-700">
            <span className="me-2">📜</span>
            Collaboration Summary
            <Badge bg="secondary" className="ms-2 fw-normal" style={{ fontSize: '0.7rem' }}>
              Read Only
            </Badge>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="pt-2">
          {selectedPastCollab && (
            <div>
              {/* Request Info Header */}
              <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 pb-3 border-bottom">
                <div>
                  <span className="text-muted small">Request ID</span>
                  <h5 className="fw-700 mb-0">{selectedPastCollab.requestId}</h5>
                  <span className="small text-muted">Owner: {selectedPastCollab.ownerName}</span>
                </div>
                <div className="d-flex flex-column align-items-end gap-2">
                  <Badge bg={CATEGORY_VARIANTS[selectedPastCollab.category]} className="px-3 py-2">
                    {CATEGORY_LABELS[selectedPastCollab.category]}
                  </Badge>
                  <Badge bg={OUTCOME_VARIANTS[selectedPastCollab.outcome]} className="px-3 py-2">
                    {OUTCOME_LABELS[selectedPastCollab.outcome]}
                  </Badge>
                </div>
              </div>

              {/* Completion Info */}
              <div className="d-flex flex-wrap gap-4 mb-4 p-3 bg-light rounded-3">
                <div>
                  <span className="text-muted small d-block">Completion Date</span>
                  <span className="fw-600">{formatDate(selectedPastCollab.completionDate)}</span>
                </div>
                <div>
                  <span className="text-muted small d-block">Your Contribution</span>
                  <span className="fw-600">{CONTRIBUTION_LABELS[selectedPastCollab.contribution]}</span>
                </div>
              </div>

              {/* Problem Summary */}
              <div className="mb-4">
                <h6 className="fw-700 text-dark mb-2">
                  <span className="me-2">📝</span>
                  Problem Summary
                </h6>
                <div className="bg-light rounded-3 p-3">
                  <p className="mb-0 text-dark">{selectedPastCollab.problemSummary}</p>
                </div>
              </div>

              {/* Your Actions */}
              <div className="mb-4">
                <h6 className="fw-700 text-dark mb-2">
                  <span className="me-2">✅</span>
                  Your Actions
                </h6>
                <div className="bg-light rounded-3 p-3">
                  {selectedPastCollab.yourActions.length > 0 ? (
                    <ul className="mb-0 ps-3">
                      {selectedPastCollab.yourActions.map((action, index) => (
                        <li key={index} className="mb-1">{action}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mb-0 text-muted">No actions recorded.</p>
                  )}
                </div>
              </div>

              {/* Final Notes */}
              <div className="mb-3">
                <h6 className="fw-700 text-dark mb-2">
                  <span className="me-2">📋</span>
                  Final Notes
                </h6>
                <div className="bg-light rounded-3 p-3">
                  <p className="mb-0 text-dark">{selectedPastCollab.finalNotes}</p>
                </div>
              </div>

              {/* Archive Notice */}
              <div className="bg-secondary bg-opacity-10 border border-secondary rounded-3 p-3 mt-4">
                <div className="d-flex align-items-start gap-2">
                  <span>📂</span>
                  <p className="mb-0 small text-muted">
                    <strong className="text-dark">Archived Record:</strong> This collaboration has been completed 
                    and archived. The information shown here is read-only and serves as a historical record of your contribution.
                  </p>
                </div>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer className="border-0 pt-0">
          <Button
            variant="outline-secondary"
            onClick={() => setShowPastSummaryModal(false)}
            className="rounded-pill px-4"
          >
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  )
}
