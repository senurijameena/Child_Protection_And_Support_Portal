import React, { useState, useEffect, useCallback } from 'react';
import {
    Container,
    Navbar,
    Nav,
    Button,
    Dropdown,
    Badge,
    Spinner,
    OverlayTrigger,
    Tooltip as BSTooltip
} from 'react-bootstrap';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { authService } from '../services/authService';
import { notificationService } from '../services/notificationService';
import { userService } from '../services/userService';
import { analyticsService } from '../services/analyticsService';
import NotificationDropdown from './NotificationDropdown';
import './DashboardHeader.css';

interface QuickStats {
    emergencyCases: number;
}

const DashboardHeader: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [user, setUser] = useState(authService.getCurrentUser());
    const [unreadCount, setUnreadCount] = useState(0);
    const [notifications, setNotifications] = useState<any[]>([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const [quickStats, setQuickStats] = useState<QuickStats>({ emergencyCases: 0 });
    const [loadingStats, setLoadingStats] = useState(false);
    const [systemStatus, setSystemStatus] = useState<'success' | 'warning' | 'danger'>('success');
    const [isRefreshing, setIsRefreshing] = useState(false);

    const fetchDashboardData = useCallback(async () => {
        if (!user || user.role !== 'ADMIN') return;

        setLoadingStats(true);
        try {
            const response = await analyticsService.getDashboardOverview();
            if (response.data && response.data.metrics) {
                setQuickStats({
                    emergencyCases: response.data.metrics.emergencyCases || 0
                });
            }
            setSystemStatus('success');
        } catch (error) {
            console.error('Error fetching header stats:', error);
            setSystemStatus('warning');
        } finally {
            setLoadingStats(false);
        }
    }, [user]);

    const fetchNotifications = useCallback(async () => {
        if (!user) return;
        try {
            const [countRes, listRes] = await Promise.all([
                notificationService.getUnreadCount(),
                notificationService.getNotifications()
            ]);
            setUnreadCount(countRes.data || 0);
            setNotifications(listRes.data || []);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    }, [user]);

    useEffect(() => {
        fetchDashboardData();
        fetchNotifications();

        const statsInterval = setInterval(fetchDashboardData, 30000); // 30s poll
        const notifInterval = setInterval(fetchNotifications, 60000); // 60s poll

        return () => {
            clearInterval(statsInterval);
            clearInterval(notifInterval);
        };
    }, [fetchDashboardData, fetchNotifications, location.pathname]);

    const handleRefresh = async () => {
        setIsRefreshing(true);
        await Promise.all([fetchDashboardData(), fetchNotifications()]);
        setTimeout(() => setIsRefreshing(false), 500);
    };

    const handleLogout = () => {
        if (window.confirm('Are you sure you want to terminate your session?')) {
            authService.logout();
            navigate('/login');
        }
    };

    const getPageTitle = () => {
        const path = location.pathname;
        if (path.includes('/admin/dashboard')) return 'Dashboard';
        if (path.includes('/admin/users')) return 'User Management';
        if (path.includes('/admin/cases')) return 'Case Management';
        if (path.includes('/admin/help-requests')) return 'Assistance Bureau';
        if (path.includes('/admin/announcements')) return 'Broadcasts';
        if (path.includes('/admin/analytics')) return 'Strategic Intel';
        if (path.includes('/admin/system')) return 'System Governance';
        return 'Admin Console';
    };

    const getInitials = () => {
        if (!user?.name) return 'A';
        return user.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    };

    const renderTooltip = (text: string) => (props: any) => (
        <BSTooltip id="button-tooltip" {...props}>
            {text}
        </BSTooltip>
    );

    return (
        <Navbar expand="lg" className="dashboard-header" sticky="top">
            <Container fluid className="header-main-content px-4">
                {/* LEFT SECTION: Brand & Context */}
                <div className="header-left-section d-flex align-items-center">
                    <Link to="/admin/dashboard" className="text-decoration-none mr-4">
                        <div className="logo-container">
                            <div className="logo-shield">
                                <i className="bi bi-shield-fill-check"></i>
                            </div>
                            <div className="brand-text-container d-none d-md-flex">
                                <span className="system-name">Child Protection Portal</span>
                                <span className="admin-console-tag">Admin Console</span>
                            </div>
                        </div>
                    </Link>

                    <div className="vertical-divider mx-4 d-none d-lg-block" style={{ width: '1px', height: '30px', backgroundColor: '#e2e8f0' }}></div>

                    <div className="page-context d-none d-lg-block">
                        <span className="text-slate-400 font-bold uppercase tracking-widest text-[10px] d-block mb-1">Current Section</span>
                        <span className="font-black text-slate-900 tracking-tight">{getPageTitle()}</span>
                    </div>
                </div>

                {/* CENTER SECTION: System Status */}
                <div className="header-center-section d-none d-md-flex">
                    <div className="status-indicators">
                        <OverlayTrigger placement="bottom" overlay={renderTooltip('Cases marked URGENT or EMERGENCY')}>
                            <div className="indicator-item emergency-indicator" onClick={() => navigate('/admin/cases/emergency')}>
                                <div className="pulse-dot"></div>
                                <span>{quickStats.emergencyCases} Active Emergency Cases</span>
                            </div>
                        </OverlayTrigger>

                        <OverlayTrigger placement="bottom" overlay={renderTooltip(systemStatus === 'success' ? 'All systems operational' : 'Partial system latency monitored')}>
                            <div className="indicator-item health-indicator">
                                <div className={`health-dot ${systemStatus}`}></div>
                                <span>System {systemStatus === 'success' ? 'Operational' : 'Issue Detected'}</span>
                            </div>
                        </OverlayTrigger>

                        <i
                            className={`bi bi-arrow-clockwise refresh-icon ${isRefreshing ? 'rotate' : ''}`}
                            onClick={handleRefresh}
                            title="Manual Refresh"
                        ></i>
                    </div>
                </div>

                {/* RIGHT SECTION: Actions & Profile */}
                <div className="header-right-section header-actions">
                    {/* Notifications */}
                    <NotificationDropdown
                        show={showNotifications}
                        onToggle={(isOpen) => setShowNotifications(isOpen)}
                        notifications={notifications}
                        unreadCount={unreadCount}
                        onMarkAsRead={(id) => notificationService.markAsRead(id).then(fetchNotifications)}
                        onMarkAllAsRead={() => notificationService.markAllAsRead().then(fetchNotifications)}
                    />

                    {/* Messages */}
                    <button className="action-icon-btn" onClick={() => navigate('/messages')} title="Messages">
                        <i className="bi bi-chat-left-dots"></i>
                        <span className="badge-count">3</span>
                    </button>

                    {/* Quick Action Dropdown */}
                    <Dropdown align="end">
                        <Dropdown.Toggle as="button" className="quick-action-btn">
                            <i className="bi bi-lightning-charge-fill"></i>
                            <span className="d-none d-xl-inline">+ Quick Action</span>
                        </Dropdown.Toggle>
                        <Dropdown.Menu className="dropdown-menu">
                            <Dropdown.Header className="font-black text-[10px] uppercase tracking-widest text-slate-400">Tactical Actions</Dropdown.Header>
                            <Dropdown.Item onClick={() => navigate('/admin/cases/emergency')}><i className="bi bi-shield-exclamation text-red-500"></i> Assign Emergency Case</Dropdown.Item>
                            <Dropdown.Item onClick={() => navigate('/admin/users/pending')}><i className="bi bi-person-check text-blue-500"></i> Approve Users</Dropdown.Item>
                            <Dropdown.Item onClick={() => navigate('/admin/announcements')}><i className="bi bi-megaphone text-amber-500"></i> Create Announcement</Dropdown.Item>
                            <Dropdown.Divider />
                            <Dropdown.Item onClick={() => navigate('/admin/analytics')}><i className="bi bi-file-earmark-pdf"></i> Generate Report</Dropdown.Item>
                            <Dropdown.Item onClick={() => navigate('/admin/transfers')}><i className="bi bi-arrow-left-right"></i> Review Transfers</Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown>

                    {/* Admin Profile */}
                    <Dropdown align="end">
                        <Dropdown.Toggle variant="link" className="user-profile-toggle p-0 text-decoration-none">
                            <div className="avatar-initials">
                                {getInitials()}
                                <div className="online-status-dot"></div>
                            </div>
                            <div className="admin-name ms-2 d-none d-xl-block">
                                {user?.name || 'Administrator'}
                            </div>
                        </Dropdown.Toggle>
                        <Dropdown.Menu className="dropdown-menu">
                            <Dropdown.Header className="font-bold text-xs">{user?.email || 'System Admin'}</Dropdown.Header>
                            <Dropdown.Item onClick={() => navigate('/profile')}><i className="bi bi-person"></i> View Profile</Dropdown.Item>
                            <Dropdown.Item onClick={() => navigate('/change-password')}><i className="bi bi-key"></i> Change Password</Dropdown.Item>
                            <Dropdown.Item onClick={() => navigate('/admin/audit-logs')}><i className="bi bi-journal-text"></i> Activity Log</Dropdown.Item>
                            <Dropdown.Item onClick={() => navigate('/admin/settings')}><i className="bi bi-shield-lock"></i> Security Settings</Dropdown.Item>
                            <Dropdown.Divider />
                            <Dropdown.Item onClick={handleLogout} className="logout-item">
                                <i className="bi bi-box-arrow-right"></i> Logout Session
                            </Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown>
                </div>
            </Container>
        </Navbar>
    );
};

export default DashboardHeader;
