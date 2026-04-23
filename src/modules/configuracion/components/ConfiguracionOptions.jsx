import React from 'react';
import { Users, Shield, Map, Briefcase, ChevronRight, Syringe } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const CONFIGURACION_OPTIONS = [
    { 
        title: 'Gestión de Usuarios', 
        path: '/configuracion/usuarios', 
        icon: Users,
        color: 'text-indigo-600',
        description: 'Administración de cuentas y perfiles de acceso'
    },
    { 
        title: 'Gestión de Cargos', 
        path: '/configuracion/cargos', 
        icon: Shield,
        color: 'text-purple-600',
        description: 'Configuración de jerarquías y permisos'
    },
    { 
        title: 'Macroprocesos', 
        path: '/configuracion/macroprocesos', 
        icon: Map,
        color: 'text-emerald-600',
        description: 'Estructura organizacional de alto nivel'
    },
    { 
        title: 'Tipos de Contrato', 
        path: '/configuracion/tipo-contrato', 
        icon: Briefcase,
        color: 'text-blue-600',
        description: 'Modelos de contratación de personal'
    },
    { 
        title: 'Administración de Vacunas', 
        path: '/configuracion/vacunas', 
        icon: Syringe,
        color: 'text-rose-600',
        description: 'Configuración de perfiles biológicos y dosis requeridas'
    }
];

export const ConfiguracionOptions = ({ onClose }) => {
    const navigate = useNavigate();

    const options = [
        { 
            title: 'Gestión de Usuarios', 
            path: '/configuracion/usuarios', 
            icon: Users,
            color: 'text-indigo-600',
            bgColor: 'bg-indigo-50',
            description: 'Administración de cuentas y perfiles de acceso'
        },
        { 
            title: 'Gestión de Cargos', 
            path: '/configuracion/cargos', 
            icon: Shield,
            color: 'text-purple-600',
            bgColor: 'bg-purple-50',
            description: 'Configuración de jerarquías y permisos'
        },
        { 
            title: 'Macroprocesos', 
            path: '/configuracion/macroprocesos', 
            icon: Map,
            color: 'text-emerald-600',
            bgColor: 'bg-emerald-50',
            description: 'Estructura organizacional de alto nivel'
        },
        { 
            title: 'Tipos de Contrato', 
            path: '/configuracion/tipo-contrato', 
            icon: Briefcase,
            color: 'text-blue-600',
            bgColor: 'bg-blue-50',
            description: 'Modelos de contratación de personal'
        },
        { 
            title: 'Administración de Vacunas', 
            path: '/configuracion/vacunas', 
            icon: Syringe,
            color: 'text-rose-600',
            bgColor: 'bg-rose-50',
            description: 'Configuración de perfiles biológicos y dosis requeridas'
        }
    ];

    const handleNavigation = (path) => {
        navigate(path);
        if (onClose) onClose();
    };

    return (
        <div className="flex flex-col gap-3 w-full">
            {options.map((option, index) => {
                const Icon = option.icon;
                return (
                    <button
                        key={index}
                        onClick={() => handleNavigation(option.path)}
                        className="w-full flex items-center p-4 bg-white border border-slate-200 rounded-xl hover:border-indigo-300 hover:shadow-md transition-all group text-left"
                    >
                        <div className={`p-3 rounded-lg ${option.bgColor} ${option.color} mr-4 group-hover:scale-110 transition-transform`}>
                            <Icon size={24} strokeWidth={2} />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-bold text-slate-800 group-hover:text-indigo-600 transition-colors text-base">
                                {option.title}
                            </h3>
                            <p className="text-xs text-slate-500 mt-1">
                                {option.description}
                            </p>
                        </div>
                        <ChevronRight size={20} className="text-slate-400 group-hover:text-indigo-600 transition-colors" />
                    </button>
                );
            })}
        </div>
    );
};