import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Package, MapPin, User, MessageSquare, CheckCircle2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { StatusBadge } from '../../components/common/Misc';
import { StatusTimeline } from '../../components/buyer/StatusTimeline';
import { formatCurrency, formatDate, formatDateTime } from '../../lib/format';

export default function RequestDetail() {
  const { requestId } = useParams<{ requestId: string }>();
  const navigate = useNavigate();
  const { requests, cancelRequest, confirmQuotation } = useApp();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const request = requests.find(r => r.id === requestId);
  if (!request) return null;

  const canCancel = ['PENDING', 'SELECTED'].includes(request.status);
  const canConfirm = request.status === 'SELECTED' && !!request.quotation;

  async function handleCancel() {
    if (!confirm('Are you sure you want to cancel this request?')) return;
    setBusy(true); setError('');
    try { await cancelRequest(request!.id); } catch (e: any) { setError(e.message); } finally { setBusy(false); }
  }
  async function handleConfirm() {
    setBusy(true); setError('');
    try { await confirmQuotation(request!.id); } catch (e: any) { setError(e.message); } finally { setBusy(false); }
  }

  return (
    <div className="max-w-3xl mx-auto px-5 md:px-8 py-6 pb-28">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 flex-shrink-0"><ArrowLeft className="w-4.5 h-4.5" /></button>
        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-extrabold text-[#1B2420]">{request.id}</h1>
          <p className="text-xs text-[#55605A]">{formatDateTime(request.submittedAt)}</p>
        </div>
        <StatusBadge status={request.status} />
      </div>

      {error && <p className="text-sm text-[#DC2626] mb-4">{error}</p>}

      <div className="bg-white rounded-2xl border border-[#E4DDCE] p-5 mb-4">
        <h3 className="text-sm font-bold text-[#1B2420] mb-4">Request Timeline</h3>
        <StatusTimeline request={request} />
      </div>

      {request.quotation && (
        <div className="rounded-2xl border border-[#CFE5D8] bg-[#E6F2EA]/40 mb-4 overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-3.5 border-b border-[#CFE5D8]">
            <CheckCircle2 className="w-4.5 h-4.5 text-[#0F5D3C]" />
            <h3 className="text-sm font-bold text-[#0F5D3C]">Quotation Available</h3>
          </div>
          <div className="p-5 bg-white">
            <div className="space-y-3 mb-3">
              {request.quotation.items.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div><p className="text-[13.5px] font-medium text-[#1B2420]">{item.productName}</p><p className="text-[11.5px] text-[#55605A]">{item.quantity} {item.unitType} × ₹{item.unitPrice}</p></div>
                  <span className="text-[14px] font-bold text-[#1B2420]">{formatCurrency(item.total)}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-[#E4DDCE] pt-3 space-y-1.5">
              <div className="flex justify-between text-[13px] text-[#55605A]"><span>Subtotal</span><span>{formatCurrency(request.quotation.subtotal)}</span></div>
              {request.quotation.otherCharges > 0 && <div className="flex justify-between text-[13px] text-[#55605A]"><span>{request.quotation.otherChargesNote || 'Delivery charge'}</span><span>{formatCurrency(request.quotation.otherCharges)}</span></div>}
              <div className="flex justify-between text-[16px] font-extrabold text-[#0F5D3C] pt-1.5 border-t border-[#E4DDCE]"><span>Total Amount</span><span>{formatCurrency(request.quotation.totalAmount)}</span></div>
            </div>
            {request.quotation.adminMessage && (
              <div className="flex gap-2 items-start mt-3 bg-[#E6F2EA] rounded-lg p-3">
                <MessageSquare className="w-4 h-4 text-[#0F5D3C] mt-0.5 flex-shrink-0" />
                <p className="text-[12.5px] text-[#1B2420]">{request.quotation.adminMessage}</p>
              </div>
            )}
          </div>
          <p className="text-[11.5px] text-[#55605A] text-center py-2 bg-[#E6F2EA]/60">Quotation valid for {request.quotation.validityDays} days</p>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-[#E4DDCE] p-5 mb-4">
        <div className="flex items-center gap-2 mb-3"><Package className="w-4 h-4 text-[#0F5D3C]" /><h3 className="text-sm font-bold text-[#1B2420]">Requested Products</h3></div>
        <div className="space-y-3">
          {request.items.map((item, idx) => (
            <div key={idx} className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#E6F2EA] flex items-center justify-center flex-shrink-0"><Package className="w-4 h-4 text-[#0F5D3C]" /></div>
              <div className="flex-1 min-w-0"><p className="text-[13.5px] font-medium text-[#1B2420] line-clamp-1">{item.productName}</p><p className="text-[11.5px] text-[#55605A]">Model: {item.modelNumber}</p></div>
              <span className="text-[13px] font-bold text-[#1B2420] flex-shrink-0">Qty: {item.quantity} {item.unitType}(s)</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-[#E4DDCE] p-5 mb-4">
        <div className="flex items-center gap-2 mb-2"><MapPin className="w-4 h-4 text-[#0F5D3C]" /><h3 className="text-sm font-bold text-[#1B2420]">Delivery Address</h3></div>
        <p className="text-[13.5px] text-[#1B2420] font-semibold">{request.deliveryAddress.building}</p>
        <p className="text-[13.5px] text-[#55605A] leading-relaxed">
          {request.deliveryAddress.street}<br />
          {[request.deliveryAddress.locality, request.deliveryAddress.city].filter(Boolean).join(', ')}<br />
          {request.deliveryAddress.city}, {request.deliveryAddress.state} — {request.deliveryAddress.pinCode}
          {request.deliveryAddress.landmark && <><br />Landmark: {request.deliveryAddress.landmark}</>}
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-[#E4DDCE] p-5 mb-4">
        <div className="flex items-center gap-2 mb-3"><User className="w-4 h-4 text-[#0F5D3C]" /><h3 className="text-sm font-bold text-[#1B2420]">Contact Information</h3></div>
        <div className="space-y-2">
          <Row label="Name" value={request.customerName} />
          <Row label="Mobile" value={`+91 ${request.customerMobile}`} />
          <Row label="Type" value={request.customerType} />
          {request.businessName && <Row label="Business" value={request.businessName} />}
        </div>
      </div>

      {(canCancel || canConfirm) && (
        <div className="fixed bottom-16 md:bottom-0 left-0 right-0 z-30 bg-white border-t border-[#E4DDCE]">
          <div className="max-w-3xl mx-auto px-5 md:px-8 py-3.5 flex gap-3">
            {canCancel && <button onClick={handleCancel} disabled={busy} className="flex-1 h-12 rounded-xl border border-[#E4DDCE] font-bold text-[15px] hover:bg-gray-50 disabled:opacity-60">Cancel Request</button>}
            {canConfirm && <button onClick={handleConfirm} disabled={busy} className="flex-1 h-12 rounded-xl bg-[#0F5D3C] text-white font-bold text-[15px] hover:bg-[#0A4429] disabled:opacity-60">Confirm Request</button>}
          </div>
        </div>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-[13.5px]">
      <span className="text-[#55605A]">{label}</span>
      <span className="font-semibold text-[#1B2420]">{value}</span>
    </div>
  );
}
