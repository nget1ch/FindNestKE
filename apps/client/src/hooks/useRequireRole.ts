import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import type { RootState } from '../store';
import type { AppRole } from '../lib/roles';
import { normalizeStoredRole } from '../lib/roles';

/**
 * useRequireRole - Hook to enforce role-based access in components
 * 
 * Usage:
 * const { hasRole, userRole, isAuthorized } = useRequireRole('landlord');
 * 
 * @param requiredRoles - Single role or array of allowed roles
 * @param options - { redirectTo: '/dashboard', shouldRedirect: true }
 */
export function useRequireRole(
  requiredRoles: AppRole | AppRole[],
  options?: { redirectTo?: string; shouldRedirect?: boolean }
) {
  const navigate = useNavigate();
  const { isAuth, user } = useSelector((state: RootState) => state.auth);

  const userRole = normalizeStoredRole((user as { role?: string } | null)?.role);
  const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
  const isAuthorized = isAuth && userRole && roles.includes(userRole);

  const { redirectTo = '/dashboard', shouldRedirect = true } = options || {};

  useEffect(() => {
    if (!isAuth) {
      // Not authenticated - redirect to login
      navigate('/login', { replace: true });
      return;
    }

    if (shouldRedirect && !isAuthorized) {
      // Authenticated but not authorized
      navigate(redirectTo, { replace: true });
    }
  }, [isAuth, isAuthorized, shouldRedirect, navigate, redirectTo]);

  return {
    hasRole: isAuthorized,
    userRole,
    isAuthorized,
    isAuth,
  };
}

/**
 * Hook to check if user has a specific role (without redirecting)
 */
export function useHasRole(requiredRoles: AppRole | AppRole[]): boolean {
  const { isAuth, user } = useSelector((state: RootState) => state.auth);
  const userRole = normalizeStoredRole((user as { role?: string } | null)?.role);
  const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];

  return isAuth && userRole !== undefined && roles.includes(userRole);
}

/**
 * Hook to get current user's role
 */
export function useUserRole(): AppRole | undefined {
  const { user } = useSelector((state: RootState) => state.auth);
  return normalizeStoredRole((user as { role?: string } | null)?.role);
}

/**
 * Hook to check if user is authenticated
 */
export function useIsAuthenticated(): boolean {
  const { isAuth } = useSelector((state: RootState) => state.auth);
  return isAuth;
}
