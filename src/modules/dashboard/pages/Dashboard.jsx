import React from 'react';
import { useBoard } from '../hooks/useBoard';
import { OptionSidebar } from '../components/OptionSidebar';
import { Users, Star, Settings, FileText, ClipboardList, Shield, LayoutDashboard, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import { OPTIONS_MAP } from '../constants/dashboardMaps';
import { useAuth } from '../../../providers/AuthProvider';
import { DocumentSearchBar } from '../components/DocumentSearchBar';

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
    const { cards, selectedModule, selectModule, closeSidebar } = useBoard();
    const { user } = useAuth(); 

    // Lógica para formatear el nombre real del usuario si existe en la entidad Persona
    const getDisplayName = () => {
        if (user?.persona?.primerNombre) {
            const nombre = user.persona.primerNombre;
            const apellido = user.persona.primerApellido || '';
            return `${nombre} ${apellido}`.trim();
        }
        return user?.username || 'Usuario';
    };

    const isAuditor = () => {
        if (!user) return false;
        const permisos = user?.permisos || user?.authorities || [];
        if (Array.isArray(permisos)) {
            return permisos.some(p => p === 'ROLE_ADMIN' || p === 'ROLE_HR_MANAGER' || p === 'ADMIN');
        }
        const oldRole = String(user?.rol || user?.role || '').toUpperCase();
        return oldRole.includes('ADMIN') || oldRole.includes('HR_MANAGER');
    };

    const auditorFlag = isAuditor();

    const allowedCards = cards.filter(card => {
        if (auditorFlag) return true;
        return card.title === 'Talento Humano';
    }).sort((a, b) => {
        // Mover "Actas e Informes" al final para que quede "abajito"
        if (a.title?.toLowerCase().includes('actas')) return 1;
        if (b.title?.toLowerCase().includes('actas')) return -1;
        return 0;
    });

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
        <div className="w-full min-h-[calc(100vh-80px)] bg-gradient-to-br from-blue-50/70 via-sky-50/40 to-indigo-50/50 relative overflow-hidden overflow-y-auto">
            {/* Ambient Light Blue Glowing Orbs */}
            <div className="absolute -top-40 -left-20 w-[550px] h-[550px] bg-blue-300/25 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute top-20 right-1/4 w-[450px] h-[450px] bg-sky-300/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-40 -right-20 w-[650px] h-[650px] bg-indigo-300/20 rounded-full blur-3xl pointer-events-none" />

            {/* Subtle Tech Grid Pattern */}
            <div className="absolute inset-0 w-full h-full opacity-[0.4] pointer-events-none"
                style={{ backgroundImage: 'radial-gradient(#93c5fd 1.2px, transparent 1.2px)', backgroundSize: '32px 32px' }}
            />

            <div className={`relative z-10 w-full max-w-[100vw] mx-auto py-6 md:py-8 lg:py-10 pl-4 lg:pl-6 pr-4 lg:pr-10 transition-all duration-500 ${selectedModule ? 'xl:pr-[440px]' : ''}`}>
                
                <div className="flex flex-col lg:flex-row gap-8 lg:gap-16 w-full mb-10">
                    {/* LEFT COLUMN - SEARCH SIDEBAR */}
                    <div className="w-full lg:w-[320px] xl:w-[360px] shrink-0 lg:sticky lg:top-28">
                        <div className="mb-3 px-1">
                            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Buscador Global</h2>
                        </div>
                        <div className="z-50 relative w-full">
                            <DocumentSearchBar />
                        </div>
                    </div>

                    {/* RIGHT COLUMN - MODULES */}
                    <div className="flex-1 min-w-0 flex flex-col items-center xl:items-start">
                        <div className="flex items-center justify-center xl:justify-start gap-4 mb-10 w-full max-w-[1200px]">
                            <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-sm text-indigo-600">
                                <LayoutDashboard size={28} strokeWidth={1.5} />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Panel de Control</h1>
                                <p className="text-slate-500 font-medium mt-1">
                                    ¡Hola, <span className="text-indigo-600 capitalize">{getDisplayName()}</span>! Selecciona un módulo para comenzar.
                                </p>
                            </div>
                        </div>

                        <motion.div 
                            variants={containerVariants}
                            initial="hidden"
                            animate="show"
                            className="flex flex-wrap justify-center xl:justify-start gap-6 w-full max-w-[850px]"
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
                                        className={`group flex flex-col items-start p-6 bg-white rounded-2xl border border-slate-200 shadow-sm transition-all duration-300 text-left cursor-pointer hover:shadow-lg w-full sm:w-[260px] shrink-0 ${style.border} ${style.shadow}`}
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
                </div> {/* end right column */}
                </div> {/* end row wrapper */}
            </div>

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