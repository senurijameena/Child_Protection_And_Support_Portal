import { Link, useLocation } from 'react-router-dom'
import { Nav } from 'react-bootstrap'
import { useState } from 'react'

const SIDEBAR_WIDTH = 260

const infoLinks = [
  { to: '/how-it-works', label: 'How It Works' },
  { to: '/case-types', label: 'Case Types Guide' },
  { to: '/report-vs-request', label: 'Report vs Request' },
  { to: '/anonymous-reporting', label: 'Anonymous Reporting' },
  { to: '/privacy-safety', label: 'Privacy & Safety' },
  { to: '/awareness', label: 'Awareness & Education' },
]

export function PublicNavbar() {
  const [infoOpen, setInfoOpen] = useState(true)
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()

  const isActive = (path: string) => location.pathname === path
  const isInfoActive = infoLinks.some((l) => l.to === location.pathname)

  return (
    <>
      {/* Mobile overlay */}
      <div
        className="d-lg-none position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50"
        style={{ zIndex: 1040, display: mobileOpen ? 'block' : 'none' }}
        onClick={() => setMobileOpen(false)}
        aria-hidden="true"
      />

      {/* Mobile toggle button */}
      <button
        className="d-lg-none position-fixed top-0 start-0 m-3 btn btn-light border shadow-sm rounded-circle p-2"
        style={{ zIndex: 1050 }}
        onClick={() => setMobileOpen(true)}
        aria-label="Open menu"
      >
        <span className="navbar-toggler-icon" />
      </button>

      {/* Vertical sidebar */}
      <aside
        className="public-sidebar bg-white shadow-sm position-fixed top-0 start-0 h-100 overflow-y-auto"
        style={{
          width: SIDEBAR_WIDTH,
          zIndex: 1050,
          transform: mobileOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.3s ease',
        }}
      >
        <div className="d-lg-block" style={{ width: SIDEBAR_WIDTH, minHeight: '100vh', display: mobileOpen ? 'block' : 'none' }} />
      </aside>

      <aside
        className="public-sidebar bg-white shadow-sm position-fixed top-0 start-0 h-100 overflow-y-auto d-none d-lg-block"
        style={{ width: SIDEBAR_WIDTH, zIndex: 1030 }}
      >
        <div className="d-flex flex-column h-100" style={{ width: SIDEBAR_WIDTH }}>
          {/* Brand */}
          <div className="p-4 border-bottom">
            <Navbar.Brand as={Link} to="/" className="fw-bold text-primary fs-5 d-flex align-items-center gap-2 text-decoration-none">
              <img
                src="/images/logo.jpeg"
                alt="Child Protection Portal"
                className="d-inline-block logo-navbar"
                style={{ height: '32px', width: 'auto', maxHeight: '32px', objectFit: 'contain' }}
              />
              <span>Child Protection Portal</span>
            </Navbar.Brand>
          </div>

          {/* Nav links */}
          <Nav className="flex-column flex-grow-1 p-3 gap-1">
            <Nav.Link
              as={Link}
              to="/"
              onClick={() => setMobileOpen(false)}
              className={`public-sidebar-link rounded px-3 py-2 ${isActive('/') ? 'public-sidebar-active' : ''}`}
            >
              Home
            </Nav.Link>

            {/* Information section */}
            <div className="mt-2">
              <button
                className={`public-sidebar-link w-100 d-flex align-items-center justify-content-between rounded px-3 py-2 border-0 bg-transparent text-start ${isInfoActive ? 'public-sidebar-active' : 'text-secondary'}`}
                onClick={() => setInfoOpen(!infoOpen)}
              >
                <span className="fw-medium">Information</span>
                <span className="small">{infoOpen ? '▼' : '▶'}</span>
              </button>
              {infoOpen && (
                <div className="ms-3 mt-1">
                  {infoLinks.map(({ to, label }) => (
                    <Nav.Link
                      key={to}
                      as={Link}
                      to={to}
                      onClick={() => setMobileOpen(false)}
                      className={`public-sidebar-link rounded px-3 py-2 small ${isActive(to) ? 'public-sidebar-active' : ''}`}
                    >
                      {label}
                    </Nav.Link>
                  ))}
                </div>
              )}
            </div>

            <Nav.Link
              as={Link}
              to="/support-locations"
              onClick={() => setMobileOpen(false)}
              className={`public-sidebar-link rounded px-3 py-2 ${isActive('/support-locations') ? 'public-sidebar-active' : ''}`}
            >
              Support Locations
            </Nav.Link>
            <Nav.Link
              as={Link}
              to="/contact-directory"
              onClick={() => setMobileOpen(false)}
              className={`public-sidebar-link rounded px-3 py-2 ${isActive('/contact-directory') ? 'public-sidebar-active' : ''}`}
            >
              Contact Directory
            </Nav.Link>
            <Nav.Link
              as={Link}
              to="/faq"
              onClick={() => setMobileOpen(false)}
              className={`public-sidebar-link rounded px-3 py-2 ${isActive('/faq') ? 'public-sidebar-active' : ''}`}
            >
              FAQs
            </Nav.Link>
            <Nav.Link
              as={Link}
              to="/contact-us"
              onClick={() => setMobileOpen(false)}
              className={`public-sidebar-link rounded px-3 py-2 ${isActive('/contact-us') ? 'public-sidebar-active' : ''}`}
            >
              Contact Us
            </Nav.Link>
          </Nav>

          {/* Auth buttons */}
          <div className="p-3 border-top">
            <div className="d-flex flex-column gap-2">
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
          </div>
        </div>
      </aside>

      {/* Spacer for main content - only for desktop where sidebar is always visible */}
      <div className="d-none d-lg-block" style={{ width: SIDEBAR_WIDTH, flexShrink: 0 }} />
    </>
  )
}
