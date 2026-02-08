import { Container, Row, Col, Card } from 'react-bootstrap'

const testimonials = [
  {
    quote: 'This portal made it easy for us to connect with support when we needed it most. The response was fast and caring.',
    author: 'Sarah M.',
    role: 'Parent / Caregiver',
    rating: 5,
  },
  {
    quote: 'As a social worker, the streamlined case management and follow-up tools have significantly improved our efficiency.',
    author: 'David K.',
    role: 'Social Worker',
    rating: 5,
  },
  {
    quote: 'Clear communication between police and social services helps us protect children faster. This portal bridges that gap.',
    author: 'Officer James L.',
    role: 'Police Station',
    rating: 5,
  },
]

export function TestimonialsSection() {
  return (
    <section className="py-5 my-5 bg-light">
      <Container>
        <div className="text-center mb-5">
          <h2 className="display-5 fw-bold text-dark mb-3">Success Stories & Trust</h2>
          <p className="lead text-secondary mx-auto" style={{ maxWidth: '600px' }}>
            Hear from those who use the portal to make a difference
          </p>
        </div>
        <Row className="g-4">
          {testimonials.map((t, idx) => (
            <Col key={idx} xs={12} md={4}>
              <Card className="h-100 border-0 shadow-sm rounded-4 p-4 bg-white">
                <div className="mb-2">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <span key={i} className="text-warning fs-5">★</span>
                  ))}
                </div>
                <Card.Text className="text-secondary mb-3 fst-italic">"{t.quote}"</Card.Text>
                <div>
                  <strong className="text-dark">{t.author}</strong>
                  <small className="d-block text-muted">{t.role}</small>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>
    </section>
  )
}
