import React, { useState } from 'react';
import { ShieldAlert, KeyRound, CheckCircle2 } from 'lucide-react';
import { useApiMutation } from '../../../hooks/useApi';

export const CambioPasswordObligatorio = ({ onPasswordChanged }) => {
    const [nuevaPassword, setNuevaPassword] = useState('');
    const [confirmarPassword, setConfirmarPassword] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const [success, setSuccess] = useState(false);
    
    const { mutate, loading } = useApiMutation();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg('');

        if (nuevaPassword.length < 8) {
            setErrorMsg('La contraseña debe tener al menos 8 caracteres.');
            return;
        }

        if (nuevaPassword !== confirmarPassword) {
            setErrorMsg('Las contraseñas no coinciden.');
            return;
        }

        const { error } = await mutate('post', '/usuarios/cambiar-password', { nuevaPassword });

        if (error) {
            setErrorMsg(error);
        } else {
            setSuccess(true);
            setTimeout(() => {
                if (onPasswordChanged) onPasswordChanged();
                window.location.reload();
            }, 2000);
        }
    };

    return (
        <div className="fixed inset-0 z-[9999] bg-slate-900/90 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-300">
                <div className="bg-amber-500 p-6 flex flex-col items-center justify-center text-white relative">
                    <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white to-transparent" />
                    <ShieldAlert size={48} className="mb-3 relative z-10" strokeWidth={1.5} />
                    <h2 className="text-2xl font-bold relative z-10">¡Cambio de Contraseña Requerido!</h2>
                    <p className="text-amber-50 text-center mt-2 text-sm relative z-10">
                        Por seguridad, debes cambiar tu contraseña predeterminada antes de continuar usando el sistema.
                    </p>
                </div>

                <div className="p-6 md:p-8">
                    {success ? (
                        <div className="flex flex-col items-center justify-center py-6">
                            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4">
                                <CheckCircle2 size={32} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-800">¡Contraseña Actualizada!</h3>
                            <p className="text-slate-500 text-center mt-2">
                                Redirigiendo al sistema...
                            </p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-5">
                            {errorMsg && (
                                <div className="p-3 bg-red-50 text-red-600 border border-red-200 rounded-lg text-sm font-medium">
                                    {errorMsg}
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">
                                    Nueva Contraseña
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                        <KeyRound size={18} />
                                    </div>
                                    <input
                                        type="password"
                                        required
                                        value={nuevaPassword}
                                        onChange={(e) => setNuevaPassword(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 text-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                                        placeholder="Mínimo 8 caracteres"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">
                                    Confirmar Contraseña
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                        <KeyRound size={18} />
                                    </div>
                                    <input
                                        type="password"
                                        required
                                        value={confirmarPassword}
                                        onChange={(e) => setConfirmarPassword(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 text-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                                        placeholder="Vuelve a escribir la contraseña"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-2.5 px-4 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2 mt-2"
                            >
                                {loading ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : 'Guardar y Continuar'}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};
