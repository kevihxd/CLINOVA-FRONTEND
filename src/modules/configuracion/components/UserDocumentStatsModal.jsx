import { X, Search, Filter, Eye, Printer, Download, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, useMemo } from 'react';


const MOCK_STATS_DATA = Array.from({ length: 15 }, (_, i) => ({
    id: 1000 + i,
    nombre: [
        'PROCEDIMIENTO MICRONEBULIZACIONES',
        'PROCEDIMIENTO CATETERISMO VESICAL',
        'PROCEDIMIENTO SONDAJE NASOGATRICO',
        'PROCEDIMIENTO SUEROTERAPIA',
        'PROCEDIMIENTO VENOPUNCION PERIFERICA',
        'RECOMENDACIONES PARA PACIENTES CON ARTRITIS',
        'HIGIENE DEL PACIENTE EN CAMA',
        'NOTAS DE ENFERMERIA',
        'RUTA DE ATENCION AL PACIENTE CRITICO',
        'TEST DE DIBUJO DE LA FIGURA HUMANA',
        'INSTRUMENTO APGAR FAMILIAR',
        'TARJETA DE MEDICAMENTOS PAD',
        'PROTOCOLO DE BIOSEGURIDAD',
        'MANUAL DE USUARIO',
        'POLITICA DE CALIDAD'
    ][i % 15],
    lectura_obligatoria: i % 3 === 0 ? 'Si' : 'No',
    confirmacion_lectura: i % 3 === 0 ? (i % 2 === 0 ? 'Si' : 'Pendiente') : '',
    ultima_visualizacion: `2024-05-${10 + i} 14:30:${i}`,
    cantidad_visualizaciones: Math.floor(Math.random() * 10) + 1,
    cantidad_impresiones: Math.floor(Math.random() * 3)
}));

export const UserDocumentStatsModal = ({ isOpen, onClose, user }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [onlyMandatory, setOnlyMandatory] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    const filteredData = useMemo(() => {
        return MOCK_STATS_DATA.filter(item => {
            const matchesSearch = item.nombre.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesFilter = onlyMandatory ? item.lectura_obligatoria === 'Si' : true;
            return matchesSearch && matchesFilter;
        });
    }, [searchTerm, onlyMandatory]);

    if (!isOpen || !user) return null;

    const personaName = user.persona
        ? `${user.persona.primer_nombre} ${user.persona.primer_apellido}`
        : 'Usuario';

    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentItems = filteredData.slice(startIndex, startIndex + itemsPerPage);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl overflow-hidden animate-scale-in flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
                    <div>
                        <h2 className="text-lg font-bold text-slate-800">Estadísticas Documentales</h2>
                        <p className="text-sm text-slate-500">Usuario: <span className="font-semibold text-blue-600">{personaName}</span></p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-full transition-all"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Toolbar */}
                <div className="p-4 bg-slate-50/50 border-b border-slate-100 flex flex-wrap gap-4 justify-between items-center shrink-0">
                    <div className="flex items-center gap-4 flex-1 min-w-[300px]">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Buscar documento..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                            />
                        </div>

                        <label className="flex items-center gap-2 cursor-pointer select-none">
                            <div className="relative">
                                <input
                                    type="checkbox"
                                    checked={onlyMandatory}
                                    onChange={(e) => setOnlyMandatory(e.target.checked)}
                                    className="peer sr-only"
                                />
                                <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                            </div>
                            <span className="text-sm font-medium text-slate-700">Lectura obligatoria</span>
                        </label>
                    </div>

                    <button className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 hover:text-slate-900 transition-all text-sm font-medium shadow-sm">
                        <Download className="w-4 h-4" />
                        Exportar
                    </button>
                </div>

                {/* Table */}
                <div className="overflow-auto custom-scrollbar flex-1">
                    <table className="w-full">
                        <thead className="bg-slate-50 sticky top-0 z-10">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">ID</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">Documento</th>
                                <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">Obligatorio</th>
                                <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">Confiramación</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">Última Vista</th>
                                <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200" title="Cantidad Visualizaciones"><Eye className="w-4 h-4 mx-auto" /></th>
                                <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200" title="Cantidad Impresiones"><Printer className="w-4 h-4 mx-auto" /></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {currentItems.map((item) => (
                                <tr key={item.id} className="hover:bg-blue-50/20 transition-colors">
                                    <td className="px-4 py-3 text-sm text-slate-500 font-mono">{item.id}</td>
                                    <td className="px-4 py-3 text-sm font-medium text-slate-700">{item.nombre}</td>
                                    <td className="px-4 py-3 text-center">
                                        <span className={`inline-flex items-center justify-center px-2 py-0.5 rounded text-xs font-medium ${item.lectura_obligatoria === 'Si' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'}`}>
                                            {item.lectura_obligatoria}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        {item.lectura_obligatoria === 'Si' && (
                                            <span className={`text-xs font-semibold ${item.confirmacion_lectura === 'Si' ? 'text-emerald-600' : 'text-orange-500'}`}>
                                                {item.confirmacion_lectura || '-'}
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-slate-500">{item.ultima_visualizacion}</td>
                                    <td className="px-4 py-3 text-center text-sm font-medium text-slate-700">{item.cantidad_visualizaciones}</td>
                                    <td className="px-4 py-3 text-center text-sm font-medium text-slate-700">{item.cantidad_impresiones}</td>
                                </tr>
                            ))}
                            {currentItems.length === 0 && (
                                <tr>
                                    <td colSpan="7" className="px-6 py-12 text-center text-slate-400">
                                        No hay datos para mostrar
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination footer */}
                <div className="px-6 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between shrink-0">
                    <span className="text-xs text-slate-500">
                        {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredData.length)} de {filteredData.length}
                    </span>
                    <div className="flex gap-1">
                        <button
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(c => c - 1)}
                            className="p-1 rounded hover:bg-white hover:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed text-slate-500"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                            disabled={currentPage === totalPages}
                            onClick={() => setCurrentPage(c => c + 1)}
                            className="p-1 rounded hover:bg-white hover:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed text-slate-500"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
