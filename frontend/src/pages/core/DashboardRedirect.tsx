import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store';
import { normalizeStoredRole } from '../../lib/roles';

export default function DashboardRedirect() {
  const { isAuth, user } = useSelector((state: RootState) => state.auth);
  if (!isAuth) {
    return <Navigate to="/login" state={{ from: window.location.pathname }} replace />;
  }
  const r = normalizeStoredRole(user?.role);
  if (r === 'admin') return <Navigate to="/admin" replace />;
  if (r === 'landlord') return <Navigate to="/landlord" replace />;
  return <Navigate to="/tenant" replace />;
}
