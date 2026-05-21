import React, { useState, useEffect } from 'react';
import { Save, X, FileSignature, Info, UserPlus } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import http from '../../../services/httpClient';
import { useAlert } from '../../../providers/AlertProvider';
import { useAuth } from '../../../providers/AuthProvider';

const editorModules = {
    toolbar: [
        // Fuente, Tamaño y Encabezados
        [{ 'font': [] }, { 'size': ['small', false, 'large', 'huge'] }],
        [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
        // Formato de texto básico
        ['bold', 'italic', 'underline', 'strike'],
        // Color de texto y fondo
        [{ 'color': [] }, { 'background': [] }],
        // Subíndice / Superíndice
        [{ 'script': 'sub'}, { 'script': 'super' }],
        // Alineación
        [{ 'align': [] }],
        // Listas y Sangrías
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        [{ 'indent': '-1'}, { 'indent': '+1' }],
        // Bloques y multimedia
        ['blockquote', 'code-block'],
        ['link', 'image', 'video'],
        // Limpiar formato
        ['clean']
    ],
    clipboard: {
        matchVisual: false,
    }
};

// Searchable Select Component matching Clinova aesthetics
const SearchableSelect = ({ label, required, value, onChange, options, placeholder = "Seleccionar..." }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    
    const filteredOptions = options.filter(opt => 
        String(opt).toLowerCase().includes(searchTerm.toLowerCase())
    );

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (!e.target.closest(`.select-container-${label.replace(/\s+/g, '')}`)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, [label]);

    return (
        <div className={`relative select-container-${label.replace(/\s+/g, '')} space-y-1`}>
            <label className="text-xs font-semibold text-slate-700 flex items-center">
                {required && <span className="text-blue-600 font-bold mr-0.5">*</span>}
                {label}
            </label>
            <div 
                className="w-full px-3 py-1.5 border border-slate-300 rounded text-sm bg-white flex justify-between items-center cursor-pointer select-none focus-within:ring-2 focus-within:ring-blue-100 focus-within:border-blue-500 transition-all"
                onClick={() => setIsOpen(!isOpen)}
            >
                <span className={value ? "text-slate-800" : "text-slate-400"}>
                    {value || placeholder}
                </span>
                <span className="text-slate-400 text-xs">▼</span>
            </div>
            {isOpen && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded shadow-lg max-h-60 overflow-y-auto">
                    <div className="p-2 border-b border-slate-100 bg-slate-50 sticky top-0">
                        <input 
                            type="text" 
                            placeholder="Buscar..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full px-2 py-1 border border-slate-200 rounded text-xs outline-none focus:border-blue-400"
                            onClick={(e) => e.stopPropagation()}
                        />
                    </div>
                    {filteredOptions.length === 0 ? (
                        <div className="px-3 py-2 text-xs text-slate-400 italic">No se encontraron resultados</div>
                    ) : (
                        filteredOptions.map((opt, idx) => (
                            <div 
                                key={idx}
                                className="px-3 py-1.5 text-xs text-slate-700 hover:bg-blue-50 hover:text-blue-700 cursor-pointer transition-colors"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onChange(opt);
                                    setIsOpen(false);
                                    setSearchTerm('');
                                }}
                            >
                                {opt}
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

export const CrearActa = () => {
    const navigate = useNavigate();
    const { showAlert } = useAlert();
    const { user } = useAuth();
    const [searchParams] = useSearchParams();
    const plantillaId = searchParams.get('plantillaId');
    const editId = searchParams.get('editId');

    // State variables for new form inputs
    const [nombre, setNombre] = useState('Sin título');
    const [tipo, setTipo] = useState('');
    const [proceso, setProceso] = useState(searchParams.get('proceso') || '');
    const [sede, setSede] = useState('');
    const [fechaInicio, setFechaInicio] = useState(new Date().toISOString().split('T')[0]);
    const [horaInicio, setHoraInicio] = useState(() => {
        const d = new Date();
        return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
    });
    const [fechaFin, setFechaFin] = useState(new Date().toISOString().split('T')[0]);
    const [horaFin, setHoraFin] = useState(() => {
        const d = new Date();
        d.setHours(d.getHours() + 1);
        return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
    });
    const [lugar, setLugar] = useState('');
    const [enlaceVirtual, setEnlaceVirtual] = useState('');
    const [quienCita, setQuienCita] = useState('');
    const [confidencial, setConfidencial] = useState(false);
    const [elaborador, setElaborador] = useState('');
    const [area, setArea] = useState('');
    const [palabrasClave, setPalabrasClave] = useState('');
    const [compromisosAprobacion, setCompromisosAprobacion] = useState('No');
    const [convertirDocumento, setConvertirDocumento] = useState('No');
    const [requiereAprobacionActa, setRequiereAprobacionActa] = useState('No');
    const [contenido, setContenido] = useState('');
    const [estado, setEstado] = useState('Borrador');

    // Data lists for select dropdowns
    const [usuarios, setUsuarios] = useState([]);
    const [sedes, setSedes] = useState([]);

    const fallbackSedes = ['IPS Clinical House', 'Sede Principal', 'Sede Norte', 'Sede Sur'];
    const fallbackUsuarios = ['Dilan Bulding', 'Junior Arias', 'Kevin Arias', 'Administrador'];
    const areas = ['Asistencial', 'Administrativa', 'Comercial', 'Financiera', 'Talento Humano', 'Sistemas / Tecnología', 'Calidad'];

    // Fetch lists from backend with fallbacks
    useEffect(() => {
        const fetchDatosGlobales = async () => {
            try {
                const [resSedes, resUsuarios] = await Promise.all([
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

                const sedesList = parseArray(resSedes);
                setSedes(sedesList.map(s => s.nombre || s));

                const usuariosList = parseArray(resUsuarios);
                const formattedUsers = usuariosList.map(u => {
                    const fullName = u.persona ? `${u.persona.primerNombre || ''} ${u.persona.primerApellido || ''}`.trim() : `${u.nombres || ''} ${u.apellidos || ''}`.trim();
                    return fullName || u.username;
                }).filter(Boolean);
                setUsuarios(formattedUsers);

                // Set default elaborador if not editing
                if (!editId && user) {
                    const userFullName = user.persona ? `${user.persona.primerNombre || ''} ${user.persona.primerApellido || ''}`.trim() : user.name || user.username || '';
                    setElaborador(userFullName);
                }
            } catch (error) {
                console.error("Error loading dependency lists", error);
            }
        };
        fetchDatosGlobales();
    }, [editId, user]);

    // Load existing acta details if editId is provided
    useEffect(() => {
        if (editId) {
            const fetchActa = async () => {
                try {
                    const res = await http.get(`/actas/${editId}`);
                    const data = res?.data?.data || res?.data || res;
                    setNombre(data.titulo || data.nombre || 'Sin título');
                    setTipo(data.tipo || '');
                    setProceso(data.proceso || '');
                    setSede(data.sede || '');
                    setFechaInicio(data.fechaInicio || data.fecha || new Date().toISOString().split('T')[0]);
                    setHoraInicio(data.horaInicio || '10:00');
                    setFechaFin(data.fechaFin || data.fecha || new Date().toISOString().split('T')[0]);
                    setHoraFin(data.horaFin || '11:00');
                    setLugar(data.lugar || '');
                    setEnlaceVirtual(data.enlaceVirtual || '');
                    setQuienCita(data.quienCita || '');
                    setConfidencial(data.confidencial === true || data.confidencial === 'true');
                    setElaborador(data.elaborador || data.responsable || '');
                    setArea(data.area || '');
                    setPalabrasClave(data.palabrasClave || '');
                    setCompromisosAprobacion(data.compromisosAprobacion || 'No');
                    setConvertirDocumento(data.convertirDocumento || 'No');
                    setRequiereAprobacionActa(data.requiereAprobacionActa || 'No');
                    setContenido(data.contenidoHtml || '');
                    setEstado(data.estado || 'Borrador');
                } catch (error) {
                    showAlert({ message: 'Error al cargar el acta para edición', status: 'error' });
                }
            };
            fetchActa();
        } else if (plantillaId) {
            const fetchPlantilla = async () => {
                try {
                    const res = await http.get(`/plantillas/${plantillaId}`);
                    const data = res?.data?.data || res?.data || res;
                    setNombre(`Acta basada en: ${data.titulo}`);
                    setContenido(data.contenidoHtml || '');
                    showAlert({ message: 'Plantilla cargada correctamente. Puede reemplazar las variables.', status: 'info' });
                } catch (error) {
                    showAlert({ message: 'Error al cargar la plantilla seleccionada', status: 'error' });
                }
            };
            fetchPlantilla();
        }
    }, [editId, plantillaId, showAlert]);

    const handleGuardar = async (e) => {
        e.preventDefault();
        
        if (!nombre.trim() || !tipo || !proceso || !sede || !fechaInicio || !horaInicio || !fechaFin || !horaFin || !quienCita || !elaborador || !contenido.trim() || contenido === '<p><br></p>') {
            showAlert({ message: 'Todos los campos obligatorios (*) y el contenido de temas tratados son requeridos', status: 'warning' });
            return;
        }

        const payload = {
            titulo: nombre,
            fecha: fechaInicio,
            tipo,
            estado,
            responsable: elaborador,
            contenidoHtml: contenido,
            proceso: proceso || null,
            
            // Metadatos adicionales para robustez
            sede,
            fechaInicio,
            horaInicio,
            fechaFin,
            horaFin,
            lugar,
            enlaceVirtual,
            quienCita,
            confidencial,
            elaborador,
            area,
            palabrasClave,
            compromisosAprobacion,
            convertirDocumento,
            requiereAprobacionActa
        };

        try {
            if (editId) {
                await http.put(`/actas/${editId}`, payload);
                showAlert({ message: 'Acta actualizada exitosamente', status: 'success' });
            } else {
                await http.post('/actas', payload);
                showAlert({ message: 'Acta guardada exitosamente', status: 'success' });
            }
            navigate('/actas-informes/gestion');
        } catch (error) {
            showAlert({ message: `Error al ${editId ? 'actualizar' : 'guardar'} el acta`, status: 'error' });
        }
    };

    const inputClass = "w-full px-3 py-1.5 border border-slate-300 rounded text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all bg-white";
    const labelClass = "text-xs font-semibold text-slate-700 mb-1 flex items-center";
    const radioLabelClass = "flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer select-none";

    const sedesOptions = sedes.length > 0 ? sedes : fallbackSedes;
    const usuariosOptions = usuarios.length > 0 ? usuarios : fallbackUsuarios;

    return (
        <form onSubmit={handleGuardar} className="min-h-screen bg-slate-50 p-4 md:p-6">
            <div className="max-w-[1600px] mx-auto space-y-6">
                
                {/* Header Action Bar */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-3 rounded-xl bg-white shadow-sm text-blue-600 border border-slate-100">
                            <FileSignature size={24} />
                        </div>
                        <div>
                            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Actas y Reportes</span>
                            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                                {editId ? `Editar Acta: ${nombre}` : 'Redactar Acta'}
                            </h1>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button type="button" onClick={() => navigate(-1)} className="px-5 py-2.5 bg-white border border-slate-200 text-slate-700 rounded text-sm font-semibold hover:bg-slate-50 transition-colors flex items-center gap-2 shadow-sm">
                            <X size={16} /> Cancelar
                        </button>
                        <button type="submit" className="px-5 py-2.5 bg-blue-600 text-white rounded text-sm font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm">
                            <Save size={16} /> {editId ? 'Actualizar Acta' : 'Guardar Acta'}
                        </button>
                    </div>
                </div>

                {/* 2-Column Split Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    
                    {/* Left Column: Form Metadata */}
                    <div className="lg:col-span-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4 max-h-[85vh] overflow-y-auto">
                        
                        {/* Código (Read-only) */}
                        <div className="space-y-1">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Código</span>
                            <div className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded text-sm text-slate-600 font-mono">
                                {editId ? `ACT-${editId}` : 'Generado automáticamente'}
                            </div>
                        </div>

                        {/* Nombre */}
                        <div className="space-y-1">
                            <label className={labelClass}>
                                <span className="text-blue-600 font-bold mr-0.5">*</span>Nombre
                            </label>
                            <input 
                                type="text" 
                                required 
                                value={nombre} 
                                onChange={(e) => setNombre(e.target.value)} 
                                className={inputClass} 
                                placeholder="Ej: Reunión de Sincronización" 
                            />
                        </div>

                        {/* Tipo de acta */}
                        <div className="space-y-1">
                            <label className={labelClass}>
                                <span className="text-blue-600 font-bold mr-0.5">*</span>Tipo de acta
                            </label>
                            <select 
                                required 
                                value={tipo} 
                                onChange={(e) => setTipo(e.target.value)} 
                                className={inputClass}
                            >
                                <option value="" disabled>Seleccionar...</option>
                                <option value="Comité">Comité</option>
                                <option value="Sincronización">Sincronización</option>
                                <option value="Capacitación">Capacitación</option>
                                <option value="Revisión">Revisión</option>
                                <option value="Planificación">Planificación</option>
                                <option value="Otro">Otro</option>
                            </select>
                        </div>

                        {/* Proceso */}
                        <div className="space-y-1">
                            <label className={labelClass}>
                                <span className="text-blue-600 font-bold mr-0.5">*</span>Proceso
                            </label>
                            <select 
                                required 
                                value={proceso} 
                                onChange={(e) => setProceso(e.target.value)} 
                                className={inputClass}
                            >
                                <option value="" disabled>Seleccionar...</option>
                                <option value="GESTIÓN DE HUMANIZACIÓN">GESTIÓN DE HUMANIZACIÓN</option>
                                <option value="GESTIÓN COMERCIAL Y MERCADEO">GESTIÓN COMERCIAL Y MERCADEO</option>
                                <option value="GESTIÓN ESTRATÉGICA">GESTIÓN ESTRATÉGICA</option>
                                <option value="GESTIÓN DE CALIDAD">GESTIÓN DE CALIDAD</option>
                                <option value="SIAU">SIAU</option>
                                <option value="GESTIÓN DE SALUD PÚBLICA">GESTIÓN DE SALUD PÚBLICA</option>
                                <option value="GESTIÓN DE SEGURIDAD DEL PACIENTE">GESTIÓN DE SEGURIDAD DEL PACIENTE</option>
                                <option value="GESTIÓN DE INTERNACIÓN DOMICILIARIO">GESTIÓN DE INTERNACIÓN DOMICILIARIO</option>
                                <option value="GESTIÓN DE CONSULTA EXTERNA">GESTIÓN DE CONSULTA EXTERNA</option>
                                <option value="GESTIÓN DE APOYO DIAGNOSTICO Y TERAPEUTICO">GESTIÓN DE APOYO DIAGNOSTICO Y TERAPEUTICO</option>
                                <option value="GESTIÓN DE EDUCACIÓN CONTINUA">GESTIÓN DE EDUCACIÓN CONTINUA</option>
                                <option value="DOCENCIA E INVESTIGACIÓN">DOCENCIA E INVESTIGACIÓN</option>
                                <option value="GESTIÓN DE CUENTAS MÉDICAS">GESTIÓN DE CUENTAS MÉDICAS</option>
                                <option value="GESTIÓN FINANCIERA">GESTIÓN FINANCIERA</option>
                                <option value="GESTIÓN DE TALENTO HUMANO">GESTIÓN DE TALENTO HUMANO</option>
                                <option value="GESTIÓN DE SEGURIDAD Y SALUD EN EL TRABAJO">GESTIÓN DE SEGURIDAD Y SALUD EN EL TRABAJO</option>
                                <option value="GESTIÓN DE INFRAESTRUCTURA">GESTIÓN DE INFRAESTRUCTURA</option>
                                <option value="GESTIÓN DE TECNOLOGÍA Y SISTEMAS DE INFORMACIÓN">GESTIÓN DE TECNOLOGÍA Y SISTEMAS DE INFORMACIÓN</option>
                                <option value="GESTIÓN DE ARCHIVO">GESTIÓN DE ARCHIVO</option>
                                <option value="GESTIÓN DE COMUNICACIONES">GESTIÓN DE COMUNICACIONES</option>
                                <option value="GESTIÓN DE COMPRAS">GESTIÓN DE COMPRAS</option>
                            </select>
                        </div>

                        {/* Sede */}
                        <div className="space-y-1">
                            <label className={labelClass}>
                                <span className="text-blue-600 font-bold mr-0.5">*</span>Sede
                            </label>
                            <select 
                                required 
                                value={sede} 
                                onChange={(e) => setSede(e.target.value)} 
                                className={inputClass}
                            >
                                <option value="" disabled>Seleccionar...</option>
                                {sedesOptions.map((s, idx) => (
                                    <option key={idx} value={s}>{s}</option>
                                ))}
                            </select>
                        </div>

                        {/* Fecha y hora de inicio */}
                        <div className="space-y-1">
                            <label className={labelClass}>
                                <span className="text-blue-600 font-bold mr-0.5">*</span>Fecha y hora de inicio
                            </label>
                            <div className="flex gap-2">
                                <input 
                                    type="date" 
                                    required 
                                    value={fechaInicio} 
                                    onChange={(e) => setFechaInicio(e.target.value)} 
                                    className="flex-1 px-3 py-1.5 border border-slate-300 rounded text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none bg-white" 
                                />
                                <input 
                                    type="time" 
                                    required 
                                    value={horaInicio} 
                                    onChange={(e) => setHoraInicio(e.target.value)} 
                                    className="w-24 px-3 py-1.5 border border-slate-300 rounded text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none bg-white" 
                                />
                            </div>
                        </div>

                        {/* Fecha y hora final */}
                        <div className="space-y-1">
                            <label className={labelClass}>
                                <span className="text-blue-600 font-bold mr-0.5">*</span>Fecha y hora final
                            </label>
                            <div className="flex gap-2">
                                <input 
                                    type="date" 
                                    required 
                                    value={fechaFin} 
                                    onChange={(e) => setFechaFin(e.target.value)} 
                                    className="flex-1 px-3 py-1.5 border border-slate-300 rounded text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none bg-white" 
                                />
                                <input 
                                    type="time" 
                                    required 
                                    value={horaFin} 
                                    onChange={(e) => setHoraFin(e.target.value)} 
                                    className="w-24 px-3 py-1.5 border border-slate-300 rounded text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none bg-white" 
                                />
                            </div>
                        </div>

                        {/* Lugar */}
                        <div className="space-y-1">
                            <label className={labelClass}>Lugar</label>
                            <input 
                                type="text" 
                                value={lugar} 
                                onChange={(e) => setLugar(e.target.value)} 
                                className={inputClass} 
                                placeholder="Ej: Sala de juntas 3er piso" 
                            />
                        </div>

                        {/* Enlace de la reunión */}
                        <div className="space-y-1">
                            <label className={labelClass}>Enlace de la reunión (virtual)</label>
                            <div className="flex gap-2">
                                <input 
                                    type="url" 
                                    value={enlaceVirtual} 
                                    onChange={(e) => setEnlaceVirtual(e.target.value)} 
                                    placeholder="https://meet.google.com/..." 
                                    className="flex-1 px-3 py-1.5 border border-slate-300 rounded text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none bg-white" 
                                />
                                <button 
                                    type="button"
                                    onClick={() => {
                                        if (enlaceVirtual) {
                                            showAlert({ message: 'Notificación enviada a los convocados', status: 'success' });
                                        } else {
                                            showAlert({ message: 'Por favor, ingrese un enlace de reunión válido primero', status: 'warning' });
                                        }
                                    }}
                                    className="px-3 py-1.5 bg-slate-50 border border-slate-300 text-slate-700 text-xs font-semibold rounded hover:bg-slate-100 transition-colors shadow-sm whitespace-nowrap"
                                >
                                    Notificar a convocados
                                </button>
                            </div>
                            <button
                                type="button"
                                onClick={() => showAlert({ message: 'Redirección a salas virtuales integrada', status: 'info' })}
                                className="text-xs text-blue-600 hover:underline hover:text-blue-700 block text-left"
                            >
                                ¿No tienes una sala de reunión?
                            </button>
                        </div>

                        {/* Quien Cita */}
                        <SearchableSelect 
                            label="Quien Cita"
                            required={true}
                            value={quienCita}
                            onChange={setQuienCita}
                            options={usuariosOptions}
                            placeholder="Buscar..."
                        />

                        {/* Acta confidencial */}
                        <div className="flex items-center gap-2 py-1 select-none">
                            <input 
                                type="checkbox" 
                                id="confidencial" 
                                checked={confidencial} 
                                onChange={(e) => setConfidencial(e.target.checked)} 
                                className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500 cursor-pointer" 
                            />
                            <label htmlFor="confidencial" className="text-xs font-semibold text-slate-700 cursor-pointer">
                                Acta confidencial
                            </label>
                            <div className="relative group cursor-help">
                                <Info size={14} className="text-blue-500" />
                                <div className="absolute left-6 bottom-0 hidden group-hover:block w-52 p-2 bg-slate-800 text-white text-[10px] rounded shadow-lg z-50 leading-relaxed">
                                    Las actas confidenciales solo serán visibles para el creador, asistentes y aprobadores.
                                </div>
                            </div>
                        </div>

                        {/* Elaborador */}
                        <SearchableSelect 
                            label="Elaborador"
                            required={true}
                            value={elaborador}
                            onChange={setElaborador}
                            options={usuariosOptions}
                        />

                        {/* Área o dependencia */}
                        <div className="space-y-1">
                            <label className={labelClass}>Área o dependencia</label>
                            <select 
                                value={area} 
                                onChange={(e) => setArea(e.target.value)} 
                                className={inputClass}
                            >
                                <option value="" disabled>Seleccionar...</option>
                                {areas.map((a, idx) => (
                                    <option key={idx} value={a}>{a}</option>
                                ))}
                            </select>
                        </div>

                        {/* Palabras clave */}
                        <div className="space-y-1">
                            <label className={labelClass}>Palabras clave</label>
                            <input 
                                type="text" 
                                value={palabrasClave} 
                                onChange={(e) => setPalabrasClave(e.target.value)} 
                                className={inputClass} 
                                placeholder="Separadas por comas..." 
                            />
                        </div>

                        {/* Pregunta 1 */}
                        <div className="space-y-1.5 pt-1">
                            <label className="text-xs font-semibold text-slate-700 block leading-tight">
                                ¿Los compromisos del acta requieren aprobación?
                            </label>
                            <div className="flex gap-4">
                                <label className={radioLabelClass}>
                                    <input 
                                        type="radio" 
                                        name="compromisosAprobacion" 
                                        checked={compromisosAprobacion === 'Sí'} 
                                        onChange={() => setCompromisosAprobacion('Sí')} 
                                        className="text-blue-600 focus:ring-blue-500 cursor-pointer" 
                                    />
                                    Sí
                                </label>
                                <label className={radioLabelClass}>
                                    <input 
                                        type="radio" 
                                        name="compromisosAprobacion" 
                                        checked={compromisosAprobacion === 'No'} 
                                        onChange={() => setCompromisosAprobacion('No')} 
                                        className="text-blue-600 focus:ring-blue-500 cursor-pointer" 
                                    />
                                    No
                                </label>
                            </div>
                        </div>

                        {/* Pregunta 2 */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-700 block leading-tight">
                                ¿Desea convertir esta acta en documento de trabajo?
                            </label>
                            <div className="flex gap-4">
                                <label className={radioLabelClass}>
                                    <input 
                                        type="radio" 
                                        name="convertirDocumento" 
                                        checked={convertirDocumento === 'Sí'} 
                                        onChange={() => setConvertirDocumento('Sí')} 
                                        className="text-blue-600 focus:ring-blue-500 cursor-pointer" 
                                    />
                                    Sí
                                </label>
                                <label className={radioLabelClass}>
                                    <input 
                                        type="radio" 
                                        name="convertirDocumento" 
                                        checked={convertirDocumento === 'No'} 
                                        onChange={() => setConvertirDocumento('No')} 
                                        className="text-blue-600 focus:ring-blue-500 cursor-pointer" 
                                    />
                                    No
                                </label>
                            </div>
                        </div>

                        {/* Pregunta 3 */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-700 block leading-tight">
                                ¿Esta acta requiere aprobación?
                            </label>
                            <div className="flex gap-4">
                                <label className={radioLabelClass}>
                                    <input 
                                        type="radio" 
                                        name="requiereAprobacionActa" 
                                        checked={requiereAprobacionActa === 'Sí'} 
                                        onChange={() => setRequiereAprobacionActa('Sí')} 
                                        className="text-blue-600 focus:ring-blue-500 cursor-pointer" 
                                    />
                                    Sí
                                </label>
                                <label className={radioLabelClass}>
                                    <input 
                                        type="radio" 
                                        name="requiereAprobacionActa" 
                                        checked={requiereAprobacionActa === 'No'} 
                                        onChange={() => setRequiereAprobacionActa('No')} 
                                        className="text-blue-600 focus:ring-blue-500 cursor-pointer" 
                                    />
                                    No
                                </label>
                            </div>
                        </div>

                        {/* Adicionar asistentes y aprobadores */}
                        <div className="border-t border-slate-100 pt-3">
                            <button
                                type="button"
                                onClick={() => showAlert({ message: 'La gestión de asistentes y aprobadores estará habilitada una vez guardada el acta', status: 'info' })}
                                className="flex items-center gap-2 text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline transition-colors focus:outline-none"
                            >
                                <UserPlus size={16} />
                                Adicionar asistentes y aprobadores
                            </button>
                        </div>

                    </div>

                    {/* Right Column: Temas Tratados Rich Text Editor */}
                    <div className="lg:col-span-8 bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col min-h-[700px] lg:min-h-[85vh]">
                        <h2 className="text-sm font-bold text-slate-800 mb-3 uppercase tracking-wider pb-2 border-b border-slate-100">
                            Temas Tratados
                        </h2>
                        <div className="flex-1 flex flex-col overflow-hidden focus-within:ring-2 focus-within:ring-blue-100 focus-within:border-blue-500 transition-all border border-slate-200 rounded">
                            <ReactQuill 
                                theme="snow" 
                                value={contenido} 
                                onChange={setContenido} 
                                modules={editorModules}
                                className="bg-white flex-1 flex flex-col"
                                style={{ height: '580px', paddingBottom: '42px' }}
                                placeholder="Comienza a redactar el contenido del acta aquí..."
                            />
                        </div>
                    </div>

                </div>
            </div>
        </form>
    );
};