import { LayoutTemplate, FileType, List } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

export const PROCESOS_OPTIONS = [
    { title: 'Mapa de Procesos', icon: LayoutTemplate, color: 'text-blue-600', bg: 'bg-blue-50', page: '/procesos/mapa' },
    { title: 'Tipos de Documento', icon: FileType, color: 'text-indigo-600', bg: 'bg-indigo-50', page: '/procesos/tipos-documentos' },
    { title: 'Listado Único', icon: List, color: 'text-emerald-600', bg: 'bg-emerald-50', page: '/procesos/listado-unico' },
];

export const ProcesosOptions = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const handleNavigation = (path) => {
        if (location.pathname !== path) {
            navigate(path);
        }
    };

    return (
        <div className="grid grid-cols-1 gap-4 p-4">
            {PROCESOS_OPTIONS.map((opt, idx) => (
                <button
                    key={idx}
                    onClick={() => handleNavigation(opt.page)}
                    className="flex items-center gap-4 p-4 bg-white border border-slate-100 rounded-xl shadow-sm hover:shadow-md hover:border-blue-100 transition-all group text-left"
                >
                    <div className={`p-3 rounded-lg ${opt.bg} ${opt.color} group-hover:scale-110 transition-transform`}>
                        <opt.icon size={20} />
                    </div>
                    <div>
                        <h4 className="font-semibold text-slate-800">{opt.title}</h4>
                        <p className="text-xs text-slate-400">Acceder a {opt.title.toLowerCase()}</p>
                    </div>
                </button>
            ))}
        </div>
    );
};