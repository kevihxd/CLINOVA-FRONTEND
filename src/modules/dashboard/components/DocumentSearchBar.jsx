import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, FileText, Download, X, Loader2, ArrowRight, History } from 'lucide-react';
import { useApi } from '../../../hooks/useApi';
import { useAlert } from '../../../providers/AlertProvider';
import http from '../../../services/httpClient';

export const DocumentSearchBar = () => {
    const [query, setQuery] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [previewDoc, setPreviewDoc] = useState(null);
    const [previewType, setPreviewType] = useState(null);
    const [controlCambios, setControlCambios] = useState([]);
    const [showControlCambios, setShowControlCambios] = useState(false);
    const [loadingControlCambios, setLoadingControlCambios] = useState(false);
    
    const wrapperRef = useRef(null);
    const navigate = useNavigate();
    const { showAlert } = useAlert();

    // Fetch all documents on mount
    const { data: responseData, loading } = useApi('/documentos');
    const allDocuments = responseData?.data || [];

    // Filter documents based on query
    const filteredDocuments = allDocuments.filter(doc => {
        if (!query) return false;
        const q = query.toLowerCase();
        return (
            (doc.nombre && doc.nombre.toLowerCase().includes(q)) ||
            (doc.codigo && doc.codigo.toLowerCase().includes(q)) ||
            (doc.tipo && doc.tipo.toLowerCase().includes(q))
        );
    }).slice(0, 8);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchControlCambios = async (docId, docMeta) => {
        setLoadingControlCambios(true);
        try {
            const res = await http.get(`/documentos/${docId}/historial`);
            const data = res?.data?.data || res?.data || res || [];
            const allLogs = Array.isArray(data) ? data : [];

            // Filter real version history logs
            const versionLogs = allLogs
                .filter(l => l.accion === 'CREACION_VERSION' && l.version)
                .sort((a, b) => Number(a.version) - Number(b.version));

            if (versionLogs.length > 0) {
                setControlCambios(versionLogs.map(l => ({
                    version: l.version,
                    descripcion: l.descripcion || 'Actualización de documento',
                    fecha: l.fecha || '—',
                    usuario: l.usuario || docMeta.elabora || 'SGC Clinical House'
                })));
            } else {
                // Fallback entry from document metadata
                setControlCambios([{
                    version: docMeta.version || '01',
                    descripcion: 'Documentación por primera vez para su inclusión en el SGC.',
                    fecha: docMeta.fechaAprobacion || docMeta.fechaRevision || docMeta.fechaElaboracion || '—',
                    usuario: docMeta.elabora || 'SGC Clinical House'
                }]);
            }
        } catch (error) {
            setControlCambios([{
                version: docMeta.version || '01',
                descripcion: 'Documentación por primera vez para su inclusión en el SGC.',
                fecha: docMeta.fechaAprobacion || docMeta.fechaRevision || docMeta.fechaElaboracion || '—',
                usuario: docMeta.elabora || 'SGC Clinical House'
            }]);
        } finally {
            setLoadingControlCambios(false);
        }
    };

    const handlePreview = async (doc) => {
        setIsOpen(false);
        setShowControlCambios(false);
        setControlCambios([]);
        
        try {
            fetchControlCambios(doc.id, doc);

            const data = await http.get(`/documentos/descargar/${doc.id}?tipo=pdf`, { responseType: 'blob' });
            
            if (data.type && data.type.includes('application/json')) {
                const text = await data.text();
                const json = JSON.parse(text);
                showAlert({ message: json.message || 'Error al descargar el documento', status: 'error' });
                return;
            }

            const finalBlob = new Blob([data], { type: data.type || 'application/pdf' });
            const url = window.URL.createObjectURL(finalBlob);
            setPreviewUrl(url);
            setPreviewDoc(doc);
            setPreviewType(data.type);
        } catch (error) {
            if (error.response?.data instanceof Blob) {
                const text = await error.response.data.text();
                try {
                    const json = JSON.parse(text);
                    showAlert({ message: json.message || 'Archivo no encontrado', status: 'error' });
                } catch {
                    showAlert({ message: 'El archivo no se encontró.', status: 'error' });
                }
            } else {
                showAlert({ message: 'Error de red al intentar abrir el documento.', status: 'error' });
            }
        }
    };

    const closePreview = () => {
        if (previewUrl) {
            window.URL.revokeObjectURL(previewUrl);
        }
        setPreviewUrl(null);
        setPreviewDoc(null);
        setPreviewType(null);
        setControlCambios([]);
        setShowControlCambios(false);
    };

    const handleDownloadOriginal = async () => {
        if (!previewDoc) return;
        try {
            const data = await http.get(`/documentos/descargar/${previewDoc.id}`, { responseType: 'blob' });
            const downloadUrl = window.URL.createObjectURL(data);
            const a = document.createElement('a');
            a.href = downloadUrl;
            a.download = previewDoc.nombre || 'documento';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(downloadUrl);
        } catch (error) {
            showAlert({ message: 'Error al intentar descargar el documento original.', status: 'error' });
        }
    };

    return (
        <div ref={wrapperRef} className="relative w-full z-50">
            {/* Search Input Box */}
            <div className={`relative flex items-center w-full h-14 rounded-2xl bg-white transition-all duration-300 ${isOpen && query ? 'shadow-lg rounded-b-none border-b border-slate-100' : 'shadow-sm border border-slate-200 hover:border-indigo-300 hover:shadow-md'}`}>
                <div className="pl-5 text-slate-400">
                    <Search size={22} strokeWidth={1.5} />
                </div>
                <input
                    type="text"
                    className="w-full h-full pl-4 pr-12 bg-transparent text-slate-700 outline-none text-base placeholder-slate-400 font-medium"
                    placeholder="Buscar documento por código, nombre o tipo..."
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setIsOpen(true);
                    }}
                    onFocus={() => setIsOpen(true)}
                />
                {loading && (
                    <div className="absolute right-4 text-indigo-500">
                        <Loader2 size={20} className="animate-spin" />
                    </div>
                )}
                {query && !loading && (
                    <button 
                        onClick={() => { setQuery(''); setIsOpen(false); }}
                        className="absolute right-4 p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                    >
                        <X size={18} />
                    </button>
                )}
            </div>

            {/* Dropdown Results List */}
            {isOpen && query && (
                <div className="absolute top-full left-0 w-full bg-white rounded-b-2xl shadow-xl border border-t-0 border-slate-200 max-h-96 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200">
                    {filteredDocuments.length > 0 ? (
                        <ul className="py-2">
                            {filteredDocuments.map(doc => (
                                <li key={doc.id}>
                                    <button
                                        onClick={() => handlePreview(doc)}
                                        className="w-full px-5 py-3 flex items-start gap-4 hover:bg-indigo-50 transition-colors text-left group"
                                    >
                                        <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg group-hover:bg-indigo-200 transition-colors shrink-0">
                                            <FileText size={20} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className="font-mono text-xs font-black px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded border border-indigo-200 shrink-0">
                                                    {doc.codigo || 'S/C'}
                                                </span>
                                                <h4 className="text-sm font-bold text-slate-800 truncate group-hover:text-indigo-700 transition-colors">
                                                    {doc.nombre}
                                                </h4>
                                            </div>
                                            <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                                                <span className="truncate">{doc.tipo}</span>
                                                {doc.version && <span>• V-{doc.version}</span>}
                                                <span className="ml-auto flex items-center gap-1 font-medium text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <FileText size={12} /> Vista Previa
                                                </span>
                                            </div>
                                        </div>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="px-6 py-8 text-center text-slate-500">
                            <Search size={32} className="mx-auto text-slate-300 mb-3" />
                            <p className="font-medium text-slate-600">No se encontraron documentos</p>
                            <p className="text-sm mt-1">Intenta con otros términos de búsqueda</p>
                        </div>
                    )}
                </div>
            )}

            {/* Document Preview Fullscreen Modal */}
            {previewUrl && (
                <div className="fixed inset-0 z-[999999] bg-slate-900/40 backdrop-blur-md flex items-center justify-center pt-16 sm:pt-20 pb-6 px-3 sm:px-6 animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl shadow-[0_25px_70px_rgba(26,85,158,0.18)] w-full max-w-6xl h-full max-h-[85vh] overflow-hidden flex flex-col border border-slate-200/80">
                        
                        {/* Top Header Bar */}
                        <div className="flex items-center justify-between gap-4 px-6 py-4 bg-white shrink-0 border-b border-slate-100 shadow-xs">
                            <div className="flex items-center gap-3.5 min-w-0 flex-1">
                                <span className="px-3.5 py-1.5 bg-[#1a559e] text-white font-mono font-black text-xs sm:text-sm rounded-xl shadow-xs shrink-0 tracking-wider">
                                    {previewDoc?.codigo || 'S/C'}
                                </span>
                                <h3 className="font-extrabold text-slate-800 text-base sm:text-xl leading-snug truncate" title={previewDoc?.nombre}>
                                    {previewDoc?.nombre}
                                </h3>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                                <button
                                    onClick={() => setShowControlCambios(!showControlCambios)}
                                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-bold text-xs transition-all border shadow-2xs ${showControlCambios ? 'bg-[#1a559e] text-white border-[#1a559e]' : 'bg-blue-50/80 hover:bg-blue-100/80 text-[#1a559e] border-blue-200/80'}`}
                                >
                                    <History size={16} />
                                    <span className="hidden sm:inline">Control de Cambios</span>
                                    {controlCambios.length > 0 && (
                                        <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${showControlCambios ? 'bg-white text-[#1a559e]' : 'bg-[#1a559e] text-white'}`}>
                                            {controlCambios.length}
                                        </span>
                                    )}
                                </button>
                                <button 
                                    onClick={handleDownloadOriginal}
                                    className="px-3.5 py-2 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-all flex items-center gap-1.5 font-bold text-xs border border-emerald-200 shadow-2xs"
                                    title="Descargar documento original"
                                >
                                    <Download size={15} /> <span className="hidden sm:inline">Descargar</span>
                                </button>
                                <button 
                                    onClick={closePreview}
                                    className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors ml-1"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                        </div>

                        {/* Metadata Strip */}
                        <div className="px-6 py-2.5 bg-slate-50 text-slate-600 text-xs flex items-center justify-between border-b border-slate-200/80 shrink-0 flex-wrap gap-2">
                            <div className="flex items-center gap-3 flex-wrap">
                                <span>TIPO: <strong className="text-slate-800">{previewDoc?.tipo || 'N/A'}</strong></span>
                                <span>•</span>
                                <span>VERSIÓN: <strong className="text-[#1a559e] font-mono font-bold">V-{previewDoc?.version || '01'}</strong></span>
                                {previewDoc?.proceso && (
                                    <>
                                        <span>•</span>
                                        <span>PROCESO: <strong className="text-slate-800">{previewDoc?.proceso}</strong></span>
                                    </>
                                )}
                            </div>
                            {previewDoc?.estado && (
                                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${previewDoc.estado === 'VIGENTE' ? 'bg-emerald-100 text-emerald-700 border border-emerald-300/60' : 'bg-amber-100 text-amber-700 border border-amber-300/60'}`}>
                                    {previewDoc.estado}
                                </span>
                            )}
                        </div>

                        {/* Expandable Control de Cambios Drawer */}
                        {showControlCambios && (
                            <div className="bg-slate-50 border-b border-slate-200 p-5 max-h-60 overflow-y-auto animate-in slide-in-from-top duration-200 shrink-0">
                                <div className="flex items-center justify-between mb-3">
                                    <h4 className="text-xs font-black uppercase tracking-wider text-[#1a559e] flex items-center gap-2">
                                        <History size={15} /> Control de Cambios del Documento ({previewDoc?.codigo})
                                    </h4>
                                    <button onClick={() => setShowControlCambios(false)} className="text-slate-400 hover:text-slate-600 text-xs font-medium">
                                        Cerrar panel
                                    </button>
                                </div>

                                {loadingControlCambios ? (
                                    <div className="flex items-center justify-center py-4 text-xs text-slate-500 gap-2">
                                        <Loader2 size={16} className="animate-spin text-[#1a559e]" /> Cargando historial...
                                    </div>
                                ) : controlCambios.length === 0 ? (
                                    <p className="text-xs text-slate-500 italic py-2">No se encontró historial registrado.</p>
                                ) : (
                                    <div className="overflow-x-auto rounded-2xl border border-slate-200/80 shadow-xs bg-white">
                                        <table className="w-full text-left text-xs border-collapse">
                                            <thead>
                                                <tr className="bg-[#1a559e] text-white uppercase text-[10px] font-extrabold tracking-wider">
                                                    <th className="p-3 w-28 text-center border-r border-blue-600/40">FECHA</th>
                                                    <th className="p-3 w-20 text-center border-r border-blue-600/40">VERSIÓN</th>
                                                    <th className="p-3 border-r border-blue-600/40">RAZÓN DE CAMBIO</th>
                                                    <th className="p-3 w-52">ELABORÓ / RESPONSABLE</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100 text-slate-700">
                                                {controlCambios.map((row, idx) => (
                                                    <tr key={idx} className="hover:bg-blue-50/50 transition-colors">
                                                        <td className="p-3 text-center font-mono font-semibold text-slate-600 border-r border-slate-100">{row.fecha}</td>
                                                        <td className="p-3 text-center font-mono font-bold text-[#1a559e] border-r border-slate-100">{row.version}</td>
                                                        <td className="p-3 font-medium text-slate-800 border-r border-slate-100">{row.descripcion}</td>
                                                        <td className="p-3 text-slate-600">{row.usuario}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* PDF Viewer Body */}
                        <div className="flex-1 w-full bg-slate-100 relative">
                            {(!previewType || (!previewType.includes('pdf') && !previewType.includes('image'))) ? (
                                <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 p-8">
                                    <FileText size={64} className="mb-4 text-slate-300" />
                                    <h2 className="text-xl font-extrabold text-slate-800">Vista previa no disponible</h2>
                                    <p className="mt-2 text-center max-w-md text-slate-500 text-sm">
                                        Este tipo de archivo ({previewDoc?.tipo || 'Documento de Office'}) no soporta visualización directa interactiva en el navegador.
                                    </p>
                                    <div className="flex items-center gap-4 mt-6">
                                        <button 
                                            onClick={handleDownloadOriginal}
                                            className="px-6 py-3 bg-[#1a559e] hover:bg-[#13427c] text-white font-bold text-sm rounded-2xl transition-all flex items-center gap-2 shadow-md"
                                        >
                                            <Download size={18} /> Descargar Archivo Original
                                        </button>
                                        <button 
                                            onClick={() => {
                                                closePreview();
                                                navigate('/procesos/listado-unico');
                                            }}
                                            className="px-6 py-3 bg-white text-[#1a559e] border border-blue-200 hover:bg-blue-50 font-bold text-sm rounded-2xl transition-all flex items-center gap-2 shadow-sm"
                                        >
                                            Ir a Listado Único <ArrowRight size={18} />
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <iframe 
                                    src={previewUrl} 
                                    className="w-full h-full border-none"
                                    title="Vista previa del documento"
                                />
                            )}
                        </div>

                    </div>
                </div>
            )}
        </div>
    );
};

export default DocumentSearchBar;
