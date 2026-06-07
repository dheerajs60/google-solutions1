import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import useAuthStore from '../../store/useAuthStore';

export const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, isLoading } = useAuthStore();
    const location = useLocation();

    if (isLoading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-[#0B0F19]">
                <div className="flex flex-col items-center">
                    <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#0F172A] border-t-[#3B82F6]"></div>
                    <p className="mt-4 text-sm text-gray-400">Authenticating...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/" state={{ from: location }} replace />;
    }

    return children ? children : <Outlet />;
};
