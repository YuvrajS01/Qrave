import React from 'react';
import { Navigate, useParams } from 'react-router-dom';

interface ProtectedRouteProps {
    children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    const { slug } = useParams<{ slug: string }>();
    const storedUser = localStorage.getItem('qrave_user');

    if (!storedUser) {
        return <Navigate to="/login" replace />;
    }

    try {
        const user = JSON.parse(storedUser);
        // Basic check: if we are on a specific restaurant route, ensure the user belongs to it
        if (slug && user.slug !== slug) {
            // If trying to access a different restaurant's admin, redirect to login or their own dashboard
            // For security, let's redirect to login
            return <Navigate to="/login" replace />;
        }
    } catch (e) {
        // Invalid JSON
        localStorage.removeItem('qrave_user');
        return <Navigate to="/login" replace />;
    }

    return <>{children}</>;
};
