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
        <Col xs={12} className="d-flex flex-wrap justify-content-between align-items-center gap-2">
          <div>
            <h1 className="h3 fw-700 mb-1">Resource Management</h1>
            <p className="text-muted mb-0">
              Manage hospitals, shelters, NGOs, and other resources available for referrals.
            </p>
          </div>
          <div>
            <Button variant="primary" onClick={handleOpenNew}>
              + Add New Resource
            </Button>
          </div>
        </Col>
      </Row>

      {/* Filters & search */}
      <Row className="mb-4">
        <Col xs={12}>
          <Card className="sw-card border-0">
            <Card.Body>
              <Row className="g-3 align-items-end">
                <Col xs={12} md={4}>
                  <Form.Label className="small fw-600 text-muted">Search</Form.Label>
                  <Form.Control
                    type="search"
                    placeholder="Search by name, type, or location…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </Col>
                <Col xs={6} md={2}>
                  <Form.Label className="small fw-600 text-muted">Type</Form.Label>
                  <Form.Select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value as 'ALL' | ResourceTypeId)}
                  >
                    <option value="ALL">All</option>
                    <option value="HOSPITAL">Hospital</option>
                    <option value="SHELTER">Shelter</option>
                    <option value="NGO">NGO</option>
                    <option value="LEGAL">Legal</option>
                    <option value="OTHER">Other</option>
                  </Form.Select>
                </Col>
                <Col xs={6} md={2}>
                  <Form.Label className="small fw-600 text-muted">Availability</Form.Label>
                  <Form.Select
                    value={availabilityFilter}
                    onChange={(e) =>
                      setAvailabilityFilter(e.target.value as 'ALL' | AvailabilityStatus)
                    }
                  >
                    <option value="ALL">All</option>
                    <option value="AVAILABLE">Available</option>
                    <option value="BUSY">Busy</option>
                    <option value="FULL">Full</option>
                  </Form.Select>
                </Col>
                <Col xs={6} md={2}>
                  <Form.Label className="small fw-600 text-muted">Status</Form.Label>
                  <Form.Select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as 'ALL' | ResourceStatus)}
                  >
                    <option value="ALL">All</option>
                    <option value="PENDING">Pending</option>
                    <option value="ACTIVE">Active</option>
                    <option value="ARCHIVED">Archived</option>
                  </Form.Select>
                </Col>
                <Col xs={6} md={2}>
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    className="mt-4 mt-md-0"
                    onClick={resetFilters}
                  >
                    Reset filters
                  </Button>
                </Col>
              </Row>
              <div className="small text-muted mt-3">
                {filteredResources.length} resource
                {filteredResources.length !== 1 ? 's' : ''} matching filters
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Resource list */}
      <Row className="g-3">
        {filteredResources.map((res) => (
          <Col xs={12} md={6} xl={4} key={res.id}>
            <Card
              className="sw-card h-100 hover-lift"
              style={res.status === 'ARCHIVED' ? { opacity: 0.7 } : undefined}
            >
              {res.image && (
                <Card.Img
                  variant="top"
                  src={res.image}
                  style={{ height: '200px', objectFit: 'cover' }}
                />
              )}
              <Card.Body className="d-flex flex-column justify-content-between">
                <div className="mb-3">
                  <div className="d-flex justify-content-between align-items-start mb-1">
                    <div>
                      <h6 className="fw-700 mb-1">{res.name}</h6>
                      <div className="small text-muted">
                        {RESOURCE_TYPE_LABELS[res.type]}
                        {res.location ? ` • ${res.location}` : ''}
                      </div>
                    </div>
                    <Badge bg={STATUS_VARIANTS[res.status]} className="ms-2">
                      {res.status.charAt(0) + res.status.slice(1).toLowerCase()}
                    </Badge>
                  </div>
                  <div className="small text-muted mt-2">
                    <div>
                      <strong>Capacity:</strong> {res.capacity || 'Not specified'}
                    </div>
                    <div>
                      <strong>Availability:</strong> {AVAILABILITY_LABELS[res.availability]}
                    </div>
                    <div>
                      <strong>Emergency support:</strong>{' '}
                      {res.emergencySupport ? 'Yes' : 'No'}
                    </div>
                  </div>
                  {res.notes && (
                    <div className="small text-muted mt-2">
                      <strong>Notes:</strong> {res.notes}
                    </div>
                  )}
                  <div className="small text-muted mt-2">
                    {res.contactPhone && (
                      <div>
                        <strong>Phone:</strong> {res.contactPhone}
                      </div>
                    )}
                    {res.contactEmail && (
                      <div>
                        <strong>Email:</strong> {res.contactEmail}
                      </div>
                    )}
                  </div>
                </div>
                <div className="d-flex flex-wrap gap-2 mt-2">
                  <Button
                    variant="outline-primary"
                    size="sm"
                    disabled={res.status !== 'ACTIVE'}
                    onClick={() => openAssignFlow(res)}
                  >
                    Assign to request
                  </Button>
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    onClick={() => handleEdit(res)}
                  >
                    Edit
                  </Button>
                  {res.status === 'ARCHIVED' ? (
                    <Button
                      variant="outline-success"
                      size="sm"
                      onClick={() => handleUnarchive(res)}
                    >
                      Unarchive
                    </Button>
                  ) : (
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => handleArchive(res)}
                    >
                      Archive
                    </Button>
                  )}
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
        {filteredResources.length === 0 && (
          <Col xs={12}>
            <Card className="sw-card border-0">
              <Card.Body className="p-5 text-center text-muted small">
                No resources match your filters. Try adjusting your search or add a new resource.
              </Card.Body>
            </Card>
          </Col>
        )}
      </Row>

      <Modal show={showAssignModal} onHide={() => setShowAssignModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title className="h6 fw-700">
            Assign Resource To Request
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedResourceForAssign && (
            <div className="small mb-3">
              <div className="text-muted">Selected resource</div>
              <div className="fw-600">
                {selectedResourceForAssign.name}
                {selectedResourceForAssign.location
                  ? ` (${selectedResourceForAssign.location})`
                  : ''}
              </div>
            </div>
          )}

          <Form.Group className="mb-3">
            <Form.Label className="small fw-600 text-muted">Search request</Form.Label>
            <Form.Control
              type="search"
              placeholder="Search by request ID, user, type..."
              value={requestSearch}
              onChange={(e) => setRequestSearch(e.target.value)}
              disabled={assignedRequestsLoading}
            />
          </Form.Group>

          <Form.Group>
            <Form.Label className="small fw-600 text-muted">Choose request</Form.Label>
            <Form.Select
              value={selectedRequestId}
              onChange={(e) => setSelectedRequestId(e.target.value)}
              disabled={assignedRequestsLoading || filteredAssignedRequests.length === 0}
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
            <div className="alert alert-danger py-2 small mt-3 mb-0">{assignedRequestsError}</div>
          )}

          {!assignedRequestsLoading && !assignedRequestsError && filteredAssignedRequests.length === 0 && (
            <div className="alert alert-info py-2 small mt-3 mb-0">
              <strong>No eligible requests:</strong> Only accepted requests without a proposed package are shown here. 
              Requests with status "Package Proposed" or later stages are excluded.
            </div>
          )}

          <div className="small text-muted mt-3 mb-0">
            Next step: in request details, choose a service item and click Assign Resource. This
            resource will be pre-selected.
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" size="sm" onClick={() => setShowAssignModal(false)}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            disabled={!selectedResourceForAssign || !selectedRequestId}
            onClick={() => {
              if (!selectedResourceForAssign || !selectedRequestId) return
              const rid = encodeURIComponent(selectedResourceForAssign.id)
              navigate(`/social-worker/requests/${selectedRequestId}?selectedResourceId=${rid}`)
              setShowAssignModal(false)
            }}
          >
            Open request
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Add / Edit Resource modal */}
      <Modal show={showForm} onHide={() => setShowForm(false)} size="lg" centered>
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
                Documents (certificate, approval, license)
              </Form.Label>
              <Form.Control type="file" multiple />
              <div className="small text-muted mt-1">
                File upload is for future backend integration; currently not stored.
              </div>
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" size="sm" onClick={() => setShowForm(false)}>
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
