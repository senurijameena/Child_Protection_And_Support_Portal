import React from 'react';
import WelcomeStatusPanel from './WelcomeStatusPanel';
import KPICards from './KPICards';
import AssignedRequests from './AssignedRequests';
import FollowUps from './FollowUps';
import ServiceOffers from './ServiceOffers';
import Timeline from './Timeline';
import Analytics from './Analytics';
import { authService } from '../../../services/authService';

const SocialWorkerDashboardMain: React.FC = () => {
    const user = authService.getCurrentUser();

    // Mock data
    const workload = {
        activeRequests: 4,
        activeCases: 2,
        capacity: { current: 6, max: 10 }
    };

    const stats = {
        assignedTotal: 12,
        inProgress: 4,
        completed: 28,
        activeCases: 6,
        pendingFollowups: 3,
        serviceOffersSent: 15
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* 1. Welcome & Status Panel */}
            <WelcomeStatusPanel
                workerName={user?.name || 'Social Worker'}
                workload={workload}
            />

            {/* 2. KPI Summary Cards */}
            <KPICards stats={stats} />

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* 3. Assigned Help Requests Panel (Large) */}
                <div className="xl:col-span-2">
                    <AssignedRequests />
                </div>

                {/* 4. Follow-Ups & Reminders */}
                <div className="xl:col-span-1">
                    <FollowUps />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
                {/* 5. Service Offers Panel */}
                <ServiceOffers />

                {/* 6. Activity Timeline */}
                <Timeline />

                {/* 7. Quick Analytics / Messages Preview */}
                <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-8 text-white relative overflow-hidden shadow-xl shadow-blue-200">
                    <div className="relative z-10 h-full flex flex-col justify-between">
                        <div>
                            <h3 className="text-2xl font-bold mb-2">Performance Summary</h3>
                            <p className="text-blue-100 text-sm">You have completed <span className="font-bold text-white">85%</span> of your targets this month. Great progress!</p>
                        </div>

                        <div className="mt-8 space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-blue-100">Tasks Completed</span>
                                <span className="text-lg font-bold">24 / 30</span>
                            </div>
                            <div className="w-full h-1.5 bg-white/20 rounded-full">
                                <div className="w-[80%] h-full bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.5)]"></div>
                            </div>
                        </div>

                        <button className="mt-12 w-full py-4 bg-white text-blue-600 font-bold rounded-2xl hover:bg-blue-50 transition-all shadow-lg transform hover:-translate-y-1">
                            Download Monthly Report
                        </button>
                    </div>

                    {/* Decorative Background Elements */}
                    <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-[-10%] left-[-10%] w-48 h-48 bg-white/5 rounded-full blur-2xl"></div>
                </div>
            </div>

            {/* 8. Full Analytics Panel */}
            <div className="pt-8 border-t border-slate-200">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900">Workforce Analytics</h2>
                        <p className="text-slate-500">Visualizing impact and operational efficiency</p>
                    </div>
                </div>
                <Analytics />
            </div>
        </div>
    );
};

export default SocialWorkerDashboardMain;
