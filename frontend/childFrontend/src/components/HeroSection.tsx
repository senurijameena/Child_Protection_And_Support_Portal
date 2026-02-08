import { Link } from 'react-router-dom'
import { Container, Row, Col } from 'react-bootstrap'

export function HeroSection() {
  return (
    <section className="position-relative overflow-hidden pt-5 pb-5 mt-5" style={{ minHeight: '85vh' }}>
      <div className="bg-shapes" aria-hidden="true" />
      <Container className="position-relative" style={{ zIndex: 1 }}>
        <Row className="align-items-center">
          <Col lg={6} className="order-2 order-lg-1 animate-fade-in-up">
            <h1 className="display-4 fw-bold text-dark mb-3 lh-tight">
              Protecting Every Child,{' '}
              <span className="text-primary">Supporting Every Family</span>
            </h1>
            <p className="lead text-secondary mb-4 fs-5">
              A compassionate portal connecting families, social workers, police, and administrators
              to ensure child safety and wellbeing in our communities.
            </p>
            <div className="d-flex flex-wrap gap-3 mb-4">
              <Link
                to="/report-case"
                className="btn btn-primary px-5 py-3 rounded-pill fw-semibold btn-primary-custom fs-6"
              >
                Report a Case
              </Link>
              <Link
                to="/request-help"
                className="btn btn-outline-primary px-5 py-3 rounded-pill fw-semibold btn-secondary-custom fs-6 border-2"
              >
                Request Help
              </Link>
            </div>
          </Col>
          <Col lg={6} className="order-1 order-lg-2 mb-4 mb-lg-0">
            <div className="rounded-4 overflow-hidden shadow-lg" style={{ boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.1)' }}>
              <img
                src="/images/hero.png"
                alt="Children, caregivers, and support professionals in a safe, caring environment"
                className="img-fluid w-100 object-fit-cover"
                style={{ maxHeight: '500px', objectFit: 'cover' }}
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none'
                  const parent = (e.target as HTMLImageElement).parentElement
                  if (parent) {
                    const fallback = document.createElement('div')
                    fallback.className = 'bg-light rounded-4 d-flex align-items-center justify-content-center'
                    fallback.style.height = '400px'
                    fallback.innerHTML = `
                      <div class="text-center text-primary p-4">
                        <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" fill="currentColor" viewBox="0 0 16 16" class="mb-3">
                          <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                          <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/>
                        </svg>
                        <p class="mb-0 fw-medium">Hero image placeholder</p>
                        <small>Add hero.png to public/images/</small>
                      </div>
                    `
                    parent.appendChild(fallback)
                  }
                }}
              />
            </div>
          </Col>
        </Row>
      </Container>
    </section>
  )
}
