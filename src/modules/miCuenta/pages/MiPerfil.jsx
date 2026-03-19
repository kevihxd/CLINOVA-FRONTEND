import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Phone, MapPin, Calendar, CreditCard, Building, Hash, Shield, Edit2, ArrowLeft, Save, X, Check } from 'lucide-react';
import { useAuth } from '../../../providers/AuthProvider';


const EditableCard = ({ icon: Icon, label, value, name, nestedName, type = "text", fullWidth = false, editable = true, isEditing, onChange }) => (
    <div className={`flex flex-col p-4 bg-slate-50 border transition-all duration-300 rounded-2xl ${isEditing && editable
            ? 'bg-white border-blue-200 shadow-md ring-2 ring-blue-50/50'
            : 'border-transparent hover:border-slate-100'
        } ${fullWidth ? 'md:col-span-2' : ''}`}>

        <div className="flex items-center gap-2 mb-2">
            <Icon className={`w-4 h-4 ${isEditing && editable ? 'text-blue-600' : 'text-blue-500'}`} />
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</span>
        </div>

        {isEditing && editable ? (
            <input
                type={type}
                value={value}
                onChange={(e) => onChange(e, name, nestedName)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
            />
        ) : (
            <p className="text-slate-700 font-medium truncate" title={value}>
                {value || 'No registro'}
            </p>
        )}
    </div>
);

const SectionTitle = ({ title, icon: Icon }) => (
    <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-blue-50 rounded-lg">
            <Icon className="w-5 h-5 text-blue-600" />
        </div>
        <h3 className="text-lg font-bold text-slate-800">{title}</h3>
    </div>
);

export const MiPerfil = () => {
    const navigate = useNavigate();
    const { user } = useAuth(); 
    const [isEditing, setIsEditing] = useState(false);

    const [formData, setFormData] = useState({
        username: user?.sub || "Usuario",
        role: user?.roles?.[0] || "Personal",
        lastActive: "Activo ahora",
        persona: {
            tipo_documento: "",
            numero_documento: user?.sub || "", 
            primer_nombre: "Usuario", 
            segundo_nombre: "",
            primer_apellido: "Clinova",
            segundo_apellido: "",
            fecha_nacimiento: "",
            lugar_nacimiento: "",
            direccion_residencia: "",
            numero_telefono: "",
            fecha_creacion: "",
            fecha_modificacion: ""
        }
    });

    const handleChange = (e, field, nestedField = null) => {
        const { value } = e.target;
        if (nestedField) {
            setFormData(prev => ({
                ...prev, [field]: { ...prev[field], [nestedField]: value }
            }));
        } else {
            setFormData(prev => ({ ...prev, [field]: value }));
        }
    };

    const handleSave = () => {
        setIsEditing(false);
        console.log("Guardando datos:", formData);
    };

    const handleCancel = () => {
        setIsEditing(false);
    };

    return (
        <div className="min-h-screen bg-slate-50/50 p-6 md:p-12 animate-fade-in">
            <div className="max-w-7xl mx-auto space-y-8">

                {/* Header Back & Actions */}
                <div className="flex flex-col md:flex-row gap-4 justify-between md:items-center">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors w-fit group"
                    >
                        <div className="p-2 bg-white rounded-full border border-slate-200 shadow-sm group-hover:shadow-md transition-all">
                            <ArrowLeft className="w-4 h-4" />
                        </div>
                        <span className="font-medium text-sm">Regresar</span>
                    </button>

                    <div className="flex gap-3 self-end md:self-auto">
                        {isEditing ? (
                            <>
                                <button
                                    onClick={handleCancel}
                                    className="flex items-center gap-2 px-4 py-2 bg-white text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition-all font-medium text-sm"
                                >
                                    <X className="w-4 h-4" />
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleSave}
                                    className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200 hover:shadow-xl hover:shadow-blue-300 transition-all font-medium text-sm"
                                >
                                    <Check className="w-4 h-4" />
                                    Guardar Cambios
                                </button>
                            </>
                        ) : (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl transition-all duration-300 shadow-lg shadow-slate-200 hover:shadow-xl active:scale-95"
                            >
                                <Edit2 className="w-4 h-4" />
                                <span className="text-sm font-medium">Editar Perfil</span>
                            </button>
                        )}
                    </div>
                </div>

                {/* Main Profile Card */}
                <div className="relative bg-white rounded-3xl p-8 shadow-sm border border-slate-100 overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-20">
                        <User className="w-25 h-25" />
                    </div>

                    <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start md:items-center">
                        <div className="h-24 w-24 rounded-full bg-gradient-to-tr from-blue-500 to-purple-600 p-[2px] shadow-lg shadow-blue-200 flex-shrink-0">
                            <div className="h-full w-full rounded-full bg-white flex items-center justify-center overflow-hidden">
                                <span className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-tr from-blue-600 to-purple-600">
                                    {formData.persona.primer_nombre[0]}{formData.persona.primer_apellido[0]}
                                </span>
                            </div>
                        </div>

                        <div className="flex-1 space-y-1">
                            {isEditing ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-xl">
                                    <input
                                        value={formData.persona.primer_nombre}
                                        onChange={(e) => handleChange(e, 'persona', 'primer_nombre')}
                                        placeholder="Primer Nombre"
                                        className="text-2xl font-bold text-slate-800 border-b-2 border-slate-200 focus:border-blue-500 outline-none bg-transparent placeholder:text-slate-300"
                                    />
                                    <input
                                        value={formData.persona.primer_apellido}
                                        onChange={(e) => handleChange(e, 'persona', 'primer_apellido')}
                                        placeholder="Primer Apellido"
                                        className="text-2xl font-bold text-slate-800 border-b-2 border-slate-200 focus:border-blue-500 outline-none bg-transparent placeholder:text-slate-300"
                                    />
                                </div>
                            ) : (
                                <h1 className="text-3xl font-bold text-slate-800">
                                    {formData.persona.primer_nombre} {formData.persona.primer_apellido}
                                </h1>
                            )}

                            <div className="flex items-center gap-3 mt-2">
                                <span className="px-3 py-1 bg-blue-50 text-blue-600 text-xs font-bold rounded-full border border-blue-100">
                                    {formData.role}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column - Main Info */}
                    <div className="lg:col-span-2 space-y-8">

                        {/* Personal Information */}
                        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
                            <SectionTitle title="Información Personal" icon={User} />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <EditableCard
                                    icon={User}
                                    label="Primer Nombre"
                                    value={formData.persona.primer_nombre}
                                    name="persona"
                                    nestedName="primer_nombre"
                                    isEditing={isEditing}
                                    onChange={handleChange}
                                />
                                <EditableCard
                                    icon={User}
                                    label="Segundo Nombre"
                                    value={formData.persona.segundo_nombre}
                                    name="persona"
                                    nestedName="segundo_nombre"
                                    isEditing={isEditing}
                                    onChange={handleChange}
                                />
                                <EditableCard
                                    icon={User}
                                    label="Primer Apellido"
                                    value={formData.persona.primer_apellido}
                                    name="persona"
                                    nestedName="primer_apellido"
                                    isEditing={isEditing}
                                    onChange={handleChange}
                                />
                                <EditableCard
                                    icon={User}
                                    label="Segundo Apellido"
                                    value={formData.persona.segundo_apellido}
                                    name="persona"
                                    nestedName="segundo_apellido"
                                    isEditing={isEditing}
                                    onChange={handleChange}
                                />
                                <EditableCard
                                    icon={CreditCard}
                                    label="Tipo de Documento"
                                    value={formData.persona.tipo_documento}
                                    name="persona"
                                    nestedName="tipo_documento"
                                    isEditing={isEditing}
                                    onChange={handleChange}
                                />
                                <EditableCard
                                    icon={Hash}
                                    label="Número de Documento"
                                    value={formData.persona.numero_documento}
                                    name="persona"
                                    nestedName="numero_documento"
                                    isEditing={isEditing}
                                    onChange={handleChange}
                                />
                                <EditableCard
                                    icon={Calendar}
                                    label="Fecha de Nacimiento"
                                    type="date"
                                    value={formData.persona.fecha_nacimiento}
                                    name="persona"
                                    nestedName="fecha_nacimiento"
                                    isEditing={isEditing}
                                    onChange={handleChange}
                                />
                                <EditableCard
                                    icon={Building}
                                    label="Lugar de Nacimiento"
                                    value={formData.persona.lugar_nacimiento}
                                    name="persona"
                                    nestedName="lugar_nacimiento"
                                    isEditing={isEditing}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        {/* Contact Information */}
                        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
                            <SectionTitle title="Datos de Contacto" icon={MapPin} />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <EditableCard
                                    icon={MapPin}
                                    label="Dirección de Residencia"
                                    value={formData.persona.direccion_residencia}
                                    name="persona"
                                    nestedName="direccion_residencia"
                                    fullWidth
                                    isEditing={isEditing}
                                    onChange={handleChange}
                                />
                                <EditableCard
                                    icon={Phone}
                                    label="Teléfono / Celular"
                                    value={formData.persona.numero_telefono}
                                    name="persona"
                                    nestedName="numero_telefono"
                                    isEditing={isEditing}
                                    onChange={handleChange}
                                />
                                <EditableCard
                                    icon={Mail}
                                    label="Correo Electrónico"
                                    value={`${formData.username}@clinova.com`}
                                    editable={false}
                                    isEditing={isEditing}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                    </div>

                    {/* Right Column - Secondary Info */}
                    <div className="space-y-8">
                        {/* Account Details */}
                        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 h-full">
                            <SectionTitle title="Información de Cuenta" icon={Shield} />

                            <div className="space-y-4">
                                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">Nombre de Usuario</span>
                                    <div className="flex items-center justify-between">
                                        <span className="text-slate-800 font-bold">{formData.username}</span>
                                        <div className="h-2 w-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]"></div>
                                    </div>
                                </div>

                                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">ID de Usuario</span>
                                    <span className="text-slate-600 font-mono text-sm">#U-2024-892</span>
                                </div>

                                <div className="pt-4 border-t border-slate-100 space-y-3">
                                    <div className="flex items-center justify-between text-xs text-slate-500">
                                        <span>Última Modificación</span>
                                        <span className="font-medium">{formData.persona.fecha_modificacion || '-'}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-xs text-slate-500">
                                        <span>Fecha Creación</span>
                                        <span className="font-medium">{formData.persona.fecha_creacion || '-'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};