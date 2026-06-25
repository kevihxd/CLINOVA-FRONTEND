import { createBrowserRouter } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import Layout from './layouts/Layout';
import { moduleRoutes } from './router/maps';
import { NotFound } from './components/NotFound';
import { ProtectedRoute } from './components/ProtectedRoute';

// Login y Dashboard pueden seguir siendo estáticos si son muy usados,
// o lazy. Haremos Login estático y Dashboard lazy.
import Login from './modules/auth/pages/Login';
const Dashboard = lazy(() => import('./modules/dashboard/pages/Dashboard'));

const LoadingFallback = () => (
    <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm font-semibold text-slate-500">Cargando módulo...</p>
        </div>
    </div>
);

const router = createBrowserRouter([
    {
        path: '/',
        element: <Login />,
    },
    {
        path: '/login',
        element: <Login />,
    },
    {
        element: <ProtectedRoute />,
        children: [
            {
                element: <Layout />,
                children: [
                    {
                        path: '/dashboard',
                        element: <Suspense fallback={<LoadingFallback />}><Dashboard /></Suspense>,
                    },
                    ...moduleRoutes.map(route => ({
                        ...route,
                        element: <Suspense fallback={<LoadingFallback />}>{route.element}</Suspense>
                    }))
                ]
            }
        ]
    },
    {
        path: '*',
        element: <NotFound />
    }
]);

export default router;
