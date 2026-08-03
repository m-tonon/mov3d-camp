export type AdminRole = 'admin' | 'guest';

const ADMIN_ROLE_KEY = 'admin-role';
const ADMIN_AUTH_KEY = 'admin-auth';

export function setAdminSession(role: AdminRole): void {
  sessionStorage.setItem(ADMIN_AUTH_KEY, 'true');
  sessionStorage.setItem(ADMIN_ROLE_KEY, role);
}

function normalizeStoredRole(raw: string | null): AdminRole | null {
  if (raw === 'admin' || raw === 'staff') return 'admin';
  if (raw === 'guest' || raw === 'ebd') return 'guest';
  return null;
}

export function getAdminRole(): AdminRole | null {
  if (typeof window === 'undefined') return null;
  const role = normalizeStoredRole(sessionStorage.getItem(ADMIN_ROLE_KEY));
  if (role) return role;
  if (sessionStorage.getItem(ADMIN_AUTH_KEY) === 'true') return 'admin';
  return null;
}

export function clearAdminSession(): void {
  sessionStorage.removeItem(ADMIN_AUTH_KEY);
  sessionStorage.removeItem(ADMIN_ROLE_KEY);
}

export function defaultPathForRole(_role: AdminRole): string {
  return '/admin';
}

export function isPathAllowedForRole(pathname: string, _role: AdminRole): boolean {
  if (pathname === '/admin/login') return true;
  return pathname === '/admin' || pathname.startsWith('/admin/');
}

export function resolveRedirectPath(
  from: string | null,
  role: AdminRole,
): string {
  if (from && from !== '/admin/login' && isPathAllowedForRole(from, role)) {
    return from;
  }
  return defaultPathForRole(role);
}
