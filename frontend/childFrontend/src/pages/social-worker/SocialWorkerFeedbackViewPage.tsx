import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Alert, Badge, Button, Card, Col, Modal, Row, Spinner } from 'react-bootstrap'
import { getHelpRequest, updateRequestStatus, getLatestFeedbackForHelpRequest, sendSocialWorkerFeedbackResponse } from '../../services/socialWorkerApi'
import type { HelpRequestDTO } from '../../types/dashboard'
import type { FeedbackResponseDTO } from '../../types/admin'
import { HELP_TYPE_LABELS } from '../../types/dashboard'

const DEFAULT_MESSAGE = `Thank you for your feedback. We are glad we could support you.
If you need help again, please contact us anytime.`

const formatDate = (value?: string) => {
  if (!value) return '—'
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? '—' : d.toLocaleDateString()
}

const renderStars = (rating?: number | string) => {
  const value = Number(rating)
  if (!value || Number.isNaN(value)) return '—'
  return '⭐'.repeat(Math.min(5, Math.max(1, value)))
}

const formatChoice = (value?: string) => {
  if (!value) return '—'
  return value
    .toLowerCase()
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

export function SocialWorkerFeedbackViewPage() {
  const { requestId } = useParams()
  const navigate = useNavigate()
  const [request, setRequest] = useState<HelpRequestDTO | null>(null)
  const [feedback, setFeedback] = useState<FeedbackResponseDTO | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [message, setMessage] = useState(DEFAULT_MESSAGE)
  const [sending, setSending] = useState(false)
  const [archiving, setArchiving] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    if (!requestId) return
    let cancelled = false
    setLoading(true)
    setError(null)
    Promise.all([
      getHelpRequest(requestId),
      getLatestFeedbackForHelpRequest(requestId).catch(() => null),
    ])
      .then(([req, fb]) => {
        if (cancelled) return
        setRequest(req ?? null)
        setFeedback(fb ?? null)
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load request')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [requestId])

  const canSendThanks = useMemo(() => {
    if (!feedback || !feedback.id) return false
    if (feedback.socialWorkerResponse && feedback.socialWorkerResponse.trim().length > 0) return false
    return true
  }, [feedback])

  const canArchive = useMemo(() => {
    return request?.status === 'CLOSED'
  }, [request?.status])

  const handleSend = async () => {
    if (!feedback?.id || !message.trim()) return
    setSending(true)
    setError(null)
    setSuccess(null)
    try {
      const updated = await sendSocialWorkerFeedbackResponse(feedback.id, message.trim())
      setFeedback(updated)
      setShowModal(false)
      setSuccess('Thank you message sent.')
      if (requestId) {
        const updatedRequest = await getHelpRequest(requestId)
        setRequest(updatedRequest)
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to send message')
    } finally {
      setSending(false)
    }
  }

  const handleArchive = async () => {
    if (!requestId) return
    setArchiving(true)
    setError(null)
    setSuccess(null)
    try {
      const updated = await updateRequestStatus(requestId, 'ARCHIVED')
      setRequest(updated)
      setSuccess('Request archived.')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to archive request')
    } finally {
      setArchiving(false)
    }
  }

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5">
        <Spinner animation="border" style={{ color: '#0f766e' }} />
      </div>
    )
  }

  if (!requestId || !request) {
    return (
      <Alert variant="warning">
        Request not found. <Button variant="link" onClick={() => navigate('/social-worker/feedback')}>Back to feedback</Button>
      </Alert>
    )
  }

  const requestLabel = request.trackingId || request.id?.slice(0, 8) || '—'
  const serviceType = request.helpType ? (HELP_TYPE_LABELS[request.helpType] ?? request.helpType) : 'Support request'

  return (
    <div className="d-flex flex-column gap-4">
      <Card className="border-0 shadow-sm">
        <Card.Body>
          <div className="d-flex justify-content-between flex-wrap gap-2">
            <div>
              <h4 className="mb-1">Social Worker Feedback View</h4>
              <div className="text-muted small">Review feedback and close out the request</div>
            </div>
            <Badge bg="light" text="dark" className="border">
              Status: {request.status || '—'}
            </Badge>
          </div>
          <Row className="g-3 mt-1">
            <Col md={4}>
              <div className="small text-muted">Request ID:</div>
              <div className="fw-600">{requestLabel}</div>
            </Col>
            <Col md={4}>
              <div className="small text-muted">Service Type:</div>
              <div className="fw-600">{serviceType}</div>
            </Col>
            <Col md={4}>
              <div className="small text-muted">Completion Date:</div>
              <div className="fw-600">{formatDate(request.completionDate)}</div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      <Card className="border-0 shadow-sm">
        <Card.Header className="bg-white">
          <h5 className="mb-0">Feedback Details</h5>
        </Card.Header>
        <Card.Body>
          {!feedback ? (
            <div className="text-muted small">No feedback submitted yet.</div>
          ) : (
            <>
              <Row className="g-3 mb-2">
                <Col md={3}>
                  <div className="small text-muted">⭐ Rating</div>
                  <div className="fw-600">{feedback.rating ? `${feedback.rating}/5` : '—'}</div>
                </Col>
                <Col md={3}>
                  <div className="small text-muted">Helpfulness</div>
                  <div className="fw-600">{formatChoice(feedback.helpfulness)}</div>
                </Col>
                <Col md={3}>
                  <div className="small text-muted">Expected Help</div>
                  <div className="fw-600">{formatChoice(feedback.expectedHelp)}</div>
                </Col>
                <Col md={3}>
                  <div className="small text-muted">Behavior</div>
                  <div className="fw-600">{formatChoice(feedback.behavior)}</div>
                </Col>
              </Row>
              <div className="mt-3">
                <div className="small text-muted mb-1">User Comment:</div>
                <div className="border rounded-3 p-3 bg-light">
                  <div className="small">"{feedback.message || 'No comment provided.'}"</div>
                </div>
              </div>
              <div className="mt-3 small text-muted">
                {feedback.socialWorkerResponse
                  ? `Final response sent: "${feedback.socialWorkerResponse}"`
                  : 'No social worker response sent yet.'}
              </div>
            </>
          )}
        </Card.Body>
      </Card>

      <Card className="border-0 shadow-sm">
        <Card.Body className="d-flex flex-wrap gap-2 justify-content-between align-items-center">
          <div className="small text-muted">
            <div className="fw-600 mb-1">Social Worker Response Message</div>
            Message allowed even if user is anonymous. Only text message. One final message only.
          </div>
          <div className="d-flex gap-2">
            <Button
              variant="primary"
              disabled={!canSendThanks}
              onClick={() => setShowModal(true)}
            >
              Send Thank You Message
            </Button>
            <Button
              variant="outline-secondary"
              disabled={!canArchive || archiving}
              onClick={handleArchive}
            >
              {archiving ? 'Archiving...' : 'Archive Request'}
            </Button>
          </div>
        </Card.Body>
      </Card>

      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Send Thank You Message</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="small text-muted mb-2">Message</div>
          <textarea
            className="form-control"
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          {feedback?.socialWorkerResponse && (
            <div className="small text-muted mt-2">A final response was already sent.</div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" disabled={sending || !message.trim() || !canSendThanks} onClick={handleSend}>
            {sending ? 'Sending...' : 'Send'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}
