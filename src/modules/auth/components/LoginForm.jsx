import { useState } from 'react';
import { Lock, Mail, Eye, EyeOff, Loader2, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { login as loginService } from '../services/auth.service';
import { useAlert } from '../../../providers/AlertProvider';
import { useAuth } from '../../../providers/AuthProvider';

export const LoginForm = ({ onForgotPassword }) => {
    const navigate = useNavigate();
    const { showAlert } = useAlert();
    const { login } = useAuth();
    
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [credentials, setCredentials] = useState({
        username: '',
        password: ''
    });

    const handleChange = (e) => {
        const { id, value } = e.target;
        setCredentials(prev => ({ ...prev, [id]: value }));
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        if (!credentials.username || !credentials.password) return;

        setIsLoading(true);
        try {
            const response = await loginService(credentials);
            const token = response.token;

            if (token) {
                showAlert({ message: "Autenticación exitosa", status: "success" });
                login(token);
                setTimeout(() => navigate('/dashboard'), 800);
            } else {
                throw new Error("Token no recibido");
            }
        } catch (error) {
            showAlert({ message: "Credenciales inválidas. Verifique e intente nuevamente.", status: "error" });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full flex flex-col h-full justify-center">
            <div className="mb-8">
                <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">Iniciar sesión</h2>
                <p className="text-slate-500 text-sm mt-1.5 font-medium">Ingrese sus credenciales</p>
            </div>

            <form className="space-y-5" onSubmit={handleLogin}>
                <div className="space-y-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500 ml-1" htmlFor="username">
                        Usuario
                    </label>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                            <Mail className="h-4.5 w-4.5 text-slate-400 group-focus-within:text-[#1a559e] transition-colors" />
                        </div>
                        <input
                            id="username"
                            type="text"
                            value={credentials.username}
                            onChange={handleChange}
                            disabled={isLoading}
                            className="block w-full h-11 pl-10 pr-3 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-[#1a559e] focus:ring-4 focus:ring-[#1a559e]/10 outline-none transition-all disabled:opacity-60"
                            placeholder="usuario.empresa"
                            required
                        />
                    </div>
                </div>

                <div className="space-y-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500 ml-1" htmlFor="password">
                        Contraseña
                    </label>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                            <Lock className="h-4.5 w-4.5 text-slate-400 group-focus-within:text-[#1a559e] transition-colors" />
                        </div>
                        <input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            value={credentials.password}
                            onChange={handleChange}
                            disabled={isLoading}
                            className="block w-full h-11 pl-10 pr-10 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-[#1a559e] focus:ring-4 focus:ring-[#1a559e]/10 outline-none transition-all disabled:opacity-60 font-medium"
                            placeholder="••••••••"
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            disabled={isLoading}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#1a559e] p-1.5 rounded-lg hover:bg-[#1a559e]/5 transition-colors disabled:opacity-50"
                            tabIndex="-1"
                        >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                    </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                    <label className="flex items-center gap-2 cursor-pointer group">
                        <input
                            type="checkbox"
                            disabled={isLoading}
                            className="w-4 h-4 rounded border-slate-300 text-[#1a559e] focus:ring-[#1a559e]/20 disabled:opacity-60 cursor-pointer"
                        />
                        <span className="text-sm font-medium text-slate-600 group-hover:text-slate-900 transition-colors">Recordarme</span>
                    </label>
                    <button
                        type="button"
                        onClick={onForgotPassword}
                        disabled={isLoading}
                        className="text-sm font-semibold text-[#1a559e] hover:text-[#123e75] transition-colors disabled:opacity-60"
                    >
                        ¿Olvidó su clave?
                    </button>
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className="relative w-full h-11 flex items-center justify-center gap-2 mt-4 bg-gradient-to-r from-[#1a559e] to-[#123e75] hover:from-[#123e75] hover:to-[#0c2b54] text-white rounded-xl text-sm font-semibold transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed group overflow-hidden shadow-lg shadow-blue-900/20"
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Autenticando...</span>
                        </>
                    ) : (
                        <>
                            <span>Ingresar al sistema</span>
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </>
                    )}
                </button>
            </form>
        </div>
    );
};