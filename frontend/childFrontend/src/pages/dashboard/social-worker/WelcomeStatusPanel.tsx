import React, { useState } from 'react';
import {
    CheckCircle2,
    Clock,
    AlertCircle,
    Activity,
    Power,
    Plus
} from 'lucide-react';

interface WelcomeStatusPanelProps {
    workerName: string;
    workload: {
        activeRequests: number;
        activeCases: number;
        capacity: { current: number; max: number };
    };
}

const WelcomeStatusPanel: React.FC<WelcomeStatusPanelProps> = ({ workerName, workload }) => {
    const [status, setStatus] = useState<'AVAILABLE' | 'OFF_DUTY' | 'EMERGENCY_ONLY'>('AVAILABLE');
    const capacityPercent = (workload.capacity.current / workload.capacity.max) * 100;

    const statusColors = {
        AVAILABLE: 'bg-green-100 text-green-700 border-green-200',
        OFF_DUTY: 'bg-slate-100 text-slate-700 border-slate-200',
        EMERGENCY_ONLY: 'bg-amber-100 text-amber-700 border-amber-200',
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Greeting & Status Toggle */}
            <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <h2 className="text-2xl font-bold text-slate-900">Welcome back, {workerName}</h2>
                        <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 text-[11px] font-bold rounded-full uppercase tracking-wider border border-blue-100">
                            Social Worker
                        </span>
                    </div>
                    <p className="text-slate-500">You have <span className="text-blue-600 font-semibold">{workload.activeRequests} pending actions</span> for today. Keep up the great work!</p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex p-1 bg-slate-50 rounded-xl border border-slate-200">
                        {(['AVAILABLE', 'OFF_DUTY', 'EMERGENCY_ONLY'] as const).map((s) => (
                            <button
                                key={s}
                                onClick={() => setStatus(s)}
                                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${status === s
                                        ? 'bg-white text-blue-600 shadow-md transform scale-105'
                                        : 'text-slate-500 hover:text-slate-900'
                                    }`}
                            >
                                {s.replace('_', ' ')}
                            </button>
                        ))}
                    </div>
                    {status === 'EMERGENCY_ONLY' && (
                        <div className="flex items-center gap-2 animate-pulse">
                            <AlertCircle size={16} className="text-red-500" />
                            <span className="text-xs font-bold text-red-600">Urgent Mode Active</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Workload Card */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <Activity size={18} className="text-blue-600" />
                        <h3 className="font-bold text-slate-900">Current Workload</h3>
                    </div>
                    <span className="text-xs font-bold text-slate-500">{workload.capacity.current}/{workload.capacity.max} Slots</span>
                </div>

                <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-500">Capacity Utilization</span>
                        <span className={`font-bold ${capacityPercent > 80 ? 'text-red-600' : 'text-blue-600'}`}>
                            {Math.round(capacityPercent)}%
                        </span>
                    </div>

                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                            className={`h-full transition-all duration-1000 ${capacityPercent > 80 ? 'bg-red-500' : capacityPercent > 50 ? 'bg-blue-500' : 'bg-green-500'
                                }`}
                            style={{ width: `${capacityPercent}%` }}
                        ></div>
                    </div>

                    <div className="flex items-center justify-between gap-2 mt-2">
                        <div className="px-3 py-2 bg-slate-50 rounded-xl flex-1 text-center">
                            <p className="text-[10px] font-bold text-slate-400 uppercase">Requests</p>
                            <p className="text-lg font-bold text-slate-800">{workload.activeRequests}</p>
                        </div>
                        <div className="px-3 py-2 bg-slate-50 rounded-xl flex-1 text-center">
                            <p className="text-[10px] font-bold text-slate-400 uppercase">Cases</p>
                            <p className="text-lg font-bold text-slate-800">{workload.activeCases}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WelcomeStatusPanel;
