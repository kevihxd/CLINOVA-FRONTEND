import React, { useState, useEffect, useMemo } from 'react';
import { Search, Download, AlertCircle, CheckCircle2, Clock, ChevronDown, Activity } from 'lucide-react';
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

const REPORTS_CONFIG = {
    vacunacion: {
        id: 'vacunacion',
        title: 'Reporte de Vacunación',
        description: 'Estado general de biológicos del personal',
        endpoint: '/informes/vacunacion',
        columns: [
            { key: 'cedula', label: 'Cédula', render: (val) => <span className="font-mono text-gray-600">{val}</span> },
            { key: 'personal', label: 'Personal', render: (_, row) => <span className="font-semibold text-gray-800">{row.nombres} {row.apellidos}</span> },
            { key: 'perfilVacunacion', label: 'Perfil Asignado' },
            { 
                key: 'detalleVacunas', 
                label: 'Detalle Biológicos', 
                render: (val) => {
                    if (!val || val === 'Sin registro') return <span className="text-gray-400 italic">Sin registro</span>;
                    try {
                        const parsed = JSON.parse(val);
                        if (Array.isArray(parsed) && parsed.length > 0) {
                            return (
                                <ul className="list-disc pl-4 space-y-1 text-[11px] text-gray-600">
                                    {parsed.map((v, i) => (
                                        <li key={i}>
                                            <strong className="text-gray-800">{v.nombre || 'Vacuna'}</strong>
                                            {v.fechas && v.fechas.length > 0 ? ` - Dosis: ${v.fechas.filter(f=>f).join(', ')}` : ' - Sin dosis registradas'}
                                            {v.requiereRefuerzo && v.fechaRefuerzo && ` (Refuerzo: ${v.fechaRefuerzo})`}
                                        </li>
                                    ))}
                                </ul>
                            );
                        }
                    } catch (e) {
                        return <span className="text-xs text-gray-600 whitespace-pre-wrap">{val}</span>;
                    }
                    return <span className="text-xs text-gray-600">{val}</span>;
                }
            },
            { key: 'estadoSemaforo', label: 'Semaforización', center: true, render: (val) => {
                const semaforo = getSemaforoStyles(val);
                return (
                    <div className={`flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-full font-bold text-xs ${semaforo.bg} ${semaforo.text} w-max mx-auto`}>
                        {semaforo.icon} {semaforo.label}
                    </div>
                );
            }}
        ],
        exportHeaders: ['Cédula', 'Nombres', 'Apellidos', 'Perfil Vacunación', 'Detalle Vacunas', 'Estado Semaforo'],
        exportRow: (r) => {
            let detalleTexto = r.detalleVacunas;
            try {
                const parsed = JSON.parse(r.detalleVacunas);
                if (Array.isArray(parsed)) {
                    detalleTexto = parsed.map(v => `${v.nombre || 'Vacuna'} (Dosis: ${v.fechas ? v.fechas.filter(f=>f).join(', ') : '0'})`).join(' | ');
                }
            } catch (e) {}
            return [r.cedula, `"${r.nombres}"`, `"${r.apellidos}"`, `"${r.perfilVacunacion}"`, `"${detalleTexto}"`, r.estadoSemaforo];
        },
        filter: (r, term) => r.nombres?.toLowerCase().includes(term) || r.apellidos?.toLowerCase().includes(term) || r.cedula?.includes(term)
    },
    talento_humano: {
        id: 'talento_humano',
        title: 'Listado Talento Humano 3100',
        description: 'Consolidado general del personal',
        endpoint: '/informes/talento-humano',
        columns: [
            { key: 'cedula', label: 'Cédula', render: (val) => <span className="font-mono text-gray-600">{val}</span> },
            { key: 'personal', label: 'Personal', render: (_, row) => <span className="font-semibold text-gray-800">{row.nombres} {row.apellidos}</span> },
            { key: 'estado', label: 'Estado', center: true, render: (val) => (
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${val === 'ACTIVO' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                    {val}
                </span>
            )}
        ],
        exportHeaders: ['Cédula', 'Nombres', 'Apellidos', 'Estado'],
        exportRow: (r) => [r.cedula, r.nombres, r.apellidos, r.estado],
        filter: (r, term) => r.nombres?.toLowerCase().includes(term) || r.apellidos?.toLowerCase().includes(term) || r.cedula?.includes(term)
    },
    incapacidades: {
        id: 'incapacidades',
        title: 'Reporte de Incapacidades',
        description: 'Historial detallado de incapacidades médicas y pagos',
        endpoint: '/informes/incapacidades',
        columns: [
            { key: 'numeroDocumento', label: 'Documento', render: (val) => <span className="font-mono text-gray-600">{val}</span> },
            { key: 'nombre', label: 'Personal', render: (val) => <span className="font-semibold text-gray-800">{val}</span> },
            { key: 'tipoIncapacidad', label: 'Tipo', center: true, render: (val) => <span className="px-2 py-1 bg-rose-50 text-rose-700 font-bold text-xs rounded">{val}</span> },
            { key: 'fechaInicio', label: 'Inicio', center: true },
            { key: 'fechaFin', label: 'Fin', center: true },
            { key: 'estado', label: 'Estado', center: true, render: (val) => <span className="px-2 py-1 bg-gray-100 text-gray-700 font-bold text-xs rounded">{val}</span> }
        ],
        exportHeaders: [
            'NOMBRE', 'TIPO', 'DOCUMENTO', 'CARGO', 'EPS/ARL', 'TIPO DE INCAPACIDAD', 'CODIGO', 'DX', 
            'FECHA INICIO', 'FECHA FIN', 'DIAS OTORGADOS', 'DIAS APROBADOS', 'FECHA REPORTE A TH', 
            'FECHA DE RADICADO', 'ESTADO', 'N° DE RADICACION O INCAPACIDAD', 'IBC', 'DIAS PAGADOS IPS', 
            'VALOR LIQUIDADO POR IPS', 'DIAS PAGADOS POR LA EPS', 'VALOR LIQUIDADO POR EPS', 
            'DIAS PAGADOS POR LA ARL', '30', '60', '90', '180', 'OBSERVACIONES', 'HIPERVINCULO', 
            'VALOR DEL PAGO', 'FECHA DE PAGO', 'NUMERO COMPROBANTE PAGO'
        ],
        exportRow: (r) => [
            r.nombre, r.tipoDocumento, r.numeroDocumento, r.cargo, r.epsArl, r.tipoIncapacidad, r.codigo, r.dx,
            r.fechaInicio, r.fechaFin, r.diasOtorgados, r.diasAprobados, r.fechaReporteTH,
            r.fechaRadicado, r.estado, r.numeroRadicacion, r.ibc, r.diasPagadosIps,
            r.valorLiquidadoIps, r.diasPagadosEps, r.valorLiquidadoEps,
            r.diasPagadosArl, r.campo30, r.campo60, r.campo90, r.campo180, r.observaciones, r.hipervinculo,
            r.valorPago, r.fechaPago, r.numeroComprobantePago
        ],
        filter: (r, term) => r.nombre?.toLowerCase().includes(term) || r.numeroDocumento?.includes(term) || r.estado?.toLowerCase().includes(term)
    },
    cursos: {
        id: 'cursos',
        title: 'Reporte de Cursos Institucionales',
        description: 'Estado de asignación y cumplimiento de cursos',
        endpoint: '/informes/cursos',
        columns: [
            { key: 'documento', label: 'Cédula', render: (val) => <span className="font-mono text-gray-600">{val}</span> },
            { key: 'personal', label: 'Personal', render: (_, row) => <span className="font-semibold text-gray-800">{row.nombres} {row.apellidos}</span> },
            { key: 'curso', label: 'Curso Asignado', render: (val) => <span className="font-bold text-gray-700">{val}</span> },
            { key: 'estado', label: 'Estado', center: true, render: (val) => (
                <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${val === 'ENTREGADO' || val === 'COMPLETADO' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                    {val}
                </span>
            )},
            { key: 'fechaRealizacion', label: 'Fecha Realización', center: true, render: (val) => val || '-' },
            { key: 'fechaExpiracion', label: 'Vencimiento', center: true, render: (val) => val || '-' },
            { key: 'certificado', label: 'Certificado', center: true, render: (_, row) => row.certificadoUrl ? <span className="text-green-600 font-bold text-xs">Sí</span> : <span className="text-gray-400 text-xs">No</span> }
        ],
        exportHeaders: ['Cédula', 'Nombres', 'Apellidos', 'Curso', 'Estado', 'Fecha Realización', 'Fecha Expiración', 'Certificado'],
        exportRow: (r) => [r.documento, r.nombres, r.apellidos, r.curso, r.estado, r.fechaRealizacion || 'N/A', r.fechaExpiracion || 'N/A', r.certificadoUrl ? 'Adjunto' : 'Sin certificado'],
        filter: (r, term) => r.nombres?.toLowerCase().includes(term) || r.apellidos?.toLowerCase().includes(term) || r.documento?.includes(term) || r.curso?.toLowerCase().includes(term)
    }
};

export const Informes = () => {
    const { showAlert } = useAlert();
    const [activeReportId, setActiveReportId] = useState('vacunacion');
    const [data, setData] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [perfilFilter, setPerfilFilter] = useState('TODOS');
    // Catálogo de vacunas por perfil: { 'Asistencial': ['Vacuna A', ...], 'Administrativo': [...] }
    const [catalogoVacunas, setCatalogoVacunas] = useState({});

    useEffect(() => {
        // Cargar el catálogo de vacunas una sola vez
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

    // Helper: obtiene las vacunas del catálogo del perfil (base) + las que aparecen en los datos reales
    const getVacunasDePerfil = (rows, perfil) => {
        // Vacunas del catálogo para este perfil (base garantizada)
        const catalogoKeys = perfil && perfil !== 'TODOS'
            ? Object.entries(catalogoVacunas)
                .filter(([k]) => k.toUpperCase() === perfil.toUpperCase())
                .flatMap(([, v]) => v)
            : Object.values(catalogoVacunas).flat();

        // Vacunas que realmente tienen registradas los usuarios
        const uniqueVaccines = new Set(catalogoKeys);
        rows.forEach(r => {
            if (r.detalleVacunas && r.detalleVacunas !== 'Sin registro') {
                try {
                    const parsed = JSON.parse(r.detalleVacunas);
                    if (Array.isArray(parsed)) parsed.forEach(v => { if (v.nombre) uniqueVaccines.add(v.nombre); });
                } catch(e){}
            }
        });
        return Array.from(uniqueVaccines).sort();
    };

    const activeConfig = useMemo(() => {
        const base = REPORTS_CONFIG[activeReportId];
        if (activeReportId !== 'vacunacion' || data.length === 0) return base;

        // Filtrar el subconjunto de datos para calcular SOLO las vacunas del perfil activo
        const dataParaColumnas = perfilFilter === 'TODOS'
            ? data
            : data.filter(r => (r.perfilVacunacion || '').toUpperCase() === perfilFilter.toUpperCase());

        const vacArray = getVacunasDePerfil(dataParaColumnas, perfilFilter);

        const newColumns = base.columns.filter(c => c.key !== 'detalleVacunas');
        const semaforoCol = newColumns.pop(); 
        
        vacArray.forEach(vacName => {
            newColumns.push({
                key: `vac_${vacName}`,
                label: vacName,
                center: true,
                render: (_, row) => {
                    if (!row.detalleVacunas || row.detalleVacunas === 'Sin registro') return <span className="text-gray-300">-</span>;
                    try {
                        const parsed = JSON.parse(row.detalleVacunas);
                        const vac = parsed.find(v => v.nombre === vacName);
                        if (!vac) return <span className="text-gray-300">-</span>;
                        return (
                            <div className="text-[11px] whitespace-nowrap text-gray-700 text-center">
                                <div>{vac.fechas && vac.fechas.length > 0 ? vac.fechas.filter(f=>f).join(', ') : 'Sin dosis'}</div>
                                {vac.requiereRefuerzo && vac.fechaRefuerzo && <div className="text-gray-500 font-medium">Ref: {vac.fechaRefuerzo}</div>}
                            </div>
                        );
                    } catch(e) {
                        return <span className="text-gray-300">-</span>;
                    }
                }
            });
        });
        
        newColumns.push(semaforoCol);

        const newHeaders = ['Cédula', 'Nombres', 'Apellidos', 'Perfil Vacunación', ...vacArray, 'Estado Semaforo'];

        const newExportRow = (r) => {
            let parsed = [];
            try {
                if (r.detalleVacunas && r.detalleVacunas !== 'Sin registro') {
                    parsed = JSON.parse(r.detalleVacunas);
                }
            } catch(e){}

            const vacVals = vacArray.map(vacName => {
                if (!Array.isArray(parsed)) return '-';
                const vac = parsed.find(v => v.nombre === vacName);
                if (!vac) return '-';
                let txt = vac.fechas && vac.fechas.length > 0 ? vac.fechas.filter(f=>f).join(', ') : 'Sin dosis';
                if (vac.requiereRefuerzo && vac.fechaRefuerzo) txt += ` (Ref: ${vac.fechaRefuerzo})`;
                return txt;
            });

            const semaforoLabel = getSemaforoStyles(r.estadoSemaforo).label;
            return [r.cedula, r.nombres, r.apellidos, r.perfilVacunacion, ...vacVals, semaforoLabel];
        };

        return {
            ...base,
            columns: newColumns,
            exportHeaders: newHeaders,
            exportRow: newExportRow
        };
    }, [activeReportId, data, perfilFilter, catalogoVacunas]);

    useEffect(() => {
        cargarReporte();
    }, [activeReportId]);

    const cargarReporte = async () => {
        setLoading(true);
        setData([]);
        setSearchTerm('');
        setPerfilFilter('TODOS');
        try {
            const res = await http.get(activeConfig.endpoint);
            const dataDocs = Array.isArray(res) ? res : (res.data?.data || res.data || []);
            setData(dataDocs);
        } catch (error) {
            showAlert({ message: `Error al cargar el ${activeConfig.title}`, status: 'error' });
        } finally {
            setLoading(false);
        }
    };

    // Descarga directo de `data` por perfil — con columnas/vacunas propias de ese perfil (incluyendo catálogo)
    const handleDownloadVacunacionFiltrado = (perfil) => {
        const perfilData = data.filter(r => (r.perfilVacunacion || '').toUpperCase() === perfil.toUpperCase());

        if (perfilData.length === 0) {
            showAlert({ message: `No hay datos para el perfil ${perfil}`, status: 'warning' });
            return;
        }

        // Vacunas del catálogo + las registradas (sin mezclar con el otro perfil)
        const vacArray = getVacunasDePerfil(perfilData, perfil);

        const headers = ['Cédula', 'Nombres', 'Apellidos', 'Perfil Vacunación', ...vacArray, 'Estado Semaforo'];

        const rows = perfilData.map(r => {
            let parsed = [];
            try {
                if (r.detalleVacunas && r.detalleVacunas !== 'Sin registro') parsed = JSON.parse(r.detalleVacunas);
            } catch(e){}

            const vacVals = vacArray.map(vacName => {
                const vac = Array.isArray(parsed) ? parsed.find(v => v.nombre === vacName) : null;
                if (!vac) return '-';
                let txt = vac.fechas && vac.fechas.length > 0 ? vac.fechas.filter(f=>f).join(', ') : 'Sin dosis';
                if (vac.requiereRefuerzo && vac.fechaRefuerzo) txt += ` (Ref: ${vac.fechaRefuerzo})`;
                return txt;
            });

            return [r.cedula, r.nombres, r.apellidos, r.perfilVacunacion, ...vacVals, getSemaforoStyles(r.estadoSemaforo).label];
        });

        const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
        ws['!cols'] = headers.map((h, i) => ({ wch: Math.max(h.length, ...rows.map(r => String(r[i] || '').length)) }));
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, `Informe ${perfil}`);
        XLSX.writeFile(wb, `vacunacion_${perfil.toLowerCase()}_${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    const handleDownloadExcel = () => {
        if (filteredData.length === 0) {
            showAlert({ message: 'No hay datos para exportar', status: 'warning' });
            return;
        }

        const headers = activeConfig.exportHeaders;
        const rows = filteredData.map(activeConfig.exportRow);
        
        const dataForExcel = [headers, ...rows];
        
        const ws = XLSX.utils.aoa_to_sheet(dataForExcel);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Reporte");
        
        XLSX.writeFile(wb, `${activeConfig.id}_${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    const filteredData = useMemo(() => {
        const term = searchTerm.toLowerCase();
        return data.filter(r => {
            const matchSearch = activeConfig.filter(r, term);
            const matchPerfil = activeReportId !== 'vacunacion' || perfilFilter === 'TODOS'
                ? true
                : (r.perfilVacunacion || '').toUpperCase() === perfilFilter.toUpperCase();
            return matchSearch && matchPerfil;
        });
    }, [data, searchTerm, activeConfig, perfilFilter, activeReportId]);

    return (
        <div className="min-h-screen bg-gray-50 p-6 md:p-8">
            <div className="max-w-[1600px] mx-auto space-y-6">
                
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 tracking-tight uppercase">Centro de Informes</h1>
                        <p className="text-sm text-gray-500 mt-1">Gestión y descarga de reportes consolidados</p>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-3">
                        <div className="relative">
                            <select 
                                value={activeReportId}
                                onChange={(e) => setActiveReportId(e.target.value)}
                                className="appearance-none pl-4 pr-10 py-2.5 bg-white border border-gray-300 text-gray-700 text-sm font-semibold rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none shadow-sm cursor-pointer"
                            >
                                {Object.values(REPORTS_CONFIG).map(config => (
                                    <option key={config.id} value={config.id}>{config.title}</option>
                                ))}
                            </select>
                            <ChevronDown className="w-4 h-4 text-gray-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>

                        {activeReportId === 'vacunacion' && (
                            <div className="flex items-center gap-2 border border-gray-200 rounded-lg p-1 bg-white shadow-sm">
                                {['TODOS', 'ASISTENCIAL', 'ADMINISTRATIVO'].map(p => (
                                    <button
                                        key={p}
                                        onClick={() => setPerfilFilter(p)}
                                        className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                                            perfilFilter === p
                                                ? 'bg-blue-600 text-white shadow'
                                                : 'text-gray-500 hover:bg-gray-100'
                                        }`}
                                    >
                                        {p === 'TODOS' ? 'Todos' : p.charAt(0) + p.slice(1).toLowerCase()}
                                    </button>
                                ))}
                            </div>
                        )}

                        <button 
                            onClick={handleDownloadExcel}
                            disabled={loading || data.length === 0}
                            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Download className="w-4 h-4" /> Exportar Excel
                        </button>

                        {activeReportId === 'vacunacion' && (
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => handleDownloadVacunacionFiltrado('ASISTENCIAL')}
                                    disabled={loading || data.length === 0}
                                    className="flex items-center gap-1.5 px-3 py-2.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50"
                                    title="Descarga solo el personal Asistencial (sin importar el filtro activo)"
                                >
                                    <Download className="w-3.5 h-3.5" /> Asistencial
                                </button>
                                <button
                                    onClick={() => handleDownloadVacunacionFiltrado('ADMINISTRATIVO')}
                                    disabled={loading || data.length === 0}
                                    className="flex items-center gap-1.5 px-3 py-2.5 bg-purple-600 text-white rounded-lg text-xs font-semibold hover:bg-purple-700 transition-colors shadow-sm disabled:opacity-50"
                                    title="Descarga solo el personal Administrativo (sin importar el filtro activo)"
                                >
                                    <Download className="w-3.5 h-3.5" /> Administrativo
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-5 border-b border-gray-100 bg-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h2 className="font-bold text-gray-800 text-lg">{activeConfig.title}</h2>
                            <p className="text-xs text-gray-500">{activeConfig.description}</p>
                        </div>
                        <div className="relative w-full md:w-96">
                            <Search className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400" />
                            <input 
                                type="text" 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="block w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm outline-none bg-white placeholder:text-gray-400 transition-all" 
                                placeholder="Buscar en este informe..." 
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-[11px] text-gray-500 uppercase tracking-wider bg-white border-b border-gray-200">
                                <tr>
                                    {activeConfig.columns.map((col, idx) => (
                                        <th key={idx} className={`px-4 py-4 font-semibold ${col.center ? 'text-center' : ''} ${col.className || ''}`}>
                                            {col.label}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {loading ? (
                                    <tr><td colSpan={activeConfig.columns.length} className="px-6 py-10 text-center text-gray-500">Cargando datos...</td></tr>
                                ) : filteredData.length === 0 ? (
                                    <tr><td colSpan={activeConfig.columns.length} className="px-6 py-10 text-center text-gray-500">No se encontraron registros.</td></tr>
                                ) : (
                                    filteredData.map((row, rIdx) => (
                                        <tr key={rIdx} className="hover:bg-gray-50/50 transition-colors">
                                            {activeConfig.columns.map((col, cIdx) => (
                                                <td key={cIdx} className={`px-4 py-3 ${col.className || 'text-gray-600'} ${col.center ? 'text-center' : ''}`}>
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