import { useEffect, useMemo, useState } from 'react'
import { Card, Container, Row, Col, Badge, Button, Form, Table, Modal, Spinner } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import {
  getAssignedRequests,
  getMyFollowUps,
  getTransfersByUser,
  getMyPendingCollaborationRequests,
  getMyActiveCollaborationRequests,
  acceptHelpRequest,
  declineHelpRequest,
  updateRequestStatus,
  getAvailableSocialWorkers,
  requestHelpRequestTransfer,
  type FollowUpDTO,
  type TransferRequestDTO,
  type PendingCollaborationRequestDTO,
} from '../../services/socialWorkerApi'
import type { HelpRequestDTO, HelpType, RequestStatus } from '../../types/dashboard'
import { HELP_TYPE_LABELS } from '../../types/dashboard'
import VerticalTimeline from '../../components/ui/VerticalTimeline'
import type { TimelineStep } from '../../components/ui/HorizontalTimeline'
import './SocialWorkerDashboard.css'

type AssignedTab = 'pending' | 'active' | 'reassigned' | 'transfers' | 'collaborations' | 'completed' | 'rejected'
type TransferSubTab = 'pending' | 'approved' | 'rejected'

const formatDateTime = (iso?: string) => {
  if (!iso) return ''
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleString()
}

const getPriorityVariant = (priority?: string) => {
  const p = priority?.toUpperCase()
  if (p === 'HIGH') return 'danger'
  if (p === 'MEDIUM') return 'warning'
  if (p === 'LOW') return 'primary'
  return 'secondary'
}

const getStatusVariant = (status?: string) => {
  switch (status) {
    case 'TRANSFERRED':
    case 'TRANSFER_REQUESTED':
      return 'info'
    case 'ASSIGNED':
      return 'info'
    case 'IN_PROGRESS':
      return 'primary'
    case 'COMPLETED':
      return 'success'
    case 'REJECTED':
    case 'CANCELLED':
      return 'secondary'
    default:
      return 'light'
  }
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

const maskRequester = (req: HelpRequestDTO): string => {
  if (req.anonymous) return 'Anonymous'
  return req.requesterName || req.requesterId || 'Unknown'
}

export function SocialWorkerRequestsPage() {
  const { user } = useAuth()
  const navigate = useNavigate()

  // Data state
  const [requests, setRequests] = useState<HelpRequestDTO[]>([])
  const [followUps, setFollowUps] = useState<FollowUpDTO[]>([])
  const [transfers, setTransfers] = useState<TransferRequestDTO[]>([])
  const [pendingCollaborations, setPendingCollaborations] = useState<PendingCollaborationRequestDTO[]>([])
  const [activeCollaborations, setActiveCollaborations] = useState<PendingCollaborationRequestDTO[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Tab and UI state
  const [activeTab, setActiveTab] = useState<AssignedTab>('pending')
  const [transferSubTab, setTransferSubTab] = useState<TransferSubTab>('pending')
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  
  // Action state
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [showTransferModal, setShowTransferModal] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [transferTargetSwId, setTransferTargetSwId] = useState('')
  const [transferReason, setTransferReason] = useState('')
  const [submitting, setSubmitting] = useState(false)
  
  // SW list for transfer
  const [availableSW, setAvailableSW] = useState<
    Array<{ userId: string; fullName: string; availabilityStatus?: string; specializations?: string[]; serviceArea?: string }>
  >([])

  useEffect(() => {
    if (!user?.userId) {
      setLoading(false)
      return
    }

    let isMounted = true

    const loadData = async () => {
      try {
        setLoading(true)
        const [assignedRequests, myFollowUps, userTransfers, pendingCollab, activeCollab, socialWorkers] = await Promise.all([
          getAssignedRequests(user.userId),
          getMyFollowUps().catch(() => []),
          getTransfersByUser(user.userId).catch(() => []),
          getMyPendingCollaborationRequests().catch(() => []),
          getMyActiveCollaborationRequests().catch(() => []),
          getAvailableSocialWorkers().catch(() => []),
        ])

        if (!isMounted) return

        setRequests(Array.isArray(assignedRequests) ? assignedRequests : [])
        setFollowUps(Array.isArray(myFollowUps) ? myFollowUps : [])
        setTransfers(Array.isArray(userTransfers) ? userTransfers : [])
        setPendingCollaborations(Array.isArray(pendingCollab) ? pendingCollab : [])
        setActiveCollaborations(Array.isArray(activeCollab) ? activeCollab : [])
        setAvailableSW(Array.isArray(socialWorkers) ? socialWorkers : [])
        setError(null)
      } catch (err) {
        console.error('Failed to load assigned requests', err)
        if (isMounted) {
          setError((err as Error).message ?? 'Failed to load assigned requests')
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    loadData()

    return () => {
      isMounted = false
    }
  }, [user?.userId])

  // Categorize requests by tab
  const transferRequestIds = useMemo(() => {
    const ids = new Set<string>()
    transfers.forEach((t) => {
      if (t.entityId) ids.add(t.entityId)
    })
    return ids
  }, [transfers])

  const pendingRequests = useMemo(() => {
    return requests.filter((r) => r.status === 'ASSIGNED' && !transferRequestIds.has(r.id))
  }, [requests, transferRequestIds])

  const activeRequests = useMemo(() => {
    return requests.filter((r) => r.status === 'IN_PROGRESS')
  }, [requests])

  const reassignedRequests = useMemo(() => {
    // Requests that were reassigned to current user after rejection by another SW
    return [] as HelpRequestDTO[]
  }, [])

  const completedRequests = useMemo(() => {
    return requests.filter((r) => r.status === 'COMPLETED')
  }, [requests])

  const rejectedRequests = useMemo(() => {
    return requests.filter((r) => r.status === 'REJECTED')
  }, [requests])

  // Categorize transfers by status
  const pendingTransfers = useMemo(() => {
    return transfers.filter((t) => t.status === 'PENDING' || t.status === 'REQUESTED')
  }, [transfers])

  const approvedTransfers = useMemo(() => {
    return transfers.filter((t) => t.status === 'APPROVED' || t.status === 'ACCEPTED')
  }, [transfers])

  const rejectedTransfers = useMemo(() => {
    return transfers.filter((t) => t.status === 'REJECTED' || t.status === 'DECLINED')
  }, [transfers])

  const selectedRequest = useMemo(
    () => requests.find((r) => r.id === selectedRequestId) ?? null,
    [requests, selectedRequestId]
  )

  const resolveTransferTargetName = (transfer: TransferRequestDTO): string => {
    const directName =
      (transfer as any).requestedAssigneeName ||
      transfer.toUserName ||
      (transfer as any).toUserName ||
      (transfer as any).requestedAssigneeFullName
    if (directName && String(directName).trim()) {
      return String(directName)
    }

    const targetId = transfer.toUserId || (transfer as any).requestedAssigneeId
    if (targetId) {
      const matchedWorker = availableSW.find((sw) => sw.userId === targetId)
      if (matchedWorker?.fullName) {
        return matchedWorker.fullName
      }
    }

    return 'N/A'
  }

  const resolveTransferProcessedDate = (transfer: TransferRequestDTO): string => {
    return (
      transfer.processedAt ||
      (transfer as any).processedAt ||
      (transfer as any).approvedDate ||
      (transfer as any).rejectedDate ||
      (transfer as any).updatedDate ||
      ''
    )
  }

  const getCollabRequestIdLabel = (collab: any, req?: HelpRequestDTO): string => {
    return req?.trackingId || collab?.requestTrackingId || collab?.requestId || collab?.helpRequestId || 'N/A'
  }

  const getCollabTypeLabel = (collab: any, req?: HelpRequestDTO): string => {
    if (req?.helpType) {
      return `${getHelpTypeIcon(req.helpType)} ${HELP_TYPE_LABELS[req.helpType] ?? req.helpType}`
    }
    const category = collab?.requestCategory
    if (category && HELP_TYPE_LABELS[category as HelpType]) {
      return `${getHelpTypeIcon(category as HelpType)} ${HELP_TYPE_LABELS[category as HelpType]}`
    }
    return category || 'Unknown'
  }

  const getCollabPrimarySwName = (collab: any): string => {
    return collab?.primarySwName || collab?.ownerName || collab?.ownerUserId || 'Primary SW'
  }

  const getCollabPrimarySwId = (collab: any): string => {
    return collab?.primarySwId || collab?.ownerUserId || 'N/A'
  }

  const getCollabStartedAt = (collab: any, req?: HelpRequestDTO): string => {
    return (
      collab?.startedAt ||
      collab?.createdDate ||
      collab?.createdAt ||
      collab?.requestedAt ||
      req?.requestDate ||
      ''
    )
  }

  // Build timeline steps from help request
  const buildTimelineSteps = (req: HelpRequestDTO): TimelineStep[] => {
    const steps: TimelineStep[] = []

    steps.push({
      id: 'requested',
      label: 'Requested',
      status: ['REQUESTED', 'UNDER_REVIEW', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED'].includes(req.status || 'REQUESTED') ? 'completed' : 'pending',
      date: req.requestDate ? new Date(req.requestDate).toLocaleDateString() : undefined,
      icon: '📝',
    })

    steps.push({
      id: 'assigned',
      label: 'Assigned',
      status: ['ASSIGNED', 'IN_PROGRESS', 'COMPLETED'].includes(req.status || 'REQUESTED') ? 'completed' : 'pending',
      icon: '✓',
    })

    steps.push({
      id: 'progress',
      label: 'In Progress',
      status: req.status === 'IN_PROGRESS' ? 'active' : ['COMPLETED'].includes(req.status || 'REQUESTED') ? 'completed' : 'pending',
      icon: '⚙️',
    })

    steps.push({
      id: 'completed',
      label: 'Completed',
      status: req.status === 'COMPLETED' ? 'completed' : 'pending',
      icon: '✅',
    })

    return steps
  }

  const handleViewDetails = (req: HelpRequestDTO) => {
    setSelectedRequestId(req.id)
    setShowDetailsModal(true)
  }

  const handleAccept = async (req: HelpRequestDTO) => {
    setSubmitting(true)
    try {
      await acceptHelpRequest(req.id)
      // Reload data
      if (user?.userId) {
        const assignedRequests = await getAssignedRequests(user.userId)
        setRequests(Array.isArray(assignedRequests) ? assignedRequests : [])
      }
      setShowDetailsModal(false)
      setActiveTab('active')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to accept request')
    } finally {
      setSubmitting(false)
    }
  }

  const handleReject = (req: HelpRequestDTO) => {
    setSelectedRequestId(req.id)
    setShowRejectModal(true)
    setRejectReason('')
    setShowDetailsModal(false)
  }

  const handleRejectSubmit = async () => {
    if (!selectedRequestId || !rejectReason.trim()) {
      return
    }
    setSubmitting(true)
    try {
      await declineHelpRequest(selectedRequestId, rejectReason.trim())
      // Reload data
      if (user?.userId) {
        const assignedRequests = await getAssignedRequests(user.userId)
        setRequests(Array.isArray(assignedRequests) ? assignedRequests : [])
      }
      setShowRejectModal(false)
      setActiveTab('rejected')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reject request')
    } finally {
      setSubmitting(false)
    }
  }

  const handleTransfer = (req: HelpRequestDTO) => {
    setSelectedRequestId(req.id)
    setShowTransferModal(true)
    setTransferTargetSwId('')
    setTransferReason('')
    setShowDetailsModal(false)
    // Load available social workers
    if (availableSW.length === 0) {
      getAvailableSocialWorkers()
        .then((list) => setAvailableSW(Array.isArray(list) ? list : []))
        .catch(() => setAvailableSW([]))
    }
  }

  const handleTransferSubmit = async () => {
    if (!selectedRequestId || !transferTargetSwId || !transferReason.trim()) {
      return
    }
    setSubmitting(true)
    try {
      await requestHelpRequestTransfer({
        helpRequestId: selectedRequestId,
        requestedAssigneeId: transferTargetSwId,
        reason: transferReason.trim()
      })
      // Reload data
      if (user?.userId) {
        const [assignedRequests, userTransfers] = await Promise.all([
          getAssignedRequests(user.userId),
          getTransfersByUser(user.userId).catch(() => [])
        ])
        setRequests(Array.isArray(assignedRequests) ? assignedRequests : [])
        setTransfers(Array.isArray(userTransfers) ? userTransfers : [])
      }
      setShowTransferModal(false)
      setActiveTab('transfers')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit transfer request')
    } finally {
      setSubmitting(false)
    }
  }

  // Render tab content
  const renderTabContent = () => {
    if (loading) {
      return (
        <Card className="border-0 shadow-sm">
          <Card.Body className="text-center py-5">
            <Spinner animation="border" variant="primary" />
            <p className="text-muted mt-3">Loading requests...</p>
          </Card.Body>
        </Card>
      )
    }

    switch (activeTab) {
      case 'pending':
        return renderPendingTab()
      case 'active':
        return renderActiveTab()
      case 'reassigned':
        return renderReassignedTab()
      case 'transfers':
        return renderTransfersTab()
      case 'collaborations':
        return renderCollaborationsTab()
      case 'completed':
        return renderCompletedTab()
      case 'rejected':
        return renderRejectedTab()
      default:
        return null
    }
  }

  const renderPendingTab = () => {
    if (pendingRequests.length === 0) {
      return (
        <Card 
          className="border-0 shadow-sm"
          style={{ background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)' }}
        >
          <Card.Body className="text-center py-5">
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📭</div>
            <h4 style={{ color: '#1e40af' }}>No Pending Requests</h4>
            <p className="text-muted">All newly assigned requests will appear here</p>
          </Card.Body>
        </Card>
      )
    }

    return (
      <Card 
        className="border-0 shadow-sm"
        style={{ background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)' }}
      >
        <Card.Body className="p-0">
          <div className="table-responsive">
            <Table hover className="mb-0" style={{ backgroundColor: 'transparent' }}>
              <thead style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', color: 'white' }}>
                <tr>
                  <th style={{ padding: '1rem', borderBottom: 'none', fontWeight: '600' }}>
                    🆔 ID
                  </th>
                  <th style={{ padding: '1rem', borderBottom: 'none', fontWeight: '600' }}>
                    📋 Type
                  </th>
                  <th style={{ padding: '1rem', borderBottom: 'none', fontWeight: '600' }}>
                    ⚠️ Priority
                  </th>
                  <th style={{ padding: '1rem', borderBottom: 'none', fontWeight: '600' }}>
                    👤 Requester
                  </th>
                  <th style={{ padding: '1rem', borderBottom: 'none', fontWeight: '600' }}>
                    📅 Assigned Date
                  </th>
                  <th style={{ padding: '1rem', borderBottom: 'none', fontWeight: '600', textAlign: 'center' }}>
                    ⚡ Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {pendingRequests.map((req, index) => (
                  <tr 
                    key={req.id}
                    style={{ 
                      backgroundColor: index % 2 === 0 ? 'rgba(255, 255, 255, 0.8)' : 'rgba(219, 234, 254, 0.4)',
                      transition: 'all 0.2s ease',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'scale(1.01)'
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.2)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'scale(1)'
                      e.currentTarget.style.boxShadow = 'none'
                    }}
                  >
                    <td style={{ padding: '1rem', fontWeight: '600', color: '#1e40af' }}>
                      {req.trackingId || req.id}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <Badge 
                        style={{ 
                          background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                          padding: '0.5rem 0.75rem',
                          fontSize: '0.85rem',
                          fontWeight: '500',
                          borderRadius: '6px'
                        }}
                      >
                        {getHelpTypeIcon(req.helpType)} {req.helpType ? HELP_TYPE_LABELS[req.helpType] : 'Unknown'}
                      </Badge>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <Badge 
                        bg={getPriorityVariant(req.priority)}
                        style={{ 
                          padding: '0.5rem 0.75rem',
                          fontSize: '0.85rem',
                          fontWeight: '500',
                          borderRadius: '6px'
                        }}
                      >
                        {(req.priority || 'LOW').toUpperCase()}
                      </Badge>
                    </td>
                    <td style={{ padding: '1rem', color: '#78350f' }}>
                      {maskRequester(req)}
                    </td>
                    <td style={{ padding: '1rem', color: '#78350f' }}>
                      {formatDateTime(req.requestDate)}
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                      <div className="d-flex gap-2 justify-content-center">
                        <Button
                          size="sm"
                          onClick={() => handleViewDetails(req)}
                          style={{
                            background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                            border: 'none',
                            borderRadius: '6px',
                            padding: '0.375rem 0.75rem',
                            fontWeight: '500',
                            boxShadow: '0 2px 4px rgba(59, 130, 246, 0.3)',
                            transition: 'all 0.2s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-2px)'
                            e.currentTarget.style.boxShadow = '0 4px 8px rgba(59, 130, 246, 0.4)'
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)'
                            e.currentTarget.style.boxShadow = '0 2px 4px rgba(59, 130, 246, 0.3)'
                          }}
                        >
                          👁️ View
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>
    )
  }

  const renderActiveTab = () => {
    if (activeRequests.length === 0) {
      return (
        <Card 
          className="border-0 shadow-sm"
          style={{ background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)' }}
        >
          <Card.Body className="text-center py-5">
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📭</div>
            <h4 style={{ color: '#1e40af' }}>No Active Requests</h4>
            <p className="text-muted">Accepted requests will appear here</p>
          </Card.Body>
        </Card>
      )
    }

    return (
      <Card 
        className="border-0 shadow-sm"
        style={{ background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)' }}
      >
        <Card.Body className="p-0">
          <div className="table-responsive">
            <Table hover className="mb-0" style={{ backgroundColor: 'transparent' }}>
              <thead style={{ background: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)', color: 'white' }}>
                <tr>
                  <th style={{ padding: '1rem', borderBottom: 'none', fontWeight: '600' }}>
                    🆔 ID
                  </th>
                  <th style={{ padding: '1rem', borderBottom: 'none', fontWeight: '600' }}>
                    📋 Type
                  </th>
                  <th style={{ padding: '1rem', borderBottom: 'none', fontWeight: '600' }}>
                    ⚠️ Priority
                  </th>
                  <th style={{ padding: '1rem', borderBottom: 'none', fontWeight: '600' }}>
                    🔄 Stage
                  </th>
                  <th style={{ padding: '1rem', borderBottom: 'none', fontWeight: '600' }}>
                    📌 Next Action
                  </th>
                  <th style={{ padding: '1rem', borderBottom: 'none', fontWeight: '600', textAlign: 'center' }}>
                    ⚡ Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {activeRequests.map((req, index) => (
                  <tr 
                    key={req.id}
                    style={{ 
                      backgroundColor: index % 2 === 0 ? 'rgba(255, 255, 255, 0.8)' : 'rgba(191, 219, 254, 0.4)',
                      transition: 'all 0.2s ease',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'scale(1.01)'
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(37, 99, 235, 0.2)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'scale(1)'
                      e.currentTarget.style.boxShadow = 'none'
                    }}
                  >
                    <td style={{ padding: '1rem', fontWeight: '600', color: '#1e40af' }}>
                      {req.trackingId || req.id}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <Badge 
                        style={{ 
                          background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                          padding: '0.5rem 0.75rem',
                          fontSize: '0.85rem',
                          fontWeight: '500',
                          borderRadius: '6px'
                        }}
                      >
                        {getHelpTypeIcon(req.helpType)} {req.helpType ? HELP_TYPE_LABELS[req.helpType] : 'Unknown'}
                      </Badge>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <Badge 
                        bg={getPriorityVariant(req.priority)}
                        style={{ 
                          padding: '0.5rem 0.75rem',
                          fontSize: '0.85rem',
                          fontWeight: '500',
                          borderRadius: '6px'
                        }}
                      >
                        {(req.priority || 'LOW').toUpperCase()}
                      </Badge>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <Badge 
                        style={{ 
                          background: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)',
                          padding: '0.5rem 0.75rem',
                          fontSize: '0.85rem',
                          fontWeight: '500',
                          borderRadius: '6px'
                        }}
                      >
                        🔄 In Progress
                      </Badge>
                    </td>
                    <td style={{ padding: '1rem', color: '#1e40af', fontWeight: '500' }}>
                      Follow-up / Assessment
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <div className="d-flex gap-2 justify-content-center flex-wrap">
                        <Button
                          size="sm"
                          onClick={() => navigate(`/social-worker/requests/${req.id}`)}
                          style={{
                            background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                            border: 'none',
                            borderRadius: '6px',
                            padding: '0.375rem 0.75rem',
                            fontWeight: '500',
                            boxShadow: '0 2px 4px rgba(59, 130, 246, 0.3)',
                            transition: 'all 0.2s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-2px)'
                            e.currentTarget.style.boxShadow = '0 4px 8px rgba(59, 130, 246, 0.4)'
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)'
                            e.currentTarget.style.boxShadow = '0 2px 4px rgba(59, 130, 246, 0.3)'
                          }}
                        >
                          👁️ View
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>
    )
  }

  const renderReassignedTab = () => {
    if (reassignedRequests.length === 0) {
      return (
        <Card 
          className="border-0 shadow-sm"
          style={{ background: 'linear-gradient(135deg, #dbeafe 0%, #bae6fd 100%)' }}
        >
          <Card.Body className="text-center py-5">
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔄</div>
            <h4 style={{ color: '#1e40af' }}>No Reassigned Requests</h4>
            <p className="text-muted">Requests reassigned to you after rejection by another SW will appear here</p>
          </Card.Body>
        </Card>
      )
    }

    return (
      <Card 
        className="border-0 shadow-sm"
        style={{ background: 'linear-gradient(135deg, #dbeafe 0%, #bae6fd 100%)' }}
      >
        <Card.Body className="p-0">
          <div className="table-responsive">
            <Table hover className="mb-0" style={{ backgroundColor: 'transparent' }}>
              <thead style={{ background: 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%)', color: 'white' }}>
                <tr>
                  <th style={{ padding: '1rem', borderBottom: 'none', fontWeight: '600' }}>
                    🆔 ID
                  </th>
                  <th style={{ padding: '1rem', borderBottom: 'none', fontWeight: '600' }}>
                    📋 Type
                  </th>
                  <th style={{ padding: '1rem', borderBottom: 'none', fontWeight: '600' }}>
                    ⚠️ Priority
                  </th>
                  <th style={{ padding: '1rem', borderBottom: 'none', fontWeight: '600' }}>
                    👤 Previous SW
                  </th>
                  <th style={{ padding: '1rem', borderBottom: 'none', fontWeight: '600' }}>
                    📝 Reason
                  </th>
                  <th style={{ padding: '1rem', borderBottom: 'none', fontWeight: '600' }}>
                    📅 Reassigned Date
                  </th>
                  <th style={{ padding: '1rem', borderBottom: 'none', fontWeight: '600', textAlign: 'center' }}>
                    ⚡ Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {reassignedRequests.map((req, index) => (
                  <tr 
                    key={req.id}
                    style={{ 
                      backgroundColor: index % 2 === 0 ? 'rgba(255, 255, 255, 0.8)' : 'rgba(186, 230, 253, 0.4)',
                      transition: 'all 0.2s ease',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'scale(1.01)'
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(29, 78, 216, 0.2)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'scale(1)'
                      e.currentTarget.style.boxShadow = 'none'
                    }}
                  >
                    <td style={{ padding: '1rem' }}>
                      <div>
                        <div style={{ fontWeight: '600', color: '#1e40af', marginBottom: '0.25rem' }}>
                          {req.trackingId || req.id}
                        </div>
                        <Badge 
                          style={{ 
                            background: 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%)',
                            padding: '0.25rem 0.5rem',
                            fontSize: '0.75rem',
                            fontWeight: '500',
                            borderRadius: '4px'
                          }}
                        >
                          🔄 Reassigned
                        </Badge>
                      </div>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <Badge 
                        style={{ 
                          background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                          padding: '0.5rem 0.75rem',
                          fontSize: '0.85rem',
                          fontWeight: '500',
                          borderRadius: '6px'
                        }}
                      >
                        {getHelpTypeIcon(req.helpType)} {req.helpType ? HELP_TYPE_LABELS[req.helpType] : 'Unknown'}
                      </Badge>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <Badge 
                        bg={getPriorityVariant(req.priority)}
                        style={{ 
                          padding: '0.5rem 0.75rem',
                          fontSize: '0.85rem',
                          fontWeight: '500',
                          borderRadius: '6px'
                        }}
                      >
                        {(req.priority || 'LOW').toUpperCase()}
                      </Badge>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <div>
                        <div style={{ fontWeight: '600', color: '#1e40af', fontSize: '0.9rem' }}>
                          {(req as any).previousAssigneeName || 'Mr. Silva'}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#2563eb', marginTop: '0.25rem' }}>
                          SW ID: {(req as any).previousAssigneeId || 'SW-001'}
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <div 
                        style={{ 
                          padding: '0.5rem',
                          background: 'rgba(29, 78, 216, 0.1)',
                          borderRadius: '6px',
                          fontSize: '0.85rem',
                          color: '#1e40af',
                          fontStyle: 'italic'
                        }}
                      >
                        💼 {(req as any).reassignmentReason || 'Workload / Specialization mismatch'}
                      </div>
                    </td>
                    <td style={{ padding: '1rem', color: '#1e40af' }}>
                      {formatDateTime((req as any).reassignedDate || req.requestDate)}
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                      <div className="d-flex gap-2 justify-content-center">
                        <Button
                          size="sm"
                          onClick={() => handleViewDetails(req)}
                          style={{
                            background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                            border: 'none',
                            borderRadius: '6px',
                            padding: '0.375rem 0.75rem',
                            fontWeight: '500',
                            boxShadow: '0 2px 4px rgba(59, 130, 246, 0.3)',
                            transition: 'all 0.2s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-2px)'
                            e.currentTarget.style.boxShadow = '0 4px 8px rgba(59, 130, 246, 0.4)'
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)'
                            e.currentTarget.style.boxShadow = '0 2px 4px rgba(59, 130, 246, 0.3)'
                          }}
                        >
                          👁️ View
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleAccept(req)}
                          disabled={submitting}
                          style={{
                            background: 'linear-gradient(135deg, #10b981 0%, #22c55e 100%)',
                            border: 'none',
                            borderRadius: '6px',
                            padding: '0.375rem 0.75rem',
                            fontWeight: '500',
                            boxShadow: '0 2px 4px rgba(16, 185, 129, 0.3)',
                            transition: 'all 0.2s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-2px)'
                            e.currentTarget.style.boxShadow = '0 4px 8px rgba(16, 185, 129, 0.4)'
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)'
                            e.currentTarget.style.boxShadow = '0 2px 4px rgba(16, 185, 129, 0.3)'
                          }}
                        >
                          ✅ Accept
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleReject(req)}
                          disabled={submitting}
                          style={{
                            background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                            border: 'none',
                            borderRadius: '6px',
                            padding: '0.375rem 0.75rem',
                            fontWeight: '500',
                            boxShadow: '0 2px 4px rgba(239, 68, 68, 0.3)',
                            transition: 'all 0.2s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-2px)'
                            e.currentTarget.style.boxShadow = '0 4px 8px rgba(239, 68, 68, 0.4)'
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)'
                            e.currentTarget.style.boxShadow = '0 2px 4px rgba(239, 68, 68, 0.3)'
                          }}
                        >
                          ❌ Reject
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleTransfer(req)}
                          disabled={submitting}
                          style={{
                            background: 'linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)',
                            border: 'none',
                            borderRadius: '6px',
                            padding: '0.375rem 0.75rem',
                            fontWeight: '500',
                            boxShadow: '0 2px 4px rgba(139, 92, 246, 0.3)',
                            transition: 'all 0.2s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-2px)'
                            e.currentTarget.style.boxShadow = '0 4px 8px rgba(139, 92, 246, 0.4)'
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)'
                            e.currentTarget.style.boxShadow = '0 2px 4px rgba(139, 92, 246, 0.3)'
                          }}
                        >
                          🔄 Transfer
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>
    )
  }

  const renderTransfersTab = () => {
    return (
      <>
        {/* Transfer Sub-tabs */}
        <div 
          className="mb-3 p-2 rounded-3"
          style={{ background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)' }}
        >
          <div className="d-flex gap-2 flex-wrap">
              <button
                className={`btn ${transferSubTab === 'pending' ? 'active' : ''}`}
                onClick={() => setTransferSubTab('pending')}
                style={{
                  borderRadius: '8px',
                  padding: '0.5rem 1rem',
                  fontWeight: '600',
                  border: 'none',
                  transition: 'all 0.3s ease',
                  background: transferSubTab === 'pending' 
                    ? 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)'
                    : 'transparent',
                  color: transferSubTab === 'pending' ? 'white' : '#64748b',
                  boxShadow: transferSubTab === 'pending' ? '0 4px 6px rgba(59, 130, 246, 0.3)' : 'none'
                }}
              >
                ⏳ Pending {pendingTransfers.length > 0 && `(${pendingTransfers.length})`}
              </button>
              <button
                className={`btn ${transferSubTab === 'approved' ? 'active' : ''}`}
                onClick={() => setTransferSubTab('approved')}
                style={{
                  borderRadius: '8px',
                  padding: '0.5rem 1rem',
                  fontWeight: '600',
                  border: 'none',
                  transition: 'all 0.3s ease',
                  background: transferSubTab === 'approved' 
                    ? 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)'
                    : 'transparent',
                  color: transferSubTab === 'approved' ? 'white' : '#64748b',
                  boxShadow: transferSubTab === 'approved' ? '0 4px 6px rgba(37, 99, 235, 0.3)' : 'none'
                }}
              >
                ✅ Approved {approvedTransfers.length > 0 && `(${approvedTransfers.length})`}
              </button>
              <button
                className={`btn ${transferSubTab === 'rejected' ? 'active' : ''}`}
                onClick={() => setTransferSubTab('rejected')}
                style={{
                  borderRadius: '8px',
                  padding: '0.5rem 1rem',
                  fontWeight: '600',
                  border: 'none',
                  transition: 'all 0.3s ease',
                  background: transferSubTab === 'rejected' 
                    ? 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%)'
                    : 'transparent',
                  color: transferSubTab === 'rejected' ? 'white' : '#64748b',
                  boxShadow: transferSubTab === 'rejected' ? '0 4px 6px rgba(29, 78, 216, 0.3)' : 'none'
                }}
              >
                ❌ Rejected {rejectedTransfers.length > 0 && `(${rejectedTransfers.length})`}
              </button>
          </div>
        </div>

        {/* Transfer Sub-tab Content */}
        {transferSubTab === 'pending' && renderPendingTransfers()}
        {transferSubTab === 'approved' && renderApprovedTransfers()}
        {transferSubTab === 'rejected' && renderRejectedTransfers()}
      </>
    )
  }

  const renderPendingTransfers = () => {
    if (pendingTransfers.length === 0) {
      return (
        <Card 
          className="border-0 shadow-sm"
          style={{ background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)' }}
        >
          <Card.Body className="text-center py-5">
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏳</div>
            <h4 style={{ color: '#1e40af' }}>No Pending Transfers</h4>
            <p className="text-muted">Transfer requests waiting for admin approval will appear here</p>
          </Card.Body>
        </Card>
      )
    }

    return (
      <Card 
        className="border-0 shadow-sm"
        style={{ background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)' }}
      >
        <Card.Body className="p-0">
          <div className="table-responsive">
            <Table hover className="mb-0" style={{ backgroundColor: 'transparent' }}>
              <thead style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)', color: 'white' }}>
                <tr>
                  <th style={{ padding: '1rem', borderBottom: 'none', fontWeight: '600' }}>🆔 Request ID</th>
                  <th style={{ padding: '1rem', borderBottom: 'none', fontWeight: '600' }}>📋 Type</th>
                  <th style={{ padding: '1rem', borderBottom: 'none', fontWeight: '600' }}>👤 Transfer To</th>
                  <th style={{ padding: '1rem', borderBottom: 'none', fontWeight: '600' }}>💬 Reason</th>
                  <th style={{ padding: '1rem', borderBottom: 'none', fontWeight: '600' }}>📅 Requested Date</th>
                  <th style={{ padding: '1rem', borderBottom: 'none', fontWeight: '600' }}>🔔 Status</th>
                </tr>
              </thead>
              <tbody>
                {pendingTransfers.map((transfer, index) => {
                  const req = requests.find(r => r.id === transfer.entityId)
                  return (
                    <tr 
                      key={transfer.id}
                      style={{ 
                        backgroundColor: index % 2 === 0 ? 'rgba(255, 255, 255, 0.8)' : 'rgba(219, 234, 254, 0.4)',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <td style={{ padding: '1rem', fontWeight: '600', color: '#1e40af' }}>
                        {req?.trackingId || transfer.entityId}
                      </td>
                      <td style={{ padding: '1rem' }}>
                        {req && (
                          <Badge 
                            style={{ 
                              background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                              padding: '0.5rem 0.75rem',
                              fontSize: '0.85rem',
                              borderRadius: '6px'
                            }}
                          >
                            {getHelpTypeIcon(req.helpType)} {req.helpType ? HELP_TYPE_LABELS[req.helpType] : 'Unknown'}
                          </Badge>
                        )}
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <div>
                          <div style={{ fontWeight: '600', color: '#1e40af' }}>
                            {resolveTransferTargetName(transfer)}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#2563eb' }}>
                            ID: {transfer.toUserId || (transfer as any).requestedAssigneeId || 'N/A'}
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <div 
                          style={{ 
                            padding: '0.5rem',
                            background: 'rgba(59, 130, 246, 0.1)',
                            borderRadius: '6px',
                            fontSize: '0.85rem',
                            color: '#1e40af',
                            fontStyle: 'italic',
                            maxWidth: '250px'
                          }}
                        >
                          {(transfer as any).reason || 'No reason provided'}
                        </div>
                      </td>
                      <td style={{ padding: '1rem', color: '#2563eb' }}>
                        {formatDateTime((transfer as any).requestedDate || (transfer as any).createdDate)}
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <Badge 
                          style={{ 
                            background: 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)',
                            padding: '0.5rem 0.75rem',
                            fontSize: '0.85rem',
                            borderRadius: '6px'
                          }}
                        >
                          ⏳ Waiting Admin Approval
                        </Badge>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>
    )
  }

  const renderApprovedTransfers = () => {
    if (approvedTransfers.length === 0) {
      return (
        <Card 
          className="border-0 shadow-sm"
          style={{ background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)' }}
        >
          <Card.Body className="text-center py-5">
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
            <h4 style={{ color: '#1e40af' }}>No Approved Transfers</h4>
            <p className="text-muted">Admin-approved transfers (removed from your active cases) will appear here</p>
          </Card.Body>
        </Card>
      )
    }

    return (
      <Card 
        className="border-0 shadow-sm"
        style={{ background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)' }}
      >
        <Card.Body className="p-0">
          <div className="table-responsive">
            <Table hover className="mb-0" style={{ backgroundColor: 'transparent' }}>
              <thead style={{ background: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)', color: 'white' }}>
                <tr>
                  <th style={{ padding: '1rem', borderBottom: 'none', fontWeight: '600' }}>🆔 Request ID</th>
                  <th style={{ padding: '1rem', borderBottom: 'none', fontWeight: '600' }}>📋 Type</th>
                  <th style={{ padding: '1rem', borderBottom: 'none', fontWeight: '600' }}>👤 Transferred To</th>
                  <th style={{ padding: '1rem', borderBottom: 'none', fontWeight: '600' }}>💬 Reason</th>
                  <th style={{ padding: '1rem', borderBottom: 'none', fontWeight: '600' }}>✅ Approved Date</th>
                  <th style={{ padding: '1rem', borderBottom: 'none', fontWeight: '600' }}>🔔 Status</th>
                </tr>
              </thead>
              <tbody>
                {approvedTransfers.map((transfer, index) => {
                  const req = requests.find(r => r.id === transfer.entityId)
                  return (
                    <tr 
                      key={transfer.id}
                      style={{ 
                        backgroundColor: index % 2 === 0 ? 'rgba(255, 255, 255, 0.8)' : 'rgba(191, 219, 254, 0.4)',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <td style={{ padding: '1rem', fontWeight: '600', color: '#1e40af' }}>
                        {req?.trackingId || transfer.entityId}
                      </td>
                      <td style={{ padding: '1rem' }}>
                        {req && (
                          <Badge 
                            style={{ 
                              background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                              padding: '0.5rem 0.75rem',
                              fontSize: '0.85rem',
                              borderRadius: '6px'
                            }}
                          >
                            {getHelpTypeIcon(req.helpType)} {req.helpType ? HELP_TYPE_LABELS[req.helpType] : 'Unknown'}
                          </Badge>
                        )}
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <div>
                          <div style={{ fontWeight: '600', color: '#1e40af' }}>
                            {resolveTransferTargetName(transfer)}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#2563eb' }}>
                            ID: {transfer.toUserId || (transfer as any).requestedAssigneeId || 'N/A'}
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <div 
                          style={{ 
                            padding: '0.5rem',
                            background: 'rgba(37, 99, 235, 0.1)',
                            borderRadius: '6px',
                            fontSize: '0.85rem',
                            color: '#1e40af',
                            fontStyle: 'italic',
                            maxWidth: '250px'
                          }}
                        >
                          {(transfer as any).reason || 'No reason provided'}
                        </div>
                      </td>
                      <td style={{ padding: '1rem', color: '#2563eb' }}>
                        {formatDateTime(resolveTransferProcessedDate(transfer) || transfer.requestedAt)}
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <Badge 
                          style={{ 
                            background: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)',
                            padding: '0.5rem 0.75rem',
                            fontSize: '0.85rem',
                            borderRadius: '6px'
                          }}
                        >
                          ✅ Approved & Transferred
                        </Badge>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>
    )
  }

  const renderRejectedTransfers = () => {
    if (rejectedTransfers.length === 0) {
      return (
        <Card 
          className="border-0 shadow-sm"
          style={{ background: 'linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%)' }}
        >
          <Card.Body className="text-center py-5">
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>❌</div>
            <h4 style={{ color: '#1e3a8a' }}>No Rejected Transfers</h4>
            <p className="text-muted">Admin-rejected transfers (returned to your active cases) will appear here</p>
          </Card.Body>
        </Card>
      )
    }

    return (
      <Card 
        className="border-0 shadow-sm"
        style={{ background: 'linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%)' }}
      >
        <Card.Body className="p-0">
          <div className="table-responsive">
            <Table hover className="mb-0" style={{ backgroundColor: 'transparent' }}>
              <thead style={{ background: 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%)', color: 'white' }}>
                <tr>
                  <th style={{ padding: '1rem', borderBottom: 'none', fontWeight: '600' }}>🆔 Request ID</th>
                  <th style={{ padding: '1rem', borderBottom: 'none', fontWeight: '600' }}>📋 Type</th>
                  <th style={{ padding: '1rem', borderBottom: 'none', fontWeight: '600' }}>👤 Intended For</th>
                  <th style={{ padding: '1rem', borderBottom: 'none', fontWeight: '600' }}>💬 Your Reason</th>
                  <th style={{ padding: '1rem', borderBottom: 'none', fontWeight: '600' }}>❌ Admin Rejection Reason</th>
                  <th style={{ padding: '1rem', borderBottom: 'none', fontWeight: '600' }}>📅 Rejected Date</th>
                  <th style={{ padding: '1rem', borderBottom: 'none', fontWeight: '600' }}>🔔 Status</th>
                </tr>
              </thead>
              <tbody>
                {rejectedTransfers.map((transfer, index) => {
                  const req = requests.find(r => r.id === transfer.entityId)
                  return (
                    <tr 
                      key={transfer.id}
                      style={{ 
                        backgroundColor: index % 2 === 0 ? 'rgba(255, 255, 255, 0.8)' : 'rgba(254, 226, 226, 0.4)',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <td style={{ padding: '1rem', fontWeight: '600', color: '#991b1b' }}>
                        {req?.trackingId || transfer.entityId}
                      </td>
                      <td style={{ padding: '1rem' }}>
                        {req && (
                          <Badge 
                            style={{ 
                              background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                              padding: '0.5rem 0.75rem',
                              fontSize: '0.85rem',
                              borderRadius: '6px'
                            }}
                          >
                            {getHelpTypeIcon(req.helpType)} {req.helpType ? HELP_TYPE_LABELS[req.helpType] : 'Unknown'}
                          </Badge>
                        )}
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <div>
                          <div style={{ fontWeight: '600', color: '#991b1b' }}>
                            {resolveTransferTargetName(transfer)}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#b91c1c' }}>
                            ID: {transfer.toUserId || (transfer as any).requestedAssigneeId || 'N/A'}
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <div 
                          style={{ 
                            padding: '0.5rem',
                            background: 'rgba(239, 68, 68, 0.1)',
                            borderRadius: '6px',
                            fontSize: '0.85rem',
                            color: '#991b1b',
                            fontStyle: 'italic',
                            maxWidth: '200px'
                          }}
                        >
                          {(transfer as any).reason || 'No reason provided'}
                        </div>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <div 
                          style={{ 
                            padding: '0.5rem',
                            background: 'rgba(220, 38, 38, 0.15)',
                            border: '1px solid rgba(220, 38, 38, 0.3)',
                            borderRadius: '6px',
                            fontSize: '0.85rem',
                            color: '#7f1d1d',
                            fontWeight: '600',
                            maxWidth: '200px'
                          }}
                        >
                          {(transfer as any).rejectionReason || 'Admin did not approve this transfer'}
                        </div>
                      </td>
                      <td style={{ padding: '1rem', color: '#b91c1c' }}>
                        {formatDateTime(resolveTransferProcessedDate(transfer) || transfer.requestedAt)}
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <div>
                          <Badge 
                            style={{ 
                              background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                              padding: '0.5rem 0.75rem',
                              fontSize: '0.85rem',
                              borderRadius: '6px',
                              marginBottom: '0.25rem'
                            }}
                          >
                            ❌ Rejected
                          </Badge>
                          <div style={{ fontSize: '0.75rem', color: '#991b1b', fontWeight: '500' }}>
                            ↩️ Returned to Active
                          </div>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>
    )
  }

  const renderCollaborationsTab = () => {
    return (
      <>
        {/* Primary SW Section - You control these cases */}
        <Card 
          className="border-0 shadow-sm mb-4"
          style={{ background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)' }}
        >
          <Card.Header 
            style={{ 
              background: 'linear-gradient(135deg, #1e40af 0%, #1d4ed8 100%)',
              color: 'white',
              fontWeight: '600',
              borderBottom: 'none',
              padding: '1rem 1.5rem'
            }}
          >
            <div className="d-flex align-items-center gap-2">
              <span style={{ fontSize: '1.5rem' }}>👑</span>
              <span>Primary SW - You Control ({activeCollaborations.filter((c: any) => c.isPrimarySw).length})</span>
            </div>
            <div style={{ fontSize: '0.85rem', opacity: 0.9, marginTop: '0.25rem' }}>
              Cases where you invited others to collaborate
            </div>
          </Card.Header>
          <Card.Body className="p-0">
            {activeCollaborations.filter((c: any) => c.isPrimarySw).length === 0 ? (
              <div className="text-center py-5">
                <div style={{ fontSize: '2.5rem', marginBottom: '1rem', opacity: 0.5 }}>👥</div>
                <p className="text-muted mb-0">No cases where you're the primary SW with collaborators</p>
              </div>
            ) : (
              <div className="table-responsive">
                <Table hover className="mb-0" style={{ backgroundColor: 'transparent' }}>
                  <thead style={{ background: 'linear-gradient(135deg, #1e40af 0%, #1d4ed8 100%)', color: 'white' }}>
                    <tr>
                      <th style={{ padding: '1rem', borderBottom: 'none', fontWeight: '600' }}>🆔 Request ID</th>
                      <th style={{ padding: '1rem', borderBottom: 'none', fontWeight: '600' }}>📋 Type</th>
                      <th style={{ padding: '1rem', borderBottom: 'none', fontWeight: '600' }}>👥 Collaborators</th>
                      <th style={{ padding: '1rem', borderBottom: 'none', fontWeight: '600' }}>📅 Started</th>
                      <th style={{ padding: '1rem', borderBottom: 'none', fontWeight: '600', textAlign: 'center' }}>⚡ Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeCollaborations.filter((c: any) => c.isPrimarySw).map((collab: any, index: number) => {
                      const req = requests.find(r => r.id === collab.helpRequestId)
                      return (
                        <tr 
                          key={collab.id}
                          style={{ 
                            backgroundColor: index % 2 === 0 ? 'rgba(255, 255, 255, 0.8)' : 'rgba(219, 234, 254, 0.4)',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          <td style={{ padding: '1rem', fontWeight: '600', color: '#1e40af' }}>
                            {getCollabRequestIdLabel(collab, req)}
                          </td>
                          <td style={{ padding: '1rem' }}>
                            <Badge 
                              style={{ 
                                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                                padding: '0.5rem 0.75rem',
                                fontSize: '0.85rem',
                                borderRadius: '6px'
                              }}
                            >
                              {getCollabTypeLabel(collab, req)}
                            </Badge>
                          </td>
                          <td style={{ padding: '1rem' }}>
                            <div>
                              <Badge 
                                bg="primary" 
                                style={{ marginRight: '0.25rem', padding: '0.375rem 0.5rem', fontSize: '0.8rem' }}
                              >
                                👤 {collab.collaboratorName || collab.collaboratorId}
                              </Badge>
                            </div>
                          </td>
                          <td style={{ padding: '1rem', color: '#1e40af' }}>
                            {formatDateTime(getCollabStartedAt(collab, req))}
                          </td>
                          <td style={{ padding: '1rem', textAlign: 'center' }}>
                            <Button
                              size="sm"
                              onClick={() => navigate(`/social-worker/requests/${collab.helpRequestId}`)}
                              style={{
                                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                                border: 'none',
                                borderRadius: '6px',
                                padding: '0.375rem 0.75rem',
                                fontWeight: '500'
                              }}
                            >
                              👁️ Manage
                            </Button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </Table>
              </div>
            )}
          </Card.Body>
        </Card>

        {/* Collaborator Section - Limited permissions */}
        <Card 
          className="border-0 shadow-sm"
          style={{ background: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)' }}
        >
          <Card.Header 
            style={{ 
              background: 'linear-gradient(135deg, #10b981 0%, #22c55e 100%)',
              color: 'white',
              fontWeight: '600',
              borderBottom: 'none',
              padding: '1rem 1.5rem'
            }}
          >
            <div className="d-flex align-items-center gap-2">
              <span style={{ fontSize: '1.5rem' }}>🤝</span>
              <span>Collaborator - You Were Invited ({activeCollaborations.filter((c: any) => !c.isPrimarySw).length})</span>
            </div>
            <div style={{ fontSize: '0.85rem', opacity: 0.9, marginTop: '0.25rem' }}>
              Cases where another SW invited you to collaborate
            </div>
          </Card.Header>
          <Card.Body className="p-0">
            {activeCollaborations.filter((c: any) => !c.isPrimarySw).length === 0 ? (
              <div className="text-center py-5">
                <div style={{ fontSize: '2.5rem', marginBottom: '1rem', opacity: 0.5 }}>🤝</div>
                <p className="text-muted mb-0">No cases where you're a collaborator</p>
              </div>
            ) : (
              <div className="table-responsive">
                <Table hover className="mb-0" style={{ backgroundColor: 'transparent' }}>
                  <thead style={{ background: 'linear-gradient(135deg, #10b981 0%, #22c55e 100%)', color: 'white' }}>
                    <tr>
                      <th style={{ padding: '1rem', borderBottom: 'none', fontWeight: '600' }}>🆔 Request ID</th>
                      <th style={{ padding: '1rem', borderBottom: 'none', fontWeight: '600' }}>📋 Type</th>
                      <th style={{ padding: '1rem', borderBottom: 'none', fontWeight: '600' }}>👑 Primary SW</th>
                      <th style={{ padding: '1rem', borderBottom: 'none', fontWeight: '600' }}>📅 Started</th>
                      <th style={{ padding: '1rem', borderBottom: 'none', fontWeight: '600' }}>🔐 Your Permissions</th>
                      <th style={{ padding: '1rem', borderBottom: 'none', fontWeight: '600', textAlign: 'center' }}>⚡ Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeCollaborations.filter((c: any) => !c.isPrimarySw).map((collab: any, index: number) => {
                      const req = requests.find(r => r.id === collab.helpRequestId)
                      return (
                        <tr 
                          key={collab.id}
                          style={{ 
                            backgroundColor: index % 2 === 0 ? 'rgba(255, 255, 255, 0.8)' : 'rgba(209, 250, 229, 0.4)',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          <td style={{ padding: '1rem', fontWeight: '600', color: '#065f46' }}>
                            {getCollabRequestIdLabel(collab, req)}
                          </td>
                          <td style={{ padding: '1rem' }}>
                            <Badge 
                              style={{ 
                                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                                padding: '0.5rem 0.75rem',
                                fontSize: '0.85rem',
                                borderRadius: '6px'
                              }}
                            >
                              {getCollabTypeLabel(collab, req)}
                            </Badge>
                          </td>
                          <td style={{ padding: '1rem' }}>
                            <div>
                              <div style={{ fontWeight: '600', color: '#065f46' }}>
                                {getCollabPrimarySwName(collab)}
                              </div>
                              <div style={{ fontSize: '0.75rem', color: '#047857' }}>
                                ID: {getCollabPrimarySwId(collab)}
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: '1rem', color: '#047857' }}>
                            {formatDateTime(getCollabStartedAt(collab, req))}
                          </td>
                          <td style={{ padding: '1rem' }}>
                            <div className="d-flex flex-wrap gap-1">
                              <Badge 
                                bg="success" 
                                style={{ fontSize: '0.7rem', padding: '0.25rem 0.5rem' }}
                              >
                                ✅ View
                              </Badge>
                              <Badge 
                                bg="success" 
                                style={{ fontSize: '0.7rem', padding: '0.25rem 0.5rem' }}
                              >
                                📝 Notes
                              </Badge>
                              <Badge 
                                bg="success" 
                                style={{ fontSize: '0.7rem', padding: '0.25rem 0.5rem' }}
                              >
                                💡 Suggest
                              </Badge>
                              <Badge 
                                bg="success" 
                                style={{ fontSize: '0.7rem', padding: '0.25rem 0.5rem' }}
                              >
                                ⏰ Logs
                              </Badge>
                              <Badge 
                                bg="success" 
                                style={{ fontSize: '0.7rem', padding: '0.25rem 0.5rem' }}
                              >
                                💬 Message
                              </Badge>
                            </div>
                            <div style={{ fontSize: '0.7rem', color: '#047857', marginTop: '0.25rem', fontStyle: 'italic' }}>
                              ⚠️ Limited access - Read & suggest only
                            </div>
                          </td>
                          <td style={{ padding: '1rem', textAlign: 'center' }}>
                            <Button
                              size="sm"
                              onClick={() => navigate(`/social-worker/requests/${collab.helpRequestId}?mode=collaborator`)}
                              style={{
                                background: 'linear-gradient(135deg, #10b981 0%, #22c55e 100%)',
                                border: 'none',
                                borderRadius: '6px',
                                padding: '0.375rem 0.75rem',
                                fontWeight: '500'
                              }}
                            >
                              👁️ View & Assist
                            </Button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </Table>
              </div>
            )}
          </Card.Body>
        </Card>
      </>
    )
  }

  const renderCompletedTab = () => {
    if (completedRequests.length === 0) {
      return (
        <Card 
          className="border-0 shadow-sm"
          style={{ background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)' }}
        >
          <Card.Body className="text-center py-5">
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏁</div>
            <h4 style={{ color: '#065f46' }}>No Completed Requests</h4>
            <p className="text-muted">Fully finished cases will appear here</p>
          </Card.Body>
        </Card>
      )
    }

    return (
      <Card 
        className="border-0 shadow-sm"
        style={{ background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)' }}
      >
        <Card.Body className="p-0">
          {/* Read-only Notice */}
          <div 
            className="m-3 p-3 rounded-3"
            style={{ 
              background: 'rgba(16, 185, 129, 0.1)',
              border: '2px solid rgba(16, 185, 129, 0.2)',
              color: '#065f46'
            }}
          >
            <strong>🔒 Read-Only:</strong> These are archived completed cases. No editing is allowed for finished requests.
          </div>

          <div className="table-responsive">
            <Table hover className="mb-0" style={{ backgroundColor: 'transparent' }}>
              <thead style={{ background: 'linear-gradient(135deg, #10b981 0%, #22c55e 100%)', color: 'white' }}>
                <tr>
                  <th style={{ padding: '1rem', borderBottom: 'none', fontWeight: '600' }}>
                    🆔 ID
                  </th>
                  <th style={{ padding: '1rem', borderBottom: 'none', fontWeight: '600' }}>
                    📋 Type
                  </th>
                  <th style={{ padding: '1rem', borderBottom: 'none', fontWeight: '600' }}>
                    👤 Requester
                  </th>
                  <th style={{ padding: '1rem', borderBottom: 'none', fontWeight: '600' }}>
                    🏁 Completion Date
                  </th>
                  <th style={{ padding: '1rem', borderBottom: 'none', fontWeight: '600' }}>
                    ⭐ Rating
                  </th>
                  <th style={{ padding: '1rem', borderBottom: 'none', fontWeight: '600' }}>
                    💬 Feedback
                  </th>
                  <th style={{ padding: '1rem', borderBottom: 'none', fontWeight: '600', textAlign: 'center' }}>
                    ⚡ Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {completedRequests.map((req, index) => (
                  <tr 
                    key={req.id}
                    style={{ 
                      backgroundColor: index % 2 === 0 ? 'rgba(255, 255, 255, 0.8)' : 'rgba(220, 252, 231, 0.4)',
                      transition: 'all 0.2s ease',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'scale(1.005)'
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.2)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'scale(1)'
                      e.currentTarget.style.boxShadow = 'none'
                    }}
                  >
                    <td style={{ padding: '1rem', fontWeight: '600', color: '#065f46' }}>
                      {req.trackingId || req.id}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <Badge 
                        style={{ 
                          background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                          padding: '0.5rem 0.75rem',
                          fontSize: '0.85rem',
                          fontWeight: '500',
                          borderRadius: '6px'
                        }}
                      >
                        {getHelpTypeIcon(req.helpType)} {req.helpType ? HELP_TYPE_LABELS[req.helpType] : 'Unknown'}
                      </Badge>
                    </td>
                    <td style={{ padding: '1rem', color: '#047857' }}>
                      {maskRequester(req)}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <div>
                        <div style={{ fontWeight: '600', color: '#065f46', marginBottom: '0.25rem' }}>
                          {formatDateTime((req as any).completedDate || (req as any).updatedDate)}
                        </div>
                        <Badge 
                          style={{ 
                            background: 'linear-gradient(135deg, #10b981 0%, #22c55e 100%)',
                            padding: '0.25rem 0.5rem',
                            fontSize: '0.75rem',
                            borderRadius: '4px'
                          }}
                        >
                          ✅ Completed
                        </Badge>
                      </div>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <div className="d-flex align-items-center gap-1">
                        {(() => {
                          const rating = (req as any).rating || (req as any).feedbackRating || 0
                          const stars = []
                          for (let i = 1; i <= 5; i++) {
                            stars.push(
                              <span 
                                key={i}
                                style={{ 
                                  fontSize: '1.1rem',
                                  color: i <= rating ? '#f59e0b' : '#d1d5db'
                                }}
                              >
                                {i <= rating ? '⭐' : '☆'}
                              </span>
                            )
                          }
                          return (
                            <>
                              {stars}
                              {rating > 0 && (
                                <span style={{ 
                                  fontSize: '0.85rem', 
                                  fontWeight: '600', 
                                  color: '#065f46',
                                  marginLeft: '0.25rem'
                                }}>
                                  ({rating}/5)
                                </span>
                              )}
                            </>
                          )
                        })()}
                        {!(req as any).rating && !(req as any).feedbackRating && (
                          <span style={{ fontSize: '0.85rem', color: '#6b7280', fontStyle: 'italic' }}>
                            No rating
                          </span>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: '1rem', maxWidth: '300px' }}>
                      {(req as any).feedback || (req as any).completionFeedback ? (
                        <div 
                          style={{ 
                            padding: '0.5rem',
                            background: 'rgba(16, 185, 129, 0.1)',
                            borderRadius: '6px',
                            fontSize: '0.85rem',
                            color: '#065f46',
                            fontStyle: 'italic',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical'
                          }}
                        >
                          💬 "{(req as any).feedback || (req as any).completionFeedback}"
                        </div>
                      ) : (
                        <span style={{ fontSize: '0.85rem', color: '#6b7280', fontStyle: 'italic' }}>
                          No feedback provided
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                      <Button
                        size="sm"
                        onClick={() => navigate(`/social-worker/requests/${req.id}`)}
                        style={{
                          background: 'linear-gradient(135deg, #10b981 0%, #22c55e 100%)',
                          border: 'none',
                          borderRadius: '6px',
                          padding: '0.375rem 0.75rem',
                          fontWeight: '500',
                          boxShadow: '0 2px 4px rgba(16, 185, 129, 0.3)',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translateY(-2px)'
                          e.currentTarget.style.boxShadow = '0 4px 8px rgba(16, 185, 129, 0.4)'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateY(0)'
                          e.currentTarget.style.boxShadow = '0 2px 4px rgba(16, 185, 129, 0.3)'
                        }}
                      >
                        👁️ View Archive
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>
    )
  }

  const renderRejectedTab = () => {
    if (rejectedRequests.length === 0) {
      return (
        <Card 
          className="border-0 shadow-sm"
          style={{ background: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)' }}
        >
          <Card.Body className="text-center py-5">
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>❌</div>
            <h4 style={{ color: '#991b1b' }}>No Rejected Requests</h4>
            <p className="text-muted">Requests you've rejected will appear here</p>
          </Card.Body>
        </Card>
      )
    }

    return (
      <Card 
        className="border-0 shadow-sm"
        style={{ background: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)' }}
      >
        <Card.Body className="p-0">
          {/* Info Note */}
          <div 
            className="m-3 p-3 rounded-3"
            style={{ 
              background: 'rgba(239, 68, 68, 0.1)',
              border: '2px solid rgba(239, 68, 68, 0.2)',
              color: '#991b1b'
            }}
          >
            <strong>ℹ️ Note:</strong> If admin reassigns any of these requests back to you or another SW, they will appear in the <strong>Reassigned Tab</strong>.
          </div>

          <div className="table-responsive">
            <Table hover className="mb-0" style={{ backgroundColor: 'transparent' }}>
              <thead style={{ background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', color: 'white' }}>
                <tr>
                  <th style={{ padding: '1rem', borderBottom: 'none', fontWeight: '600' }}>
                    🆔 ID
                  </th>
                  <th style={{ padding: '1rem', borderBottom: 'none', fontWeight: '600' }}>
                    📋 Type
                  </th>
                  <th style={{ padding: '1rem', borderBottom: 'none', fontWeight: '600' }}>
                    💬 Your Rejection Reason
                  </th>
                  <th style={{ padding: '1rem', borderBottom: 'none', fontWeight: '600' }}>
                    📅 Rejected Date
                  </th>
                  <th style={{ padding: '1rem', borderBottom: 'none', fontWeight: '600' }}>
                    🔔 Status
                  </th>
                  <th style={{ padding: '1rem', borderBottom: 'none', fontWeight: '600', textAlign: 'center' }}>
                    ⚡ Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {rejectedRequests.map((req, index) => (
                  <tr 
                    key={req.id}
                    style={{ 
                      backgroundColor: index % 2 === 0 ? 'rgba(255, 255, 255, 0.8)' : 'rgba(254, 226, 226, 0.4)',
                      transition: 'all 0.2s ease',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'scale(1.01)'
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.2)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'scale(1)'
                      e.currentTarget.style.boxShadow = 'none'
                    }}
                  >
                    <td style={{ padding: '1rem', fontWeight: '600', color: '#991b1b' }}>
                      {req.trackingId || req.id}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <Badge 
                        style={{ 
                          background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                          padding: '0.5rem 0.75rem',
                          fontSize: '0.85rem',
                          fontWeight: '500',
                          borderRadius: '6px'
                        }}
                      >
                        {getHelpTypeIcon(req.helpType)} {req.helpType ? HELP_TYPE_LABELS[req.helpType] : 'Unknown'}
                      </Badge>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <div 
                        style={{ 
                          padding: '0.5rem 0.75rem',
                          background: 'rgba(239, 68, 68, 0.1)',
                          borderRadius: '6px',
                          fontSize: '0.85rem',
                          color: '#991b1b',
                          fontStyle: 'italic',
                          maxWidth: '300px',
                          border: '1px solid rgba(239, 68, 68, 0.2)'
                        }}
                      >
                        💬 {(req as any).rejectionReason || 'Workload / Specialization mismatch / Unable to handle'}
                      </div>
                    </td>
                    <td style={{ padding: '1rem', color: '#b91c1c' }}>
                      {formatDateTime((req as any).rejectedDate || req.requestDate)}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <div>
                        <Badge 
                          style={{ 
                            background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                            padding: '0.5rem 0.75rem',
                            fontSize: '0.85rem',
                            fontWeight: '500',
                            borderRadius: '6px',
                            marginBottom: '0.25rem'
                          }}
                        >
                          ❌ Rejected by You
                        </Badge>
                        <div style={{ fontSize: '0.75rem', color: '#991b1b', fontWeight: '500' }}>
                          📤 Sent to Admin
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                      <Button
                        size="sm"
                        onClick={() => navigate(`/social-worker/requests/${req.id}`)}
                        style={{
                          background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                          border: 'none',
                          borderRadius: '6px',
                          padding: '0.375rem 0.75rem',
                          fontWeight: '500',
                          boxShadow: '0 2px 4px rgba(239, 68, 68, 0.3)',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translateY(-2px)'
                          e.currentTarget.style.boxShadow = '0 4px 8px rgba(239, 68, 68, 0.4)'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateY(0)'
                          e.currentTarget.style.boxShadow = '0 2px 4px rgba(239, 68, 68, 0.3)'
                        }}
                      >
                        👁️ View Details
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>
    )
  }

  return (
    <Container fluid className="py-4 sw-dashboard">
      {error && (
        <Row className="mb-3">
          <Col xs={12}>
            <div 
              className="p-3 rounded-3"
              style={{ 
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                color: '#dc2626',
                border: '2px solid rgba(239, 68, 68, 0.2)'
              }}
            >
              <strong>⚠️ Error:</strong> {error}
            </div>
          </Col>
        </Row>
      )}

      {/* Header */}
      <Row className="mb-4">
        <Col xs={12}>
          <div 
            className="p-4 rounded-3 shadow-sm position-relative overflow-hidden"
            style={{ 
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
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
            <div className="position-relative">
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
                  <span style={{ fontSize: '2rem' }}>📋</span>
                </div>
                <div>
                  <h1 className="h2 fw-bold mb-1">Assigned Requests</h1>
                  <p className="mb-0" style={{ opacity: 0.95, fontSize: '0.95rem' }}>
                    Manage all requests assigned to you - organized by status
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Col>
      </Row>

      {/* Tab Navigation */}
      <Row className="mb-4">
        <Col xs={12}>
          <div 
            className="p-3 rounded-3 shadow-sm"
            style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)' }}
          >
            <div className="d-flex flex-wrap gap-2">
              <button
                className={`btn ${activeTab === 'pending' ? 'active' : ''}`}
                onClick={() => setActiveTab('pending')}
                style={{
                  borderRadius: '8px',
                  padding: '0.5rem 1rem',
                  fontWeight: '600',
                  border: 'none',
                  transition: 'all 0.3s ease',
                  background: activeTab === 'pending' 
                    ? 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)'
                    : 'transparent',
                  color: activeTab === 'pending' ? 'white' : '#64748b',
                  boxShadow: activeTab === 'pending' ? '0 4px 6px rgba(59, 130, 246, 0.3)' : 'none'
                }}
              >
                📝 Pending {pendingRequests.length > 0 && `(${pendingRequests.length})`}
              </button>
              <button
                className={`btn ${activeTab === 'active' ? 'active' : ''}`}
                onClick={() => setActiveTab('active')}
                style={{
                  borderRadius: '8px',
                  padding: '0.5rem 1rem',
                  fontWeight: '600',
                  border: 'none',
                  transition: 'all 0.3s ease',
                  background: activeTab === 'active' 
                    ? 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)'
                    : 'transparent',
                  color: activeTab === 'active' ? 'white' : '#64748b',
                  boxShadow: activeTab === 'active' ? '0 4px 6px rgba(37, 99, 235, 0.3)' : 'none'
                }}
              >
                🔵 Active {activeRequests.length > 0 && `(${activeRequests.length})`}
              </button>
              <button
                className={`btn ${activeTab === 'reassigned' ? 'active' : ''}`}
                onClick={() => setActiveTab('reassigned')}
                style={{
                  borderRadius: '8px',
                  padding: '0.5rem 1rem',
                  fontWeight: '600',
                  border: 'none',
                  transition: 'all 0.3s ease',
                  background: activeTab === 'reassigned' 
                    ? 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%)'
                    : 'transparent',
                  color: activeTab === 'reassigned' ? 'white' : '#64748b',
                  boxShadow: activeTab === 'reassigned' ? '0 4px 6px rgba(29, 78, 216, 0.3)' : 'none'
                }}
              >
                🔄 Reassigned {reassignedRequests.length > 0 && `(${reassignedRequests.length})`}
              </button>
              <button
                className={`btn ${activeTab === 'transfers' ? 'active' : ''}`}
                onClick={() => setActiveTab('transfers')}
                style={{
                  borderRadius: '8px',
                  padding: '0.5rem 1rem',
                  fontWeight: '600',
                  border: 'none',
                  transition: 'all 0.3s ease',
                  background: activeTab === 'transfers' 
                    ? 'linear-gradient(135deg, #1e40af 0%, #1d4ed8 100%)'
                    : 'transparent',
                  color: activeTab === 'transfers' ? 'white' : '#64748b',
                  boxShadow: activeTab === 'transfers' ? '0 4px 6px rgba(30, 64, 175, 0.3)' : 'none'
                }}
              >
                🔁 Transfers {transfers.length > 0 && `(${transfers.length})`}
              </button>
              <button
                className={`btn ${activeTab === 'collaborations' ? 'active' : ''}`}
                onClick={() => setActiveTab('collaborations')}
                style={{
                  borderRadius: '8px',
                  padding: '0.5rem 1rem',
                  fontWeight: '600',
                  border: 'none',
                  transition: 'all 0.3s ease',
                  background: activeTab === 'collaborations' 
                    ? 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)'
                    : 'transparent',
                  color: activeTab === 'collaborations' ? 'white' : '#64748b',
                  boxShadow: activeTab === 'collaborations' ? '0 4px 6px rgba(30, 58, 138, 0.3)' : 'none'
                }}
              >
                🤝 Collaborations {(pendingCollaborations.length + activeCollaborations.length) > 0 && `(${pendingCollaborations.length + activeCollaborations.length})`}
              </button>
              <button
                className={`btn ${activeTab === 'completed' ? 'active' : ''}`}
                onClick={() => setActiveTab('completed')}
                style={{
                  borderRadius: '8px',
                  padding: '0.5rem 1rem',
                  fontWeight: '600',
                  border: 'none',
                  transition: 'all 0.3s ease',
                  background: activeTab === 'completed' 
                    ? 'linear-gradient(135deg, #60a5fa 0%, #93c5fd 100%)'
                    : 'transparent',
                  color: activeTab === 'completed' ? 'white' : '#64748b',
                  boxShadow: activeTab === 'completed' ? '0 4px 6px rgba(96, 165, 250, 0.3)' : 'none'
                }}
              >
                ✅ Completed {completedRequests.length > 0 && `(${completedRequests.length})`}
              </button>
              <button
                className={`btn ${activeTab === 'rejected' ? 'active' : ''}`}
                onClick={() => setActiveTab('rejected')}
                style={{
                  borderRadius: '8px',
                  padding: '0.5rem 1rem',
                  fontWeight: '600',
                  border: 'none',
                  transition: 'all 0.3s ease',
                  background: activeTab === 'rejected' 
                    ? 'linear-gradient(135deg, #64748b 0%, #94a3b8 100%)'
                    : 'transparent',
                  color: activeTab === 'rejected' ? 'white' : '#64748b',
                  boxShadow: activeTab === 'rejected' ? '0 4px 6px rgba(100, 116, 139, 0.3)' : 'none'
                }}
              >
                ⭕ Rejected {rejectedRequests.length > 0 && `(${rejectedRequests.length})`}
              </button>
            </div>
          </div>
        </Col>
      </Row>

      {/* Tab Content */}
      <Row>
        <Col xs={12}>
          {renderTabContent()}
        </Col>
      </Row>

      {/* View Details Modal */}
      <Modal show={showDetailsModal} onHide={() => setShowDetailsModal(false)} size="lg">
        <Modal.Header 
          closeButton
          style={{ 
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            color: 'white',
            borderBottom: 'none'
          }}
        >
          <Modal.Title>📋 Request Details</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ background: 'linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%)' }}>
          {selectedRequest && (
            <>
              <Card className="mb-3 border-0 shadow-sm">
                <Card.Body>
                  <h5 className="mb-3">
                    {getHelpTypeIcon(selectedRequest.helpType)} {selectedRequest.helpType ? HELP_TYPE_LABELS[selectedRequest.helpType] : 'Unknown'}
                  </h5>
                  <Row>
                    <Col md={6}>
                      <p className="mb-2"><strong>📋 ID:</strong> {selectedRequest.trackingId || selectedRequest.id}</p>
                      <p className="mb-2"><strong>👤 Requester:</strong> {maskRequester(selectedRequest)}</p>
                      <p className="mb-2"><strong>⚠️ Priority:</strong> <Badge bg={getPriorityVariant(selectedRequest.priority)}>{selectedRequest.priority}</Badge></p>
                    </Col>
                    <Col md={6}>
                      <p className="mb-2"><strong>📅 Request Date:</strong> {formatDateTime(selectedRequest.requestDate)}</p>
                      <p className="mb-2"><strong>🏷️ Status:</strong> <Badge bg={getStatusVariant(selectedRequest.status)}>{selectedRequest.status}</Badge></p>
                    </Col>
                  </Row>
                  {selectedRequest.description && (
                    <div className="mt-3">
                      <strong>📝 Description:</strong>
                      <p className="mt-2">{selectedRequest.description}</p>
                    </div>
                  )}
                </Card.Body>
              </Card>

              {/* Timeline */}
              <Card className="border-0 shadow-sm">
                <Card.Body>
                  <h6 className="mb-3">🗓️ Timeline</h6>
                  <VerticalTimeline steps={buildTimelineSteps(selectedRequest)} />
                </Card.Body>
              </Card>

              {selectedRequest.anonymous === false && selectedRequest.requesterId && (
                <Card className="mt-3 border-0 shadow-sm">
                  <Card.Body>
                    <h6 className="mb-2">👤 Primary User Details</h6>
                    <p className="mb-1"><strong>ID:</strong> {selectedRequest.requesterId}</p>
                    <p className="mb-0"><strong>Name:</strong> {selectedRequest.requesterName || 'Not provided'}</p>
                  </Card.Body>
                </Card>
              )}

              {selectedRequest.anonymous && (
                <div className="alert alert-info mt-3">
                  🔒 This is an anonymous request. Personal details are not available.
                </div>
              )}
            </>
          )}
        </Modal.Body>
        <Modal.Footer style={{ borderTop: 'none', background: '#ffffff' }}>
          <Button 
            variant="outline-secondary" 
            onClick={() => setShowDetailsModal(false)}
          >
            Close
          </Button>
          {selectedRequest && activeTab === 'pending' && (
            <>
              <Button
                onClick={() => handleAccept(selectedRequest)}
                disabled={submitting}
                style={{
                  background: 'linear-gradient(135deg, #10b981 0%, #22c55e 100%)',
                  border: 'none',
                  color: 'white'
                }}
              >
                ✅ Accept
              </Button>
              <Button
                onClick={() => handleReject(selectedRequest)}
                disabled={submitting}
                style={{
                  background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                  border: 'none',
                  color: 'white'
                }}
              >
                ❌ Reject
              </Button>
              <Button
                onClick={() => handleTransfer(selectedRequest)}
                disabled={submitting}
                style={{
                  background: 'linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)',
                  border: 'none',
                  color: 'white'
                }}
              >
                🔄 Transfer
              </Button>
            </>
          )}
        </Modal.Footer>
      </Modal>

      {/* Reject Modal */}
      <Modal show={showRejectModal} onHide={() => setShowRejectModal(false)}>
        <Modal.Header 
          closeButton
          style={{ 
            background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
            color: 'white',
            borderBottom: 'none'
          }}
        >
          <Modal.Title>❌ Reject Request</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label className="fw-600">💬 Reason for rejection (mandatory)</Form.Label>
            <Form.Control
              as="textarea"
              rows={4}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Please provide a detailed reason for rejecting this request..."
              style={{
                borderRadius: '8px',
                border: '2px solid rgba(239, 68, 68, 0.2)'
              }}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={() => setShowRejectModal(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleRejectSubmit}
            disabled={submitting || !rejectReason.trim()}
            style={{
              background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
              border: 'none',
              color: 'white'
            }}
          >
            {submitting ? 'Submitting...' : 'Submit Rejection'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Transfer Modal */}
      <Modal show={showTransferModal} onHide={() => setShowTransferModal(false)} size="lg">
        <Modal.Header 
          closeButton
          style={{ 
            background: 'linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)',
            color: 'white',
            borderBottom: 'none'
          }}
        >
          <Modal.Title>🔄 Transfer Request</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label className="fw-600">👥 Select Social Worker</Form.Label>
            <Form.Select
              value={transferTargetSwId}
              onChange={(e) => setTransferTargetSwId(e.target.value)}
              style={{
                borderRadius: '8px',
                border: '2px solid rgba(139, 92, 246, 0.2)'
              }}
            >
              <option value="">-- Select a social worker --</option>
              {availableSW.map((sw) => (
                <option key={sw.userId} value={sw.userId}>
                  {sw.fullName} {sw.availabilityStatus && `(${sw.availabilityStatus})`}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
          <Form.Group>
            <Form.Label className="fw-600">💬 Reason for transfer (mandatory)</Form.Label>
            <Form.Control
              as="textarea"
              rows={4}
              value={transferReason}
              onChange={(e) => setTransferReason(e.target.value)}
              placeholder="Please provide a detailed reason for transferring this request..."
              style={{
                borderRadius: '8px',
                border: '2px solid rgba(139, 92, 246, 0.2)'
              }}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={() => setShowTransferModal(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleTransferSubmit}
            disabled={submitting || !transferTargetSwId || !transferReason.trim()}
            style={{
              background: 'linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)',
              border: 'none',
              color: 'white'
            }}
          >
            {submitting ? 'Submitting...' : 'Submit Transfer Request'}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  )
}
