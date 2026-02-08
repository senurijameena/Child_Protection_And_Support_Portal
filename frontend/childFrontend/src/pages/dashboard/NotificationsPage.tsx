import { useEffect, useState } from 'react'
import { Spinner, ListGroup, Button } from 'react-bootstrap'
import { getNotifications, markNotificationRead, markAllNotificationsRead } from '../../services/dashboardApi'
import type { NotificationDTO } from '../../types/dashboard'

export function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationDTO[]>([])
  const [loading, setLoading] = useState(true)

  const load = () => {
    getNotifications().then(setNotifications).finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [])

  const handleMarkRead = async (id: string) => {
    try {
      await markNotificationRead(id)
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
    } catch {}
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
        <h2 className="h4 fw-bold mb-0">Notifications</h2>
        {unreadCount > 0 && (
          <Button variant="outline-primary" size="sm" onClick={handleMarkAllRead}>
            Mark all as read
          </Button>
        )}
      </div>
      <ListGroup>
        {notifications.length === 0 ? (
          <ListGroup.Item className="text-center text-muted">No notifications yet.</ListGroup.Item>
        ) : (
          notifications.map((n) => (
            <ListGroup.Item
              key={n.id}
              className={n.read ? '' : 'bg-light'}
              action={!n.read}
              onClick={() => !n.read && handleMarkRead(n.id)}
            >
              <div className="d-flex justify-content-between">
                <div>
                  <strong>{n.title}</strong>
                  <p className="mb-0 small">{n.message}</p>
                </div>
                {!n.read && <span className="badge bg-primary">New</span>}
              </div>
            </ListGroup.Item>
          ))
        )}
      </ListGroup>
    </div>
  )
}
