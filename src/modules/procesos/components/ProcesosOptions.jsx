import React from 'react';
import { Map, Settings, List, UserCircle, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const PROCESOS_OPTIONS = [
    { 
        title: 'Mapa de Procesos', 
        path: '/procesos/mapa', 
        icon: Map,
        color: 'text-blue-600',
        description: 'Visualización gráfica de los procesos'
    },
    { 
        title: 'Tipos de Documento', 
        path: '/procesos/tipos-documentos', 
        icon: Settings,
        color: 'text-indigo-600',
        description: 'Configuración de tipos documentales'
    },
    { 
        title: 'Listado Único', 
        path: '/procesos/listado-unico', 
        icon: List,
        color: 'text-emerald-600',
        description: 'Control central de documentos'
    },
    { 
        title: 'Perfiles de Cargo', 
        path: '/procesos/perfiles-cargo', 
        icon: UserCircle,
        color: 'text-purple-600',
        description: 'Gestión de perfiles y requisitos'
    }
];

export const ProcesosOptions = ({ onClose }) => {
    const navigate = useNavigate();

    const options = [
        { 
            title: 'Mapa de Procesos', 
            path: '/procesos/mapa', 
            icon: Map,
            color: 'text-blue-600',
            bgColor: 'bg-blue-50',
            description: 'Visualización gráfica de los procesos'
        },
        { 
            title: 'Tipos de Documento', 
            path: '/procesos/tipos-documentos', 
            icon: Settings,
            color: 'text-indigo-600',
            bgColor: 'bg-indigo-50',
            description: 'Configuración de tipos documentales'
        },
        { 
            title: 'Listado Único', 
            path: '/procesos/listado-unico', 
            icon: List,
            color: 'text-emerald-600',
            bgColor: 'bg-emerald-50',
            description: 'Control central de documentos'
        },
        { 
            title: 'Perfiles de Cargo', 
            path: '/procesos/perfiles-cargo', 
            icon: UserCircle,
            color: 'text-purple-600',
            bgColor: 'bg-purple-50',
            description: 'Gestión de perfiles y requisitos'
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