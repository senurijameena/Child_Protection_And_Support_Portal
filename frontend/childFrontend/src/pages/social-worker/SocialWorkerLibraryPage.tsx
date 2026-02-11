import { useMemo, useState } from 'react'
import { Card, Container, Row, Col, Button, Form, Badge, Modal } from 'react-bootstrap'
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

const initialResources: Resource[] = [
  {
    id: 'res-1',
    name: 'Colombo Children’s Hospital',
    type: 'HOSPITAL',
    contactPhone: '+94 11 234 5678',
    contactEmail: 'peds-referrals@cch.lk',
    location: 'Colombo 10',
    capacity: '10 pediatric beds',
    availability: 'AVAILABLE',
    emergencySupport: true,
    status: 'ACTIVE',
    notes: '24/7 emergency support, pediatric trauma team available.',
  },
  {
    id: 'res-2',
    name: 'Safe Haven Shelter',
    type: 'SHELTER',
    contactPhone: '+94 77 555 1122',
    contactEmail: 'intake@safehaven.lk',
    location: 'Gampaha District',
    capacity: '12 family units',
    availability: 'BUSY',
    emergencySupport: true,
    status: 'PENDING',
    notes: 'Requires phone triage before admission.',
  },
  {
    id: 'res-3',
    name: 'Hope For Kids Foundation',
    type: 'NGO',
    contactPhone: '+94 71 222 3344',
    contactEmail: 'support@hope4kids.lk',
    location: 'Kandy',
    capacity: 'Caseworkers: 6',
    availability: 'AVAILABLE',
    emergencySupport: false,
    status: 'ACTIVE',
    notes: 'Focus on educational support and counseling.',
  },
]

export function SocialWorkerLibraryPage() {
  const [resources, setResources] = useState<Resource[]>(initialResources)

  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<'ALL' | ResourceTypeId>('ALL')
  const [availabilityFilter, setAvailabilityFilter] = useState<'ALL' | AvailabilityStatus>('ALL')
  const [statusFilter, setStatusFilter] = useState<'ALL' | ResourceStatus>('ALL')

  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const [formData, setFormData] = useState<Partial<Resource>>({
    type: 'HOSPITAL',
    availability: 'AVAILABLE',
    emergencySupport: false,
  })

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
    })
    setShowForm(true)
  }

  const handleEdit = (res: Resource) => {
    setEditingId(res.id)
    setFormData(res)
    setShowForm(true)
  }

  const handleArchive = (res: Resource) => {
    setResources((prev) =>
      prev.map((r) => (r.id === res.id ? { ...r, status: 'ARCHIVED', availability: 'FULL' } : r))
    )
  }

  const handleSubmit = () => {
    if (!formData.name || !formData.type || !formData.availability) {
      return
    }

    if (editingId) {
      setResources((prev) =>
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
      }
      setResources((prev) => [newResource, ...prev])
    }

    setShowForm(false)
  }

  const resetFilters = () => {
    setSearch('')
    setTypeFilter('ALL')
    setAvailabilityFilter('ALL')
    setStatusFilter('ALL')
  }

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
                    // TODO: Wire to assignment flow (Referral Panel)
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
                  {res.status !== 'ARCHIVED' && (
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

      {/* Add / Edit Resource modal */}
      <Modal show={showForm} onHide={() => setShowForm(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title className="h6 fw-700">
            {editingId ? 'Edit Resource' : 'Add New Resource'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row className="g-3">
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
