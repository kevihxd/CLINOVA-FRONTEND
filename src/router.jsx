import { createBrowserRouter } from 'react-router-dom';
import Layout from './layouts/Layout';
import Login from './modules/auth/pages/Login';
import Dashboard from './modules/dashboard/pages/Dashboard';
import { moduleRoutes } from './router/maps';
import { NotFound } from './components/NotFound';
import { ProtectedRoute } from './components/ProtectedRoute';

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
                        element: <Dashboard />,
                    },
                    ...moduleRoutes
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
