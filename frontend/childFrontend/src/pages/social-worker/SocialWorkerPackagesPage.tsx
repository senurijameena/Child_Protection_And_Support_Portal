import { Card, Container, Row, Col, Badge } from 'react-bootstrap'

export function SocialWorkerPackagesPage() {
  const packages = [
    { title: 'Basic Support', description: 'Essential assistance and guidance', status: 'Available' },
    { title: 'Enhanced Counseling', description: 'Advanced psychological support', status: 'Available' },
    { title: 'Emergency Response', description: '24/7 crisis intervention', status: 'Available' },
  ]

  return (
    <Container fluid className="py-4">
      <div className="mb-4">
        <h1 className="h3 fw-700 mb-1">Service Packages 📦</h1>
        <p className="text-muted">Available support services and programs</p>
      </div>
      <Row className="g-3">
        {packages.map((pkg, idx) => (
          <Col xs={12} sm={6} lg={4} key={idx}>
            <Card className="sw-card border-0 h-100">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <h6 className="fw-700 mb-0">{pkg.title}</h6>
                  <Badge bg="success" pill>{pkg.status}</Badge>
                </div>
                <p className="text-muted small m-0">{pkg.description}</p>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  )
}
