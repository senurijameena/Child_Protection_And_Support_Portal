import { useState } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { Navbar, Container, Offcanvas } from 'react-bootstrap'
import { useAuth } from '../hooks/useAuth'
import SystemAnnouncementBanner from '../components/SystemAnnouncementBanner'

const sidebarItems = [
  { path: '/dashboard', label: 'Dashboard', icon: '🏠', end: true },
  { path: '/dashboard/report-case', label: 'Report Case', icon: '📝', end: false },
  { path: '/dashboard/request-help', label: 'Request Help', icon: '🙋', end: false },
  { path: '/dashboard/my-cases', label: 'My Cases', icon: '📁', end: false },
  { path: '/dashboard/my-requests', label: 'My Requests', icon: '📋', end: false },
  { path: '/dashboard/messages', label: 'Messages', icon: '💬', end: false },
  { path: '/dashboard/notifications', label: 'Notifications', icon: '🔔', end: false },
  { path: '/dashboard/service-offers', label: 'Service Offers', icon: '🎁', end: false },
  { path: '/dashboard/feedback', label: 'Feedback', icon: '🗣️', end: false },
  { path: '/dashboard/profile', label: 'Profile', icon: '👤', end: false },
];


export function PublicUserLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div className="min-vh-100 d-flex bg-light">
      {/* Sidebar - desktop */}
      <aside
        className="d-none d-lg-flex flex-column border-end shadow-sm"
        style={{
          width: 260,
          minHeight: '100vh',
          background: 'linear-gradient(180deg, #f0f4ff 0%, #f8fafc 40%, #ffffff 100%)',
        }}
      >
        <div className="p-4 border-bottom">
          <Link to="/dashboard" className="text-decoration-none d-flex align-items-center gap-2">
            <img
              src="/images/logo.jpeg"
              alt="Logo"
              style={{ height: 36, width: 'auto' }}
              className="rounded"
            />
            <span className="fw-bold text-dark">User Portal</span>
          </Link>
        </div>
        <nav className="flex-grow-1 py-3 overflow-auto">
          {sidebarItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              className={({ isActive }) =>
                `d-flex align-items-center gap-3 px-4 py-2 text-dark text-decoration-none ${
                  isActive ? 'bg-primary bg-opacity-10 border-end border-primary border-4 fw-semibold' : ''
                }`
              }
            >
              <span className="fs-5" style={{ minWidth: 24 }}>{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="p-3 border-top">
          <div className="px-3 py-2 text-muted small">
            {user?.fullName || user?.email || 'User'}
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="btn btn-outline-danger btn-sm w-100 rounded-pill"
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
          <Offcanvas.Title>User Portal</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body className="p-0" style={{ backgroundColor: '#f8fafc' }}>
          <nav className="d-flex flex-column">
            {sidebarItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.end}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `d-flex align-items-center gap-3 px-4 py-3 text-dark text-decoration-none ${
                    isActive ? 'bg-primary bg-opacity-10 border-start border-primary border-4 fw-semibold' : ''
                  }`
                }
              >
                <span className="fs-5" style={{ minWidth: 24 }}>{item.icon}</span>
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </Offcanvas.Body>
      </Offcanvas>

      {/* Main content */}
      <div className="flex-grow-1 d-flex flex-column min-vw-0">
        <Navbar expand="lg" className="bg-white shadow-sm py-2">
          <Container fluid className="px-3 px-lg-4">
            <Navbar.Toggle
              aria-controls="nav"
              onClick={() => setSidebarOpen(true)}
              className="d-lg-none border-0"
            />
            <Navbar.Brand className="d-flex align-items-center justify-content-between w-100 ms-2">
              <Link to="/dashboard" className="text-decoration-none text-dark fw-semibold">
                Child Protection Portal
              </Link>
              <div className="d-flex align-items-center gap-3">
                <Link
  to="/dashboard/notifications"
  className="position-relative d-inline-flex align-items-center justify-content-center rounded-circle border bg-white"
  style={{ width: 34, height: 34, borderColor: '#e5e7eb', color: '#0f172a' }}
  aria-label="View notifications"
>
  <span className="fs-6">🔔</span>
</Link>

                <span className="px-3 py-1 rounded-pill bg-light border small text-muted">
                  {user?.fullName || user?.email || 'User'}
                </span>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="btn btn-outline-danger btn-sm d-none d-md-inline-block"
                >
                  Logout
                </button>
              </div>
            </Navbar.Brand>
          </Container>
        </Navbar>

        <main className="flex-grow-1 py-4 overflow-auto">
          <Container fluid className="px-3 px-lg-4">
            <SystemAnnouncementBanner />
            <Outlet />
          </Container>
        </main>
      </div>
    </div>
  )
}

