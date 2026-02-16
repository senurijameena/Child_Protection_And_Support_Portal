import { Container, Row, Col, Card } from 'react-bootstrap'

const features = [
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="currentColor" viewBox="0 0 16 16" className="text-primary">
        <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4zm-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10c-2.29 0-3.516.68-4.168 1.332-.678.678-.83 1.418-.832 1.664h10z" />
      </svg>
    ),
    title: 'Public User',
    description: 'Report concerns, request help, and stay connected with support services. Access resources and track your requests securely.',
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="currentColor" viewBox="0 0 16 16" className="text-primary">
        <path d="M8 4.754a3.246 3.246 0 1 0 0 6.492 3.246 3.246 0 0 0 0-6.492zM5.754 8a2.246 2.246 0 1 1 4.492 0 2.246 2.246 0 0 1-4.492 0z" />
        <path d="M9.796 1.343c-.527-1.79-3.065-1.79-3.592 0l-.094.319a.873.873 0 0 1-1.255.52l-.292-.16c-1.64-.892-3.433.902-2.54 2.541l.159.292a.873.873 0 0 1-.52 1.255l-.319.094c-1.79.527-1.79 3.065 0 3.592l.319.094a.873.873 0 0 1 .52 1.255l-.16.292c-.892 1.64.901 3.434 2.541 2.54l.292-.159a.873.873 0 0 1 1.255.52l.094.319c.527 1.79 3.065 1.79 3.592 0l.094-.319a.873.873 0 0 1 1.255-.52l.292.16c1.64.893 3.434-.902 2.54-2.541l-.159-.292a.873.873 0 0 1 .52-1.255l.319-.094c1.79-.527 1.79-3.065 0-3.592l-.319-.094a.873.873 0 0 1-.52-1.255l.16-.292c.893-1.64-.902-3.433-2.541-2.54l-.292.159a.873.873 0 0 1-1.255-.52l-.094-.319z" />
      </svg>
    ),
    title: 'Admin',
    description: 'Manage users, oversee cases, coordinate responses, and ensure system integrity. Full dashboard with analytics and reports.',
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="currentColor" viewBox="0 0 16 16" className="text-primary">
        <path d="M8 1a2 2 0 0 1 2 2v4H6V3a2 2 0 0 1 2-2zm3 6V3a3 3 0 0 0-6 0v4a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z" />
      </svg>
    ),
    title: 'Police Station',
    description: 'Register your station to access case reports, collaborate with social workers, and take prompt action. Secure communication for investigations.',
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="currentColor" viewBox="0 0 16 16" className="text-primary">
        <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z" />
        <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z" />
      </svg>
    ),
    title: 'Social Worker',
    description: 'Assign cases, conduct follow-ups, document progress, and connect families with resources. Dedicated workflow tools.',
  },
]

export function FeaturesSection() {
  return (
    <section id="services" className="py-5 my-5 landing-features-section position-relative overflow-hidden">
      <Container>
        <div className="text-center mb-5">
          <div className="landing-section-pill mb-2 d-inline-block">Role-tailored Experience</div>
          <h2 className="display-5 fw-bold text-dark mb-3">Portal Features by Role</h2>
          <p className="lead text-secondary mx-auto" style={{ maxWidth: '600px' }}>
            Tailored tools for every stakeholder in the child protection ecosystem
          </p>
        </div>
        <Row className="g-4">
          {features.map((feature, idx) => (
            <Col key={idx} xs={12} md={6} lg={3}>
              <Card className="h-100 border-0 shadow-sm feature-card rounded-4 p-4 bg-white landing-feature-card">
                <div className="mb-3 landing-feature-icon-wrap">{feature.icon}</div>
                <Card.Title className="fw-semibold text-dark fs-5">{feature.title}</Card.Title>
                <Card.Text className="text-secondary small mb-0">{feature.description}</Card.Text>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>
    </section>
  )
}
