import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FileSearch, Users2, Scale, ChevronRight } from 'lucide-react';

export const CONTEXTO_OPTIONS = [
    { 
        title: 'Análisis de Contexto', 
        path: '/contexto/analisis', 
        icon: FileSearch, 
        color: 'text-blue-600', 
        bgColor: 'bg-blue-50', 
        description: 'Gestión y evaluación del contexto organizacional' 
    },
    { 
        title: 'Partes Interesadas', 
        path: '/contexto/partes', 
        icon: Users2, 
        color: 'text-green-600', 
        bgColor: 'bg-green-50', 
        description: 'Administración de partes interesadas e impacto' 
    },
    { 
        title: 'Requisitos Legales', 
        path: '/contexto/requisitos', 
        icon: Scale, 
        color: 'text-purple-600', 
        bgColor: 'bg-purple-50', 
        description: 'Matriz de cumplimiento y normativas' 
    }
];

export const ContextoOptions = ({ onClose }) => {
    const navigate = useNavigate();

    const handleNavigation = (path) => {
        navigate(path);
        if (onClose) onClose();
    };

    return (
        <div className="flex flex-col gap-3 w-full">
            {CONTEXTO_OPTIONS.map((option, index) => {
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
