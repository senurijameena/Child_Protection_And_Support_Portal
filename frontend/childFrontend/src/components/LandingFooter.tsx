import { Container, Row, Col } from 'react-bootstrap'

export function LandingFooter() {
  return (
    <footer id="contact" className="bg-dark text-white py-5 mt-5">
      <Container>
        <Row className="g-4">
          <Col xs={12} md={4}>
            <img
              src="/images/logo.jpeg"
              alt="Child Protection Portal"
              className="mb-2 d-block logo-footer"
              style={{ height: '28px', width: 'auto', maxHeight: '28px', objectFit: 'contain' }}
            />
            <h5 className="fw-bold mb-3">Child Protection Portal</h5>
            <p className="text-white-50 small">
              A safe, compassionate space for reporting concerns and requesting support for children and families.
            </p>
          </Col>
          <Col xs={12} md={4}>
            <h6 className="fw-semibold mb-3">Contact</h6>
            <ul className="list-unstyled text-white-50 small">
              <li className="mb-1">Email: support@childprotection.gov</li>
              <li className="mb-1">Phone: +1 (800) 123-4567</li>
            </ul>
          </Col>
          <Col xs={12} md={4}>
            <h6 className="fw-semibold mb-3">Emergency Helpline</h6>
            <a
              href="tel:911"
              className="d-inline-block btn btn-danger px-4 py-2 rounded-pill fw-semibold text-white text-decoration-none"
            >
              🚨 Call 911
            </a>
            <p className="text-white-50 small mt-2">24/7 Child Welfare Hotline: 1-800-CHILD</p>
          </Col>
        </Row>
        <Row className="mt-4 pt-4 border-top border-secondary">
          <Col xs={12} className="d-flex flex-wrap justify-content-center gap-4">
            <a href="#" className="text-white-50 text-decoration-none small" aria-label="Facebook">
              Facebook
            </a>
            <a href="#" className="text-white-50 text-decoration-none small" aria-label="Twitter">
              Twitter
            </a>
            <a href="#" className="text-white-50 text-decoration-none small" aria-label="LinkedIn">
              LinkedIn
            </a>
            <a href="#" className="text-white-50 text-decoration-none small" aria-label="Instagram">
              Instagram
            </a>
          </Col>
          <Col xs={12} className="text-center text-white-50 small mt-3">
            © {new Date().getFullYear()} Child Protection and Support Portal. All rights reserved.
          </Col>
        </Row>
      </Container>
    </footer>
  )
}
