import { useState, useMemo } from 'react';
import { ArrowLeft, Search, Settings, ChevronLeft, ChevronRight, FileText, Filter, Plus, Calendar, User, Code } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { CreateTipoContrato } from '../components/CreateTipoContrato';

// Mock Data
const TIPO_CODIGO = {
    'Término Indefinido': 'NOMINA',
    'Término Fijo': 'TF',
    'Prestación de Servicios': 'OPS',
    'Obra o Labor': 'OL',
    'Aprendizaje': 'AP'
};

const MOCK_DATA = Array.from({ length: 5 }, (_, i) => {
    const nombre = [
        'Término Indefinido',
        'Término Fijo',
        'Prestación de Servicios',
        'Obra o Labor',
        'Aprendizaje'
    ][i % 5];

    return {
        id: i + 1,
        nombre,
        descripcion: 'Contrato estándar para vinculación laboral directa con la empresa.',
        codigo: TIPO_CODIGO[nombre],
        activo: true,
        fecha_creacion: '2024-01-20 08:30:00',
        fecha_modificacion: '2024-03-25 10:15:00',
        creado_por: 1,
        modificado_por: 1
    };
});


export const TipoContrato = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    // Filtrar y Paginar
    const filteredData = useMemo(() => {
        return MOCK_DATA.filter(item =>
            item.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.codigo.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [searchTerm]);

    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentItems = filteredData.slice(startIndex, startIndex + itemsPerPage);

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50/50 p-6 md:p-8 animate-fade-in">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 bg-white text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full border border-slate-200 shadow-sm transition-all"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Tipo de Contrato</h1>
                        <p className="text-sm text-slate-500 font-medium">Gestión de modalidades de contratación</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 bg-white text-slate-600 border border-slate-200 rounded-lg shadow-sm hover:bg-slate-50 hover:text-slate-900 transition-all font-medium text-sm">
                        <Settings className="w-4 h-4" />
                        <span>Configuración</span>
                    </button>
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition-all font-medium text-sm"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Nuevo Contrato</span>
                    </button>
                </div>
            </div>

            {/* Table Container */}
            <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-100 overflow-hidden">

                {/* Controls Bar */}
                <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row gap-4 justify-between items-center bg-white">
                    <div className="relative w-full sm:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Buscar por nombre o código..."
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
                        />
                    </div>

                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                            <span>Mostrar:</span>
                            <select
                                value={itemsPerPage}
                                onChange={(e) => {
                                    setItemsPerPage(Number(e.target.value));
                                    setCurrentPage(1);
                                }}
                                className="bg-slate-50 border border-slate-200 rounded-md py-1.5 px-3 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm font-medium cursor-pointer"
                            >
                                <option value={10}>10</option>
                                <option value={20}>20</option>
                                <option value={50}>50</option>
                            </select>
                        </div>
                        <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-100">
                            <Filter className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-slate-50/80 border-b border-slate-100">
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Nombre</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Código</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Descripción</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Estado</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Creación</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {currentItems.map((item) => (
                                <tr key={item.id} className="hover:bg-blue-50/30 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                                <FileText className="w-4 h-4" />
                                            </div>
                                            <span className="text-sm font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                                                {item.nombre}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-1.5 bg-slate-100 px-2 py-1 rounded w-fit">
                                            <span className="text-xs font-mono font-medium text-slate-600">
                                                {item.codigo}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-sm text-slate-500 line-clamp-1 max-w-[200px]" title={item.descripcion}>
                                            {item.descripcion}
                                        </p>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`
                                            px-2.5 py-1 rounded-full text-xs font-semibold border
                                            ${item.activo
                                                ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                                                : 'bg-rose-50 text-rose-600 border-rose-100'}
                                        `}>
                                            {item.activo ? 'Activo' : 'Inactivo'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                                <Calendar className="w-3 h-3" />
                                                <span>{item.fecha_creacion.split(' ')[0]}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5 text-xs text-slate-400">
                                                <User className="w-3 h-3" />
                                                <span>ID: {item.creado_por}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button className="text-blue-600 hover:text-blue-900 font-medium hover:underline">
                                            Editar
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {currentItems.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-slate-400">
                                        <div className="flex flex-col items-center justify-center gap-2">
                                            <Filter className="w-8 h-8 opacity-20" />
                                            <p>No se encontraron registros con ese criterio.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Footer */}
                <div className="bg-white px-6 py-4 border-t border-slate-100 flex items-center justify-between">
                    <p className="text-sm text-slate-500">
                        Mostrando <span className="font-medium text-slate-900">{filteredData.length > 0 ? startIndex + 1 : 0}</span> a <span className="font-medium text-slate-900">{Math.min(startIndex + itemsPerPage, filteredData.length)}</span> de <span className="font-medium text-slate-900">{filteredData.length}</span> resultados
                    </p>
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="p-2 rounded-md hover:bg-slate-100 text-slate-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <div className="flex items-center px-2">
                            {Array.from({ length: totalPages }, (_, i) => i + 1)
                                .filter(page => page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1)
                                .map((page, index, array) => (
                                    <div key={page} className="flex items-center">
                                        {index > 0 && array[index - 1] !== page - 1 && <span className="px-2 text-slate-400">...</span>}
                                        <button
                                            onClick={() => handlePageChange(page)}
                                            className={`
                                                min-w-[32px] h-8 flex items-center justify-center rounded-md text-sm font-medium transition-all mx-0.5
                                                ${currentPage === page
                                                    ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                                                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}
                                            `}
                                        >
                                            {page}
                                        </button>
                                    </div>
                                ))
                            }
                        </div>
                        <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="p-2 rounded-md hover:bg-slate-100 text-slate-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Modals */}
            <CreateTipoContrato
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
            />
        </div>
    );
};