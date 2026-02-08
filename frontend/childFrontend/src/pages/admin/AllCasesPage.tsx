import { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import {
  Card,
  Table,
  Badge,
  Button,
  Form,
  Modal,
  Spinner,
  Dropdown,
} from 'react-bootstrap'
import {
  getAllCasesWithDetails,
  getAllPoliceStations,
  getSocialWorkers,
  updateCaseStatus,
  assignCaseToStation,
  assignCaseToSocialWorker,
  getAvailableUsersForAssignment,
} from '../../services/adminApi'
import type { CaseDTO } from '../../types/dashboard'
import type { PoliceStationDTO, SocialWorkerDTO } from '../../types/admin'
import { CASE_STATUS_LABELS, CASE_TYPE_LABELS } from '../../types/dashboard'

const STATUS_OPTIONS = [
  'REPORTED',
  'UNDER_REVIEW',
  'ASSIGNED',
  'INVESTIGATING',
  'RESOLVED',
  'CLOSED',
  'REJECTED',
  'CANCELLED',
]

export function AllCasesPage() {
  const [searchParams] = useSearchParams()
  const [cases, setCases] = useState<CaseDTO[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState(searchParams.get('status') || '')
  const [filterType, setFilterType] = useState('')
  const [selectedCase, setSelectedCase] = useState<CaseDTO | null>(null)
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [assignTarget, setAssignTarget] = useState<'station' | 'worker'>('station')
  const [stations, setStations] = useState<PoliceStationDTO[]>([])
  const [workers, setWorkers] = useState<SocialWorkerDTO[]>([])
  const [suggestions, setSuggestions] = useState<{ policeOfficers?: unknown[]; socialWorkers?: unknown[] } | null>(null)
  const [assignStationId, setAssignStationId] = useState('')
  const [assignWorkerId, setAssignWorkerId] = useState('')
  const [assignLoading, setAssignLoading] = useState(false)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [actionLoading, setActionLoading] = useState(false)

  const loadCases = () => {
    setLoading(true)
    getAllCasesWithDetails()
      .then(setCases)
      .catch(() => setCases([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadCases()
  }, [])

  useEffect(() => {
    getAllPoliceStations().then(setStations).catch(() => setStations([]))
    getSocialWorkers().then(setWorkers).catch(() => setWorkers([]))
  }, [])

  const filteredCases = cases.filter((c) => {
    if (filterStatus && c.status !== filterStatus) return false
    if (filterType && c.caseType !== filterType) return false
    return true
  })

  const handleStatusChange = async (caseId: string, status: string) => {
    setActionLoading(true)
    try {
      await updateCaseStatus(caseId, status)
      loadCases()
      setSelectedCase(null)
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Failed to update')
    } finally {
      setActionLoading(false)
    }
  }

  const openAssignModal = (c: CaseDTO) => {
    setSelectedCase(c)
    setShowAssignModal(true)
    setAssignStationId('')
    setAssignWorkerId('')
    setAssignTarget('station')
    if (c.location) {
      getAvailableUsersForAssignment('PO', c.location, c.caseType)
        .then(setSuggestions)
        .catch(() => setSuggestions(null))
    } else {
      setSuggestions(null)
    }
  }

  const handleAssign = async () => {
    if (!selectedCase) return
    setAssignLoading(true)
    try {
      if (assignTarget === 'station' && assignStationId) {
        await assignCaseToStation(selectedCase.id, assignStationId)
      } else if (assignTarget === 'worker' && assignWorkerId) {
        await assignCaseToSocialWorker(selectedCase.id, assignWorkerId)
      }
      loadCases()
      setShowAssignModal(false)
      setSelectedCase(null)
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Failed to assign')
    } finally {
      setAssignLoading(false)
    }
  }

  const handleReject = async () => {
    if (!selectedCase) return
    setActionLoading(true)
    try {
      await updateCaseStatus(selectedCase.id, 'REJECTED')
      loadCases()
      setShowRejectModal(false)
      setSelectedCase(null)
      setRejectReason('')
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Failed to reject')
    } finally {
      setActionLoading(false)
    }
  }

  const openRejectModal = (c: CaseDTO) => {
    setSelectedCase(c)
    setShowRejectModal(true)
    setRejectReason('')
  }

  if (loading) {
    return (
      <div className="d-flex justify-content-center py-5">
        <Spinner animation="border" variant="primary" />
      </div>
    )
  }

  return (
    <div className="animate-fade-in-up">
      <div className="mb-4 d-flex flex-wrap align-items-center justify-content-between gap-3">
        <div>
          <h1 className="h3 fw-bold text-dark mb-1">All Cases</h1>
          <p className="text-muted mb-0">View and manage case submissions</p>
        </div>
      </div>

      <Card className="border-0 shadow-sm rounded-3 mb-4">
        <Card.Body>
          <div className="row g-3">
            <div className="col-md-4">
              <Form.Label className="small text-muted">Status</Form.Label>
              <Form.Select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="">All</option>
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {CASE_STATUS_LABELS[s as keyof typeof CASE_STATUS_LABELS] || s}
                  </option>
                ))}
              </Form.Select>
            </div>
            <div className="col-md-4">
              <Form.Label className="small text-muted">Case Type</Form.Label>
              <Form.Select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <option value="">All</option>
                <option value="MISSING_CHILD">Missing Child</option>
                <option value="CHILD_ABUSE">Child Abuse</option>
                <option value="CHILD_LABOR">Child Labor</option>
                <option value="CHILD_TRAFFICKING">Child Trafficking</option>
                <option value="OTHER">Other</option>
              </Form.Select>
            </div>
          </div>
        </Card.Body>
      </Card>

      <Card className="border-0 shadow-sm rounded-3">
        <Card.Body className="p-0">
          <Table hover responsive className="mb-0">
            <thead>
              <tr>
                <th>ID</th>
                <th>Type</th>
                <th>Reporter</th>
                <th>Location</th>
                <th>Status</th>
                <th>Date</th>
                <th>Assigned</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCases.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-5 text-muted">
                    No cases found
                  </td>
                </tr>
              ) : (
                filteredCases.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <code className="small">{c.trackingId || c.id?.slice(0, 8)}</code>
                    </td>
                    <td>
                      {CASE_TYPE_LABELS[(c.caseType as keyof typeof CASE_TYPE_LABELS) || 'OTHER']}
                    </td>
                    <td>
                      {c.anonymous ? (
                        <Badge bg="secondary">Anonymous</Badge>
                      ) : (
                        c.reporterName || '-'
                      )}
                    </td>
                    <td>{c.location || '-'}</td>
                    <td>
                      <Badge
                        bg={
                          c.status === 'REPORTED' || c.status === 'UNDER_REVIEW'
                            ? 'warning'
                            : c.status === 'CLOSED' || c.status === 'RESOLVED'
                              ? 'success'
                              : c.status === 'REJECTED'
                                ? 'danger'
                                : 'primary'
                        }
                      >
                        {CASE_STATUS_LABELS[(c.status as keyof typeof CASE_STATUS_LABELS) || 'REPORTED']}
                      </Badge>
                    </td>
                    <td className="text-muted small">
                      {c.reportDate
                        ? new Date(c.reportDate).toLocaleString()
                        : '-'}
                    </td>
                    <td>
                      {c.assignedStationId || c.assignedOfficerId || c.assignedWorkerId ? (
                        <Badge bg="success">Assigned</Badge>
                      ) : (
                        <Badge bg="secondary">Unassigned</Badge>
                      )}
                    </td>
                    <td className="text-end">
                      <Dropdown>
                        <Dropdown.Toggle
                          variant="outline-primary"
                          size="sm"
                          id={`actions-${c.id}`}
                        >
                          Actions
                        </Dropdown.Toggle>
                        <Dropdown.Menu align="end">
                          <Dropdown.Item as={Link} to={`/admin/cases/${c.id}`}>
                            View Details
                          </Dropdown.Item>
                          {(c.status === 'REPORTED' || c.status === 'UNDER_REVIEW') && (
                            <>
                              <Dropdown.Divider />
                              <Dropdown.Item onClick={() => openAssignModal(c)}>
                                Assign to Police / Social Worker
                              </Dropdown.Item>
                              <Dropdown.Item
                                onClick={() =>
                                  handleStatusChange(c.id, 'UNDER_REVIEW')
                                }
                              >
                                Accept for Review
                              </Dropdown.Item>
                              <Dropdown.Item
                                onClick={() => openRejectModal(c)}
                                className="text-danger"
                              >
                                Reject
                              </Dropdown.Item>
                            </>
                          )}
                          {(c.status === 'ASSIGNED' ||
                            c.status === 'INVESTIGATING') && (
                            <>
                              <Dropdown.Divider />
                              <Dropdown.Item onClick={() => openAssignModal(c)}>
                                Reassign
                              </Dropdown.Item>
                              <Dropdown.Item
                                onClick={() =>
                                  handleStatusChange(c.id, 'CLOSED')
                                }
                              >
                                Close Case
                              </Dropdown.Item>
                            </>
                          )}
                        </Dropdown.Menu>
                      </Dropdown>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      <Modal show={showAssignModal} onHide={() => setShowAssignModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Assign Case</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedCase && (
            <>
              <p className="text-muted small mb-3">
                Case: {selectedCase.trackingId || selectedCase.id}
              </p>
              {suggestions && (
                <div className="alert alert-info py-2 small">
                  AI suggestion: Consider workload and region for best match.
                </div>
              )}
              <Form.Group className="mb-3">
                <Form.Check
                  type="radio"
                  label="Assign to Police Station"
                  name="assignTarget"
                  checked={assignTarget === 'station'}
                  onChange={() => setAssignTarget('station')}
                />
                <Form.Check
                  type="radio"
                  label="Assign to Social Worker"
                  name="assignTarget"
                  checked={assignTarget === 'worker'}
                  onChange={() => setAssignTarget('worker')}
                />
              </Form.Group>
              {assignTarget === 'station' && (
                <Form.Group className="mb-3">
                  <Form.Label>Select Station</Form.Label>
                  <Form.Select
                    value={assignStationId}
                    onChange={(e) => setAssignStationId(e.target.value)}
                  >
                    <option value="">Choose...</option>
                    {stations.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.stationName} - {s.district}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              )}
              {assignTarget === 'worker' && (
                <Form.Group className="mb-3">
                  <Form.Label>Select Social Worker</Form.Label>
                  <Form.Select
                    value={assignWorkerId}
                    onChange={(e) => setAssignWorkerId(e.target.value)}
                  >
                    <option value="">Choose...</option>
                    {workers.map((w) => (
                      <option key={w.userId || w.id} value={w.userId || w.id}>
                        {w.fullName} - {w.organization || 'N/A'}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              )}
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAssignModal(false)}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleAssign}
            disabled={
              assignLoading ||
              (assignTarget === 'station' && !assignStationId) ||
              (assignTarget === 'worker' && !assignWorkerId)
            }
          >
            {assignLoading ? 'Assigning...' : 'Assign'}
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showRejectModal} onHide={() => setShowRejectModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Reject Case</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>Reason (optional)</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Provide a reason for rejection..."
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowRejectModal(false)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleReject}
            disabled={actionLoading}
          >
            {actionLoading ? 'Rejecting...' : 'Reject'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}
