import { Mail, ArrowLeft, KeyRound } from 'lucide-react';

export const RecoverPassword = ({ onBack }) => {
    return (
        <div className="w-full mx-auto space-y-6 animate-fade-in text-slate-700">
            <div className="space-y-4 text-center">
                 <div className="inline-flex items-center justify-center p-3 bg-blue-50 rounded-full mb-2">
                    <Mail className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-slate-800">Recuperación</h2>
                    <p className="text-slate-500 text-sm mt-1">
                        Ingresa tu correo para restablecer tu contraseña
                    </p>
                </div>
            </div>

            <form className="space-y-6 mt-4" onSubmit={(e) => e.preventDefault()}>
                <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 ml-1" htmlFor="recovery-email">
                        Correo Electrónico
                    </label>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Mail className="h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                        </div>
                        <input
                            id="recovery-email"
                            className="flex h-12 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 pl-10 text-sm placeholder:text-slate-400 focus:bg-white focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all duration-300"
                            placeholder="nombre@empresa.com"
                            type="email"
                        />
                    </div>
                </div>
                

                <button
                    className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-lg shadow-blue-500/30 transition-all duration-300 transform hover:-translate-y-0.5"
                    type="submit"
                >
                    Enviar Instrucciones
                </button>

                <button
                    type="button"
                    onClick={onBack}
                    className="group flex w-full items-center justify-center gap-2 text-sm font-medium text-slate-500 hover:text-blue-700 transition-colors mt-2"
                >
                    <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                    Volver al inicio de sesión
                </button>
            </form>

            {/* Info Box - Modernized */}
            <div className="rounded-xl bg-blue-50/50 p-4 border border-blue-100">
                <div className="flex items-start gap-3">
                    <KeyRound className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-blue-900/80">
                        <p className="font-semibold text-blue-900">¿Necesitas ayuda?</p>
                        <p className="mt-1 leading-relaxed">
                            Si no tienes acceso a tu correo, contacta directamente con el administrador del sistema.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
