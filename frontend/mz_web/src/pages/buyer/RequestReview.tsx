import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, MapPin, User, Edit2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useCheckout } from '../../context/CheckoutContext';

export default function RequestReview() {
  const navigate = useNavigate();
  const { cart, getProduct, currentBuyer, submitRequest } = useApp();
  const { address } = useCheckout();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!address) navigate('/buyer-app/request/address', { replace: true });
    else if (cart.length === 0) navigate('/buyer-app/cart', { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!address || cart.length === 0) return null;

  async function handleSubmit() {
    setSubmitting(true);
    setError('');
    try {
      const req = await submitRequest(cart, address);
      navigate('/buyer-app/request/success', { state: { requestId: req.id }, replace: true });
    } catch (err: any) {
      setError(err.message || 'Could not submit your request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-5 md:px-8 py-6 pb-28">
      <h1 className="text-xl md:text-2xl font-extrabold text-[#1B2420] mb-6">Review Request</h1>

      <div className="space-y-4">
        <div className="bg-white rounded-2xl border border-[#E4DDCE] p-5">
          <div className="flex items-center gap-2 mb-3"><User className="w-4 h-4 text-[#0F5D3C]" /><h3 className="text-sm font-bold text-[#1B2420]">Buyer Information</h3></div>
          <p className="text-[14px] font-semibold text-[#1B2420]">{currentBuyer?.fullName}</p>
          <p className="text-[13px] text-[#55605A]">+91 {currentBuyer?.mobile} · {currentBuyer?.customerType}</p>
          {currentBuyer?.businessName && <p className="text-[13px] text-[#55605A]">{currentBuyer.businessName}</p>}
        </div>

        <div className="bg-white rounded-2xl border border-[#E4DDCE] p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-[#0F5D3C]" /><h3 className="text-sm font-bold text-[#1B2420]">Delivery Address</h3></div>
            <button onClick={() => navigate('/buyer-app/request/address')} className="text-[#0F5D3C]"><Edit2 className="w-3.5 h-3.5" /></button>
          </div>
          <p className="text-[13.5px] text-[#55605A] leading-relaxed">
            {address.label}<br />
            {[address.building, address.street, address.locality, address.sector, address.city, address.district, address.state, address.pinCode].filter(Boolean).join(', ')}
            {address.landmark && <><br />Landmark: {address.landmark}</>}
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-[#E4DDCE] p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2"><Package className="w-4 h-4 text-[#0F5D3C]" /><h3 className="text-sm font-bold text-[#1B2420]">Products ({cart.length})</h3></div>
            <button onClick={() => navigate('/buyer-app/cart')} className="text-[#0F5D3C]"><Edit2 className="w-3.5 h-3.5" /></button>
          </div>
          <div className="space-y-3">
            {cart.map(item => {
              const p = getProduct(item.productId);
              if (!p) return null;
              return (
                <div key={item.productId} className="flex items-center justify-between gap-3">
                  <div className="min-w-0"><p className="text-[13.5px] font-medium text-[#1B2420] line-clamp-1">{p.name}</p><p className="text-[11px] text-[#55605A]">{p.modelNumber}</p></div>
                  <span className="text-[13px] font-bold text-[#1B2420] flex-shrink-0">× {item.quantity}</span>
                </div>
              );
            })}
          </div>
        </div>

        <p className="text-[12px] text-[#55605A] text-center px-4">No payment is required now. Our team will review your request and share a quotation.</p>
        {error && <p className="text-sm text-[#DC2626] text-center">{error}</p>}
      </div>

      <div className="fixed bottom-16 md:bottom-0 left-0 right-0 z-30 bg-white border-t border-[#E4DDCE]">
        <div className="max-w-2xl mx-auto px-5 md:px-8 py-3.5">
          <button onClick={handleSubmit} disabled={submitting} className="w-full h-12 rounded-xl bg-[#0F5D3C] text-white font-bold text-[15px] hover:bg-[#0A4429] disabled:opacity-60 transition-colors">
            {submitting ? 'Submitting…' : 'Submit Request'}
          </button>
        </div>
      </div>
    </div>
  );
}
