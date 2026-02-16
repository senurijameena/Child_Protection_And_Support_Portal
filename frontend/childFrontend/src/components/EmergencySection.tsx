import { Container, Row, Col } from 'react-bootstrap'

export function EmergencySection() {
  return (
    <section className="py-5" style={{ backgroundColor: 'var(--cp-surface)', borderTop: '1px solid var(--cp-border)' }}>
      <Container>
        <Row className="align-items-center g-4">
          <Col md={8}>
            <h2 className="h4 fw-bold mb-2" style={{ color: 'var(--cp-text)' }}>Emergency & 24/7 Help</h2>
            <p className="text-muted mb-0 small">
              If a child is in immediate danger, call emergency services first. Use this portal for
              non-emergency reporting and follow-up. Region-based helplines are listed in our Contact Directory.
            </p>
          </Col>
          <Col md={4} className="text-md-end">
            <a
              href="tel:911"
              className="btn rounded px-4 py-3 fw-semibold text-white border-0 text-decoration-none"
              style={{ backgroundColor: 'var(--cp-danger)' }}
            >
              Call 911
            </a>
            <p className="text-muted small mt-2 mb-0">Child Welfare Hotline: 1-800-CHILD</p>
          </Col>
        </Row>
      </Container>
    </section>
  )
}
