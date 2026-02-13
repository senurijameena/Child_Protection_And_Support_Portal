import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Badge, Button, Card, Col, Container, Form, Modal, Row } from 'react-bootstrap'
import type { HelpType, ServicePackageDTO, ServicePackageStatus } from '../../types/dashboard'
import { HELP_TYPE_LABELS } from '../../types/dashboard'
import { useAuth } from '../../hooks/useAuth'
import {
  getAssignedRequests,
  getServicePackages,
  updateServicePackage,
} from '../../services/socialWorkerApi'
import type { HelpRequestDTO } from '../../types/dashboard'
import './SocialWorkerDashboard.css'

type PackageHelpType = Extract<
  HelpType,
  'FOOD_ASSISTANCE' | 'EDUCATION_SUPPORT' | 'MEDICAL_HELP' | 'SHELTER' | 'CLOTHING' | 'COUNSELING' | 'OTHER'
>

const PRIMARY_TYPE_LABELS: Record<string, string> = {
  FOOD_ASSISTANCE: 'Food',
  EDUCATION_SUPPORT: 'Education',
  MEDICAL_HELP: 'Medical',
  SHELTER: 'Shelter',
  CLOTHING: 'Clothing',
  COUNSELING: 'Counseling',
  OTHER: 'Other',
}

function getPrimaryTypeLabel(type?: string): string {
  return type ? PRIMARY_TYPE_LABELS[type] ?? HELP_TYPE_LABELS[type as HelpType] ?? type : 'Mixed'
}

function getStatusVariant(status?: ServicePackageStatus): string {
  switch (status) {
    case 'PUBLISHED':
      return 'success'
    case 'DRAFT':
      return 'secondary'
    default:
      return 'secondary'
  }
}

function getStatusLabel(status?: ServicePackageStatus): string {
  switch (status) {
    case 'PUBLISHED':
      return 'Active'
    case 'DRAFT':
      return 'Draft'
    default:
      return status ?? 'Draft'
  }
}

export function ServicePackageListingPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [packages, setPackages] = useState<ServicePackageDTO[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<'ALL' | PackageHelpType>('ALL')
  const [statusFilter, setStatusFilter] = useState<'ALL' | ServicePackageStatus>('ALL')
  const [viewPackageId, setViewPackageId] = useState<string | null>(null)
  const [archiveModalId, setArchiveModalId] = useState<string | null>(null)
  const [publishModalId, setPublishModalId] = useState<string | null>(null)
  const [applyModalPackageId, setApplyModalPackageId] = useState<string | null>(null)
  const [assignedRequests, setAssignedRequests] = useState<HelpRequestDTO[]>([])

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        const data = await getServicePackages({ search, type: typeFilter !== 'ALL' ? typeFilter : undefined, status: statusFilter !== 'ALL' ? statusFilter : undefined })
        setPackages(data)
      } catch (err) {
        console.error('Failed to load packages', err)
      } finally {
        setLoading(false)
      }
    }
    void load()
  }, [search, typeFilter, statusFilter])

  useEffect(() => {
    if (!applyModalPackageId || !user?.userId) return
    const load = async () => {
      try {
        const reqs = await getAssignedRequests(user.userId)
        setAssignedRequests(reqs.filter((r) => r.status !== 'COMPLETED' && r.status !== 'CANCELLED' && r.status !== 'REJECTED'))
      } catch (err) {
        console.error('Failed to load requests', err)
      }
    }
    void load()
  }, [applyModalPackageId, user?.userId])

  const filteredPackages = useMemo(() => {
    const q = search.trim().toLowerCase()
    return packages.filter((pkg) => {
      if (q && !pkg.title.toLowerCase().includes(q)) return false
      if (typeFilter !== 'ALL' && pkg.requestType !== typeFilter) return false
      if (statusFilter !== 'ALL' && pkg.status !== statusFilter) return false
      return true
    })
  }, [packages, search, typeFilter, statusFilter])

  const viewedPackage = useMemo(
    () => packages.find((p) => p.id === viewPackageId) ?? null,
    [packages, viewPackageId]
  )

  const handleArchive = async (id: string) => {
    const pkg = packages.find((p) => p.id === id)
    if (!pkg) return
    try {
      await updateServicePackage(id, {
        title: pkg.title,
        requestType: pkg.requestType,
        description: pkg.description,
        estimatedDuration: pkg.estimatedDuration,
        items: pkg.items ?? [],
        status: 'DRAFT',
      })
      setPackages((prev) =>
        prev.map((p) => (p.id === id ? { ...p, status: 'DRAFT' as ServicePackageStatus } : p))
      )
      setArchiveModalId(null)
      if (viewPackageId === id) setViewPackageId(null)
    } catch (err) {
      console.error('Failed to archive package', err)
    }
  }

  const handlePublish = async (id: string) => {
    const pkg = packages.find((p) => p.id === id)
    if (!pkg) return
    try {
      await updateServicePackage(id, {
        title: pkg.title,
        requestType: pkg.requestType,
        description: pkg.description,
        estimatedDuration: pkg.estimatedDuration,
        items: pkg.items ?? [],
        status: 'PUBLISHED',
      })
      setPackages((prev) =>
        prev.map((p) => (p.id === id ? { ...p, status: 'PUBLISHED' as ServicePackageStatus } : p))
      )
      setPublishModalId(null)
      if (viewPackageId === id) setViewPackageId(null)
    } catch (err) {
      console.error('Failed to publish package', err)
    }
  }

  return (
    <Container fluid className="py-4 sw-dashboard">
      <Row className="mb-4">
        <Col xs={12}>
          <div className="d-flex flex-wrap justify-content-between align-items-center gap-2">
            <div>
              <h1 className="h3 fw-700 mb-1">Service Packages</h1>
              <p className="text-muted mb-0">
                View, reuse, edit, or apply existing service packages.
              </p>
            </div>
            <Link
              to="/social-worker/packages/create"
              className="btn btn-primary"
            >
              ➕ Create New Package
            </Link>
          </div>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col xs={12}>
          <Card className="sw-card border-0">
            <Card.Body>
              <Row className="g-3 align-items-end">
                <Col xs={12} md={6}>
                  <Form.Label className="small fw-600 text-muted">Search by package name / service type</Form.Label>
                  <Form.Control
                    type="search"
                    placeholder="Search packages…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </Col>
                <Col xs={6} md={2}>
                  <Form.Label className="small fw-600 text-muted">Type</Form.Label>
                  <Form.Select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value as 'ALL' | PackageHelpType)}
                  >
                    <option value="ALL">All</option>
                    {(['FOOD_ASSISTANCE', 'EDUCATION_SUPPORT', 'MEDICAL_HELP', 'SHELTER', 'CLOTHING', 'COUNSELING', 'OTHER'] as PackageHelpType[]).map((ht) => (
                      <option key={ht} value={ht}>
                        {HELP_TYPE_LABELS[ht]}
                      </option>
                    ))}
                  </Form.Select>
                </Col>
                <Col xs={6} md={2}>
                  <Form.Label className="small fw-600 text-muted">Status</Form.Label>
                  <Form.Select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as 'ALL' | ServicePackageStatus)}
                  >
                    <option value="ALL">All</option>
                    <option value="DRAFT">Draft</option>
                    <option value="PUBLISHED">Active</option>
                  </Form.Select>
                </Col>
              </Row>
              <div className="small text-muted mt-3">
                {filteredPackages.length} package{filteredPackages.length !== 1 ? 's' : ''} matching filters
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="g-4">
        <Col xs={12} lg={viewedPackage ? 8 : 12}>
          <Card className="sw-card border-0 h-100">
            <Card.Header className="bg-white border-0 pt-4 pb-3">
              <h5 className="mb-0 fw-700">Package List</h5>
            </Card.Header>
            <Card.Body className="p-0">
              {loading ? (
                <div className="p-5 text-center text-muted">Loading packages…</div>
              ) : filteredPackages.length === 0 ? (
                <div className="p-5 text-center text-muted">
                  <p className="mb-2">No packages yet.</p>
                  <Link to="/social-worker/packages/create" className="btn btn-primary btn-sm">
                    Create your first package
                  </Link>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover mb-0 align-middle">
                    <thead className="border-top">
                      <tr className="text-muted small">
                        <th className="px-4 py-3">Package Name</th>
                        <th className="py-3">Primary Support Type</th>
                        <th className="py-3 text-center">Services Included</th>
                        <th className="py-3">Status</th>
                        <th className="py-3 d-none d-md-table-cell">Last Updated</th>
                        <th className="py-3 text-end pe-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPackages.map((pkg) => (
                        <tr key={pkg.id} className="border-bottom">
                          <td className="px-4 py-3">
                            <div className="fw-600">{pkg.title}</div>
                            {pkg.description && (
                              <div className="small text-muted text-truncate" style={{ maxWidth: 220 }}>
                                {pkg.description}
                              </div>
                            )}
                          </td>
                          <td className="py-3 small">
                            {getPrimaryTypeLabel(pkg.requestType)}
                          </td>
                          <td className="py-3 text-center small">
                            {pkg.items?.length ?? 0} Services Included
                          </td>
                          <td className="py-3">
                            <Badge bg={getStatusVariant(pkg.status)}>
                              {getStatusLabel(pkg.status)}
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
                                onClick={() => setViewPackageId(pkg.id)}
                              >
                                👁 View
                              </Button>
                              <Link
                                to={`/social-worker/packages/${pkg.id}/edit`}
                                className="btn btn-outline-secondary btn-sm"
                              >
                                ✏️ Edit
                              </Link>
                              {pkg.status === 'PUBLISHED' && (
                                <Button
                                  variant="outline-success"
                                  size="sm"
                                  onClick={() => setApplyModalPackageId(pkg.id)}
                                >
                                  ➕ Apply to Request
                                </Button>
                              )}
                              {pkg.status === 'DRAFT' && (
                                <Button
                                  variant="outline-success"
                                  size="sm"
                                  onClick={() => setPublishModalId(pkg.id)}
                                >
                                  🚀 Activate
                                </Button>
                              )}
                              <Button
                                variant="outline-danger"
                                size="sm"
                                onClick={() => setArchiveModalId(pkg.id)}
                                disabled={pkg.status === 'DRAFT'}
                              >
                                🗄 Archive
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
                <h5 className="mb-0 fw-700">Package Details</h5>
                <Button variant="outline-secondary" size="sm" onClick={() => setViewPackageId(null)}>
                  Close
                </Button>
              </Card.Header>
              <Card.Body className="small">
                <div className="mb-3">
                  <div className="small text-muted mb-1">Title</div>
                  <div className="fw-600">{viewedPackage.title}</div>
                </div>
                <div className="mb-3">
                  <div className="small text-muted mb-1">Primary Support Type</div>
                  <div className="fw-500">{getPrimaryTypeLabel(viewedPackage.requestType)}</div>
                </div>
                <div className="mb-3">
                  <div className="small text-muted mb-1">Status</div>
                  <Badge bg={getStatusVariant(viewedPackage.status)}>
                    {getStatusLabel(viewedPackage.status)}
                  </Badge>
                </div>
                <div className="mb-3">
                  <div className="small text-muted mb-1">Estimated Duration</div>
                  <div className="fw-500">{viewedPackage.estimatedDuration || 'Not specified'}</div>
                </div>
                <div className="mb-3">
                  <div className="small text-muted mb-1">Description</div>
                  <div className="fw-500">{viewedPackage.description || 'No additional notes.'}</div>
                </div>
                <div className="mb-3">
                  <div className="small text-muted mb-1">Service Items</div>
                  {!viewedPackage.items?.length ? (
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
                  <div>Last updated: {viewedPackage.updatedAt ? new Date(viewedPackage.updatedAt).toLocaleString() : 'Unknown'}</div>
                </div>
                <div className="d-flex gap-2 mt-3">
                  <Link
                    to={`/social-worker/packages/${viewedPackage.id}/edit`}
                    className="btn btn-primary btn-sm"
                  >
                    Edit Package
                  </Link>
                  {viewedPackage.status === 'PUBLISHED' && (
                    <Button
                      variant="success"
                      size="sm"
                      onClick={() => setApplyModalPackageId(viewedPackage.id)}
                    >
                      Apply to Request
                    </Button>
                  )}
                  {viewedPackage.status === 'DRAFT' && (
                    <Button
                      variant="success"
                      size="sm"
                      onClick={() => setPublishModalId(viewedPackage.id)}
                    >
                      Activate / Publish
                    </Button>
                  )}
                </div>
              </Card.Body>
            </Card>
          </Col>
        )}
      </Row>

      <Modal show={!!archiveModalId} onHide={() => setArchiveModalId(null)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Archive Package</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Archiving will change the package status to Draft. Only Active packages can be applied to help requests.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={() => setArchiveModalId(null)}>
            Cancel
          </Button>
          <Button variant="warning" onClick={() => archiveModalId && handleArchive(archiveModalId)}>
            Archive
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={!!publishModalId} onHide={() => setPublishModalId(null)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Activate Service Package</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to activate this package? It will become available for assignment to help requests.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={() => setPublishModalId(null)}>
            Cancel
          </Button>
          <Button variant="success" onClick={() => publishModalId && handlePublish(publishModalId)}>
            Activate
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={!!applyModalPackageId} onHide={() => setApplyModalPackageId(null)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Apply Package to Request</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="text-muted small mb-3">
            Select a help request to apply this package to.
          </p>
          {assignedRequests.length === 0 ? (
            <div className="text-muted small">No active assigned requests.</div>
          ) : (
            <div className="d-flex flex-column gap-2">
              {assignedRequests.map((req) => (
                <Button
                  key={req.id}
                  variant="outline-primary"
                  className="text-start"
                  onClick={() => {
                    navigate(`/social-worker/requests/${req.id}?applyPackage=${applyModalPackageId}`)
                    setApplyModalPackageId(null)
                  }}
                >
                  #{req.trackingId ?? req.id} — {req.helpType ?? 'Support'} • {req.status ?? 'Unknown'}
                </Button>
              ))}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={() => setApplyModalPackageId(null)}>
            Cancel
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  )
}
