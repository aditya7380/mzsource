import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Package, MapPin, User, Lock, MessageSquare } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { StatusBadge } from '../../components/common/Misc';
import { StatusTimeline } from '../../components/buyer/StatusTimeline';
import { formatCurrency, formatDate } from '../../lib/format';
import type { RequestStatus } from '../../data/appTypes';

interface QuoteLine { productId: string; productName: string; quantity: number; unitType: string; unitPrice: number }

const NEXT_STATUS: Record<RequestStatus, RequestStatus[]> = {
  PENDING: ['REJECTED', 'CANCELLED'],
  SELECTED: ['CONFIRMED', 'REJECTED', 'CANCELLED'],
  CONFIRMED: ['COMPLETED', 'CANCELLED'],
  REJECTED: [], CANCELLED: [], COMPLETED: [],
};

export default function AdminRequestDetail() {
  const { requestId } = useParams<{ requestId: string }>();
  const navigate = useNavigate();
  const { requests, updateRequestStatus, createQuotation, addPrivateNote } = useApp();
  const request = requests.find(r => r.id === requestId);

  const [showQuoteForm, setShowQuoteForm] = useState(false);
  const [lines, setLines] = useState<QuoteLine[]>(() => request?.items.map(i => ({ productId: i.productId, productName: i.productName, quantity: i.quantity, unitType: i.unitType, unitPrice: 0 })) || []);
  const [otherCharges, setOtherCharges] = useState('0');
  const [otherChargesNote, setOtherChargesNote] = useState('Delivery charge');
  const [validityDays, setValidityDays] = useState('7');
  const [adminMessage, setAdminMessage] = useState('');
  const [supplierName, setSupplierName] = useState('');
  const [supplierContact, setSupplierContact] = useState('');
  const [supplierCost, setSupplierCost] = useState('0');
  const [transportCost, setTransportCost] = useState('0');
  const [packagingCost, setPackagingCost] = useState('0');
  const [margin, setMargin] = useState('0');
  const [privateNoteText, setPrivateNoteText] = useState('');
  const [noteInput, setNoteInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  if (!request) return null;

  function updateLine(idx: number, price: number) { setLines(ls => ls.map((l, i) => i === idx ? { ...l, unitPrice: price } : l)); }
  const subtotal = lines.reduce((s, l) => s + l.quantity * l.unitPrice, 0);
  const total = subtotal + (parseFloat(otherCharges) || 0);

  async function handleStatusChange(status: RequestStatus) {
    setBusy(true); setError('');
    try { await updateRequestStatus(request!.id, status); } catch (e: any) { setError(e.message); } finally { setBusy(false); }
  }

  async function submitQuotation() {
    setBusy(true); setError('');
    try {
      await createQuotation(request!.id, {
        items: lines.map(l => ({ productId: l.productId, productName: l.productName, quantity: l.quantity, unitType: l.unitType, unitPrice: l.unitPrice })),
        otherCharges: parseFloat(otherCharges) || 0, otherChargesNote, validityDays: parseInt(validityDays) || 7, adminMessage,
        supplierName: supplierName || undefined, supplierContact: supplierContact || undefined,
        supplierCost: parseFloat(supplierCost) || undefined, transportCost: parseFloat(transportCost) || undefined,
        packagingCost: parseFloat(packagingCost) || undefined, margin: parseFloat(margin) || undefined,
        privateNote: privateNoteText || undefined,
      });
      setShowQuoteForm(false);
    } catch (e: any) { setError(e.message); } finally { setBusy(false); }
  }

  async function submitNote() {
    if (!noteInput.trim()) return;
    setBusy(true);
    try { await addPrivateNote(request!.id, noteInput.trim()); setNoteInput(''); } finally { setBusy(false); }
  }

  const nextStatuses = NEXT_STATUS[request.status];

  return (
    <div className="px-5 lg:px-8 py-6 max-w-6xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('/admin/requests')} className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 flex-shrink-0"><ArrowLeft className="w-4.5 h-4.5" /></button>
        <div className="flex-1 min-w-0"><h1 className="text-lg lg:text-xl font-extrabold text-[#1B2420]">{request.id}</h1><p className="text-xs text-[#55605A]">Submitted {formatDate(request.submittedAt)}</p></div>
        <StatusBadge status={request.status} />
      </div>

      {error && <p className="text-sm text-[#DC2626] mb-4">{error}</p>}

      <div className="grid lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl border border-[#E4DDCE] p-5">
            <div className="flex items-center gap-2 mb-3"><User className="w-4 h-4 text-[#0F5D3C]" /><h3 className="text-sm font-bold text-[#1B2420]">Customer</h3></div>
            <p className="text-[14px] font-semibold text-[#1B2420]">{request.customerName}</p>
            <p className="text-[13px] text-[#55605A]">+91 {request.customerMobile} · {request.customerType}</p>
            {request.businessName && <p className="text-[13px] text-[#55605A]">{request.businessName}</p>}
            <p className="text-[12px] text-[#0F5D3C] font-semibold mt-1">{request.customerId}</p>
          </div>

          <div className="bg-white rounded-2xl border border-[#E4DDCE] p-5">
            <div className="flex items-center gap-2 mb-2"><MapPin className="w-4 h-4 text-[#0F5D3C]" /><h3 className="text-sm font-bold text-[#1B2420]">Delivery Address</h3></div>
            <p className="text-[13.5px] text-[#55605A] leading-relaxed">
              {[request.deliveryAddress.building, request.deliveryAddress.street, request.deliveryAddress.locality, request.deliveryAddress.sector, request.deliveryAddress.city, request.deliveryAddress.district, request.deliveryAddress.state, request.deliveryAddress.pinCode].filter(Boolean).join(', ')}
              {request.deliveryAddress.landmark && <><br />Landmark: {request.deliveryAddress.landmark}</>}
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-[#E4DDCE] p-5">
            <div className="flex items-center gap-2 mb-3"><Package className="w-4 h-4 text-[#0F5D3C]" /><h3 className="text-sm font-bold text-[#1B2420]">Requested Products</h3></div>
            <div className="space-y-2.5">
              {request.items.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between gap-3 py-1.5 border-b border-[#E4DDCE] last:border-0">
                  <div className="min-w-0"><p className="text-[13.5px] font-medium text-[#1B2420]">{item.productName}</p><p className="text-[11px] text-[#55605A]">{item.modelNumber}</p></div>
                  <span className="text-[13px] font-bold text-[#1B2420] flex-shrink-0">{item.quantity} {item.unitType}</span>
                </div>
              ))}
            </div>
          </div>

          {request.quotation && !showQuoteForm ? (
            <div className="bg-white rounded-2xl border border-[#CFE5D8] p-5">
              <div className="flex items-center justify-between mb-3"><h3 className="text-sm font-bold text-[#1B2420]">Quotation</h3><button onClick={() => setShowQuoteForm(true)} className="text-xs font-semibold text-[#0F5D3C]">Edit / Re-quote</button></div>
              <div className="space-y-2 mb-3">
                {request.quotation.items.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-[13px]"><span className="text-[#55605A]">{item.productName} × {item.quantity} @ {formatCurrency(item.unitPrice)}</span><span className="font-medium text-[#1B2420]">{formatCurrency(item.total)}</span></div>
                ))}
              </div>
              <div className="border-t border-[#E4DDCE] pt-2 space-y-1">
                <div className="flex justify-between text-[13px] text-[#55605A]"><span>Subtotal</span><span>{formatCurrency(request.quotation.subtotal)}</span></div>
                <div className="flex justify-between text-[13px] text-[#55605A]"><span>{request.quotation.otherChargesNote}</span><span>{formatCurrency(request.quotation.otherCharges)}</span></div>
                <div className="flex justify-between text-[15px] font-bold text-[#1B2420] pt-1 border-t border-[#E4DDCE]"><span>Total</span><span>{formatCurrency(request.quotation.totalAmount)}</span></div>
              </div>
            </div>
          ) : (request.status === 'PENDING' || showQuoteForm) && (
            <div className="bg-white rounded-2xl border border-[#E4DDCE] p-5">
              <h3 className="text-sm font-bold text-[#1B2420] mb-4">{request.quotation ? 'Update Quotation' : 'Create Quotation'}</h3>
              <div className="space-y-3 mb-4">
                {lines.map((line, idx) => (
                  <div key={idx} className="grid grid-cols-12 gap-2 items-end">
                    <div className="col-span-7"><p className="text-[11px] text-[#55605A] mb-1">{line.productName}</p><p className="text-[12px] font-medium text-[#1B2420]">{line.quantity} {line.unitType}</p></div>
                    <div className="col-span-5">
                      <input type="number" min={0} placeholder="Unit price (₹)" value={line.unitPrice || ''} onChange={e => updateLine(idx, parseFloat(e.target.value) || 0)}
                        className="w-full h-11 rounded-lg border border-[#E4DDCE] px-3 text-sm outline-none focus:ring-2 focus:ring-[#0F5D3C]/30 focus:border-[#0F5D3C]" />
                    </div>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <LabeledInput label="Other Charges (₹)" type="number" value={otherCharges} onChange={setOtherCharges} />
                <LabeledInput label="Validity (days)" type="number" value={validityDays} onChange={setValidityDays} />
              </div>
              <LabeledInput label="Charges Note" value={otherChargesNote} onChange={setOtherChargesNote} />
              <div className="mt-3">
                <label className="text-sm font-medium text-[#1B2420] mb-1.5 block">Message to Customer</label>
                <textarea rows={2} value={adminMessage} onChange={e => setAdminMessage(e.target.value)} className="w-full rounded-xl border border-[#E4DDCE] px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#0F5D3C]/30 focus:border-[#0F5D3C] resize-none" />
              </div>

              <div className="flex justify-between items-center mt-4 mb-1 px-1"><span className="text-sm font-semibold text-[#55605A]">Total (to customer)</span><span className="text-lg font-extrabold text-[#0F5D3C]">{formatCurrency(total)}</span></div>

              <div className="mt-5 pt-4 border-t border-dashed border-[#E4DDCE]">
                <div className="flex items-center gap-2 mb-3"><Lock className="w-3.5 h-3.5 text-[#55605A]" /><h4 className="text-xs font-bold text-[#55605A] uppercase tracking-wide">Private Sourcing Info (never shown to buyer)</h4></div>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <LabeledInput label="Supplier Name" value={supplierName} onChange={setSupplierName} />
                  <LabeledInput label="Supplier Contact" value={supplierContact} onChange={setSupplierContact} />
                </div>
                <div className="grid grid-cols-3 gap-3 mb-3">
                  <LabeledInput label="Supplier Cost (₹)" type="number" value={supplierCost} onChange={setSupplierCost} />
                  <LabeledInput label="Transport (₹)" type="number" value={transportCost} onChange={setTransportCost} />
                  <LabeledInput label="Packaging (₹)" type="number" value={packagingCost} onChange={setPackagingCost} />
                </div>
                <LabeledInput label="Margin (₹)" type="number" value={margin} onChange={setMargin} />
                <div className="mt-3">
                  <label className="text-sm font-medium text-[#1B2420] mb-1.5 block">Private Note</label>
                  <textarea rows={2} value={privateNoteText} onChange={e => setPrivateNoteText(e.target.value)} placeholder="Internal note about this request…" className="w-full rounded-xl border border-[#E4DDCE] px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#0F5D3C]/30 focus:border-[#0F5D3C] resize-none" />
                </div>
              </div>

              <div className="flex gap-3 mt-5">
                {showQuoteForm && <button onClick={() => setShowQuoteForm(false)} className="flex-1 h-11 rounded-xl border border-[#E4DDCE] font-semibold text-sm hover:bg-gray-50">Cancel</button>}
                <button onClick={submitQuotation} disabled={busy} className="flex-1 h-11 rounded-xl bg-[#0F5D3C] text-white font-bold text-sm hover:bg-[#0A4429] disabled:opacity-60">{busy ? 'Sending…' : 'Send Quotation'}</button>
              </div>
            </div>
          )}

          {request.privateNotes.length > 0 && (
            <div className="bg-white rounded-2xl border border-[#E4DDCE] p-5">
              <div className="flex items-center gap-2 mb-3"><MessageSquare className="w-4 h-4 text-[#55605A]" /><h3 className="text-sm font-bold text-[#1B2420]">Internal Notes</h3></div>
              <div className="space-y-2.5">
                {request.privateNotes.map(n => (
                  <div key={n.id} className="bg-gray-50 rounded-lg p-3"><p className="text-[13px] text-[#1B2420]">{n.text}</p><p className="text-[10.5px] text-[#55605A] mt-1">{formatDate(n.createdAt)}</p></div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-white rounded-2xl border border-[#E4DDCE] p-5">
            <h3 className="text-sm font-bold text-[#1B2420] mb-3">Add Internal Note</h3>
            <div className="flex gap-2">
              <input value={noteInput} onChange={e => setNoteInput(e.target.value)} placeholder="Type a note for the team…"
                className="flex-1 h-11 rounded-xl border border-[#E4DDCE] px-3.5 text-sm outline-none focus:ring-2 focus:ring-[#0F5D3C]/30 focus:border-[#0F5D3C]" />
              <button onClick={submitNote} disabled={busy} className="h-11 px-5 rounded-xl bg-[#E6F2EA] text-[#0F5D3C] font-semibold text-sm hover:bg-[#CFE5D8] disabled:opacity-60">Add</button>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {nextStatuses.length > 0 && (
            <div className="bg-white rounded-2xl border border-[#E4DDCE] p-5">
              <h3 className="text-sm font-bold text-[#1B2420] mb-3">Update Status</h3>
              <div className="flex flex-col gap-2">
                {nextStatuses.map(s => (
                  <button key={s} onClick={() => handleStatusChange(s)} disabled={busy}
                    className={`h-11 rounded-xl font-bold text-sm transition-colors disabled:opacity-60 ${
                      s === 'REJECTED' || s === 'CANCELLED' ? 'border border-[#FEE2E2] text-[#DC2626] hover:bg-[#FEE2E2]/40' : 'bg-[#0F5D3C] text-white hover:bg-[#0A4429]'
                    }`}>
                    Mark as {s.charAt(0) + s.slice(1).toLowerCase()}
                  </button>
                ))}
              </div>
              {request.status === 'PENDING' && <p className="text-[11px] text-[#55605A] mt-2">Sending a quotation moves this request to "Selected" automatically.</p>}
            </div>
          )}

          <div className="bg-white rounded-2xl border border-[#E4DDCE] p-5">
            <h3 className="text-sm font-bold text-[#1B2420] mb-4">Status Timeline</h3>
            <StatusTimeline request={request} />
          </div>
        </div>
      </div>
    </div>
  );
}

function LabeledInput({ label, value, onChange, type = 'text' }: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <div>
      <label className="text-sm font-medium text-[#1B2420] mb-1.5 block">{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} className="w-full h-11 rounded-xl border border-[#E4DDCE] px-3.5 text-sm outline-none focus:ring-2 focus:ring-[#0F5D3C]/30 focus:border-[#0F5D3C]" />
    </div>
  );
}
