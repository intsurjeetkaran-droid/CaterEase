import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import useAuthStore from './store/authStore'

// Layout
import AppLayout from './components/layout/AppLayout'
import PublicNavbar from './components/layout/PublicNavbar'
import ProtectedRoute from './components/common/ProtectedRoute'

// Public pages
import Landing from './pages/Landing'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'

// Customer pages
import CustomerDashboard from './pages/customer/Dashboard'
import Providers from './pages/customer/Providers'
import ProviderMenus from './pages/customer/ProviderMenus'
import MyOrders from './pages/customer/MyOrders'

// Caterer (provider) pages
import CatererDashboard from './pages/caterer/Dashboard'
import ManageMenus from './pages/caterer/ManageMenus'
import CatererOrders from './pages/caterer/Orders'
import PaymentSettings from './pages/caterer/PaymentSettings'

// Owner (admin) pages
import OwnerDashboard from './pages/owner/Dashboard'
import OwnerUsers from './pages/owner/Users'
import OwnerOrders from './pages/owner/Orders'

function PublicLayout({ children }) {
  return (
    <>
      <PublicNavbar />
      {children}
    </>
  )
}

function App() {
  const { token, fetchMe } = useAuthStore()

  useEffect(() => {
    if (token) fetchMe()
  }, [token, fetchMe])

  return (
    <BrowserRouter>
      <Routes>
        {/* ── Public routes (with top navbar) ── */}
        <Route path="/" element={<PublicLayout><Landing /></PublicLayout>} />
        <Route path="/login" element={<PublicLayout><Login /></PublicLayout>} />
        <Route path="/register" element={<PublicLayout><Register /></PublicLayout>} />

        {/* ── Customer routes (sidebar layout) ── */}
        <Route element={<ProtectedRoute role="customer" />}>
          <Route element={<AppLayout />}>
            <Route path="/customer" element={<CustomerDashboard />} />
            <Route path="/customer/providers" element={<Providers />} />
            <Route path="/customer/providers/:providerId/menus" element={<ProviderMenus />} />
            <Route path="/customer/orders" element={<MyOrders />} />
          </Route>
        </Route>

        {/* ── Caterer routes (sidebar layout) ── */}
        <Route element={<ProtectedRoute role="caterer" />}>
          <Route element={<AppLayout />}>
            <Route path="/caterer" element={<CatererDashboard />} />
            <Route path="/caterer/menus" element={<ManageMenus />} />
            <Route path="/caterer/orders" element={<CatererOrders />} />
            <Route path="/caterer/payment-settings" element={<PaymentSettings />} />
          </Route>
        </Route>

        {/* ── Owner (admin) routes (sidebar layout) ── */}
        <Route element={<ProtectedRoute role="owner" />}>
          <Route element={<AppLayout />}>
            <Route path="/owner" element={<OwnerDashboard />} />
            <Route path="/owner/users" element={<OwnerUsers />} />
            <Route path="/owner/orders" element={<OwnerOrders />} />
          </Route>
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
