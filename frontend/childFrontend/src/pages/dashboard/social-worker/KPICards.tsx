import React from 'react';
import {
    ClipboardList,
    CheckCircle2,
    ShieldAlert,
    Clock,
    HandHeart
} from 'lucide-react';

interface KPICardsProps {
    stats: {
        assignedTotal: number;
        inProgress: number;
        completed: number;
        activeCases: number;
        pendingFollowups: number;
        serviceOffersSent: number;
    };
}

const KPICards: React.FC<KPICardsProps> = ({ stats }) => {
    const cards = [
        {
            label: 'Assigned Requests',
            value: stats.assignedTotal,
            subValue: `${stats.inProgress} In Progress`,
            icon: <ClipboardList size={24} className="text-blue-600" />,
            bgColor: 'bg-blue-50',
            borderColor: 'border-blue-100',
            trend: 'Total'
        },
        {
            label: 'Active Cases',
            value: stats.activeCases,
            subValue: 'Requires Support',
            icon: <ShieldAlert size={24} className="text-amber-600" />,
            bgColor: 'bg-amber-50',
            borderColor: 'border-amber-100',
            trend: 'Urgent'
        },
        {
            label: 'Completed Work',
            value: stats.completed,
            subValue: 'Success Stories',
            icon: <CheckCircle2 size={24} className="text-green-600" />,
            bgColor: 'bg-green-50',
            borderColor: 'border-green-100',
            trend: '+12% this month'
        },
        {
            label: 'Pending Follow-Ups',
            value: stats.pendingFollowups,
            subValue: 'Next 48 Hours',
            icon: <Clock size={24} className="text-purple-600" />,
            bgColor: 'bg-purple-50',
            borderColor: 'border-purple-100',
            trend: 'Action Required'
        },
        {
            label: 'Service Offers',
            value: stats.serviceOffersSent,
            subValue: 'Community Support',
            icon: <HandHeart size={24} className="text-indigo-600" />,
            bgColor: 'bg-indigo-50',
            borderColor: 'border-indigo-100',
            trend: 'Proactive'
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-8">
            {cards.map((card, index) => (
                <button
                    key={index}
                    className={`group relative p-5 rounded-2xl border ${card.borderColor} ${card.bgColor} transition-all duration-300 hover:shadow-lg hover:shadow-blue-900/5 hover:-translate-y-1 text-left overflow-hidden bg-white/40 backdrop-blur-sm`}
                >
                    <div className="flex items-start justify-between mb-4">
                        <div className={`p-3 rounded-xl bg-white shadow-sm transition-transform duration-300 group-hover:scale-110`}>
                            {card.icon}
                        </div>
                        <span className="text-[10px] font-bold text-blue-600/70 uppercase tracking-widest">{card.trend}</span>
                    </div>

                    <h3 className="text-3xl font-bold text-slate-900 mb-1">{card.value}</h3>
                    <p className="text-sm font-bold text-slate-700">{card.label}</p>
                    <p className="text-xs text-slate-500 mt-1">{card.subValue}</p>

                    {/* Decorative Circle */}
                    <div className="absolute -right-4 -bottom-4 w-16 h-16 rounded-full bg-white opacity-20 pointer-events-none group-hover:scale-150 transition-transform duration-500"></div>
                </button>
            ))}
        </div>
    );
};

export default KPICards;
