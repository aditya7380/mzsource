import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { api, getAdminToken, getBuyerToken, setAdminToken, setBuyerToken } from '../lib/api';
import type {
  Address, Category, CustomProductRequest, Customer, Notification, Product, Request, Settings,
} from '../data/appTypes';

const CART_KEY = 'mzsource_cart';

function loadCart(): { productId: string; quantity: number }[] {
  try { const raw = localStorage.getItem(CART_KEY); return raw ? JSON.parse(raw) : []; } catch { return []; }
}

interface AppContextValue {
  // data
  categories: Category[];
  products: Product[];
  customers: Customer[];
  requests: Request[];
  notifications: Notification[];
  customProductRequests: CustomProductRequest[];
  settings: Settings | null;

  // auth
  currentBuyer: Customer | null;
  adminLoggedIn: boolean;
  authLoading: boolean;

  // cart
  cart: { productId: string; quantity: number }[];
  addToCart: (productId: string, quantity: number) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;

  // getters
  getProduct: (id: string) => Product | undefined;
  getCategory: (id: string) => Category | undefined;
  getSubcategory: (categoryId: string, subId: string) => { id: string; name: string } | undefined;
  getBuyerRequests: () => Request[];
  getBuyerNotifications: () => Notification[];
  unreadBuyerNotifCount: () => number;
  unreadAdminNotifCount: () => number;
  getProductHistory: (productId: string) => { requestId: string; quantity: number; status: string; date: string }[];

  // buyer auth
  sendOtp: (mobile: string) => Promise<{ existingProfile: boolean; devOtp?: string }>;
  verifyOtp: (mobile: string, otp: string) => Promise<{ isNewProfile: boolean }>;
  createBuyerProfile: (payload: any) => Promise<void>;
  logoutBuyer: () => void;
  updateBuyerProfile: (payload: any) => Promise<void>;
  addAddress: (payload: any) => Promise<void>;
  updateAddress: (id: string, payload: any) => Promise<void>;
  deleteAddress: (id: string) => Promise<void>;

  // admin auth
  loginAdmin: (username: string, password: string) => Promise<boolean>;
  logoutAdmin: () => void;

  // requests
  submitRequest: (items: { productId: string; quantity: number }[], address: any) => Promise<Request>;
  cancelRequest: (id: string) => Promise<void>;
  confirmQuotation: (id: string) => Promise<void>;
  updateRequestStatus: (id: string, status: string, note?: string) => Promise<void>;
  createQuotation: (id: string, payload: any) => Promise<void>;
  addPrivateNote: (id: string, text: string) => Promise<void>;

  // notifications
  markNotificationRead: (id: string) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
  markAdminNotificationRead: (id: string) => Promise<void>;
  markAllAdminNotificationsRead: () => Promise<void>;

  // custom product requests
  submitCustomProductRequest: (payload: any) => Promise<void>;
  updateCustomRequestStatus: (id: string, status: string) => Promise<void>;

  // catalogue admin CRUD
  addProduct: (payload: any) => Promise<void>;
  updateProduct: (id: string, payload: any) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  addCategory: (payload: any) => Promise<void>;
  updateCategory: (id: string, payload: any) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  addSubcategory: (categoryId: string, name: string) => Promise<void>;

  // settings
  updateSettings: (payload: any) => Promise<void>;

  refreshCatalogue: () => Promise<void>;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [requests, setRequests] = useState<Request[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [customProductRequests, setCustomProductRequests] = useState<CustomProductRequest[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);

  const [currentBuyer, setCurrentBuyer] = useState<Customer | null>(null);
  const [adminLoggedIn, setAdminLoggedIn] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  const [cart, setCart] = useState(loadCart);

  useEffect(() => { localStorage.setItem(CART_KEY, JSON.stringify(cart)); }, [cart]);

  const refreshCatalogue = useCallback(async () => {
    const [cats, prods] = await Promise.all([api.categories.list(), api.products.list()]);
    setCategories(cats);
    setProducts(prods);
  }, []);

  const refreshPublicSettings = useCallback(async () => {
    try { setSettings(await api.settings.getPublic()); } catch { /* ignore */ }
  }, []);

  const refreshBuyerRequests = useCallback(async () => {
    try { setRequests(await api.buyerRequests.list()); } catch { /* ignore */ }
  }, []);

  const refreshBuyerNotifications = useCallback(async () => {
    try { setNotifications(await api.notifications.buyerList()); } catch { /* ignore */ }
  }, []);

  const refreshAdminRequests = useCallback(async () => {
    try { setRequests(await api.adminRequests.list()); } catch { /* ignore */ }
  }, []);

  const refreshAdminNotifications = useCallback(async () => {
    try { setNotifications(await api.notifications.adminList()); } catch { /* ignore */ }
  }, []);

  const refreshAdminCustomers = useCallback(async () => {
    try { setCustomers(await api.adminCustomers.list()); } catch { /* ignore */ }
  }, []);

  const refreshCustomProductRequests = useCallback(async () => {
    try { setCustomProductRequests(await api.customRequests.listAll()); } catch { /* ignore */ }
  }, []);

  // Bootstrap on mount
  useEffect(() => {
    (async () => {
      await Promise.all([refreshCatalogue(), refreshPublicSettings()]);

      const buyerToken = getBuyerToken();
      if (buyerToken) {
        try {
          const me = await api.buyerProfile.get();
          setCurrentBuyer(me);
          await Promise.all([refreshBuyerRequests(), refreshBuyerNotifications()]);
        } catch {
          setBuyerToken(null);
        }
      }

      const adminToken = getAdminToken();
      if (adminToken) {
        try {
          await api.adminAuth.me();
          setAdminLoggedIn(true);
          await Promise.all([refreshAdminRequests(), refreshAdminNotifications(), refreshAdminCustomers(), refreshCustomProductRequests()]);
        } catch {
          setAdminToken(null);
        }
      }

      setAuthLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---- cart ----
  const addToCart = useCallback((productId: string, quantity: number) => {
    setCart(prev => {
      const existing = prev.find(i => i.productId === productId);
      if (existing) return prev.map(i => i.productId === productId ? { ...i, quantity } : i);
      return [...prev, { productId, quantity }];
    });
  }, []);
  const updateCartQuantity = useCallback((productId: string, quantity: number) => {
    setCart(prev => quantity <= 0 ? prev.filter(i => i.productId !== productId) : prev.map(i => i.productId === productId ? { ...i, quantity } : i));
  }, []);
  const removeFromCart = useCallback((productId: string) => setCart(prev => prev.filter(i => i.productId !== productId)), []);
  const clearCart = useCallback(() => setCart([]), []);

  // ---- getters ----
  const getProduct = useCallback((id: string) => products.find(p => p.id === id), [products]);
  const getCategory = useCallback((id: string) => categories.find(c => c.id === id), [categories]);
  const getSubcategory = useCallback((categoryId: string, subId: string) => {
    const cat = categories.find(c => c.id === categoryId);
    return cat?.subcategories.find(s => s.id === subId);
  }, [categories]);
  const getBuyerRequests = useCallback(() => requests, [requests]);
  const getBuyerNotifications = useCallback(() => notifications, [notifications]);
  const unreadBuyerNotifCount = useCallback(() => notifications.filter(n => !n.read).length, [notifications]);
  const unreadAdminNotifCount = useCallback(() => notifications.filter(n => !n.read).length, [notifications]);

  const DISMISSED_KEY = 'mzsource_dismissed_history';
  const getProductHistory = useCallback((productId: string) => {
    let dismissed: string[] = [];
    try { dismissed = JSON.parse(localStorage.getItem(DISMISSED_KEY) || '[]'); } catch { /* ignore */ }
    const entries: { requestId: string; quantity: number; status: string; date: string }[] = [];
    for (const r of requests) {
      const item = r.items.find(i => i.productId === productId);
      if (item) {
        const key = `${r.id}:${productId}`;
        if (r.status === 'REJECTED' && dismissed.includes(key)) continue;
        entries.push({ requestId: r.id, quantity: item.quantity, status: r.status, date: r.submittedAt });
      }
    }
    return entries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [requests]);

  // ---- buyer auth ----
  const sendOtp = useCallback(async (mobile: string) => {
    const res = await api.buyerAuth.sendOtp(mobile);
    return { existingProfile: res.existingProfile, devOtp: res.devOtp };
  }, []);

  const verifyOtp = useCallback(async (mobile: string, otp: string) => {
    const res = await api.buyerAuth.verifyOtp(mobile, otp);
    if (!res.isNewProfile) {
      setBuyerToken(res.accessToken);
      setCurrentBuyer(res.customer);
      await Promise.all([refreshBuyerRequests(), refreshBuyerNotifications()]);
    }
    return { isNewProfile: res.isNewProfile };
  }, [refreshBuyerRequests, refreshBuyerNotifications]);

  const createBuyerProfile = useCallback(async (payload: any) => {
    const res = await api.buyerAuth.createProfile(payload);
    setBuyerToken(res.accessToken);
    setCurrentBuyer(res.customer);
    await Promise.all([refreshBuyerRequests(), refreshBuyerNotifications()]);
  }, [refreshBuyerRequests, refreshBuyerNotifications]);

  const logoutBuyer = useCallback(() => {
    setBuyerToken(null);
    setCurrentBuyer(null);
    setRequests([]);
    setNotifications([]);
  }, []);

  const updateBuyerProfile = useCallback(async (payload: any) => {
    const updated = await api.buyerProfile.update(payload);
    setCurrentBuyer(updated);
  }, []);

  const addAddress = useCallback(async (payload: any) => {
    await api.buyerProfile.addAddress(payload);
    setCurrentBuyer(await api.buyerProfile.get());
  }, []);
  const updateAddress = useCallback(async (id: string, payload: any) => {
    await api.buyerProfile.updateAddress(id, payload);
    setCurrentBuyer(await api.buyerProfile.get());
  }, []);
  const deleteAddress = useCallback(async (id: string) => {
    await api.buyerProfile.removeAddress(id);
    setCurrentBuyer(await api.buyerProfile.get());
  }, []);

  // ---- admin auth ----
  const loginAdmin = useCallback(async (username: string, password: string) => {
    try {
      const res = await api.adminAuth.login(username, password);
      setAdminToken(res.accessToken);
      setAdminLoggedIn(true);
      await Promise.all([refreshAdminRequests(), refreshAdminNotifications(), refreshAdminCustomers(), refreshCustomProductRequests()]);
      return true;
    } catch {
      return false;
    }
  }, [refreshAdminRequests, refreshAdminNotifications, refreshAdminCustomers, refreshCustomProductRequests]);

  const logoutAdmin = useCallback(() => {
    setAdminToken(null);
    setAdminLoggedIn(false);
    setRequests([]);
    setNotifications([]);
    setCustomers([]);
    setCustomProductRequests([]);
  }, []);

  // ---- requests ----
  const submitRequest = useCallback(async (items: { productId: string; quantity: number }[], address: any) => {
    const req = await api.buyerRequests.submit({ items, deliveryAddress: address });
    await refreshBuyerRequests();
    clearCart();
    return req;
  }, [refreshBuyerRequests, clearCart]);

  const cancelRequest = useCallback(async (id: string) => {
    await api.buyerRequests.cancel(id);
    await refreshBuyerRequests();
  }, [refreshBuyerRequests]);

  const confirmQuotation = useCallback(async (id: string) => {
    await api.buyerRequests.confirmQuotation(id);
    await refreshBuyerRequests();
  }, [refreshBuyerRequests]);

  const updateRequestStatus = useCallback(async (id: string, status: string, note?: string) => {
    await api.adminRequests.updateStatus(id, status, note);
    await refreshAdminRequests();
  }, [refreshAdminRequests]);

  const createQuotation = useCallback(async (id: string, payload: any) => {
    await api.adminRequests.createQuotation(id, payload);
    await refreshAdminRequests();
  }, [refreshAdminRequests]);

  const addPrivateNote = useCallback(async (id: string, text: string) => {
    await api.adminRequests.addNote(id, text);
    await refreshAdminRequests();
  }, [refreshAdminRequests]);

  // ---- notifications ----
  const markNotificationRead = useCallback(async (id: string) => {
    await api.notifications.buyerMarkRead(id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }, []);
  const markAllNotificationsRead = useCallback(async () => {
    await api.notifications.buyerMarkAllRead();
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);
  const markAdminNotificationRead = useCallback(async (id: string) => {
    await api.notifications.adminMarkRead(id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }, []);
  const markAllAdminNotificationsRead = useCallback(async () => {
    await api.notifications.adminMarkAllRead();
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  // ---- custom product requests ----
  const submitCustomProductRequest = useCallback(async (payload: any) => {
    await api.customRequests.submit(payload);
  }, []);
  const updateCustomRequestStatus = useCallback(async (id: string, status: string) => {
    await api.customRequests.updateStatus(id, status);
    await refreshCustomProductRequests();
  }, [refreshCustomProductRequests]);

  // ---- catalogue admin CRUD ----
  const addProduct = useCallback(async (payload: any) => { await api.products.create(payload); await refreshCatalogue(); }, [refreshCatalogue]);
  const updateProduct = useCallback(async (id: string, payload: any) => { await api.products.update(id, payload); await refreshCatalogue(); }, [refreshCatalogue]);
  const deleteProduct = useCallback(async (id: string) => { await api.products.remove(id); await refreshCatalogue(); }, [refreshCatalogue]);
  const addCategory = useCallback(async (payload: any) => { await api.categories.create({ ...payload, subcategories: [] }); await refreshCatalogue(); }, [refreshCatalogue]);
  const updateCategory = useCallback(async (id: string, payload: any) => { await api.categories.update(id, payload); await refreshCatalogue(); }, [refreshCatalogue]);
  const deleteCategory = useCallback(async (id: string) => { await api.categories.remove(id); await refreshCatalogue(); }, [refreshCatalogue]);
  const addSubcategory = useCallback(async (categoryId: string, name: string) => { await api.categories.addSubcategory(categoryId, name); await refreshCatalogue(); }, [refreshCatalogue]);

  const updateSettings = useCallback(async (payload: any) => {
    const updated = await api.settings.update(payload);
    setSettings(prev => ({ ...(prev as Settings), ...updated }));
  }, []);

  const value: AppContextValue = {
    categories, products, customers, requests, notifications, customProductRequests, settings,
    currentBuyer, adminLoggedIn, authLoading,
    cart, addToCart, updateCartQuantity, removeFromCart, clearCart,
    getProduct, getCategory, getSubcategory, getBuyerRequests, getBuyerNotifications,
    unreadBuyerNotifCount, unreadAdminNotifCount, getProductHistory,
    sendOtp, verifyOtp, createBuyerProfile, logoutBuyer, updateBuyerProfile, addAddress, updateAddress, deleteAddress,
    loginAdmin, logoutAdmin,
    submitRequest, cancelRequest, confirmQuotation, updateRequestStatus, createQuotation, addPrivateNote,
    markNotificationRead, markAllNotificationsRead, markAdminNotificationRead, markAllAdminNotificationsRead,
    submitCustomProductRequest, updateCustomRequestStatus,
    addProduct, updateProduct, deleteProduct, addCategory, updateCategory, deleteCategory, addSubcategory,
    updateSettings, refreshCatalogue,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
