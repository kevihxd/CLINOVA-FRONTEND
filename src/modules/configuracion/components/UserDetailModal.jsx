import { X, User, Phone, MapPin, Mail, Calendar, Briefcase, Hash, Info, Fingerprint } from 'lucide-react';
import { useMemo } from 'react';

const DetailItem = ({ icon: Icon, label, value, className = "" }) => (
    <div className={`flex flex-col gap-1 p-3 rounded-lg bg-slate-50 border border-slate-100 ${className}`}>
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            {Icon && <Icon className="w-3.5 h-3.5" />}
            <span>{label}</span>
        </div>
        <div className="text-sm font-medium text-slate-900 break-words">
            {value || <span className="text-slate-400 italic">No registrado</span>}
        </div>
    </div>
);

const SectionHeader = ({ icon: Icon, title }) => (
    <h3 className="text-sm font-bold text-blue-600 uppercase tracking-wider mb-4 flex items-center gap-2 pb-2 border-b border-slate-100">
        <Icon className="w-4 h-4" />
        {title}
    </h3>
);

// Helper to map document types used elsewhere
const TIPO_DOC_MAP = {
    1: 'Cédula de Ciudadanía',
    2: 'Tarjeta de Identidad',
    3: 'Cédula de Extranjería',
    4: 'Pasaporte'
};

export const UserDetailModal = ({ isOpen, onClose, user }) => {
    if (!isOpen || !user) return null;

    const persona = user.persona || {};

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden animate-scale-in max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-lg border-2 border-white shadow-sm">
                            {persona.primer_nombre?.[0]}{persona.primer_apellido?.[0]}
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-800">Detalles del Usuario</h2>
                            <p className="text-sm text-slate-500 font-medium">Información completa del registro</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-full transition-all duration-200"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Body - Scrollable */}
                <div className="p-8 overflow-y-auto custom-scrollbar bg-white">

                    {/* Sección 1: Información Personal */}
                    <div className="mb-8">
                        <SectionHeader icon={User} title="Información Personal" />

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <DetailItem
                                icon={Info}
                                label="Nombre Completo"
                                value={`${persona.primer_nombre} ${persona.segundo_nombre || ''} ${persona.primer_apellido} ${persona.segundo_apellido || ''}`}
                                className="md:col-span-2 lg:col-span-3 bg-blue-50/50 border-blue-100"
                            />
                            <DetailItem
                                icon={Fingerprint}
                                label="Tipo Documento"
                                value={TIPO_DOC_MAP[persona.tipo_documento] || persona.tipo_documento}
                            />
                            <DetailItem
                                icon={Hash}
                                label="No. Documento"
                                value={persona.numero_documento}
                            />
                            <DetailItem
                                icon={Calendar}
                                label="Fecha Nacimiento"
                                value={persona.fecha_nacimiento}
                            />
                            <DetailItem
                                icon={MapPin}
                                label="Lugar Nacimiento"
                                value={persona.lugar_nacimiento}
                            />
                        </div>
                    </div>

                    {/* Sección 2: Contacto */}
                    <div className="mb-8">
                        <SectionHeader icon={Phone} title="Datos de Contacto" />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <DetailItem
                                icon={Mail}
                                label="Correo Electrónico"
                                value={persona.correo_electronico}
                            />
                            <DetailItem
                                icon={Phone}
                                label="Número de Teléfono"
                                value={persona.numero_telefono}
                            />
                            <DetailItem
                                icon={MapPin}
                                label="Dirección Residencia"
                                value={persona.direccion_residencia}
                                className="md:col-span-2"
                            />
                        </div>
                    </div>

                    {/* Sección 3: Cuenta de Usuario */}
                    <div>
                        <SectionHeader icon={Briefcase} title="Información de Cuenta" />

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <DetailItem
                                icon={Fingerprint}
                                label="Usuario / Cédula"
                                value={user.cedula}
                            />
                            <DetailItem
                                icon={Briefcase}
                                label="Rol Asignado"
                                value={user.role}
                                className={
                                    user.role === 'Administrador' ? 'text-purple-700 bg-purple-50 border-purple-100' :
                                        user.role === 'Funcionario' ? 'text-emerald-700 bg-emerald-50 border-emerald-100' :
                                            ''
                                }
                            />
                            <DetailItem
                                icon={Calendar}
                                label="Fecha Creación"
                                value={user.fecha_creacion?.split('T')[0] || user.persona?.fecha_creacion}
                            />
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end shrink-0">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 shadow-sm transition-all font-medium text-sm"
                    >
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
};
