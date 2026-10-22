import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipboardList, Users, Package, CheckCircle2, ChevronRight, PlusCircle, LayoutGrid, UsersRound, BarChart3 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { StatusBadge } from '../../components/common/Misc';
import { formatDate } from '../../lib/format';
import type { RequestStatus } from '../../data/appTypes';

const STATUS_ORDER: RequestStatus[] = ['PENDING', 'SELECTED', 'CONFIRMED', 'COMPLETED', 'REJECTED', 'CANCELLED'];
const STATUS_DOT: Record<RequestStatus, string> = { PENDING: '#F59E0B', SELECTED: '#2F80ED', CONFIRMED: '#16A34A', COMPLETED: '#0F5D3C', REJECTED: '#DC2626', CANCELLED: '#6B7280' };

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { requests, customers, products } = useApp();

  const completed = requests.filter(r => r.status === 'COMPLETED').length;
  const cards = [
    { label: 'Total Requests', value: requests.length, icon: ClipboardList, color: '#0F5D3C', bg: '#E6F2EA' },
    { label: 'Customers', value: customers.length, icon: Users, color: '#7C3AED', bg: '#EDE9FE' },
    { label: 'Products', value: products.length, icon: Package, color: '#16A34A', bg: '#DCFCE7' },
    { label: 'Completed', value: completed, icon: CheckCircle2, color: '#0891B2', bg: '#CFFAFE' },
  ];

  const recent = [...requests].sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()).slice(0, 5);

  const quickActions = [
    { label: 'Add New Product', icon: PlusCircle, to: '/admin/products' },
    { label: 'Manage Categories', icon: LayoutGrid, to: '/admin/categories' },
    { label: 'View All Customers', icon: UsersRound, to: '/admin/customers' },
    { label: 'Analytics', icon: BarChart3, to: '/admin/analytics' },
  ];

  return (
    <div className="px-5 lg:px-8 py-6 max-w-7xl mx-auto">
      <h1 className="text-xl lg:text-2xl font-extrabold text-[#1B2420]">Dashboard</h1>
      <p className="text-sm text-[#55605A] mb-6">Welcome back, Admin. Here's your business overview.</p>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {cards.map(c => (
          <div key={c.label} className="bg-white rounded-2xl border border-[#E4DDCE] p-5">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ backgroundColor: c.bg }}><c.icon className="w-5 h-5" style={{ color: c.color }} /></div>
            <p className="text-2xl font-extrabold text-[#1B2420]">{c.value}</p>
            <p className="text-xs text-[#55605A] mt-0.5">{c.label}</p>
          </div>
        ))}
      </div>

      <h3 className="text-sm font-bold text-[#1B2420] mb-3">Request Status Overview</h3>
      <div className="grid grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        {STATUS_ORDER.map(s => (
          <div key={s} className="bg-white rounded-2xl border border-[#E4DDCE] p-4">
            <p className="text-xl font-extrabold text-[#1B2420]">{requests.filter(r => r.status === s).length}</p>
            <div className="flex items-center gap-1.5 mt-1"><span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: STATUS_DOT[s] }} /><span className="text-[11.5px] text-[#55605A] capitalize">{s.charAt(0) + s.slice(1).toLowerCase()}</span></div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-[#E4DDCE] overflow-hidden">
          <div className="flex items-center justify-between p-5 pb-3">
            <h3 className="text-sm font-bold text-[#1B2420]">Recent Requests</h3>
            <button onClick={() => navigate('/admin/requests')} className="text-xs font-semibold text-[#0F5D3C] flex items-center gap-0.5">View All <ChevronRight className="w-3.5 h-3.5" /></button>
          </div>
          <div className="divide-y divide-[#E4DDCE]">
            {recent.map(req => (
              <button key={req.id} onClick={() => navigate(`/admin/requests/${req.id}`)} className="w-full flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50">
                <div className="w-9 h-9 rounded-lg bg-[#E6F2EA] flex items-center justify-center flex-shrink-0"><ClipboardList className="w-4 h-4 text-[#0F5D3C]" /></div>
                <div className="flex-1 min-w-0 text-left">
                  <div className="flex items-center gap-2"><p className="text-[13px] font-bold text-[#1B2420]">{req.id}</p><StatusBadge status={req.status} size="sm" /></div>
                  <p className="text-[12px] text-[#55605A] truncate">{req.customerName} · {req.customerType}</p>
                </div>
                <div className="text-right flex-shrink-0"><p className="text-[11.5px] text-[#55605A]">{req.items.length} items</p><p className="text-[11px] text-[#6B756F]">{formatDate(req.submittedAt)}</p></div>
              </button>
            ))}
            {recent.length === 0 && <p className="text-sm text-[#55605A] text-center py-8">No requests yet.</p>}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#E4DDCE] p-5">
          <h3 className="text-sm font-bold text-[#1B2420] mb-3">Quick Actions</h3>
          <div className="space-y-1">
            {quickActions.map(a => (
              <button key={a.label} onClick={() => navigate(a.to)} className="w-full flex items-center gap-3 px-2 py-2.5 rounded-lg hover:bg-gray-50">
                <a.icon className="w-4 h-4 text-[#0F5D3C]" />
                <span className="flex-1 text-left text-[13.5px] font-medium text-[#1B2420]">{a.label}</span>
                <ChevronRight className="w-3.5 h-3.5 text-[#6B756F]" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
