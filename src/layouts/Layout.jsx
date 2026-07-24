import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { useAuth } from '../providers/AuthProvider';
import { CambioPasswordObligatorio } from '../modules/auth/components/CambioPasswordObligatorio';

const Layout = () => {
    const { user } = useAuth();

    return (
        <div className="min-h-screen w-full bg-slate-50 font-sans">
            <Navbar />
            <main className="w-full pt-22 pb-6">
                <div className="w-full">
                    <Outlet />
                </div>
            </main>

            <footer className="w-full py-4 text-center text-[11px] text-slate-400 font-medium select-none flex items-center justify-center gap-1 opacity-70 hover:opacity-100 transition-opacity">
                <span>Desarrollado con</span>
                <span className="text-red-500 text-xs inline-block animate-pulse">❤️</span>
                <span>por el Departamento de Sistemas</span>
            </footer>

            {user?.requiereCambioPassword && (
                <CambioPasswordObligatorio />
            )}
        </div>
    );
};

export default Layout;
