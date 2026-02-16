import { useState } from 'react'
import { Container, Row, Col, Card, Form, Button } from 'react-bootstrap'

const API_BASE = import.meta.env.VITE_API_URL ?? (import.meta.env.PROD ? '/api' : 'http://localhost:8080/api')

export function ContactUsPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!name.trim() || !email.trim() || !message.trim()) {
      setError('Name, email, and message are required')
      return
    }
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/contact/public`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), subject: subject.trim(), message: message.trim() }),
      })
      const data = await res.json().catch(() => ({}))
      if (res.ok && data.success) {
        setSubmitted(true)
        setName('')
        setEmail('')
        setSubject('')
        setMessage('')
      } else {
        setError(data.message || 'Failed to submit')
      }
    } catch {
      setError('Unable to submit. Please try again or email us directly.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container className="py-5">
      <div className="mb-5">
        <h1 className="h2 fw-bold text-dark mb-2">Contact Us</h1>
        <p className="text-muted mb-0 lead">
          Non-case-related questions, inquiries, or feedback. We respond within 2–3 business days.
        </p>
      </div>

      <Row className="g-4">
        <Col lg={7}>
          <Card className="border-0 shadow-sm">
            <Card.Body className="p-4">
              {submitted ? (
                <div className="text-center py-4">
                  <div className="text-success mb-2">✓</div>
                  <h5>Thank you</h5>
                  <p className="text-muted mb-0">Your inquiry has been submitted. We will respond within 2–3 business days.</p>
                </div>
              ) : (
                <Form onSubmit={handleSubmit}>
                  {error && <div className="alert alert-danger small">{error}</div>}
                  <Form.Group className="mb-3">
                    <Form.Label>Name *</Form.Label>
                    <Form.Control value={name} onChange={(e) => setName(e.target.value)} required placeholder="Your name" />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Email *</Form.Label>
                    <Form.Control type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="you@example.com" />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Subject</Form.Label>
                    <Form.Control value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Brief subject" />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Message *</Form.Label>
                    <Form.Control as="textarea" rows={4} value={message} onChange={(e) => setMessage(e.target.value)} required placeholder="Your question or feedback..." />
                  </Form.Group>
                  <Button type="submit" className="btn-primary" disabled={loading}>
                    {loading ? 'Submitting...' : 'Submit'}
                  </Button>
                </Form>
              )}
            </Card.Body>
          </Card>
        </Col>
        <Col lg={5}>
          <Card className="border-0 shadow-sm">
            <Card.Body>
              <h5 className="mb-3">Office Contact</h5>
              <p className="small mb-2"><strong>Email:</strong> support@childprotection.gov</p>
              <p className="small mb-2"><strong>Phone:</strong> <a href="tel:+18001234567">+1 (800) 123-4567</a></p>
              <p className="small mb-0 text-muted">For urgent cases, use Report a Case or our hotlines.</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  )
}
