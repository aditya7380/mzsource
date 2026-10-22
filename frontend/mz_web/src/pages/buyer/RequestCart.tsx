import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Minus, Plus, Trash2, Package, ShoppingCart } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { EmptyState } from '../../components/common/Misc';

export default function RequestCart() {
  const navigate = useNavigate();
  const { cart, getProduct, updateCartQuantity, removeFromCart } = useApp();
  const totalItems = cart.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <div className="max-w-3xl mx-auto px-5 md:px-8 py-6 pb-32">
      <h1 className="text-xl md:text-2xl font-extrabold text-[#1B2420] mb-1">Request Cart</h1>
      <p className="text-sm text-[#55605A] mb-6">{totalItems} item{totalItems === 1 ? '' : 's'}</p>

      {cart.length === 0 ? (
        <EmptyState
          icon={<ShoppingCart className="w-6 h-6" />} title="Your request cart is empty"
          description="Browse products and add items to build your request."
          action={<button onClick={() => navigate('/buyer-app/home')} className="h-11 px-5 rounded-xl bg-[#0F5D3C] text-white font-semibold text-sm">Browse Products</button>}
        />
      ) : (
        <div className="space-y-3">
          {cart.map(item => {
            const p = getProduct(item.productId);
            if (!p) return null;
            return (
              <div key={item.productId} className="flex gap-4 bg-white rounded-2xl border border-[#E4DDCE] p-4">
                <div className="w-20 h-20 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: p.imageColor || '#E6F2EA' }}>
                  <Package className="w-8 h-8 text-white/85" strokeWidth={1.5} />
                </div>
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <p className="text-[14px] font-semibold text-[#1B2420] leading-snug line-clamp-2">{p.name}</p>
                    {p.modelNumber && <p className="text-[11.5px] text-[#55605A] mt-0.5">Model: {p.modelNumber}</p>}
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center border border-[#E4DDCE] rounded-lg h-9">
                      <button onClick={() => updateCartQuantity(item.productId, item.quantity - 1)} className="w-8 h-full flex items-center justify-center active:bg-gray-100 rounded-l-lg"><Minus className="w-3.5 h-3.5" /></button>
                      <span className="w-9 text-center text-[13px] font-bold">{item.quantity}</span>
                      <button onClick={() => updateCartQuantity(item.productId, item.quantity + 1)} className="w-8 h-full flex items-center justify-center active:bg-gray-100 rounded-r-lg"><Plus className="w-3.5 h-3.5" /></button>
                    </div>
                    <button onClick={() => removeFromCart(item.productId)} className="w-9 h-9 flex items-center justify-center text-[#DC2626] hover:bg-red-50 rounded-lg" aria-label="Remove"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {cart.length > 0 && (
        <div className="fixed bottom-16 md:bottom-0 left-0 right-0 z-30 bg-white border-t border-[#E4DDCE]">
          <div className="max-w-3xl mx-auto px-5 md:px-8 py-3.5 flex items-center justify-between gap-4">
            <div>
              <p className="text-xs text-[#55605A]">Total items</p>
              <p className="font-bold text-[#1B2420] text-[15px]">{totalItems}</p>
            </div>
            <button onClick={() => navigate('/buyer-app/request/address')} className="h-12 px-8 rounded-xl bg-[#0F5D3C] text-white font-bold text-[15px] hover:bg-[#0A4429] transition-colors">
              Continue to Request
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
