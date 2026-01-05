import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import { socialWorkerService } from '../../services/socialWorkerService';
import { transferService } from '../../services/transferService';
import { statusService } from '../../services/statusService';
import { notificationService } from '../../services/notificationService';
import { timelineService } from '../../services/timelineService';
import { api } from '../../services/api';
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
  
  const [currentStatus, setCurrentStatus] = useState<string>('AVAILABLE');

  const [activeRequestsCount, setActiveRequestsCount] = useState(0);
  const [urgentRequestsCount, setUrgentRequestsCount] = useState(0);
  const [workloadDistribution, setWorkloadDistribution] = useState<{ [key: string]: { current: number; max: number } }>({});
  const [recentActivity, setRecentActivity] = useState<Array<{ time: string; message: string; type?: string }>>([]);

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
    navigate('/notifications');
  };

  const handleAnalytics = () => {
    navigate('/analytics');
  };

  const handleSettings = () => {
    navigate('/settings');
  };

  const handleStatusChange = async (newStatus: string) => {
    try {
      let response;
      switch (newStatus) {
        case 'AVAILABLE':
          response = await statusService.setAvailable();
          break;
        case 'BUSY':
          response = await statusService.setBusy();
          break;
        case 'OFF_DUTY':
          response = await statusService.setOffDuty();
          break;
        default:
          return;
      }
      
      // Handle response - check both response.data and direct response
      const result = response?.data || response;
      if (result?.success !== false) {
        setCurrentStatus(newStatus);
        // Update profile status as well
        if (profile) {
          setProfile({ ...profile, status: newStatus });
        }
        // Show success feedback (you can replace with a toast notification)
        console.log(`Status updated to ${newStatus}`);
      } else {
        throw new Error(result?.message || 'Failed to update status');
      }
    } catch (error: any) {
      console.error('Error updating status:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to update status. Please try again.';
      alert(errorMessage);
    }
  };

  const sidebarMenuItems = [
    { id: 'dashboard', icon: '📊', label: 'DASHBOARD', count: null },
    { id: 'my-requests', icon: '📋', label: 'MY REQUESTS', count: myRequestsCount },
    { id: 'assigned-children', icon: '👥', label: 'ASSIGNED CHILDREN', count: assignedChildrenCount },
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
                  <div className="profile-name">{profile?.name || user?.name || 'Jane Smith'}</div>
                  <div className="profile-id">({profile?.workerId || `SW-${user?.id?.slice(0, 3).toUpperCase() || '001'}`})</div>
                </div>
              </div>
            </div>
            <div className="profile-details">
              {profile?.licenseNumber && (
                <div className="profile-detail-item">
                  <span className="detail-icon">⭐</span>
                  <span className="detail-text">Licensed Social Worker</span>
                </div>
              )}
              <div className="profile-detail-item">
                <span className="detail-icon">🏢</span>
                <span className="detail-text">{profile?.organization || "Hope Children's Foundation"}</span>
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
                {item.count !== null && item.count !== undefined && (
                  <span className="sidebar-count">({item.count})</span>
                )}
            </button>
            ))}
          </nav>

          <div className="sidebar-divider"></div>

          {/* Status Selector */}
          <div className="sidebar-status-section">
            <div className="status-label">STATUS</div>
            <div className="status-options">
            <button 
                className={`status-option ${currentStatus === 'AVAILABLE' ? 'active' : ''}`}
                onClick={() => handleStatusChange('AVAILABLE')}
            >
                <span className="status-indicator status-available">🟢</span>
                <span className="status-text">AVAILABLE</span>
            </button>
            <button 
                className={`status-option ${currentStatus === 'BUSY' ? 'active' : ''}`}
                onClick={() => handleStatusChange('BUSY')}
            >
                <span className="status-indicator status-busy">⚪</span>
                <span className="status-text">BUSY</span>
            </button>
            <button 
                className={`status-option ${currentStatus === 'OFF_DUTY' ? 'active' : ''}`}
                onClick={() => handleStatusChange('OFF_DUTY')}
              >
                <span className="status-indicator status-off-duty">🔴</span>
                <span className="status-text">OFF DUTY</span>
            </button>
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
                    <div className="stat-card stat-card-info">
                      <div className="stat-value">{assignedChildrenCount}</div>
                      <div className="stat-label">Assigned Children</div>
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
              <div>
                <h1>My Requests</h1>
                <p>My requests content will appear here.</p>
              </div>
            )}
            {!loading && activeSection === 'assigned-children' && (
              <div>
                <h1>Assigned Children</h1>
                <p>Assigned children content will appear here.</p>
              </div>
            )}
            {!loading && activeSection === 'transfer-requests' && (
              <div>
                <h1>Transfer Requests</h1>
                <p>Transfer requests content will appear here.</p>
              </div>
            )}
            {!loading && activeSection === 'service-packages' && (
              <div>
                <h1>Service Packages</h1>
                <p>Service packages content will appear here.</p>
              </div>
            )}
            {!loading && activeSection === 'messages' && (
              <div>
                <h1>Messages</h1>
                <p>Messages content will appear here.</p>
              </div>
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

export default SocialWorkerDashboard;
