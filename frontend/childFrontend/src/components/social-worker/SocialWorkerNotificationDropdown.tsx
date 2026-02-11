import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Dropdown, Badge, Spinner, Button } from 'react-bootstrap'
import { getNotifications, markNotificationRead, markAllNotificationsRead } from '../../services/socialWorkerApi'
import type { NotificationDTO } from '../../types/dashboard'

function isUrgentType(type: string | undefined): boolean {
  return type === 'HIGH_RISK' || type === 'FOLLOW_UP_DUE' || type === 'URGENT'
}

export function SocialWorkerNotificationDropdown() {
  const navigate = useNavigate()
  const [notifications, setNotifications] = useState<NotificationDTO[]>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)

  const load = () => {
    setLoading(true)
    getNotifications()
      .then(setNotifications)
      .catch(() => setNotifications([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    if (open) load()
  }, [open])

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsRead()
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    } catch (err) {
      console.error('Failed to mark all notifications as read', err)
    }
  }

  const unreadCount = notifications.filter((n) => !n.read).length
  const urgentUnread = notifications.filter((n) => !n.read && isUrgentType(n.type)).length

  const unread = notifications.filter((n) => !n.read)
  const earlier = notifications.filter((n) => n.read)

  const timeAgo = (iso?: string) => {
    if (!iso) return ''
    const then = new Date(iso).getTime()
    const now = Date.now()
    const diff = Math.floor((now - then) / 1000)
    if (diff < 60) return `${diff}s ago`
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
    return `${Math.floor(diff / 86400)}d ago`
  }

  const getIconForType = (type?: string) => {
    switch (type) {
      case 'PACKAGE_APPROVED':
        return '✅'
      case 'PACKAGE_PARTIAL':
        return '🔧'
      case 'PACKAGE_REJECTED':
        return '❌'
      case 'FOLLOW_UP':
      case 'FOLLOW_UP_DUE':
        return '⏰'
      case 'OVERDUE_ALERT':
        return '⚠️'
      case 'NEW_ASSIGNMENT':
      case 'HELP_REQUEST_ASSIGNED':
        return '📌'
      case 'PU_MESSAGE':
      case 'NEW_MESSAGE':
        return '💬'
      default:
        return '🔔'
    }
  }

  const buildActionUrl = (n: NotificationDTO) => {
    if (n.actionUrl) return n.actionUrl
    // best-effort mapping if backend didn't provide actionUrl
    // try to extract help request id from message like 'HELP #1023'
    const m = n.message || ''
    const match = m.match(/HELP\s*#?(\d+)/i)
    if (match) {
      const id = match[1]
      switch (n.type) {
        case 'PACKAGE_APPROVED':
          return `/social-worker/requests/${id}?highlight=appliedPackage`
        case 'PACKAGE_PARTIAL':
          return `/social-worker/requests/${id}?highlight=serviceBreakdown`
        case 'PACKAGE_REJECTED':
          return `/social-worker/requests/${id}?highlight=rejection`
        case 'FOLLOW_UP':
        case 'FOLLOW_UP_DUE':
          return `/social-worker/requests/${id}?highlight=followUp`
        case 'OVERDUE_ALERT':
          return `/social-worker/requests/${id}?highlight=overdue`
        case 'NEW_ASSIGNMENT':
          return `/social-worker/requests/${id}`
        case 'PU_MESSAGE':
        case 'NEW_MESSAGE':
          return `/social-worker/requests/${id}?open=messages`
        default:
          return `/social-worker/requests/${id}`
      }
    }
    return ''
  }

  const handleClick = async (n: NotificationDTO) => {
    try {
      await markNotificationRead(n.id)
      setNotifications((prev) =>
        prev.map((x) => (x.id === n.id ? { ...x, read: true } : x))
      )
    } catch {
      //
    }
    if (n.actionUrl) {
      navigate(n.actionUrl)
      setOpen(false)
    }
  }

  return (
    <Dropdown
      show={open}
      onToggle={(next) => setOpen(next)}
      align="end"
    >
      <Dropdown.Toggle
        variant="light"
        className="border-0 position-relative d-flex align-items-center justify-content-center rounded-2 p-2 shadow-none"
        style={{ width: 40, height: 40, backgroundColor: '#f8fafc' }}
        id="sw-notifications"
        aria-label="Notifications"
      >
        <span className="fs-5" aria-hidden="true" style={{ opacity: 0.8 }}>🔔</span>
        {unreadCount > 0 && (
          <span
            className="position-absolute translate-middle rounded-circle border border-white"
            style={{
              top: '25%',
              left: '75%',
              width: 12,
              height: 12,
              backgroundColor: urgentUnread > 0 ? '#ef4444' : 'var(--sw-teal)',
            }}
          ></span>
        )}
      </Dropdown.Toggle>
      <Dropdown.Menu
        className="shadow-lg border-0 mt-3 p-0 overflow-hidden"
        style={{ width: 340, borderRadius: 12 }}
      >
        <div className="px-4 py-3 d-flex justify-content-between align-items-center bg-light bg-opacity-50">
          <div>
            <span className="fw-bold text-dark">Notifications</span>
            <div className="small text-muted">{unreadCount} new</div>
          </div>
          <div>
            <Button variant="link" size="sm" className="px-2 py-0 text-decoration-none" onClick={handleMarkAllRead}>
              Mark all as read
            </Button>
          </div>
        </div>

        <div style={{ maxHeight: 380, overflowY: 'auto' }}>
          {/* Unread section */}
          <div className="px-2 py-2 border-bottom bg-white">
            <div className="d-flex justify-content-between align-items-center px-2">
              <div className="fw-600">🔴 Unread</div>
              <div className="small text-muted">{unread.length}</div>
            </div>
          </div>

          {loading ? (
            <div className="p-5 text-center">
              <Spinner animation="border" size="sm" style={{ color: 'var(--sw-teal)' }} />
            </div>
          ) : unread.length === 0 ? (
            <div className="p-3 text-muted small">No unread notifications</div>
          ) : (
            unread.slice(0, 10).map((n) => (
              <Dropdown.Item
                key={n.id}
                className={`py-3 px-3 border-bottom ${n.read ? 'opacity-75' : ''}`}
                onClick={async () => {
                  try {
                    if (!n.read) {
                      await markNotificationRead(n.id)
                      setNotifications((prev) => prev.map((x) => (x.id === n.id ? { ...x, read: true } : x)))
                    }
                  } catch (err) {
                    console.error('Failed to mark notification as read', err)
                  }
                  const url = buildActionUrl(n)
                  if (url) {
                    navigate(url)
                    setOpen(false)
                  }
                }}
                style={{
                  borderLeft: isUrgentType(n.type) ? '4px solid #ef4444' : '4px solid transparent',
                }}
              >
                <div className="d-flex gap-2">
                  <div style={{ fontSize: '1.15rem' }}>{getIconForType(n.type)}</div>
                  <div className="grow">
                    <div className="d-flex justify-content-between align-items-start">
                      <div className={`fw-600 ${!n.read ? 'text-dark' : 'text-muted'}`}>{n.title}</div>
                      {!n.read && <div className="rounded-circle" style={{ width: 8, height: 8, backgroundColor: '#ef4444' }}></div>}
                    </div>
                    <div className="text-muted small">{n.message}</div>
                    <div className="text-muted small mt-1" style={{ fontSize: '0.7rem' }}>{timeAgo(n.createdAt)}</div>
                  </div>
                </div>
              </Dropdown.Item>
            ))
          )}

          {/* Earlier (read) section */}
          <div className="px-2 py-2 border-top bg-white">
            <div className="d-flex justify-content-between align-items-center px-2">
              <div className="fw-600">⚪ Earlier</div>
              <div className="small text-muted">{earlier.length}</div>
            </div>
          </div>

          {earlier.length === 0 ? (
            <div className="p-3 text-muted small">No earlier notifications</div>
          ) : (
            earlier.slice(0, 20).map((n) => (
              <Dropdown.Item
                key={n.id}
                className="py-3 px-3 border-bottom opacity-75"
                onClick={async () => {
                  try {
                    if (!n.read) {
                      await markNotificationRead(n.id)
                      setNotifications((prev) => prev.map((x) => (x.id === n.id ? { ...x, read: true } : x)))
                    }
                  } catch (err) {
                    console.error('Failed to mark notification as read', err)
                  }
                  const url = buildActionUrl(n)
                  if (url) {
                    navigate(url)
                    setOpen(false)
                  }
                }}
              >
                <div className="d-flex gap-2">
                  <div style={{ fontSize: '1rem' }}>{getIconForType(n.type)}</div>
                    <div className="grow">
                    <div className="d-flex justify-content-between align-items-start">
                      <div className="fw-600 text-muted">{n.title}</div>
                      <div className="small text-muted">{timeAgo(n.createdAt)}</div>
                    </div>
                    <div className="text-muted small">{n.message}</div>
                  </div>
                </div>
              </Dropdown.Item>
            ))
          )}
        </div>

        <div className="p-2 border-top text-center">
          <Button variant="link" className="text-decoration-none small fw-bold p-0 py-1" style={{ color: 'var(--sw-teal)', fontSize: '0.75rem' }} onClick={() => { navigate('/dashboard/notifications'); setOpen(false) }}>
            View All Notifications
          </Button>
        </div>
      </Dropdown.Menu>
    </Dropdown>
  )
}
