import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipboardList, ChevronRight, Package } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { StatusBadge, EmptyState } from '../../components/common/Misc';
import { formatDate } from '../../lib/format';
import type { RequestStatus } from '../../data/appTypes';

const TABS: { label: string; value: RequestStatus | 'ALL' }[] = [
  { label: 'All', value: 'ALL' },
  { label: 'Pending', value: 'PENDING' },
  { label: 'Selected', value: 'SELECTED' },
  { label: 'Confirmed', value: 'CONFIRMED' },
  { label: 'Rejected', value: 'REJECTED' },
  { label: 'Cancelled', value: 'CANCELLED' },
  { label: 'Completed', value: 'COMPLETED' },
];

export default function MyRequests() {
  const navigate = useNavigate();
  const { requests } = useApp();
  const [tab, setTab] = useState<RequestStatus | 'ALL'>('ALL');

  const filtered = tab === 'ALL' ? requests : requests.filter(r => r.status === tab);
  const countFor = (v: RequestStatus | 'ALL') => v === 'ALL' ? requests.length : requests.filter(r => r.status === v).length;

  return (
    <div className="max-w-4xl mx-auto px-5 md:px-8 py-6">
      <h1 className="text-xl md:text-2xl font-extrabold text-[#1B2420]">My Requests</h1>
      <p className="text-sm text-[#55605A] mb-5">{requests.length} request{requests.length === 1 ? '' : 's'} total</p>

      <div className="flex gap-2 overflow-x-auto no-scrollbar mb-5 pb-1">
        {TABS.map(t => {
          const count = countFor(t.value);
          return (
            <button key={t.value} onClick={() => setTab(t.value)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-3.5 h-9 rounded-full text-[13px] font-semibold border transition-colors ${
                tab === t.value ? 'bg-[#0F5D3C] text-white border-[#0F5D3C]' : 'bg-white text-[#55605A] border-[#E4DDCE]'
              }`}>
              {t.label}
              {count > 0 && (
                <span className={`min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold flex items-center justify-center ${tab === t.value ? 'bg-white/25 text-white' : 'bg-[#E6F2EA] text-[#0F5D3C]'}`}>{count}</span>
              )}
            </button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={<ClipboardList className="w-6 h-6" />} title="No requests yet" description="Browse products and submit your first request." />
      ) : (
        <div className="space-y-3">
          {filtered.map(req => {
            const totalUnits = req.items.reduce((s, i) => s + i.quantity, 0);
            return (
              <button key={req.id} onClick={() => navigate(`/buyer-app/requests/${req.id}`)} className="w-full text-left bg-white rounded-2xl border border-[#E4DDCE] p-4 hover:shadow-sm active:scale-[0.99] transition-all">
                <div className="flex items-start justify-between mb-2">
                  <div><p className="text-[13px] font-bold text-[#1B2420]">{req.id}</p><p className="text-[11px] text-[#55605A]">{formatDate(req.submittedAt)}</p></div>
                  <StatusBadge status={req.status} size="sm" />
                </div>
                <div className="flex items-center gap-2 text-[13px] text-[#55605A] mb-2">
                  <Package className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="line-clamp-1">{req.items.map(i => i.productName).join(', ')}</span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-[#E4DDCE]">
                  <span className="text-[12px] text-[#55605A]">{req.items.length} product{req.items.length !== 1 ? 's' : ''} · {totalUnits} unit{totalUnits !== 1 ? 's' : ''}</span>
                  <div className="flex items-center gap-2">
                    {req.quotation && <span className="text-[13px] font-bold text-[#16A34A]">₹{req.quotation.totalAmount.toLocaleString('en-IN')}</span>}
                    <ChevronRight className="w-4 h-4 text-[#55605A]" />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
