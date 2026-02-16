import { useEffect, useMemo, useState } from 'react'
import { Card, Container, Row, Col, Button, Form, Badge, Modal } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { getAssignedRequests } from '../../services/socialWorkerApi'
import type { HelpRequestDTO } from '../../types/dashboard'
import './SocialWorkerDashboard.css'

type ResourceTypeId = 'HOSPITAL' | 'SHELTER' | 'NGO' | 'LEGAL' | 'OTHER'
type AvailabilityStatus = 'AVAILABLE' | 'BUSY' | 'FULL'
type ResourceStatus = 'PENDING' | 'ACTIVE' | 'ARCHIVED'

interface Resource {
  id: string
  name: string
  type: ResourceTypeId
  contactPhone?: string
  contactEmail?: string
  location?: string
  capacity?: string
  availability: AvailabilityStatus
  emergencySupport: boolean
  status: ResourceStatus
  notes?: string
  image?: string // Base64 string for the image
}

const RESOURCE_TYPE_LABELS: Record<ResourceTypeId, string> = {
  HOSPITAL: 'Hospital',
  SHELTER: 'Shelter',
  NGO: 'NGO',
  LEGAL: 'Legal',
  OTHER: 'Other',
}

const AVAILABILITY_LABELS: Record<AvailabilityStatus, string> = {
  AVAILABLE: 'Available',
  BUSY: 'Busy',
  FULL: 'Full',
}

const STATUS_VARIANTS: Record<ResourceStatus, string> = {
  PENDING: 'warning',
  ACTIVE: 'success',
  ARCHIVED: 'secondary',
}

const RESOURCE_STORAGE_KEY = 'sw_resources'

const CERTIFICATES_MAX_FILES = 5
const CERTIFICATES_MAX_SIZE_MB = 5

const loadResourcesFromStorage = (): Resource[] => {
  try {
    const raw = localStorage.getItem(RESOURCE_STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed as Resource[]
  } catch {
    return []
  }
}

const saveResourcesToStorage = (resources: Resource[]) => {
  try {
    localStorage.setItem(RESOURCE_STORAGE_KEY, JSON.stringify(resources))
  } catch {
  }
}

export function SocialWorkerLibraryPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [resources, setResources] = useState<Resource[]>([])

  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<'ALL' | ResourceTypeId>('ALL')
  const [availabilityFilter, setAvailabilityFilter] = useState<'ALL' | AvailabilityStatus>('ALL')
  const [statusFilter, setStatusFilter] = useState<'ALL' | ResourceStatus>('ALL')

  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [selectedResourceForAssign, setSelectedResourceForAssign] = useState<Resource | null>(null)
  const [assignedRequests, setAssignedRequests] = useState<HelpRequestDTO[]>([])
  const [assignedRequestsLoading, setAssignedRequestsLoading] = useState(false)
  const [assignedRequestsError, setAssignedRequestsError] = useState<string | null>(null)
  const [requestSearch, setRequestSearch] = useState('')
  const [selectedRequestId, setSelectedRequestId] = useState<string>('')

  const [formData, setFormData] = useState<Partial<Resource>>({
    type: 'HOSPITAL',
    availability: 'AVAILABLE',
    emergencySupport: false,
    image: '',
  })
  const [certificatesError, setCertificatesError] = useState<string | null>(null)

  useEffect(() => {
    const initial = loadResourcesFromStorage()
    setResources(initial)
  }, [])

  useEffect(() => {
    if (!showAssignModal || !user?.userId) return
    let active = true
    setAssignedRequestsLoading(true)
    setAssignedRequestsError(null)
    getAssignedRequests(user.userId)
      .then((list) => {
        if (!active) return
        const normalized = Array.isArray(list) ? list : []
        setAssignedRequests(normalized)
        if (normalized.length > 0) {
          setSelectedRequestId(normalized[0].id)
        } else {
          setSelectedRequestId('')
        }
      })
      .catch((err) => {
        if (!active) return
        setAssignedRequests([])
        setSelectedRequestId('')
        setAssignedRequestsError(
          err instanceof Error ? err.message : 'Failed to load assigned requests.'
        )
      })
      .finally(() => {
        if (!active) return
        setAssignedRequestsLoading(false)
      })
    return () => {
      active = false
    }
  }, [showAssignModal, user?.userId])

  const updateResources = (updater: (prev: Resource[]) => Resource[]) => {
    setResources((prev) => {
      const next = updater(prev)
      saveResourcesToStorage(next)
      return next
    })
  }

  const filteredResources = useMemo(() => {
    const q = search.trim().toLowerCase()
    return resources.filter((r) => {
      if (q) {
        const label =
          `${r.name} ${RESOURCE_TYPE_LABELS[r.type]} ${r.location ?? ''}`.toLowerCase()
        if (!label.includes(q)) return false
      }
      if (typeFilter !== 'ALL' && r.type !== typeFilter) return false
      if (availabilityFilter !== 'ALL' && r.availability !== availabilityFilter) return false
      if (statusFilter !== 'ALL' && r.status !== statusFilter) return false
      return true
    })
  }, [resources, search, typeFilter, availabilityFilter, statusFilter])

  const handleOpenNew = () => {
    setEditingId(null)
    setFormData({
      type: 'HOSPITAL',
      availability: 'AVAILABLE',
      emergencySupport: false,
      image: '',
    })
    setShowForm(true)
  }

  const handleEdit = (res: Resource) => {
    setEditingId(res.id)
    setFormData(res)
    setShowForm(true)
  }

  const handleArchive = (res: Resource) => {
    updateResources((prev) =>
      prev.map((r) => (r.id === res.id ? { ...r, status: 'ARCHIVED', availability: 'FULL' } : r))
    )
  }

  const handleUnarchive = (res: Resource) => {
    updateResources((prev) =>
      prev.map((r) =>
        r.id === res.id
          ? {
            ...r,
            status: 'ACTIVE',
            // Default to available when bringing back; user can edit to adjust.
            availability: r.availability === 'FULL' ? 'AVAILABLE' : r.availability,
          }
          : r
      )
    )
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, image: reader.result as string }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = () => {
    if (!formData.name || !formData.type || !formData.availability) {
      return
    }

    if (editingId) {
      updateResources((prev) =>
        prev.map((r) =>
          r.id === editingId
            ? { ...(r as Resource), ...(formData as Resource), status: r.status }
            : r
        )
      )
    } else {
      const newResource: Resource = {
        id: `res-${Date.now()}`,
        name: formData.name,
        type: formData.type,
        contactPhone: formData.contactPhone,
        contactEmail: formData.contactEmail,
        location: formData.location,
        capacity: formData.capacity,
        availability: formData.availability,
        emergencySupport: !!formData.emergencySupport,
        status: 'ACTIVE',
        notes: formData.notes,
        image: formData.image,
      }
      updateResources((prev) => [newResource, ...prev])
    }

    setShowForm(false)
  }

  const resetFilters = () => {
    setSearch('')
    setTypeFilter('ALL')
    setAvailabilityFilter('ALL')
    setStatusFilter('ALL')
  }

  const openAssignFlow = (resource: Resource) => {
    setSelectedResourceForAssign(resource)
    setRequestSearch('')
    setShowAssignModal(true)
  }

  const filteredAssignedRequests = useMemo(() => {
    // Filter to only show accepted requests that don't have a package proposed yet
    const eligibleStatuses = ['ASSIGNED', 'IN_PROGRESS']
    const excludedStatuses = ['PACKAGE_PROPOSED', 'PACKAGE_ACCEPTED', 'PACKAGE_REJECTED', 'COMPLETED', 'REJECTED', 'CANCELLED']

    const eligibleRequests = assignedRequests.filter((req) => {
      const status = req.status?.toUpperCase() ?? ''
      // Include if status is in eligible list OR not in excluded list (to catch edge cases)
      return eligibleStatuses.includes(status) && !excludedStatuses.includes(status)
    })

    const q = requestSearch.trim().toLowerCase()
    if (!q) return eligibleRequests
    return eligibleRequests.filter((req) => {
      const searchable = [
        req.id ?? '',
        req.trackingId ?? '',
        req.requesterName ?? '',
        req.helpType ?? '',
        req.status ?? '',
      ]
      return searchable.join(' ').toLowerCase().includes(q)
    })
  }, [assignedRequests, requestSearch])

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
                top: -30,
                right: -30,
                width: '150px',
                height: '150px',
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
                  <span style={{ fontSize: '2rem' }}>🏥</span>
                </div>
                <div>
                  <h1 className="h2 fw-bold mb-1">Resource Management</h1>
                  <p className="mb-0" style={{ opacity: 0.95, fontSize: '0.95rem' }}>
                    Manage hospitals, shelters, NGOs, and other resources for referrals
                  </p>
                </div>
              </div>
              <Button
                onClick={handleOpenNew}
                className="btn-light d-flex align-items-center gap-2"
                style={{
                  fontWeight: '600',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                }}
              >
                <span style={{ fontSize: '1.2rem' }}>➕</span> Add New Resource
              </Button>
            </div>
          </div>
        </Col>
      </Row>

      {/* Filters & search */}
      <Row className="mb-4">
        <Col xs={12}>
          <Card
            className="border-0 shadow-sm"
            style={{ background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)' }}
          >
            <Card.Body className="p-4">
              <div className="d-flex align-items-center gap-2 mb-3">
                <span style={{ fontSize: '1.5rem' }}>🔍</span>
                <h6 className="mb-0 fw-bold" style={{ color: '#1e40af' }}>Search & Filter Resources</h6>
              </div>
              <Row className="g-3 align-items-end">
                <Col xs={12} md={4}>
                  <Form.Label className="small fw-600" style={{ color: '#1e40af' }}>
                    🔎 Search
                  </Form.Label>
                  <Form.Control
                    type="search"
                    placeholder="Search by name, type, or location…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={{
                      border: '2px solid rgba(59, 130, 246, 0.2)',
                      borderRadius: '8px'
                    }}
                  />
                </Col>
                <Col xs={6} md={2}>
                  <Form.Label className="small fw-600" style={{ color: '#1e40af' }}>
                    🏷️ Type
                  </Form.Label>
                  <Form.Select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value as 'ALL' | ResourceTypeId)}
                    style={{
                      border: '2px solid rgba(59, 130, 246, 0.2)',
                      borderRadius: '8px'
                    }}
                  >
                    <option value="ALL">All Types</option>
                    <option value="HOSPITAL">🏥 Hospital</option>
                    <option value="SHELTER">🏠 Shelter</option>
                    <option value="NGO">🤝 NGO</option>
                    <option value="LEGAL">⚖️ Legal</option>
                    <option value="OTHER">📁 Other</option>
                  </Form.Select>
                </Col>
                <Col xs={6} md={2}>
                  <Form.Label className="small fw-600" style={{ color: '#1e40af' }}>
                    📊 Availability
                  </Form.Label>
                  <Form.Select
                    value={availabilityFilter}
                    onChange={(e) =>
                      setAvailabilityFilter(e.target.value as 'ALL' | AvailabilityStatus)
                    }
                    style={{
                      border: '2px solid rgba(59, 130, 246, 0.2)',
                      borderRadius: '8px'
                    }}
                  >
                    <option value="ALL">All</option>
                    <option value="AVAILABLE">✅ Available</option>
                    <option value="BUSY">⏳ Busy</option>
                    <option value="FULL">🔴 Full</option>
                  </Form.Select>
                </Col>
                <Col xs={6} md={2}>
                  <Form.Label className="small fw-600" style={{ color: '#1e40af' }}>
                    🎯 Status
                  </Form.Label>
                  <Form.Select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as 'ALL' | ResourceStatus)}
                    style={{
                      border: '2px solid rgba(59, 130, 246, 0.2)',
                      borderRadius: '8px'
                    }}
                  >
                    <option value="ALL">All Status</option>
                    <option value="PENDING">⏳ Pending</option>
                    <option value="ACTIVE">✅ Active</option>
                    <option value="ARCHIVED">📦 Archived</option>
                  </Form.Select>
                </Col>
                <Col xs={6} md={2}>
                  <Button
                    size="sm"
                    className="w-100"
                    onClick={resetFilters}
                    style={{
                      backgroundColor: 'rgba(59, 130, 246, 0.1)',
                      color: '#1e40af',
                      border: '1px solid rgba(59, 130, 246, 0.3)',
                      borderRadius: '8px',
                      fontWeight: '600'
                    }}
                  >
                    🔄 Reset
                  </Button>
                </Col>
              </Row>
              <div
                className="mt-3 p-2 rounded"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.6)',
                  border: '1px solid rgba(59, 130, 246, 0.2)'
                }}
              >
                <span className="small fw-semibold" style={{ color: '#1e40af' }}>
                  📊 {filteredResources.length} resource{filteredResources.length !== 1 ? 's' : ''} matching filters
                </span>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Resource list */}
      <Row className="g-4">
        {filteredResources.map((res) => {
          const getTypeColor = (type: ResourceTypeId) => {
            const colors: Record<ResourceTypeId, string> = {
              HOSPITAL: 'linear-gradient(135deg, #ef4444 0%, #f87171 100%)',
              SHELTER: 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)',
              NGO: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
              LEGAL: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
              OTHER: 'linear-gradient(135deg, #6b7280 0%, #9ca3af 100%)'
            }
            return colors[type] || colors.OTHER
          }

          const getTypeIcon = (type: ResourceTypeId) => {
            const icons: Record<ResourceTypeId, string> = {
              HOSPITAL: '🏥',
              SHELTER: '🏠',
              NGO: '🤝',
              LEGAL: '⚖️',
              OTHER: '📁'
            }
            return icons[type] || '📁'
          }

          const getAvailabilityColor = (availability: AvailabilityStatus) => {
            const colors: Record<AvailabilityStatus, string> = {
              AVAILABLE: '#10b981',
              BUSY: '#f59e0b',
              FULL: '#ef4444'
            }
            return colors[availability]
          }

          return (
            <Col xs={12} md={6} xl={4} key={res.id}>
              <Card
                className="border-0 shadow-sm h-100"
                style={{
                  opacity: res.status === 'ARCHIVED' ? 0.7 : 1,
                  transition: 'all 0.3s ease',
                  background: 'linear-gradient(135deg, #ffffff 0%, #f9fafb 100%)'
                }}
                onMouseEnter={(e) => {
                  if (res.status !== 'ARCHIVED') {
                    e.currentTarget.style.transform = 'translateY(-8px)';
                    e.currentTarget.style.boxShadow = '0 12px 24px rgba(0, 0, 0, 0.15)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '';
                }}
              >
                {res.image ? (
                  <div style={{ position: 'relative' }}>
                    <Card.Img
                      variant="top"
                      src={res.image}
                      style={{ height: '200px', objectFit: 'cover' }}
                    />
                    <div
                      style={{
                        position: 'absolute',
                        top: '10px',
                        right: '10px',
                        padding: '0.5rem',
                        borderRadius: '8px',
                        background: getTypeColor(res.type),
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.2)'
                      }}
                    >
                      <span style={{ fontSize: '1.5rem' }}>{getTypeIcon(res.type)}</span>
                    </div>
                  </div>
                ) : (
                  <div
                    style={{
                      height: '200px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: getTypeColor(res.type),
                      position: 'relative'
                    }}
                  >
                    <span style={{ fontSize: '4rem' }}>{getTypeIcon(res.type)}</span>
                  </div>
                )}
                <Card.Body className="d-flex flex-column justify-content-between">
                  <div className="mb-3">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <div className="flex-grow-1">
                        <h6 className="fw-bold mb-1" style={{ color: '#1e293b' }}>
                          {res.name}
                        </h6>
                        <div className="small d-flex align-items-center gap-2 flex-wrap">
                          <Badge
                            className="rounded-pill"
                            style={{
                              background: getTypeColor(res.type),
                              fontSize: '0.7rem',
                              padding: '0.3rem 0.6rem'
                            }}
                          >
                            {getTypeIcon(res.type)} {RESOURCE_TYPE_LABELS[res.type]}
                          </Badge>
                          {res.location && (
                            <span className="text-muted small">📍 {res.location}</span>
                          )}
                        </div>
                      </div>
                      <Badge
                        className="ms-2 rounded-pill"
                        style={{
                          backgroundColor: res.status === 'ACTIVE' ? '#10b981' : res.status === 'PENDING' ? '#f59e0b' : '#6b7280',
                          fontSize: '0.7rem',
                          padding: '0.3rem 0.6rem'
                        }}
                      >
                        {res.status === 'ACTIVE' && '✅'}
                        {res.status === 'PENDING' && '⏳'}
                        {res.status === 'ARCHIVED' && '📦'}
                        {' '}{res.status.charAt(0) + res.status.slice(1).toLowerCase()}
                      </Badge>
                    </div>

                    <div
                      className="p-2 rounded-3 mb-2"
                      style={{
                        backgroundColor: 'rgba(59, 130, 246, 0.05)',
                        border: '1px solid rgba(59, 130, 246, 0.1)'
                      }}
                    >
                      <div className="small mb-1">
                        <span className="fw-semibold" style={{ color: '#1e40af' }}>📊 Capacity:</span>{' '}
                        <span style={{ color: '#64748b' }}>{res.capacity || 'Not specified'}</span>
                      </div>
                      <div className="small mb-1">
                        <span className="fw-semibold" style={{ color: '#1e40af' }}>📈 Availability:</span>{' '}
                        <Badge
                          className="rounded-pill ms-1"
                          style={{
                            backgroundColor: getAvailabilityColor(res.availability),
                            fontSize: '0.7rem',
                            padding: '0.25rem 0.5rem'
                          }}
                        >
                          {AVAILABILITY_LABELS[res.availability]}
                        </Badge>
                      </div>
                      <div className="small">
                        <span className="fw-semibold" style={{ color: '#1e40af' }}>🚨 Emergency:</span>{' '}
                        <Badge
                          className="rounded-pill ms-1"
                          style={{
                            backgroundColor: res.emergencySupport ? '#10b981' : '#9ca3af',
                            fontSize: '0.7rem',
                            padding: '0.25rem 0.5rem'
                          }}
                        >
                          {res.emergencySupport ? '✅ Yes' : '❌ No'}
                        </Badge>
                      </div>
                    </div>

                    {res.notes && (
                      <div
                        className="small p-2 rounded-3 mb-2"
                        style={{
                          backgroundColor: 'rgba(251, 191, 36, 0.05)',
                          border: '1px solid rgba(251, 191, 36, 0.1)',
                          color: '#78350f'
                        }}
                      >
                        <span className="fw-semibold">💬 Notes:</span> {res.notes}
                      </div>
                    )}

                    {(res.contactPhone || res.contactEmail) && (
                      <div
                        className="small p-2 rounded-3"
                        style={{
                          backgroundColor: 'rgba(6, 182, 212, 0.05)',
                          border: '1px solid rgba(6, 182, 212, 0.1)'
                        }}
                      >
                        {res.contactPhone && (
                          <div style={{ color: '#0369a1' }}>
                            <span className="fw-semibold">📞 Phone:</span> {res.contactPhone}
                          </div>
                        )}
                        {res.contactEmail && (
                          <div style={{ color: '#0369a1' }}>
                            <span className="fw-semibold">📧 Email:</span> {res.contactEmail}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="d-flex flex-column gap-2 mt-2">
                    <Button
                      size="sm"
                      disabled={res.status !== 'ACTIVE'}
                      onClick={() => openAssignFlow(res)}
                      className="w-100"
                      style={{
                        background: res.status === 'ACTIVE' ? 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' : '#e2e8f0',
                        color: res.status === 'ACTIVE' ? 'white' : '#94a3b8',
                        border: 'none',
                        fontWeight: '600',
                        fontSize: '0.85rem'
                      }}
                    >
                      ➕ Assign to Request
                    </Button>
                    <div className="d-flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleEdit(res)}
                        className="flex-grow-1"
                        style={{
                          backgroundColor: 'rgba(107, 114, 128, 0.1)',
                          color: '#4b5563',
                          border: '1px solid rgba(107, 114, 128, 0.3)',
                          fontSize: '0.85rem'
                        }}
                      >
                        ✏️ Edit
                      </Button>
                      {res.status === 'ARCHIVED' ? (
                        <Button
                          size="sm"
                          onClick={() => handleUnarchive(res)}
                          className="flex-grow-1"
                          style={{
                            backgroundColor: '#10b981',
                            color: 'white',
                            border: 'none',
                            fontSize: '0.85rem'
                          }}
                        >
                          ♻️ Unarchive
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => handleArchive(res)}
                          className="flex-grow-1"
                          style={{
                            backgroundColor: 'rgba(239, 68, 68, 0.1)',
                            color: '#dc2626',
                            border: '1px solid rgba(239, 68, 68, 0.3)',
                            fontSize: '0.85rem'
                          }}
                        >
                          📦 Archive
                        </Button>
                      )}
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          )
        })}
        {filteredResources.length === 0 && (
          <Col xs={12}>
            <div
              className="p-5 text-center rounded-3"
              style={{
                background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
                border: '2px dashed rgba(59, 130, 246, 0.3)'
              }}
            >
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
              <p className="fw-semibold mb-2" style={{ color: '#1e40af' }}>No resources match your filters</p>
              <p className="mb-3 small" style={{ color: '#3b82f6' }}>
                Try adjusting your search or add a new resource.
              </p>
              <Button
                onClick={handleOpenNew}
                style={{
                  background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                  color: 'white',
                  border: 'none',
                  fontWeight: '600'
                }}
              >
                ➕ Add New Resource
              </Button>
            </div>
          </Col>
        )}
      </Row>

      <Modal show={showAssignModal} onHide={() => setShowAssignModal(false)} centered>
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
              <span style={{ fontSize: '1.5rem' }}>🔗</span>
              <span className="fw-bold h6 mb-0">Assign Resource To Request</span>
            </Modal.Title>
          </Modal.Header>
          <Modal.Body style={{ backgroundColor: '#eff6ff', padding: '2rem' }}>
            {selectedResourceForAssign && (
              <div
                className="p-3 rounded-3 mb-3"
                style={{
                  backgroundColor: 'white',
                  border: '2px solid rgba(59, 130, 246, 0.2)'
                }}
              >
                <div className="small fw-semibold mb-1" style={{ color: '#1e40af' }}>
                  🏥 Selected Resource
                </div>
                <div className="fw-bold" style={{ color: '#1e3a8a' }}>
                  {selectedResourceForAssign.name}
                  {selectedResourceForAssign.location && (
                    <span className="small text-muted ms-1">
                      📍 {selectedResourceForAssign.location}
                    </span>
                  )}
                </div>
              </div>
            )}

            <Form.Group className="mb-3">
              <Form.Label className="small fw-600" style={{ color: '#1e40af' }}>
                🔍 Search request
              </Form.Label>
              <Form.Control
                type="search"
                placeholder="Search by request ID, user, type..."
                value={requestSearch}
                onChange={(e) => setRequestSearch(e.target.value)}
                disabled={assignedRequestsLoading}
                style={{
                  border: '2px solid rgba(59, 130, 246, 0.2)',
                  borderRadius: '8px'
                }}
              />
            </Form.Group>

            <Form.Group>
              <Form.Label className="small fw-600" style={{ color: '#1e40af' }}>
                📋 Choose request
              </Form.Label>
              <Form.Select
                value={selectedRequestId}
                onChange={(e) => setSelectedRequestId(e.target.value)}
                disabled={assignedRequestsLoading || filteredAssignedRequests.length === 0}
                style={{
                  border: '2px solid rgba(59, 130, 246, 0.2)',
                  borderRadius: '8px'
                }}
              >
                {filteredAssignedRequests.length === 0 && (
                  <option value="">
                    {assignedRequestsLoading ? 'Loading requests...' : 'No eligible requests found'}
                  </option>
                )}
                {filteredAssignedRequests.map((req) => (
                  <option key={req.id} value={req.id}>
                    #{req.trackingId ?? req.id} - {req.requesterName ?? 'Anonymous'} ({req.status})
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            {assignedRequestsError && (
              <div
                className="py-2 px-3 rounded-3 small mt-3 mb-0"
                style={{
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  color: '#991b1b'
                }}
              >
                ⚠️ {assignedRequestsError}
              </div>
            )}

            {!assignedRequestsLoading && !assignedRequestsError && filteredAssignedRequests.length === 0 && (
              <div
                className="py-2 px-3 rounded-3 small mt-3 mb-0"
                style={{
                  backgroundColor: 'rgba(59, 130, 246, 0.1)',
                  border: '1px solid rgba(59, 130, 246, 0.3)',
                  color: '#1e40af'
                }}
              >
                <strong>ℹ️ No eligible requests:</strong> Only accepted requests without a proposed package are shown here.
                Requests with status "Package Proposed" or later stages are excluded.
              </div>
            )}

            <div
              className="p-2 rounded small mt-3 mb-0"
              style={{
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                color: '#1e40af'
              }}
            >
              💡 <strong>Next step:</strong> In request details, choose a service item and click Assign Resource. This
              resource will be pre-selected.
            </div>
          </Modal.Body>
          <Modal.Footer style={{ backgroundColor: '#eff6ff', border: 'none' }}>
            <Button
              size="sm"
              onClick={() => setShowAssignModal(false)}
              style={{
                backgroundColor: 'rgba(107, 114, 128, 0.1)',
                color: '#4b5563',
                border: '1px solid rgba(107, 114, 128, 0.3)'
              }}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              disabled={!selectedResourceForAssign || !selectedRequestId}
              onClick={() => {
                if (!selectedResourceForAssign || !selectedRequestId) return
                const rid = encodeURIComponent(selectedResourceForAssign.id)
                navigate(`/social-worker/requests/${selectedRequestId}?selectedResourceId=${rid}`)
                setShowAssignModal(false)
              }}
              style={{
                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                color: 'white',
                border: 'none',
                fontWeight: '600'
              }}
            >
              🚀 Open Request
            </Button>
          </Modal.Footer>
        </div>
      </Modal>

      {/* Add / Edit Resource modal */}
      <Modal show={showForm} onHide={() => { setShowForm(false); setCertificatesError(null) }} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title className="h6 fw-700">
            {editingId ? 'Edit Resource' : 'Add New Resource'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row className="g-3">
            <Col xs={12}>
              <Form.Label className="small fw-600 text-muted">Resource Image</Form.Label>
              <Form.Control type="file" accept="image/*" onChange={handleImageChange} />
              {formData.image && (
                <div className="mt-2">
                  <img
                    src={formData.image}
                    alt="Preview"
                    style={{ maxHeight: '200px', maxWidth: '100%', borderRadius: '4px' }}
                  />
                  <Button
                    variant="link"
                    size="sm"
                    className="text-danger p-0 ms-2"
                    onClick={() => setFormData((prev) => ({ ...prev, image: '' }))}
                  >
                    Remove
                  </Button>
                </div>
              )}
            </Col>

            <Col xs={12} md={6}>
              <Form.Label className="small fw-600 text-muted">Resource name</Form.Label>
              <Form.Control
                type="text"
                value={formData.name ?? ''}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              />
            </Col>
            <Col xs={12} md={6}>
              <Form.Label className="small fw-600 text-muted">Resource type</Form.Label>
              <Form.Select
                value={formData.type ?? 'HOSPITAL'}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, type: e.target.value as ResourceTypeId }))
                }
              >
                <option value="HOSPITAL">Hospital</option>
                <option value="SHELTER">Shelter</option>
                <option value="NGO">NGO</option>
                <option value="LEGAL">Legal</option>
                <option value="OTHER">Other</option>
              </Form.Select>
            </Col>
            <Col xs={12} md={6}>
              <Form.Label className="small fw-600 text-muted">Contact phone</Form.Label>
              <Form.Control
                type="text"
                value={formData.contactPhone ?? ''}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, contactPhone: e.target.value }))
                }
              />
            </Col>
            <Col xs={12} md={6}>
              <Form.Label className="small fw-600 text-muted">Contact email</Form.Label>
              <Form.Control
                type="email"
                value={formData.contactEmail ?? ''}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, contactEmail: e.target.value }))
                }
              />
            </Col>
            <Col xs={12}>
              <Form.Label className="small fw-600 text-muted">Location / address</Form.Label>
              <Form.Control
                type="text"
                value={formData.location ?? ''}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, location: e.target.value }))
                }
              />
            </Col>
            <Col xs={12} md={4}>
              <Form.Label className="small fw-600 text-muted">
                Capacity / availability (beds, slots…)
              </Form.Label>
              <Form.Control
                type="text"
                value={formData.capacity ?? ''}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, capacity: e.target.value }))
                }
              />
            </Col>
            <Col xs={12} md={6}>
              <Form.Label className="small fw-600 text-muted">Availability status</Form.Label>
              <Form.Select
                value={formData.availability ?? 'AVAILABLE'}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    availability: e.target.value as AvailabilityStatus,
                  }))
                }
              >
                <option value="AVAILABLE">Available</option>
                <option value="BUSY">Busy</option>
                <option value="FULL">Full</option>
              </Form.Select>
            </Col>
            <Col xs={12} md={6}>
              <Form.Check
                type="switch"
                id="emergencySupport"
                label="Emergency support available"
                checked={!!formData.emergencySupport}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    emergencySupport: e.target.checked,
                  }))
                }
              />
            </Col>
            <Col xs={12}>
              <Form.Label className="small fw-600 text-muted">Notes / comments</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={formData.notes ?? ''}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    notes: e.target.value,
                  }))
                }
              />
            </Col>
            <Col xs={12}>
              <Form.Label className="small fw-600 text-muted">
                Certificates (attach)
              </Form.Label>
              <Form.Control
                type="file"
                multiple
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => {
                  setCertificatesError(null)
                  const input = e.target as HTMLInputElement
                  const files = input.files
                  if (!files?.length) return
                  const maxBytes = CERTIFICATES_MAX_SIZE_MB * 1024 * 1024
                  if (files.length > CERTIFICATES_MAX_FILES) {
                    input.value = ''
                    setCertificatesError(`Maximum ${CERTIFICATES_MAX_FILES} files allowed.`)
                    return
                  }
                  for (let i = 0; i < files.length; i++) {
                    if (files[i].size > maxBytes) {
                      input.value = ''
                      setCertificatesError(`Each file must be under ${CERTIFICATES_MAX_SIZE_MB} MB.`)
                      return
                    }
                  }
                }}
              />
              <div className="small text-muted mt-1">
                Maximum capacity: <strong>{CERTIFICATES_MAX_FILES} files</strong>, <strong>{CERTIFICATES_MAX_SIZE_MB} MB</strong> per file. Accepted: PDF, JPG, PNG.
              </div>
              {certificatesError && (
                <div className="small text-danger mt-1">{certificatesError}</div>
              )}
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" size="sm" onClick={() => { setShowForm(false); setCertificatesError(null) }}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" onClick={handleSubmit}>
            {editingId ? 'Save changes' : 'Add resource'}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  )
}
