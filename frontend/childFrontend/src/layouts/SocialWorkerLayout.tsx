import { useState } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { Offcanvas } from 'react-bootstrap'
import { useAuth } from '../hooks/useAuth'
import { SocialWorkerHeader } from '../components/social-worker/SocialWorkerHeader'
import SystemAnnouncementBanner from '../components/SystemAnnouncementBanner'

const sidebarItems = [
  { path: '/social-worker', label: 'Dashboard', icon: '🏠', end: true },
  { path: '/social-worker/requests', label: 'Assigned Requests', icon: '📋', end: false },
  { path: '/social-worker/transfers', label: 'Transfers', icon: '🔄', end: false },
  { path: '/social-worker/packages', label: 'Service Packages', icon: '🧩', end: false },
  { path: '/social-worker/library', label: 'Resource Management', icon: '📚', end: false },
  { path: '/social-worker/messages', label: 'Messages', icon: '💬', end: false },
  { path: '/social-worker/notifications', label: 'Notifications', icon: '🔔', end: false },
  { path: '/social-worker/collaboration', label: 'Collaboration', icon: '🤝', end: false },
  { path: '/social-worker/follow-ups', label: 'Follow-ups', icon: '⏰', end: false },
  { path: '/social-worker/reports', label: 'Reports', icon: '📊', end: false },
  { path: '/social-worker/analytics', label: 'Analytics', icon: '📈', end: false },
  { path: '/social-worker/profile', label: 'Profile', icon: '👤', end: false },
]

const SYSTEM_VERSION = '1.0.0'

export function SocialWorkerLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div className="sw-layout min-vh-100 d-flex sw-theme-bg">
      {/* Sidebar - desktop (collapsible) */}
      <aside
        className={`d-none d-lg-flex flex-column sw-sidebar border-end position-fixed overflow-hidden ${sidebarCollapsed ? 'sw-sidebar-collapsed' : ''
          }`}
        style={{
          width: sidebarCollapsed ? 72 : 260,
          minHeight: '100vh',
          transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          backgroundColor: '#fff',
        }}
      >
        <div className="sw-sidebar-header d-flex align-items-center p-3">
          <Link
            to="/social-worker"
            className="text-decoration-none d-flex align-items-center gap-2 flex-grow-1 min-w-0"
          >
            <div className="bg-white rounded-circle p-1 d-flex align-items-center justify-content-center" style={{ width: 36, height: 36 }}>
              <img
                src="/images/logo.jpeg"
                alt="Logo"
                style={{ height: 28, width: 28, objectFit: 'contain' }}
              />
            </div>
            {!sidebarCollapsed && (
              <span className="fw-bold text-white text-truncate" style={{ fontSize: '0.9rem', letterSpacing: '0.5px' }}>
                CHILD SUPPORT
              </span>
            )}
          </Link>
          <button
            type="button"
            className="btn btn-link p-0 text-white opacity-75 ms-1 d-flex align-items-center justify-content-center border-0"
            style={{ width: 28, height: 28 }}
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <span className="fs-6">{sidebarCollapsed ? '→' : '←'}</span>
          </button>
        </div>

        <nav className="flex-grow-1 py-4 overflow-auto sw-sidebar-nav">
          {sidebarItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end ?? item.path === '/social-worker'}
              onClick={() => setMobileSidebarOpen(false)}
              className={({ isActive: active }) =>
                `sw-sidebar-link d-flex align-items-center gap-3 text-decoration-none ${active ? 'sw-sidebar-active' : ''
                }`
              }
              title={sidebarCollapsed ? item.label : undefined}
            >
              <span className="sw-sidebar-icon fs-5" style={{ width: 24 }}>
                {item.icon}
              </span>
              {!sidebarCollapsed && <span className="small fw-medium">{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-top mt-auto bg-light bg-opacity-50">
          {!sidebarCollapsed ? (
            <div className="d-flex flex-column gap-3">
              <div className="px-2 py-1 text-muted small fw-bold text-uppercase" style={{ fontSize: '0.65rem' }}>
                Signed in as
              </div>
              <div className="px-2 mb-2">
                <div className="text-dark small fw-bold text-truncate">
                  {user?.fullName || 'Social Worker'}
                </div>
                <div className="text-muted" style={{ fontSize: '0.7rem' }}>
                  Professional ID: {user?.userId?.slice(0, 8) || 'N/A'}
                </div>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="btn btn-outline-danger btn-sm w-100 rounded-2 sw-logout-btn py-2 fw-semibold"
                style={{ fontSize: '0.8rem' }}
              >
                Sign Out
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleLogout}
              className="btn btn-link p-0 text-danger w-100 d-flex justify-content-center"
              title="Sign Out"
            >
              🚪
            </button>
          )}
        </div>
      </aside>

      {/* Spacer for fixed sidebar */}
      <div
        className="d-none d-lg-block flex-shrink-0"
        style={{ width: sidebarCollapsed ? 72 : 260, transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)' }}
      />

      {/* Mobile: offcanvas sidebar */}
      <Offcanvas
        show={mobileSidebarOpen}
        onHide={() => setMobileSidebarOpen(false)}
        placement="start"
        className="d-lg-none border-0"
        style={{ width: 280 }}
      >
        <Offcanvas.Header closeButton className="bg-light">
          <Offcanvas.Title className="fw-bold text-teal">Social Worker Portal</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body className="p-0">
          <div className="py-3">
            {sidebarItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.end ?? item.path === '/social-worker'}
                onClick={() => setMobileSidebarOpen(false)}
                className={({ isActive: active }) =>
                  `d-flex align-items-center gap-3 px-4 py-3 text-dark text-decoration-none ${active ? 'sw-sidebar-active mx-2' : ''
                  }`
                }
              >
                <span className="fs-5">{item.icon}</span>
                <span className="fw-medium">{item.label}</span>
              </NavLink>
            ))}
          </div>
        </Offcanvas.Body>
      </Offcanvas>

      {/* Main content */}
      <div className="flex-grow-1 d-flex flex-column min-vw-0">
        {/* Header - Modern Professional Design */}
        <SocialWorkerHeader />
        <SystemAnnouncementBanner />

        <main className="flex-grow-1 py-4 overflow-auto sw-main">
          <div className="px-3 px-lg-4">
            <Outlet />
          </div>
        </main>

        {/* Footer - minimal */}
        <footer className="sw-footer py-2 px-4 border-top bg-white">
          <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 small text-muted">
            <span>v{SYSTEM_VERSION} · © {new Date().getFullYear()} Child Protection Portal</span>
            <div>
              <Link to="/privacy-safety" className="text-muted text-decoration-none me-3">
                Privacy & Ethics
              </Link>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}
