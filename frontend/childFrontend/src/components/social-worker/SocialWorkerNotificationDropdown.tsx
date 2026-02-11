import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Dropdown, Badge, Spinner, Button } from 'react-bootstrap'
import { getNotifications, markNotificationRead } from '../../services/socialWorkerApi'
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

  const unreadCount = notifications.filter((n) => !n.read).length
  const urgentUnread = notifications.filter((n) => !n.read && isUrgentType(n.type)).length

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
        <div
          className="px-4 py-3 border-bottom d-flex justify-content-between align-items-center bg-light bg-opacity-50"
        >
          <span className="fw-bold text-dark">Notifications</span>
          {unreadCount > 0 && (
            <Badge bg="danger" className="rounded-pill px-2 py-1" style={{ fontSize: '0.65rem' }}>
              {unreadCount} NEW
            </Badge>
          )}
        </div>
        <div style={{ maxHeight: 400, overflowY: 'auto' }}>
          {loading ? (
            <div className="p-5 text-center">
              <Spinner animation="border" size="sm" style={{ color: 'var(--sw-teal)' }} />
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-5 text-center text-muted">
               <div className="fs-3 opacity-25 mb-2">🎈</div>
               <p className="small mb-0">No new notifications</p>
            </div>
          ) : (
            notifications.slice(0, 15).map((n) => (
              <Dropdown.Item
                key={n.id}
                className={`py-3 px-4 border-bottom last-child-border-0 ${n.read ? 'opacity-75' : 'bg-light bg-opacity-25'}`}
                onClick={() => handleClick(n)}
                style={{
                  borderLeft: isUrgentType(n.type) ? '4px solid #ef4444' : '4px solid transparent',
                }}
              >
                <div className="d-flex flex-column gap-1">
                  <div className="d-flex align-items-center gap-2">
                    <span className="fw-bold small text-dark">{n.title}</span>
                    {!n.read && <span className="rounded-circle bg-teal" style={{ width: 6, height: 6, backgroundColor: 'var(--sw-teal)' }}></span>}
                  </div>
                  <div className="text-muted small lh-sm">{n.message}</div>
                  <div className="text-muted" style={{ fontSize: '0.65rem' }}>
                    {n.createdAt ? new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''} · {n.type}
                  </div>
                </div>
              </Dropdown.Item>
            ))
          )}
        </div>
        {notifications.length > 0 && (
          <div className="p-2 border-top text-center">
             <Button variant="link" className="text-decoration-none small fw-bold p-0 py-1" style={{ color: 'var(--sw-teal)', fontSize: '0.75rem' }}>
                View All Notifications
             </Button>
          </div>
        )}
      </Dropdown.Menu>
    </Dropdown>
  )
}
