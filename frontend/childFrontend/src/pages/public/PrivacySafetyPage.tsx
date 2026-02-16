import { Container, Row, Col, Card } from 'react-bootstrap'

export function PrivacySafetyPage() {
  return (
    <Container className="py-5">
      <div className="mb-5">
        <h1 className="h2 fw-bold text-dark mb-2">Privacy, Safety & Legal Assurance</h1>
        <p className="text-muted mb-0 lead">
          How we protect your data and ensure confidentiality.
        </p>
      </div>

      <Row className="g-4">
        <Col md={6}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body>
              <h5 className="text-primary mb-3">Data protection</h5>
              <p className="mb-0">
                Your submissions are stored securely. We follow data protection standards and only share information when legally required or essential for child safety.
              </p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body>
              <h5 className="text-primary mb-3">Confidential handling</h5>
              <p className="mb-0">
                All case and help request information is handled on a need-to-know basis. Staff are trained on confidentiality and privacy.
              </p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body>
              <h5 className="text-primary mb-3">Legal backing</h5>
              <p className="mb-0">
                The portal operates under child welfare laws and regulations. Reports may be shared with authorities when required for investigation or protection.
              </p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body>
              <h5 className="text-primary mb-3">No retaliation policy</h5>
              <p className="mb-0">
                Reporters are protected. We do not tolerate retaliation against anyone who reports in good faith. Concerns can be raised through our contact form.
              </p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  )
}
