import React, { useState, useEffect } from 'react';
import { Search, Plus, FileSpreadsheet, Eye, Edit2, Trash2, Download } from 'lucide-react';

export const ListadoUnico = () => {
    // Estados dinámicos vacíos (Sin datos estáticos)
    const [documentos, setDocumentos] = useState([]);
    const [tiposDocumento, setTiposDocumento] = useState([]); // Conexión con los Tipos de Documento

    const [searchTerm, setSearchTerm] = useState('');
    const [registrosPorPagina, setRegistrosPorPagina] = useState(10);
    
    const [filtroSede, setFiltroSede] = useState('Todos');
    const [filtroProceso, setFiltroProceso] = useState('Todos');
    const [filtroTipo, setFiltroTipo] = useState('Todos');

    // Listas únicas generadas dinámicamente a partir de los datos
    const sedesUnicas = [...new Set(documentos.map(doc => doc.sede).filter(Boolean))];
    const procesosUnicos = [...new Set(documentos.map(doc => doc.proceso).filter(Boolean))];
    // Se prioriza la lista de Tipos de Documento conectada, si no hay, extrae de los documentos
    const tiposUnicos = tiposDocumento.length > 0 ? tiposDocumento : [...new Set(documentos.map(doc => doc.tipo).filter(Boolean))];

    const filtrados = documentos.filter(doc => {
        const matchSearch = doc.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) || doc.codigo?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchSede = filtroSede === 'Todos' || doc.sede === filtroSede;
        const matchProceso = filtroProceso === 'Todos' || doc.proceso === filtroProceso;
        const matchTipo = filtroTipo === 'Todos' || doc.tipo === filtroTipo;
        
        return matchSearch && matchSede && matchProceso && matchTipo;
    });

    const SortArrows = () => (
        <div className="inline-flex flex-col ml-1 opacity-50">
            <svg className="w-2 h-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 15l-6-6-6 6"/></svg>
            <svg className="w-2 h-2 -mt-[2px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M6 9l6 6 6-6"/></svg>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 p-6 md:p-8 font-sans">
            <div className="max-w-[1500px] mx-auto space-y-4">
                
                <h1 className="text-[22px] font-bold text-slate-800 tracking-tight mb-4">
                    Listado único de documentos
                </h1>

                <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        <div>
                            <label className="block text-[13px] font-bold text-slate-700 mb-1.5">Sede</label>
                            <select 
                                value={filtroSede} 
                                onChange={(e) => setFiltroSede(e.target.value)}
                                className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 cursor-pointer"
                            >
                                <option value="Todos">Todos</option>
                                {sedesUnicas.map(sede => <option key={sede} value={sede}>{sede}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-[13px] font-bold text-slate-700 mb-1.5">Procesos</label>
                            <select 
                                value={filtroProceso} 
                                onChange={(e) => setFiltroProceso(e.target.value)}
                                className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 cursor-pointer"
                            >
                                <option value="Todos">Todos</option>
                                {procesosUnicos.map(proceso => <option key={proceso} value={proceso}>{proceso}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-[13px] font-bold text-slate-700 mb-1.5">Tipo documento</label>
                            <select 
                                value={filtroTipo} 
                                onChange={(e) => setFiltroTipo(e.target.value)}
                                className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 cursor-pointer"
                            >
                                <option value="Todos">Todos</option>
                                {tiposUnicos.map(tipo => <option key={tipo} value={tipo}>{tipo}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="flex gap-2 mb-6">
                        <button className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0d6efd] text-white rounded text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm">
                            <Plus size={16} strokeWidth={2.5} /> Insertar
                        </button>
                        <button className="flex items-center gap-1.5 px-3 py-1.5 bg-[#198754] text-white rounded text-sm font-medium hover:bg-green-700 transition-colors shadow-sm">
                            <FileSpreadsheet size={16} strokeWidth={2.5} /> Exportar
                        </button>
                    </div>

                    <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-4">
                        <div className="flex items-center gap-2 text-sm text-slate-700">
                            <span>Mostrar</span>
                            <select 
                                value={registrosPorPagina} 
                                onChange={(e) => setRegistrosPorPagina(Number(e.target.value))}
                                className="border border-slate-300 rounded px-2 py-1 outline-none focus:border-blue-500 cursor-pointer text-sm"
                            >
                                <option value={10}>10</option>
                                <option value={25}>25</option>
                                <option value={50}>50</option>
                                <option value={100}>100</option>
                            </select>
                            <span>registros</span>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-slate-700">
                            <span className="font-medium">Buscar:</span>
                            <input 
                                type="text" 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="border border-slate-300 rounded-md px-3 py-1 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none w-full sm:w-64"
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto border-t border-l border-r border-slate-200">
                        <table className="w-full text-left border-collapse whitespace-nowrap">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200 text-[12px] text-slate-700 font-bold">
                                    <th className="px-3 py-2.5 border-r border-slate-200 cursor-pointer hover:bg-slate-100"><div className="flex items-center justify-between">Id <SortArrows /></div></th>
                                    <th className="px-3 py-2.5 border-r border-slate-200 cursor-pointer hover:bg-slate-100"><div className="flex items-center justify-between">Código <SortArrows /></div></th>
                                    <th className="px-3 py-2.5 border-r border-slate-200 cursor-pointer hover:bg-slate-100"><div className="flex items-center justify-between">Versión <SortArrows /></div></th>
                                    <th className="px-3 py-2.5 border-r border-slate-200 cursor-pointer hover:bg-slate-100"><div className="flex items-center justify-between">Nombre <SortArrows /></div></th>
                                    <th className="px-3 py-2.5 border-r border-slate-200 cursor-pointer hover:bg-slate-100"><div className="flex items-center justify-between">Tipo <SortArrows /></div></th>
                                    <th className="px-3 py-2.5 border-r border-slate-200 cursor-pointer hover:bg-slate-100"><div className="flex items-center justify-between">Método de creación <SortArrows /></div></th>
                                    <th className="px-3 py-2.5 border-r border-slate-200 cursor-pointer hover:bg-slate-100"><div className="flex items-center justify-between">Proceso <SortArrows /></div></th>
                                    <th className="px-3 py-2.5 border-r border-slate-200 cursor-pointer hover:bg-slate-100"><div className="flex items-center justify-between">Normas <SortArrows /></div></th>
                                    <th className="px-3 py-2.5 border-r border-slate-200 cursor-pointer hover:bg-slate-100"><div className="flex items-center justify-between">Sede <SortArrows /></div></th>
                                    <th className="px-3 py-2.5 border-r border-slate-200 cursor-pointer hover:bg-slate-100"><div className="flex items-center justify-between">Días para revisión <SortArrows /></div></th>
                                    <th className="px-3 py-2.5 border-r border-slate-200 cursor-pointer hover:bg-slate-100"><div className="flex items-center justify-between">Implementación <SortArrows /></div></th>
                                    <th className="px-3 py-2.5 text-center w-32">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtrados.length === 0 ? (
                                    <tr>
                                        <td colSpan="12" className="px-4 py-8 text-center text-slate-500 text-sm border-b border-slate-200">
                                            No se encontraron registros.
                                        </td>
                                    </tr>
                                ) : (
                                    filtrados.slice(0, registrosPorPagina).map((doc) => (
                                        <tr key={doc.id} className="hover:bg-slate-50 border-b border-slate-200 text-[13px] text-slate-600">
                                            <td className="px-3 py-2 border-r border-slate-200 text-center">{doc.id}</td>
                                            <td className="px-3 py-2 border-r border-slate-200">{doc.codigo}</td>
                                            <td className="px-3 py-2 border-r border-slate-200 text-center">{doc.version}</td>
                                            <td className="px-3 py-2 border-r border-slate-200 truncate max-w-xs" title={doc.nombre}>{doc.nombre}</td>
                                            <td className="px-3 py-2 border-r border-slate-200">{doc.tipo}</td>
                                            <td className="px-3 py-2 border-r border-slate-200">{doc.metodo}</td>
                                            <td className="px-3 py-2 border-r border-slate-200">{doc.proceso}</td>
                                            <td className="px-3 py-2 border-r border-slate-200 text-[11px] whitespace-pre-line">{doc.normas}</td>
                                            <td className="px-3 py-2 border-r border-slate-200">{doc.sede}</td>
                                            <td className="px-3 py-2 border-r border-slate-200 text-center">{doc.diasRevision}</td>
                                            <td className="px-3 py-2 border-r border-slate-200 text-center">{doc.implementacion}</td>
                                            <td className="px-3 py-2">
                                                <div className="flex items-center justify-center gap-1">
                                                    <button className="p-1 text-slate-400 hover:text-blue-600 bg-slate-100 hover:bg-blue-50 border border-slate-200 rounded" title="Ver">
                                                        <Eye size={14} />
                                                    </button>
                                                    <button className="p-1 text-slate-400 hover:text-amber-600 bg-slate-100 hover:bg-amber-50 border border-slate-200 rounded" title="Editar">
                                                        <Edit2 size={14} />
                                                    </button>
                                                    <button className="p-1 text-slate-400 hover:text-red-600 bg-slate-100 hover:bg-red-50 border border-slate-200 rounded" title="Eliminar">
                                                        <Trash2 size={14} />
                                                    </button>
                                                    <button className="p-1 text-slate-400 hover:text-emerald-600 bg-slate-100 hover:bg-emerald-50 border border-slate-200 rounded" title="Descargar">
                                                        <Download size={14} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                    
                    <div className="mt-4 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-slate-600">
                        <div>
                            Mostrando {filtrados.length === 0 ? 0 : 1} a {Math.min(filtrados.length, registrosPorPagina)} de {filtrados.length} registros
                        </div>
                        <div className="flex items-center">
                            <button className="px-3 py-1.5 border border-slate-300 rounded-l text-slate-600 hover:bg-slate-50 disabled:opacity-50">Anterior</button>
                            <button className="px-3 py-1.5 border-t border-b border-slate-300 bg-blue-600 text-white font-medium">1</button>
                            <button className="px-3 py-1.5 border border-slate-300 rounded-r text-slate-600 hover:bg-slate-50 disabled:opacity-50">Siguiente</button>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};