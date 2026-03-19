import { motion } from 'framer-motion';
import { Home, ArrowLeft, FileQuestion } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const NotFound = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen w-full flex flex-col items-center justify-center bg-slate-50 relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-[0.4]"
                style={{
                    backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)',
                    backgroundSize: '32px 32px'
                }}
            />

            {/* Glowing Orbs */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl mix-blend-multiply animate-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-400/20 rounded-full blur-3xl mix-blend-multiply animate-pulse" style={{ animationDelay: '1s' }} />

            <div className="relative z-10 text-center px-4">
                {/* 404 Animated Text */}
                <motion.h1
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{
                        type: "spring",
                        stiffness: 260,
                        damping: 20
                    }}
                    className="text-[150px] font-black text-slate-900 leading-none tracking-tighter select-none"
                >
                    4
                    <span className="inline-block text-indigo-600 animate-bounce">0</span>
                    4
                </motion.h1>

                {/* Message */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="space-y-4 mb-12"
                >
                    <h2 className="text-3xl font-bold text-slate-800">
                        ¡Ups! Página no encontrada
                    </h2>
                    <p className="text-slate-500 text-lg max-w-md mx-auto">
                        Parece que te has perdido en el sistema. La página que buscas no existe o ha sido movida.
                    </p>
                </motion.div>

                {/* Actions */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="flex flex-col sm:flex-row items-center justify-center gap-4"
                >
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-slate-700 font-medium shadow-sm hover:shadow-md border border-slate-200 hover:border-indigo-100 transition-all group"
                    >
                        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                        <span>Regresar</span>
                    </button>

                    <button
                        onClick={() => navigate('/dashboard')}
                        className="flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 text-white font-medium shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:shadow-indigo-300 transition-all group"
                    >
                        <Home className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        <span>Ir al Inicio</span>
                    </button>
                </motion.div>
            </div>
        </div>
    );
};
