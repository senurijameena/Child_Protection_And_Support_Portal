import { Container, Row, Col, Card } from 'react-bootstrap'
import { Link } from 'react-router-dom'

export function ReportVsRequestPage() {
  return (
    <Container className="py-5">
      <div className="mb-5">
        <h1 className="h2 fw-bold text-dark mb-2">What You Can Report / Request</h1>
        <p className="text-muted mb-0 lead">
          Understanding the difference between reporting a case and requesting help.
        </p>
      </div>

      <Row className="g-4">
        <Col md={6}>
          <Card className="border-0 shadow-sm h-100 border-top border-4 border-primary">
            <Card.Body className="p-4">
              <h4 className="text-primary mb-3">Report a Case</h4>
              <p className="mb-3">
                For <strong>harm, abuse, danger</strong> – situations where a child may be at risk. Examples: abuse, neglect, exploitation, trafficking, missing child.
              </p>
              <ul className="small mb-0">
                <li>Reviewed by admin and assigned to police</li>
                <li>Investigation may follow</li>
                <li>Use when you suspect harm or danger</li>
              </ul>
              <Link to="/login" state={{ from: { pathname: '/dashboard/report-case' } }} className="btn btn-primary mt-3">
                Report a Case
              </Link>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card className="border-0 shadow-sm h-100 border-top border-4" style={{ borderColor: '#10b981' }}>
            <Card.Body className="p-4">
              <h4 className="mb-3" style={{ color: '#10b981' }}>Request Help</h4>
              <p className="mb-3">
                For <strong>support, care, services</strong> – when a family needs assistance (food, shelter, counseling, education support, medical referral).
              </p>
              <ul className="small mb-0">
                <li>Reviewed by admin and assigned to social workers</li>
                <li>Service delivery and follow-up</li>
                <li>Use when you need support, not investigation</li>
              </ul>
              <Link to="/login" state={{ from: { pathname: '/dashboard/request-help' } }} className="btn mt-3" style={{ backgroundColor: '#10b981', color: '#fff' }}>
                Request Help
              </Link>
            </Card.Body>
          </Card>
        </Col>

        <Col xs={12}>
          <Card className="border-0 shadow-sm">
            <Card.Body>
              <h5 className="mb-3">Who can submit?</h5>
              <p className="mb-2">Both <strong>anonymous</strong> and <strong>registered users</strong> can submit. Anonymous reports protect your identity.</p>
              <h5 className="mb-3 mt-4">What evidence can be attached?</h5>
              <p className="mb-0">You can upload documents, photos, or other relevant files when reporting or requesting help. All submissions are kept confidential.</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  )
}
