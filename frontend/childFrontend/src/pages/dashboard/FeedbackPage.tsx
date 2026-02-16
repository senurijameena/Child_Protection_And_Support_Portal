import { useEffect, useState } from 'react'
import { Alert, Badge, Button, Card, Col, Form, Row, Spinner } from 'react-bootstrap'
import { useAuth } from '../../hooks/useAuth'
import { getMyFeedback, submitFeedback, type FeedbackType } from '../../services/feedbackApi'
import type { FeedbackResponseDTO } from '../../types/admin'

type FeedbackTopic = 'SYSTEM' | 'HELP_REQUEST' | 'POLICE_STATION' | 'SOCIAL_WORKER'

const topicToPayloadType: Record<FeedbackTopic, FeedbackType> = {
  SYSTEM: 'SYSTEM',
  HELP_REQUEST: 'HELP_REQUEST',
  POLICE_STATION: 'SERVICE',
  SOCIAL_WORKER: 'SERVICE',
}

const topicHelpText: Record<FeedbackTopic, string> = {
  SYSTEM: 'Issues with the portal, speed, login, or new features to suggest.',
  HELP_REQUEST: 'Feedback tied to a specific case/help request (include an ID if you have it).',
  POLICE_STATION: 'Share your experience with a police station or officer involved in your case.',
  SOCIAL_WORKER: 'Share feedback about your assigned social worker or their support.',
}

export function FeedbackPage() {
  const { user } = useAuth()

  const [topic, setTopic] = useState<FeedbackTopic>('SYSTEM')
  const [message, setMessage] = useState('')
  const [rating, setRating] = useState(5)
  const [caseId, setCaseId] = useState('')
  const [helpRequestId, setHelpRequestId] = useState('')
  const [anonymous, setAnonymous] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [recent, setRecent] = useState<FeedbackResponseDTO[]>([])
  const [loadingHistory, setLoadingHistory] = useState(false)

  useEffect(() => {
    const uid = user?.userId
    if (!uid) return
    setLoadingHistory(true)
    getMyFeedback(uid)
      .then((list) => setRecent(Array.isArray(list) ? list.slice(0, 5) : []))
      .catch(() => setRecent([]))
      .finally(() => setLoadingHistory(false))
  }, [user?.userId])

  const handleSubmit = async () => {
    setSubmitting(true)
    setError(null)
    setSuccessMsg(null)
    try {
      await submitFeedback({
        type: topicToPayloadType[topic],
        message: message.trim(),
        rating,
        caseId: topic === 'HELP_REQUEST' ? caseId.trim() || undefined : undefined,
        helpRequestId: topic === 'HELP_REQUEST' ? helpRequestId.trim() || undefined : undefined,
        category:
          topic === 'POLICE_STATION'
            ? 'POLICE_STATION'
            : topic === 'SOCIAL_WORKER'
              ? 'SOCIAL_WORKER'
              : undefined,
        anonymous,
      })
      setSuccessMsg('Feedback sent. Thank you for helping us improve!')
      setMessage('')
      setCaseId('')
      setHelpRequestId('')
      setRating(5)
      setAnonymous(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit feedback')
    } finally {
      setSubmitting(false)
    }
  }

  const ratingOptions = [1, 2, 3, 4, 5]

  return (
    <div className="d-flex flex-column gap-4">
      <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
        <div>
          <h2 className="h4 mb-1">Share Feedback</h2>
          <div className="text-muted small">Tell us how we can improve your experience.</div>
        </div>
        <Badge bg="secondary" className="fw-normal">
          Signed in as {user?.fullName || user?.email || 'you'}
        </Badge>
      </div>

      {error && <Alert variant="danger" className="mb-0">{error}</Alert>}
      {successMsg && <Alert variant="success" className="mb-0">{successMsg}</Alert>}

      <Card className="shadow-sm border-0">
        <Card.Body>
          <Row className="g-3">
            <Col xs={12}>
              <Form.Label className="fw-semibold">What is this about?</Form.Label>
              <div className="d-flex flex-wrap gap-2">
                {(['SYSTEM', 'HELP_REQUEST', 'POLICE_STATION', 'SOCIAL_WORKER'] as FeedbackTopic[]).map((value) => (
                  <Button
                    key={value}
                    type="button"
                    variant={topic === value ? 'primary' : 'outline-secondary'}
                    className="rounded-pill"
                    onClick={() => setTopic(value)}
                  >
                    {value === 'SYSTEM' && 'System'}
                    {value === 'HELP_REQUEST' && 'Case / Request'}
                    {value === 'POLICE_STATION' && 'Police Station'}
                    {value === 'SOCIAL_WORKER' && 'Social Worker'}
                  </Button>
                ))}
              </div>
              <div className="text-muted small mt-2">{topicHelpText[topic]}</div>
            </Col>

            {topic === 'HELP_REQUEST' && (
              <>
                <Col md={6}>
                  <Form.Label className="small text-muted">Case ID (optional)</Form.Label>
                  <Form.Control
                    placeholder="CASE-123 or internal ID"
                    value={caseId}
                    onChange={(e) => setCaseId(e.target.value)}
                  />
                </Col>
                <Col md={6}>
                  <Form.Label className="small text-muted">Help Request ID (optional)</Form.Label>
                  <Form.Control
                    placeholder="HR-123 or tracking ID"
                    value={helpRequestId}
                    onChange={(e) => setHelpRequestId(e.target.value)}
                  />
                </Col>
              </>
            )}

            <Col xs={12} md={6}>
              <Form.Label className="fw-semibold">Rating</Form.Label>
              <div className="d-flex align-items-center gap-2 flex-wrap">
                {ratingOptions.map((r) => (
                  <Button
                    key={r}
                    type="button"
                    variant={rating === r ? 'warning' : 'outline-secondary'}
                    className="rounded-pill"
                    onClick={() => setRating(r)}
                  >
                    {r} ⭐
                  </Button>
                ))}
              </div>
            </Col>

            <Col xs={12}>
              <Form.Label className="fw-semibold">Your feedback</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                placeholder="Be as specific as possible. What worked? What needs to improve?"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </Col>

            <Col xs={12}>
              <Form.Check
                type="checkbox"
                id="feedback-anon"
                label="Send anonymously (your account will not be shared with admins handling this feedback)"
                checked={anonymous}
                onChange={(e) => setAnonymous(e.target.checked)}
              />
            </Col>

            <Col xs={12} className="d-flex justify-content-end">
              <Button
                variant="primary"
                className="px-4"
                disabled={submitting || !message.trim()}
                onClick={handleSubmit}
              >
                {submitting ? (
                  <>
                    <Spinner animation="border" size="sm" className="me-2" /> Sending...
                  </>
                ) : (
                  'Submit Feedback'
                )}
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <Card className="shadow-sm border-0">
        <Card.Header className="bg-white">
          <div className="d-flex align-items-center justify-content-between">
            <div>
              <div className="fw-semibold">Your recent feedback</div>
              <div className="text-muted small">Latest 5 submissions</div>
            </div>
            {loadingHistory && <Spinner animation="border" size="sm" />}
          </div>
        </Card.Header>
        <Card.Body>
          {recent.length === 0 ? (
            <div className="text-muted small">You haven&apos;t sent feedback yet.</div>
          ) : (
            <div className="d-flex flex-column gap-3">
              {recent.map((f) => (
                <div key={f.id} className="p-3 border rounded-3 bg-light">
                  <div className="d-flex justify-content-between align-items-start mb-1">
                    <div className="fw-semibold text-dark">
                      {f.type || 'Feedback'} {f.rating ? `· ${f.rating}⭐` : ''}
                    </div>
                    <Badge bg="light" text="dark" className="border">
                      {f.status || 'SUBMITTED'}
                    </Badge>
                  </div>
                  <div className="text-muted small mb-1">{f.category || topicHelpText.SYSTEM}</div>
                  <div className="small">{f.description || f.message}</div>
                </div>
              ))}
            </div>
          )}
        </Card.Body>
      </Card>
    </div>
  )
}
