import { Link } from 'react-router-dom'
import { Container, Row, Col } from 'react-bootstrap'

export function HeroSection() {
  return (
    <section className="position-relative overflow-hidden min-vh-100 d-flex align-items-center">
      {/* Background Image with Zoom Animation */}
      <div className="position-absolute top-0 start-0 w-100 h-100" style={{ zIndex: 0 }}>
        <img
          src="/images/hero.png"
          alt="Hero Cover"
          className="w-100 h-100 animate-zoom-in"
          style={{ objectFit: 'cover', objectPosition: 'center' }}
          onError={(e) => {
            const target = e.target as HTMLImageElement
            target.style.display = 'none'
            if (target.parentElement) {
              target.parentElement.style.backgroundColor = '#f1f5f9'
              target.parentElement.innerHTML = `
                <div class="h-100 w-100 d-flex align-items-center justify-content-center bg-light text-secondary">
                  <div class="text-center">
                    <p class="mb-0">Background Image Not Found</p>
                    <small>Add hero.png to public/images/</small>
                  </div>
                </div>
              `
            }
          }}
        />
      </div>

      {/* Dark Overlay */}
      <div className="hero-overlay position-absolute top-0 start-0 w-100 h-100" style={{ zIndex: 1 }} />

      <Container className="position-relative" style={{ zIndex: 2 }}>
        <Row className="align-items-center">
          <Col lg={8} className="text-white">
            <h1 className="display-3 fw-bold mb-4 animate-slide-in-down" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>
              Protecting Every Child, <br />
              <span className="text-info">Supporting Every Family</span>
            </h1>
            <p className="lead mb-5 fs-4 animate-slide-in-left" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)', maxWidth: '650px', opacity: 0.9 }}>
              A compassionate portal connecting families, social workers, police, and administrators
              to ensure child safety and wellbeing in our communities.
            </p>
            <div className="d-flex flex-wrap gap-3 animate-fade-in-up">
              <Link
                to="/login"
                className="btn btn-primary px-5 py-3 rounded-pill fw-bold fs-5 shadow-lg scale-hover"
                style={{ transition: 'transform 0.3s' }}
              >
                Report a Case
              </Link>
              <Link
                to="/login"
                className="btn btn-light px-5 py-3 rounded-pill fw-bold fs-5 shadow-lg scale-hover"
                style={{ transition: 'transform 0.3s' }}
              >
                Request Help
              </Link>
            </div>
          </Col>
        </Row>
      </Container>
    </section>
  )
}
