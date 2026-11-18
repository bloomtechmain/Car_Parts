import { useAuthStore } from '../../store/authStore';

/** Which notice (if any) blocks the current user from requesting. */
export function useRequestBlock(): 'admin' | 'supplier' | null {
  const { token, user } = useAuthStore();
  if (!token || !user) return null;
  return user.role === 'admin' ? 'admin' : user.role === 'supplier' ? 'supplier' : null;
}
