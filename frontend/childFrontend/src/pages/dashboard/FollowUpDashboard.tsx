import React, { useState, useEffect } from 'react';
import { authService } from '../../services/authService';
import { followUpService } from '../../services/followUpService';
import CalendarView from './CalendarView';
import './FollowUpDashboard.css';

// Interface for a Follow-Up Item
interface FollowUp {
    id: string;
    requestId: string;
    childName: string;
    type: string;
    status: 'UPCOMING' | 'CONFIRMED' | 'URGENT' | 'SCHEDULED' | 'COMPLETED' | 'MISSED';
    priority?: 'URGENT' | 'HIGH' | 'MEDIUM' | 'LOW';
    scheduledDate: string; // ISO String for backend mapping
    timeString?: string; // Derived for display
    notes?: string;
    missedReason?: string;
    socialWorkerId?: string;
}

interface FollowUpDashboardProps {
    initialData?: Partial<FollowUp> | null;
    onCloseModal?: () => void;
}

const FollowUpDashboard: React.FC<FollowUpDashboardProps> = ({ initialData, onCloseModal }) => {
    const [activeView, setActiveView] = useState<'cal' | 'list' | 'upcoming' | 'missed'>('list');
    const [todaySchedule, setTodaySchedule] = useState<FollowUp[]>([]);
    const [missedFollowUps, setMissedFollowUps] = useState<FollowUp[]>([]);
    const [stats, setStats] = useState({
        todayCount: 0,
        thisWeekCount: 0,
        missedCount: 0,
        onTimeRate: 0,
        overdueCount: 0
    });

    const [showScheduleModal, setShowScheduleModal] = useState(false);
    // Separate date/time input state for the form
    const [formDate, setFormDate] = useState('');
    const [formTime, setFormTime] = useState('');
    const [newFollowUp, setNewFollowUp] = useState<Partial<FollowUp>>({
        type: 'Home Visit',
        priority: 'MEDIUM',
        status: 'UPCOMING'
    });

    useEffect(() => {
        if (initialData) {
            setNewFollowUp(prev => ({
                ...prev,
                ...initialData
            }));
            setShowScheduleModal(true);
        }
    }, [initialData]);

    const handleCloseInternal = () => {
        setShowScheduleModal(false);
        if (onCloseModal) onCloseModal();
    };

    const currentUser = authService.getCurrentUser();

    useEffect(() => {
        fetchFollowUpData();
    }, [currentUser?.id]);

    const fetchFollowUpData = async () => {
        if (!currentUser?.id) return;
        try {
            // Fetch real data from backend
            // Try getting worker specific first
            let response;
            try {
                response = await followUpService.getWorkerFollowUps(currentUser.id);
            } catch (e) {
                console.warn("Worker endpoint failed, trying my-schedule...", e);
                response = await followUpService.getMyFollowUps();
            }

            const allFollowUps: FollowUp[] = Array.isArray(response.data) ? response.data : [];

            const today = new Date();
            const todayStr = today.toISOString().split('T')[0];

            // Process data
            const todaysItems: FollowUp[] = [];
            const missedItems: FollowUp[] = [];
            let weekCount = 0;
            let completedCount = 0;
            let totalPastDue = 0;

            allFollowUps.forEach(item => {
                const itemDate = new Date(item.scheduledDate);
                const itemDateStr = itemDate.toISOString().split('T')[0];

                // Format time string for display
                item.timeString = itemDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                // Categorize
                if (itemDateStr === todayStr && (item.status as string) !== 'MISSED') {
                    todaysItems.push(item);
                }

                // Missed logic: Status is MISSED OR (Date is past AND status is not Completed/Missed)
                if (item.status === 'MISSED') {
                    missedItems.push(item);
                    totalPastDue++;
                } else if (itemDate < today && item.status !== 'COMPLETED' && (item.status as string) !== 'MISSED') {
                    // Auto-detect missed/overdue if older than today
                    item.status = 'MISSED'; // update local representation
                    missedItems.push(item);
                    totalPastDue++;
                }

                // Stats
                const oneWeekAway = new Date();
                oneWeekAway.setDate(today.getDate() + 7);
                if (itemDate >= today && itemDate <= oneWeekAway) {
                    weekCount++;
                }

                if (item.status === 'COMPLETED') completedCount++;
            });

            // Sort by time
            todaysItems.sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime());

            setTodaySchedule(todaysItems);
            setMissedFollowUps(missedItems);

            const totalProcessed = completedCount + totalPastDue; // simple rate calculation
            const rate = totalProcessed > 0 ? Math.round((completedCount / totalProcessed) * 100) : 100;

            setStats({
                todayCount: todaysItems.length,
                thisWeekCount: weekCount,
                missedCount: missedItems.length,
                onTimeRate: rate,
                overdueCount: missedItems.length
            });

        } catch (error) {
            console.error("Failed to fetch follow up data", error);
        }
    };

    const statusColor = (status: string) => {
        if (status === 'URGENT' || status === 'MISSED') return '🔴';
        if (status === 'CONFIRMED' || status === 'COMPLETED') return '✅';
        if (status === 'UPCOMING') return '⏰';
        if (status === 'SCHEDULED') return '🟢';
        return '';
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setNewFollowUp(prev => ({ ...prev, [name]: value }));
    };

    const handleScheduleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            // Combine date and time
            const combinedDateTime = new Date(`${formDate}T${formTime}`);

            const payload = {
                ...newFollowUp,
                scheduledDate: combinedDateTime.toISOString(),
                socialWorkerId: currentUser?.id,
                // Default props
                status: 'UPCOMING'
            };

            await followUpService.createFollowUp(payload);

            handleCloseInternal();
            setNewFollowUp({ type: 'Home Visit', priority: 'MEDIUM' }); // Reset
            setFormDate('');
            setFormTime('');

            alert("Follow-up scheduled successfully!");
            fetchFollowUpData(); // Refresh
        } catch (error) {
            console.error("Error creating follow-up", error);
            alert("Failed to schedule follow-up.");
        }
    };

    // Status action logic removed as it was unused

    return (
        <div className="follow-up-dashboard">
            <div className="follow-up-header">
                <h1 className="follow-up-title">📅 FOLLOW-UP SCHEDULING SYSTEM</h1>
                <div className="follow-up-subtitle">Manage scheduled visits, calls, and reminders</div>
            </div>

            {/* Controls */}
            <div className="dashboard-controls">
                <div className="view-controls">
                    <button className={`control-btn ${activeView === 'list' ? 'active' : ''}`} onClick={() => setActiveView('list')}>📋 List View</button>
                    <button className={`control-btn ${activeView === 'cal' ? 'active' : ''}`} onClick={() => setActiveView('cal')}>📅 Calendar</button>
                    <button className={`control-btn ${activeView === 'upcoming' ? 'active' : ''}`} onClick={() => setActiveView('upcoming')}>⏰ Upcoming</button>
                </div>
                <div className="action-controls">
                    <button className="control-btn schedule-btn" onClick={() => setShowScheduleModal(true)}>➕ Schedule New</button>
                </div>
            </div>

            {/* Overview Stats */}
            <div className="overview-section">
                <div className="section-title">📊 FOLLOW-UP OVERVIEW</div>
                <div className="stats-grid">
                    <div className="stat-box">
                        <span className="stat-value">{stats.todayCount}</span>
                        <span className="stat-label">Today</span>
                    </div>
                    <div className="stat-box">
                        <span className="stat-value">{stats.thisWeekCount}</span>
                        <span className="stat-label">This Week</span>
                    </div>
                    <div className="stat-box">
                        <span className="stat-value" style={{ color: '#dc3545' }}>{stats.missedCount}</span>
                        <span className="stat-label">Missed</span>
                    </div>
                    <div className="stat-box">
                        <span className="stat-value" style={{ color: '#198754' }}>{stats.onTimeRate}%</span>
                        <span className="stat-label">On-time Rate</span>
                    </div>
                    <div className="stat-box">
                        <span className="stat-value" style={{ color: '#ffc107' }}>{stats.overdueCount}</span>
                        <span className="stat-label">Overdue</span>
                    </div>
                </div>

                {todaySchedule.length > 0 && (
                    <div className="priority-list">
                        {todaySchedule
                            .filter(i => i.priority === 'HIGH' || i.priority === 'URGENT')
                            .map(item => (
                                <div key={item.id} className="priority-item urgent">
                                    <strong>🔴 URGENT:</strong> {item.childName}'s {item.type} ({item.timeString})
                                </div>
                            ))}
                    </div>
                )}
            </div>

            {/* Calendar View */}
            {activeView === 'cal' && (
                <div style={{ marginBottom: '2rem' }}>
                    <CalendarView events={[...todaySchedule, ...missedFollowUps]} />
                    {/* Note: In real app we pass ALL events for the Month/Week range, not just today/missed.
                  But for this step confirming the requested view with available data. */}
                </div>
            )}

            {/* Today's Schedule Table */}
            {activeView === 'list' && (
                <div className="schedule-table-container">
                    <div className="section-title">📅 TODAY'S SCHEDULE</div>
                    {todaySchedule.length > 0 ? (
                        <table className="schedule-table">
                            <thead>
                                <tr>
                                    <th>Time</th>
                                    <th>Child/Request</th>
                                    <th>Type</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {todaySchedule.map(item => (
                                    <tr key={item.id}>
                                        <td className="time-slot">{statusColor(item.status)} {item.timeString}</td>
                                        <td className="child-info">
                                            <span className="child-name">{item.childName}</span>
                                            <span className="request-id">{item.requestId || 'N/A'}</span>
                                            <span className="text-muted small">{item.notes}</span>
                                        </td>
                                        <td>{item.type}</td>
                                        <td>
                                            <span className={`status-badge ${item.status.toLowerCase()}`}>
                                                {item.status.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="action-buttons">
                                                {item.status === 'UPCOMING' && (
                                                    <>
                                                        <button className="action-btn call-btn">📞 Call</button>
                                                        <button className="action-btn">📍 Navigate</button>
                                                        <button className="action-btn">📝 Notes</button>
                                                    </>
                                                )}
                                                {/* Add more conditional buttons as needed */}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="empty-schedule">No scheduled follow-ups for today.</div>
                    )}
                    <div className="mt-3">
                        <div className="d-flex gap-2 mt-2">
                            <button className="control-btn" onClick={() => setShowScheduleModal(true)}>➕ Add Follow-up</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Missed & Overdue Table */}
            <div className="overdue-table-container">
                <div className="section-title">⚠️ MISSED & OVERDUE FOLLOW-UPS</div>
                {missedFollowUps.length > 0 ? (
                    <table className="schedule-table">
                        <thead>
                            <tr>
                                <th>Request</th>
                                <th>Child</th>
                                <th>Missed Since</th>
                                <th>Reason</th>
                                <th>Priority</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {missedFollowUps.map(item => (
                                <tr key={item.id}>
                                    <td>{item.requestId || '-'}</td>
                                    <td className="child-info">
                                        <span className="child-name">{item.childName}</span>
                                        <span className="text-muted small">{item.type}</span>
                                    </td>
                                    <td>
                                        {new Date(item.scheduledDate).toLocaleDateString()}
                                    </td>
                                    <td>{item.missedReason || 'Not logged'}</td>
                                    <td>
                                        <span className={`status-badge ${item.priority?.toLowerCase()}`}>
                                            {item.priority === 'HIGH' ? '🔴 URGENT' : item.priority === 'MEDIUM' ? '🟡 MEDIUM' : '🟢 LOW'}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="action-buttons">
                                            <button className="action-btn call-btn">📞 Reschedule</button>
                                            <button className="action-btn">📝 Log</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <div className="empty-schedule">No missed follow-ups. Great job!</div>
                )}
            </div>

            {/* Schedule New Modal */}
            {showScheduleModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3 className="section-title">➕ Schedule New Follow-up</h3>
                        <form onSubmit={handleScheduleSubmit}>
                            <div className="form-group">
                                <label className="form-label">Child Name</label>
                                <input
                                    name="childName"
                                    type="text"
                                    className="form-control"
                                    placeholder="Enter Name..."
                                    required
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Request ID (Optional)</label>
                                <input
                                    name="requestId"
                                    type="text"
                                    className="form-control"
                                    placeholder="e.g. HELP-123"
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Type</label>
                                <select name="type" className="form-control" required onChange={handleInputChange} value={newFollowUp.type}>
                                    <option>Home Visit</option>
                                    <option>Phone Call</option>
                                    <option>Counseling Session</option>
                                    <option>Medical Checkup</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <div className="row">
                                    <div className="col">
                                        <label className="form-label">Date</label>
                                        <input type="date" className="form-control" required onChange={(e) => setFormDate(e.target.value)} value={formDate} />
                                    </div>
                                    <div className="col">
                                        <label className="form-label">Time</label>
                                        <input type="time" className="form-control" required onChange={(e) => setFormTime(e.target.value)} value={formTime} />
                                    </div>
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Priority</label>
                                <select name="priority" className="form-control" onChange={handleInputChange} value={newFollowUp.priority}>
                                    <option value="LOW">LOW</option>
                                    <option value="MEDIUM">MEDIUM</option>
                                    <option value="HIGH">HIGH</option>
                                    <option value="URGENT">URGENT</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Notes</label>
                                <textarea name="notes" className="form-control" rows={3} onChange={handleInputChange}></textarea>
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="control-btn" onClick={handleCloseInternal}>Cancel</button>
                                <button type="submit" className="control-btn schedule-btn">Schedule</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </div>
    );
};

export default FollowUpDashboard;
