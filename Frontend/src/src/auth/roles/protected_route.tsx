import React from 'react';
import { Navigate } from 'react-router-dom';
import { Permission } from 'src/auth/roles/roles';
import { useAuthContext } from '../hooks';

type ProtectedRouteProps = {
  element: React.ReactNode; 
  permission: Permission;
};

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ element, permission }) => {
  const { hasPermission } = useAuthContext();

  if (!hasPermission(permission)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{element}</>; 
};

export default ProtectedRoute;
