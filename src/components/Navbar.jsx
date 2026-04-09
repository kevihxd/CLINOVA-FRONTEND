import { Bell, LogOut } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import logo from '../assets/logo.png';
import { UserProfile } from './UserProfile';
import { ROUTES } from '../router/routes.const';
import { useAuth } from '../providers/AuthProvider';

export const Navbar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout } = useAuth(); 

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleNavigation = (path) => {
        if (location.pathname !== path) {
            navigate(path);
        }
    };


    const getDisplayName = () => {
        if (user?.persona?.primerNombre) {
            const nombre = user.persona.primerNombre;
            const apellido = user.persona.primerApellido || '';
            return `${nombre} ${apellido}`.trim();
        }
        return user?.username || user?.sub || 'Usuario';
    };


    const getDisplayRole = () => {

        let roleString = String(user?.rol || user?.role || user?.roles?.[0] || '');
        

        if (!roleString || roleString === 'undefined') {
            const permisos = user?.permisos || user?.authorities || [];
            if (Array.isArray(permisos) && permisos.length > 0) {
                roleString = permisos.find(p => p.startsWith('ROLE_')) || permisos[0];
            }
        }


        if (roleString && roleString !== 'undefined') {
            return roleString
                .replace('ROLE_', '')
                .replace(/_/g, ' ')
                .toLowerCase()
                .replace(/\b\w/g, l => l.toUpperCase());
        }
        
        return 'Personal';
    };

    const nombreUsuario = getDisplayName();
    const rolUsuario = getDisplayRole();

    return (
        <nav className="h-20 w-full bg-white/70 backdrop-blur-xl border-b border-white/20 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] px-6 md:px-8 flex items-center justify-between z-50 fixed top-0 left-0 transition-all duration-300">
            <div className="flex items-center gap-4 group cursor-pointer" onClick={() => handleNavigation('/dashboard')}>
                <div className="relative">
                    <div className="absolute -inset-2 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full opacity-0 group-hover:opacity-100 blur-lg transition-opacity duration-300" />
                    <img src={logo} alt="Logo" className="relative h-12 w-auto object-contain transition-transform duration-300 group-hover:scale-105" />
                </div>
                <div className="hidden md:flex flex-col">
                    <span className="font-bold text-lg text-slate-800 tracking-tight leading-none group-hover:text-blue-600 transition-colors">Clinova</span>
                    <span className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">Gestión Documental</span>
                </div>
            </div>

            <div className="flex items-center gap-3 md:gap-6">
                <button className="relative p-2.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50/80 rounded-full transition-all duration-300 group">
                    <Bell className="w-5 h-5 transition-transform duration-300 group-hover:rotate-12" />
                    <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white animate-pulse" />
                </button>

                <div className="h-8 w-px bg-slate-200 hidden sm:block" />

                <div className="flex items-center gap-4">
                    <UserProfile name={nombreUsuario} role={rolUsuario} onClick={() => handleNavigation(ROUTES.MI_CUENTA.MI_PERFIL.path)} />

                    <button onClick={handleLogout} className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-all duration-300 group" title="Cerrar Sesión">
                        <LogOut className="w-5 h-5 transition-transform duration-300 group-hover:-translate-x-0.5" />
                    </button>
                </div>
            </div>
        </nav>
    );
};