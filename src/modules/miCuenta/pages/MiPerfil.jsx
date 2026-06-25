import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Phone, MapPin, Calendar, CreditCard, Building, Hash, Shield, ArrowLeft, Loader2 } from 'lucide-react';
import http from '../../../services/httpClient';

const Field = ({ icon: Icon, label, value }) => (
    <div className="flex flex-col p-4 bg-slate-50 border border-transparent rounded-2xl hover:border-slate-100 transition-all">
        <div className="flex items-center gap-2 mb-1.5">
            <Icon className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</span>
        </div>
        <p className="text-slate-700 font-medium text-sm truncate" title={value}>{value || 'No registro'}</p>
    </div>
);

const Section = ({ icon: Icon, title, children }) => (
    <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
        <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-50 rounded-lg"><Icon className="w-5 h-5 text-blue-600" /></div>
            <h3 className="text-lg font-bold text-slate-800">{title}</h3>
        </div>
        {children}
    </div>
);

const normalizar = (raw) => {
    if (!raw) return null;
    const p = raw.persona || {};
    return {
        id:                  raw.id,
        username:            raw.username,
        rol:                 raw.rol,
        cargoNombre:         raw.cargoNombre  || raw.cargo?.nombre || null,
        primerNombre:        raw.primerNombre        || p.primerNombre        || null,
        segundoNombre:       raw.segundoNombre       || p.segundoNombre       || null,
        primerApellido:      raw.primerApellido      || p.primerApellido      || null,
        segundoApellido:     raw.segundoApellido     || p.segundoApellido     || null,
        tipoDocumento:       raw.tipoDocumento       || p.tipoDocumento       || null,
        numeroDocumento:     raw.numeroDocumento     || p.numeroDocumento     || raw.username,
        fechaNacimiento:     raw.fechaNacimiento     || p.fechaNacimiento     || null,
        lugarNacimiento:     raw.lugarNacimiento     || p.lugarNacimiento     || null,
        direccionResidencia: raw.direccionResidencia || p.direccionResidencia || null,
        numeroTelefono:      raw.numeroTelefono      || p.numeroTelefono      || null,
        correoElectronico:   raw.correoElectronico   || p.correoElectronico   || null,
        sedeNombre:          raw.sedeNombre          || null,
        fechaIngreso:        raw.fechaIngreso        || null,
        fechaUltimaEdicion:  raw.fechaUltimaEdicion  || null,
        estado:              raw.estado              || null,
    };
};

export const MiPerfil = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [u, setU] = useState(null);

    useEffect(() => {
        http.get('/usuarios/me')
            .then(data => setU(normalizar(data)))
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    if (loading) return (
        <div className="min-h-screen bg-slate-50/50 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        </div>
    );

    const fullName = [u?.primerNombre, u?.primerApellido].filter(Boolean).join(' ') || u?.username || 'Sin nombre';
    const initials = `${(u?.primerNombre || u?.username || 'U')[0]}${(u?.primerApellido || 'C')[0]}`.toUpperCase();
    const email = u?.correoElectronico || (u?.username ? `${u.username}@clinova.com` : '');

    return (
        <div className="min-h-screen bg-slate-50/50 p-6 md:p-12">
            <div className="max-w-7xl mx-auto space-y-8">

                <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors w-fit group">
                    <div className="p-2 bg-white rounded-full border border-slate-200 shadow-sm group-hover:shadow-md transition-all">
                        <ArrowLeft className="w-4 h-4" />
                    </div>
                    <span className="font-medium text-sm">Regresar</span>
                </button>

                <div className="relative bg-white rounded-3xl p-8 shadow-sm border border-slate-100 overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                        <User className="w-32 h-32" />
                    </div>
                    <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start md:items-center">
                        <div className="h-24 w-24 rounded-full bg-gradient-to-tr from-blue-500 to-purple-600 p-[2px] shadow-lg shadow-blue-200 flex-shrink-0">
                            <div className="h-full w-full rounded-full bg-white flex items-center justify-center">
                                <span className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-tr from-blue-600 to-purple-600">
                                    {initials}
                                </span>
                            </div>
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-slate-800">{fullName}</h1>
                            <div className="flex flex-wrap items-center gap-2 mt-2">
                                {u?.rol && (
                                    <span className="px-3 py-1 bg-blue-50 text-blue-600 text-xs font-bold rounded-full border border-blue-100">{u.rol}</span>
                                )}
                                {u?.cargoNombre && (
                                    <span className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-semibold rounded-full">{u.cargoNombre}</span>
                                )}
                                {u?.estado && (
                                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${u.estado === 'ACTIVO' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'}`}>
                                        {u.estado}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                        <Section icon={User} title="Información Personal">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Field icon={User}       label="Primer Nombre"       value={u?.primerNombre} />
                                <Field icon={User}       label="Segundo Nombre"      value={u?.segundoNombre} />
                                <Field icon={User}       label="Primer Apellido"     value={u?.primerApellido} />
                                <Field icon={User}       label="Segundo Apellido"    value={u?.segundoApellido} />
                                <Field icon={CreditCard} label="Tipo de Documento"   value={u?.tipoDocumento} />
                                <Field icon={Hash}       label="Número de Documento" value={u?.numeroDocumento} />
                                <Field icon={Calendar}   label="Fecha de Nacimiento" value={u?.fechaNacimiento} />
                                <Field icon={Building}   label="Lugar de Nacimiento" value={u?.lugarNacimiento} />
                            </div>
                        </Section>

                        <Section icon={MapPin} title="Datos de Contacto">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="md:col-span-2">
                                    <Field icon={MapPin} label="Dirección de Residencia" value={u?.direccionResidencia} />
                                </div>
                                <Field icon={Phone} label="Teléfono / Celular"  value={u?.numeroTelefono} />
                                <Field icon={Mail}  label="Correo Electrónico"  value={email} />
                            </div>
                        </Section>
                    </div>

                    <div>
                        <Section icon={Shield} title="Información de Cuenta">
                            <div className="space-y-4">
                                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Nombre de Usuario</span>
                                    <div className="flex items-center justify-between">
                                        <span className="text-slate-800 font-bold">{u?.username}</span>
                                        <div className="h-2 w-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                                    </div>
                                </div>

                                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">ID de Usuario</span>
                                    <span className="text-slate-600 font-mono text-sm">#{u?.id ? `U-${u.id}` : '—'}</span>
                                </div>

                                {u?.sedeNombre && (
                                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Sede</span>
                                        <span className="text-slate-700 font-semibold text-sm">{u.sedeNombre}</span>
                                    </div>
                                )}

                                <div className="pt-4 border-t border-slate-100 space-y-3">
                                    {[
                                        { label: 'Fecha Ingreso',       value: u?.fechaIngreso },
                                        { label: 'Última Modificación', value: u?.fechaUltimaEdicion },
                                    ].map(({ label, value }) => (
                                        <div key={label} className="flex items-center justify-between text-xs text-slate-500">
                                            <span>{label}</span>
                                            <span className="font-medium text-slate-700">{value || '—'}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </Section>
                    </div>
                </div>
            </div>
        </div>
    );
};