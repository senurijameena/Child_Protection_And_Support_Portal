import { Container, Row, Col, Card } from 'react-bootstrap'

export function AwarenessEducationPage() {
  return (
    <Container className="py-5">
      <div className="mb-5">
        <h1 className="h2 fw-bold text-dark mb-2">Awareness & Education</h1>
        <p className="text-muted mb-0 lead">
          Child rights, signs of abuse and neglect, and how to help safely.
        </p>
      </div>

      <Row className="g-4">
        <Col xs={12}>
          <Card className="border-0 shadow-sm">
            <Card.Body>
              <h5 className="text-primary mb-3">Child Rights Overview</h5>
              <p className="mb-0">
                Every child has the right to safety, education, health care, and protection from harm. The portal supports these rights by connecting families with services and ensuring timely response to concerns.
              </p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body>
              <h5 className="text-primary mb-3">Signs of Abuse & Neglect</h5>
              <ul className="mb-0">
                <li>Unexplained injuries or bruises</li>
                <li>Withdrawal, fear, or aggression</li>
                <li>Poor hygiene, malnutrition</li>
                <li>Chronic absenteeism from school</li>
                <li>Inappropriate sexual behavior or knowledge</li>
                <li>Lack of supervision or basic care</li>
              </ul>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body>
              <h5 className="text-primary mb-3">How to Help a Child Safely</h5>
              <ul className="mb-0">
                <li>Report through official channels (this portal)</li>
                <li>Do not confronting the suspected abuser directly</li>
                <li>Offer support to the child if safe to do so</li>
                <li>Keep records of what you observe</li>
                <li>Stay calm and factual when reporting</li>
              </ul>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12}>
          <Card className="border-0 shadow-sm">
            <Card.Body>
              <h5 className="text-primary mb-3">Downloadable Guides</h5>
              <p className="text-muted mb-2">PDF guides and posters (placeholder – add actual files in production):</p>
              <div className="d-flex flex-wrap gap-2">
                <a href="#" className="btn btn-outline-secondary btn-sm" onClick={(e) => { e.preventDefault(); alert('Guide would download. Add PDF link in production.'); }}>
                  Child Protection Guide (PDF)
                </a>
                <a href="#" className="btn btn-outline-secondary btn-sm" onClick={(e) => { e.preventDefault(); alert('Poster would download. Add PDF link in production.'); }}>
                  Signs of Abuse Poster (PDF)
                </a>
                <a href="#" className="btn btn-outline-secondary btn-sm" onClick={(e) => { e.preventDefault(); alert('Handbook would download. Add PDF link in production.'); }}>
                  Reporter Handbook (PDF)
                </a>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  )
}
