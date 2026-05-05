import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FileText, LayoutTemplate, FilePlus, FileBarChart, ChevronRight } from 'lucide-react';

export const ACTAS_INFORMES_OPTIONS = [
    { title: 'Gestión de Actas', label: 'Gestión de Actas', icon: FileText, color: 'text-blue-600', bgColor: 'bg-blue-50', page: '/actas-informes/gestion', path: '/actas-informes/gestion', description: 'Administración y seguimiento de actas' },
    { title: 'Crear Acta', label: 'Crear Acta', icon: FilePlus, color: 'text-green-600', bgColor: 'bg-green-50', page: '/actas-informes/crear-acta', path: '/actas-informes/crear-acta', description: 'Registro de nuevas actas' },
    { title: 'Plantillas Maestras', label: 'Plantillas Maestras', icon: LayoutTemplate, color: 'text-purple-600', bgColor: 'bg-purple-50', page: '/actas-informes/crear-plantilla', path: '/actas-informes/crear-plantilla', description: 'Configuración de formatos base' },
    { title: 'Informes', label: 'Informes', icon: FileBarChart, color: 'text-orange-600', bgColor: 'bg-orange-50', page: '/actas-informes/informes', path: '/actas-informes/informes', description: 'Visualización de reportes y estadísticas' }
];

export const ActasInformesOptions = ({ onClose }) => {
    const navigate = useNavigate();

    const handleNavigation = (path) => {
        navigate(path);
        if (onClose) onClose();
    };

    return (
        <div className="flex flex-col gap-3 w-full">
            {ACTAS_INFORMES_OPTIONS.map((option, index) => {
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