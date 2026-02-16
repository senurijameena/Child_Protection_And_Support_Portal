import { Container, Row, Col, Card } from 'react-bootstrap'

const HOTLINES = [
  { name: 'Emergency', number: '911', desc: 'Immediate danger', available: '24/7' },
  { name: 'Child Welfare Hotline', number: '1-800-CHILD', desc: 'Reports of abuse, neglect', available: '24/7' },
  { name: 'National Child Abuse Hotline', number: '1-800-4-A-CHILD', desc: 'Support & reporting', available: '24/7' },
  { name: 'Crisis Helpline', number: '1-800-273-8255', desc: 'Mental health crisis', available: '24/7' },
]

const CONTACTS = [
  { type: 'Email', value: 'support@childprotection.gov', label: 'General inquiries' },
  { type: 'Email', value: 'reports@childprotection.gov', label: 'Case reports (non-urgent)' },
  { type: 'Phone', value: '+1 (800) 123-4567', label: 'Office line' },
  { type: 'Phone', value: '+1 (555) 000-1000', label: 'Admin office' },
]

const OFFICE_LOCATIONS = [
  { name: 'Central Office', address: '100 Protection Plaza, City Center', hours: 'Mon–Fri 8am–6pm' },
  { name: 'Regional Office North', address: '200 Care Ave, North District', hours: 'Mon–Fri 9am–5pm' },
]

export function ContactDirectoryPage() {
  return (
    <Container className="py-5">
      <div className="mb-4">
        <h1 className="h2 fw-bold text-dark mb-2">Contact & Help Directory</h1>
        <p className="text-muted mb-0">
          Hotline numbers, email addresses, office locations, and hours. One-click call on mobile.
        </p>
      </div>

      <Row className="g-4">
        <Col xs={12}>
          <h5 className="mb-3">Hotlines</h5>
          <Row className="g-3">
            {HOTLINES.map((h) => (
              <Col key={h.number} md={6} lg={3}>
                <Card className="border-0 shadow-sm h-100">
                  <Card.Body>
                    <h6>{h.name}</h6>
                    <p className="small text-muted mb-2">{h.desc}</p>
                    <a href={`tel:${h.number.replace(/-/g, '')}`} className="btn btn-primary btn-sm w-100">
                      📞 {h.number}
                    </a>
                    <p className="small text-muted mt-2 mb-0">{h.available}</p>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Col>

        <Col xs={12}>
          <h5 className="mb-3">Email & Phone</h5>
          <Row className="g-3">
            {CONTACTS.map((c) => (
              <Col key={c.value} md={6}>
                <Card className="border-0 shadow-sm">
                  <Card.Body className="d-flex justify-content-between align-items-center">
                    <div>
                      <h6 className="mb-0">{c.label}</h6>
                      <span className="text-muted small">{c.type}</span>
                    </div>
                    {c.type === 'Phone' ? (
                      <a href={`tel:${c.value}`} className="btn btn-outline-primary btn-sm">
                        {c.value}
                      </a>
                    ) : (
                      <a href={`mailto:${c.value}`} className="btn btn-outline-primary btn-sm">
                        {c.value}
                      </a>
                    )}
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Col>

        <Col xs={12}>
          <h5 className="mb-3">Office Locations & Hours</h5>
          <Row className="g-3">
            {OFFICE_LOCATIONS.map((o) => (
              <Col key={o.name} md={6}>
                <Card className="border-0 shadow-sm">
                  <Card.Body>
                    <h6>{o.name}</h6>
                    <p className="small mb-0">{o.address}</p>
                    <p className="small text-muted mb-0">Hours: {o.hours}</p>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Col>
      </Row>
    </Container>
  )
}
