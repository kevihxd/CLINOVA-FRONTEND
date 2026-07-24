import { motion } from 'framer-motion';
import { FolderKanban, FileCheck2, ShieldCheck, Award, Layers } from 'lucide-react';
import { LoginForm } from '../components/LoginForm';
import logo from '../../../assets/logo.png';
import { AuthFooter } from '../../../components/Footer';

export const Login = () => {
    const BG_IMAGE = "https://clinicalhouse.co/wp-content/uploads/2025/06/Fachada-quinta-velez.png";

    return (
        <div className="min-h-screen w-full flex bg-[#f8fafc] overflow-hidden relative font-sans selection:bg-blue-200">
            
            {/* Ambient Background Orbs */}
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-[#1a559e]/10 rounded-full blur-[120px] pointer-events-none mix-blend-multiply animate-pulse" style={{ animationDuration: '4s' }} />
            <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-400/10 rounded-full blur-[120px] pointer-events-none mix-blend-multiply animate-pulse" style={{ animationDuration: '6s', animationDelay: '1s' }} />

            {/* Login Form Section (Left / Center) */}
            <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-10 lg:p-20 z-20 relative lg:order-1">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="w-full max-w-[440px] bg-white/85 backdrop-blur-2xl border border-white/70 shadow-[0_12px_45px_rgb(26,85,158,0.08)] rounded-3xl p-8 sm:p-10 relative overflow-hidden"
                >
                    {/* Top subtle gradient line */}
                    <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-400 via-[#1a559e] to-sky-400" />
                    
                    <div className="mb-8 flex justify-center">
                        <motion.img 
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 20 }}
                            src={logo} 
                            alt="Logo Clinova" 
                            className="h-16 w-auto object-contain drop-shadow-sm" 
                        />
                    </div>

                    <div className="w-full">
                        <LoginForm />
                    </div>

                    <div className="mt-8 pt-6 border-t border-slate-100 flex justify-center">
                        <AuthFooter />
                    </div>
                </motion.div>
            </div>

            {/* Hero Panel Section (Right Side) */}
            <div className="hidden lg:flex flex-1 relative overflow-hidden bg-[#0c2443] lg:order-2">
                <motion.img
                    src={BG_IMAGE}
                    alt="Background"
                    initial={{ scale: 1.1, opacity: 0 }}
                    animate={{ scale: 1, opacity: 0.35 }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className="absolute inset-0 w-full h-full object-cover"
                />
                
                {/* Clinical House Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#0c2443]/95 via-[#1a559e]/70 to-[#0c2443]/98 mix-blend-multiply" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0c2443] via-transparent to-transparent opacity-80" />

                <div className="relative z-30 w-full h-full flex flex-col justify-center items-start p-16 xl:p-24 text-white">
                    
                    {/* Glowing Top Pill Badge */}
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/30 via-sky-400/20 to-blue-600/30 border border-sky-300/40 backdrop-blur-xl mb-6 shadow-lg shadow-sky-950/50"
                    >
                        <span className="w-2.5 h-2.5 rounded-full bg-sky-400 animate-pulse shadow-[0_0_10px_rgba(56,189,248,1)]" />
                        <span className="text-xs font-black tracking-widest uppercase text-sky-200">SISTEMA INTEGRAL DE GESTIÓN</span>
                    </motion.div>

                    {/* Big Stylized Title */}
                    <motion.h1 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.8 }}
                        className="text-4xl lg:text-5xl xl:text-6xl font-black tracking-tight leading-[1.1] uppercase max-w-2xl"
                    >
                        <span className="block text-transparent bg-clip-text bg-gradient-to-r from-white via-sky-100 to-blue-100 filter drop-shadow-[0_4px_20px_rgba(0,0,0,0.6)]">
                            ADMINISTRACIÓN DE SISTEMAS DE GESTIÓN
                        </span>
                    </motion.h1>

                    {/* Decorative Gradient Line */}
                    <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: "160px" }}
                        transition={{ delay: 0.5, duration: 0.8 }}
                        className="h-1.5 bg-gradient-to-r from-sky-400 via-blue-400 to-transparent rounded-full my-8 shadow-[0_0_12px_rgba(56,189,248,0.8)]"
                    />

                    {/* Animated Document Folders Visual Component */}
                    <div className="w-full max-w-xl grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                        
                        {/* Folder Card 1: Documentación SGC */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: [0, -6, 0] }}
                            transition={{ opacity: { delay: 0.6 }, y: { repeat: Infinity, duration: 4, ease: "easeInOut" } }}
                            className="p-4.5 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-xl shadow-xl shadow-black/20 hover:bg-white/15 transition-all group"
                        >
                            <div className="flex items-center justify-between mb-3">
                                <div className="p-2.5 rounded-xl bg-blue-500/25 border border-blue-300/30 text-sky-300 group-hover:scale-110 transition-transform">
                                    <FolderKanban className="w-5 h-5" />
                                </div>
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                                    <FileCheck2 className="w-3 h-3" /> VIGENTE
                                </span>
                            </div>
                            <h3 className="text-sm font-bold text-white tracking-wide">Gestión Documental SGC</h3>
                            <p className="text-xs text-blue-100/70 mt-1">Formatos, Manuales y Procedimientos V-3.0</p>
                        </motion.div>

                        {/* Folder Card 2: Talento Humano & Capacitaciones */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: [0, -6, 0] }}
                            transition={{ opacity: { delay: 0.7 }, y: { repeat: Infinity, duration: 4.5, delay: 0.5, ease: "easeInOut" } }}
                            className="p-4.5 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-xl shadow-xl shadow-black/20 hover:bg-white/15 transition-all group"
                        >
                            <div className="flex items-center justify-between mb-3">
                                <div className="p-2.5 rounded-xl bg-sky-500/25 border border-sky-300/30 text-sky-200 group-hover:scale-110 transition-transform">
                                    <Layers className="w-5 h-5" />
                                </div>
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-400/30">
                                    <ShieldCheck className="w-3 h-3" /> 
                                </span>
                            </div>
                            <h3 className="text-sm font-bold text-white tracking-wide">Talento Humano & TH</h3>
                            <p className="text-xs text-blue-100/70 mt-1">Hojas de Vida, Cursos y Semaforización</p>
                        </motion.div>

                        {/* Folder Card 3: Indicadores & Procesos */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: [0, -6, 0] }}
                            transition={{ opacity: { delay: 0.8 }, y: { repeat: Infinity, duration: 5, delay: 1, ease: "easeInOut" } }}
                            className="p-4.5 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-xl shadow-xl shadow-black/20 hover:bg-white/15 transition-all sm:col-span-2 group"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 rounded-xl bg-indigo-500/25 border border-indigo-300/30 text-indigo-200 group-hover:scale-110 transition-transform">
                                        <Award className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-white tracking-wide">Control de Calidad & Habilitación</h3>
                                        <p className="text-xs text-blue-100/70 mt-0.5"></p>
                                    </div>
                                </div>
                                <span className="hidden sm:inline-flex items-center gap-1.5 text-[10px] font-extrabold tracking-wider uppercase px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-200 border border-blue-400/30">
                                    100% CUMPLE
                                </span>
                            </div>
                        </motion.div>

                    </div>

                </div>
            </div>

        </div>
    );
};

export default Login;