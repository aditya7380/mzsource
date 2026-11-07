import React, { useState } from 'react';
import { Search, Package, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { EmptyState } from '../../components/common/Misc';
import { ProductImage, safeImageUrl } from '../../components/common/ProductImage';
import { UNIT_TYPES } from '../../data/appTypes';
import type { AvailabilityStatus, Product, ProductType, UnitType } from '../../data/appTypes';
import { LevelPicker } from '../../components/education/LevelPicker';

const AVAILABILITY: AvailabilityStatus[] = ['In Stock', 'Limited Stock', 'Out of Stock', 'On Request'];

interface FormState {
  id?: string; name: string; categoryId: string; subcategoryId: string; modelNumber: string; imageUrl: string;
  description: string; specifications: string; unitType: UnitType; availability: AvailabilityStatus; active: boolean;
  productType: ProductType; educationalLevelIds: string[];
}
const emptyForm: FormState = { name: '', categoryId: '', subcategoryId: '', modelNumber: '', imageUrl: '', description: '', specifications: '', unitType: 'Piece', availability: 'In Stock', active: true, productType: 'individual', educationalLevelIds: [] };

export default function AdminProducts() {
  const { categories, selectableCategories, educationalLevels, products, addProduct, updateProduct, deleteProduct } = useApp();
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('All');
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [urlError, setUrlError] = useState(false);
  const [levelError, setLevelError] = useState(false);
  const [formError, setFormError] = useState('');
  // true while editing a product whose category has been removed from the shop
  const [legacyCategory, setLegacyCategory] = useState(false);

  const filtered = products.filter(p =>
    (catFilter === 'All' || p.categoryId === catFilter) &&
    (!search.trim() || p.name.toLowerCase().includes(search.toLowerCase()) || p.modelNumber.toLowerCase().includes(search.toLowerCase())),
  );

  function resetMessages() { setUrlError(false); setLevelError(false); setFormError(''); }
  function openNew() { resetMessages(); setLegacyCategory(false); setForm(emptyForm); setModalOpen(true); }
  function openEdit(p: Product) {
    resetMessages();
    const legacy = !selectableCategories.some(c => c.id === p.categoryId);
    setLegacyCategory(legacy);
    setForm({ id: p.id, name: p.name, categoryId: legacy ? '' : p.categoryId, subcategoryId: legacy ? '' : p.subcategoryId, modelNumber: p.modelNumber, imageUrl: p.imageUrl || '', description: p.description, specifications: p.specifications, unitType: p.unitType, availability: p.availability, active: p.active, productType: p.productType ?? 'individual', educationalLevelIds: p.educationalLevelIds ?? [] });
    setModalOpen(true);
  }

  async function save() {
    if (!form.name.trim()) return;
    if (!form.categoryId && !legacyCategory) return;
    resetMessages();
    if (form.imageUrl.trim() && !safeImageUrl(form.imageUrl)) { setUrlError(true); return; }
    if (form.productType === 'kit' && form.educationalLevelIds.length === 0) { setLevelError(true); return; }
    setSaving(true);
    try {
      const payload: Record<string, unknown> = { name: form.name.trim(), modelNumber: form.modelNumber, imageUrl: form.imageUrl.trim() || null, description: form.description, specifications: form.specifications, unitType: form.unitType, availability: form.availability, active: form.active, productType: form.productType, educationalLevelIds: form.educationalLevelIds };
      // A product in the removed category keeps its category/subcategory unless the admin deliberately picks a new category
      if (form.categoryId) { payload.categoryId = form.categoryId; payload.subcategoryId = form.subcategoryId || null; }
      if (form.id) await updateProduct(form.id, payload); else await addProduct(payload);
      setModalOpen(false);
    } catch (e: any) {
      setFormError(e?.message || 'Could not save the product. Please try again.');
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
          {selectableCategories.map(c => (
            <button key={c.id} onClick={() => setCatFilter(c.id)} className={`flex-shrink-0 px-3.5 h-9 rounded-full text-[13px] font-semibold border whitespace-nowrap ${catFilter === c.id ? 'text-white border-transparent' : 'bg-white border-[#E4DDCE]'}`} style={catFilter === c.id ? { backgroundColor: c.color } : { color: c.color }}>{c.name}</button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? <EmptyState icon={<Package className="w-6 h-6" />} title="No products found" /> : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(p => (
            <div key={p.id} className={`bg-white rounded-2xl border p-4 ${p.active ? 'border-[#E4DDCE]' : 'border-dashed border-[#6B756F] opacity-60'}`}>
              <ProductImage imageUrl={p.imageUrl} imageColor={p.imageColor} className="w-full aspect-video rounded-xl mb-3 border border-[#E4DDCE]" iconClassName="w-8 h-8" />
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
                <SelectField label={legacyCategory ? 'Category' : 'Category *'} value={form.categoryId} onChange={v => setForm(f => ({ ...f, categoryId: v, subcategoryId: '' }))} options={selectableCategories.map(c => ({ label: c.name, value: c.id }))} placeholder="Select category" />
                <SelectField label="Subcategory" value={form.subcategoryId} onChange={v => setForm(f => ({ ...f, subcategoryId: v }))} options={(activeCategory?.subcategories || []).map(s => ({ label: s.name, value: s.id }))} placeholder="Select subcategory" />
              </div>
              {legacyCategory && !form.categoryId && (
                <p className="text-[13px] text-[#B4471C] bg-[#FBEADF] rounded-xl p-3" role="note">
                  This product is in a category that has been removed from the shop, so buyers cannot see it. Leave the category empty to keep it exactly as it is, or choose a category to move it.
                </p>
              )}
              <TextField label="Model Number" value={form.modelNumber} onChange={v => setForm(f => ({ ...f, modelNumber: v }))} />
              <div>
                <TextField label="Image URL (optional)" placeholder="https://example.com/product-photo.jpg" value={form.imageUrl} onChange={v => { setUrlError(false); setForm(f => ({ ...f, imageUrl: v })); }} />
                <p className={`text-xs mt-1 ${urlError ? 'text-[#B4471C] font-semibold' : 'text-[#6B756F]'}`} role={urlError ? 'alert' : undefined}>
                  {urlError ? 'The link must start with https:// (or / for a file in the public folder).' : 'Paste a direct link to the photo. Leave empty to keep the coloured box.'}
                </p>
                {safeImageUrl(form.imageUrl) && (
                  <ProductImage imageUrl={form.imageUrl} imageColor="#E6F2EA" className="mt-2 w-28 h-28 rounded-xl border border-[#E4DDCE]" iconClassName="w-8 h-8" />
                )}
              </div>
              <fieldset>
                <legend className="text-sm font-medium text-[#1B2420] mb-1.5">Product Type</legend>
                <div className="grid grid-cols-2 gap-2">
                  {([['individual', 'Individual Product'], ['kit', 'Project Kit']] as [ProductType, string][]).map(([value, label]) => (
                    <label key={value} className={`flex items-center gap-2.5 h-11 px-3 rounded-xl border cursor-pointer text-sm font-medium ${form.productType === value ? 'border-[#0F5D3C] bg-[#E6F2EA] text-[#0F5D3C]' : 'border-[#E4DDCE] text-[#1B2420]'}`}>
                      <input type="radio" name="productType" value={value} checked={form.productType === value} onChange={() => { setLevelError(false); setForm(f => ({ ...f, productType: value })); }} className="accent-[#0F5D3C]" />
                      {label}
                    </label>
                  ))}
                </div>
              </fieldset>
              <fieldset>
                <legend className="text-sm font-medium text-[#1B2420] mb-1.5">
                  Educational Level {form.productType === 'kit' && <span className="text-[#B4471C]">*</span>}
                  <span className="font-normal text-[#55605A]"> — {form.productType === 'kit' ? 'required for Project Kits' : 'optional'}; you can choose more than one</span>
                </legend>
                <LevelPicker levels={educationalLevels} selected={form.educationalLevelIds} onChange={ids => { setLevelError(false); setForm(f => ({ ...f, educationalLevelIds: ids })); }} />
                <p className={`text-xs mt-1 ${levelError ? 'text-[#B4471C] font-semibold' : 'text-[#6B756F]'}`} role={levelError ? 'alert' : undefined}>
                  {levelError ? 'Please choose at least one educational level for a Project Kit.' : `${form.educationalLevelIds.length} selected`}
                </p>
              </fieldset>
              <TextAreaField label="Description" value={form.description} onChange={v => setForm(f => ({ ...f, description: v }))} />
              <TextAreaField label="Specifications" value={form.specifications} onChange={v => setForm(f => ({ ...f, specifications: v }))} hint="Use 'Key: Value | Key: Value' format" />
              <div className="grid grid-cols-2 gap-3">
                <SelectField label="Unit Type" value={form.unitType} onChange={v => setForm(f => ({ ...f, unitType: v as UnitType }))} options={UNIT_TYPES.map(u => ({ label: u, value: u }))} />
                <SelectField label="Availability" value={form.availability} onChange={v => setForm(f => ({ ...f, availability: v as AvailabilityStatus }))} options={AVAILABILITY.map(a => ({ label: a, value: a }))} />
              </div>
              <label className="flex items-center gap-2.5 pt-1"><input type="checkbox" checked={form.active} onChange={e => setForm(f => ({ ...f, active: e.target.checked }))} className="w-4 h-4 rounded accent-[#0F5D3C]" /><span className="text-sm text-[#1B2420]">Active (visible to buyers)</span></label>
              {formError && <p className="text-[13px] text-[#DC2626] font-semibold" role="alert">{formError}</p>}
              <button onClick={save} disabled={saving} className="w-full h-12 rounded-xl bg-[#0F5D3C] text-white font-bold text-sm hover:bg-[#0A4429] disabled:opacity-60 mt-2">{saving ? 'Saving…' : form.id ? 'Save Changes' : 'Add Product'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function TextField({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return <div><label className="text-sm font-medium text-[#1B2420] mb-1.5 block">{label}</label><input value={value} placeholder={placeholder} onChange={e => onChange(e.target.value)} className="w-full h-11 rounded-xl border border-[#E4DDCE] px-3.5 text-sm outline-none focus:ring-2 focus:ring-[#0F5D3C]/30 focus:border-[#0F5D3C]" /></div>;
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
