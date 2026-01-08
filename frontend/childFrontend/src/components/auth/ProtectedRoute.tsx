import React from 'react';
import { Navigate } from 'react-router-dom';
import { authService } from '../../services/authService';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'ADMIN' | 'POLICE' | 'SOCIAL_WORKER' | 'PUBLIC' | string;
  allowedRoles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole, 
  allowedRoles 
}) => {
  const user = authService.getCurrentUser();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.status !== 'ACTIVE') {
    return <Navigate to="/login" state={{ message: 'Account not active' }} replace />;
  }
  
  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/unauthorized" replace />;
  }
  
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }
  
  return <>{children}</>;
};

export default ProtectedRoute;