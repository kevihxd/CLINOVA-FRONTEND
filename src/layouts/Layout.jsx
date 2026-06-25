import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { useAuth } from '../providers/AuthProvider';
import { CambioPasswordObligatorio } from '../modules/auth/components/CambioPasswordObligatorio';

const Layout = () => {
    const { user } = useAuth();

    return (
        <div className="min-h-screen w-full bg-slate-50 font-sans">
            <Navbar />
            <main className="w-full pt-20">
                <div className="w-full">
                    <Outlet />
                </div>
            </main>

            {user?.requiereCambioPassword && (
                <CambioPasswordObligatorio />
            )}
        </div>
    );
};

export default Layout;
