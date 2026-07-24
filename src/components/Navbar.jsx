import { Bell, LogOut, ChevronLeft } from 'lucide-react';
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

    // Detect if we can go back (not on root or dashboard)
    const isDashboard = location.pathname === '/dashboard' || location.pathname === '/';
    const canGoBack = !isDashboard;

    // Build a human-readable page title from the current path
    const getPageTitle = () => {
        const segments = location.pathname.split('/').filter(Boolean);
        if (segments.length === 0 || segments[0] === 'dashboard') return '';
        const labels = {
            'hojasDeVida': 'Hojas de Vida', 'nomina': 'Nómina', 'proveedores': 'Proveedores (OPS)',
            'talentoHumano': 'Talento Humano', 'procesos': 'Procesos', 'calidad': 'Calidad',
            'configuracion': 'Configuración', 'actas': 'Actas e Informes', 'contexto': 'Contexto',
            'hoja-de-vida': 'Hoja de Vida', 'organigrama': 'Organigrama', 'perfiles-cargo': 'Perfiles de Cargo',
            'tipo-documento': 'Tipo Documento', 'incapacidades': 'Incapacidad, ausentismo y licencias', 'cursos': 'Cursos',
            'mapa': 'Mapa de Procesos', 'tipos-documentos': 'Tipos de Documento',
            'listado-unico': 'Listado Único', 'crear-documento': 'Crear Documento',
            'solicitar-documento': 'Solicitar Documento', 'revision-documento': 'Revisión',
            'reportes': 'Reportes', 'papelera-reciclaje': 'Papelera', 'documentos-externos': 'Doc. Externos',
            'diligenciar-formato': 'Diligenciar Formato', 'definiciones': 'Definiciones',
            'analisis-contexto': 'Análisis del Contexto', 'partes-interesadas': 'Partes Interesadas',
            'matriz-requisitos': 'Matriz Requisitos Legales', 'mi-perfil': 'Mi Perfil',
            'usuarios': 'Usuarios', 'gestion-cargos': 'Gestión de Cargos',
        };
        return segments.map(s => labels[s] || s.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())).join(' › ');
    };

    const pageTitle = getPageTitle();

    return (
        <nav className="h-22 w-full bg-gradient-to-r from-blue-100/95 via-sky-100/90 to-indigo-100/95 backdrop-blur-xl border-b border-blue-200/90 shadow-[0_4px_22px_-4px_rgba(30,58,138,0.12)] px-6 md:px-8 flex items-center justify-between z-50 fixed top-0 left-0 transition-all duration-300">
            {/* Left: Logo + Back Button */}
            <div className="flex items-center gap-3">
                <div className="flex items-center gap-4 group cursor-pointer" onClick={() => handleNavigation('/dashboard')}>
                    <div className="relative">
                        <div className="absolute -inset-2 bg-gradient-to-r from-blue-300 to-indigo-300 rounded-full opacity-0 group-hover:opacity-100 blur-lg transition-opacity duration-300" />
                        <img src={logo} alt="Logo" className="relative h-18 w-auto object-contain transition-transform duration-300 group-hover:scale-105" />
                    </div>
                    <div className="hidden md:flex flex-col">
                        <span className="font-bold text-lg text-slate-800 tracking-tight leading-none group-hover:text-blue-600 transition-colors">Clinova</span>
                        <span className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">Gestión Documental</span>
                    </div>
                </div>

                {/* Back button + page title */}
                {canGoBack && (
                    <>
                        <div className="h-8 w-px bg-slate-200 mx-1" />
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => navigate(-1)}
                                title="Regresar"
                                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 border border-slate-200 hover:border-blue-200 rounded-lg transition-all duration-200 group/back"
                            >
                                <ChevronLeft className="w-4 h-4 transition-transform duration-200 group-hover/back:-translate-x-0.5" />
                                <span className="hidden sm:inline">Regresar</span>
                            </button>
                            {pageTitle && (
                                <span className="hidden lg:flex items-center gap-1.5 text-sm text-slate-500">
                                    <span className="text-slate-300">/</span>
                                    <span className="font-medium text-slate-700 max-w-[300px] truncate">{pageTitle}</span>
                                </span>
                            )}
                        </div>
                    </>
                )}
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