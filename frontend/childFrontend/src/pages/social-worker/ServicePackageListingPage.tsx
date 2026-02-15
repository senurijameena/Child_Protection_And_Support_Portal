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
          <div 
            className="p-4 rounded-3 shadow-sm position-relative overflow-hidden"
            style={{ 
              background: 'linear-gradient(135deg, #06b6d4 0%, #0ea5e9 100%)',
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
                  <span style={{ fontSize: '2rem' }}>📦</span>
                </div>
                <div>
                  <h1 className="h2 fw-bold mb-1">Service Packages</h1>
                  <p className="mb-0" style={{ opacity: 0.95, fontSize: '0.95rem' }}>
                    View, reuse, edit, or apply existing service packages
                  </p>
                </div>
              </div>
              <Link
                to="/social-worker/packages/create"
                className="btn btn-light d-flex align-items-center gap-2"
                style={{
                  fontWeight: '600',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                }}
              >
                <span style={{ fontSize: '1.2rem' }}>➕</span> Create New Package
              </Link>
            </div>
          </div>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col xs={12}>
          <Card 
            className="border-0 shadow-sm" 
            style={{ background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)' }}
          >
            <Card.Body className="p-4">
              <div className="d-flex align-items-center gap-2 mb-3">
                <span style={{ fontSize: '1.5rem' }}>🔍</span>
                <h6 className="mb-0 fw-bold" style={{ color: '#0369a1' }}>Search & Filter</h6>
              </div>
              <Row className="g-3 align-items-end">
                <Col xs={12} md={6}>
                  <Form.Label className="small fw-600" style={{ color: '#0369a1' }}>
                    🔎 Search by package name / service type
                  </Form.Label>
                  <Form.Control
                    type="search"
                    placeholder="Search packages…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={{
                      border: '2px solid rgba(3, 105, 161, 0.2)',
                      borderRadius: '8px'
                    }}
                  />
                </Col>
                <Col xs={6} md={3}>
                  <Form.Label className="small fw-600" style={{ color: '#0369a1' }}>
                    📋 Type
                  </Form.Label>
                  <Form.Select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value as 'ALL' | PackageHelpType)}
                    style={{
                      border: '2px solid rgba(3, 105, 161, 0.2)',
                      borderRadius: '8px'
                    }}
                  >
                    <option value="ALL">All Types</option>
                    {(['FOOD_ASSISTANCE', 'EDUCATION_SUPPORT', 'MEDICAL_HELP', 'SHELTER', 'CLOTHING', 'COUNSELING', 'OTHER'] as PackageHelpType[]).map((ht) => (
                      <option key={ht} value={ht}>
                        {HELP_TYPE_LABELS[ht]}
                      </option>
                    ))}
                  </Form.Select>
                </Col>
                <Col xs={6} md={3}>
                  <Form.Label className="small fw-600" style={{ color: '#0369a1' }}>
                    🏷️ Status
                  </Form.Label>
                  <Form.Select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as 'ALL' | ServicePackageStatus)}
                    style={{
                      border: '2px solid rgba(3, 105, 161, 0.2)',
                      borderRadius: '8px'
                    }}
                  >
                    <option value="ALL">All Status</option>
                    <option value="DRAFT">📝 Draft</option>
                    <option value="PUBLISHED">✅ Active</option>
                  </Form.Select>
                </Col>
              </Row>
              <div 
                className="mt-3 p-2 rounded"
                style={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.6)',
                  border: '1px solid rgba(3, 105, 161, 0.2)'
                }}
              >
                <span className="small fw-semibold" style={{ color: '#0369a1' }}>
                  📊 {filteredPackages.length} package{filteredPackages.length !== 1 ? 's' : ''} matching filters
                </span>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="g-4">
        <Col xs={12} lg={viewedPackage ? 8 : 12}>
          <Card 
            className="border-0 shadow-sm h-100"
            style={{ background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)' }}
          >
            <Card.Header className="bg-transparent border-0 pt-4 pb-3">
              <div className="d-flex align-items-center gap-2">
                <span style={{ fontSize: '1.5rem' }}>📋</span>
                <h5 className="mb-0 fw-bold" style={{ color: '#1e40af' }}>Package Library</h5>
              </div>
            </Card.Header>
            <Card.Body className="p-0">
              {loading ? (
                <div 
                  className="p-5 text-center m-3 rounded-3"
                  style={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.5)',
                    color: '#1e40af'
                  }}
                >
                  <div className="spinner-border" style={{ color: '#2563eb' }} role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="mt-3 mb-0 fw-semibold">Loading packages…</p>
                </div>
              ) : filteredPackages.length === 0 ? (
                <div 
                  className="p-5 text-center m-3 rounded-3"
                  style={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.5)',
                    border: '2px dashed rgba(37, 99, 235, 0.3)',
                    color: '#1e40af'
                  }}
                >
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📦</div>
                  <p className="mb-3 fw-semibold">No packages yet</p>
                  <Link 
                    to="/social-worker/packages/create" 
                    className="btn btn-sm"
                    style={{
                      background: 'linear-gradient(135deg, #f59e0b 0%, #fb923c 100%)',
                      color: 'white',
                      border: 'none',
                      fontWeight: '600'
                    }}
                  >
                    ➕ Create your first package
                  </Link>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover mb-0 align-middle">
                    <thead style={{ background: 'linear-gradient(90deg, #2563eb 0%, #3b82f6 100%)' }}>
                      <tr className="small">
                        <th className="px-4 py-3 text-white fw-600">
                          <span className="me-2">📦</span>Package Name
                        </th>
                        <th className="py-3 text-white fw-600">
                          <span className="me-2">🏷️</span>Support Type
                        </th>
                        <th className="py-3 text-center text-white fw-600">
                          <span className="me-2">📊</span>Services
                        </th>
                        <th className="py-3 text-white fw-600">
                          <span className="me-2">🎯</span>Status
                        </th>
                        <th className="py-3 text-white fw-600 d-none d-md-table-cell">
                          <span className="me-2">📅</span>Updated
                        </th>
                        <th className="py-3 text-end pe-4 text-white fw-600">Actions</th>
                      </tr>
                    </thead>
                    <tbody style={{ backgroundColor: 'rgba(255, 255, 255, 0.6)' }}>
                      {filteredPackages.map((pkg, idx) => (
                        <tr 
                          key={pkg.id} 
                          style={{
                            backgroundColor: idx % 2 === 0 ? 'rgba(219, 234, 254, 0.35)' : 'rgba(255, 255, 255, 0.5)',
                            transition: 'all 0.3s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = 'rgba(37, 99, 235, 0.1)';
                            e.currentTarget.style.transform = 'scale(1.01)';
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(37, 99, 235, 0.15)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = idx % 2 === 0 ? 'rgba(219, 234, 254, 0.35)' : 'rgba(255, 255, 255, 0.5)';
                            e.currentTarget.style.transform = 'scale(1)';
                            e.currentTarget.style.boxShadow = 'none';
                          }}
                        >
                          <td className="px-4 py-3">
                            <div className="fw-600" style={{ color: '#1e40af' }}>
                              {pkg.status === 'PUBLISHED' && (
                                <span 
                                  className="d-inline-block rounded-circle me-2"
                                  style={{
                                    width: '8px',
                                    height: '8px',
                                    backgroundColor: '#10b981'
                                  }}
                                />
                              )}
                              {pkg.title}
                            </div>
                            {pkg.description && (
                              <div className="small text-muted text-truncate" style={{ maxWidth: 220 }}>
                                {pkg.description}
                              </div>
                            )}
                          </td>
                          <td className="py-3 small" style={{ color: '#78350f' }}>
                            <Badge 
                              className="rounded-pill"
                              style={{
                                backgroundColor: 'rgba(37, 99, 235, 0.16)',
                                color: '#1e40af',
                                fontSize: '0.75rem',
                                padding: '0.35rem 0.65rem'
                              }}
                            >
                              {getPrimaryTypeLabel(pkg.requestType)}
                            </Badge>
                          </td>
                          <td className="py-3 text-center">
                            <Badge 
                              className="rounded-pill"
                              style={{
                                backgroundColor: '#06b6d4',
                                color: 'white',
                                fontSize: '0.75rem',
                                padding: '0.35rem 0.65rem'
                              }}
                            >
                              {pkg.items?.length ?? 0} items
                            </Badge>
                          </td>
                          <td className="py-3">
                            <Badge 
                              className="rounded-pill"
                              style={{
                                backgroundColor: pkg.status === 'PUBLISHED' ? '#10b981' : '#6b7280',
                                fontSize: '0.75rem',
                                padding: '0.35rem 0.65rem',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                              }}
                            >
                              {pkg.status === 'PUBLISHED' ? '✅ Active' : '📝 Draft'}
                            </Badge>
                          </td>
                          <td className="py-3 small text-muted d-none d-md-table-cell">
                            {pkg.updatedAt ? new Date(pkg.updatedAt).toLocaleDateString() : '—'}
                          </td>
                          <td className="py-3 text-end pe-4">
                            <div className="d-flex justify-content-end gap-1 flex-wrap">
                              <Button
                                size="sm"
                                onClick={() => setViewPackageId(pkg.id)}
                                style={{
                                  backgroundColor: 'rgba(6, 182, 212, 0.1)',
                                  color: '#0891b2',
                                  border: '1px solid rgba(6, 182, 212, 0.3)',
                                  fontSize: '0.75rem'
                                }}
                              >
                                👁
                              </Button>
                              <Link
                                to={`/social-worker/packages/${pkg.id}/edit`}
                                className="btn btn-sm"
                                style={{
                                  backgroundColor: 'rgba(107, 114, 128, 0.1)',
                                  color: '#4b5563',
                                  border: '1px solid rgba(107, 114, 128, 0.3)',
                                  fontSize: '0.75rem'
                                }}
                              >
                                ✏️
                              </Link>
                              {pkg.status === 'PUBLISHED' && (
                                <Button
                                  size="sm"
                                  onClick={() => setApplyModalPackageId(pkg.id)}
                                  style={{
                                    backgroundColor: '#2563eb',
                                    color: 'white',
                                    border: 'none',
                                    fontSize: '0.75rem'
                                  }}
                                >
                                  ➕
                                </Button>
                              )}
                              {pkg.status === 'DRAFT' && (
                                <Button
                                  size="sm"
                                  onClick={() => setPublishModalId(pkg.id)}
                                  style={{
                                    backgroundColor: '#2563eb',
                                    color: 'white',
                                    border: 'none',
                                    fontSize: '0.75rem'
                                  }}
                                >
                                  🚀
                                </Button>
                              )}
                              <Button
                                size="sm"
                                onClick={() => setArchiveModalId(pkg.id)}
                                disabled={pkg.status === 'DRAFT'}
                                style={{
                                  backgroundColor: pkg.status === 'DRAFT' ? 'rgba(107, 114, 128, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                  color: pkg.status === 'DRAFT' ? '#9ca3af' : '#dc2626',
                                  border: `1px solid ${pkg.status === 'DRAFT' ? 'rgba(107, 114, 128, 0.2)' : 'rgba(239, 68, 68, 0.3)'}`,
                                  fontSize: '0.75rem'
                                }}
                              >
                                🗄
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
            <Card 
              className="border-0 shadow-sm h-100"
              style={{ background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)' }}
            >
              <Card.Header className="bg-transparent border-0 pt-4 pb-3 d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center gap-2">
                  <span style={{ fontSize: '1.5rem' }}>📄</span>
                  <h5 className="mb-0 fw-bold" style={{ color: '#1e40af' }}>Package Details</h5>
                </div>
                <Button 
                  size="sm" 
                  onClick={() => setViewPackageId(null)}
                  style={{
                    backgroundColor: 'rgba(30, 64, 175, 0.1)',
                    color: '#1e40af',
                    border: '1px solid rgba(30, 64, 175, 0.3)'
                  }}
                >
                  ✕
                </Button>
              </Card.Header>
              <Card.Body className="small">
                <div 
                  className="mb-3 p-3 rounded-3"
                  style={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.6)',
                    border: '1px solid rgba(30, 64, 175, 0.1)'
                  }}
                >
                  <div className="small fw-semibold mb-1" style={{ color: '#1e40af' }}>📦 Title</div>
                  <div className="fw-600" style={{ color: '#1e3a8a' }}>{viewedPackage.title}</div>
                </div>

                <div 
                  className="mb-3 p-3 rounded-3"
                  style={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.6)',
                    border: '1px solid rgba(30, 64, 175, 0.1)'
                  }}
                >
                  <div className="small fw-semibold mb-2" style={{ color: '#1e40af' }}>🏷️ Support Type</div>
                  <Badge 
                    className="rounded-pill"
                    style={{
                      backgroundColor: '#0ea5e9',
                      fontSize: '0.75rem',
                      padding: '0.4rem 0.8rem'
                    }}
                  >
                    {getPrimaryTypeLabel(viewedPackage.requestType)}
                  </Badge>
                </div>

                <div 
                  className="mb-3 p-3 rounded-3"
                  style={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.6)',
                    border: '1px solid rgba(30, 64, 175, 0.1)'
                  }}
                >
                  <div className="small fw-semibold mb-2" style={{ color: '#1e40af' }}>🎯 Status</div>
                  <Badge 
                    className="rounded-pill"
                    style={{
                      backgroundColor: viewedPackage.status === 'PUBLISHED' ? '#10b981' : '#6b7280',
                      fontSize: '0.75rem',
                      padding: '0.4rem 0.8rem',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}
                  >
                    {viewedPackage.status === 'PUBLISHED' ? '✅ Active' : '📝 Draft'}
                  </Badge>
                </div>

                <div 
                  className="mb-3 p-3 rounded-3"
                  style={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.6)',
                    border: '1px solid rgba(30, 64, 175, 0.1)'
                  }}
                >
                  <div className="small fw-semibold mb-1" style={{ color: '#1e40af' }}>⏱️ Estimated Duration</div>
                  <div className="fw-500" style={{ color: '#1e3a8a' }}>
                    {viewedPackage.estimatedDuration || 'Not specified'}
                  </div>
                </div>

                <div 
                  className="mb-3 p-3 rounded-3"
                  style={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.6)',
                    border: '1px solid rgba(30, 64, 175, 0.1)'
                  }}
                >
                  <div className="small fw-semibold mb-1" style={{ color: '#1e40af' }}>📝 Description</div>
                  <div className="fw-500" style={{ color: '#1e3a8a' }}>
                    {viewedPackage.description || 'No additional notes.'}
                  </div>
                </div>

                <div 
                  className="mb-3 p-3 rounded-3"
                  style={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.6)',
                    border: '1px solid rgba(30, 64, 175, 0.1)'
                  }}
                >
                  <div className="small fw-semibold mb-2" style={{ color: '#1e40af' }}>
                    📋 Service Items ({viewedPackage.items?.length ?? 0})
                  </div>
                  {!viewedPackage.items?.length ? (
                    <div className="text-muted small">No items selected.</div>
                  ) : (
                    <ul className="mb-0 ps-3">
                      {viewedPackage.items.map((item, idx) => (
                        <li key={idx} className="mb-1" style={{ color: '#1e3a8a' }}>
                          <span style={{ fontSize: '0.85rem' }}>{item}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div 
                  className="p-2 rounded small"
                  style={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.4)',
                    color: '#64748b'
                  }}
                >
                  <span className="me-2">📅</span>
                  Last updated: {viewedPackage.updatedAt ? new Date(viewedPackage.updatedAt).toLocaleString() : 'Unknown'}
                </div>

                <div className="d-flex flex-column gap-2 mt-4">
                  <Link
                    to={`/social-worker/packages/${viewedPackage.id}/edit`}
                    className="btn btn-sm"
                    style={{
                      background: 'linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%)',
                      color: 'white',
                      border: 'none',
                      fontWeight: '600'
                    }}
                  >
                    ✏️ Edit Package
                  </Link>
                  {viewedPackage.status === 'PUBLISHED' && (
                    <Button
                      size="sm"
                      onClick={() => setApplyModalPackageId(viewedPackage.id)}
                      style={{
                        backgroundColor: '#10b981',
                        color: 'white',
                        border: 'none',
                        fontWeight: '600'
                      }}
                    >
                      ➕ Apply to Request
                    </Button>
                  )}
                  {viewedPackage.status === 'DRAFT' && (
                    <Button
                      size="sm"
                      onClick={() => setPublishModalId(viewedPackage.id)}
                      style={{
                        backgroundColor: '#10b981',
                        color: 'white',
                        border: 'none',
                        fontWeight: '600'
                      }}
                    >
                      🚀 Activate Package
                    </Button>
                  )}
                </div>
              </Card.Body>
            </Card>
          </Col>
        )}
      </Row>

      <Modal show={!!archiveModalId} onHide={() => setArchiveModalId(null)} centered>
        <div style={{ borderRadius: '12px', overflow: 'hidden' }}>
          <Modal.Header 
            closeButton 
            style={{ 
              background: 'linear-gradient(135deg, #1d4ed8 0%, #3b82f6 100%)',
              color: 'white',
              border: 'none'
            }}
          >
            <Modal.Title className="d-flex align-items-center gap-2">
              <span style={{ fontSize: '1.5rem' }}>🗄️</span>
              <span className="fw-bold">Archive Package</span>
            </Modal.Title>
          </Modal.Header>
          <Modal.Body style={{ backgroundColor: '#eff6ff', padding: '2rem' }}>
            <div 
              className="p-3 rounded-3 mb-3"
              style={{ 
                backgroundColor: 'rgba(37, 99, 235, 0.1)',
                border: '1px solid rgba(37, 99, 235, 0.3)'
              }}
            >
              <p className="mb-0" style={{ color: '#1e40af' }}>
                ⚠️ Archiving will change the package status to <strong>Draft</strong>. Only Active packages can be applied to help requests.
              </p>
            </div>
          </Modal.Body>
          <Modal.Footer style={{ backgroundColor: '#eff6ff', border: 'none' }}>
            <Button 
              onClick={() => setArchiveModalId(null)}
              style={{
                backgroundColor: 'rgba(107, 114, 128, 0.1)',
                color: '#4b5563',
                border: '1px solid rgba(107, 114, 128, 0.3)'
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={() => archiveModalId && handleArchive(archiveModalId)}
              style={{
                background: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)',
                color: 'white',
                border: 'none',
                fontWeight: '600'
              }}
            >
              🗄️ Archive Package
            </Button>
          </Modal.Footer>
        </div>
      </Modal>

      <Modal show={!!publishModalId} onHide={() => setPublishModalId(null)} centered>
        <div style={{ borderRadius: '12px', overflow: 'hidden' }}>
          <Modal.Header 
            closeButton 
            style={{ 
              background: 'linear-gradient(135deg, #1d4ed8 0%, #3b82f6 100%)',
              color: 'white',
              border: 'none'
            }}
          >
            <Modal.Title className="d-flex align-items-center gap-2">
              <span style={{ fontSize: '1.5rem' }}>🚀</span>
              <span className="fw-bold">Activate Service Package</span>
            </Modal.Title>
          </Modal.Header>
          <Modal.Body style={{ backgroundColor: '#eff6ff', padding: '2rem' }}>
            <div 
              className="p-3 rounded-3 mb-3"
              style={{ 
                backgroundColor: 'rgba(37, 99, 235, 0.1)',
                border: '1px solid rgba(37, 99, 235, 0.3)'
              }}
            >
              <p className="mb-0" style={{ color: '#1e40af' }}>
                ✅ Are you sure you want to activate this package? It will become available for assignment to help requests.
              </p>
            </div>
          </Modal.Body>
          <Modal.Footer style={{ backgroundColor: '#eff6ff', border: 'none' }}>
            <Button 
              onClick={() => setPublishModalId(null)}
              style={{
                backgroundColor: 'rgba(107, 114, 128, 0.1)',
                color: '#4b5563',
                border: '1px solid rgba(107, 114, 128, 0.3)'
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={() => publishModalId && handlePublish(publishModalId)}
              style={{
                background: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)',
                color: 'white',
                border: 'none',
                fontWeight: '600'
              }}
            >
              🚀 Activate Package
            </Button>
          </Modal.Footer>
        </div>
      </Modal>

      <Modal show={!!applyModalPackageId} onHide={() => setApplyModalPackageId(null)} centered>
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
              <span className="fw-bold">Apply Package to Request</span>
            </Modal.Title>
          </Modal.Header>
          <Modal.Body style={{ backgroundColor: '#eff6ff', padding: '2rem' }}>
            <p className="small fw-semibold mb-3" style={{ color: '#1e40af' }}>
              📋 Select a help request to apply this package to:
            </p>
            {assignedRequests.length === 0 ? (
              <div 
                className="p-4 text-center rounded-3"
                style={{ 
                  backgroundColor: 'rgba(59, 130, 246, 0.1)',
                  border: '2px dashed rgba(59, 130, 246, 0.3)',
                  color: '#1e40af'
                }}
              >
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📭</div>
                <p className="mb-0 fw-semibold">No active assigned requests</p>
              </div>
            ) : (
              <div className="d-flex flex-column gap-2">
                {assignedRequests.map((req, idx) => (
                  <Button
                    key={req.id}
                    className="text-start"
                    onClick={() => {
                      navigate(`/social-worker/requests/${req.id}?applyPackage=${applyModalPackageId}`)
                      setApplyModalPackageId(null)
                    }}
                    style={{
                      backgroundColor: 'white',
                      color: '#1e40af',
                      border: '2px solid rgba(59, 130, 246, 0.2)',
                      borderRadius: '8px',
                      padding: '0.75rem 1rem',
                      fontWeight: '500',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.1)';
                      e.currentTarget.style.borderColor = '#3b82f6';
                      e.currentTarget.style.transform = 'translateX(5px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'white';
                      e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.2)';
                      e.currentTarget.style.transform = 'translateX(0)';
                    }}
                  >
                    <div className="d-flex align-items-center gap-2">
                      <span style={{ fontSize: '1.2rem' }}>📄</span>
                      <div>
                        <div className="fw-bold">#{req.trackingId ?? req.id}</div>
                        <div className="small">
                          {req.helpType ?? 'Support'} • <Badge bg={req.status === 'IN_PROGRESS' ? 'success' : 'warning'} className="ms-1">{req.status ?? 'Unknown'}</Badge>
                        </div>
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            )}
          </Modal.Body>
          <Modal.Footer style={{ backgroundColor: '#eff6ff', border: 'none' }}>
            <Button 
              onClick={() => setApplyModalPackageId(null)}
              style={{
                backgroundColor: 'rgba(107, 114, 128, 0.1)',
                color: '#4b5563',
                border: '1px solid rgba(107, 114, 128, 0.3)'
              }}
            >
              Cancel
            </Button>
          </Modal.Footer>
        </div>
      </Modal>
    </Container>
  )
}
