import { Container, Row, Col } from 'react-bootstrap'
import { Link } from 'react-router-dom'

const STEPS = [
  { num: 1, title: 'Report a case / Request help', desc: 'Submit via our secure portal. Anonymous or registered.', icon: '📝' },
  { num: 2, title: 'Admin review', desc: 'Your submission is reviewed and triaged by our team.', icon: '👁️' },
  { num: 3, title: 'Police / Social Worker assignment', desc: 'Cases go to police; help requests go to social workers.', icon: '👥' },
  { num: 4, title: 'Investigation or support', desc: 'Officers investigate; social workers deliver support services.', icon: '🔄' },
  { num: 5, title: 'Case resolution & follow-up', desc: 'Resolution, closure, and follow-up as needed.', icon: '✅' },
]

export function HowItWorksPage() {
  return (
    <Container className="py-5">
      <div className="mb-5">
        <h1 className="h2 fw-bold text-dark mb-2">How the System Works</h1>
        <p className="text-muted mb-0 lead">
          A simple step-by-step overview of what happens when you report or request help.
        </p>
      </div>

      <div className="position-relative">
        {STEPS.map((step, i) => (
          <Row key={step.num} className="align-items-center mb-4">
            <Col md={2} className="text-center mb-3 mb-md-0">
              <div
                className="rounded-circle d-inline-flex align-items-center justify-content-center mx-auto"
                style={{ width: 64, height: 64, backgroundColor: '#e0f2fe', fontSize: 28 }}
              >
                {step.icon}
              </div>
            </Col>
            <Col md={10}>
              <div className="d-flex align-items-start gap-2">
                <span className="badge rounded-pill px-3 py-2" style={{ backgroundColor: '#0ea5e9' }}>
                  Step {step.num}
                </span>
                <div>
                  <h5 className="mb-1">{step.title}</h5>
                  <p className="text-muted mb-0">{step.desc}</p>
                </div>
              </div>
            </Col>
            {i < STEPS.length - 1 && (
              <Col xs={12} className="d-flex justify-content-center my-2">
                <div style={{ width: 2, height: 30, backgroundColor: '#e5e7eb' }} />
              </Col>
            )}
          </Row>
        ))}
      </div>

      <div className="text-center mt-5">
        <Link to="/report-case" className="btn btn-primary px-4 py-2 rounded-pill me-2">
          Report a Case
        </Link>
        <Link to="/request-help" className="btn btn-outline-primary px-4 py-2 rounded-pill">
          Request Help
        </Link>
      </div>
    </Container>
  )
}
