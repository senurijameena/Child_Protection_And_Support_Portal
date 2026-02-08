import { Container, Row, Col } from 'react-bootstrap'

export function AboutSection() {
  return (
    <section id="about" className="py-5 my-5">
      <Container>
        <Row className="align-items-center g-4">
          <Col lg={6}>
            <h2 className="display-5 fw-bold text-dark mb-3">About Our Portal</h2>
            <p className="lead text-secondary mb-3">
              The Child Protection and Support Portal is a unified platform designed to strengthen
              the safety net for children and families.
            </p>
            <p className="text-secondary mb-0">
              We bring together public users, administrators, police, and social workers to ensure
              timely reporting, coordination, and follow-up. Our mission is to make every child
              feel safe and supported.
            </p>
          </Col>
          <Col lg={6}>
            <div className="rounded-4 p-4" style={{ background: 'linear-gradient(135deg, #e0f2fe 0%, #d1fae5 100%)' }}>
              <div className="d-flex flex-wrap gap-3 justify-content-center">
                <div className="text-center px-4 py-3 bg-white rounded-3 shadow-sm">
                  <div className="fw-bold text-primary fs-4">500+</div>
                  <small className="text-secondary">Cases Resolved</small>
                </div>
                <div className="text-center px-4 py-3 bg-white rounded-3 shadow-sm">
                  <div className="fw-bold text-primary fs-4">50+</div>
                  <small className="text-secondary">Partner Agencies</small>
                </div>
                <div className="text-center px-4 py-3 bg-white rounded-3 shadow-sm">
                  <div className="fw-bold text-primary fs-4">24/7</div>
                  <small className="text-secondary">Support Available</small>
                </div>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </section>
  )
}
