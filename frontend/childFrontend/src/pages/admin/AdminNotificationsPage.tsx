import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, ListGroup, Button, Spinner, Badge } from 'react-bootstrap'
import { getNotifications, markNotificationRead, markAllNotificationsRead } from '../../services/dashboardApi'
import type { NotificationDTO } from '../../types/dashboard'

const NOTIFICATION_TYPE_LABELS: Record<string, string> = {
  NEW_CASE_ADMIN: 'Case',
  NEW_HELP_REQUEST_ADMIN: 'Help Request',
  CASE_STATUS_UPDATE_ADMIN: 'Case',
  CASE_COMPLETED_ADMIN: 'Case',
  HELP_REQUEST_UPDATE_ADMIN: 'Help Request',
}

export function AdminNotificationsPage() {
  const navigate = useNavigate()
  const [notifications, setNotifications] = useState<NotificationDTO[]>([])
  const [loading, setLoading] = useState(true)

  const load = () => {
    setLoading(true)
    getNotifications()
      .then(setNotifications)
      .catch(() => setNotifications([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [])

  const handleClick = async (n: NotificationDTO) => {
    try {
      await markNotificationRead(n.id)
      setNotifications((prev) => prev.map((x) => (x.id === n.id ? { ...x, read: true } : x)))
    } catch {}
    if (n.actionUrl) navigate(n.actionUrl)
  }

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsRead()
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    } catch {}
  }

  const unreadCount = notifications.filter((n) => !n.read).length

  if (loading) {
    return (
      <div className="d-flex justify-content-center py-5">
        <Spinner animation="border" variant="primary" />
      </div>
    )
  }

  return (
    <div className="animate-fade-in-up">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 fw-bold text-dark mb-1">Notifications</h1>
          <p className="text-muted mb-0 small">
            Case and help request updates for administrators. Unread: <strong>{unreadCount}</strong>
          </p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline-primary" size="sm" onClick={handleMarkAllRead}>
            Mark all as read
          </Button>
        )}
      </div>
      <Card className="border-0 shadow-sm rounded-3">
        <Card.Body className="p-0">
          {notifications.length === 0 ? (
            <div className="p-5 text-center text-muted">No notifications yet.</div>
          ) : (
            <ListGroup variant="flush">
              {notifications.map((n) => (
                <ListGroup.Item
                  key={n.id}
                  action
                  className={`py-3 border-0 border-bottom ${
                    n.read ? 'bg-white' : 'bg-light'
                  }`}
                  style={{
                    borderLeft: n.read
                      ? '4px solid transparent'
                      : '4px solid var(--admin-light-primary, #2563eb)',
                  }}
                  onClick={() => handleClick(n)}
                >
                  <div className="d-flex justify-content-between align-items-start gap-2">
                    <div className="min-w-0 flex-grow-1">
                      <div className="d-flex align-items-center gap-2 mb-1">
                        <Badge bg="secondary" className="text-uppercase small">
                          {NOTIFICATION_TYPE_LABELS[n.type || ''] || n.type || 'Update'}
                        </Badge>
                        {!n.read && (
                          <Badge bg="primary" pill className="small">
                            New
                          </Badge>
                        )}
                      </div>
                      <div className="fw-semibold small text-dark">
                        {n.title || 'Notification'}
                      </div>
                      <div className="text-muted small text-truncate">
                        {n.message}
                      </div>
                      <div className="text-muted mt-1" style={{ fontSize: '0.75rem' }}>
                        {n.createdAt ? new Date(n.createdAt).toLocaleString() : ''}
                      </div>
                    </div>
                  </div>
                </ListGroup.Item>
              ))}
            </ListGroup>
          )}
        </Card.Body>
      </Card>
    </div>
  )
}
