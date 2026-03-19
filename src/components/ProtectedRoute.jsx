import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../providers/AuthProvider';

export const ProtectedRoute = () => {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        </div>; // Opcional: Spinner de carga
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
};
