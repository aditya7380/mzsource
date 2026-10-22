import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function RequestProduct() {
  const navigate = useNavigate();
  const { submitCustomProductRequest } = useApp();
  const [productName, setProductName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!productName.trim()) return setError('Please tell us what product you need');
    setLoading(true); setError('');
    try {
      await submitCustomProductRequest({ productName: productName.trim(), requiredQuantity: quantity.trim(), description: description.trim() });
      setDone(true);
    } catch (err: any) {
      setError(err.message || 'Could not submit your request');
    } finally { setLoading(false); }
  }

  if (done) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-6 text-center">
        <div className="w-20 h-20 rounded-full bg-[#DCFCE7] flex items-center justify-center mb-6"><CheckCircle2 className="w-11 h-11 text-[#16A34A]" strokeWidth={1.7} /></div>
        <h1 className="text-2xl font-extrabold text-[#1B2420]">Request Sent!</h1>
        <p className="text-[#55605A] text-[15px] mt-2 max-w-sm mb-8">Our team will look into sourcing this product and get back to you soon.</p>
        <button onClick={() => navigate('/buyer-app/home', { replace: true })} className="h-12 px-8 rounded-xl bg-[#0F5D3C] text-white font-bold text-[15px] hover:bg-[#0A4429]">Back to Home</button>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-5 md:px-8 py-6">
      <h1 className="text-xl md:text-2xl font-extrabold text-[#1B2420] mb-2">Request a Product</h1>
      <p className="text-[14px] text-[#55605A] mb-6">Can't find what you're looking for? Tell us about it and we'll try to source it for you.</p>

      <form onSubmit={handleSubmit} className="space-y-4 bg-white rounded-2xl border border-[#E4DDCE] p-5">
        <div>
          <label className="text-sm font-medium text-[#1B2420] mb-1.5 block">Product Name *</label>
          <input autoFocus value={productName} onChange={e => setProductName(e.target.value)} placeholder="e.g. 5W Solar Panel"
            className="w-full h-12 rounded-xl border border-[#E4DDCE] bg-white px-3.5 text-[15px] outline-none focus:ring-2 focus:ring-[#0F5D3C]/30 focus:border-[#0F5D3C]" />
        </div>
        <div>
          <label className="text-sm font-medium text-[#1B2420] mb-1.5 block">Quantity Needed</label>
          <input value={quantity} onChange={e => setQuantity(e.target.value)} placeholder="e.g. 2 pieces"
            className="w-full h-12 rounded-xl border border-[#E4DDCE] bg-white px-3.5 text-[15px] outline-none focus:ring-2 focus:ring-[#0F5D3C]/30 focus:border-[#0F5D3C]" />
        </div>
        <div>
          <label className="text-sm font-medium text-[#1B2420] mb-1.5 block">Additional Details</label>
          <textarea rows={4} value={description} onChange={e => setDescription(e.target.value)} placeholder="Any specifications, brand preference, or use-case details…"
            className="w-full rounded-xl border border-[#E4DDCE] bg-white px-3.5 py-3 text-[15px] outline-none focus:ring-2 focus:ring-[#0F5D3C]/30 focus:border-[#0F5D3C] resize-none" />
        </div>
        {error && <p className="text-sm text-[#DC2626]">{error}</p>}
        <button type="submit" disabled={loading} className="w-full h-12 rounded-xl bg-[#0F5D3C] text-white font-bold text-[15px] hover:bg-[#0A4429] disabled:opacity-60">{loading ? 'Submitting…' : 'Submit Request'}</button>
      </form>
    </div>
  );
}
