import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle2, ClipboardList, Home } from 'lucide-react';

export default function RequestSuccess() {
  const navigate = useNavigate();
  const location = useLocation();
  const requestId = (location.state as { requestId?: string })?.requestId;

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-6 py-12 text-center">
      <div className="w-20 h-20 rounded-full bg-[#DCFCE7] flex items-center justify-center mb-6"><CheckCircle2 className="w-11 h-11 text-[#16A34A]" strokeWidth={1.7} /></div>
      <h1 className="text-2xl font-extrabold text-[#1B2420]">Request Submitted!</h1>
      <p className="text-[#55605A] text-[15px] mt-2 max-w-sm">Your request has been received and is now pending review by our team.</p>
      {requestId && (
        <div className="mt-6 bg-white rounded-2xl border border-[#E4DDCE] px-6 py-3.5">
          <p className="text-xs text-[#55605A]">Request ID</p>
          <p className="text-lg font-bold text-[#0F5D3C] tracking-wide">{requestId}</p>
        </div>
      )}
      <p className="text-[13px] text-[#55605A] mt-6 max-w-sm">We'll notify you as soon as your request is reviewed and a quotation is ready.</p>

      <div className="flex flex-col sm:flex-row gap-3 mt-8 w-full max-w-sm">
        {requestId && (
          <button onClick={() => navigate(`/buyer-app/requests/${requestId}`, { replace: true })} className="flex-1 h-12 rounded-xl bg-[#0F5D3C] text-white font-bold text-[15px] flex items-center justify-center gap-2 hover:bg-[#0A4429]">
            <ClipboardList className="w-4 h-4" /> Track Request
          </button>
        )}
        <button onClick={() => navigate('/buyer-app/home', { replace: true })} className="flex-1 h-12 rounded-xl border border-[#E4DDCE] bg-white text-[#1B2420] font-bold text-[15px] flex items-center justify-center gap-2 hover:bg-gray-50">
          <Home className="w-4 h-4" /> Back to Home
        </button>
      </div>
    </div>
  );
}
