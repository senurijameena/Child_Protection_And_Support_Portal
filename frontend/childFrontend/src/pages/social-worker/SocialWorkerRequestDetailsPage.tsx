import { useEffect, useMemo, useState } from 'react'
import { Card, Container, Badge, Button, Row, Col, Form } from 'react-bootstrap'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { getHelpRequest, getMyFollowUps, getUserProfile, type FollowUpDTO } from '../../services/socialWorkerApi'
import type { HelpRequestDTO, HelpType } from '../../types/dashboard'
import { HELP_TYPE_LABELS } from '../../types/dashboard'
import './SocialWorkerDashboard.css'

type PackageStatus = 'DRAFT' | 'PENDING_APPROVAL' | 'IN_PROGRESS' | 'COMPLETED'

type ServiceCategoryId =
  | 'FOOD'
  | 'EDUCATION'
  | 'MEDICAL'
  | 'SHELTER'
  | 'CLOTHING'
  | 'COUNSELING'
  | 'OTHER'

interface ServiceItemConfig {
  id: string
  category: ServiceCategoryId
  label: string
}

const RESOURCE_OPTIONS: string[] = [
  'Local child protection unit',
  'Nearest government hospital / clinic',
  'Nearest pediatric / children’s hospital',
  'Accredited counseling center / psychologist',
  'Registered NGO / charity partner',
  'Emergency shelter / safe house',
  'School social worker / counselor',
  'Community development officer',
  'Legal aid commission / child court unit',
  'Other (custom arrangement)',
]

const SERVICE_ITEMS: ServiceItemConfig[] = [
  // Food Assistance
  { id: 'food-grocery-vouchers', category: 'FOOD', label: 'Grocery vouchers' },
  { id: 'food-meal-kits', category: 'FOOD', label: 'Meal kits' },
  { id: 'food-hot-meals', category: 'FOOD', label: 'Hot meal delivery' },
  { id: 'food-nutrition-counsel', category: 'FOOD', label: 'Nutritional counseling' },
  { id: 'food-special-diet', category: 'FOOD', label: 'Special dietary support' },
  // Educational Support
  { id: 'edu-school-fees', category: 'EDUCATION', label: 'School fees' },
  { id: 'edu-books', category: 'EDUCATION', label: 'Books & stationery' },
  { id: 'edu-uniforms', category: 'EDUCATION', label: 'Uniforms' },
  { id: 'edu-online-tools', category: 'EDUCATION', label: 'Online learning tools' },
  { id: 'edu-tuition', category: 'EDUCATION', label: 'Tuition / mentoring' },
  { id: 'edu-scholarships', category: 'EDUCATION', label: 'Scholarships' },
  // Medical Help
  { id: 'med-consultation', category: 'MEDICAL', label: 'Doctor consultation' },
  { id: 'med-medicines', category: 'MEDICAL', label: 'Medicines / prescriptions' },
  { id: 'med-hospital-visits', category: 'MEDICAL', label: 'Hospital visits' },
  { id: 'med-lab-tests', category: 'MEDICAL', label: 'Lab tests' },
  { id: 'med-vaccination', category: 'MEDICAL', label: 'Vaccination support' },
  { id: 'med-mental-health', category: 'MEDICAL', label: 'Mental health checkups' },
  // Shelter
  { id: 'shelter-temp-accommodation', category: 'SHELTER', label: 'Temporary accommodation' },
  { id: 'shelter-rent-assistance', category: 'SHELTER', label: 'Rent assistance' },
  { id: 'shelter-safe-house', category: 'SHELTER', label: 'Safe house referral' },
  { id: 'shelter-utilities', category: 'SHELTER', label: 'Utility support' },
  { id: 'shelter-relocation', category: 'SHELTER', label: 'Emergency relocation' },
  // Clothing
  { id: 'clothing-everyday', category: 'CLOTHING', label: 'Everyday clothing' },
  { id: 'clothing-school', category: 'CLOTHING', label: 'School uniforms' },
  { id: 'clothing-seasonal', category: 'CLOTHING', label: 'Winter / summer clothing' },
  { id: 'clothing-footwear', category: 'CLOTHING', label: 'Footwear' },
  { id: 'clothing-hygiene-kits', category: 'CLOTHING', label: 'Hygiene kits' },
  // Counseling
  { id: 'counsel-individual', category: 'COUNSELING', label: 'Individual counseling' },
  { id: 'counsel-family', category: 'COUNSELING', label: 'Family therapy' },
  { id: 'counsel-trauma', category: 'COUNSELING', label: 'Trauma support' },
  { id: 'counsel-guidance', category: 'COUNSELING', label: 'Career / educational guidance' },
  { id: 'counsel-support-group', category: 'COUNSELING', label: 'Support group sessions' },
  // Other
  { id: 'other-legal-aid', category: 'OTHER', label: 'Legal aid' },
  { id: 'other-transport', category: 'OTHER', label: 'Transportation support' },
  { id: 'other-job-placement', category: 'OTHER', label: 'Job placement' },
  { id: 'other-childcare', category: 'OTHER', label: 'Childcare' },
  { id: 'other-misc', category: 'OTHER', label: 'Miscellaneous items as needed' },
]

const SERVICE_CATEGORY_LABELS: Record<ServiceCategoryId, string> = {
  FOOD: 'Food Assistance',
  EDUCATION: 'Educational Support',
  MEDICAL: 'Medical Help',
  SHELTER: 'Shelter',
  CLOTHING: 'Clothing',
  COUNSELING: 'Counseling',
  OTHER: 'Other',
}

const SERVICE_CATEGORY_COLORS: Record<ServiceCategoryId, { bg: string; border: string; text: string }> = {
  FOOD: { bg: '#fef3c7', border: '#fbbf24', text: '#92400e' },
  EDUCATION: { bg: '#dbeafe', border: '#60a5fa', text: '#1e3a8a' },
  MEDICAL: { bg: '#fecdd3', border: '#fb7185', text: '#881337' },
  SHELTER: { bg: '#d1fae5', border: '#34d399', text: '#065f46' },
  CLOTHING: { bg: '#e9d5ff', border: '#a78bfa', text: '#5b21b6' },
  COUNSELING: { bg: '#fed7aa', border: '#fb923c', text: '#7c2d12' },
  OTHER: { bg: '#e5e7eb', border: '#9ca3af', text: '#374151' },
}

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

  // Service package state
  const [selectedItems, setSelectedItems] = useState<Record<string, boolean>>({})
  const [itemResource, setItemResource] = useState<Record<string, string>>({})
  const [packageFollowUpAt, setPackageFollowUpAt] = useState<string>('')
  const [packageNotes, setPackageNotes] = useState<string>('')
  const [packageStatus, setPackageStatus] = useState<PackageStatus>('DRAFT')
  const [packageMessage, setPackageMessage] = useState<string | null>(null)

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

  const selectedServiceItems = useMemo(
    () => SERVICE_ITEMS.filter((item) => selectedItems[item.id]),
    [selectedItems]
  )

  const groupedServiceItems = useMemo(() => {
    const groups: Record<ServiceCategoryId, ServiceItemConfig[]> = {
      FOOD: [],
      EDUCATION: [],
      MEDICAL: [],
      SHELTER: [],
      CLOTHING: [],
      COUNSELING: [],
      OTHER: [],
    }
    SERVICE_ITEMS.forEach((item) => {
      groups[item.category].push(item)
    })
    return groups
  }, [])

  const handleToggleItem = (id: string) => {
    setSelectedItems((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const handleSaveDraft = () => {
    setPackageStatus('DRAFT')
    setPackageMessage('Service package saved as draft (not sent to user).')
  }

  const handleSendToUser = () => {
    setPackageStatus('PENDING_APPROVAL')
    setPackageMessage('Service package sent to public user. Status: Pending approval.')
  }

  const handleCancelPackage = () => {
    setSelectedItems({})
    setItemResource({})
    setPackageFollowUpAt('')
    setPackageNotes('')
    setPackageStatus('DRAFT')
    setPackageMessage(null)
  }

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

  const { variant: statusVariant, label: statusLabel } = getStatusVariantAndLabel(
    request.status,
    isOverdue
  )

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

          {/* Service Package Builder */}
          <Card className="sw-card border-0">
            <Card.Header className="bg-white border-0 pt-4 pb-3 d-flex justify-content-between align-items-center">
              <div>
                <h5 className="mb-0 fw-700">Service Package</h5>
                <small className="text-muted">
                  Select services, attach resources, and set a single follow-up schedule for this
                  package.
                </small>
              </div>
              <Badge
                bg={
                  packageStatus === 'DRAFT'
                    ? 'secondary'
                    : packageStatus === 'PENDING_APPROVAL'
                      ? 'warning'
                      : packageStatus === 'IN_PROGRESS'
                        ? 'primary'
                        : 'success'
                }
              >
                {packageStatus === 'DRAFT' && 'Draft'}
                {packageStatus === 'PENDING_APPROVAL' && 'Pending approval'}
                {packageStatus === 'IN_PROGRESS' && 'In progress'}
                {packageStatus === 'COMPLETED' && 'Completed'}
              </Badge>
            </Card.Header>
            <Card.Body>
              <Row className="g-4">
                {/* Left column: Categories and tickable items */}
                <Col xs={12} md={6}>
                  {(
                    Object.keys(SERVICE_CATEGORY_LABELS) as ServiceCategoryId[]
                  ).map((categoryId) => {
                    const items = groupedServiceItems[categoryId]
                    const colors = SERVICE_CATEGORY_COLORS[categoryId]
                    return (
                      <Card
                        key={categoryId}
                        className="mb-3"
                        style={{
                          backgroundColor: colors.bg,
                          borderColor: colors.border,
                          borderWidth: '2px',
                        }}
                      >
                        <Card.Body className="p-3">
                          <div className="d-flex justify-content-between align-items-center mb-2">
                            <h6 className="mb-0 fw-600" style={{ color: colors.text }}>
                              {SERVICE_CATEGORY_LABELS[categoryId]}
                            </h6>
                          </div>
                          <div className="d-flex flex-column gap-1 small">
                            {items.map((item) => (
                              <label
                                key={item.id}
                                className="d-flex align-items-center gap-2 cursor-pointer"
                              >
                                <input
                                  type="checkbox"
                                  className="form-check-input"
                                  checked={!!selectedItems[item.id]}
                                  onChange={() => handleToggleItem(item.id)}
                                />
                                <span>{item.label}</span>
                              </label>
                            ))}
                          </div>
                        </Card.Body>
                      </Card>
                    )
                  })}
                </Col>

                {/* Right column: Resources & package-level schedule */}
                <Col xs={12} md={6}>
                  <div className="mb-3">
                    <h6 className="fw-600 mb-2">Resources & package schedule</h6>
                    <small className="text-muted d-block mb-2">
                      Attach hospitals, NGOs, shelters or other resources to each selected service
                      and choose one follow-up date &amp; time and overall notes for this package.
                    </small>
                    <div className="mb-3">
                      <div className="mb-1 small text-muted">Package follow-up date &amp; time</div>
                      <Form.Control
                        type="datetime-local"
                        size="sm"
                        value={packageFollowUpAt}
                        onChange={(e) => setPackageFollowUpAt(e.target.value)}
                      />
                    </div>
                    <div className="mb-3">
                      <div className="mb-1 small text-muted">Package notes</div>
                      <Form.Control
                        as="textarea"
                        rows={2}
                        size="sm"
                        placeholder="Overall notes or special instructions for this package"
                        value={packageNotes}
                        onChange={(e) => setPackageNotes(e.target.value)}
                      />
                    </div>
                  </div>
                  {selectedServiceItems.length === 0 ? (
                    <div className="small text-muted">
                      Select one or more service items on the left to configure resources and
                      follow-ups.
                    </div>
                  ) : (
                    <div className="d-flex flex-column gap-3">
                      {selectedServiceItems.map((item) => (
                        <Card key={item.id} className="border-0 bg-light bg-opacity-50">
                          <Card.Body className="p-3">
                            <div className="fw-600 small mb-1">{item.label}</div>
                            <div className="mb-2 small text-muted">
                              Resource / provider (hospital, NGO, shelter, etc.)
                            </div>
                            <Form.Select
                              size="sm"
                              className="mb-2"
                              value={itemResource[item.id] ?? ''}
                              onChange={(e) =>
                                setItemResource((prev) => ({
                                  ...prev,
                                  [item.id]: e.target.value,
                                }))
                              }
                            >
                              <option value="">Select a resource</option>
                              {RESOURCE_OPTIONS.map((option) => (
                                <option key={option} value={option}>
                                  {option}
                                </option>
                              ))}
                            </Form.Select>
                          </Card.Body>
                        </Card>
                      ))}
                    </div>
                  )}

                  {/* Simple review preview */}
                  {selectedServiceItems.length > 0 && (
                    <div className="mt-4 small">
                      <h6 className="fw-600 mb-2">Review package</h6>
                      {packageFollowUpAt && (
                        <div className="mb-1">
                          <span className="text-muted">Follow-up:</span>{' '}
                          <span className="fw-500">{packageFollowUpAt}</span>
                        </div>
                      )}
                      {packageNotes && (
                        <div className="mb-2">
                          <span className="text-muted">Notes:</span>{' '}
                          <span className="fw-500">{packageNotes}</span>
                        </div>
                      )}
                      <ul className="mb-0 ps-3">
                        {selectedServiceItems.map((item) => (
                          <li key={item.id} className="mb-1">
                            <span className="fw-500">{item.label}</span>
                            {itemResource[item.id] && (
                              <span className="text-muted">
                                {' '}
                                • {itemResource[item.id]}
                              </span>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </Col>
              </Row>
              {packageMessage && (
                <div className="alert alert-info small mt-3 mb-2">
                  {packageMessage}
                </div>
              )}
              <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mt-4">
                <div className="small text-muted">
                  After the package is accepted by the public user, items will move into execution
                  and tracking.
                </div>
                <div className="d-flex flex-wrap gap-2">
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    onClick={handleCancelPackage}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={handleSaveDraft}
                  >
                    Save draft
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleSendToUser}
                  >
                    Send to user
                  </Button>
                </div>
              </div>
            </Card.Body>
          </Card>
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
    </Container>
  )
}
