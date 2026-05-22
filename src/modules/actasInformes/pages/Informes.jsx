import React, { useState, useEffect, useMemo } from 'react';
import { Search, Download, AlertCircle, CheckCircle2, Clock, ChevronDown, Activity, FileText } from 'lucide-react';
import * as XLSX from 'xlsx';
import http from '../../../services/httpClient';
import { useAlert } from '../../../providers/AlertProvider';

const getSemaforoStyles = (estado) => {
    switch (estado) {
        case 'VERDE': return { bg: 'bg-green-100', text: 'text-green-700', icon: <CheckCircle2 className="w-4 h-4" />, label: 'Completo' };
        case 'AMARILLO': return { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: <Clock className="w-4 h-4" />, label: 'Pendiente' };
        case 'ROJO': return { bg: 'bg-red-100', text: 'text-red-700', icon: <AlertCircle className="w-4 h-4" />, label: 'Sin Registro' };
        default: return { bg: 'bg-gray-100', text: 'text-gray-700', icon: <Activity className="w-4 h-4" />, label: 'Desconocido' };
    }
};

const badge = (val, colorClass = 'bg-gray-100 text-gray-700') =>
    val ? <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${colorClass}`}>{val}</span>
        : <span className="text-gray-300 text-xs">—</span>;

const cell = (val) => val || <span className="text-gray-300 text-xs">—</span>;

const REPORTS_CONFIG = {
    talento_humano: {
        id: 'talento_humano',
        title: 'Talento Humano — Consolidado',
        description: 'Listado completo del personal con toda la información contractual y de contacto',
        endpoint: '/informes/talento-humano',
        columns: [
            { key: 'cedula', label: 'Cédula', render: (v) => <span className="font-mono text-gray-600 text-xs">{v}</span> },
            { key: 'nombres', label: 'Nombres', render: (_, r) => <span className="font-semibold text-gray-800">{r.nombres} {r.apellidos}</span> },
            { key: 'cargo', label: 'Cargo', render: cell },
            { key: 'sede', label: 'Sede', render: cell },
            { key: 'tipoContrato', label: 'Contrato', render: (v) => badge(v) },
            { key: 'estado', label: 'Estado', center: true, render: (v) => badge(v, v === 'ACTIVO' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600') },
            { key: 'fechaIngreso', label: 'Ingreso', center: true, render: cell },
            { key: 'fechaRetiro', label: 'Retiro', center: true, render: (v) => v || <span className="text-gray-300 text-xs">—</span> },
            { key: 'eps', label: 'EPS', render: cell },
            { key: 'arl', label: 'ARL', render: cell },
            { key: 'afp', label: 'AFP', render: cell },
            { key: 'cajaCompensacion', label: 'Caja', render: cell },
            { key: 'salario', label: 'Salario', center: true, render: (v) => v ? `$${Number(v).toLocaleString('es-CO')}` : <span className="text-gray-300 text-xs">—</span> },
            { key: 'subsidioTransporte', label: 'Subsidio', center: true, render: (v) => badge(v) },
            { key: 'telefono', label: 'Teléfono', render: cell },
            { key: 'correoElectronico', label: 'Correo', render: (v) => v ? <span className="text-xs text-blue-600">{v}</span> : <span className="text-gray-300 text-xs">—</span> },
            { key: 'direccionResidencia', label: 'Dirección', render: cell },
            { key: 'contactoEmergencia', label: 'Contacto emergencia', render: cell },
            { key: 'telefonoContactoEmergencia', label: 'Tel. emergencia', render: cell },
            { key: 'motivoRetiro', label: 'Motivo retiro', render: (v) => v ? <span className="text-xs text-rose-600">{v}</span> : <span className="text-gray-300 text-xs">—</span> },
        ],
        exportHeaders: ['Cédula','Nombres','Apellidos','Cargo','Sede','Tipo Contrato','Estado','Fecha Ingreso','Fecha Retiro','Motivo Retiro','EPS','ARL','AFP','Caja Compensación','Salario','Subsidio Transporte','Teléfono','Correo Electrónico','Dirección Residencia','Contacto Emergencia','Tel. Emergencia'],
        exportRow: (r) => [r.cedula, r.nombres, r.apellidos, r.cargo, r.sede, r.tipoContrato, r.estado, r.fechaIngreso, r.fechaRetiro, r.motivoRetiro, r.eps, r.arl, r.afp, r.cajaCompensacion, r.salario, r.subsidioTransporte, r.telefono, r.correoElectronico, r.direccionResidencia, r.contactoEmergencia, r.telefonoContactoEmergencia],
        filter: (r, t) => [r.cedula, r.nombres, r.apellidos, r.cargo, r.sede, r.estado].some(v => v?.toLowerCase().includes(t))
    },
    vacunacion: {
        id: 'vacunacion',
        title: 'Vacunación — Estado Biológicos',
        description: 'Estado general de biológicos del personal por perfil',
        endpoint: '/informes/vacunacion',
        columns: [
            { key: 'cedula', label: 'Cédula', render: (v) => <span className="font-mono text-gray-600 text-xs">{v}</span> },
            { key: 'nombres', label: 'Personal', render: (_, r) => <span className="font-semibold text-gray-800">{r.nombres} {r.apellidos}</span> },
            { key: 'cargo', label: 'Cargo', render: cell },
            { key: 'sede', label: 'Sede', render: cell },
            { key: 'arl', label: 'ARL', render: cell },
            { key: 'eps', label: 'EPS', render: cell },
            { key: 'perfilVacunacion', label: 'Perfil', render: (v) => badge(v, 'bg-indigo-50 text-indigo-700') },
            { key: 'detalleVacunas', label: 'Detalle Biológicos', render: (v) => {
                if (!v || v === 'Sin registro') return <span className="text-gray-400 italic text-xs">Sin registro</span>;
                try {
                    const parsed = JSON.parse(v);
                    if (Array.isArray(parsed) && parsed.length > 0) return (
                        <ul className="list-disc pl-4 space-y-0.5 text-[11px] text-gray-600">
                            {parsed.map((vac, i) => (
                                <li key={i}><strong className="text-gray-800">{vac.nombre}</strong>
                                    {vac.fechas?.length > 0 ? ` — ${vac.fechas.filter(Boolean).join(', ')}` : ' — Sin dosis'}
                                    {vac.requiereRefuerzo && vac.fechaRefuerzo && ` (Ref: ${vac.fechaRefuerzo})`}
                                </li>
                            ))}
                        </ul>
                    );
                } catch { return <span className="text-xs text-gray-600">{v}</span>; }
                return <span className="text-gray-300 text-xs">—</span>;
            }},
            { key: 'estadoSemaforo', label: 'Estado', center: true, render: (v) => {
                const s = getSemaforoStyles(v);
                return <div className={`flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-full font-bold text-xs ${s.bg} ${s.text} w-max mx-auto`}>{s.icon} {s.label}</div>;
            }}
        ],
        exportHeaders: ['Cédula','Nombres','Apellidos','Cargo','Sede','ARL','EPS','Perfil Vacunación','Detalle Vacunas','Estado Semáforo'],
        exportRow: (r) => {
            let detalle = r.detalleVacunas;
            try {
                const p = JSON.parse(r.detalleVacunas);
                if (Array.isArray(p)) detalle = p.map(v => `${v.nombre} (${v.fechas?.filter(Boolean).join(', ') || 'Sin dosis'})`).join(' | ');
            } catch {}
            return [r.cedula, r.nombres, r.apellidos, r.cargo, r.sede, r.arl, r.eps, r.perfilVacunacion, detalle, getSemaforoStyles(r.estadoSemaforo).label];
        },
        filter: (r, t) => [r.cedula, r.nombres, r.apellidos, r.cargo, r.sede, r.perfilVacunacion].some(v => v?.toLowerCase().includes(t))
    },
    incapacidades: {
        id: 'incapacidades',
        title: 'Incapacidades — Historial Médico',
        description: 'Historial detallado de incapacidades médicas y gestión de pagos',
        endpoint: '/informes/incapacidades',
        columns: [
            { key: 'numeroDocumento', label: 'Documento', render: (v) => <span className="font-mono text-gray-600 text-xs">{v}</span> },
            { key: 'nombre', label: 'Personal', render: (v) => <span className="font-semibold text-gray-800">{v}</span> },
            { key: 'cargo', label: 'Cargo', render: cell },
            { key: 'epsArl', label: 'EPS/ARL', render: cell },
            { key: 'tipoIncapacidad', label: 'Tipo', center: true, render: (v) => badge(v, 'bg-rose-50 text-rose-700') },
            { key: 'codigo', label: 'Código', center: true, render: cell },
            { key: 'dx', label: 'DX', render: cell },
            { key: 'fechaInicio', label: 'Inicio', center: true, render: cell },
            { key: 'fechaFin', label: 'Fin', center: true, render: cell },
            { key: 'diasOtorgados', label: 'Días Otorg.', center: true, render: cell },
            { key: 'diasAprobados', label: 'Días Apro.', center: true, render: cell },
            { key: 'estado', label: 'Estado', center: true, render: (v) => badge(v) },
            { key: 'ibc', label: 'IBC', center: true, render: cell },
            { key: 'valorLiquidadoIps', label: 'Val. IPS', center: true, render: cell },
            { key: 'valorLiquidadoEps', label: 'Val. EPS', center: true, render: cell },
            { key: 'valorPago', label: 'Val. Pago', center: true, render: cell },
            { key: 'observaciones', label: 'Observaciones', render: cell },
        ],
        exportHeaders: ['NOMBRE','TIPO','DOCUMENTO','CARGO','EPS/ARL','TIPO DE INCAPACIDAD','CODIGO','DX','FECHA INICIO','FECHA FIN','DIAS OTORGADOS','DIAS APROBADOS','FECHA REPORTE A TH','FECHA DE RADICADO','ESTADO','N° RADICACION','IBC','DIAS PAGADOS IPS','VALOR LIQUIDADO IPS','DIAS PAGADOS EPS','VALOR LIQUIDADO EPS','DIAS PAGADOS ARL','30','60','90','180','OBSERVACIONES','HIPERVINCULO','VALOR PAGO','FECHA PAGO','N° COMPROBANTE'],
        exportRow: (r) => [r.nombre, r.tipoDocumento, r.numeroDocumento, r.cargo, r.epsArl, r.tipoIncapacidad, r.codigo, r.dx, r.fechaInicio, r.fechaFin, r.diasOtorgados, r.diasAprobados, r.fechaReporteTH, r.fechaRadicado, r.estado, r.numeroRadicacion, r.ibc, r.diasPagadosIps, r.valorLiquidadoIps, r.diasPagadosEps, r.valorLiquidadoEps, r.diasPagadosArl, r.campo30, r.campo60, r.campo90, r.campo180, r.observaciones, r.hipervinculo, r.valorPago, r.fechaPago, r.numeroComprobantePago],
        filter: (r, t) => [r.nombre, r.numeroDocumento, r.cargo, r.estado, r.tipoIncapacidad].some(v => v?.toLowerCase().includes(t))
    },
    cursos: {
        id: 'cursos',
        title: 'Cursos — Formación Institucional',
        description: 'Estado de asignación y cumplimiento de formación del personal',
        endpoint: '/informes/cursos',
        columns: [
            { key: 'documento', label: 'Cédula', render: (v) => <span className="font-mono text-gray-600 text-xs">{v}</span> },
            { key: 'nombres', label: 'Personal', render: (_, r) => <span className="font-semibold text-gray-800">{r.nombres} {r.apellidos}</span> },
            { key: 'cargo', label: 'Cargo', render: cell },
            { key: 'sede', label: 'Sede', render: cell },
            { key: 'curso', label: 'Curso', render: (v) => <span className="font-bold text-gray-700">{v}</span> },
            { key: 'descripcionCurso', label: 'Descripción', render: (v) => v ? <span className="text-xs text-gray-500">{v}</span> : <span className="text-gray-300 text-xs">—</span> },
            { key: 'mesesVigencia', label: 'Vigencia', center: true, render: (v) => v ? `${v} meses` : <span className="text-gray-300 text-xs">—</span> },
            { key: 'estado', label: 'Estado', center: true, render: (v) => badge(v, v === 'ENTREGADO' || v === 'COMPLETADO' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700') },
            { key: 'fechaRealizacion', label: 'Realización', center: true, render: (v) => cell(v) },
            { key: 'fechaExpiracion', label: 'Vencimiento', center: true, render: (v) => cell(v) },
            { key: 'fechaLimite', label: 'Fecha límite', center: true, render: (v) => cell(v) },
            { key: 'certificadoUrl', label: 'Cert.', center: true, render: (v) => v ? <span className="text-green-600 font-bold text-xs">Sí</span> : <span className="text-gray-400 text-xs">No</span> },
        ],
        exportHeaders: ['Cédula','Nombres','Apellidos','Cargo','Sede','Curso','Descripción','Vigencia (meses)','Estado','Fecha Realización','Fecha Expiración','Fecha Límite','Certificado'],
        exportRow: (r) => [r.documento, r.nombres, r.apellidos, r.cargo, r.sede, r.curso, r.descripcionCurso, r.mesesVigencia, r.estado, r.fechaRealizacion, r.fechaExpiracion, r.fechaLimite, r.certificadoUrl ? 'Adjunto' : 'Sin certificado'],
        filter: (r, t) => [r.documento, r.nombres, r.apellidos, r.cargo, r.sede, r.curso, r.estado].some(v => v?.toLowerCase().includes(t))
    },
    documentos: {
        id: 'documentos',
        title: 'Documentos — Listado Único',
        description: 'Inventario completo de documentos del sistema de gestión de calidad',
        endpoint: '/informes/documentos',
        columns: [
            { key: 'codigo', label: 'Código', render: (v) => <span className="font-mono text-gray-600 text-xs">{v || '—'}</span> },
            { key: 'nombre', label: 'Nombre', render: (v) => <span className="font-semibold text-gray-800">{v}</span> },
            { key: 'tipo', label: 'Tipo', render: (v) => badge(v, 'bg-blue-50 text-blue-700') },
            { key: 'proceso', label: 'Proceso', render: cell },
            { key: 'sede', label: 'Sede', render: cell },
            { key: 'version', label: 'Versión', center: true, render: (v) => v ? <span className="font-mono text-xs bg-gray-100 px-2 py-0.5 rounded">v{v}</span> : <span className="text-gray-300 text-xs">—</span> },
            { key: 'estado', label: 'Estado', center: true, render: (v) => badge(v, v === 'VIGENTE' ? 'bg-green-100 text-green-700' : v === 'EN REVISIÓN' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600') },
            { key: 'fechaElaboracion', label: 'Elaboración', center: true, render: cell },
            { key: 'fechaRevision', label: 'Revisión', center: true, render: cell },
            { key: 'fechaAprobacion', label: 'Aprobación', center: true, render: (v) => v || <span className="text-gray-300 text-xs">—</span> },
            { key: 'elabora', label: 'Elabora', render: (v) => v ? <span className="text-xs text-gray-600">{v}</span> : <span className="text-gray-300 text-xs">—</span> },
            { key: 'revisa', label: 'Revisa', render: (v) => v ? <span className="text-xs text-gray-600">{v}</span> : <span className="text-gray-300 text-xs">—</span> },
            { key: 'aprueba', label: 'Aprueba', render: (v) => v ? <span className="text-xs text-gray-600">{v}</span> : <span className="text-gray-300 text-xs">—</span> },
            { key: 'metodoCreacion', label: 'Método', render: cell },
            { key: 'alcance', label: 'Alcance', render: (v) => v ? <span className="text-xs text-gray-500">{v}</span> : <span className="text-gray-300 text-xs">—</span> },
            { key: 'confidencialidad', label: 'Confidenc.', center: true, render: (v) => badge(v) },
            { key: 'mesesRevision', label: 'Meses rev.', center: true, render: (v) => v ? `${v}m` : <span className="text-gray-300 text-xs">—</span> },
            { key: 'normas', label: 'Normas', render: (v) => v ? <span className="text-xs text-gray-500">{v}</span> : <span className="text-gray-300 text-xs">—</span> },
        ],
        exportHeaders: ['ID','Código','Nombre','Tipo','Proceso','Sede','Versión','Estado','Fecha Elaboración','Fecha Revisión','Fecha Aprobación','Elabora','Revisa','Aprueba','Método Creación','Alcance','Confidencialidad','Meses Revisión','Normas','Visualización'],
        exportRow: (r) => [r.id, r.codigo, r.nombre, r.tipo, r.proceso, r.sede, r.version, r.estado, r.fechaElaboracion, r.fechaRevision, r.fechaAprobacion, r.elabora, r.revisa, r.aprueba, r.metodoCreacion, r.alcance, r.confidencialidad, r.mesesRevision, r.normas, r.visualizacion],
        filter: (r, t) => [r.codigo, r.nombre, r.tipo, r.proceso, r.sede, r.estado].some(v => v?.toLowerCase().includes(t))
    }
};

export const Informes = () => {
    const { showAlert } = useAlert();
    const [activeReportId, setActiveReportId] = useState('talento_humano');
    const [data, setData] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [perfilFilter, setPerfilFilter] = useState('TODOS');
    const [catalogoVacunas, setCatalogoVacunas] = useState({});

    useEffect(() => {
        http.get('/vacunacion/catalogo').then(res => {
            const lista = Array.isArray(res) ? res : (res?.data || []);
            const agrupado = {};
            lista.forEach(v => {
                const perfil = v.perfil || 'Sin perfil';
                if (!agrupado[perfil]) agrupado[perfil] = [];
                agrupado[perfil].push(v.nombre);
            });
            setCatalogoVacunas(agrupado);
        }).catch(() => {});
    }, []);

    const getVacunasDePerfil = (rows, perfil) => {
        const catalogoKeys = perfil && perfil !== 'TODOS'
            ? Object.entries(catalogoVacunas).filter(([k]) => k.toUpperCase() === perfil.toUpperCase()).flatMap(([, v]) => v)
            : Object.values(catalogoVacunas).flat();
        const uniqueVaccines = new Set(catalogoKeys);
        rows.forEach(r => {
            if (r.detalleVacunas && r.detalleVacunas !== 'Sin registro') {
                try {
                    const parsed = JSON.parse(r.detalleVacunas);
                    if (Array.isArray(parsed)) parsed.forEach(v => { if (v.nombre) uniqueVaccines.add(v.nombre); });
                } catch {}
            }
        });
        return Array.from(uniqueVaccines).sort();
    };

    const activeConfig = useMemo(() => {
        const base = REPORTS_CONFIG[activeReportId];
        if (activeReportId !== 'vacunacion' || data.length === 0) return base;

        const dataParaColumnas = perfilFilter === 'TODOS' ? data : data.filter(r => (r.perfilVacunacion || '').toUpperCase() === perfilFilter.toUpperCase());
        const vacArray = getVacunasDePerfil(dataParaColumnas, perfilFilter);

        const newColumns = base.columns.filter(c => c.key !== 'detalleVacunas');
        const semaforoCol = newColumns.pop();

        vacArray.forEach(vacName => {
            newColumns.push({
                key: `vac_${vacName}`,
                label: vacName,
                center: true,
                render: (_, row) => {
                    if (!row.detalleVacunas || row.detalleVacunas === 'Sin registro') return <span className="text-gray-300">—</span>;
                    try {
                        const parsed = JSON.parse(row.detalleVacunas);
                        const vac = parsed.find(v => v.nombre === vacName);
                        if (!vac) return <span className="text-gray-300">—</span>;
                        return (
                            <div className="text-[11px] whitespace-nowrap text-gray-700 text-center">
                                <div>{vac.fechas?.length > 0 ? vac.fechas.filter(Boolean).join(', ') : 'Sin dosis'}</div>
                                {vac.requiereRefuerzo && vac.fechaRefuerzo && <div className="text-gray-500 font-medium">Ref: {vac.fechaRefuerzo}</div>}
                            </div>
                        );
                    } catch { return <span className="text-gray-300">—</span>; }
                }
            });
        });
        newColumns.push(semaforoCol);

        const newHeaders = ['Cédula','Nombres','Apellidos','Cargo','Sede','ARL','EPS','Perfil Vacunación', ...vacArray, 'Estado Semáforo'];
        const newExportRow = (r) => {
            let parsed = [];
            try { if (r.detalleVacunas && r.detalleVacunas !== 'Sin registro') parsed = JSON.parse(r.detalleVacunas); } catch {}
            const vacVals = vacArray.map(vacName => {
                if (!Array.isArray(parsed)) return '—';
                const vac = parsed.find(v => v.nombre === vacName);
                if (!vac) return '—';
                let txt = vac.fechas?.length > 0 ? vac.fechas.filter(Boolean).join(', ') : 'Sin dosis';
                if (vac.requiereRefuerzo && vac.fechaRefuerzo) txt += ` (Ref: ${vac.fechaRefuerzo})`;
                return txt;
            });
            return [r.cedula, r.nombres, r.apellidos, r.cargo, r.sede, r.arl, r.eps, r.perfilVacunacion, ...vacVals, getSemaforoStyles(r.estadoSemaforo).label];
        };
        return { ...base, columns: newColumns, exportHeaders: newHeaders, exportRow: newExportRow };
    }, [activeReportId, data, perfilFilter, catalogoVacunas]);

    useEffect(() => { cargarReporte(); }, [activeReportId]);

    const cargarReporte = async () => {
        setLoading(true);
        setData([]);
        setSearchTerm('');
        setPerfilFilter('TODOS');
        try {
            const res = await http.get(REPORTS_CONFIG[activeReportId].endpoint);
            const docs = Array.isArray(res) ? res : (res?.data?.data || res?.data || []);
            setData(docs);
        } catch {
            showAlert({ message: `Error al cargar el informe`, status: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadVacunacionFiltrado = (perfil) => {
        const perfilData = data.filter(r => (r.perfilVacunacion || '').toUpperCase() === perfil.toUpperCase());
        if (perfilData.length === 0) { showAlert({ message: `No hay datos para el perfil ${perfil}`, status: 'warning' }); return; }
        const vacArray = getVacunasDePerfil(perfilData, perfil);
        const headers = ['Cédula','Nombres','Apellidos','Cargo','Sede','ARL','EPS','Perfil Vacunación', ...vacArray, 'Estado Semáforo'];
        const rows = perfilData.map(r => {
            let parsed = [];
            try { if (r.detalleVacunas && r.detalleVacunas !== 'Sin registro') parsed = JSON.parse(r.detalleVacunas); } catch {}
            const vacVals = vacArray.map(vacName => {
                const vac = Array.isArray(parsed) ? parsed.find(v => v.nombre === vacName) : null;
                if (!vac) return '—';
                let txt = vac.fechas?.length > 0 ? vac.fechas.filter(Boolean).join(', ') : 'Sin dosis';
                if (vac.requiereRefuerzo && vac.fechaRefuerzo) txt += ` (Ref: ${vac.fechaRefuerzo})`;
                return txt;
            });
            return [r.cedula, r.nombres, r.apellidos, r.cargo, r.sede, r.arl, r.eps, r.perfilVacunacion, ...vacVals, getSemaforoStyles(r.estadoSemaforo).label];
        });
        const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
        ws['!cols'] = headers.map((h, i) => ({ wch: Math.max(h.length, ...rows.map(r => String(r[i] || '').length)) }));
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, `Vacunación ${perfil}`);
        XLSX.writeFile(wb, `vacunacion_${perfil.toLowerCase()}_${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    const handleDownloadExcel = () => {
        if (filteredData.length === 0) { showAlert({ message: 'No hay datos para exportar', status: 'warning' }); return; }
        const headers = activeConfig.exportHeaders;
        const rows = filteredData.map(activeConfig.exportRow);
        const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
        ws['!cols'] = headers.map((h, i) => ({ wch: Math.max(String(h).length, ...rows.map(r => String(r[i] || '').length)) }));
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, activeConfig.title.substring(0, 31));
        XLSX.writeFile(wb, `${activeConfig.id}_${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    const filteredData = useMemo(() => {
        const term = searchTerm.toLowerCase();
        return data.filter(r => {
            const matchSearch = !term || activeConfig.filter(r, term);
            const matchPerfil = activeReportId !== 'vacunacion' || perfilFilter === 'TODOS'
                ? true
                : (r.perfilVacunacion || '').toUpperCase() === perfilFilter.toUpperCase();
            return matchSearch && matchPerfil;
        });
    }, [data, searchTerm, activeConfig, perfilFilter, activeReportId]);

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-8">
            <div className="max-w-[1800px] mx-auto space-y-6">

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 tracking-tight uppercase flex items-center gap-2">
                            <FileText className="w-6 h-6 text-indigo-600" /> Centro de Informes
                        </h1>
                        <p className="text-sm text-gray-500 mt-0.5">Gestión y exportación de reportes consolidados</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <div className="relative">
                            <select
                                value={activeReportId}
                                onChange={(e) => setActiveReportId(e.target.value)}
                                className="appearance-none pl-4 pr-10 py-2.5 bg-white border border-gray-300 text-gray-700 text-sm font-semibold rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none shadow-sm cursor-pointer"
                            >
                                {Object.values(REPORTS_CONFIG).map(c => (
                                    <option key={c.id} value={c.id}>{c.title}</option>
                                ))}
                            </select>
                            <ChevronDown className="w-4 h-4 text-gray-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>

                        {activeReportId === 'vacunacion' && (
                            <div className="flex items-center gap-1 border border-gray-200 rounded-lg p-1 bg-white shadow-sm">
                                {['TODOS', 'ASISTENCIAL', 'ADMINISTRATIVO'].map(p => (
                                    <button key={p} onClick={() => setPerfilFilter(p)}
                                        className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${perfilFilter === p ? 'bg-blue-600 text-white shadow' : 'text-gray-500 hover:bg-gray-100'}`}>
                                        {p === 'TODOS' ? 'Todos' : p.charAt(0) + p.slice(1).toLowerCase()}
                                    </button>
                                ))}
                            </div>
                        )}

                        <button onClick={handleDownloadExcel} disabled={loading || data.length === 0}
                            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed">
                            <Download className="w-4 h-4" /> Exportar Excel
                        </button>

                        {activeReportId === 'vacunacion' && (
                            <div className="flex items-center gap-2">
                                <button onClick={() => handleDownloadVacunacionFiltrado('ASISTENCIAL')} disabled={loading || data.length === 0}
                                    className="flex items-center gap-1.5 px-3 py-2.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50">
                                    <Download className="w-3.5 h-3.5" /> Asistencial
                                </button>
                                <button onClick={() => handleDownloadVacunacionFiltrado('ADMINISTRATIVO')} disabled={loading || data.length === 0}
                                    className="flex items-center gap-1.5 px-3 py-2.5 bg-purple-600 text-white rounded-lg text-xs font-semibold hover:bg-purple-700 transition-colors shadow-sm disabled:opacity-50">
                                    <Download className="w-3.5 h-3.5" /> Administrativo
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-4 md:p-5 border-b border-gray-100 bg-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-3">
                        <div>
                            <h2 className="font-bold text-gray-800">{activeConfig.title}</h2>
                            <p className="text-xs text-gray-500 mt-0.5">{activeConfig.description}
                                {filteredData.length > 0 && <span className="ml-2 font-semibold text-indigo-600">{filteredData.length} registros</span>}
                            </p>
                        </div>
                        <div className="relative w-full md:w-80">
                            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                            <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                                className="block w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm outline-none bg-white placeholder:text-gray-400"
                                placeholder="Buscar en este informe..." />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-[10px] text-gray-500 uppercase tracking-wider bg-white border-b border-gray-200 sticky top-0">
                                <tr>
                                    {activeConfig.columns.map((col, idx) => (
                                        <th key={idx} className={`px-3 py-3 font-semibold whitespace-nowrap ${col.center ? 'text-center' : ''}`}>
                                            {col.label}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {loading ? (
                                    <tr><td colSpan={activeConfig.columns.length} className="px-6 py-12 text-center text-gray-400">
                                        <div className="flex items-center justify-center gap-2">
                                            <svg className="w-5 h-5 animate-spin text-indigo-500" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                            </svg>
                                            Cargando informe...
                                        </div>
                                    </td></tr>
                                ) : filteredData.length === 0 ? (
                                    <tr><td colSpan={activeConfig.columns.length} className="px-6 py-12 text-center text-gray-400 text-sm">No se encontraron registros.</td></tr>
                                ) : (
                                    filteredData.map((row, rIdx) => (
                                        <tr key={rIdx} className="hover:bg-indigo-50/30 transition-colors">
                                            {activeConfig.columns.map((col, cIdx) => (
                                                <td key={cIdx} className={`px-3 py-2.5 ${col.center ? 'text-center' : ''}`}>
                                                    {col.render ? col.render(row[col.key], row) : row[col.key]}
                                                </td>
                                            ))}
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};