import React, { useState, useEffect } from 'react';
import { Container, Card, Button, Badge, Alert, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { notificationService } from '../../services/notificationService';
import './NotificationCenterPage.css';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  actionUrl?: string;
  createdAt: string;
  caseId?: string;
  helpRequestId?: string;
  messageId?: string;
}

const NotificationCenterPage: React.FC = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await notificationService.getNotifications();
      if (response.data && Array.isArray(response.data)) {
        const sortedNotifications = response.data.sort((a: any, b: any) =>
          new Date(b.createdAt || b.timestamp || 0).getTime() -
          new Date(a.createdAt || a.timestamp || 0).getTime()
        );
        setNotifications(sortedNotifications);
      }
    } catch (err: any) {
      console.error('Error fetching notifications:', err);
      setError('Failed to load notifications. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await notificationService.markAsRead(notificationId);
      setNotifications(prev =>
        prev.map(notif =>
          notif.id === notificationId ? { ...notif, read: true } : notif
        )
      );
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      handleMarkAsRead(notification.id);
    }

    // Handle navigation based on notification type
    if (notification.actionUrl) {
      navigate(notification.actionUrl);
    } else if (notification.type === 'CASE_CREATED' || notification.type === 'CASE_UPDATE' || notification.type === 'CASE_ASSIGNED' || notification.type === 'EVIDENCE') {
      // Extract case ID from message (e.g., "Your case CASE-0001 has been created successfully")
      const caseIdMatch = notification.message?.match(/(CASE-\d+|ANON-C-\d+)/);
      if (caseIdMatch) {
        // Navigate using the tracking ID directly
        navigate(`/cases/${caseIdMatch[1]}`);
      } else if (notification.caseId) {
        navigate(`/cases/${notification.caseId}`);
      } else {
        navigate('/cases/my-cases');
      }
    } else if (notification.type === 'HELP_REQUEST_CREATED' || notification.type === 'HELP_REQUEST' || notification.type === 'HELP_REQUEST_UPDATE') {
      // Extract help request ID from message (e.g., "Your help request HELP-0001 has been created successfully")
      const helpIdMatch = notification.message?.match(/(HELP-\d+|ANON-H-\d+)/);
      if (helpIdMatch) {
        // Navigate using the tracking ID directly
        navigate(`/help-requests/${helpIdMatch[1]}`);
      } else if (notification.helpRequestId) {
        navigate(`/help-requests/${notification.helpRequestId}`);
      } else {
        navigate('/help-requests/my-requests');
      }
    } else if (notification.type === 'MESSAGE') {
      if (notification.messageId) navigate(`/messages?messageId=${notification.messageId}`);
      else navigate('/messages');
    } else if (notification.type === 'TRANSFER' || notification.type === 'HELP_REQUEST_TRANSFERRED' || notification.type === 'CASE_TRANSFERRED') {
      if (notification.caseId) navigate(`/cases/${notification.caseId}`);
      else if (notification.helpRequestId) navigate(`/help-requests/${notification.helpRequestId}`);
    } else if (notification.type === 'REMINDER') {
      if (notification.caseId) navigate(`/feedback?caseId=${notification.caseId}`);
      else if (notification.helpRequestId) navigate(`/feedback?helpRequestId=${notification.helpRequestId}`);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'CASE_CREATED':
        return '📋';
      case 'CASE_UPDATE':
      case 'EVIDENCE':
        return '⚡';
      case 'CASE_ASSIGNED':
        return '👮';
      case 'MESSAGE':
        return '📝';
      case 'HELP_REQUEST_CREATED':
        return '❤️';
      case 'HELP_REQUEST':
      case 'HELP_REQUEST_UPDATE':
        return '✅';
      case 'TRANSFER':
      case 'HELP_REQUEST_TRANSFERRED':
      case 'CASE_TRANSFERRED':
        return '🔄';
      case 'REMINDER':
        return '⭐';
      case 'ASSIGNMENT_NOTIFICATION':
        return '👩⚕️';
      default:
        return '🔔';
    }
  };

  const formatNotificationTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays === 1) return 'Yesterday';
      if (diffDays < 7) return `${diffDays}d ago`;
      return date.toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  const getActionLabel = (notification: Notification) => {
    if (notification.actionUrl) return 'View Details';
    switch (notification.type) {
      case 'CASE_CREATED':
      case 'CASE_UPDATE':
      case 'CASE_ASSIGNED':
      case 'EVIDENCE':
        return 'View Case';
      case 'MESSAGE':
        return 'Read Message';
      case 'HELP_REQUEST_CREATED':
      case 'HELP_REQUEST':
      case 'HELP_REQUEST_UPDATE':
        return 'View Request';
      case 'TRANSFER':
      case 'HELP_REQUEST_TRANSFERRED':
      case 'CASE_TRANSFERRED':
        return 'View Timeline';
      case 'REMINDER':
        return 'Give Feedback';
      default:
        return 'View Details';
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  if (loading) {
    return (
      <Container className="notification-center-page">
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </div>
      </Container>
    );
  }

  return (
    <div className="notification-center-page">
      <Container>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="mb-0">🔔 NOTIFICATIONS {unreadCount > 0 && <Badge bg="danger">{unreadCount}</Badge>}</h2>
          {unreadCount > 0 && (
            <Button variant="primary" onClick={handleMarkAllAsRead}>
              📢 Mark All Read
            </Button>
          )}
        </div>

        {error && (
          <Alert variant="danger" dismissible onClose={() => setError(null)} className="mb-4">
            {error}
          </Alert>
        )}

        {notifications.length === 0 ? (
          <Card>
            <Card.Body className="text-center py-5">
              <div className="empty-state-icon mb-3">🔔</div>
              <h5 className="text-muted">No notifications</h5>
              <p className="text-muted">You're all caught up! New notifications will appear here.</p>
            </Card.Body>
          </Card>
        ) : (
          <div className="notifications-list">
            {notifications.map((notification) => (
              <Card
                key={notification.id}
                className={`notification-card mb-3 ${!notification.read ? 'unread' : ''}`}
              >
                <Card.Body>
                  <div className="notification-content-wrapper">
                    <div className="notification-icon-wrapper">
                      <span className="notification-icon">{getNotificationIcon(notification.type)}</span>
                    </div>
                    <div className="notification-text-content">
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <h5 className="notification-title mb-0">
                          {notification.title || 'Notification'}
                        </h5>
                        {!notification.read && (
                          <Badge bg="primary" className="unread-badge">NEW</Badge>
                        )}
                      </div>
                      <p className="notification-message mb-2">
                        {notification.message || ''}
                      </p>
                      <div className="d-flex justify-content-between align-items-center">
                        <span className="notification-time text-muted">
                          {formatNotificationTime(notification.createdAt)}
                        </span>
                        <Button
                          variant="outline-primary"
                          size="sm"
                          onClick={() => handleNotificationClick(notification)}
                        >
                          {getActionLabel(notification)}
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            ))}
          </div>
        )}
      </Container>
    </div>
  );
};

export default NotificationCenterPage;
