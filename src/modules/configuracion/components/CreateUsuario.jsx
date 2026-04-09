import { X, Save, User, FileText, Calendar, Mail, Phone, MapPin, Lock, Briefcase } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAlert } from '../../../providers/AlertProvider';
import { UsuariosService } from '../services/usuarios.service';

const TIPOS_DOCUMENTO = [
    { id: 1, nombre: 'Cédula de Ciudadanía', sigla: 'CC' },
    { id: 2, nombre: 'Tarjeta de Identidad', sigla: 'TI' },
    { id: 3, nombre: 'Cédula de Extranjería', sigla: 'CE' },
    { id: 4, nombre: 'Pasaporte', sigla: 'PA' },
];

const ROLES = [
    { id: 1, nombre: 'Administrador', backendValue: 'ADMIN' },
    { id: 2, nombre: 'Funcionario', backendValue: 'HR_MANAGER' },
    { id: 3, nombre: 'Contratista', backendValue: 'USER' },
];

export const CreateUsuario = ({ isOpen, onClose, onSaved, editData }) => {
    const { showAlert } = useAlert();
    const [loading, setLoading] = useState(false);
    const [cargos, setCargos] = useState([]);
    const [formData, setFormData] = useState({
        tipoDocumento: '', numeroDocumento: '', primerNombre: '', segundoNombre: '',
        primerApellido: '', segundoApellido: '', fechaNacimiento: '', direccionResidencia: '',
        numeroTelefono: '', lugarNacimiento: '', correoElectronico: '', username: '', password: '', rol: '', cargoId: ''
    });

    useEffect(() => {
        // Cargar cargos para el select
        const fetchCargos = async () => {
            try {
                const res = await fetch('http://localhost:8080/api/cargos', {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                });
                if (res.ok) setCargos(await res.json());
            } catch (error) {
                console.error(error);
            }
        };
        if (isOpen) fetchCargos();
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
                username: editData.username || '',
                password: '',
                rol: editData.rol || '',
                cargoId: editData.cargo?.id || ''
            });
        } else {
            setFormData({
                tipoDocumento: '', numeroDocumento: '', primerNombre: '', segundoNombre: '',
                primerApellido: '', segundoApellido: '', fechaNacimiento: '', direccionResidencia: '',
                numeroTelefono: '', lugarNacimiento: '', correoElectronico: '', username: '', password: '', rol: 'USER', cargoId: ''
            });
        }
    }, [editData, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (editData && editData.id) {
                // Para el PUT enviamos el objeto Usuario completo mapeado
                const updatePayload = {
                    username: formData.username,
                    password: formData.password,
                    rol: formData.rol,
                    persona: {
                        tipoDocumento: formData.tipoDocumento,
                        numeroDocumento: formData.numeroDocumento,
                        primerNombre: formData.primerNombre,
                        segundoNombre: formData.segundoNombre,
                        primerApellido: formData.primerApellido,
                        segundoApellido: formData.segundoApellido,
                        fechaNacimiento: formData.fechaNacimiento,
                        direccionResidencia: formData.direccionResidencia,
                        numeroTelefono: formData.numeroTelefono,
                        lugarNacimiento: formData.lugarNacimiento,
                        correoElectronico: formData.correoElectronico
                    }
                };
                await UsuariosService.update(editData.id, updatePayload);
                showAlert({ message: 'Usuario actualizado correctamente', status: 'success' });
            } else {
                // Para el POST usamos el UsuarioRequestDTO
                const createPayload = {
                    username: formData.username,
                    password: formData.password,
                    rol: formData.rol,
                    cargoId: formData.cargoId,
                    nombres: formData.primerNombre,
                    apellidos: formData.primerApellido,
                    correo: formData.correoElectronico
                };
                await UsuariosService.create(createPayload);
                showAlert({ message: 'Usuario creado correctamente. Para más detalles, edite el usuario.', status: 'success' });
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
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in overflow-y-auto">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl overflow-hidden animate-scale-in my-8">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-900">{editData ? 'Editar Usuario' : 'Crear Nuevo Usuario'}</h2>
                    </div>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-all">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6">
                    <div className="mb-8">
                        <h3 className="text-sm font-semibold text-blue-600 uppercase tracking-wider mb-4 flex items-center gap-2">
                            <User className="w-4 h-4" /> Información Personal
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Tipo Documento</label>
                                <select name="tipoDocumento" value={formData.tipoDocumento} onChange={handleChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white">
                                    <option value="">Seleccionar...</option>
                                    {TIPOS_DOCUMENTO.map(tipo => <option key={tipo.id} value={tipo.id}>{tipo.sigla} - {tipo.nombre}</option>)}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Número Documento</label>
                                <input type="text" name="numeroDocumento" value={formData.numeroDocumento} onChange={handleChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Primer Nombre *</label>
                                <input type="text" name="primerNombre" required value={formData.primerNombre} onChange={handleChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Segundo Nombre</label>
                                <input type="text" name="segundoNombre" value={formData.segundoNombre} onChange={handleChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Primer Apellido *</label>
                                <input type="text" name="primerApellido" required value={formData.primerApellido} onChange={handleChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Segundo Apellido</label>
                                <input type="text" name="segundoApellido" value={formData.segundoApellido} onChange={handleChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Correo Electrónico *</label>
                                <input type="email" name="correoElectronico" required value={formData.correoElectronico} onChange={handleChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Teléfono</label>
                                <input type="text" name="numeroTelefono" value={formData.numeroTelefono} onChange={handleChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" />
                            </div>
                        </div>
                    </div>
                    
                    <div className="h-px bg-slate-100 my-6" />
                    
                    <div>
                        <h3 className="text-sm font-semibold text-blue-600 uppercase tracking-wider mb-4 flex items-center gap-2">
                            <Briefcase className="w-4 h-4" /> Configuración de Acceso
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Usuario (Cédula) *</label>
                                <input type="text" name="username" required value={formData.username} onChange={handleChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Contraseña {!editData && '*'}</label>
                                <input type="password" name="password" required={!editData} value={formData.password} onChange={handleChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" placeholder={editData ? "Dejar en blanco para mantener" : "********"} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Rol del Sistema *</label>
                                <select name="rol" required value={formData.rol} onChange={handleChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white">
                                    <option value="">Seleccionar...</option>
                                    {ROLES.map(r => <option key={r.id} value={r.backendValue}>{r.nombre}</option>)}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Cargo de Empleado {!editData && '*'}</label>
                                <select name="cargoId" required={!editData} value={formData.cargoId} onChange={handleChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white">
                                    <option value="">Seleccionar Cargo...</option>
                                    {cargos.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>
                    <div className="pt-8 flex items-center justify-end gap-3">
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