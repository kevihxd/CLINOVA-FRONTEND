import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../../router/routes.const';
import { FileText, Users, Briefcase } from 'lucide-react';
import { useAuth } from '../../../providers/AuthProvider';

export const HojaVidaOptions = ({ onClose }) => {
    const navigate = useNavigate();
    const { user } = useAuth();

    const authorities = user?.permisos || user?.authorities || [];
    const roleString = String(user?.rol || user?.role || '').toUpperCase();
    const isAdminOrHR =
        authorities.includes('ROLE_ADMIN') || authorities.includes('ADMIN') ||
        authorities.includes('ROLE_HR_MANAGER') || authorities.includes('HR_MANAGER') ||
        authorities.includes('ROLE_LIDER_DE_PROCESO') || authorities.includes('LIDER_DE_PROCESO') ||
        roleString.includes('ADMIN') || roleString.includes('HR_MANAGER') || roleString.includes('LIDER_DE_PROCESO');

    const handleNavigation = (path) => {
        navigate(path);
        if (onClose) onClose();
    };

    return (
        <div className="flex flex-col gap-3 w-full">
            {isAdminOrHR ? (
                <>
                    <button
                        onClick={() => handleNavigation(ROUTES.HOJAS_DE_VIDA.NOMINA.path)}
                        className="w-full flex items-center p-4 bg-white border border-slate-200 rounded-xl hover:border-teal-400 hover:shadow-md transition-all group text-left"
                    >
                        <div className="p-3 bg-teal-50 rounded-lg text-teal-600 mr-4 group-hover:scale-110 transition-transform">
                            <Users size={24} strokeWidth={2} />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-bold text-slate-800 group-hover:text-teal-600 transition-colors text-base uppercase">
                                Nómina
                            </h3>
                            <p className="text-xs text-slate-500 mt-1">
                                Hojas de Vida de personal contratado por nómina
                            </p>
                        </div>
                    </button>

                    <button
                        onClick={() => handleNavigation(ROUTES.HOJAS_DE_VIDA.PROVEEDORES.path)}
                        className="w-full flex items-center p-4 bg-white border border-slate-200 rounded-xl hover:border-indigo-400 hover:shadow-md transition-all group text-left"
                    >
                        <div className="p-3 bg-indigo-50 rounded-lg text-indigo-600 mr-4 group-hover:scale-110 transition-transform">
                            <Briefcase size={24} strokeWidth={2} />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-bold text-slate-800 group-hover:text-indigo-600 transition-colors text-base uppercase">
                                Proveedores (OPS)
                            </h3>
                            <p className="text-xs text-slate-500 mt-1">
                                Hojas de Vida de contratistas y prestación de servicios
                            </p>
                        </div>
                    </button>
                </>
            ) : (
                <button
                    onClick={() => handleNavigation('/talentoHumano/hoja-de-vida')}
                    className="w-full flex items-center p-4 bg-white border border-slate-200 rounded-xl hover:border-blue-300 hover:shadow-md transition-all group text-left"
                >
                    <div className="p-3 bg-blue-50 rounded-lg text-blue-600 mr-4 group-hover:scale-110 transition-transform">
                        <FileText size={24} strokeWidth={2} />
                    </div>
                    <div className="flex-1">
                        <h3 className="font-bold text-slate-800 group-hover:text-blue-600 transition-colors text-base">
                            Mi Hoja de Vida
                        </h3>
                        <p className="text-xs text-slate-500 mt-1">
                            Ver y gestionar mi información personal y profesional
                        </p>
                    </div>
                </button>
            )}
        </div>
    );
};
