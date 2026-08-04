const ADMIN_AUTH_KEY = 'admin-auth';

export function setAdminSession(): void {
  sessionStorage.setItem(ADMIN_AUTH_KEY, 'true');
}

export function isAdminAuthenticated(): boolean {
  if (typeof window === 'undefined') return false;
  return sessionStorage.getItem(ADMIN_AUTH_KEY) === 'true';
}

export function clearAdminSession(): void {
  sessionStorage.removeItem(ADMIN_AUTH_KEY);
}

export function resolveRedirectPath(from: string | null): string {
  if (
    from &&
    from !== '/admin/login' &&
    (from === '/admin' || from.startsWith('/admin/'))
  ) {
    return from;
  }
  return '/admin';
}
