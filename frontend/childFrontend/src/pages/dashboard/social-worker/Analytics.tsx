import React from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell
} from 'recharts';

const Analytics: React.FC = () => {
    const barData = [
        { name: 'Jan', requests: 12, completed: 8 },
        { name: 'Feb', requests: 19, completed: 14 },
        { name: 'Mar', requests: 15, completed: 12 },
        { name: 'Apr', requests: 22, completed: 18 },
        { name: 'May', requests: 30, completed: 25 },
    ];

    const pieData = [
        { name: 'Child Protection', value: 40, color: '#3b82f6' },
        { name: 'Counseling', value: 30, color: '#10b981' },
        { name: 'Foster Care', value: 20, color: '#f59e0b' },
        { name: 'Legal Aid', value: 10, color: '#ef4444' },
    ];

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Monthly Performance */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-lg font-bold text-slate-900">Workload & Completion</h3>
                        <p className="text-xs text-slate-500">Monthly performance metrics</p>
                    </div>
                    <select className="text-xs font-bold bg-slate-50 border-none rounded-lg focus:ring-0">
                        <option>Last 6 Months</option>
                        <option>Last Year</option>
                    </select>
                </div>

                <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={barData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis
                                dataKey="name"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 12, fill: '#94a3b8', fontWeight: 500 }}
                                dy={10}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 12, fill: '#94a3b8', fontWeight: 500 }}
                            />
                            <Tooltip
                                cursor={{ fill: '#f8fafc' }}
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                            />
                            <Bar dataKey="requests" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="completed" fill="#10b981" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Help Type Distribution */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                <h3 className="text-lg font-bold text-slate-900 mb-6">Help Type Distribution</h3>

                <div className="flex flex-col md:flex-row items-center gap-8">
                    <div className="h-[200px] w-[200px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="flex-1 space-y-3 w-full">
                        {pieData.map((item) => (
                            <div key={item.name} className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                                    <span className="text-sm font-medium text-slate-600">{item.name}</span>
                                </div>
                                <span className="text-sm font-bold text-slate-900">{item.value}%</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Analytics;
