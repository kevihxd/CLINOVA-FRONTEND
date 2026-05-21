import { X, Save, User, Briefcase, Syringe, Building2, Plus, Trash2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAlert } from '../../../providers/AlertProvider';
import { UsuariosService } from '../services/usuarios.service';
import http from '../../../services/httpClient';
import { cargarOpciones } from '../pages/GestionOpciones';
import { API_BASE_URL } from '../../../config/api';

const TIPOS_DOCUMENTO = [
    { id: 1, nombre: 'Cédula de Ciudadanía', sigla: 'CC' },
    { id: 2, nombre: 'Tarjeta de Identidad', sigla: 'TI' },
    { id: 3, nombre: 'Cédula de Extranjería', sigla: 'CE' },
    { id: 4, nombre: 'Pasaporte', sigla: 'PA' },
];

const ROLES = [
    { id: 1, nombre: 'Administrador', backendValue: 'ADMIN' },
    { id: 2, nombre: 'Trabajador', backendValue: 'HR_MANAGER' },
    { id: 3, nombre: 'Contratista', backendValue: 'USER' },
    { id: 4, nombre: 'Practicante', backendValue: 'USER_PRACTICANTE' },
];

// Roles that use "Objeto" instead of "Cargo"
const ROLES_CON_OBJETO = ['HR_MANAGER', 'USER_PRACTICANTE'];

const OPCIONES_DEFAULTS = {
    arl: ['POSITIVA', 'SURA', 'BOLÍVAR', 'COLMENA', 'LIBERTY', 'MAPFRE', 'AXA COLPATRIA'],
    eps: ['SURA EPS', 'SANITAS', 'COMPENSAR', 'NUEVA EPS', 'SALUD TOTAL', 'COOSALUD', 'MEDIMÁS', 'MUTUAL SER', 'FAMISANAR', 'CAJACOPI'],
    afp: ['COLPENSIONES', 'PORVENIR', 'PROTECCIÓN', 'COLFONDOS', 'OLD MUTUAL'],
    caja: ['COMPENSAR', 'COLSUBSIDIO', 'CAFAM', 'COMFENALCO', 'COMFAMA', 'CAJACOPI', 'CONFENALCO ATLÁNTICO'],
    tipoContrato: ['Término Fijo', 'Término Indefinido', 'Prestación de Servicios', 'Aprendizaje', 'Obra o Labor', 'Temporal'],
    estado: ['Activo', 'Inactivo', 'Suspendido', 'Vacaciones', 'Licencia', 'Retirado'],
    pesv: ['Aplicado', 'No Aplica', 'Pendiente', 'En Proceso'],
};

export const CreateUsuario = ({ isOpen, onClose, onSaved, editData }) => {
    const { showAlert } = useAlert();
    const [loading, setLoading] = useState(false);
    const [cargos, setCargos] = useState([]);
    const [objetos, setObjetos] = useState([]);
    const [sedes, setSedes] = useState([]);
    const [usuariosList, setUsuariosList] = useState([]);
    const [opcionesSelect, setOpcionesSelect] = useState(OPCIONES_DEFAULTS);

    const [formData, setFormData] = useState({
        tipoDocumento: '', numeroDocumento: '', primerNombre: '', segundoNombre: '',
        primerApellido: '', segundoApellido: '', fechaNacimiento: '', direccionResidencia: '',
        numeroTelefono: '', lugarNacimiento: '', correoElectronico: '', perfilVacunacion: '',
        username: '', password: '', rol: '', cargoId: '', objetoId: '',
        // Campos laborales
        arl: '', eps: '', afp: '', cajaCompensacion: '', fechaIngreso: '',
        tipoContrato: '', sedeId: '', salario: '', subsidioTransporte: '',
        estado: '', fechaRetiro: '', pesvFecha: '', motivoRetiro: '', responsableEvaluacionId: '',
    });

    const usaObjeto = ROLES_CON_OBJETO.includes(formData.rol);

    // Cargar opciones desde localStorage
    useEffect(() => {
        setOpcionesSelect({
            arl: cargarOpciones('opciones_arl', OPCIONES_DEFAULTS.arl),
            eps: cargarOpciones('opciones_eps', OPCIONES_DEFAULTS.eps),
            afp: cargarOpciones('opciones_afp', OPCIONES_DEFAULTS.afp),
            caja: cargarOpciones('opciones_caja', OPCIONES_DEFAULTS.caja),
            tipoContrato: cargarOpciones('opciones_tipo_contrato', OPCIONES_DEFAULTS.tipoContrato),
            estado: cargarOpciones('opciones_estado', OPCIONES_DEFAULTS.estado),
            pesv: cargarOpciones('opciones_pesv', OPCIONES_DEFAULTS.pesv),
        });
    }, [isOpen]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await http.get('/cargos');
                setCargos(Array.isArray(res) ? res : (res.data || []));
            } catch (error) {
                console.error('Error al cargar los cargos', error);
            }
            try {
                const token = localStorage.getItem('token');
                const res = await fetch(`${API_BASE_URL}/api/v1/objetos`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) setObjetos(await res.json());
            } catch {}
            try {
                const res = await http.get('/sedes');
                setSedes(Array.isArray(res) ? res : (res.data || []));
            } catch {}
            try {
                const res = await UsuariosService.getAll();
                setUsuariosList(Array.isArray(res) ? res : (res.data || []));
            } catch (error) {
                console.error('Error al cargar los usuarios', error);
            }
        };
        if (isOpen) fetchData();
    }, [isOpen]);

    useEffect(() => {
        if (editData) {
            setFormData({
                tipoDocumento: editData.persona?.tipoDocumento || '',
                numeroDocumento: editData.persona?.numeroDocumento || '',
                primerNombre: editData.persona?.primerNombre || '',
                segundoNombre: editData.persona?.segundoNombre || '',
                primerApellido: editData.persona?.primerApellido || '',
                segundoApellido: editData.persona?.segundoApellido || '',
                fechaNacimiento: editData.persona?.fechaNacimiento || '',
                direccionResidencia: editData.persona?.direccionResidencia || '',
                numeroTelefono: editData.persona?.numeroTelefono || '',
                lugarNacimiento: editData.persona?.lugarNacimiento || '',
                correoElectronico: editData.persona?.correoElectronico || '',
                perfilVacunacion: editData.persona?.perfilVacunacion || '',
                username: editData.username || '',
                password: '',
                rol: editData.rol || '',
                cargoId: editData.cargo?.id || '',
                objetoId: editData.objeto?.id || '',
                arl: editData.arl || '',
                eps: editData.eps || '',
                afp: editData.afp || '',
                cajaCompensacion: editData.cajaCompensacion || '',
                fechaIngreso: editData.fechaIngreso || '',
                tipoContrato: editData.tipoContrato || '',
                sedeId: editData.sede?.id || editData.sedeId || '',
                salario: editData.salario || '',
                subsidioTransporte: editData.subsidioTransporte || '',
                estado: editData.estado || '',
                fechaRetiro: editData.fechaRetiro || '',
                pesvFecha: editData.pesvFecha || '',
                motivoRetiro: editData.motivoRetiro || '',
                responsableEvaluacionId: editData.responsableEvaluacionId || '',
            });
        } else {
            setFormData({
                tipoDocumento: '', numeroDocumento: '', primerNombre: '', segundoNombre: '',
                primerApellido: '', segundoApellido: '', fechaNacimiento: '', direccionResidencia: '',
                numeroTelefono: '', lugarNacimiento: '', correoElectronico: '', perfilVacunacion: '',
                username: '', password: '', rol: '', cargoId: '', objetoId: '',
                arl: '', eps: '', afp: '', cajaCompensacion: '', fechaIngreso: '',
                tipoContrato: '', sedeId: '', salario: '', subsidioTransporte: '',
                estado: '', fechaRetiro: '', pesvFecha: '', motivoRetiro: '', responsableEvaluacionId: '',
            });
        }
    }, [editData, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const payload = {
                username: formData.username,
                password: formData.password,
                rol: formData.rol,
                cargoId: (!usaObjeto && formData.cargoId) ? Number(formData.cargoId) : null,
                objetoId: (usaObjeto && formData.objetoId) ? Number(formData.objetoId) : null,
                tipoDocumento: formData.tipoDocumento || null,
                numeroDocumento: formData.numeroDocumento,
                primerNombre: formData.primerNombre,
                segundoNombre: formData.segundoNombre,
                primerApellido: formData.primerApellido,
                segundoApellido: formData.segundoApellido,
                fechaNacimiento: formData.fechaNacimiento || null,
                direccionResidencia: formData.direccionResidencia,
                numeroTelefono: formData.numeroTelefono,
                lugarNacimiento: formData.lugarNacimiento,
                correoElectronico: formData.correoElectronico,
                perfilVacunacion: formData.perfilVacunacion,
                // Campos laborales
                arl: formData.arl || null,
                eps: formData.eps || null,
                afp: formData.afp || null,
                cajaCompensacion: formData.cajaCompensacion || null,
                fechaIngreso: formData.fechaIngreso || null,
                tipoContrato: formData.tipoContrato || null,
                sedeId: formData.sedeId ? Number(formData.sedeId) : null,
                salario: formData.salario ? parseFloat(formData.salario) : null,
                subsidioTransporte: formData.subsidioTransporte || null,
                estado: formData.estado || null,
                fechaRetiro: formData.fechaRetiro || null,
                pesvFecha: formData.pesvFecha || null,
                motivoRetiro: formData.motivoRetiro || null,
                responsableEvaluacionId: formData.responsableEvaluacionId ? Number(formData.responsableEvaluacionId) : null,
            };

            if (editData && editData.id) {
                await UsuariosService.update(editData.id, payload);
                showAlert({ message: 'Usuario actualizado correctamente', status: 'success' });
            } else {
                await UsuariosService.create(payload);
                showAlert({ message: 'Usuario creado correctamente.', status: 'success' });
            }

            if (onSaved) onSaved();
            onClose();
        } catch (error) {
            showAlert({ message: 'Error al procesar la solicitud', status: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'rol') {
            // Reset cargo/objeto when role changes
            setFormData(prev => ({ ...prev, [name]: value, cargoId: '', objetoId: '' }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const inputCls = "w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400";
    const labelCls = "text-sm font-medium text-slate-700";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in overflow-y-auto">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-5xl overflow-hidden animate-scale-in my-8">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-900">{editData ? 'Editar Usuario' : 'Crear Nuevo Usuario'}</h2>
                    </div>
                    <button type="button" onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-all">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-8">

                    {/* ===== INFORMACIÓN PERSONAL ===== */}
                    <div>
                        <h3 className="text-sm font-semibold text-blue-600 uppercase tracking-wider mb-4 flex items-center gap-2">
                            <User className="w-4 h-4" /> Información Personal
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="space-y-1.5">
                                <label className={labelCls}>Tipo Documento</label>
                                <select name="tipoDocumento" value={formData.tipoDocumento} onChange={handleChange} className={inputCls}>
                                    <option value="">Seleccionar...</option>
                                    {TIPOS_DOCUMENTO.map(tipo => <option key={tipo.id} value={tipo.sigla}>{tipo.sigla} - {tipo.nombre}</option>)}
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label className={labelCls}>Número Documento</label>
                                <input type="text" name="numeroDocumento" value={formData.numeroDocumento} onChange={handleChange} className={inputCls} />
                            </div>
                            <div className="space-y-1.5">
                                <label className={labelCls}>Primer Nombre *</label>
                                <input type="text" name="primerNombre" required value={formData.primerNombre} onChange={handleChange} className={inputCls} />
                            </div>
                            <div className="space-y-1.5">
                                <label className={labelCls}>Segundo Nombre</label>
                                <input type="text" name="segundoNombre" value={formData.segundoNombre} onChange={handleChange} className={inputCls} />
                            </div>
                            <div className="space-y-1.5">
                                <label className={labelCls}>Primer Apellido *</label>
                                <input type="text" name="primerApellido" required value={formData.primerApellido} onChange={handleChange} className={inputCls} />
                            </div>
                            <div className="space-y-1.5">
                                <label className={labelCls}>Segundo Apellido</label>
                                <input type="text" name="segundoApellido" value={formData.segundoApellido} onChange={handleChange} className={inputCls} />
                            </div>
                            <div className="space-y-1.5">
                                <label className={labelCls}>Correo Electrónico *</label>
                                <input type="email" name="correoElectronico" required value={formData.correoElectronico} onChange={handleChange} className={inputCls} />
                            </div>
                            <div className="space-y-1.5">
                                <label className={labelCls}>Teléfono</label>
                                <input type="text" name="numeroTelefono" value={formData.numeroTelefono} onChange={handleChange} className={inputCls} />
                            </div>
                            <div className="space-y-1.5">
                                <label className={labelCls}>Lugar de Nacimiento</label>
                                <input type="text" name="lugarNacimiento" value={formData.lugarNacimiento} onChange={handleChange} className={inputCls} />
                            </div>
                            <div className="space-y-1.5">
                                <label className={labelCls}>Dirección Residencia</label>
                                <input type="text" name="direccionResidencia" value={formData.direccionResidencia} onChange={handleChange} className={inputCls} />
                            </div>
                            <div className="space-y-1.5">
                                <label className={labelCls}>Fecha de Nacimiento</label>
                                <input type="date" name="fechaNacimiento" value={formData.fechaNacimiento} onChange={handleChange} className={inputCls} />
                            </div>
                            <div className="space-y-1.5">
                                <label className={labelCls + " flex items-center gap-1"}><Syringe className="w-3.5 h-3.5" /> Perfil Vacunación</label>
                                <select name="perfilVacunacion" value={formData.perfilVacunacion} onChange={handleChange} className={inputCls}>
                                    <option value="">Seleccionar...</option>
                                    <option value="Administrativo">Administrativo</option>
                                    <option value="Asistencial">Asistencial</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="h-px bg-slate-100" />

                    {/* ===== CONFIGURACIÓN DE ACCESO ===== */}
                    <div>
                        <h3 className="text-sm font-semibold text-blue-600 uppercase tracking-wider mb-4 flex items-center gap-2">
                            <Briefcase className="w-4 h-4" /> Configuración de Acceso
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="space-y-1.5">
                                <label className={labelCls}>Usuario (Cédula) *</label>
                                <input type="text" name="username" required value={formData.username} onChange={handleChange} className={inputCls} />
                            </div>
                            <div className="space-y-1.5">
                                <label className={labelCls}>Contraseña {!editData && '*'}</label>
                                <input type="password" name="password" required={!editData} value={formData.password} onChange={handleChange} className={inputCls} placeholder={editData ? "Dejar en blanco para mantener" : "********"} />
                            </div>
                            <div className="space-y-1.5">
                                <label className={labelCls}>Rol del Sistema *</label>
                                <select name="rol" required value={formData.rol} onChange={handleChange} className={inputCls}>
                                    <option value="">Seleccionar...</option>
                                    {ROLES.map(r => <option key={r.id} value={r.backendValue}>{r.nombre}</option>)}
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                {usaObjeto ? (
                                    <>
                                        <label className={labelCls}>
                                            Objeto {!editData && '*'}
                                            <span className="ml-2 text-xs font-normal px-1.5 py-0.5 bg-orange-100 text-orange-700 rounded-full">
                                                {formData.rol === 'HR_MANAGER' ? 'Trabajador' : 'Practicante'}
                                            </span>
                                        </label>
                                        <select name="objetoId" required={!editData} value={formData.objetoId} onChange={handleChange} className={inputCls}>
                                            <option value="">Seleccionar Objeto...</option>
                                            {objetos.map(o => <option key={o.id} value={o.id}>{o.nombre}</option>)}
                                        </select>
                                    </>
                                ) : (
                                    <>
                                        <label className={labelCls}>Cargo {!editData && '*'}</label>
                                        <select name="cargoId" required={!editData} value={formData.cargoId} onChange={handleChange} className={inputCls}>
                                            <option value="">Seleccionar Cargo...</option>
                                            {cargos.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                                        </select>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="h-px bg-slate-100" />

                    {/* ===== INFORMACIÓN LABORAL ===== */}
                    <div>
                        <h3 className="text-sm font-semibold text-blue-600 uppercase tracking-wider mb-4 flex items-center gap-2">
                            <Building2 className="w-4 h-4" /> Información Laboral y Salud
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            <div className="space-y-1.5">
                                <label className={labelCls}>ARL</label>
                                <select name="arl" value={formData.arl} onChange={handleChange} className={inputCls}>
                                    <option value="">Seleccione ARL...</option>
                                    {opcionesSelect.arl.map((op, i) => <option key={i} value={op}>{op}</option>)}
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label className={labelCls}>EPS</label>
                                <select name="eps" value={formData.eps} onChange={handleChange} className={inputCls}>
                                    <option value="">Seleccione EPS...</option>
                                    {opcionesSelect.eps.map((op, i) => <option key={i} value={op}>{op}</option>)}
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label className={labelCls}>AFP (Pensión)</label>
                                <select name="afp" value={formData.afp} onChange={handleChange} className={inputCls}>
                                    <option value="">Seleccione AFP...</option>
                                    {opcionesSelect.afp.map((op, i) => <option key={i} value={op}>{op}</option>)}
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label className={labelCls}>Caja de Compensación</label>
                                <select name="cajaCompensacion" value={formData.cajaCompensacion} onChange={handleChange} className={inputCls}>
                                    <option value="">Seleccione Caja...</option>
                                    {opcionesSelect.caja.map((op, i) => <option key={i} value={op}>{op}</option>)}
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label className={labelCls}>Fecha de Ingreso</label>
                                <input type="date" name="fechaIngreso" value={formData.fechaIngreso} onChange={handleChange} className={inputCls} />
                            </div>
                            <div className="space-y-1.5">
                                <label className={labelCls}>Tipo de Contrato</label>
                                <select name="tipoContrato" value={formData.tipoContrato} onChange={handleChange} className={inputCls}>
                                    <option value="">Seleccione Tipo...</option>
                                    {opcionesSelect.tipoContrato.map((op, i) => <option key={i} value={op}>{op}</option>)}
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label className={labelCls}>Sede</label>
                                <select name="sedeId" value={formData.sedeId} onChange={handleChange} className={inputCls}>
                                    <option value="">Seleccione Sede...</option>
                                    {sedes.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label className={labelCls}>Jefe Inmediato</label>
                                <select name="responsableEvaluacionId" value={formData.responsableEvaluacionId} onChange={handleChange} className={inputCls}>
                                    <option value="">Seleccione Jefe Inmediato...</option>
                                    {usuariosList
                                        .filter(u => u.id !== editData?.id)
                                        .map(u => (
                                            <option key={u.id} value={u.id}>
                                                {u.persona ? `${u.persona.primerNombre} ${u.persona.primerApellido}` : u.username}
                                            </option>
                                        ))
                                    }
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label className={labelCls}>Salario</label>
                                <input type="number" name="salario" value={formData.salario} onChange={handleChange} className={inputCls} placeholder="0.00" />
                            </div>
                            <div className="space-y-1.5">
                                <label className={labelCls}>Subsidio de Transporte</label>
                                <select name="subsidioTransporte" value={formData.subsidioTransporte} onChange={handleChange} className={inputCls}>
                                    <option value="">Seleccione...</option>
                                    <option value="Si">Sí</option>
                                    <option value="No">No</option>
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label className={labelCls}>Estado</label>
                                <select name="estado" value={formData.estado} onChange={handleChange} className={inputCls}>
                                    <option value="">Seleccione Estado...</option>
                                    {opcionesSelect.estado.map((op, i) => <option key={i} value={op}>{op}</option>)}
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label className={labelCls}>PESV</label>
                                <select name="pesvFecha" value={formData.pesvFecha} onChange={handleChange} className={inputCls}>
                                    <option value="">Seleccione...</option>
                                    {opcionesSelect.pesv.map((op, i) => <option key={i} value={op}>{op}</option>)}
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label className={labelCls}>Fecha de Retiro</label>
                                <input type="date" name="fechaRetiro" value={formData.fechaRetiro} onChange={handleChange} className={inputCls} />
                            </div>
                            <div className="space-y-1.5 md:col-span-2 xl:col-span-2">
                                <label className={labelCls}>Motivo de Retiro</label>
                                <input type="text" name="motivoRetiro" value={formData.motivoRetiro} onChange={handleChange} className={inputCls} placeholder="Describe el motivo de retiro..." />
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-all">Cancelar</button>
                        <button type="submit" disabled={loading} className="flex items-center gap-2 px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-all disabled:opacity-50">
                            <Save className="w-4 h-4" /> {loading ? 'Guardando...' : (editData ? 'Actualizar Usuario' : 'Guardar Usuario')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};