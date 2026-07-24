import React from 'react';
import { History, User, Clock, GitBranch } from 'lucide-react';

const COLOR_MAP = {
    CREACION:         'bg-blue-50 text-blue-700 border-blue-200',
    CREACION_VERSION: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    MODIFICACION:     'bg-amber-50 text-amber-700 border-amber-200',
    CAMBIO_ESTADO:    'bg-purple-50 text-purple-700 border-purple-200',
    COMENTARIO:       'bg-green-50 text-green-700 border-green-200',
    ELIMINACION:      'bg-red-50 text-red-700 border-red-200',
    VISUALIZACION:    'bg-sky-50 text-sky-700 border-sky-200',
    DESCARGA:         'bg-teal-50 text-teal-700 border-teal-200',
    APROBACION:       'bg-emerald-50 text-emerald-700 border-emerald-200',
    RECHAZO:          'bg-rose-50 text-rose-700 border-rose-200',
};

const LABEL_MAP = {
    CREACION:         'Creación',
    CREACION_VERSION: 'Nueva Versión',
    MODIFICACION:     'Modificación',
    CAMBIO_ESTADO:    'Cambio de estado',
    COMENTARIO:       'Comentario',
    ELIMINACION:      'Eliminación',
    VISUALIZACION:    'Visualización',
    DESCARGA:         'Descarga',
    APROBACION:       'Aprobación',
    RECHAZO:          'Rechazo',
};

const DOT_COLOR = {
    CREACION:         'border-blue-400',
    CREACION_VERSION: 'border-indigo-400',
    MODIFICACION:     'border-amber-400',
    CAMBIO_ESTADO:    'border-purple-400',
    COMENTARIO:       'border-green-400',
    ELIMINACION:      'border-red-400',
    VISUALIZACION:    'border-sky-400',
    DESCARGA:         'border-teal-400',
    APROBACION:       'border-emerald-500',
    RECHAZO:          'border-rose-400',
};

const formatFecha = (fecha) => {
    if (!fecha) return '—';
    try {
        return new Date(fecha).toLocaleString('es-CO', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    } catch { return String(fecha); }
};

export const TrazabilidadPanel = ({
    logs = [],
    loading = false,
    titulo = 'Registro de Trazabilidad y Auditoría (ISO 9001)',
    controlCambios = []
}) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-gray-100 bg-gradient-to-r from-slate-50 to-indigo-50 flex items-center gap-3">
            <History className="w-6 h-6 text-indigo-600 shrink-0" />
            <h2 className="font-bold text-gray-800 uppercase tracking-wide text-base">{titulo}</h2>
        </div>

        <div className="p-6 space-y-8">

            {/* ── Control de Cambios (versiones históricas) ── */}
            {controlCambios.length > 0 && (
                <div>
                    <div className="border-b-2 border-orange-500 pb-1 mb-3 flex items-center gap-2">
                        <GitBranch className="w-4 h-4 text-orange-600" />
                        <h3 className="font-bold text-orange-600 text-sm uppercase tracking-wide">Control de Cambios</h3>
                    </div>
                    <div className="overflow-x-auto border border-slate-300 rounded shadow-sm mb-6">
                        <table className="w-full text-left border-collapse text-xs bg-white">
                            <thead>
                                <tr className="bg-slate-200 border-b border-slate-300 text-slate-800 font-bold text-center">
                                    <th className="px-4 py-2 border-r border-slate-300 w-24">Versión</th>
                                    <th className="px-4 py-2 border-r border-slate-300 w-36">Fecha</th>
                                    <th className="px-4 py-2 border-r border-slate-300 text-left">Usuario</th>
                                    <th className="px-4 py-2 text-left">Comentario</th>
                                </tr>
                            </thead>
                            <tbody>
                                {controlCambios.map((cc, idx) => (
                                    <tr key={idx} className="border-b border-slate-200 last:border-0 hover:bg-slate-50 text-slate-700">
                                        <td className="px-4 py-2.5 border-r border-slate-200 text-center font-bold text-xs">{cc.version || '1'}</td>
                                        <td className="px-4 py-2.5 border-r border-slate-200 text-center whitespace-nowrap">{formatFecha(cc.fecha)}</td>
                                        <td className="px-4 py-2.5 border-r border-slate-200 font-medium">{cc.usuario || cc.responsable || 'Carlos Humberto Barrera Rozo'}</td>
                                        <td className="px-4 py-2.5 leading-relaxed">{cc.descripcion || cc.cambio || 'Actualización de documento'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* ── Historial de Acciones ── */}
            <div>
                {controlCambios.length > 0 && (
                    <div className="flex items-center gap-2 mb-4">
                        <History className="w-5 h-5 text-slate-500" />
                        <h3 className="font-bold text-slate-700 text-base uppercase tracking-wide">Historial de Acciones</h3>
                    </div>
                )}

                {loading ? (
                    <div className="flex items-center justify-center py-12 text-gray-400 gap-3">
                        <svg className="w-6 h-6 animate-spin text-indigo-500" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                        </svg>
                        <span className="text-base font-medium">Cargando historial...</span>
                    </div>
                ) : logs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-gray-400 gap-3">
                        <History className="w-12 h-12 text-gray-200" />
                        <p className="text-base font-medium">No hay registros de trazabilidad disponibles.</p>
                        <p className="text-sm text-gray-300">Los cambios futuros quedarán registrados aquí.</p>
                    </div>
                ) : (
                    <div className="relative border-l-2 border-slate-200 ml-4 pl-8 space-y-8">
                        {logs.map((log, idx) => {
                            const badge  = COLOR_MAP[log.accion]  || 'bg-slate-100 text-slate-700 border-slate-200';
                            const label  = LABEL_MAP[log.accion]  || log.accion;
                            const dotClr = DOT_COLOR[log.accion]  || 'border-indigo-400';
                            return (
                                <div key={log.id ?? idx} className="relative">
                                    {/* Timeline dot */}
                                    <span className={`absolute -left-[37px] top-2 flex h-5 w-5 items-center justify-center rounded-full bg-white border-2 ${dotClr} ring-4 ring-white shadow-sm`} />

                                    <div className="bg-slate-50 rounded-lg border border-slate-200 p-4 hover:border-indigo-200 transition-colors">
                                        {/* Badge + descripción */}
                                        <div className="flex flex-wrap items-center gap-2 mb-2">
                                            <span className={`text-xs font-extrabold uppercase px-2.5 py-1 rounded-full border tracking-wider ${badge}`}>
                                                {label}
                                            </span>
                                            <span className="text-base font-semibold text-slate-800">{log.descripcion}</span>
                                        </div>

                                        {/* Meta: usuario + fecha */}
                                        <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
                                            <span className="flex items-center gap-1.5">
                                                <User size={14} className="text-slate-400" />
                                                <span className="font-medium">{log.usuario || 'Sistema'}</span>
                                            </span>
                                            <span className="flex items-center gap-1.5">
                                                <Clock size={14} className="text-slate-400" />
                                                {formatFecha(log.fecha)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    </div>
);
