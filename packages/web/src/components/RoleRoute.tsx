import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

export const RoleRoute = ({ children }: { children?: JSX.Element }): JSX.Element => {
  const { isAdmin } = useAuth();
  if (!isAdmin) {
    return <Navigate replace to="/" />;
  }
  return children ?? <Outlet />;
};
