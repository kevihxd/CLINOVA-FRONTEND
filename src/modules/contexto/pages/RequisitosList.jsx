import React, { useState, useEffect } from 'react';
import http from '../../../services/httpClient';

const CALIFICACIONES = ['Cumple', 'No Cumple', 'Cumple Parcialmente', 'No Aplica'];
const TIPOS = ['Resolución', 'Circular', 'Ley', 'Decreto', 'Acuerdo', 'Directiva'];
const FRECUENCIAS = ['Anual', 'Semestral', 'Trimestral', 'Mensual'];
const ESTADOS = ['Vigente', 'Derogado', 'En revisión'];

export const RequisitosList = () => {
    const [data, setData] = useState([]);
    const [selectedIds, setSelectedIds] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [pageSize, setPageSize] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [formData, setFormData] = useState({
        tipo: 'Resolución', nombre: '', anioPublicacion: '', emisor: '', articulos: 'Todos',
        descripcion: '', evidenciaAplicacion: '', tema: '', responsable: '',
        procesoResponsables: '', frecuenciaRevision: 'Anual', estado: 'Vigente',
        calificacion: 'Cumple', vencimiento: 'NA'
    });

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        try {
            const response = await http.get('/contexto/requisitos');
            const items = response?.data?.data || response?.data || response || [];
            setData(Array.isArray(items) ? items : []);
        } catch (error) {
            console.error('Error fetching data', error);
        }
    };

    const handleSelect = (id) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    const handleSelectAll = (e) => {
        setSelectedIds(e.target.checked ? filtered.map(d => d.id) : []);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await http.post('/contexto/requisitos', formData);
            setShowModal(false);
            fetchData();
        } catch (error) {
            console.error('Error creating requisito', error);
        }
    };

    const estadoBadge = (estado) => {
        if (!estado) return null;
        const colors = {
            'Vigente': 'bg-green-500 text-white',
            'Derogado': 'bg-red-500 text-white',
            'En revisión': 'bg-yellow-400 text-white',
        };
        return (
            <span className={`px-2 py-0.5 rounded text-xs font-bold ${colors[estado] || 'bg-slate-300 text-slate-700'}`}>
                {estado}
            </span>
        );
    };

    const filtered = data.filter(item =>
        !searchTerm || Object.values(item).some(v => String(v).toLowerCase().includes(searchTerm.toLowerCase()))
    );
    const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
    const safePage = Math.min(currentPage, totalPages);
    const pageStart = (safePage - 1) * pageSize;
    const pageEnd = pageStart + pageSize;
    const pageItems = filtered.slice(pageStart, pageEnd);

    const handlePageSizeChange = (newSize) => {
        setPageSize(newSize);
        setCurrentPage(1);
    };

    const handleSearchChange = (val) => {
        setSearchTerm(val);
        setCurrentPage(1);
    };

    return (
        <div className="w-full bg-white min-h-screen">
            {/* Breadcrumb */}
            <div className="w-full px-4 py-2 border-b border-slate-200">
                <p className="text-sm">
                    <span className="text-blue-800 font-bold">Contexto de la organización</span>
                    <span className="text-slate-500 mx-2">{'>'}</span>
                    <span className="text-blue-800 font-bold">Matriz de requisitos legales</span>
                </p>
            </div>

            {/* Action Buttons */}
            <div className="w-full px-4 py-2 bg-slate-50 border-b border-slate-200 flex flex-wrap gap-1.5">
                {['Cambiar matriz', 'Insertar', 'Modificar', 'Eliminar', 'Importar', 'Exportar', 'Crear nueva versión', 'Versiones', 'Versión de impresión', 'Control de cambios'].map((btn) => (
                    <button
                        key={btn}
                        onClick={btn === 'Insertar' ? () => setShowModal(true) : undefined}
                        className="px-3 py-1 bg-gradient-to-b from-white to-slate-100 border border-slate-300 rounded text-slate-700 text-xs hover:bg-slate-50 transition-colors shadow-sm whitespace-nowrap"
                    >
                        {btn}
                    </button>
                ))}
            </div>

            <div className="p-4">
                {/* Company header */}
                <div className="flex justify-between items-start mb-3">
                    <div>
                        <p className="font-bold text-slate-800">Coorporativa</p>
                        <p className="text-sm text-slate-500">Versión 2</p>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                        <span className="text-slate-600 font-medium">Nivel de cumplimiento</span>
                        <div className="relative w-10 h-10">
                            <svg viewBox="0 0 36 36" className="w-10 h-10 -rotate-90">
                                <circle cx="18" cy="18" r="15.9" fill="none" stroke="#e2e8f0" strokeWidth="3.2" />
                                <circle cx="18" cy="18" r="15.9" fill="none" stroke="#22c55e" strokeWidth="3.2"
                                    strokeDasharray="83 17" strokeLinecap="round" />
                            </svg>
                            <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-green-600">83%</span>
                        </div>
                    </div>
                </div>

                {/* Controls */}
                <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center gap-2 text-sm text-slate-700">
                        <span>Mostrar</span>
                        <select value={pageSize} onChange={e => handlePageSizeChange(Number(e.target.value))} className="border border-slate-300 rounded px-2 py-1 bg-white focus:outline-none focus:border-blue-500">
                            <option>10</option><option>25</option><option>50</option><option>100</option>
                        </select>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                        <span className="text-slate-700">Buscar:</span>
                        <input type="text" value={searchTerm} onChange={e => handleSearchChange(e.target.value)}
                            className="border border-slate-300 rounded px-2 py-1 w-48 focus:outline-none focus:border-blue-500" />
                    </div>
                </div>

                {/* Table */}
                <div className="w-full border border-slate-300 overflow-x-auto">
                    <table className="w-full text-xs min-w-[1400px]">
                        <thead className="bg-[#e9e9e9] text-slate-700 border-b border-slate-300">
                            <tr>
                                <th className="py-2 px-2 w-8 border-r border-slate-300 text-center">
                                    <input type="checkbox" onChange={handleSelectAll} checked={pageItems.length > 0 && pageItems.every(d => selectedIds.includes(d.id))} className="w-3 h-3 cursor-pointer" />
                                </th>
                                {['ID','Tipo','Nombre','Año de publicación','Emisor','Artículo(s)','Descripción','Evidencia de aplicación(es)','Tema','Responsable','Proceso(s) responsable(s)','Frecuencia de revisión','Estado','Calificación','Vencimiento'].map(col => (
                                    <th key={col} className="py-2 px-2 border-r border-slate-300 font-semibold text-center whitespace-nowrap">{col}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {pageItems.length === 0 ? (
                                <tr><td colSpan="16" className="py-8 text-center text-slate-500">No hay datos disponibles en la tabla</td></tr>
                            ) : (
                                pageItems.map((item) => {
                                    const isSelected = selectedIds.includes(item.id);
                                    return (
                                        <tr key={item.id} onClick={() => handleSelect(item.id)}
                                            className={`border-b border-slate-200 cursor-pointer ${isSelected ? 'bg-orange-500 text-white' : 'bg-white hover:bg-slate-50 text-slate-700'} transition-colors`}>
                                            <td className="py-1.5 px-2 border-r border-slate-200 text-center">
                                                <input type="checkbox" checked={isSelected} onChange={() => handleSelect(item.id)} className="w-3 h-3" />
                                            </td>
                                            <td className="py-1.5 px-2 border-r border-slate-200 text-center font-medium">{item.id}</td>
                                            <td className="py-1.5 px-2 border-r border-slate-200 text-center">{item.tipo}</td>
                                            <td className="py-1.5 px-2 border-r border-slate-200 whitespace-nowrap">
                                                {item.urlArchivo ? (
                                                    <a 
                                                        href={item.urlArchivo} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer"
                                                        onClick={e => e.stopPropagation()}
                                                        className={`hover:underline font-medium ${isSelected ? 'text-white' : 'text-blue-600'}`}
                                                    >
                                                        {item.nombre}
                                                    </a>
                                                ) : (
                                                    <span className="font-medium">{item.nombre}</span>
                                                )}
                                            </td>
                                            <td className="py-1.5 px-2 border-r border-slate-200 text-center">{item.anioPublicacion}</td>
                                            <td className="py-1.5 px-2 border-r border-slate-200">{item.emisor}</td>
                                            <td className="py-1.5 px-2 border-r border-slate-200 text-center">{item.articulos}</td>
                                            <td className="py-1.5 px-2 border-r border-slate-200 max-w-[200px]">
                                                <span className="line-clamp-3 text-xs">{item.descripcion}</span>
                                            </td>
                                            <td className="py-1.5 px-2 border-r border-slate-200 max-w-[150px]">
                                                <span className="line-clamp-3 text-xs">{item.evidenciaAplicacion}</span>
                                            </td>
                                            <td className="py-1.5 px-2 border-r border-slate-200 max-w-[150px]">
                                                <span className="line-clamp-3 text-xs">{item.tema}</span>
                                            </td>
                                            <td className="py-1.5 px-2 border-r border-slate-200">{item.responsable}</td>
                                            <td className="py-1.5 px-2 border-r border-slate-200">
                                                {item.procesoResponsables && item.procesoResponsables.split(' | ').map((proc, i) => (
                                                    <div key={i} className={`text-xs ${isSelected ? 'text-white' : 'text-slate-700'}`}>
                                                        • {proc.trim()}
                                                    </div>
                                                ))}
                                            </td>
                                            <td className="py-1.5 px-2 border-r border-slate-200 text-center">{item.frecuenciaRevision}</td>
                                            <td className="py-1.5 px-2 border-r border-slate-200 text-center">
                                                {estadoBadge(item.estado)}
                                            </td>
                                            <td className="py-1.5 px-2 border-r border-slate-200 text-center">
                                                <select defaultValue={item.calificacion}
                                                    className="text-xs border border-slate-300 rounded px-1 py-0.5 bg-white focus:outline-none max-w-[120px]"
                                                    onClick={e => e.stopPropagation()}>
                                                    {CALIFICACIONES.map(c => <option key={c}>{c}</option>)}
                                                </select>
                                            </td>
                                            <td className="py-1.5 px-2 text-center">{item.vencimiento}</td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="flex justify-between items-center mt-3 text-sm text-slate-600">
                    <div>{filtered.length === 0 ? '0' : `${pageStart + 1} a ${Math.min(pageEnd, filtered.length)}`} de {filtered.length}</div>
                    <div className="flex gap-1">
                        <button onClick={() => setCurrentPage(1)} disabled={safePage === 1} className="px-2 py-1 bg-slate-100 border border-slate-200 rounded text-slate-500 hover:bg-slate-200 disabled:opacity-40">&lt;&lt;</button>
                        <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={safePage === 1} className="px-2 py-1 bg-slate-100 border border-slate-200 rounded text-slate-500 hover:bg-slate-200 disabled:opacity-40">&lt;</button>
                        {Array.from({length: Math.min(5, totalPages)}, (_, i) => {
                            const pageNum = Math.max(1, Math.min(safePage - 2, totalPages - 4)) + i;
                            return (
                                <button key={pageNum} onClick={() => setCurrentPage(pageNum)}
                                    className={`px-3 py-1 rounded font-bold ${pageNum === safePage ? 'bg-orange-500 text-white' : 'bg-slate-100 border border-slate-200 text-slate-500 hover:bg-slate-200'}`}>
                                    {pageNum}
                                </button>
                            );
                        })}
                        <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={safePage === totalPages} className="px-2 py-1 bg-slate-100 border border-slate-200 rounded text-slate-500 hover:bg-slate-200 disabled:opacity-40">&gt;</button>
                        <button onClick={() => setCurrentPage(totalPages)} disabled={safePage === totalPages} className="px-2 py-1 bg-slate-100 border border-slate-200 rounded text-slate-500 hover:bg-slate-200 disabled:opacity-40">&gt;&gt;</button>
                    </div>
                </div>
            </div>

            {/* Insert Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-slate-900/60 flex items-start justify-center z-50 overflow-y-auto py-10">
                    <div className="bg-white rounded-xl p-6 w-full max-w-2xl shadow-2xl mx-4">
                        <h2 className="text-lg font-bold mb-4 text-slate-800">Insertar Requisito Legal</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-slate-700 mb-1">Tipo *</label>
                                    <select value={formData.tipo} onChange={e => setFormData({...formData, tipo: e.target.value})} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500">
                                        {TIPOS.map(t => <option key={t}>{t}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-700 mb-1">Nombre *</label>
                                    <input type="text" value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} required
                                        className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500" placeholder="Ej: Resolución 4005" />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-700 mb-1">Año de publicación</label>
                                    <input type="text" value={formData.anioPublicacion} onChange={e => setFormData({...formData, anioPublicacion: e.target.value})}
                                        className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500" placeholder="2024" />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-700 mb-1">Emisor</label>
                                    <input type="text" value={formData.emisor} onChange={e => setFormData({...formData, emisor: e.target.value})}
                                        className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-700 mb-1">Artículo(s)</label>
                                    <input type="text" value={formData.articulos} onChange={e => setFormData({...formData, articulos: e.target.value})}
                                        className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-700 mb-1">Responsable</label>
                                    <input type="text" value={formData.responsable} onChange={e => setFormData({...formData, responsable: e.target.value})}
                                        className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-xs font-medium text-slate-700 mb-1">Descripción *</label>
                                    <textarea value={formData.descripcion} onChange={e => setFormData({...formData, descripcion: e.target.value})} required rows={2}
                                        className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-xs font-medium text-slate-700 mb-1">Evidencia de aplicación</label>
                                    <textarea value={formData.evidenciaAplicacion} onChange={e => setFormData({...formData, evidenciaAplicacion: e.target.value})} rows={2}
                                        className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-xs font-medium text-slate-700 mb-1">Tema</label>
                                    <input type="text" value={formData.tema} onChange={e => setFormData({...formData, tema: e.target.value})}
                                        className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-700 mb-1">Proceso(s) responsable(s)</label>
                                    <input type="text" value={formData.procesoResponsables} onChange={e => setFormData({...formData, procesoResponsables: e.target.value})}
                                        className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-700 mb-1">Frecuencia de revisión</label>
                                    <select value={formData.frecuenciaRevision} onChange={e => setFormData({...formData, frecuenciaRevision: e.target.value})} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500">
                                        {FRECUENCIAS.map(f => <option key={f}>{f}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-700 mb-1">Estado</label>
                                    <select value={formData.estado} onChange={e => setFormData({...formData, estado: e.target.value})} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500">
                                        {ESTADOS.map(s => <option key={s}>{s}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-700 mb-1">Calificación</label>
                                    <select value={formData.calificacion} onChange={e => setFormData({...formData, calificacion: e.target.value})} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500">
                                        {CALIFICACIONES.map(c => <option key={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-700 mb-1">Vencimiento</label>
                                    <input type="text" value={formData.vencimiento} onChange={e => setFormData({...formData, vencimiento: e.target.value})}
                                        className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500" placeholder="NA" />
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 mt-6">
                                <button type="button" onClick={() => setShowModal(false)}
                                    className="px-4 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded transition-colors font-medium text-sm">Cancelar</button>
                                <button type="submit"
                                    className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded transition-colors font-medium text-sm">Guardar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

