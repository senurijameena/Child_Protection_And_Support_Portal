import { useEffect, useMemo, useState } from 'react'
import { Card, Col, Container, Form, Row, Badge, Button } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import {
  deleteDraftCompletedHelpReport,
  getAssignedRequests,
  getDraftCompletedHelpReports,
  getSubmittedCompletedHelpReports,
  sendCompletedHelpRequestReportToAdmin,
} from '../../services/socialWorkerApi'
import type { CompletedHelpReportListItemDTO, HelpRequestDTO } from '../../types/dashboard'
import './SocialWorkerDashboard.css'

const fmt = (iso?: string) => (iso ? new Date(iso).toLocaleString() : '-')

export function SocialWorkerReportsPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [requests, setRequests] = useState<HelpRequestDTO[]>([])
  const [submittedReports, setSubmittedReports] = useState<CompletedHelpReportListItemDTO[]>([])
  const [draftReports, setDraftReports] = useState<CompletedHelpReportListItemDTO[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [draftSearch, setDraftSearch] = useState('')
  const [submittingId, setSubmittingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'submitted' | 'drafts'>('all')

  useEffect(() => {
    setLoading(true)
    const assignedPromise = user?.userId ? getAssignedRequests(user.userId) : Promise.resolve([])

    Promise.all([assignedPromise, getSubmittedCompletedHelpReports(), getDraftCompletedHelpReports()])
      .then(([assigned, submitted, drafts]) => {
        setRequests(assigned)
        setSubmittedReports(submitted)
        setDraftReports(drafts)
        setError(null)
      })
      .catch((err) => setError((err as Error).message ?? 'Failed to load reports'))
      .finally(() => setLoading(false))
  }, [user?.userId])

  const unifiedRows = useMemo(() => {
    const rows: any[] = []
    const processedHelpIds = new Set<string>()

    // 1. Add Drafts (which are for completed requests)
    draftReports.forEach((d) => {
      rows.push({
        id: d.helpRequestId,
        trackingId: d.helpTrackingId || d.helpRequestId,
        requesterName: d.requesterName || 'Anonymous Requester',
        type: d.requestType || 'N/A',
        date: d.generatedAt,
        status: 'DRAFT',
        kind: 'draft',
        reportId: d.reportId,
      })
      processedHelpIds.add(d.helpRequestId)
    })

    // 2. Add Submitted Reports
    submittedReports.forEach((s) => {
      if (!processedHelpIds.has(s.helpRequestId)) {
        rows.push({
          id: s.helpRequestId,
          trackingId: s.helpTrackingId || s.helpRequestId,
          requesterName: s.requesterName || 'Anonymous Requester',
          type: s.requestType || 'N/A',
          date: s.generatedAt,
          status: s.workflowStatus || 'SENT_TO_ADMIN',
          kind: 'submitted',
        })
        processedHelpIds.add(s.helpRequestId)
      }
    })

    // 3. Add Completed Assigned Requests (that don't have reports yet)
    requests.filter((r) => r.status === 'COMPLETED').forEach((r) => {
      if (!processedHelpIds.has(r.id)) {
        rows.push({
          id: r.id,
          trackingId: r.trackingId || r.id,
          requesterName: r.requesterName || 'Anonymous Requester',
          type: r.helpType || 'N/A',
          date: undefined,
          status: 'NOT_SUBMITTED',
          kind: 'none',
        })
        processedHelpIds.add(r.id)
      }
    })

    // Search filter
    const q = search.trim().toLowerCase()
    let filtered = rows
    if (q) {
      filtered = rows.filter((r) =>
        `${r.id} ${r.trackingId} ${r.requesterName} ${r.type} ${r.status}`.toLowerCase().includes(q)
      )
    }

    // Filter by the two buttons (toggles)
    if (filter === 'submitted') {
      return filtered.filter((r) => r.kind === 'submitted')
    }
    if (filter === 'drafts') {
      return filtered.filter((r) => r.kind === 'draft')
    }

    return filtered
  }, [requests, submittedReports, draftReports, search, filter])

  const handleSubmitDraft = async (requestId: string) => {
    setSubmittingId(requestId)
    setMessage(null)
    try {
      await sendCompletedHelpRequestReportToAdmin(requestId)
      setDraftReports((prev) => prev.filter((d) => d.helpRequestId !== requestId))
      const submitted = await getSubmittedCompletedHelpReports()
      setSubmittedReports(submitted)
      setMessage('Draft submitted to admin.')
      setFilter('all') // Go back to all view to see the submitted report
    } catch (err) {
      setError((err as Error).message ?? 'Failed to submit draft')
    } finally {
      setSubmittingId(null)
    }
  }

  const handleDeleteDraft = async (requestId: string) => {
    setDeletingId(requestId)
    setMessage(null)
    try {
      await deleteDraftCompletedHelpReport(requestId)
      setDraftReports((prev) => prev.filter((d) => d.helpRequestId !== requestId))
      setMessage('Draft deleted.')
    } catch (err) {
      setError((err as Error).message ?? 'Failed to delete draft')
    } finally {
      setDeletingId(null)
    }
  }

  const toggleFilter = (newFilter: 'submitted' | 'drafts') => {
    setFilter(filter === newFilter ? 'all' : newFilter)
  }

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
                  <span style={{ fontSize: '2rem' }}>📊</span>
                </div>
                <div>
                  <h1 className="h2 fw-bold mb-1">Reports</h1>
                  <p className="mb-0" style={{ opacity: 0.95, fontSize: '0.95rem' }}>
                    Only showing completed requests. Manage reports and drafts.
                  </p>
                </div>
              </div>
              <div className="d-flex gap-2">
                <Button
                  size="sm"
                  onClick={() => toggleFilter('submitted')}
                  className="d-flex align-items-center gap-2"
                  style={{
                    background: filter === 'submitted'
                      ? 'rgba(255, 255, 255, 0.9)'
                      : 'rgba(255, 255, 255, 0.2)',
                    color: filter === 'submitted' ? '#1e40af' : 'white',
                    border: `2px solid ${filter === 'submitted' ? 'white' : 'rgba(255, 255, 255, 0.3)'}`,
                    fontWeight: '600',
                    boxShadow: filter === 'submitted' ? '0 4px 6px rgba(0, 0, 0, 0.1)' : 'none',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <span>✅</span> Submitted
                </Button>
                <Button
                  size="sm"
                  onClick={() => toggleFilter('drafts')}
                  className="d-flex align-items-center gap-2"
                  style={{
                    background: filter === 'drafts'
                      ? 'rgba(255, 255, 255, 0.9)'
                      : 'rgba(255, 255, 255, 0.2)',
                    color: filter === 'drafts' ? '#1e40af' : 'white',
                    border: `2px solid ${filter === 'drafts' ? 'white' : 'rgba(255, 255, 255, 0.3)'}`,
                    fontWeight: '600',
                    boxShadow: filter === 'drafts' ? '0 4px 6px rgba(0, 0, 0, 0.1)' : 'none',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <span>📝</span> Drafts
                </Button>
              </div>
            </div>
          </div>
        </Col>
      </Row>

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
      {message && (
        <Row className="mb-3">
          <Col xs={12}>
            <div
              className="p-3 rounded-3"
              style={{
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                color: '#065f46',
                border: '2px solid rgba(16, 185, 129, 0.2)'
              }}
            >
              <strong>✓ Success:</strong> {message}
            </div>
          </Col>
        </Row>
      )}

      <Row>
        <Col xs={12}>
          <Card
            className="border-0 shadow-sm"
            style={{ background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)' }}
          >
            <Card.Body className="p-0">
              {/* Search Bar */}
              <div
                className="p-4 d-flex flex-wrap justify-content-between align-items-center gap-3"
                style={{ borderBottom: '2px solid rgba(59, 130, 246, 0.2)' }}
              >
                <div className="flex-grow-1" style={{ maxWidth: '400px' }}>
                  <div className="position-relative">
                    <span
                      className="position-absolute"
                      style={{
                        left: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        fontSize: '1.2rem',
                        zIndex: 10
                      }}
                    >
                      🔍
                    </span>
                    <Form.Control
                      type="search"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search by ID, user, or type"
                      style={{
                        paddingLeft: '40px',
                        border: '2px solid rgba(59, 130, 246, 0.3)',
                        borderRadius: '8px',
                        backgroundColor: 'rgba(255, 255, 255, 0.8)'
                      }}
                    />
                  </div>
                </div>
                {filter !== 'all' && (
                  <Button
                    size="sm"
                    onClick={() => setFilter('all')}
                    className="d-flex align-items-center gap-2"
                    style={{
                      backgroundColor: 'rgba(59, 130, 246, 0.1)',
                      color: '#1e40af',
                      border: '2px solid rgba(59, 130, 246, 0.3)',
                      fontWeight: '600',
                      borderRadius: '8px'
                    }}
                  >
                    <span>🔄</span> Show All
                  </Button>
                )}
              </div>

              {loading ? (
                <div
                  className="p-5 text-center"
                  style={{
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    border: '2px solid rgba(59, 130, 246, 0.2)',
                    margin: '1rem',
                    borderRadius: '8px'
                  }}
                >
                  <div className="spinner-border" style={{ color: '#3b82f6' }} role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="mt-3 mb-0 fw-semibold" style={{ color: '#1e40af' }}>Loading reports...</p>
                </div>
              ) : unifiedRows.length === 0 ? (
                <div
                  className="p-5 text-center"
                  style={{
                    backgroundColor: 'rgba(245, 158, 11, 0.1)',
                    border: '2px dashed rgba(245, 158, 11, 0.3)',
                    margin: '1rem',
                    borderRadius: '8px'
                  }}
                >
                  <span style={{ fontSize: '3rem' }}>📭</span>
                  <p className="mt-3 mb-1 fw-semibold" style={{ color: '#92400e' }}>
                    No {filter !== 'all' ? filter : ''} reports found
                  </p>
                  <p className="mb-0 small" style={{ color: '#78350f' }}>
                    {filter !== 'all' ? 'Try adjusting your filter' : 'Complete requests to generate reports'}
                  </p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead>
                      <tr
                        style={{
                          background: 'linear-gradient(135deg, #f59e0b 0%, #fb923c 100%)',
                          color: 'white'
                        }}
                      >
                        <th className="px-4 py-3 fw-semibold small" style={{ color: 'white' }}>📋 Request ID</th>
                        <th className="py-3 fw-semibold small" style={{ color: 'white' }}>👤 Requester</th>
                        <th className="py-3 fw-semibold small" style={{ color: 'white' }}>🏷️ Type</th>
                        <th className="py-3 fw-semibold small" style={{ color: 'white' }}>📅 Date</th>
                        <th className="py-3 fw-semibold small" style={{ color: 'white' }}>✓ Status</th>
                        <th className="py-3 text-end pe-4 fw-semibold small" style={{ color: 'white' }}>⚙️ Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {unifiedRows.map((r, index) => (
                        <tr
                          key={r.id}
                          className="align-middle"
                          style={{
                            backgroundColor: index % 2 === 0 ? 'rgba(245, 158, 11, 0.05)' : 'white',
                            transition: 'all 0.2s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = 'rgba(245, 158, 11, 0.15)';
                            e.currentTarget.style.transform = 'scale(1.01)';
                            e.currentTarget.style.boxShadow = '0 4px 8px rgba(245, 158, 11, 0.15)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = index % 2 === 0 ? 'rgba(245, 158, 11, 0.05)' : 'white';
                            e.currentTarget.style.transform = 'scale(1)';
                            e.currentTarget.style.boxShadow = 'none';
                          }}
                        >
                          <td className="px-4 py-3">
                            <span className="fw-bold" style={{ color: '#92400e' }}>#{r.trackingId}</span>
                          </td>
                          <td className="py-3">
                            <span className="fw-semibold small" style={{ color: '#78350f' }}>{r.requesterName}</span>
                          </td>
                          <td className="py-3">
                            <span className="small fw-semibold" style={{ color: '#92400e' }}>{r.type}</span>
                          </td>
                          <td className="py-3">
                            <span className="small" style={{ color: '#78350f' }}>
                              {r.date ? fmt(r.date) : '—'}
                            </span>
                          </td>
                          <td className="py-3">
                            <Badge
                              className="rounded-pill"
                              style={{
                                backgroundColor: r.kind === 'draft' ? '#f59e0b'
                                  : r.kind === 'submitted' ? '#10b981'
                                    : '#6b7280',
                                fontSize: '0.75rem',
                                padding: '0.4rem 0.8rem'
                              }}
                            >
                              {r.kind === 'draft' && '📝 '}
                              {r.kind === 'submitted' && '✅ '}
                              {r.kind === 'none' && '⏳ '}
                              {r.status}
                            </Badge>
                          </td>
                          <td className="py-3 text-end pe-4">
                            <div className="d-flex justify-content-end gap-2">
                              {r.kind === 'draft' && (
                                <>
                                  <Button
                                    size="sm"
                                    onClick={() => navigate(`/social-worker/requests/${r.id}/report`)}
                                    style={{
                                      backgroundColor: 'rgba(59, 130, 246, 0.1)',
                                      color: '#3b82f6',
                                      border: '1px solid rgba(59, 130, 246, 0.3)',
                                      fontWeight: '600',
                                      fontSize: '0.8rem'
                                    }}
                                  >
                                    ✏️ Edit
                                  </Button>
                                  <Button
                                    size="sm"
                                    disabled={submittingId === r.id}
                                    onClick={() => void handleSubmitDraft(r.id)}
                                    style={{
                                      background: 'linear-gradient(135deg, #10b981 0%, #22c55e 100%)',
                                      color: 'white',
                                      border: 'none',
                                      fontWeight: '600',
                                      fontSize: '0.8rem'
                                    }}
                                  >
                                    {submittingId === r.id ? '⏳' : '✉️ Submit'}
                                  </Button>
                                  <Button
                                    size="sm"
                                    disabled={deletingId === r.id}
                                    onClick={() => void handleDeleteDraft(r.id)}
                                    style={{
                                      backgroundColor: 'rgba(239, 68, 68, 0.1)',
                                      color: '#dc2626',
                                      border: '1px solid rgba(239, 68, 68, 0.3)',
                                      fontWeight: '600',
                                      fontSize: '0.8rem'
                                    }}
                                  >
                                    {deletingId === r.id ? '⏳' : '🗑️ Delete'}
                                  </Button>
                                </>
                              )}
                              {r.kind === 'submitted' && (
                                <Button
                                  size="sm"
                                  onClick={() => navigate(`/social-worker/requests/${r.id}/report`)}
                                  style={{
                                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                                    color: '#3b82f6',
                                    border: '1px solid rgba(59, 130, 246, 0.3)',
                                    fontWeight: '600',
                                    fontSize: '0.8rem'
                                  }}
                                >
                                  👁️ View Report
                                </Button>
                              )}
                              {r.kind === 'none' && (
                                <Button
                                  size="sm"
                                  onClick={() => navigate(`/social-worker/requests/${r.id}/report`)}
                                  style={{
                                    background: 'linear-gradient(135deg, #f59e0b 0%, #fb923c 100%)',
                                    color: 'white',
                                    border: 'none',
                                    fontWeight: '600',
                                    fontSize: '0.8rem'
                                  }}
                                >
                                  ➕ Create Report
                                </Button>
                              )}
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
      </Row >
    </Container >
  )
}
