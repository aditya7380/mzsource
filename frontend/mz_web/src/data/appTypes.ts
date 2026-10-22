export type CustomerType = 'Student' | 'Teacher' | 'Shopkeeper' | 'School/College' | 'Business' | 'Individual' | 'Other';
export type UnitType = 'Piece' | 'Pack' | 'Set' | 'Box' | 'Pair' | 'Roll' | 'Packet' | 'Dozen' | 'Kilogram';
export type AvailabilityStatus = 'In Stock' | 'Limited Stock' | 'Out of Stock' | 'On Request';
export type RequestStatus = 'PENDING' | 'SELECTED' | 'CONFIRMED' | 'REJECTED' | 'CANCELLED' | 'COMPLETED';

export interface Subcategory {
  id: string;
  categoryId: string;
  name: string;
  active: boolean;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  bgColor: string;
  subcategories: Subcategory[];
  active: boolean;
}

export interface Product {
  id: string;
  name: string;
  categoryId: string;
  subcategoryId: string;
  modelNumber: string;
  description: string;
  specifications: string;
  unitType: UnitType;
  availability: AvailabilityStatus;
  imageColor: string;
  active: boolean;
  createdAt: string;
}

export interface Address {
  id: string;
  label: string;
  building: string;
  street: string;
  locality: string;
  sector: string;
  city: string;
  district: string;
  state: string;
  pinCode: string;
  landmark: string;
  lat?: number | null;
  lng?: number | null;
  isDefault: boolean;
}

export interface Customer {
  id: string;
  fullName: string;
  mobile: string;
  customerType: CustomerType;
  businessName: string;
  addresses: Address[];
  createdAt: string;
}

export interface CartItem {
  productId: string;
  quantity: number;
}

export interface RequestItem {
  productId: string;
  productName: string;
  modelNumber: string;
  quantity: number;
  unitType: UnitType;
}

export interface QuotationItem {
  productId: string;
  productName: string;
  quantity: number;
  unitType: string;
  unitPrice: number;
  total: number;
}

export interface Quotation {
  items: QuotationItem[];
  subtotal: number;
  otherCharges: number;
  otherChargesNote: string;
  totalAmount: number;
  validityDays: number;
  adminMessage: string;
  createdAt: string;
}

export interface StatusHistoryEntry {
  status: RequestStatus;
  timestamp: string;
  note: string;
}

export interface PrivateNote {
  id: string;
  text: string;
  createdAt: string;
}

export interface SupplierInfo {
  supplierName: string;
  supplierContact: string;
  supplierCost: number;
  transportCost: number;
  packagingCost: number;
  otherCost: number;
  margin: number;
  finalPrice: number;
}

export interface Request {
  id: string;
  customerId: string;
  customerName: string;
  customerMobile: string;
  customerType: CustomerType;
  businessName: string;
  deliveryAddress: Address;
  items: RequestItem[];
  status: RequestStatus;
  statusHistory: StatusHistoryEntry[];
  submittedAt: string;
  quotation?: Quotation;
  privateNotes: PrivateNote[];
  supplierInfo?: SupplierInfo;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: string;
  requestId?: string;
  isAdmin: boolean;
}

export interface CustomProductRequest {
  id: string;
  customerId: string;
  customerName: string;
  productName: string;
  requiredQuantity: string;
  description: string;
  submittedAt: string;
  status: 'new' | 'reviewed';
}

export interface Settings {
  businessName: string;
  tagline: string;
  phone: string;
  email: string;
  address: string;
  operatingArea: string;
}

export const CUSTOMER_TYPES: CustomerType[] = ['Student', 'Teacher', 'Shopkeeper', 'School/College', 'Business', 'Individual', 'Other'];
export const UNIT_TYPES: UnitType[] = ['Piece', 'Pack', 'Set', 'Box', 'Pair', 'Roll', 'Packet', 'Dozen', 'Kilogram'];

export function getStatusColor(status: RequestStatus): string {
  switch (status) {
    case 'PENDING': return '#F59E0B';
    case 'SELECTED': return '#2F80ED';
    case 'CONFIRMED': return '#16A34A';
    case 'REJECTED': return '#DC2626';
    case 'CANCELLED': return '#6B7280';
    case 'COMPLETED': return '#155EEF';
    default: return '#6B7280';
  }
}

export function getStatusBg(status: RequestStatus): string {
  switch (status) {
    case 'PENDING': return '#FEF3C7';
    case 'SELECTED': return '#DBEAFE';
    case 'CONFIRMED': return '#DCFCE7';
    case 'REJECTED': return '#FEE2E2';
    case 'CANCELLED': return '#F3F4F6';
    case 'COMPLETED': return '#EEF4FF';
    default: return '#F3F4F6';
  }
}
