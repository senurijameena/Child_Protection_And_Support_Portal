import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
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
  getPoliceStationCases,
  acceptCase,
  declineCase,
} from '../../services/policeApi'
import type { CaseDTO } from '../../types/dashboard'
import { CASE_STATUS_LABELS, CASE_TYPE_LABELS } from '../../types/dashboard'

const STATUS_OPTIONS = ['ASSIGNED', 'INVESTIGATING', 'RESOLVED', 'CLOSED']

export function PoliceCasesPage() {
  const [cases, setCases] = useState<CaseDTO[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState('')
  const [filterType, setFilterType] = useState('')
  const [showDeclineModal, setShowDeclineModal] = useState(false)
  const [selectedCase, setSelectedCase] = useState<CaseDTO | null>(null)
  const [declineReason, setDeclineReason] = useState('')
  const [actionLoading, setActionLoading] = useState(false)

  const loadCases = () => {
    setLoading(true)
    getPoliceStationCases()
      .then(setCases)
      .catch(() => setCases([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadCases()
  }, [])

  const filtered = cases.filter((c) => {
    if (filterStatus && c.status !== filterStatus) return false
    if (filterType && c.caseType !== filterType) return false
    return true
  })

  const canAccept = (c: CaseDTO) => {
    return (
      (c.status === 'ASSIGNED' || c.status === 'UNDER_REVIEW') &&
      !c.assignedOfficerId
    )
  }

  const handleAccept = async (caseId: string) => {
    setActionLoading(true)
    try {
      await acceptCase(caseId)
      loadCases()
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Failed to accept')
    } finally {
      setActionLoading(false)
    }
  }

  const openDeclineModal = (c: CaseDTO) => {
    setSelectedCase(c)
    setShowDeclineModal(true)
    setDeclineReason('')
  }

  const handleDecline = async () => {
    if (!selectedCase || !declineReason.trim()) {
      alert('Reason is required')
      return
    }
    setActionLoading(true)
    try {
      await declineCase(selectedCase.id, declineReason.trim())
      loadCases()
      setShowDeclineModal(false)
      setSelectedCase(null)
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Failed to decline')
    } finally {
      setActionLoading(false)
    }
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
      <div className="mb-4">
        <h1 className="h3 fw-bold text-dark mb-1">Assigned Cases</h1>
        <p className="text-muted mb-0">
          Cases assigned to your station. Accept to start investigation or decline with reason.
        </p>
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
                <th>Location</th>
                <th>Status</th>
                <th>Priority</th>
                <th>Date</th>
                <th>Assigned To</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-5 text-muted">
                    No cases found
                  </td>
                </tr>
              ) : (
                filtered.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <Link
                        to={`/police/cases/${c.id}`}
                        className="text-primary text-decoration-none fw-medium"
                      >
                        {c.trackingId || c.id?.slice(0, 8)}
                      </Link>
                    </td>
                    <td>
                      {CASE_TYPE_LABELS[(c.caseType as keyof typeof CASE_TYPE_LABELS) || 'OTHER']}
                    </td>
                    <td>{c.location || '-'}</td>
                    <td>
                      <Badge
                        bg={
                          c.status === 'REPORTED' || c.status === 'UNDER_REVIEW'
                            ? 'warning'
                            : c.status === 'CLOSED' || c.status === 'RESOLVED'
                              ? 'success'
                              : 'primary'
                        }
                      >
                        {CASE_STATUS_LABELS[(c.status as keyof typeof CASE_STATUS_LABELS) || 'REPORTED']}
                      </Badge>
                    </td>
                    <td>
                      {c.emergency ? (
                        <Badge bg="danger">Emergency</Badge>
                      ) : (
                        <Badge bg="secondary">Normal</Badge>
                      )}
                    </td>
                    <td className="text-muted small">
                      {c.reportDate
                        ? new Date(c.reportDate).toLocaleString()
                        : '-'}
                    </td>
                    <td>
                      {c.assignedOfficerId ? (
                        <Badge bg="success">Officer</Badge>
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
                          <Dropdown.Item as={Link} to={`/police/cases/${c.id}`}>
                            View Details
                          </Dropdown.Item>
                          {canAccept(c) && (
                            <>
                              <Dropdown.Divider />
                              <Dropdown.Item
                                onClick={() => handleAccept(c.id)}
                                disabled={actionLoading}
                              >
                                Accept Case
                              </Dropdown.Item>
                              <Dropdown.Item
                                onClick={() => openDeclineModal(c)}
                                className="text-danger"
                              >
                                Decline
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

      <Modal show={showDeclineModal} onHide={() => setShowDeclineModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Decline Case</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="text-muted small mb-3">
            Provide a mandatory reason (e.g., capacity, jurisdiction). Admin will be notified.
          </p>
          <Form.Group>
            <Form.Label>Reason (required)</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={declineReason}
              onChange={(e) => setDeclineReason(e.target.value)}
              placeholder="Capacity, jurisdiction issue, or other reason..."
              required
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeclineModal(false)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleDecline}
            disabled={actionLoading || !declineReason.trim()}
          >
            {actionLoading ? 'Declining...' : 'Decline'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}
