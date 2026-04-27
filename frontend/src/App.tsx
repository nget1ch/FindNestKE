import { Navigate, Route, Routes, useParams } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import ProtectedRoute from './components/ProtectedRoute';
import ScrollToTop from './components/ScrollToTop';
import LandingPage from './pages/core/LandingPage';
import LoginPage from './pages/core/LoginPage';
import RegisterPage from './pages/core/RegisterPage';
import DashboardRedirect from './pages/core/DashboardRedirect';
import AccessDeniedPage from './pages/core/AccessDeniedPage';
import TenantDashboardPage from './pages/core/TenantDashboardPage';
import ChatbotPage from './pages/core/ChatbotPage';
import ListingsPage from './pages/core/ListingsPage';
import ListingDetailsPage from './pages/core/ListingDetailsPage';
import BookingPage from './pages/core/BookingPage';
import PaymentPage from './pages/core/PaymentPage';
import BookingConfirmationPage from './pages/core/BookingConfirmationPage';
import PaymentSuccessPage from './pages/core/PaymentSuccessPage';
import PaymentFailurePage from './pages/core/PaymentFailurePage';
import LandlordDashboardPage from './pages/core/LandlordDashboardPage';
import CreateListingPage from './pages/core/CreateListingPage';
import AdminDashboardPage from './pages/core/AdminDashboardPage';
import PrivacyPolicyPage from './pages/core/PrivacyPolicyPage';
import ContactPage from './pages/core/ContactPage';
import { useAutoLogout } from './hooks/useAutoLogout';

function LegacyTenantBookingRedirect() {
  const { id } = useParams();
  return <Navigate to={`/tenant/booking/${id}`} replace />;
}

function LegacyTenantPaymentRedirect() {
  const { id } = useParams();
  return <Navigate to={`/tenant/payment/${id}`} replace />;
}

function LegacyTenantConfirmationRedirect() {
  const { id } = useParams();
  return <Navigate to={`/tenant/booking-confirmation/${id}`} replace />;
}

export default function App() {
  useAutoLogout();

  return (
    <div className="min-h-screen bg-background font-body text-on-background antialiased">
      <Toaster position="top-right" reverseOrder={false} />
      <ScrollToTop />
      <Routes>
        {/* ═══════════════════════════════════════════════════════════════════════ */}
        {/* PUBLIC ROUTES */}
        {/* ═══════════════════════════════════════════════════════════════════════ */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/listings" element={<ListingsPage />} />
        <Route path="/listings/:id" element={<ListingDetailsPage />} />
        <Route path="/privacy" element={<PrivacyPolicyPage />} />
        <Route path="/contact" element={<ContactPage />} />

        {/* ═══════════════════════════════════════════════════════════════════════ */}
        {/* ROLE-BASED DASHBOARD ROUTE */}
        {/* Routes to appropriate dashboard based on user role */}
        {/* ═══════════════════════════════════════════════════════════════════════ */}
        <Route path="/dashboard" element={<DashboardRedirect />} />

        {/* ═══════════════════════════════════════════════════════════════════════ */}
        {/* TENANT ROUTES - Protected by role 'tenant' */}
        {/* ═══════════════════════════════════════════════════════════════════════ */}
        <Route
          path="/tenant"
          element={
            <ProtectedRoute allowedRoles={['tenant']}>
              <TenantDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tenant/dashboard"
          element={
            <ProtectedRoute allowedRoles={['tenant']}>
              <TenantDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tenant/chatbot"
          element={
            <ProtectedRoute allowedRoles={['tenant']}>
              <ChatbotPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tenant/booking/:id"
          element={
            <ProtectedRoute allowedRoles={['tenant']}>
              <BookingPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tenant/payment/:id"
          element={
            <ProtectedRoute allowedRoles={['tenant']}>
              <PaymentPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tenant/booking-confirmation/:id"
          element={
            <ProtectedRoute allowedRoles={['tenant']}>
              <BookingConfirmationPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tenant/payment-success"
          element={
            <ProtectedRoute allowedRoles={['tenant']}>
              <PaymentSuccessPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tenant/payment-failure"
          element={
            <ProtectedRoute allowedRoles={['tenant']}>
              <PaymentFailurePage />
            </ProtectedRoute>
          }
        />

        {/* ═══════════════════════════════════════════════════════════════════════ */}
        {/* LANDLORD ROUTES - Protected by role 'landlord' */}
        {/* ═══════════════════════════════════════════════════════════════════════ */}
        <Route
          path="/landlord"
          element={
            <ProtectedRoute allowedRoles={['landlord']}>
              <LandlordDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/landlord/dashboard"
          element={
            <ProtectedRoute allowedRoles={['landlord']}>
              <LandlordDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/landlord/listings/new"
          element={
            <ProtectedRoute allowedRoles={['landlord']}>
              <CreateListingPage />
            </ProtectedRoute>
          }
        />

        {/* ═══════════════════════════════════════════════════════════════════════ */}
        {/* ADMIN ROUTES - Protected by role 'admin' */}
        {/* ═══════════════════════════════════════════════════════════════════════ */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboardPage />
            </ProtectedRoute>
          }
        />

        {/* ═══════════════════════════════════════════════════════════════════════ */}
        {/* LEGACY REDIRECTS & ERROR PAGES */}
        {/* ═══════════════════════════════════════════════════════════════════════ */}
        <Route path="/access-denied" element={<AccessDeniedPage />} />
        <Route path="/seeker" element={<Navigate to="/tenant" replace />} />
        <Route path="/chatbot" element={<Navigate to="/tenant/chatbot" replace />} />
        <Route path="/booking/:id" element={<LegacyTenantBookingRedirect />} />
        <Route path="/payment/:id" element={<LegacyTenantPaymentRedirect />} />
        <Route path="/booking-confirmation/:id" element={<LegacyTenantConfirmationRedirect />} />

        {/* ═══════════════════════════════════════════════════════════════════════ */}
        {/* CATCH-ALL - 404 NOT FOUND */}
        {/* ═══════════════════════════════════════════════════════════════════════ */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}
