import { ClipboardCheck, AlertTriangle, BarChart3, FileText, FilePlus, FileCheck, Trash2, List, Globe, PenTool, BookOpen } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ROUTES } from '../../../router/routes.const';
export const CALIDAD_OPTIONS = [
    { title: 'Tipos de Documento', icon: FileText, color: 'text-indigo-600', bg: 'bg-indigo-50', page: ROUTES.CALIDAD.TIPOS_DOCUMENTO.path },
    { title: 'Solicitar Documento', icon: FilePlus, color: 'text-blue-600', bg: 'bg-blue-50', page: ROUTES.CALIDAD.SOLICITAR_DOCUMENTO.path },
    { title: 'Revisión por documento', icon: FileCheck, color: 'text-emerald-600', bg: 'bg-emerald-50', page: ROUTES.CALIDAD.REVISION_DOCUMENTO.path },
    { title: 'Reportes', icon: BarChart3, color: 'text-violet-600', bg: 'bg-violet-50', page: ROUTES.CALIDAD.REPORTES.path },
    { title: 'Papelera de Reciclaje', icon: Trash2, color: 'text-red-600', bg: 'bg-red-50', page: ROUTES.CALIDAD.PAPELERA.path },
    { title: 'Listado único', icon: List, color: 'text-slate-600', bg: 'bg-slate-50', page: ROUTES.CALIDAD.LISTADO_UNICO.path },
    { title: 'Documentos Externos', icon: Globe, color: 'text-cyan-600', bg: 'bg-cyan-50', page: ROUTES.CALIDAD.DOCUMENTOS_EXTERNOS.path },
    { title: 'Diligenciar Formato', icon: PenTool, color: 'text-amber-600', bg: 'bg-amber-50', page: ROUTES.CALIDAD.DILIGENCIAR_FORMATO.path },
    { title: 'Definiciones', icon: BookOpen, color: 'text-fuchsia-600', bg: 'bg-fuchsia-50', page: ROUTES.CALIDAD.DEFINICIONES.path },
];

export const CalidadOptions = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const options = CALIDAD_OPTIONS;

    const handleNavigation = (path) => {
        if (location.pathname !== path) {
            navigate(path);
        }
    };

    return (
        <div className="grid grid-cols-1 gap-4 p-4">
            {options.map((opt, idx) => (
                <button
                    key={idx}
                    onClick={() => handleNavigation(opt.page)}
                    className="flex items-center gap-4 p-4 bg-white border border-slate-100 rounded-xl shadow-sm hover:shadow-md hover:border-emerald-100 transition-all group text-left"
                >
                    <div className={`p-3 rounded-lg ${opt.bg} ${opt.color} group-hover:scale-110 transition-transform`}>
                        <opt.icon size={20} />
                    </div>
                    <div>
                        <h4 className="font-semibold text-slate-800">{opt.title}</h4>
                        <p className="text-xs text-slate-400">Ver panel de {opt.title.toLowerCase()}</p>
                    </div>
                </button>
            ))}
        </div>
    );
};
