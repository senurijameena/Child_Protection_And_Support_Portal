import { useEffect, useState } from 'react'
import {
  Card,
  Table,
  Badge,
  Button,
  Form,
  Modal,
  Spinner,
} from 'react-bootstrap'
import {
  getAllFeedback,
  respondToFeedback,
  updateFeedbackStatus,
} from '../../services/adminApi'
import type { FeedbackResponseDTO } from '../../types/admin'

const STATUS_OPTIONS = ['SUBMITTED', 'RESPONDED']

export function FeedbackManagementPage() {
  const [feedback, setFeedback] = useState<FeedbackResponseDTO[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState('')
  const [showRespondModal, setShowRespondModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [selectedFeedback, setSelectedFeedback] = useState<FeedbackResponseDTO | null>(null)
  const [responseText, setResponseText] = useState('')
  const [submitLoading, setSubmitLoading] = useState(false)

  const loadFeedback = () => {
    setLoading(true)
    getAllFeedback()
      .then(setFeedback)
      .catch(() => setFeedback([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadFeedback()
  }, [])

  const filtered = feedback.filter((f) => {
    if (filterStatus && f.status !== filterStatus) return false
    return true
  })

  const openView = (f: FeedbackResponseDTO) => {
    setSelectedFeedback(f)
    setShowViewModal(true)
  }

  const openRespond = (f: FeedbackResponseDTO) => {
    setSelectedFeedback(f)
    setResponseText(f.adminResponse || '')
    setShowRespondModal(true)
  }

  const handleRespond = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedFeedback || !responseText.trim()) return
    setSubmitLoading(true)
    try {
      await respondToFeedback(selectedFeedback.id, responseText.trim())
      loadFeedback()
      setShowRespondModal(false)
      setSelectedFeedback(null)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to respond')
    } finally {
      setSubmitLoading(false)
    }
  }

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await updateFeedbackStatus(id, status)
      loadFeedback()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update')
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
        <h1 className="h3 fw-bold text-dark mb-1">Feedback Management</h1>
        <p className="text-muted mb-0">
          View and respond to user feedback. Notifications are sent on response.
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
                    {s}
                  </option>
                ))}
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
                <th>Type</th>
                <th>User</th>
                <th>Description</th>
                <th>Rating</th>
                <th>Status</th>
                <th>Admin Response</th>
                <th>Date</th>
                <th className="text-end">View / Respond</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-5 text-muted">
                    No feedback found
                  </td>
                </tr>
              ) : (
                filtered.map((f) => (
                  <tr key={f.id}>
                    <td>{f.type || '-'}</td>
                    <td>{f.anonymous ? 'Anonymous' : f.userName || '-'}</td>
                    <td className="text-muted" style={{ maxWidth: 200 }}>
                      {f.description?.slice(0, 50) || '-'}
                      {f.description && f.description.length > 50 ? '...' : ''}
                    </td>
                    <td>
                      {f.rating != null ? (
                        <Badge bg="warning">{f.rating}/5</Badge>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <Badge
                          bg={
                            f.status === 'SUBMITTED'
                              ? 'warning'
                              : f.status === 'RESPONDED'
                                ? 'success'
                                : 'secondary'
                          }
                        >
                          {f.status || '-'}
                        </Badge>
                        <Form.Select
                          size="sm"
                          style={{ width: 'auto', minWidth: '120px' }}
                          value={f.status || ''}
                          onChange={(e) =>
                            handleStatusChange(f.id, e.target.value)
                          }
                          onClick={(e) => e.stopPropagation()}
                        >
                          {STATUS_OPTIONS.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </Form.Select>
                      </div>
                    </td>
                    <td className="text-muted small" style={{ maxWidth: 150 }}>
                      {f.adminResponse
                        ? `${f.adminResponse.slice(0, 40)}...`
                        : '-'}
                    </td>
                    <td className="text-muted small">
                      {f.createdAt
                        ? new Date(f.createdAt).toLocaleString()
                        : '-'}
                    </td>
                    <td className="text-end">
                      <div className="d-flex gap-2 justify-content-end">
                        <Button
                          variant="outline-primary"
                          size="sm"
                          onClick={() => openView(f)}
                        >
                          View
                        </Button>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => openRespond(f)}
                        >
                          Respond
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      <Modal show={showViewModal} onHide={() => setShowViewModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Feedback Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedFeedback && (
            <div>
              <div className="mb-4 p-3 bg-light rounded">
                <strong className="d-block mb-2">User Feedback:</strong>
                <p className="mb-0" style={{ whiteSpace: 'pre-wrap' }}>
                  {selectedFeedback.description || '-'}
                </p>
              </div>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <strong>Type:</strong> {selectedFeedback.type || '-'}
                </div>
                <div className="col-md-6 mb-3">
                  <strong>User:</strong>{' '}
                  {selectedFeedback.anonymous
                    ? 'Anonymous'
                    : selectedFeedback.userName || '-'}
                </div>
                <div className="col-md-6 mb-3">
                  <strong>Category:</strong> {selectedFeedback.category || '-'}
                </div>
                <div className="col-md-6 mb-3">
                  <strong>Rating:</strong>{' '}
                  {selectedFeedback.rating != null ? (
                    <Badge bg="warning">{selectedFeedback.rating}/5</Badge>
                  ) : (
                    '-'
                  )}
                </div>
                <div className="col-md-6 mb-3">
                  <strong>Status:</strong>{' '}
                  <Badge
                    bg={
                      selectedFeedback.status === 'SUBMITTED'
                        ? 'warning'
                        : selectedFeedback.status === 'RESPONDED'
                          ? 'success'
                          : 'secondary'
                    }
                  >
                    {selectedFeedback.status || '-'}
                  </Badge>
                </div>
                <div className="col-md-6 mb-3">
                  <strong>Submitted Date:</strong>{' '}
                  {selectedFeedback.createdAt
                    ? new Date(selectedFeedback.createdAt).toLocaleString()
                    : '-'}
                </div>
              </div>
              {selectedFeedback.adminResponse && (
                <div className="mb-3 mt-3 p-3 bg-light rounded">
                  <strong className="d-block mb-2">Admin Response:</strong>
                  <p className="mb-0" style={{ whiteSpace: 'pre-wrap' }}>
                    {selectedFeedback.adminResponse}
                  </p>
                </div>
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowViewModal(false)}>
            Close
          </Button>
          {selectedFeedback && (
            <Button variant="primary" onClick={() => {
              setShowViewModal(false)
              openRespond(selectedFeedback)
            }}>
              Respond
            </Button>
          )}
        </Modal.Footer>
      </Modal>

      <Modal show={showRespondModal} onHide={() => setShowRespondModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Respond to Feedback</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleRespond}>
          <Modal.Body>
            {selectedFeedback && (
              <>
                <p className="text-muted small mb-2">
                  {selectedFeedback.description}
                </p>
                <Form.Group>
                  <Form.Label>Your Response</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={4}
                    value={responseText}
                    onChange={(e) => setResponseText(e.target.value)}
                    placeholder="Write your response..."
                    required
                  />
                </Form.Group>
              </>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowRespondModal(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              type="submit"
              disabled={submitLoading || !responseText.trim()}
            >
              {submitLoading ? 'Sending...' : 'Send Response'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  )
}
