import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store';
import { normalizeStoredRole } from '../../lib/roles';

/**
 * DashboardRedirect - Routes users to their role-based dashboard
 * 
 * Handles:
 * - Unauthenticated users → /login
 * - Admin users → /admin
 * - Landlord users → /landlord
 * - Tenant users (default) → /tenant
 */
export default function DashboardRedirect() {
  const { isAuth, user } = useSelector((state: RootState) => state.auth);

  // Not authenticated - redirect to login
  if (!isAuth || !user) {
    return <Navigate to="/login" state={{ from: '/dashboard' }} replace />;
  }

  // Get normalized role (handles 'seeker' -> 'tenant' conversion)
  const userRole = normalizeStoredRole(user?.role);

  // Debug log to help track routing issues
  console.log('🔄 DashboardRedirect -> Stored User Role:', user?.role, '-> Normalized:', userRole);

  // Route based on role
  if (userRole === 'admin') {
    return <Navigate to="/admin" replace />;
  }

  if (userRole === 'landlord') {
    return <Navigate to="/landlord" replace />;
  }

  // Default to tenant dashboard
  return <Navigate to="/tenant" replace />;
}
