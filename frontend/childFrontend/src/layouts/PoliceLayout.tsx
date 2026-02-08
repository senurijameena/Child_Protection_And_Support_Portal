import { useState } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { Navbar, Nav, Container, Dropdown, Offcanvas } from 'react-bootstrap'
import { useAuth } from '../hooks/useAuth'

const sidebarItems = [
  { path: '/police', label: 'Dashboard', icon: '📋' },
  { path: '/police/cases', label: 'Cases', icon: '📁' },
  { path: '/police/messages', label: 'Messages', icon: '💬' },
  { path: '/police/reports', label: 'Reports', icon: '📊' },
  { path: '/police/profile', label: 'Profile', icon: '👤' },
]

export function PoliceLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div className="min-vh-100 d-flex police-theme-bg">
      {/* Sidebar - desktop */}
      <aside
        className="d-none d-lg-flex flex-column border-end bg-white shadow-sm"
        style={{ width: 260, minHeight: '100vh' }}
      >
        <div className="p-4 border-bottom" style={{ backgroundColor: '#1e3a5f' }}>
          <Link to="/police" className="text-decoration-none d-flex align-items-center gap-2">
            <img
              src="/images/logo.jpeg"
              alt="Logo"
              style={{ height: 36, width: 'auto' }}
              className="rounded"
            />
            <span className="fw-bold text-white">Police Portal</span>
          </Link>
        </div>
        <nav className="flex-grow-1 py-3 overflow-auto bg-white">
          {sidebarItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/police'}
              className={({ isActive }) =>
                `d-flex align-items-center gap-2 px-4 py-3 text-dark text-decoration-none police-sidebar-link ${isActive ? 'police-sidebar-active' : ''}`
              }
            >
              <span className="fs-5">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="p-3 border-top bg-white">
          <div className="px-3 py-2 text-muted small">
            {user?.fullName || user?.email || 'Officer'}
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="btn btn-outline-secondary btn-sm w-100 rounded"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Mobile: offcanvas sidebar */}
      <Offcanvas
        show={sidebarOpen}
        onHide={() => setSidebarOpen(false)}
        placement="start"
        className="d-lg-none"
        style={{ width: 260 }}
      >
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Police Portal</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body className="p-0">
          {sidebarItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/police'}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `d-flex align-items-center gap-2 px-4 py-3 text-dark text-decoration-none ${isActive ? 'bg-primary text-white' : ''}`
              }
            >
              <span className="fs-5">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </Offcanvas.Body>
      </Offcanvas>

      {/* Main content */}
      <div className="flex-grow-1 d-flex flex-column min-vw-0">
        <Navbar expand="lg" className="bg-white shadow-sm py-2 border-bottom">
          <Container fluid className="px-3 px-lg-4">
            <Navbar.Toggle
              aria-controls="police-nav"
              onClick={() => setSidebarOpen(true)}
              className="d-lg-none"
            />
            <Navbar.Brand as={Link} to="/police" className="d-none d-lg-block ms-2 text-dark">
              Child Protection Portal
            </Navbar.Brand>
            <Navbar.Collapse id="police-nav" className="justify-content-end">
              <Nav>
                <Dropdown align="end">
                  <Dropdown.Toggle variant="light" className="border-0">
                    {user?.fullName || user?.email || 'Officer'}
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                    <Dropdown.Item onClick={handleLogout}>Logout</Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </Nav>
            </Navbar.Collapse>
          </Container>
        </Navbar>

        <main className="flex-grow-1 py-4 overflow-auto">
          <Container fluid className="px-3 px-lg-4">
            <Outlet />
          </Container>
        </main>
      </div>
    </div>
  )
}
