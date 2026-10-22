import React, { createContext, useContext, useState } from 'react';

interface AddressSnapshot {
  label: string; building: string; street: string; locality: string; sector: string;
  city: string; district: string; state: string; pinCode: string; landmark: string;
  lat?: number | null; lng?: number | null;
}

interface CheckoutValue {
  address: AddressSnapshot | null;
  setAddress: (a: AddressSnapshot | null) => void;
}

const CheckoutContext = createContext<CheckoutValue | null>(null);

export function CheckoutProvider({ children }: { children: React.ReactNode }) {
  const [address, setAddress] = useState<AddressSnapshot | null>(null);
  return <CheckoutContext.Provider value={{ address, setAddress }}>{children}</CheckoutContext.Provider>;
}

export function useCheckout() {
  const ctx = useContext(CheckoutContext);
  if (!ctx) throw new Error('useCheckout must be used within CheckoutProvider');
  return ctx;
}
