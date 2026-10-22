import React from 'react';
import { Loader2 } from 'lucide-react';
import type { RequestStatus } from '../../data/appTypes';
import { getStatusColor, getStatusBg } from '../../data/appTypes';

export function StatusBadge({ status, size = 'md' }: { status: RequestStatus; size?: 'sm' | 'md' }) {
  return (
    <span
      className={`inline-flex items-center font-bold rounded-full uppercase tracking-wide ${size === 'sm' ? 'text-[10px] px-2 py-0.5' : 'text-[11px] px-2.5 py-1'}`}
      style={{ color: getStatusColor(status), backgroundColor: getStatusBg(status) }}
    >
      {status}
    </span>
  );
}

export function LoadingScreen({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3 text-[#55605A]">
      <Loader2 className="w-7 h-7 animate-spin text-[#0F5D3C]" />
      <p className="text-sm">{label}</p>
    </div>
  );
}

export function EmptyState({ icon, title, description, action }: { icon?: React.ReactNode; title: string; description?: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6">
      <div className="w-14 h-14 rounded-full bg-[#E6F2EA] text-[#0F5D3C] flex items-center justify-center mb-4">{icon}</div>
      <h3 className="text-base font-semibold text-[#1B2420] mb-1">{title}</h3>
      {description && <p className="text-sm text-[#55605A] max-w-sm mb-4">{description}</p>}
      {action}
    </div>
  );
}
