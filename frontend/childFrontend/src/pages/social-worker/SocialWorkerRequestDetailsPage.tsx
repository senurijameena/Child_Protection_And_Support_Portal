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
  Col,
  Row,
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
import type { HelpRequestDTO, ServiceOfferDTO, RequestStatus, HelpType } from '../../types/dashboard'
import { REQUEST_STATUS_LABELS, HELP_TYPE_LABELS } from '../../types/dashboard'

const STATUS_FLOW: RequestStatus[] = ['ASSIGNED', 'IN_PROGRESS', 'COMPLETED']

const FULL_STATUS_FLOW: RequestStatus[] = ['REQUESTED', 'UNDER_REVIEW', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'REJECTED', 'CANCELLED']

type ServicePackageKey =
  | 'FOOD_ASSISTANCE'
  | 'EDUCATION_SUPPORT'
  | 'MEDICAL_HEALTH'
  | 'SHELTER_HOUSING'
  | 'CLOTHING_BASIC'
  | 'COUNSELING_SUPPORT'
  | 'LEGAL_PROTECTION'
  | 'LIVELIHOOD_EMPLOYMENT'
  | 'DISABILITY_SUPPORT'
  | 'EMERGENCY_DISASTER'
  | 'CASE_MANAGEMENT'
  | 'OTHER_CUSTOM'

interface ServicePackageConfig {
  key: ServicePackageKey
  name: string
  badgeLabel: string
  icon: string
  color: string
  accentLight: string
  duration: string
  shortDescription: string
  longDescription: string
  highPriority?: boolean
  dependencyNote?: string
  confidential?: boolean
  helpType: HelpType
  options: string[]
}

const SERVICE_PACKAGES: Record<ServicePackageKey, ServicePackageConfig> = {
  FOOD_ASSISTANCE: {
    key: 'FOOD_ASSISTANCE',
    name: 'Food Assistance',
    badgeLabel: 'Basic Needs',
    icon: '🍞',
    color: '#f97316', // Orange
    accentLight: '#ffedd5',
    duration: 'Short-term / repeating',
    shortDescription: 'Provide food support for children and families facing food insecurity.',
    longDescription:
      'Support children and families facing food insecurity with appropriate food packages, vouchers, or nutrition-specific assistance.',
    helpType: 'FOOD_ASSISTANCE',
    options: [
      'Emergency food ration (3–7 days)',
      'Monthly dry ration pack',
      'Cooked meal distribution',
      'Infant / child nutrition',
      'Pregnant & lactating mother nutrition',
      'Food vouchers / coupons',
      'School meal support',
      'Disaster relief food supply',
    ],
  },
  EDUCATION_SUPPORT: {
    key: 'EDUCATION_SUPPORT',
    name: 'Education Support',
    badgeLabel: 'Development',
    icon: '📚',
    color: '#2563eb', // Blue
    accentLight: '#dbeafe',
    duration: 'Long-term / term-based',
    shortDescription: 'Support schooling needs such as fees, materials, and transport.',
    longDescription:
      'Support children to remain in school or continue education by addressing material, financial, and access barriers.',
    dependencyNote: 'Recommended after stabilising food and shelter where safety is a concern.',
    helpType: 'EDUCATION_SUPPORT',
    options: [
      'School stationery kit',
      'School uniform & shoes',
      'Tuition / extra class support',
      'Exam fee assistance',
      'Books & learning materials',
      'Online learning devices / data support',
      'School transport assistance',
      'Scholarship referral',
    ],
  },
  MEDICAL_HEALTH: {
    key: 'MEDICAL_HEALTH',
    name: 'Medical & Health Assistance',
    badgeLabel: 'Health',
    icon: '🏥',
    color: '#ef4444', // Red
    accentLight: '#fee2e2',
    duration: 'Short-term / episode-based',
    shortDescription: 'Arrange urgent or planned medical assessment and treatment.',
    longDescription:
      'Coordinate urgent or planned medical care, including consultations, tests, medication, and referrals, with emphasis on child safety and timely response.',
    highPriority: true,
    helpType: 'MEDICAL_HELP',
    options: [
      'Doctor consultation',
      'Medicine & pharmacy support',
      'Medical tests & lab reports',
      'Hospital admission support',
      'Surgery / special treatment referral',
      'Mental health counseling',
      'Disability medical support',
      'Emergency medical assistance',
    ],
  },
  SHELTER_HOUSING: {
    key: 'SHELTER_HOUSING',
    name: 'Shelter & Housing Support',
    badgeLabel: 'Safety',
    icon: '🏠',
    color: '#7c3aed', // Purple
    accentLight: '#ede9fe',
    duration: 'Short-term / emergency or temporary',
    shortDescription: 'Secure safe shelter and housing stability for children and families at risk.',
    longDescription:
      'Provide emergency, temporary, or longer-term shelter and housing support when a child or family is unsafe or without stable accommodation.',
    dependencyNote: 'Recommended before education or counseling when there are safety risks.',
    helpType: 'SHELTER',
    options: [
      'Temporary shelter placement',
      'Emergency relocation',
      'Rent assistance',
      'Long-term housing referral',
      'Child safe home placement',
      'Victim protection shelter',
      'Disaster relief housing',
      'Housing legal assistance',
    ],
  },
  CLOTHING_BASIC: {
    key: 'CLOTHING_BASIC',
    name: 'Clothing & Basic Needs',
    badgeLabel: 'Material Support',
    icon: '👕',
    color: '#92400e', // Brown
    accentLight: '#fef3c7',
    duration: 'One-time / seasonal',
    shortDescription: 'Provide age- and season-appropriate clothing and basic items.',
    longDescription:
      'Provide clothing, hygiene items, and basic household essentials needed to maintain children’s dignity, health, and comfort.',
    helpType: 'CLOTHING',
    options: [
      'Adult clothing',
      'Children clothing',
      'School uniforms',
      'Seasonal clothing (rain / winter)',
      'Footwear',
      'Bedding & blankets',
      'Hygiene kits (soap, sanitary items)',
      'Baby care essentials',
    ],
  },
  COUNSELING_SUPPORT: {
    key: 'COUNSELING_SUPPORT',
    name: 'Counseling & Psychosocial Support',
    badgeLabel: 'Psychosocial',
    icon: '🧠',
    color: '#22c55e', // Green
    accentLight: '#dcfce7',
    duration: 'Ongoing / session-based',
    shortDescription: 'Provide psychological support through structured counseling sessions.',
    longDescription:
      'Provide individual, child-focused, family, and trauma-informed counseling or psychosocial support, with strong safeguards for confidentiality.',
    confidential: true,
    helpType: 'COUNSELING',
    options: [
      'Individual counseling',
      'Child counseling',
      'Family counseling',
      'Trauma recovery sessions',
      'Abuse recovery support',
      'Substance abuse counseling',
      'Mental health referral',
      'Follow-up counseling sessions',
    ],
  },
  LEGAL_PROTECTION: {
    key: 'LEGAL_PROTECTION',
    name: 'Legal & Protection Support',
    badgeLabel: 'Legal / Protection',
    icon: '⚖️',
    color: '#0f766e',
    accentLight: '#ccfbf1',
    duration: 'Case-based',
    shortDescription: 'Provide legal guidance and protection-related support.',
    longDescription:
      'Support children and families to access legal protection, file complaints, obtain documentation, and navigate justice and child protection systems.',
    helpType: 'LEGAL_PROTECTION',
    options: [
      'Legal advice & guidance',
      'Police complaint assistance',
      'Child protection referral',
      'Court documentation support',
      'Protection order assistance',
      'Victim advocacy',
      'Identity document support',
      'Human rights referral',
    ],
  },
  LIVELIHOOD_EMPLOYMENT: {
    key: 'LIVELIHOOD_EMPLOYMENT',
    name: 'Livelihood & Employment Support',
    badgeLabel: 'Livelihood',
    icon: '💼',
    color: '#0369a1',
    accentLight: '#e0f2fe',
    duration: 'Medium / long-term',
    shortDescription: 'Support caregivers or youth to gain or improve income.',
    longDescription:
      'Improve household stability by connecting caregivers or older adolescents to employment, skills training, and income-generation opportunities.',
    helpType: 'LIVELIHOOD_EMPLOYMENT',
    options: [
      'Job placement referral',
      'Skill development training',
      'Vocational training programs',
      'Small business startup support',
      'Equipment / tools assistance',
      'CV & interview preparation',
      'Work placement follow-up',
      'Income generation guidance',
    ],
  },
  DISABILITY_SUPPORT: {
    key: 'DISABILITY_SUPPORT',
    name: 'Disability & Special Needs Support',
    badgeLabel: 'Inclusion',
    icon: '♿',
    color: '#4b5563',
    accentLight: '#e5e7eb',
    duration: 'Ongoing / tailored',
    shortDescription: 'Provide support tailored to children with disabilities or special needs.',
    longDescription:
      'Ensure inclusive support through assistive devices, special education, therapeutic services, and caregiver support for children with disabilities.',
    helpType: 'DISABILITY_SUPPORT',
    options: [
      'Assistive devices (wheelchairs, aids)',
      'Special education referral',
      'Therapy services (physio, speech)',
      'Caregiver support',
      'Disability allowance assistance',
      'Accessibility support',
      'Medical certification help',
      'Inclusive service referral',
    ],
  },
  EMERGENCY_DISASTER: {
    key: 'EMERGENCY_DISASTER',
    name: 'Emergency & Disaster Response',
    badgeLabel: 'Emergency',
    icon: '🚨',
    color: '#b91c1c',
    accentLight: '#fee2e2',
    duration: 'Immediate / short-term',
    shortDescription: 'Respond rapidly to emergencies and disasters affecting children.',
    longDescription:
      'Provide fast, life-preserving support during emergencies or disasters, including rescue, shelter, medical, and psychological first aid.',
    highPriority: true,
    helpType: 'EMERGENCY_DISASTER',
    options: [
      'Immediate rescue assistance',
      'Emergency shelter & food',
      'Medical emergency response',
      'Family reunification',
      'Disaster relief kits',
      'Psychological first aid',
      'Relief coordination',
      'Post-disaster follow-up',
    ],
  },
  CASE_MANAGEMENT: {
    key: 'CASE_MANAGEMENT',
    name: 'Case Management & Follow-up',
    badgeLabel: 'Case Management',
    icon: '🧾',
    color: '#7c3aed',
    accentLight: '#ede9fe',
    duration: 'Long-term / cyclic',
    shortDescription: 'Provide structured case management and follow-up over time.',
    longDescription:
      'Coordinate multi-agency responses, monitor progress, reassess risks, and plan long-term support for the child and family.',
    helpType: 'OTHER',
    options: [
      'Case monitoring',
      'Home visits',
      'Progress assessments',
      'Multi-agency coordination',
      'Follow-up reports',
      'Risk reassessment',
      'Case closure evaluation',
      'Long-term support planning',
    ],
  },
  OTHER_CUSTOM: {
    key: 'OTHER_CUSTOM',
    name: 'Other / Custom Support',
    badgeLabel: 'Custom',
    icon: '🧩',
    color: '#6b7280', // Gray
    accentLight: '#e5e7eb',
    duration: 'Custom',
    shortDescription: 'Design a tailored intervention for unique needs.',
    longDescription:
      'Create a tailored package that combines multiple supports or unique interventions not covered by other packages.',
    helpType: 'OTHER',
    options: [
      'Community-based support',
      'NGO referral',
      'Religious organization support',
      'Special request handling',
      'One-time assistance',
      'Pilot program inclusion',
      'Custom aid creation',
    ],
  },
}

const REQUEST_CHECKLISTS: Record<string, string[]> = {
  FOOD_ASSISTANCE: [
    'Assess household food insecurity',
    'Confirm number of beneficiaries',
    'Select food type (dry ration / cooked meals)',
    'Assign supplier or NGO',
    'Schedule delivery date',
    'Notify beneficiary',
    'Confirm delivery completion',
    'Upload delivery proof (image/document)',
    'Record beneficiary acknowledgment',
    'Mark task as complete',
  ],
  EDUCATION_SUPPORT: [
    'Verify student details',
    'Identify education gap (fees, materials, transport)',
    'Confirm school / institute information',
    'Select support type (books, tuition, online access)',
    'Approve budget / funding',
    'Coordinate with education provider',
    'Schedule delivery / payment',
    'Upload receipts / confirmation',
    'Track academic follow-up date',
    'Mark task as complete',
  ],
  MEDICAL_HELP: [
    'Conduct initial medical assessment',
    'Verify medical documents / history',
    'Select hospital / clinic or specialist',
    'Schedule appointment',
    'Notify beneficiary',
    'Upload referral or medical documents',
    'Track visit completion',
    'Upload medical reports',
    'Schedule follow-up visit if needed',
    'Mark task as complete',
  ],
  SHELTER: [
    'Conduct safety & risk assessment',
    'Identify shelter type (temporary / emergency)',
    'Verify availability of shelter',
    'Arrange transport to shelter',
    'Confirm check-in',
    'Upload shelter confirmation documents',
    'Schedule shelter review or exit date',
    'Conduct periodic review (if long-term)',
    'Notify social worker / admin on status',
    'Mark task as complete',
  ],
  CLOTHING: [
    'Assess clothing requirement (age / season)',
    'Confirm sizes and quantity',
    'Choose supplier or donation center',
    'Schedule distribution date',
    'Notify beneficiary',
    'Deliver clothing items',
    'Upload distribution proof',
    'Record acceptance confirmation',
    'Track completion',
    'Mark task as complete',
  ],
  COUNSELING: [
    'Conduct initial psychological assessment',
    'Assign counselor / therapist',
    'Schedule counseling sessions',
    'Notify beneficiary',
    'Record session attendance',
    'Add confidential session notes',
    'Evaluate progress after sessions',
    'Decide continuation or closure',
    'Schedule follow-up sessions',
    'Mark task as complete',
  ],
  LEGAL_PROTECTION: [
    'Review case details and documentation',
    'Verify legal requirements',
    'Coordinate with police / legal authorities',
    'Prepare required legal forms',
    'Submit case to legal authority',
    'Track case progress',
    'Upload legal outcomes / documentation',
    'Notify beneficiary',
    'Follow-up on resolution',
    'Mark task as complete',
  ],
  LIVELIHOOD_EMPLOYMENT: [
    'Assess skill and employment need',
    'Identify suitable training or job program',
    'Refer beneficiary to training or employer',
    'Approve funding / assistance',
    'Assign mentor / trainer if needed',
    'Track program participation',
    'Upload completion / attendance proof',
    'Follow up on income / employment status',
    'Evaluate progress',
    'Mark task as complete',
  ],
  DISABILITY_SUPPORT: [
    'Assess disability or special need',
    'Identify assistive devices required',
    'Refer to special education / therapy services',
    'Assign caregiver if needed',
    'Coordinate with NGO / government support',
    'Track device delivery / therapy sessions',
    'Upload supporting documents',
    'Conduct periodic review',
    'Notify admin / beneficiary',
    'Mark task as complete',
  ],
  EMERGENCY_DISASTER: [
    'Validate emergency situation',
    'Assign priority level',
    'Dispatch emergency support team',
    'Provide immediate aid (food / shelter / medical)',
    'Notify beneficiary and relevant authorities',
    'Track response time and completion',
    'Upload incident report / evidence',
    'Conduct post-disaster follow-up',
    'Close emergency case',
    'Mark task as complete',
  ],
  OTHER: [
    'Define objective of request',
    'Identify resources needed',
    'Assign responsible staff',
    'Schedule tasks and deadlines',
    'Track progress',
    'Upload supporting files',
    'Record outcomes / results',
    'Notify admin / beneficiary',
    'Adjust tasks if needed',
    'Mark task as complete',
  ],
}

function isImageUrl(url: string): boolean {
  return /\.(jpg|jpeg|png|gif|webp)(\?|$)/i.test(url)
}

function getFileName(url: string): string {
  try {
    const parts = url.split('/')
    return parts[parts.length - 1] || 'document'
  } catch {
    return 'document'
  }
}

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
  const [offerDate, setOfferDate] = useState('')
  const [selectedPackageKey, setSelectedPackageKey] = useState<ServicePackageKey | null>(null)
  const [packageStep, setPackageStep] = useState<1 | 2>(1)
  const [packageTasks, setPackageTasks] = useState<{ id: string; label: string; done: boolean }[]>([])
  const [showCompletionModal, setShowCompletionModal] = useState(false)
  const [completionSummary, setCompletionSummary] = useState('')
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [checklist, setChecklist] = useState<{ id: string; label: string; done: boolean }[]>([])
  const [newChecklistItem, setNewChecklistItem] = useState('')
  const [showTransferModal, setShowTransferModal] = useState(false)
  const [transferTargetId, setTransferTargetId] = useState('')
  const [transferReason, setTransferReason] = useState('')
  const [workers, setWorkers] = useState<Array<{ userId: string; fullName: string }>>([])
  const [transfers, setTransfers] = useState<{ id: string; status?: string }[]>([])

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
      .catch(() => { })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadData()
  }, [requestId])

  useEffect(() => {
    if (requestId && r?.helpType) {
      try {
        const stored = localStorage.getItem(`sw-checklist-${requestId}`)
        if (stored) {
          setChecklist(JSON.parse(stored))
        } else {
          // Load default checklist based on request type
          const typeTasks = REQUEST_CHECKLISTS[r.helpType] || REQUEST_CHECKLISTS['OTHER']
          setChecklist(
            typeTasks.map((label, index) => ({
              id: `default-${index}`,
              label,
              done: false,
            }))
          )
        }
      } catch {
        const typeTasks = REQUEST_CHECKLISTS['OTHER']
        setChecklist(
          typeTasks.map((label, index) => ({
            id: `default-${index}`,
            label,
            done: false,
          }))
        )
      }
    }
  }, [requestId, r?.helpType])

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

  const openApplyPackageModal = () => {
    setShowOfferModal(true)
    setOfferDetails('')
    setOfferDate('')
    setSelectedPackageKey(null)
    setPackageStep(1)
    setPackageTasks([])
  }

  const closeApplyPackageModal = () => {
    setShowOfferModal(false)
    setSelectedPackageKey(null)
    setPackageStep(1)
    setPackageTasks([])
    setOfferDetails('')
    setOfferDate('')
  }

  const handleSelectPackage = (key: ServicePackageKey) => {
    setSelectedPackageKey(key)
    setPackageStep(2)
    const cfg = SERVICE_PACKAGES[key]
    setPackageTasks(
      cfg.options.map((label, idx) => ({
        id: `${key}-${idx}`,
        label,
        done: false,
      })),
    )
  }

  const togglePackageTask = (id: string) => {
    setPackageTasks((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)))
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

  const handleApplyServicePackage = async () => {
    if (!r || !r.requesterUserId || !selectedPackageKey || !offerDetails.trim()) {
      alert('Please select a service package, tick at least one support option, and add notes before applying.')
      return
    }
    const cfg = SERVICE_PACKAGES[selectedPackageKey]
    const selectedOptions = packageTasks.filter((t) => t.done).map((t) => `☑ ${t.label}`)
    const unselectedOptions = packageTasks.filter((t) => !t.done).map((t) => `▫ ${t.label}`)

    const optionSummarySections = [
      selectedOptions.length ? `Selected support options:\n${selectedOptions.join('\n')}` : '',
      unselectedOptions.length ? `Available but not selected:\n${unselectedOptions.join('\n')}` : '',
    ].filter(Boolean)

    const details = [
      `${cfg.name} package applied.`,
      cfg.longDescription,
      optionSummarySections.join('\n\n'),
      `Worker notes:\n${offerDetails.trim()}`,
    ]
      .filter(Boolean)
      .join('\n\n')

    setActionLoading(true)
    try {
      await createServiceOffer({
        helpRequestId: r.id,
        offeredToUserId: r.requesterUserId,
        serviceType: cfg.helpType,
        serviceDetails: details,
        scheduledDateTime: offerDate || undefined,
      })
      closeApplyPackageModal()
      loadData()
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Failed to apply service package')
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
                  <h5 className="mb-0">🧾 Request Information</h5>
                </Card.Header>
                <Card.Body>
                  <p><strong>Description:</strong></p>
                  <p className="text-muted">{r.description || '-'}</p>
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
                </Card.Body>
              </Card>

              <Card className="border-0 shadow-sm rounded-3 mb-4">
                <Card.Header className="bg-white border-0 pt-3">
                  <h5 className="mb-0">Request Timeline</h5>
                  <p className="text-muted small mb-0">Submitted → Assigned → In Progress → Completed → Closed</p>
                </Card.Header>
                <Card.Body>
                  <div className="d-flex flex-wrap gap-2 align-items-center mb-3">
                    {FULL_STATUS_FLOW.map((s) => {
                      const isDone = FULL_STATUS_FLOW.indexOf(r.status as RequestStatus) >= FULL_STATUS_FLOW.indexOf(s) || (r.status === 'COMPLETED' && (s === 'COMPLETED' || s === 'REJECTED'))
                      const isCurrent = r.status === s
                      return (
                        <div key={s} className="d-flex align-items-center gap-1">
                          <span
                            className="badge rounded-pill"
                            style={{
                              backgroundColor: isDone || isCurrent ? '#2d6a4f' : '#e5e7eb',
                              color: isDone || isCurrent ? '#fff' : '#9ca3af',
                            }}
                          >
                            {REQUEST_STATUS_LABELS[s]}
                          </span>
                          {s !== 'CANCELLED' && <span className="text-muted small">→</span>}
                        </div>
                      )
                    })}
                  </div>
                  {timeline.length > 0 && (
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
                  )}
                </Card.Body>
              </Card>

              {(canAddNotes || r.status !== 'REQUESTED') && (
                <Card className="border-0 shadow-sm rounded-3 mb-4">
                  <Card.Header className="bg-white border-0 pt-3">
                    <h5 className="mb-0">
                      Service Checklist: {HELP_TYPE_LABELS[(r.helpType as keyof typeof HELP_TYPE_LABELS) || 'OTHER']}
                    </h5>
                  </Card.Header>
                  <Card.Body>
                    <p className="text-muted small mb-2">
                      Complete these specific tasks for an effective {HELP_TYPE_LABELS[(r.helpType as keyof typeof HELP_TYPE_LABELS) || 'OTHER'].toLowerCase()} response.
                    </p>
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
                    <h5 className="mb-0">Apply Service Package</h5>
                  </Card.Header>
                  <Card.Body>
                    <Button
                      className="sw-btn-primary w-100 mb-2"
                      onClick={openApplyPackageModal}
                      disabled={actionLoading}
                    >
                      Apply Service Package
                    </Button>
                    {offers.length > 0 && (
                      <div className="small">
                        <p className="text-muted small mb-1">Previously applied packages for this request:</p>
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
        <Tab eventKey="evidence" title="📎 Evidence">
          <Card className="border-0 shadow-sm rounded-3 mt-3">
            <Card.Header className="bg-white border-0 pt-3">
              <h5 className="mb-0">📎 Evidence Viewing</h5>
              <p className="text-muted small mb-0">Read-only access. Images and documents uploaded with this request.</p>
            </Card.Header>
            <Card.Body>
              {(!r.documentUrls || r.documentUrls.length === 0) ? (
                <div className="text-muted text-center py-5">No evidence or documents uploaded with this request.</div>
              ) : (
                <Row className="g-4">
                  {r.documentUrls.map((url: string, idx: number) => {
                    const base = (import.meta.env.VITE_API_URL as string)?.replace(/\/api\/?$/, '') || 'http://localhost:8080'
                    const fullUrl = url.startsWith('http') ? url : `${base}${url.startsWith('/') ? '' : '/'}${url}`
                    const isImg = isImageUrl(url)
                    const fileName = getFileName(url)
                    return (
                      <Col key={idx} xs={12} sm={6} md={4} lg={3}>
                        <Card className="border h-100">
                          <Card.Body className="p-2">
                            <div className="small text-muted mb-2">
                              <strong>Uploaded by:</strong> Requester
                            </div>
                            {isImg ? (
                              <div
                                className="rounded overflow-hidden bg-light mb-2 cursor-pointer"
                                style={{ height: 140, cursor: 'pointer' }}
                                onClick={() => setPreviewUrl(url)}
                                role="button"
                                tabIndex={0}
                                onKeyDown={(e) => e.key === 'Enter' && setPreviewUrl(url)}
                              >
                                <img src={fullUrl} alt={fileName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              </div>
                            ) : (
                              <div className="d-flex align-items-center justify-content-center bg-light rounded mb-2" style={{ height: 80 }}>
                                <span className="text-muted">📄 {fileName.slice(-20)}</span>
                              </div>
                            )}
                            <div className="d-flex gap-1">
                              <Button size="sm" variant="outline-primary" onClick={() => setPreviewUrl(url)}>
                                View
                              </Button>
                              <a href={fullUrl} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline-secondary">
                                Download
                              </a>
                            </div>
                          </Card.Body>
                        </Card>
                      </Col>
                    )
                  })}
                </Row>
              )}
            </Card.Body>
          </Card>
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

      <Modal show={showOfferModal} onHide={closeApplyPackageModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Apply Service Package</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="mb-3">
            <div className="d-flex align-items-center gap-2 small">
              <span
                className={`rounded-pill px-2 py-1 ${packageStep === 1 ? 'bg-success text-white' : 'bg-light text-muted'
                  }`}
              >
                1. Select Service Package
              </span>
              <span className="text-muted">→</span>
              <span
                className={`rounded-pill px-2 py-1 ${packageStep === 2 ? 'bg-success text-white' : 'bg-light text-muted'
                  }`}
              >
                2. Configure & Tasks
              </span>
            </div>
          </div>

          {packageStep === 1 && (
            <>
              <p className="text-muted small mb-3">
                Choose a service package to apply for this help request. You can review tasks, scheduling, and notes in the next step.
              </p>
              <Row className="g-3">
                {Object.values(SERVICE_PACKAGES).map((pkg) => {
                  const isSelected = selectedPackageKey === pkg.key
                  return (
                    <Col key={pkg.key} xs={12} md={6} lg={4}>
                      <Card
                        className="h-100 border-0 shadow-sm"
                        role="button"
                        onClick={() => handleSelectPackage(pkg.key)}
                        style={{
                          borderRadius: 16,
                          border: isSelected ? `2px solid ${pkg.color}` : '1px solid #e5e7eb',
                          boxShadow: isSelected
                            ? '0 12px 25px rgba(15, 118, 110, 0.25)'
                            : '0 4px 12px rgba(15, 23, 42, 0.08)',
                          transform: isSelected ? 'translateY(-2px)' : 'translateY(0)',
                          transition: 'all 0.18s ease',
                        }}
                      >
                        <Card.Body className="d-flex flex-column gap-2">
                          <div className="d-flex justify-content-between align-items-center">
                            <span style={{ fontSize: 24 }}>{pkg.icon}</span>
                            <span
                              className="badge"
                              style={{ backgroundColor: pkg.color, color: '#fff' }}
                            >
                              {pkg.badgeLabel}
                            </span>
                          </div>
                          <div>
                            <h5 className="mb-1">{pkg.name}</h5>
                            <p className="text-muted small mb-0">{pkg.shortDescription}</p>
                          </div>
                          <div
                            className="mt-2 rounded-pill"
                            style={{
                              height: 4,
                              background: `linear-gradient(90deg, ${pkg.color}, ${pkg.color}55)`,
                            }}
                          />
                        </Card.Body>
                      </Card>
                    </Col>
                  )
                })}
              </Row>
            </>
          )}

          {packageStep === 2 && selectedPackageKey && (() => {
            const pkg = SERVICE_PACKAGES[selectedPackageKey]
            const completedCount = packageTasks.filter((t) => t.done).length
            const totalCount = packageTasks.length || 1
            const pct = Math.round((completedCount / totalCount) * 100)

            return (
              <Row className="g-3">
                <Col md={5}>
                  <Card className="border-0 shadow-sm h-100">
                    <Card.Body>
                      <div className="d-flex align-items-center gap-2 mb-2">
                        <div
                          className="rounded-circle d-flex align-items-center justify-content-center"
                          style={{
                            width: 40,
                            height: 40,
                            backgroundColor: pkg.accentLight,
                            fontSize: 22,
                          }}
                        >
                          {pkg.icon}
                        </div>
                        <div>
                          <h5 className="mb-0">{pkg.name}</h5>
                          <span
                            className="badge mt-1"
                            style={{ backgroundColor: pkg.color, color: '#fff' }}
                          >
                            {pkg.duration}
                          </span>
                        </div>
                      </div>
                      <p className="text-muted small mb-2">{pkg.longDescription}</p>
                      {pkg.dependencyNote && (
                        <p className="text-warning small mb-1">🔗 {pkg.dependencyNote}</p>
                      )}
                      {pkg.highPriority && (
                        <p className="text-danger small mb-1">⚠️ High priority: respond quickly.</p>
                      )}
                      {pkg.confidential && (
                        <p className="text-muted small mb-0">
                          🔐 High confidentiality: store notes securely and sensitively.
                        </p>
                      )}
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={7}>
                  <Card className="border-0 shadow-sm mb-3">
                    <Card.Header className="bg-white border-0 pt-3">
                      <h6 className="mb-0">Task Checklist</h6>
                      <p className="text-muted small mb-0">
                        Follow this guided timeline to deliver the selected package.
                      </p>
                    </Card.Header>
                    <Card.Body>
                      <div
                        className="mb-3 rounded-pill"
                        style={{ height: 6, backgroundColor: '#e5e7eb' }}
                      >
                        <div
                          className="rounded-pill"
                          style={{
                            width: `${pct}%`,
                            height: '100%',
                            backgroundColor: pkg.color,
                            transition: 'width 0.18s ease',
                          }}
                        />
                      </div>
                      <div className="d-flex flex-column gap-2">
                        {packageTasks.map((task, idx) => (
                          <div key={task.id} className="d-flex align-items-start gap-2">
                            <Form.Check
                              type="checkbox"
                              id={`pkg-task-${task.id}`}
                              className="mt-1"
                              checked={task.done}
                              onChange={() => togglePackageTask(task.id)}
                            />
                            <div>
                              <div className="small fw-medium">
                                <span
                                  className="badge me-1"
                                  style={{
                                    backgroundColor: pkg.accentLight,
                                    color: '#374151',
                                    minWidth: 20,
                                  }}
                                >
                                  {idx + 1}
                                </span>
                                {task.label}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </Card.Body>
                  </Card>

                  <Card className="border-0 shadow-sm">
                    <Card.Header className="bg-white border-0 pt-3">
                      <h6 className="mb-0">Scheduling & Notes</h6>
                    </Card.Header>
                    <Card.Body>
                      <Row className="g-2 mb-2">
                        <Col md={6}>
                          <Form.Label className="small text-muted">Start / delivery date</Form.Label>
                          <Form.Control
                            type="datetime-local"
                            value={offerDate}
                            onChange={(e) => setOfferDate(e.target.value)}
                          />
                        </Col>
                        <Col md={6}>
                          <Form.Label className="small text-muted">Duration type</Form.Label>
                          <Form.Control value={pkg.duration} disabled />
                        </Col>
                      </Row>
                      <Form.Label className="small text-muted">Worker notes</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        placeholder="Add case-specific notes, provider details, constraints, or follow-up plans..."
                        value={offerDetails}
                        onChange={(e) => setOfferDetails(e.target.value)}
                      />
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            )
          })()}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={packageStep === 1 ? closeApplyPackageModal : () => setPackageStep(1)}
            disabled={actionLoading}
          >
            {packageStep === 1 ? 'Close' : 'Back'}
          </Button>
          <Button
            className="sw-btn-primary"
            onClick={handleApplyServicePackage}
            disabled={packageStep !== 2 || !selectedPackageKey || !offerDetails.trim() || actionLoading}
          >
            Apply Service Package
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
