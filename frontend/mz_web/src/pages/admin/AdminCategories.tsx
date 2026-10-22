import React, { useState } from 'react';
import { Boxes, Cpu, Package, GraduationCap, Edit2, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';

const ICONS: Record<string, React.ElementType> = { cpu: Cpu, package: Package, 'graduation-cap': GraduationCap };

interface FormState { id?: string; name: string; description: string; icon: string; color: string; bgColor: string; active: boolean }
const emptyForm: FormState = { name: '', description: '', icon: 'package', color: '#0F5D3C', bgColor: '#E6F2EA', active: true };

export default function AdminCategories() {
  const { categories, addCategory, updateCategory, addSubcategory } = useApp();
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [newSubName, setNewSubName] = useState<Record<string, string>>({});

  function openNew() { setForm(emptyForm); setModalOpen(true); }
  function openEdit(c: typeof categories[number]) { setForm({ id: c.id, name: c.name, description: c.description, icon: c.icon, color: c.color, bgColor: c.bgColor, active: c.active }); setModalOpen(true); }

  async function save() {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      const payload = { name: form.name.trim(), description: form.description, icon: form.icon, color: form.color, bgColor: form.bgColor, active: form.active };
      if (form.id) await updateCategory(form.id, payload); else await addCategory(payload);
      setModalOpen(false);
    } finally { setSaving(false); }
  }
  async function handleAddSub(categoryId: string) {
    const name = newSubName[categoryId]?.trim();
    if (!name) return;
    await addSubcategory(categoryId, name);
    setNewSubName(s => ({ ...s, [categoryId]: '' }));
  }

  return (
    <div className="px-5 lg:px-8 py-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-xl lg:text-2xl font-extrabold text-[#1B2420]">Categories</h1>
        <button onClick={openNew} className="h-10 px-4 rounded-xl bg-[#0F5D3C] text-white font-bold text-sm hover:bg-[#0A4429]">+ Add Category</button>
      </div>
      <p className="text-sm text-[#55605A] mb-5">{categories.length} categories</p>

      <div className="grid lg:grid-cols-2 gap-4">
        {categories.map(cat => {
          const Icon = ICONS[cat.icon] || Boxes;
          return (
            <div key={cat.id} className="bg-white rounded-2xl border border-[#E4DDCE] p-5">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: cat.bgColor }}><Icon className="w-5 h-5" style={{ color: cat.color }} /></div>
                <div className="flex-1 min-w-0"><p className="font-bold text-[#1B2420] text-[15px]">{cat.name}</p><p className="text-xs text-[#55605A] line-clamp-1">{cat.description}</p></div>
                <button onClick={() => openEdit(cat)} className="w-8 h-8 flex items-center justify-center rounded-lg text-[#0F5D3C] hover:bg-[#E6F2EA] flex-shrink-0"><Edit2 className="w-4 h-4" /></button>
              </div>
              <div className="flex flex-wrap gap-1.5 mb-3">{cat.subcategories.map(sub => <span key={sub.id} className="text-[11.5px] font-medium text-[#55605A] bg-gray-100 px-2.5 py-1 rounded-full">{sub.name}</span>)}</div>
              <div className="flex gap-2">
                <input value={newSubName[cat.id] || ''} onChange={e => setNewSubName(s => ({ ...s, [cat.id]: e.target.value }))} placeholder="New subcategory name" className="flex-1 h-9 rounded-lg border border-[#E4DDCE] px-3 text-[13px] outline-none focus:ring-2 focus:ring-[#0F5D3C]/30 focus:border-[#0F5D3C]" />
                <button onClick={() => handleAddSub(cat.id)} className="h-9 px-3 rounded-lg bg-[#E6F2EA] text-[#0F5D3C] text-[13px] font-semibold hover:bg-[#CFE5D8]">Add</button>
              </div>
            </div>
          );
        })}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-[90] flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setModalOpen(false)} />
          <div className="relative bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-md max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white flex items-center justify-between px-5 h-14 border-b border-[#E4DDCE]"><h3 className="font-bold text-[#1B2420]">{form.id ? 'Edit Category' : 'Add Category'}</h3><button onClick={() => setModalOpen(false)} className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100"><X className="w-5 h-5" /></button></div>
            <div className="p-5 space-y-3.5">
              <div><label className="text-sm font-medium text-[#1B2420] mb-1.5 block">Category Name *</label><input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="w-full h-11 rounded-xl border border-[#E4DDCE] px-3.5 text-sm outline-none focus:ring-2 focus:ring-[#0F5D3C]/30 focus:border-[#0F5D3C]" /></div>
              <div><label className="text-sm font-medium text-[#1B2420] mb-1.5 block">Description</label><textarea rows={2} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="w-full rounded-xl border border-[#E4DDCE] px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#0F5D3C]/30 focus:border-[#0F5D3C] resize-none" /></div>
              <label className="flex items-center gap-2.5"><input type="checkbox" checked={form.active} onChange={e => setForm(f => ({ ...f, active: e.target.checked }))} className="w-4 h-4 rounded accent-[#0F5D3C]" /><span className="text-sm text-[#1B2420]">Active</span></label>
              <button onClick={save} disabled={saving} className="w-full h-12 rounded-xl bg-[#0F5D3C] text-white font-bold text-sm hover:bg-[#0A4429] disabled:opacity-60 mt-2">{saving ? 'Saving…' : form.id ? 'Save Changes' : 'Add Category'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
