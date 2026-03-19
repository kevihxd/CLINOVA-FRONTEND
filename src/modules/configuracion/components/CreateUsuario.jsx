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
    const [formData, setFormData] = useState({
        tipo_documento: '', numero_documento: '', primer_nombre: '', segundo_nombre: '',
        primer_apellido: '', segundo_apellido: '', fecha_nacimiento: '', direccion_residencia: '',
        numero_telefono: '', lugar_nacimiento: '', correo_electronico: '', cedula: '', password: '', cargo: ''
    });

    useEffect(() => {
        if (editData) {
            setFormData({
                tipo_documento: editData.persona?.tipo_documento || '',
                numero_documento: editData.persona?.numero_documento || '',
                primer_nombre: editData.persona?.primer_nombre || '',
                segundo_nombre: editData.persona?.segundo_nombre || '',
                primer_apellido: editData.persona?.primer_apellido || '',
                segundo_apellido: editData.persona?.segundo_apellido || '',
                fecha_nacimiento: editData.persona?.fecha_nacimiento || '',
                direccion_residencia: editData.persona?.direccion_residencia || '',
                numero_telefono: editData.persona?.numero_telefono || '',
                lugar_nacimiento: editData.persona?.lugar_nacimiento || '',
                correo_electronico: editData.persona?.correo_electronico || '',
                cedula: editData.username || editData.cedula || '',
                password: '',
                cargo: editData.rol || editData.role || ''
            });
        } else {
            setFormData({
                tipo_documento: '', numero_documento: '', primer_nombre: '', segundo_nombre: '',
                primer_apellido: '', segundo_apellido: '', fecha_nacimiento: '', direccion_residencia: '',
                numero_telefono: '', lugar_nacimiento: '', correo_electronico: '', cedula: '', password: '', cargo: ''
            });
        }
    }, [editData, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const payload = {
                username: formData.cedula,
                password: formData.password,
                rol: formData.cargo,
                persona: {
                    tipo_documento: formData.tipo_documento,
                    numero_documento: formData.numero_documento,
                    primer_nombre: formData.primer_nombre,
                    segundo_nombre: formData.segundo_nombre,
                    primer_apellido: formData.primer_apellido,
                    segundo_apellido: formData.segundo_apellido,
                    fecha_nacimiento: formData.fecha_nacimiento,
                    direccion_residencia: formData.direccion_residencia,
                    numero_telefono: formData.numero_telefono,
                    lugar_nacimiento: formData.lugar_nacimiento,
                    correo_electronico: formData.correo_electronico
                }
            };

            if (editData && editData.id) {
                await UsuariosService.update(editData.id, payload);
                showAlert({ message: 'Usuario actualizado correctamente', status: 'success' });
            } else {
                await UsuariosService.create(payload);
                showAlert({ message: 'Usuario creado correctamente', status: 'success' });
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
                        <h2 className="text-lg font-semibold text-slate-900">{editData ? 'Editar Usuario' : 'Crear Nueva Persona / Usuario'}</h2>
                        <p className="text-sm text-slate-500">Complete la información personal y de acceso</p>
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
                                <div className="relative">
                                    <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <select name="tipo_documento" value={formData.tipo_documento} onChange={handleChange} className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm appearance-none bg-white">
                                        <option value="">Seleccionar...</option>
                                        {TIPOS_DOCUMENTO.map(tipo => <option key={tipo.id} value={tipo.id}>{tipo.sigla} - {tipo.nombre}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Número Documento</label>
                                <input type="number" name="numero_documento" value={formData.numero_documento} onChange={handleChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Fecha Nacimiento</label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input type="date" name="fecha_nacimiento" value={formData.fecha_nacimiento} onChange={handleChange} className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Correo Electrónico</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input type="email" name="correo_electronico" value={formData.correo_electronico} onChange={handleChange} className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Primer Nombre</label>
                                <input type="text" name="primer_nombre" value={formData.primer_nombre} onChange={handleChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Segundo Nombre</label>
                                <input type="text" name="segundo_nombre" value={formData.segundo_nombre} onChange={handleChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Primer Apellido</label>
                                <input type="text" name="primer_apellido" value={formData.primer_apellido} onChange={handleChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Segundo Apellido</label>
                                <input type="text" name="segundo_apellido" value={formData.segundo_apellido} onChange={handleChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm" />
                            </div>
                        </div>
                    </div>
                    <div className="h-px bg-slate-100 my-6" />
                    <div>
                        <h3 className="text-sm font-semibold text-blue-600 uppercase tracking-wider mb-4 flex items-center gap-2">
                            <Briefcase className="w-4 h-4" /> Información de Usuario / Cargo
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Cédula *</label>
                                <input type="text" name="cedula" required value={formData.cedula} onChange={handleChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Contraseña {!editData && '*'}</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input type="password" name="password" required={!editData} value={formData.password} onChange={handleChange} className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm" placeholder={editData ? "Dejar en blanco para mantener" : "********"} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Rol / Cargo *</label>
                                <div className="relative">
                                    <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <select name="cargo" required value={formData.cargo} onChange={handleChange} className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm appearance-none bg-white">
                                        <option value="">Seleccionar...</option>
                                        {ROLES.map(rol => <option key={rol.id} value={rol.backendValue}>{rol.nombre}</option>)}
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="pt-8 flex items-center justify-end gap-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:text-slate-900 transition-all">Cancelar</button>
                        <button type="submit" disabled={loading} className="flex items-center gap-2 px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-lg shadow-blue-500/30 transition-all disabled:opacity-50">
                            <Save className="w-4 h-4" /> {loading ? 'Guardando...' : (editData ? 'Actualizar Usuario' : 'Guardar Usuario')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};