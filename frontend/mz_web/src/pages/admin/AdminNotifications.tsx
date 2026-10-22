import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, CheckCheck, Info, CheckCircle2, AlertTriangle, XCircle, PackageSearch } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { EmptyState } from '../../components/common/Misc';
import { timeAgo, formatDate } from '../../lib/format';

const ICONS: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  info: { icon: Info, color: '#2F80ED', bg: '#CFE5D8' }, success: { icon: CheckCircle2, color: '#16A34A', bg: '#DCFCE7' },
  warning: { icon: AlertTriangle, color: '#F59E0B', bg: '#FEF3C7' }, error: { icon: XCircle, color: '#DC2626', bg: '#FEE2E2' },
};

export default function AdminNotifications() {
  const navigate = useNavigate();
  const { notifications, customProductRequests, markAdminNotificationRead, markAllAdminNotificationsRead, updateCustomRequestStatus } = useApp();
  const [tab, setTab] = useState<'notifications' | 'custom'>('notifications');
  const hasUnread = notifications.some(n => !n.read);
  const newCustomCount = customProductRequests.filter(c => c.status === 'new').length;

  async function handleClick(n: typeof notifications[number]) {
    if (!n.read) await markAdminNotificationRead(n.id);
    if (n.requestId) navigate(`/admin/requests/${n.requestId}`);
  }

  return (
    <div className="px-5 lg:px-8 py-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-5">
        <div><h1 className="text-xl lg:text-2xl font-extrabold text-[#1B2420]">Notifications</h1><p className="text-sm text-[#55605A]">Updates and custom product requests</p></div>
        {tab === 'notifications' && hasUnread && <button onClick={() => markAllAdminNotificationsRead()} className="flex items-center gap-1 text-xs font-semibold text-[#0F5D3C]"><CheckCheck className="w-3.5 h-3.5" /> Mark all read</button>}
      </div>

      <div className="flex gap-2 mb-5">
        <button onClick={() => setTab('notifications')} className={`px-4 h-9 rounded-full text-[13px] font-semibold border ${tab === 'notifications' ? 'bg-[#0F5D3C] text-white border-[#0F5D3C]' : 'bg-white text-[#55605A] border-[#E4DDCE]'}`}>Notifications</button>
        <button onClick={() => setTab('custom')} className={`px-4 h-9 rounded-full text-[13px] font-semibold border ${tab === 'custom' ? 'bg-[#0F5D3C] text-white border-[#0F5D3C]' : 'bg-white text-[#55605A] border-[#E4DDCE]'}`}>Custom Product Requests {newCustomCount > 0 && `(${newCustomCount})`}</button>
      </div>

      {tab === 'notifications' ? (
        notifications.length === 0 ? <EmptyState icon={<Bell className="w-6 h-6" />} title="No notifications yet" /> : (
          <div className="bg-white rounded-2xl border border-[#E4DDCE] divide-y divide-[#E4DDCE] overflow-hidden">
            {notifications.map(n => {
              const meta = ICONS[n.type] || ICONS.info; const Icon = meta.icon;
              return (
                <button key={n.id} onClick={() => handleClick(n)} className={`w-full text-left flex gap-3 px-5 py-4 hover:bg-gray-50 ${!n.read ? 'bg-[#E6F2EA]/40' : ''}`}>
                  <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: meta.bg }}><Icon className="w-4.5 h-4.5" style={{ color: meta.color }} /></div>
                  <div className="flex-1 min-w-0"><div className="flex items-center gap-2"><p className="text-[13.5px] font-bold text-[#1B2420] flex-1">{n.title}</p>{!n.read && <span className="w-2 h-2 rounded-full bg-[#0F5D3C] flex-shrink-0" />}</div><p className="text-[13px] text-[#55605A] mt-0.5">{n.message}</p><p className="text-[11px] text-[#55605A]/70 mt-1">{timeAgo(n.createdAt)}</p></div>
                </button>
              );
            })}
          </div>
        )
      ) : (
        customProductRequests.length === 0 ? <EmptyState icon={<PackageSearch className="w-6 h-6" />} title="No custom product requests" /> : (
          <div className="space-y-3">
            {customProductRequests.map(c => (
              <div key={c.id} className="bg-white rounded-2xl border border-[#E4DDCE] p-4 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[14px] font-bold text-[#1B2420]">{c.productName}</p>
                  <p className="text-[12.5px] text-[#55605A] mt-0.5">By {c.customerName} · {formatDate(c.submittedAt)}</p>
                  {c.requiredQuantity && <p className="text-[12.5px] text-[#55605A]">Quantity: {c.requiredQuantity}</p>}
                  {c.description && <p className="text-[12.5px] text-[#55605A] mt-1">{c.description}</p>}
                </div>
                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                  <span className={`text-[10.5px] font-semibold px-2 py-1 rounded-full ${c.status === 'new' ? 'bg-[#FEF3C7] text-[#F59E0B]' : 'bg-[#DCFCE7] text-[#16A34A]'}`}>{c.status === 'new' ? 'New' : 'Reviewed'}</span>
                  {c.status === 'new' && <button onClick={() => updateCustomRequestStatus(c.id, 'reviewed')} className="text-[11px] font-semibold text-[#0F5D3C]">Mark Reviewed</button>}
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}
