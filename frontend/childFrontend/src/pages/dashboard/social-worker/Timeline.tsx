import React from 'react';
import {
    GitCommit,
    UserPlus,
    FileCheck,
    MessageCircle,
    ArrowUpCircle
} from 'lucide-react';

const Timeline: React.FC = () => {
    const events = [
        { id: '1', type: 'ASSIGNED', title: 'Help Request Assigned', detail: 'REQ-8821 assigned to you', time: '10:30 AM', icon: <UserPlus size={16} />, color: 'bg-blue-500' },
        { id: '2', type: 'STATUS', title: 'Status Updated', detail: 'REQ-9104 moved to IN PROGRESS', time: 'Yesterday', icon: <FileCheck size={16} />, color: 'bg-green-500' },
        { id: '3', type: 'MESSAGE', title: 'New Message', detail: 'From requester of REQ-7723', time: 'Yesterday', icon: <MessageCircle size={16} />, color: 'bg-purple-500' },
        { id: '4', type: 'OFFER', title: 'Offer Accepted', detail: 'Shelter offer accepted for REQ-8821', time: '2 days ago', icon: <ArrowUpCircle size={16} />, color: 'bg-amber-500' },
    ];

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 h-full">
            <div className="p-6 border-b border-slate-100">
                <h3 className="text-lg font-bold text-slate-900">Activity Timeline</h3>
                <p className="text-xs text-slate-500">Recent events and updates</p>
            </div>

            <div className="p-6 relative">
                {/* Vertical Line */}
                <div className="absolute left-[35px] top-8 bottom-8 w-0.5 bg-slate-100"></div>

                <div className="space-y-8">
                    {events.map((event) => (
                        <div key={event.id} className="relative flex items-start gap-4">
                            <div className={`z-10 w-[20px] h-[20px] rounded-full flex items-center justify-center text-white ${event.color} ring-4 ring-white shadow-sm`}>
                                {event.icon}
                            </div>

                            <div className="flex-1 -mt-1">
                                <div className="flex items-center justify-between mb-1">
                                    <h4 className="text-sm font-bold text-slate-900">{event.title}</h4>
                                    <span className="text-[10px] font-medium text-slate-400">{event.time}</span>
                                </div>
                                <p className="text-xs text-slate-500 leading-relaxed font-medium">{event.detail}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <button className="w-full mt-6 py-2 text-xs font-bold text-slate-500 hover:text-blue-600 transition-all text-center border border-slate-100 rounded-lg hover:bg-slate-50">
                    View Full Audit Log
                </button>
            </div>
        </div>
    );
};

export default Timeline;
