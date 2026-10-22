const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const BUYER_TOKEN_KEY = 'mzsource_buyer_token';
const ADMIN_TOKEN_KEY = 'mzsource_admin_token';

export function getBuyerToken(): string | null { return localStorage.getItem(BUYER_TOKEN_KEY); }
export function setBuyerToken(t: string | null) { t ? localStorage.setItem(BUYER_TOKEN_KEY, t) : localStorage.removeItem(BUYER_TOKEN_KEY); }
export function getAdminToken(): string | null { return localStorage.getItem(ADMIN_TOKEN_KEY); }
export function setAdminToken(t: string | null) { t ? localStorage.setItem(ADMIN_TOKEN_KEY, t) : localStorage.removeItem(ADMIN_TOKEN_KEY); }

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) { super(message); this.status = status; }
}

type AuthMode = 'buyer' | 'admin' | 'none';

async function request<T>(method: string, path: string, body?: unknown, authMode: AuthMode = 'none'): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (authMode === 'buyer') { const t = getBuyerToken(); if (t) headers['Authorization'] = `Bearer ${t}`; }
  else if (authMode === 'admin') { const t = getAdminToken(); if (t) headers['Authorization'] = `Bearer ${t}`; }

  const res = await fetch(`${API_BASE}${path}`, {
    method, headers, body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (res.status === 204) return undefined as T;
  let data: any = null;
  try { data = await res.json(); } catch { /* no body */ }

  if (!res.ok) {
    const message = data?.detail || `Request failed (${res.status})`;
    if (res.status === 401) {
      if (authMode === 'buyer') setBuyerToken(null);
      if (authMode === 'admin') setAdminToken(null);
    }
    throw new ApiError(typeof message === 'string' ? message : JSON.stringify(message), res.status);
  }
  return data as T;
}

export const api = {
  buyerAuth: {
    sendOtp: (mobile: string) => request<{ mobile: string; existingProfile: boolean; devOtp?: string }>('POST', '/api/buyer/auth/send-otp', { mobile }),
    verifyOtp: (mobile: string, otp: string) => request<{ accessToken: string; isNewProfile: boolean; customer: any }>('POST', '/api/buyer/auth/verify-otp', { mobile, otp }),
    createProfile: (payload: any) => request<{ accessToken: string; isNewProfile: boolean; customer: any }>('POST', '/api/buyer/auth/create-profile', payload),
  },
  adminAuth: {
    login: (username: string, password: string) => request<{ accessToken: string }>('POST', '/api/admin/auth/login', { username, password }),
    me: () => request<{ id: string; username: string }>('GET', '/api/admin/auth/me', undefined, 'admin'),
  },
  settings: {
    getPublic: () => request<any>('GET', '/api/settings/public'),
    getAdmin: () => request<any>('GET', '/api/admin/settings', undefined, 'admin'),
    update: (payload: any) => request<any>('PATCH', '/api/admin/settings', payload, 'admin'),
  },
  categories: {
    list: () => request<any[]>('GET', '/api/categories?active_only=false'),
    create: (payload: any) => request<any>('POST', '/api/categories', payload, 'admin'),
    update: (id: string, payload: any) => request<any>('PATCH', `/api/categories/${id}`, payload, 'admin'),
    remove: (id: string) => request<void>('DELETE', `/api/categories/${id}`, undefined, 'admin'),
    addSubcategory: (categoryId: string, name: string) => request('POST', `/api/categories/${categoryId}/subcategories`, { name, active: true }, 'admin'),
  },
  products: {
    list: () => request<any[]>('GET', '/api/products?active_only=false&limit=500'),
    create: (payload: any) => request<any>('POST', '/api/products', payload, 'admin'),
    update: (id: string, payload: any) => request<any>('PATCH', `/api/products/${id}`, payload, 'admin'),
    remove: (id: string) => request<void>('DELETE', `/api/products/${id}`, undefined, 'admin'),
  },
  buyerProfile: {
    get: () => request<any>('GET', '/api/buyer/profile', undefined, 'buyer'),
    update: (payload: any) => request<any>('PATCH', '/api/buyer/profile', payload, 'buyer'),
    addAddress: (payload: any) => request<any>('POST', '/api/buyer/profile/addresses', payload, 'buyer'),
    updateAddress: (id: string, payload: any) => request<any>('PATCH', `/api/buyer/profile/addresses/${id}`, payload, 'buyer'),
    removeAddress: (id: string) => request<void>('DELETE', `/api/buyer/profile/addresses/${id}`, undefined, 'buyer'),
  },
  adminCustomers: {
    list: () => request<any[]>('GET', '/api/admin/customers?limit=500', undefined, 'admin'),
  },
  buyerRequests: {
    submit: (payload: any) => request<any>('POST', '/api/buyer/requests', payload, 'buyer'),
    list: () => request<any[]>('GET', '/api/buyer/requests', undefined, 'buyer'),
    cancel: (id: string) => request<any>('POST', `/api/buyer/requests/${id}/cancel`, undefined, 'buyer'),
    confirmQuotation: (id: string) => request<any>('POST', `/api/buyer/requests/${id}/confirm-quotation`, undefined, 'buyer'),
  },
  adminRequests: {
    list: () => request<any[]>('GET', '/api/admin/requests?limit=500', undefined, 'admin'),
    updateStatus: (id: string, status: string, note?: string) => request<any>('PATCH', `/api/admin/requests/${id}/status`, { status, note }, 'admin'),
    createQuotation: (id: string, payload: any) => request<any>('POST', `/api/admin/requests/${id}/quotation`, payload, 'admin'),
    addNote: (id: string, text: string) => request('POST', `/api/admin/requests/${id}/notes`, { text }, 'admin'),
  },
  notifications: {
    buyerList: () => request<any[]>('GET', '/api/buyer/notifications', undefined, 'buyer'),
    buyerMarkRead: (id: string) => request<any>('POST', `/api/buyer/notifications/${id}/read`, undefined, 'buyer'),
    buyerMarkAllRead: () => request('POST', '/api/buyer/notifications/read-all', undefined, 'buyer'),
    adminList: () => request<any[]>('GET', '/api/admin/notifications', undefined, 'admin'),
    adminMarkRead: (id: string) => request<any>('POST', `/api/admin/notifications/${id}/read`, undefined, 'admin'),
    adminMarkAllRead: () => request('POST', '/api/admin/notifications/read-all', undefined, 'admin'),
  },
  customRequests: {
    submit: (payload: any) => request<any>('POST', '/api/buyer/custom-requests', payload, 'buyer'),
    listAll: () => request<any[]>('GET', '/api/admin/custom-requests', undefined, 'admin'),
    updateStatus: (id: string, status: string) => request<any>('PATCH', `/api/admin/custom-requests/${id}/status`, { status }, 'admin'),
  },
};
