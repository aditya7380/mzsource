import React, { useState } from 'react';
import { Search, Package, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { EmptyState } from '../../components/common/Misc';
import { UNIT_TYPES } from '../../data/appTypes';
import type { AvailabilityStatus, Product, UnitType } from '../../data/appTypes';

const AVAILABILITY: AvailabilityStatus[] = ['In Stock', 'Limited Stock', 'Out of Stock', 'On Request'];

interface FormState {
  id?: string; name: string; categoryId: string; subcategoryId: string; modelNumber: string;
  description: string; specifications: string; unitType: UnitType; availability: AvailabilityStatus; active: boolean;
}
const emptyForm: FormState = { name: '', categoryId: '', subcategoryId: '', modelNumber: '', description: '', specifications: '', unitType: 'Piece', availability: 'In Stock', active: true };

export default function AdminProducts() {
  const { categories, products, addProduct, updateProduct, deleteProduct } = useApp();
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('All');
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);

  const filtered = products.filter(p =>
    (catFilter === 'All' || p.categoryId === catFilter) &&
    (!search.trim() || p.name.toLowerCase().includes(search.toLowerCase()) || p.modelNumber.toLowerCase().includes(search.toLowerCase())),
  );

  function openNew() { setForm(emptyForm); setModalOpen(true); }
  function openEdit(p: Product) {
    setForm({ id: p.id, name: p.name, categoryId: p.categoryId, subcategoryId: p.subcategoryId, modelNumber: p.modelNumber, description: p.description, specifications: p.specifications, unitType: p.unitType, availability: p.availability, active: p.active });
    setModalOpen(true);
  }

  async function save() {
    if (!form.name.trim() || !form.categoryId) return;
    setSaving(true);
    try {
      const payload = { name: form.name.trim(), categoryId: form.categoryId, subcategoryId: form.subcategoryId || null, modelNumber: form.modelNumber, description: form.description, specifications: form.specifications, unitType: form.unitType, availability: form.availability, active: form.active };
      if (form.id) await updateProduct(form.id, payload); else await addProduct(payload);
      setModalOpen(false);
    } finally { setSaving(false); }
  }

  async function toggleActive(p: Product) { await updateProduct(p.id, { active: !p.active }); }

  const activeCategory = categories.find(c => c.id === form.categoryId);

  return (
    <div className="px-5 lg:px-8 py-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-xl lg:text-2xl font-extrabold text-[#1B2420]">Products</h1>
        <button onClick={openNew} className="h-10 px-4 rounded-xl bg-[#0F5D3C] text-white font-bold text-sm hover:bg-[#0A4429]">+ Add Product</button>
      </div>
      <p className="text-sm text-[#55605A] mb-5">{products.filter(p => p.active).length} active / {products.length} total products</p>

      <div className="bg-white rounded-2xl border border-[#E4DDCE] p-5 mb-5">
        <div className="relative mb-3">
          <Search className="w-4 h-4 text-[#55605A] absolute left-4 top-1/2 -translate-y-1/2" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products…" className="w-full h-11 rounded-xl bg-[#FAF7F0] border border-[#E4DDCE] pl-10 pr-3 text-sm outline-none focus:ring-2 focus:ring-[#0F5D3C]/30 focus:border-[#0F5D3C]" />
        </div>
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          <button onClick={() => setCatFilter('All')} className={`flex-shrink-0 px-3.5 h-9 rounded-full text-[13px] font-semibold border ${catFilter === 'All' ? 'bg-[#0F5D3C] text-white border-[#0F5D3C]' : 'bg-white text-[#55605A] border-[#E4DDCE]'}`}>All</button>
          {categories.map(c => (
            <button key={c.id} onClick={() => setCatFilter(c.id)} className={`flex-shrink-0 px-3.5 h-9 rounded-full text-[13px] font-semibold border whitespace-nowrap ${catFilter === c.id ? 'text-white border-transparent' : 'bg-white border-[#E4DDCE]'}`} style={catFilter === c.id ? { backgroundColor: c.color } : { color: c.color }}>{c.name}</button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? <EmptyState icon={<Package className="w-6 h-6" />} title="No products found" /> : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(p => (
            <div key={p.id} className={`bg-white rounded-2xl border p-4 ${p.active ? 'border-[#E4DDCE]' : 'border-dashed border-[#6B756F] opacity-60'}`}>
              <div className="w-full aspect-video rounded-xl flex items-center justify-center mb-3" style={{ backgroundColor: p.imageColor }}><Package className="w-8 h-8 text-white/85" /></div>
              <p className="text-[13.5px] font-bold text-[#1B2420] line-clamp-2 min-h-[2.4em]">{p.name}</p>
              <p className="text-[11px] text-[#55605A] mt-0.5">Model: {p.modelNumber || '—'}</p>
              <div className="flex flex-wrap gap-1.5 mt-2">
                <span className="text-[10.5px] font-medium text-[#55605A] bg-gray-100 px-2 py-0.5 rounded-full">{categories.find(c => c.id === p.categoryId)?.name}</span>
                <span className="text-[10.5px] font-medium text-[#55605A] bg-gray-100 px-2 py-0.5 rounded-full">{p.availability}</span>
              </div>
              <div className="flex gap-2 mt-3">
                <button onClick={() => openEdit(p)} className="flex-1 h-9 rounded-lg bg-[#E6F2EA] text-[#0F5D3C] font-semibold text-xs hover:bg-[#CFE5D8]">Edit</button>
                <button onClick={() => toggleActive(p)} className={`flex-1 h-9 rounded-lg font-semibold text-xs ${p.active ? 'bg-[#FEE2E2] text-[#DC2626] hover:bg-red-100' : 'bg-[#DCFCE7] text-[#16A34A] hover:bg-green-100'}`}>{p.active ? 'Deactivate' : 'Activate'}</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 z-[90] flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setModalOpen(false)} />
          <div className="relative bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white flex items-center justify-between px-5 h-14 border-b border-[#E4DDCE]"><h3 className="font-bold text-[#1B2420]">{form.id ? 'Edit Product' : 'Add Product'}</h3><button onClick={() => setModalOpen(false)} className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100"><X className="w-5 h-5" /></button></div>
            <div className="p-5 space-y-3.5">
              <TextField label="Product Name *" value={form.name} onChange={v => setForm(f => ({ ...f, name: v }))} />
              <div className="grid grid-cols-2 gap-3">
                <SelectField label="Category *" value={form.categoryId} onChange={v => setForm(f => ({ ...f, categoryId: v, subcategoryId: '' }))} options={categories.map(c => ({ label: c.name, value: c.id }))} placeholder="Select category" />
                <SelectField label="Subcategory" value={form.subcategoryId} onChange={v => setForm(f => ({ ...f, subcategoryId: v }))} options={(activeCategory?.subcategories || []).map(s => ({ label: s.name, value: s.id }))} placeholder="Select subcategory" />
              </div>
              <TextField label="Model Number" value={form.modelNumber} onChange={v => setForm(f => ({ ...f, modelNumber: v }))} />
              <TextAreaField label="Description" value={form.description} onChange={v => setForm(f => ({ ...f, description: v }))} />
              <TextAreaField label="Specifications" value={form.specifications} onChange={v => setForm(f => ({ ...f, specifications: v }))} hint="Use 'Key: Value | Key: Value' format" />
              <div className="grid grid-cols-2 gap-3">
                <SelectField label="Unit Type" value={form.unitType} onChange={v => setForm(f => ({ ...f, unitType: v as UnitType }))} options={UNIT_TYPES.map(u => ({ label: u, value: u }))} />
                <SelectField label="Availability" value={form.availability} onChange={v => setForm(f => ({ ...f, availability: v as AvailabilityStatus }))} options={AVAILABILITY.map(a => ({ label: a, value: a }))} />
              </div>
              <label className="flex items-center gap-2.5 pt-1"><input type="checkbox" checked={form.active} onChange={e => setForm(f => ({ ...f, active: e.target.checked }))} className="w-4 h-4 rounded accent-[#0F5D3C]" /><span className="text-sm text-[#1B2420]">Active (visible to buyers)</span></label>
              <button onClick={save} disabled={saving} className="w-full h-12 rounded-xl bg-[#0F5D3C] text-white font-bold text-sm hover:bg-[#0A4429] disabled:opacity-60 mt-2">{saving ? 'Saving…' : form.id ? 'Save Changes' : 'Add Product'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function TextField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return <div><label className="text-sm font-medium text-[#1B2420] mb-1.5 block">{label}</label><input value={value} onChange={e => onChange(e.target.value)} className="w-full h-11 rounded-xl border border-[#E4DDCE] px-3.5 text-sm outline-none focus:ring-2 focus:ring-[#0F5D3C]/30 focus:border-[#0F5D3C]" /></div>;
}
function TextAreaField({ label, value, onChange, hint }: { label: string; value: string; onChange: (v: string) => void; hint?: string }) {
  return <div><label className="text-sm font-medium text-[#1B2420] mb-1.5 block">{label}</label><textarea rows={2} value={value} onChange={e => onChange(e.target.value)} className="w-full rounded-xl border border-[#E4DDCE] px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#0F5D3C]/30 focus:border-[#0F5D3C] resize-none" />{hint && <p className="text-xs text-[#6B756F] mt-1">{hint}</p>}</div>;
}
function SelectField({ label, value, onChange, options, placeholder }: { label: string; value: string; onChange: (v: string) => void; options: { label: string; value: string }[]; placeholder?: string }) {
  return (
    <div>
      <label className="text-sm font-medium text-[#1B2420] mb-1.5 block">{label}</label>
      <select value={value} onChange={e => onChange(e.target.value)} className="w-full h-11 rounded-xl border border-[#E4DDCE] px-3.5 text-sm outline-none focus:ring-2 focus:ring-[#0F5D3C]/30 focus:border-[#0F5D3C]">
        {placeholder && <option value="">{placeholder}</option>}
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}
