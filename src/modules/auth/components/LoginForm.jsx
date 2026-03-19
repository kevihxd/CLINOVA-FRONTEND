import { useState } from 'react';
import { User, Lock, Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { login as loginService } from '../services/auth.service';
import { useAlert } from '../../../providers/AlertProvider';
import { useAuth } from '../../../providers/AuthProvider';

export const LoginForm = ({ onForgotPassword }) => {
    const navigate = useNavigate();
    const { showAlert } = useAlert();
    const { login } = useAuth();
    const [showPassword, setShowPassword] = useState(false);

    const [credentials, setCredentials] = useState({
        username: '',
        password: ''
    });

    const handleChange = (e) => {
        const { id, value } = e.target;
        setCredentials(prev => ({
            ...prev,
            [id]: value
        }));
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await loginService(credentials);
            const token = response.token;

            if (token) {
                showAlert({ message: "¡Bienvenido a Clinova!", status: "success" });
                login(token);
                
                setTimeout(() => {
                    navigate('/dashboard');
                }, 1500);
            } else {
                throw new Error("No se recibió el token de acceso");
            }

        } catch (error) {
            showAlert({
                message: "Usuario o contraseña incorrectos. Intente nuevamente.",
                status: "error"
            });
        }
    };

    return (
        <div className="w-full mx-auto space-y-6 animate-fade-in text-slate-700">
            <div className="space-y-4 text-center">
                <div className="inline-flex items-center justify-center p-3 bg-blue-50 rounded-full mb-2">
                    <User className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-slate-800">Acceso a la Plataforma</h2>
                    <p className="text-slate-500 text-sm mt-1">
                        Ingresa tus credenciales para continuar
                    </p>
                </div>
            </div>

            <form className="space-y-5 mt-6" onSubmit={handleLogin}>
                <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 ml-1" htmlFor="username">
                        Usuario
                    </label>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <User className="h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                        </div>
                        <input
                            id="username"
                            value={credentials.username}
                            onChange={handleChange}
                            className="flex h-12 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 pl-10 text-sm placeholder:text-slate-400 focus:bg-white focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all duration-300"
                            placeholder="Ej. usuario.empresa"
                            type="text"
                            required
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 ml-1" htmlFor="password">
                        Contraseña
                    </label>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                        </div>
                        <input
                            id="password"
                            value={credentials.password}
                            onChange={handleChange}
                            className="flex h-12 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 pl-10 pr-10 text-sm placeholder:text-slate-400 focus:bg-white focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all duration-300"
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-2.5 text-slate-400 hover:text-blue-600 transition-colors bg-transparent rounded-full p-1 hover:bg-blue-50"
                        >
                            {showPassword ? (
                                <EyeOff className="h-4 w-4" />
                            ) : (
                                <Eye className="h-4 w-4" />
                            )}
                        </button>
                    </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center space-x-2 group cursor-pointer">
                        <input
                            type="checkbox"
                            id="remember"
                            className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                        <label
                            htmlFor="remember"
                            className="text-sm font-medium leading-none text-slate-500 group-hover:text-slate-700 transition-colors cursor-pointer"
                        >
                            Recordarme
                        </label>
                    </div>
                    <button
                        type="button"
                        onClick={onForgotPassword}
                        className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors hover:underline underline-offset-4"
                    >
                        ¿Olvidaste tu clave?
                    </button>
                </div>

                <button
                    type="submit"
                    className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-lg shadow-blue-500/30 transition-all duration-300 transform hover:-translate-y-0.5"
                >
                    <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                        <Lock className="h-5 w-5 text-blue-300 group-hover:text-blue-200" aria-hidden="true" />
                    </span>
                    Iniciar Sesión Segura
                </button>
            </form>
        </div>
    );
};