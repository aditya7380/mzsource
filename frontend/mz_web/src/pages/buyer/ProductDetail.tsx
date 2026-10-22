import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronRight, Package, Minus, Plus, CheckCircle2, Info, History, X as XIcon } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Dialog } from '../../components/common/Dialog';
import { StatusBadge } from '../../components/common/Misc';
import { formatDate } from '../../lib/format';
import type { RequestStatus } from '../../data/appTypes';

const AVAILABILITY_STYLE: Record<string, string> = {
  'In Stock': 'text-[#16A34A] bg-[#DCFCE7]',
  'Limited Stock': 'text-[#F59E0B] bg-[#FEF3C7]',
  'Out of Stock': 'text-[#DC2626] bg-[#FEE2E2]',
  'On Request': 'text-[#2F80ED] bg-[#CFE5D8]',
};

const DISMISSED_KEY = 'mzsource_dismissed_history';

export default function ProductDetail() {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const { getProduct, getCategory, getSubcategory, addToCart, getProductHistory } = useApp();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [, forceUpdate] = useState(0);

  const product = productId ? getProduct(productId) : undefined;
  if (!product) return null;

  const category = getCategory(product.categoryId);
  const subcategory = category ? getSubcategory(category.id, product.subcategoryId) : undefined;
  const unavailable = product.availability === 'Out of Stock';
  const history = getProductHistory(product.id);

  function handleAdd() {
    addToCart(product!.id, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  }

  function dismissHistoryEntry(requestId: string) {
    let dismissed: string[] = [];
    try { dismissed = JSON.parse(localStorage.getItem(DISMISSED_KEY) || '[]'); } catch { /* ignore */ }
    const key = `${requestId}:${product!.id}`;
    if (!dismissed.includes(key)) dismissed.push(key);
    localStorage.setItem(DISMISSED_KEY, JSON.stringify(dismissed));
    forceUpdate(n => n + 1);
  }

  return (
    <div className="pb-28 md:pb-8">
      <div className="max-w-5xl mx-auto px-5 md:px-8 pt-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-[13px] mb-4 flex-wrap">
          {category && <button onClick={() => navigate(`/buyer-app/categories/${category.id}`)} className="font-semibold text-[#0F5D3C]">{category.name}</button>}
          {subcategory && <><ChevronRight className="w-3.5 h-3.5 text-[#55605A]" /><span className="text-[#55605A]">{subcategory.name}</span></>}
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Image */}
          <div className="aspect-square w-full rounded-2xl flex items-center justify-center" style={{ backgroundColor: product.imageColor || '#E6F2EA' }}>
            <Package className="w-20 h-20 text-white/85" strokeWidth={1.3} />
          </div>

          <div>
            <h1 className="text-xl md:text-2xl font-extrabold text-[#1B2420] leading-snug">{product.name}</h1>
            <p className="text-sm text-[#55605A] mt-1">Model: <span className="font-semibold text-[#1B2420]">{product.modelNumber}</span></p>

            <div className="flex items-center gap-2 mt-3">
              <span className={`inline-flex items-center gap-1.5 text-[13px] font-semibold px-2.5 py-1 rounded-lg ${AVAILABILITY_STYLE[product.availability]}`}>
                <CheckCircle2 className="w-3.5 h-3.5" /> {product.availability}
              </span>
              <span className="text-[13px] font-medium text-[#55605A] bg-[#F3F4F6] px-2.5 py-1 rounded-lg">Unit: {product.unitType}</span>
            </div>

            <div className="flex items-start gap-2.5 bg-[#E6F2EA] border border-[#CFE5D8] rounded-xl p-4 mt-5">
              <Info className="w-4.5 h-4.5 text-[#0F5D3C] flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-[13.5px] font-bold text-[#0F5D3C]">Price Available on Request</p>
                <p className="text-[12.5px] text-[#0F5D3C]/80 mt-0.5">Submit your request and we'll provide a quotation after checking availability and sourcing.</p>
              </div>
            </div>

            {product.description && (
              <div className="mt-6">
                <h3 className="text-sm font-bold text-[#1B2420] mb-1.5">Description</h3>
                <p className="text-[14px] text-[#55605A] leading-relaxed">{product.description}</p>
              </div>
            )}
          </div>
        </div>

        {product.specifications && (
          <div className="mt-8">
            <h3 className="text-base font-bold text-[#1B2420] mb-3">Specifications</h3>
            <div className="rounded-xl border border-[#E4DDCE] overflow-hidden max-w-2xl">
              {product.specifications.split('|').map(s => s.trim()).filter(Boolean).map((spec, idx) => {
                const [key, ...rest] = spec.split(':');
                return (
                  <div key={idx} className={`flex items-center justify-between px-4 py-3 text-[13.5px] ${idx % 2 === 0 ? 'bg-white' : 'bg-[#FAF7F0]'}`}>
                    <span className="text-[#55605A]">{key?.trim()}</span>
                    <span className="font-medium text-[#1B2420]">{rest.join(':').trim()}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Sticky bottom action bar */}
      <div className="fixed bottom-16 md:bottom-0 left-0 right-0 z-30 bg-white border-t border-[#E4DDCE]">
        <div className="max-w-5xl mx-auto px-5 md:px-8 py-3 flex items-center gap-3">
          <div className="flex items-center border border-[#E4DDCE] rounded-xl h-12 flex-shrink-0">
            <button onClick={() => setQty(q => Math.max(1, q - 1))} className="w-11 h-full flex items-center justify-center text-[#1B2420] active:bg-gray-100 rounded-l-xl"><Minus className="w-4 h-4" /></button>
            <span className="w-10 text-center font-bold text-[15px]">{qty}</span>
            <button onClick={() => setQty(q => q + 1)} className="w-11 h-full flex items-center justify-center text-[#1B2420] active:bg-gray-100 rounded-r-xl"><Plus className="w-4 h-4" /></button>
          </div>

          <button
            onClick={handleAdd}
            disabled={unavailable}
            className={`flex-1 h-12 rounded-xl font-bold text-[15px] flex items-center justify-center gap-2 transition-colors disabled:opacity-50 ${
              added ? 'bg-[#16A34A] text-white' : 'bg-[#0F5D3C] text-white hover:bg-[#0A4429]'
            }`}
          >
            {added ? <><CheckCircle2 className="w-4.5 h-4.5" /> Added to Request</> : unavailable ? 'Currently Unavailable' : 'Add to Request'}
          </button>

          <button
            onClick={() => setHistoryOpen(true)}
            className="w-12 h-12 rounded-xl border border-[#E4DDCE] flex items-center justify-center text-[#55605A] hover:bg-gray-50 flex-shrink-0 relative"
            aria-label="View request history for this product"
            title="Your request history for this product"
          >
            <History className="w-5 h-5" />
            {history.length > 0 && (
              <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 px-1 rounded-full bg-[#B4471C] text-white text-[10px] font-bold flex items-center justify-center">{history.length}</span>
            )}
          </button>
        </div>
      </div>

      <Dialog open={historyOpen} onClose={() => setHistoryOpen(false)} title="Your Request History">
        <div className="p-5">
          <p className="text-[13px] text-[#55605A] mb-4">Past requests you've made for <span className="font-semibold text-[#1B2420]">{product.name}</span></p>
          {history.length === 0 ? (
            <p className="text-sm text-[#55605A] text-center py-8">You haven't requested this product before.</p>
          ) : (
            <div className="space-y-2.5">
              {history.map(h => (
                <div key={h.requestId} className="flex items-center justify-between gap-3 bg-[#FAF7F0] rounded-xl p-3.5">
                  <div className="min-w-0">
                    <p className="text-[13px] font-bold text-[#0F5D3C]">{h.requestId}</p>
                    <p className="text-[12px] text-[#55605A] mt-0.5">{formatDate(h.date)} · Qty {h.quantity}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <StatusBadge status={h.status as RequestStatus} size="sm" />
                    {h.status === 'REJECTED' && (
                      <button
                        onClick={() => dismissHistoryEntry(h.requestId)}
                        className="w-6 h-6 flex items-center justify-center rounded-full text-[#DC2626] hover:bg-red-100"
                        aria-label="Dismiss this rejected entry"
                        title="Remove from history"
                      >
                        <XIcon className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Dialog>
    </div>
  );
}
