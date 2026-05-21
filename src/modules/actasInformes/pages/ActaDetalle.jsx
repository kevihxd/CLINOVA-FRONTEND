import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft, Send, MessageSquare, Printer, History, User, Clock, Edit,
    MapPin, Link, Calendar, Tag, FileCheck, Users, Briefcase, Lock
} from 'lucide-react';
import http from '../../../services/httpClient';
import { useAlert } from '../../../providers/AlertProvider';
import { useAuth } from '../../../providers/AuthProvider';
import { TrazabilidadPanel } from '../../../components/TrazabilidadPanel';

const PRINT_STYLES = `
@media print {
    body > * { display: none !important; }
    #acta-print-area,
    #acta-print-area * { display: revert !important; visibility: visible !important; }
    #acta-print-area {
        position: fixed !important;
        inset: 0 !important;
        width: 100% !important;
        margin: 0 !important;
        padding: 0 !important;
        background: #fff !important;
        z-index: 99999 !important;
        font-family: Arial, Helvetica, sans-serif !important;
        font-size: 9pt !important;
        color: #111 !important;
    }
    .no-print { display: none !important; }
    @page { size: letter portrait; margin: 1.2cm 1.8cm; }
}
`;

const ORANGE = '#c75b00';
const ORANGE_BG = '#f5e6d8';

const SectionHeader = ({ label }) => (
    <div style={{
        backgroundColor: ORANGE_BG,
        borderTop: `2px solid ${ORANGE}`,
        borderBottom: `2px solid ${ORANGE}`,
        padding: '3pt 8pt',
        fontWeight: 'bold',
        fontSize: '8pt',
        textTransform: 'uppercase',
        color: ORANGE,
        letterSpacing: '0.8pt',
        marginBottom: '8pt',
        marginTop: '12pt',
    }}>
        {label}
    </div>
);

const Row = ({ label, value }) => (
    <div style={{ display: 'flex', gap: '4pt', marginBottom: '3pt', fontSize: '8.5pt' }}>
        <span style={{ fontWeight: 'bold', minWidth: '130pt', flexShrink: 0, color: '#444' }}>{label}:</span>
        <span style={{ color: '#111' }}>{value || '—'}</span>
    </div>
);

const formatFecha = (f) => {
    if (!f) return '—';
    const m = f.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (m) {
        const meses = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
        return `${parseInt(m[3])} de ${meses[parseInt(m[2])-1]} de ${m[1]}`;
    }
    return f;
};

const normalizeText = (t) => {
    if (!t) return '';
    return String(t).normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toUpperCase();
};

const getActaEstadoStyle = (estado) => {
    if (!estado) return 'bg-slate-100 text-slate-600 border-slate-200';
    const n = normalizeText(estado);
    if (n.includes('BORRADOR')) return 'bg-amber-100 text-amber-700 border-amber-200';
    if (n.includes('PUBLICADA') || n.includes('PUBLICADO')) return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    if (n.includes('ARCHIVADA') || n.includes('ARCHIVADO')) return 'bg-slate-100 text-slate-600 border-slate-200';
    return 'bg-blue-100 text-blue-700 border-blue-200';
};

const PrintableActa = ({ acta }) => {
    if (!acta) return null;

    const esBorrador = normalizeText(acta.estado).includes('BORRADOR');
    const now = new Date();
    const fechaHoraImpresion = now.toLocaleDateString('es-CO', { day:'2-digit', month:'2-digit', year:'numeric' }) + ', ' + now.toLocaleTimeString('es-CO', { hour:'2-digit', minute:'2-digit' });

    const fechaInicio = acta.fechaInicio
        ? `${formatFecha(acta.fechaInicio)}${acta.horaInicio ? ' ' + acta.horaInicio : ''}`
        : formatFecha(acta.fecha);
    const fechaFin = acta.fechaFin
        ? `${formatFecha(acta.fechaFin)}${acta.horaFin ? ' ' + acta.horaFin : ''}`
        : '—';

    return (
        <div id="acta-print-area" style={{ display: 'none', position: 'relative' }}>
            {esBorrador && (
                <div style={{
                    position: 'fixed',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%) rotate(-35deg)',
                    fontSize: '90pt',
                    fontWeight: 'bold',
                    color: 'rgba(180,0,0,0.07)',
                    letterSpacing: '4pt',
                    zIndex: 0,
                    pointerEvents: 'none',
                    userSelect: 'none',
                    whiteSpace: 'nowrap',
                }}>
                    BORRADOR
                </div>
            )}

            <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #ccc', paddingBottom: '6pt', marginBottom: '6pt' }}>
                    <div style={{ fontSize: '7.5pt', color: '#555' }}>{fechaHoraImpresion}</div>
                    <div style={{ fontSize: '8pt', fontWeight: 'bold', color: '#333' }}>kawak - IPS CLINICAL HOUSE S.A.S</div>
                    <div style={{ fontSize: '7.5pt', color: '#555' }}>1</div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12pt', marginBottom: '4pt' }}>
                    <img
                        src="/clinical_house_logo.jpg"
                        alt="Logo"
                        style={{ height: '45pt', width: 'auto', objectFit: 'contain' }}
                        onError={(e) => { e.target.style.display = 'none'; }}
                    />
                    <div style={{ flex: 1 }}>
                        <SectionHeader label="Información General" />
                        <div style={{ textAlign: 'center', fontSize: '8.5pt' }}>
                            <div><strong>ID:</strong> {acta.id}</div>
                            <div><strong>Nombre:</strong> {acta.titulo}</div>
                            <div><strong>Código:</strong> ACT-{acta.id}</div>
                        </div>
                    </div>
                </div>

                <SectionHeader label="Datos del Acta" />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 20pt', marginBottom: '4pt' }}>
                    <div>
                        <Row label="Fecha/Hora Inicio" value={fechaInicio} />
                        <Row label="Lugar de reunión" value={acta.lugar} />
                        <Row label="Sede" value={acta.sede} />
                        <Row label="Quien Cita" value={acta.quienCita} />
                        <Row label="Área o dependencia" value={acta.area} />
                        {acta.palabrasClave && <Row label="Palabras clave" value={acta.palabrasClave} />}
                    </div>
                    <div>
                        <Row label="Fecha/Hora Final" value={fechaFin} />
                        <Row label="Empresa" value="IPS CLINICAL HOUSE S.A.S" />
                        <Row label="Proceso" value={acta.proceso} />
                        <Row label="Elaborado" value={acta.elaborador || acta.responsable} />
                        <Row label="Estado" value={acta.estado} />
                    </div>
                </div>

                <SectionHeader label="Temas Tratados" />
                <div
                    style={{ fontSize: '9pt', lineHeight: '1.6', color: '#111', minHeight: '200pt' }}
                    dangerouslySetInnerHTML={{ __html: acta.contenidoHtml || '<p>Sin contenido.</p>' }}
                />

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12pt', marginTop: '30pt', borderTop: '1px solid #ccc', paddingTop: '10pt' }}>
                    {['Elaboró', 'Revisó', 'Aprobó'].map((label, i) => (
                        <div key={i} style={{ textAlign: 'center' }}>
                            <div style={{ height: '40pt' }} />
                            <div style={{ borderTop: '1px solid #888', paddingTop: '4pt', fontSize: '8pt' }}>
                                {i === 0 ? (acta.elaborador || acta.responsable || '____________________') : '____________________'}
                            </div>
                            <div style={{ fontSize: '7.5pt', color: '#666', marginTop: '2pt' }}>{label}</div>
                        </div>
                    ))}
                </div>

                <div style={{ marginTop: '16pt', borderTop: '1px solid #eee', paddingTop: '4pt', fontSize: '7pt', color: '#aaa', textAlign: 'center' }}>
                    IPS Clinical House — Sistema de Gestión de Calidad — ACT-{acta.id} — {fechaHoraImpresion}
                </div>
            </div>
        </div>
    );
};

export const ActaDetalle = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { showAlert } = useAlert();
    const { user } = useAuth();

    const [acta, setActa] = useState(null);
    const [comentarios, setComentarios] = useState([]);
    const [historial, setHistorial] = useState([]);
    const [nuevoComentario, setNuevoComentario] = useState('');
    const [loading, setLoading] = useState(true);

    const puedeEditar = () => {
        if (!user || !acta) return false;
        const roleString = String(user.rol || user.role || user.roles?.[0] || '').toUpperCase();
        const permisos = user.permisos || user.authorities || [];
        const isAdmin = roleString === 'ADMIN' || roleString === 'ROLE_ADMIN' || permisos.includes('ROLE_ADMIN');
        if (isAdmin) return true;
        const isLider = roleString === 'LIDER_DE_PROCESO' || roleString === 'ROLE_LIDER_DE_PROCESO' || roleString === 'LIDER DE PROCESO' || permisos.includes('ROLE_LIDER_DE_PROCESO');
        if (isLider) {
            const username = (user.username || user.sub || '').toLowerCase();
            const resp = (acta.responsable || '').toLowerCase();
            const nombreCompleto = user.persona?.primerNombre
                ? `${user.persona.primerNombre} ${user.persona.primerApellido || ''}`.trim().toLowerCase()
                : '';
            return resp === username || (nombreCompleto && resp === nombreCompleto) || resp.includes(username) || username.includes(resp);
        }
        return false;
    };

    useEffect(() => { cargarDatos(); }, [id]);

    const cargarDatos = async () => {
        try {
            const [resActa, resComentarios, resHistorial] = await Promise.all([
                http.get(`/actas/${id}`),
                http.get(`/actas/${id}/comentarios`),
                http.get(`/actas/${id}/historial`).catch(() => ({ data: [] }))
            ]);
            const dataActa = resActa?.data?.data || resActa?.data || resActa;
            let dataComentarios = [];
            if (Array.isArray(resComentarios)) dataComentarios = resComentarios;
            else if (Array.isArray(resComentarios?.data)) dataComentarios = resComentarios.data;
            else if (Array.isArray(resComentarios?.data?.data)) dataComentarios = resComentarios.data.data;
            else if (Array.isArray(resComentarios?.comentarios)) dataComentarios = resComentarios.comentarios;
            const dataHistorial = resHistorial?.data?.data || resHistorial?.data || resHistorial || [];
            setActa(dataActa);
            setComentarios(dataComentarios.filter(Boolean));
            setHistorial(Array.isArray(dataHistorial) ? dataHistorial : []);
        } catch {
            showAlert({ message: 'Error al cargar el acta', status: 'error' });
            navigate('/actas-informes/gestion');
        } finally {
            setLoading(false);
        }
    };

    const handleEnviarComentario = async (e) => {
        e.preventDefault();
        if (!nuevoComentario.trim()) return;
        try {
            const res = await http.post(`/actas/${id}/comentarios`, nuevoComentario, { headers: { 'Content-Type': 'text/plain' } });
            const nuevo = res?.data?.data || res?.data || res;
            if (nuevo) setComentarios([nuevo, ...comentarios]);
            setNuevoComentario('');
            cargarDatos();
            showAlert({ message: 'Comentario agregado', status: 'success' });
        } catch {
            showAlert({ message: 'Error al enviar el comentario', status: 'error' });
        }
    };

    const handleImprimir = () => {
        const area = document.getElementById('acta-print-area');
        if (area) area.style.display = 'block';
        window.print();
        setTimeout(() => { if (area) area.style.display = 'none'; }, 500);
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Cargando...</div>;
    if (!acta) return null;

    return (
        <>
            <style>{PRINT_STYLES}</style>
            <PrintableActa acta={acta} />

            <div className="min-h-screen bg-gray-50 p-6 md:p-8 no-print">
                <div className="max-w-[1200px] mx-auto space-y-6">

                    <div className="flex items-center justify-between">
                        <button onClick={() => navigate('/actas-informes/gestion')} className="flex items-center gap-2 text-gray-600 hover:text-blue-600 font-medium transition-colors">
                            <ArrowLeft className="w-5 h-5" /> Volver a Gestión
                        </button>
                        <div className="flex items-center gap-2">
                            {puedeEditar() && (
                                <button onClick={() => navigate(`/actas-informes/crear-acta?editId=${acta.id}`)} className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg text-sm font-semibold hover:bg-amber-600 transition-colors shadow-sm">
                                    <Edit className="w-4 h-4" /> Editar Acta
                                </button>
                            )}
                            <button onClick={handleImprimir} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors shadow-sm">
                                <Printer className="w-4 h-4" /> Imprimir / Descargar PDF
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
                            <div className="p-6 border-b border-gray-100 bg-gray-50">
                                <div className="flex flex-wrap items-center justify-between gap-4">
                                    <div className="space-y-1">
                                        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-full uppercase tracking-wider">Acta de Reunión</span>
                                        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">{acta.titulo}</h1>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold border tracking-wide uppercase shadow-sm ${getActaEstadoStyle(acta.estado)}`}>{acta.estado}</span>
                                        {acta.confidencial && (
                                            <span className="flex items-center gap-1 bg-red-50 text-red-700 border border-red-200 px-3 py-1 rounded-full text-xs font-bold shadow-sm uppercase">
                                                <Lock className="w-3.5 h-3.5" /> Confidencial
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="bg-slate-50/50 p-6 border-b border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-sm text-gray-600">
                                <div className="space-y-3">
                                    <div className="flex items-start gap-2.5">
                                        <MapPin className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                                        <div>
                                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Ubicación y Sede</span>
                                            <span className="text-slate-800 font-medium">{acta.sede || 'No especificado'}{acta.lugar ? ` — ${acta.lugar}` : ''}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-2.5">
                                        <Calendar className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                                        <div>
                                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Fecha y Hora</span>
                                            <span className="text-slate-800 font-medium">
                                                {acta.fechaInicio ? `${acta.fechaInicio} ${acta.horaInicio || ''}` : acta.fecha}
                                                {acta.fechaFin ? ` a ${acta.fechaFin} ${acta.horaFin || ''}` : ''}
                                            </span>
                                        </div>
                                    </div>
                                    {acta.enlaceVirtual && (
                                        <div className="flex items-start gap-2.5">
                                            <Link className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                                            <div>
                                                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Sala Virtual</span>
                                                <a href={acta.enlaceVirtual} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 border border-blue-200 text-blue-700 rounded-lg text-xs font-semibold hover:bg-blue-100 transition-colors shadow-sm mt-1">Unirse a Reunión</a>
                                            </div>
                                        </div>
                                    )}
                                    {acta.palabrasClave && (
                                        <div className="flex items-start gap-2.5">
                                            <Tag className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                                            <div>
                                                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Palabras Clave</span>
                                                <div className="flex flex-wrap gap-1 mt-1">
                                                    {acta.palabrasClave.split(',').map((kw, i) => (
                                                        <span key={i} className="text-[11px] font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200 uppercase">{kw.trim()}</span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div className="space-y-3">
                                    <div className="flex items-start gap-2.5">
                                        <User className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                                        <div>
                                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Elaborador y Responsable</span>
                                            <span className="text-slate-800 font-medium">{acta.elaborador || acta.responsable}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-2.5">
                                        <Users className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                                        <div>
                                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Quién Cita</span>
                                            <span className="text-slate-800 font-medium">{acta.quienCita || 'No especificado'}</span>
                                        </div>
                                    </div>
                                    {acta.area && (
                                        <div className="flex items-start gap-2.5">
                                            <Briefcase className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                                            <div>
                                                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Área o Dependencia</span>
                                                <span className="text-slate-800 font-medium">{acta.area}</span>
                                            </div>
                                        </div>
                                    )}
                                    {acta.proceso && (
                                        <div className="flex items-start gap-2.5">
                                            <FileCheck className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                                            <div>
                                                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Proceso Asociado</span>
                                                <span className="text-slate-800 font-semibold text-xs bg-indigo-50 border border-indigo-100 text-indigo-700 px-2 py-0.5 rounded uppercase">{acta.proceso}</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="px-6 py-4 border-b border-gray-100 bg-white grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                                {[
                                    { label: '¿Aprobación de compromisos?', val: acta.compromisosAprobacion },
                                    { label: '¿Convertir a documento?', val: acta.convertirDocumento },
                                    { label: '¿Requiere aprobación acta?', val: acta.requiereAprobacionActa },
                                ].map(({ label, val }) => (
                                    <div key={label} className="p-3 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-between">
                                        <span className="text-slate-500 font-medium">{label}</span>
                                        <span className={`font-bold px-2 py-0.5 rounded uppercase ${val === 'Sí' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-500'}`}>{val || 'No'}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="p-8 prose max-w-none flex-1" dangerouslySetInnerHTML={{ __html: acta.contenidoHtml }} />
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col h-[600px]">
                            <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center gap-2">
                                <MessageSquare className="w-5 h-5 text-blue-600" />
                                <h2 className="font-bold text-gray-800">Comentarios</h2>
                                <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-0.5 rounded-full ml-auto">{comentarios.length}</span>
                            </div>
                            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
                                {comentarios.length === 0 ? (
                                    <p className="text-center text-gray-400 text-sm mt-10">No hay comentarios aún.</p>
                                ) : comentarios.map((com, i) => (
                                    <div key={com?.id || i} className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="text-sm font-bold text-gray-800">{com?.autorNombre || com?.autorUsername || 'Usuario'}</span>
                                            <span className="text-xs text-gray-400">{com?.fechaCreacion ? new Date(com.fechaCreacion).toLocaleString() : ''}</span>
                                        </div>
                                        <p className="text-sm text-gray-600 whitespace-pre-wrap">{com?.contenido || ''}</p>
                                    </div>
                                ))}
                            </div>
                            <div className="p-4 border-t border-gray-100 bg-white">
                                <form onSubmit={handleEnviarComentario} className="flex gap-2">
                                    <textarea value={nuevoComentario} onChange={(e) => setNuevoComentario(e.target.value)} placeholder="Escribe un comentario..." className="flex-1 resize-none border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" rows="2" />
                                    <button type="submit" disabled={!nuevoComentario.trim()} className="bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center">
                                        <Send className="w-5 h-5" />
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="p-5 border-b border-gray-100 bg-gray-50 flex items-center gap-2">
                            <History className="w-5 h-5 text-indigo-600" />
                            <h2 className="font-bold text-gray-800 uppercase tracking-wider text-sm">Registro de Trazabilidad y Auditoría (ISO 9001)</h2>
                            <TrazabilidadPanel logs={historial} />
                        </div>
                    </div>

                </div>
            </div>
        </>
    );
};