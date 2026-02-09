import { Link } from 'react-router-dom'
import { Navbar, Nav, Container, Dropdown } from 'react-bootstrap'

export function PublicNavbar() {
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
          <Nav className="ms-auto gap-2 gap-lg-3 align-items-lg-center">
            <Nav.Link as={Link} to="/">Home</Nav.Link>
            <Dropdown>
              <Dropdown.Toggle variant="link" className="text-secondary text-decoration-none fw-medium px-2 py-2">
                Information
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item as={Link} to="/how-it-works">How It Works</Dropdown.Item>
                <Dropdown.Item as={Link} to="/case-types">Case Types Guide</Dropdown.Item>
                <Dropdown.Item as={Link} to="/report-vs-request">Report vs Request</Dropdown.Item>
                <Dropdown.Item as={Link} to="/anonymous-reporting">Anonymous Reporting</Dropdown.Item>
                <Dropdown.Item as={Link} to="/privacy-safety">Privacy & Safety</Dropdown.Item>
                <Dropdown.Item as={Link} to="/awareness">Awareness & Education</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
            <Nav.Link as={Link} to="/support-locations">Support Locations</Nav.Link>
            <Nav.Link as={Link} to="/contact-directory">Contact Directory</Nav.Link>
            <Nav.Link as={Link} to="/faq">FAQs</Nav.Link>
            <Nav.Link as={Link} to="/contact-us">Contact Us</Nav.Link>
            <Nav.Link as={Link} to="/login" className="text-primary fw-medium">Login</Nav.Link>
            <Link to="/signup" className="btn btn-primary px-4 py-2 rounded-pill fw-medium btn-primary-custom text-white text-decoration-none">
              Sign Up
            </Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  )
}
