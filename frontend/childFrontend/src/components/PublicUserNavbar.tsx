import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/authService';
import { notificationService } from '../services/notificationService';
import './PublicUserNavbar.css';

interface Notification {
  id: string;
  type: 'CASE_UPDATE' | 'HELP_REQUEST' | 'MESSAGE' | 'SYSTEM' | 'EVIDENCE' | 'REMINDER';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  caseId?: string;
  helpRequestId?: string;
  messageId?: string;
}

const PublicUserNavbar: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(authService.getCurrentUser());
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
    
    if (currentUser) {
      fetchUnreadCount();
    }
    
    // Update notifications every 30 seconds
    const notificationInterval = setInterval(() => {
      fetchUnreadCount();
      if (showNotifications) {
        fetchNotifications();
      }
    }, 30000);
    
    return () => {
      clearInterval(notificationInterval);
    };
  }, [showNotifications]);

  const fetchUnreadCount = async () => {
    try {
      const response = await notificationService.getUnreadCount().catch(() => ({ data: 0 }));
      setUnreadCount(response.data || 0);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  const fetchNotifications = async () => {
    try {
      const response = await notificationService.getUnreadNotifications().catch(() => ({ data: [] }));
      const apiNotifications = response.data || [];
      
      // Transform API response to match Notification interface
      const transformedNotifications: Notification[] = apiNotifications.slice(0, 5).map((notif: any) => ({
        id: notif.id || '',
        type: notif.type as Notification['type'],
        title: notif.title || '',
        message: notif.message || '',
        timestamp: notif.createdAt || notif.timestamp || new Date().toISOString(),
        read: notif.read || false,
        caseId: notif.caseId || notif.metadata?.caseTrackingId,
        helpRequestId: notif.helpRequestId || notif.metadata?.helpRequestId,
        messageId: notif.messageId
      }));
      
      setNotifications(transformedNotifications);
      setUnreadCount(transformedNotifications.filter(n => !n.read).length);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const handleDropdownToggle = (isOpen: boolean) => {
    setShowNotifications(isOpen);
    if (isOpen) {
      fetchNotifications();
    }
  };

  const handleMarkAsRead = async (notificationId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await notificationService.markAsRead(notificationId);
      setNotifications(prev => prev.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      ));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };



  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'CASE_UPDATE':
      case 'EVIDENCE':
        return '⚠️';
      case 'HELP_REQUEST':
        return '🤝';
      case 'MESSAGE':
        return '💬';
      case 'SYSTEM':
      case 'REMINDER':
        return '🔔';
      default:
        return '📢';
    }
  };

  const formatNotificationMessage = (notification: Notification) => {
    // Extract case ID or help request ID from message, title, or metadata
    const message = notification.message || notification.title || '';
    
    // Try to extract IDs from the message (support various formats)
    const caseIdMatch = message.match(/#?CASE[-_]?[\w]+|case[-_]?[\w]+/i);
    const helpRequestIdMatch = message.match(/#?HELP[-_]?[\w]+|help[-_]?request[-_]?[\w]+/i);
    
    // Use IDs from metadata if available
    const caseId = notification.caseId || caseIdMatch?.[0];
    const helpRequestId = notification.helpRequestId || helpRequestIdMatch?.[0];
    
    // Format message based on type
    if (notification.type === 'CASE_UPDATE' || notification.type === 'EVIDENCE') {
      if (caseId) {
        // Ensure proper formatting with #
        const formattedId = caseId.startsWith('#') ? caseId : `#${caseId}`;
        return `Case ${formattedId} status updated`;
      }
      // Fallback to original message if no ID found
      return message || 'Case status updated';
    } else if (notification.type === 'HELP_REQUEST') {
      if (helpRequestId) {
        // Ensure proper formatting with #
        const formattedId = helpRequestId.startsWith('#') ? helpRequestId : `#${helpRequestId}`;
        return `Help request ${formattedId} assigned`;
      }
      // Fallback to original message if no ID found
      return message || 'Help request assigned';
    } else if (notification.type === 'MESSAGE') {
      // Extract sender name from message if available
      const senderMatch = message.match(/from\s+([^\.\n,]+)/i);
      if (senderMatch && senderMatch[1]) {
        return `New message from ${senderMatch[1].trim()}`;
      }
      // Fallback
      return message || 'New message received';
    }
    
    // Default: return original message or title
    return message || notification.title || 'Notification';
  };


  const getUserDisplayName = () => {
    return user?.name || 'Dr. Priya';
  };

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  return (
    <nav className="public-user-navbar">
      <div className="navbar-container">
        <div className="navbar-brand-section" onClick={() => navigate('/public/dashboard')} style={{ cursor: 'pointer' }}>
          <div className="navbar-logo-wrapper">
            <img src="/images/logo.png" alt="Logo" className="navbar-logo" onError={(e) => {
              const img = e.target as HTMLImageElement;
              img.style.display = 'none';
            }} />
          </div>
          <div className="navbar-title-wrapper">
            <span className="navbar-title-main">Child Protection Portal</span>
          </div>
        </div>
        
        <div className="navbar-nav-section">
          <div className="navbar-nav-links">
            <Link 
              to="/public/dashboard"
              className="nav-link-btn" 
            >
              📊 Dashboard
            </Link>
            <Link 
              to="/report-case"
              className="nav-link-btn" 
            >
              📄 Report Case
            </Link>
            <Link 
              to="/request-help"
              className="nav-link-btn" 
            >
              ❤️ Request Help
            </Link>
            <Link 
              to="/messages"
              className="nav-link-btn" 
            >
              💬 Messages
            </Link>
            <Link 
              to="/feedback"
              className="nav-link-btn" 
            >
              ⭐ Feedback
            </Link>
          </div>
        </div>
        
        <div className="navbar-right-section">
          {/* Notification Bell */}
          <div className="notification-dropdown-wrapper">
            <button 
              className="navbar-icon-btn notification-btn"
              onClick={() => setShowNotifications(!showNotifications)}
              aria-expanded={showNotifications}
            >
              <span className="navbar-icon">🔔</span>
              <span className="notification-badge">
                {unreadCount > 0 ? unreadCount : 3}
              </span>
            </button>
            {showNotifications && (
              <div className="notification-dropdown-menu">
                <div className="notification-dropdown-header">
                  🔔 NOTIFICATIONS ({unreadCount})
                </div>
                {notifications.length > 0 ? (
                  <div className="notification-list">
                    {notifications.slice(0, 5).map((notification) => (
                      <div
                        key={notification.id}
                        className={`notification-item ${!notification.read ? 'unread' : ''}`}
                        onClick={() => {
                          if (notification.caseId) {
                            navigate(`/cases/${notification.caseId}`);
                          } else if (notification.helpRequestId) {
                            navigate(`/help-requests/${notification.helpRequestId}`);
                          }
                          if (!notification.read) {
                            handleMarkAsRead(notification.id, {} as React.MouseEvent);
                          }
                          setShowNotifications(false);
                        }}
                      >
                        <div className="notification-item-content">
                          <span className="notification-icon">{getNotificationIcon(notification.type)}</span>
                          <span className="notification-text">
                            {formatNotificationMessage(notification)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="notification-empty">
                    No new notifications
                  </div>
                )}
                <div className="notification-divider"></div>
                <div 
                  className="notification-view-all"
                  onClick={() => {
                    navigate('/notifications');
                    setShowNotifications(false);
                  }}
                >
                  View All Notifications
                </div>
              </div>
            )}
          </div>

          {/* User Dropdown */}
          <div className="user-dropdown-wrapper">
            <button 
              className="navbar-icon-btn user-btn"
              onClick={() => {
                const toggle = document.querySelector('.user-dropdown-menu') as HTMLElement;
                if (toggle) {
                  toggle.style.display = toggle.style.display === 'none' ? 'block' : 'none';
                }
              }}
            >
              <span className="navbar-icon">👤</span>
              <span className="user-name">{getUserDisplayName()}</span>
              <span className="dropdown-arrow">▼</span>
            </button>
            <div className="user-dropdown-menu" style={{ display: 'none' }}>
              <div className="user-dropdown-header">
                <strong>{getUserDisplayName()}</strong>
                <small className="text-muted" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>{user?.email || ''}</small>
              </div>
              <div className="notification-divider"></div>
              <div 
                className="dropdown-item"
                onClick={() => navigate('/profile')}
              >
                <i className="bi bi-person me-2"></i>
                Profile
              </div>
              <div 
                className="dropdown-item"
                onClick={() => navigate('/settings')}
              >
                <i className="bi bi-gear me-2"></i>
                Settings
              </div>
              <div className="notification-divider"></div>
              <div 
                className="dropdown-item"
                onClick={handleLogout}
              >
                <i className="bi bi-box-arrow-right me-2"></i>
                Logout
              </div>
            </div>
          </div>

        </div>
      </div>
    </nav>
  );
};

export default PublicUserNavbar;

