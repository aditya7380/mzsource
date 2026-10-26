import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, LocateFixed, Home as HomeIcon, Building2, Plus, Check } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useCheckout } from '../../context/CheckoutContext';

interface FormState {
  label: string; building: string; street: string; locality: string; sector: string;
  city: string; district: string; state: string; pinCode: string; landmark: string;
  lat: number | null; lng: number | null;
}
const emptyForm: FormState = { label: 'Home', building: '', street: '', locality: '', sector: '', city: '', district: '', state: 'Mizoram', pinCode: '', landmark: '', lat: null, lng: null };

export default function AddressSelect() {
  const navigate = useNavigate();
  const { currentBuyer } = useApp();
  const { setAddress } = useCheckout();
  const [mode, setMode] = useState<'list' | 'new'>(currentBuyer && currentBuyer.addresses.length > 0 ? 'list' : 'new');
  const [selectedId, setSelectedId] = useState<string | null>(currentBuyer?.addresses.find(a => a.isDefault)?.id || currentBuyer?.addresses[0]?.id || null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [locating, setLocating] = useState(false);
  const [locLabel, setLocLabel] = useState('');
  const [error, setError] = useState('');

  function update<K extends keyof FormState>(key: K, value: FormState[K]) { setForm(f => ({ ...f, [key]: value })); }

 
  async function useCurrentLocation() {
    setError('');

    if (!window.isSecureContext) {
      setError('Location requires HTTPS or localhost.');
      return;
    }

    if (!navigator.geolocation) {
      setError('Location is not supported by this browser.');
      return;
    }

    setLocating(true);

    try {
      const position: GeolocationPosition = await new Promise(
        (resolve, reject) => {
          navigator.geolocation.getCurrentPosition(
            resolve,
            reject,
            {
              enableHighAccuracy: true,
              timeout: 20000,
              maximumAge: 0,
            },
          );
        },
      );

      const lat = position.coords.latitude;
      const lng = position.coords.longitude;

      // GPS coordinates turant existing form mein save karo.
      setForm((previous) => ({
        ...previous,
        lat,
        lng,
      }));

      setLocLabel(`${lat.toFixed(5)}, ${lng.toFixed(5)}`);

      // Coordinates ko readable address mein convert karo.
      const url = new URL(
        'https://nominatim.openstreetmap.org/reverse',
      );

      url.searchParams.set('format', 'jsonv2');
      url.searchParams.set('lat', String(lat));
      url.searchParams.set('lon', String(lng));
      url.searchParams.set('addressdetails', '1');

      const response = await fetch(url.toString(), {
        headers: {
          Accept: 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(
          'GPS location mil gayi, lekin address lookup fail hua. Address manually check karo.',
        );
      }

      const result: {
        address?: Record<string, string | undefined>;
      } = await response.json();

      const a = result.address;

      if (!a) {
        throw new Error(
          'Address details nahi mile. Apna address manually fill karo.',
        );
      }

      // Existing form ke fields update karo.
      setForm((previous) => ({
        ...previous,
        lat,
        lng,
        building: a.house_number || previous.building,
        street:
          a.road ||
          a.pedestrian ||
          a.footway ||
          previous.street,
        locality:
          a.neighbourhood ||
          a.suburb ||
          a.residential ||
          previous.locality,
        city:
          a.city ||
          a.town ||
          a.village ||
          a.municipality ||
          a.city_district ||
          previous.city,
        district:
          a.state_district ||
          a.district ||
          a.county ||
          previous.district,
        state: a.state || previous.state,
        pinCode: a.postcode || previous.pinCode,
      }));

      setError('');
    } catch (error: unknown) {
      const locationError = error as {
        code?: number;
        message?: string;
      };

      if (typeof locationError.code === 'number') {
        if (locationError.code === 1) {
          setError(
            'Location permission denied. Browser settings mein location allow karo.',
          );
        } else if (locationError.code === 3) {
          setError('Location request timed out. Dobara try karo.');
        } else {
          setError(
            'Current location nahi mil paayi. Device location settings check karo.',
          );
        }
      } else {
        setError(
          locationError.message ||
            'Address lookup fail hua. Address manually fill karo.',
        );
      }
    } finally {
      setLocating(false);
    }
  }


  function continueWithSelected() {
    const saved = currentBuyer?.addresses.find(a => a.id === selectedId);
    if (!saved) return setError('Please select an address');
    setAddress(saved);
    navigate('/buyer-app/request/review');
  }
  function continueWithNew() {
    if (!form.city.trim() || !form.pinCode.trim()) return setError('Please fill in at least city and PIN code');
    setAddress(form);
    navigate('/buyer-app/request/review');
  }

  return (
    <div className="max-w-2xl mx-auto px-5 md:px-8 py-6 pb-28">
      <h1 className="text-xl md:text-2xl font-extrabold text-[#1B2420] mb-6">Delivery Address</h1>

      {mode === 'list' && currentBuyer && (
        <>
          <div className="space-y-3 mb-4">
            {currentBuyer.addresses.map(addr => (
              <button key={addr.id} onClick={() => setSelectedId(addr.id)}
                className={`w-full text-left flex items-start gap-3 rounded-2xl border-2 p-4 transition-colors ${selectedId === addr.id ? 'border-[#0F5D3C] bg-[#E6F2EA]' : 'border-[#E4DDCE] bg-white'}`}>
                <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center flex-shrink-0 border border-[#E4DDCE]">
                  {addr.label.toLowerCase().includes('home') ? <HomeIcon className="w-4 h-4 text-[#0F5D3C]" /> : <Building2 className="w-4 h-4 text-[#0F5D3C]" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-[#1B2420]">{addr.label}</p>
                  <p className="text-[13px] text-[#55605A] mt-0.5 leading-snug">{[addr.building, addr.street, addr.locality, addr.city, addr.state, addr.pinCode].filter(Boolean).join(', ')}</p>
                </div>
                {selectedId === addr.id && <Check className="w-5 h-5 text-[#0F5D3C] flex-shrink-0" />}
              </button>
            ))}
          </div>
          <button onClick={() => setMode('new')} className="w-full flex items-center gap-2 justify-center h-12 rounded-xl border border-dashed border-[#0F5D3C] text-[#0F5D3C] font-semibold text-sm hover:bg-[#E6F2EA]">
            <Plus className="w-4 h-4" /> Add New Address
          </button>
        </>
      )}

      {mode === 'new' && (
        <div className="flex flex-col gap-4">
          <button type="button" onClick={useCurrentLocation} disabled={locating}
            className="w-full flex items-center gap-3 rounded-2xl border border-[#0F5D3C]/30 bg-[#E6F2EA] p-4 hover:bg-[#CFE5D8] transition-colors disabled:opacity-60">
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center flex-shrink-0"><LocateFixed className={`w-5 h-5 text-[#0F5D3C] ${locating ? 'animate-pulse' : ''}`} /></div>
            <div className="flex-1 text-left">
              <p className="text-sm font-bold text-[#0F5D3C]">{locating ? 'Getting your location…' : 'Use Current Location'}</p>
              {locLabel && <p className="text-[11px] text-[#55605A] mt-0.5">Pinned at {locLabel}</p>}
            </div>
            <MapPin className="w-5 h-5 text-[#0F5D3C] flex-shrink-0" />
          </button>

          <div className="grid md:grid-cols-2 gap-4">
            <Field label="Address Label" value={form.label} onChange={v => update('label', v)} placeholder="Home, Shop, Office…" />
            <Field label="Building / House No." value={form.building} onChange={v => update('building', v)} />
            <Field label="Street" value={form.street} onChange={v => update('street', v)} />
            <Field label="Locality" value={form.locality} onChange={v => update('locality', v)} />
            <Field label="Sector / Veng" value={form.sector} onChange={v => update('sector', v)} />
            <Field label="City *" value={form.city} onChange={v => update('city', v)} />
            <Field label="District" value={form.district} onChange={v => update('district', v)} />
            <Field label="State" value={form.state} onChange={v => update('state', v)} />
            <Field label="PIN Code *" value={form.pinCode} onChange={v => update('pinCode', v.replace(/\D/g, ''))} />
            <Field label="Landmark" value={form.landmark} onChange={v => update('landmark', v)} placeholder="Near…" />
          </div>

          {currentBuyer && currentBuyer.addresses.length > 0 && (
            <button onClick={() => setMode('list')} className="text-sm font-semibold text-[#0F5D3C] text-center py-1">Choose a saved address instead</button>
          )}
        </div>
      )}

      {error && <p className="text-sm text-[#DC2626] mt-4">{error}</p>}

      <div className="fixed bottom-16 md:bottom-0 left-0 right-0 z-30 bg-white border-t border-[#E4DDCE]">
        <div className="max-w-2xl mx-auto px-5 md:px-8 py-3.5">
          <button onClick={mode === 'list' ? continueWithSelected : continueWithNew} className="w-full h-12 rounded-xl bg-[#0F5D3C] text-white font-bold text-[15px] hover:bg-[#0A4429] transition-colors">
            Continue to Review
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div>
      <label className="text-sm font-medium text-[#1B2420] mb-1.5 block">{label}</label>
      <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className="w-full h-12 rounded-xl border border-[#E4DDCE] bg-white px-3.5 text-[15px] outline-none focus:ring-2 focus:ring-[#0F5D3C]/30 focus:border-[#0F5D3C]" />
    </div>
  );
}
