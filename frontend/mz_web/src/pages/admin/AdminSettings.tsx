import React, { useEffect, useState } from 'react';
import { Building2, Save } from 'lucide-react';
import { api } from '../../lib/api';
import { useApp } from '../../context/AppContext';

export default function AdminSettings() {
  const { updateSettings } = useApp();
  const [form, setForm] = useState({ businessName: '', tagline: '', phone: '', email: '', address: '', operatingArea: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api.settings.getAdmin().then(setForm).finally(() => setLoading(false));
  }, []);

  async function handleSave() {
    setSaving(true); setSaved(false);
    try {
      await updateSettings(form);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } finally { setSaving(false); }
  }

  if (loading) return null;

  return (
    <div className="px-5 lg:px-8 py-6 max-w-2xl mx-auto">
      <h1 className="text-xl lg:text-2xl font-extrabold text-[#1B2420] mb-1">Settings</h1>
      <p className="text-sm text-[#55605A] mb-6">Business info shown to buyers, including your support phone number</p>

      <div className="bg-white rounded-2xl border border-[#E4DDCE] p-5">
        <div className="flex items-center gap-2 mb-4"><Building2 className="w-4 h-4 text-[#0F5D3C]" /><h3 className="text-sm font-bold text-[#1B2420]">Business Information</h3></div>

        <div className="space-y-4">
          <Field label="Business Name" value={form.businessName} onChange={v => setForm(f => ({ ...f, businessName: v }))} />
          <Field label="Tagline" value={form.tagline} onChange={v => setForm(f => ({ ...f, tagline: v }))} />
          <Field label="Contact Phone" value={form.phone} onChange={v => setForm(f => ({ ...f, phone: v }))} hint="Shown on the buyer app's Profile page as a tap-to-call number" />
          <Field label="Contact Email" value={form.email} onChange={v => setForm(f => ({ ...f, email: v }))} />
          <Field label="Address" value={form.address} onChange={v => setForm(f => ({ ...f, address: v }))} />
          <Field label="Operating Area" value={form.operatingArea} onChange={v => setForm(f => ({ ...f, operatingArea: v }))} />
        </div>

        <button onClick={handleSave} disabled={saving} className="w-full h-12 rounded-xl bg-[#0F5D3C] text-white font-bold text-sm hover:bg-[#0A4429] disabled:opacity-60 mt-6 flex items-center justify-center gap-2">
          <Save className="w-4 h-4" /> {saving ? 'Saving…' : saved ? 'Saved!' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, hint }: { label: string; value: string; onChange: (v: string) => void; hint?: string }) {
  return (
    <div>
      <label className="text-sm font-medium text-[#1B2420] mb-1.5 block">{label}</label>
      <input value={value} onChange={e => onChange(e.target.value)} className="w-full h-11 rounded-xl border border-[#E4DDCE] px-3.5 text-sm outline-none focus:ring-2 focus:ring-[#0F5D3C]/30 focus:border-[#0F5D3C]" />
      {hint && <p className="text-xs text-[#6B756F] mt-1">{hint}</p>}
    </div>
  );
}
