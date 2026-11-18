/** Only allow in-app redirects (e.g. /find-parts), never another site */
export function safeNext(next: string | null): string | null {
  return next && next.startsWith('/') && !next.startsWith('//') ? next : null;
}

/** Where to go after signing in: customers return to what they were doing, staff go to their dashboard */
export function afterLoginPath(role: string, next: string | null): string {
  if (role === 'customer' && next && !next.startsWith('/dashboard/admin') && !next.startsWith('/dashboard/supplier')) {
    return next;
  }
  if (next && next.startsWith(`/dashboard/${role}`)) return next;
  return `/dashboard/${role}`;
}
