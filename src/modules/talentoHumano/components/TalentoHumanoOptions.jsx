import { FilePlus, Users, FileSignature } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ROUTES } from '../../../router/routes.const';

export const TALENTO_HUMANO_OPTIONS = [
    { title: 'Perfiles de Cargo', icon: FilePlus, color: 'text-indigo-600', bg: 'bg-indigo-50', page: ROUTES.TALENTO_HUMANO.PERFIL_CARGO.path },
    { title: 'Hoja de Vida', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50', page: ROUTES.TALENTO_HUMANO.HOJA_VIDA.path },
    { title: 'Organigrama', icon: FileSignature, color: 'text-orange-600', bg: 'bg-orange-50', page: ROUTES.TALENTO_HUMANO.ORGANIGRAMA.path },
];

export const TalentoHumanoOptions = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const options = TALENTO_HUMANO_OPTIONS;

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
                    className="flex items-center gap-4 p-4 bg-white border border-slate-100 rounded-xl shadow-sm hover:shadow-md hover:border-indigo-100 transition-all group text-left"
                >
                    <div className={`p-3 rounded-lg ${opt.bg} ${opt.color} group-hover:scale-110 transition-transform`}>
                        <opt.icon size={20} />
                    </div>
                    <div>
                        <h4 className="font-semibold text-slate-800">{opt.title}</h4>
                        <p className="text-xs text-slate-400">Gestionar {opt.title.toLowerCase()}</p>
                    </div>
                </button>
            ))}
        </div>
    );
};
