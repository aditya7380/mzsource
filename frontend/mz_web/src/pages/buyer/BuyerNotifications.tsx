import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, CheckCheck, Info, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { EmptyState } from '../../components/common/Misc';
import { timeAgo } from '../../lib/format';

const ICONS: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  info: { icon: Info, color: '#2F80ED', bg: '#CFE5D8' },
  success: { icon: CheckCircle2, color: '#16A34A', bg: '#DCFCE7' },
  warning: { icon: AlertTriangle, color: '#F59E0B', bg: '#FEF3C7' },
  error: { icon: XCircle, color: '#DC2626', bg: '#FEE2E2' },
};

export default function BuyerNotifications() {
  const navigate = useNavigate();
  const { notifications, markNotificationRead, markAllNotificationsRead } = useApp();
  const hasUnread = notifications.some(n => !n.read);

  async function handleClick(n: typeof notifications[number]) {
    if (!n.read) await markNotificationRead(n.id);
    if (n.requestId) navigate(`/buyer-app/requests/${n.requestId}`);
  }

  return (
    <div className="max-w-3xl mx-auto px-5 md:px-8 py-6">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl md:text-2xl font-extrabold text-[#1B2420]">Notifications</h1>
        {hasUnread && <button onClick={() => markAllNotificationsRead()} className="flex items-center gap-1 text-xs font-semibold text-[#0F5D3C]"><CheckCheck className="w-3.5 h-3.5" /> Mark all read</button>}
      </div>

      {notifications.length === 0 ? (
        <EmptyState icon={<Bell className="w-6 h-6" />} title="No notifications yet" description="We'll let you know when there's an update on your requests." />
      ) : (
        <div className="bg-white rounded-2xl border border-[#E4DDCE] divide-y divide-[#E4DDCE] overflow-hidden">
          {notifications.map(n => {
            const meta = ICONS[n.type] || ICONS.info;
            const Icon = meta.icon;
            return (
              <button key={n.id} onClick={() => handleClick(n)} className={`w-full text-left flex gap-3 px-5 py-4 hover:bg-gray-50 transition-colors ${!n.read ? 'bg-[#E6F2EA]/40' : ''}`}>
                <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: meta.bg }}><Icon className="w-4.5 h-4.5" style={{ color: meta.color }} /></div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2"><p className="text-[13.5px] font-bold text-[#1B2420] flex-1">{n.title}</p>{!n.read && <span className="w-2 h-2 rounded-full bg-[#0F5D3C] flex-shrink-0" />}</div>
                  <p className="text-[13px] text-[#55605A] mt-0.5 leading-snug">{n.message}</p>
                  <p className="text-[11px] text-[#55605A]/70 mt-1">{timeAgo(n.createdAt)}</p>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
