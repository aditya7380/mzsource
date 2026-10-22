import React from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useApp } from '../../context/AppContext';
import { formatCurrency } from '../../lib/format';
import { getStatusColor } from '../../data/appTypes';

export default function AdminAnalytics() {
  const { requests, customers, products } = useApp();

  const totalRequests = requests.length;
  const completed = requests.filter(r => r.status === 'COMPLETED').length;
  const completionRate = totalRequests > 0 ? Math.round((completed / totalRequests) * 100) : 0;
  const quotedValue = requests.reduce((s, r) => s + (r.quotation?.totalAmount || 0), 0);
  const avgItems = totalRequests > 0 ? (requests.reduce((s, r) => s + r.items.length, 0) / totalRequests).toFixed(1) : '0';

  const statusData = Object.entries(
    requests.reduce<Record<string, number>>((acc, r) => { acc[r.status] = (acc[r.status] || 0) + 1; return acc; }, {}),
  ).map(([status, count]) => ({ name: status, value: count, color: getStatusColor(status as any) }));

  const typeData = Object.entries(
    requests.reduce<Record<string, number>>((acc, r) => { acc[r.customerType] = (acc[r.customerType] || 0) + 1; return acc; }, {}),
  ).map(([type, count]) => ({ type, count }));

  const cards = [
    { label: 'Total Requests', value: totalRequests, color: '#0F5D3C', bg: '#E6F2EA' },
    { label: 'Completion Rate', value: `${completionRate}%`, color: '#16A34A', bg: '#DCFCE7' },
    { label: 'Total Customers', value: customers.length, color: '#7C3AED', bg: '#EDE9FE' },
    { label: 'Quoted Value', value: formatCurrency(quotedValue), color: '#B4471C', bg: '#FBEADF' },
  ];

  const keyMetrics = [
    { label: 'Avg. Items / Request', value: avgItems },
    { label: 'Total Products', value: products.length },
    { label: 'Completed Requests', value: completed },
    { label: 'Pending Requests', value: requests.filter(r => r.status === 'PENDING').length },
  ];

  return (
    <div className="px-5 lg:px-8 py-6 max-w-6xl mx-auto">
      <h1 className="text-xl lg:text-2xl font-extrabold text-[#1B2420]">Analytics</h1>
      <p className="text-sm text-[#55605A] mb-6">Business performance overview based on live data</p>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {cards.map(c => (
          <div key={c.label} className="bg-white rounded-2xl border border-[#E4DDCE] p-5">
            <div className="w-3 h-3 rounded-sm mb-3" style={{ backgroundColor: c.color }} />
            <p className="text-2xl font-extrabold text-[#1B2420]">{c.value}</p>
            <p className="text-xs text-[#55605A] mt-0.5">{c.label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-2xl border border-[#E4DDCE] p-5">
          <h3 className="text-sm font-bold text-[#1B2420] mb-4">Request Status Distribution</h3>
          {statusData.length === 0 ? <p className="text-sm text-[#55605A] text-center py-16">No data yet</p> : (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={({ name, value }) => `${name}: ${value}`}>
                  {statusData.map((entry, idx) => <Cell key={idx} fill={entry.color} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-[#E4DDCE] p-5">
          <h3 className="text-sm font-bold text-[#1B2420] mb-4">Requests by Customer Type</h3>
          {typeData.length === 0 ? <p className="text-sm text-[#55605A] text-center py-16">No data yet</p> : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={typeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E4DDCE" />
                <XAxis dataKey="type" tick={{ fontSize: 11, fill: '#55605A' }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#55605A' }} />
                <Tooltip />
                <Bar dataKey="count" fill="#0F5D3C" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-[#E4DDCE] p-5">
        <h3 className="text-sm font-bold text-[#1B2420] mb-4">Key Metrics</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {keyMetrics.map(m => (
            <div key={m.label} className="text-center py-3 rounded-xl bg-[#FAF7F0]">
              <p className="text-2xl font-extrabold text-[#1B2420]">{m.value}</p>
              <p className="text-[11.5px] text-[#55605A] mt-1">{m.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
