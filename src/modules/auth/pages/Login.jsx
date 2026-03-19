import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LoginForm } from '../components/LoginForm';
import { RecoverPassword } from '../components/RecoverPassword';
import logo from '../../../assets/logo.png';

import { AuthFooter } from '../../../components/Footer';

const Login = () => {
    const [view, setView] = useState('login'); // 'login' | 'recover'

    // Premium abstract background or high-end medical/tech image
    const BG_IMAGE = "https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?q=80&w=2591&auto=format&fit=crop";

    return (
        <div className="min-h-screen w-full flex bg-[#f8fafc] overflow-hidden relative font-sans">

            {/* Background Decorators for depth */}
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-400/20 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-indigo-400/10 rounded-full blur-[120px] pointer-events-none" />

            {/* FORM SIDE */}
            <motion.div
                layout
                transition={{ type: "spring", stiffness: 120, damping: 25 }}
                className={`flex-1 flex flex-col justify-center items-center p-8 sm:p-12 lg:p-24 z-20 relative ${view === 'login' ? 'lg:order-1' : 'lg:order-2'}`}
            >
                <div className="w-full max-w-md bg-white/70 backdrop-blur-xl border border-white/50 shadow-2xl rounded-3xl p-8 sm:p-10 relative overflow-hidden">

                    {/* Subtle aesthetic gradient line top */}
                    <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />

                    <div className="mb-8 flex justify-center">
                        <img src={logo} alt="Logo" className="h-14 w-auto object-contain drop-shadow-sm transition-transform hover:scale-105 duration-300" />
                    </div>

                    <div className="w-full">
                        <AnimatePresence mode="wait" initial={false}>
                            {view === 'login' ? (
                                <motion.div
                                    key="login-form"
                                    initial={{ opacity: 0, x: -30 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 30 }}
                                    transition={{ duration: 0.4, ease: "easeOut" }}
                                >
                                    <LoginForm onForgotPassword={() => setView('recover')} />
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="recover-form"
                                    initial={{ opacity: 0, x: 30 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -30 }}
                                    transition={{ duration: 0.4, ease: "easeOut" }}
                                >
                                    <RecoverPassword onBack={() => setView('login')} />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <div className="mt-8 pt-6 border-t border-slate-200/60">
                        <AuthFooter />
                    </div>
                </div>
            </motion.div>

            {/* ILLUSTRATION/IMAGE SIDE */}
            <motion.div
                layout
                transition={{ type: "spring", stiffness: 120, damping: 25 }}
                className={`hidden lg:flex flex-1 relative overflow-hidden shadow-2xl ${view === 'login' ? 'lg:order-2 rounded-l-[3rem]' : 'lg:order-1 rounded-r-[3rem]'}`}
            >
                <div className="absolute inset-0 bg-slate-900">
                    <motion.img
                        key={view}
                        src={BG_IMAGE}
                        alt="Background"
                        initial={{ scale: 1.1, opacity: 0 }}
                        animate={{ scale: 1, opacity: 0.6 }}
                        transition={{ duration: 1.2 }}
                        className="w-full h-full object-cover mix-blend-overlay"
                    />
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-900/90 via-indigo-900/80 to-slate-900/90 mix-blend-multiply" />

                    {/* Animated Geometric Shapes for Modern Feel */}
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 100, repeat: Infinity, ease: "linear" }}
                        className="absolute -top-20 -right-20 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl mix-blend-screen"
                    />
                    <motion.div
                        animate={{ rotate: -360 }}
                        transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
                        className="absolute -bottom-20 -left-20 w-[30rem] h-[30rem] bg-purple-500/20 rounded-full blur-3xl mix-blend-screen"
                    />
                </div>

                {/* Content Overlay */}
                <div className="relative z-30 w-full h-full flex flex-col justify-center items-center text-center p-16 text-white">
                    <AnimatePresence mode="wait">
                        {view === 'login' ? (
                            <motion.div
                                key="login-text"
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -30 }}
                                transition={{ delay: 0.2, duration: 0.5 }}
                                className="max-w-lg"
                            >
                                <h1 className="text-5xl font-extrabold mb-6 tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-200">
                                    Bienvenido de Nuevo
                                </h1>
                                <p className="text-lg text-blue-100/90 leading-relaxed font-light">
                                    Gestiona tu documentación clínica con la plataforma más avanzada, segura y eficiente.
                                </p>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="recover-text"
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -30 }}
                                transition={{ delay: 0.2, duration: 0.5 }}
                                className="max-w-lg text-left"
                            >
                                <h2 className="text-4xl font-bold mb-8 text-white">Recuperación Segura</h2>
                                <div className="space-y-6">
                                    {[
                                        { title: "Verificación de Identidad", desc: "Enviamos un código seguro a tu correo registrado." },
                                        { title: "Protección de Datos", desc: "Tus credenciales están encriptadas de extremo a extremo." },
                                    ].map((item, i) => (
                                        <motion.div
                                            key={i}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.3 + (i * 0.1) }}
                                            className="flex items-start gap-4 p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10"
                                        >
                                            <div className="h-2 w-2 mt-2 rounded-full bg-blue-400 shadow-[0_0_10px_rgba(96,165,250,0.8)]" />
                                            <div>
                                                <h3 className="font-semibold text-white text-lg">{item.title}</h3>
                                                <p className="text-sm text-blue-200/80 mt-1">{item.desc}</p>
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

