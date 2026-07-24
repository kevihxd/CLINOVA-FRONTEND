import React, { useState, useEffect } from 'react';
import { Save, ChevronRight, ArrowRight, ArrowLeft, FileUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import http from '../../../services/httpClient';
import { useAlert } from '../../../providers/AlertProvider';

const DualListbox = ({ title, options = [], selectedOptions = [], onChange, extraRadioSection }) => {
    const [filter, setFilter] = useState('');
    const [highlightedAvailable, setHighlightedAvailable] = useState([]);
    const [highlightedChosen, setHighlightedChosen] = useState([]);

    const availableOptions = options.filter(opt => !selectedOptions.includes(opt));
    const filteredAvailable = availableOptions.filter(opt => opt.toLowerCase().includes(filter.toLowerCase()));

    const handleMoveRight = () => {
        if (highlightedAvailable.length === 0) return;
        const newSelected = [...selectedOptions, ...highlightedAvailable];
        setHighlightedAvailable([]);
        onChange(newSelected);
    };

    const handleMoveLeft = () => {
        if (highlightedChosen.length === 0) return;
        const newSelected = selectedOptions.filter(opt => !highlightedChosen.includes(opt));
        setHighlightedChosen([]);
        onChange(newSelected);
    };

    return (
        <div className="flex flex-col gap-2">
            {title && <label className="text-sm font-bold text-slate-700">{title}</label>}
            {extraRadioSection}
            <div className="flex flex-col md:flex-row items-center gap-4">
                <div className="w-full md:w-[45%] border border-slate-300 rounded overflow-hidden">
                    <div className="bg-slate-50 border-b border-slate-300 p-2 flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-600">Filtro:</span>
                        <input type="text" value={filter} onChange={(e) => setFilter(e.target.value)} className="w-full px-2 py-1 text-xs border border-slate-300 rounded focus:outline-none" />
                    </div>
                    <select multiple value={highlightedAvailable} onChange={(e) => setHighlightedAvailable(Array.from(e.target.selectedOptions, option => option.value))} className="w-full h-40 p-2 text-xs outline-none bg-white">
                        {filteredAvailable.map((opt, idx) => <option key={idx} value={opt} className="py-1 border-b border-slate-100 last:border-0">{opt}</option>)}
                    </select>
                </div>
                <div className="flex flex-col gap-2">
                    <button type="button" onClick={handleMoveRight} className="p-1.5 bg-slate-100 border border-slate-300 rounded hover:bg-slate-200"><ArrowRight size={16} className="text-slate-600" /></button>
                    <button type="button" onClick={handleMoveLeft} className="p-1.5 bg-slate-100 border border-slate-300 rounded hover:bg-slate-200"><ArrowLeft size={16} className="text-slate-600" /></button>
                </div>
                <div className="w-full md:w-[45%] border border-slate-300 rounded overflow-hidden">
                    <div className="bg-slate-50 border-b border-slate-300 p-2 h-[38px] flex items-center justify-center text-slate-400">--------</div>
                    <select multiple value={highlightedChosen} onChange={(e) => setHighlightedChosen(Array.from(e.target.selectedOptions, option => option.value))} className="w-full h-40 p-2 text-xs outline-none bg-white">
                        {selectedOptions.map((opt, idx) => <option key={idx} value={opt} className="py-1 border-b border-slate-100 last:border-0">{opt}</option>)}
                    </select>
                </div>
            </div>
        </div>
    );
};

export const CrearDocumentoForm = () => {
    const navigate = useNavigate();
    const { showAlert } = useAlert();

    const [formData, setFormData] = useState({
        nombre: '', tipo: '', proceso: '', ubicacion: '', sede: '', mesesRevision: '',
        alcance: '', confidencialidad: '', otrosProcesos: [], normas: [],
        elabora: [], revisa: [], aprueba: [], visualizacion: [], impresion: [],
        descargaOriginal: [], descargaPdf: []
    });

    const [archivoPdf, setArchivoPdf] = useState(null);
    const [archivoOriginal, setArchivoOriginal] = useState(null);
    const [codigoPreview, setCodigoPreview] = useState('');
    const [loadingCodigo, setLoadingCodigo] = useState(false);

    const [tiposDocumento, setTiposDocumento] = useState([]);
    const [cargos, setCargos] = useState([]);
    const [sedes, setSedes] = useState([]);
    const [usuarios, setUsuarios] = useState([]);

    const procesos = [
        'GESTIÓN DE HUMANIZACIÓN', 'GESTIÓN COMERCIAL Y MERCADEO', 'GESTIÓN ESTRATÉGICA', 
        'GESTIÓN DE CALIDAD', 'SIAU', 'GESTIÓN DE SALUD PÚBLICA', 'GESTIÓN DE SEGURIDAD DEL PACIENTE', 
        'GESTIÓN DE INTERNACIÓN DOMICILIARIO', 'GESTIÓN DE CONSULTA EXTERNA', 
        'GESTIÓN DE APOYO DIAGNOSTICO Y TERAPEUTICO', 'GESTIÓN DE EDUCACIÓN CONTINUA', 
        'DOCENCIA E INVESTIGACIÓN', 'GESTIÓN DE CUENTAS MÉDICAS', 'GESTIÓN FINANCIERA', 
        'GESTIÓN DE TALENTO HUMANO', 'GESTIÓN DE SEGURIDAD Y SALUD EN EL TRABAJO', 
        'GESTIÓN DE INFRAESTRUCTURA', 'GESTIÓN DE TECNOLOGÍA Y SISTEMAS DE INFORMACIÓN', 
        'GESTIÓN DE ARCHIVO', 'GESTIÓN DE COMUNICACIONES', 'GESTIÓN DE COMPRAS'
    ];

    const normas = ['Acreditacion', 'Habilitación (Resolución 3100 de 2019)', 'ISO 9001:2015'];
    const grupos = ['Clinical House- Todos', 'FISIOTERAPIA', 'MEDICINA GENERAL'];

    const [modoCreacion, setModoCreacion] = useState('Nuevo Documento');
    const [tipoCodigo, setTipoCodigo] = useState('Automático');
    const [metodoCreacion, setMetodoCreacion] = useState('Archivo (Office, PDF)');
    const [usaPlantilla, setUsaPlantilla] = useState('Sí');
    
    const [elaboraTipo, setElaboraTipo] = useState('cargos');
    const [revisaTipo, setRevisaTipo] = useState('cargos');
    const [apruebaTipo, setApruebaTipo] = useState('cargos');
    const [responsableTipo, setResponsableTipo] = useState('usuarios');
    const [visualizacionPermisoTipo, setVisualizacionPermisoTipo] = useState('grupos');
    const [impresionPermisoTipo, setImpresionPermisoTipo] = useState('grupos');
    const [descargaOriginalTipo, setDescargaOriginalTipo] = useState('grupos');
    const [descargaPdfTipo, setDescargaPdfTipo] = useState('grupos');

    useEffect(() => {
        const fetchDatosGlobales = async () => {
            try {
                const [resTipos, resCargos, resSedes, resUsuarios] = await Promise.all([
                    http.get('/tipos-documento').catch(() => []),
                    http.get('/cargos').catch(() => []),
                    http.get('/sedes').catch(() => []),
                    http.get('/usuarios').catch(() => [])
                ]);
                
                const parseArray = (res) => {
                    if (!res) return [];
                    if (Array.isArray(res)) return res;
                    if (Array.isArray(res.data)) return res.data;
                    if (res.data && Array.isArray(res.data.data)) return res.data.data;
                    if (res.data && Array.isArray(res.data.content)) return res.data.content;
                    if (Array.isArray(res.content)) return res.content;
                    return [];
                };
                
                const tipos = parseArray(resTipos);
                setTiposDocumento(tipos.map(t => t.nombre || t));
                
                const cargosList = parseArray(resCargos);
                setCargos(cargosList.map(c => c.nombre || c));

                const sedesList = parseArray(resSedes);
                setSedes(sedesList.map(s => s.nombre || s));

                const usuariosList = parseArray(resUsuarios);
                setUsuarios(usuariosList.map(u => {
                    const fullName = u.persona ? `${u.persona.primerNombre || ''} ${u.persona.primerApellido || ''}`.trim() : `${u.nombres || ''} ${u.apellidos || ''}`.trim();
                    return fullName || u.username;
                }));
            } catch (error) {}
        };
        fetchDatosGlobales();
    }, []);

    const getOptions = (tipo) => {
        if (tipo === 'usuarios') return usuarios;
        if (tipo === 'cargos') return cargos;
        if (tipo === 'grupos') return grupos;
        return [];
    };

    const handleChange = (e) => {
        const updated = { ...formData, [e.target.name]: e.target.value };
        setFormData(updated);
        if (e.target.name === 'proceso' || e.target.name === 'tipo') {
            const p = e.target.name === 'proceso' ? e.target.value : formData.proceso;
            const t = e.target.name === 'tipo' ? e.target.value : formData.tipo;
            if (p && t && (tipoCodigo === 'Automático' || tipoCodigo === 'Semiautomático')) {
                fetchCodigoPreview(p, t);
            }
        }
    };
    const updateListState = (listName, newSelectedOptions) => setFormData(prev => ({ ...prev, [listName]: newSelectedOptions }));

    const fetchCodigoPreview = async (proceso, tipo) => {
        if (!proceso || !tipo) return;
        setLoadingCodigo(true);
        try {
            const res = await http.get('/documentos/codigo-preview', { params: { proceso, tipo } });
            const data = res?.data || res;
            setCodigoPreview(data?.codigo || '');
        } catch { setCodigoPreview(''); }
        finally { setLoadingCodigo(false); }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (metodoCreacion === 'Archivo (Office, PDF)' && !archivoPdf && !archivoOriginal) {
            showAlert({ message: 'Debe subir un archivo (Original o PDF) para este método de creación.', status: 'warning' });
            return;
        }

        const data = new FormData();
        
        data.append('nombre', formData.nombre);
        data.append('tipo', formData.tipo);
        data.append('proceso', formData.proceso);
        data.append('ubicacion', formData.ubicacion);
        data.append('sede', formData.sede);
        data.append('mesesRevision', formData.mesesRevision);
        data.append('alcance', formData.alcance);
        data.append('confidencialidad', formData.confidencialidad);
        
        data.append('elabora', formData.elabora.join(', '));
        data.append('revisa', formData.revisa.join(', '));
        data.append('aprueba', formData.aprueba.join(', '));
        data.append('visualizacion', formData.visualizacion.join(', '));
        data.append('impresion', formData.impresion.join(', '));
        data.append('descargaOriginal', formData.descargaOriginal.join(', '));
        data.append('descargaPdf', formData.descargaPdf.join(', '));
        data.append('otrosProcesos', formData.otrosProcesos.join(', '));
        data.append('normas', formData.normas.join(', '));

        const codigoFinal = tipoCodigo === 'Automático' ? 'Automático'
            : tipoCodigo === 'Semiautomático' ? (codigoPreview || 'Automático')
            : tipoCodigo === 'Manual' ? (formData.codigo || codigoPreview || 'N/A')
            : 'N/A';

        data.append('codigo', codigoFinal);
        data.append('metodoCreacion', metodoCreacion);
        data.append('plantilla', usaPlantilla);
        data.append('estado', 'EN REVISIÓN');
        
        if (archivoOriginal) {
            data.append('archivo', archivoOriginal);
        }
        
        if (archivoPdf) {
            data.append('archivoPdf', archivoPdf);
        }

        try {
            await http.post('/documentos', data, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            showAlert({ message: 'Documento creado y enviado a Visto Bueno exitosamente', status: 'success' });
            navigate('/procesos/listado-unico');
        } catch (error) {
            showAlert({ message: 'Error al guardar el documento', status: 'error' });
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 p-6 md:p-8 font-sans">
            <div className="max-w-[1200px] mx-auto space-y-4">
                <div className="flex flex-wrap items-center gap-4 bg-white p-4 rounded-lg shadow-sm border border-slate-200">
                    {['Nuevo Documento', 'Nueva Versión', 'Documento Migrado'].map((modo) => (
                        <label key={modo} className="flex items-center gap-2 cursor-pointer text-sm font-medium text-slate-700">
                            <input type="radio" name="modoCreacion" checked={modoCreacion === modo} onChange={() => setModoCreacion(modo)} className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-slate-300" /> {modo}
                        </label>
                    ))}
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
                    {modoCreacion === 'Nueva Versión' ? (
                        <>
                            <div className="bg-[#f8f9fa] border-b border-slate-200 px-6 py-4 flex flex-col gap-1">
                                <div className="flex items-center gap-2 text-blue-600 font-bold text-[15px]"><ChevronRight size={18} /> Insertar Nueva Versión</div>
                                <p className="text-sm text-slate-500 ml-6">Crear una nueva versión de un documento implementado</p>
                            </div>
                            <div className="p-6 md:p-8">
                                <div className="text-xs text-red-500 font-bold mb-6">* Campo Requerido</div>
                                <form onSubmit={handleSubmit} className="space-y-8">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                                        <div className="flex flex-col gap-1">
                                            <label className="text-sm font-bold text-slate-700">Nombre <span className="text-red-500">*</span></label>
                                            <select name="nombre" value={formData.nombre} onChange={handleChange} required className="w-full px-3 py-2 border border-slate-300 rounded text-sm focus:outline-none focus:border-blue-500 bg-white"><option value="">Seleccionar</option><option value="DOCUMENTO ACTUALIZADO">DOCUMENTO ACTUALIZADO</option></select>
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <label className="text-sm font-bold text-slate-700">Control de cambios</label>
                                        <textarea className="w-full px-3 py-2 border border-slate-300 rounded text-sm focus:outline-none focus:border-blue-500 min-h-[100px]"></textarea>
                                    </div>
                                    <div className="pt-6 border-t border-slate-200 space-y-6">
                                        <h3 className="text-[15px] font-bold text-slate-800 border-b border-slate-200 pb-2">Permisos</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                            <div className="flex flex-col gap-3">
                                                <label className="text-sm font-bold text-slate-700">Responsables</label>
                                                <div className="flex gap-4">
                                                    <label className="flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer"><input type="radio" name="resp_nv" checked={responsableTipo === 'usuarios'} onChange={() => setResponsableTipo('usuarios')} className="text-blue-600" /> Por Usuarios</label>
                                                    <label className="flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer"><input type="radio" name="resp_nv" checked={responsableTipo === 'cargos'} onChange={() => setResponsableTipo('cargos')} className="text-blue-600" /> Por Cargos</label>
                                                </div>
                                                <DualListbox options={getOptions(responsableTipo)} selectedOptions={formData.elabora} onChange={(val) => updateListState('elabora', val)} />
                                            </div>
                                            <div className="flex flex-col gap-3">
                                                <label className="text-sm font-bold text-slate-700">Visualización</label>
                                                <div className="flex gap-4 flex-wrap">
                                                    <label className="flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer"><input type="radio" name="vis_nv" checked={visualizacionPermisoTipo === 'usuarios'} onChange={() => setVisualizacionPermisoTipo('usuarios')} className="text-blue-600" /> Por Usuarios</label>
                                                    <label className="flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer"><input type="radio" name="vis_nv" checked={visualizacionPermisoTipo === 'cargos'} onChange={() => setVisualizacionPermisoTipo('cargos')} className="text-blue-600" /> Por Cargos</label>
                                                    <label className="flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer"><input type="radio" name="vis_nv" checked={visualizacionPermisoTipo === 'grupos'} onChange={() => setVisualizacionPermisoTipo('grupos')} className="text-blue-600" /> Por Grupos</label>
                                                </div>
                                                <DualListbox options={getOptions(visualizacionPermisoTipo)} selectedOptions={formData.visualizacion} onChange={(val) => updateListState('visualizacion', val)} />
                                            </div>
                                            <div className="flex flex-col gap-3">
                                                <label className="text-sm font-bold text-slate-700">Impresión</label>
                                                <div className="flex gap-4 flex-wrap">
                                                    <label className="flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer"><input type="radio" name="imp_nv" checked={impresionPermisoTipo === 'usuarios'} onChange={() => setImpresionPermisoTipo('usuarios')} className="text-blue-600" /> Por Usuarios</label>
                                                    <label className="flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer"><input type="radio" name="imp_nv" checked={impresionPermisoTipo === 'cargos'} onChange={() => setImpresionPermisoTipo('cargos')} className="text-blue-600" /> Por Cargos</label>
                                                    <label className="flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer"><input type="radio" name="imp_nv" checked={impresionPermisoTipo === 'grupos'} onChange={() => setImpresionPermisoTipo('grupos')} className="text-blue-600" /> Por Grupos</label>
                                                </div>
                                                <DualListbox options={getOptions(impresionPermisoTipo)} selectedOptions={formData.impresion} onChange={(val) => updateListState('impresion', val)} />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="pt-6 border-t border-slate-200 flex justify-end gap-3">
                                        <button type="button" onClick={() => navigate('/procesos/listado-unico')} className="px-5 py-2 border border-slate-300 rounded text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors">Cancelar</button>
                                        <button type="submit" className="flex items-center gap-2 px-5 py-2 bg-blue-600 text-white rounded text-sm font-bold hover:bg-blue-700 transition-colors shadow-sm"><Save size={16} /> Guardar Documento</button>
                                    </div>
                                </form>
                            </div>
                        </>
                    ) : modoCreacion === 'Nuevo Documento' ? (
                        <>
                            <div className="bg-[#f8f9fa] border-b border-slate-200 px-6 py-4 flex flex-col gap-1">
                                <div className="flex items-center gap-2 text-blue-600 font-bold text-[15px]"><ChevronRight size={18} /> Crear Documento</div>
                                <p className="text-sm text-slate-500 ml-6">Crear un documento del sistema de gestión en versión 1</p>
                            </div>
                            <div className="p-6 md:p-8">
                                <div className="text-xs text-red-500 font-bold mb-6">* Campo Requerido</div>
                                <form onSubmit={handleSubmit} className="space-y-8">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                                        <div className="flex flex-col gap-1">
                                            <label className="text-sm font-bold text-slate-700">Nombre <span className="text-red-500">*</span></label>
                                            <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} required className="w-full px-3 py-2 border border-slate-300 rounded text-sm focus:outline-none focus:border-blue-500 bg-white" />
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <label className="text-sm font-bold text-slate-700">Tipo <span className="text-red-500">*</span></label>
                                            <select name="tipo" value={formData.tipo} onChange={handleChange} required className="w-full px-3 py-2 border border-slate-300 rounded text-sm focus:outline-none focus:border-blue-500 bg-white"><option value="">Seleccionar</option>{tiposDocumento.map(tipo => <option key={tipo} value={tipo}>{tipo}</option>)}</select>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <label className="text-sm font-bold text-slate-700">Proceso <span className="text-red-500">*</span></label>
                                            <select name="proceso" value={formData.proceso} onChange={handleChange} required className="w-full px-3 py-2 border border-slate-300 rounded text-sm focus:outline-none focus:border-blue-500 bg-white"><option value="">Seleccionar</option>{procesos.map((proc, idx) => <option key={idx} value={proc} className="font-semibold text-slate-800">{proc}</option>)}</select>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <label className="text-sm font-bold text-slate-700">Ubicación</label>
                                            <input type="text" name="ubicacion" value={formData.ubicacion} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded text-sm focus:outline-none focus:border-blue-500 bg-white" />
                                        </div>
                                    </div>

                                    <DualListbox title="Otros procesos" options={procesos} selectedOptions={formData.otrosProcesos} onChange={(val) => updateListState('otrosProcesos', val)} />

                                    <div className="space-y-4">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-2 gap-4">
                                            <h3 className="text-[15px] font-bold text-slate-800">Asociar solicitud de documento</h3>
                                            <button type="button" className="px-3 py-1 bg-slate-100 text-slate-600 border border-slate-300 rounded hover:bg-slate-200 text-xs font-bold transition-colors">Descartar</button>
                                        </div>
                                        <div className="overflow-x-auto border border-slate-200 rounded">
                                            <table className="w-full text-left border-collapse whitespace-nowrap">
                                                <thead>
                                                    <tr className="bg-slate-50 border-b border-slate-200 text-xs text-slate-700 font-bold">
                                                        <th className="px-3 py-2.5 border-r border-slate-200">Tipo de solicitud</th><th className="px-3 py-2.5 border-r border-slate-200 text-center">Fecha de aprobación</th><th className="px-3 py-2.5 border-r border-slate-200">Responsable</th><th className="px-3 py-2.5">Descripción</th>
                                                    </tr>
                                                </thead>
                                                <tbody><tr><td colSpan="4" className="px-3 py-6 text-center text-slate-500 text-sm bg-white">No hay datos disponibles</td></tr></tbody>
                                            </table>
                                        </div>
                                    </div>

                                    <DualListbox title="Normas" options={normas} selectedOptions={formData.normas} onChange={(val) => updateListState('normas', val)} />

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                                        <div className="flex flex-col gap-2">
                                            <label className="text-sm font-bold text-slate-700">Código</label>
                                            <div className="flex gap-4 flex-wrap">
                                                {['Automático', 'Semiautomático', 'Manual', 'N/A'].map(op => (
                                                    <label key={op} className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 cursor-pointer">
                                                        <input type="radio" name="codigoMode" checked={tipoCodigo === op}
                                                            onChange={() => {
                                                                setTipoCodigo(op);
                                                                if ((op === 'Automático' || op === 'Semiautomático') && formData.proceso && formData.tipo) {
                                                                    fetchCodigoPreview(formData.proceso, formData.tipo);
                                                                }
                                                            }}
                                                            className="text-blue-600 focus:ring-blue-500 h-4 w-4" /> {op}
                                                    </label>
                                                ))}
                                            </div>
                                            {tipoCodigo === 'Automático' && (
                                                <div className="flex items-center gap-2 mt-1">
                                                    {loadingCodigo ? (
                                                        <span className="text-xs text-blue-600 animate-pulse font-medium">Generando código consecutivo...</span>
                                                    ) : codigoPreview ? (
                                                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-md text-sm font-mono font-bold text-blue-700 shadow-xs">
                                                            🔖 {codigoPreview}
                                                            <span className="text-[10px] font-semibold text-blue-500 ml-1">(generado automáticamente)</span>
                                                        </span>
                                                    ) : (
                                                        <span className="text-xs text-slate-400 italic">Seleccione Proceso y Tipo para generar el código</span>
                                                    )}
                                                </div>
                                            )}
                                            {tipoCodigo === 'Semiautomático' && (
                                                <div className="flex flex-col gap-1.5 mt-1">
                                                    <div className="flex items-center gap-2">
                                                        <input
                                                            type="text"
                                                            value={codigoPreview}
                                                            onChange={(e) => setCodigoPreview(e.target.value)}
                                                            placeholder="Ej: PSST-PG-17"
                                                            className="px-3 py-1.5 border border-blue-400 bg-blue-50/40 rounded text-sm font-mono font-bold text-slate-800 focus:outline-none focus:border-blue-600 focus:bg-white w-64 shadow-xs"
                                                        />
                                                        {loadingCodigo && <span className="text-xs text-blue-500 animate-pulse">Cargando sugerencia...</span>}
                                                    </div>
                                                    <span className="text-[11px] text-slate-500">
                                                        Código sugerido generado automáticamente. Puede modificarlo o personalizarlo libremente antes de guardar.
                                                    </span>
                                                </div>
                                            )}
                                            {tipoCodigo === 'Manual' && (
                                                <input
                                                    type="text"
                                                    name="codigo"
                                                    value={formData.codigo || ''}
                                                    onChange={handleChange}
                                                    placeholder="Ingrese el código manualmente"
                                                    className="mt-1 px-3 py-1.5 border border-slate-300 rounded text-sm font-mono focus:outline-none focus:border-blue-500 w-64"
                                                />
                                            )}
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <label className="text-sm font-bold text-slate-700">Sede</label>
                                            <select name="sede" value={formData.sede} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded text-sm focus:outline-none focus:border-blue-500 bg-white"><option value="">Seleccionar</option>{sedes.map(sede => <option key={sede} value={sede}>{sede}</option>)}</select>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <label className="text-sm font-bold text-slate-700">Meses para revisión</label>
                                            <input type="number" min="0" name="mesesRevision" value={formData.mesesRevision} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded text-sm focus:outline-none focus:border-blue-500 bg-white" />
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <label className="text-sm font-bold text-slate-700">Alcance</label>
                                            <select name="alcance" value={formData.alcance} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded text-sm focus:outline-none focus:border-blue-500 bg-white"><option value="">Seleccionar</option><option value="A toda la organización">A toda la organización</option><option value="A varios procesos">A varios procesos</option><option value="Al proceso">Al proceso</option></select>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <label className="text-sm font-bold text-slate-700">Nivel de confidencialidad</label>
                                            <select name="confidencialidad" value={formData.confidencialidad} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded text-sm focus:outline-none focus:border-blue-500 bg-white"><option value="">Seleccionar</option><option value="Confidencial">Confidencial</option><option value="Interno">Interno</option><option value="Público">Público</option></select>
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <label className="text-sm font-bold text-slate-700">Método de creación</label>
                                            <div className="flex gap-4">
                                                {['Archivo (Office, PDF)', 'Edición en línea'].map(op => <label key={op} className="flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer"><input type="radio" name="metodoCreacion" checked={metodoCreacion === op} onChange={() => setMetodoCreacion(op)} className="text-blue-600 focus:ring-blue-500" /> {op}</label>)}
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <label className="text-sm font-bold text-slate-700">Archivo original</label>
                                            <input type="file" onChange={(e) => setArchivoOriginal(e.target.files[0])} className="w-full px-3 py-2 border border-slate-300 rounded text-sm focus:outline-none focus:border-blue-500 bg-white" />
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <label className="text-sm font-bold text-slate-700">Archivo PDF</label>
                                            <div className="relative mt-1">
                                                <input type="file" accept=".pdf" onChange={e => setArchivoPdf(e.target.files[0])} className="hidden" id="file-upload" />
                                                <label htmlFor="file-upload" className="flex items-center gap-2 w-full px-4 py-2 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors text-slate-500 text-sm">
                                                    <FileUp size={18} /> {archivoPdf ? archivoPdf.name : 'Subir archivo PDF oficial'}
                                                </label>
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <label className="text-sm font-bold text-slate-700">¿Desea usar una plantilla?</label>
                                            <div className="flex gap-4">
                                                {['Sí', 'No'].map(op => <label key={op} className="flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer"><input type="radio" name="plantilla" checked={usaPlantilla === op} onChange={() => setUsaPlantilla(op)} className="text-blue-600 focus:ring-blue-500" /> {op}</label>)}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-6 border-t border-slate-200 space-y-6">
                                        <DualListbox title={`Elabora(n) - ${elaboraTipo === 'usuarios' ? 'Usuarios' : 'Cargos'}`} options={getOptions(elaboraTipo)} selectedOptions={formData.elabora} onChange={v => setFormData({...formData, elabora: v})} extraRadioSection={<div className="flex gap-4 mb-2"><label className="flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer"><input type="radio" checked={elaboraTipo === 'usuarios'} onChange={() => setElaboraTipo('usuarios')} className="text-blue-600" /> Por Usuarios</label><label className="flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer"><input type="radio" checked={elaboraTipo === 'cargos'} onChange={() => setElaboraTipo('cargos')} className="text-blue-600" /> Por Cargos</label></div>} />
                                        <DualListbox title={`Revisa(n) - ${revisaTipo === 'usuarios' ? 'Usuarios' : 'Cargos'}`} options={getOptions(revisaTipo)} selectedOptions={formData.revisa} onChange={v => setFormData({...formData, revisa: v})} extraRadioSection={<div className="flex gap-4 mb-2"><label className="flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer"><input type="radio" checked={revisaTipo === 'usuarios'} onChange={() => setRevisaTipo('usuarios')} className="text-blue-600" /> Por Usuarios</label><label className="flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer"><input type="radio" checked={revisaTipo === 'cargos'} onChange={() => setRevisaTipo('cargos')} className="text-blue-600" /> Por Cargos</label></div>} />
                                        <DualListbox title={`Aprueba(n) - ${apruebaTipo === 'usuarios' ? 'Usuarios' : 'Cargos'}`} options={getOptions(apruebaTipo)} selectedOptions={formData.aprueba} onChange={v => setFormData({...formData, aprueba: v})} extraRadioSection={<div className="flex gap-4 mb-2"><label className="flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer"><input type="radio" checked={apruebaTipo === 'usuarios'} onChange={() => setApruebaTipo('usuarios')} className="text-blue-600" /> Por Usuarios</label><label className="flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer"><input type="radio" checked={apruebaTipo === 'cargos'} onChange={() => setApruebaTipo('cargos')} className="text-blue-600" /> Por Cargos</label></div>} />
                                    </div>

                                    <div className="pt-6 border-t border-slate-200 space-y-8">
                                        <div>
                                            <DualListbox title="Visualización" options={getOptions(visualizacionPermisoTipo)} selectedOptions={formData.visualizacion} onChange={(val) => updateListState('visualizacion', val)} extraRadioSection={<div className="flex gap-4 mb-2"><label className="flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer"><input type="radio" checked={visualizacionPermisoTipo === 'usuarios'} onChange={() => setVisualizacionPermisoTipo('usuarios')} className="text-blue-600" /> Por Usuarios</label><label className="flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer"><input type="radio" checked={visualizacionPermisoTipo === 'cargos'} onChange={() => setVisualizacionPermisoTipo('cargos')} className="text-blue-600" /> Por Cargos</label><label className="flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer"><input type="radio" checked={visualizacionPermisoTipo === 'grupos'} onChange={() => setVisualizacionPermisoTipo('grupos')} className="text-blue-600" /> Por Grupos</label></div>} />
                                            <label className="flex items-start gap-2 text-xs text-slate-600 cursor-pointer mt-2"><input type="checkbox" className="mt-0.5 rounded text-blue-600 focus:ring-blue-500" /> Indicar obligatoriedad de lectura y aceptación</label>
                                        </div>
                                        <div className="space-y-6">
                                            <h3 className="text-sm font-bold text-slate-700">Impresión y Descarga</h3>
                                            <DualListbox title="Impresión" options={getOptions(impresionPermisoTipo)} selectedOptions={formData.impresion} onChange={(val) => updateListState('impresion', val)} extraRadioSection={<div className="flex gap-4 mb-2"><label className="flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer"><input type="radio" checked={impresionPermisoTipo === 'usuarios'} onChange={() => setImpresionPermisoTipo('usuarios')} className="text-blue-600" /> Por Usuarios</label><label className="flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer"><input type="radio" checked={impresionPermisoTipo === 'cargos'} onChange={() => setImpresionPermisoTipo('cargos')} className="text-blue-600" /> Por Cargos</label><label className="flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer"><input type="radio" checked={impresionPermisoTipo === 'grupos'} onChange={() => setImpresionPermisoTipo('grupos')} className="text-blue-600" /> Por Grupos</label></div>} />
                                            <DualListbox title="Descargar archivo original" options={getOptions(descargaOriginalTipo)} selectedOptions={formData.descargaOriginal} onChange={(val) => updateListState('descargaOriginal', val)} extraRadioSection={<div className="flex gap-4 mb-2"><label className="flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer"><input type="radio" checked={descargaOriginalTipo === 'usuarios'} onChange={() => setDescargaOriginalTipo('usuarios')} className="text-blue-600" /> Por Usuarios</label><label className="flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer"><input type="radio" checked={descargaOriginalTipo === 'cargos'} onChange={() => setDescargaOriginalTipo('cargos')} className="text-blue-600" /> Por Cargos</label><label className="flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer"><input type="radio" checked={descargaOriginalTipo === 'grupos'} onChange={() => setDescargaOriginalTipo('grupos')} className="text-blue-600" /> Por Grupos</label></div>} />
                                            <DualListbox title="Descargar archivo PDF" options={getOptions(descargaPdfTipo)} selectedOptions={formData.descargaPdf} onChange={(val) => updateListState('descargaPdf', val)} extraRadioSection={<div className="flex gap-4 mb-2"><label className="flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer"><input type="radio" checked={descargaPdfTipo === 'usuarios'} onChange={() => setDescargaPdfTipo('usuarios')} className="text-blue-600" /> Por Usuarios</label><label className="flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer"><input type="radio" checked={descargaPdfTipo === 'cargos'} onChange={() => setDescargaPdfTipo('cargos')} className="text-blue-600" /> Por Cargos</label><label className="flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer"><input type="radio" checked={descargaPdfTipo === 'grupos'} onChange={() => setDescargaPdfTipo('grupos')} className="text-blue-600" /> Por Grupos</label></div>} />
                                        </div>
                                    </div>
                                    <div className="pt-6 border-t border-slate-200 flex justify-end gap-3">
                                        <button type="button" onClick={() => navigate('/procesos/listado-unico')} className="px-5 py-2 border border-slate-300 rounded text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors">Cancelar</button>
                                        <button type="submit" className="flex items-center gap-2 px-5 py-2 bg-blue-600 text-white rounded text-sm font-bold hover:bg-blue-700 transition-colors shadow-sm"><Save size={16} /> Enviar a Revisión</button>
                                    </div>
                                </form>
                            </div>
                        </>
                    ) : (<div className="p-8 text-center text-slate-500">Modo "Documento Migrado" en construcción.</div>)}
                </div>
            </div>
        </div>
    );
};