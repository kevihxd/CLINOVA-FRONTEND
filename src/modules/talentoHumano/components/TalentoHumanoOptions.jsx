import { Users, FileSpreadsheet } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../providers/AuthProvider';

export const TALENTO_HUMANO_OPTIONS = [
    { title: 'Hoja de Vida', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50', page: '/talentoHumano/hoja-de-vida' },
    { title: 'Importar Vacunas', icon: FileSpreadsheet, color: 'text-green-600', bg: 'bg-green-50', page: '/talentoHumano/importar-vacunas' }
];

export const TalentoHumanoOptions = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();

    const userRole = String(user?.role || user?.rol || user?.roles?.[0] || 'USER').toUpperCase(); 
    const isAuthorized = userRole === 'ADMIN' || userRole === 'HR_MANAGER';

    const allowedOptions = TALENTO_HUMANO_OPTIONS.filter(opt => {
        if (opt.title === 'Hoja de Vida') return true;
        return isAuthorized;
    });

    const handleNavigation = (path) => {
        if (location.pathname !== path) {
            navigate(path);
        }
    };

    return (
        <div className="grid grid-cols-1 gap-4 p-4">
            {allowedOptions.map((opt, idx) => (
                <button
                    key={idx}
                    onClick={() => handleNavigation(opt.page)}
                    className="flex items-center gap-4 p-4 bg-white border border-slate-100 rounded-xl shadow-sm hover:shadow-md hover:border-indigo-100 transition-all group text-left w-full"
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