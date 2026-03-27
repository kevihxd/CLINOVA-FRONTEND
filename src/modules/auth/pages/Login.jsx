import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LoginForm } from '../components/LoginForm';
import { RecoverPassword } from '../components/RecoverPassword';
import logo from '../../../assets/logo.png';
import { AuthFooter } from '../../../components/Footer';

const Login = () => {
    const [view, setView] = useState('login');

    const BG_IMAGE = "https://images.unsplash.com/photo-1551076805-e18690c5e53b?q=80&w=2000&auto=format&fit=crop";

    return (
        <div className="min-h-screen w-full flex bg-slate-50 overflow-hidden relative font-sans selection:bg-blue-200">
            
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />

            <motion.div
                layout
                transition={{ type: "spring", stiffness: 100, damping: 20 }}
                className={`flex-1 flex flex-col justify-center items-center p-6 sm:p-10 lg:p-20 z-20 relative ${view === 'login' ? 'lg:order-1' : 'lg:order-2'}`}
            >
                <div className="w-full max-w-[420px] bg-white/80 backdrop-blur-2xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl p-8 sm:p-10 relative">
                    
                    <div className="mb-10 flex justify-center">
                        <img src={logo} alt="Logo" className="h-12 w-auto object-contain transition-transform hover:scale-105 duration-500" />
                    </div>

                    <div className="w-full min-h-[380px]">
                        <AnimatePresence mode="wait" initial={false}>
                            {view === 'login' ? (
                                <motion.div
                                    key="login-form"
                                    initial={{ opacity: 0, x: -20, filter: "blur(4px)" }}
                                    animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                                    exit={{ opacity: 0, x: 20, filter: "blur(4px)" }}
                                    transition={{ duration: 0.3, ease: "easeOut" }}
                                >
                                    <LoginForm onForgotPassword={() => setView('recover')} />
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="recover-form"
                                    initial={{ opacity: 0, x: 20, filter: "blur(4px)" }}
                                    animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                                    exit={{ opacity: 0, x: -20, filter: "blur(4px)" }}
                                    transition={{ duration: 0.3, ease: "easeOut" }}
                                >
                                    <RecoverPassword onBack={() => setView('login')} />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <div className="mt-6 pt-6 border-t border-slate-100">
                        <AuthFooter />
                    </div>
                </div>
            </motion.div>

            <motion.div
                layout
                transition={{ type: "spring", stiffness: 100, damping: 20 }}
                className={`hidden lg:flex flex-1 relative overflow-hidden bg-slate-900 ${view === 'login' ? 'lg:order-2' : 'lg:order-1'}`}
            >
                <motion.img
                    key={view}
                    src={BG_IMAGE}
                    alt="Background"
                    initial={{ scale: 1.05, opacity: 0 }}
                    animate={{ scale: 1, opacity: 0.4 }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className="absolute inset-0 w-full h-full object-cover"
                />
                
                <div className="absolute inset-0 bg-gradient-to-br from-blue-900/80 via-slate-900/60 to-slate-900/90 mix-blend-multiply" />

                <div className="relative z-30 w-full h-full flex flex-col justify-center items-start p-20 lg:p-24 text-white">
                    <AnimatePresence mode="wait">
                        {view === 'login' ? (
                            <motion.div
                                key="login-text"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ delay: 0.1, duration: 0.4 }}
                                className="max-w-xl"
                            >
                                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-md mb-6">
                                    <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                                    <span className="text-xs font-medium tracking-wide text-blue-50">CLINOVA V2.0</span>
                                </div>
                                <h1 className="text-5xl lg:text-6xl font-bold mb-6 tracking-tight leading-tight">
                                    Gestión documental <br />
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300">inteligente.</span>
                                </h1>
                                <p className="text-lg text-slate-300 leading-relaxed font-light max-w-md">
                                    Centraliza, automatiza y asegura la información vital de tu organización en una única plataforma de alto rendimiento.
                                </p>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="recover-text"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ delay: 0.1, duration: 0.4 }}
                                className="max-w-xl"
                            >
                                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-md mb-6">
                                    <span className="text-xs font-medium tracking-wide text-blue-50">SOPORTE TÉCNICO</span>
                                </div>
                                <h2 className="text-4xl lg:text-5xl font-bold mb-8 leading-tight">Recuperación de<br/>credenciales</h2>
                                <div className="space-y-5">
                                    {[
                                        { title: "Verificación de Identidad", desc: "Código seguro enviado a su correo corporativo." },
                                        { title: "Cifrado End-to-End", desc: "Garantizamos la privacidad absoluta de sus datos." },
                                    ].map((item, i) => (
                                        <motion.div
                                            key={i}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.2 + (i * 0.1) }}
                                            className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md"
                                        >
                                            <div className="h-2.5 w-2.5 mt-1.5 rounded-full bg-blue-400 shrink-0" />
                                            <div>
                                                <h3 className="font-semibold text-white">{item.title}</h3>
                                                <p className="text-sm text-slate-400 mt-1">{item.desc}</p>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    );
};

export default Login;