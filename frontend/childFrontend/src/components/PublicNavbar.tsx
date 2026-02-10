import { Link } from 'react-router-dom'
import { Navbar, Nav, Container, Button } from 'react-bootstrap'
import { useState } from 'react'

export function PublicNavbar() {
  const [expanded, setExpanded] = useState(false)

  return (
    <Navbar expanded={expanded} onToggle={setExpanded} expand="xl" className="bg-white shadow-sm py-3" fixed="top">
      <Container fluid className="px-3 px-lg-5">
        <Navbar.Brand as={Link} to="/" className="fw-bold text-primary fs-5 d-flex align-items-center gap-2">
          <img
            src="/images/logo.jpeg"
            alt="Child Protection Portal"
            className="d-inline-block logo-navbar"
            style={{ height: '32px', width: 'auto', maxHeight: '32px', objectFit: 'contain' }}
          />
          <span className="d-none d-lg-inline">Child Protection Portal</span>
          <span className="d-inline d-lg-none">CPP</span>
        </Navbar.Brand>

        {/* Auth buttons - visible on desktop */}
        <div className="d-none d-xl-flex gap-2 ms-auto">
          <Button
            as={Link}
            to="/login"
            variant="outline-primary"
            size="sm"
            className="px-3 py-1 rounded-pill fw-medium"
            style={{ textDecoration: 'none', whiteSpace: 'nowrap' }}
          >
            Login
          </Button>
          <Button
            as={Link}
            to="/signup"
            variant="primary"
            size="sm"
            className="px-3 py-1 rounded-pill fw-medium btn-primary-custom"
            style={{ textDecoration: 'none', whiteSpace: 'nowrap' }}
          >
            Sign Up
          </Button>
        </div>

        <Navbar.Toggle aria-controls="main-navbar" className="border-0" />
        <Navbar.Collapse id="main-navbar">
          <Nav className="mx-auto gap-1 gap-xl-2 w-100 w-xl-auto">
            <Nav.Link as={Link} to="/" onClick={() => setExpanded(false)} className="px-3 py-2">Home</Nav.Link>

            {/* Information submenu items - shown as regular links in mobile */}
            <div className="d-xl-none">
              <div className="px-3 py-2 text-secondary fw-semibold small">INFORMATION</div>
              <Nav.Link as={Link} to="/how-it-works" onClick={() => setExpanded(false)} className="px-4 py-2">How It Works</Nav.Link>
              <Nav.Link as={Link} to="/case-types" onClick={() => setExpanded(false)} className="px-4 py-2">Case Types Guide</Nav.Link>
              <Nav.Link as={Link} to="/report-vs-request" onClick={() => setExpanded(false)} className="px-4 py-2">Report vs Request</Nav.Link>
              <Nav.Link as={Link} to="/anonymous-reporting" onClick={() => setExpanded(false)} className="px-4 py-2">Anonymous Reporting</Nav.Link>
              <Nav.Link as={Link} to="/privacy-safety" onClick={() => setExpanded(false)} className="px-4 py-2">Privacy & Safety</Nav.Link>
              <Nav.Link as={Link} to="/awareness" onClick={() => setExpanded(false)} className="px-4 py-2">Awareness & Education</Nav.Link>
            </div>

            {/* Information dropdown - shown only on desktop */}
            <div className="d-none d-xl-block dropdown">
              <button className="btn btn-link text-secondary text-decoration-none fw-medium px-3 py-2 nav-link dropdown-toggle" type="button" data-bs-toggle="dropdown">
                Information
              </button>
              <ul className="dropdown-menu">
                <li><Link className="dropdown-item" to="/how-it-works">How It Works</Link></li>
                <li><Link className="dropdown-item" to="/case-types">Case Types Guide</Link></li>
                <li><Link className="dropdown-item" to="/report-vs-request">Report vs Request</Link></li>
                <li><Link className="dropdown-item" to="/anonymous-reporting">Anonymous Reporting</Link></li>
                <li><Link className="dropdown-item" to="/privacy-safety">Privacy & Safety</Link></li>
                <li><Link className="dropdown-item" to="/awareness">Awareness & Education</Link></li>
              </ul>
            </div>

            <Nav.Link as={Link} to="/support-locations" onClick={() => setExpanded(false)} className="px-3 py-2">Support Locations</Nav.Link>
            <Nav.Link as={Link} to="/contact-directory" onClick={() => setExpanded(false)} className="px-3 py-2">Contact Directory</Nav.Link>
            <Nav.Link as={Link} to="/faq" onClick={() => setExpanded(false)} className="px-3 py-2">FAQs</Nav.Link>
            <Nav.Link as={Link} to="/contact-us" onClick={() => setExpanded(false)} className="px-3 py-2">Contact Us</Nav.Link>

            {/* Auth buttons in mobile menu */}
            <div className="d-xl-none mt-3 px-3 d-flex flex-column gap-2">
              <Button
                as={Link}
                to="/login"
                variant="outline-primary"
                className="w-100 py-2 rounded-pill fw-medium"
                onClick={() => setExpanded(false)}
                style={{ textDecoration: 'none' }}
              >
                Login
              </Button>
              <Button
                as={Link}
                to="/signup"
                variant="primary"
                className="w-100 py-2 rounded-pill fw-medium btn-primary-custom"
                onClick={() => setExpanded(false)}
                style={{ textDecoration: 'none' }}
              >
                Sign Up
              </Button>
            </div>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  )
}
