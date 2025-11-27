import React from 'react';
import { Navigate } from 'react-router-dom';

interface SuperAdminProtectedRouteProps {
    children: React.ReactNode;
}

export const SuperAdminProtectedRoute: React.FC<SuperAdminProtectedRouteProps> = ({ children }) => {
    const isSuperAdmin = localStorage.getItem('qrave_superadmin') === 'true';

    if (!isSuperAdmin) {
        return <Navigate to="/login" replace />;
    }

    return <>{children}</>;
};
