import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';
import type { AppRole } from '../lib/roles';
import { normalizeStoredRole } from '../lib/roles';

export default function ProtectedRoute({
  children,
  allowedRoles,
}: {
  children: ReactNode;
  allowedRoles?: AppRole[];
}) {
  const { isAuth, user } = useSelector((state: RootState) => state.auth);
  const role = normalizeStoredRole((user as { role?: string } | null)?.role);

  if (!isAuth) {
    const from = window.location.pathname + window.location.search;
    return <Navigate to="/login" state={{ from }} replace />;
  }

  if (allowedRoles?.length && role && !allowedRoles.includes(role)) {
    return <Navigate to="/dashboard" replace />;
  }

  if (allowedRoles?.length && !role) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
