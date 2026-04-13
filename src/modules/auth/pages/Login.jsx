import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LoginForm } from '../components/LoginForm';
import { RecoverPassword } from '../components/RecoverPassword';
import logo from '../../../assets/logo.png';
import { AuthFooter } from '../../../components/Footer';

const Login = () => {
    const [view, setView] = useState('login');

    const BG_IMAGE = "https://clinicalhouse.co/wp-content/uploads/2025/06/Fachada-quinta-velez.png";

    return (
        <div className="min-h-screen w-full flex bg-[#f8fafc] overflow-hidden relative font-sans selection:bg-blue-200">
            
            {/* Ambient Background Orbs */}
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-[#1a559e]/10 rounded-full blur-[120px] pointer-events-none mix-blend-multiply animate-pulse" style={{ animationDuration: '4s' }} />
            <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-400/10 rounded-full blur-[120px] pointer-events-none mix-blend-multiply animate-pulse" style={{ animationDuration: '6s', animationDelay: '1s' }} />

            <motion.div
                layout
                transition={{ type: "spring", stiffness: 90, damping: 20 }}
                className={`flex-1 flex flex-col justify-center items-center p-6 sm:p-10 lg:p-20 z-20 relative ${view === 'login' ? 'lg:order-1' : 'lg:order-2'}`}
            >
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="w-full max-w-[440px] bg-white/80 backdrop-blur-2xl border border-white/60 shadow-[0_8px_40px_rgb(26,85,158,0.06)] rounded-3xl p-8 sm:p-10 relative overflow-hidden"
                >
                    {/* Top subtle gradient line */}
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-400 via-[#1a559e] to-blue-400" />
                    
                    <div className="mb-10 flex justify-center">
                        <motion.img 
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 20 }}
                            src={logo} 
                            alt="Logo Clinical House" 
                            className="h-16 w-auto object-contain drop-shadow-sm" 
                        />
                    </div>

                    <div className="w-full min-h-[380px]">
                        <AnimatePresence mode="wait" initial={false}>
                            {view === 'login' ? (
                                <motion.div
                                    key="login-form"
                                    initial={{ opacity: 0, x: -20, filter: "blur(4px)" }}
                                    animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                                    exit={{ opacity: 0, x: 20, filter: "blur(4px)" }}
                                    transition={{ duration: 0.4, ease: "circOut" }}
                                >
                                    <LoginForm onForgotPassword={() => setView('recover')} />
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="recover-form"
                                    initial={{ opacity: 0, x: 20, filter: "blur(4px)" }}
                                    animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                                    exit={{ opacity: 0, x: -20, filter: "blur(4px)" }}
                                    transition={{ duration: 0.4, ease: "circOut" }}
                                >
                                    <RecoverPassword onBack={() => setView('login')} />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <div className="mt-8 pt-6 border-t border-slate-100 flex justify-center">
                        <AuthFooter />
                    </div>
                </motion.div>
            </motion.div>

            <motion.div
                layout
                transition={{ type: "spring", stiffness: 90, damping: 20 }}
                className={`hidden lg:flex flex-1 relative overflow-hidden bg-[#0c2443] ${view === 'login' ? 'lg:order-2' : 'lg:order-1'}`}
            >
                <AnimatePresence mode="wait">
                    <motion.img
                        key={view}
                        src={BG_IMAGE}
                        alt="Background"
                        initial={{ scale: 1.1, opacity: 0 }}
                        animate={{ scale: 1, opacity: 0.4 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        className="absolute inset-0 w-full h-full object-cover"
                    />
                </AnimatePresence>
                
                {/* Clinical House Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#0c2443]/90 via-[#1a559e]/60 to-[#0c2443]/95 mix-blend-multiply" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0c2443] to-transparent opacity-60" />

                <div className="relative z-30 w-full h-full flex flex-col justify-center items-start p-20 lg:p-24 text-white">
                    <AnimatePresence mode="wait">
                        {view === 'login' ? (
                            <motion.div
                                key="login-text"
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ delay: 0.2, duration: 0.6, ease: "easeOut" }}
                                className="max-w-xl"
                            >
                                <motion.div 
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.5 }}
                                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 backdrop-blur-md mb-8 shadow-lg shadow-black/10"
                                >
                                    <span className="w-2.5 h-2.5 rounded-full bg-blue-300 animate-pulse shadow-[0_0_8px_rgba(147,197,253,0.8)]" />
                                    <span className="text-xs font-semibold tracking-wider text-blue-50">CLINOVA</span>
                                </motion.div>
                                <h1 className="text-5xl lg:text-6xl font-extrabold mb-6 tracking-tight leading-[1.15]">
                                    <span className="text-white">SISTEMA DE GESTIÓN DOCUMENTAL</span>
                                    <br />
                                    
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-white to-blue-200">
                                        IPS CLINICAL HOUSE
                                    </span>
                                </h1>
                                <p className="text-lg text-blue-50/80 leading-relaxed font-light max-w-md">
                                    Moderniza, asegura y centraliza todos los procesos documentales y de talento humano de la institución en una única plataforma de alto rendimiento.
                                </p>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="recover-text"
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ delay: 0.2, duration: 0.6, ease: "easeOut" }}
                                className="max-w-xl"
                            >
                                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-md mb-6">
                                    <span className="text-xs font-medium tracking-wide text-blue-50">SOPORTE TÉCNICO</span>
                                </div>
                                <h2 className="text-4xl lg:text-5xl font-bold mb-8 leading-tight">Recuperación de<br/>credenciales</h2>
                                <div className="space-y-5">
                                    {[
                                        { title: "Verificación de Identidad", desc: "Código seguro enviado a su correo corporativo de Clinical House." },
                                        { title: "Cifrado End-to-End", desc: "La privacidad absoluta de sus datos es nuestra prioridad." },
                                    ].map((item, i) => (
                                        <motion.div
                                            key={i}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.3 + (i * 0.1) }}
                                            className="flex items-start gap-4 p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md hover:bg-white/10 transition-colors"
                                        >
                                            <div className="h-2.5 w-2.5 mt-1.5 rounded-full bg-blue-400 shrink-0 shadow-[0_0_8px_rgba(96,165,250,0.6)]" />
                                            <div>
                                                <h3 className="font-semibold text-white tracking-wide">{item.title}</h3>
                                                <p className="text-sm text-blue-100/60 mt-1.5 leading-relaxed">{item.desc}</p>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
                
                {/* Decorative Elements */}
                <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[150px] pointer-events-none mix-blend-screen" />
            </motion.div>
        </div>
    );
};

export default Login;