import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

interface Props {
  children: React.ReactNode;
  role?: 'admin' | 'supplier' | 'customer';
}

export default function ProtectedRoute({ children, role }: Props) {
  const { token, user } = useAuthStore();
  const location = useLocation();

  if (!token || !user) {
    return <Navigate to={`/dashboard/login?next=${encodeURIComponent(location.pathname + location.search)}`} replace />;
  }

  if (role && user.role !== role) {
    return <Navigate to={`/dashboard/${user.role}`} replace />;
  }

  return <>{children}</>;
}
