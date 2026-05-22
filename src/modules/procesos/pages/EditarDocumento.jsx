import React, { useState, useEffect } from 'react';
import { Save, ArrowRight, ArrowLeft, ArrowLeft as Back } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import http from '../../../services/httpClient';
import { useAlert } from '../../../providers/AlertProvider';

const DualListbox = ({ title, options = [], selectedOptions = [], onChange, extraRadioSection }) => {
    const [filter, setFilter] = useState('');
    const [highlightedAvailable, setHighlightedAvailable] = useState([]);
    const [highlightedChosen, setHighlightedChosen] = useState([]);

    const availableOptions = options.filter(opt => !selectedOptions.includes(opt));
    const filteredAvailable = availableOptions.filter(opt => opt.toLowerCase().includes(filter.toLowerCase()));

    const handleMoveRight = () => {
        if (!highlightedAvailable.length) return;
        onChange([...selectedOptions, ...highlightedAvailable]);
        setHighlightedAvailable([]);
    };
    const handleMoveLeft = () => {
        if (!highlightedChosen.length) return;
        onChange(selectedOptions.filter(opt => !highlightedChosen.includes(opt)));
        setHighlightedChosen([]);
    };

    return (
        <div className="flex flex-col gap-1.5">
            {title && <label className="text-xs font-bold text-slate-700">{title}</label>}
            {extraRadioSection}
            <div className="flex flex-col md:flex-row items-center gap-2">
                <div className="w-full md:w-[45%] border border-slate-300 rounded overflow-hidden">
                    <div className="bg-slate-50 border-b border-slate-300 p-1.5 flex items-center gap-1.5">
                        <span className="text-[10px] font-bold text-slate-500">Buscar:</span>
                        <input type="text" value={filter} onChange={e => setFilter(e.target.value)} className="w-full px-1.5 py-0.5 text-[11px] border border-slate-300 rounded focus:outline-none" />
                    </div>
                    <select multiple value={highlightedAvailable} onChange={e => setHighlightedAvailable(Array.from(e.target.selectedOptions, o => o.value))} className="w-full h-28 p-1 text-[11px] outline-none bg-white">
                        {filteredAvailable.map((opt, i) => <option key={i} value={opt}>{opt}</option>)}
                    </select>
                </div>
                <div className="flex flex-col gap-1.5">
                    <button type="button" onClick={handleMoveRight} className="p-1 bg-slate-100 border border-slate-300 rounded hover:bg-blue-100 hover:border-blue-300"><ArrowRight size={14} className="text-slate-600" /></button>
                    <button type="button" onClick={handleMoveLeft} className="p-1 bg-slate-100 border border-slate-300 rounded hover:bg-blue-100 hover:border-blue-300"><ArrowLeft size={14} className="text-slate-600" /></button>
                </div>
                <div className="w-full md:w-[45%] border border-slate-300 rounded overflow-hidden">
                    <div className="bg-slate-50 border-b border-slate-300 p-1.5 h-[34px] flex items-center justify-center text-slate-400 text-[10px]">--------</div>
                    <select multiple value={highlightedChosen} onChange={e => setHighlightedChosen(Array.from(e.target.selectedOptions, o => o.value))} className="w-full h-28 p-1 text-[11px] outline-none bg-white">
                        {selectedOptions.map((opt, i) => <option key={i} value={opt}>{opt}</option>)}
                    </select>
                </div>
            </div>
        </div>
    );
};

const RadioGroup = ({ name, options, value, onChange }) => (
    <div className="flex gap-3">
        {options.map(op => (
            <label key={op} className="flex items-center gap-1 text-[11px] text-slate-600 cursor-pointer">
                <input type="radio" name={name} checked={value === op} onChange={() => onChange(op)} className="text-blue-600" /> {op}
            </label>
        ))}
    </div>
);

export const EditarDocumentoForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { showAlert } = useAlert();

    const [doc, setDoc] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editandoCodigo, setEditandoCodigo] = useState(false);
    const [codigoEditado, setCodigoEditado] = useState('');

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
    const normasOpts = ['Acreditacion', 'Habilitación (Resolución 3100 de 2019)', 'ISO 9001:2015'];
    const grupos = ['Clinical House- Todos', 'FISIOTERAPIA', 'MEDICINA GENERAL',
        'ATENCIÓN DOMICILIARIA Y CONSULTA EXTERNA', 'SEGURIDAD DEL PACIENTE',
        'SEGURIDAD DEL PACIENTE FORMATOS Y OTROS', 'SEGURIDAD Y SALUD EN EL TRABAJO',
        'INFRAESTRUCTURA Y TECNOLOGÍA', 'INFRAESTRUCTURA Y TECNOLOGÍA FORMATOS Y OTROS'];

    const [form, setForm] = useState({
        nombre: '', tipo: '', proceso: '', sede: '', alcance: '', version: '',
        confidencialidad: '', mesesRevision: '', ubicacion: '',
        fechaElaboracion: '', fechaRevision: '', fechaAprobacion: '',
        otrosProcesos: [], normas: [],
        elabora: [], revisa: [], aprueba: [],
        visualizacion: [], impresion: [], descargaOriginal: [], descargaPdf: []
    });

    const [elaboraTipo, setElaboraTipo] = useState('cargos');
    const [revisaTipo, setRevisaTipo] = useState('cargos');
    const [apruebaTipo, setApruebaTipo] = useState('cargos');
    const [permisosPermisoTipo, setPermisosPermisoTipo] = useState('grupos');

    const csvToArray = (val) => {
        if (!val || typeof val !== 'string') return [];
        return val.split(',').map(s => s.trim()).filter(Boolean);
    };

    useEffect(() => {
        const fetchTodo = async () => {
            try {
                const [resDoc, resTipos, resCargos, resSedes, resUsuarios] = await Promise.all([
                    http.get(`/documentos/${id}`).catch(() => null),
                    http.get('/tipos-documento').catch(() => []),
                    http.get('/cargos').catch(() => []),
                    http.get('/sedes').catch(() => []),
                    http.get('/usuarios').catch(() => [])
                ]);

                const parseArray = (res) => {
                    if (!res) return [];
                    if (Array.isArray(res)) return res;
                    if (Array.isArray(res.data)) return res.data;
                    if (res.data?.data) return res.data.data;
                    return [];
                };

                setTiposDocumento(parseArray(resTipos).map(t => t.nombre || t));
                setCargos(parseArray(resCargos).map(c => c.nombre || c));
                setSedes(parseArray(resSedes).map(s => s.nombre || s));
                setUsuarios(parseArray(resUsuarios).map(u => {
                    const n = u.persona ? `${u.persona.primerNombre || ''} ${u.persona.primerApellido || ''}`.trim() : `${u.nombres || ''} ${u.apellidos || ''}`.trim();
                    return n || u.username;
                }));

                const d = resDoc?.data?.data || resDoc?.data || resDoc;
                if (d) {
                    setDoc(d);
                    setCodigoEditado(d.codigo || '');
                    setForm({
                        nombre: d.nombre || '',
                        tipo: d.tipo || '',
                        proceso: d.proceso || '',
                        sede: d.sede || '',
                        alcance: d.alcance || '',
                        version: d.version || '1',
                        confidencialidad: d.confidencialidad || '',
                        mesesRevision: d.mesesRevision || '',
                        ubicacion: d.ubicacion || '',
                        fechaElaboracion: d.fechaElaboracion || '',
                        fechaRevision: d.fechaRevision || '',
                        fechaAprobacion: d.fechaAprobacion || '',
                        otrosProcesos: csvToArray(d.otrosProcesos),
                        normas: csvToArray(d.normas),
                        elabora: csvToArray(d.elabora),
                        revisa: csvToArray(d.revisa),
                        aprueba: csvToArray(d.aprueba),
                        visualizacion: csvToArray(d.visualizacion),
                        impresion: csvToArray(d.impresion),
                        descargaOriginal: csvToArray(d.descargaOriginal),
                        descargaPdf: csvToArray(d.descargaPdf)
                    });
                }
            } catch {
                showAlert({ message: 'Error al cargar el documento', status: 'error' });
            } finally {
                setLoading(false);
            }
        };
        fetchTodo();
    }, [id]);

    const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    const updateList = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

    const getOptions = (tipo) => {
        if (tipo === 'usuarios') return usuarios;
        if (tipo === 'cargos') return cargos;
        if (tipo === 'grupos') return grupos;
        return [];
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await http.put(`/documentos/${id}`, {
                ...form,
                codigo: codigoEditado,
                otrosProcesos: form.otrosProcesos.join(', '),
                normas: form.normas.join(', '),
                elabora: form.elabora.join(', '),
                revisa: form.revisa.join(', '),
                aprueba: form.aprueba.join(', '),
                visualizacion: form.visualizacion.join(', '),
                impresion: form.impresion.join(', '),
                descargaOriginal: form.descargaOriginal.join(', '),
                descargaPdf: form.descargaPdf.join(', ')
            });
            showAlert({ message: 'Documento actualizado correctamente', status: 'success' });
            navigate('/procesos/listado-unico');
        } catch {
            showAlert({ message: 'Error al actualizar el documento', status: 'error' });
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
            <div className="flex items-center gap-2 text-slate-500">
                <svg className="w-5 h-5 animate-spin text-blue-500" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                Cargando documento...
            </div>
        </div>
    );

    if (!doc) return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
            <div className="text-slate-500">Documento no encontrado</div>
        </div>
    );

    const label = 'text-[11px] font-bold text-slate-600 mb-0.5 block';
    const input = 'w-full px-2 py-1.5 border border-slate-300 rounded text-[12px] focus:outline-none focus:border-blue-500 bg-white';
    const select = 'w-full px-2 py-1.5 border border-slate-300 rounded text-[12px] focus:outline-none focus:border-blue-500 bg-white';

    return (
        <div className="min-h-screen bg-slate-50 text-slate-700 font-sans">

            {/* Warning bar */}
            <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-2 text-[11px] text-yellow-800">
                La opción "No permitir modificación de los registros después del primer visto bueno", se encuentra inactiva. Puede modificar el registro.
            </div>

            <form onSubmit={handleSubmit} className="max-w-[1300px] mx-auto px-4 py-4">

                {/* Campos Requeridos label */}
                <div className="text-[10px] font-bold text-red-500 mb-3">* Campos Requeridos</div>

                {/* Main 2-column grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-10 gap-y-4">

                    {/* LEFT COLUMN */}
                    <div className="space-y-4">

                        {/* Id */}
                        <div className="flex items-center gap-4">
                            <label className={`${label} w-28 shrink-0`}>Id</label>
                            <span className="text-[12px] text-slate-600 font-mono">{doc.id}</span>
                        </div>

                        {/* Nombre */}
                        <div className="flex items-center gap-4">
                            <label className={`${label} w-28 shrink-0`}>Nombre <span className="text-red-500">*</span></label>
                            <input name="nombre" value={form.nombre} onChange={handleChange} required className={`${input} flex-1`} />
                        </div>

                        {/* Proceso */}
                        <div className="flex items-center gap-4">
                            <label className={`${label} w-28 shrink-0`}>Proceso <span className="text-red-500">*</span></label>
                            <select name="proceso" value={form.proceso} onChange={handleChange} required className={`${select} flex-1`}>
                                <option value="">Seleccionar</option>
                                {procesos.map((p, i) => <option key={i} value={p}>{p}</option>)}
                            </select>
                        </div>

                        {/* Otros procesos */}
                        <div className="flex gap-4">
                            <label className={`${label} w-28 shrink-0 mt-1`}>Otros procesos</label>
                            <div className="flex-1">
                                <DualListbox options={procesos} selectedOptions={form.otrosProcesos} onChange={v => updateList('otrosProcesos', v)} />
                            </div>
                        </div>

                        {/* Normas */}
                        <div className="flex gap-4">
                            <label className={`${label} w-28 shrink-0 mt-1`}>Normas</label>
                            <div className="flex-1">
                                <DualListbox options={normasOpts} selectedOptions={form.normas} onChange={v => updateList('normas', v)} />
                            </div>
                        </div>

                        {/* Sede */}
                        <div className="flex items-center gap-4">
                            <label className={`${label} w-28 shrink-0`}>Sede</label>
                            <select name="sede" value={form.sede} onChange={handleChange} className={`${select} flex-1`}>
                                <option value="">Seleccionar</option>
                                {sedes.map((s, i) => <option key={i} value={s}>{s}</option>)}
                            </select>
                        </div>

                        {/* Alcance */}
                        <div className="flex items-center gap-4">
                            <label className={`${label} w-28 shrink-0`}>Alcance</label>
                            <select name="alcance" value={form.alcance} onChange={handleChange} className={`${select} flex-1`}>
                                <option value="">Seleccionar</option>
                                <option>A toda la organización</option>
                                <option>A varios procesos</option>
                                <option>Al proceso</option>
                            </select>
                        </div>

                        {/* Versión */}
                        <div className="flex items-center gap-4">
                            <label className={`${label} w-28 shrink-0`}>Versión</label>
                            <input name="version" value={form.version} onChange={handleChange} type="number" min="1" className={`${input} w-24`} />
                        </div>

                        {/* Fechas */}
                        <div className="space-y-2 pt-2 border-t border-slate-100">
                            {[
                                { name: 'fechaElaboracion', label: 'Fecha de elaboración' },
                                { name: 'fechaRevision', label: 'Fecha de revisión' },
                                { name: 'fechaAprobacion', label: 'Fecha de aprobación' }
                            ].map(f => (
                                <div key={f.name} className="flex items-center gap-4">
                                    <label className={`${label} w-28 shrink-0`}>{f.label}</label>
                                    <input name={f.name} value={form[f.name] || ''} onChange={handleChange} type="text" placeholder="dd/MM/yyyy" className={`${input} w-36`} />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* RIGHT COLUMN */}
                    <div className="space-y-4">

                        {/* Tipo */}
                        <div className="flex items-center gap-4">
                            <label className={`${label} w-36 shrink-0`}>Tipo</label>
                            <select name="tipo" value={form.tipo} onChange={handleChange} className={`${select} flex-1`}>
                                <option value="">Seleccionar</option>
                                {tiposDocumento.map((t, i) => <option key={i} value={t}>{t}</option>)}
                            </select>
                        </div>

                        {/* Ubicación del formato */}
                        <div className="flex items-center gap-4">
                            <label className={`${label} w-36 shrink-0`}>Ubicación del formato</label>
                            <input name="ubicacion" value={form.ubicacion || ''} onChange={handleChange} className={`${input} flex-1`} />
                        </div>

                        {/* Código */}
                        <div className="flex items-center gap-4">
                            <label className={`${label} w-36 shrink-0`}>Código</label>
                            <div className="flex items-center gap-2">
                                {editandoCodigo ? (
                                    <>
                                        <input
                                            value={codigoEditado}
                                            onChange={e => setCodigoEditado(e.target.value)}
                                            className="px-2 py-1.5 border border-blue-400 rounded text-[12px] font-mono focus:outline-none w-40"
                                            autoFocus
                                        />
                                        <button type="button" onClick={() => setEditandoCodigo(false)} className="text-[11px] text-blue-600 hover:underline">Confirmar</button>
                                    </>
                                ) : (
                                    <>
                                        <span className="text-[13px] font-mono font-bold text-slate-700">{codigoEditado}</span>
                                        <button type="button" onClick={() => setEditandoCodigo(true)} className="text-[11px] text-blue-600 hover:underline ml-2">Modificar</button>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Nivel de confidencialidad */}
                        <div className="flex items-center gap-4">
                            <label className={`${label} w-36 shrink-0`}>Nivel de confidencialidad</label>
                            <select name="confidencialidad" value={form.confidencialidad} onChange={handleChange} className={`${select} flex-1`}>
                                <option value="">Seleccionar</option>
                                <option>Confidencial</option>
                                <option>Interno</option>
                                <option>Público</option>
                            </select>
                        </div>

                        {/* Meses para revisión */}
                        <div className="flex items-center gap-4">
                            <label className={`${label} w-36 shrink-0`}>Meses para revisión</label>
                            <div className="flex items-center gap-2">
                                <input name="mesesRevision" value={form.mesesRevision || ''} onChange={handleChange} type="number" min="0" className={`${input} w-20`} />
                                <span className="text-[11px] text-slate-500">Meses</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* RESPONSABLES */}
                <div className="mt-6 pt-4 border-t border-slate-200">
                    <h3 className="text-[13px] font-bold text-slate-800 mb-3">Responsables</h3>
                    <RadioGroup name="resp_tipo" options={['Por Usuarios', 'Por Cargos']} value={`Por ${elaboraTipo.charAt(0).toUpperCase() + elaboraTipo.slice(1)}`}
                        onChange={v => { const t = v === 'Por Usuarios' ? 'usuarios' : 'cargos'; setElaboraTipo(t); setRevisaTipo(t); setApruebaTipo(t); }} />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-3">
                        <DualListbox title="Elabora(n)" options={getOptions(elaboraTipo)} selectedOptions={form.elabora} onChange={v => updateList('elabora', v)} />
                        <DualListbox title="Revisa(n)" options={getOptions(revisaTipo)} selectedOptions={form.revisa} onChange={v => updateList('revisa', v)} />
                        <DualListbox title="Aprueba(n)" options={getOptions(apruebaTipo)} selectedOptions={form.aprueba} onChange={v => updateList('aprueba', v)} />
                    </div>
                </div>

                {/* PERMISOS */}
                <div className="mt-6 pt-4 border-t border-slate-200">
                    <h3 className="text-[13px] font-bold text-slate-800 mb-2">Permisos</h3>
                    <RadioGroup name="permisos_tipo" options={['Por Usuarios', 'Por Cargos', 'Por Grupos']}
                        value={`Por ${permisosPermisoTipo.charAt(0).toUpperCase() + permisosPermisoTipo.slice(1)}`}
                        onChange={v => {
                            const map = { 'Por Usuarios': 'usuarios', 'Por Cargos': 'cargos', 'Por Grupos': 'grupos' };
                            setPermisosPermisoTipo(map[v]);
                        }} />

                    <div className="mt-3">
                        <DualListbox title="Visualización" options={getOptions(permisosPermisoTipo)} selectedOptions={form.visualizacion} onChange={v => updateList('visualizacion', v)} />
                        <label className="flex items-center gap-2 text-[11px] text-slate-600 cursor-pointer mt-2 mb-1">
                            <input type="checkbox" className="rounded text-blue-600" /> Indicar obligatoriedad de lectura y aceptación
                        </label>
                        <button type="button" className="px-3 py-1 bg-slate-100 border border-slate-300 rounded text-[11px] text-slate-600 hover:bg-slate-200 transition-colors">Configurar</button>
                    </div>
                </div>

                {/* IMPRESIÓN Y DESCARGA */}
                <div className="mt-6 pt-4 border-t border-slate-200">
                    <h3 className="text-[13px] font-bold text-slate-800 mb-2">Impresión y Descarga</h3>
                    <RadioGroup name="imp_tipo" options={['Por Usuarios', 'Por Cargos', 'Por Grupos']}
                        value={`Por ${permisosPermisoTipo.charAt(0).toUpperCase() + permisosPermisoTipo.slice(1)}`}
                        onChange={v => {
                            const map = { 'Por Usuarios': 'usuarios', 'Por Cargos': 'cargos', 'Por Grupos': 'grupos' };
                            setPermisosPermisoTipo(map[v]);
                        }} />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-3">
                        <DualListbox title="Impresión" options={getOptions(permisosPermisoTipo)} selectedOptions={form.impresion} onChange={v => updateList('impresion', v)} />
                        <DualListbox title="Descargar archivo original" options={getOptions(permisosPermisoTipo)} selectedOptions={form.descargaOriginal} onChange={v => updateList('descargaOriginal', v)} />
                        <DualListbox title="Descargar archivo PDF" options={getOptions(permisosPermisoTipo)} selectedOptions={form.descargaPdf} onChange={v => updateList('descargaPdf', v)} />
                    </div>
                </div>

                {/* ACTIONS */}
                <div className="mt-6 pt-4 border-t border-slate-200 flex justify-end gap-3">
                    <button type="button" onClick={() => navigate('/procesos/listado-unico')}
                        className="px-5 py-1.5 border border-slate-300 rounded text-[12px] font-bold text-slate-600 hover:bg-slate-50 transition-colors">
                        Volver
                    </button>
                    <button type="submit"
                        className="flex items-center gap-2 px-5 py-1.5 bg-blue-600 text-white rounded text-[12px] font-bold hover:bg-blue-700 transition-colors shadow-sm">
                        <Save size={14} /> Guardar
                    </button>
                </div>
            </form>
        </div>
    );
};
