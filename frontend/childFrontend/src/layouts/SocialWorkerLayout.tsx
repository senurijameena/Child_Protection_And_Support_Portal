import { useState } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { Navbar, Nav, Container, Dropdown, Offcanvas } from 'react-bootstrap'
import { useAuth } from '../hooks/useAuth'

const sidebarItems = [
  { path: '/social-worker', label: 'Dashboard', icon: '🏠' },
  { path: '/social-worker/requests', label: 'Requests', icon: '📋' },
  { path: '/social-worker/calendar', label: 'Calendar', icon: '📅' },
  { path: '/social-worker/messages', label: 'Messages', icon: '💬' },
  { path: '/social-worker/packages', label: 'Packages', icon: '📦' },
  { path: '/social-worker/library', label: 'Resource Library', icon: '📚' },
  { path: '/social-worker/transfers', label: 'Transfers', icon: '🔄' },
  { path: '/social-worker/reports', label: 'Reports', icon: '📊' },
  { path: '/social-worker/profile', label: 'Profile & Settings', icon: '👤' },
]

export function SocialWorkerLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div className="min-vh-100 d-flex sw-theme-bg">
      {/* Sidebar - desktop */}
      <aside
        className="d-none d-lg-flex flex-column border-end bg-white shadow-sm"
        style={{ width: 260, minHeight: '100vh' }}
      >
        <div className="p-4 border-bottom sw-sidebar-header">
          <Link to="/social-worker" className="text-decoration-none d-flex align-items-center gap-2">
            <img
              src="/images/logo.jpeg"
              alt="Logo"
              style={{ height: 36, width: 'auto' }}
              className="rounded"
            />
            <span className="fw-bold text-white">Social Worker</span>
          </Link>
        </div>
        <nav className="flex-grow-1 py-3 overflow-auto bg-white">
          {sidebarItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/social-worker'}
              className={({ isActive }) =>
                `d-flex align-items-center gap-2 px-4 py-3 text-dark text-decoration-none sw-sidebar-link ${isActive ? 'sw-sidebar-active' : ''}`
              }
            >
              <span className="fs-5">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="p-3 border-top bg-white">
          <div className="px-3 py-2 text-muted small">
            {user?.fullName || user?.email || 'Social Worker'}
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="btn btn-outline-secondary btn-sm w-100 rounded sw-logout-btn"
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
          <Offcanvas.Title>Social Worker Portal</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body className="p-0">
          {sidebarItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/social-worker'}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `d-flex align-items-center gap-2 px-4 py-3 text-dark text-decoration-none ${isActive ? 'sw-sidebar-active' : ''}`
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
              aria-controls="sw-nav"
              onClick={() => setSidebarOpen(true)}
              className="d-lg-none"
            />
            <Navbar.Brand as={Link} to="/social-worker" className="d-none d-lg-block ms-2 text-dark">
              Child Protection Portal
            </Navbar.Brand>
            <Navbar.Collapse id="sw-nav" className="justify-content-end">
              <Nav>
                <Dropdown align="end">
                  <Dropdown.Toggle variant="light" className="border-0">
                    {user?.fullName || user?.email || 'Social Worker'}
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
