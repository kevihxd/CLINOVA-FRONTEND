import React from 'react';
import { History, User, Clock } from 'lucide-react';

const COLOR_MAP = {
    CREACION:      'bg-blue-50 text-blue-700 border-blue-200',
    MODIFICACION:  'bg-amber-50 text-amber-700 border-amber-200',
    CAMBIO_ESTADO: 'bg-purple-50 text-purple-700 border-purple-200',
    COMENTARIO:    'bg-green-50 text-green-700 border-green-200',
    ELIMINACION:   'bg-red-50 text-red-700 border-red-200',
    VISUALIZACION: 'bg-sky-50 text-sky-700 border-sky-200',
    DESCARGA:      'bg-teal-50 text-teal-700 border-teal-200',
    APROBACION:    'bg-emerald-50 text-emerald-700 border-emerald-200',
    RECHAZO:       'bg-rose-50 text-rose-700 border-rose-200',
};

const LABEL_MAP = {
    CREACION:      'Creación',
    MODIFICACION:  'Modificación',
    CAMBIO_ESTADO: 'Cambio de estado',
    COMENTARIO:    'Comentario',
    ELIMINACION:   'Eliminación',
    VISUALIZACION: 'Visualización',
    DESCARGA:      'Descarga',
    APROBACION:    'Aprobación',
    RECHAZO:       'Rechazo',
};

export const TrazabilidadPanel = ({ logs = [], loading = false, titulo = 'Registro de Trazabilidad y Auditoría (ISO 9001)' }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-5 border-b border-gray-100 bg-gray-50 flex items-center gap-2">
            <History className="w-5 h-5 text-indigo-600 shrink-0" />
            <h2 className="font-bold text-gray-800 uppercase tracking-wider text-sm">{titulo}</h2>
        </div>

        <div className="p-6">
            {loading ? (
                <div className="flex items-center justify-center py-10 text-gray-400 gap-2">
                    <svg className="w-5 h-5 animate-spin text-indigo-500" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    <span className="text-sm">Cargando historial...</span>
                </div>
            ) : logs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-gray-400 gap-2">
                    <History className="w-10 h-10 text-gray-200" />
                    <p className="text-sm font-medium">No hay registros de trazabilidad disponibles.</p>
                    <p className="text-xs text-gray-300">Los cambios futuros quedarán registrados aquí.</p>
                </div>
            ) : (
                <div className="relative border-l-2 border-slate-200 ml-4 pl-6 space-y-6">
                    {logs.map((log, idx) => {
                        const badge = COLOR_MAP[log.accion] || 'bg-slate-100 text-slate-700 border-slate-200';
                        const label = LABEL_MAP[log.accion] || log.accion;
                        return (
                            <div key={log.id ?? idx} className="relative">
                                <span className="absolute -left-[31px] top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-white border-2 border-indigo-400 ring-4 ring-white" />
                                <div className="flex flex-col md:flex-row md:items-start justify-between gap-2">
                                    <div className="space-y-1 flex-1">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border tracking-wider ${badge}`}>
                                                {label}
                                            </span>
                                            <span className="text-sm font-semibold text-slate-700">{log.descripcion}</span>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                                            <span className="flex items-center gap-1">
                                                <User size={11} /> {log.usuario || 'Sistema'}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Clock size={11} />
                                                {log.fecha ? new Date(log.fecha).toLocaleString('es-CO') : '—'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    </div>
);
