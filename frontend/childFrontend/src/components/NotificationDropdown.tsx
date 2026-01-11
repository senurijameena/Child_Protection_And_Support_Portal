import React from 'react';
import { Dropdown, Badge, Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import './NotificationDropdown.css';

interface Notification {
  id: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  type?: string;
  actionUrl?: string;
}

interface NotificationDropdownProps {
  show: boolean;
  onToggle: (isOpen: boolean) => void;
  notifications: Notification[];
  unreadCount: number;
  onMarkAsRead: (notificationId: string) => void;
  onMarkAllAsRead: () => void;
}

const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
  show,
  onToggle,
  notifications,
  unreadCount,
  onMarkAsRead,
  onMarkAllAsRead,
}) => {
  const navigate = useNavigate();

  const getNotificationIcon = (type: string, message: string): string => {
    const typeUpper = (type || '').toUpperCase();
    const messageUpper = (message || '').toUpperCase();

    if (typeUpper.includes('CASE') || messageUpper.includes('CASE') || messageUpper.includes('ASSIGNED')) return '⚡';
    if (typeUpper.includes('MESSAGE') || messageUpper.includes('MESSAGE')) return '📝';
    if (typeUpper.includes('UPDATE') || messageUpper.includes('STATUS') || messageUpper.includes('CHANGED')) return '✅';
    if (typeUpper.includes('TRANSFER') || messageUpper.includes('TRANSFERRED')) return '🔄';
    if (typeUpper.includes('REMINDER') || messageUpper.includes('FEEDBACK')) return '⭐';
    if (typeUpper.includes('HELP_REQUEST') || messageUpper.includes('HELP')) return '❤️';

    return '🔔';
  };

  const formatNotificationTime = (timestamp: string): string => {
    if (!timestamp) return '';

    const now = new Date();
    const notificationDate = new Date(timestamp);
    const diffInMs = now.getTime() - notificationDate.getTime();
    const diffInHours = diffInMs / (1000 * 60 * 60);
    const diffInDays = diffInMs / (1000 * 60 * 60 * 24);

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
      if (diffInMinutes < 1) return 'Just now';
      return `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else if (diffInDays < 2) {
      return 'YESTERDAY';
    } else if (diffInDays < 7) {
      return `${Math.floor(diffInDays)} days ago`;
    } else {
      return notificationDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const getNotificationPrefix = (timestamp: string, read: boolean): string => {
    if (!read) return 'NEW';

    const now = new Date();
    const notificationDate = new Date(timestamp);
    const diffInMs = now.getTime() - notificationDate.getTime();
    const diffInDays = diffInMs / (1000 * 60 * 60 * 24);

    if (diffInDays < 1) return 'NEW';
    if (diffInDays < 2) return 'YESTERDAY';
    return '';
  };

  const extractIds = (message: string, title: string): { caseId?: string; helpRequestId?: string; trackingId?: string } => {
    const combined = `${title} ${message}`;

    // Extract CASE-XXXX or CASE_XXXX (case insensitive)
    const caseMatch = combined.match(/CASE[-_]?(\w+)/i);
    const caseId = caseMatch ? caseMatch[0].toUpperCase() : undefined;

    // Extract HELP-XXXX or HELP_REQUEST-XXXX
    const helpMatch = combined.match(/HELP[-_]?(\w+)/i);
    const helpRequestId = helpMatch ? helpMatch[0].toUpperCase() : undefined;

    return { caseId, helpRequestId, trackingId: caseId || helpRequestId };
  };

  const getNotificationAction = (notification: Notification): { label: string; path: string } | null => {
    const { caseId, helpRequestId } = extractIds(notification.message, notification.title);
    const typeUpper = (notification.type || '').toUpperCase();
    const messageUpper = (notification.message || '').toUpperCase();

    if (caseId) {
      const caseIdOnly = caseId.replace(/CASE[-_]?/i, '');
      if (messageUpper.includes('FEEDBACK') || messageUpper.includes('REMINDER')) {
        return { label: 'Give Feedback', path: `/feedback?caseId=${caseIdOnly}` };
      }
      if (messageUpper.includes('TIMELINE') || messageUpper.includes('TRANSFER')) {
        return { label: 'View Timeline', path: `/cases/${caseIdOnly}` };
      }
      return { label: 'View Case', path: `/cases/${caseIdOnly}` };
    }

    if (helpRequestId) {
      const helpIdOnly = helpRequestId.replace(/HELP[-_]?/i, '');
      return { label: 'View Request', path: `/help-requests/${helpIdOnly}` };
    }

    if (typeUpper.includes('MESSAGE') || messageUpper.includes('MESSAGE')) {
      return { label: 'Read Message', path: '/messages' };
    }

    return null;
  };

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.read) {
      onMarkAsRead(notification.id);
    }

    // Priority 1: Use direct actionUrl if provided by backend
    if (notification.actionUrl) {
      navigate(notification.actionUrl);
      onToggle(false);
      return;
    }

    // Priority 2: Try to extract ID and use inferred path
    const action = getNotificationAction(notification);
    if (action) {
      navigate(action.path);
      onToggle(false);
    }
  };

  const handleMarkAllAsReadClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onMarkAllAsRead();
  };

  return (
    <Dropdown align="end" show={show} onToggle={onToggle}>
      <Dropdown.Toggle variant="link" className="notification-toggle p-0" style={{ background: 'transparent', border: 'none' }}>
        <div className="notification-bell">
          <span className="notification-icon">🔔</span>
          {unreadCount > 0 && (
            <Badge bg="danger" className="notification-badge">
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </div>
      </Dropdown.Toggle>

      <Dropdown.Menu className="notification-center-dropdown">
        <div className="notification-header">
          <span className="notification-title">🔔 NOTIFICATIONS ({unreadCount})</span>
          {unreadCount > 0 && (
            <Button
              variant="link"
              size="sm"
              className="mark-all-read-btn"
              onClick={handleMarkAllAsReadClick}
            >
              📢 Mark All Read
            </Button>
          )}
        </div>

        <div className="notification-list-container">
          {notifications.length > 0 ? (
            <div className="notification-list">
              {notifications.map((notification) => {
                const prefix = getNotificationPrefix(notification.createdAt, notification.read);
                const icon = getNotificationIcon(notification.type || '', notification.message);
                const action = getNotificationAction(notification);

                return (
                  <div
                    key={notification.id}
                    className={`notification-item ${!notification.read ? 'unread' : ''}`}
                  >
                    <div className="notification-content-wrapper">
                      <div className="notification-main-content">
                        <span className="notification-icon-large">{icon}</span>
                        <div className="notification-text-content">
                          <div className="notification-header-row">
                            {prefix && <span className="notification-prefix">{prefix}:</span>}
                            <span className="notification-message-text">
                              {notification.message || notification.title}
                            </span>
                          </div>
                          {prefix === 'YESTERDAY' && (
                            <div className="notification-time">{formatNotificationTime(notification.createdAt)}</div>
                          )}
                        </div>
                      </div>
                      {action && (
                        <Button
                          variant="link"
                          size="sm"
                          className="notification-action-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleNotificationClick(notification);
                          }}
                        >
                          {action.label}
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="notification-empty">No notifications</div>
          )}
        </div>

        <div className="notification-footer">
          <Link
            to="/notifications"
            className="see-all-link"
            onClick={() => onToggle(false)}
          >
            See All Notifications
          </Link>
        </div>
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default NotificationDropdown;
