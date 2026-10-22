import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Search, ChevronRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { EmptyState, StatusBadge } from '../../components/common/Misc';
import { formatCurrency, formatDate } from '../../lib/format';

export default function AdminQuotations() {
  const navigate = useNavigate();
  const { requests } = useApp();
  const [search, setSearch] = useState('');

  const quoted = requests
    .filter(r => !!r.quotation)
    .filter(r => !search.trim() || r.id.toLowerCase().includes(search.toLowerCase()) || r.customerName.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => new Date(b.quotation!.createdAt).getTime() - new Date(a.quotation!.createdAt).getTime());

  const totalValue = quoted.reduce((s, r) => s + (r.quotation?.totalAmount || 0), 0);

  return (
    <div className="px-5 lg:px-8 py-6 max-w-6xl mx-auto">
      <h1 className="text-xl lg:text-2xl font-extrabold text-[#1B2420]">Quotations</h1>
      <p className="text-sm text-[#55605A] mb-5">{quoted.length} quotations · Total value {formatCurrency(totalValue)}</p>

      <div className="relative max-w-sm mb-5">
        <Search className="w-4 h-4 text-[#55605A] absolute left-4 top-1/2 -translate-y-1/2" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by Request ID or customer…" className="w-full h-11 rounded-xl bg-white border border-[#E4DDCE] pl-10 pr-3 text-sm outline-none focus:ring-2 focus:ring-[#0F5D3C]/30 focus:border-[#0F5D3C]" />
      </div>

      {quoted.length === 0 ? <EmptyState icon={<FileText className="w-6 h-6" />} title="No quotations yet" description="Quotations you send to buyers will appear here." /> : (
        <div className="bg-white rounded-2xl border border-[#E4DDCE] divide-y divide-[#E4DDCE] overflow-hidden">
          {quoted.map(r => (
            <button key={r.id} onClick={() => navigate(`/admin/requests/${r.id}`)} className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-gray-50">
              <div className="w-10 h-10 rounded-lg bg-[#E6F2EA] flex items-center justify-center flex-shrink-0"><FileText className="w-4.5 h-4.5 text-[#0F5D3C]" /></div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2"><p className="text-[13.5px] font-bold text-[#1B2420]">{r.id}</p><StatusBadge status={r.status} size="sm" /></div>
                <p className="text-[12px] text-[#55605A] truncate">{r.customerName} · Sent {formatDate(r.quotation!.createdAt)} · Valid {r.quotation!.validityDays} days</p>
              </div>
              <div className="text-right flex-shrink-0"><p className="text-[14px] font-bold text-[#16A34A]">{formatCurrency(r.quotation!.totalAmount)}</p></div>
              <ChevronRight className="w-4 h-4 text-[#55605A] flex-shrink-0" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
