import React, { useState } from 'react';
import {
    MoreHorizontal,
    Eye,
    Edit3,
    MessageCircle,
    Filter,
    Search,
    ChevronLeft,
    ChevronRight,
    MapPin,
    AlertTriangle,
    Clock,
    Check,
    X,
    ShieldAlert
} from 'lucide-react';

interface HelpRequest {
    id: string;
    trackingId: string;
    helpType: string;
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'EMERGENCY';
    status: string;
    location: string;
    requestDate: string;
    anonymous: boolean;
}

const AssignedRequests: React.FC = () => {
    const [activeTab, setActiveTab] = useState('ALL');
    const [searchQuery, setSearchQuery] = useState('');
    const [confirmingAction, setConfirmingAction] = useState<{ id: string, type: string } | null>(null);

    const handleAction = (id: string, type: string) => {
        setConfirmingAction({ id, type });
    };

    const confirmAction = () => {
        console.log(`Confirming ${confirmingAction?.type} for ${confirmingAction?.id}`);
        setConfirmingAction(null);
        // Add actual API call here
    };

    // Mock data based on requirements
    const requests: HelpRequest[] = [
        {
            id: '1',
            trackingId: 'REQ-8821',
            helpType: 'Child Protection',
            priority: 'EMERGENCY',
            status: 'IN_PROGRESS',
            location: 'Colombo 03',
            requestDate: '2026-01-24',
            anonymous: true
        },
        {
            id: '2',
            trackingId: 'REQ-9104',
            helpType: 'Counseling',
            priority: 'HIGH',
            status: 'NEW',
            location: 'Kandy',
            requestDate: '2026-01-25',
            anonymous: false
        },
        {
            id: '3',
            trackingId: 'REQ-7723',
            helpType: 'Foster Care',
            priority: 'MEDIUM',
            status: 'PENDING_DOCUMENTATION',
            location: 'Galle',
            requestDate: '2026-01-23',
            anonymous: false
        },
    ];

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'EMERGENCY': return 'bg-red-100 text-red-700 border-red-200';
            case 'HIGH': return 'bg-amber-100 text-amber-700 border-amber-200';
            case 'MEDIUM': return 'bg-blue-100 text-blue-700 border-blue-200';
            default: return 'bg-slate-100 text-slate-700 border-slate-200';
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            {/* Header & Controls */}
            <div className="p-6 border-b border-slate-100">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div>
                        <h3 className="text-xl font-bold text-slate-900">Assigned Help Requests</h3>
                        <p className="text-sm text-slate-500">Manage and track your active support cases</p>
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input
                                type="text"
                                placeholder="Search tracking ID..."
                                className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all w-64"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <button className="p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-100 transition-all">
                            <Filter size={18} />
                        </button>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    {['ALL', 'NEW', 'IN PROGRESS', 'FOLLOW UP', 'COMPLETED'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`pb-3 text-sm font-semibold transition-all relative ${activeTab === tab ? 'text-blue-600' : 'text-slate-500 hover:text-slate-800'
                                }`}
                        >
                            {tab}
                            {activeTab === tab && (
                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full"></div>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-slate-50/50">
                        <tr>
                            <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Tracking ID</th>
                            <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Help Type</th>
                            <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Priority</th>
                            <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Location</th>
                            <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Date</th>
                            <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {requests.map((request) => (
                            <tr key={request.id} className="hover:bg-slate-50/50 transition-colors group">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-xs uppercase">
                                            {request.trackingId.split('-')[0]}
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-900 leading-none">{request.trackingId}</p>
                                            {request.anonymous && (
                                                <span className="inline-flex items-center px-1.5 py-0.5 mt-1 rounded text-[10px] font-bold bg-slate-100 text-slate-600 uppercase">Anonymous</span>
                                            )}
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 font-medium text-slate-700">{request.helpType}</td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${getPriorityColor(request.priority)}`}>
                                        {request.priority === 'EMERGENCY' && <AlertTriangle size={12} />}
                                        {request.priority}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-1.5 text-slate-500 text-sm">
                                        <MapPin size={14} />
                                        {request.location}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                                        <span className="text-sm font-semibold text-slate-600 uppercase tracking-tight">{request.status.replace('_', ' ')}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex flex-col">
                                        <span className="text-sm font-medium text-slate-700">{request.requestDate}</span>
                                        <span className="text-[10px] text-slate-400 flex items-center gap-1">
                                            <Clock size={10} /> 2 days ago
                                        </span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="View Details">
                                            <Eye size={18} />
                                        </button>
                                        <button className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all" title="Update Status">
                                            <Edit3 size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleAction(request.id, 'COMPLETE')}
                                            className="p-2 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all"
                                            title="Mark Completed"
                                        >
                                            <Check size={18} />
                                        </button>
                                        <div className="h-4 w-px bg-slate-200 mx-1"></div>
                                        <button
                                            onClick={() => handleAction(request.id, 'TRANSFER')}
                                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                            title="Transfer Case"
                                        >
                                            <X size={18} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="p-6 border-t border-slate-100 flex items-center justify-between">
                <span className="text-sm text-slate-500 font-medium">Showing 1 to 3 of 12 results</span>
                <div className="flex items-center gap-2">
                    <button className="p-2 text-slate-400 hover:text-slate-900 disabled:opacity-30" disabled>
                        <ChevronLeft size={20} />
                    </button>
                    <div className="flex items-center gap-1">
                        {[1, 2, 3].map(p => (
                            <button key={p} className={`w-8 h-8 rounded-lg text-sm font-bold transition-all ${p === 1 ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}>
                                {p}
                            </button>
                        ))}
                    </div>
                    <button className="p-2 text-slate-400 hover:text-slate-900">
                        <ChevronRight size={20} />
                    </button>
                </div>
            </div>

            {/* Confirmation Modal */}
            {confirmingAction && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 animate-in zoom-in-95 duration-200">
                        <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center text-amber-600 mb-4">
                            <ShieldAlert size={24} />
                        </div>
                        <h4 className="text-xl font-bold text-slate-900 mb-2">Confirm Action?</h4>
                        <p className="text-slate-600 text-sm mb-6">
                            Are you sure you want to {confirmingAction.type.toLowerCase()} request <span className="font-bold text-slate-900">{confirmingAction.id}</span>?
                            This action may be recorded for audit purposes.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setConfirmingAction(null)}
                                className="flex-1 py-2.5 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmAction}
                                className="flex-1 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all"
                            >
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AssignedRequests;
