import React from 'react';
import {
    Calendar,
    CheckSquare,
    Clock,
    MoreVertical,
    Plus,
    AlertCircle
} from 'lucide-react';

const FollowUps: React.FC = () => {
    const followUps = [
        { id: '1', caseId: 'REQ-8821', date: '2026-01-26', status: 'PENDING', notes: 'Home visit and wellness check' },
        { id: '2', caseId: 'REQ-7723', date: '2026-01-25', status: 'OVERDUE', notes: 'Document verification' },
        { id: '3', caseId: 'REQ-9104', date: '2026-01-28', status: 'SCHEDULED', notes: 'Initial assessment interview' },
    ];

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 h-full">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-bold text-slate-900">Follow-Ups & Reminders</h3>
                    <p className="text-xs text-slate-500">Upcoming tasks and case reviews</p>
                </div>
                <button className="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-all">
                    <Plus size={20} />
                </button>
            </div>

            <div className="p-4 space-y-4">
                {followUps.map((item) => (
                    <div
                        key={item.id}
                        className={`p-4 rounded-xl border leading-tight transition-all hover:shadow-md ${item.status === 'OVERDUE' ? 'bg-red-50/50 border-red-100' : 'bg-slate-50 border-slate-100'
                            }`}
                    >
                        <div className="flex items-start justify-between mb-3">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="font-bold text-slate-900">{item.caseId}</span>
                                    {item.status === 'OVERDUE' && (
                                        <span className="flex items-center gap-1 px-1.5 py-0.5 bg-red-100 text-red-700 text-[10px] font-bold rounded uppercase">
                                            <AlertCircle size={10} /> Overdue
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                    <Calendar size={12} />
                                    {item.date}
                                </div>
                            </div>
                            <button className="text-slate-400 hover:text-slate-600">
                                <MoreVertical size={16} />
                            </button>
                        </div>

                        <p className="text-sm text-slate-600 mb-4 line-clamp-2">{item.notes}</p>

                        <div className="flex items-center gap-2">
                            <button className="flex-1 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all flex items-center justify-center gap-1.5">
                                <CheckSquare size={14} /> Mark Done
                            </button>
                            <button className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all">
                                Reschedule
                            </button>
                        </div>
                    </div>
                ))}

                <button className="w-full py-3 text-sm font-semibold text-blue-600 hover:bg-blue-50 rounded-xl transition-all border border-dashed border-blue-200 mt-2">
                    View All Schedule
                </button>
            </div>
        </div>
    );
};

export default FollowUps;
