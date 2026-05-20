import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowDownAZ, ArrowUpZA, Plus, Minus, Loader2, FileText, Download, Eye } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import http from '../../../services/httpClient';
import { useAlert } from '../../../providers/AlertProvider';

const normalizeText = (text) => {
    if (!text) return '';
    return String(text).normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().toUpperCase();
};

const getEstadoStyle = (estado) => {
    const normalize = normalizeText(estado);
    if (normalize.includes('REVISION')) return 'bg-amber-100 text-amber-700 border-amber-200';
    if (normalize.includes('VIGENTE') || normalize.includes('PUBLICADO')) return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    return 'bg-slate-100 text-slate-600 border-slate-200';
};

const getHistorialCambios = (doc) => {
    if (!doc) return [];
    const currentVersion = parseInt(doc.version) || 1;
    const list = [];
    const usuarioElabora = doc.elabora?.split(',')[0]?.trim() || 'Administrador de Calidad';

    if (currentVersion === 1) {
        list.push({
            version: '1',
            fecha: doc.fechaElaboracion || '20/05/2026',
            usuario: usuarioElabora,
            comentario: doc.alcance || 'Creación inicial y publicación del documento en el sistema de gestión.'
        });
    } else if (currentVersion === 2) {
        list.push({
            version: '1',
            fecha: '01/10/2023',
            usuario: 'Carlos Humberto Barrera Rozo',
            comentario: 'Creación inicial del documento.'
        });
        list.push({
            version: '2',
            fecha: doc.fechaRevision || doc.fechaElaboracion || '20/05/2026',
            usuario: usuarioElabora,
            comentario: doc.alcance || 'Actualizacion de documento, de acuerdo a revision y actualizacion masiva de documentos'
        });
    } else {
        list.push({
            version: String(currentVersion - 1),
            fecha: '01/10/2023',
            usuario: 'Carlos Humberto Barrera Rozo',
            comentario: 'Actualizacion de documento, de acuerdo a revision y actualizacion masiva de documentos'
        });
        list.push({
            version: String(currentVersion),
            fecha: doc.fechaAprobacion || doc.fechaRevision || doc.fechaElaboracion || '20/05/2026',
            usuario: usuarioElabora,
            comentario: doc.alcance || 'La estructuración de este formato tiene como finalidad fortalecer las estrategias de socialización, aprendizaje organizacional y cultura de seguridad del paciente, mediante la divulgación periódica de eventos, incidentes, causas identificadas, barreras de seguridad implementadas y recomendaciones orientadas a la prevención de la recurrencia de sucesos asociados a la atención en salud. Así mismo, este boletín permitirá estandarizar la presentación y difusión de las lecciones aprendidas derivadas de los análisis de eventos adversos e incidentes reportados en la institución, favoreciendo el fortalecimiento de prácticas seguras y la gestión del riesgo institucional.'
        });
    }
    return list;
};

export const MapaProcesos = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { showAlert } = useAlert();
    const [selectedProcess, setSelectedProcess] = useState(null);
    const [activeTab, setActiveTab] = useState('Documentos');
    const [tiposDocumentales, setTiposDocumentales] = useState([]);
    const [documentosSistema, setDocumentosSistema] = useState([]);
    const [loadingData, setLoadingData] = useState(false);
    const [expandedTipos, setExpandedTipos] = useState({});

    const [selectedDocument, setSelectedDocument] = useState(null);
    const [pdfUrl, setPdfUrl] = useState('');
    const [loadingPdf, setLoadingPdf] = useState(false);

    const openDocumentModal = async (doc, e) => {
        if (e) e.stopPropagation();
        setLoadingPdf(true);
        setSelectedDocument(doc);
        setPdfUrl('');
        try {
            if (doc.ubicacion && doc.ubicacion !== 'SIN_ARCHIVO') {
                const blob = await http.get(`/documentos/descargar/${doc.id}`, { responseType: 'blob' });
                const url = window.URL.createObjectURL(blob);
                setPdfUrl(url);
            }
        } catch (error) {
            showAlert({ message: 'No se pudo cargar el archivo PDF', status: 'error' });
        } finally {
            setLoadingPdf(false);
        }
    };

    const closeDocumentModal = () => {
        if (pdfUrl) {
            window.URL.revokeObjectURL(pdfUrl);
        }
        setSelectedDocument(null);
        setPdfUrl('');
    };

    const procesos = [
        { id: '1', title: 'GESTIÓN DE HUMANIZACIÓN', top: '20%', left: '22%', width: '13%', height: '7%' },
        { id: '2', title: 'GESTIÓN COMERCIAL Y MERCADEO', top: '31%', left: '24%', width: '11%', height: '6%' },
        { id: '3', title: 'GESTIÓN ESTRATÉGICA', top: '25%', left: '36.5%', width: '9%', height: '5%' },
        { id: '4', title: 'GESTIÓN DE CALIDAD', top: '24%', left: '49%', width: '8%', height: '5%' },
        { id: '5', title: 'SIAU', top: '25.3%', left: '59%', width: '9%', height: '5%' },
        { id: '6', title: 'GESTIÓN DE SALUD PÚBLICA', top: '31%', left: '69%', width: '9%', height: '6%' },
        { id: '7', title: 'GESTIÓN DE SEGURIDAD DEL PACIENTE', top: '23%', left: '71%', width: '13%', height: '7%' },
        { id: '8', title: 'GESTIÓN DE INTERNACIÓN DOMICILIARIO', top: '42%', left: '37%', width: '13%', height: '7%' },
        { id: '9', title: 'GESTIÓN DE CONSULTA EXTERNA', top: '42%', left: '52%', width: '13%', height: '6%' },
        { id: '10', title: 'GESTIÓN DE APOYO DIAGNOSTICO Y TERAPEUTICO', top: '49%', left: '44%', width: '14%', height: '6%' },
        { id: '11', title: 'GESTIÓN DE EDUCACIÓN CONTINUA', top: '60%', left: '37%', width: '13%', height: '6%' },
        { id: '12', title: 'DOCENCIA E INVESTIGACIÓN', top: '60%', left: '52%', width: '13%', height: '5%' },
        { id: '13', title: 'GESTIÓN DE CUENTAS MÉDICAS', top: '54%', left: '17%', width: '10%', height: '5%' },
        { id: '14', title: 'GESTIÓN FINANCIERA', top: '68%', left: '21%', width: '9%', height: '5%' },
        { id: '15', title: 'GESTIÓN DE TALENTO HUMANO', top: '74%', left: '25%', width: '10%', height: '5%' },
        { id: '16', title: 'GESTIÓN DE SEGURIDAD Y SALUD EN EL TRABAJO', top: '80%', left: '34%', width: '9%', height: '6%' },
        { id: '17', title: 'GESTIÓN DE INFRAESTRUCTURA', top: '82%', left: '44%', width: '11%', height: '5%' },
        { id: '18', title: 'GESTIÓN DE TECNOLOGÍA Y SISTEMAS DE INFORMACIÓN', top: '81%', left: '55.5%', width: '9%', height: '6%' },
        { id: '19', title: 'GESTIÓN DE ARCHIVO', top: '77%', left: '65%', width: '8%', height: '4%' },
        { id: '20', title: 'GESTIÓN DE COMUNICACIONES', top: '70%', left: '70%', width: '10%', height: '5%' },
        { id: '21', title: 'GESTIÓN DE COMPRAS', top: '64%', left: '74%', width: '8%', height: '5%' }
    ];

    const tabs = ['Documentos', 'Acciones de Mejora', 'Actas', 'Indicadores', 'Contexto'];

    useEffect(() => {
        const fetchDatos = async () => {
            setLoadingData(true);
            try {
                const [resTipos, resDocs] = await Promise.all([
                    http.get('/tipos-documento').catch(() => ({ data: [] })), 
                    http.get('/documentos').catch(() => ({ data: [] }))
                ]);
                setTiposDocumentales((resTipos.data?.data || resTipos.data || []).sort((a, b) => (a.orden || 99) - (b.orden || 99)));
                setDocumentosSistema(resDocs.data?.data || resDocs.data || []);
            } catch (error) {
            } finally {
                setLoadingData(false);
            }
        };
        fetchDatos();
    }, [location.pathname]);

    const toggleTipo = (tipoId) => setExpandedTipos(prev => ({ ...prev, [tipoId]: !prev[tipoId] }));

    const handleAction = async (doc, e) => {
        e.stopPropagation();
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
                } catch(err) {
                    showAlert({ message: 'El archivo físico PDF no existe en el servidor.', status: 'error' });
                }
            } else {
                showAlert({ message: 'Error de red al intentar descargar.', status: 'error' });
            }
        }
    };

    const documentosDelProcesoActual = selectedProcess 
        ? documentosSistema.filter(d => normalizeText(d.proceso) === normalizeText(selectedProcess.title)) 
        : [];

    return (
        <div className="min-h-screen bg-slate-50 p-4 md:p-8">
            <div className="max-w-[1200px] mx-auto space-y-8">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Mapa de Procesos</h1>
                    <p className="text-slate-500 mt-2">Sistema de Gestión de Calidad - IPS</p>
                </div>
                <div className="relative w-full shadow-2xl rounded-2xl overflow-hidden bg-white border border-gray-200">
                    <img src="/mapa_procesos_bg.jpg" alt="Mapa de Procesos" className="w-full h-auto block" />
                    {procesos.map(p => (
                        <button key={p.id} onClick={() => setSelectedProcess(p)} style={{ position: 'absolute', top: p.top, left: p.left, width: p.width, height: p.height }} className="bg-blue-500 opacity-0 hover:opacity-30 transition-opacity duration-200 cursor-pointer rounded-lg z-10" title={p.title} />
                    ))}
                </div>
            </div>

            <AnimatePresence>
                {selectedProcess && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-[#f2f2f2] w-full max-w-4xl max-h-[90vh] rounded shadow-2xl flex flex-col font-sans border border-[#a0a0a0] overflow-hidden">
                            <div className="flex bg-[#e8e8e8] border-b border-[#c0c0c0] pt-2 px-2 gap-1 overflow-x-auto shrink-0">
                                {tabs.map(tab => (
                                    <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-2 text-[13px] border border-b-0 rounded-t whitespace-nowrap ${activeTab === tab ? 'bg-white border-[#c0c0c0] text-gray-800' : 'bg-[#e0e0e0] border-transparent text-gray-600 hover:bg-[#d5d5d5]'}`}>{tab}</button>
                                ))}
                            </div>
                            <div className="bg-white p-8 overflow-y-auto flex-1">
                                <h2 className="text-[#666] text-[22px] font-bold uppercase tracking-wide border-b-[3px] border-dotted border-[#ccc] pb-4 mb-6 flex justify-between items-end">
                                    <span>{selectedProcess.title}</span>
                                    <span className="text-sm font-normal bg-blue-50 text-blue-600 px-3 py-1 rounded-full border border-blue-200">
                                        Total documentos: {documentosDelProcesoActual.length}
                                    </span>
                                </h2>
                                {activeTab === 'Documentos' && (
                                    <>
                                        <div className="flex justify-end items-center gap-2 mb-6 text-sm text-[#444]"><span className="font-medium">Filtrar:</span><select className="border border-gray-300 rounded px-2 py-1 bg-white outline-none"><option>Todos</option></select><ArrowDownAZ className="w-5 h-5 cursor-pointer hover:text-blue-600 transition-colors"/><ArrowUpZA className="w-5 h-5 cursor-pointer hover:text-blue-600 transition-colors"/></div>
                                        <div className="space-y-2 min-h-[200px]">
                                            {loadingData ? (
                                                <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-2 mt-10"><Loader2 className="w-8 h-8 animate-spin" /><p className="text-sm">Sincronizando sistema...</p></div>
                                            ) : tiposDocumentales.length === 0 ? (
                                                <div className="text-center text-gray-500 mt-10 text-sm">No hay tipos de documentos configurados.</div>
                                            ) : (
                                                tiposDocumentales.map(tipo => {
                                                    const docsDeEsteTipo = documentosDelProcesoActual.filter(d => normalizeText(d.tipo) === normalizeText(tipo.nombre));
                                                    const isExpanded = expandedTipos[tipo.id];
                                                    return (
                                                        <div key={tipo.id} className="border border-gray-100 rounded-lg overflow-hidden shadow-sm">
                                                            <div onClick={() => toggleTipo(tipo.id)} className={`flex items-center text-[#333] font-bold text-[13px] cursor-pointer px-4 py-3 transition-colors select-none ${isExpanded ? 'bg-blue-50' : 'bg-gray-50 hover:bg-gray-100'}`}>
                                                                <span className="bg-[#666] text-white w-[16px] h-[16px] flex items-center justify-center rounded-sm mr-3 shadow-sm shrink-0">{isExpanded ? <Minus size={12} strokeWidth={3} /> : <Plus size={12} strokeWidth={3} />}</span>
                                                                <span className="flex-1 uppercase">{tipo.nombre}</span>
                                                                <span className="ml-2 text-[11px] font-bold bg-white border border-gray-200 px-2.5 py-0.5 rounded-full text-gray-500 shadow-sm">{docsDeEsteTipo.length} doc{docsDeEsteTipo.length !== 1 ? 's' : ''}</span>
                                                            </div>
                                                            <AnimatePresence>
                                                                {isExpanded && (
                                                                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="bg-white overflow-hidden">
                                                                        <div className="p-2 border-t border-gray-100">
                                                                            {docsDeEsteTipo.length === 0 ? (
                                                                                <div className="text-[12px] text-gray-400 py-3 text-center italic bg-gray-50 rounded border border-dashed border-gray-200">No hay documentos registrados para este tipo.</div>
                                                                            ) : (
                                                                                <div className="space-y-1">
                                                                                    {docsDeEsteTipo.map(doc => (
                                                                                        <div key={doc.id} className="group text-[13px] px-3 py-2.5 rounded hover:bg-blue-50/50 text-gray-600 flex items-center gap-3 transition-colors border border-transparent hover:border-blue-100">
                                                                                            <FileText size={15} className="text-blue-400 shrink-0" />
                                                                                            <span className="font-mono text-[11px] font-bold text-slate-400 w-16 shrink-0">{doc.codigo || 'S/C'}</span>
                                                                                            <span className="truncate flex-1 font-medium group-hover:text-blue-700 transition-colors" title={doc.nombre}>{doc.nombre}</span>
                                                                                            {doc.estado && (<span className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded border shadow-sm shrink-0 tracking-wide ${getEstadoStyle(doc.estado)}`}>{doc.estado}</span>)}
                                                                                            <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1.5 transition-opacity ml-2 shrink-0">
                                                                                                <button onClick={(e) => openDocumentModal(doc, e)} className="p-1.5 text-slate-400 hover:text-blue-600 bg-white hover:bg-blue-50 border border-slate-200 rounded shadow-sm transition-colors" title="Ver Detalles"><Eye size={14} /></button>
                                                                                                <button onClick={(e) => handleAction(doc, e)} className="p-1.5 text-slate-400 hover:text-emerald-600 bg-white hover:bg-emerald-50 border border-slate-200 rounded shadow-sm transition-colors" title="Descargar Documento"><Download size={14} /></button>
                                                                                            </div>
                                                                                        </div>
                                                                                    ))}
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    </motion.div>
                                                                )}
                                                            </AnimatePresence>
                                                        </div>
                                                    )
                                                })
                                            )}
                                        </div>
                                    </>
                                )}
                                <div className="mt-8 pt-6 border-t border-gray-200">
                                    <button onClick={() => setSelectedProcess(null)} className="bg-gradient-to-b from-[#f9f9f9] to-[#e6e6e6] border border-[#ccc] text-[#333] px-6 py-2 rounded shadow-sm hover:from-[#f0f0f0] hover:to-[#d9d9d9] font-bold text-sm">Volver al Mapa</button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Document Viewer Modal */}
            <AnimatePresence>
                {selectedDocument && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }} 
                            animate={{ opacity: 1, y: 0 }} 
                            exit={{ opacity: 0, y: 20 }} 
                            className="bg-white w-full max-w-6xl my-4 rounded shadow-2xl flex flex-col font-sans border border-slate-400 overflow-hidden"
                        >
                            {/* Modal Navigation Bar */}
                            <div className="bg-[#f0f2f5] border-b border-slate-300 px-5 py-3 flex items-center justify-between shrink-0">
                                <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                                    Ver {selectedDocument.tipo || 'Documento'}
                                </span>
                                <button 
                                    onClick={closeDocumentModal} 
                                    className="text-slate-500 hover:text-slate-800 font-bold text-[11px] bg-slate-200 hover:bg-slate-300 px-3 py-1 rounded transition-colors"
                                >
                                    Cerrar
                                </button>
                            </div>

                            {/* Kawak-style Document Header */}
                            <div className="p-4 border-b border-slate-200 grid grid-cols-1 md:grid-cols-4 gap-4 items-center bg-white shrink-0">
                                {/* Logo Block */}
                                <div className="flex items-center gap-2 md:col-span-1 justify-center md:justify-start">
                                    <img src="/clinical_house_logo.jpg" alt="Clinical House" className="h-10 w-auto object-contain" onError={(e) => { e.target.src = '/logo.png' }} />
                                    <span className="text-sm font-bold text-slate-800 tracking-tight whitespace-nowrap">Clinical House</span>
                                </div>

                                {/* Title Block */}
                                <div className="text-center font-bold text-slate-800 text-[13px] md:text-sm md:col-span-2 uppercase border-y md:border-y-0 md:border-x border-slate-200 py-2 md:py-0 px-2 flex justify-center items-center min-h-[40px]">
                                    {selectedDocument.nombre || 'BOLETÍN DE LECCIONES APRENDIDAS'}
                                </div>

                                {/* Metadata Grid Table */}
                                <div className="text-[10px] text-slate-700 space-y-1.5 md:col-span-1 md:pl-4">
                                    <div className="flex justify-between">
                                        <span className="font-bold text-slate-500">Código:</span>
                                        <span className="font-mono">{selectedDocument.codigo || 'S/C'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="font-bold text-slate-500">Versión:</span>
                                        <span>{selectedDocument.version || '1'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="font-bold text-slate-500">Tipo:</span>
                                        <span className="uppercase">{selectedDocument.tipo || 'Documento'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="font-bold text-slate-500">Implementación:</span>
                                        <span>{selectedDocument.fechaAprobacion || selectedDocument.fechaRevision || selectedDocument.fechaElaboracion || '20/05/2026'}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Scrollable Document Content */}
                            <div className="p-5 space-y-5 overflow-y-auto max-h-[72vh] bg-slate-50">
                                
                                {/* PDF Document Iframe Container */}
                                <div className="border border-slate-300 rounded-lg overflow-hidden bg-white shadow-inner h-[480px]">
                                    {loadingPdf ? (
                                        <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-2">
                                            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                                            <p className="text-xs">Cargando visualización del documento...</p>
                                        </div>
                                    ) : pdfUrl ? (
                                        <iframe src={pdfUrl} className="w-full h-full border-0" title={selectedDocument.nombre} />
                                    ) : (
                                        <div className="flex flex-col items-center justify-center h-full text-slate-500 p-8 text-center bg-slate-50">
                                            <svg className="w-12 h-12 text-slate-300 mb-2" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" /></svg>
                                            <p className="text-xs font-semibold">Este documento no tiene un archivo físico PDF cargado.</p>
                                        </div>
                                    )}
                                </div>

                                {/* Control de Cambios Section */}
                                <div>
                                    <h4 className="text-[11px] font-bold text-[#d9752b] tracking-wider mb-2 uppercase border-b border-[#d9752b] pb-1 w-fit">
                                        Control de Cambios
                                    </h4>
                                    <div className="overflow-x-auto border border-[#d1d5db] rounded shadow-sm">
                                        <table className="w-full text-left border-collapse text-[11px] bg-white">
                                            <thead>
                                                <tr className="bg-[#f0f2f5] border-b border-[#d1d5db] text-[#444] font-bold">
                                                    <th className="px-4 py-2 border-r border-[#d1d5db] w-20 text-center">Versión</th>
                                                    <th className="px-4 py-2 border-r border-[#d1d5db] w-32 text-center">Fecha</th>
                                                    <th className="px-4 py-2 border-r border-[#d1d5db] w-48">Usuario</th>
                                                    <th className="px-4 py-2">Comentario</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {getHistorialCambios(selectedDocument).map((row, idx) => (
                                                    <tr key={idx} className="border-b border-[#e5e7eb] last:border-0 hover:bg-slate-50 text-slate-600">
                                                        <td className="px-4 py-3 border-r border-[#e5e7eb] text-center font-bold">{row.version}</td>
                                                        <td className="px-4 py-3 border-r border-[#e5e7eb] text-center">{row.fecha}</td>
                                                        <td className="px-4 py-3 border-r border-[#e5e7eb] font-medium">{row.usuario}</td>
                                                        <td className="px-4 py-3 leading-relaxed text-justify">{row.comentario}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* Signatures block */}
                                <div className="border border-[#d1d5db] rounded overflow-hidden shadow-sm bg-white">
                                    <div className="grid grid-cols-3 bg-[#f0f2f5] border-b border-[#d1d5db] text-[10px] font-bold text-slate-700 text-center uppercase tracking-wider py-1.5">
                                        <div className="border-r border-[#d1d5db]">Elaboró</div>
                                        <div className="border-r border-[#d1d5db]">Revisó</div>
                                        <div>Aprobó</div>
                                    </div>
                                    <div className="grid grid-cols-3 text-[11px] text-slate-600 min-h-[90px]">
                                        {/* Elaboro block */}
                                        <div className="p-3 border-r border-[#d1d5db] flex flex-col justify-between">
                                            <div className="space-y-1">
                                                <div className="font-bold text-slate-800">{selectedDocument.elabora || 'No asignado'}</div>
                                                <div className="text-[9px] text-slate-400 font-medium">Fecha de elaboración: {selectedDocument.fechaElaboracion || '20/05/2026'}</div>
                                            </div>
                                            <div className="text-[9px] text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded w-fit mt-2 border border-blue-200">
                                                Este documento ha sido visto 1 veces
                                            </div>
                                        </div>

                                        {/* Reviso block */}
                                        <div className="p-3 border-r border-[#d1d5db] flex flex-col justify-between">
                                            <div className="space-y-1">
                                                <div className="font-bold text-slate-800">{selectedDocument.revisa || 'No asignado'}</div>
                                                <div className="text-[9px] text-slate-400 font-medium">Fecha de revisión: {selectedDocument.fechaRevision || '20/05/2026'}</div>
                                            </div>
                                        </div>

                                        {/* Aprobo block */}
                                        <div className="p-3 flex flex-col justify-between">
                                            <div className="space-y-1">
                                                <div className="font-bold text-slate-800">{selectedDocument.aprueba || 'No asignado'}</div>
                                                <div className="text-[9px] text-slate-400 font-medium">Fecha de aprobación: {selectedDocument.fechaAprobacion || 'Pendiente'}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};
