import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Users, Cross, BookOpen, ChevronRight } from 'lucide-react';

export const TALENTO_HUMANO_OPTIONS = [
    { title: 'Hojas de Vida', icon: FileText, color: 'text-blue-600', bgColor: 'bg-blue-50', path: '/talentoHumano/hoja-de-vida', description: 'Gestión y registro de hojas de vida' },
    { title: 'Perfiles y Cargos', icon: Users, color: 'text-purple-600', bgColor: 'bg-purple-50', path: '/procesos/perfiles-cargo', description: 'Administración de perfiles y cargos' },
    { title: 'Incapacidades', icon: Cross, color: 'text-rose-600', bgColor: 'bg-rose-50', path: '/talentoHumano/incapacidades', description: 'Registro y control de incapacidades' },
    { title: 'Cursos', icon: BookOpen, color: 'text-emerald-600', bgColor: 'bg-emerald-50', path: '/talentoHumano/cursos', description: 'Gestión de cursos institucionales' }
];

export const TalentoHumanoOptions = ({ onClose }) => {
    const navigate = useNavigate();

    const handleNavigation = (path) => {
        navigate(path);
        if (onClose) onClose();
    };

    return (
        <div className="flex flex-col gap-3 w-full">
            {TALENTO_HUMANO_OPTIONS.map((option, index) => {
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
