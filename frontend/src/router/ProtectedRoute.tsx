import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

interface Props {
  children: React.ReactNode;
  role?: 'admin' | 'supplier';
}

export default function ProtectedRoute({ children, role }: Props) {
  const { token, user } = useAuthStore();

  if (!token || !user) {
    return <Navigate to="/dashboard/login" replace />;
  }

  if (role && user.role !== role) {
    return <Navigate to={`/dashboard/${user.role}`} replace />;
  }

  return <>{children}</>;
}
