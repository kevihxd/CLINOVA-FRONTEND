import React from 'react';
import { useBoard } from '../hooks/useBoard';
import { OptionSidebar } from '../components/OptionSidebar';
import { Users, Star, Settings, FileText, ClipboardList, Shield, LayoutDashboard } from 'lucide-react';
import { motion } from 'framer-motion';
import { OPTIONS_MAP } from '../constants/dashboardMaps';
import { useAuth } from '../../../providers/AuthProvider';

// Función auxiliar para asignar estilos e iconos profesionales según el nombre del módulo
const getModuleStyle = (title) => {
    const normalize = title?.toLowerCase() || '';
    if (normalize.includes('talento humano')) return { icon: Users, color: 'text-blue-600', bg: 'bg-blue-50', border: 'hover:border-blue-300', shadow: 'hover:shadow-blue-100' };
    if (normalize.includes('calidad')) return { icon: Star, color: 'text-amber-500', bg: 'bg-amber-50', border: 'hover:border-amber-300', shadow: 'hover:shadow-amber-100' };
    if (normalize.includes('configuración')) return { icon: Settings, color: 'text-slate-600', bg: 'bg-slate-100', border: 'hover:border-slate-300', shadow: 'hover:shadow-slate-200' };
    if (normalize.includes('actas')) return { icon: ClipboardList, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'hover:border-emerald-300', shadow: 'hover:shadow-emerald-100' };
    if (normalize.includes('procesos')) return { icon: FileText, color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'hover:border-indigo-300', shadow: 'hover:shadow-indigo-100' };
    
    return { icon: Shield, color: 'text-purple-600', bg: 'bg-purple-50', border: 'hover:border-purple-300', shadow: 'hover:shadow-purple-100' };
};

const Dashboard = () => {
    // Usamos useBoard solo para la gestión del estado y selección, ignoramos el drag and drop
    const { cards, selectedModule, selectModule, closeSidebar } = useBoard();
    const { user } = useAuth(); 

    // Validación de seguridad para mostrar módulos según el rol
    const checkIsAuditor = () => {
        if (!user) return false;
        const permisos = user?.permisos || user?.authorities || [];
        if (Array.isArray(permisos)) {
            return permisos.some(p => p === 'ROLE_ADMIN' || p === 'ROLE_HR_MANAGER' || p === 'ADMIN');
        }
        const oldRole = String(user?.rol || user?.role || '').toUpperCase();
        return oldRole.includes('ADMIN') || oldRole.includes('HR_MANAGER');
    };

    const isAuditor = checkIsAuditor();

    const allowedCards = cards.filter(card => {
        if (isAuditor) return true;
        return card.title === 'Talento Humano';
    });

    // Animaciones para la carga de las tarjetas
    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
    };

    return (
        <div className="w-full min-h-[calc(100vh-80px)] bg-slate-50/50 relative overflow-y-auto">
            
            {/* Fondo con patrón sutil */}
            <div className="absolute inset-0 w-full h-full opacity-[0.3] pointer-events-none"
                style={{ backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: '32px 32px' }}
            />

            <div className="relative z-10 max-w-7xl mx-auto p-6 md:p-8 lg:p-10">
                
                {/* Cabecera del Dashboard */}
                <div className="flex items-center gap-4 mb-10">
                    <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-sm text-indigo-600">
                        <LayoutDashboard size={28} strokeWidth={1.5} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Panel de Control</h1>
                        <p className="text-slate-500 font-medium mt-1">
                            ¡Hola, <span className="text-indigo-600 capitalize">{user?.username || 'Usuario'}</span>! Selecciona un módulo para comenzar.
                        </p>
                    </div>
                </div>

                {/* Cuadrícula Estática de Módulos */}
                <motion.div 
                    variants={containerVariants}
                    initial="hidden"
                    animate="show"
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                >
                    {allowedCards.map((card) => {
                        const style = getModuleStyle(card.title);
                        const Icon = style.icon;

                        return (
                            <motion.button
                                key={card.id}
                                variants={itemVariants}
                                whileHover={{ y: -4 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => selectModule(card.id)}
                                className={`group flex flex-col items-start p-6 bg-white rounded-2xl border border-slate-200 shadow-sm transition-all duration-300 text-left cursor-pointer hover:shadow-lg ${style.border} ${style.shadow}`}
                            >
                                <div className={`p-4 rounded-xl ${style.bg} ${style.color} mb-5 group-hover:scale-110 transition-transform duration-300`}>
                                    <Icon size={32} strokeWidth={1.5} />
                                </div>
                                
                                <h3 className="text-lg font-bold text-slate-800 group-hover:text-slate-900 transition-colors w-full truncate">
                                    {card.title}
                                </h3>
                                <p className="text-sm text-slate-500 mt-1.5 font-medium">
                                    Gestión y administración
                                </p>

                                <div className="mt-6 w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                                    <div className={`h-full w-0 group-hover:w-full transition-all duration-500 ${style.bg.replace('bg-', 'bg-').replace('50', '500')}`} />
                                </div>
                            </motion.button>
                        );
                    })}
                </motion.div>
            </div>

            {/* Menú lateral (Sidebar) intacto */}
            <OptionSidebar
                isOpen={!!selectedModule}
                onClose={closeSidebar}
                selectedModule={selectedModule}
                OptionsComponent={selectedModule ? OPTIONS_MAP[selectedModule.id] : null}
            />
        </div>
    );
};

export default Dashboard;