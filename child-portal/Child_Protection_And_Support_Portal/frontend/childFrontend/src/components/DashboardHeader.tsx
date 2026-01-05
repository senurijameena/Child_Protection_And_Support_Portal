
import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Navbar, 
  Nav, 
  Button, 
  Dropdown, 
  Badge,
  Offcanvas,
  Spinner
} from 'react-bootstrap';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { authService } from '../services/authService';
import { notificationService } from '../services/notificationService';
import { userService } from '../services/userService';
import { API_BASE_URL } from '../utils/constants';
import NotificationDropdown from './NotificationDropdown';
import './DashboardHeader.css';

interface Notification {
  id: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  type?: string;
}

interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  role: string;
  active: boolean;
  approved: boolean;
  registrationDate?: string;
  lastLogin?: string;
  address?: string;
  city?: string;
  location?: string;
  profilePhoto?: string;
  profileImage?: string;
}

interface QuickStats {
  liveCases: number;
  newCasesToday: number;
  emergencyCases: number;
  pendingApprovals: number;
}

const DashboardHeader: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(authService.getCurrentUser());
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [quickStats, setQuickStats] = useState<QuickStats | null>(null);
  const [loadingQuickStats, setLoadingQuickStats] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [liveLocation, setLiveLocation] = useState<string | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
    
    if (currentUser) {
      fetchUserProfile(currentUser.id);
      fetchUnreadNotifications();
      fetchNotifications();
      
      // Get live location for public users
      if (currentUser.role === 'PUBLIC') {
        getLiveLocation();
        // Update location every 5 minutes
        const locationInterval = setInterval(getLiveLocation, 300000);
        return () => {
          clearInterval(locationInterval);
        };
      }
      
      if (currentUser.role === 'ADMIN') {
        fetchQuickStats();
        const statsInterval = setInterval(fetchQuickStats, 30000); // Update every 30 seconds
        return () => {
          clearInterval(statsInterval);
        };
      }
    }
    
    const interval = setInterval(() => {
      setUser(authService.getCurrentUser());
      setCurrentTime(new Date());
    }, 60000);

    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    
    const handleNotificationRefresh = () => {
      fetchUnreadNotifications();
      fetchNotifications();
    };

    const handleUserProfileUpdate = () => {
      // Refresh user data when profile is updated
      const updatedUser = authService.getCurrentUser();
      setUser(updatedUser);
      if (updatedUser) {
        fetchUserProfile(updatedUser.id);
      }
    };
    
    window.addEventListener('notificationRefresh', handleNotificationRefresh);
    window.addEventListener('userProfileUpdated', handleUserProfileUpdate);
    
    return () => {
      clearInterval(interval);
      if (timeInterval) {
        clearInterval(timeInterval);
      }
      window.removeEventListener('notificationRefresh', handleNotificationRefresh);
      window.removeEventListener('userProfileUpdated', handleUserProfileUpdate);
    };
  }, [location]);

  const fetchUserProfile = async (userId: string) => {
    try {
      const response = await userService.getUserProfile(userId);
      setUserProfile(response.data);
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const getLiveLocation = () => {
    if (!navigator.geolocation) {
      console.log('Geolocation is not supported by this browser.');
      return;
    }

    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          
          // Use OpenStreetMap Nominatim API for reverse geocoding
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
            {
              headers: {
                'User-Agent': 'ChildProtectionPortal/1.0'
              }
            }
          );
          
          if (response.ok) {
            const data = await response.json();
            const address = data.address;
            
            // Try to get city, town, village, or suburb
            const locationName = 
              address.city || 
              address.town || 
              address.village || 
              address.suburb || 
              address.county ||
              address.state ||
              `${address.city || address.town || address.village || 'Location'}, ${address.country || ''}`;
            
            setLiveLocation(locationName);
          } else {
            // Fallback: show coordinates if reverse geocoding fails
            setLiveLocation(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
          }
        } catch (error) {
          console.error('Error getting location name:', error);
          setLiveLocation(null);
        } finally {
          setLocationLoading(false);
        }
      },
      (error) => {
        console.error('Error getting location:', error);
        setLocationLoading(false);
        setLiveLocation(null);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // Cache for 5 minutes
      }
    );
  };

  const fetchUnreadNotifications = async () => {
    try {
      const response = await notificationService.getUnreadCount();
      setUnreadCount(response.data || 0);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const fetchNotifications = async () => {
    try {
      const response = await notificationService.getNotifications();
      const apiNotifications = response.data || [];
      
      // Transform API response to match Notification interface
      // Sort by most recent first, limit to 6
      const transformedNotifications: Notification[] = apiNotifications
        .sort((a: any, b: any) => {
          const dateA = new Date(a.createdAt || a.timestamp || 0).getTime();
          const dateB = new Date(b.createdAt || b.timestamp || 0).getTime();
          return dateB - dateA;
        })
        .slice(0, 6)
        .map((notif: any) => ({
          id: notif.id || '',
          title: notif.title || '',
          message: notif.message || '',
          read: notif.read || false,
          createdAt: notif.createdAt || notif.timestamp || new Date().toISOString(),
          type: notif.type,
          actionUrl: notif.actionUrl
        }));
      
      setNotifications(transformedNotifications);
    } catch (error) {
      console.error('Error fetching notification list:', error);
    }
  };

  const fetchQuickStats = async () => {
    if (user?.role !== 'ADMIN') return;
    
    try {
      setLoadingQuickStats(true);
      const token = localStorage.getItem('authToken');
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      // Use the analytics dashboard endpoint which returns all metrics
      const dashboardRes = await fetch(`${API_BASE_URL}/api/analytics/dashboard`, { headers });

      let liveCases = 0;
      let newCasesToday = 0;
      let emergencyCases = 0;
      let pendingApprovals = 0;

      if (dashboardRes.ok) {
        const dashboardData = await dashboardRes.json();
        // Map backend response to frontend state
        liveCases = dashboardData.activeCases || 0;
        emergencyCases = dashboardData.emergencyCases || 0;
        pendingApprovals = dashboardData.pendingApprovals || 0;
        
        // Calculate new cases today from casesByStatus if available
        if (dashboardData.casesByStatus) {
          const today = new Date().toISOString().split('T')[0];
          // This is an approximation - backend should provide this
          newCasesToday = 0;
        }
      } else {
        // Fallback: try individual endpoints
        const [casesRes, approvalsRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/cases/all`, { headers }).catch(() => null),
          fetch(`${API_BASE_URL}/api/admin/pending-approvals`, { headers }).catch(() => null)
        ]);

        if (casesRes?.ok) {
          const casesData = await casesRes.json();
          if (Array.isArray(casesData)) {
            liveCases = casesData.filter((c: any) => 
              c.status === 'REPORTED' || 
              c.status === 'UNDER_REVIEW' || 
              c.status === 'ASSIGNED' || 
              c.status === 'INVESTIGATING'
            ).length;
            emergencyCases = casesData.filter((c: any) => c.priority === 'URGENT' || c.priority === 'EMERGENCY').length;
          }
        }

        if (approvalsRes?.ok) {
          const approvalsData = await approvalsRes.json();
          pendingApprovals = Array.isArray(approvalsData) ? approvalsData.length : (approvalsData.count || 0);
        }
      }

      setQuickStats({
        liveCases,
        newCasesToday,
        emergencyCases,
        pendingApprovals
      });
    } catch (error) {
      console.error('Error fetching quick stats:', error);
    } finally {
      setLoadingQuickStats(false);
    }
  };

  const handleNotificationClick = async (notificationId: string) => {
    try {
      await notificationService.markAsRead(notificationId);
      fetchUnreadNotifications();
      fetchNotifications();
      setShowNotifications(false);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      fetchUnreadNotifications();
      fetchNotifications();
    } catch (error) {
      console.error('Error marking all as read:', error);
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
      if (diffDays < 7) return `${diffDays}d ago`;
      return date.toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  const formatLastLogin = (dateString?: string) => {
    if (!dateString) return 'Never';
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins} minutes ago`;
      if (diffHours < 24) return `${diffHours} hours ago`;
      if (diffDays === 1) return 'Yesterday';
      if (diffDays < 7) return `${diffDays} days ago`;
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };


  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'help':
        navigate('/request-help');
        break;
      default:
        break;
    }
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'Administrator';
      case 'POLICE': return 'Police Officer';
      case 'SOCIAL_WORKER': return 'Social Worker';
      case 'PUBLIC': return 'Public User';
      default: return 'User';
    }
  };

  const getDashboardPath = () => {
    if (!user) return '/login';
    switch (user.role) {
      case 'ADMIN': return '/admin/dashboard';
      case 'POLICE': return '/police/dashboard';
      case 'SOCIAL_WORKER': return '/social-worker/dashboard';
      case 'PUBLIC': return '/dashboard';
      default: return '/dashboard';
    }
  };

  const handleCloseMobileMenu = () => {
    setShowMobileMenu(false);
  };

  if (!user) {
    return null; // Or redirect to login
  }

  return (
    <>
      <Navbar expand="lg" className="dashboard-header" sticky="top">
        <div className="header-quote-banner">
          <div className="quote-content">
            Working together to prevent harm and ensure child well-being
          </div>
        </div>
        
        <Container fluid className="header-main-content">
          <div className="header-left-section">
            <Navbar.Brand as={Link} to={getDashboardPath()} className="logo-brand">
              <div className="logo-container">
                <span className="logo-emoji">🛡️</span>
                <div className="brand-text-container">
                  <span className="system-name">
                    {user?.role === 'ADMIN' ? 'Child Protection Portal' : 'Child Protection and Support Portal'}
                  </span>
                  <span className="dashboard-title">
                    {user?.role === 'ADMIN' ? 'Admin Dashboard' : 
                     user?.role === 'POLICE' ? 'Police Officer Dashboard' :
                     user?.role === 'SOCIAL_WORKER' ? 'Social Worker Dashboard' :
                     'Public User Dashboard'}
                  </span>
                </div>
              </div>
            </Navbar.Brand>
          </div>

          {user?.role === 'ADMIN' && (
            <div className="header-quick-stats-section d-none d-xl-flex">
              <div className="quick-stat-item" onClick={() => navigate('/admin/cases/all')} style={{ cursor: 'pointer' }}>
                <span className="quick-stat-icon">📊</span>
                <div className="quick-stat-content">
                  <span className="quick-stat-label">Live Cases</span>
                  <span className="quick-stat-value">
                    {loadingQuickStats ? (
                      <Spinner animation="border" size="sm" />
                    ) : (
                      <>
                        {quickStats?.liveCases || 0}
                        {quickStats && quickStats.newCasesToday > 0 && (
                          <Badge bg="success" className="quick-stat-badge">
                            +{quickStats.newCasesToday}
                          </Badge>
                        )}
                      </>
                    )}
                  </span>
                </div>
              </div>
              
              <div className="quick-stat-item emergency-stat" onClick={() => navigate('/admin/cases/emergency')} style={{ cursor: 'pointer' }}>
                <span className="quick-stat-icon">🚨</span>
                <div className="quick-stat-content">
                  <span className="quick-stat-label">Emergency</span>
                  <span className="quick-stat-value emergency-blink">
                    {loadingQuickStats ? (
                      <Spinner animation="border" size="sm" />
                    ) : (
                      quickStats?.emergencyCases || 0
                    )}
                  </span>
                </div>
              </div>
              
              <div className="quick-stat-item" onClick={() => navigate('/admin/users')} style={{ cursor: 'pointer' }}>
                <span className="quick-stat-icon">👥</span>
                <div className="quick-stat-content">
                  <span className="quick-stat-label">Pending</span>
                  <span className="quick-stat-value">
                    {loadingQuickStats ? (
                      <Spinner animation="border" size="sm" />
                    ) : (
                      <>
                        {quickStats?.pendingApprovals || 0}
                        {quickStats && quickStats.pendingApprovals > 0 && (
                          <Badge bg="danger" className="quick-stat-badge">
                            {quickStats.pendingApprovals}
                          </Badge>
                        )}
                      </>
                    )}
                  </span>
                </div>
              </div>
            </div>
          )}

          <Navbar.Toggle 
            aria-controls="dashboard-nav" 
            onClick={() => setShowMobileMenu(true)}
            className="mobile-toggle"
          />

          <Navbar.Collapse id="dashboard-nav">
            <div className="header-right-section">
              {user?.role === 'PUBLIC' && (
                <div className="header-location-time">
                  <span className="location-icon">📍</span>
                  <span className="location-text">
                    {locationLoading ? (
                      <Spinner animation="border" size="sm" className="me-1" />
                    ) : (
                      liveLocation || userProfile?.city || userProfile?.address || (user as any)?.address || 'Location not set'
                    )}
                  </span>
                  <span className="time-icon ms-2">🕒</span>
                  <span className="time-text">{currentTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}</span>
                </div>
              )}

              <Dropdown align="end">
                <Dropdown.Toggle variant="link" className="user-info-toggle p-0">
                  <div className="user-info-container">
                    {user?.profileImage || userProfile?.profilePhoto ? (
                      <img 
                        src={user?.profileImage || userProfile?.profilePhoto} 
                        alt={user?.name || 'User'} 
                        className="user-profile-photo"
                      />
                    ) : (
                      <div className="user-profile-photo-placeholder">
                        {user?.name?.charAt(0).toUpperCase() || 'U'}
                      </div>
                    )}
                    <span className="user-name">{user?.name || 'User'}</span>
                    <span className="user-role-label">({getRoleDisplayName(user?.role || 'PUBLIC')})</span>
                    <span className="dropdown-arrow">▼</span>
                  </div>
                </Dropdown.Toggle>

                <Dropdown.Menu className="user-info-dropdown">
                  <Dropdown.Header className="user-info-dropdown-header">
                    <div className="user-info-name">
                      {user?.profileImage ? (
                        <img 
                          src={user.profileImage} 
                          alt={user.name || 'Admin'} 
                          className="avatar-img"
                          style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', border: '2px solid white' }}
                        />
                      ) : (
                        <div 
                          className="avatar-placeholder"
                          style={{ 
                            width: '48px', 
                            height: '48px', 
                            borderRadius: '50%', 
                            background: 'linear-gradient(135deg, #ffffff 0%, #f0f0f0 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#667eea',
                            fontSize: '1.5rem',
                            fontWeight: 'bold',
                            border: '2px solid white'
                          }}
                        >
                          {user?.name?.charAt(0).toUpperCase() || 'A'}
                        </div>
                      )}
                      <div>
                        <div className="user-full-name">{user?.name || 'User'}</div>
                        <div className="user-email">
                          {user?.role === 'ADMIN' ? 'Role: ADMIN' : user?.email || ''}
                        </div>
              </div>
            </div>
                  </Dropdown.Header>
                  <Dropdown.Divider />
                  <div className="user-info-details">
                    {user?.role !== 'ADMIN' && (
                      <>
                        <div className="user-detail-item">
                          <span className="detail-label">User Reference ID:</span>
                          <span className="detail-value">{user?.id || 'N/A'}</span>
                        </div>
                        <div className="user-detail-item">
                          <span className="detail-label">Last Login:</span>
                          <span className="detail-value">{formatLastLogin(userProfile?.lastLogin)}</span>
                        </div>
                      </>
                    )}
                    {user?.role === 'ADMIN' && (
                      <div className="user-detail-item">
                        <span className="detail-label">Role:</span>
                        <span className="detail-value">ADMIN</span>
                      </div>
                    )}
              </div>
                  <Dropdown.Divider />
                  {user?.role !== 'ADMIN' && (
                    <Dropdown.Item as={Link} to="/profile" className="dropdown-menu-item">
                      <span className="menu-icon">👤</span>
                      <span className="menu-text">View Profile</span>
                    </Dropdown.Item>
                  )}
                  <Dropdown.Item 
                    onClick={handleLogout} 
                    className="dropdown-menu-item logout-item"
                  >
                    <span className="menu-icon">🚪</span>
                    <span className="menu-text">Logout</span>
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>

              <NotificationDropdown 
                show={showNotifications}
                onToggle={(isOpen) => setShowNotifications(isOpen)}
                notifications={notifications}
                unreadCount={unreadCount}
                onMarkAsRead={handleNotificationClick}
                onMarkAllAsRead={handleMarkAllAsRead}
              />

              <Button
                variant="link"
                className="logout-btn p-0"
                onClick={handleLogout}
                title="Logout"
              >
                <span className="logout-icon">🚪</span>
              </Button>
            </div>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      {}
      <Offcanvas show={showMobileMenu} onHide={handleCloseMobileMenu} placement="end">
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>
            <div className="mobile-menu-header">
              <div className="user-avatar">
                {user.profileImage ? (
                  <img 
                    src={user.profileImage} 
                    alt={user.name} 
                    className="avatar-img"
                  />
                ) : (
                  <div className="avatar-placeholder">
                    {user.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                )}
              </div>
              <div className="mobile-user-info">
                <h6>{user.name || 'User'}</h6>
                <span className="user-role">{getRoleDisplayName(user.role)}</span>
              </div>
            </div>
          </Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <Nav className="flex-column mobile-nav">
            <Nav.Link as={Link} to={getDashboardPath()} onClick={handleCloseMobileMenu}>
              <i className="bi bi-speedometer2 me-2"></i>
              Dashboard Home
            </Nav.Link>
            <Nav.Link as={Link} to="/profile" onClick={handleCloseMobileMenu}>
              <i className="bi bi-person-circle me-2"></i>
              My Profile
            </Nav.Link>
            
            <hr className="my-2" />
            
            <h6 className="px-3 mt-3 text-muted">Quick Actions</h6>
            <Button 
              variant="primary" 
              className="mb-2"
              onClick={() => { handleQuickAction('report'); handleCloseMobileMenu(); }}
            >
              <i className="bi bi-file-earmark-plus me-2"></i>
              Report Case
            </Button>
            <Button 
              variant="warning" 
              className="mb-4"
              onClick={() => { handleQuickAction('help'); handleCloseMobileMenu(); }}
            >
              <i className="bi bi-question-circle me-2"></i>
              Request Help
            </Button>
            
            <hr className="my-2" />
            
            <Nav.Link as={Link} to="/notifications" onClick={handleCloseMobileMenu}>
              <i className="bi bi-bell me-2"></i>
              Notifications
              {unreadCount > 0 && (
                <Badge bg="danger" className="ms-2">
                  {unreadCount}
                </Badge>
              )}
            </Nav.Link>
            <Nav.Link as={Link} to="/settings" onClick={handleCloseMobileMenu}>
              <i className="bi bi-gear me-2"></i>
              Settings
            </Nav.Link>
            <Nav.Link as={Link} to="/help" onClick={handleCloseMobileMenu}>
              <i className="bi bi-question-circle me-2"></i>
              Help & Support
            </Nav.Link>
            
            <hr className="my-2" />
            
            <Button 
              variant="outline-danger" 
              onClick={handleLogout}
              className="mt-3"
            >
              <i className="bi bi-box-arrow-right me-2"></i>
              Logout
            </Button>
          </Nav>
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );
};

export default DashboardHeader;
