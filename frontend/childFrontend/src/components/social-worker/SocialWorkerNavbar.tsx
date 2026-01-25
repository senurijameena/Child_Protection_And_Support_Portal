import React, { useState } from 'react';
import {
    Search,
    Bell,
    MessageSquare,
    User,
    Settings,
    LogOut,
    ChevronDown,
    Shield
} from 'lucide-react';
import { authService } from '../../services/authService';

const SocialWorkerNavbar: React.FC = () => {
    const user = authService.getCurrentUser();
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    const handleLogout = () => {
        authService.logout();
        window.location.href = '/login';
    };

    return (
        <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 h-20 flex items-center justify-between px-8 shadow-sm">
            {/* Left: Logo */}
            <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
                    <Shield size={24} />
                </div>
                <div className="hidden md:block">
                    <h1 className="text-lg font-bold text-slate-900 leading-tight">Child Protection and Support Portal</h1>
                    <p className="text-[10px] font-semibold text-blue-600 tracking-wider uppercase">Social Worker Portal</p>
                </div>
            </div>

            {/* Middle: Search Bar */}
            <div className="flex-1 max-w-md mx-8 hidden lg:block">
                <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
                        <Search size={18} />
                    </div>
                    <input
                        type="text"
                        placeholder="Search tracking ID, user, location..."
                        className="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all"
                    />
                </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2 md:gap-4">
                {/* Notifications */}
                <button className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all relative">
                    <Bell size={20} />
                    <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white">
                        3
                    </span>
                </button>

                {/* Messages */}
                <button className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
                    <MessageSquare size={20} />
                </button>

                <div className="h-8 w-[1px] bg-slate-200 mx-1"></div>

                {/* Profile Dropdown */}
                <div className="relative">
                    <button
                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                        className="flex items-center gap-3 p-1 rounded-lg hover:bg-slate-50 transition-all border border-transparent hover:border-slate-200"
                    >
                        <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm">
                            {user?.name?.charAt(0) || 'SW'}
                        </div>
                        <div className="hidden sm:block text-left">
                            <p className="text-sm font-semibold text-slate-900 leading-none">{user?.name || 'Social Worker'}</p>
                            <p className="text-xs text-slate-500 mt-1">Social Worker</p>
                        </div>
                        <ChevronDown size={14} className={`text-slate-400 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isProfileOpen && (
                        <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-xl py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                            <div className="px-4 py-2 border-b border-slate-100 mb-1">
                                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</p>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                    <span className="text-sm font-medium text-slate-700">Available</span>
                                </div>
                            </div>
                            <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-colors">
                                <User size={16} />
                                View Profile
                            </button>
                            <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-colors">
                                <Settings size={16} />
                                Settings
                            </button>
                            <div className="border-t border-slate-100 mt-1 pt-1">
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                >
                                    <LogOut size={16} />
                                    Logout
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default SocialWorkerNavbar;
