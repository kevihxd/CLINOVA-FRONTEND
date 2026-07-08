import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, FileText, Download, X, Loader2, ArrowRight } from 'lucide-react';
import { useApi } from '../../../hooks/useApi';
import { useAlert } from '../../../providers/AlertProvider';
import http from '../../../services/httpClient';

export const DocumentSearchBar = () => {
    const [query, setQuery] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [previewDoc, setPreviewDoc] = useState(null);
    const [previewType, setPreviewType] = useState(null);
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
    }).slice(0, 8); // Limit to 8 results for better UX

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handlePreview = async (doc) => {
        setIsOpen(false);
        try {
            // Pedimos el tipo PDF explícitamente para la vista previa
            const data = await http.get(`/documentos/descargar/${doc.id}?tipo=pdf`, { responseType: 'blob' });
            
            // Check if backend returned JSON error despite 200 OK
            if (data.type && data.type.includes('application/json')) {
                const text = await data.text();
                const json = JSON.parse(text);
                showAlert({ message: json.message || 'Error al descargar el documento', status: 'error' });
                return;
            }

            const isPdfOrImage = data.type && (data.type.includes('pdf') || data.type.includes('image'));
            
            // Show modal for everything
            // If it's not a PDF/Image, we just pass the blob type to render a fallback message
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
        <div ref={wrapperRef} className="relative w-full max-w-2xl mx-auto mb-8 z-50">
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
                                            <h4 className="text-sm font-bold text-slate-800 truncate group-hover:text-indigo-700 transition-colors">
                                                {doc.nombre}
                                            </h4>
                                            <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                                                <span className="font-semibold text-slate-600">{doc.codigo}</span>
                                                <span>•</span>
                                                <span className="truncate">{doc.tipo}</span>
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

            {/* Preview Modal */}
            {previewUrl && (
                <div className="fixed inset-0 z-[99999] bg-slate-900/90 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in duration-300">
                        <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-slate-50">
                            <div>
                                <h3 className="font-bold text-slate-800 text-lg">{previewDoc?.nombre}</h3>
                                <p className="text-sm text-slate-500 font-medium">{previewDoc?.codigo} • {previewDoc?.tipo}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <button 
                                    onClick={handleDownloadOriginal}
                                    className="p-2 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-colors flex items-center gap-2 font-medium text-sm"
                                    title="Descargar documento original"
                                >
                                    <Download size={18} /> Descargar
                                </button>
                                <button 
                                    onClick={closePreview}
                                    className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                                >
                                    <X size={24} />
                                </button>
                            </div>
                        </div>
                        <div className="flex-1 w-full bg-slate-200">
                            {(!previewType || (!previewType.includes('pdf') && !previewType.includes('image'))) ? (
                                <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 p-8">
                                    <FileText size={64} className="mb-4 text-slate-400" />
                                    <h2 className="text-xl font-semibold text-slate-700">Vista previa no disponible</h2>
                                    <p className="mt-2 text-center max-w-md">
                                        Este tipo de archivo ({previewDoc?.tipo || 'Documento de Office'}) no soporta visualización directa en el navegador.
                                    </p>
                                    <div className="flex items-center gap-4 mt-6">
                                        <button 
                                            onClick={handleDownloadOriginal}
                                            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-colors flex items-center gap-2 shadow-sm"
                                        >
                                            <Download size={20} /> Descargar Archivo
                                        </button>
                                        <button 
                                            onClick={() => {
                                                closePreview();
                                                navigate('/procesos/listado-unico');
                                            }}
                                            className="px-6 py-3 bg-white text-indigo-600 border border-indigo-200 hover:bg-indigo-50 font-medium rounded-xl transition-colors flex items-center gap-2 shadow-sm"
                                        >
                                            Ir a Listado Único <ArrowRight size={20} />
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
