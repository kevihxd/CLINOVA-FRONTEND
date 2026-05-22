import React, { useState, useEffect } from 'react';
import { Search, FileSpreadsheet, Eye, Edit2, Trash2, Download, X, FileText, CheckCircle, History, Save, ArrowRight, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import http from '../../../services/httpClient';
import { useAlert } from '../../../providers/AlertProvider';
import { useAuth } from '../../../providers/AuthProvider';
import { TrazabilidadPanel } from '../../../components/TrazabilidadPanel';

/* ─── DualListbox ──────────────────────────────────────────── */
const DualListbox = ({ title, options = [], selectedOptions = [], onChange }) => {
    const [filter, setFilter] = useState('');
    const [hiA, setHiA] = useState([]);
    const [hiC, setHiC] = useState([]);

    const available = options.filter(o => !selectedOptions.includes(o) && o.toLowerCase().includes(filter.toLowerCase()));

    return (
        <div className="flex flex-col gap-1">
            {title && <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wide">{title}</label>}
            <div className="flex items-start gap-1.5">
                <div className="flex-1 border border-slate-300 rounded overflow-hidden">
                    <div className="bg-slate-50 border-b border-slate-200 px-1.5 py-1 flex gap-1 items-center">
                        <span className="text-[9px] text-slate-400 font-semibold shrink-0">Buscar:</span>
                        <input value={filter} onChange={e => setFilter(e.target.value)} className="w-full text-[10px] border border-slate-200 rounded px-1 py-0.5 focus:outline-none" />
                    </div>
                    <select multiple value={hiA} onChange={e => setHiA(Array.from(e.target.selectedOptions, o => o.value))} className="w-full h-24 p-1 text-[10px] outline-none">
                        {available.map((o, i) => <option key={i} value={o}>{o}</option>)}
                    </select>
                </div>
                <div className="flex flex-col gap-1 pt-8">
                    <button type="button" onClick={() => { if (!hiA.length) return; onChange([...selectedOptions, ...hiA]); setHiA([]); }} className="p-0.5 bg-slate-100 border border-slate-300 rounded hover:bg-blue-100"><ArrowRight size={11} /></button>
                    <button type="button" onClick={() => { if (!hiC.length) return; onChange(selectedOptions.filter(o => !hiC.includes(o))); setHiC([]); }} className="p-0.5 bg-slate-100 border border-slate-300 rounded hover:bg-blue-100"><ArrowLeft size={11} /></button>
                </div>
                <div className="flex-1 border border-slate-300 rounded overflow-hidden">
                    <div className="bg-slate-50 border-b border-slate-200 px-1.5 py-1 h-[28px] flex items-center justify-center">
                        <span className="text-[9px] text-slate-300">--------</span>
                    </div>
                    <select multiple value={hiC} onChange={e => setHiC(Array.from(e.target.selectedOptions, o => o.value))} className="w-full h-24 p-1 text-[10px] outline-none">
                        {selectedOptions.map((o, i) => <option key={i} value={o}>{o}</option>)}
                    </select>
                </div>
            </div>
        </div>
    );
};

/* ─── EditarDocumentoModal ─────────────────────────────────── */
const PROCESOS = [
    'GESTIÓN DE HUMANIZACIÓN','GESTIÓN COMERCIAL Y MERCADEO','GESTIÓN ESTRATÉGICA',
    'GESTIÓN DE CALIDAD','SIAU','GESTIÓN DE SALUD PÚBLICA','GESTIÓN DE SEGURIDAD DEL PACIENTE',
    'GESTIÓN DE INTERNACIÓN DOMICILIARIO','GESTIÓN DE CONSULTA EXTERNA',
    'GESTIÓN DE APOYO DIAGNOSTICO Y TERAPEUTICO','GESTIÓN DE EDUCACIÓN CONTINUA',
    'DOCENCIA E INVESTIGACIÓN','GESTIÓN DE CUENTAS MÉDICAS','GESTIÓN FINANCIERA',
    'GESTIÓN DE TALENTO HUMANO','GESTIÓN DE SEGURIDAD Y SALUD EN EL TRABAJO',
    'GESTIÓN DE INFRAESTRUCTURA','GESTIÓN DE TECNOLOGÍA Y SISTEMAS DE INFORMACIÓN',
    'GESTIÓN DE ARCHIVO','GESTIÓN DE COMUNICACIONES','GESTIÓN DE COMPRAS'
];
const NORMAS_OPTS = ['Acreditacion','Habilitación (Resolución 3100 de 2019)','ISO 9001:2015'];
const GRUPOS = [
    'Clinical House- Todos','FISIOTERAPIA','MEDICINA GENERAL',
    'ATENCIÓN DOMICILIARIA Y CONSULTA EXTERNA','SEGURIDAD DEL PACIENTE',
    'SEGURIDAD DEL PACIENTE FORMATOS Y OTROS','SEGURIDAD Y SALUD EN EL TRABAJO',
    'INFRAESTRUCTURA Y TECNOLOGÍA','INFRAESTRUCTURA Y TECNOLOGÍA FORMATOS Y OTROS'
];

const csv = v => v ? v.split(',').map(s => s.trim()).filter(Boolean) : [];

const EditarDocumentoModal = ({ doc, onClose, onSaved, tiposDocumento, cargos, sedes, usuarios }) => {
    const { showAlert } = useAlert();
    const [saving, setSaving] = useState(false);
    const [editandoCodigo, setEditandoCodigo] = useState(false);
    const [codigoCurrent, setCodigoCurrent] = useState(doc.codigo || '');

    const [form, setForm] = useState({
        nombre: doc.nombre || '',
        tipo: doc.tipo || '',
        proceso: doc.proceso || '',
        sede: doc.sede || '',
        alcance: doc.alcance || '',
        version: doc.version || '1',
        confidencialidad: doc.confidencialidad || '',
        mesesRevision: doc.mesesRevision || '',
        ubicacion: doc.ubicacion || '',
        fechaElaboracion: doc.fechaElaboracion || '',
        fechaRevision: doc.fechaRevision || '',
        fechaAprobacion: doc.fechaAprobacion || '',
        otrosProcesos: csv(doc.otrosProcesos),
        normas: csv(doc.normas),
        elabora: csv(doc.elabora),
        revisa: csv(doc.revisa),
        aprueba: csv(doc.aprueba),
        visualizacion: csv(doc.visualizacion),
        impresion: csv(doc.impresion),
        descargaOriginal: csv(doc.descargaOriginal),
        descargaPdf: csv(doc.descargaPdf),
    });

    const [respTipo, setRespTipo] = useState('cargos');
    const [permisoTipo, setPermisoTipo] = useState('grupos');

    const hc = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));
    const ul = (k, v) => setForm(p => ({ ...p, [k]: v }));
    const getOpts = t => t === 'usuarios' ? usuarios : t === 'cargos' ? cargos : GRUPOS;

    const handleSubmit = async e => {
        e.preventDefault();
        setSaving(true);
        try {
            await http.put(`/documentos/${doc.id}`, {
                ...form,
                codigo: codigoCurrent,
                otrosProcesos: form.otrosProcesos.join(', '),
                normas: form.normas.join(', '),
                elabora: form.elabora.join(', '),
                revisa: form.revisa.join(', '),
                aprueba: form.aprueba.join(', '),
                visualizacion: form.visualizacion.join(', '),
                impresion: form.impresion.join(', '),
                descargaOriginal: form.descargaOriginal.join(', '),
                descargaPdf: form.descargaPdf.join(', '),
            });
            showAlert({ message: 'Documento actualizado correctamente', status: 'success' });
            onSaved();
        } catch {
            showAlert({ message: 'Error al actualizar el documento', status: 'error' });
        } finally {
            setSaving(false);
        }
    };

    const inp = 'w-full px-2 py-1.5 border border-slate-300 rounded text-[11px] focus:outline-none focus:border-blue-500 bg-white';
    const sel = 'w-full px-2 py-1.5 border border-slate-300 rounded text-[11px] focus:outline-none focus:border-blue-500 bg-white';
    const lbl = 'block text-[10px] font-bold text-slate-600 mb-0.5';

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-slate-900/50 backdrop-blur-sm overflow-y-auto py-4 px-2">
            <div className="bg-white w-full max-w-5xl rounded-lg shadow-2xl border border-slate-200 flex flex-col">

                {/* Header */}
                <div className="flex items-center justify-between px-5 py-3 bg-slate-50 border-b border-slate-200 rounded-t-lg shrink-0">
                    <div>
                        <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">Editar Documento</p>
                        <h2 className="text-[13px] font-bold text-slate-800 mt-0.5">{doc.nombre}</h2>
                        <p className="text-[10px] text-slate-400">{doc.codigo} · v{doc.version || '1'} · Id {doc.id}</p>
                    </div>
                    <button onClick={onClose} className="p-1.5 hover:bg-slate-200 rounded-full text-slate-500"><X size={16} /></button>
                </div>

                {/* Warning */}
                <div className="bg-yellow-50 border-b border-yellow-100 px-5 py-1.5 text-[10px] text-yellow-700">
                    La opción "No permitir modificación después del primer visto bueno" se encuentra inactiva. Puede modificar este registro.
                </div>

                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
                    <div className="p-5 space-y-5">

                        {/* Campos principales */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-4">

                            {/* Columna izquierda */}
                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <label className={`${lbl} w-32 shrink-0`}>Id</label>
                                    <span className="text-[11px] font-mono text-slate-500">{doc.id}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <label className={`${lbl} w-32 shrink-0`}>Nombre <span className="text-red-500">*</span></label>
                                    <input name="nombre" value={form.nombre} onChange={hc} required className={`${inp} flex-1`} />
                                </div>
                                <div className="flex items-center gap-3">
                                    <label className={`${lbl} w-32 shrink-0`}>Proceso <span className="text-red-500">*</span></label>
                                    <select name="proceso" value={form.proceso} onChange={hc} required className={`${sel} flex-1`}>
                                        <option value="">Seleccionar</option>
                                        {PROCESOS.map((p, i) => <option key={i} value={p}>{p}</option>)}
                                    </select>
                                </div>
                                <div className="flex gap-3">
                                    <label className={`${lbl} w-32 shrink-0 mt-1`}>Otros procesos</label>
                                    <div className="flex-1">
                                        <DualListbox options={PROCESOS} selectedOptions={form.otrosProcesos} onChange={v => ul('otrosProcesos', v)} />
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <label className={`${lbl} w-32 shrink-0 mt-1`}>Normas</label>
                                    <div className="flex-1">
                                        <DualListbox options={NORMAS_OPTS} selectedOptions={form.normas} onChange={v => ul('normas', v)} />
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <label className={`${lbl} w-32 shrink-0`}>Sede</label>
                                    <select name="sede" value={form.sede} onChange={hc} className={`${sel} flex-1`}>
                                        <option value="">Seleccionar</option>
                                        {sedes.map((s, i) => <option key={i} value={s}>{s}</option>)}
                                    </select>
                                </div>
                                <div className="flex items-center gap-3">
                                    <label className={`${lbl} w-32 shrink-0`}>Alcance</label>
                                    <select name="alcance" value={form.alcance} onChange={hc} className={`${sel} flex-1`}>
                                        <option value="">Seleccionar</option>
                                        <option>A toda la organización</option>
                                        <option>A varios procesos</option>
                                        <option>Al proceso</option>
                                    </select>
                                </div>
                                <div className="flex items-center gap-3">
                                    <label className={`${lbl} w-32 shrink-0`}>Versión</label>
                                    <input name="version" value={form.version} onChange={hc} type="number" min="1" className={`${inp} w-20`} />
                                </div>

                                {/* Fechas */}
                                <div className="pt-2 border-t border-slate-100 space-y-2">
                                    {[
                                        { name: 'fechaElaboracion', label: 'Fecha elaboración' },
                                        { name: 'fechaRevision', label: 'Fecha revisión' },
                                        { name: 'fechaAprobacion', label: 'Fecha aprobación' },
                                    ].map(f => (
                                        <div key={f.name} className="flex items-center gap-3">
                                            <label className={`${lbl} w-32 shrink-0`}>{f.label}</label>
                                            <input name={f.name} value={form[f.name]} onChange={hc} placeholder="dd/MM/yyyy" className={`${inp} w-36`} />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Columna derecha */}
                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <label className={`${lbl} w-40 shrink-0`}>Tipo</label>
                                    <select name="tipo" value={form.tipo} onChange={hc} className={`${sel} flex-1`}>
                                        <option value="">Seleccionar</option>
                                        {tiposDocumento.map((t, i) => <option key={i} value={t}>{t}</option>)}
                                    </select>
                                </div>
                                <div className="flex items-center gap-3">
                                    <label className={`${lbl} w-40 shrink-0`}>Ubicación del formato</label>
                                    <input name="ubicacion" value={form.ubicacion === 'SIN_ARCHIVO' ? '' : form.ubicacion || ''} onChange={hc} className={`${inp} flex-1`} />
                                </div>

                                {/* Código con botón Modificar */}
                                <div className="flex items-center gap-3">
                                    <label className={`${lbl} w-40 shrink-0`}>Código</label>
                                    {editandoCodigo ? (
                                        <div className="flex items-center gap-1.5">
                                            <input value={codigoCurrent} onChange={e => setCodigoCurrent(e.target.value)}
                                                autoFocus className="px-2 py-1.5 border border-blue-400 rounded text-[11px] font-mono focus:outline-none w-36" />
                                            <button type="button" onClick={() => setEditandoCodigo(false)} className="text-[10px] text-blue-600 hover:underline font-semibold">Confirmar</button>
                                            <button type="button" onClick={() => { setCodigoCurrent(doc.codigo || ''); setEditandoCodigo(false); }} className="text-[10px] text-slate-400 hover:underline">Cancelar</button>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            <span className="text-[12px] font-mono font-bold text-slate-700">{codigoCurrent}</span>
                                            <button type="button" onClick={() => setEditandoCodigo(true)} className="text-[10px] text-blue-600 hover:underline font-semibold">Modificar</button>
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center gap-3">
                                    <label className={`${lbl} w-40 shrink-0`}>Confidencialidad</label>
                                    <select name="confidencialidad" value={form.confidencialidad} onChange={hc} className={`${sel} flex-1`}>
                                        <option value="">Seleccionar</option>
                                        <option>Confidencial</option>
                                        <option>Interno</option>
                                        <option>Público</option>
                                    </select>
                                </div>
                                <div className="flex items-center gap-3">
                                    <label className={`${lbl} w-40 shrink-0`}>Meses para revisión</label>
                                    <div className="flex items-center gap-2">
                                        <input name="mesesRevision" value={form.mesesRevision} onChange={hc} type="number" min="0" className={`${inp} w-20`} />
                                        <span className="text-[10px] text-slate-400">Meses</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Responsables */}
                        <div className="pt-4 border-t border-slate-200">
                            <div className="flex items-center gap-4 mb-2">
                                <h3 className="text-[11px] font-bold text-slate-700 uppercase tracking-wide">Responsables</h3>
                                {['Por Usuarios', 'Por Cargos'].map(op => (
                                    <label key={op} className="flex items-center gap-1 text-[10px] text-slate-600 cursor-pointer">
                                        <input type="radio" checked={respTipo === (op === 'Por Usuarios' ? 'usuarios' : 'cargos')}
                                            onChange={() => setRespTipo(op === 'Por Usuarios' ? 'usuarios' : 'cargos')} className="text-blue-600" /> {op}
                                    </label>
                                ))}
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <DualListbox title="Elabora(n)" options={getOpts(respTipo)} selectedOptions={form.elabora} onChange={v => ul('elabora', v)} />
                                <DualListbox title="Revisa(n)" options={getOpts(respTipo)} selectedOptions={form.revisa} onChange={v => ul('revisa', v)} />
                                <DualListbox title="Aprueba(n)" options={getOpts(respTipo)} selectedOptions={form.aprueba} onChange={v => ul('aprueba', v)} />
                            </div>
                        </div>

                        {/* Permisos */}
                        <div className="pt-4 border-t border-slate-200">
                            <div className="flex items-center gap-4 mb-2">
                                <h3 className="text-[11px] font-bold text-slate-700 uppercase tracking-wide">Permisos</h3>
                                {['Por Usuarios', 'Por Cargos', 'Por Grupos'].map(op => (
                                    <label key={op} className="flex items-center gap-1 text-[10px] text-slate-600 cursor-pointer">
                                        <input type="radio"
                                            checked={permisoTipo === (op === 'Por Usuarios' ? 'usuarios' : op === 'Por Cargos' ? 'cargos' : 'grupos')}
                                            onChange={() => setPermisoTipo(op === 'Por Usuarios' ? 'usuarios' : op === 'Por Cargos' ? 'cargos' : 'grupos')}
                                            className="text-blue-600" /> {op}
                                    </label>
                                ))}
                            </div>
                            <DualListbox title="Visualización" options={getOpts(permisoTipo)} selectedOptions={form.visualizacion} onChange={v => ul('visualizacion', v)} />
                            <label className="flex items-center gap-1.5 text-[10px] text-slate-600 cursor-pointer mt-2">
                                <input type="checkbox" className="rounded text-blue-600" /> Indicar obligatoriedad de lectura y aceptación
                            </label>
                        </div>

                        {/* Impresión y Descarga */}
                        <div className="pt-4 border-t border-slate-200">
                            <h3 className="text-[11px] font-bold text-slate-700 uppercase tracking-wide mb-3">Impresión y Descarga</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <DualListbox title="Impresión" options={getOpts(permisoTipo)} selectedOptions={form.impresion} onChange={v => ul('impresion', v)} />
                                <DualListbox title="Descargar archivo original" options={getOpts(permisoTipo)} selectedOptions={form.descargaOriginal} onChange={v => ul('descargaOriginal', v)} />
                                <DualListbox title="Descargar archivo PDF" options={getOpts(permisoTipo)} selectedOptions={form.descargaPdf} onChange={v => ul('descargaPdf', v)} />
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="sticky bottom-0 flex justify-end gap-2 px-5 py-3 bg-white border-t border-slate-200">
                        <button type="button" onClick={onClose}
                            className="px-4 py-1.5 border border-slate-300 rounded text-[11px] font-bold text-slate-600 hover:bg-slate-50 transition-colors">
                            Volver
                        </button>
                        <button type="submit" disabled={saving}
                            className="flex items-center gap-1.5 px-4 py-1.5 bg-blue-600 text-white rounded text-[11px] font-bold hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-60">
                            <Save size={13} /> {saving ? 'Guardando...' : 'Guardar'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

/* ─── ListadoUnico ─────────────────────────────────────────── */
export const ListadoUnico = () => {
    const navigate = useNavigate();
    const { showAlert } = useAlert();
    const { user } = useAuth();

    const isAdmin = user?.rol === 'ADMIN' || user?.permisos?.includes('ROLE_ADMIN');

    const [documentos, setDocumentos] = useState([]);
    const [tiposDocumento, setTiposDocumento] = useState([]);
    const [cargos, setCargos] = useState([]);
    const [sedes, setSedes] = useState([]);
    const [usuarios, setUsuarios] = useState([]);

    const [searchTerm, setSearchTerm] = useState('');
    const [registrosPorPagina, setRegistrosPorPagina] = useState(10);
    const [filtroSede, setFiltroSede] = useState('Todos');
    const [filtroProceso, setFiltroProceso] = useState('Todos');
    const [filtroTipo, setFiltroTipo] = useState('Todos');

    const [showCrearModal, setShowCrearModal] = useState(false);
    const [activeTab, setActiveTab] = useState('Vigente');
    const [showFilters, setShowFilters] = useState(false);

    const [selectedDoc, setSelectedDoc] = useState(null);       // trazabilidad
    const [historialDoc, setHistorialDoc] = useState([]);
    const [loadingHistorial, setLoadingHistorial] = useState(false);

    const [editDoc, setEditDoc] = useState(null);               // edición

    useEffect(() => { cargarDatos(); }, []);

    const cargarDatos = async () => {
        try {
            const [resDocs, resTipos, resCargos, resSedes, resUsuarios] = await Promise.all([
                http.get('/documentos').catch(() => ({ data: [] })),
                http.get('/tipos-documento').catch(() => []),
                http.get('/cargos').catch(() => []),
                http.get('/sedes').catch(() => []),
                http.get('/usuarios').catch(() => []),
            ]);
            const parse = (res) => {
                if (!res) return [];
                if (Array.isArray(res)) return res;
                if (Array.isArray(res.data)) return res.data;
                if (res.data?.data) return res.data.data;
                if (res.data?.content) return res.data.content;
                return [];
            };
            setDocumentos(Array.isArray(resDocs) ? resDocs : (resDocs?.data?.data || resDocs?.data || []));
            setTiposDocumento(parse(resTipos).map(t => t.nombre || t));
            setCargos(parse(resCargos).map(c => c.nombre || c));
            setSedes(parse(resSedes).map(s => s.nombre || s));
            setUsuarios(parse(resUsuarios).map(u => {
                const n = u.persona ? `${u.persona.primerNombre || ''} ${u.persona.primerApellido || ''}`.trim() : `${u.nombres || ''} ${u.apellidos || ''}`.trim();
                return n || u.username;
            }));
        } catch {}
    };

    const abrirHistorial = async (doc) => {
        setSelectedDoc(doc);
        setHistorialDoc([]);
        setLoadingHistorial(true);
        try {
            const res = await http.get(`/documentos/${doc.id}/historial`);
            const data = res?.data?.data || res?.data || res || [];
            setHistorialDoc(Array.isArray(data) ? data : []);
        } catch { setHistorialDoc([]); }
        finally { setLoadingHistorial(false); }
    };

    const eliminarDocumento = async (id) => {
        if (!window.confirm('¿Está seguro de eliminar este documento?')) return;
        try {
            await http.delete(`/documentos/${id}`);
            showAlert({ message: 'Documento eliminado correctamente', status: 'success' });
            cargarDatos();
        } catch {}
    };

    const aprobarDoc = async (id) => {
        if (!window.confirm('¿Desea dar el Visto Bueno a este documento para publicarlo?')) return;
        try {
            await http.put(`/documentos/${id}/aprobar`);
            showAlert({ message: 'Documento aprobado exitosamente', status: 'success' });
            cargarDatos();
        } catch {}
    };

    const handleDownload = async (doc) => {
        if (!doc.ubicacion || doc.ubicacion === 'SIN_ARCHIVO') {
            showAlert({ message: 'Este documento no tiene un archivo físico.', status: 'warning' });
            return;
        }
        try {
            const blob = await http.get(`/documentos/descargar/${doc.id}`, { responseType: 'blob' });
            window.open(window.URL.createObjectURL(blob), '_blank');
        } catch (error) {
            if (error.response?.data instanceof Blob) {
                const text = await error.response.data.text();
                try { showAlert({ message: JSON.parse(text).message || 'Archivo no encontrado', status: 'error' }); }
                catch { showAlert({ message: 'El archivo PDF no se encontró.', status: 'error' }); }
            } else {
                showAlert({ message: 'Error de red al descargar el documento.', status: 'error' });
            }
        }
    };

    const normalizeText = t => t ? String(t).normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toUpperCase() : '';

    const sedesUnicas = [...new Set(documentos.map(d => d.sede).filter(Boolean))];
    const procesosUnicos = [...new Set(documentos.map(d => d.proceso).filter(Boolean))];
    const tiposUnicos = tiposDocumento.length > 0 ? tiposDocumento : [...new Set(documentos.map(d => d.tipo).filter(Boolean))];

    const tabs = [
        { id: 'Vigente', label: 'Vigente', count: docs => docs.filter(d => normalizeText(d.estado) === 'VIGENTE').length },
        { id: 'En proceso', label: 'En proceso', count: docs => docs.filter(d => normalizeText(d.estado).includes('REVISION') || normalizeText(d.estado) === 'EN REVISIÓN').length },
        { id: 'A vencer', label: 'A vencer', count: docs => docs.filter(d => normalizeText(d.estado) === 'A VENCER').length },
        { id: 'Vencido', label: 'Vencido', count: docs => docs.filter(d => normalizeText(d.estado) === 'VENCIDO').length },
        { id: 'Migración', label: 'Migración', count: docs => docs.filter(d => d.metodoCreacion === 'Documento Migrado').length },
        { id: 'Obligatorios sin leer', label: 'Obligatorios sin leer', count: () => 0 },
    ];

    const filtrados = documentos.filter(doc => {
        const t = searchTerm.toLowerCase();
        const matchSearch = (doc.nombre || '').toLowerCase().includes(t) || (doc.codigo || '').toLowerCase().includes(t);
        const matchSede = filtroSede === 'Todos' || doc.sede === filtroSede;
        const matchProceso = filtroProceso === 'Todos' || doc.proceso === filtroProceso;
        const matchTipo = filtroTipo === 'Todos' || doc.tipo === filtroTipo;
        const norm = normalizeText(doc.estado);
        const matchTab = activeTab === 'Vigente' ? norm === 'VIGENTE'
            : activeTab === 'En proceso' ? norm.includes('REVISION')
            : activeTab === 'A vencer' ? norm === 'A VENCER'
            : activeTab === 'Vencido' ? norm === 'VENCIDO'
            : activeTab === 'Migración' ? doc.metodoCreacion === 'Documento Migrado'
            : false;
        return matchSearch && matchSede && matchProceso && matchTipo && matchTab;
    });

    const SortArrows = () => (
        <div className="inline-flex flex-col ml-1 opacity-50">
            <svg className="w-2 h-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 15l-6-6-6 6" /></svg>
            <svg className="w-2 h-2 -mt-[2px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M6 9l6 6 6-6" /></svg>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 p-4 md:p-6 font-sans">
            <div className="max-w-[1700px] mx-auto space-y-3">

                <div className="text-[11px] text-[#0d6efd] font-normal hover:underline cursor-pointer">
                    Gestión documental &gt; Listado único de documentos
                </div>

                <div className="bg-white rounded shadow-sm border border-slate-200 p-4">

                    {/* Tabs & Search */}
                    <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 mb-4 border-b border-slate-100 pb-4">
                        <div className="flex flex-wrap gap-1.5">
                            {tabs.map(tab => {
                                const countVal = tab.count(documentos);
                                const isActive = activeTab === tab.id;
                                const isObl = tab.id === 'Obligatorios sin leer';
                                return (
                                    <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                                        className={`px-3 py-1.5 rounded-t border text-xs font-semibold transition-all ${isActive ? isObl ? 'bg-red-600 text-white border-red-600' : 'bg-[#6c757d] text-white border-[#6c757d]' : isObl ? 'bg-white text-red-600 border-red-300 hover:bg-red-50' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'}`}>
                                        {tab.label}
                                        {countVal > 0 && <span className="ml-1.5 px-1.5 py-0.5 bg-slate-200 text-slate-800 rounded-full text-[10px] font-bold">{countVal}</span>}
                                    </button>
                                );
                            })}
                        </div>
                        <div className="flex flex-wrap items-center gap-1.5 w-full xl:w-auto">
                            <input type="text" placeholder="Buscar por código o nombre..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                                className="border border-slate-300 rounded px-3 py-1.5 text-xs outline-none focus:border-blue-500 w-full xl:w-64" />
                            <button className="px-4 py-1.5 bg-[#f08c3a] hover:bg-[#d9752b] text-white rounded text-xs font-bold transition-colors shadow-sm">Buscar</button>
                            <button onClick={() => setShowFilters(!showFilters)}
                                className={`flex items-center gap-1 px-3 py-1.5 bg-white border rounded text-xs text-slate-700 hover:bg-slate-50 transition-colors shadow-sm ${showFilters ? 'border-blue-500 ring-1 ring-blue-500' : 'border-slate-300'}`}>
                                <svg className="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 0 1-.659 1.591l-5.432 5.432a2.25 2.25 0 0 0-.659 1.591v2.927a2.25 2.25 0 0 1-1.24 2.013L9.75 21v-6.568a2.25 2.25 0 0 0-.659-1.591L3.659 7.409A2.25 2.25 0 0 1 3 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0 1 12 3Z" /></svg>
                                Filtrar
                            </button>
                            <button onClick={() => { setFiltroSede('Todos'); setFiltroProceso('Todos'); setFiltroTipo('Todos'); setSearchTerm(''); }}
                                className="flex items-center gap-1 px-3 py-1.5 bg-white border border-slate-300 rounded text-xs text-slate-700 hover:bg-slate-50 transition-colors shadow-sm">
                                <svg className="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>
                                Quitar Filtros
                            </button>
                            <button className="flex items-center gap-1 px-3 py-1.5 bg-[#0d6efd] hover:bg-blue-700 text-white rounded text-xs font-bold transition-colors shadow-sm">
                                Mis filtros
                                <svg className="w-3 h-3 ml-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" /></svg>
                            </button>
                        </div>
                    </div>

                    {showFilters && (
                        <div className="bg-slate-50 border border-slate-200 rounded p-4 mb-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                            {[
                                { label: 'Sede', value: filtroSede, set: setFiltroSede, opts: sedesUnicas },
                                { label: 'Procesos', value: filtroProceso, set: setFiltroProceso, opts: procesosUnicos },
                                { label: 'Tipo documento', value: filtroTipo, set: setFiltroTipo, opts: tiposUnicos },
                            ].map(f => (
                                <div key={f.label}>
                                    <label className="block text-[11px] font-bold text-slate-600 mb-1">{f.label}</label>
                                    <select value={f.value} onChange={e => f.set(e.target.value)} className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-xs bg-white focus:outline-none focus:border-blue-500 cursor-pointer">
                                        <option value="Todos">Todos</option>
                                        {f.opts.map(o => <option key={o} value={o}>{o}</option>)}
                                    </select>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-1.5 mb-3">
                        {[
                            { label: 'Crear', onClick: () => setShowCrearModal(true), color: 'bg-[#f0ad4e] hover:bg-[#ec971f]' },
                            { label: 'Exportar', onClick: () => {}, color: 'bg-[#f0ad4e] hover:bg-[#ec971f]' },
                            { label: 'Importar', onClick: () => {}, color: 'bg-[#f0ad4e] hover:bg-[#ec971f]' },
                            { label: 'Eliminar', onClick: () => {}, color: 'bg-[#d9534f] hover:bg-[#c9302c]' },
                            { label: 'Edición múltiple', onClick: () => {}, color: 'bg-[#f0ad4e] hover:bg-[#ec971f]' },
                        ].map(btn => (
                            <button key={btn.label} onClick={btn.onClick} className={`px-3.5 py-1.5 ${btn.color} text-white rounded text-xs font-bold transition-colors shadow-sm`}>{btn.label}</button>
                        ))}
                    </div>

                    <div className="text-[11px] text-blue-600 mb-4 flex gap-2">
                        <button className="hover:underline">Seleccionar todo</button>
                        <span className="text-slate-300">|</span>
                        <button className="hover:underline">Deseleccionar todo</button>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-slate-600 mb-4">
                        <span>Mostrar</span>
                        <select value={registrosPorPagina} onChange={e => setRegistrosPorPagina(Number(e.target.value))} className="border border-slate-300 rounded px-2 py-1 outline-none focus:border-blue-500 cursor-pointer text-xs">
                            {[10, 25, 50, 100].map(n => <option key={n} value={n}>{n}</option>)}
                        </select>
                        <span>registros</span>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto border-t border-l border-r border-slate-200">
                        <table className="w-full text-left border-collapse whitespace-nowrap">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200 text-[12px] text-slate-700 font-bold">
                                    {['Id','Código','Versión','Nombre','Tipo','Método de creación','Proceso','Normas','Sede','Días para revisión','Implementación'].map(h => (
                                        <th key={h} className="px-3 py-2.5 border-r border-slate-200 cursor-pointer hover:bg-slate-100">
                                            <div className="flex items-center justify-between">{h} <SortArrows /></div>
                                        </th>
                                    ))}
                                    <th className="px-3 py-2.5 text-center w-36">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtrados.length === 0 ? (
                                    <tr><td colSpan="12" className="px-4 py-8 text-center text-slate-500 text-sm border-b border-slate-200">No se encontraron registros.</td></tr>
                                ) : filtrados.slice(0, registrosPorPagina).map(doc => (
                                    <tr key={doc.id} className="hover:bg-slate-50 border-b border-slate-200 text-[13px] text-slate-600">
                                        <td className="px-3 py-2 border-r border-slate-200 text-center">{doc.id}</td>
                                        <td className="px-3 py-2 border-r border-slate-200">{doc.codigo || 'N/A'}</td>
                                        <td className="px-3 py-2 border-r border-slate-200 text-center">{doc.version || '1'}</td>
                                        <td className="px-3 py-2 border-r border-slate-200 truncate max-w-xs" title={doc.nombre}>{doc.nombre}</td>
                                        <td className="px-3 py-2 border-r border-slate-200">{doc.tipo}</td>
                                        <td className="px-3 py-2 border-r border-slate-200">{doc.metodoCreacion || 'Archivo'}</td>
                                        <td className="px-3 py-2 border-r border-slate-200">{doc.proceso}</td>
                                        <td className="px-3 py-2 border-r border-slate-200 text-[11px] truncate max-w-[150px]" title={doc.normas}>{doc.normas || ''}</td>
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
                                                <button onClick={() => abrirHistorial(doc)} className="p-1 text-slate-400 hover:text-indigo-600 bg-slate-100 hover:bg-indigo-50 border border-slate-200 rounded" title="Trazabilidad"><History size={14} /></button>
                                                <button onClick={() => setEditDoc(doc)} className="p-1 text-slate-400 hover:text-amber-600 bg-slate-100 hover:bg-amber-50 border border-slate-200 rounded" title="Editar"><Edit2 size={14} /></button>
                                                <button onClick={() => eliminarDocumento(doc.id)} className="p-1 text-slate-400 hover:text-red-600 bg-slate-100 hover:bg-red-50 border border-slate-200 rounded" title="Eliminar"><Trash2 size={14} /></button>
                                                <button onClick={() => handleDownload(doc)} className="p-1 text-slate-400 hover:text-emerald-600 bg-slate-100 hover:bg-emerald-50 border border-slate-200 rounded" title="Descargar"><Download size={14} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="mt-4 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-slate-600">
                        <div>Mostrando {filtrados.length === 0 ? 0 : 1} a {Math.min(filtrados.length, registrosPorPagina)} de {filtrados.length} registros</div>
                        <div className="flex items-center">
                            <button className="px-3 py-1.5 border border-slate-300 rounded-l text-slate-600 hover:bg-slate-50">Anterior</button>
                            <button className="px-3 py-1.5 border-t border-b border-slate-300 bg-blue-600 text-white font-medium">1</button>
                            <button className="px-3 py-1.5 border border-slate-300 rounded-r text-slate-600 hover:bg-slate-50">Siguiente</button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal: Crear */}
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

            {/* Modal: Trazabilidad */}
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
                            <button onClick={() => setSelectedDoc(null)} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500"><X size={18} /></button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4">
                            <TrazabilidadPanel logs={historialDoc} loading={loadingHistorial} />
                        </div>
                    </div>
                </div>
            )}

            {/* Modal: Editar */}
            {editDoc && (
                <EditarDocumentoModal
                    doc={editDoc}
                    tiposDocumento={tiposDocumento}
                    cargos={cargos}
                    sedes={sedes}
                    usuarios={usuarios}
                    onClose={() => setEditDoc(null)}
                    onSaved={() => { setEditDoc(null); cargarDatos(); }}
                />
            )}
        </div>
    );
};