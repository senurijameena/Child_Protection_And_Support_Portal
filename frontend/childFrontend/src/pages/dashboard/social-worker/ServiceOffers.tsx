import React from 'react';
import {
    HandHeart,
    ChevronRight,
    Clock,
    CheckCircle2,
    XCircle,
    ArrowUpRight
} from 'lucide-react';

const ServiceOffers: React.FC = () => {
    const offers = [
        { id: '1', type: 'Temporary Shelter', case: 'REQ-8821', date: '2026-01-24', status: 'ACCEPTED' },
        { id: '2', type: 'Education Support', case: 'REQ-9104', date: '2026-01-25', status: 'PENDING' },
        { id: '3', type: 'Specialized Counseling', case: 'NONE', date: '2026-01-23', status: 'DECLINED' },
    ];

    const getStatusStyles = (status: string) => {
        switch (status) {
            case 'ACCEPTED': return 'bg-green-50 text-green-700 border-green-100';
            case 'DECLINED': return 'bg-red-50 text-red-700 border-red-100';
            default: return 'bg-blue-50 text-blue-700 border-blue-100';
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 h-full">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-bold text-slate-900">Service Offers</h3>
                    <p className="text-xs text-slate-500">Proactive support provisions</p>
                </div>
                <button className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl hover:bg-blue-700 transition-all shadow-md shadow-blue-200 flex items-center gap-2">
                    <HandHeart size={14} /> New Offer
                </button>
            </div>

            <div className="p-2">
                <div className="space-y-1">
                    {offers.map((offer) => (
                        <div key={offer.id} className="p-4 rounded-xl hover:bg-slate-50 transition-all group flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${getStatusStyles(offer.status)} font-bold`}>
                                    <HandHeart size={18} />
                                </div>
                                <div>
                                    <h4 className="text-[15px] font-bold text-slate-900">{offer.type}</h4>
                                    <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                                        Case: <span className="font-semibold text-slate-700">{offer.case}</span> •
                                        <Clock size={12} className="ml-1" /> {offer.date}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusStyles(offer.status)}`}>
                                    {offer.status}
                                </span>
                                <button className="p-1.5 text-slate-400 hover:text-blue-600 transition-all">
                                    <ChevronRight size={18} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="p-4 mt-auto">
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Efficiency Tip</span>
                        <ArrowUpRight size={14} className="text-blue-500" />
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                        Offers linked to specific cases have a <span className="font-bold text-slate-900">45% higher acceptance rate</span>. Try linking your services!
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ServiceOffers;
