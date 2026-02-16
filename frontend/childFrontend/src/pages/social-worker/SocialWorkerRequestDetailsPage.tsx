import { useEffect, useMemo, useState } from 'react'
import { Card, Container, Badge, Button, Row, Col, Form, Modal, Table } from 'react-bootstrap'
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom'
import { getUploadBaseUrl } from '../../services/api'
import { useAuth } from '../../hooks/useAuth'
import {
  getHelpRequest,
  getMyFollowUps,
  getUserProfile,
  getServicePackages,
  updateRequestStatus,
  applyServicePackageToRequest,
  updateServiceItemStatus,
  assignServiceItemResource,
  startServiceExecution,
  updateServiceOutcome,
  submitFinalAssessment,
  finalizeCase,
  requestPackageAdjustment,
  getHelpRequestTimeline,
  createHelpRequestTimelineNote,
  createFollowUp,
  getAvailableSocialWorkers,
  getHelpRequestCollaboration,
  requestHelpRequestCollaborator,
  acceptHelpRequestCollaborationRequest,
  rejectHelpRequestCollaborationRequest,
  removeHelpRequestCollaborator,
  requestHelpRequestTransfer,
  type FollowUpDTO,
  type HelpRequestCollaborationSummaryDTO,
  type CollaborationPermission,
} from '../../services/socialWorkerApi'
import type { ServicePackageDTO, FinalAssessmentDTO } from '../../types/dashboard'
import type { HelpRequestDTO, HelpType, AppliedPackageStatus } from '../../types/dashboard'
import { HELP_TYPE_LABELS, APPLIED_PACKAGE_STATUS_LABELS } from '../../types/dashboard'
import './SocialWorkerDashboard.css'
import VerticalTimeline from '../../components/ui/VerticalTimeline'
import type { TimelineStep } from '../../components/ui/HorizontalTimeline'

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
  description?: string
  timestamp?: string
  eventTime?: string
  actor?: string
  eventType?: string
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
  image?: string
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

const getAvailabilityVariant = (status?: string): 'success' | 'warning' | 'secondary' => {
  const normalized = (status || '').toUpperCase()
  if (normalized === 'ACTIVE' || normalized === 'AVAILABLE') return 'success'
  if (normalized === 'BUSY' || normalized === 'LIMITED') return 'warning'
  return 'secondary'
}

const getAvailabilityLabel = (status?: string): string => {
  const normalized = (status || '').toUpperCase()
  if (normalized === 'ACTIVE' || normalized === 'AVAILABLE') return 'Active'
  if (normalized === 'BUSY' || normalized === 'LIMITED') return 'Busy'
  if (normalized === 'ON_LEAVE' || normalized === 'UNAVAILABLE') return 'On Leave'
  return status || 'Unknown'
}

export function SocialWorkerRequestDetailsPage() {
  const { requestId } = useParams<{ requestId: string }>()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const applyPackageId = searchParams.get('applyPackage')
  const isCollaboratorView = searchParams.get('mode') === 'collaborator'
  const selectedResourceIdFromQuery = searchParams.get('selectedResourceId')

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
  const [followUpTitle, setFollowUpTitle] = useState('')
  const [followUpTaskItem, setFollowUpTaskItem] = useState('')
  const [followUpVisitDate, setFollowUpVisitDate] = useState('')
  const [followUpNextVisitDate, setFollowUpNextVisitDate] = useState('')
  const [followUpMode, setFollowUpMode] = useState<
    'PHONE_CALL' | 'HOME_VISIT' | 'ONLINE_MEETING' | 'HOSPITAL_VISIT' | 'DOCUMENT_COLLECTION' | 'OFFICE_VISIT'
  >('HOME_VISIT')
  const [followUpCondition, setFollowUpCondition] = useState('')
  const [followUpNotes, setFollowUpNotes] = useState('')
  const [followUpSubmitting, setFollowUpSubmitting] = useState(false)
  const [followUpError, setFollowUpError] = useState<string | null>(null)
  const [expectedCompletionDate, setExpectedCompletionDate] = useState('')
  const [resourcesAssigned, setResourcesAssigned] = useState(false)
  const [startServiceError, setStartServiceError] = useState<string | null>(null)
  const [selectedRequirementItem, setSelectedRequirementItem] = useState<string | null>(null)
  const [collaboration, setCollaboration] = useState<HelpRequestCollaborationSummaryDTO | null>(null)
  const [showCollaborationModal, setShowCollaborationModal] = useState(false)
  const [rejectModalOpen, setRejectModalOpen] = useState(false)
  const [rejectMode, setRejectMode] = useState<'REJECT' | 'TRANSFER' | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [transferWorkerId, setTransferWorkerId] = useState<string | null>(null)
  const [transferNote, setTransferNote] = useState<string>('')
  const [rejectSubmitting, setRejectSubmitting] = useState(false)
  const [swDirectory, setSwDirectory] = useState<Array<{
    id: string
    userId: string
    fullName: string
    email?: string
    specializations?: string[]
    organization?: string
    serviceArea?: string
    available?: boolean
    availabilityStatus?: string
  }>>([])
  const [collabSearch, setCollabSearch] = useState('')
  const [collabDistrictFilter, setCollabDistrictFilter] = useState('ALL')
  const [collabSpecializationFilter, setCollabSpecializationFilter] = useState('ALL')
  const [collabAvailabilityFilter, setCollabAvailabilityFilter] = useState<'ALL' | 'ACTIVE' | 'BUSY' | 'ON_LEAVE'>('ALL')
  const [selectedCollaboratorUserId, setSelectedCollaboratorUserId] = useState('')
  const [selectedCollabPermission, setSelectedCollabPermission] = useState<CollaborationPermission>('VIEW_ONLY')
  const [collabReason, setCollabReason] = useState('')
  const [collabSubmitting, setCollabSubmitting] = useState(false)
  const [collabError, setCollabError] = useState<string | null>(null)
  const [showRequestDutiesModal, setShowRequestDutiesModal] = useState(false)
  const [requestDutiesMessage, setRequestDutiesMessage] = useState('')
  const [requestDutiesSubmitting, setRequestDutiesSubmitting] = useState(false)
  const [requestDutiesError, setRequestDutiesError] = useState<string | null>(null)
  const [showAssignDutiesModal, setShowAssignDutiesModal] = useState(false)
  const [assignDutiesMessage, setAssignDutiesMessage] = useState('')
  const [assignDutiesSubmitting, setAssignDutiesSubmitting] = useState(false)
  const [assignDutiesError, setAssignDutiesError] = useState<string | null>(null)
  const [closeWarning, setCloseWarning] = useState<string | null>(null)
  const [internalNotes, setInternalNotes] = useState<
    Array<{
      id: string
      requestId: string
      authorId?: string
      authorName?: string
      text: string
      createdAt: string
    }>
  >([])
  const [internalNoteText, setInternalNoteText] = useState('')

  // New Service Workflow States
  const [outcomeModal, setOutcomeModal] = useState<{ item: string } | null>(null)
  const [outcomeType, setOutcomeType] = useState('COMPLETED_SUCCESSFULLY')
  const [outcomeReason, setOutcomeReason] = useState('')
  const [outcomeNotes, setOutcomeNotes] = useState('')
  const [outcomeSubmitting, setOutcomeSubmitting] = useState(false)
  const [outcomeError, setOutcomeError] = useState<string | null>(null)

  const [showAssessmentModal, setShowAssessmentModal] = useState(false)
  const [assessmentData, setAssessmentData] = useState<FinalAssessmentDTO>({
    objectivesAchieved: true,
    childSafe: true,
    needsContinuedMonitoring: false,
    recommendClosure: true,
    remarks: '',
  })
  const [assessmentSubmitting, setAssessmentSubmitting] = useState(false)
  const [assessmentError, setAssessmentError] = useState<string | null>(null)

  const [finalizeSubmitting, setFinalizeSubmitting] = useState(false)
  const [finalizeError, setFinalizeError] = useState<string | null>(null)
  const [showCompleteRequestModal, setShowCompleteRequestModal] = useState(false)
  const [showCompletionSuccessBanner, setShowCompletionSuccessBanner] = useState(false)
  const [hasShownAutoCompletePrompt, setHasShownAutoCompletePrompt] = useState(false)
  // --- Collaboration permissions ---
  // When opened from Collaboration Center, ?mode=collaborator is set
  const mode = searchParams.get('mode') === 'collaborator' ? 'collaborator' : 'owner'
  const currentUserId = user?.userId
  const activeCollaboration = useMemo(
    () =>
      currentUserId && collaboration
        ? (collaboration.collaborators || []).find(
          (c) => c.userId === currentUserId && c.status === 'ACCEPTED'
        ) ?? null
        : null,
    [collaboration, currentUserId]
  )
  const isOwner =
    !!currentUserId &&
    (collaboration?.ownerUserId
      ? collaboration.ownerUserId === currentUserId
      : request?.assignedWorkerId === currentUserId)
  const hasFullAccess =
    isOwner || (activeCollaboration?.permission === 'FULL_ACCESS' && mode === 'collaborator')
  const hasServiceAccess =
    hasFullAccess || (activeCollaboration?.permission === 'SERVICE_ONLY' && mode === 'collaborator')
  const isViewOnlyCollaborator =
    !isOwner && activeCollaboration?.permission === 'VIEW_ONLY' && mode === 'collaborator'
  const hasAcceptedCollaborators =
    (collaboration?.collaborators ?? []).some((c) => c.status === 'ACCEPTED')

  const buildTimelineSteps = (req: HelpRequestDTO): TimelineStep[] => {
    const steps: TimelineStep[] = [{ id: 'requested', label: 'Requested', status: 'completed' }]
    if (req.status === 'ASSIGNED' || req.status === 'IN_PROGRESS' || req.status === 'COMPLETED') {
      steps.push({ id: 'assigned', label: 'Assigned', status: 'completed' })
    }
    if (req.appliedPackage) {
      steps.push({ id: 'package', label: 'Package Proposed', status: 'completed' })
    }
    if (req.status === 'IN_PROGRESS' || req.status === 'COMPLETED') {
      steps.push({ id: 'progress', label: 'In Progress', status: 'completed' })
    }
    if (req.status === 'COMPLETED') {
      steps.push({ id: 'completed', label: 'Completed', status: 'active' })
    } else {
      const last = steps.length - 1
      steps[last] = { ...steps[last], status: 'active' }
    }
    return steps
  }

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

  const handleAcceptRequest = async () => {
    if (!requestId) return
    try {
      const updated = await updateRequestStatus(requestId, 'IN_PROGRESS')
      setRequest(updated)
    } catch (err) {
      console.error('Failed to accept request', err)
    }
  }

  const handleRejectRequest = async () => {
    if (!requestId || !rejectReason.trim()) {
      setRejectReason((prev) => prev || 'Reason required')
      return
    }
    setRejectSubmitting(true)
    try {
      if (transferWorkerId) {
        await requestHelpRequestTransfer({
          helpRequestId: requestId,
          requestedAssigneeId: transferWorkerId,
          reason: `${rejectReason.trim()} ${transferNote ? `| Note: ${transferNote.trim()}` : ''}`
        })
        const worker = swDirectory.find((sw) => sw.userId === transferWorkerId)
        await createHelpRequestTimelineNote(requestId, `Transfer request initiated to ${worker?.fullName || transferWorkerId}`)
      } else {
        const updated = await updateRequestStatus(requestId, 'REJECTED')
        setRequest(updated)
        await createHelpRequestTimelineNote(requestId, `Rejected by social worker: ${rejectReason.trim()}`)
      }

      setRejectModalOpen(false)
      setRejectReason('')
      setTransferWorkerId(null)
      setTransferNote('')
    } catch (err) {
      console.error('Failed to reject request', err)
    } finally {
      setRejectSubmitting(false)
    }
  }

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
    const hasOpenCollabs =
      (collaboration?.pendingRequests?.length ?? 0) > 0 ||
      (collaboration?.collaborators ?? []).some((c) => c.status !== 'ACCEPTED')
    if (hasOpenCollabs) {
      setCloseWarning('Cannot close: collaborators still have pending/active tasks. Resolve them first.')
      return
    }
    setCloseRequestLoading(true)
    try {
      const updated = await updateRequestStatus(requestId, 'CANCELLED')
      setRequest(updated)
      setCloseWarning(null)
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
        const [req, allFollowUps, tl, collab] = await Promise.all([
          getHelpRequest(requestId),
          getMyFollowUps(),
          getHelpRequestTimeline(requestId),
          getHelpRequestCollaboration(requestId).catch(() => null),
        ])
        if (!isMounted) return
        setRequest(req)
        setFollowUps(allFollowUps.filter((fu) => fu.helpRequestId === req.id))
        setTimeline(Array.isArray(tl) ? tl : [])
        setCollaboration(collab)

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

  // Internal notes (local-only, SW-visible)
  useEffect(() => {
    if (!requestId) return
    try {
      const raw = localStorage.getItem('sw_internal_notes_v1')
      if (!raw) {
        setInternalNotes([])
        return
      }
      const parsed = JSON.parse(raw)
      if (!Array.isArray(parsed)) {
        setInternalNotes([])
        return
      }
      setInternalNotes(parsed.filter((n) => n.requestId === requestId))
    } catch {
      setInternalNotes([])
    }
  }, [requestId])

  const persistInternalNotes = (allNotes: typeof internalNotes, requestIdValue: string) => {
    try {
      const raw = localStorage.getItem('sw_internal_notes_v1')
      const parsed = raw && Array.isArray(JSON.parse(raw)) ? JSON.parse(raw) : []
      const others = parsed.filter((n: any) => n.requestId !== requestIdValue)
      const merged = [...others, ...allNotes]
      localStorage.setItem('sw_internal_notes_v1', JSON.stringify(merged))
    } catch {
      /* ignore storage errors */
    }
  }

  const addInternalNote = () => {
    if (!internalNoteText.trim() || !requestId) return
    const note = {
      id: `note-${Date.now()}`,
      requestId,
      authorId: user?.userId,
      authorName: user?.fullName || 'You',
      text: internalNoteText.trim(),
      createdAt: new Date().toISOString(),
    }
    const updated = [...internalNotes, note]
    setInternalNotes(updated)
    persistInternalNotes(updated, requestId)
    setInternalNoteText('')
  }

  const deleteInternalNote = (id: string) => {
    if (!requestId) return
    const updated = internalNotes.filter((n) => n.id !== id)
    setInternalNotes(updated)
    persistInternalNotes(updated, requestId)
  }

  useEffect(() => {
    if (!showCollaborationModal) return
    let active = true
    getAvailableSocialWorkers()
      .then((list) => {
        if (!active) return
        setSwDirectory(Array.isArray(list) ? list : [])
      })
      .catch((err) => {
        if (!active) return
        setCollabError((err as Error).message ?? 'Failed to load social workers')
      })
    return () => {
      active = false
    }
  }, [showCollaborationModal])

  useEffect(() => {
    if (!rejectModalOpen) return
    getAvailableSocialWorkers()
      .then((list) => setSwDirectory(Array.isArray(list) ? list : []))
      .catch(() => { })
  }, [rejectModalOpen])

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
        image: r.image,
      }))
      setAssignmentResources(mapped)
    } catch {
      setAssignmentResources([])
    }
  }, [])

  const executionChecklist =
    (request?.appliedPackageItemExecutions && request.appliedPackageItemExecutions.length > 0
      ? request.appliedPackageItemExecutions
      : request?.appliedPackage?.items) ?? []
  const checklistTotal = executionChecklist.length
  const checklistCompletedCount = executionChecklist.filter(
    (item) => typeof item === 'object' && (item.status || '').trim().toUpperCase() === 'COMPLETED'
  ).length
  const assignedResourceCount = executionChecklist.filter(
    (item) => typeof item === 'object' && !!item.assignedResource && item.assignedResource.trim().length > 0
  ).length
  const allChecklistCompleted = checklistTotal > 0 && checklistCompletedCount === checklistTotal
  const allResourcesAssignedForChecklist = checklistTotal > 0 && assignedResourceCount === checklistTotal
  const normalizedAppliedPackageStatus = (request?.appliedPackageStatus || '').trim().toUpperCase()
  const hasServiceExecutionStarted = !!request?.serviceStarted || checklistTotal > 0
  const canCompleteRequest =
    hasFullAccess &&
    !isCollaboratorView &&
    !!request &&
    normalizedAppliedPackageStatus === 'ACCEPTED' &&
    hasServiceExecutionStarted &&
    (request.status || '').toUpperCase() !== 'COMPLETED' &&
    allChecklistCompleted &&
    allResourcesAssignedForChecklist
  const showCompleteRequestButton =
    hasFullAccess &&
    !isCollaboratorView &&
    !!request &&
    normalizedAppliedPackageStatus === 'ACCEPTED' &&
    hasServiceExecutionStarted &&
    (request.status || '').toUpperCase() !== 'COMPLETED'

  useEffect(() => {
    setHasShownAutoCompletePrompt(false)
  }, [requestId])

  useEffect(() => {
    if (canCompleteRequest && !hasShownAutoCompletePrompt) {
      setShowCompleteRequestModal(true)
      setHasShownAutoCompletePrompt(true)
    }
  }, [canCompleteRequest, hasShownAutoCompletePrompt])

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
  const isAssigned = request.status === 'ASSIGNED'
  const isAccepted = request.status === 'IN_PROGRESS'

  const isPackageApprovedNotStarted = pkgStatus === 'ACCEPTED' && !request.serviceStarted
  const topStatusLabel = isPackageApprovedNotStarted ? 'Approved – Waiting to Start' : statusLabel

  const helpIcon = getHelpTypeIcon(request.helpType)
  const helpLabel = request.helpType ? HELP_TYPE_LABELS[request.helpType] : 'Support request'
  const evidenceUrls = request.documentUrls || []
  const isRejectedRequest = request.status === 'REJECTED'
  const hasRequestAccess = isOwner || !!activeCollaboration

  const resolveUrl = (url: string) => {
    if (!url) return '#'
    if (url.startsWith('http://') || url.startsWith('https://')) return url
    const base = getUploadBaseUrl()
    return `${base?.endsWith('/') ? base.slice(0, -1) : base}/${url.replace(/^[\\/]+/, '')}`
  }

  if (!hasRequestAccess) {
    return (
      <Container fluid className="py-4 sw-dashboard">
        <Row className="mb-3">
          <Col xs={12}>
            <button
              type="button"
              className="btn btn-link text-decoration-none mb-2 p-0"
              onClick={() => navigate('/social-worker/requests')}
            >
              ← Back to Assigned Requests
            </button>
          </Col>
        </Row>
        <Row>
          <Col xs={12} lg={8}>
            <Card className="sw-card border-0">
              <Card.Body className="p-4">
                <h5 className="mb-2 fw-700">Access Removed</h5>
                <p className="text-muted mb-0">
                  You no longer have access to this request. It may have been transferred to another social worker.
                </p>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    )
  }

  if (isRejectedRequest) {
    return (
      <Container fluid className="py-4 sw-dashboard">
        <Row className="mb-3">
          <Col xs={12}>
            <button
              type="button"
              className="btn btn-link text-decoration-none mb-2 p-0"
              onClick={() => navigate('/social-worker/requests')}
            >
              ← Back to Assigned Requests
            </button>
            <div className="d-flex align-items-center gap-2 mb-2">
              <h2 className="h4 fw-700 mb-0">#{request.trackingId ?? request.id}</h2>
              <Badge bg="secondary">Rejected</Badge>
            </div>
            <p className="mb-0 text-muted">Details are read-only for rejected requests.</p>
          </Col>
        </Row>

        <Row className="g-4">
          <Col xs={12} lg={8}>
            <Card className="sw-card border-0">
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
                    <div className="fw-500">{formatDateTime(request.requestDate) || 'Not specified'}</div>
                  </Col>
                </Row>
                <div className="mb-3">
                  <div className="mb-2 small text-muted">Description</div>
                  <div className="p-3 rounded-3 bg-light bg-opacity-50 small">
                    {request.description || 'No detailed description provided.'}
                  </div>
                </div>
                <Row className="mb-3">
                  <Col xs={12} md={6}>
                    <div className="mb-2 small text-muted">Location</div>
                    <div className="fw-500">{request.location || 'Not specified'}</div>
                  </Col>
                  <Col xs={12} md={6}>
                    <div className="mb-2 small text-muted">Priority</div>
                    <Badge bg={getPriorityVariant(request.priority)}>
                      {request.priority?.toUpperCase() ?? 'MEDIUM'}
                    </Badge>
                  </Col>
                </Row>
                {evidenceUrls.length > 0 && (
                  <div>
                    <div className="mb-2 small text-muted">Attachments</div>
                    <ul className="small mb-0">
                      {evidenceUrls.map((url, idx) => (
                        <li key={idx}>
                          <a href={resolveUrl(url)} target="_blank" rel="noreferrer">
                            {url}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>

          <Col xs={12} lg={4}>
            <Card className="sw-card border-0">
              <Card.Header className="bg-white border-0 pt-4 pb-3">
                <h5 className="mb-0 fw-700">Requester Details</h5>
              </Card.Header>
              <Card.Body>
                {request.anonymous ? (
                  <div className="text-muted small">Anonymous request. Identity is hidden.</div>
                ) : (
                  <>
                    <div className="mb-2 small text-muted">Name</div>
                    <div className="fw-600 mb-3">{request.requesterName || 'Not provided'}</div>
                    <div className="mb-2 small text-muted">Email</div>
                    <div className="fw-500 mb-3">{userProfile?.email || 'Not provided'}</div>
                    <div className="mb-2 small text-muted">Phone</div>
                    <div className="fw-500 mb-3">{userProfile?.phone || 'Not provided'}</div>
                    <div className="mb-2 small text-muted">Address</div>
                    <div className="fw-500">{userProfile?.address || request.location || 'Not provided'}</div>
                  </>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    )
  }

  return (
    <Container fluid className="py-4 sw-dashboard">
      {showCompletionSuccessBanner && (
        <Row className="mb-3">
          <Col xs={12}>
            <div className="alert alert-success d-flex align-items-center mb-0">
              <span className="me-2 fs-5">✅</span>
              <span>All tasks completed successfully. This request has been marked complete.</span>
            </div>
          </Col>
        </Row>
      )}
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
                {topStatusLabel}
              </Badge>
              <Badge bg={getPriorityVariant(request.priority)} className="px-3 py-2">
                Priority: {request.priority?.toUpperCase() ?? 'MEDIUM'}
              </Badge>
            </div>
            <div className="d-flex flex-wrap gap-2 justify-content-end">
              {request.requesterUserId && !request.anonymous && (
                <Button
                  variant="outline-primary"
                  size="sm"
                  className="fw-600"
                  onClick={() =>
                    navigate(
                      `/social-worker/messages?userId=${encodeURIComponent(request.requesterUserId!)}`
                    )
                  }
                >
                  Message User
                </Button>
              )}
              {request.status === 'COMPLETED' && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => navigate(`/social-worker/requests/${request.id}/report`)}
                >
                  View Report
                </Button>
              )}
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={() => window.print()}
              >
                Print
              </Button>
            </div>
          </div>
        </Col>
      </Row>

      {isCollaboratorView && (
        <Row className="mb-3">
          <Col xs={12}>
            <Card className="sw-card border-0 bg-info bg-opacity-10">
              <Card.Body className="py-3 d-flex flex-wrap justify-content-between align-items-center gap-2">
                <div>
                  <div className="d-flex align-items-center gap-2 mb-1">
                    <Badge bg="info" className="fw-normal">
                      Collaborator
                    </Badge>
                    <span className="small text-muted">
                      You are a collaborator on this case. The primary social worker keeps ownership.
                    </span>
                  </div>
                  <div className="small text-muted">
                    Quick actions: <strong>Add internal note</strong>, <strong>Assign resource</strong>,{' '}
                    <strong>Send message</strong>, <strong>Add follow-up</strong>, <strong>Upload document</strong>. You
                    cannot close this case.
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {isAssigned ? (
        <Row className="g-4">
          <Col xs={12} lg={8}>
            <Card className="sw-card border-0 mb-4">
              <Card.Header className="bg-white border-0 pt-4 pb-3">
                <h5 className="mb-0 fw-700">Pending Acceptance – Review Evidence First</h5>
              </Card.Header>
              <Card.Body>
                {/* 1️⃣ Request Evidence - original report from public user (read-only) */}
                <div className="mb-4">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <div>
                      <div className="small text-muted fw-600 text-uppercase">Request Evidence</div>
                      <div className="small text-muted">
                        Read-only snapshot of the original report as submitted.
                      </div>
                    </div>
                    <Badge bg={getPriorityVariant(request.priority)} className="px-3 py-2">
                      Priority: {request.priority?.toUpperCase() ?? 'MEDIUM'}
                    </Badge>
                  </div>
                  <div className="small text-muted mb-1">
                    Date of incident / report:{' '}
                    <span className="fw-500">
                      {formatDateTime(request.requestDate) || 'Not specified'}
                    </span>
                  </div>
                  <div className="small text-muted mb-1">
                    Incident location:{' '}
                    <span className="fw-500">{request.location || 'No location provided'}</span>
                  </div>
                  <div className="small text-muted mb-2">
                    Report category:{' '}
                    <span className="fw-500 d-inline-flex align-items-center gap-1">
                      <span>{helpIcon}</span>
                      <span>{helpLabel}</span>
                    </span>
                  </div>
                  <div className="p-3 rounded-3 bg-light bg-opacity-50 small mb-2">
                    {request.description || 'No detailed description provided.'}
                  </div>
                  {evidenceUrls.length > 0 && (
                    <div>
                      <div className="small text-muted mb-1">Uploaded photos / documents</div>
                      <ul className="small mb-0">
                        {evidenceUrls.map((url, idx) => (
                          <li key={idx}>
                            <a href={resolveUrl(url)} target="_blank" rel="noreferrer">
                              {url}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* 2️⃣ Public User Details Panel */}
                <div className="mb-4">
                  <div className="small text-muted fw-600 text-uppercase mb-1">
                    Public user details
                  </div>
                  {request.anonymous ? (
                    <>
                      <div className="fw-600">Anonymous Request</div>
                      <div className="small text-muted">
                        Identity hidden for safety. No contact information is available.
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="fw-600">
                        {request.requesterName || 'Public user'}
                      </div>
                      <div className="small text-muted mb-1">
                        Age: {request.approximateAge || 'Not provided'}
                        {' · '}
                        Location: {request.location || 'Not provided'}
                      </div>
                      {(userProfile?.email || userProfile?.phone) && (
                        <div className="small text-muted">
                          {userProfile?.email && <span>Email: {userProfile.email}</span>}
                          {userProfile?.email && userProfile?.phone && <span> · </span>}
                          {userProfile?.phone && <span>Phone: {userProfile.phone}</span>}
                        </div>
                      )}
                    </>
                  )}
                  <div className="small text-muted mt-1">
                    Request ID: #{request.trackingId || request.id}
                  </div>
                </div>

                {/* 3️⃣ Timeline (Read Only) */}
                <div className="mb-4">
                  <div className="text-muted mb-2 small fw-600">Timeline (read only)</div>
                  <div className="small text-muted mb-2">
                    System history so far: request submitted, admin review, and assignment.
                  </div>
                  <VerticalTimeline
                    steps={buildTimelineSteps(request).slice(0, 4)}
                    compact={true}
                  />
                </div>

                {/* ⚖️ Decision section */}
                <div className="border-top pt-3">
                  <div className="small text-muted fw-600 mb-2">Decision</div>
                  <p className="small text-muted mb-3">
                    Read the evidence above, then choose how to proceed. Until you accept,
                    service packages, resources, collaboration, and follow-ups stay hidden.
                  </p>
                  <div className="d-flex flex-column flex-sm-row flex-wrap gap-2">
                    <Button variant="success" className="fw-600" onClick={handleAcceptRequest}>
                      Accept
                    </Button>
                    <Button
                      variant="outline-danger"
                      className="fw-600"
                      onClick={() => {
                        setRejectMode('REJECT')
                        setTransferWorkerId(null)
                        setTransferNote('')
                        setRejectModalOpen(true)
                      }}
                    >
                      Reject
                    </Button>
                    <Button
                      variant="outline-secondary"
                      className="fw-600"
                      onClick={() => {
                        setRejectMode('TRANSFER')
                        setTransferWorkerId(null)
                        setTransferNote('')
                        setRejectModalOpen(true)
                      }}
                    >
                      Transfer
                    </Button>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      ) : (
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

                <Card className="sw-card border-0 mb-4">
                  <Card.Header className="bg-white border-0 pt-4 pb-3">
                    <h5 className="mb-0 fw-700">📝 Internal Notes (SW only)</h5>
                    <div className="small text-muted">Not visible to public users.</div>
                  </Card.Header>
                  <Card.Body>
                    <Form.Group className="mb-3">
                      <Form.Label className="small fw-600 text-muted">Add note</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={2}
                        value={internalNoteText}
                        onChange={(e) => setInternalNoteText(e.target.value)}
                        placeholder="Discuss strategy, observations, action plan..."
                      />
                    </Form.Group>
                    <div className="d-flex justify-content-end mb-3">
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={addInternalNote}
                        disabled={!internalNoteText.trim()}
                      >
                        Save note
                      </Button>
                    </div>
                    {internalNotes.length === 0 ? (
                      <div className="small text-muted">No internal notes yet.</div>
                    ) : (
                      <ul className="list-unstyled mb-0">
                        {[...internalNotes]
                          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                          .map((n) => (
                            <li key={n.id} className="mb-3 p-3 bg-light rounded">
                              <div className="d-flex justify-content-between align-items-start">
                                <div>
                                  <div className="fw-600 small">{n.authorName || 'SW'}</div>
                                  <div className="text-muted small">
                                    {new Date(n.createdAt).toLocaleString()}
                                  </div>
                                </div>
                                <Button
                                  variant="link"
                                  size="sm"
                                  className="text-danger p-0"
                                  onClick={() => deleteInternalNote(n.id)}
                                >
                                  Delete
                                </Button>
                              </div>
                              <div className="small mt-2">{n.text}</div>
                            </li>
                          ))}
                      </ul>
                    )}
                  </Card.Body>
                </Card>

                <Card className="sw-card border-0 mb-4">
                  <Card.Header className="bg-white border-0 pt-4 pb-3 d-flex justify-content-between align-items-center">
                    <div>
                      <h5 className="mb-0 fw-700">👥 Collaboration</h5>
                      <div className="small text-muted">Case owner and collaborators.</div>
                    </div>
                    {isOwner && collaboration && (
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => {
                          setShowCollaborationModal(true)
                          setCollabSearch('')
                          setCollabDistrictFilter('ALL')
                          setCollabSpecializationFilter('ALL')
                          setCollabAvailabilityFilter('ALL')
                          setSelectedCollaboratorUserId('')
                          setSelectedCollabPermission('VIEW_ONLY')
                          setCollabReason('')
                          setCollabError(null)
                        }}
                      >
                        Add Collaborator
                      </Button>
                    )}
                  </Card.Header>
                  <Card.Body>
                    <div className="mb-3">
                      <div className="small text-muted">Case Owner</div>
                      <div className="fw-600">
                        {collaboration?.ownerName || 'You'}
                      </div>
                    </div>
                    <div className="mb-3">
                      <div className="small text-muted mb-1">Collaborators</div>
                      {collaboration?.collaborators?.length ? (
                        <ul className="mb-0 small">
                          {collaboration.collaborators.map((c) => (
                            <li key={c.collaborationId} className="mb-1">
                              <span className="fw-600">{c.name || c.userId}</span>
                              {` • ${c.permission.replace('_', ' ').toLowerCase()}`}
                              {` • ${c.status}`}
                              {isOwner && (
                                <Button
                                  size="sm"
                                  variant="link"
                                  className="ps-2 text-danger"
                                  onClick={async () => {
                                    if (!requestId) return
                                    try {
                                      await removeHelpRequestCollaborator(requestId, c.userId)
                                      setCollaboration((prev) =>
                                        prev
                                          ? {
                                            ...prev,
                                            collaborators: prev.collaborators.filter(
                                              (col) => col.collaborationId !== c.collaborationId
                                            ),
                                          }
                                          : prev
                                      )
                                    } catch (err) {
                                      setCollabError(
                                        err instanceof Error ? err.message : 'Failed to remove collaborator.'
                                      )
                                    }
                                  }}
                                >
                                  Remove
                                </Button>
                              )}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <div className="small text-muted">No collaborators yet.</div>
                      )}
                    </div>
                    {collaboration?.pendingRequests?.length ? (
                      <div>
                        <div className="small text-muted mb-1">Pending requests</div>
                        <ul className="mb-0 small">
                          {collaboration.pendingRequests.map((p) => (
                            <li key={p.collaborationId} className="mb-1">
                              <span className="fw-600">{p.name || p.userId}</span>
                              {` • ${p.permission.replace('_', ' ').toLowerCase()}`}
                              {p.reason ? ` • ${p.reason}` : ''}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : null}
                  </Card.Body>
                </Card>
              </Card.Body>
            </Card>

            {timeline.length > 0 && (
              <Card className="sw-card border-0 mb-4">
                <Card.Header className="bg-white border-0 pt-4 pb-3">
                  <h5 className="mb-0 fw-700">Request Timeline</h5>
                </Card.Header>
                <Card.Body>
                  <VerticalTimeline
                    steps={timeline.map((item, idx) => {
                      // Normalize labels based on common stages
                      let label = item.message || item.description || 'Timeline Event'
                      const type = item.eventType?.toUpperCase()

                      if (type === 'REQUEST_SUBMITTED' || type === 'SUBMITTED') label = 'Request Submitted'
                      else if (type === 'PACKAGE_APPLIED' || type === 'PROPOSED') label = 'Service Package Proposed'
                      else if (type === 'PACKAGE_ACCEPTED' || type === 'ACCEPTED') label = 'Package Approved by User'
                      else if (type === 'SERVICE_STARTED' || type === 'IN_PROGRESS') label = 'In Progress'
                      else if (type === 'COMPLETED' || type === 'RESOLVED') label = 'Completed'
                      else if (type === 'STATUS_CHANGE') label = `Status Updated: ${item.message || item.description}`

                      return {
                        id: String(item.id ?? idx),
                        label,
                        date: item.eventTime || item.timestamp,
                        description: (item.message && item.description && item.message !== item.description)
                          ? item.description
                          : (item.actor ? `By ${item.actor}` : undefined),
                        status: idx === 0 ? 'active' : 'completed',
                      }
                    })}
                  />
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
                      <Row className="g-2 small mb-3">
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

                      <div className="d-flex flex-wrap gap-2">
                        {hasServiceAccess && isPackageApprovedNotStarted && (
                          <>
                            <Button
                              variant="primary"
                              size="sm"
                              className="fw-600"
                              onClick={async () => {
                                if (!requestId) return
                                try {
                                  const updated = await startServiceExecution(requestId)
                                  setRequest(updated)
                                } catch (err) {
                                  console.error('Failed to start service execution', err)
                                }
                              }}
                            >
                              🚀 Start Service
                            </Button>
                            <Button
                              variant="outline-primary"
                              size="sm"
                              className="fw-600"
                              onClick={() => {
                                const el = document.getElementById('sw-package-details')
                                if (el) {
                                  el.scrollIntoView({ behavior: 'smooth', block: 'start' })
                                }
                              }}
                            >
                              View Package Details
                            </Button>
                            {request.requesterUserId && !request.anonymous && (
                              <Button
                                variant="outline-secondary"
                                size="sm"
                                className="fw-600"
                                onClick={() =>
                                  navigate(
                                    `/social-worker/messages?userId=${encodeURIComponent(
                                      request.requesterUserId!
                                    )}`
                                  )
                                }
                              >
                                Message User
                              </Button>
                            )}
                          </>
                        )}

                        {hasServiceAccess &&
                          request.serviceStarted &&
                          request.allServicesCompleted &&
                          !request.finalAssessmentCompleted && (
                            <Button
                              variant="warning"
                              size="sm"
                              className="fw-600"
                              onClick={() => {
                                setAssessmentData({
                                  objectivesAchieved: true,
                                  childSafe: true,
                                  needsContinuedMonitoring: false,
                                  recommendClosure: true,
                                  remarks: '',
                                })
                                setShowAssessmentModal(true)
                              }}
                            >
                              📝 Fill Final Assessment
                            </Button>
                          )}

                        {showCompleteRequestButton && (
                          <Button
                            variant="success"
                            size="sm"
                            className="fw-600"
                            disabled={finalizeSubmitting || !canCompleteRequest}
                            onClick={() => setShowCompleteRequestModal(true)}
                          >
                            ✅ Complete Request
                          </Button>
                        )}
                      </div>
                      {isPackageApprovedNotStarted && (
                        <div className="small text-muted mt-2">No resource assignment yet.</div>
                      )}
                      {finalizeError && (
                        <div className="alert alert-danger small mt-2 py-1">{finalizeError}</div>
                      )}
                    </Card.Body>
                  </Card>
                  {/* Scenario A: User Accepted – Service Execution Workspace (Requirements, Resources, Summary) */}
                  {hasServiceAccess && pkgStatus === 'ACCEPTED' && request.serviceStarted && (
                    <div className="mt-3" id="sw-package-details">
                      <h6 className="fw-600 mb-2">🚀 Service Execution Workspace</h6>
                      <p className="small text-muted mb-3">
                        Request status: In Progress. Track requirements, assign resources, and monitor overall progress.
                      </p>

                      <Row className="g-3">
                        {/* LEFT – Requirements Checklist */}
                        <Col xs={12} lg={4}>
                          <Card className="border-0 shadow-sm h-100">
                            <Card.Header className="bg-white border-0 py-3">
                              <h6 className="mb-0 fw-700">Requirements Checklist</h6>
                              <div className="small text-muted">Click a requirement to select it.</div>
                            </Card.Header>
                            <Card.Body className="py-2">
                              <ul className="list-unstyled mb-0 small">
                                {(request.appliedPackageItemExecutions ?? request.appliedPackage?.items ?? []).map(
                                  (itemOrExec) => {
                                    const item =
                                      typeof itemOrExec === 'string' ? itemOrExec : itemOrExec.serviceItem
                                    const exec =
                                      typeof itemOrExec === 'object' ? itemOrExec : null
                                    const status = exec?.status ?? 'NOT_STARTED'
                                    const completed = status === 'COMPLETED'
                                    const inProgress = status === 'IN_PROGRESS'
                                    const isSelected = selectedRequirementItem === item

                                    return (
                                      <li
                                        key={item}
                                        className={`py-2 px-2 rounded-3 mb-1 cursor-pointer ${isSelected ? 'bg-primary bg-opacity-10' : 'bg-light bg-opacity-25'
                                          }`}
                                        onClick={() => setSelectedRequirementItem(item)}
                                      >
                                        <div className="d-flex justify-content-between align-items-center gap-2">
                                          <div className="d-flex align-items-center gap-2">
                                            <Form.Check
                                              type="checkbox"
                                              checked={completed}
                                              readOnly
                                            />
                                            <span className="fw-500">{item}</span>
                                          </div>
                                          <Badge
                                            bg={completed ? 'success' : inProgress ? 'primary' : 'secondary'}
                                          >
                                            {completed
                                              ? 'Completed'
                                              : inProgress
                                                ? 'In Progress'
                                                : 'Not Started'}
                                          </Badge>
                                        </div>
                                      </li>
                                    )
                                  }
                                )}
                              </ul>
                            </Card.Body>
                          </Card>
                        </Col>

                        {/* CENTER – Resource Assignment Panel */}
                        <Col xs={12} lg={4}>
                          <Card className="border-0 shadow-sm h-100">
                            <Card.Header className="bg-white border-0 py-3 d-flex justify-content-between align-items-center">
                              <div>
                                <h6 className="mb-0 fw-700">Resource Assignment</h6>
                                <div className="small text-muted">
                                  Assign one or more resources to each requirement.
                                </div>
                              </div>
                              <Button
                                variant="outline-primary"
                                size="sm"
                                className="fw-600"
                                disabled={!selectedRequirementItem}
                                onClick={() => {
                                  const item = selectedRequirementItem
                                  if (!item) return
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
                                }}
                              >
                                Assign Resource
                              </Button>
                            </Card.Header>
                            <Card.Body className="py-2 small">
                              {Array.isArray(request.appliedPackageItemExecutions) &&
                                request.appliedPackageItemExecutions.some((ex) => ex.assignedResource) ? (
                                <ul className="list-unstyled mb-0">
                                  {request.appliedPackageItemExecutions
                                    .filter((ex) => ex.assignedResource)
                                    .map((ex) => (
                                      <li
                                        key={`${ex.serviceItem}-${ex.assignedResource}`}
                                        className="py-1 border-bottom border-light"
                                      >
                                        <div className="fw-500">{ex.serviceItem}</div>
                                        <div className="text-muted">
                                          Resource: <strong>{ex.assignedResource}</strong>
                                        </div>
                                      </li>
                                    ))}
                                </ul>
                              ) : (
                                <div className="text-muted">
                                  No resources assigned yet. Select a requirement and click
                                  &nbsp;
                                  <span className="fw-600">Assign Resource</span> to begin.
                                </div>
                              )}
                            </Card.Body>
                          </Card>
                        </Col>

                        {/* RIGHT – Case Status Panel */}
                        <Col xs={12} lg={4}>
                          <Card className="border-0 shadow-sm h-100">
                            <Card.Header className="bg-white border-0 py-3">
                              <h6 className="mb-0 fw-700">Execution Summary</h6>
                            </Card.Header>
                            <Card.Body className="py-2 small">
                              {(() => {
                                const allItems =
                                  request.appliedPackageItemExecutions ?? request.appliedPackage?.items ?? []
                                const totalRequirements = allItems.length
                                const completedRequirements = (request.appliedPackageItemExecutions ?? []).filter(
                                  (ex) => ex.status === 'COMPLETED'
                                ).length
                                const activeResources = (request.appliedPackageItemExecutions ?? []).filter(
                                  (ex) => !!ex.assignedResource
                                ).length
                                const doneFollowUps = followUps.filter(
                                  (fu) => fu.status === 'COMPLETED' || fu.status === 'DONE'
                                ).length
                                const percent =
                                  totalRequirements > 0
                                    ? Math.round((completedRequirements / totalRequirements) * 100)
                                    : 0

                                return (
                                  <>
                                    <div className="mb-2">
                                      <div className="d-flex justify-content-between align-items-center mb-1">
                                        <span className="text-muted">Overall progress</span>
                                        <span className="fw-600">{percent}%</span>
                                      </div>
                                      <div className="progress" style={{ height: 6 }}>
                                        <div
                                          className="progress-bar bg-success"
                                          role="progressbar"
                                          style={{ width: `${percent}%` }}
                                        />
                                      </div>
                                    </div>
                                    <ul className="list-unstyled mb-3">
                                      <li>
                                        Requirements completed:{' '}
                                        <strong>
                                          {completedRequirements} / {totalRequirements}
                                        </strong>
                                      </li>
                                      <li>
                                        Resources active: <strong>{activeResources}</strong>
                                      </li>
                                      <li>
                                        Follow-ups done: <strong>{doneFollowUps}</strong>
                                      </li>
                                    </ul>
                                    <div className="d-flex flex-column gap-2">
                                      {!isCollaboratorView && (
                                        <Button
                                          variant="outline-primary"
                                          size="sm"
                                          className="fw-600"
                                          onClick={() => {
                                            const d = new Date()
                                            const pad = (n: number) => n.toString().padStart(2, '0')
                                            const local = `${d.getFullYear()}-${pad(
                                              d.getMonth() + 1
                                            )}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(
                                              d.getMinutes()
                                            )}`
                                            setFollowUpModal(
                                              selectedRequirementItem ? { item: selectedRequirementItem } : { item: undefined }
                                            )
                                            setFollowUpTitle('')
                                            setFollowUpTaskItem(selectedRequirementItem ?? '')
                                            setFollowUpVisitDate(local)
                                            setFollowUpNextVisitDate('')
                                            setFollowUpMode('HOME_VISIT')
                                            setFollowUpCondition('')
                                            setFollowUpNotes('')
                                            setFollowUpError(null)
                                          }}
                                        >
                                          Add Follow-up
                                        </Button>
                                      )}
                                      {!isCollaboratorView && hasAcceptedCollaborators && (
                                        <Button
                                          variant="outline-secondary"
                                          size="sm"
                                          className="fw-600"
                                          onClick={() => {
                                            setShowAssignDutiesModal(true)
                                            setAssignDutiesMessage('')
                                            setAssignDutiesError(null)
                                          }}
                                        >
                                          Collaborate
                                        </Button>
                                      )}
                                      {!isCollaboratorView && (
                                        <Button
                                          variant="outline-success"
                                          size="sm"
                                          className="fw-600"
                                          disabled={!selectedRequirementItem}
                                          onClick={async () => {
                                            const item = selectedRequirementItem
                                            if (!item || !requestId) return
                                            try {
                                              setServiceActionLoading(item)
                                              const updated = await updateServiceItemStatus(
                                                requestId,
                                                item,
                                                'COMPLETED'
                                              )
                                              setRequest(updated)
                                            } catch (err) {
                                              console.error('Failed to mark requirement complete', err)
                                            } finally {
                                              setServiceActionLoading(null)
                                            }
                                          }}
                                        >
                                          Mark Requirement Complete
                                        </Button>
                                      )}
                                    </div>
                                  </>
                                )
                              })()}
                            </Card.Body>
                          </Card>
                        </Col>
                      </Row>
                    </div>
                  )}

                  {/* Scenario B: Pending (adjustment need) – can Revise or Apply different package */}
                  {(!pkgStatus || pkgStatus === 'PENDING') && (
                    <div className="mt-3">
                      <p className="small text-muted mb-2">Waiting for public user to accept or reject this package.</p>
                      <p className="small text-muted mb-2">If the user requested <strong>adjustments</strong>, you can:</p>
                      <div className="d-flex flex-wrap gap-2">

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

                        <Button variant="outline-secondary" size="sm" onClick={() => setShowApplyModal(true)}>
                          Apply different package
                        </Button>
                        <Button variant="outline-danger" size="sm" onClick={handleCloseRequest} disabled={closeRequestLoading}>
                          {closeRequestLoading ? 'Closing…' : 'Close request'}
                        </Button>
                      </div>
                      {closeWarning && (
                        <div className="alert alert-warning small mt-3 mb-0">
                          {closeWarning}
                        </div>
                      )}
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

                  </>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

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

                // ensure overall request status is in progress
                try {
                  const reqUpdated = await updateRequestStatus(requestId, 'IN_PROGRESS')
                  if (reqUpdated) setRequest(reqUpdated)
                } catch (innerErr) {
                  // non-blocking: if setting request status fails, log but continue
                  console.error('Failed to set request status IN_PROGRESS', innerErr)
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
                            <div className="d-flex align-items-center gap-2">
                              {res.image && (
                                <img
                                  src={res.image}
                                  alt=""
                                  style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }}
                                />
                              )}
                              <div>
                                <div className="fw-600 small">{res.name}</div>
                                {res.verified && (
                                  <div className="small text-success">Verified</div>
                                )}
                              </div>
                            </div>
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
              {assignError && (
                <div className="alert alert-danger py-2 small">{assignError}</div>
              )}
              {!selectedResourceId && (
                <p className="small text-muted mb-0">
                  Select a resource from the list on the left, then click <strong>Confirm assignment</strong> to link it
                  to the chosen requirement.
                </p>
              )}
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
              setAssignError(null)
              setAssignLoading(true)
              try {
                const updated = await assignServiceItemResource(requestId, assignResourceModal.item, {
                  assignedResource: `${res.name} (${res.location})`,
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

      {/* Collaboration modal */}
      <Modal show={showCollaborationModal} onHide={() => setShowCollaborationModal(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title className="h6 fw-700">Add Collaborator</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row className="g-3 mb-3">
            <Col xs={12} md={4}>
              <Form.Label className="small fw-600 text-muted">Search by name</Form.Label>
              <Form.Control
                value={collabSearch}
                onChange={(e) => setCollabSearch(e.target.value)}
                placeholder="Type a name or email..."
              />
            </Col>
            <Col xs={6} md={3}>
              <Form.Label className="small fw-600 text-muted">District</Form.Label>
              <Form.Select
                value={collabDistrictFilter}
                onChange={(e) => setCollabDistrictFilter(e.target.value)}
              >
                <option value="ALL">All</option>
                {[...new Set(swDirectory.map((s) => s.serviceArea).filter(Boolean))].map((d) => (
                  <option key={d as string} value={d as string}>
                    {d}
                  </option>
                ))}
              </Form.Select>
            </Col>
            <Col xs={6} md={3}>
              <Form.Label className="small fw-600 text-muted">Specialization</Form.Label>
              <Form.Select
                value={collabSpecializationFilter}
                onChange={(e) => setCollabSpecializationFilter(e.target.value)}
              >
                <option value="ALL">All</option>
                {[...new Set(swDirectory.flatMap((s) => s.specializations || []))].map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </Form.Select>
            </Col>
            <Col xs={6} md={2}>
              <Form.Label className="small fw-600 text-muted">Availability</Form.Label>
              <Form.Select
                value={collabAvailabilityFilter}
                onChange={(e) =>
                  setCollabAvailabilityFilter(e.target.value as 'ALL' | 'ACTIVE' | 'BUSY' | 'ON_LEAVE')
                }
              >
                <option value="ALL">All</option>
                <option value="ACTIVE">Active</option>
                <option value="BUSY">Busy</option>
                <option value="ON_LEAVE">On Leave</option>
              </Form.Select>
            </Col>
          </Row>

          <Row className="g-3">
            <Col xs={12} md={7}>
              <div className="table-responsive" style={{ maxHeight: 360, overflowY: 'auto' }}>
                <table className="table table-sm align-middle">
                  <thead className="table-light">
                    <tr className="small text-muted">
                      <th>Social Worker</th>
                      <th>District</th>
                      <th>Availability</th>
                      <th className="text-end">Select</th>
                    </tr>
                  </thead>
                  <tbody>
                    {swDirectory
                      .filter((sw) => {
                        const q = collabSearch.trim().toLowerCase()
                        if (q) {
                          const label = `${sw.fullName ?? ''} ${sw.email ?? ''}`.toLowerCase()
                          if (!label.includes(q)) return false
                        }
                        if (collabDistrictFilter !== 'ALL' && sw.serviceArea !== collabDistrictFilter) return false
                        if (
                          collabSpecializationFilter !== 'ALL' &&
                          !(sw.specializations || []).includes(collabSpecializationFilter)
                        )
                          return false
                        if (collabAvailabilityFilter !== 'ALL') {
                          const avail = (sw.availabilityStatus || '').toUpperCase()
                          if (avail !== collabAvailabilityFilter) return false
                        }
                        return true
                      })
                      .map((sw) => {
                        const avail = sw.availabilityStatus ?? (sw.available ? 'ACTIVE' : 'BUSY')
                        const selected = selectedCollaboratorUserId === sw.userId
                        return (
                          <tr key={sw.userId} className={selected ? 'table-primary' : undefined}>
                            <td className="small">
                              <div className="fw-600">{sw.fullName || sw.userId}</div>
                              {sw.specializations?.length ? (
                                <div className="text-muted">{sw.specializations.join(', ')}</div>
                              ) : null}
                            </td>
                            <td className="small">{sw.serviceArea || '-'}</td>
                            <td className="small">{avail}</td>
                            <td className="text-end">
                              <Button
                                size="sm"
                                variant={selected ? 'secondary' : 'outline-primary'}
                                onClick={() => setSelectedCollaboratorUserId(selected ? '' : sw.userId)}
                              >
                                {selected ? 'Selected' : 'Select'}
                              </Button>
                            </td>
                          </tr>
                        )
                      })}
                  </tbody>
                </table>
              </div>
              {swDirectory.length === 0 && (
                <div className="small text-muted">No social workers available right now.</div>
              )}
            </Col>
            <Col xs={12} md={5}>
              <h6 className="fw-600 mb-2">Permissions</h6>
              <div className="d-flex flex-column gap-2 mb-3">
                <Form.Check
                  type="radio"
                  id="perm-full"
                  label="Full Access"
                  value="FULL_ACCESS"
                  checked={selectedCollabPermission === 'FULL_ACCESS'}
                  onChange={(e) => setSelectedCollabPermission(e.target.value as CollaborationPermission)}
                />
                <Form.Check
                  type="radio"
                  id="perm-view"
                  label="View Only"
                  value="VIEW_ONLY"
                  checked={selectedCollabPermission === 'VIEW_ONLY'}
                  onChange={(e) => setSelectedCollabPermission(e.target.value as CollaborationPermission)}
                />
                <Form.Check
                  type="radio"
                  id="perm-service"
                  label="Service Only (manage service items)"
                  value="SERVICE_ONLY"
                  checked={selectedCollabPermission === 'SERVICE_ONLY'}
                  onChange={(e) => setSelectedCollabPermission(e.target.value as CollaborationPermission)}
                />
              </div>
              <Form.Group className="mb-3">
                <Form.Label className="small fw-600 text-muted">Reason (optional)</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={collabReason}
                  onChange={(e) => setCollabReason(e.target.value)}
                  placeholder="Need counselling specialist for trauma support."
                />
              </Form.Group>
              {collabError && (
                <div className="alert alert-danger py-2 small">{collabError}</div>
              )}
              <div className="small text-muted">
                The selected SW will receive a notification: "Collaboration request for HELP#{request.trackingId ?? request.id}".
              </div>
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" size="sm" onClick={() => setShowCollaborationModal(false)}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            disabled={!selectedCollaboratorUserId || collabSubmitting || !requestId}
            onClick={async () => {
              if (!requestId || !selectedCollaboratorUserId) return
              setCollabSubmitting(true)
              setCollabError(null)
              try {
                const created = await requestHelpRequestCollaborator(requestId, {
                  collaboratorUserId: selectedCollaboratorUserId,
                  permission: selectedCollabPermission,
                  reason: collabReason.trim() || undefined,
                })
                setCollaboration((prev) =>
                  prev
                    ? {
                      ...prev,
                      pendingRequests: [...(prev.pendingRequests || []), created],
                    }
                    : prev
                )
                setShowCollaborationModal(false)
                setSelectedCollaboratorUserId('')
                setCollabReason('')
              } catch (err) {
                setCollabError(err instanceof Error ? err.message : 'Failed to send request.')
              } finally {
                setCollabSubmitting(false)
              }
            }}
          >
            {collabSubmitting ? 'Sending…' : 'Send Request'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Collaborator: Request owner to assign duties */}
      <Modal
        show={showRequestDutiesModal}
        onHide={() => {
          setShowRequestDutiesModal(false)
          setRequestDutiesMessage('')
          setRequestDutiesError(null)
        }}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title className="h6 fw-700">Request owner to assign duties</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="small text-muted mb-3">
            Send a request to the case owner so they can assign you specific duties for this case.
          </p>
          <Form.Group>
            <Form.Label className="small fw-600 text-muted">Message to case owner (optional)</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={requestDutiesMessage}
              onChange={(e) => setRequestDutiesMessage(e.target.value)}
              placeholder="e.g. I can take on the home visits and counselling follow-ups."
            />
          </Form.Group>
          {requestDutiesError && (
            <div className="alert alert-danger py-2 small mt-2 mb-0">{requestDutiesError}</div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="outline-secondary"
            size="sm"
            onClick={() => {
              setShowRequestDutiesModal(false)
              setRequestDutiesMessage('')
              setRequestDutiesError(null)
            }}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            disabled={requestDutiesSubmitting || !requestId}
            onClick={async () => {
              if (!requestId) return
              setRequestDutiesSubmitting(true)
              setRequestDutiesError(null)
              try {
                const collaboratorName = user?.fullName || 'Collaborator'
                const note = requestDutiesMessage.trim()
                  ? `Collaborator ${collaboratorName} requests duties from owner: ${requestDutiesMessage.trim()}`
                  : `Collaborator ${collaboratorName} requests the case owner to assign duties.`
                await createHelpRequestTimelineNote(requestId, note)
                setShowRequestDutiesModal(false)
                setRequestDutiesMessage('')
              } catch (err) {
                setRequestDutiesError(err instanceof Error ? err.message : 'Failed to send request.')
              } finally {
                setRequestDutiesSubmitting(false)
              }
            }}
          >
            {requestDutiesSubmitting ? 'Sending…' : 'Send request'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Owner: Assign duties to (already added) collaborators */}
      <Modal
        show={showAssignDutiesModal}
        onHide={() => {
          setShowAssignDutiesModal(false)
          setAssignDutiesMessage('')
          setAssignDutiesError(null)
        }}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title className="h6 fw-700">Assign duties to collaborators</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="small text-muted mb-3">
            Send duties or instructions to the collaborators already on this case.
          </p>
          {collaboration?.collaborators?.length ? (
            <div className="small mb-3">
              <span className="text-muted">Collaborators: </span>
              <span className="fw-600">
                {collaboration.collaborators.map((c) => c.name || c.userId).join(', ')}
              </span>
            </div>
          ) : null}
          <Form.Group>
            <Form.Label className="small fw-600 text-muted">Duties / instructions</Form.Label>
            <Form.Control
              as="textarea"
              rows={4}
              value={assignDutiesMessage}
              onChange={(e) => setAssignDutiesMessage(e.target.value)}
              placeholder="e.g. Please take on the home visits for the next 2 weeks and update follow-ups."
            />
          </Form.Group>
          {assignDutiesError && (
            <div className="alert alert-danger py-2 small mt-2 mb-0">{assignDutiesError}</div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="outline-secondary"
            size="sm"
            onClick={() => {
              setShowAssignDutiesModal(false)
              setAssignDutiesMessage('')
              setAssignDutiesError(null)
            }}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            disabled={assignDutiesSubmitting || !requestId || !assignDutiesMessage.trim()}
            onClick={async () => {
              if (!requestId || !assignDutiesMessage.trim()) return
              setAssignDutiesSubmitting(true)
              setAssignDutiesError(null)
              try {
                const note = `Owner assigned duties to collaborators: ${assignDutiesMessage.trim()}`
                await createHelpRequestTimelineNote(requestId, note)
                setShowAssignDutiesModal(false)
                setAssignDutiesMessage('')
              } catch (err) {
                setAssignDutiesError(err instanceof Error ? err.message : 'Failed to send.')
              } finally {
                setAssignDutiesSubmitting(false)
              }
            }}
          >
            {assignDutiesSubmitting ? 'Sending…' : 'Send to collaborators'}
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
                <Form.Label className="small fw-600 text-muted">📌 Title</Form.Label>
                <Form.Control
                  type="text"
                  value={followUpTitle}
                  onChange={(e) => setFollowUpTitle(e.target.value)}
                  placeholder="e.g. Follow-up call after treatment"
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label className="small fw-600 text-muted">📋 Task / Checklist item</Form.Label>
                <Form.Control
                  as="select"
                  value={followUpTaskItem}
                  onChange={(e) => setFollowUpTaskItem(e.target.value)}
                >
                  <option value="">General (no specific task)</option>
                  {[
                    ...new Set(
                      ((request?.appliedPackageItemExecutions ?? request?.appliedPackage?.items) ?? [])
                        .map((itemOrExec: { serviceItem?: string } | string) =>
                          typeof itemOrExec === 'string' ? itemOrExec : itemOrExec?.serviceItem
                        )
                        .filter(Boolean) as string[]
                    ),
                  ].map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </Form.Control>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label className="small fw-600 text-muted">📞 Method</Form.Label>
                <Form.Control
                  as="select"
                  value={followUpMode}
                  onChange={(e) => setFollowUpMode(e.target.value as typeof followUpMode)}
                >
                  <option value="PHONE_CALL">📞 Phone Call</option>
                  <option value="HOME_VISIT">🏠 Home Visit</option>
                  <option value="ONLINE_MEETING">💻 Online Meeting</option>
                  <option value="HOSPITAL_VISIT">🏥 Hospital Visit</option>
                  <option value="DOCUMENT_COLLECTION">🏢 Document Collection</option>
                  <option value="OFFICE_VISIT">🏢 Office Visit</option>
                </Form.Control>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label className="small fw-600 text-muted">📅 Visit date</Form.Label>
                <Form.Control
                  type="datetime-local"
                  value={followUpVisitDate}
                  onChange={(e) => setFollowUpVisitDate(e.target.value)}
                />
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
              <Form.Group className="mb-3">
                <Form.Label className="small fw-600 text-muted">📈 Condition improvement</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  value={followUpCondition}
                  onChange={(e) => setFollowUpCondition(e.target.value)}
                  placeholder="Describe any improvement or deterioration in the child's situation…"
                />
              </Form.Group>
              <Form.Group className="mb-0">
                <Form.Label className="small fw-600 text-muted">🔁 Next visit date</Form.Label>
                <Form.Control
                  type="datetime-local"
                  value={followUpNextVisitDate}
                  onChange={(e) => setFollowUpNextVisitDate(e.target.value)}
                />
                <Form.Text className="small text-muted">
                  This will be used to plan calendar reminders and dashboard alerts for your schedule.
                </Form.Text>
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
                            {(fu.title || fu.serviceItem) && (
                              <div className="small mb-1">
                                {fu.title && <span className="fw-600">{fu.title}</span>}
                                {fu.title && fu.serviceItem && ' · '}
                                {fu.serviceItem && <span className="text-muted">Task: {fu.serviceItem}</span>}
                              </div>
                            )}
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
              if (!requestId || !followUpVisitDate) {
                setFollowUpError('Please select a visit date.')
                return
              }
              setFollowUpError(null)
              setFollowUpSubmitting(true)
              try {
                const visitDateIso = new Date(followUpVisitDate).toISOString()
                const nextVisitIso = followUpNextVisitDate
                  ? new Date(followUpNextVisitDate).toISOString()
                  : undefined
                const notesCombined = [followUpNotes.trim(), followUpCondition.trim()]
                  .filter(Boolean)
                  .join(' | ')
                const created = await createFollowUp({
                  helpRequestId: requestId,
                  type: followUpMode,
                  title: followUpTitle.trim() || undefined,
                  serviceItem: followUpTaskItem.trim() || undefined,
                  scheduledDate: visitDateIso,
                  nextScheduledDate: nextVisitIso,
                  notes: notesCombined,
                  status: 'SCHEDULED',
                })
                setFollowUps((prev) => [...prev, created])
                setFollowUpModal(null)
                setFollowUpTitle('')
                setFollowUpTaskItem('')
                setFollowUpVisitDate('')
                setFollowUpNextVisitDate('')
                setFollowUpNotes('')
                setFollowUpCondition('')
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

      {/* Reject / Transfer modal */}
      <Modal
        show={rejectModalOpen}
        onHide={() => {
          setRejectModalOpen(false)
          setRejectMode(null)
          setRejectReason('')
          setTransferWorkerId(null)
          setTransferNote('')
        }}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {rejectMode === 'TRANSFER' ? 'Transfer Request' : 'Reject Request'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>
              {rejectMode === 'TRANSFER' ? 'Reason for transfer' : 'Reason for rejection'}
            </Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Provide a brief reason (required)"
            />
          </Form.Group>
          {rejectMode === 'TRANSFER' && (
            <>
              <Form.Group className="mb-3">
                <Form.Label>Transfer to another social worker</Form.Label>
                {swDirectory.length === 0 ? (
                  <div className="small text-muted">No available social workers found.</div>
                ) : (
                  <div className="table-responsive">
                    <Table hover size="sm" className="mb-2 align-middle">
                      <thead className="small text-muted">
                        <tr>
                          <th>Social worker</th>
                          <th>Availability</th>
                          <th>Specializations</th>
                        </tr>
                      </thead>
                      <tbody>
                        {swDirectory.map((sw) => {
                          const selected = sw.userId === transferWorkerId
                          return (
                            <tr
                              key={sw.userId}
                              className={selected ? 'table-active' : undefined}
                              onClick={() => setTransferWorkerId(sw.userId)}
                              style={{ cursor: 'pointer' }}
                            >
                              <td className="small fw-600">{sw.fullName}</td>
                              <td>
                                <Badge bg={getAvailabilityVariant(sw.availabilityStatus)}>
                                  {getAvailabilityLabel(sw.availabilityStatus)}
                                </Badge>
                              </td>
                              <td className="small">
                                {sw.specializations && sw.specializations.length > 0
                                  ? sw.specializations.slice(0, 3).join(', ')
                                  : '—'}
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </Table>
                  </div>
                )}
                <Form.Text className="text-muted">
                  Admin will review the transfer suggestion based on availability and specialization.
                </Form.Text>
              </Form.Group>
              <Form.Group className="mb-2">
                <Form.Label>Transfer note (optional)</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  value={transferNote}
                  onChange={(e) => setTransferNote(e.target.value)}
                  placeholder="Any context for admin when reviewing the transfer"
                />
              </Form.Group>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="outline-secondary"
            onClick={() => {
              setRejectModalOpen(false)
              setRejectMode(null)
              setRejectReason('')
              setTransferWorkerId(null)
              setTransferNote('')
            }}
          >
            Cancel
          </Button>
          <Button variant="danger" disabled={rejectSubmitting} onClick={handleRejectRequest}>
            {rejectSubmitting
              ? 'Submitting…'
              : rejectMode === 'TRANSFER'
                ? 'Submit transfer'
                : 'Reject request'}
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
      {/* Outcome Tracking Modal */}
      <Modal show={!!outcomeModal} onHide={() => setOutcomeModal(null)} centered>
        <Modal.Header closeButton>
          <Modal.Title className="h6 fw-700">🔴 Record Service Outcome</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {outcomeModal && (
            <>
              <p className="small mb-3">Record the final result for <strong>{outcomeModal.item}</strong>.</p>
              <Form.Group className="mb-3">
                <Form.Label className="small fw-600 text-muted">Final Outcome</Form.Label>
                <Form.Select
                  value={outcomeType}
                  onChange={(e) => setOutcomeType(e.target.value)}
                >
                  <option value="COMPLETED_SUCCESSFULLY">Completed Successfully</option>
                  <option value="PARTIALLY_COMPLETED">Partially Completed</option>
                  <option value="NOT_DELIVERED">Not Delivered / Failed</option>
                  <option value="CANCELLED">Cancelled</option>
                </Form.Select>
              </Form.Group>

              {(outcomeType === 'PARTIALLY_COMPLETED' || outcomeType === 'NOT_DELIVERED') && (
                <Form.Group className="mb-3">
                  <Form.Label className="small fw-600 text-muted">Reason for partial/non-delivery (required)</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    value={outcomeReason}
                    onChange={(e) => setOutcomeReason(e.target.value)}
                    placeholder="e.g. Budget exhausted, user moved, resource unavailable..."
                  />
                </Form.Group>
              )}

              <Form.Group className="mb-3">
                <Form.Label className="small fw-600 text-muted">Outcome Notes</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={outcomeNotes}
                  onChange={(e) => setOutcomeNotes(e.target.value)}
                  placeholder="Summary of what was achieved, impact, and observations..."
                />
              </Form.Group>
              {outcomeError && <div className="alert alert-danger py-2 small">{outcomeError}</div>}
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" size="sm" onClick={() => setOutcomeModal(null)}>Cancel</Button>
          <Button
            variant="danger"
            size="sm"
            disabled={outcomeSubmitting}
            onClick={async () => {
              if (!requestId || !outcomeModal) return
              if ((outcomeType === 'PARTIALLY_COMPLETED' || outcomeType === 'NOT_DELIVERED') && !outcomeReason.trim()) {
                setOutcomeError('Please provide a reason for the partial or non-delivery.')
                return
              }
              setOutcomeSubmitting(true)
              setOutcomeError(null)
              try {
                const updated = await updateServiceOutcome(requestId, {
                  serviceItem: outcomeModal.item,
                  outcome: outcomeType,
                  reason: outcomeReason.trim(),
                  notes: outcomeNotes.trim(),
                })
                setRequest(updated)
                setOutcomeModal(null)
              } catch (err) {
                setOutcomeError(err instanceof Error ? err.message : 'Failed to record outcome')
              } finally {
                setOutcomeSubmitting(false)
              }
            }}
          >
            {outcomeSubmitting ? 'Recording…' : 'Record Outcome'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Final Assessment Modal */}
      <Modal
        show={showCompleteRequestModal}
        onHide={() => setShowCompleteRequestModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title className="h6 fw-700">✅ Complete Request</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="mb-2 small text-muted">
            All checklist tasks are complete and resources are assigned. You can now complete this request.
          </p>
          <ul className="small mb-3">
            <li>
              Checklist progress: <strong>{checklistCompletedCount} / {checklistTotal}</strong>
            </li>
            <li>
              Resources assigned: <strong>{assignedResourceCount} / {checklistTotal}</strong>
            </li>
          </ul>
          <div className="small text-muted">
            Completing the request will notify both Admin and Public User.
          </div>
          {finalizeError && <div className="alert alert-danger py-2 small mt-3 mb-0">{finalizeError}</div>}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="outline-secondary"
            size="sm"
            onClick={() => setShowCompleteRequestModal(false)}
          >
            Cancel
          </Button>
          <Button
            variant="success"
            size="sm"
            disabled={finalizeSubmitting || !canCompleteRequest}
            onClick={async () => {
              if (!requestId) return
              setFinalizeSubmitting(true)
              setFinalizeError(null)
              try {
                const updated = await finalizeCase(requestId)
                setRequest(updated)
                setShowCompleteRequestModal(false)
                setShowCompletionSuccessBanner(true)
                setTimeout(() => setShowCompletionSuccessBanner(false), 8000)
              } catch (err) {
                setFinalizeError(err instanceof Error ? err.message : 'Failed to complete request')
              } finally {
                setFinalizeSubmitting(false)
              }
            }}
          >
            {finalizeSubmitting ? 'Completing…' : 'Confirm Complete'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Final Assessment Modal */}
      <Modal show={showAssessmentModal} onHide={() => setShowAssessmentModal(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title className="h6 fw-700">📝 Final Case Assessment</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="small text-muted mb-4">Complete this assessment after all service package items are delivered to capture final outcomes and case notes.</p>
          <Row className="g-4">
            <Col xs={12} md={6}>
              <Form.Group className="mb-3">
                <Form.Check
                  type="switch"
                  id="objAchieved"
                  label="All service objectives achieved?"
                  checked={assessmentData.objectivesAchieved}
                  onChange={(e) => setAssessmentData({ ...assessmentData, objectivesAchieved: e.target.checked })}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Check
                  type="switch"
                  id="childSafe"
                  label="Is the child currently safe?"
                  checked={assessmentData.childSafe}
                  onChange={(e) => setAssessmentData({ ...assessmentData, childSafe: e.target.checked })}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Check
                  type="switch"
                  id="monitoring"
                  label="Needs continued monitoring?"
                  checked={assessmentData.needsContinuedMonitoring}
                  onChange={(e) => setAssessmentData({ ...assessmentData, needsContinuedMonitoring: e.target.checked })}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Check
                  type="switch"
                  id="recommendClosure"
                  label="Recommend case closure?"
                  checked={assessmentData.recommendClosure}
                  onChange={(e) => setAssessmentData({ ...assessmentData, recommendClosure: e.target.checked })}
                />
              </Form.Group>
            </Col>
            <Col xs={12} md={6}>
              <Form.Group className="mb-3">
                <Form.Label className="small fw-600 text-muted">Final Remarks & Observation Summary</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={6}
                  value={assessmentData.remarks}
                  onChange={(e) => setAssessmentData({ ...assessmentData, remarks: e.target.value })}
                  placeholder="Provide a comprehensive summary of the case outcome, challenges, and current status..."
                />
              </Form.Group>
            </Col>
          </Row>
          {assessmentError && <div className="alert alert-danger py-2 small">{assessmentError}</div>}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" size="sm" onClick={() => setShowAssessmentModal(false)}>Cancel</Button>
          <Button
            variant="warning"
            size="sm"
            disabled={assessmentSubmitting}
            onClick={async () => {
              if (!requestId) return
              if (!assessmentData.remarks.trim()) {
                setAssessmentError('Please provide final remarks summary.')
                return
              }
              setAssessmentSubmitting(true)
              setAssessmentError(null)
              try {
                const updated = await submitFinalAssessment(requestId, assessmentData)
                setRequest(updated)
                setShowAssessmentModal(false)
              } catch (err) {
                setAssessmentError(err instanceof Error ? err.message : 'Failed to submit assessment')
              } finally {
                setAssessmentSubmitting(false)
              }
            }}
          >
            {assessmentSubmitting ? 'Submitting…' : 'Submit Final Assessment'}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  )
}

