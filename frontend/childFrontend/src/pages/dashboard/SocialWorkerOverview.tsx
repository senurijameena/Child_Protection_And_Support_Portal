import React from 'react';
import { Row, Col, ProgressBar } from 'react-bootstrap';
import StatCard from '../../components/dashboard/StatCard';
import '../../components/modern/GlassCard.css';

interface SocialWorkerOverviewProps {
    stats: {
        activeRequestsCount: number;
        urgentRequestsCount: number;
        transferRequestsCount: number;
    };
    workloadDistribution: { [key: string]: { current: number; max: number } };
    profile: any;
    user: any;
    recentActivity: any[];
    schedule: any[];
    onRefresh: () => void;
}

const SocialWorkerOverview: React.FC<SocialWorkerOverviewProps> = ({
    stats,
    workloadDistribution,
    profile,
    user,
    recentActivity,
    schedule = [],
    onRefresh
}) => {
    // Helper to filter and format schedule
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);

    const isToday = (date: Date) => date.toDateString() === today.toDateString();
    const isTomorrow = (date: Date) => date.toDateString() === tomorrow.toDateString();

    const todaysEvents = schedule.filter(e => isToday(new Date(e.date)));
    const tomorrowsEvents = schedule.filter(e => isTomorrow(new Date(e.date)));

    return (
        <div className="dashboard-main-view">
            {/* Dashboard Header */}
            <div className="mb-4">
                <h1 className="fw-bold text-primary mb-1">📊 SOCIAL WORKER DASHBOARD</h1>
                <p className="text-secondary fw-medium">
                    Welcome back, {profile?.name?.split(' ')[0] || user?.name?.split(' ')[0] || 'Jane'}! Here's your overview.
                </p>
            </div>

            {/* Quick Stats Cards */}
            <Row className="mb-4 g-4">
                <Col md={4}>
                    <StatCard
                        title="Active Requests"
                        value={stats.activeRequestsCount}
                        icon={<i className="bi bi-person-lines-fill"></i>}
                        colorVariant="blue"
                        onClick={() => { }}
                    />
                </Col>
                <Col md={4}>
                    <StatCard
                        title="Urgent Requests"
                        value={stats.urgentRequestsCount}
                        icon={<i className="bi bi-exclamation-octagon-fill"></i>}
                        colorVariant="red"
                        onClick={() => { }}
                    />
                </Col>
                <Col md={4}>
                    <StatCard
                        title="Transfer Requests"
                        value={stats.transferRequestsCount}
                        icon={<i className="bi bi-arrow-left-right"></i>}
                        colorVariant="green"
                        onClick={() => { }}
                    />
                </Col>
            </Row>

            <Row className="g-4">
                {/* Left Column: Workload & Schedule */}
                <Col xl={7}>
                    <div className="d-flex flex-column gap-4">
                        {/* Workload Distribution */}
                        <div className="glass-card p-4">
                            <h4 className="fw-bold fs-5 mb-4 text-primary">📈 WORKLOAD DISTRIBUTION</h4>
                            <div className="d-flex flex-column gap-3">
                                {Object.entries(workloadDistribution).map(([serviceType, data]) => {
                                    const percentage = Math.min((data.current / data.max) * 100, 100);
                                    let variant = 'primary';
                                    if (percentage > 80) variant = 'warning';
                                    if (percentage >= 100) variant = 'danger';

                                    return (
                                        <div key={serviceType}>
                                            <div className="d-flex justify-content-between mb-1 small fw-bold text-muted">
                                                <span>{serviceType}</span>
                                                <span>{data.current}/{data.max}</span>
                                            </div>
                                            <ProgressBar
                                                now={percentage}
                                                variant={variant}
                                                style={{ height: '8px', borderRadius: '10px' }}
                                            />
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Upcoming Schedule */}
                        <div className="glass-card p-4">
                            <div className="section-header-row mb-4">
                                <h4 className="fw-bold fs-5 m-0 text-primary">📅 TODAY'S SCHEDULE</h4>
                            </div>

                            <div className="schedule-list">
                                {todaysEvents.length > 0 ? todaysEvents.map((event) => (
                                    <div key={event.id} className="schedule-item">
                                        <div className="schedule-time-row">
                                            <i className="bi bi-clock"></i> {event.startTime} {event.endTime && `- ${event.endTime}`}
                                        </div>
                                        <div className="schedule-title">{event.title}</div>
                                        <div className="schedule-detail">
                                            <i className="bi bi-geo-alt"></i> Location: {event.location}
                                        </div>
                                        <div className="schedule-actions">
                                            {event.type === 'Home Visit' ? (
                                                <>
                                                    <button className="btn-schedule-action btn-video"><i className="bi bi-camera-video"></i> Video Call</button>
                                                    <button className="btn-schedule-action btn-directions"><i className="bi bi-map"></i> Directions</button>
                                                </>
                                            ) : (
                                                <button className="btn-schedule-action btn-link"><i className="bi bi-link-45deg"></i> Join Link</button>
                                            )}
                                            <button className="btn-schedule-action btn-reschedule"><i className="bi bi-calendar-event"></i> Reschedule</button>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="text-center text-muted py-4">No events scheduled for today</div>
                                )}
                            </div>

                            {/* Tomorrow Section */}
                            {tomorrowsEvents.length > 0 && (
                                <div className="tomorrow-section">
                                    <div className="tomorrow-header">
                                        <i className="bi bi-calendar2-week"></i> Tomorrow
                                    </div>
                                    {tomorrowsEvents.map(event => (
                                        <div key={event.id} className="tomorrow-event">
                                            <span className="tomorrow-time">{event.startTime}</span>
                                            <span>{event.title}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </Col>

                {/* Right Column: Recent Activity */}
                <Col xl={5}>
                    <div className="glass-card h-100 p-4">
                        <div className="section-header-row mb-4">
                            <h4 className="fw-bold fs-5 m-0 text-primary">RECENT ACTIVITY</h4>
                            <button className="refresh-btn" onClick={onRefresh}>
                                <i className="bi bi-arrow-clockwise"></i> Refresh
                            </button>
                        </div>

                        <div className="timeline-view">
                            {recentActivity.map((activity, index) => (
                                <div key={activity.id || index} className="timeline-item">
                                    <div className="timeline-badge">{activity.icon}</div>
                                    <div className="timeline-content">
                                        <div className="timeline-time">{activity.fullTime}</div>
                                        <div className="timeline-title">{activity.message}</div>
                                        {activity.actionLink !== '#' && (
                                            <div className="timeline-actions">
                                                <a href={activity.actionLink} className="timeline-action-link">
                                                    {activity.actionText} <i className="bi bi-arrow-right"></i>
                                                </a>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                            {recentActivity.length === 0 && (
                                <div className="text-center text-muted py-4">No recent activity</div>
                            )}
                        </div>
                    </div>
                </Col>
            </Row>
        </div>
    );
};

export default SocialWorkerOverview;
