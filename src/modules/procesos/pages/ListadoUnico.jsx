import React, { useState, useEffect } from 'react';
import { Search, Plus, FileSpreadsheet, Eye, Edit2, Trash2, Download, FilePlus, X, FileText, CheckCircle, History } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import http from '../../../services/httpClient';
import { useAlert } from '../../../providers/AlertProvider';
import { useAuth } from '../../../providers/AuthProvider';
import { TrazabilidadPanel } from '../../../components/TrazabilidadPanel';

export const ListadoUnico = () => {
    const navigate = useNavigate();
    const { showAlert } = useAlert();
    const { user } = useAuth();
    
    const isAdmin = user?.rol === 'ADMIN' || user?.permisos?.includes('ROLE_ADMIN');

    const [documentos, setDocumentos] = useState([]);
    const [tiposDocumento, setTiposDocumento] = useState([]); 

    const [searchTerm, setSearchTerm] = useState('');
    const [registrosPorPagina, setRegistrosPorPagina] = useState(10);
    
    const [filtroSede, setFiltroSede] = useState('Todos');
    const [filtroProceso, setFiltroProceso] = useState('Todos');
    const [filtroTipo, setFiltroTipo] = useState('Todos');

    const [showCrearModal, setShowCrearModal] = useState(false);
    const [activeTab, setActiveTab] = useState('Vigente');
    const [showFilters, setShowFilters] = useState(false);
    const [selectedDoc, setSelectedDoc] = useState(null);
    const [historialDoc, setHistorialDoc] = useState([]);
    const [loadingHistorial, setLoadingHistorial] = useState(false);

    useEffect(() => {
        cargarDatos();
    }, []);

    const cargarDatos = async () => {
        try {
            const [resDocs, resTipos] = await Promise.all([
                http.get('/documentos').catch(() => ({ data: [] })),
                http.get('/tipos-documento').catch(() => ({ data: [] }))
            ]);
            const dataDocs = Array.isArray(resDocs) ? resDocs : (resDocs?.data?.data || resDocs?.data || resDocs || []);
            const dataTipos = Array.isArray(resTipos) ? resTipos : (resTipos?.data?.data || resTipos?.data || resTipos || []);
            setDocumentos(dataDocs);
            setTiposDocumento(dataTipos);
        } catch (error) {}
    };

    const abrirHistorial = async (doc) => {
        setSelectedDoc(doc);
        setHistorialDoc([]);
        setLoadingHistorial(true);
        try {
            const res = await http.get(`/documentos/${doc.id}/historial`);
            const data = res?.data?.data || res?.data || res || [];
            setHistorialDoc(Array.isArray(data) ? data : []);
        } catch {
            setHistorialDoc([]);
        } finally {
            setLoadingHistorial(false);
        }
    };

    const eliminarDocumento = async (id) => {
        if (!window.confirm('¿Está seguro de eliminar este documento?')) return;
        try {
            await http.delete(`/documentos/${id}`);
            showAlert({ message: 'Documento eliminado correctamente', status: 'success' });
            cargarDatos();
        } catch (error) {}
    };

    const aprobarDoc = async (id) => {
        if (!window.confirm('¿Desea dar el Visto Bueno a este documento para publicarlo?')) return;
        try {
            await http.put(`/documentos/${id}/aprobar`);
            showAlert({ message: 'Documento aprobado exitosamente', status: 'success' });
            cargarDatos();
        } catch (error) {}
    };

    const handleDownload = async (doc) => {
        if (!doc.ubicacion || doc.ubicacion === 'SIN_ARCHIVO') {
            showAlert({ message: 'Este documento se creó sin un archivo físico. No hay nada para visualizar o descargar.', status: 'warning' });
            return;
        }

        try {
            const blob = await http.get(`/documentos/descargar/${doc.id}`, { responseType: 'blob' });
            const url = window.URL.createObjectURL(blob);
            window.open(url, '_blank');
        } catch (error) {
            if (error.response && error.response.data instanceof Blob) {
                const text = await error.response.data.text();
                try {
                    const errorData = JSON.parse(text);
                    showAlert({ message: errorData.message || 'Archivo no encontrado', status: 'error' });
                } catch(e) {
                    showAlert({ message: 'El archivo PDF no se encontró en el servidor.', status: 'error' });
                }
            } else {
                showAlert({ message: 'Error de red al intentar descargar el documento.', status: 'error' });
            }
        }
    };

    const sedesUnicas = [...new Set(documentos.map(doc => doc.sede).filter(Boolean))];
    const procesosUnicos = [...new Set(documentos.map(doc => doc.proceso).filter(Boolean))];
    const tiposUnicos = tiposDocumento.length > 0 
        ? tiposDocumento.map(t => t.nombre) 
        : [...new Set(documentos.map(doc => doc.tipo).filter(Boolean))];

    const normalizeText = (text) => {
        if (!text) return '';
        return String(text).normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().toUpperCase();
    };

    const tabs = [
        { id: 'Vigente', label: 'Vigente', count: (docs) => docs.filter(d => normalizeText(d.estado) === 'VIGENTE').length },
        { id: 'En proceso', label: 'En proceso', count: (docs) => docs.filter(d => normalizeText(d.estado) === 'EN REVISIÓN' || normalizeText(d.estado).includes('REVISION')).length },
        { id: 'A vencer', label: 'A vencer', count: (docs) => docs.filter(d => normalizeText(d.estado) === 'A VENCER').length },
        { id: 'Vencido', label: 'Vencido', count: (docs) => docs.filter(d => normalizeText(d.estado) === 'VENCIDO').length },
        { id: 'Migración', label: 'Migración', count: (docs) => docs.filter(d => d.metodoCreacion === 'Documento Migrado').length },
        { id: 'Obligatorios sin leer', label: 'Obligatorios sin leer', count: (docs) => 0 }
    ];

    const filtrados = documentos.filter(doc => {
        const searchLower = searchTerm.toLowerCase();
        const nombreStr = doc.nombre ? String(doc.nombre).toLowerCase() : '';
        const codigoStr = doc.codigo ? String(doc.codigo).toLowerCase() : '';
        
        const matchSearch = nombreStr.includes(searchLower) || codigoStr.includes(searchLower);
        const matchSede = filtroSede === 'Todos' || doc.sede === filtroSede;
        const matchProceso = filtroProceso === 'Todos' || doc.proceso === filtroProceso;
        const matchTipo = filtroTipo === 'Todos' || doc.tipo === filtroTipo;

        let matchTab = true;
        const normEstado = normalizeText(doc.estado);
        if (activeTab === 'Vigente') {
            matchTab = normEstado === 'VIGENTE';
        } else if (activeTab === 'En proceso') {
            matchTab = normEstado === 'EN REVISIÓN' || normEstado.includes('REVISION');
        } else if (activeTab === 'A vencer') {
            matchTab = normEstado === 'A VENCER';
        } else if (activeTab === 'Vencido') {
            matchTab = normEstado === 'VENCIDO';
        } else if (activeTab === 'Migración') {
            matchTab = doc.metodoCreacion === 'Documento Migrado';
        } else if (activeTab === 'Obligatorios sin leer') {
            matchTab = false; // Mocked
        }
        
        return matchSearch && matchSede && matchProceso && matchTipo && matchTab;
    });

    const SortArrows = () => (
        <div className="inline-flex flex-col ml-1 opacity-50">
            <svg className="w-2 h-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 15l-6-6-6 6"/></svg>
            <svg className="w-2 h-2 -mt-[2px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M6 9l6 6 6-6"/></svg>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 p-4 md:p-6 font-sans">
            <div className="max-w-[1700px] mx-auto space-y-3">
                
                {/* Breadcrumb */}
                <div className="text-[11px] text-[#0d6efd] font-normal hover:underline cursor-pointer">
                    Gestión documental &gt; Listado único de documentos
                </div>

                <div className="bg-white rounded shadow-sm border border-slate-200 p-4">
                    
                    {/* Tabs & Search Input Row */}
                    <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 mb-4 border-b border-slate-100 pb-4">
                        {/* Tabs */}
                        <div className="flex flex-wrap gap-1.5">
                            {tabs.map((tab) => {
                                const countVal = tab.count(documentos);
                                const isActive = activeTab === tab.id;
                                const isObligatorio = tab.id === 'Obligatorios sin leer';
                                
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`px-3 py-1.5 rounded-t border text-xs font-semibold transition-all ${
                                            isActive
                                                ? isObligatorio
                                                    ? 'bg-red-600 text-white border-red-600'
                                                    : 'bg-[#6c757d] text-white border-[#6c757d]'
                                                : isObligatorio
                                                    ? 'bg-white text-red-600 border-red-300 hover:bg-red-50'
                                                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                                        }`}
                                    >
                                        {tab.label}
                                        {countVal > 0 && (
                                            <span className="ml-1.5 px-1.5 py-0.5 bg-slate-200 text-slate-800 rounded-full text-[10px] font-bold">
                                                {countVal}
                                            </span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Search, Filter & Actions Row */}
                        <div className="flex flex-wrap items-center gap-1.5 w-full xl:w-auto">
                            <input
                                type="text"
                                placeholder="Buscar por código o nombre..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="border border-slate-300 rounded px-3 py-1.5 text-xs outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 w-full xl:w-64"
                            />
                            <button className="px-4 py-1.5 bg-[#f08c3a] hover:bg-[#d9752b] text-white rounded text-xs font-bold transition-colors shadow-sm">
                                Buscar
                            </button>
                            <button 
                                onClick={() => setShowFilters(!showFilters)}
                                className={`flex items-center gap-1 px-3 py-1.5 bg-white border rounded text-xs text-slate-700 hover:bg-slate-50 transition-colors shadow-sm ${showFilters ? 'border-blue-500 ring-1 ring-blue-500' : 'border-slate-300'}`}
                            >
                                <svg className="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 0 1-.659 1.591l-5.432 5.432a2.25 2.25 0 0 0-.659 1.591v2.927a2.25 2.25 0 0 1-1.24 2.013L9.75 21v-6.568a2.25 2.25 0 0 0-.659-1.591L3.659 7.409A2.25 2.25 0 0 1 3 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0 1 12 3Z" /></svg>
                                Filtrar
                            </button>
                            <button 
                                onClick={() => {
                                    setFiltroSede('Todos');
                                    setFiltroProceso('Todos');
                                    setFiltroTipo('Todos');
                                    setSearchTerm('');
                                }} 
                                className="flex items-center gap-1 px-3 py-1.5 bg-white border border-slate-300 rounded text-xs text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
                            >
                                <svg className="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>
                                Quitar Filtros
                            </button>
                            <button className="flex items-center gap-1 px-3 py-1.5 bg-[#0d6efd] hover:bg-blue-700 text-white rounded text-xs font-bold transition-colors shadow-sm">
                                Mis filtros
                                <svg className="w-3 h-3 ml-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" /></svg>
                            </button>
                        </div>
                    </div>

                    {/* Collapsible Advanced Filters Section */}
                    {showFilters && (
                        <div className="bg-slate-50 border border-slate-200 rounded p-4 mb-4 grid grid-cols-1 md:grid-cols-3 gap-4 animate-fadeIn">
                            <div>
                                <label className="block text-[11px] font-bold text-slate-600 mb-1">Sede</label>
                                <select value={filtroSede} onChange={(e) => setFiltroSede(e.target.value)} className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-xs bg-white focus:outline-none focus:border-blue-500 cursor-pointer">
                                    <option value="Todos">Todos</option>
                                    {sedesUnicas.map(sede => <option key={sede} value={sede}>{sede}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-[11px] font-bold text-slate-600 mb-1">Procesos</label>
                                <select value={filtroProceso} onChange={(e) => setFiltroProceso(e.target.value)} className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-xs bg-white focus:outline-none focus:border-blue-500 cursor-pointer">
                                    <option value="Todos">Todos</option>
                                    {procesosUnicos.map(proceso => <option key={proceso} value={proceso}>{proceso}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-[11px] font-bold text-slate-600 mb-1">Tipo documento</label>
                                <select value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value)} className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-xs bg-white focus:outline-none focus:border-blue-500 cursor-pointer">
                                    <option value="Todos">Todos</option>
                                    {tiposUnicos.map(tipo => <option key={tipo} value={tipo}>{tipo}</option>)}
                                </select>
                            </div>
                        </div>
                    )}

                    {/* Action Buttons Row */}
                    <div className="flex flex-wrap gap-1.5 mb-3">
                        <button 
                            onClick={() => setShowCrearModal(true)} 
                            className="px-3.5 py-1.5 bg-[#f0ad4e] hover:bg-[#ec971f] text-white rounded text-xs font-bold transition-colors shadow-sm"
                        >
                            Crear
                        </button>
                        <button className="px-3.5 py-1.5 bg-[#f0ad4e] hover:bg-[#ec971f] text-white rounded text-xs font-bold transition-colors shadow-sm">
                            Exportar
                        </button>
                        <button className="px-3.5 py-1.5 bg-[#f0ad4e] hover:bg-[#ec971f] text-white rounded text-xs font-bold transition-colors shadow-sm">
                            Importar
                        </button>
                        <button className="px-3.5 py-1.5 bg-[#d9534f] hover:bg-[#c9302c] text-white rounded text-xs font-bold transition-colors shadow-sm">
                            Eliminar
                        </button>
                        <button className="px-3.5 py-1.5 bg-[#f0ad4e] hover:bg-[#ec971f] text-white rounded text-xs font-bold transition-colors shadow-sm">
                            Edición múltiple
                        </button>
                    </div>

                    {/* Select links */}
                    <div className="text-[11px] text-blue-600 mb-4 flex gap-2">
                        <button onClick={() => {}} className="hover:underline">Seleccionar todo</button>
                        <span className="text-slate-300">|</span>
                        <button onClick={() => {}} className="hover:underline">Deseleccionar todo</button>
                    </div>

                    {/* Entries selection dropdown */}
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-4">
                        <div className="flex items-center gap-1.5 text-xs text-slate-600">
                            <span>Mostrar</span>
                            <select value={registrosPorPagina} onChange={(e) => setRegistrosPorPagina(Number(e.target.value))} className="border border-slate-300 rounded px-2 py-1 outline-none focus:border-blue-500 cursor-pointer text-xs"><option value={10}>10</option><option value={25}>25</option><option value={50}>50</option><option value={100}>100</option></select>
                            <span>registros</span>
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
                                    <th className="px-3 py-2.5 text-center w-36">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtrados.length === 0 ? (
                                    <tr><td colSpan="12" className="px-4 py-8 text-center text-slate-500 text-sm border-b border-slate-200">No se encontraron registros.</td></tr>
                                ) : (
                                    filtrados.slice(0, registrosPorPagina).map((doc) => (
                                        <tr key={doc.id} className="hover:bg-slate-50 border-b border-slate-200 text-[13px] text-slate-600">
                                            <td className="px-3 py-2 border-r border-slate-200 text-center">{doc.id}</td>
                                            <td className="px-3 py-2 border-r border-slate-200">{doc.codigo || 'N/A'}</td>
                                            <td className="px-3 py-2 border-r border-slate-200 text-center">{doc.version || '1'}</td>
                                            <td className="px-3 py-2 border-r border-slate-200 truncate max-w-xs" title={doc.nombre}>{doc.nombre}</td>
                                            <td className="px-3 py-2 border-r border-slate-200">{doc.tipo}</td>
                                            <td className="px-3 py-2 border-r border-slate-200">{doc.metodoCreacion || 'Archivo'}</td>
                                            <td className="px-3 py-2 border-r border-slate-200">{doc.proceso}</td>
                                            <td className="px-3 py-2 border-r border-slate-200 text-[11px] whitespace-pre-line truncate max-w-[150px]" title={doc.normas}>{doc.normas || ''}</td>
                                            <td className="px-3 py-2 border-r border-slate-200">{doc.sede}</td>
                                            <td className="px-3 py-2 border-r border-slate-200 text-center">{doc.mesesRevision ? `Faltan ${doc.mesesRevision * 30} dias` : ''}</td>
                                            <td className="px-3 py-2 border-r border-slate-200 text-center">
                                                {doc.estado && (
                                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border shadow-sm tracking-wide ${doc.estado === 'VIGENTE' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-amber-50 text-amber-600 border-amber-200'}`}>
                                                        {doc.estado}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-3 py-2">
                                                <div className="flex items-center justify-center gap-1">
                                                    {isAdmin && doc.estado === 'EN REVISIÓN' && (
                                                        <button onClick={() => aprobarDoc(doc.id)} className="p-1 text-emerald-500 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded" title="Dar Visto Bueno"><CheckCircle size={14} /></button>
                                                    )}
                                                    <button onClick={() => handleDownload(doc)} className="p-1 text-slate-400 hover:text-blue-600 bg-slate-100 hover:bg-blue-50 border border-slate-200 rounded" title="Ver documento"><Eye size={14} /></button>
                                                    <button onClick={() => abrirHistorial(doc)} className="p-1 text-slate-400 hover:text-indigo-600 bg-slate-100 hover:bg-indigo-50 border border-slate-200 rounded" title="Ver trazabilidad"><History size={14} /></button>
                                                    <button className="p-1 text-slate-400 hover:text-amber-600 bg-slate-100 hover:bg-amber-50 border border-slate-200 rounded" title="Editar"><Edit2 size={14} /></button>
                                                    <button onClick={() => eliminarDocumento(doc.id)} className="p-1 text-slate-400 hover:text-red-600 bg-slate-100 hover:bg-red-50 border border-slate-200 rounded" title="Eliminar"><Trash2 size={14} /></button>
                                                    <button onClick={() => handleDownload(doc)} className="p-1 text-slate-400 hover:text-emerald-600 bg-slate-100 hover:bg-emerald-50 border border-slate-200 rounded" title="Descargar"><Download size={14} /></button>
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

            {showCrearModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden border border-slate-200">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
                            <h2 className="text-lg font-bold text-slate-800">¿Qué documentos deseas crear?</h2>
                            <button onClick={() => setShowCrearModal(false)} className="text-slate-400 hover:text-slate-600 hover:bg-slate-200 p-1.5 rounded-full transition-colors"><X size={20} /></button>
                        </div>
                        <div className="p-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <button onClick={() => navigate('/procesos/crear-documento')} className="flex flex-col items-center justify-center gap-4 p-8 border-2 border-slate-200 rounded-xl hover:border-indigo-500 hover:bg-indigo-50 hover:shadow-md transition-all group">
                                <div className="p-4 bg-indigo-100 text-indigo-600 rounded-full group-hover:scale-110 transition-transform shadow-sm"><FileText size={32} strokeWidth={2} /></div>
                                <span className="font-bold text-slate-700 text-base">Documento</span>
                            </button>
                            <button className="flex flex-col items-center justify-center gap-4 p-8 border-2 border-slate-200 rounded-xl hover:border-emerald-500 hover:bg-emerald-50 hover:shadow-md transition-all group">
                                <div className="p-4 bg-emerald-100 text-emerald-600 rounded-full group-hover:scale-110 transition-transform shadow-sm"><FileSpreadsheet size={32} strokeWidth={2} /></div>
                                <span className="font-bold text-slate-700 text-base">Formato o registro</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {selectedDoc && (
                <div className="fixed inset-0 z-50 flex justify-end">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setSelectedDoc(null)} />
                    <div className="relative w-full max-w-xl bg-slate-50 h-full shadow-2xl flex flex-col overflow-hidden">
                        <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200 shrink-0">
                            <div>
                                <p className="text-xs text-indigo-500 font-bold uppercase tracking-wider">Trazabilidad</p>
                                <h3 className="font-bold text-slate-800 text-sm mt-0.5 truncate max-w-xs" title={selectedDoc.nombre}>{selectedDoc.nombre}</h3>
                                <p className="text-xs text-slate-400">{selectedDoc.codigo} · v{selectedDoc.version || '1'}</p>
                            </div>
                            <button onClick={() => setSelectedDoc(null)} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500">
                                <X size={18} />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4">
                            <TrazabilidadPanel logs={historialDoc} loading={loadingHistorial} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};