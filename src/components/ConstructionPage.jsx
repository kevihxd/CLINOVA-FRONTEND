import { useLocation, useNavigate } from 'react-router-dom';
import { Construction } from 'lucide-react';

const ConstructionPage = ({ title }) => {
    const location = useLocation();
    const navigate = useNavigate();

    return (
        <div className="flex flex-col items-center justify-center h-full text-slate-400 p-8 text-center">
            <div className="p-4 bg-slate-100 rounded-full mb-4">
                <Construction size={48} className="text-slate-400" />
            </div>
            <h2 className="text-2xl font-bold text-slate-700 mb-2">En Construcción</h2>
            <p className="max-w-md mb-6">
                La página <strong>{title || location.pathname}</strong> está siendo desarrollada.
                Pronto estará disponible.
            </p>
            <button
                onClick={() => navigate(-1)}
                className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition"
            >
                Regresar
            </button>
        </div>
    );
};

export default ConstructionPage;
