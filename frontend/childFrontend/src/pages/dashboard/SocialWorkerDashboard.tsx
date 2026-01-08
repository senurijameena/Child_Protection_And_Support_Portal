import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import { socialWorkerService } from '../../services/socialWorkerService';
import { transferService } from '../../services/transferService';
import { statusService } from '../../services/statusService';
import { notificationService } from '../../services/notificationService';
import { timelineService } from '../../services/timelineService';
import { api } from '../../services/api';
import { helpRequestService } from '../../services/helpRequestService';
import { adminService } from '../../services/adminService';
import { serviceOfferService } from '../../services/serviceOfferService';
import { messageService } from '../../services/messageService';
import './SocialWorkerDashboard.css';

interface SocialWorkerDashboardProps {
  // Add any props if needed
}

interface SocialWorkerProfile {
  id: string;
  name: string;
  workerId?: string;
  licenseNumber?: string;
  organization?: string;
  status?: string;
}

const SocialWorkerDashboard: React.FC<SocialWorkerDashboardProps> = () => {
  const navigate = useNavigate();
  const user = authService.getCurrentUser();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  
  const [profile, setProfile] = useState<SocialWorkerProfile | null>(null);
  
  const [myRequestsCount, setMyRequestsCount] = useState(0);
  const [assignedChildrenCount, setAssignedChildrenCount] = useState(0);
  const [messagesCount, setMessagesCount] = useState(0);
  const [transferRequestsCount, setTransferRequestsCount] = useState(0);
  const [notificationsCount, setNotificationsCount] = useState(0);
  const [emergencyAlertsCount, setEmergencyAlertsCount] = useState(0);
  const [currentWorkload, setCurrentWorkload] = useState(0);
  const [maxWorkload] = useState(10);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);

  // Close notifications dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showNotifications) {
        const target = event.target as HTMLElement;
        if (!target.closest('.notifications-wrapper')) {
          setShowNotifications(false);
        }
      }
    };

    if (showNotifications) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showNotifications]);
  
  const [currentStatus, setCurrentStatus] = useState<string>('AVAILABLE');
  
  const [activeRequestsCount, setActiveRequestsCount] = useState(0);
  const [urgentRequestsCount, setUrgentRequestsCount] = useState(0);
  const [workloadDistribution, setWorkloadDistribution] = useState<{ [key: string]: { current: number; max: number } }>({});
  const [recentActivity, setRecentActivity] = useState<Array<{ time: string; message: string; type?: string }>>([]);

  // My Requests state
  const [helpRequests, setHelpRequests] = useState<any[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<any[]>([]);
  const [requestFilter, setRequestFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [requestsPerPage] = useState(5);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user?.id) return;
      
      try {
        setLoading(true);
        
        try {
          const profileResponse = await socialWorkerService.getSocialWorkerProfile(user.id);
          if (profileResponse) {
            setProfile({
              id: user.id,
              name: user.name || profileResponse.name || 'Jane Smith',
              workerId: profileResponse.workerId || profileResponse.id || `SW-${user.id.slice(0, 3).toUpperCase()}`,
              licenseNumber: user.licenseNumber || profileResponse.licenseNumber,
              organization: profileResponse.organization || profileResponse.department || "Hope Children's Foundation",
              status: profileResponse.status
            });
          }
        } catch (error) {
          console.error('Error fetching profile:', error);
          setProfile({
            id: user.id,
            name: user.name || 'Jane Smith',
            workerId: `SW-${user.id.slice(0, 3).toUpperCase()}`,
            licenseNumber: user.licenseNumber,
            organization: "Hope Children's Foundation"
          });
        }

        try {
          const statusResponse = await statusService.getMyStatus();
          if (statusResponse?.data?.status) {
            const status = statusResponse.data.status.toUpperCase();
            if (status === 'AVAILABLE' || status === 'ONLINE') {
              setCurrentStatus('AVAILABLE');
            } else if (status === 'BUSY' || status === 'OCCUPIED') {
              setCurrentStatus('BUSY');
            } else if (status === 'OFF_DUTY' || status === 'OFFLINE' || status === 'OFF-DUTY') {
              setCurrentStatus('OFF_DUTY');
            } else {
              setCurrentStatus(status);
            }
          }
        } catch (error) {
          console.error('Error fetching status:', error);
        }

        try {
          const requestsResponse = await api.get(`/api/help-requests/worker/${user.id}`);
          const requests = Array.isArray(requestsResponse.data) ? requestsResponse.data : 
                         (requestsResponse.data?.data || requestsResponse.data?.requests || []);
          const activeRequests = requests.filter((r: any) => 
            r.status && !['COMPLETED', 'REJECTED', 'CLOSED'].includes(r.status.toUpperCase())
          );
          setMyRequestsCount(activeRequests.length);
          setActiveRequestsCount(activeRequests.length);
          
          const urgentRequests = activeRequests.filter((r: any) => 
            r.priority === 'HIGH' || r.priority === 'URGENT' || r.emergency === true
          );
          setUrgentRequestsCount(urgentRequests.length);
          setEmergencyAlertsCount(urgentRequests.length);
          
          // Calculate current workload (total active requests)
          setCurrentWorkload(activeRequests.length);
          
          const workload: { [key: string]: { current: number; max: number } } = {
            'Food': { current: 0, max: 10 },
            'Education': { current: 0, max: 10 },
            'Medical': { current: 0, max: 10 },
            'Shelter': { current: 0, max: 10 },
            'Counseling': { current: 0, max: 10 }
          };
          
          activeRequests.forEach((r: any) => {
            const helpType = r.helpType || r.serviceType || '';
            if (helpType) {
              const typeKey = helpType.split(' ')[0]; // Get first word
              if (workload[typeKey]) {
                workload[typeKey].current = Math.min(workload[typeKey].current + 1, workload[typeKey].max);
              } else if (helpType.toLowerCase().includes('food')) {
                workload['Food'].current = Math.min(workload['Food'].current + 1, workload['Food'].max);
              } else if (helpType.toLowerCase().includes('education')) {
                workload['Education'].current = Math.min(workload['Education'].current + 1, workload['Education'].max);
              } else if (helpType.toLowerCase().includes('medical')) {
                workload['Medical'].current = Math.min(workload['Medical'].current + 1, workload['Medical'].max);
              } else if (helpType.toLowerCase().includes('shelter')) {
                workload['Shelter'].current = Math.min(workload['Shelter'].current + 1, workload['Shelter'].max);
              } else if (helpType.toLowerCase().includes('counseling')) {
                workload['Counseling'].current = Math.min(workload['Counseling'].current + 1, workload['Counseling'].max);
              }
            }
          });
          setWorkloadDistribution(workload);
        } catch (error) {
          console.error('Error fetching my requests:', error);
        }

        // Fetch assigned children count (active assignments)
        try {
          const assignmentsResponse = await socialWorkerService.getActiveAssignments(user.id);
          const assignments = Array.isArray(assignmentsResponse) ? assignmentsResponse :
                            (assignmentsResponse?.data || assignmentsResponse?.assignments || []);
          setAssignedChildrenCount(assignments.length);
        } catch (error) {
          console.error('Error fetching assigned children:', error);
        }

        // Fetch unread messages/notifications count
        try {
          const notificationsResponse = await notificationService.getUnreadCount();
          setMessagesCount(notificationsResponse.data || 0);
          setNotificationsCount(notificationsResponse.data || 0);
        } catch (error) {
          console.error('Error fetching messages count:', error);
        }

        // Fetch transfer requests count
        try {
          const transfersResponse = await transferService.getPendingTransferCount();
          const count = transfersResponse?.data?.count || transfersResponse?.data || 0;
          setTransferRequestsCount(count);
        } catch (error) {
          console.error('Error fetching transfer requests:', error);
        }

        // Fetch recent activity
        try {
          const activityResponse = await timelineService.getRecentActivity(5);
          const activities = Array.isArray(activityResponse.data) ? activityResponse.data :
                            (activityResponse.data?.data || activityResponse.data?.activities || []);
          
          const formattedActivities = activities.map((activity: any) => {
            const date = activity.timestamp || activity.createdAt || new Date().toISOString();
            const time = new Date(date).toLocaleTimeString('en-US', { 
              hour: 'numeric', 
              minute: '2-digit', 
              hour12: true 
            });
            
            let message = activity.description || activity.message || activity.eventType || 'Activity';
            const isEmergency = activity.priority === 'HIGH' || activity.priority === 'URGENT' || activity.emergency;
            
            return {
              time,
              message,
              type: isEmergency ? 'emergency' : 'normal'
            };
          });
          
          // If no activities from API, create sample recent activity
          if (formattedActivities.length === 0) {
            const now = new Date();
            formattedActivities.push(
              {
                time: now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
                message: 'Dashboard loaded',
                type: 'normal'
              }
            );
          }
          
          setRecentActivity(formattedActivities);
        } catch (error) {
          console.error('Error fetching recent activity:', error);
          // Set default activity
          const now = new Date();
          setRecentActivity([{
            time: now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
            message: 'Welcome to your dashboard',
            type: 'normal'
          }]);
        }

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
    
    // Refresh data every 30 seconds
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, [user?.id]);

  const handleNavigation = (route: string) => {
    setActiveSection(route);
    // Handle navigation logic here
    console.log(`Navigating to: ${route}`);
  };

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  const handleNotifications = () => {
    setShowNotifications(!showNotifications);
    if (!showNotifications) {
      fetchNotifications();
    }
  };

  const fetchNotifications = async () => {
    try {
      setLoadingNotifications(true);
      const response = await notificationService.getNotifications();
      const notificationsList = response.data || [];
      setNotifications(notificationsList);
      // Update unread count
      const unreadCount = notificationsList.filter((n: any) => !n.read).length;
      setNotificationsCount(unreadCount);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setNotifications([]);
    } finally {
      setLoadingNotifications(false);
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await notificationService.markAsRead(notificationId);
      // Update local state
      setNotifications(prev => prev.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      ));
      // Update count
      setNotificationsCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleNotificationClick = (notification: any) => {
    if (!notification.read) {
      handleMarkAsRead(notification.id);
    }
    if (notification.actionUrl) {
      navigate(notification.actionUrl);
      setShowNotifications(false);
    }
  };

  const handleAnalytics = () => {
    navigate('/analytics');
  };

  const handleSettings = () => {
    navigate('/settings');
  };

  const fetchHelpRequests = async () => {
    if (!user?.id) return;
    try {
      const response = await api.get(`/api/help-requests/worker/${user.id}`);
      const requests = Array.isArray(response.data) ? response.data : 
                     (response.data?.data || response.data?.requests || []);
      setHelpRequests(requests);
    } catch (error) {
      console.error('Error fetching help requests:', error);
      // Fallback: try using helpRequestService
      try {
        const allRequests = await helpRequestService.getAllRequests();
        const myRequests = Array.isArray(allRequests.data) 
          ? allRequests.data.filter((r: any) => r.assignedWorkerId === user.id)
          : [];
        setHelpRequests(myRequests);
      } catch (err) {
        console.error('Error fetching requests via service:', err);
        setHelpRequests([]);
      }
    }
  };

  useEffect(() => {
    if (activeSection === 'my-requests' && user?.id) {
      fetchHelpRequests();
    }
  }, [activeSection, user?.id]);

  useEffect(() => {
    let filtered = [...helpRequests];

    // Apply status filter
    if (requestFilter !== 'all') {
      switch (requestFilter) {
        case 'active':
          filtered = filtered.filter(r => 
            r.status === 'ASSIGNED' || r.status === 'IN_PROGRESS' || r.status === 'UNDER_REVIEW'
          );
          break;
        case 'completed':
          filtered = filtered.filter(r => r.status === 'COMPLETED');
          break;
        case 'urgent':
          filtered = filtered.filter(r => 
            r.priority === 'HIGH' || r.priority === 'URGENT' || r.emergency === true
          );
          break;
        case 'pending':
          filtered = filtered.filter(r => r.status === 'ASSIGNED' || r.status === 'UNDER_REVIEW');
          break;
      }
    }

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(r =>
        r.trackingId?.toLowerCase().includes(query) ||
        r.helpType?.toLowerCase().includes(query) ||
        r.description?.toLowerCase().includes(query) ||
        r.gender?.toLowerCase().includes(query) ||
        r.approximateAge?.toLowerCase().includes(query)
      );
    }

    setFilteredRequests(filtered);
    setCurrentPage(1);
  }, [helpRequests, requestFilter, searchQuery]);

  // Check if a status transition is valid
  const isValidTransition = (fromStatus: string, toStatus: string): boolean => {
    // If status is not set or empty, allow any transition
    if (!fromStatus || fromStatus === '' || fromStatus === 'undefined') {
      return true;
    }
    
    // Can't transition to the same status
    if (fromStatus === toStatus) {
      return false;
    }
    
    // Valid transitions based on backend rules:
    // AVAILABLE → BUSY, OFF_DUTY, EMERGENCY_ONLY
    // BUSY → AVAILABLE, OFF_DUTY, EMERGENCY_ONLY
    // OFF_DUTY → AVAILABLE, EMERGENCY_ONLY (NOT BUSY!)
    // EMERGENCY_ONLY → AVAILABLE, BUSY, OFF_DUTY
    
    const fromUpper = fromStatus.toUpperCase();
    const toUpper = toStatus.toUpperCase();
    
    if (fromUpper === 'AVAILABLE') {
      return ['BUSY', 'OFF_DUTY', 'EMERGENCY_ONLY'].includes(toUpper);
    }
    if (fromUpper === 'BUSY') {
      return ['AVAILABLE', 'OFF_DUTY', 'EMERGENCY_ONLY'].includes(toUpper);
    }
    if (fromUpper === 'OFF_DUTY') {
      return ['AVAILABLE', 'EMERGENCY_ONLY'].includes(toUpper);
    }
    if (fromUpper === 'EMERGENCY_ONLY') {
      return ['AVAILABLE', 'BUSY', 'OFF_DUTY'].includes(toUpper);
    }
    
    // For unknown statuses, allow transition (let backend validate)
    return true;
  };

  const handleStatusChange = async (newStatus: string) => {
    // Prevent clicking the same status
    if (currentStatus === newStatus) {
      console.log('Status is already', newStatus);
      return;
    }

    // Check if transition is valid before making the request
    if (!isValidTransition(currentStatus, newStatus)) {
      let message = `Cannot change status from ${currentStatus} to ${newStatus}. `;
      if (currentStatus === 'OFF_DUTY' && newStatus === 'BUSY') {
        message += 'You must first change to AVAILABLE, then to BUSY.';
      } else {
        message += 'Please select a valid status transition.';
      }
      alert(message);
      return;
    }

    try {
      console.log(`[STATUS CHANGE] Attempting to change from ${currentStatus} to: ${newStatus}`);
      
      // Try POST methods first (they seem more reliable based on backend implementation)
      let response;
      let methodUsed = '';
      
      try {
      switch (newStatus) {
        case 'AVAILABLE':
          response = await statusService.setAvailable();
            methodUsed = 'POST /available';
          break;
        case 'BUSY':
          response = await statusService.setBusy();
            methodUsed = 'POST /busy';
          break;
        case 'OFF_DUTY':
          response = await statusService.setOffDuty();
            methodUsed = 'POST /off-duty';
          break;
        default:
            // Fallback to PUT method
            response = await statusService.changeOwnStatus({
              newStatus: newStatus
            });
            methodUsed = 'PUT /change';
        }
        console.log(`[STATUS CHANGE] Response from ${methodUsed}:`, response);
      } catch (postError: any) {
        console.error(`[STATUS CHANGE] POST method failed:`, postError);
        // Fallback to PUT method
        try {
          console.log('[STATUS CHANGE] Trying PUT method as fallback...');
          response = await statusService.changeOwnStatus({
            newStatus: newStatus
          });
          methodUsed = 'PUT /change (fallback)';
          console.log(`[STATUS CHANGE] Response from ${methodUsed}:`, response);
        } catch (putError: any) {
          console.error('[STATUS CHANGE] PUT method also failed:', putError);
          throw putError;
        }
      }
      
      // Handle response - check both response.data and direct response
      const result = response?.data || response;
      console.log('[STATUS CHANGE] Final result:', result);
      
      // Check if the response indicates success
      if (result) {
        // Check for explicit success field
        if (result.success === true || result.success === undefined) {
          // Success - update local state
        setCurrentStatus(newStatus);
          if (profile) {
            setProfile({ ...profile, status: newStatus });
          }
          console.log(`[STATUS CHANGE] ✅ Status successfully updated to ${newStatus}`);
          
          // Refresh status from server to confirm
          setTimeout(async () => {
            try {
              const statusResponse = await statusService.getMyStatus();
              console.log('[STATUS CHANGE] Refreshed status from server:', statusResponse?.data);
              if (statusResponse?.data?.currentStatus) {
                const serverStatus = statusResponse.data.currentStatus.toString().toUpperCase();
                if (serverStatus !== newStatus) {
                  console.warn(`[STATUS CHANGE] Status mismatch! Expected ${newStatus}, got ${serverStatus}`);
                }
                setCurrentStatus(serverStatus);
              }
            } catch (refreshError) {
              console.warn('[STATUS CHANGE] Could not refresh status from server:', refreshError);
            }
          }, 500);
        } else if (result.success === false) {
          throw new Error(result?.message || 'Failed to update status');
        } else {
          // No explicit success field, but we got a response - assume success
          setCurrentStatus(newStatus);
          if (profile) {
            setProfile({ ...profile, status: newStatus });
          }
          console.log(`[STATUS CHANGE] Status updated to ${newStatus} (no explicit success field)`);
        }
      } else {
        throw new Error('No response received from server');
      }
    } catch (error: any) {
      console.error('[STATUS CHANGE] ❌ Error updating status:', error);
      console.error('[STATUS CHANGE] Error details:', {
        message: error?.message,
        response: error?.response?.data,
        status: error?.response?.status,
        statusText: error?.response?.statusText,
        config: error?.config
      });
      
      let errorMessage = 'Failed to update status. ';
      if (error?.response?.status === 401) {
        errorMessage += 'You are not authenticated. Please log in again.';
      } else if (error?.response?.status === 403) {
        errorMessage += 'You do not have permission to change status.';
      } else if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      alert(`Error: ${errorMessage}`);
    }
  };

  const sidebarMenuItems = [
    { id: 'dashboard', icon: '📊', label: 'DASHBOARD', count: null },
    { id: 'my-requests', icon: '📋', label: 'MY REQUESTS', count: myRequestsCount },
    { id: 'messages', icon: '📨', label: 'MESSAGES', count: messagesCount },
    { id: 'transfer-requests', icon: '🔄', label: 'TRANSFER REQUESTS', count: transferRequestsCount },
    { id: 'service-packages', icon: '📦', label: 'SERVICE PACKAGES', count: null },
  ];

  return (
    <div className="social-worker-dashboard">
      {/* Top Header Bar */}
      <header className="dashboard-top-header">
          <div className="header-left">
          <span className="logo-icon">🏠</span>
          <span className="logo-text">CHILD PROTECTION & SUPPORT PORTAL</span>
          </div>
          <div className="header-right">
          <div className="user-info-header">
            <span className="user-icon">👤</span>
            <span className="user-name">{user?.name || 'Jane Smith'}</span>
          </div>
          <div className="notifications-wrapper" style={{ position: 'relative' }}>
            <button 
              className="header-action-btn notifications-btn" 
              onClick={handleNotifications}
              title="Notifications"
            >
              <span className="action-icon">🔔</span>
              {notificationsCount > 0 && (
                <span className="notification-badge">{notificationsCount}</span>
              )}
            </button>
            
            {showNotifications && (
              <NotificationsDropdown
                notifications={notifications}
                loading={loadingNotifications}
                onNotificationClick={handleNotificationClick}
                onMarkAsRead={handleMarkAsRead}
                onClose={() => setShowNotifications(false)}
                onRefresh={fetchNotifications}
              />
            )}
          </div>
            <button 
            className="header-action-btn analytics-btn" 
            onClick={handleAnalytics}
            title="Analytics"
            >
            <span className="action-icon">📊</span>
            </button>
            <button 
            className="header-action-btn settings-btn" 
            onClick={handleSettings}
            title="Settings"
            >
            <span className="action-icon">⚙️</span>
            </button>
            <button 
            className="header-action-btn logout-btn" 
            onClick={handleLogout}
            title="Logout"
          >
            <span className="action-icon">🚪</span>
            <span className="logout-text">Logout</span>
          </button>
        </div>
      </header>

      {/* Main Layout Container */}
      <div className="dashboard-layout-container">
        {/* Fixed Sidebar */}
        <aside className="dashboard-sidebar">
          {/* Profile Section */}
          <div className="sidebar-profile-section">
            <div className="profile-header">
              <div className="profile-name-id">
                <span className="profile-icon">👤</span>
                <div className="profile-info">
                  <div className="profile-name">{profile?.name || user?.name || 'Jane Doe'}</div>
              {profile?.licenseNumber && (
                    <div className="profile-license">
                  <span className="detail-icon">⭐</span>
                  <span className="detail-text">Licensed Social Worker</span>
                </div>
              )}
                  <div className="profile-id-org">
                    <span className="profile-id-badge">🆔 {profile?.workerId || `SW-${user?.id?.slice(0, 3).toUpperCase() || '001'}`}</span>
                    <span className="profile-org-badge">🏢 {profile?.organization || "Hope Foundation"}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="sidebar-divider"></div>

          {/* Navigation Menu */}
          <nav className="sidebar-nav">
            {sidebarMenuItems.map((item) => (
              <button
                key={item.id}
                className={`sidebar-nav-item ${activeSection === item.id ? 'active' : ''}`}
                onClick={() => handleNavigation(item.id)}
              >
                <span className="sidebar-icon">{item.icon}</span>
                <span className="sidebar-label">{item.label}</span>
                {item.count !== null && item.count !== undefined && item.count > 0 && (
                  <span className="sidebar-count">({item.count})</span>
                )}
            </button>
            ))}
          </nav>

          {/* Emergency Alerts Section */}
          {emergencyAlertsCount > 0 && (
            <>
              <div className="sidebar-divider"></div>
              <div className="sidebar-emergency-section">
                <button
                  className="sidebar-nav-item emergency-alert-item"
                  onClick={() => {
                    setRequestFilter('urgent');
                    setActiveSection('my-requests');
                  }}
                >
                  <span className="sidebar-icon">🆘</span>
                  <span className="sidebar-label">EMERGENCY ALERTS</span>
                  <span className="sidebar-count emergency-count">({emergencyAlertsCount})</span>
                </button>
              </div>
            </>
          )}

          {/* Workload Indicator */}
          <div className="sidebar-divider"></div>
          <div className="sidebar-workload-section">
            <div className="workload-label">📊 WORKLOAD:</div>
            <div className="workload-value">{currentWorkload}/{maxWorkload}</div>
            <div className="workload-bar-container">
              <div 
                className="workload-bar" 
                style={{ width: `${Math.min((currentWorkload / maxWorkload) * 100, 100)}%` }}
              ></div>
            </div>
          </div>
        </aside>

        {/* Dynamic Main Content Area */}
        <main className="dashboard-main-content">
        <div className="content-wrapper">
            {loading && (
              <div className="dashboard-loading">
                <p>Loading dashboard data...</p>
              </div>
            )}
            {!loading && activeSection === 'dashboard' && (
              <div className="dashboard-main-view">
                {/* Dashboard Header */}
                <div className="dashboard-header-section">
                  <h1 className="dashboard-title">📊 SOCIAL WORKER DASHBOARD</h1>
                  <p className="dashboard-subtitle">
                    Welcome back, {profile?.name?.split(' ')[0] || user?.name?.split(' ')[0] || 'Jane'}! Here's your overview.
                  </p>
                </div>

                {/* Quick Stats Cards */}
                <div className="quick-stats-section">
                  <div className="stats-grid">
                    <div className="stat-card stat-card-primary">
                      <div className="stat-value">{activeRequestsCount}</div>
                      <div className="stat-label">Active Requests</div>
                    </div>
                    <div className="stat-card stat-card-warning">
                      <div className="stat-value">{urgentRequestsCount}</div>
                      <div className="stat-label">Urgent Requests</div>
                    </div>
                    <div className="stat-card stat-card-success">
                      <div className="stat-value">{transferRequestsCount}</div>
                      <div className="stat-label">Transfer Requests</div>
                    </div>
                  </div>
                </div>

                {/* Workload Distribution */}
                <div className="workload-section">
                  <div className="section-card">
                    <h2 className="section-title">📈 WORKLOAD DISTRIBUTION</h2>
                    <div className="workload-chart">
                      {Object.entries(workloadDistribution).map(([serviceType, data]) => {
                        const percentage = (data.current / data.max) * 100;
                        return (
                          <div key={serviceType} className="workload-item">
                            <div className="workload-label">{serviceType}:</div>
                            <div className="workload-bar-container">
                              <div 
                                className="workload-bar" 
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                            <div className="workload-value">{data.current}/{data.max}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Recent Activity & Alerts */}
                <div className="activity-section">
                  <div className="section-card">
                    <h2 className="section-title">🚨 RECENT ACTIVITY & ALERTS</h2>
                    <div className="activity-list">
                      {recentActivity.length > 0 ? (
                        recentActivity.map((activity, index) => (
                          <div 
                            key={index} 
                            className={`activity-item ${activity.type === 'emergency' ? 'activity-emergency' : ''}`}
                          >
                            <span className="activity-time">{activity.time}</span>
                            <span className="activity-message">
                              {activity.type === 'emergency' && '🔴 '}
                              {activity.message}
                            </span>
                          </div>
                        ))
                      ) : (
                        <div className="activity-item">
                          <span className="activity-time">--:--</span>
                          <span className="activity-message">No recent activity</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
            {!loading && activeSection === 'my-requests' && (
              <MyRequestsSection
                user={user}
                requests={filteredRequests}
                filter={requestFilter}
                searchQuery={searchQuery}
                onFilterChange={setRequestFilter}
                onSearchChange={setSearchQuery}
                currentPage={currentPage}
                requestsPerPage={requestsPerPage}
                onPageChange={setCurrentPage}
                onRefresh={() => fetchHelpRequests()}
              />
            )}
            {!loading && activeSection === 'transfer-requests' && (
              <TransferRequestsSection
                user={user}
                onRefresh={() => {}}
              />
            )}
            {!loading && activeSection === 'service-packages' && (
              <ServicePackagesSection
                user={user}
              />
            )}
            {!loading && activeSection === 'messages' && (
              <MessagesSection
                user={user}
              />
            )}
            {!loading && activeSection === 'analytics' && (
              <div>
                <h1>Analytics</h1>
                <p>Analytics content will appear here.</p>
              </div>
            )}
            {!loading && activeSection === 'profile' && (
              <div>
                <h1>Profile</h1>
                <p>Profile content will appear here.</p>
              </div>
            )}
            {!loading && activeSection === 'feedback' && (
              <div>
                <h1>Feedback</h1>
                <p>Feedback content will appear here.</p>
              </div>
            )}
        </div>
      </main>
      </div>
    </div>
  );
};

// My Requests Section Component
interface MyRequestsSectionProps {
  user: any;
  requests: any[];
  filter: string;
  searchQuery: string;
  onFilterChange: (filter: string) => void;
  onSearchChange: (query: string) => void;
  currentPage: number;
  requestsPerPage: number;
  onPageChange: (page: number) => void;
  onRefresh: () => void;
}

const MyRequestsSection: React.FC<MyRequestsSectionProps> = ({
  requests,
  filter,
  searchQuery,
  onFilterChange,
  onSearchChange,
  currentPage,
  requestsPerPage,
  onPageChange,
  onRefresh
}) => {
  const navigate = useNavigate();
  const [selectedRequest, setSelectedRequest] = useState<any | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [requestDetails, setRequestDetails] = useState<any | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const getHelpTypeIcon = (helpType: string) => {
    const type = helpType?.toUpperCase() || '';
    if (type.includes('FOOD')) return '🍎';
    if (type.includes('EDUCATION')) return '🏫';
    if (type.includes('MEDICAL')) return '🏥';
    if (type.includes('SHELTER')) return '🏠';
    if (type.includes('COUNSELING')) return '💬';
    return '📋';
  };


  const handleAccept = async (requestId: string) => {
    try {
      await helpRequestService.updateStatus(requestId, 'IN_PROGRESS');
      onRefresh();
    } catch (error) {
      console.error('Error accepting request:', error);
      alert('Failed to accept request');
    }
  };

  const handleReject = async (requestId: string) => {
    if (!confirm('Are you sure you want to reject this request?')) return;
    try {
      await helpRequestService.updateStatus(requestId, 'REJECTED');
      onRefresh();
    } catch (error) {
      console.error('Error rejecting request:', error);
      alert('Failed to reject request');
    }
  };

  const handleComplete = async (requestId: string) => {
    try {
      await helpRequestService.updateStatus(requestId, 'COMPLETED');
      onRefresh();
    } catch (error) {
      console.error('Error completing request:', error);
      alert('Failed to complete request');
    }
  };

  const handleTransfer = (requestId: string) => {
    navigate(`/transfers/request?helpRequestId=${requestId}`);
  };

  const handleViewDetails = async (requestId: string) => {
    const request = requests.find(r => r.id === requestId);
    if (request) {
      setSelectedRequest(request);
      setShowDetailsModal(true);
      setLoadingDetails(true);
      
      // Fetch full request details
      try {
        const response = await helpRequestService.getHelpRequest(requestId);
        setRequestDetails(response.data || request);
      } catch (error) {
        console.error('Error fetching request details:', error);
        // Use the request data we already have
        setRequestDetails(request);
      } finally {
        setLoadingDetails(false);
      }
    }
  };

  const handleCloseModal = () => {
    setShowDetailsModal(false);
    setSelectedRequest(null);
    setRequestDetails(null);
  };

  const handleUpdate = (requestId: string) => {
    navigate(`/help-requests/${requestId}?action=update`);
  };

  // Calculate statistics
  const totalRequests = requests.length;
  const activeRequests = requests.filter(r => 
    r.status === 'IN_PROGRESS' || r.status === 'ASSIGNED' || r.status === 'UNDER_REVIEW'
  ).length;
  const urgentRequests = requests.filter(r => 
    (r.priority === 'HIGH' || r.priority === 'URGENT' || r.emergency === true) &&
    (r.status === 'IN_PROGRESS' || r.status === 'ASSIGNED' || r.status === 'UNDER_REVIEW')
  ).length;
  const pendingRequests = requests.filter(r => 
    r.status === 'ASSIGNED' || r.status === 'UNDER_REVIEW'
  ).length;
  const completedRequests = requests.filter(r => 
    r.status === 'COMPLETED'
  ).length;

  // Pagination
  const indexOfLastRequest = currentPage * requestsPerPage;
  const indexOfFirstRequest = indexOfLastRequest - requestsPerPage;
  const currentRequests = requests.slice(indexOfFirstRequest, indexOfLastRequest);
  const totalPages = Math.ceil(requests.length / requestsPerPage);

  const getStatusDisplay = (status: string, priority?: string) => {
    const statusUpper = status?.toUpperCase() || '';
    const isUrgent = priority === 'HIGH' || priority === 'URGENT';
    
    if (isUrgent && (statusUpper === 'ASSIGNED' || statusUpper === 'IN_PROGRESS')) {
      return <span className="table-status-badge status-urgent">🔴 URGENT</span>;
    }
    
    switch (statusUpper) {
      case 'IN_PROGRESS':
        return <span className="table-status-badge status-active">🟢 ACTIVE</span>;
      case 'ASSIGNED':
        return <span className="table-status-badge status-pending">🟡 PENDING</span>;
      case 'UNDER_REVIEW':
        return <span className="table-status-badge status-pending">🟡 PENDING</span>;
      case 'COMPLETED':
        return <span className="table-status-badge status-completed">✅ COMPLETED</span>;
      default:
        return <span className="table-status-badge status-default">{status}</span>;
    }
  };

  const formatTimeDisplay = (dateString?: string) => {
    if (!dateString) return 'Just now';
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      const diffWeeks = Math.floor(diffDays / 7);

      if (diffMins < 1) return '⏰ Just now';
      if (diffMins < 60) return `${diffMins} ${diffMins === 1 ? 'minute' : 'minutes'} ago`;
      if (diffHours < 24) return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
      if (diffDays === 1) return '1 day ago';
      if (diffDays < 7) return `${diffDays} days ago`;
      if (diffWeeks === 1) return '1 week ago';
      if (diffWeeks < 4) return `${diffWeeks} weeks ago`;
      return date.toLocaleDateString();
    } catch {
      return 'Just now';
    }
  };

  return (
    <div className="my-requests-section">
      <div className="requests-header">
        <h1 className="requests-title">
          📋 MY HELP REQUESTS ({totalRequests})
        </h1>
        <p className="requests-subtitle">Manage all help requests assigned to you</p>
      </div>

      <div className="requests-filters">
        <div className="filter-buttons">
          <button
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => onFilterChange('all')}
          >
            📁 All Requests
          </button>
          <button
            className={`filter-btn ${filter === 'active' ? 'active' : ''}`}
            onClick={() => onFilterChange('active')}
          >
            🔄 Active ({activeRequests})
          </button>
          <button
            className={`filter-btn ${filter === 'completed' ? 'active' : ''}`}
            onClick={() => onFilterChange('completed')}
          >
            ✅ Completed ({completedRequests})
          </button>
          <button
            className={`filter-btn ${filter === 'urgent' ? 'active' : ''}`}
            onClick={() => onFilterChange('urgent')}
          >
            ⚠️ Urgent ({urgentRequests})
          </button>
          <button
            className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
            onClick={() => onFilterChange('pending')}
          >
            📤 Pending ({pendingRequests})
          </button>
        </div>
        <div className="search-box">
          <input
            type="text"
            placeholder="🔍 Search by ID, type..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      <div className="requests-table-wrapper">
        <div className="requests-table-header">
          <h3>REQUEST TABLE</h3>
        </div>
        {currentRequests.length === 0 ? (
          <div className="no-requests">
            <p>No requests found matching your criteria.</p>
          </div>
        ) : (
          <table className="requests-table">
            <thead>
              <tr>
                <th className="col-checkbox">🔴</th>
                <th className="col-id">ID</th>
                <th className="col-type">Type</th>
                <th className="col-age">Age</th>
                <th className="col-status">Status</th>
                <th className="col-time">Time</th>
                <th className="col-actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentRequests.map((request) => {
                const isUrgent = (request.priority === 'HIGH' || request.priority === 'URGENT') &&
                  (request.status === 'ASSIGNED' || request.status === 'IN_PROGRESS');
                return (
                  <tr key={request.id} className={isUrgent ? 'row-urgent' : ''}>
                    <td className="col-checkbox">
                      {isUrgent ? '🔴' : '◯'}
                    </td>
                    <td className="col-id">
                      {request.trackingId || `HELP-${request.id?.slice(0, 4).toUpperCase() || '0000'}`}
                    </td>
                    <td className="col-type">
                      {getHelpTypeIcon(request.helpType || request.helpTypes?.[0])} {request.helpType || request.helpTypes?.[0] || 'General'}
                    </td>
                    <td className="col-age">
                      {request.gender || 'N/A'}, {request.approximateAge || 'N/A'}
                    </td>
                    <td className="col-status">
                      {getStatusDisplay(request.status, request.priority)}
                    </td>
                    <td className="col-time">
                      {formatTimeDisplay(request.lastUpdated || request.requestDate)}
                    </td>
                    <td className="col-actions">
                      <div className="table-action-buttons">
                        {request.status === 'ASSIGNED' || request.status === 'UNDER_REVIEW' ? (
                          <>
                            <button
                              className="table-action-btn accept-btn"
                              onClick={() => handleAccept(request.id)}
                              title="Accept Request"
                            >
                              ✅ Accept
                            </button>
                            <button
                              className="table-action-btn reject-btn"
                              onClick={() => handleReject(request.id)}
                              title="Reject Request"
                            >
                              ❌ Reject
                            </button>
                            <button
                              className="table-action-btn details-btn"
                              onClick={() => handleViewDetails(request.id)}
                              title="View Details"
                            >
                              📁 Details
                            </button>
                            {isUrgent && (
                              <button
                                className="table-action-btn emergency-btn"
                                onClick={() => handleViewDetails(request.id)}
                                title="Emergency Details"
                              >
                                🆘 Emergency
                              </button>
                            )}
                          </>
                        ) : request.status === 'IN_PROGRESS' ? (
                          <>
                            <button
                              className="table-action-btn update-btn"
                              onClick={() => handleUpdate(request.id)}
                              title="Update Request"
                            >
                              📝 Update
                            </button>
                            <button
                              className="table-action-btn details-btn"
                              onClick={() => handleViewDetails(request.id)}
                              title="View Details"
                            >
                              📁 Details
                            </button>
                            <button
                              className="table-action-btn transfer-btn"
                              onClick={() => handleTransfer(request.id)}
                              title="Transfer Request"
                            >
                              📤 Transfer
                            </button>
                            <button
                              className="table-action-btn complete-btn"
                              onClick={() => handleComplete(request.id)}
                              title="Complete Request"
                            >
                              ✅ Complete
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              className="table-action-btn details-btn"
                              onClick={() => handleViewDetails(request.id)}
                              title="View Details"
                            >
                              📁 Details
                            </button>
                            {request.status !== 'COMPLETED' && (
                              <>
                                <button
                                  className="table-action-btn update-btn"
                                  onClick={() => handleUpdate(request.id)}
                                  title="Update Request"
                                >
                                  📝 Update
                                </button>
                                <button
                                  className="table-action-btn transfer-btn"
                                  onClick={() => handleTransfer(request.id)}
                                  title="Transfer Request"
                                >
                                  📤 Transfer
                                </button>
                                <button
                                  className="table-action-btn complete-btn"
                                  onClick={() => handleComplete(request.id)}
                                  title="Complete Request"
                                >
                                  ✅ Complete
                                </button>
                              </>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <div className="requests-statistics">
        <div className="statistics-header">
          <h3>📊 REQUEST STATISTICS</h3>
        </div>
        <div className="statistics-grid">
          <div className="stat-item">
            <div className="stat-label">Total</div>
            <div className="stat-value">{totalRequests}</div>
          </div>
          <div className="stat-item">
            <div className="stat-label">Active</div>
            <div className="stat-value">{activeRequests}</div>
          </div>
          <div className="stat-item">
            <div className="stat-label">Urgent</div>
            <div className="stat-value">{urgentRequests}</div>
          </div>
          <div className="stat-item">
            <div className="stat-label">Pending</div>
            <div className="stat-value">{pendingRequests}</div>
          </div>
          <div className="stat-item">
            <div className="stat-label">Completed</div>
            <div className="stat-value">{completedRequests}</div>
          </div>
        </div>
        <div className="statistics-footer">
          <button className="analytics-btn">View Detailed Analytics →</button>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          <span className="pagination-info">
            Page {currentPage} of {totalPages}
          </span>
          <div className="page-numbers">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                className={`page-number ${currentPage === page ? 'active' : ''}`}
                onClick={() => onPageChange(page)}
              >
                {page}
              </button>
            ))}
          </div>
          <button
            className="page-btn"
            disabled={currentPage === totalPages}
            onClick={() => onPageChange(currentPage + 1)}
          >
            →
          </button>
        </div>
      )}

      {/* Request Details Modal */}
      {showDetailsModal && (
        <RequestDetailsModal
          request={requestDetails || selectedRequest}
          loading={loadingDetails}
          onClose={handleCloseModal}
          onAccept={handleAccept}
          onReject={handleReject}
          onTransfer={handleTransfer}
        />
      )}
    </div>
  );
};

// Messages Section Component
interface MessagesSectionProps {
  user: any;
}

const MessagesSection: React.FC<MessagesSectionProps> = ({
  user
}) => {
  const navigate = useNavigate();
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<any | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchConversations();
  }, [user]);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.participantId);
      // Mark messages as read
      messages.forEach((msg) => {
        if (!msg.read && msg.fromUserId !== user.id) {
          messageService.markAsRead(msg.id);
        }
      });
    }
  }, [selectedConversation]);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const response = await messageService.getConversations();
      setConversations(response.data || []);
      // Auto-select first conversation if available
      if (response.data && response.data.length > 0 && !selectedConversation) {
        setSelectedConversation(response.data[0]);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
      // Use mock data for development
      setConversations([
        {
          participantId: 'user1',
          participantName: "David's Family",
          relatedRequestId: 'HELP-0456',
          relatedRequestType: 'Food Assistance',
          lastMessage: "Thanks for the groceries!",
          lastMessageTime: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          unreadCount: 3
        },
        {
          participantId: 'user2',
          participantName: "Sophia's Mother",
          relatedRequestId: 'HELP-0457',
          relatedRequestType: 'Education',
          lastMessage: "When can we schedule tutoring?",
          lastMessageTime: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
          unreadCount: 1
        },
        {
          participantId: 'sw-002',
          participantName: 'John (SW-002)',
          relatedRequestId: null,
          relatedRequestType: null,
          lastMessage: "Can you take my shelter case?",
          lastMessageTime: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
          unreadCount: 0
        },
        {
          participantId: 'admin',
          participantName: 'Admin (System)',
          relatedRequestId: null,
          relatedRequestType: null,
          lastMessage: "New request assigned",
          lastMessageTime: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
          unreadCount: 0
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (participantId: string) => {
    try {
      const response = await messageService.getConversationMessages(participantId);
      setMessages(response.data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
      // Use mock data for development
      if (participantId === 'user1') {
        setMessages([
          {
            id: '1',
            fromUserId: 'user1',
            message: "The groceries arrived, thank you so much!",
            sentAt: new Date(Date.now() - 24 * 60 * 60 * 1000 - 30 * 60 * 1000).toISOString(),
            read: true
          },
          {
            id: '2',
            fromUserId: user.id,
            message: "You're welcome! I'll check in next week.",
            sentAt: new Date(Date.now() - 24 * 60 * 60 * 1000 - 15 * 60 * 1000).toISOString(),
            read: true
          },
          {
            id: '3',
            fromUserId: 'user1',
            message: "Do you have information about school meal programs?",
            sentAt: new Date(Date.now() - 10 * 60 * 60 * 1000 - 45 * 60 * 1000).toISOString(),
            read: false
          }
        ]);
      } else {
        setMessages([]);
      }
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || sending) return;

    try {
      setSending(true);
      await messageService.sendConversationMessage(selectedConversation.participantId, {
        message: newMessage.trim(),
        relatedRequestId: selectedConversation.relatedRequestId
      });
      setNewMessage('');
      // Refresh messages
      await fetchMessages(selectedConversation.participantId);
      // Refresh conversations to update last message
      await fetchConversations();
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const formatTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins} ${diffMins === 1 ? 'minute' : 'minutes'} ago`;
      if (diffHours < 24) return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
      if (diffDays === 1) return 'Yesterday';
      if (diffDays < 7) return `${diffDays} days ago`;
      return date.toLocaleDateString();
    } catch {
      return 'Just now';
    }
  };

  const formatMessageTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffDays === 0) {
        return `Today ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`;
      } else if (diffDays === 1) {
        return `Yesterday ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`;
      } else {
        return date.toLocaleString('en-US', { 
          month: 'short', 
          day: 'numeric', 
          hour: 'numeric', 
          minute: '2-digit', 
          hour12: true 
        });
      }
    } catch {
      return 'Just now';
    }
  };

  const handleQuickResponse = (response: string) => {
    setNewMessage(response);
  };

  const handleCall = () => {
    alert('Call feature coming soon');
  };

  const handleApplyPackage = () => {
    if (selectedConversation?.relatedRequestId) {
      navigate(`/service-packages/apply?requestId=${selectedConversation.relatedRequestId}`);
    } else {
      alert('No related request found for this conversation');
    }
  };

  if (loading) {
    return <div className="loading">Loading messages...</div>;
  }

  return (
    <div className="messages-section">
      <div className="messages-header">
        <h1 className="messages-title">
          📨 MESSAGES
        </h1>
        <p className="messages-subtitle">Communicate with families and colleagues</p>
      </div>

      <div className="messages-container">
        {/* Conversation List */}
        <div className="conversations-panel">
          <h3 className="conversations-title">CONVERSATION LIST</h3>
          <div className="conversations-list">
            {conversations.length === 0 ? (
              <div className="no-conversations">No conversations found</div>
            ) : (
              conversations.map((conv) => (
                <div
                  key={conv.participantId}
                  className={`conversation-item ${selectedConversation?.participantId === conv.participantId ? 'active' : ''}`}
                  onClick={() => setSelectedConversation(conv)}
                >
                  <div className="conversation-header">
                    <span className="conversation-icon">👤</span>
                    <div className="conversation-info">
                      <div className="conversation-name">
                        {conv.participantName}
                        {conv.relatedRequestId && ` • ${conv.relatedRequestId}`}
                      </div>
                    </div>
                  </div>
                  <div className="conversation-last-message">
                    {conv.lastMessage}
                  </div>
                  <div className="conversation-meta">
                    <span className="conversation-time">⏰ {formatTime(conv.lastMessageTime)}</span>
                    {conv.unreadCount > 0 && (
                      <span className="unread-badge">🔵 {conv.unreadCount} unread</span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Active Conversation */}
        <div className="conversation-panel">
          {selectedConversation ? (
            <>
              <div className="conversation-header-panel">
                <h3 className="conversation-title">
                  👤 {selectedConversation.participantName}
                  {selectedConversation.relatedRequestId && ` • ${selectedConversation.relatedRequestId}`}
                  {selectedConversation.relatedRequestType && ` • ${selectedConversation.relatedRequestType}`}
                </h3>
              </div>
              <div className="messages-area">
                {messages.length === 0 ? (
                  <div className="no-messages">No messages yet. Start the conversation!</div>
                ) : (
                  messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`message-bubble ${msg.fromUserId === user.id ? 'sent' : 'received'}`}
                    >
                      <div className="message-sender">
                        {msg.fromUserId === user.id ? '👤 You' : '👤 Them'} ({formatMessageTime(msg.sentAt)}):
                      </div>
                      <div className="message-text">{msg.message}</div>
                    </div>
                  ))
                )}
              </div>
              <div className="message-actions">
                <button className="message-action-btn" onClick={() => alert('Attach file feature coming soon')}>
                  📎 Attach
                </button>
                <button className="message-action-btn" onClick={() => {
                  const response = prompt('Quick Responses:\n1. I\'ll get back to you soon.\n2. Thank you for your message.\n3. Let me check on that for you.\n\nOr type your own:');
                  if (response) handleQuickResponse(response);
                }}>
                  📋 Quick Responses
                </button>
                <button className="message-action-btn" onClick={handleCall}>
                  📞 Call
                </button>
                {selectedConversation.relatedRequestId && (
                  <button className="message-action-btn" onClick={handleApplyPackage}>
                    🎯 Apply Package
                  </button>
                )}
              </div>
              <div className="message-input-area">
                <textarea
                  className="message-input"
                  placeholder="Type your message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  rows={3}
                />
                <button
                  className="send-message-btn"
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() || sending}
                >
                  Send
                </button>
              </div>
            </>
          ) : (
            <div className="no-conversation-selected">
              <p>Select a conversation to start messaging</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Service Packages Section Component
interface ServicePackagesSectionProps {
  user: any;
}

const ServicePackagesSection: React.FC<ServicePackagesSectionProps> = ({
  user
}) => {
  const navigate = useNavigate();
  const [packages, setPackages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedPackageId, setSelectedPackageId] = useState<string | null>(null);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [createTemplate, setCreateTemplate] = useState<string | null>(null);

  useEffect(() => {
    fetchPackages();
  }, [user]);

  const fetchPackages = async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      // Fetch service offers created by this worker
      const response = await serviceOfferService.getOffersByWorker(user.id);
      // Filter to get active packages (you may need to adjust this based on your data structure)
      const activePackages = (response.data || []).filter((pkg: any) => 
        pkg.status === 'ACTIVE' || pkg.status === 'PENDING' || !pkg.status
      );
      setPackages(activePackages);
    } catch (error) {
      console.error('Error fetching packages:', error);
      // For now, use mock data if API fails
      setPackages([
        {
          id: '1',
          name: 'FOOD ASSISTANCE PACKAGE',
          helpType: 'FOOD',
          ageRange: '0-18',
          gender: 'All',
          priority: 'Medium',
          services: ['Weekly groceries', 'nutrition counseling', 'meal planning']
        },
        {
          id: '2',
          name: 'EDUCATION SUPPORT PACKAGE',
          helpType: 'EDUCATION',
          ageRange: '6-18',
          gender: 'All',
          priority: 'Medium',
          services: ['Tutoring', 'school supplies', 'scholarship assistance']
        },
        {
          id: '3',
          name: 'EMERGENCY SHELTER PACKAGE',
          helpType: 'SHELTER',
          ageRange: '0-18',
          gender: 'All',
          priority: 'Urgent',
          services: ['7-night shelter', 'hygiene kit', 'food voucher', 'assessment']
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getHelpTypeIcon = (helpType: string) => {
    const type = helpType?.toUpperCase() || '';
    if (type.includes('FOOD')) return '🍎';
    if (type.includes('EDUCATION')) return '🏫';
    if (type.includes('MEDICAL')) return '🏥';
    if (type.includes('SHELTER')) return '🏠';
    if (type.includes('COUNSELING')) return '💬';
    return '📦';
  };

  const getPriorityBadge = (priority: string) => {
    const prio = priority?.toUpperCase() || 'MEDIUM';
    if (prio === 'URGENT') return <span className="priority-badge urgent">Urgent</span>;
    if (prio === 'HIGH') return <span className="priority-badge high">High</span>;
    return <span className="priority-badge medium">Medium</span>;
  };

  const handleCreateNew = () => {
    setCreateTemplate(null);
    setShowCreateModal(true);
  };

  const handleEdit = (packageId: string) => {
    navigate(`/service-packages/${packageId}/edit`);
  };

  const handleUseNow = (packageId: string, requestId?: string) => {
    setSelectedPackageId(packageId);
    setSelectedRequestId(requestId || null);
    setShowApplyModal(true);
  };

  const handleTemplateClick = (template: string) => {
    setCreateTemplate(template);
    setShowCreateModal(true);
  };

  if (loading) {
    return <div className="loading">Loading service packages...</div>;
  }

  return (
    <div className="service-packages-section">
      <div className="packages-header">
        <h1 className="packages-title">
          📦 SERVICE PACKAGES
        </h1>
        <p className="packages-subtitle">Create and manage assistance packages</p>
      </div>

      <div className="packages-actions">
        <button className="create-package-btn" onClick={handleCreateNew}>
          ➕ Create New
        </button>
        <button className="my-packages-btn">
          📁 My Packages ({packages.length})
        </button>
      </div>

      {/* My Active Packages */}
      <div className="packages-container">
        <div className="packages-section">
          <h3 className="packages-section-title">MY ACTIVE PACKAGES</h3>
          {packages.length === 0 ? (
            <div className="no-packages">
              <p>No active packages found. Create your first package to get started.</p>
            </div>
          ) : (
            packages.map((pkg) => (
              <div key={pkg.id} className="package-card">
                <div className="package-header">
                  <h4 className="package-name">
                    {getHelpTypeIcon(pkg.helpType || pkg.serviceType)} {pkg.name || `${pkg.helpType || pkg.serviceType} PACKAGE`}
                  </h4>
                </div>
                <div className="package-details">
                  <div className="package-info-row">
                    <span className="package-label">Age:</span>
                    <span className="package-value">{pkg.ageRange || '0-18'}</span>
                    <span className="package-separator">•</span>
                    <span className="package-label">Gender:</span>
                    <span className="package-value">{pkg.gender || 'All'}</span>
                    <span className="package-separator">•</span>
                    <span className="package-label">Priority:</span>
                    {getPriorityBadge(pkg.priority)}
                  </div>
                  <div className="package-services">
                    <span className="package-label">Services:</span>
                    <span className="package-services-list">
                      {Array.isArray(pkg.services) 
                        ? pkg.services.join(', ')
                        : (pkg.serviceDescription || 'No services specified')}
                    </span>
                  </div>
                </div>
                <div className="package-actions">
                  <button
                    className="package-action-btn edit-btn"
                    onClick={() => handleEdit(pkg.id)}
                  >
                    ✏️ Edit
                  </button>
                  <button
                    className="package-action-btn use-btn"
                    onClick={() => handleUseNow(pkg.id)}
                  >
                    📋 Use Now
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Quick Create Templates */}
      <div className="templates-section">
        <h3 className="templates-title">QUICK CREATE TEMPLATES</h3>
        <div className="templates-grid">
          <button
            className="template-btn"
            onClick={() => handleTemplateClick('infant')}
          >
            👶 Infant Care (0-3)
          </button>
          <button
            className="template-btn"
            onClick={() => handleTemplateClick('child')}
          >
            🧒 Child Support (3-12)
          </button>
          <button
            className="template-btn"
            onClick={() => handleTemplateClick('teen')}
          >
            🧑 Teen Assistance (13-18)
          </button>
          <button
            className="template-btn"
            onClick={() => handleTemplateClick('emergency')}
          >
            🚨 Emergency Response
          </button>
          <button
            className="template-btn"
            onClick={() => handleTemplateClick('education')}
          >
            🎓 Educational Support
          </button>
          <button
            className="template-btn"
            onClick={() => handleTemplateClick('medical')}
          >
            🏥 Medical Assistance
          </button>
        </div>
      </div>

      {/* Apply Package Modal */}
      {showApplyModal && (
        <ApplyPackageModal
          packageId={selectedPackageId}
          requestId={selectedRequestId}
          user={user}
          onClose={() => {
            setShowApplyModal(false);
            setSelectedPackageId(null);
            setSelectedRequestId(null);
          }}
          onSuccess={() => {
            setShowApplyModal(false);
            setSelectedPackageId(null);
            setSelectedRequestId(null);
            fetchPackages();
          }}
        />
      )}

      {/* Create Package Modal */}
      {showCreateModal && (
        <CreatePackageModal
          template={createTemplate}
          user={user}
          onClose={() => {
            setShowCreateModal(false);
            setCreateTemplate(null);
          }}
          onSuccess={() => {
            setShowCreateModal(false);
            setCreateTemplate(null);
            fetchPackages();
          }}
        />
      )}
    </div>
  );
};

// Create Package Modal Component
interface CreatePackageModalProps {
  template: string | null;
  user: any;
  onClose: () => void;
  onSuccess: () => void;
}

const CreatePackageModal: React.FC<CreatePackageModalProps> = ({
  template,
  user,
  onClose,
  onSuccess
}) => {
  const [packageName, setPackageName] = useState<string>('');
  const [helpType, setHelpType] = useState<string>('FOOD');
  const [ageRange, setAgeRange] = useState<string>('0-18');
  const [gender, setGender] = useState<string>('All');
  const [priority, setPriority] = useState<string>('MEDIUM');
  const [services, setServices] = useState<string>('');
  const [description, setDescription] = useState<string>('');

  useEffect(() => {
    // Initialize form based on template
    if (template) {
      switch (template) {
        case 'infant':
          setAgeRange('0-3');
          setHelpType('MEDICAL');
          setPackageName('Infant Care Package');
          setServices('Diapers, formula, baby food, medical checkups');
          break;
        case 'child':
          setAgeRange('3-12');
          setHelpType('EDUCATION');
          setPackageName('Child Support Package');
          setServices('School supplies, tutoring, after-school programs');
          break;
        case 'teen':
          setAgeRange('13-18');
          setHelpType('COUNSELING');
          setPackageName('Teen Assistance Package');
          setServices('Counseling, mentorship, career guidance');
          break;
        case 'emergency':
          setPriority('URGENT');
          setHelpType('SHELTER');
          setPackageName('Emergency Response Package');
          setServices('Temporary shelter, food, emergency supplies');
          break;
        case 'education':
          setHelpType('EDUCATION');
          setPackageName('Educational Support Package');
          setServices('Tutoring, school supplies, scholarship assistance');
          break;
        case 'medical':
          setHelpType('MEDICAL');
          setPackageName('Medical Assistance Package');
          setServices('Medical checkups, medication, health insurance');
          break;
      }
    }
  }, [template]);

  const handleSubmit = async () => {
    if (!packageName.trim() || !services.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      const serviceList = services.split(',').map(s => s.trim()).filter(s => s);
      await serviceOfferService.createServiceOffer({
        serviceType: helpType,
        description: description || services,
        ageRange: ageRange,
        gender: gender,
        priority: priority,
        services: serviceList,
        name: packageName
      });
      alert('Service package created successfully');
      onSuccess();
    } catch (error) {
      console.error('Error creating package:', error);
      alert('Failed to create service package');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="create-package-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header-new">
          <h2 className="modal-title-new">
            ➕ CREATE SERVICE PACKAGE
          </h2>
          <p className="modal-subtitle-new">
            {template ? `Using ${template} template` : 'Create a new assistance package'}
          </p>
        </div>

        <div className="modal-content-new">
          <div className="create-package-form">
            <div className="form-group">
              <label className="form-label">Package Name *</label>
              <input
                type="text"
                className="form-input"
                value={packageName}
                onChange={(e) => setPackageName(e.target.value)}
                placeholder="e.g., Food Assistance Package"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Help Type *</label>
                <select
                  className="form-input"
                  value={helpType}
                  onChange={(e) => setHelpType(e.target.value)}
                >
                  <option value="FOOD">Food</option>
                  <option value="EDUCATION">Education</option>
                  <option value="MEDICAL">Medical</option>
                  <option value="SHELTER">Shelter</option>
                  <option value="COUNSELING">Counseling</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Age Range *</label>
                <select
                  className="form-input"
                  value={ageRange}
                  onChange={(e) => setAgeRange(e.target.value)}
                >
                  <option value="0-18">All (0-18)</option>
                  <option value="0-3">Infant (0-3)</option>
                  <option value="3-12">Child (3-12)</option>
                  <option value="13-18">Teen (13-18)</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Gender *</label>
                <select
                  className="form-input"
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                >
                  <option value="All">All</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Priority *</label>
                <select
                  className="form-input"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                >
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Services * (comma-separated)</label>
              <textarea
                className="form-input"
                value={services}
                onChange={(e) => setServices(e.target.value)}
                placeholder="e.g., Weekly groceries, nutrition counseling, meal planning"
                rows={3}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Description (optional)</label>
              <textarea
                className="form-input"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Additional details about this package..."
                rows={3}
              />
            </div>
          </div>
        </div>

        <div className="modal-footer-new">
          <button className="back-btn" onClick={onClose}>
            ⬅ Back
          </button>
          <button className="create-package-submit-btn" onClick={handleSubmit}>
            ➕ Create Package
          </button>
          <button className="close-btn-new" onClick={onClose}>
            ❌ Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

// Apply Package Modal Component
interface ApplyPackageModalProps {
  packageId: string | null;
  requestId: string | null;
  user: any;
  onClose: () => void;
  onSuccess: () => void;
}

const ApplyPackageModal: React.FC<ApplyPackageModalProps> = ({
  packageId,
  requestId,
  user,
  onClose,
  onSuccess
}) => {
  const [allPackages, setAllPackages] = useState<any[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<any | null>(null);
  const [requestDetails, setRequestDetails] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [customizations, setCustomizations] = useState<{ [key: string]: boolean }>({});
  const [estimatedTime, setEstimatedTime] = useState<string>('12-15 hours');
  const [estimatedCost, setEstimatedCost] = useState<string>('$250-350');

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedPackage) {
      updateEstimates();
    }
  }, [selectedPackage, customizations]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch all packages
      const packagesResponse = await serviceOfferService.getOffersByWorker(user.id);
      setAllPackages(packagesResponse.data || []);

      // If packageId is provided, select it
      if (packageId) {
        const pkg = (packagesResponse.data || []).find((p: any) => p.id === packageId);
        if (pkg) {
          setSelectedPackage(pkg);
        }
      }

      // Fetch request details if requestId is provided
      if (requestId) {
        try {
          const requestResponse = await api.get(`/api/help-requests/${requestId}`);
          setRequestDetails(requestResponse.data);
        } catch (error) {
          console.error('Error fetching request details:', error);
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateEstimates = () => {
    if (!selectedPackage) return;
    
    let baseTime = 10;
    let baseCost = 200;
    
    // Adjust based on customizations
    if (customizations['wheelchair']) baseTime += 2;
    if (customizations['extend']) baseTime += 3;
    if (customizations['counseling']) baseTime += 2;
    if (customizations['school']) baseTime += 1;
    
    if (customizations['wheelchair']) baseCost += 50;
    if (customizations['extend']) baseCost += 100;
    if (customizations['counseling']) baseCost += 50;
    if (customizations['school']) baseCost += 50;
    
    setEstimatedTime(`${baseTime}-${baseTime + 3} hours`);
    setEstimatedCost(`$${baseCost}-${baseCost + 100}`);
  };

  const checkAgeMatch = (packageAgeRange: string, requestAge?: number) => {
    if (!requestAge) return true;
    if (packageAgeRange === 'All' || packageAgeRange === '0-18') return true;
    
    const [min, max] = packageAgeRange.split('-').map(Number);
    return requestAge >= min && requestAge <= max;
  };

  const checkGenderMatch = (packageGender: string, requestGender?: string) => {
    if (packageGender === 'All') return true;
    if (!requestGender) return true;
    return packageGender.toLowerCase() === requestGender.toLowerCase();
  };

  const getHelpTypeIcon = (helpType: string) => {
    const type = helpType?.toUpperCase() || '';
    if (type.includes('FOOD')) return '🍎';
    if (type.includes('EDUCATION')) return '🏫';
    if (type.includes('MEDICAL')) return '🏥';
    if (type.includes('SHELTER')) return '🏠';
    if (type.includes('COUNSELING')) return '💬';
    return '📦';
  };

  const handleApplyPackage = async () => {
    if (!selectedPackage) {
      alert('Please select a package');
      return;
    }

    try {
      // Create service offer for the request
      const offerData = {
        helpRequestId: requestId,
        serviceType: selectedPackage.helpType || selectedPackage.serviceType,
        description: selectedPackage.description || selectedPackage.services?.join(', '),
        customizations: customizations,
        estimatedTime: estimatedTime,
        estimatedCost: estimatedCost
      };

      await serviceOfferService.createServiceOffer(offerData);
      alert('Package applied successfully');
      onSuccess();
    } catch (error) {
      console.error('Error applying package:', error);
      alert('Failed to apply package');
    }
  };

  const requestAge = requestDetails?.approximateAge || requestDetails?.peopleDetails?.age;
  const requestGender = requestDetails?.gender || requestDetails?.peopleDetails?.gender;
  const requestIdDisplay = requestDetails?.trackingId || `HELP-${requestId?.slice(0, 4).toUpperCase() || '0000'}`;
  const requestName = requestDetails?.peopleDetails?.name || `${requestGender || 'N/A'}, ${requestAge || 'N/A'}`;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="apply-package-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header-new">
          <h2 className="modal-title-new">
            🎯 APPLY SERVICE PACKAGE
          </h2>
          <p className="modal-subtitle-new">
            Select package for {requestIdDisplay} - {requestName}
          </p>
        </div>

        <div className="modal-content-new">
          {loading ? (
            <div className="modal-loading">Loading packages...</div>
          ) : (
            <>
              {/* All Packages */}
              <div className="apply-package-section">
                <h3 className="apply-section-title">ALL PACKAGES:</h3>
                <div className="packages-list">
                  {allPackages.length === 0 ? (
                    <div className="no-items">No packages available</div>
                  ) : (
                    allPackages.map((pkg) => {
                      const ageMatch = checkAgeMatch(pkg.ageRange || '0-18', requestAge);
                      const genderMatch = checkGenderMatch(pkg.gender || 'All', requestGender);
                      const isSelected = selectedPackage?.id === pkg.id;
                      
                      return (
                        <div
                          key={pkg.id}
                          className={`package-option-card ${isSelected ? 'selected' : ''}`}
                          onClick={() => setSelectedPackage(pkg)}
                        >
                          <div className="package-option-header">
                            <span className="package-option-icon">
                              {getHelpTypeIcon(pkg.helpType || pkg.serviceType)}
                            </span>
                            <span className="package-option-name">
                              {pkg.name || `${pkg.helpType || pkg.serviceType} PACKAGE`}
                            </span>
                          </div>
                          <div className="package-option-criteria">
                            <span className={ageMatch ? 'criteria-match' : 'criteria-mismatch'}>
                              Age: {pkg.ageRange || '0-18'} {ageMatch ? '✓' : '✗'}
                            </span>
                            <span className="criteria-separator">|</span>
                            <span className={genderMatch ? 'criteria-match' : 'criteria-mismatch'}>
                              Gender: {pkg.gender || 'All'} {genderMatch ? '✓' : '✗'}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Customize Selected Package */}
              {selectedPackage && (
                <div className="apply-package-section">
                  <h3 className="apply-section-title">CUSTOMIZE SELECTED PACKAGE:</h3>
                  <div className="customize-section">
                    <div className="selected-package-info">
                      <span className="selected-label">Selected:</span>
                      <span className="selected-name">
                        {getHelpTypeIcon(selectedPackage.helpType || selectedPackage.serviceType)} {selectedPackage.name || `${selectedPackage.helpType || selectedPackage.serviceType} PACKAGE`}
                      </span>
                    </div>
                    <div className="customizations-list">
                      <label className="customization-item">
                        <input
                          type="checkbox"
                          checked={customizations['wheelchair'] || false}
                          onChange={(e) => setCustomizations({...customizations, wheelchair: e.target.checked})}
                        />
                        <span>Include wheelchair accessibility assessment</span>
                      </label>
                      <label className="customization-item">
                        <input
                          type="checkbox"
                          checked={customizations['extend'] || false}
                          onChange={(e) => setCustomizations({...customizations, extend: e.target.checked})}
                        />
                        <span>Extend shelter to 14 days (emergency)</span>
                      </label>
                      <label className="customization-item">
                        <input
                          type="checkbox"
                          checked={customizations['counseling'] || false}
                          onChange={(e) => setCustomizations({...customizations, counseling: e.target.checked})}
                        />
                        <span>Add family counseling sessions</span>
                      </label>
                      <label className="customization-item">
                        <input
                          type="checkbox"
                          checked={customizations['school'] || false}
                          onChange={(e) => setCustomizations({...customizations, school: e.target.checked})}
                        />
                        <span>Include school enrollment assistance</span>
                      </label>
                    </div>
                    <div className="estimates">
                      <div className="estimate-item">
                        <span className="estimate-label">Estimated total time:</span>
                        <span className="estimate-value">{estimatedTime}</span>
                      </div>
                      <div className="estimate-item">
                        <span className="estimate-label">Estimated cost:</span>
                        <span className="estimate-value">{estimatedCost}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <div className="modal-footer-new">
          <button className="back-btn" onClick={onClose}>
            ⬅ Back
          </button>
          <button
            className="apply-package-btn"
            onClick={handleApplyPackage}
            disabled={!selectedPackage}
          >
            📋 Apply Package
          </button>
          <button
            className="customize-further-btn"
            onClick={() => alert('Customize further feature coming soon')}
            disabled={!selectedPackage}
          >
            ✏️ Customize Further
          </button>
          <button className="close-btn-new" onClick={onClose}>
            ❌ Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

// Request Details Modal Component
interface TransferRequestsSectionProps {
  user: any;
  onRefresh: () => void;
}

const TransferRequestsSection: React.FC<TransferRequestsSectionProps> = ({
  user,
  onRefresh
}) => {
  const navigate = useNavigate();
  const [transfers, setTransfers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'sent' | 'received'>('all');
  const [showNewTransferModal, setShowNewTransferModal] = useState(false);

  useEffect(() => {
    fetchTransfers();
  }, [user]);

  const fetchTransfers = async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const response = await transferService.getTransfersByUser(user.id);
      setTransfers(response.data || []);
    } catch (error) {
      console.error('Error fetching transfers:', error);
      setTransfers([]);
    } finally {
      setLoading(false);
    }
  };

  const sentTransfers = transfers.filter(t => t.fromUserId === user?.id);
  const receivedTransfers = transfers.filter(t => t.toUserId === user?.id);
  const pendingSent = sentTransfers.filter(t => t.status === 'PENDING');
  const pendingReceived = receivedTransfers.filter(t => t.status === 'PENDING');

  // Calculate statistics
  const sentCount = sentTransfers.length;
  const receivedCount = receivedTransfers.length;
  const approvedCount = transfers.filter(t => t.status === 'APPROVED').length;
  const rejectedCount = transfers.filter(t => t.status === 'REJECTED').length;

  const formatTimeAgo = (dateString?: string) => {
    if (!dateString) return 'Just now';
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins} ${diffMins === 1 ? 'minute' : 'minutes'} ago`;
      if (diffHours < 24) return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
      if (diffDays === 1) return '1 day ago';
      if (diffDays < 7) return `${diffDays} days ago`;
      return date.toLocaleDateString();
    } catch {
      return 'Just now';
    }
  };

  const handleAcceptTransfer = async (transferId: string) => {
    try {
      await transferService.executeTransfer(transferId);
      fetchTransfers();
      onRefresh();
    } catch (error) {
      console.error('Error accepting transfer:', error);
      alert('Failed to accept transfer');
    }
  };

  const handleDeclineTransfer = async (transferId: string) => {
    if (!confirm('Are you sure you want to decline this transfer?')) return;
    try {
      const reason = prompt('Please provide a reason for declining:');
      await transferService.rejectTransfer(transferId, reason || '');
      fetchTransfers();
      onRefresh();
    } catch (error) {
      console.error('Error declining transfer:', error);
      alert('Failed to decline transfer');
    }
  };

  const handleCancelTransfer = async (transferId: string) => {
    if (!confirm('Are you sure you want to cancel this transfer request?')) return;
    try {
      await transferService.cancelTransfer(transferId);
      fetchTransfers();
      onRefresh();
    } catch (error) {
      console.error('Error canceling transfer:', error);
      alert('Failed to cancel transfer');
    }
  };

  const handleEditTransfer = (transferId: string) => {
    // TODO: Navigate to edit transfer page or open edit modal
    console.log('Edit transfer:', transferId);
    alert('Edit transfer feature coming soon');
  };

  const handleViewRequest = (entityId: string, entityType: string) => {
    if (entityType === 'HELP_REQUEST') {
      navigate(`/help-requests/${entityId}`);
    } else {
      navigate(`/cases/${entityId}`);
    }
  };

  const handleNewTransfer = () => {
    setShowNewTransferModal(true);
  };

  if (loading) {
    return <div className="loading">Loading transfer requests...</div>;
  }

  return (
    <div className="transfer-requests-section">
      <div className="transfer-requests-header">
        <h1 className="transfer-requests-title">
          🔄 TRANSFER REQUESTS
        </h1>
        <p className="transfer-requests-subtitle">Manage requests to transfer help requests</p>
      </div>

      <div className="transfer-filters">
        <button
          className={`transfer-filter-btn ${filter === 'sent' ? 'active' : ''}`}
          onClick={() => setFilter('sent')}
        >
          📤 Sent by Me ({sentCount})
        </button>
        <button
          className={`transfer-filter-btn ${filter === 'received' ? 'active' : ''}`}
          onClick={() => setFilter('received')}
        >
          📥 Received ({receivedCount})
        </button>
        <button
          className={`transfer-filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          📋 All Transfers
        </button>
      </div>

      <div className="transfers-container">
        {/* Pending Transfers Sent by Me */}
        {pendingSent.length > 0 && (
          <div className="transfers-section">
            <h3 className="transfers-section-title">PENDING TRANSFERS</h3>
            {pendingSent.map((transfer) => (
              <div key={transfer.id} className="transfer-card">
                <div className="transfer-info">
                  <div className="transfer-row">
                    <span className="transfer-label">📤 TO:</span>
                    <span className="transfer-value">
                      {transfer.toUserName || 'Unknown'} ({transfer.toUserId || 'N/A'})
                    </span>
                  </div>
                  <div className="transfer-row">
                    <span className="transfer-label">📋 Request:</span>
                    <span className="transfer-value">
                      {transfer.entityId || 'N/A'} - {transfer.entityType === 'HELP_REQUEST' ? 'Help Request' : 'Case'}
                    </span>
                  </div>
                  <div className="transfer-row">
                    <span className="transfer-label">⏰ Sent:</span>
                    <span className="transfer-value">{formatTimeAgo(transfer.requestedAt)}</span>
                  </div>
                  <div className="transfer-row">
                    <span className="transfer-label">📝 Reason:</span>
                    <span className="transfer-value">{transfer.reason || 'No reason provided'}</span>
                  </div>
                  <div className="transfer-row">
                    <span className="transfer-label">Status:</span>
                    <span className="transfer-status pending">⏳ Waiting admin approval</span>
                  </div>
                </div>
                <div className="transfer-actions">
                  <button
                    className="transfer-action-btn edit-btn"
                    onClick={() => handleEditTransfer(transfer.id)}
                  >
                    ✏️ Edit
                  </button>
                  <button
                    className="transfer-action-btn cancel-btn"
                    onClick={() => handleCancelTransfer(transfer.id)}
                  >
                    ❌ Cancel
                  </button>
                  <button
                    className="transfer-action-btn view-btn"
                    onClick={() => handleViewRequest(transfer.entityId, transfer.entityType)}
                  >
                    📁 View Request
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Received Transfers */}
        {pendingReceived.length > 0 && (
          <div className="transfers-section">
            <h3 className="transfers-section-title">📥 RECEIVED FROM OTHERS:</h3>
            {pendingReceived.map((transfer) => (
              <div key={transfer.id} className="transfer-card received">
                <div className="transfer-info">
                  <div className="transfer-row">
                    <span className="transfer-label">👤 FROM:</span>
                    <span className="transfer-value">
                      {transfer.fromUserName || 'Unknown'} ({transfer.fromUserId || 'N/A'})
                    </span>
                  </div>
                  <div className="transfer-row">
                    <span className="transfer-label">📋 Request:</span>
                    <span className="transfer-value">
                      {transfer.entityId || 'N/A'} - {transfer.entityType === 'HELP_REQUEST' ? 'Help Request' : 'Case'}
                    </span>
                  </div>
                  <div className="transfer-row">
                    <span className="transfer-label">⏰ Received:</span>
                    <span className="transfer-value">{formatTimeAgo(transfer.requestedAt)}</span>
                  </div>
                  <div className="transfer-row">
                    <span className="transfer-label">📝 Reason:</span>
                    <span className="transfer-value">{transfer.reason || 'No reason provided'}</span>
                  </div>
                  <div className="transfer-row">
                    <span className="transfer-label">Status:</span>
                    <span className="transfer-status pending">⏳ Your decision required</span>
                  </div>
                </div>
                <div className="transfer-actions">
                  <button
                    className="transfer-action-btn accept-btn"
                    onClick={() => handleAcceptTransfer(transfer.id)}
                  >
                    ✅ Accept Transfer
                  </button>
                  <button
                    className="transfer-action-btn decline-btn"
                    onClick={() => handleDeclineTransfer(transfer.id)}
                  >
                    ❌ Decline
                  </button>
                  <button
                    className="transfer-action-btn view-btn"
                    onClick={() => handleViewRequest(transfer.entityId, transfer.entityType)}
                  >
                    📁 Review Request
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {pendingSent.length === 0 && pendingReceived.length === 0 && (
          <div className="no-transfers">
            <p>No pending transfers found.</p>
          </div>
        )}
      </div>

      {/* Transfer Statistics */}
      <div className="transfer-statistics">
        <div className="statistics-header">
          <h3>TRANSFER STATISTICS</h3>
        </div>
        <div className="statistics-grid">
          <div className="stat-item">
            <div className="stat-label">Sent</div>
            <div className="stat-value">{sentCount}</div>
          </div>
          <div className="stat-item">
            <div className="stat-label">Received</div>
            <div className="stat-value">{receivedCount}</div>
          </div>
          <div className="stat-item">
            <div className="stat-label">Approved</div>
            <div className="stat-value">{approvedCount}</div>
          </div>
          <div className="stat-item">
            <div className="stat-label">Rejected</div>
            <div className="stat-value">{rejectedCount}</div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="transfer-actions-footer">
        <button className="new-transfer-btn" onClick={handleNewTransfer}>
          📤 New Transfer Request
        </button>
      </div>

      {/* New Transfer Modal */}
      {showNewTransferModal && (
        <NewTransferModal
          user={user}
          onClose={() => setShowNewTransferModal(false)}
          onSuccess={() => {
            setShowNewTransferModal(false);
            fetchTransfers();
            onRefresh();
          }}
        />
      )}
    </div>
  );
};

// New Transfer Modal Component
interface NewTransferModalProps {
  user: any;
  onClose: () => void;
  onSuccess: () => void;
}

const NewTransferModal: React.FC<NewTransferModalProps> = ({
  user,
  onClose,
  onSuccess
}) => {
  const [activeRequests, setActiveRequests] = useState<any[]>([]);
  const [socialWorkers, setSocialWorkers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequestId, setSelectedRequestId] = useState<string>('');
  const [selectedWorkerId, setSelectedWorkerId] = useState<string>('');
  const [reason, setReason] = useState<string>('');
  const [requestSearch, setRequestSearch] = useState<string>('');
  const [workerSearch, setWorkerSearch] = useState<string>('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch active help requests
      const requestsResponse = await api.get(`/api/help-requests/worker/${user.id}`);
      const requests = Array.isArray(requestsResponse.data) ? requestsResponse.data : 
                     (requestsResponse.data?.data || requestsResponse.data?.requests || []);
      const active = requests.filter((r: any) => 
        r.status === 'IN_PROGRESS' || r.status === 'ASSIGNED'
      );
      setActiveRequests(active);

      // Fetch social workers
      const workersResponse = await adminService.getSocialWorkers();
      const workers = (workersResponse || []).filter((w: any) => w.userId !== user.id);
      setSocialWorkers(workers);
    } catch (error) {
      console.error('Error fetching data for transfer:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredRequests = activeRequests.filter((r: any) => {
    const search = requestSearch.toLowerCase();
    const id = (r.trackingId || r.id || '').toLowerCase();
    const type = (r.helpType || r.helpTypes?.[0] || '').toLowerCase();
    return id.includes(search) || type.includes(search);
  });

  const filteredWorkers = socialWorkers.filter((w: any) => {
    const search = workerSearch.toLowerCase();
    const name = (w.name || w.fullName || '').toLowerCase();
    const workerId = (w.workerId || w.userId || '').toLowerCase();
    const specialties = (w.specializations || []).join(' ').toLowerCase();
    return name.includes(search) || workerId.includes(search) || specialties.includes(search);
  });

  const getHelpTypeIcon = (helpType: string) => {
    const type = helpType?.toUpperCase() || '';
    if (type.includes('FOOD')) return '🍎';
    if (type.includes('EDUCATION')) return '🏫';
    if (type.includes('MEDICAL')) return '🏥';
    if (type.includes('SHELTER')) return '🏠';
    if (type.includes('COUNSELING')) return '💬';
    return '📋';
  };

  const getStatusBadge = (status: string) => {
    if (status === 'AVAILABLE') return '🟢 Available';
    if (status === 'BUSY') return '🟡 Busy';
    if (status === 'OFF_DUTY') return '🔴 Off Duty';
    return '⚪ Unknown';
  };

  const handleSubmit = async () => {
    if (!selectedRequestId || !selectedWorkerId || !reason.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      await transferService.requestHelpRequestTransfer({
        helpRequestId: selectedRequestId,
        requestedAssigneeId: selectedWorkerId,
        reason: reason.trim()
      });
      alert('Transfer request submitted successfully');
      onSuccess();
    } catch (error) {
      console.error('Error submitting transfer:', error);
      alert('Failed to submit transfer request');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="new-transfer-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header-new">
          <h2 className="modal-title-new">
            📤 INITIATE TRANSFER REQUEST
          </h2>
          <p className="modal-subtitle-new">Select request and target social worker</p>
        </div>

        <div className="modal-content-new">
          {loading ? (
            <div className="modal-loading">Loading...</div>
          ) : (
            <>
              {/* Step 1: Select Request */}
              <div className="transfer-step">
                <h3 className="step-title">STEP 1: SELECT REQUEST</h3>
                <div className="step-content">
                  <div className="search-box">
                    <input
                      type="text"
                      placeholder="🔍 Search your active requests..."
                      value={requestSearch}
                      onChange={(e) => setRequestSearch(e.target.value)}
                      className="search-input"
                    />
                  </div>
                  <div className="request-list">
                    {filteredRequests.length === 0 ? (
                      <div className="no-items">No active requests found</div>
                    ) : (
                      filteredRequests.map((request) => (
                        <label key={request.id} className="request-option">
                          <input
                            type="radio"
                            name="request"
                            value={request.id}
                            checked={selectedRequestId === request.id}
                            onChange={(e) => setSelectedRequestId(e.target.value)}
                          />
                          <span className="option-content">
                            {request.trackingId || `HELP-${request.id?.slice(0, 4).toUpperCase() || '0000'}`}: {getHelpTypeIcon(request.helpType || request.helpTypes?.[0])} {request.helpType || request.helpTypes?.[0] || 'General'} - {request.gender || 'N/A'}, {request.approximateAge || 'N/A'}
                            {request.priority === 'HIGH' || request.priority === 'URGENT' ? ' (URGENT)' : ''}
                          </span>
                        </label>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Step 2: Select Target Social Worker */}
              <div className="transfer-step">
                <h3 className="step-title">STEP 2: SELECT TARGET SOCIAL WORKER</h3>
                <div className="step-content">
                  <div className="search-box">
                    <input
                      type="text"
                      placeholder="🔍 Search social workers by specialty, availability..."
                      value={workerSearch}
                      onChange={(e) => setWorkerSearch(e.target.value)}
                      className="search-input"
                    />
                  </div>
                  <div className="worker-list">
                    {filteredWorkers.length === 0 ? (
                      <div className="no-items">No social workers found</div>
                    ) : (
                      filteredWorkers.map((worker) => (
                        <label key={worker.userId || worker.id} className="worker-option">
                          <input
                            type="radio"
                            name="worker"
                            value={worker.userId || worker.id}
                            checked={selectedWorkerId === (worker.userId || worker.id)}
                            onChange={(e) => setSelectedWorkerId(e.target.value)}
                          />
                          <div className="option-content">
                            <div className="worker-name">
                              👤 {worker.name || worker.fullName || 'Unknown'} ({worker.workerId || worker.userId || 'N/A'})
                            </div>
                            <div className="worker-details">
                              <span>⭐ {worker.specializations?.join(', ') || 'Multi-specialty'}</span>
                              <span>📊 Workload: {worker.currentServiceCount || 0}/{worker.maxConcurrentServices || 10} • {getStatusBadge(worker.available ? 'AVAILABLE' : 'BUSY')}</span>
                              <span>📍 {worker.serviceArea || 'Various areas'}</span>
                              <span>⭐ Rating: {worker.clientSatisfactionScore ? worker.clientSatisfactionScore.toFixed(1) : 'N/A'}</span>
                            </div>
                          </div>
                        </label>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Step 3: Transfer Details */}
              <div className="transfer-step">
                <h3 className="step-title">STEP 3: TRANSFER DETAILS</h3>
                <div className="step-content">
                  <label className="form-label">Reason for transfer (required):</label>
                  <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Enter the reason for transferring this request..."
                    className="reason-textarea"
                    rows={4}
                  />
                </div>
              </div>
            </>
          )}
        </div>

        <div className="modal-footer-new">
          <button className="back-btn" onClick={onClose}>
            ⬅ Back
          </button>
          <button className="submit-transfer-btn" onClick={handleSubmit}>
            📤 Submit Transfer Request
          </button>
          <button className="close-btn-new" onClick={onClose}>
            ❌ Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

interface RequestDetailsModalProps {
  request: any;
  loading: boolean;
  onClose: () => void;
  onAccept: (requestId: string) => Promise<void>;
  onReject: (requestId: string) => Promise<void>;
  onTransfer: (requestId: string) => void;
  onComplete?: (requestId: string) => Promise<void>;
}

const RequestDetailsModal: React.FC<RequestDetailsModalProps> = ({
  request,
  loading,
  onClose,
  onAccept,
  onReject,
  onTransfer,
  onComplete
}) => {
  const [requestDetails, setRequestDetails] = React.useState<any>(request);

  React.useEffect(() => {
    if (request) {
      setRequestDetails(request);
    }
  }, [request]);

  if (!request) return null;

  const getHelpTypeIcon = (helpType: string) => {
    const type = helpType?.toUpperCase() || '';
    if (type.includes('FOOD')) return '🍎';
    if (type.includes('EDUCATION')) return '🏫';
    if (type.includes('MEDICAL')) return '🏥';
    if (type.includes('SHELTER')) return '🏠';
    if (type.includes('COUNSELING')) return '💬';
    return '📋';
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    } catch {
      return dateString;
    }
  };

  const formatTimeOnly = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    } catch {
      return 'N/A';
    }
  };

  const handleAcceptClick = async () => {
    try {
      await onAccept(request.id);
      onClose();
    } catch (error) {
      console.error('Error accepting request:', error);
    }
  };

  const handleRejectClick = async () => {
    if (confirm('Are you sure you want to reject this request?')) {
      try {
        await onReject(request.id);
        onClose();
      } catch (error) {
        console.error('Error rejecting request:', error);
      }
    }
  };

  const handleTransferClick = () => {
    onTransfer(request.id);
    onClose();
  };

  const handleAddNotes = () => {
    const notes = prompt('Enter notes for this request:');
    if (notes) {
      // TODO: Implement add notes functionality
      console.log('Adding notes:', notes);
    }
  };

  const handleContact = () => {
    const contact = requestDetails?.requesterInfo?.contact || requestDetails?.contact;
    if (contact) {
      window.location.href = `tel:${contact}`;
    } else {
      alert('Contact information not available');
    }
  };

  const handleApplyPackage = () => {
    // TODO: Navigate to service packages page
    alert('Service package application feature coming soon');
  };

  const handleAddUpdate = () => {
    const update = prompt('Enter update for this request:');
    if (update) {
      // TODO: Implement add update functionality
      console.log('Adding update:', update);
    }
  };

  const isUrgent = requestDetails?.priority === 'HIGH' || requestDetails?.priority === 'URGENT';
  const helpType = requestDetails?.helpType || requestDetails?.helpTypes?.[0] || 'General';
  const trackingId = requestDetails?.trackingId || `HELP-${requestDetails?.id?.slice(0, 4).toUpperCase() || '0000'}`;
  const isAnonymous = requestDetails?.anonymous || requestDetails?.requesterInfo?.isAnonymous;
  const childName = requestDetails?.childName || requestDetails?.peopleDetails?.name || '';
  const childAge = requestDetails?.approximateAge || requestDetails?.peopleDetails?.age || 'N/A';
  const childGender = requestDetails?.gender || requestDetails?.peopleDetails?.gender || 'N/A';
  
  // Mock timeline data - in real app, this would come from the API
  const timeline = [
    { time: formatTimeOnly(requestDetails?.requestDate || requestDetails?.createdAt), event: 'Request submitted' },
    { time: formatTimeOnly(requestDetails?.lastUpdated), event: 'Admin review completed' },
    { time: formatTimeOnly(requestDetails?.assignedDate || requestDetails?.lastUpdated), event: 'Assigned to you' },
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="request-details-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header-new">
          <h2 className="modal-title-new">
            📋 REQUEST DETAILS - {trackingId}
          </h2>
          <div className="modal-subtitle-new">
            {getHelpTypeIcon(helpType)} {helpType} • {isUrgent ? '🔴 URGENT' : '⚪ Normal'} • 👤 {childName || `${childGender}, ${childAge} years`}
          </div>
        </div>

        <div className="modal-content-new">
          {loading ? (
            <div className="modal-loading">Loading request details...</div>
          ) : (
            <>
              {/* Child Information */}
              <div className="modal-section-new">
                <div className="section-header-new">
                  <h3 className="section-title-new">CHILD INFORMATION</h3>
                </div>
                <div className="section-content-new">
                  <div className="info-item-new">
                    <span className="info-label-new">👶 Age:</span>
                    <span className="info-value-new">{childAge} years</span>
                  </div>
                  <div className="info-item-new">
                    <span className="info-label-new">⚥ Gender:</span>
                    <span className="info-value-new">{childGender}</span>
                  </div>
                  <div className="info-item-new">
                    <span className="info-label-new">📍 Location:</span>
                    <span className="info-value-new">{requestDetails?.location || requestDetails?.peopleDetails?.location || 'Not specified'}</span>
                  </div>
                </div>
              </div>

              {/* Request Details */}
              <div className="modal-section-new">
                <div className="section-header-new">
                  <h3 className="section-title-new">REQUEST DETAILS</h3>
                </div>
                <div className="section-content-new">
                  <div className="info-item-new">
                    <span className="info-label-new">📅 Requested:</span>
                    <span className="info-value-new">{formatDate(requestDetails?.requestDate || requestDetails?.createdAt)}</span>
                  </div>
                  <div className="info-item-new">
                    <span className="info-label-new">👥 Requester:</span>
                    <span className="info-value-new">
                      {isAnonymous ? 'Anonymous' : (requestDetails?.requesterName || requestDetails?.requesterInfo?.name || 'N/A')}
                    </span>
                  </div>
                  <div className="info-item-new">
                    <span className="info-label-new">🔴 Priority:</span>
                    <span className="info-value-new">{isUrgent ? 'URGENT' : (requestDetails?.priority || 'NORMAL')}</span>
                  </div>
                  <div className="info-item-new">
                    <span className="info-label-new">📝 Description:</span>
                    <span className="info-value-new">{requestDetails?.description || 'No description provided'}</span>
                  </div>
                  <div className="info-item-new">
                    <span className="info-label-new">⚠️ Risk Level:</span>
                    <span className="info-value-new">
                      {isUrgent ? 'HIGH - Homelessness imminent' : (requestDetails?.riskLevel || 'MEDIUM')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Timeline & Updates */}
              <div className="modal-section-new">
                <div className="section-header-new">
                  <h3 className="section-title-new">TIMELINE & UPDATES</h3>
                </div>
                <div className="section-content-new">
                  {timeline.map((item, index) => (
                    <div key={index} className="timeline-item">
                      <span className="timeline-time">⏰ {item.time}</span>
                      <span className="timeline-event">- {item.event}</span>
                    </div>
                  ))}
                  <button className="add-update-btn" onClick={handleAddUpdate}>
                    ➕ Add Update
                  </button>
                </div>
              </div>

              {/* Documents & Evidence */}
              <div className="modal-section-new">
                <div className="section-header-new">
                  <h3 className="section-title-new">DOCUMENTS & EVIDENCE</h3>
                </div>
                <div className="section-content-new">
                  {requestDetails?.documentUrls && requestDetails.documentUrls.length > 0 ? (
                    requestDetails.documentUrls.map((doc: string, index: number) => {
                      const fileName = doc.split('/').pop() || `Document ${index + 1}`;
                      const isPdf = fileName.toLowerCase().endsWith('.pdf');
                      return (
                        <div key={index} className="document-item-new">
                          <span className="document-icon">{isPdf ? '📄' : '🏠'}</span>
                          <span className="document-name">{fileName}</span>
                          <a href={doc} target="_blank" rel="noopener noreferrer" className="document-link-new">
                            {isPdf ? '📥 Download' : '👁️ View'}
                          </a>
                        </div>
                      );
                    })
                  ) : (
                    <div className="no-documents">No documents available</div>
                  )}
                  <button className="upload-document-btn" onClick={() => alert('Upload document feature coming soon')}>
                    📎 Upload New Document
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="modal-section-new">
                <div className="section-header-new">
                  <h3 className="section-title-new">ACTIONS</h3>
                </div>
                <div className="section-content-new">
                  <div className="actions-grid">
                    {(requestDetails?.status === 'ASSIGNED' || requestDetails?.status === 'UNDER_REVIEW') && (
                      <>
                        <button className="action-btn-new accept-btn-new" onClick={handleAcceptClick}>
                          ✅ ACCEPT REQUEST
                        </button>
                        <button className="action-btn-new reject-btn-new" onClick={handleRejectClick}>
                          ❌ REJECT
                        </button>
                      </>
                    )}
                    <button className="action-btn-new transfer-btn-new" onClick={handleTransferClick}>
                      📤 REQUEST TRANSFER
                    </button>
                    <button className="action-btn-new notes-btn-new" onClick={handleAddNotes}>
                      📝 ADD NOTES
                    </button>
                    <button className="action-btn-new contact-btn-new" onClick={handleContact}>
                      📞 CONTACT
                    </button>
                    <button className="action-btn-new package-btn-new" onClick={handleApplyPackage}>
                      🏠 APPLY PACKAGE
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="modal-footer-new">
          <button className="back-btn" onClick={onClose}>← Back to List</button>
          <button className="close-btn-new" onClick={onClose}>🗙 Close</button>
        </div>
      </div>
    </div>
  );
};

// Notifications Dropdown Component
interface NotificationsDropdownProps {
  notifications: any[];
  loading: boolean;
  onNotificationClick: (notification: any) => void;
  onMarkAsRead: (notificationId: string) => void;
  onClose: () => void;
  onRefresh: () => void;
}

const NotificationsDropdown: React.FC<NotificationsDropdownProps> = ({
  notifications,
  loading,
  onNotificationClick,
  onMarkAsRead,
  onClose,
  onRefresh
}) => {
  const unreadNotifications = notifications.filter(n => !n.read);
  const readNotifications = notifications.filter(n => n.read);

  const formatTime = (dateString: string) => {
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
      return 'Just now';
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type?.toUpperCase()) {
      case 'ASSIGNMENT':
      case 'ASSIGNED':
        return '📋';
      case 'URGENT':
      case 'EMERGENCY':
        return '🚨';
      case 'MESSAGE':
        return '💬';
      case 'TRANSFER':
        return '🔄';
      case 'APPROVAL':
        return '✅';
      case 'REJECTION':
        return '❌';
      default:
        return '🔔';
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      onRefresh();
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  return (
    <div className="notifications-dropdown" onClick={(e) => e.stopPropagation()}>
      <div className="notifications-dropdown-header">
        <h3 className="notifications-title">Notifications</h3>
        {unreadNotifications.length > 0 && (
          <button className="mark-all-read-btn" onClick={handleMarkAllAsRead}>
            Mark all as read
          </button>
        )}
      </div>
      
      <div className="notifications-list">
        {loading ? (
          <div className="notifications-loading">Loading notifications...</div>
        ) : notifications.length === 0 ? (
          <div className="no-notifications">No notifications</div>
        ) : (
          <>
            {unreadNotifications.length > 0 && (
              <>
                <div className="notifications-section-title">New</div>
                {unreadNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className="notification-item unread"
                    onClick={() => onNotificationClick(notification)}
                  >
                    <div className="notification-icon">{getNotificationIcon(notification.type)}</div>
                    <div className="notification-content">
                      <div className="notification-title">{notification.title}</div>
                      <div className="notification-message">{notification.message}</div>
                      <div className="notification-time">{formatTime(notification.createdAt)}</div>
                    </div>
                    <button
                      className="notification-mark-read"
                      onClick={(e) => {
                        e.stopPropagation();
                        onMarkAsRead(notification.id);
                      }}
                      title="Mark as read"
                    >
                      ✓
                    </button>
                  </div>
                ))}
              </>
            )}
            
            {readNotifications.length > 0 && (
              <>
                {unreadNotifications.length > 0 && (
                  <div className="notifications-section-title">Earlier</div>
                )}
                {readNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className="notification-item read"
                    onClick={() => onNotificationClick(notification)}
                  >
                    <div className="notification-icon">{getNotificationIcon(notification.type)}</div>
                    <div className="notification-content">
                      <div className="notification-title">{notification.title}</div>
                      <div className="notification-message">{notification.message}</div>
                      <div className="notification-time">{formatTime(notification.createdAt)}</div>
                    </div>
                  </div>
                ))}
              </>
            )}
          </>
        )}
      </div>
      
      <div className="notifications-footer">
        <button className="view-all-notifications-btn" onClick={() => {
          // Could navigate to a full notifications page if needed
          onClose();
        }}>
          View All Notifications
        </button>
      </div>
    </div>
  );
};

export default SocialWorkerDashboard;
