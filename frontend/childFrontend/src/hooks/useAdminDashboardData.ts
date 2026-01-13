import { useState, useEffect, useCallback } from 'react';
import { analyticsService } from '../services/analyticsService';
import { transferService } from '../services/transferService';
import { adminService } from '../services/adminService';

export interface DashboardStats {
    totalCases: number;
    activeCases: number;
    emergencyCases: number;
    closedCases: number;
    totalHelpRequests: number;
    activeHelpRequests: number;
    totalUsers: number;
    policeOfficers: number;
    socialWorkers: number;
    pendingApprovals: number;
    pendingTransfers: number;
    totalPublicUsers: number;
}

export const useAdminDashboardData = (dateFilter: string) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [stats, setStats] = useState<DashboardStats>({
        totalCases: 0,
        activeCases: 0,
        emergencyCases: 0,
        closedCases: 0,
        totalHelpRequests: 0,
        activeHelpRequests: 0,
        totalUsers: 0,
        policeOfficers: 0,
        socialWorkers: 0,
        pendingApprovals: 0,
        pendingTransfers: 0,
        totalPublicUsers: 0
    });

    const [recentCases, setRecentCases] = useState<any[]>([]);
    const [recentHelpRequests, setRecentHelpRequests] = useState<any[]>([]);
    const [pendingTransfers, setPendingTransfers] = useState<any[]>([]);
    const [caseStatusDistribution, setCaseStatusDistribution] = useState<any[]>([]);
    const [helpRequestTypeDistribution, setHelpRequestTypeDistribution] = useState<any[]>([]);
    const [socialWorkers, setSocialWorkers] = useState<any[]>([]);

    const getDateRange = useCallback(() => {
        const now = new Date();
        let startDate: Date;

        switch (dateFilter) {
            case 'today':
                startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                break;
            case '7days':
                startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                break;
            case '30days':
                startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                break;
            default:
                startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        }

        return {
            startDate: startDate.toISOString(),
            endDate: now.toISOString()
        };
    }, [dateFilter]);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const dateRange = getDateRange();

            const [overviewData, caseStats, helpRequestStats, userStats, caseStatusDist, helpTypeDist, transfersResponse, workersResponse] = await Promise.allSettled([
                analyticsService.getDashboardOverview(),
                analyticsService.getCaseStatistics(dateRange.startDate, dateRange.endDate),
                analyticsService.getHelpRequestStatistics(dateRange.startDate, dateRange.endDate),
                analyticsService.getUserStatistics(),
                analyticsService.getCaseStatusDistribution(),
                analyticsService.getHelpTypeDistribution(),
                transferService.getPendingTransfers(),
                adminService.getSocialWorkers()
            ]);

            // Process Overview Data
            if (overviewData.status === 'fulfilled' && overviewData.value.data) {
                const { metrics, recentCases: rCases, recentHelpRequests: rHelpRequests } = overviewData.value.data;

                if (metrics) {
                    setStats(prev => ({
                        ...prev,
                        totalCases: metrics.totalCases || 0,
                        activeCases: metrics.activeCases || 0,
                        emergencyCases: metrics.emergencyCases || 0,
                        totalHelpRequests: metrics.totalHelpRequests || 0,
                        activeHelpRequests: metrics.pendingHelpRequests || 0,
                        totalUsers: metrics.totalUsers || 0,
                        pendingApprovals: metrics.pendingApprovals || 0,
                        closedCases: metrics.resolvedCases || 0
                    }));
                }

                if (rCases) {
                    setRecentCases(rCases.map((c: any) => ({
                        id: c.id,
                        trackingId: c.trackingId || c.id?.substring(0, 8),
                        caseType: c.caseType || 'Unknown',
                        location: c.location || 'N/A',
                        priority: c.priority || 'MEDIUM',
                        status: c.status || 'REPORTED',
                        assignedOfficerId: c.assignedOfficerId,
                        assignedWorkerId: c.assignedWorkerId
                    })));
                }

                if (rHelpRequests) {
                    setRecentHelpRequests(rHelpRequests.map((hr: any) => ({
                        id: hr.id,
                        trackingId: hr.trackingId || hr.id?.substring(0, 8),
                        helpType: hr.helpType || 'Unknown',
                        childAge: hr.childAge,
                        priority: hr.priority || 'MEDIUM',
                        status: hr.status || 'REQUESTED',
                        assignedWorkerId: hr.assignedWorkerId
                    })));
                }
            }

            // Process User Stats
            if (userStats.status === 'fulfilled' && userStats.value.data) {
                const usrData = userStats.value.data;
                setStats(prev => ({
                    ...prev,
                    policeOfficers: usrData.totalPoliceOfficers || usrData.policeCount || 0,
                    socialWorkers: usrData.totalSocialWorkers || usrData.socialWorkerCount || 0,
                    totalPublicUsers: usrData.totalPublicUsers || 0,
                    totalUsers: usrData.totalUsers || 0
                }));
            }

            // Process Pending Transfers
            if (transfersResponse.status === 'fulfilled' && transfersResponse.value.data) {
                // @ts-ignore
                const transfers = transfersResponse.value.data.map((t: any) => ({
                    id: t.id,
                    type: t.type || 'CASE',
                    fromUserId: t.fromUserId || t.fromUser?.id,
                    fromUserName: t.fromUser?.name || t.fromUserName,
                    toUserId: t.toUserId || t.toUser?.id,
                    toUserName: t.toUser?.name || t.toUserName
                }));
                setPendingTransfers(transfers);
                setStats(prev => ({ ...prev, pendingTransfers: transfers.length }));
            }

            // Process Distributions
            if (caseStatusDist.status === 'fulfilled' && caseStatusDist.value.data) {
                const statusData = caseStatusDist.value.data;
                let distribution: any[] = [];
                if (Array.isArray(statusData)) {
                    distribution = statusData;
                } else if (typeof statusData === 'object' && statusData !== null) {
                    // @ts-ignore
                    const total = Object.values(statusData).reduce((sum: number, val: any) => sum + Number(val), 0);
                    distribution = Object.entries(statusData).map(([status, count]) => ({
                        // @ts-ignore
                        status: status.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
                        count: Number(count),
                        // @ts-ignore
                        percentage: total > 0 ? (Number(count) / total) * 100 : 0
                    }));
                }
                setCaseStatusDistribution(distribution);
            }

            if (helpTypeDist.status === 'fulfilled' && helpTypeDist.value.data) {
                const typeData = helpTypeDist.value.data;
                let distribution: any[] = [];
                if (Array.isArray(typeData)) {
                    distribution = typeData;
                } else if (typeof typeData === 'object') {
                    // @ts-ignore
                    const total = Object.values(typeData).reduce((sum: number, val: any) => sum + Number(val), 0);
                    distribution = Object.entries(typeData).map(([type, count]) => ({
                        // @ts-ignore
                        type: type.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
                        count: Number(count),
                        // @ts-ignore
                        percentage: total > 0 ? (Number(count) / total) * 100 : 0
                    }));
                }
                setHelpRequestTypeDistribution(distribution);
            }

            // Process Social Workers
            if (workersResponse.status === 'fulfilled' && workersResponse.value) {
                const workers = workersResponse.value;
                if (Array.isArray(workers)) {
                    // @ts-ignore
                    const mappedWorkers = workers.map((w: any) => {
                        const id = w.id || w.userId || 'unknown';
                        return {
                            id: id,
                            userId: w.userId || id,
                            fullName: w.fullName || w.name || `Social Worker (${id.substring(0, 5)})`,
                            specialization: Array.isArray(w.specializations) ? w.specializations.join(', ') : (w.specialization || 'General Social Work'),
                            availabilityStatus: w.available ? 'AVAILABLE' : 'BUSY',
                            registrationDate: w.registrationDate
                        };
                    });
                    setSocialWorkers(mappedWorkers);
                }
            }


        } catch (err: any) {
            setError(err.message || 'Failed to fetch dashboard data');
        } finally {
            setLoading(false);
        }
    }, [dateFilter, getDateRange]);

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 30000);
        return () => clearInterval(interval);
    }, [fetchData]);

    return {
        loading,
        error,
        stats,
        recentCases,
        recentHelpRequests,
        pendingTransfers,
        caseStatusDistribution,
        helpRequestTypeDistribution,
        socialWorkers,
        refresh: fetchData
    };
};
