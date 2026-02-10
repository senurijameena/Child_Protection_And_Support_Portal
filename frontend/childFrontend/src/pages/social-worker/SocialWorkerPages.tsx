import React, { useEffect, useMemo, useState } from 'react'
import { Badge, Button, Card, Col, Container, Form, Row } from 'react-bootstrap'
import type { HelpType, ServicePackageDTO, ServicePackageStatus } from '../../types/dashboard'
import { HELP_TYPE_LABELS } from '../../types/dashboard'
import {
  createServicePackage,
  deleteServicePackage,
  getServicePackages,
  updateServicePackage,
} from '../../services/socialWorkerApi'

type PackageStatus = ServicePackageStatus

type PackageHelpType = Extract<
  HelpType,
  'FOOD_ASSISTANCE' | 'EDUCATION_SUPPORT' | 'MEDICAL_HELP' | 'SHELTER' | 'CLOTHING' | 'COUNSELING' | 'OTHER'
>

const PACKAGE_ITEMS_BY_TYPE: Record<PackageHelpType, string[]> = {
  FOOD_ASSISTANCE: ['Grocery vouchers', 'Meal kits', 'Hot meal delivery', 'Nutritional counseling'],
  EDUCATION_SUPPORT: [
    'School fees',
    'Books & stationery',
    'Tuition / online learning',
    'Uniforms',
  ],
  MEDICAL_HELP: ['Doctor consultation', 'Medicines', 'Hospital visits', 'Lab tests', 'Vaccination'],
  SHELTER: ['Temporary accommodation', 'Rent assistance', 'Safe house', 'Utility support'],
  CLOTHING: ['Everyday clothing', 'School uniforms', 'Footwear', 'Hygiene kits'],
  COUNSELING: ['Individual counseling', 'Family therapy', 'Trauma support', 'Support group sessions'],
  OTHER: ['Legal aid', 'Transportation support', 'Job placement', 'Miscellaneous items as needed'],
}

export function SocialWorkerRequestsPage() {
  return (
    <Container fluid className="py-4">
      <div className="sw-card border-0 p-5 text-center">
        <h2 className="fw-700 mb-3">Assigned Requests</h2>
        <p className="text-muted">This page will display your assigned help requests with filtering, sorting, and detailed views.</p>
      </div>
    </Container>
  )
}

export function SocialWorkerRequestDetailsPage() {
  return (
    <Container fluid className="py-4">
      <div className="sw-card border-0 p-5 text-center">
        <h2 className="fw-700 mb-3">Request Details</h2>
        <p className="text-muted">Detailed view of a specific help request with case information and actions.</p>
      </div>
    </Container>
  )
}

export function SocialWorkerCalendarPage() {
  return (
    <Container fluid className="py-4">
      <div className="sw-card border-0 p-5 text-center">
        <h2 className="fw-700 mb-3">Session Calendar</h2>
        <p className="text-muted">Calendar view for scheduling visits, counseling sessions, and follow-ups with drag-and-drop functionality.</p>
      </div>
    </Container>
  )
}

export function SocialWorkerFollowUpsPage() {
  return (
    <Container fluid className="py-4">
      <div className="sw-card border-0 p-5 text-center">
        <h2 className="fw-700 mb-3">Follow-ups</h2>
        <p className="text-muted">Track and manage follow-up tasks and reminders for your active cases.</p>
      </div>
    </Container>
  )
}

export function SocialWorkerMessagesPage() {
  return (
    <Container fluid className="py-4">
      <div className="sw-card border-0 p-5 text-center">
        <h2 className="fw-700 mb-3">Messages</h2>
        <p className="text-muted">Secure messaging with families, colleagues, and system administrators.</p>
      </div>
    </Container>
  )
}

export function SocialWorkerLibraryPage() {
  return (
    <Container fluid className="py-4">
      <div className="sw-card border-0 p-5 text-center">
        <h2 className="fw-700 mb-3">Resource Library</h2>
        <p className="text-muted">Collection of guidelines, forms, templates, and counseling resources for your work.</p>
      </div>
    </Container>
  )
}

export function SocialWorkerTransfersPage() {
  return (
    <Container fluid className="py-4">
      <div className="sw-card border-0 p-5 text-center">
        <h2 className="fw-700 mb-3">Transfer Requests</h2>
        <p className="text-muted">Request case transfers to other social workers with admin approval.</p>
      </div>
    </Container>
  )
}

export function SocialWorkerPackagesPage() {
  const [title, setTitle] = useState('')
  const [requestType, setRequestType] = useState<PackageHelpType | ''>('')
  const [description, setDescription] = useState('')
  const [estimatedDuration, setEstimatedDuration] = useState('')
  const [selectedItems, setSelectedItems] = useState<Record<string, boolean>>({})
  const [packages, setPackages] = useState<ServicePackageDTO[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [viewPackageId, setViewPackageId] = useState<string | null>(null)

  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<'ALL' | PackageHelpType>('ALL')
  const [statusFilter, setStatusFilter] = useState<'ALL' | PackageStatus>('ALL')

  const availableItems = useMemo(
    () => (requestType ? PACKAGE_ITEMS_BY_TYPE[requestType] : []),
    [requestType]
  )

  const totalSelected = useMemo(
    () => availableItems.filter((item) => selectedItems[item]).length,
    [availableItems, selectedItems]
  )

  const resetForm = () => {
    setTitle('')
    setRequestType('')
    setDescription('')
    setEstimatedDuration('')
    setSelectedItems({})
    setEditingId(null)
  }

  const handleToggleItem = (label: string) => {
    setSelectedItems((prev) => ({
      ...prev,
      [label]: !prev[label],
    }))
  }

  const handleChangeRequestType = (value: PackageHelpType | '') => {
    setRequestType(value)
    setSelectedItems({})
  }

  const handleSavePackage = async (status: PackageStatus) => {
    if (!title.trim() || !requestType) {
      // Basic guard: require title and request type
      return
    }

    const items = availableItems.filter((item) => selectedItems[item])

    const payload: Omit<ServicePackageDTO, 'id' | 'createdAt' | 'updatedAt'> = {
      title: title.trim(),
      requestType,
      description: description.trim() || undefined,
      estimatedDuration: estimatedDuration.trim() || undefined,
      items,
      status,
    }

    if (editingId) {
      const updated = await updateServicePackage(editingId, payload)
      setPackages((prev) => prev.map((p) => (p.id === updated.id ? updated : p)))
    } else {
      const created = await createServicePackage(payload)
      setPackages((prev) => [created, ...prev])
    }

    resetForm()
  }

  const handleEdit = (pkg: ServicePackageDTO) => {
    setTitle(pkg.title)
    setRequestType(pkg.requestType as PackageHelpType)
    setDescription(pkg.description ?? '')
    setEstimatedDuration(pkg.estimatedDuration ?? '')

    const selected: Record<string, boolean> = {}
    pkg.items.forEach((label) => {
      selected[label] = true
    })
    setSelectedItems(selected)
    setEditingId(pkg.id)
  }

  const handleDelete = async (pkg: ServicePackageDTO) => {
    await deleteServicePackage(pkg.id)
    setPackages((prev) => prev.filter((p) => p.id !== pkg.id))
    if (viewPackageId === pkg.id) {
      setViewPackageId(null)
    }
    if (editingId === pkg.id) {
      resetForm()
    }
  }

  useEffect(() => {
    const load = async () => {
      const all = await getServicePackages()
      setPackages(all)
    }
    void load()
  }, [])

  const filteredPackages = useMemo(() => {
    const q = search.trim().toLowerCase()

    return packages.filter((pkg) => {
      if (q && !pkg.title.toLowerCase().includes(q)) {
        return false
      }
      if (typeFilter !== 'ALL' && pkg.requestType !== typeFilter) {
        return false
      }
      if (statusFilter !== 'ALL' && pkg.status !== statusFilter) {
        return false
      }
      return true
    })
  }, [packages, search, typeFilter, statusFilter])

  const draftPackages = useMemo(
    () => filteredPackages.filter((pkg) => pkg.status === 'DRAFT'),
    [filteredPackages]
  )

  const viewedPackage = useMemo(
    () => packages.find((pkg) => pkg.id === viewPackageId) ?? null,
    [packages, viewPackageId]
  )

  const getStatusVariant = (status: PackageStatus) =>
    status === 'PUBLISHED' ? 'success' : 'secondary'

  return (
    <Container fluid className="py-4 sw-dashboard">
      <Row className="mb-4">
        <Col xs={12}>
          <div className="d-flex flex-wrap justify-content-between align-items-center gap-2">
            <div>
              <h1 className="h3 fw-700 mb-1">Service Packages</h1>
              <p className="text-muted mb-0">
                Create reusable service bundles by request type and manage your existing packages.
              </p>
            </div>
          </div>
        </Col>
      </Row>

      {/* Create Package Form */}
      <Row className="g-4 mb-4">
        <Col xs={12}>
          <Card className="sw-card border-0">
            <Card.Header className="bg-white border-0 pt-4 pb-3">
              <h5 className="mb-0 fw-700">
                {editingId ? 'Edit Service Package' : 'Create Service Package'}
              </h5>
            </Card.Header>
            <Card.Body>
              <Row className="g-3">
                <Col xs={12} md={6}>
                  <Form.Label className="small fw-600 text-muted">Package title</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="e.g. Basic Food Assistance Package"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </Col>
                <Col xs={12} md={3}>
                  <Form.Label className="small fw-600 text-muted">Request type *</Form.Label>
                  <Form.Select
                    value={requestType}
                    onChange={(e) => handleChangeRequestType(e.target.value as PackageHelpType | '')}
                  >
                    <option value="">Select type</option>
                    {(
                      [
                        'FOOD_ASSISTANCE',
                        'EDUCATION_SUPPORT',
                        'MEDICAL_HELP',
                        'SHELTER',
                        'CLOTHING',
                        'COUNSELING',
                        'OTHER',
                      ] as PackageHelpType[]
                    ).map((ht) => (
                      <option key={ht} value={ht}>
                        {HELP_TYPE_LABELS[ht]}
                      </option>
                    ))}
                  </Form.Select>
                </Col>
                <Col xs={12} md={3}>
                  <Form.Label className="small fw-600 text-muted">
                    Estimated timeline / duration
                  </Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="e.g. 2–4 weeks"
                    value={estimatedDuration}
                    onChange={(e) => setEstimatedDuration(e.target.value)}
                  />
                </Col>
                <Col xs={12}>
                  <Form.Label className="small fw-600 text-muted">Description / notes</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    placeholder="Optional internal notes or details about this package"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </Col>
              </Row>

              <Row className="g-4 mt-3">
                <Col xs={12} md={7}>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <h6 className="fw-600 mb-0">Service items</h6>
                    {requestType && (
                      <span className="small text-muted">
                        Showing items for{' '}
                        <span className="fw-600">{HELP_TYPE_LABELS[requestType]}</span>
                      </span>
                    )}
                  </div>
                  {!requestType ? (
                    <div className="small text-muted">
                      Select a request type to see relevant service items.
                    </div>
                  ) : (
                    <div className="border rounded-3 p-3 bg-light bg-opacity-50">
                      <div className="d-flex flex-column gap-2 small">
                        {availableItems.map((label) => (
                          <label
                            key={label}
                            className="d-flex align-items-center gap-2 cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              className="form-check-input"
                              checked={!!selectedItems[label]}
                              onChange={() => handleToggleItem(label)}
                            />
                            <span>{label}</span>
                          </label>
                        ))}
                      </div>
                      {availableItems.length === 0 && (
                        <div className="small text-muted">
                          No predefined items for this type yet.
                        </div>
                      )}
                    </div>
                  )}
                </Col>
                <Col xs={12} md={5}>
                  <h6 className="fw-600 mb-2">Summary</h6>
                  <Card className="border-0 bg-light bg-opacity-50">
                    <Card.Body className="small">
                      <div className="d-flex justify-content-between mb-2">
                        <span className="text-muted">Items selected</span>
                        <span className="fw-600">{totalSelected}</span>
                      </div>
                      <div className="d-flex justify-content-between mb-2">
                        <span className="text-muted">Estimated duration</span>
                        <span className="fw-600">
                          {estimatedDuration.trim() || 'Not specified'}
                        </span>
                      </div>
                      <div className="text-muted">
                        Packages are templates only. You can attach resources and schedules when
                        assigning them to individual public users later.
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>

              <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mt-4">
                <div className="small text-muted">
                  Save as draft to refine later, or publish to make the package available for case
                  assignments.
                </div>
                <div className="d-flex flex-wrap gap-2">
                  {editingId && (
                    <Button
                      variant="outline-secondary"
                      size="sm"
                      onClick={resetForm}
                    >
                      Cancel edit
                    </Button>
                  )}
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={() => handleSavePackage('DRAFT')}
                  >
                    Save as draft
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleSavePackage('PUBLISHED')}
                  >
                    Publish package
                  </Button>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Existing Packages Listing */}
      <Row className="g-4">
        <Col xs={12} lg={viewedPackage ? 8 : 12}>
          <Card className="sw-card border-0 h-100">
            <Card.Header className="bg-white border-0 pt-4 pb-3">
              <div className="d-flex flex-wrap justify-content-between align-items-center gap-2">
                <h5 className="mb-0 fw-700">Existing packages</h5>
                <div className="d-flex flex-wrap gap-2 small">
                  <Form.Control
                    size="sm"
                    type="search"
                    placeholder="Search by title…"
                    style={{ maxWidth: 200 }}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                  <Form.Select
                    size="sm"
                    style={{ maxWidth: 170 }}
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value as 'ALL' | PackageHelpType)}
                  >
                    <option value="ALL">All types</option>
                    {(
                      [
                        'FOOD_ASSISTANCE',
                        'EDUCATION_SUPPORT',
                        'MEDICAL_HELP',
                        'SHELTER',
                        'CLOTHING',
                        'COUNSELING',
                        'OTHER',
                      ] as PackageHelpType[]
                    ).map((ht) => (
                      <option key={ht} value={ht}>
                        {HELP_TYPE_LABELS[ht]}
                      </option>
                    ))}
                  </Form.Select>
                  <Form.Select
                    size="sm"
                    style={{ maxWidth: 150 }}
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as 'ALL' | PackageStatus)}
                  >
                    <option value="ALL">All statuses</option>
                    <option value="DRAFT">Draft</option>
                    <option value="PUBLISHED">Published</option>
                  </Form.Select>
                </div>
              </div>
            </Card.Header>
            <Card.Body className="p-0">
              {draftPackages.length > 0 && (
                <div className="px-4 pt-3 pb-2 border-bottom bg-light bg-opacity-50">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="small fw-600 text-muted">Draft box</span>
                    <span className="small text-muted">
                      {draftPackages.length} draft
                      {draftPackages.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="d-flex flex-wrap gap-2">
                    {draftPackages.map((pkg) => (
                      <button
                        key={pkg.id}
                        type="button"
                        className="btn btn-sm btn-outline-secondary rounded-pill d-flex align-items-center gap-2"
                        onClick={() => handleEdit(pkg)}
                      >
                        <span className="small text-truncate" style={{ maxWidth: 160 }}>
                          {pkg.title}
                        </span>
                        <Badge bg="secondary" className="text-uppercase" style={{ fontSize: '0.6rem' }}>
                          Draft
                        </Badge>
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {filteredPackages.length === 0 ? (
                <div className="p-4 text-center text-muted small">
                  No packages yet. Create your first template above.
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover mb-0 align-middle">
                    <thead className="border-top">
                      <tr className="text-muted small">
                        <th className="px-4 py-3">Package title</th>
                        <th className="py-3">Request type</th>
                        <th className="py-3 text-center">Items</th>
                        <th className="py-3">Status</th>
                        <th className="py-3 d-none d-md-table-cell">Updated</th>
                        <th className="py-3 text-end pe-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPackages.map((pkg) => (
                        <tr key={pkg.id} className="border-bottom">
                          <td className="px-4 py-3">
                            <div className="fw-600">{pkg.title}</div>
                            {pkg.description && (
                              <div className="small text-muted text-truncate" style={{ maxWidth: 260 }}>
                                {pkg.description}
                              </div>
                            )}
                          </td>
                          <td className="py-3 small">
                            {HELP_TYPE_LABELS[pkg.requestType]}
                          </td>
                          <td className="py-3 text-center small">
                            {pkg.items.length}
                          </td>
                          <td className="py-3 small">
                            <Badge bg={getStatusVariant(pkg.status)}>
                              {pkg.status === 'PUBLISHED' ? 'Published' : 'Draft'}
                            </Badge>
                          </td>
                          <td className="py-3 small text-muted d-none d-md-table-cell">
                            {pkg.updatedAt ? new Date(pkg.updatedAt).toLocaleDateString() : '—'}
                          </td>
                          <td className="py-3 text-end pe-4">
                            <div className="d-flex justify-content-end gap-2 flex-wrap">
                              <Button
                                variant="outline-primary"
                                size="sm"
                                onClick={() => handleEdit(pkg)}
                              >
                                Edit
                              </Button>
                              <Button
                                variant="outline-secondary"
                                size="sm"
                                onClick={() => setViewPackageId(pkg.id)}
                              >
                                View
                              </Button>
                              <Button
                                variant="outline-danger"
                                size="sm"
                                onClick={() => handleDelete(pkg)}
                              >
                                Delete
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        {viewedPackage && (
          <Col xs={12} lg={4}>
            <Card className="sw-card border-0 h-100">
              <Card.Header className="bg-white border-0 pt-4 pb-3 d-flex justify-content-between align-items-center">
                <h5 className="mb-0 fw-700">Package details</h5>
                <Button
                  variant="outline-secondary"
                  size="sm"
                  onClick={() => setViewPackageId(null)}
                >
                  Close
                </Button>
              </Card.Header>
              <Card.Body className="small">
                <div className="mb-3">
                  <div className="small text-muted mb-1">Title</div>
                  <div className="fw-600">{viewedPackage.title}</div>
                </div>
                <div className="mb-3">
                  <div className="small text-muted mb-1">Request type</div>
                  <div className="fw-500">
                    {HELP_TYPE_LABELS[viewedPackage.requestType]}
                  </div>
                </div>
                <div className="mb-3">
                  <div className="small text-muted mb-1">Status</div>
                  <Badge bg={getStatusVariant(viewedPackage.status)}>
                    {viewedPackage.status === 'PUBLISHED' ? 'Published' : 'Draft'}
                  </Badge>
                </div>
                <div className="mb-3">
                  <div className="small text-muted mb-1">Estimated duration</div>
                  <div className="fw-500">
                    {viewedPackage.estimatedDuration || 'Not specified'}
                  </div>
                </div>
                <div className="mb-3">
                  <div className="small text-muted mb-1">Description / notes</div>
                  <div className="fw-500">
                    {viewedPackage.description || 'No additional notes.'}
                  </div>
                </div>
                <div className="mb-3">
                  <div className="small text-muted mb-1">Service items</div>
                  {viewedPackage.items.length === 0 ? (
                    <div className="text-muted">No items selected.</div>
                  ) : (
                    <ul className="mb-0 ps-3">
                      {viewedPackage.items.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  )}
                </div>
                <div className="text-muted mt-3">
                  <div>
                    Created:{' '}
                    {viewedPackage.createdAt
                      ? new Date(viewedPackage.createdAt).toLocaleString()
                      : 'Unknown'}
                  </div>
                  <div>
                    Last updated:{' '}
                    {viewedPackage.updatedAt
                      ? new Date(viewedPackage.updatedAt).toLocaleString()
                      : 'Unknown'}
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        )}
      </Row>
    </Container>
  )
}

export function SocialWorkerReportsPage() {
  return (
    <Container fluid className="py-4">
      <div className="sw-card border-0 p-5 text-center">
        <h2 className="fw-700 mb-3">Reports</h2>
        <p className="text-muted">Generate and view reports on cases, activities, and outcomes.</p>
      </div>
    </Container>
  )
}

export function SocialWorkerProfilePage() {
  return (
    <Container fluid className="py-4">
      <div className="sw-card border-0 p-5 text-center">
        <h2 className="fw-700 mb-3">My Profile</h2>
        <p className="text-muted">View and edit your professional profile, credentials, and preferences.</p>
      </div>
    </Container>
  )
}
