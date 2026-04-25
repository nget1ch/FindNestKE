import { Navigate, Route, Routes, useParams } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import ProtectedRoute from './components/ProtectedRoute';
import ScrollToTop from './components/ScrollToTop';
import LandingPage from './pages/core/LandingPage';
import LoginPage from './pages/core/LoginPage';
import RegisterPage from './pages/core/RegisterPage';
import DashboardRedirect from './pages/core/DashboardRedirect';
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

import { useAutoLogout } from './hooks/useAutoLogout';

export default function App() {
  useAutoLogout();
  return (
    <div className="min-h-screen bg-background font-body text-on-background antialiased">
      <Toaster position="top-right" reverseOrder={false} />
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/dashboard" element={<DashboardRedirect />} />

        <Route path="/tenant" element={<ProtectedRoute allowedRoles={['tenant']}><TenantDashboardPage /></ProtectedRoute>} />
        <Route path="/tenant/chatbot" element={<ProtectedRoute allowedRoles={['tenant']}><ChatbotPage /></ProtectedRoute>} />
        <Route path="/tenant/booking/:id" element={<ProtectedRoute allowedRoles={['tenant']}><BookingPage /></ProtectedRoute>} />
        <Route path="/tenant/payment/:id" element={<ProtectedRoute allowedRoles={['tenant']}><PaymentPage /></ProtectedRoute>} />
        <Route path="/tenant/booking-confirmation/:id" element={<ProtectedRoute allowedRoles={['tenant']}><BookingConfirmationPage /></ProtectedRoute>} />
        <Route path="/tenant/payment-success" element={<ProtectedRoute allowedRoles={['tenant']}><PaymentSuccessPage /></ProtectedRoute>} />
        <Route path="/tenant/payment-failure" element={<ProtectedRoute allowedRoles={['tenant']}><PaymentFailurePage /></ProtectedRoute>} />

        <Route path="/seeker" element={<Navigate to="/tenant" replace />} />
        <Route path="/chatbot" element={<Navigate to="/tenant/chatbot" replace />} />
        <Route path="/booking/:id" element={<LegacyTenantBookingRedirect />} />
        <Route path="/payment/:id" element={<LegacyTenantPaymentRedirect />} />
        <Route path="/booking-confirmation/:id" element={<LegacyTenantConfirmationRedirect />} />

        <Route path="/listings" element={<ListingsPage />} />
        <Route path="/listings/:id" element={<ListingDetailsPage />} />
        <Route
          path="/landlord/listings/new"
          element={
            <ProtectedRoute allowedRoles={['landlord']}>
              <CreateListingPage />
            </ProtectedRoute>
          }
        />
        <Route path="/landlord" element={<ProtectedRoute allowedRoles={['landlord']}><LandlordDashboardPage /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboardPage /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}
