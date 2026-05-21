import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';
import type { AppRole } from '../lib/roles';
import { normalizeStoredRole } from '../lib/roles';

/**
 * ProtectedRoute - Guards routes based on authentication and role authorization
 * 
 * Features:
 * - Redirects unauthenticated users to /login
 * - Checks user role against allowedRoles
 * - Redirects unauthorized users to /dashboard (role-based redirect)
 * - Preserves attempted path for post-login redirect
 */
export default function ProtectedRoute({
  children,
  allowedRoles,
}: {
  children: ReactNode;
  allowedRoles?: AppRole[];
}) {
  const { isAuth, user } = useSelector((state: RootState) => state.auth);
  const role = normalizeStoredRole((user as { role?: string } | null)?.role);

  // 1. User not authenticated - redirect to login
  if (!isAuth || !user) {
    const from = window.location.pathname + window.location.search;
    return <Navigate to="/login" state={{ from }} replace />;
  }

  // 2. User has no valid role - redirect to login
  if (!role) {
    return <Navigate to="/login" replace />;
  }

  // 3. Route has role restrictions - check authorization
  if (allowedRoles && allowedRoles.length > 0) {
    if (!allowedRoles.includes(role)) {
      // User is authenticated but not authorized for this route
      return <Navigate to="/access-denied" replace />;
    }
  }

  // 4. All checks passed - render children
  return children;
}
