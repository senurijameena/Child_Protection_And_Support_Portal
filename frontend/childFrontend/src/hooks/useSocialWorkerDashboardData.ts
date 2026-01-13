import { useState, useEffect, useCallback } from 'react';
import { authService } from '../services/authService';
import { socialWorkerService } from '../services/socialWorkerService';
import { statusService } from '../services/statusService';
import { notificationService } from '../services/notificationService';
import { transferService } from '../services/transferService';
import { timelineService } from '../services/timelineService';
import { api } from '../services/api';

export interface SocialWorkerStats {
    myRequestsCount: number;
    activeRequestsCount: number; // Accepted/In Progress
    urgentRequestsCount: number;
    assignedChildrenCount: number;
    messagesCount: number;
    transferRequestsCount: number;
    notificationsCount: number;
    currentWorkload: number;
}

export interface SocialWorkerProfile {
    id: string;
    name: string;
    workerId?: string;
    certificateId?: string;
    organization?: string;
    status?: string;
    photoUrl?: string; // Added photoUrl
}

export interface WorkloadDistribution {
    [key: string]: { current: number; max: number };
}

export const useSocialWorkerDashboardData = () => {
    const user = authService.getCurrentUser();
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState<SocialWorkerProfile | null>(null);
    const [stats, setStats] = useState<SocialWorkerStats>({
        myRequestsCount: 0,
        activeRequestsCount: 0,
        urgentRequestsCount: 0,
        assignedChildrenCount: 0,
        messagesCount: 0,
        transferRequestsCount: 0,
        notificationsCount: 0,
        currentWorkload: 0
    });
    const [currentStatus, setCurrentStatus] = useState<string>('AVAILABLE');
    const [workloadDistribution, setWorkloadDistribution] = useState<WorkloadDistribution>({});
    const [recentActivity, setRecentActivity] = useState<any[]>([]);
    const [schedule, setSchedule] = useState<any[]>([]);

    // Status management logic
    const updateStatus = async (newStatus: string) => {
        if (currentStatus === newStatus) return;

        try {
            console.log(`[STATUS CHANGE] Attempting to change from ${currentStatus} to: ${newStatus}`);

            // Auto-transition logic: OFF_DUTY -> BUSY requires passing through AVAILABLE
            if (currentStatus === 'OFF_DUTY' && newStatus === 'BUSY') {
                try {
                    await statusService.setAvailable();
                    await new Promise(resolve => setTimeout(resolve, 500));
                } catch (err) {
                    console.warn('[STATUS CHANGE] Intermediate switch to AVAILABLE failed', err);
                }
            }

            let response;
            try {
                switch (newStatus) {
                    case 'AVAILABLE': response = await statusService.setAvailable(); break;
                    case 'BUSY': response = await statusService.setBusy(); break;
                    case 'OFF_DUTY': response = await statusService.setOffDuty(); break;
                    default: response = await statusService.changeOwnStatus({ newStatus });
                }
            } catch (postError) {
                // Fallback
                response = await statusService.changeOwnStatus({ newStatus });
            }

            const result = response?.data || response;
            if (result && (result.success === true || result.success === undefined)) {
                setCurrentStatus(newStatus);
                if (profile) setProfile({ ...profile, status: newStatus });
            }
        } catch (error: any) {
            console.error('[STATUS CHANGE] Error:', error);
            throw error; // Re-throw to let component handle alert if needed
        }
    };

    const fetchDashboardData = useCallback(async (isSilent = false) => {
        if (!user?.id) return;

        if (!isSilent) setLoading(true);
        try {

            // 1. Fetch Profile
            try {
                const profileResp = await socialWorkerService.getSocialWorkerProfile(user.id);
                if (profileResp) {
                    setProfile({
                        id: user.id,
                        name: user.name || profileResp.name || 'Social Worker',
                        workerId: profileResp.workerId || `SW-${user.id.slice(0, 3).toUpperCase()}`,
                        certificateId: (user as any).certificateId || profileResp.certificateId || (user as any).licenseNumber,
                        organization: profileResp.organization || "Hope Children's Foundation",
                        status: profileResp.status,
                        photoUrl: (user as any).photoUrl // Assume auth user has it or fetch if needed
                    });
                }
            } catch (e) { console.error('Profile fetch error', e); }

            // 2. Fetch Status
            try {
                const statusResponse = await statusService.getMyStatus();
                if (statusResponse?.data?.status) {
                    const s = statusResponse.data.status.toUpperCase();
                    if (['AVAILABLE', 'ONLINE'].includes(s)) setCurrentStatus('AVAILABLE');
                    else if (['BUSY', 'OCCUPIED'].includes(s)) setCurrentStatus('BUSY');
                    else if (['OFF_DUTY', 'OFFLINE', 'OFF-DUTY'].includes(s)) setCurrentStatus('OFF_DUTY');
                    else setCurrentStatus(s);
                }
            } catch (e) { console.error('Status fetch error', e); }

            // 3. requests and workload
            try {
                const requestsResponse = await api.get(`/api/help-requests/worker/${user.id}`);
                const requests = Array.isArray(requestsResponse.data) ? requestsResponse.data : (requestsResponse.data?.data || []);

                const validRequests = requests.filter((r: any) => r.status && !['COMPLETED', 'REJECTED', 'CLOSED'].includes(r.status.toUpperCase()));
                const acceptedRequests = requests.filter((r: any) => r.status && r.status.toUpperCase() === 'IN_PROGRESS');
                const urgent = validRequests.filter((r: any) => r.priority === 'HIGH' || r.priority === 'URGENT' || r.emergency === true);

                // Calculate Workload Distribution
                const workload: WorkloadDistribution = {
                    'Food': { current: 0, max: 10 }, 'Education': { current: 0, max: 10 },
                    'Medical': { current: 0, max: 10 }, 'Shelter': { current: 0, max: 10 },
                    'Counseling': { current: 0, max: 10 }, 'Clothing': { current: 0, max: 10 },
                    'Other': { current: 0, max: 10 }
                };

                validRequests.forEach((r: any) => {
                    const type = (r.helpType || r.serviceType || '').toLowerCase();
                    let category = 'Other';
                    if (type.includes('food')) category = 'Food';
                    else if (type.includes('education')) category = 'Education';
                    else if (type.includes('medical')) category = 'Medical';
                    else if (type.includes('shelter')) category = 'Shelter';
                    else if (type.includes('counseling')) category = 'Counseling';
                    else if (type.includes('clothing')) category = 'Clothing';

                    workload[category].current = Math.min(workload[category].current + 1, workload[category].max);
                });

                setStats(prev => ({
                    ...prev,
                    myRequestsCount: validRequests.length,
                    activeRequestsCount: acceptedRequests.length,
                    urgentRequestsCount: urgent.length,
                    currentWorkload: validRequests.length
                }));
                setWorkloadDistribution(workload);

            } catch (e) { console.error('Requests fetch error', e); }

            // 4. Assignments
            try {
                const assignmentsRes = await socialWorkerService.getActiveAssignments(user.id);
                const assignments = Array.isArray(assignmentsRes) ? assignmentsRes : (assignmentsRes?.data || []);
                setStats(prev => ({ ...prev, assignedChildrenCount: assignments.length }));
            } catch (e) { console.error('Assignments fetch error', e); }

            // 5. Notifications & Transfers
            try {
                const notifRes = await notificationService.getUnreadCount();
                const transfRes = await transferService.getPendingTransferCount();
                setStats(prev => ({
                    ...prev,
                    messagesCount: notifRes.data || 0,
                    notificationsCount: notifRes.data || 0,
                    transferRequestsCount: transfRes?.data?.count || transfRes?.data || 0
                }));
            } catch (e) { console.error('Counts fetch error', e); }

            // 6. Recent Activity
            try {
                const activityRes = await timelineService.getRecentActivity(10);
                const activities = Array.isArray(activityRes.data) ? activityRes.data : (activityRes.data?.data || []);

                const formatted = activities.map((a: any) => {
                    const date = new Date(a.eventTime || a.timestamp || a.createdAt);
                    const today = new Date();
                    const yesterday = new Date();
                    yesterday.setDate(today.getDate() - 1);

                    let dateLabel = date.toLocaleDateString();
                    if (date.toDateString() === today.toDateString()) dateLabel = "Today";
                    else if (date.toDateString() === yesterday.toDateString()) dateLabel = "Yesterday";

                    const timeStr = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

                    let icon = "🔔";
                    let actionText = "[View Details]";
                    let actionLink = "#";

                    const eventType = (a.eventType || '').toUpperCase();
                    const sourceId = a.helpRequestId || a.caseId || a.relatedId || a.id;

                    if (eventType.includes('HELP_REQUEST')) {
                        icon = "🔔";
                        actionText = "[View Request]";
                        actionLink = `/help-requests/${sourceId}`;
                    } else if (eventType.includes('CASE')) {
                        icon = "📋";
                        actionText = "[View Case]";
                        actionLink = `/cases/${sourceId}`;
                    } else if (eventType.includes('FOLLOWUP') || eventType.includes('MEETING')) {
                        icon = "✅";
                        actionText = "[View Follow-up]";
                        actionLink = `/follow-ups/${sourceId}`;
                    } else if (eventType.includes('TRANSFER')) {
                        icon = "🔄";
                        actionText = "[Review Transfer]";
                        actionLink = `/transfers/${sourceId}`;
                    } else if (eventType.includes('MESSAGE')) {
                        icon = "📞";
                        actionText = "[Reply]";
                        actionLink = `/messages/conversation/${sourceId}`;
                    } else if (eventType.includes('ANALYTICS') || eventType.includes('REPORT')) {
                        icon = "📊";
                        actionText = "[Download PDF]";
                        actionLink = `/analytics/reports/${sourceId}`;
                    }

                    return {
                        id: a.id,
                        fullTime: `${dateLabel}, ${timeStr}`,
                        message: a.title || a.description || a.message || 'Activity',
                        type: (a.priority === 'HIGH' || a.priority === 'URGENT') ? 'emergency' : 'normal',
                        icon,
                        actionText,
                        actionLink
                    };
                });

                if (formatted.length === 0) {
                    formatted.push({
                        id: 'initial',
                        fullTime: 'Just now',
                        message: 'Dashboard initialized',
                        type: 'normal',
                        icon: '🚀',
                        actionText: '[System Log]',
                        actionLink: '#'
                    });
                }
                setRecentActivity(formatted);

            } catch (e) { console.error('Activity fetch error', e); }

            // 7. Schedule
            try {
                // Try fetching from both services if available
                const [followUpsRes, scheduleRes] = await Promise.all([
                    api.get(`/api/follow-ups/worker/${user.id}`).catch(() => ({ data: [] })),
                    api.get('/api/services/upcoming').catch(() => ({ data: [] }))
                ]);

                const followUps = Array.isArray(followUpsRes.data) ? followUpsRes.data : [];
                const genericSchedule = Array.isArray(scheduleRes.data) ? scheduleRes.data : [];

                const combined = [...followUps, ...genericSchedule].map((item: any) => {
                    const date = new Date(item.scheduledDate || item.date || item.dateTime);
                    return {
                        id: item.id,
                        title: item.title || item.type || (item.requestId ? `Request ${item.requestId}` : 'Scheduled Event'),
                        description: item.notes || item.description || '',
                        location: item.location || 'Remote/N/A',
                        startTime: date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
                        endTime: item.endDate ? new Date(item.endDate).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }) : '',
                        date: date,
                        type: item.type || 'EVENT',
                        status: item.status || 'SCHEDULED',
                        participants: item.participants || []
                    };
                });

                setSchedule(combined.sort((a, b) => a.date.getTime() - b.date.getTime()));

            } catch (e) { console.error('Schedule fetch error', e); }

        } catch (err) {
            console.error('General Fetch Error', err);
        } finally {
            setLoading(false);
        }
    }, [user?.id]);

    useEffect(() => {
        fetchDashboardData();
        const interval = setInterval(() => fetchDashboardData(true), 30000);
        return () => clearInterval(interval);
    }, [fetchDashboardData]);

    return {
        user,
        loading,
        profile,
        stats,
        currentStatus,
        workloadDistribution,
        recentActivity,
        schedule,
        updateStatus,
        refresh: fetchDashboardData
    };
};
