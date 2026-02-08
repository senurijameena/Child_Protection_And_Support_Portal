import { Link } from 'react-router-dom'
import { Navbar, Nav, Container } from 'react-bootstrap'

export function LandingNavbar() {
  return (
    <Navbar expand="lg" className="bg-white shadow-sm py-3" fixed="top">
      <Container>
        <Navbar.Brand as={Link} to="/" className="fw-bold text-primary fs-4 d-flex align-items-center gap-2">
          <img
            src="/images/logo.jpeg"
            alt="Child Protection Portal"
            className="d-inline-block logo-navbar"
            style={{ height: '32px', width: 'auto', maxHeight: '32px', objectFit: 'contain' }}
          />
          Child Protection Portal
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="main-navbar" />
        <Navbar.Collapse id="main-navbar">
          <Nav className="ms-auto gap-2 gap-lg-4 align-items-lg-center">
            <Nav.Link as={Link} to="/" className="text-secondary fw-medium px-3 py-2 rounded transition-all ">
              Home
            </Nav.Link>
            <Nav.Link href="#about" className="text-secondary fw-medium px-3 py-2 rounded transition-all">
              About
            </Nav.Link>
            <Nav.Link href="#services" className="text-secondary fw-medium px-3 py-2 rounded transition-all">
              Services
            </Nav.Link>
            <Nav.Link href="#contact" className="text-secondary fw-medium px-3 py-2 rounded transition-all">
              Contact
            </Nav.Link>
            <Nav.Link as={Link} to="/login" className="text-primary fw-medium px-3 py-2 rounded">
              Login
            </Nav.Link>
            <Link
              to="/signup"
              className="btn btn-primary px-4 py-2 rounded-pill fw-medium btn-primary-custom text-white text-decoration-none"
            >
              Sign Up
            </Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  )
}
