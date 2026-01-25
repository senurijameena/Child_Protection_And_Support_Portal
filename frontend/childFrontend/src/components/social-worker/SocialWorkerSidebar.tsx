import React from 'react';
import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    ClipboardList,
    HandHeart,
    Clock,
    ArrowRightLeft,
    MessageSquare,
    Bell,
    BarChart,
    UserCircle,
    ChevronLeft,
    ChevronRight,
    LogOut
} from 'lucide-react';
import { authService } from '../../services/authService';

interface SocialWorkerSidebarProps {
    isCollapsed: boolean;
    onToggle: () => void;
}

const SocialWorkerSidebar: React.FC<SocialWorkerSidebarProps> = ({ isCollapsed, onToggle }) => {

    const navItems = [
        { icon: <LayoutDashboard size={20} />, label: 'Dashboard', path: '/dashboard/social-worker' },
        { icon: <ClipboardList size={20} />, label: 'Assigned Requests', path: '/social-worker/assigned' },
        { icon: <HandHeart size={20} />, label: 'Service Offers', path: '/social-worker/offers' },
        { icon: <Clock size={20} />, label: 'Follow-Ups', path: '/social-worker/follow-ups' },
        { icon: <ArrowRightLeft size={20} />, label: 'Transfers', path: '/social-worker/transfers' },
        { icon: <MessageSquare size={20} />, label: 'Messages', path: '/social-worker/messages' },
        { icon: <Bell size={20} />, label: 'Notifications', path: '/social-worker/notifications' },
        { icon: <BarChart size={20} />, label: 'Analytics', path: '/social-worker/analytics' },
        { icon: <UserCircle size={20} />, label: 'Profile & Availability', path: '/social-worker/profile' },
    ];

    const handleLogout = () => {
        authService.logout();
        window.location.href = '/login';
    };

    return (
        <aside
            className={`fixed left-0 top-20 bottom-0 z-40 bg-white border-r border-slate-200 transition-all duration-300 flex flex-col ${isCollapsed ? 'w-20' : 'w-64'}`}
        >
            {/* Scrollable Nav Items */}
            <div className="flex-1 overflow-y-auto py-6 px-3 custom-scrollbar">
                {!isCollapsed && (
                    <p className="px-4 mb-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Main Menu</p>
                )}

                <div className="space-y-1">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) => `
                                flex items-center gap-3 px-4 py-3 rounded-xl transition-all group
                                ${isActive
                                    ? 'bg-blue-50 text-blue-600 font-semibold shadow-sm'
                                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}
                            `}
                        >
                            {({ isActive }) => (
                                <>
                                    <span className={`transition-transform duration-300 group-hover:scale-110`}>
                                        {item.icon}
                                    </span>
                                    {!isCollapsed && (
                                        <span className="text-[14.5px] whitespace-nowrap">{item.label}</span>
                                    )}
                                    {isActive && !isCollapsed && (
                                        <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-600 shadow-[0_0_8px_rgba(37,99,235,0.6)]"></div>
                                    )}
                                </>
                            )}
                        </NavLink>
                    ))}
                </div>
            </div>

            {/* Bottom Actions */}
            <div className="p-4 border-t border-slate-100 bg-slate-50/50">
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                >
                    <LogOut size={20} />
                    {!isCollapsed && <span className="text-[14.5px] font-medium">Logout</span>}
                </button>

                <button
                    onClick={onToggle}
                    className="mt-4 w-full flex items-center justify-center p-2 text-slate-400 hover:text-blue-600 hover:bg-white rounded-lg border border-transparent hover:border-slate-200 transition-all shadow-sm"
                >
                    {isCollapsed ? <ChevronRight size={18} /> : (
                        <div className="flex items-center gap-2">
                            <ChevronLeft size={18} />
                            <span className="text-xs font-semibold">Collapse Sidebar</span>
                        </div>
                    )}
                </button>
            </div>
        </aside>
    );
};

export default SocialWorkerSidebar;
