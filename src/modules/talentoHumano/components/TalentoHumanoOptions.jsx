import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../../router/routes.const';
import { FileText, Users, HeartPulse, GraduationCap } from 'lucide-react';
import { useAuth } from '../../../providers/AuthProvider';

export const TalentoHumanoOptions = ({ onClose }) => {
    const navigate = useNavigate();
    const { user } = useAuth();

    const authorities = user?.permisos || user?.authorities || [];
    const roleString = user?.rol || '';
    const isAdminOrHR =
        authorities.includes('ROLE_ADMIN') || authorities.includes('ADMIN') ||
        authorities.includes('ROLE_HR_MANAGER') || authorities.includes('HR_MANAGER') ||
        roleString.includes('ADMIN') || roleString.includes('HR_MANAGER');

    const handleNavigation = (path) => {
        navigate(path);
        if (onClose) onClose();
    };

    return (
        <div className="flex flex-col gap-3 w-full">
            
            {/* Opción visible para TODOS los usuarios */}
            <button
                onClick={() => handleNavigation(ROUTES.TALENTO_HUMANO.HOJA_VIDA.path)}
                className="w-full flex items-center p-4 bg-white border border-slate-200 rounded-xl hover:border-blue-300 hover:shadow-md transition-all group text-left"
            >
                <div className="p-3 bg-blue-50 rounded-lg text-blue-600 mr-4 group-hover:scale-110 transition-transform">
                    <FileText size={24} strokeWidth={2} />
                </div>
                <div className="flex-1">
                    <h3 className="font-bold text-slate-800 group-hover:text-blue-600 transition-colors text-base">
                        Hoja de Vida
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                        Gestión de tu información personal y profesional
                    </p>
                </div>
            </button>

            {/* Opciones Restringidas (Solo roles administrativos) */}
            {isAdminOrHR && (
                <>
                    <button
                        onClick={() => handleNavigation(ROUTES.PROCESOS.PERFILES_CARGO.path)}
                        className="w-full flex items-center p-4 bg-white border border-slate-200 rounded-xl hover:border-indigo-300 hover:shadow-md transition-all group text-left"
                    >
                        <div className="p-3 bg-indigo-50 rounded-lg text-indigo-600 mr-4 group-hover:scale-110 transition-transform">
                            <Users size={24} strokeWidth={2} />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-bold text-slate-800 group-hover:text-indigo-600 transition-colors text-base">
                                Perfiles y Cargos
                            </h3>
                            <p className="text-xs text-slate-500 mt-1">
                                Administración de perfiles y roles institucionales
                            </p>
                        </div>
                    </button>

                    <button
                        onClick={() => handleNavigation(ROUTES.TALENTO_HUMANO.INCAPACIDADES.path)}
                        className="w-full flex items-center p-4 bg-white border border-slate-200 rounded-xl hover:border-red-300 hover:shadow-md transition-all group text-left"
                    >
                        <div className="p-3 bg-red-50 rounded-lg text-red-600 mr-4 group-hover:scale-110 transition-transform">
                            <HeartPulse size={24} strokeWidth={2} />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-bold text-slate-800 group-hover:text-red-600 transition-colors text-base">
                                Incapacidades
                            </h3>
                            <p className="text-xs text-slate-500 mt-1">
                                Registro y control de ausentismos médicos
                            </p>
                        </div>
                    </button>

                    <button
                        onClick={() => handleNavigation(ROUTES.TALENTO_HUMANO.CURSOS.path)}
                        className="w-full flex items-center p-4 bg-white border border-slate-200 rounded-xl hover:border-amber-300 hover:shadow-md transition-all group text-left"
                    >
                        <div className="p-3 bg-amber-50 rounded-lg text-amber-600 mr-4 group-hover:scale-110 transition-transform">
                            <GraduationCap size={24} strokeWidth={2} />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-bold text-slate-800 group-hover:text-amber-600 transition-colors text-base">
                                Cursos
                            </h3>
                            <p className="text-xs text-slate-500 mt-1">
                                Gestión de capacitaciones y certificaciones
                            </p>
                        </div>
                    </button>
                </>
            )}

        </div>
    );
};

export default TalentoHumanoOptions;
