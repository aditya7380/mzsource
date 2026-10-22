import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { LanguageProvider } from './i18n/LanguageContext';
import { CheckoutProvider } from './context/CheckoutContext';

import Landing from './pages/Landing';
import BuyerLayout from './components/buyer/BuyerLayout';
import BuyerAuth from './pages/buyer/BuyerAuth';
import BuyerHome from './pages/buyer/BuyerHome';
import Categories from './pages/buyer/Categories';
import ProductList from './pages/buyer/ProductList';
import ProductDetail from './pages/buyer/ProductDetail';
import SearchPage from './pages/buyer/Search';
import RequestCart from './pages/buyer/RequestCart';
import AddressSelect from './pages/buyer/AddressSelect';
import RequestReview from './pages/buyer/RequestReview';
import RequestSuccess from './pages/buyer/RequestSuccess';
import MyRequests from './pages/buyer/MyRequests';
import RequestDetail from './pages/buyer/RequestDetail';
import BuyerNotifications from './pages/buyer/BuyerNotifications';
import BuyerProfile from './pages/buyer/BuyerProfile';
import RequestProduct from './pages/buyer/RequestProduct';

import AdminLayout from './components/admin/AdminLayout';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminRequests from './pages/admin/AdminRequests';
import AdminRequestDetail from './pages/admin/AdminRequestDetail';
import AdminProducts from './pages/admin/AdminProducts';
import AdminCategories from './pages/admin/AdminCategories';
import AdminCustomers from './pages/admin/AdminCustomers';
import AdminQuotations from './pages/admin/AdminQuotations';
import AdminNotifications from './pages/admin/AdminNotifications';
import AdminAnalytics from './pages/admin/AdminAnalytics';
import AdminSettings from './pages/admin/AdminSettings';

export default function App() {
  return (
    <BrowserRouter>
      <LanguageProvider>
      <AppProvider>
        <CheckoutProvider>
          <Routes>
            <Route path="/" element={<Landing />} />

            {/* Buyer auth (no layout) */}
            <Route path="/buyer-app" element={<BuyerAuth />} />

            {/* Buyer app (protected by BuyerLayout's own guard) */}
            <Route element={<BuyerLayout />}>
              <Route path="/buyer-app/home" element={<BuyerHome />} />
              <Route path="/buyer-app/categories" element={<Categories />} />
              <Route path="/buyer-app/categories/:categoryId" element={<ProductList />} />
              <Route path="/buyer-app/products/:productId" element={<ProductDetail />} />
              <Route path="/buyer-app/search" element={<SearchPage />} />
              <Route path="/buyer-app/cart" element={<RequestCart />} />
              <Route path="/buyer-app/request/address" element={<AddressSelect />} />
              <Route path="/buyer-app/request/review" element={<RequestReview />} />
              <Route path="/buyer-app/request/success" element={<RequestSuccess />} />
              <Route path="/buyer-app/requests" element={<MyRequests />} />
              <Route path="/buyer-app/requests/:requestId" element={<RequestDetail />} />
              <Route path="/buyer-app/notifications" element={<BuyerNotifications />} />
              <Route path="/buyer-app/profile" element={<BuyerProfile />} />
              <Route path="/buyer-app/request-product" element={<RequestProduct />} />
            </Route>

            {/* Admin */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route element={<AdminLayout />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/requests" element={<AdminRequests />} />
              <Route path="/admin/requests/:requestId" element={<AdminRequestDetail />} />
              <Route path="/admin/customers" element={<AdminCustomers />} />
              <Route path="/admin/products" element={<AdminProducts />} />
              <Route path="/admin/categories" element={<AdminCategories />} />
              <Route path="/admin/quotations" element={<AdminQuotations />} />
              <Route path="/admin/notifications" element={<AdminNotifications />} />
              <Route path="/admin/analytics" element={<AdminAnalytics />} />
              <Route path="/admin/settings" element={<AdminSettings />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </CheckoutProvider>
      </AppProvider>
      </LanguageProvider>
    </BrowserRouter>
  );
}
