import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ChevronRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { StatusBadge, EmptyState } from '../../components/common/Misc';
import { formatDate } from '../../lib/format';
import type { RequestStatus } from '../../data/appTypes';

const TABS: { label: string; value: RequestStatus | 'ALL' }[] = [
  { label: 'All', value: 'ALL' }, { label: 'Pending', value: 'PENDING' }, { label: 'Selected', value: 'SELECTED' },
  { label: 'Confirmed', value: 'CONFIRMED' }, { label: 'Rejected', value: 'REJECTED' }, { label: 'Cancelled', value: 'CANCELLED' }, { label: 'Completed', value: 'COMPLETED' },
];

export default function AdminRequests() {
  const navigate = useNavigate();
  const { requests } = useApp();
  const [tab, setTab] = useState<RequestStatus | 'ALL'>('ALL');
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All Types');

  const customerTypes = ['All Types', ...Array.from(new Set(requests.map(r => r.customerType)))];
  const countFor = (v: RequestStatus | 'ALL') => v === 'ALL' ? requests.length : requests.filter(r => r.status === v).length;

  const filtered = requests.filter(r =>
    (tab === 'ALL' || r.status === tab) &&
    (typeFilter === 'All Types' || r.customerType === typeFilter) &&
    (!search.trim() || r.id.toLowerCase().includes(search.toLowerCase()) || r.customerName.toLowerCase().includes(search.toLowerCase()) || r.customerMobile.includes(search)),
  );

  return (
    <div className="px-5 lg:px-8 py-6 max-w-7xl mx-auto">
      <h1 className="text-xl lg:text-2xl font-extrabold text-[#1B2420]">Requests</h1>
      <p className="text-sm text-[#55605A] mb-5">{requests.length} total requests</p>

      <div className="bg-white rounded-2xl border border-[#E4DDCE] p-5 mb-5">
        <div className="relative mb-4">
          <Search className="w-4 h-4 text-[#55605A] absolute left-4 top-1/2 -translate-y-1/2" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by Request ID, Customer Name, Mobile…"
            className="w-full h-11 rounded-xl bg-[#FAF7F0] border border-[#E4DDCE] pl-10 pr-3 text-sm outline-none focus:ring-2 focus:ring-[#0F5D3C]/30 focus:border-[#0F5D3C]" />
        </div>
        <div className="flex gap-2 overflow-x-auto no-scrollbar mb-3">
          {TABS.map(t => (
            <button key={t.value} onClick={() => setTab(t.value)}
              className={`flex-shrink-0 px-3.5 h-9 rounded-full text-[13px] font-semibold border transition-colors ${tab === t.value ? 'bg-[#0F5D3C] text-white border-[#0F5D3C]' : 'bg-white text-[#55605A] border-[#E4DDCE]'}`}>
              {t.label} ({countFor(t.value)})
            </button>
          ))}
        </div>
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {customerTypes.map(t => (
            <button key={t} onClick={() => setTypeFilter(t)}
              className={`flex-shrink-0 px-3 h-7 rounded-full text-[11.5px] font-medium border transition-colors ${typeFilter === t ? 'bg-[#1B2420] text-white border-[#1B2420]' : 'bg-white text-[#55605A] border-[#E4DDCE]'}`}>
              {t}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={<Search className="w-6 h-6" />} title="No requests found" description="Try a different filter or search term." />
      ) : (
        <>
          <div className="hidden lg:block bg-white rounded-2xl border border-[#E4DDCE] overflow-hidden">
            <table className="w-full text-sm">
              <thead><tr className="bg-gray-50 text-[#55605A] text-xs uppercase tracking-wide">
                <th className="text-left font-semibold px-5 py-3">Request ID</th><th className="text-left font-semibold px-5 py-3">Customer</th>
                <th className="text-left font-semibold px-5 py-3">Type</th><th className="text-left font-semibold px-5 py-3">Items</th>
                <th className="text-left font-semibold px-5 py-3">Status</th><th className="text-left font-semibold px-5 py-3">Date</th><th className="px-5 py-3" />
              </tr></thead>
              <tbody className="divide-y divide-[#E4DDCE]">
                {filtered.map(req => (
                  <tr key={req.id} onClick={() => navigate(`/admin/requests/${req.id}`)} className="cursor-pointer hover:bg-gray-50">
                    <td className="px-5 py-3.5 font-bold text-[#1B2420]">{req.id}</td>
                    <td className="px-5 py-3.5"><p className="font-medium text-[#1B2420]">{req.customerName}</p><p className="text-xs text-[#55605A]">+91 {req.customerMobile}</p></td>
                    <td className="px-5 py-3.5"><span className="text-[11.5px] font-medium text-[#55605A] bg-gray-100 px-2 py-0.5 rounded-full">{req.customerType}</span></td>
                    <td className="px-5 py-3.5 text-center font-semibold text-[#1B2420]">{req.items.length}</td>
                    <td className="px-5 py-3.5"><StatusBadge status={req.status} size="sm" /></td>
                    <td className="px-5 py-3.5 text-[#55605A]">{formatDate(req.submittedAt)}</td>
                    <td className="px-5 py-3.5 text-right"><ChevronRight className="w-4 h-4 text-[#55605A] inline" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="lg:hidden space-y-3">
            {filtered.map(req => (
              <button key={req.id} onClick={() => navigate(`/admin/requests/${req.id}`)} className="w-full text-left bg-white rounded-2xl border border-[#E4DDCE] p-4 active:scale-[0.98] transition-transform">
                <div className="flex items-start justify-between mb-2"><div><p className="text-[13px] font-bold text-[#1B2420]">{req.id}</p><p className="text-[12px] text-[#55605A]">{formatDate(req.submittedAt)}</p></div><StatusBadge status={req.status} size="sm" /></div>
                <p className="text-[13.5px] font-semibold text-[#1B2420]">{req.customerName}</p>
                <p className="text-[12px] text-[#55605A]">{req.customerMobile} · {req.customerType} · {req.items.length} items</p>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
