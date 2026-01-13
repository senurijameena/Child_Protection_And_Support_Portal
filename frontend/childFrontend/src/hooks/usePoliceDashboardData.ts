import { useState, useEffect, useCallback } from 'react';
import { authService } from '../services/authService';

export interface PoliceStats {
    assignedCases: number;
    urgentCases: number;
    resolvedToday: number;
    avgResponse: string;
}

export interface PoliceCase {
    id: string;
    trackingId?: string;
    caseType: string;
    priority: string;
    status: string;
    date: string;
    location?: string;
}

interface Activity {
    id: number;
    text: string;
    time: string;
}

const MOCK_STATS = {
    assignedCases: 5,
    urgentCases: 2,
    resolvedToday: 3,
    avgResponse: '2.4h'
};

const MOCK_CASES = [
    { id: 'C-1001', type: 'Child Abuse', priority: 'HIGH', status: 'INVESTIGATING', date: '2024-01-05' },
    { id: 'C-1002', type: 'Neglect', priority: 'MEDIUM', status: 'ASSIGNED', date: '2024-01-04' },
    { id: 'C-1003', type: 'Domestic Violence', priority: 'CRITICAL', status: 'NEW', date: '2024-01-06' },
    { id: 'C-1004', type: 'Cyber Bullying', priority: 'LOW', status: 'RESOLVED', date: '2023-12-28' },
    { id: 'C-1005', type: 'Missing Child', priority: 'CRITICAL', status: 'INVESTIGATING', date: '2024-01-06' },
];

const MOCK_ACTIVITY = [
    { id: 1, text: 'Case #C-4567 assigned', time: '2 hours ago' },
    { id: 2, text: 'Evidence added to C-1234', time: '4 hours ago' },
    { id: 3, text: 'Case C-8910 resolved', time: 'Yesterday' },
];

export const usePoliceDashboardData = () => {
    const user = authService.getCurrentUser();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<PoliceStats>(MOCK_STATS);
    const [cases, setCases] = useState<PoliceCase[]>([]);
    const [recentActivity, setRecentActivity] = useState<Activity[]>(MOCK_ACTIVITY);
    const [officerStatus, setOfficerStatus] = useState<'AVAILABLE' | 'BUSY' | 'OFF_DUTY'>('AVAILABLE');
    const [chartData, setChartData] = useState<any>({
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [
            {
                label: 'Cases Resolved',
                data: [1, 3, 2, 4, 3, 5, 2],
                borderColor: 'rgb(75, 192, 192)',
                backgroundColor: 'rgba(75, 192, 192, 0.5)',
                tension: 0.3
            },
            {
                label: 'New Assignments',
                data: [2, 1, 3, 2, 4, 2, 1],
                borderColor: 'rgb(255, 99, 132)',
                backgroundColor: 'rgba(255, 99, 132, 0.5)',
                tension: 0.3
            },
        ],
    });

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('authToken');
            const headers = { 'Authorization': `Bearer ${token}` };

            // Attempt to fetch real data, fallback to mock if fails (or if endpoints don't exist yet)
            try {
                const statsResponse = await fetch('/api/police/dashboard/stats', { headers });
                if (statsResponse.ok) {
                    const data = await statsResponse.json();
                    setStats({
                        assignedCases: data.activeCases || data.assignedCases || 0,
                        urgentCases: data.emergencyCases || data.urgentCases || 0,
                        resolvedToday: data.resolvedToday || 0,
                        avgResponse: data.avgResponse || 'N/A'
                    });
                }

                const casesResponse = await fetch('/api/police/dashboard/cases', { headers });
                if (casesResponse.ok) {
                    const data = await casesResponse.json();
                    if (Array.isArray(data)) {
                        setCases(data.map((c: any) => ({
                            id: c.id,
                            trackingId: c.trackingId || c.id,
                            caseType: c.caseType || c.type || 'Unknown',
                            priority: c.priority || 'MEDIUM',
                            status: c.status || 'NEW',
                            date: c.reportDate || c.date || new Date().toISOString(),
                            location: c.location
                        })));
                    }
                } else {
                    setCases(MOCK_CASES.map(c => ({
                        id: c.id,
                        trackingId: c.id,
                        caseType: c.type,
                        priority: c.priority,
                        status: c.status,
                        date: c.date
                    })));
                }

            } catch (err) {
                console.warn("Using mock data for police dashboard");
                setCases(MOCK_CASES.map(c => ({
                    id: c.id,
                    trackingId: c.id,
                    caseType: c.type,
                    priority: c.priority,
                    status: c.status,
                    date: c.date
                })));
            }

            // Simulate delay for smoothness
            await new Promise(resolve => setTimeout(resolve, 800));

        } catch (error) {
            console.error("Failed to fetch dashboard data", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return {
        user,
        loading,
        stats,
        cases,
        recentActivity,
        chartData,
        officerStatus,
        setOfficerStatus,
        refresh: fetchData
    };
};
