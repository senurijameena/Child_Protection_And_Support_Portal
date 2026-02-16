import { Container, Row, Col, Card } from 'react-bootstrap'

export function AnonymousReportingPage() {
  return (
    <Container className="py-5">
      <div className="mb-5">
        <h1 className="h2 fw-bold text-dark mb-2">Anonymous Reporting</h1>
        <p className="text-muted mb-0 lead">
          Your identity stays protected. Here’s how it works.
        </p>
      </div>

      <Row className="g-4">
        <Col md={6}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body>
              <h5 className="text-primary mb-3">What details are hidden?</h5>
              <ul>
                <li>Your name</li>
                <li>Your contact information (email, phone)</li>
                <li>Your address</li>
                <li>Any identifying information</li>
              </ul>
              <p className="mb-0 small text-muted">
                You receive a tracking ID to follow your submission. Only you and the system know it’s yours.
              </p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body>
              <h5 className="text-primary mb-3">Who can see your identity?</h5>
              <p className="mb-2">
                <strong>Admin only</strong> – and only when necessary for safety, legal, or operational reasons.
              </p>
              <p className="mb-0 small text-muted">
                Police and social workers do not see your identity for anonymous submissions unless admin explicitly permits disclosure.
              </p>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12}>
          <Card className="border-0 shadow-sm border-start border-4 border-success">
            <Card.Body>
              <h5 className="mb-3">How safety & privacy are protected</h5>
              <ul className="mb-0">
                <li>All data is encrypted and stored securely</li>
                <li>Access to identity is logged for audit</li>
                <li>No retaliation policy – we protect reporters</li>
                <li>You can still receive updates via your tracking ID</li>
              </ul>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  )
}
