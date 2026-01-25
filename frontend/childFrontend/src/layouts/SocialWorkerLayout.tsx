import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import SocialWorkerNavbar from '../components/social-worker/SocialWorkerNavbar';
import SocialWorkerSidebar from '../components/social-worker/SocialWorkerSidebar';

const SocialWorkerLayout: React.FC = () => {
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            {/* Top Navigation Bar */}
            <SocialWorkerNavbar />

            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar Navigation */}
                <SocialWorkerSidebar
                    isCollapsed={isSidebarCollapsed}
                    onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                />

                {/* Main Content Area */}
                <main className={`flex-1 overflow-y-auto transition-all duration-300 ${isSidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
                    <div className="p-6 md:p-8 max-w-7xl mx-auto">
                        <Outlet />
                    </div>
                </main>
            </div>

            {/* Footer could go here if needed, but usually dashboards have simple footers or none */}
        </div>
    );
};

export default SocialWorkerLayout;
