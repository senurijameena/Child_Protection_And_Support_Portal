import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Dropdown, Badge, Spinner } from 'react-bootstrap'
import { apiGet, apiPut } from '../../services/api'
import type { NotificationDTO } from '../../types/dashboard'

const NOTIFICATION_TYPE_LABELS: Record<string, string> = {
  NEW_CASE_ADMIN: 'Case',
  NEW_HELP_REQUEST_ADMIN: 'Help Request',
  CASE_STATUS_UPDATE_ADMIN: 'Case',
  CASE_COMPLETED_ADMIN: 'Case',
  HELP_REQUEST_UPDATE_ADMIN: 'Help Request',
}

export function AdminNotificationDropdown() {
  const navigate = useNavigate()
  const [notifications, setNotifications] = useState<NotificationDTO[]>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)

  const load = () => {
    setLoading(true)
    apiGet<NotificationDTO[]>('/notifications')
      .then(setNotifications)
      .catch(() => setNotifications([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    if (open) load()
  }, [open])

  const unreadCount = notifications.filter((n) => !n.read).length

  const handleClick = async (n: NotificationDTO) => {
    try {
      await apiPut(`/notifications/${n.id}/read`, {})
      setNotifications((prev) => prev.map((x) => (x.id === n.id ? { ...x, read: true } : x)))
    } catch {}
    if (n.actionUrl) {
      navigate(n.actionUrl)
      setOpen(false)
    }
  }

  return (
    <Dropdown show={open} onToggle={(next) => setOpen(next)} align="end" className="ms-2">
      <Dropdown.Toggle
        variant="light"
        className="border-0 position-relative d-flex align-items-center"
        id="admin-notifications"
      >
        <span className="fs-4">🔔</span>
        {unreadCount > 0 && (
          <Badge
            bg="danger"
            pill
            className="position-absolute top-0 start-100 translate-middle"
            style={{ fontSize: '0.65rem' }}
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        )}
      </Dropdown.Toggle>
      <Dropdown.Menu className="shadow-lg" style={{ minWidth: 320, maxHeight: 400, overflowY: 'auto' }}>
        <div className="px-3 py-2 border-bottom bg-light">
          <strong>Notifications</strong>
        </div>
        {loading ? (
          <div className="p-4 text-center">
            <Spinner animation="border" size="sm" variant="primary" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-4 text-center text-muted small">No notifications yet</div>
        ) : (
          notifications.slice(0, 15).map((n) => (
            <Dropdown.Item
              key={n.id}
              className={`py-3 ${n.read ? '' : 'bg-light'}`}
              onClick={() => handleClick(n)}
            >
              <div className="d-flex justify-content-between align-items-start gap-2">
                <div className="min-w-0 flex-grow-1">
                  <div className="d-flex align-items-center gap-2 mb-1">
                    <Badge bg="secondary" className="text-uppercase" style={{ fontSize: '0.6rem' }}>
                      {NOTIFICATION_TYPE_LABELS[n.type || ''] || n.type || 'Update'}
                    </Badge>
                    {!n.read && <span className="badge bg-primary">New</span>}
                  </div>
                  <div className="fw-medium small">{n.title}</div>
                  <div className="text-muted small text-truncate">{n.message}</div>
                  <div className="text-muted" style={{ fontSize: '0.7rem' }}>
                    {n.createdAt ? new Date(n.createdAt).toLocaleString() : ''}
                  </div>
                </div>
              </div>
            </Dropdown.Item>
          ))
        )}
      </Dropdown.Menu>
    </Dropdown>
  )
}
