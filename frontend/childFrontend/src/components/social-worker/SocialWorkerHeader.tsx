import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Dropdown } from 'react-bootstrap'
import { useAuth } from '../../hooks/useAuth'

import './SocialWorkerHeader.css'
import { SocialWorkerNotificationDropdown } from './SocialWorkerNotificationDropdown'

type AvailabilityStatus = 'active' | 'busy' | 'offline'

type SearchResultType = 'request' | 'user' | 'caseType'

interface SearchResult {
  id: string
  type: SearchResultType
  label: string
  subtitle?: string
  href?: string
}

type StatusConfig = Record<
  AvailabilityStatus,
  {
    color: string
    bgColor: string
    label: string
    icon: string
  }
>

const STATUS_CONFIG: StatusConfig = {
  active: { color: '#10b981', bgColor: '#dcfce7', label: 'Active', icon: '🟢' },
  busy: { color: '#f59e0b', bgColor: '#fef3c7', label: 'Busy', icon: '🟡' },
  offline: { color: '#ef4444', bgColor: '#fee2e2', label: 'On Leave', icon: '🔴' },
}

// NOTE: These are placeholder search results for UI only.
// Wire this up to a real search endpoint when available.
const SEARCH_SAMPLE_DATA: SearchResult[] = [
  {
    id: 'REQ-001',
    type: 'request',
    label: 'Request REQ-001',
    subtitle: 'Food Assistance • Anonymous',
    href: '/social-worker/requests/REQ-001',
  },
  {
    id: 'REQ-102',
    type: 'request',
    label: 'Request REQ-102',
    subtitle: 'Counseling • Child Abuse',
    href: '/social-worker/requests/REQ-102',
  },
  {
    id: 'USER-CHANDRA',
    type: 'user',
    label: 'Chandra Perera',
    subtitle: 'Public User • 2 open cases',
    href: '/social-worker/users/USER-CHANDRA',
  },
  {
    id: 'TYPE-COUNSELING',
    type: 'caseType',
    label: 'Counseling Sessions',
    subtitle: 'All counseling-related follow-ups',
    href: '/social-worker/follow-ups?type=counseling',
  },
  {
    id: 'TYPE-ABUSE',
    type: 'caseType',
    label: 'Child Abuse Cases',
    subtitle: 'High-priority protection cases',
    href: '/social-worker/cases?type=CHILD_ABUSE',
  },
]

export function SocialWorkerHeader() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [status, setStatus] = useState<AvailabilityStatus>('active')
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchFocused, setSearchFocused] = useState(false)


  const handleStatusChange = (newStatus: AvailabilityStatus) => {
    setStatus(newStatus)
    // TODO: Send status update to backend
    console.log(`Status changed to: ${newStatus}`)
  }

  const handleSearchResultClick = (result: SearchResult) => {
    setSearchQuery('')
    setSearchFocused(false)
    if (result.href) {
      navigate(result.href)
    }
  }

  const trimmedQuery = searchQuery.trim().toLowerCase()
  const searchResults =
    trimmedQuery.length === 0
      ? []
      : SEARCH_SAMPLE_DATA.filter((item) =>
          `${item.label} ${item.subtitle ?? ''}`.toLowerCase().includes(trimmedQuery)
        ).slice(0, 6)

  const showSearchDropdown = searchFocused && trimmedQuery.length > 0 && searchResults.length > 0

  const handleLogout = () => {
    logout()
    navigate('/')
  }



  const getInitials = (fullName?: string) => {
    if (!fullName) return 'SW'
    return fullName
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
  }

  const currentStatus = STATUS_CONFIG[status]

  return (
    <header className="sw-header sticky-top border-0 shadow-sm">
      <nav className="navbar navbar-expand-lg navbar-light px-3 px-lg-4 py-3 py-lg-3 h-auto">
        <div className="container-fluid px-0">
          {/* Left: Logo and Brand */}
          <Link
            to="/social-worker"
            className="navbar-brand d-flex align-items-center gap-2 text-decoration-none me-4"
          >
            <div className="sw-logo-wrapper">
              <img
                src="/images/logo.jpeg"
                alt="Child Protection Logo"
                className="sw-logo-img"
              />
            </div>
            <div className="d-none d-md-flex flex-column" style={{ lineHeight: '1.2' }}>
              <span className="fw-bold text-dark" style={{ fontSize: '0.9rem', letterSpacing: '0.5px' }}>
                Child Protection
              </span>
              <span className="text-muted" style={{ fontSize: '0.75rem' }}>
                Dashboard
              </span>
            </div>
          </Link>

          {/* Toggle Button for Mobile */}
          <button
            className="navbar-toggler border-0 float-end"
            type="button"
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            aria-label="Toggle navigation"
            style={{ outline: 'none' }}
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          {/* Center: Global Search (desktop and tablet) */}
          <div className="d-none d-md-flex grow justify-content-center px-3">
            <div className="sw-search-wrapper position-relative w-100" style={{ maxWidth: '520px' }}>
              <span className="sw-search-icon position-absolute top-50 translate-middle-y ms-3">
                🔍
              </span>
              <input
                type="search"
                className="form-control sw-search-input ps-5 pe-4 py-2"
                placeholder="Search by request ID, user name, or type…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => {
                  // Small timeout so click events on dropdown can fire
                  setTimeout(() => setSearchFocused(false), 120)
                }}
                aria-label="Search by request ID, user name, or type"
                autoComplete="off"
              />
              {showSearchDropdown && (
                <div className="sw-search-dropdown shadow-lg rounded-3 mt-1">
                  <div className="px-3 py-2 border-bottom small text-muted">
                    Showing {searchResults.length} result
                    {searchResults.length !== 1 ? 's' : ''} for "<strong>{searchQuery}</strong>"
                  </div>
                  <div className="sw-search-results">
                    {searchResults.map((result) => (
                      <button
                        key={result.id}
                        type="button"
                        className="sw-search-result-item w-100 text-start border-0 bg-transparent px-3 py-2"
                        onClick={() => handleSearchResultClick(result)}
                      >
                        <div className="d-flex align-items-start gap-2">
                          <span className="sw-search-result-icon mt-1">
                            {result.type === 'request' && '📄'}
                            {result.type === 'user' && '👤'}
                            {result.type === 'caseType' && '📂'}
                          </span>
                          <div className="grow">
                            <div className="fw-600 small text-dark">{result.label}</div>
                            {result.subtitle && (
                              <div className="text-muted small">{result.subtitle}</div>
                            )}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right: Status Toggle, Notifications, Profile */}
          <div className="d-flex align-items-center gap-3 ms-auto">
            {/* Status Toggle - Hidden on mobile */}
            <Dropdown className="d-none d-md-flex">
              <Dropdown.Toggle
                as="button"
                className="sw-status-toggle border-0 px-3 py-2 rounded-3 fw-500 d-flex align-items-center gap-2 transition-all"
                id="status-dropdown"
                style={{
                  backgroundColor: currentStatus.bgColor,
                  color: currentStatus.color,
                  cursor: 'pointer',
                }}
              >
                <span>{currentStatus.icon}</span>
                <span className="d-none d-lg-inline" style={{ fontSize: '0.85rem' }}>
                  {currentStatus.label}
                </span>
              </Dropdown.Toggle>
              <Dropdown.Menu align="end" className="mt-2 border-0 shadow-lg rounded-3">
                {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                  <Dropdown.Item
                    key={key}
                    onClick={() => handleStatusChange(key as AvailabilityStatus)}
                    className={`py-2 px-3 transition-all ${status === key ? 'bg-light' : ''}`}
                    style={{
                      borderLeft: status === key ? `4px solid ${config.color}` : '4px solid transparent',
                    }}
                  >
                    <span style={{ color: config.color, marginRight: '8px' }}>
                      {config.icon}
                    </span>
                    <span className="fw-500">{config.label}</span>
                  </Dropdown.Item>
                ))}
              </Dropdown.Menu>
            </Dropdown>

            <SocialWorkerNotificationDropdown />

            {/* Profile Dropdown */}
            <Dropdown>
              <Dropdown.Toggle
                as="button"
                className="sw-profile-btn btn btn-link text-decoration-none border-0 p-0 d-flex align-items-center gap-2 transition-all"
                id="profile-dropdown"
              >
                <div
                  className="sw-profile-avatar d-flex align-items-center justify-content-center fw-bold text-white rounded-circle"
                  style={{
                    width: '36px',
                    height: '36px',
                    backgroundColor: '#3b82f6',
                    fontSize: '0.85rem',
                  }}
                >
                  {getInitials(user?.fullName)}
                </div>
                <span className="d-none d-lg-inline text-dark fw-500" style={{ fontSize: '0.9rem' }}>
                  {user?.fullName?.split(' ')[0] || 'User'}
                </span>
              </Dropdown.Toggle>
              <Dropdown.Menu align="end" className="mt-2 border-0 shadow-lg rounded-3">
                <Dropdown.Item disabled className="px-3 py-2 small text-muted">
                  <strong>{user?.fullName || 'Social Worker'}</strong>
                  <div style={{ fontSize: '0.8rem' }}>{user?.email}</div>
                </Dropdown.Item>
                <Dropdown.Divider />
                <Dropdown.Item href="/social-worker/profile" className="px-3 py-2">
                  <span className="me-2">👤</span>
                  View Profile
                </Dropdown.Item>
                <Dropdown.Item
                  className="px-3 py-2"
                  onClick={() => navigate('/social-worker/profile#change-password')}
                >
                  <span className="me-2">🔐</span>
                  Change Password
                </Dropdown.Item>
                <Dropdown.Divider />
                <Dropdown.Item
                  onClick={handleLogout}
                  className="px-3 py-2 text-danger fw-500"
                >
                  <span className="me-2">🚪</span>
                  Sign Out
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </div>
        </div>
      </nav>
    </header>
  )
}
