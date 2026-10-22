import React from 'react';
import { Check, X, Clock } from 'lucide-react';
import type { Request } from '../../data/appTypes';
import { formatDateTime } from '../../lib/format';

const STEPS: { label: string; statuses: string[] }[] = [
  { label: 'Request Submitted', statuses: ['PENDING'] },
  { label: 'Under Review / Selected', statuses: ['SELECTED'] },
  { label: 'Quotation & Confirmed', statuses: ['CONFIRMED'] },
  { label: 'Completed', statuses: ['COMPLETED'] },
];

export function StatusTimeline({ request }: { request: Request }) {
  if (request.status === 'REJECTED' || request.status === 'CANCELLED') {
    const entry = request.statusHistory.find(h => h.status === request.status);
    const submitted = request.statusHistory.find(h => h.status === 'PENDING');
    return (
      <div className="space-y-5">
        <TimelineRow label="Request Submitted" done timestamp={submitted?.timestamp} />
        <TimelineRow label={request.status === 'REJECTED' ? 'Rejected' : 'Cancelled'} negative timestamp={entry?.timestamp} note={entry?.note} last />
      </div>
    );
  }

  const historyMap = new Map(request.statusHistory.map(h => [h.status, h]));
  return (
    <div className="space-y-5">
      {STEPS.map((step, idx) => {
        const entry = step.statuses.map(s => historyMap.get(s as any)).find(Boolean);
        const done = !!entry;
        return <TimelineRow key={step.label} label={step.label} done={done} timestamp={entry?.timestamp} last={idx === STEPS.length - 1} />;
      })}
    </div>
  );
}

function TimelineRow({ label, done, negative, timestamp, note, last }: { label: string; done?: boolean; negative?: boolean; timestamp?: string; note?: string; last?: boolean }) {
  return (
    <div className="flex gap-3 relative">
      <div className="flex flex-col items-center">
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 z-10"
          style={{ backgroundColor: negative ? '#FEE2E2' : done ? '#0F5D3C' : '#F3F4F6' }}
        >
          {negative ? <X className="w-4 h-4 text-[#DC2626]" /> : done ? <Check className="w-4 h-4 text-white" /> : <Clock className="w-3.5 h-3.5 text-[#6B756F]" />}
        </div>
        {!last && <div className={`w-0.5 flex-1 min-h-[24px] mt-1 ${done && !negative ? 'bg-[#0F5D3C]/30' : 'bg-[#E4DDCE]'}`} />}
      </div>
      <div className="pb-1">
        <p className={`text-sm font-bold ${negative ? 'text-[#DC2626]' : done ? 'text-[#1B2420]' : 'text-[#6B756F]'}`}>{label}</p>
        {timestamp ? <p className="text-xs text-[#55605A] mt-0.5">{formatDateTime(timestamp)}</p> : <p className="text-xs text-[#6B756F]/70 mt-0.5">Pending</p>}
        {note && <p className="text-xs text-[#55605A] mt-1">{note}</p>}
      </div>
    </div>
  );
}
