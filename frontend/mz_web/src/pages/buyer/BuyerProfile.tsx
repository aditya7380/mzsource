import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone, MapPin, LogOut, ChevronRight, Edit2, Plus, Trash2, X, PlusCircle, PhoneCall } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { CUSTOMER_TYPES } from '../../data/appTypes';
import type { CustomerType } from '../../data/appTypes';
import { initials } from '../../lib/format';

export default function BuyerProfile() {
  const navigate = useNavigate();
  const { currentBuyer, settings, logoutBuyer, updateBuyerProfile, addAddress, deleteAddress } = useApp();
  const [editing, setEditing] = useState(false);
  const [addingAddress, setAddingAddress] = useState(false);
  const [fullName, setFullName] = useState(currentBuyer?.fullName || '');
  const [customerType, setCustomerType] = useState<CustomerType>(currentBuyer?.customerType || 'Individual');
  const [businessName, setBusinessName] = useState(currentBuyer?.businessName || '');
  const [saving, setSaving] = useState(false);
  const [addrForm, setAddrForm] = useState({ label: 'Home', building: '', street: '', locality: '', sector: '', city: '', district: '', state: 'Mizoram', pinCode: '', landmark: '', isDefault: false });

  if (!currentBuyer) return null;

  async function saveProfile() {
    setSaving(true);
    try { await updateBuyerProfile({ fullName, customerType, businessName }); setEditing(false); } finally { setSaving(false); }
  }
  async function saveAddress() {
    setSaving(true);
    try {
      await addAddress(addrForm);
      setAddingAddress(false);
      setAddrForm({ label: 'Home', building: '', street: '', locality: '', sector: '', city: '', district: '', state: 'Mizoram', pinCode: '', landmark: '', isDefault: false });
    } finally { setSaving(false); }
  }
  async function removeAddress(id: string) {
    if (!confirm('Remove this address?')) return;
    await deleteAddress(id);
  }
  function handleLogout() {
    if (confirm('Log out of your account?')) { logoutBuyer(); navigate('/', { replace: true }); }
  }

  return (
    <div className="max-w-3xl mx-auto px-5 md:px-8 py-6 pb-8">
      <h1 className="text-xl md:text-2xl font-extrabold text-[#1B2420] mb-5">Profile</h1>

      {/* Call admin support — prominent, at top per request */}
      {settings?.phone && (
        <a href={`tel:${settings.phone.replace(/\s/g, '')}`}
          className="flex items-center gap-4 bg-gradient-to-r from-[#0F5D3C] to-[#0A4429] rounded-2xl p-4 mb-4 hover:opacity-95 active:scale-[0.99] transition-all">
          <div className="w-11 h-11 rounded-xl bg-white/15 flex items-center justify-center flex-shrink-0"><PhoneCall className="w-5 h-5 text-white" /></div>
          <div className="flex-1 min-w-0">
            <p className="text-[14px] font-bold text-white">Need help with your request?</p>
            <p className="text-xs text-white/80">Call our support line directly</p>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-white font-bold text-[15px]">{settings.phone}</p>
            <p className="text-white/70 text-[10.5px]">Tap to call</p>
          </div>
        </a>
      )}

      {/* Profile header card */}
      <div className="bg-white rounded-2xl border border-[#E4DDCE] p-5 flex items-center gap-4 mb-4">
        <div className="w-16 h-16 rounded-full bg-[#0F5D3C] flex items-center justify-center text-white font-bold text-xl flex-shrink-0">{initials(currentBuyer.fullName)}</div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-[#1B2420] text-[16px] truncate">{currentBuyer.fullName}</p>
          <p className="text-[13px] text-[#55605A]">+91 {currentBuyer.mobile}</p>
          <p className="text-[12px] text-[#0F5D3C] font-semibold mt-0.5">{currentBuyer.id}</p>
        </div>
        <button onClick={() => setEditing(v => !v)} className="w-9 h-9 rounded-full bg-[#E6F2EA] flex items-center justify-center flex-shrink-0">{editing ? <X className="w-4 h-4 text-[#0F5D3C]" /> : <Edit2 className="w-4 h-4 text-[#0F5D3C]" />}</button>
      </div>

      {editing ? (
        <div className="bg-white rounded-2xl border border-[#E4DDCE] p-4 space-y-3.5 mb-4">
          <Field label="Full Name" value={fullName} onChange={setFullName} />
          <div>
            <label className="text-sm font-medium text-[#1B2420] mb-1.5 block">Customer Type</label>
            <select value={customerType} onChange={e => setCustomerType(e.target.value as CustomerType)} className="w-full h-12 rounded-xl border border-[#E4DDCE] bg-white px-3.5 text-[15px] outline-none focus:ring-2 focus:ring-[#0F5D3C]/30 focus:border-[#0F5D3C]">
              {CUSTOMER_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <Field label="Shop / Business Name" value={businessName} onChange={setBusinessName} />
          <button onClick={saveProfile} disabled={saving} className="w-full h-11 rounded-xl bg-[#0F5D3C] text-white font-bold text-sm hover:bg-[#0A4429] disabled:opacity-60">{saving ? 'Saving…' : 'Save Changes'}</button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#E4DDCE] p-4 mb-4 space-y-3">
          <Row label="Customer Type" value={currentBuyer.customerType} />
          {currentBuyer.businessName && <Row label="Shop / Institution" value={currentBuyer.businessName} />}
        </div>
      )}

      <div className="flex items-center justify-between mb-3 mt-6">
        <h3 className="text-[15px] font-bold text-[#1B2420] flex items-center gap-2"><MapPin className="w-4 h-4 text-[#0F5D3C]" /> Saved Addresses</h3>
        <button onClick={() => setAddingAddress(v => !v)} className="text-xs font-semibold text-[#0F5D3C] flex items-center gap-1"><Plus className="w-3.5 h-3.5" /> Add</button>
      </div>
      <div className="space-y-3 mb-4">
        {currentBuyer.addresses.map(addr => (
          <div key={addr.id} className="bg-white rounded-2xl border border-[#E4DDCE] p-4 flex items-start gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-[#1B2420]">{addr.label} {addr.isDefault && <span className="text-[10px] font-semibold text-[#0F5D3C] bg-[#E6F2EA] px-1.5 py-0.5 rounded ml-1">Default</span>}</p>
              <p className="text-[12.5px] text-[#55605A] mt-0.5 leading-snug">{[addr.building, addr.street, addr.locality, addr.city, addr.state, addr.pinCode].filter(Boolean).join(', ')}</p>
            </div>
            <button onClick={() => removeAddress(addr.id)} className="w-8 h-8 flex items-center justify-center text-[#DC2626] flex-shrink-0"><Trash2 className="w-4 h-4" /></button>
          </div>
        ))}
        {currentBuyer.addresses.length === 0 && !addingAddress && <p className="text-[13px] text-[#55605A] text-center py-4">No saved addresses yet.</p>}
      </div>

      {addingAddress && (
        <div className="bg-white rounded-2xl border border-[#E4DDCE] p-4 space-y-3.5 mb-4">
          <Field label="Label" value={addrForm.label} onChange={v => setAddrForm(f => ({ ...f, label: v }))} placeholder="Home, Shop…" />
          <Field label="Building / House No." value={addrForm.building} onChange={v => setAddrForm(f => ({ ...f, building: v }))} />
          <Field label="Street" value={addrForm.street} onChange={v => setAddrForm(f => ({ ...f, street: v }))} />
          <div className="grid grid-cols-2 gap-3">
            <Field label="City *" value={addrForm.city} onChange={v => setAddrForm(f => ({ ...f, city: v }))} />
            <Field label="PIN Code *" value={addrForm.pinCode} onChange={v => setAddrForm(f => ({ ...f, pinCode: v.replace(/\D/g, '') }))} />
          </div>
          <button onClick={saveAddress} disabled={saving} className="w-full h-11 rounded-xl bg-[#0F5D3C] text-white font-bold text-sm hover:bg-[#0A4429] disabled:opacity-60">{saving ? 'Saving…' : 'Save Address'}</button>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-[#E4DDCE] divide-y divide-[#E4DDCE] mb-4 mt-6">
        <button onClick={() => navigate('/buyer-app/request-product')} className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50"><PlusCircle className="w-4.5 h-4.5 text-[#0F5D3C]" /><span className="flex-1 text-left text-[14px] font-medium text-[#1B2420]">Request a Product</span><ChevronRight className="w-4 h-4 text-[#55605A]" /></button>
        <button onClick={() => navigate('/buyer-app/requests')} className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50"><Phone className="w-4.5 h-4.5 text-[#0F5D3C]" /><span className="flex-1 text-left text-[14px] font-medium text-[#1B2420]">My Requests</span><ChevronRight className="w-4 h-4 text-[#55605A]" /></button>
      </div>

      <button onClick={handleLogout} className="w-full h-12 rounded-xl border border-[#FEE2E2] text-[#DC2626] font-bold text-sm flex items-center justify-center gap-2 hover:bg-[#FEE2E2]/40"><LogOut className="w-4 h-4" /> Log Out</button>
    </div>
  );
}

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div>
      <label className="text-sm font-medium text-[#1B2420] mb-1.5 block">{label}</label>
      <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className="w-full h-12 rounded-xl border border-[#E4DDCE] bg-white px-3.5 text-[15px] outline-none focus:ring-2 focus:ring-[#0F5D3C]/30 focus:border-[#0F5D3C]" />
    </div>
  );
}
function Row({ label, value }: { label: string; value: string }) {
  return <div className="flex items-center justify-between"><span className="text-[13px] text-[#55605A]">{label}</span><span className="text-[13.5px] font-semibold text-[#1B2420]">{value}</span></div>;
}
