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
      <Row className="mb-3">
        <Col xs={12} className="d-flex justify-content-between align-items-center flex-wrap gap-2">
          <div>
            <h1 className="h3 fw-700 mb-1">Reports</h1>
            <p className="text-muted mb-0">
              Only showing completed requests. Manage reports and drafts.
            </p>
          </div>
          <div className="d-flex gap-2">
            <Button
              variant={filter === 'submitted' ? 'primary' : 'outline-primary'}
              size="sm"
              onClick={() => toggleFilter('submitted')}
            >
              Submitted Reports
            </Button>
            <Button
              variant={filter === 'drafts' ? 'primary' : 'outline-primary'}
              size="sm"
              onClick={() => toggleFilter('drafts')}
            >
              Draft Reports
            </Button>
          </div>
        </Col>
      </Row>

      {error && (
        <Row className="mb-3">
          <Col xs={12}>
            <div className="alert alert-danger py-2">{error}</div>
          </Col>
        </Row>
      )}
      {message && (
        <Row className="mb-3">
          <Col xs={12}>
            <div className="alert alert-success py-2">{message}</div>
          </Col>
        </Row>
      )}

      <Row>
        <Col xs={12}>
          <Card className="sw-card border-0">
            <Card.Body className="p-0">
              <div className="p-3 border-bottom d-flex justify-content-between align-items-center">
                <Form.Control
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by ID, user, or type"
                  style={{ maxWidth: 320 }}
                />
                {filter !== 'all' && (
                  <Button variant="link" size="sm" onClick={() => setFilter('all')}>
                    Clear Filters (Show All)
                  </Button>
                )}
              </div>

              {loading ? (
                <div className="p-4 text-muted">Loading reports...</div>
              ) : unifiedRows.length === 0 ? (
                <div className="p-4 text-muted">No {filter !== 'all' ? filter : ''} reports found.</div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead>
                      <tr className="small text-muted">
                        <th className="px-4 py-3">Request ID</th>
                        <th className="py-3">Requester</th>
                        <th className="py-3">Type</th>
                        <th className="py-3">Date</th>
                        <th className="py-3">Status</th>
                        <th className="py-3 text-end pe-4">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {unifiedRows.map((r) => (
                        <tr key={r.id} className="align-middle">
                          <td className="px-4 py-3 fw-600">#{r.trackingId}</td>
                          <td className="py-3">{r.requesterName}</td>
                          <td className="py-3">{r.type}</td>
                          <td className="py-3">{r.date ? fmt(r.date) : '-'}</td>
                          <td className="py-3">
                            <Badge
                              bg={
                                r.kind === 'draft'
                                  ? 'warning'
                                  : r.kind === 'submitted'
                                    ? 'success'
                                    : 'secondary'
                              }
                            >
                              {r.status}
                            </Badge>
                          </td>
                          <td className="py-3 text-end pe-4">
                            <div className="d-flex justify-content-end gap-2">
                              {r.kind === 'draft' && (
                                <>
                                  <Button
                                    size="sm"
                                    variant="outline-primary"
                                    onClick={() => navigate(`/social-worker/requests/${r.id}/report`)}
                                  >
                                    Edit
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="primary"
                                    disabled={submittingId === r.id}
                                    onClick={() => void handleSubmitDraft(r.id)}
                                  >
                                    {submittingId === r.id ? '...' : 'Submit'}
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline-danger"
                                    disabled={deletingId === r.id}
                                    onClick={() => void handleDeleteDraft(r.id)}
                                  >
                                    {deletingId === r.id ? '...' : 'Delete'}
                                  </Button>
                                </>
                              )}
                              {r.kind === 'submitted' && (
                                <Button
                                  size="sm"
                                  variant="outline-primary"
                                  onClick={() => navigate(`/social-worker/requests/${r.id}/report`)}
                                >
                                  View Report
                                </Button>
                              )}
                              {r.kind === 'none' && (
                                <Button
                                  size="sm"
                                  variant="primary"
                                  onClick={() => navigate(`/social-worker/requests/${r.id}/report`)}
                                >
                                  Create Report
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
      </Row>
    </Container>
  )
}
