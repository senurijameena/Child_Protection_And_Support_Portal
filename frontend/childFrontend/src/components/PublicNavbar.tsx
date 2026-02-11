import { Link, useLocation } from 'react-router-dom'
import { Navbar, Nav, Container, Offcanvas, Dropdown } from 'react-bootstrap'
import { useState } from 'react'

const infoLinks = [
  { to: '/how-it-works', label: 'How It Works' },
  { to: '/case-types', label: 'Case Types Guide' },
  { to: '/report-vs-request', label: 'Report vs Request' },
  { to: '/anonymous-reporting', label: 'Anonymous Reporting' },
  { to: '/privacy-safety', label: 'Privacy & Safety' },
  { to: '/awareness', label: 'Awareness & Education' },
]

export function PublicNavbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()

  const isActive = (path: string) => location.pathname === path
  const isInfoActive = infoLinks.some((l) => l.to === location.pathname)

  return (
    <>
      <Navbar expand="lg" className="bg-white shadow-sm py-2 sticky-top">
        <Container fluid className="px-3 px-lg-4">
          <Navbar.Brand as={Link} to="/" className="fw-bold text-primary d-flex align-items-center gap-2">
            <img
              src="/images/logo.jpeg"
              alt="Child Protection Portal"
              className="d-inline-block logo-navbar"
              style={{ height: '32px', width: 'auto', maxHeight: '32px', objectFit: 'contain' }}
            />
            <span className="d-none d-sm-inline">Child Protection Portal</span>
          </Navbar.Brand>

          {/* Desktop Navigation */}
          <div className="d-none d-lg-flex ms-auto gap-2 gap-lg-3 align-items-center">
            <Nav className="d-flex gap-2 gap-lg-3 align-items-center">
              <Nav.Link
                as={Link}
                to="/"
                className={`text-secondary fw-medium px-3 py-2 rounded ${isActive('/') ? 'active text-primary' : ''}`}
              >
                Home
              </Nav.Link>

              {/* Information Dropdown */}
              <Dropdown className="d-inline">
                <Dropdown.Toggle
                  variant="none"
                  id="info-dropdown"
                  className={`text-secondary fw-medium px-3 py-2 rounded border-0 bg-transparent ${
                    isInfoActive ? 'active text-primary' : ''
                  }`}
                >
                  Information
                </Dropdown.Toggle>
                <Dropdown.Menu className="shadow-sm">
                  {infoLinks.map((link) => (
                    <Dropdown.Item
                      key={link.to}
                      as={Link}
                      to={link.to}
                      className={isActive(link.to) ? 'active' : ''}
                    >
                      {link.label}
                    </Dropdown.Item>
                  ))}
                </Dropdown.Menu>
              </Dropdown>

              <Nav.Link
                as={Link}
                to="/support-locations"
                className={`text-secondary fw-medium px-3 py-2 rounded ${
                  isActive('/support-locations') ? 'active text-primary' : ''
                }`}
              >
                Support Locations
              </Nav.Link>

              <Nav.Link
                as={Link}
                to="/contact-directory"
                className={`text-secondary fw-medium px-3 py-2 rounded ${
                  isActive('/contact-directory') ? 'active text-primary' : ''
                }`}
              >
                Directory
              </Nav.Link>

              <Nav.Link
                as={Link}
                to="/faq"
                className={`text-secondary fw-medium px-3 py-2 rounded ${isActive('/faq') ? 'active text-primary' : ''}`}
              >
                FAQs
              </Nav.Link>

              <Nav.Link
                as={Link}
                to="/contact-us"
                className={`text-secondary fw-medium px-3 py-2 rounded ${
                  isActive('/contact-us') ? 'active text-primary' : ''
                }`}
              >
                Contact
              </Nav.Link>
            </Nav>

            <div className="d-flex gap-2">
              <Link
                to="/login"
                className="btn btn-outline-primary px-4 py-2 rounded-pill fw-medium"
                style={{ textDecoration: 'none' }}
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="btn btn-primary px-4 py-2 rounded-pill fw-medium btn-primary-custom text-white"
                style={{ textDecoration: 'none' }}
              >
                Sign Up
              </Link>
            </div>
          </div>

          {/* Mobile Hamburger Button */}
          <button
            className="d-lg-none btn btn-light border-0 ms-auto"
            onClick={() => setMobileOpen(true)}
            aria-label="Toggle navigation"
            style={{
              padding: '0.375rem 0.75rem',
              minWidth: '44px',
              minHeight: '44px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              fill="currentColor"
              viewBox="0 0 16 16"
              style={{ color: '#333' }}
            >
              <path
                fillRule="evenodd"
                d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5z"
              />
            </svg>
          </button>
        </Container>
      </Navbar>

      {/* Mobile menu offcanvas */}
      <Offcanvas
        show={mobileOpen}
        onHide={() => setMobileOpen(false)}
        placement="end"
        className="d-lg-none"
      >
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Menu</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body className="p-0">
          <Nav className="flex-column">
            <Nav.Link
              as={Link}
              to="/"
              onClick={() => setMobileOpen(false)}
              className={`px-4 py-3 border-bottom ${isActive('/') ? 'text-primary fw-semibold' : 'text-secondary'}`}
            >
              Home
            </Nav.Link>

            {/* Information section for mobile */}
            <div className="border-bottom">
              <div className="px-4 py-3 fw-medium text-secondary">Information</div>
              {infoLinks.map((link) => (
                <Nav.Link
                  key={link.to}
                  as={Link}
                  to={link.to}
                  onClick={() => setMobileOpen(false)}
                  className={`px-4 py-2 ps-5 ${isActive(link.to) ? 'text-primary fw-semibold' : 'text-secondary'}`}
                >
                  {link.label}
                </Nav.Link>
              ))}
            </div>

            <Nav.Link
              as={Link}
              to="/support-locations"
              onClick={() => setMobileOpen(false)}
              className={`px-4 py-3 border-bottom ${
                isActive('/support-locations') ? 'text-primary fw-semibold' : 'text-secondary'
              }`}
            >
              Support Locations
            </Nav.Link>

            <Nav.Link
              as={Link}
              to="/contact-directory"
              onClick={() => setMobileOpen(false)}
              className={`px-4 py-3 border-bottom ${
                isActive('/contact-directory') ? 'text-primary fw-semibold' : 'text-secondary'
              }`}
            >
              Contact Directory
            </Nav.Link>

            <Nav.Link
              as={Link}
              to="/faq"
              onClick={() => setMobileOpen(false)}
              className={`px-4 py-3 border-bottom ${isActive('/faq') ? 'text-primary fw-semibold' : 'text-secondary'}`}
            >
              FAQs
            </Nav.Link>

            <Nav.Link
              as={Link}
              to="/contact-us"
              onClick={() => setMobileOpen(false)}
              className={`px-4 py-3 border-bottom ${
                isActive('/contact-us') ? 'text-primary fw-semibold' : 'text-secondary'
              }`}
            >
              Contact Us
            </Nav.Link>
          </Nav>

          {/* Auth buttons for mobile */}
          <div className="p-4 d-flex flex-column gap-2">
            <Link
              to="/login"
              className="btn btn-outline-primary py-2 rounded-pill fw-medium text-center"
              onClick={() => setMobileOpen(false)}
              style={{ textDecoration: 'none' }}
            >
              Login
            </Link>
            <Link
              to="/signup"
              className="btn btn-primary py-2 rounded-pill fw-medium btn-primary-custom text-center text-white"
              onClick={() => setMobileOpen(false)}
              style={{ textDecoration: 'none' }}
            >
              Sign Up
            </Link>
          </div>
        </Offcanvas.Body>
      </Offcanvas>
    </>
  )
}
