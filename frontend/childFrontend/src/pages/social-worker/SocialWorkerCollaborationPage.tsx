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
import './SocialWorkerDashboard.css'

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
        .catch(() => { })
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
        <div
          className="text-center py-5 rounded-3"
          style={{
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            border: '2px solid rgba(59, 130, 246, 0.2)'
          }}
        >
          <Spinner animation="border" style={{ color: '#3b82f6' }} />
          <p className="mt-3 mb-0 fw-semibold" style={{ color: '#1e40af' }}>Loading collaboration requests...</p>
        </div>
      ) : requestsError ? (
        <div
          className="text-center py-5 rounded-3"
          style={{
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            border: '2px solid rgba(239, 68, 68, 0.2)'
          }}
        >
          <span style={{ fontSize: '3rem' }}>⚠️</span>
          <p className="mt-3 mb-0 fw-semibold" style={{ color: '#991b1b' }}>{requestsError}</p>
        </div>
      ) : newRequests.length === 0 ? (
        <div
          className="text-center py-5 rounded-3"
          style={{
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            border: '2px dashed rgba(59, 130, 246, 0.3)'
          }}
        >
          <span style={{ fontSize: '3rem' }}>📭</span>
          <p className="mt-3 mb-1 fw-semibold" style={{ color: '#1e40af' }}>No new collaboration requests</p>
          <p className="mb-0 small" style={{ color: '#3b82f6' }}>You're all caught up!</p>
        </div>
      ) : (
        <>
          <div
            className="p-3 rounded-3 mb-4"
            style={{
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
              border: '1px solid rgba(59, 130, 246, 0.2)'
            }}
          >
            <p className="mb-0 small fw-semibold" style={{ color: '#1e40af' }}>
              ℹ️ Another social worker invited you to collaborate on these requests. You have not accepted or rejected them yet.
            </p>
          </div>
          <Row className="g-4">
            {newRequests.map((request) => {
              const category = (request.requestCategory?.toUpperCase() || 'OTHER') as CollaborationRequest['requestCategory']
              const role = (request.permission?.toUpperCase() || 'VIEW_ONLY') as CollaborationRequest['requestedRole']
              const isProcessing = processingId === request.collaborationId
              const requestId =
                request.requestTrackingId || request.requestId || request.helpRequestId || '-'

              return (
                <Col xs={12} md={6} key={request.collaborationId}>
                  <Card
                    className="h-100 border-0 shadow-sm"
                    style={{
                      background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-5px)';
                      e.currentTarget.style.boxShadow = '0 12px 24px rgba(59, 130, 246, 0.2)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '';
                    }}
                  >
                    <Card.Body className="d-flex flex-column justify-content-between">
                      <div>
                        <div className="d-flex justify-content-between align-items-start mb-3">
                          <div>
                            <div className="small fw-semibold mb-1" style={{ color: '#1e40af' }}>
                              📋 Request ID
                            </div>
                            <div className="fw-bold h5 mb-0" style={{ color: '#1e3a8a' }}>{requestId}</div>
                          </div>
                          <Badge
                            className="rounded-pill"
                            style={{
                              backgroundColor: '#3b82f6',
                              fontSize: '0.75rem',
                              padding: '0.4rem 0.8rem'
                            }}
                          >
                            {CATEGORY_LABELS[category] || request.requestCategory || 'Other'}
                          </Badge>
                        </div>

                        <div
                          className="p-2 rounded-3 mb-2"
                          style={{
                            backgroundColor: 'rgba(255, 255, 255, 0.6)',
                            border: '1px solid rgba(59, 130, 246, 0.2)'
                          }}
                        >
                          <div className="small mb-1">
                            <span className="fw-semibold" style={{ color: '#1e40af' }}>🏷️ Category:</span>{' '}
                            <span style={{ color: '#1e3a8a' }}>
                              {CATEGORY_LABELS[category] || request.requestCategory || 'Other'}
                            </span>
                          </div>
                          <div className="small mb-1">
                            <span className="fw-semibold" style={{ color: '#1e40af' }}>👤 Owner:</span>{' '}
                            <span style={{ color: '#1e3a8a' }}>
                              {request.ownerName || 'Social Worker'}
                            </span>
                          </div>
                          <div className="small mb-1">
                            <span className="fw-semibold" style={{ color: '#1e40af' }}>🎯 Requested Role:</span>{' '}
                            <Badge
                              className="ms-1 rounded-pill"
                              style={{
                                backgroundColor: '#06b6d4',
                                fontSize: '0.7rem',
                                padding: '0.25rem 0.5rem'
                              }}
                            >
                              {ROLE_LABELS[role] || request.permission || 'View Only'}
                            </Badge>
                          </div>
                          <div className="small">
                            <span className="fw-semibold" style={{ color: '#1e40af' }}>📅 Requested:</span>{' '}
                            <span style={{ color: '#1e3a8a' }}>
                              {request.requestedAt ? formatDate(request.requestedAt) : '-'}
                            </span>
                          </div>
                        </div>

                        <div
                          className="p-3 rounded-3"
                          style={{
                            backgroundColor: 'rgba(59, 130, 246, 0.1)',
                            border: '1px solid rgba(59, 130, 246, 0.2)'
                          }}
                        >
                          <div className="small fw-semibold mb-1" style={{ color: '#1e40af' }}>
                            💬 Reason for collaboration
                          </div>
                          <div className="small" style={{ color: '#1e3a8a', minHeight: 48 }}>
                            {request.reason || 'No reason provided'}
                          </div>
                        </div>
                      </div>

                      <div className="d-flex flex-column gap-2 mt-3">
                        <Button
                          size="sm"
                          onClick={() => handleViewSummary(request)}
                          disabled={isProcessing}
                          style={{
                            backgroundColor: 'rgba(107, 114, 128, 0.1)',
                            color: '#4b5563',
                            border: '1px solid rgba(107, 114, 128, 0.3)',
                            fontWeight: '600'
                          }}
                        >
                          👁️ View Summary
                        </Button>
                        <div className="d-flex gap-2">
                          <Button
                            size="sm"
                            className="flex-grow-1"
                            onClick={() => handleAccept(request.collaborationId)}
                            disabled={isProcessing}
                            style={{
                              background: 'linear-gradient(135deg, #10b981 0%, #22c55e 100%)',
                              color: 'white',
                              border: 'none',
                              fontWeight: '600'
                            }}
                          >
                            {isProcessing ? <Spinner size="sm" animation="border" /> : '✅ Accept'}
                          </Button>
                          <Button
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
                            style={{
                              backgroundColor: 'rgba(239, 68, 68, 0.1)',
                              color: '#dc2626',
                              border: '1px solid rgba(239, 68, 68, 0.3)',
                              fontWeight: '600'
                            }}
                          >
                            {isProcessing ? <Spinner size="sm" animation="border" /> : '❌ Reject'}
                          </Button>
                        </div>
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
        <div
          className="text-center py-5 rounded-3"
          style={{
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            border: '2px solid rgba(59, 130, 246, 0.2)'
          }}
        >
          <Spinner animation="border" style={{ color: '#3b82f6' }} />
          <p className="mt-3 mb-0 fw-semibold" style={{ color: '#1e40af' }}>Loading active collaborations...</p>
        </div>
      ) : activeError ? (
        <div
          className="text-center py-5 rounded-3"
          style={{
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            border: '2px solid rgba(239, 68, 68, 0.2)'
          }}
        >
          <span style={{ fontSize: '3rem' }}>⚠️</span>
          <p className="mt-3 mb-0 fw-semibold" style={{ color: '#991b1b' }}>{activeError}</p>
        </div>
      ) : activeCollaborations.length === 0 ? (
        <div
          className="text-center py-5 rounded-3"
          style={{
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            border: '2px dashed rgba(59, 130, 246, 0.3)'
          }}
        >
          <span style={{ fontSize: '3rem' }}>📂</span>
          <p className="mt-3 mb-1 fw-semibold" style={{ color: '#1e40af' }}>No active collaborations</p>
          <p className="mb-0 small" style={{ color: '#3b82f6' }}>Start collaborating by accepting requests from the New Requests tab</p>
        </div>
      ) : (
        <div className="table-responsive">
          <Table hover className="align-middle mb-0">
            <thead>
              <tr
                style={{
                  background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                  color: 'white'
                }}
              >
                <th className="fw-600 small py-3 ps-3" style={{ color: 'white' }}>📋 Request ID</th>
                <th className="fw-600 small py-3" style={{ color: 'white' }}>🎯 Role</th>
                <th className="fw-600 small py-3" style={{ color: 'white' }}>👤 Owner</th>
                <th className="fw-600 small py-3" style={{ color: 'white' }}>🏷️ Category</th>
                <th className="fw-600 small py-3 text-center" style={{ color: 'white' }}>📝 Pending Tasks</th>
                <th className="fw-600 small py-3" style={{ color: 'white' }}>🕒 Last Update</th>
                <th className="fw-600 small py-3" style={{ color: 'white' }}>⚡ Priority</th>
                <th className="fw-600 small py-3" style={{ color: 'white' }}>✓ Status</th>
              </tr>
            </thead>
            <tbody>
              {activeCollaborations.map((collab, index) => (
                <tr
                  key={collab.id}
                  className="border-bottom"
                  onClick={() => handleRowClick(collab.helpRequestId)}
                  style={{
                    cursor: 'pointer',
                    backgroundColor: index % 2 === 0 ? 'rgba(59, 130, 246, 0.05)' : 'white',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.1)';
                    e.currentTarget.style.transform = 'scale(1.01)';
                    e.currentTarget.style.boxShadow = '0 4px 8px rgba(59, 130, 246, 0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = index % 2 === 0 ? 'rgba(59, 130, 246, 0.05)' : 'white';
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <td className="py-3 ps-3">
                    <span className="fw-bold" style={{ color: '#3b82f6' }}>
                      {collab.trackingId || collab.requestId}
                    </span>
                  </td>
                  <td className="py-3">
                    <Badge
                      className="rounded-pill"
                      style={{
                        backgroundColor: '#06b6d4',
                        fontSize: '0.75rem',
                        padding: '0.4rem 0.8rem'
                      }}
                    >
                      {ROLE_LABELS[collab.role]}
                    </Badge>
                  </td>
                  <td className="py-3">
                    <span className="small fw-semibold" style={{ color: '#1e40af' }}>{collab.ownerName}</span>
                  </td>
                  <td className="py-3">
                    <Badge
                      className="rounded-pill"
                      style={{
                        backgroundColor: '#3b82f6',
                        fontSize: '0.75rem',
                        padding: '0.4rem 0.8rem'
                      }}
                    >
                      {CATEGORY_LABELS[collab.category]}
                    </Badge>
                  </td>
                  <td className="py-3 text-center">
                    {collab.pendingTasks > 0 ? (
                      <Badge
                        pill
                        style={{
                          backgroundColor: '#ef4444',
                          fontSize: '0.75rem',
                          padding: '0.4rem 0.6rem',
                          animation: 'pulse 2s infinite'
                        }}
                      >
                        {collab.pendingTasks}
                      </Badge>
                    ) : (
                      <span style={{ color: '#6b7280', fontSize: '1.2rem' }}>—</span>
                    )}
                  </td>
                  <td className="py-3">
                    <span className="small fw-semibold" style={{ color: '#6b7280' }}>
                      {formatRelativeTime(collab.lastUpdate)}
                    </span>
                  </td>
                  <td className="py-3">
                    {(() => {
                      const p = getCollaborationPriority(collab.pendingTasks)
                      const colors = {
                        HIGH: { bg: '#ef4444', text: 'white' },
                        MEDIUM: { bg: '#f59e0b', text: 'white' },
                        LOW: { bg: '#9ca3af', text: 'white' }
                      }
                      return (
                        <Badge
                          className="rounded-pill"
                          style={{
                            backgroundColor: colors[p as keyof typeof colors].bg,
                            color: colors[p as keyof typeof colors].text,
                            fontSize: '0.75rem',
                            padding: '0.4rem 0.8rem'
                          }}
                        >
                          {p.charAt(0) + p.slice(1).toLowerCase()}
                        </Badge>
                      )
                    })()}
                  </td>
                  <td className="py-3">
                    <Badge
                      className="rounded-pill"
                      style={{
                        backgroundColor: '#22c55e',
                        fontSize: '0.75rem',
                        padding: '0.4rem 0.8rem'
                      }}
                    >
                      {STATUS_LABELS[collab.status]}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>

          {/* Quick Actions Legend */}
          <div
            className="rounded-3 p-4 mt-4"
            style={{
              background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
              border: '2px solid rgba(59, 130, 246, 0.2)'
            }}
          >
            <div className="d-flex align-items-center gap-2 mb-3">
              <span style={{ fontSize: '1.5rem' }}>ℹ️</span>
              <span className="fw-bold" style={{ color: '#1e40af' }}>As a Collaborator, you can:</span>
            </div>
            <div className="d-flex flex-wrap gap-3 mb-3">
              <span
                className="px-3 py-2 rounded-pill small fw-semibold"
                style={{
                  backgroundColor: 'rgba(59, 130, 246, 0.2)',
                  color: '#1e40af'
                }}
              >
                📝 Add internal note
              </span>
              <span
                className="px-3 py-2 rounded-pill small fw-semibold"
                style={{
                  backgroundColor: 'rgba(59, 130, 246, 0.2)',
                  color: '#1e40af'
                }}
              >
                🔗 Assign resource
              </span>
              <span
                className="px-3 py-2 rounded-pill small fw-semibold"
                style={{
                  backgroundColor: 'rgba(59, 130, 246, 0.2)',
                  color: '#1e40af'
                }}
              >
                💬 Send message
              </span>
              <span
                className="px-3 py-2 rounded-pill small fw-semibold"
                style={{
                  backgroundColor: 'rgba(59, 130, 246, 0.2)',
                  color: '#1e40af'
                }}
              >
                ⏰ Add follow-up
              </span>
              <span
                className="px-3 py-2 rounded-pill small fw-semibold"
                style={{
                  backgroundColor: 'rgba(59, 130, 246, 0.2)',
                  color: '#1e40af'
                }}
              >
                📎 Upload document
              </span>
            </div>
            <div
              className="px-3 py-2 rounded-3 small fw-semibold d-inline-block"
              style={{
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                color: '#dc2626',
                border: '1px solid rgba(239, 68, 68, 0.2)'
              }}
            >
              🚫 Note: Collaborators cannot close cases
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
          <div
            className="p-3 rounded-3 mb-3"
            style={{
              background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
              border: '2px solid rgba(59, 130, 246, 0.2)'
            }}
          >
            <h6 className="fw-bold mb-0" style={{ color: '#1e40af' }}>✅ Active Collaborations</h6>
          </div>
          <div className="table-responsive">
            <Table hover size="sm" className="align-middle mb-0">
              <thead>
                <tr
                  style={{
                    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                    color: 'white'
                  }}
                >
                  <th className="fw-600 small py-3 ps-3" style={{ color: 'white' }}>📋 Request ID</th>
                  <th className="fw-600 small py-3" style={{ color: 'white' }}>👤 Owner</th>
                  <th className="fw-600 small py-3" style={{ color: 'white' }}>🏷️ Category</th>
                  <th className="fw-600 small py-3" style={{ color: 'white' }}>🎯 Role</th>
                  <th className="fw-600 small py-3" style={{ color: 'white' }}>✓ Status</th>
                  <th className="fw-600 small py-3 pe-3 text-end" style={{ color: 'white' }}>⚙️ Actions</th>
                </tr>
              </thead>
              <tbody>
                {activeCollaborations.map((collab, index) => (
                  <tr
                    key={collab.id}
                    className="border-bottom"
                    style={{
                      backgroundColor: index % 2 === 0 ? 'rgba(59, 130, 246, 0.05)' : 'white'
                    }}
                  >
                    <td className="py-3 ps-3">
                      <span className="fw-bold" style={{ color: '#3b82f6' }}>
                        {collab.trackingId || collab.requestId}
                      </span>
                    </td>
                    <td className="py-3 small fw-semibold" style={{ color: '#1e40af' }}>{collab.ownerName}</td>
                    <td className="py-3">
                      <Badge
                        className="rounded-pill"
                        style={{
                          backgroundColor: '#3b82f6',
                          fontSize: '0.7rem',
                          padding: '0.3rem 0.7rem'
                        }}
                      >
                        {CATEGORY_LABELS[collab.category]}
                      </Badge>
                    </td>
                    <td className="py-3">
                      <Badge
                        className="rounded-pill"
                        style={{
                          backgroundColor: '#06b6d4',
                          fontSize: '0.7rem',
                          padding: '0.3rem 0.7rem'
                        }}
                      >
                        {ROLE_LABELS[collab.role]}
                      </Badge>
                    </td>
                    <td className="py-3">
                      <Badge
                        className="rounded-pill"
                        style={{
                          backgroundColor: '#10b981',
                          fontSize: '0.7rem',
                          padding: '0.3rem 0.7rem'
                        }}
                      >
                        Active
                      </Badge>
                    </td>
                    <td className="py-3 pe-3 text-end">
                      <div className="d-flex justify-content-end gap-2">
                        <Button
                          size="sm"
                          className="rounded-pill px-3"
                          onClick={() => handleRowClick(collab.helpRequestId)}
                          style={{
                            backgroundColor: 'rgba(59, 130, 246, 0.1)',
                            color: '#3b82f6',
                            border: '1px solid rgba(59, 130, 246, 0.3)',
                            fontWeight: '600',
                            fontSize: '0.8rem'
                          }}
                        >
                          👁️ View
                        </Button>
                        {collab.ownerUserId &&
                          currentUserId &&
                          collab.ownerUserId !== currentUserId && (
                            <Button
                              size="sm"
                              className="rounded-pill px-3"
                              onClick={() => handleMessageWorker(collab.ownerUserId)}
                              style={{
                                backgroundColor: 'rgba(107, 114, 128, 0.1)',
                                color: '#6b7280',
                                border: '1px solid rgba(107, 114, 128, 0.3)',
                                fontWeight: '600',
                                fontSize: '0.8rem'
                              }}
                            >
                              💬 Message
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
        <div
          className="text-center py-5 rounded-3"
          style={{
            backgroundColor: 'rgba(107, 114, 128, 0.1)',
            border: '2px dashed rgba(107, 114, 128, 0.3)'
          }}
        >
          <span style={{ fontSize: '3rem' }}>📜</span>
          <p className="mt-3 mb-1 fw-semibold" style={{ color: '#374151' }}>No past collaborations found</p>
          <p className="mb-0 small" style={{ color: '#6b7280' }}>Completed collaborations will appear here</p>
        </div>
      ) : (
        <div>
          {/* Summary Stats */}
          <Row className="g-3 mb-4">
            <Col xs={6} md={3}>
              <div
                className="rounded-3 p-3 text-center shadow-sm"
                style={{
                  background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
                  border: '2px solid rgba(59, 130, 246, 0.2)'
                }}
              >
                <div className="fw-bold h3 mb-1" style={{ color: '#1e40af' }}>
                  {pastCollaborations.length}
                </div>
                <div className="small fw-semibold" style={{ color: '#3b82f6' }}>📊 Total Collaborations</div>
              </div>
            </Col>
            <Col xs={6} md={3}>
              <div
                className="rounded-3 p-3 text-center shadow-sm"
                style={{
                  background: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)',
                  border: '2px solid rgba(16, 185, 129, 0.2)'
                }}
              >
                <div className="fw-bold h3 mb-1" style={{ color: '#065f46' }}>
                  {pastCollaborations.filter(c => c.outcome === 'RESOLVED').length}
                </div>
                <div className="small fw-semibold" style={{ color: '#10b981' }}>✅ Resolved</div>
              </div>
            </Col>
            <Col xs={6} md={3}>
              <div
                className="rounded-3 p-3 text-center shadow-sm"
                style={{
                  background: 'linear-gradient(135deg, #fed7aa 0%, #fdba74 100%)',
                  border: '2px solid rgba(245, 158, 11, 0.2)'
                }}
              >
                <div className="fw-bold h3 mb-1" style={{ color: '#92400e' }}>
                  {pastCollaborations.filter(c => c.outcome === 'PARTIAL').length}
                </div>
                <div className="small fw-semibold" style={{ color: '#f59e0b' }}>⚠️ Partial</div>
              </div>
            </Col>
            <Col xs={6} md={3}>
              <div
                className="rounded-3 p-3 text-center shadow-sm"
                style={{
                  background: 'linear-gradient(135deg, #fecaca 0%, #fca5a5 100%)',
                  border: '2px solid rgba(239, 68, 68, 0.2)'
                }}
              >
                <div className="fw-bold h3 mb-1" style={{ color: '#991b1b' }}>
                  {pastCollaborations.filter(c => c.outcome === 'ESCALATED').length}
                </div>
                <div className="small fw-semibold" style={{ color: '#ef4444' }}>🚨 Escalated</div>
              </div>
            </Col>
          </Row>

          {/* Table */}
          <div className="table-responsive">
            <Table hover className="align-middle mb-0">
              <thead>
                <tr
                  style={{
                    background: 'linear-gradient(135deg, #6b7280 0%, #9ca3af 100%)',
                    color: 'white'
                  }}
                >
                  <th className="fw-600 small py-3 ps-3" style={{ color: 'white' }}>📋 Request ID</th>
                  <th className="fw-600 small py-3" style={{ color: 'white' }}>👤 Owner</th>
                  <th className="fw-600 small py-3" style={{ color: 'white' }}>🏷️ Category</th>
                  <th className="fw-600 small py-3" style={{ color: 'white' }}>🎯 Your Contribution</th>
                  <th className="fw-600 small py-3" style={{ color: 'white' }}>📅 Completion Date</th>
                  <th className="fw-600 small py-3 pe-3" style={{ color: 'white' }}>✓ Outcome</th>
                </tr>
              </thead>
              <tbody>
                {pastCollaborations.map((collab, index) => (
                  <tr
                    key={collab.id}
                    onClick={() => handleViewPastSummary(collab)}
                    className="border-bottom"
                    style={{
                      cursor: 'pointer',
                      backgroundColor: index % 2 === 0 ? 'rgba(107, 114, 128, 0.05)' : 'white',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(107, 114, 128, 0.1)';
                      e.currentTarget.style.transform = 'scale(1.01)';
                      e.currentTarget.style.boxShadow = '0 4px 8px rgba(107, 114, 128, 0.15)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = index % 2 === 0 ? 'rgba(107, 114, 128, 0.05)' : 'white';
                      e.currentTarget.style.transform = 'scale(1)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <td className="py-3 ps-3">
                      <span className="fw-bold" style={{ color: '#6b7280' }}>{collab.requestId}</span>
                    </td>
                    <td className="py-3">
                      <span className="small fw-semibold" style={{ color: '#4b5563' }}>{collab.ownerName}</span>
                    </td>
                    <td className="py-3">
                      <Badge
                        className="rounded-pill"
                        style={{
                          backgroundColor: '#6b7280',
                          fontSize: '0.75rem',
                          padding: '0.4rem 0.8rem'
                        }}
                      >
                        {CATEGORY_LABELS[collab.category]}
                      </Badge>
                    </td>
                    <td className="py-3">
                      <span className="small fw-semibold" style={{ color: '#4b5563' }}>
                        {CONTRIBUTION_LABELS[collab.contribution]}
                      </span>
                    </td>
                    <td className="py-3">
                      <span className="small fw-semibold" style={{ color: '#6b7280' }}>
                        {formatDate(collab.completionDate)}
                      </span>
                    </td>
                    <td className="py-3 pe-3">
                      <Badge
                        className="rounded-pill"
                        style={{
                          backgroundColor: collab.outcome === 'RESOLVED' ? '#10b981' :
                            collab.outcome === 'PARTIAL' ? '#f59e0b' : '#ef4444',
                          fontSize: '0.75rem',
                          padding: '0.4rem 0.8rem'
                        }}
                      >
                        {OUTCOME_LABELS[collab.outcome]}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>

          {/* Info Note */}
          <div
            className="rounded-3 p-4 mt-4"
            style={{
              background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
              border: '2px solid rgba(59, 130, 246, 0.2)'
            }}
          >
            <div className="d-flex align-items-start gap-3">
              <span style={{ fontSize: '1.5rem' }}>📋</span>
              <div>
                <p className="mb-0 fw-semibold" style={{ color: '#1e40af' }}>
                  History & Accountability
                </p>
                <p className="mb-0 small" style={{ color: '#3b82f6' }}>
                  This record shows all your past collaboration contributions.
                  Click on any row to view a read-only summary of your involvement.
                </p>
              </div>
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
          <div
            className="p-4 rounded-3 shadow-sm position-relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
              color: 'white'
            }}
          >
            {/* Decorative pattern */}
            <div
              style={{
                position: 'absolute',
                top: -50,
                right: -50,
                width: '200px',
                height: '200px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(255, 255, 255, 0.2) 0%, transparent 70%)',
                pointerEvents: 'none'
              }}
            />
            <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 position-relative">
              <div className="d-flex align-items-center gap-3">
                <div
                  className="d-flex align-items-center justify-content-center"
                  style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '12px',
                    background: 'rgba(255, 255, 255, 0.25)',
                    backdropFilter: 'blur(10px)'
                  }}
                >
                  <span style={{ fontSize: '2rem' }}>🤝</span>
                </div>
                <div>
                  <h1 className="h2 fw-bold mb-1">Collaboration Center</h1>
                  <p className="mb-0" style={{ opacity: 0.95, fontSize: '0.95rem' }}>
                    Collaborate with other social workers on shared requests
                  </p>
                </div>
              </div>
              <Button
                size="sm"
                onClick={() => setShowCreateModal(true)}
                className="btn-light d-flex align-items-center gap-2"
                style={{
                  fontWeight: '600',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                }}
              >
                <span style={{ fontSize: '1.2rem' }}>➕</span> New Collaboration
              </Button>
            </div>
          </div>
        </Col>
      </Row>

      {/* Tabs */}
      <Row className="mb-4">
        <Col xs={12}>
          <div
            className="p-3 rounded-3 shadow-sm mb-3"
            style={{ background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)' }}
          >
            <div className="d-flex flex-wrap gap-2">
              <button
                type="button"
                className={`btn text-decoration-none px-4 py-2 rounded-pill fw-600 d-flex align-items-center gap-2`}
                onClick={() => setActiveTab('new')}
                style={{
                  background: activeTab === 'new'
                    ? 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)'
                    : 'rgba(255, 255, 255, 0.6)',
                  color: activeTab === 'new' ? 'white' : '#1e40af',
                  border: `2px solid ${activeTab === 'new' ? '#3b82f6' : 'rgba(59, 130, 246, 0.2)'}`,
                  boxShadow: activeTab === 'new' ? '0 4px 6px rgba(59, 130, 246, 0.3)' : 'none',
                  transition: 'all 0.3s ease'
                }}
              >
                <span>🔔</span> New Requests
                {newRequests.length > 0 && (
                  <Badge
                    pill
                    className="ms-1"
                    style={{
                      backgroundColor: activeTab === 'new' ? 'rgba(255, 255, 255, 0.3)' : '#ef4444',
                      fontSize: '0.65rem',
                      padding: '0.25rem 0.5rem'
                    }}
                  >
                    {newRequests.length}
                  </Badge>
                )}
              </button>
              <button
                type="button"
                className={`btn text-decoration-none px-4 py-2 rounded-pill fw-600 d-flex align-items-center gap-2`}
                onClick={() => setActiveTab('participating')}
                style={{
                  background: activeTab === 'participating'
                    ? 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)'
                    : 'rgba(255, 255, 255, 0.6)',
                  color: activeTab === 'participating' ? 'white' : '#1e40af',
                  border: `2px solid ${activeTab === 'participating' ? '#3b82f6' : 'rgba(59, 130, 246, 0.2)'}`,
                  boxShadow: activeTab === 'participating' ? '0 4px 6px rgba(59, 130, 246, 0.3)' : 'none',
                  transition: 'all 0.3s ease'
                }}
              >
                <span>✅</span> Active Collaborations
              </button>
              <button
                type="button"
                className={`btn text-decoration-none px-4 py-2 rounded-pill fw-600 d-flex align-items-center gap-2`}
                onClick={() => setActiveTab('past')}
                style={{
                  background: activeTab === 'past'
                    ? 'linear-gradient(135deg, #6b7280 0%, #9ca3af 100%)'
                    : 'rgba(255, 255, 255, 0.6)',
                  color: activeTab === 'past' ? 'white' : '#1e40af',
                  border: `2px solid ${activeTab === 'past' ? '#3b82f6' : 'rgba(59, 130, 246, 0.2)'}`,
                  boxShadow: activeTab === 'past' ? '0 4px 6px rgba(59, 130, 246, 0.3)' : 'none',
                  transition: 'all 0.3s ease'
                }}
              >
                <span>📜</span> Past Collaborations
              </button>
            </div>
          </div>

          <Card className="border-0 shadow-sm">
            <Card.Body className="p-4">
              {activeTab === 'new' && renderNewRequestsTab()}
              {activeTab === 'participating' && renderParticipatingTab()}
              {activeTab === 'past' && renderAllCollaborationsTab()}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Create collaboration modal */}
      <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)} centered size="lg">
        <div style={{ borderRadius: '12px', overflow: 'hidden' }}>
          <Modal.Header
            closeButton
            style={{
              background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
              color: 'white',
              border: 'none'
            }}
          >
            <Modal.Title className="d-flex align-items-center gap-2">
              <span style={{ fontSize: '1.5rem' }}>➕</span>
              <span className="fw-bold">Create Collaboration</span>
            </Modal.Title>
          </Modal.Header>
          <Modal.Body style={{ backgroundColor: '#eff6ff' }}>
            <Row className="g-3">
              <Col xs={12} md={6}>
                <label className="small fw-semibold mb-1" style={{ color: '#1e40af' }}>
                  📋 Help Request *
                </label>
                <select
                  className="form-select"
                  value={createRequestId}
                  onChange={(e) => setCreateRequestId(e.target.value)}
                  disabled={loadingMyRequests || (!!myRequestsError && eligibleRequests.length === 0)}
                  style={{
                    border: '2px solid rgba(59, 130, 246, 0.3)',
                    borderRadius: '8px'
                  }}
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
                <div className="form-text small" style={{ color: '#047857' }}>
                  Shows requests assigned to you that are accepted/active but not completed.
                </div>
                {myRequestsError && (
                  <div
                    className="small mt-2 p-2 rounded-3"
                    style={{
                      backgroundColor: 'rgba(239, 68, 68, 0.1)',
                      color: '#dc2626',
                      border: '1px solid rgba(239, 68, 68, 0.2)'
                    }}
                  >
                    {myRequestsError}
                  </div>
                )}
              </Col>
              <Col xs={12} md={6}>
                <label className="small fw-semibold mb-1" style={{ color: '#1e40af' }}>
                  🎯 Permission
                </label>
                <select
                  className="form-select"
                  value={createPermission}
                  onChange={(e) => setCreatePermission(e.target.value as CollaborationPermission)}
                  style={{
                    border: '2px solid rgba(59, 130, 246, 0.3)',
                    borderRadius: '8px'
                  }}
                >
                  <option value="FULL_ACCESS">Full Access</option>
                  <option value="VIEW_ONLY">View Only</option>
                  <option value="SERVICE_ONLY">Service Only</option>
                </select>
              </Col>
              <Col xs={12}>
                <label className="small fw-semibold mb-1" style={{ color: '#1e40af' }}>
                  💬 Reason *
                </label>
                <textarea
                  className="form-control"
                  rows={3}
                  value={createReason}
                  onChange={(e) => setCreateReason(e.target.value)}
                  placeholder="Explain why you need this collaborator"
                  style={{
                    border: '2px solid rgba(59, 130, 246, 0.3)',
                    borderRadius: '8px'
                  }}
                />
              </Col>
            </Row>

            <hr style={{ borderColor: 'rgba(59, 130, 246, 0.2)', margin: '1.5rem 0' }} />
            <h6 className="fw-bold mb-3" style={{ color: '#1e40af' }}>
              👥 Select Social Worker (availability & specialization)
            </h6>
            <Row className="g-3 mb-3">
              <Col xs={12} md={4}>
                <label className="small fw-semibold mb-1" style={{ color: '#1e3a8a' }}>
                  🔍 Search
                </label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Name"
                  value={swSearch}
                  onChange={(e) => setSwSearch(e.target.value)}
                  style={{
                    border: '2px solid rgba(59, 130, 246, 0.3)',
                    borderRadius: '8px'
                  }}
                />
              </Col>
              <Col xs={6} md={4}>
                <label className="small fw-semibold mb-1" style={{ color: '#1e3a8a' }}>
                  📊 Availability
                </label>
                <select
                  className="form-select"
                  value={swAvailability}
                  onChange={(e) => setSwAvailability(e.target.value as typeof swAvailability)}
                  style={{
                    border: '2px solid rgba(59, 130, 246, 0.3)',
                    borderRadius: '8px'
                  }}
                >
                  <option value="ALL">All</option>
                  <option value="AVAILABLE">Available</option>
                  <option value="BUSY">Busy</option>
                  <option value="ON_LEAVE">On Leave</option>
                </select>
              </Col>
              <Col xs={6} md={4}>
                <label className="small fw-semibold mb-1" style={{ color: '#1e3a8a' }}>
                  🎓 Specialization
                </label>
                <select
                  className="form-select"
                  value={swSpecialization}
                  onChange={(e) => setSwSpecialization(e.target.value)}
                  style={{
                    border: '2px solid rgba(59, 130, 246, 0.3)',
                    borderRadius: '8px'
                  }}
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

            <div
              className="table-responsive rounded-3"
              style={{
                maxHeight: 320,
                overflowY: 'auto',
                border: '2px solid rgba(59, 130, 246, 0.2)'
              }}
            >
              <Table hover size="sm" className="align-middle mb-0">
                <thead>
                  <tr
                    style={{
                      background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                      color: 'white'
                    }}
                  >
                    <th className="fw-semibold small py-3" style={{ color: 'white' }}>👤 Name</th>
                    <th className="fw-semibold small py-3" style={{ color: 'white' }}>📊 Availability</th>
                    <th className="fw-semibold small py-3" style={{ color: 'white' }}>🎓 Specializations</th>
                    <th className="fw-semibold small py-3 text-end" style={{ color: 'white' }}>✓ Select</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSW.length === 0 && (
                    <tr>
                      <td colSpan={4} className="text-center py-4">
                        <span style={{ color: '#6b7280' }}>No social workers match your filters.</span>
                      </td>
                    </tr>
                  )}
                  {filteredSW.map((sw, index) => (
                    <tr
                      key={sw.userId}
                      style={{
                        backgroundColor: index % 2 === 0 ? 'rgba(16, 185, 129, 0.05)' : 'white'
                      }}
                    >
                      <td className="fw-semibold small" style={{ color: '#065f46' }}>{sw.fullName}</td>
                      <td>
                        <Badge
                          className="rounded-pill"
                          style={{
                            backgroundColor: sw.availabilityStatus === 'AVAILABLE' ? '#10b981' :
                              sw.availabilityStatus === 'BUSY' ? '#f59e0b' : '#6b7280',
                            fontSize: '0.7rem',
                            padding: '0.3rem 0.7rem'
                          }}
                        >
                          {sw.availabilityStatus || 'Unknown'}
                        </Badge>
                      </td>
                      <td className="small" style={{ color: '#047857' }}>
                        {(sw.specializations || []).join(', ') || '—'}
                      </td>
                      <td className="text-end">
                        <input
                          type="radio"
                          name="sw-select"
                          value={sw.userId}
                          checked={selectedSwUserId === sw.userId}
                          onChange={() => setSelectedSwUserId(sw.userId)}
                          style={{
                            cursor: 'pointer',
                            accentColor: '#10b981',
                            width: '18px',
                            height: '18px'
                          }}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
            {createError && (
              <div
                className="py-2 px-3 small mt-3 mb-0 rounded-3"
                style={{
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  color: '#dc2626',
                  border: '2px solid rgba(239, 68, 68, 0.2)'
                }}
              >
                ⚠️ {createError}
              </div>
            )}
          </Modal.Body>
          <Modal.Footer style={{ backgroundColor: '#f0fdf4', borderTop: '2px solid rgba(16, 185, 129, 0.2)' }}>
            <Button
              onClick={() => setShowCreateModal(false)}
              style={{
                backgroundColor: 'rgba(107, 114, 128, 0.1)',
                color: '#4b5563',
                border: '2px solid rgba(107, 114, 128, 0.3)',
                fontWeight: '600',
                borderRadius: '8px'
              }}
            >
              Cancel
            </Button>
            <Button
              disabled={createSubmitting}
              onClick={handleCreateCollaboration}
              style={{
                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                color: 'white',
                border: 'none',
                fontWeight: '600',
                borderRadius: '8px'
              }}
            >
              {createSubmitting ? '⏳ Sending…' : '✉️ Send Collaboration Request'}
            </Button>
          </Modal.Footer>
        </div>
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
