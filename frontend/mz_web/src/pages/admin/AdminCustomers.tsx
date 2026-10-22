import React, { useState } from 'react';
import { Search, Users, ChevronRight, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { EmptyState, StatusBadge } from '../../components/common/Misc';
import { formatDate, initials } from '../../lib/format';
import type { Customer } from '../../data/appTypes';

export default function AdminCustomers() {
  const { customers, requests } = useApp();
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Customer | null>(null);

  const filtered = customers.filter(c => !search.trim() || c.fullName.toLowerCase().includes(search.toLowerCase()) || c.mobile.includes(search) || c.id.toLowerCase().includes(search.toLowerCase()));
  const selectedRequests = selected ? requests.filter(r => r.customerId === selected.id) : [];

  return (
    <div className="px-5 lg:px-8 py-6 max-w-6xl mx-auto">
      <h1 className="text-xl lg:text-2xl font-extrabold text-[#1B2420]">Customers</h1>
      <p className="text-sm text-[#55605A] mb-5">{customers.length} registered buyers</p>

      <div className="relative max-w-sm mb-5">
        <Search className="w-4 h-4 text-[#55605A] absolute left-4 top-1/2 -translate-y-1/2" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, mobile, ID…" className="w-full h-11 rounded-xl bg-white border border-[#E4DDCE] pl-10 pr-3 text-sm outline-none focus:ring-2 focus:ring-[#0F5D3C]/30 focus:border-[#0F5D3C]" />
      </div>

      {filtered.length === 0 ? <EmptyState icon={<Users className="w-6 h-6" />} title="No customers found" /> : (
        <div className="bg-white rounded-2xl border border-[#E4DDCE] divide-y divide-[#E4DDCE] overflow-hidden">
          {filtered.map(c => (
            <button key={c.id} onClick={() => setSelected(c)} className="w-full flex items-center gap-3 px-5 py-3.5 text-left hover:bg-gray-50">
              <div className="w-10 h-10 rounded-full bg-[#0F5D3C] text-white flex items-center justify-center text-xs font-bold flex-shrink-0">{initials(c.fullName)}</div>
              <div className="flex-1 min-w-0"><p className="text-[14px] font-semibold text-[#1B2420] truncate">{c.fullName}</p><p className="text-[12px] text-[#55605A]">+91 {c.mobile} · {c.customerType} · {c.id}</p></div>
              <ChevronRight className="w-4 h-4 text-[#55605A] flex-shrink-0" />
            </button>
          ))}
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 z-[90] flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSelected(null)} />
          <div className="relative bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-lg max-h-[85vh] overflow-y-auto">
            <div className="sticky top-0 bg-white flex items-center justify-between px-5 h-14 border-b border-[#E4DDCE]"><h3 className="font-bold text-[#1B2420]">Customer Details</h3><button onClick={() => setSelected(null)} className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100"><X className="w-5 h-5" /></button></div>
            <div className="p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-14 h-14 rounded-full bg-[#0F5D3C] text-white flex items-center justify-center font-bold text-lg flex-shrink-0">{initials(selected.fullName)}</div>
                <div><p className="font-bold text-[#1B2420] text-[16px]">{selected.fullName}</p><p className="text-[13px] text-[#55605A]">+91 {selected.mobile} · {selected.customerType}</p><p className="text-[12px] text-[#0F5D3C] font-semibold">{selected.id}</p></div>
              </div>
              {selected.businessName && <p className="text-[13px] text-[#55605A] mb-3">Business: {selected.businessName}</p>}

              <h4 className="text-xs font-bold text-[#55605A] uppercase tracking-wide mb-2 mt-4">Saved Addresses</h4>
              {selected.addresses.length === 0 ? <p className="text-[13px] text-[#55605A]">No saved addresses</p> : (
                <div className="space-y-2 mb-4">{selected.addresses.map(a => <div key={a.id} className="bg-gray-50 rounded-lg p-3 text-[12.5px] text-[#55605A]"><span className="font-semibold text-[#1B2420]">{a.label}:</span> {[a.building, a.street, a.locality, a.city, a.state, a.pinCode].filter(Boolean).join(', ')}</div>)}</div>
              )}

              <h4 className="text-xs font-bold text-[#55605A] uppercase tracking-wide mb-2 mt-4">Request History</h4>
              {selectedRequests.length === 0 ? <p className="text-[13px] text-[#55605A]">No requests yet</p> : (
                <div className="space-y-2">{selectedRequests.map(r => (
                  <div key={r.id} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                    <div><p className="text-[12.5px] font-bold text-[#0F5D3C]">{r.id}</p><p className="text-[11px] text-[#55605A]">{formatDate(r.submittedAt)} · {r.items.length} items</p></div>
                    <StatusBadge status={r.status} size="sm" />
                  </div>
                ))}</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
