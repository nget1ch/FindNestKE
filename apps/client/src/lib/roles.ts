export type AppRole = 'tenant' | 'landlord' | 'admin';

/** Normalize API / legacy JWT values for routing and guards */
export function normalizeStoredRole(role: string | undefined): AppRole | undefined {
  if (!role) return undefined;
  if (role === 'seeker') return 'tenant';
  if (role === 'tenant' || role === 'landlord' || role === 'admin') return role;
  return undefined;
}
